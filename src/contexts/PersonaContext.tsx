import React, { createContext, useContext, useState, useEffect } from 'react';

// Import persona prompts from their respective folders
import einsteinPromptText from '../data/prompts/albert-einstein/prompt.md';
import aureliusPromptText from '../data/prompts/marcus-aurelius/prompt.md';
import wattsPromptText from '../data/prompts/alan-watts/prompt.md';
import hillPromptText from '../data/prompts/napoleon-hill/prompt.md';
import goddardPromptText from '../data/prompts/neville-goddard/prompt.md';

// Convert imported markdown to strings and log them for verification
const einsteinPrompt = einsteinPromptText;
const aureliusPrompt = aureliusPromptText;
const wattsPrompt = wattsPromptText;
const hillPrompt = hillPromptText;
const goddardPrompt = goddardPromptText;

// Log the first prompt to verify markdown loading
console.log('Loaded Einstein prompt from MD file:', einsteinPrompt.substring(0, 100) + '...');

export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  backgroundColor: string;
  textColor: string;
  prompt: string;
  className: string;
}

interface PersonaContextType {
  personas: Persona[];
  selectedPersona: Persona | null;
  selectedChatSessionId: string | null;
  selectPersona: (persona: Persona) => void;
  selectChatSession: (sessionId: string, personaId: string) => void;
  clearChatSession: () => void;
}

const PERSONAS: Persona[] = [
  {
    id: 'c9f771d7-2320-4574-a3d0-3597e9fe35b2',
    name: 'Albert Einstein',
    title: 'Theoretical Physicist',
    description: 'The father of relativity and quantum physics theories, known for his intellectual achievements and thought experiments.',
    image: '/images/albert-einstein-card.png',
    backgroundColor: '',
    textColor: '',
    prompt: einsteinPrompt,
    className: 'persona-einstein'
  },
  {
    id: '7d9e3b1c-e491-4b5c-9f06-24b43b247178',
    name: 'Marcus Aurelius',
    title: 'Roman Emperor & Philosopher',
    description: 'Stoic philosopher and Roman Emperor from 161 to 180 AD, known for his philosophical work "Meditations."',
    image: '/images/marcus-aurelius-card.png',
    backgroundColor: '',
    textColor: '',
    prompt: aureliusPrompt,
    className: 'persona-aurelius'
  },
  {
    id: 'f6d8a35e-c2d4-4a9b-b5d1-1c5f7e89d4b3',
    name: 'Alan Watts',
    title: 'Philosopher & Speaker',
    description: 'British philosopher who interpreted Eastern wisdom for Western audiences, known for his insights on consciousness and existence.',
    image: '/images/alan-watts-card.jpg',
    backgroundColor: '',
    textColor: '',
    prompt: wattsPrompt,
    className: 'persona-watts'
  },
  {
    id: 'a2e4c6b8-d0f2-4e6a-8c0d-9b3e7f5a1d2c',
    name: 'Napoleon Hill',
    title: 'Author & Success Coach',
    description: 'Pioneer of personal success literature and author of "Think and Grow Rich", known for his principles of achievement.',
    image: '/images/napolian-hill-card.jpg',
    backgroundColor: '',
    textColor: '',
    prompt: hillPrompt,
    className: 'persona-hill'
  },
  {
    id: 'b1d9e3f5-a7c2-4b8e-9d6f-8a4c2e0b1d9e',
    name: 'Neville Goddard',
    title: 'Mystic & Teacher',
    description: 'Spiritual teacher and author known for his practical philosophy of consciousness and manifestation.',
    image: '/images/neville-goddard-card.png',
    backgroundColor: '',
    textColor: '',
    prompt: goddardPrompt,
    className: 'persona-goddard'
  },
  {
    id: 'e5f9d8c7-b6a5-4c3d-a2e1-f0b9d8c7a6b5',
    name: 'GPT Classic (no persona)',
    title: 'Standard AI Assistant (powered by ChatGPT)',
    description: 'A classic, neutral AI assistant. No special persona, no extra context—just helpful and friendly.',
    image: '/images/gpt-classic-card.jpg',
    backgroundColor: '',
    textColor: '',
    prompt: 'You are a helpful AI assistant.',
    className: 'persona-gpt-classic'
  }
];

const PersonaContext = createContext<PersonaContextType>({
  personas: PERSONAS,
  selectedPersona: null,
  selectedChatSessionId: null,
  selectPersona: () => {},
  selectChatSession: () => {},
  clearChatSession: () => {},
});

export const usePersona = () => useContext(PersonaContext);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personas] = useState<Persona[]>(PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedPersonaId = localStorage.getItem('selectedPersonaId');
    const storedSessionId = localStorage.getItem('selectedChatSessionId');
    
    if (storedPersonaId) {
      const persona = personas.find(p => p.id === storedPersonaId) || null;
      setSelectedPersona(persona);
    }
    
    if (storedSessionId) {
      setSelectedChatSessionId(storedSessionId);
    }
  }, [personas]);

  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    localStorage.setItem('selectedPersonaId', persona.id);
    // Clear any selected chat session when directly selecting a persona
    clearChatSession();
    document.body.className = persona.className;
  };
  
  const selectChatSession = (sessionId: string, personaId: string) => {
    console.log('PersonaContext: Setting selected chat session ID:', sessionId);
    setSelectedChatSessionId(sessionId);
    localStorage.setItem('selectedChatSessionId', sessionId);
    
    // Also set the associated persona if we can find it in our local personas array
    // Note: If the persona isn't found, the Chat component will load it from the database
    const persona = personas.find(p => p.id === personaId) || null;
    if (persona) {
      console.log('PersonaContext: Found matching persona in local data:', persona.name);
      setSelectedPersona(persona);
      localStorage.setItem('selectedPersonaId', persona.id);
      document.body.className = persona.className;
    } else {
      console.log('PersonaContext: No matching persona found locally, Chat component will load it');
      // We'll still store the persona ID for the Chat component to load
      localStorage.setItem('selectedPersonaId', personaId);
    }
  };
  
  const clearChatSession = () => {
    setSelectedChatSessionId(null);
    localStorage.removeItem('selectedChatSessionId');
  };

  return (
    <PersonaContext.Provider value={{
      personas,
      selectedPersona,
      selectedChatSessionId,
      selectPersona,
      selectChatSession,
      clearChatSession
    }}>
      {children}
    </PersonaContext.Provider>
  );
};
