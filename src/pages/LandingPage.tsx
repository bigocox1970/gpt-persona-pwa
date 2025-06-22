import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder icons - you can replace these with actual SVG icons or an icon library
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DeviceMobileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;


const LandingPage: React.FC = () => {
  return (
    <div className="bg-[var(--background-primary)] text-[var(--text-primary)] min-h-screen">
      {/* Header */}
      <header className="bg-[var(--background-primary)] shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/icons/gptpasonalogo1-sq-192-192.png" alt="Logo" className="h-10 w-10 mr-3"/>
            <span className="text-2xl font-bold text-[var(--text-secondary)]">GPT Persona</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-[var(--text-primary)] hover:text-[var(--primary-color)]">Login</Link>
            <Link to="/login" className="btn btn-primary">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="text-center py-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--secondary-color)] mb-4">Chat with History's Greatest Minds</h1>
          <p className="text-lg md:text-xl text-[var(--text-primary)] max-w-3xl mx-auto mb-8">
            Engage in enlightening conversations with AI-powered personas of historical figures, thinkers, and innovators. Explore their knowledge, get advice, and see the world from their perspective.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg text-lg px-8 py-4">
            Start Your Journey
          </Link>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-[var(--secondary-color)]">Why You'll Love GPT Persona</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center text-[var(--primary-color)] mb-4"><UsersIcon /></div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Diverse Personas</h3>
              <p>Chat with a wide range of AI personas, from Albert Einstein to Marcus Aurelius. Each with a unique knowledge base.</p>
            </div>
            <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center text-[var(--primary-color)] mb-4"><ChatIcon /></div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Intelligent Chat</h3>
              <p>Experience natural and insightful conversations powered by cutting-edge AI technology.</p>
            </div>
            <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center text-[var(--primary-color)] mb-4"><MicIcon /></div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Voice Interaction</h3>
              <p>Use your voice to talk to the personas and hear them respond in a natural-sounding voice.</p>
            </div>
            <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center text-[var(--primary-color)] mb-4"><PencilIcon /></div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Notes & Todos</h3>
              <p>Keep track of your thoughts, ideas, and tasks with integrated note-taking and to-do lists.</p>
            </div>
            <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center text-[var(--primary-color)] mb-4"><SunIcon /></div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Themeable UI</h3>
              <p>Customise your experience with light and dark themes to suit your preference.</p>
            </div>
            <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg text-center">
              <div className="flex justify-center text-[var(--primary-color)] mb-4"><DeviceMobileIcon /></div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Progressive Web App</h3>
              <p>Install the app on your device for a fast, reliable, and engaging experience, even offline.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
            <h2 className="text-4xl font-bold text-center mb-12 text-[var(--secondary-color)]">Get Started in 3 Easy Steps</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                <div className="text-center max-w-xs">
                    <div className="bg-[var(--primary-color)] text-[var(--background-primary)] rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mx-auto mb-4">1</div>
                    <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Choose a Persona</h3>
                    <p>Select a historical figure or thinker you want to talk to from our ever-growing library.</p>
                </div>
                <div className="text-center max-w-xs">
                    <div className="bg-[var(--primary-color)] text-[var(--background-primary)] rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mx-auto mb-4">2</div>
                    <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Start Chatting</h3>
                    <p>Ask questions, seek advice, or simply have a conversation. Type or use your voice.</p>
                </div>
                <div className="text-center max-w-xs">
                    <div className="bg-[var(--primary-color)] text-[var(--background-primary)] rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mx-auto mb-4">3</div>
                    <h3 className="text-2xl font-bold mb-2 text-[var(--secondary-color)]">Gain Insights</h3>
                    <p>Unlock new perspectives and knowledge from the greatest minds in history.</p>
                </div>
            </div>
        </section>

        {/* Personas Preview */}
        <section id="personas" className="py-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-[var(--secondary-color)]">Meet the Personas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            <img src="/images/albert-einstein-card.png" alt="Albert Einstein" className="rounded-lg shadow-lg" />
            <img src="/images/marcus-aurelius-card.png" alt="Marcus Aurelius" className="rounded-lg shadow-lg" />
            <img src="/images/alan-watts-card.jpg" alt="Alan Watts" className="rounded-lg shadow-lg" />
            <img src="/images/napolian-hill-card.jpg" alt="Napoleon Hill" className="rounded-lg shadow-lg" />
            <img src="/images/neville-goddard-card.png" alt="Neville Goddard" className="rounded-lg shadow-lg" />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[var(--background-secondary)] mt-20">
        <div className="container mx-auto px-6 py-4 text-center text-[var(--text-primary)]">
          <p>&copy; {new Date().getFullYear()} GPT Persona. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 