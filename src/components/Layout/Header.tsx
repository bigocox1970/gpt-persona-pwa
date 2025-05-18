import React from 'react';

interface PersonaInfo {
  image: string;
  name: string;
  title: string;
}

interface HeaderProps {
  title?: string;
  showPersona?: boolean;
  persona?: PersonaInfo | null;
}

const Header: React.FC<HeaderProps> = ({ title, showPersona = false, persona }) => {
  return (
    <header className="sticky top-0 z-20 bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] shadow-sm py-2 px-6 flex items-center justify-between min-h-[64px]">
      {showPersona && persona ? (
        <div className="flex items-center">
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
        <h1 className="text-lg font-bold text-[var(--text-primary)] w-full text-center">{title}</h1>
      )}
    </header>
  );
};

export default Header; 