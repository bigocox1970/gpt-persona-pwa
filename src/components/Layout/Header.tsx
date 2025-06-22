import React from 'react';
import { History } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface PersonaInfo {
  image: string;
  name: string;
  title: string;
}

interface HeaderProps {
  title?: string;
  showPersona?: boolean;
  persona?: PersonaInfo | null;
  onHistoryClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showPersona = false, persona, onHistoryClick }) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  return (
    <header className="sticky top-0 z-20 bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] shadow-sm py-2 px-6 flex items-center justify-between min-h-[64px]">
      <img src="/icons/gptpasonalogo1-sq-192-192.png" alt="logo" className="w-10 h-10" />
      <div className="flex-1 text-center">
        {showPersona && persona ? (
          <div className="flex items-center justify-center">
            <img 
              src={persona.image} 
              alt={persona.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{persona.name}</h1>
              <p className="text-xs text-[var(--text-secondary)] leading-tight">{persona.title}</p>
            </div>
          </div>
        ) : (
          <h1 className="text-lg font-bold text-[var(--text-primary)]">{title}</h1>
        )}
      </div>
      {isChatPage && onHistoryClick ? (
        <button 
          onClick={onHistoryClick}
          className="p-2 rounded-full hover:bg-[var(--background-primary)] hover:bg-opacity-80 transition-colors"
          aria-label="View chat history"
        >
          <History size={22} className="text-[var(--text-primary)]" />
        </button>
      ) : (
        <div className="w-10 h-10" /> // Placeholder for alignment
      )}
    </header>
  );
};

export default Header;
