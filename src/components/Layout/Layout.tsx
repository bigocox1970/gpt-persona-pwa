import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Settings, PenTool as Tool } from 'lucide-react';
import { usePersona } from '../../contexts/PersonaContext';
import Header from './Header';
import ChatHistory from '../../pages/ChatHistory';

interface LayoutProps {
  children: React.ReactNode;
  onToolsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onToolsClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPersona } = usePersona();
  const [showHistory, setShowHistory] = useState(false);

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]';
  };

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/settings') return 'Settings';
    if (path === '/personas' || path === '/') return 'Select a Persona';
    if (path === '/chat') return 'Chat';
    return '';
  };

  // Check if current page is chat or settings to handle special layout
  const isChatPage = location.pathname === '/chat';
  const isSettingsPage = location.pathname === '/settings';

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleHistoryClose = () => {
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--background-primary)] dark:bg-[var(--background-primary)]">
      <Header
        showPersona={isChatPage && !!selectedPersona}
        persona={isChatPage ? selectedPersona : undefined}
        title={getHeaderTitle()}
        onHistoryClick={isChatPage ? handleHistoryClick : undefined}
      />
      {showHistory && <ChatHistory onClose={handleHistoryClose} />}
      <main className={`flex-1 overflow-y-auto pb-[64px] ${isChatPage || isSettingsPage ? 'pt-0' : 'pt-[64px]'} sm:pb-[64px]`}>
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] border-t border-[var(--secondary-color)] py-3 px-6 shadow-t flex justify-around items-center">
        <button 
          onClick={() => navigate('/chat')}
          className={`flex flex-col items-center ${getActiveClass('/chat')}`}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center ${getActiveClass('/')}`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Personas</span>
        </button>
        <button 
          onClick={onToolsClick}
          className={`flex flex-col items-center ${getActiveClass('/tools')}`}
        >
          <Tool className="h-6 w-6" />
          <span className="text-xs mt-1">Tools</span>
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center ${getActiveClass('/settings')}`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout
