import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Persona } from '../../contexts/PersonaContext';

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: (persona: Persona) => void;
  style?: React.CSSProperties;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  isSelected, 
  onSelect,
  style
}) => {
  return (
    <motion.div
      style={style}
      className={`relative overflow-hidden rounded-2xl shadow-lg card ${persona.className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(persona)}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--persona-bg)] opacity-70 z-10"
      />
      
      <img 
        src={persona.image} 
        alt={persona.name}
        className="w-full h-full object-cover absolute inset-0"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h2 className="text-2xl font-bold text-[var(--persona-color)] mb-1">{persona.name}</h2>
        <p className="text-[var(--persona-color)] text-opacity-90 text-sm">{persona.title}</p>
        <p className="text-[var(--persona-color)] text-opacity-80 text-xs mt-2">{persona.description}</p>
      </div>
      
      {isSelected && (
        <div className="absolute top-4 right-4 bg-[var(--primary-color)] rounded-full p-1 z-20">
          <Check className="h-4 w-4 text-[var(--background-primary)]" />
        </div>
      )}
    </motion.div>
  );
};

export default PersonaCard;