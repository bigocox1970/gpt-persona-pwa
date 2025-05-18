import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Lock, User, Volume2, Mic } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTTS } from '../hooks/useTTS';
import { useSTT } from '../hooks/useSTT';
import { motion } from 'framer-motion';

// Available languages for speech recognition
const AVAILABLE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' }
];

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, updatePassword } = useAuth();
  const { voices, options, updateOptions, selectVoice } = useTTS();
  const { updateOptions: updateSTTOptions } = useSTT();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [speechRate, setSpeechRate] = useState(options.rate || 1);
  const [speechPitch, setSpeechPitch] = useState(options.pitch || 1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(options.voice || null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Filter voices to only show English voices by default
  const availableVoices = voices.filter(voice => 
    voice.lang.startsWith('en') && voice.localService
  );

  useEffect(() => {
    if (availableVoices.length > 0 && !selectedVoice) {
      const defaultVoice = availableVoices.find(voice => voice.default) || availableVoices[0];
      setSelectedVoice(defaultVoice);
      updateOptions({ voice: defaultVoice });
    }
  }, [availableVoices]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError('Failed to update password. Please check your current password.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceURI = e.target.value;
    const voice = voices.find(v => v.voiceURI === voiceURI) || null;
    setSelectedVoice(voice);
    updateOptions({ voice });
  };

  const handleSpeechRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSpeechRate(rate);
    updateOptions({ rate });
  };

  const handleSpeechPitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pitch = parseFloat(e.target.value);
    setSpeechPitch(pitch);
    updateOptions({ pitch });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    updateSTTOptions({ language });
  };

  return (
    <div className="min-h-full bg-[var(--background-primary)] dark:bg-[var(--background-primary)] p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* User Info */}
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          <div className="pl-9">
            <p className="text-gray-700 dark:text-gray-300">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            
            {!showPasswordForm ? (
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="mt-3 flex items-center text-[var(--primary-color)] text-sm"
              >
                <Lock size={14} className="mr-1" />
                Change Password
              </button>
            ) : (
              <motion.form 
                onSubmit={handlePasswordChange}
                className="mt-4 space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input text-sm"
                    required
                  />
                </div>
                
                {passwordError && (
                  <p className="text-[var(--error-color)] text-sm">{passwordError}</p>
                )}
                
                {passwordSuccess && (
                  <p className="text-[var(--success-color)] text-sm">{passwordSuccess}</p>
                )}
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="btn btn-primary text-sm py-1.5"
                  >
                    Update Password
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn text-sm py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold">Voice Output</h2>
          </div>
          
          <div className="space-y-4 pl-9">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice
              </label>
              <select 
                className="input"
                value={selectedVoice?.voiceURI || ''}
                onChange={handleVoiceChange}
              >
                {availableVoices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speech Rate: {speechRate.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={handleSpeechRateChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pitch: {speechPitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechPitch}
                onChange={handleSpeechPitchChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Voice Input Settings */}
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Mic className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold">Voice Input</h2>
          </div>
          
          <div className="space-y-4 pl-9">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select 
                className="input"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                {AVAILABLE_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-lg font-semibold">Dark Mode</span>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-300 dark:bg-gray-600"
            >
              <span 
                className={`inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out rounded-full bg-white shadow-md ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-lg py-3 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;