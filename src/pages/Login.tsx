import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-primary)] dark:bg-[var(--background-primary)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <img src="/icons/gptpasonalogo1-sq-192-192.png" alt="Logo" className="h-20 w-20" />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-4 text-[var(--text-primary)] dark:text-[var(--text-primary)]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            <p className="text-[var(--text-secondary)] text-center mb-8">
              {isLogin 
                ? 'Sign in to continue to Persona Chat'
                : 'Join Persona Chat and start conversations with historical figures'
              }
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && (
                <p className="text-[var(--error-color)] text-sm">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[var(--primary-color)] hover:bg-opacity-90 text-[var(--background-primary)] font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--background-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-[var(--primary-color)] hover:underline text-sm font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;