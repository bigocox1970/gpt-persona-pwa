import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/Chat/ChatInterface';
import { usePersona } from '../contexts/PersonaContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedPersona, selectedChatSessionId, selectPersona } = usePersona();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we need to load a persona from a chat session
  useEffect(() => {
    const loadChatSessionPersona = async () => {
      if (selectedChatSessionId && !selectedPersona && user) {
        setIsLoading(true);
        console.log('Loading persona from chat session:', selectedChatSessionId);
        
        try {
          // First, get the persona_id from the chat session
          const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('persona_id')
            .eq('id', selectedChatSessionId)
            .eq('user_id', user.id)
            .single();
            
          if (sessionError || !sessionData) {
            console.error('Error loading chat session:', sessionError);
            throw new Error('Failed to load chat session');
          }
          
          console.log('Found session with persona_id:', sessionData.persona_id);
          
          // Now fetch the persona details
          const { data: personaData, error: personaError } = await supabase
            .from('personas')
            .select('*')
            .eq('id', sessionData.persona_id)
            .single();
            
          if (personaError || !personaData) {
            console.error('Error loading persona:', personaError);
            throw new Error('Failed to load persona');
          }
          
          console.log('Found persona:', personaData);
          
          // Convert the database persona to the expected Persona type
          const persona = {
            id: personaData.id,
            name: personaData.name,
            title: personaData.title,
            description: personaData.description,
            image: personaData.image_url || '',
            backgroundColor: personaData.background_color || '',
            textColor: personaData.text_color || '',
            prompt: personaData.prompt || '',
            className: personaData.class_name || ''
          };
          
          // Set the selected persona
          selectPersona(persona);
        } catch (error) {
          console.error('Error in loadChatSessionPersona:', error);
          // If we can't load the persona, redirect to persona selection
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadChatSessionPersona();
  }, [selectedChatSessionId, selectedPersona, user, navigate, selectPersona]);
  
  // Show loading state while fetching persona
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          Loading conversation...
        </p>
      </div>
    );
  }
  
  // Only redirect if there's no persona selected AND no chat session ID
  if (!selectedPersona && !selectedChatSessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please select a persona first to start a conversation.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Choose a Persona
        </button>
      </div>
    );
  }

  return <ChatInterface />;
};

export default Chat;