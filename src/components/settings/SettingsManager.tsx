import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTTS } from '../../hooks/useTTS';
import { useSTT } from '../../hooks/useSTT';
import { useTheme } from '../../contexts/ThemeContext';

import ProfileSettings from './ProfileSettings';
import ThemeSettings from './ThemeSettings';
import VoiceSettings from './VoiceSettings';
import SpeechSettings from './SpeechSettings';

// Helper function to find the best matching voice based on preferences
const findBestMatchingVoice = (
  voices: SpeechSynthesisVoice[],
  language?: string,
  name?: string
): SpeechSynthesisVoice | null => {
  if (!voices.length) return null;
  
  // Try to find exact match by language and name
  if (language && name) {
    const exactMatch = voices.find(v => 
      v.lang.startsWith(language) && 
      v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (exactMatch) return exactMatch;
  }
  
  // Try to find by language only
  if (language) {
    const languageMatch = voices.find(v => v.lang.startsWith(language));
    if (languageMatch) return languageMatch;
  }
  
  // Fall back to default voice or first available
  return voices.find(v => v.default) || voices[0];
};

const SettingsManager: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updatePassword, updateUserProfile, saveUserSettings, getUserSettings } = useAuth();
  const { voices, options, updateOptions, speak } = useTTS();
  const { updateOptions: updateSTTOptions } = useSTT();
  const { isDarkMode } = useTheme();
  
  // State for user profile
  const [username, setUsername] = useState<string>(user?.name || '');
  const [initialUsername, setInitialUsername] = useState<string>(user?.name || '');
  
  // State for theme
  const [activePalette, setActivePalette] = useState<number>(0);
  const [initialPalette, setInitialPalette] = useState<number>(0);
  const [initialDarkMode, setInitialDarkMode] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState<{[key: string]: string}>({});
  
  // State for TTS
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechPitch, setSpeechPitch] = useState<number>(1);
  const [openaiTTS, setOpenaiTTS] = useState<boolean>(false);
  const [openaiVoice, setOpenaiVoice] = useState<"nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy">("nova");
  const [openaiModel, setOpenaiModel] = useState<"tts-1" | "tts-1-hd">("tts-1");
  
  // State for STT
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [initialLanguage, setInitialLanguage] = useState<string>('en-US');
  
  // Track changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Load initial settings
  useEffect(() => {
    // Load settings from localStorage as fallback
    const storedPalette = localStorage.getItem('activePalette');
    if (storedPalette) {
      setActivePalette(parseInt(storedPalette));
      setInitialPalette(parseInt(storedPalette));
    }
    
    // Initialize dark mode state
    setInitialDarkMode(isDarkMode);
    
    // Load username
    if (user?.name) {
      setUsername(user.name);
      setInitialUsername(user.name);
    }
    
    // Load speech settings
    const storedSTTSettings = localStorage.getItem('stt_settings');
    if (storedSTTSettings) {
      try {
        const sttSettings = JSON.parse(storedSTTSettings);
        if (sttSettings.language) {
          setSelectedLanguage(sttSettings.language);
          setInitialLanguage(sttSettings.language);
        }
      } catch (e) {
        console.error('Failed to parse STT settings:', e);
      }
    }
  }, [user]);
  
  // Initialize selectedVoice from options.voice when component loads
  useEffect(() => {
    if (options.voice) {
      console.log('Initializing selectedVoice from options.voice:', options.voice.name);
      setSelectedVoice(options.voice);
    }
  }, [options.voice]);

  // Load user settings from Supabase when voices are available
  useEffect(() => {
    if (voices.length > 0) {
      const userSettings = getUserSettings();
      if (userSettings) {
        console.log('Loading settings from Supabase:', userSettings);
        
        // Load theme settings
        if (userSettings.theme) {
          if (typeof userSettings.theme.activePalette === 'number') {
            setActivePalette(userSettings.theme.activePalette);
            setInitialPalette(userSettings.theme.activePalette);
          }
        }
        
        // Load TTS settings
        if (userSettings.tts) {
          // Find best matching voice
          if (userSettings.tts.voiceLanguage || userSettings.tts.voiceName) {
            console.log('Looking for voice with language:', userSettings.tts.voiceLanguage, 'and name:', userSettings.tts.voiceName);
            const bestMatch = findBestMatchingVoice(voices, userSettings.tts.voiceLanguage, userSettings.tts.voiceName);
            
            if (bestMatch) {
              console.log('Found matching voice:', bestMatch.name);
              setSelectedVoice(bestMatch);
              updateOptions({ voice: bestMatch });
            } else {
              console.error('Could not find matching voice');
            }
          }
          
          if (typeof userSettings.tts.rate === 'number') {
            setSpeechRate(userSettings.tts.rate);
            updateOptions({ rate: userSettings.tts.rate });
          }
          
          if (typeof userSettings.tts.pitch === 'number') {
            setSpeechPitch(userSettings.tts.pitch);
            updateOptions({ pitch: userSettings.tts.pitch });
          }
          
          // Load OpenAI TTS settings
          if (typeof userSettings.tts.openaiTTS === 'boolean') {
            setOpenaiTTS(userSettings.tts.openaiTTS);
            updateOptions({ useOpenAI: userSettings.tts.openaiTTS });
          }
          
          if (userSettings.tts.openaiVoice) {
            setOpenaiVoice(userSettings.tts.openaiVoice);
            updateOptions({ openaiVoice: userSettings.tts.openaiVoice });
          }
          
          if (userSettings.tts.openaiModel) {
            setOpenaiModel(userSettings.tts.openaiModel);
            updateOptions({ openaiModel: userSettings.tts.openaiModel });
          }
        }
        
        // Load STT settings
        if (userSettings.stt?.language) {
          setSelectedLanguage(userSettings.stt.language);
          setInitialLanguage(userSettings.stt.language);
          if (updateSTTOptions) {
            updateSTTOptions({ language: userSettings.stt.language });
          }
        }
      }
    }
  }, [voices, getUserSettings, updateOptions, updateSTTOptions]);
  
  // Check for unsaved changes
  useEffect(() => {
    // Check if voice has changed
    let voiceChanged = false;
    
    // Debug voice state
    console.log('[CHANGE DETECTION] Voice state:', {
      selectedVoice: selectedVoice ? {
        name: selectedVoice.name,
        lang: selectedVoice.lang,
        voiceURI: selectedVoice.voiceURI
      } : null,
      optionsVoice: options.voice ? {
        name: options.voice.name,
        lang: options.voice.lang,
        voiceURI: options.voice.voiceURI
      } : null
    });
    
    if (selectedVoice && !options.voice) {
      // Voice selected for the first time
      console.log('[CHANGE DETECTION] Voice selected for the first time');
      voiceChanged = true;
    } else if (!selectedVoice && options.voice) {
      // Voice removed
      console.log('[CHANGE DETECTION] Voice removed');
      voiceChanged = true;
    } else if (selectedVoice && options.voice && selectedVoice.voiceURI !== options.voice.voiceURI) {
      // Different voice selected
      console.log('[CHANGE DETECTION] Different voice selected');
      voiceChanged = true;
    }
    
    const hasChanges = 
      username !== initialUsername ||
      activePalette !== initialPalette ||
      isDarkMode !== initialDarkMode ||
      speechRate !== options.rate ||
      speechPitch !== options.pitch ||
      selectedLanguage !== initialLanguage ||
      voiceChanged ||
      openaiTTS !== options.useOpenAI ||
      openaiVoice !== options.openaiVoice ||
      openaiModel !== options.openaiModel;
    
    console.log('Change detection:', { 
      voiceChanged, 
      selectedVoice: selectedVoice?.name, 
      optionsVoice: options.voice?.name,
      activePalette,
      initialPalette,
      isDarkMode,
      initialDarkMode,
      selectedLanguage,
      initialLanguage,
      hasChanges 
    });
    
    setHasUnsavedChanges(hasChanges);
  }, [
    username, initialUsername,
    activePalette, initialPalette,
    isDarkMode, initialDarkMode,
    speechRate, speechPitch, options.rate, options.pitch,
    selectedLanguage, initialLanguage,
    selectedVoice, options.voice,
    openaiTTS, options.useOpenAI,
    openaiVoice, options.openaiVoice,
    openaiModel, options.openaiModel
  ]);
  
  // Handle beforeunload event
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  }, [hasUnsavedChanges]);
  
  // Add beforeunload event listener
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);
  
  // This function was removed as it's not being used
  
  // Confirm navigation
  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      setShowConfirmDialog(false);
      navigate(pendingNavigation);
    }
  }, [pendingNavigation, navigate]);
  
  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  }, []);
  
  // Handle logout
  const handleLogout = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/login');
      setShowConfirmDialog(true);
    } else {
      logout();
    }
  }, [hasUnsavedChanges, logout]);
  
  // Handle password change
  const handlePasswordChange = useCallback(async (currentPassword: string, newPassword: string) => {
    await updatePassword(currentPassword, newPassword);
  }, [updatePassword]);
  
  // Save settings
  const saveSettings = useCallback(async () => {
    // First save to localStorage as fallback
    localStorage.setItem('activePalette', String(activePalette));
    localStorage.setItem('user_display_name', username);
    
    // Save TTS settings to localStorage and update options
    console.log('Saving voice settings:', {
      voice: selectedVoice?.name || 'None',
      rate: speechRate,
      pitch: speechPitch
    });
    
    // Force a stop of any current speech before updating options
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Update TTS options with a slight delay to ensure clean state
    setTimeout(() => {
      updateOptions({
        voice: selectedVoice,
        rate: speechRate,
        pitch: speechPitch,
        useOpenAI: openaiTTS,
        openaiVoice: openaiVoice,
        openaiModel: openaiModel
      });
      
      console.log('TTS options updated with:', {
        voice: selectedVoice?.name || 'None',
        useOpenAI: openaiTTS,
        openaiVoice: openaiVoice
      });
    }, 100);
    
    // Save STT settings to localStorage
    if (updateSTTOptions) {
      updateSTTOptions({ language: selectedLanguage });
      localStorage.setItem('stt_settings', JSON.stringify({ language: selectedLanguage }));
    }
    
    // Save all settings to Supabase
    try {
      // Create settings object with voice preferences instead of exact URI
      const settings = {
        theme: {
          activePalette: activePalette,
          isDarkMode: isDarkMode === undefined ? false : isDarkMode,
          customColors: Object.keys(customColors).length > 0 ? customColors : undefined
        },
        tts: {
          voiceLanguage: selectedVoice?.lang,
          voiceName: selectedVoice?.name,
          voiceGender: selectedVoice?.name?.toLowerCase().includes('female') ? 'female' : 'male',
          rate: speechRate,
          pitch: speechPitch,
          openaiTTS: openaiTTS,
          openaiVoice: openaiVoice,
          openaiModel: openaiModel
        },
        stt: {
          language: selectedLanguage
        }
      };
      
      // Save settings to Supabase
      await saveUserSettings(settings);
      
      // Update user profile if username changed
      if (username !== initialUsername) {
        await updateUserProfile(username);
      }
      
      // Update initial values to reflect saved state
      setInitialUsername(username);
      setInitialPalette(activePalette);
      setInitialDarkMode(isDarkMode);
      setInitialLanguage(selectedLanguage);
      
      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings to database:', error);
      alert('There was an error saving your settings to the cloud. Your settings are saved locally but may not sync across devices.');
    }
  }, [
    activePalette, username, selectedVoice, 
    speechRate, speechPitch, selectedLanguage, 
    initialUsername, updateOptions, updateSTTOptions, 
    saveUserSettings, updateUserProfile, isDarkMode,
    openaiTTS, openaiVoice, openaiModel, customColors
  ]);
  
  // Handle component changes
  const handleUsernameChange = useCallback((name: string) => {
    setUsername(name);
  }, []);
  
  const handlePaletteChange = useCallback((palette: number) => {
    setActivePalette(palette);
  }, []);
  
  const handleCustomColorsChange = useCallback((colors: {[key: string]: string}) => {
    setCustomColors(colors);
    setHasUnsavedChanges(true);
  }, []);
  
  const handleVoiceChange = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
  }, []);
  
  const handleRateChange = useCallback((rate: number) => {
    setSpeechRate(rate);
  }, []);
  
  const handlePitchChange = useCallback((pitch: number) => {
    setSpeechPitch(pitch);
  }, []);
  
  const handleOpenAITTSChange = useCallback((enabled: boolean) => {
    setOpenaiTTS(enabled);
  }, []);
  
  const handleOpenAIVoiceChange = useCallback((voice: string) => {
    setOpenaiVoice(voice as "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy");
  }, []);
  
  const handleOpenAIModelChange = useCallback((model: string) => {
    setOpenaiModel(model as "tts-1" | "tts-1-hd");
  }, []);
  
  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Profile Settings */}
      <ProfileSettings
        initialUsername={username}
        onUsernameChange={handleUsernameChange}
        onPasswordChange={handlePasswordChange}
      />
      
      {/* Theme Settings */}
      <ThemeSettings
        initialPalette={activePalette}
        onPaletteChange={handlePaletteChange}
        onCustomColorsChange={handleCustomColorsChange}
      />
      
      {/* Voice Settings */}
      <VoiceSettings
        initialVoice={selectedVoice}
        initialRate={speechRate}
        initialPitch={speechPitch}
        openaiTTS={openaiTTS}
        openaiVoice={openaiVoice}
        openaiModel={openaiModel}
        onVoiceChange={handleVoiceChange}
        onRateChange={handleRateChange}
        onPitchChange={handlePitchChange}
        onOpenAITTSChange={handleOpenAITTSChange}
        onOpenAIVoiceChange={handleOpenAIVoiceChange}
        onOpenAIModelChange={handleOpenAIModelChange}
      />
      
      {/* Speech Settings */}
      <SpeechSettings
        initialLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={saveSettings}
          className={`w-full flex items-center justify-center space-x-2 ${hasUnsavedChanges ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} font-medium rounded-lg py-3 hover:opacity-90 transition-colors`}
          disabled={!hasUnsavedChanges}
          id="save-settings-button"
        >
          <Save size={18} />
          <span>{hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}</span>
        </button>
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          <p>Voice: {selectedVoice?.name || 'None'} ({selectedVoice?.lang || 'None'})</p>
          <p>OpenAI TTS: {openaiTTS ? 'Enabled' : 'Disabled'} - Voice: {openaiVoice} - Model: {openaiModel}</p>
          <p>Has Unsaved Changes: {hasUnsavedChanges ? 'Yes' : 'No'}</p>
        </div>
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

export default SettingsManager;
