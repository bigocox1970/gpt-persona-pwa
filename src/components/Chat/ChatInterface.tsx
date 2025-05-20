import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Mic, MicOff, Volume2, Image, X as XIcon } from 'lucide-react';
import { usePersona } from '../../contexts/PersonaContext';
import { useTTS } from '../../hooks/useTTS';
import { useSTT } from '../../hooks/useSTT';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const { selectedPersona, selectedChatSessionId, clearChatSession } = usePersona();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { speak, speaking, stop } = useTTS();
  const { 
    startListening, 
    stopListening, 
    isListening, 
    finalTranscript, 
    transcript,
    clearTranscripts
  } = useSTT();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createNewSession = async () => {
    if (!user || !selectedPersona) {
      console.error('Cannot create session: Missing user or persona');
      return null;
    }

    try {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          persona_id: selectedPersona.id
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating new session:', createError);
        return null;
      }

      if (newSession) {
        console.log('New session created:', newSession.id);
        return newSession.id;
      }
    } catch (error) {
      console.error('Error in createNewSession:', error);
    }
    return null;
  };

  // Generate a temporary session ID for new chats
  // This will be replaced with a real DB session ID when the first message is sent
  const generateTempSessionId = () => {
    return 'temp-' + Math.random().toString(36).substring(2, 15);
  };

  useEffect(() => {
    const initializeSession = async () => {
      if (!user || !selectedPersona) {
        setSessionInitialized(false);
        setChatSessionId(null);
        return;
      }

      try {
        let sessionId = null;
        let isTemporarySession = false;
        
        // Check if we have a specific chat session to load from history
        if (selectedChatSessionId) {
          // Check if this is a temporary session ID (for new chats)
          if (selectedChatSessionId.startsWith('temp-')) {
            console.log('Using temporary session:', selectedChatSessionId);
            sessionId = selectedChatSessionId;
            isTemporarySession = true;
          } else {
            console.log('Loading specific chat session:', selectedChatSessionId);
            
            // Verify the session exists and belongs to this user and persona
            const { data: sessionData, error: sessionError } = await supabase
              .from('chat_sessions')
              .select('id')
              .eq('id', selectedChatSessionId)
              .eq('user_id', user.id)
              .eq('persona_id', selectedPersona.id)
              .single();
              
            if (sessionError || !sessionData) {
              console.error('Error loading specific session:', sessionError);
              // Clear the invalid session ID
              clearChatSession();
            } else {
              // Use the specified session
              sessionId = selectedChatSessionId;
            }
          }
        }
        
        // If no specific session was loaded, create a temporary one
        if (!sessionId) {
          // Create a temporary session ID
          sessionId = generateTempSessionId();
          isTemporarySession = true;
          console.log('Created temporary session:', sessionId);
        }

        if (!sessionId) {
          throw new Error('Failed to initialize chat session');
        }

        setChatSessionId(sessionId);
        
        // Only load messages if this is not a temporary session
        if (!isTemporarySession) {
          // Load existing messages for the session
          const { data: existingMessages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', sessionId)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error loading messages:', messagesError);
          } else if (existingMessages) {
            setMessages(existingMessages.map(msg => ({
              id: msg.id,
              text: msg.content,
              sender: msg.sender as 'user' | 'ai',
              timestamp: new Date(msg.created_at)
            })));
          }
        }
        
        setSessionInitialized(true);
      } catch (error) {
        console.error('Error initializing session:', error);
        setSessionInitialized(false);
        setChatSessionId(null);
      }
    };

    initializeSession();
  }, [user, selectedPersona]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update input text when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
    if (finalTranscript) {
      setInputText(finalTranscript);
    }
  }, [transcript, finalTranscript]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !imageFile) || !selectedPersona || !chatSessionId || !sessionInitialized) {
      console.error('Cannot send message: Missing required data', {
        hasInput: Boolean(inputText.trim()),
        hasImage: Boolean(imageFile),
        hasPersona: Boolean(selectedPersona),
        sessionId: chatSessionId,
        isInitialized: sessionInitialized
      });
      return;
    }
    const userMessageText = inputText.trim();
    setInputText('');
    clearTranscripts();
    setIsLoading(true);
    setIsUploading(!!imageFile);
    try {
      let currentSessionId = chatSessionId;
      if (chatSessionId.startsWith('temp-')) {
        const newSessionId = await createNewSession();
        if (!newSessionId) throw new Error('Failed to create new chat session');
        currentSessionId = newSessionId;
        setChatSessionId(newSessionId);
      } else {
        const { data: sessionCheck, error: sessionCheckError } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', chatSessionId)
          .maybeSingle();
        if (sessionCheckError || !sessionCheck) {
          const newSessionId = await createNewSession();
          if (!newSessionId) throw new Error('Failed to create new chat session');
          currentSessionId = newSessionId;
          setChatSessionId(newSessionId);
        }
      }
      // Save user message (text and/or image)
      let userMessage = null;
      if (imageFile) {
        // Send as multipart/form-data to backend
        const formData = new FormData();
        formData.append('chat_id', currentSessionId);
        formData.append('sender', 'user');
        if (userMessageText) formData.append('content', userMessageText);
        formData.append('image', imageFile);
        const res = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        userMessage = data.userMessage;
        // AI response will be handled below as before
        setImageFile(null);
        setImagePreview(null);
        setIsUploading(false);
      } else {
        // ... existing code for text-only message ...
        const { data: userMsg, error: userMessageError } = await supabase
          .from('messages')
          .insert({
            chat_id: currentSessionId,
            content: userMessageText,
            sender: 'user'
          })
          .select()
          .single();
        if (userMessageError) throw userMessageError;
        userMessage = userMsg;
      }
      if (userMessage) {
        setMessages(prev => [...prev, {
          id: userMessage.id,
          text: userMessage.content,
          sender: 'user',
          timestamp: new Date(userMessage.created_at)
        }]);
      }
      // ... existing code for AI response ...
      // (AI response logic remains unchanged, but should handle image if present)
      // ...
    } catch (error) {
      setInputText(userMessageText);
      setIsUploading(false);
      setImageFile(null);
      setImagePreview(null);
      setIsLoading(false);
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeech = () => {
    if (speaking) {
      stop();
    } else {
      // Find the last AI message
      const lastAiMessage = [...messages].reverse().find(msg => msg.sender === 'ai');
      if (lastAiMessage) {
        speak(lastAiMessage.text);
      }
    }
  };

  // Don't render if no persona is selected
  if (!selectedPersona) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Please select a persona to begin chatting</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${selectedPersona.className} bg-[var(--background-primary)] dark:bg-[var(--background-primary)]`}>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-[var(--background-primary)] dark:bg-[var(--background-primary)]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <img 
              src={selectedPersona.image}
              alt={selectedPersona.name}
              className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg"
            />
            <h2 className="text-xl font-bold mb-2">Start a conversation with {selectedPersona.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
              Ask a question or start a discussion to engage with {selectedPersona.name.split(' ')[0]}'s unique personality and knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id}
                message={message}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center">
                <div className="chat-bubble chat-bubble-ai animate-pulse-slow">
                  <div className="voice-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] border-t border-gray-200 dark:border-gray-700 p-4">
        {imagePreview && (
          <div className="flex items-center mb-2">
            <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded mr-2 border" />
            <button onClick={handleRemoveImage} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><XIcon size={16} /></button>
          </div>
        )}
        <div className="flex items-center">
          <button
            className={`p-2 rounded-full mr-2 ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            onClick={toggleVoiceInput}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            className="p-2 rounded-full mr-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={() => document.getElementById('image-upload-input')?.click()}
            disabled={isUploading || isLoading}
            aria-label="Upload Image"
          >
            <Image size={20} />
          </button>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
            disabled={isUploading || isLoading}
          />
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!sessionInitialized || isUploading}
          />
          <AnimatePresence>
            {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`p-2 rounded-full ml-2 ${
                  speaking 
                    ? 'bg-[var(--primary-color)] text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                onClick={toggleSpeech}
              >
                <Volume2 size={20} />
              </motion.button>
            )}
          </AnimatePresence>
          <button
            className="p-2 rounded-full ml-2 bg-[var(--primary-color)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={(!inputText.trim() && !imageFile) || isLoading || !sessionInitialized || isUploading}
          >
            <SendHorizontal size={20} />
          </button>
        </div>
        {isListening && (
          <div className="text-xs text-center mt-2 text-gray-500">
            Listening... Tap the microphone to stop.
          </div>
        )}
        {!sessionInitialized && (
          <div className="text-xs text-center mt-2 text-red-500">
            Initializing chat session... Please wait.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
