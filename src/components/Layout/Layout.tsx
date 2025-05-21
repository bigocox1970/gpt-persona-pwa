import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Settings, PenTool as Tool, History, RefreshCw } from 'lucide-react';
import { usePersona } from '../../contexts/PersonaContext';
import Header from './Header';
import ToolsOverlay from '../../tools/ToolsOverlay';
import HistoryOverlay from '../../pages/HistoryOverlay';

interface LayoutProps {
  children: React.ReactNode;
  onToolsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onToolsClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPersona } = usePersona();
  const [showToolsOverlay, setShowToolsOverlay] = useState(false);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]';
  };

  const getHeaderTitle = () => {
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname === '/') return 'Choose Your Persona';
    if (location.pathname === '/history') return 'Chat History';
    if (location.pathname === '/tools') return 'Tools';
    return '';
  };

  // Check if current page is chat or settings to handle special layout
  const isChatPage = location.pathname === '/chat' || location.pathname === '/classic-chat';
  const isSettingsPage = location.pathname === '/settings';

  console.log("[Layout] route:", location.pathname, "selectedPersona:", selectedPersona);

  return (
    <div className="flex flex-col h-screen bg-[var(--background-primary)] dark:bg-[var(--background-primary)]">
      <Header
        showPersona={isChatPage && !!selectedPersona}
        persona={isChatPage ? selectedPersona : undefined}
        title={!isChatPage ? getHeaderTitle() : undefined}
        onHistoryClick={location.pathname === '/chat' ? () => setShowHistoryOverlay(true) : undefined}
        onToolsClick={location.pathname === '/chat' ? () => setShowToolsOverlay(true) : undefined}
      />
      {isChatPage && showToolsOverlay && (
        <ToolsOverlay
          onClose={() => setShowToolsOverlay(false)}
          onSelectNotes={() => { setShowToolsOverlay(false); navigate('/notes'); }}
          onSelectTodos={() => { setShowToolsOverlay(false); navigate('/todos'); }}
        />
      )}
      {isChatPage && showHistoryOverlay && (
        <HistoryOverlay
          onClose={() => setShowHistoryOverlay(false)}
        />
      )}
      <main className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-[64px] ${isChatPage || isSettingsPage ? 'pt-0' : 'pt-2.5'} sm:pb-[64px]`}>
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--background-primary)] dark:bg-[var(--background-primary)] border-t border-[var(--secondary-color)] py-3 px-6 shadow-t flex justify-around items-center">
        <button 
          onClick={() => navigate('/chat')}
          className={`flex flex-col items-center ${getActiveClass('/chat')}`}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className={`flex flex-col items-center ${getActiveClass('/history')}`}
        >
          <History className="h-6 w-6" />
          <span className="text-xs mt-1">History</span>
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
        <button 
          onClick={() => navigate('/classic-chat')}
          className={`flex flex-col items-center ${getActiveClass('/classic-chat')}`}
        >
          <RefreshCw className="h-6 w-6" />
          <span className="text-xs mt-1">Classic</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout
