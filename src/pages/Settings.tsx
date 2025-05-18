import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Lock, User, Volume2, Mic, Droplet } from 'lucide-react';
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

const THEME_VARIABLES = [
  'primary-color',
  'secondary-color',
  'accent-color',
  'success-color',
  'warning-color',
  'error-color',
  'text-primary',
  'text-secondary',
  'background-primary',
  'background-secondary',
];

const PALETTE_PRESETS: {
  name: string;
  light: { [key: string]: string };
  dark: { [key: string]: string };
}[] = [
  {
    name: 'Sunset',
    light: {
      'primary-color': '#D98324',
      'secondary-color': '#443627',
      'accent-color': '#EFDCAB',
      'success-color': '#443627',
      'warning-color': '#D98324',
      'error-color': '#D98324',
      'text-primary': '#443627',
      'text-secondary': '#D98324',
      'background-primary': '#F2F6D0',
      'background-secondary': '#EFDCAB',
    },
    dark: {
      'primary-color': '#EFDCAB',
      'secondary-color': '#D98324',
      'accent-color': '#443627',
      'success-color': '#EFDCAB',
      'warning-color': '#D98324',
      'error-color': '#EFDCAB',
      'text-primary': '#EFDCAB',
      'text-secondary': '#F2F6D0',
      'background-primary': '#443627',
      'background-secondary': '#D98324',
    },
  },
  {
    name: 'Earthy',
    light: {
      'primary-color': '#65451F',
      'secondary-color': '#765827',
      'accent-color': '#C8AE7D',
      'success-color': '#65451F',
      'warning-color': '#C8AE7D',
      'error-color': '#765827',
      'text-primary': '#65451F',
      'text-secondary': '#765827',
      'background-primary': '#EAC696',
      'background-secondary': '#C8AE7D',
    },
    dark: {
      'primary-color': '#C8AE7D',
      'secondary-color': '#65451F',
      'accent-color': '#EAC696',
      'success-color': '#C8AE7D',
      'warning-color': '#EAC696',
      'error-color': '#C8AE7D',
      'text-primary': '#EAC696',
      'text-secondary': '#C8AE7D',
      'background-primary': '#65451F',
      'background-secondary': '#765827',
    },
  },
  {
    name: 'Green Tea',
    light: {
      'primary-color': '#A4B465',
      'secondary-color': '#626F47',
      'accent-color': '#F0BB78',
      'success-color': '#626F47',
      'warning-color': '#F0BB78',
      'error-color': '#A4B465',
      'text-primary': '#626F47',
      'text-secondary': '#A4B465',
      'background-primary': '#F5ECD5',
      'background-secondary': '#A4B465',
    },
    dark: {
      'primary-color': '#F0BB78',
      'secondary-color': '#A4B465',
      'accent-color': '#626F47',
      'success-color': '#F0BB78',
      'warning-color': '#A4B465',
      'error-color': '#F0BB78',
      'text-primary': '#F5ECD5',
      'text-secondary': '#F0BB78',
      'background-primary': '#626F47',
      'background-secondary': '#A4B465',
    },
  },
  {
    name: 'Sand & Sky',
    light: {
      'primary-color': '#F2F6D0',
      'secondary-color': '#EFDCAB',
      'accent-color': '#443627',
      'success-color': '#443627',
      'warning-color': '#EFDCAB',
      'error-color': '#443627',
      'text-primary': '#443627',
      'text-secondary': '#EFDCAB',
      'background-primary': '#F2F6D0',
      'background-secondary': '#EFDCAB',
    },
    dark: {
      'primary-color': '#443627',
      'secondary-color': '#EFDCAB',
      'accent-color': '#F2F6D0',
      'success-color': '#EFDCAB',
      'warning-color': '#F2F6D0',
      'error-color': '#EFDCAB',
      'text-primary': '#EFDCAB',
      'text-secondary': '#F2F6D0',
      'background-primary': '#443627',
      'background-secondary': '#F2F6D0',
    },
  },
];

function applyPalette(colors: {[key: string]: string}) {
  for (const key of THEME_VARIABLES) {
    if (colors[key]) {
      document.documentElement.style.setProperty(`--${key}`, colors[key]);
    }
  }
}

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, updatePassword } = useAuth();
  const { voices, options, updateOptions, speak } = useTTS();
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

  const [activePalette, setActivePalette] = useState(0);

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

  useEffect(() => {
    // On mount or mode change, apply the active palette for the current mode
    applyPalette(PALETTE_PRESETS[activePalette][isDarkMode ? 'dark' : 'light']);
    localStorage.setItem('activePalette', String(activePalette));
  }, [activePalette, isDarkMode]);

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
    } catch {
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
              <button
                type="button"
                className="btn btn-secondary mt-2 ml-2"
                onClick={() => {
                  if (selectedVoice) {
                    speak('This is a test of the selected voice.', { rate: speechRate, pitch: speechPitch, voice: selectedVoice });
                  }
                }}
              >
                Test
              </button>
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
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={() => {
                setSpeechRate(1);
                setSpeechPitch(1);
                updateOptions({ rate: 1, pitch: 1 });
              }}
            >
              Reset to Defaults
            </button>
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

        {/* Color Theme Settings */}
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Droplet className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold">Color Theme</h2>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm font-medium">Palettes</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center items-center">
              {PALETTE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  className={`group border-2 rounded-xl p-3 flex flex-col items-center transition-all duration-200 ${activePalette === idx ? 'border-[var(--primary-color)] shadow-lg' : 'border-transparent hover:border-[var(--primary-color)]'}`}
                  onClick={() => setActivePalette(idx)}
                  aria-label={`Select ${preset.name} palette`}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="font-semibold mb-2 text-[var(--text-primary)] group-hover:text-[var(--primary-color)] text-center">{preset.name}</span>
                  <div className="flex gap-2 justify-center items-center">
                    {/* Light preview */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs mb-1">Light</span>
                      <div className="flex">
                        {THEME_VARIABLES.map((key, j) => (
                          <span
                            key={j}
                            className="w-4 h-6 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg border border-gray-200"
                            style={{ background: (preset.light as {[key: string]: string})[key] }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Dark preview */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs mb-1">Dark</span>
                      <div className="flex">
                        {THEME_VARIABLES.map((key, j) => (
                          <span
                            key={j}
                            className="w-4 h-6 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg border border-gray-200"
                            style={{ background: (preset.dark as {[key: string]: string})[key] }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
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