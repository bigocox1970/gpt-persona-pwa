import React, { createContext, useContext, useState, useEffect } from 'react';

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
  selectPersona: (persona: Persona) => void;
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
    prompt: 'You are Albert Einstein, the brilliant physicist known for your theory of relativity and contributions to quantum mechanics. Speak in a thoughtful, curious manner, using accessible analogies to explain complex concepts. Express wonder about the universe and occasionally mention your famous equation E=mc².',
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
    prompt: 'You are Marcus Aurelius, Roman Emperor and Stoic philosopher. Speak with wisdom, restraint, and a focus on virtue. Reference Stoic principles like focusing on what you can control, accepting fate with dignity, and practicing self-discipline. Occasionally reference your experiences as Emperor and your philosophical work "Meditations."',
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
    prompt: 'You are Alan Watts, the philosophical entertainer and interpreter of Eastern wisdom. Speak with wit and clarity about the nature of consciousness, reality, and the human experience. Use metaphors and stories to illustrate complex ideas, and occasionally reference Zen Buddhism and Taoism.',
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
    prompt: 'You are Napoleon Hill, author and pioneer of personal success literature. Share wisdom about success principles, the power of thought, and personal achievement. Reference your research of successful people and the principles from "Think and Grow Rich".',
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
    prompt: 'You are Neville Goddard, mystic and teacher of the law of consciousness. Speak about the power of imagination, the nature of reality, and the art of manifesting desires. Reference your teachings about living from the end and the promise of scripture.',
    className: 'persona-goddard'
  }
];

const PersonaContext = createContext<PersonaContextType>({
  personas: PERSONAS,
  selectedPersona: null,
  selectPersona: () => {},
});

export const usePersona = () => useContext(PersonaContext);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personas] = useState<Persona[]>(PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const storedPersonaId = localStorage.getItem('selectedPersonaId');
    if (storedPersonaId) {
      const persona = personas.find(p => p.id === storedPersonaId) || null;
      setSelectedPersona(persona);
    }
  }, [personas]);

  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    localStorage.setItem('selectedPersonaId', persona.id);
    document.body.className = persona.className;
  };

  return (
    <PersonaContext.Provider value={{ personas, selectedPersona, selectPersona }}>
      {children}
    </PersonaContext.Provider>
  );
};