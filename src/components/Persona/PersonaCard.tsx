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
      className="relative overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-gray-800"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(persona)}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70 z-10"
        style={{ 
          background: `linear-gradient(to bottom, transparent 40%, ${persona.backgroundColor} 100%)`,
        }}
      />
      
      <img 
        src={persona.image} 
        alt={persona.name}
        className="w-full h-full object-cover absolute inset-0"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h2 className="text-2xl font-bold text-white mb-1">{persona.name}</h2>
        <p className="text-white text-opacity-90 text-sm">{persona.title}</p>
        <p className="text-white text-opacity-80 text-xs mt-2">{persona.description}</p>
      </div>
      
      {isSelected && (
        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 z-20">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default PersonaCard;