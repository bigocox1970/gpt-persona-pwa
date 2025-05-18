import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/Chat/ChatInterface';
import { usePersona } from '../contexts/PersonaContext';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPersona } = usePersona();

  if (!selectedPersona) {
    // Redirect to persona selection if no persona is selected
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