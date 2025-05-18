import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersona } from '../contexts/PersonaContext';
import { ChevronLeft, ChevronRight, MessageSquare, ArrowRight } from 'lucide-react';
import type { Persona } from '../contexts/PersonaContext';

const PersonaCard: React.FC<{ persona: Persona; onSelect: () => void; disabled?: boolean }> = ({ persona, onSelect, disabled }) => (
  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-cover bg-center flex flex-col justify-end" style={{ backgroundImage: `url(${persona.image})` }}>
    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/60 to-black z-10" />
    <div className="relative z-20 p-8 pb-10">
      <h2 className="text-3xl font-bold text-white mb-2">{persona.name}</h2>
      <p className="text-white/90 text-lg mb-3">{persona.title}</p>
      <p className="text-white/80 text-sm mb-6">{persona.description}</p>
      <button
        onClick={onSelect}
        className="w-full bg-white/90 hover:bg-white text-black font-medium rounded-xl py-3 px-6 flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg backdrop-blur-sm"
        disabled={disabled}
      >
        <MessageSquare size={20} />
        <span>Start Conversation</span>
      </button>
    </div>
  </div>
);

// Welcome card component that shows before persona selection
const WelcomeCard: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-cover bg-center flex flex-col justify-between" 
       style={{ backgroundImage: `url(/images/GPT-pasona-splash.png)` }}>
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10" />
    <div className="relative z-20 p-8 pt-10">
      <h2 className="text-4xl font-bold text-white mb-2 text-center">AI with Attitude</h2>
    </div>
    <div className="relative z-20 p-8 pb-10">
      <p className="text-white/90 text-lg mb-3">Engage with some of the greatest minds in history</p>
      <p className="text-white/80 text-sm mb-6">Swipe through our collection of historical figures, thinkers, and personalities to start a conversation.</p>
      <button
        onClick={onContinue}
        className="w-full bg-white/90 hover:bg-white text-black font-medium rounded-xl py-3 px-6 flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg backdrop-blur-sm"
      >
        <span>Browse Personas</span>
        <ArrowRight size={20} />
      </button>
    </div>
  </div>
);

const PersonaSelection: React.FC = () => {
  const navigate = useNavigate();
  const { personas, selectPersona } = usePersona();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [nextIndex, setNextIndex] = useState<number | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, personas.length]);

  // Touch swipe navigation
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.changedTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEndX(e.changedTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      if (distance > minSwipeDistance) nextCard();
      else if (distance < -minSwipeDistance) prevCard();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const triggerFlip = (newIndex: number, dir: 'left' | 'right') => {
    setFlipDirection(dir);
    setNextIndex(newIndex);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsFlipping(false);
      setNextIndex(null);
      setFlipDirection(null);
    }, 600); // match CSS duration
  };

  const prevCard = useCallback(() => {
    if (isFlipping) return;
    const newIndex = currentIndex === 0 ? personas.length - 1 : currentIndex - 1;
    triggerFlip(newIndex, 'left');
  }, [currentIndex, personas.length, isFlipping]);

  const nextCard = useCallback(() => {
    if (isFlipping) return;
    const newIndex = currentIndex === personas.length - 1 ? 0 : currentIndex + 1;
    triggerFlip(newIndex, 'right');
  }, [currentIndex, personas.length, isFlipping]);

  const handleSelect = (persona: Persona) => {
    selectPersona(persona);
    navigate('/chat');
  };

  if (!personas.length) return null;
  const persona = personas[currentIndex];
  const nextPersona = nextIndex !== null ? personas[nextIndex] : null;

  // Handle continue from welcome screen
  const handleContinue = () => {
    setShowWelcome(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background-primary)] dark:bg-[var(--background-primary)]">
      <div className="flex-1 flex items-center justify-center relative select-none px-2 sm:px-6 md:px-12 py-0 pb-16 overflow-visible">
        {showWelcome ? (
          <div className="w-full max-w-lg h-[72vh] min-h-[340px] flex items-center justify-center relative mb-8 overflow-visible">
            <WelcomeCard onContinue={handleContinue} />
          </div>
        ) : (
          <div
            className="w-full max-w-lg h-[72vh] min-h-[340px] flex items-center justify-center relative mb-8 overflow-visible"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Left Arrow (on card edge) */}
            <button
              onClick={prevCard}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-200"
              style={{ transform: 'translateY(-50%) translateX(-50%)' }}
              aria-label="Previous Persona"
              disabled={isFlipping}
            >
              <ChevronLeft size={28} />
            </button>
            {/* 3D Flip Card */}
            <div className="relative w-full h-full" style={{ perspective: '1200px' }}>
              {isFlipping && nextPersona ? (
                <div
                  className={`flip-card-inner w-full h-full ${flipDirection === 'left' ? 'flip-left' : 'flip-right'}`}
                  style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(.4,2,.6,1)', overflow: 'visible' }}
                >
                  {/* Front Face (current) */}
                  <div
                    className="flip-card-front absolute w-full h-full"
                    style={{ backfaceVisibility: 'hidden', zIndex: 2 }}
                  >
                    <PersonaCard persona={persona} onSelect={() => handleSelect(persona)} disabled={true} />
                  </div>
                  {/* Back Face (next) */}
                  <div
                    className="flip-card-back absolute w-full h-full"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', zIndex: 1 }}
                  >
                    <PersonaCard persona={nextPersona} onSelect={() => handleSelect(nextPersona)} disabled={true} />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  <PersonaCard persona={persona} onSelect={() => handleSelect(persona)} disabled={false} />
                </div>
              )}
            </div>
            {/* Right Arrow (on card edge) */}
            <button
              onClick={nextCard}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-200"
              style={{ transform: 'translateY(-50%) translateX(50%)' }}
              aria-label="Next Persona"
              disabled={isFlipping}
            >
              <ChevronRight size={28} />
            </button>
          </div>
        )}
      </div>
      {!showWelcome && (
        <div className="text-center p-2 mb-4 text-gray-400">
          <p className="text-sm">
            Swipe, use arrows, or keyboard to browse personas ({currentIndex + 1} / {personas.length})
          </p>
        </div>
      )}
      {/* Double-sided Flip Animation CSS and scrollbar hiding */}
      <style>{`
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .flip-left {
          transform: rotateY(-180deg);
        }
        .flip-right {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        /* Hide scrollbars for all browsers */
        html, body, #root, .flex-1, .h-full, .min-h-full {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar, #root::-webkit-scrollbar, .flex-1::-webkit-scrollbar, .h-full::-webkit-scrollbar, .min-h-full::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          background: transparent !important;
        }
        /* Ensure card animations have enough space */
        .flip-card-inner, .flip-card-front, .flip-card-back {
          overflow: visible !important;
        }
        /* Persona card border and shadow - only on the main card container */
        .flip-card-front > .relative.rounded-3xl,
        .flip-card-back > .relative.rounded-3xl,
        .w-full.h-full > .relative.rounded-3xl {
          border: 3px solid var(--primary-color);
          box-shadow: 0 4px 32px 0 rgba(44,24,16,0.10), 0 1.5px 6px 0 rgba(44,24,16,0.10);
          border-radius: 1.5rem;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
};

export default PersonaSelection;