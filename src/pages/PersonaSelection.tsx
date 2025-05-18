import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import { usePersona } from '../contexts/PersonaContext';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

const PersonaSelection: React.FC = () => {
  const navigate = useNavigate();
  const { personas, selectPersona } = usePersona();
  const [currentIndex, setCurrentIndex] = useState(personas.length - 1);
  const [lastDirection, setLastDirection] = useState<string>();
  
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(personas.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    []
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < personas.length - 1;

  const swiped = (direction: string, nameToDelete: string, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name: string, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    if (currentIndexRef.current < 0) {
      setCurrentIndex(personas.length - 1);
      currentIndexRef.current = personas.length - 1;
      childRefs.forEach((ref) => {
        ref.current?.restoreCard();
      });
    }
  };

  const swipe = async (dir: string) => {
    if (currentIndex < 0) {
      setCurrentIndex(personas.length - 1);
      currentIndexRef.current = personas.length - 1;
      childRefs.forEach((ref) => {
        ref.current?.restoreCard();
      });
    } else {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current?.restoreCard();
  };

  const handleSelect = (persona: any) => {
    selectPersona(persona);
    navigate('/chat');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background-primary)] dark:bg-[var(--background-primary)]">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Choose Your Persona</h1>
        <p className="text-gray-300 px-6">
          Browse through personas and select one to start a conversation
        </p>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative">
        {/* Left Arrow */}
        <button
          onClick={() => swipe('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => swipe('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
        >
          <ChevronRight size={24} />
        </button>

        <div className="w-full max-w-sm h-[70vh] relative">
          {personas.map((persona, index) => (
            <TinderCard
              ref={childRefs[index]}
              key={persona.id}
              onSwipe={(dir) => swiped(dir, persona.name, index)}
              onCardLeftScreen={() => outOfFrame(persona.name, index)}
              preventSwipe={['up', 'down']}
              className="absolute w-full h-full"
            >
              <motion.div 
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
                style={{
                  backgroundImage: `url(${persona.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/60 to-black z-10"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h2 className="text-3xl font-bold text-white mb-2">{persona.name}</h2>
                  <p className="text-white/90 text-lg mb-3">{persona.title}</p>
                  <p className="text-white/80 text-sm mb-6">{persona.description}</p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(persona);
                    }}
                    className="w-full bg-white/90 hover:bg-white text-black font-medium rounded-xl py-3 px-6 flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg backdrop-blur-sm"
                  >
                    <MessageSquare size={20} />
                    <span>Start Conversation</span>
                  </button>
                </div>
              </motion.div>
            </TinderCard>
          ))}
        </div>
      </div>
      
      <div className="text-center p-4 text-gray-400">
        <p className="text-sm">
          Swipe or use arrows to browse personas
        </p>
      </div>
    </div>
  );
};

export default PersonaSelection;