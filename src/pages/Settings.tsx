import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, LogOut, Lock, User, Volume2, Mic, Droplet, Save } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, updatePassword, updateUserProfile, saveUserSettings, getUserSettings } = useAuth();
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
  
  // Username for personalization
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('user_display_name') || '';
  });
  
  // Track initial TTS settings for change detection
  const [initialVoiceURI, setInitialVoiceURI] = useState<string | null>(null);
  const [initialSpeechRate, setInitialSpeechRate] = useState<number>(1);
  const [initialSpeechPitch, setInitialSpeechPitch] = useState<number>(1);
  const [initialLanguage, setInitialLanguage] = useState<string>('en-US');

  const [activePalette, setActivePalette] = useState(0);
  const [initialPalette, setInitialPalette] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Filter voices to show all English voices, including non-local ones
  const availableVoices = voices.filter(voice => 
    voice.lang.startsWith('en')
  );
  
  // Log available voices for debugging
  useEffect(() => {
    console.log('All voices:', voices);
    console.log('Filtered voices:', availableVoices);
  }, [voices, availableVoices]);

  // Load initial TTS settings
  useEffect(() => {
    if (availableVoices.length > 0) {
      // Try to find the voice from Supabase settings first
      const userSettings = getUserSettings();
      const voiceURI = userSettings?.tts?.voiceURI;
      if (voiceURI) {
        const savedVoice = availableVoices.find(v => v.voiceURI === voiceURI);
        if (savedVoice) {
          setSelectedVoice(savedVoice);
          setInitialVoiceURI(savedVoice.voiceURI);
          return;
        }
      }
      
      // If no voice from Supabase, check local options
      if (options.voice) {
        setSelectedVoice(options.voice);
        setInitialVoiceURI(options.voice.voiceURI);
      } else {
        // Otherwise set a default voice
        const defaultVoice = availableVoices.find(voice => voice.default) || availableVoices[0];
        setSelectedVoice(defaultVoice);
        updateOptions({ voice: defaultVoice });
        setInitialVoiceURI(defaultVoice.voiceURI);
      }
    }
  }, [availableVoices, options, getUserSettings]);

  // Load settings from Supabase and localStorage
  useEffect(() => {
    // First try to load from Supabase if user is logged in
    const userSettings = getUserSettings();
    
    if (userSettings) {
      // Load theme settings
      if (userSettings.theme) {
        if (userSettings.theme.activePalette !== undefined) {
          setActivePalette(userSettings.theme.activePalette);
          setInitialPalette(userSettings.theme.activePalette);
          // Apply the saved palette immediately
          applyPalette(PALETTE_PRESETS[userSettings.theme.activePalette][isDarkMode ? 'dark' : 'light']);
        }
      }
      
      // Load TTS settings
      if (userSettings.tts) {
        if (userSettings.tts.rate !== undefined) {
          setSpeechRate(userSettings.tts.rate);
          setInitialSpeechRate(userSettings.tts.rate);
        }
        
        if (userSettings.tts.pitch !== undefined) {
          setSpeechPitch(userSettings.tts.pitch);
          setInitialSpeechPitch(userSettings.tts.pitch);
        }
        
        // Voice will be set after voices are loaded
        if (userSettings.tts.voiceURI) {
          setInitialVoiceURI(userSettings.tts.voiceURI);
        }
      }
      
      // Load STT settings
      if (userSettings.stt && userSettings.stt.language) {
        setSelectedLanguage(userSettings.stt.language);
        setInitialLanguage(userSettings.stt.language);
      }
    } else {
      // Fall back to localStorage if no Supabase settings
      const savedPalette = localStorage.getItem('activePalette');
      if (savedPalette) {
        const paletteIndex = parseInt(savedPalette, 10);
        setActivePalette(paletteIndex);
        setInitialPalette(paletteIndex);
        // Apply the saved palette immediately
        applyPalette(PALETTE_PRESETS[paletteIndex][isDarkMode ? 'dark' : 'light']);
      }
    }
  }, [isDarkMode, getUserSettings]);

  // Apply palette when it changes
  useEffect(() => {
    // Apply the active palette for the current mode
    applyPalette(PALETTE_PRESETS[activePalette][isDarkMode ? 'dark' : 'light']);
    
    // Check if we have unsaved changes
    let hasChanges = false;
    
    // Check color theme changes
    if (activePalette !== initialPalette) {
      hasChanges = true;
      console.log('Palette changed:', activePalette, initialPalette);
    }
    
    // Check username changes
    if (username !== (localStorage.getItem('user_display_name') || '')) {
      hasChanges = true;
      console.log('Username changed');
    }
    
    // Check TTS voice changes - handle null/undefined cases properly
    const currentVoiceURI = selectedVoice?.voiceURI || null;
    if (currentVoiceURI !== initialVoiceURI) {
      hasChanges = true;
      console.log('Voice changed:', currentVoiceURI, initialVoiceURI);
    }
    
    // Check TTS rate changes
    if (speechRate !== initialSpeechRate) {
      hasChanges = true;
      console.log('Speech rate changed');
    }
    
    // Check TTS pitch changes
    if (speechPitch !== initialSpeechPitch) {
      hasChanges = true;
      console.log('Speech pitch changed');
    }
    
    // Check STT language changes
    if (selectedLanguage !== initialLanguage) {
      hasChanges = true;
      console.log('Language changed');
    }
    
    console.log('Has unsaved changes:', hasChanges);
    setHasUnsavedChanges(hasChanges);
  }, [activePalette, isDarkMode, initialPalette, username, selectedVoice, initialVoiceURI, speechRate, initialSpeechRate, speechPitch, initialSpeechPitch, selectedLanguage, initialLanguage]);
  
  // Handle navigation away with unsaved changes
  useEffect(() => {
    // Function to handle beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

  // Save settings
  const saveSettings = useCallback(async () => {
    // First save to localStorage as fallback
    localStorage.setItem('activePalette', String(activePalette));
    localStorage.setItem('user_display_name', username);
    
    // Save TTS settings to localStorage
    if (selectedVoice) {
      updateOptions({
        voice: selectedVoice,
        rate: speechRate,
        pitch: speechPitch
      });
    }
    
    // Save STT settings to localStorage
    updateSTTOptions({ language: selectedLanguage });
    localStorage.setItem('stt_settings', JSON.stringify({ language: selectedLanguage }));
    
    // Save all settings to Supabase
    try {
      // Create settings object
      const settings = {
        theme: {
          activePalette: activePalette,
          isDarkMode: isDarkMode
        },
        tts: {
          voiceURI: selectedVoice?.voiceURI,
          rate: speechRate,
          pitch: speechPitch
        },
        stt: {
          language: selectedLanguage
        }
      };
      
      // Save to Supabase
      await saveUserSettings(settings);
      
      // Save username separately to ensure it's updated
      if (username) {
        await updateUserProfile(username);
      }
      
      // Update local state to track initial values
      setInitialPalette(activePalette);
      setInitialVoiceURI(selectedVoice?.voiceURI || null);
      setInitialSpeechRate(speechRate);
      setInitialSpeechPitch(speechPitch);
      setInitialLanguage(selectedLanguage);
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings to database:', error);
      alert('There was an error saving your settings to the cloud. Your settings are saved locally but may not sync across devices.');
    }
  }, [activePalette, username, isDarkMode, selectedVoice, speechRate, speechPitch, selectedLanguage, updateOptions, updateSTTOptions, saveUserSettings, updateUserProfile]);

  // Handle navigation
  const handleNavigation = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowConfirmDialog(true);
    } else {
      navigate(path);
    }
  }, [hasUnsavedChanges, navigate]);

  // Confirm navigation and discard changes
  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      setShowConfirmDialog(false);
      navigate(pendingNavigation);
    }
  }, [pendingNavigation, navigate]);

  // Cancel navigation and stay on settings page
  const cancelNavigation = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  }, []);

  // Override the default navigation behavior
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        setShowConfirmDialog(true);
        setPendingNavigation(location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, location, handleNavigation]);

  const handleLogout = async () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/login');
      setShowConfirmDialog(true);
      return;
    }
    
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const voiceURI = e.target.value;
      console.log('Selected voice URI:', voiceURI);
      
      // If empty selection, set to null
      if (!voiceURI) {
        setSelectedVoice(null);
        return;
      }
      
      const voice = voices.find(v => v.voiceURI === voiceURI) || null;
      
      if (voice) {
        console.log('Found matching voice:', voice.name);
        setSelectedVoice(voice);
        
        // Force a check for unsaved changes
        const currentVoiceURI = voice.voiceURI;
        const hasVoiceChanged = currentVoiceURI !== initialVoiceURI;
        console.log('Voice changed?', hasVoiceChanged, 'Current:', currentVoiceURI, 'Initial:', initialVoiceURI);
        
        if (hasVoiceChanged) {
          // Speak a test phrase to confirm voice works
          speak('This is a test of the selected voice.', { voice });
        }
      } else {
        console.error('Could not find voice with URI:', voiceURI);
      }
    } catch (error) {
      console.error('Error changing voice:', error);
    }
  };

  const handleSpeechRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSpeechRate(rate);
    // Don't update options immediately, wait for save button
  };

  const handleSpeechPitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pitch = parseFloat(e.target.value);
    setSpeechPitch(pitch);
    // Don't update options immediately, wait for save button
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    // Don't update options immediately, wait for save button
  };

  return (
    <div className="min-h-full bg-[var(--background-primary)] dark:bg-[var(--background-primary)] p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Navigation Buttons */}
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => handleNavigation('/chat')}
            className="text-[var(--primary-color)] font-medium"
          >
            &larr; Back to Chat
          </button>
          <button 
            onClick={() => handleNavigation('/admin/personas')}
            className="text-[var(--primary-color)] font-medium"
          >
            Personas
          </button>
        </div>

        {/* User Info */}
        <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          <div className="pl-9">
            <p className="text-gray-700 dark:text-gray-300">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name (used by AI personas)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Enter your preferred name"
                className="input text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">This name will be used by AI personas when addressing you</p>
            </div>
            
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
          
          <div className="space-y-6 pl-9">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice
              </label>
              <div className="flex flex-col space-y-2">
                <select 
                  className="input w-full"
                  value={selectedVoice?.voiceURI || ''}
                  onChange={handleVoiceChange}
                >
                  <option value="">Select a voice</option>
                  {availableVoices.length > 0 ? (
                    availableVoices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No voices available</option>
                  )}
                </select>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {availableVoices.length} voices available
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary py-1 px-3 text-sm"
                    onClick={() => {
                      if (selectedVoice) {
                        speak('This is a test of the selected voice.', { rate: speechRate, pitch: speechPitch, voice: selectedVoice });
                      }
                    }}
                    disabled={!selectedVoice}
                  >
                    Test Voice
                  </button>
                </div>
              </div>
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
                className="w-full accent-[var(--primary-color)] h-2 rounded-lg appearance-none cursor-pointer"
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
                className="w-full accent-[var(--primary-color)] h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary mt-4 w-full py-2"
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
            <div className="mb-4 text-sm font-medium">Palettes</div>
            <div className="grid grid-cols-2 gap-4 w-full justify-center items-center">
              {PALETTE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  className={`group border-2 rounded-xl p-2 flex flex-col items-center transition-all duration-200 ${activePalette === idx ? 'border-[var(--primary-color)] shadow-lg' : 'border-transparent hover:border-[var(--primary-color)]'}`}
                  onClick={() => setActivePalette(idx)}
                  aria-label={`Select ${preset.name} palette`}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="font-semibold mb-2 text-[var(--text-primary)] group-hover:text-[var(--primary-color)] text-center text-sm">{preset.name}</span>
                  <div className="flex flex-col gap-1 justify-center items-center w-full">
                    {/* Light preview */}
                    <div className="flex flex-col items-center w-full">
                      <span className="text-xs mb-1">Light</span>
                      <div className="flex w-full">
                        {THEME_VARIABLES.slice(0, 5).map((key, j) => (
                          <span
                            key={j}
                            className="flex-1 h-4 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg"
                            style={{ background: (preset.light as {[key: string]: string})[key] }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Dark preview */}
                    <div className="flex flex-col items-center w-full">
                      <span className="text-xs mb-1">Dark</span>
                      <div className="flex w-full">
                        {THEME_VARIABLES.slice(0, 5).map((key, j) => (
                          <span
                            key={j}
                            className="flex-1 h-4 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg"
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

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={saveSettings}
            className={`w-full flex items-center justify-center space-x-2 ${hasUnsavedChanges ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} font-medium rounded-lg py-3 hover:opacity-90 transition-colors`}
            disabled={!hasUnsavedChanges}
          >
            <Save size={18} />
            <span>{hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-lg py-3 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Unsaved Changes</h3>
            <p className="mb-6">You have unsaved changes. Do you want to save your settings before leaving?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  saveSettings();
                  confirmNavigation();
                }}
                className="flex-1 btn btn-primary"
              >
                Yes, Save
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                No, Discard
              </button>
              <button
                onClick={cancelNavigation}
                className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;