import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Mic, MicOff, Volume2 } from 'lucide-react';
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
        let sessionId: string | null = null;
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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedPersona || !chatSessionId || !sessionInitialized) {
      console.error('Cannot send message: Missing required data', {
        hasInput: Boolean(inputText.trim()),
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
    
    try {
      let currentSessionId = chatSessionId;
      
      // Check if this is a temporary session that needs to be created in the database
      if (chatSessionId.startsWith('temp-')) {
        console.log('Creating permanent session for temporary session:', chatSessionId);
        const newSessionId = await createNewSession();
        if (!newSessionId) {
          throw new Error('Failed to create new chat session');
        }
        currentSessionId = newSessionId;
        setChatSessionId(newSessionId);
      } else {
        // Double-check session exists and create a new one if needed
        const { data: sessionCheck, error: sessionCheckError } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', chatSessionId)
          .maybeSingle();

        if (sessionCheckError || !sessionCheck) {
          console.log('Session not found, creating new session...');
          const newSessionId = await createNewSession();
          if (!newSessionId) {
            throw new Error('Failed to create new chat session');
          }
          currentSessionId = newSessionId;
          setChatSessionId(newSessionId);
        }
      }

      // Save user message
      console.log('Saving user message:', {
        chat_id: currentSessionId,
        content: userMessageText,
        sender: 'user'
      });
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentSessionId,
          content: userMessageText,
          sender: 'user'
        })
        .select()
        .single();

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
        throw userMessageError;
      }

      if (userMessage) {
        setMessages(prev => [...prev, {
          id: userMessage.id,
          text: userMessage.content,
          sender: 'user',
          timestamp: new Date(userMessage.created_at)
        }]);
      }

      // Generate AI response
      let aiResponse = '';
      try {
        // Prepare chat history for context
        const chatHistory = [
          ...messages,
          {
            id: userMessage.id,
            text: userMessage.content,
            sender: 'user',
            timestamp: new Date(userMessage.created_at)
          }
        ];
        // Get username from localStorage if available
        const username = localStorage.getItem('user_display_name') || '';
        
        // Check if this is a new persona with the knowledge module system
        let systemPrompt = '';
        
        // Check if selectedPersona might have a generatePrompt function
        interface PersonaWithGeneratePrompt {
          generatePrompt: (text: string) => string;
        }
        
        if (selectedPersona && 'generatePrompt' in selectedPersona) {
          // It's a persona with a generatePrompt function
          systemPrompt = (selectedPersona as unknown as PersonaWithGeneratePrompt).generatePrompt(userMessageText);
        } else if (selectedPersona && selectedPersona.prompt) {
          // It's an old persona with just a prompt string
          systemPrompt = selectedPersona.prompt;
          // Add username information if available
          if (username) {
            systemPrompt = `The user's name is ${username}. Address them by name when appropriate. \n\n${systemPrompt}`;
          }
        } else if (selectedPersona) {
          // Fallback for any persona
          systemPrompt = `You are ${selectedPersona.name}, answer as this persona.`;
          // Add username information if available
          if (username) {
            systemPrompt = `The user's name is ${username}. Address them by name when appropriate. \n\n${systemPrompt}`;
          }
        }
        const openaiMessages = chatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
        const res = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: openaiMessages,
            systemPrompt
          })
        });
        const data = await res.json();
        aiResponse = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
      } catch (err) {
        console.error('OpenAI API error:', err);
        aiResponse = 'Sorry, there was an error generating a response.';
      }
      
      // Save AI response
      console.log('Saving AI message:', {
        chat_id: currentSessionId,
        content: aiResponse,
        sender: 'ai'
      });
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentSessionId,
          content: aiResponse,
          sender: 'ai'
        })
        .select()
        .single();

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
        throw aiMessageError;
      }

      if (aiMessage) {
        setMessages(prev => [...prev, {
          id: aiMessage.id,
          text: aiMessage.content,
          sender: 'ai',
          timestamp: new Date(aiMessage.created_at)
        }]);
      }

      // Update last_message_at
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentSessionId);

      if (updateError) {
        console.error('Error updating session timestamp:', updateError);
      }
      
      // Use TTS to speak the response
      speak(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      // Reset loading state but keep input text in case of error
      setInputText(userMessageText);
    } finally {
      setIsLoading(false);
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
      // Clear any previous transcripts
      clearTranscripts();
      setInputText('');
      
      // On mobile, we need to focus the input field to trigger the keyboard
      // which often helps with permission prompts
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Focus the input field
        if (inputRef.current) {
          inputRef.current.focus();
          // Small delay to ensure focus happens before speech recognition starts
          setTimeout(() => {
            startListening();
          }, 300);
        } else {
          startListening();
        }
      } else {
        // On desktop, just start listening
        startListening();
      }
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
    <div 
      className={`flex flex-col h-full ${selectedPersona.className} relative`}
      style={{
        backgroundImage: `url(${selectedPersona.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Semi-transparent overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundColor: 'var(--background-primary)',
          opacity: 0.85
        }}
      ></div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 z-10 relative">
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
      <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] border-t border-gray-200 dark:border-gray-700 p-4 relative z-10">
        <div className="flex items-center">
          <button 
            className={`p-2 rounded-full mr-2 ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            onClick={toggleVoiceInput}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!sessionInitialized}
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
            disabled={!inputText.trim() || isLoading || !sessionInitialized}
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
