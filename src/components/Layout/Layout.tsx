import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Settings, PenTool as Tool } from 'lucide-react';
import { usePersona } from '../../contexts/PersonaContext';

interface LayoutProps {
  children: React.ReactNode;
  onToolsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onToolsClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPersona } = usePersona();

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'text-[var(--primary-color)]' : 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-screen">
      {location.pathname !== '/' && (
        <header className="relative z-10 bg-white dark:bg-[var(--background-secondary)] shadow-sm py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedPersona && (
                <>
                  <img 
                    src={selectedPersona.image} 
                    alt={selectedPersona.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h1 className="text-lg font-bold">{selectedPersona.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPersona.title}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      <nav className="bg-white dark:bg-[var(--background-secondary)] border-t border-gray-200 dark:border-gray-800 py-3 px-6">
        <div className="flex justify-around items-center">
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
        </div>
      </nav>
    </div>
  );
};

export default Layout