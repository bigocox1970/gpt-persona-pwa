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
  
  // New initial states for TTS and STT
  const [initialSelectedVoice, setInitialSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [initialSpeechRate, setInitialSpeechRate] = useState<number>(1);
  const [initialSpeechPitch, setInitialSpeechPitch] = useState<number>(1);
  const [initialOpenaiTTS, setInitialOpenaiTTS] = useState<boolean>(false);
  const [initialOpenaiVoice, setInitialOpenaiVoice] = useState<"nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy">("nova");
  const [initialOpenaiModel, setInitialOpenaiModel] = useState<"tts-1" | "tts-1-hd">("tts-1");
  
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
    
    // Reset unsaved changes flag when component loads
    setHasUnsavedChanges(false);
  }, [user, isDarkMode]);
  
  // Initialize selectedVoice from options.voice when component loads
  /*
  useEffect(() => {
    if (options.voice) {
      console.log('Initializing selectedVoice from options.voice:', options.voice.name);
      setSelectedVoice(options.voice);
    }
  }, [options.voice]);
  */

  // Load user settings from Supabase when voices are available
  useEffect(() => {
    if (voices.length > 0) {
      const userSettings = getUserSettings();
      
      // Reset hasUnsavedChanges when loading settings
      setHasUnsavedChanges(false);
      
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
              setInitialSelectedVoice(bestMatch);
              updateOptions({ voice: bestMatch });
            } else {
              console.error('Could not find matching voice');
            }
          }
          
          if (typeof userSettings.tts.rate === 'number') {
            setSpeechRate(userSettings.tts.rate);
            setInitialSpeechRate(userSettings.tts.rate);
            updateOptions({ rate: userSettings.tts.rate });
          }
          
          if (typeof userSettings.tts.pitch === 'number') {
            setSpeechPitch(userSettings.tts.pitch);
            setInitialSpeechPitch(userSettings.tts.pitch);
            updateOptions({ pitch: userSettings.tts.pitch });
          }
          
          // Load OpenAI TTS settings
          if (typeof userSettings.tts.openaiTTS === 'boolean') {
            setOpenaiTTS(userSettings.tts.openaiTTS);
            setInitialOpenaiTTS(userSettings.tts.openaiTTS);
            updateOptions({ useOpenAI: userSettings.tts.openaiTTS });
          }
          
          if (userSettings.tts.openaiVoice) {
            setOpenaiVoice(userSettings.tts.openaiVoice);
            setInitialOpenaiVoice(userSettings.tts.openaiVoice);
            updateOptions({ openaiVoice: userSettings.tts.openaiVoice });
          }
          
          if (userSettings.tts.openaiModel) {
            setOpenaiModel(userSettings.tts.openaiModel);
            setInitialOpenaiModel(userSettings.tts.openaiModel);
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
    // More precise voice comparison to avoid false positives
    let voiceChanged = false;
    if (selectedVoice && initialSelectedVoice) {
      voiceChanged = selectedVoice.voiceURI !== initialSelectedVoice.voiceURI;
    } else if (selectedVoice || initialSelectedVoice) {
      // One is null and the other isn't
      voiceChanged = true;
    }
    // Otherwise both are null, so no change
    
    // Compare numbers with a small tolerance to avoid floating point comparison issues
    const isRateChanged = Math.abs(speechRate - initialSpeechRate) > 0.001;
    const isPitchChanged = Math.abs(speechPitch - initialSpeechPitch) > 0.001;
    
    // Check each value individually for better debugging
    const usernameChanged = username !== initialUsername;
    const paletteChanged = activePalette !== initialPalette;
    const darkModeChanged = isDarkMode !== initialDarkMode;
    const languageChanged = selectedLanguage !== initialLanguage;
    const openaiTTSChanged = openaiTTS !== initialOpenaiTTS;
    const openaiVoiceChanged = openaiVoice !== initialOpenaiVoice;
    const openaiModelChanged = openaiModel !== initialOpenaiModel;
    
    const hasChanges = 
      usernameChanged ||
      paletteChanged ||
      darkModeChanged ||
      isRateChanged ||
      isPitchChanged ||
      languageChanged ||
      voiceChanged ||
      openaiTTSChanged ||
      openaiVoiceChanged ||
      openaiModelChanged;
    
    console.log('Change detection:', { 
      hasChanges,
      usernameChanged, username, initialUsername,
      paletteChanged, activePalette, initialPalette,
      darkModeChanged, isDarkMode, initialDarkMode,
      isRateChanged, speechRate, initialSpeechRate,
      isPitchChanged, speechPitch, initialSpeechPitch,
      languageChanged, selectedLanguage, initialLanguage,
      voiceChanged,
      selectedVoiceURI: selectedVoice?.voiceURI,
      initialSelectedVoiceURI: initialSelectedVoice?.voiceURI,
      openaiTTSChanged, openaiTTS, initialOpenaiTTS,
      openaiVoiceChanged, openaiVoice, initialOpenaiVoice,
      openaiModelChanged, openaiModel, initialOpenaiModel
    });
    
    setHasUnsavedChanges(hasChanges);
  }, [
    username, initialUsername,
    activePalette, initialPalette,
    isDarkMode, initialDarkMode,
    speechRate, initialSpeechRate,
    speechPitch, initialSpeechPitch,
    selectedLanguage, initialLanguage,
    selectedVoice, initialSelectedVoice,
    openaiTTS, initialOpenaiTTS,
    openaiVoice, initialOpenaiVoice,
    openaiModel, initialOpenaiModel
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
      setPendingNavigation('logout'); // Set a specific action for logout
      setShowConfirmDialog(true);
    } else {
      logout(); // Logout directly if no changes
    }
  }, [hasUnsavedChanges, logout]);

  // This function is for the dialog that asks about saving before navigating away
  const handleGeneralConfirm = () => {
    saveSettings(); // Save first
    confirmNavigation(); // Then navigate
  };

  const handleGeneralDiscard = () => {
    confirmNavigation(); // Just navigate, discarding changes
  };

  const handleGeneralCancel = () => {
    cancelNavigation(); // Don't navigate, close dialog
  };

  // Specific handler for the logout confirmation dialog
  const handleLogoutConfirm = () => {
    // Force logout without saving changes
    setHasUnsavedChanges(false); // Prevent beforeunload warning
    logout();
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };
  
  // Handle password change
  const handlePasswordChange = useCallback(async (currentPassword: string, newPassword: string) => {
    await updatePassword(currentPassword, newPassword);
  }, [updatePassword]);
  
  // Save settings
  const saveSettings = useCallback(async () => {
    console.log('Saving settings...');
    const settingsToSave = {
      profile: {
        name: username,
      },
      theme: {
        activePalette: activePalette,
        isDarkMode: isDarkMode,
      },
      tts: {
        voiceName: selectedVoice?.name,
        voiceLanguage: selectedVoice?.lang,
        rate: speechRate,
        pitch: speechPitch,
        openaiTTS: openaiTTS,
        openaiVoice: openaiVoice,
        openaiModel: openaiModel,
      },
      stt: {
        language: selectedLanguage,
      },
    };

    console.log('Settings to save:', settingsToSave);

    try {
      await saveUserSettings(settingsToSave);
      
      // Update initial states to reflect the new saved state
      setInitialUsername(username);
      setInitialPalette(activePalette);
      setInitialDarkMode(isDarkMode);
      setInitialLanguage(selectedLanguage);
      setInitialSelectedVoice(selectedVoice);
      setInitialSpeechRate(speechRate);
      setInitialSpeechPitch(speechPitch);
      setInitialOpenaiTTS(openaiTTS);
      setInitialOpenaiVoice(openaiVoice);
      setInitialOpenaiModel(openaiModel);
  
      // Update options in context/hooks to match saved state
      updateOptions({
        voice: selectedVoice,
        rate: speechRate,
        pitch: speechPitch,
        useOpenAI: openaiTTS,
        openaiVoice: openaiVoice,
        openaiModel: openaiModel,
      });
  
      if (updateSTTOptions) {
        updateSTTOptions({ language: selectedLanguage });
      }
  
      setHasUnsavedChanges(false);
      console.log('Settings saved and initial states updated.');
    } catch (error) {
      console.error('Error saving settings:', error);
      // Keep hasUnsavedChanges true if save failed
    }
  }, [
    activePalette, username, selectedVoice, 
    speechRate, speechPitch, selectedLanguage, 
    initialUsername, updateOptions, updateSTTOptions, 
    saveUserSettings, updateUserProfile, isDarkMode,
    openaiTTS, openaiVoice, openaiModel, customColors
  ]);
  
  // Force synchronize all initial values with current values
  const syncInitialValues = useCallback(() => {
    setInitialUsername(username);
    setInitialPalette(activePalette);
    setInitialDarkMode(isDarkMode);
    setInitialSelectedVoice(selectedVoice);
    setInitialSpeechRate(speechRate);
    setInitialSpeechPitch(speechPitch);
    setInitialLanguage(selectedLanguage);
    setInitialOpenaiTTS(openaiTTS);
    setInitialOpenaiVoice(openaiVoice);
    setInitialOpenaiModel(openaiModel);
    setHasUnsavedChanges(false);
    console.log('Forced synchronization of all initial values with current values');
  }, [
    username, activePalette, isDarkMode, selectedVoice, 
    speechRate, speechPitch, selectedLanguage,
    openaiTTS, openaiVoice, openaiModel
  ]);
  
  // Add effect to force sync values when component mounts
  useEffect(() => {
    // Small delay to ensure all values are loaded
    const timer = setTimeout(() => {
      syncInitialValues();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [syncInitialValues]);
  
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
            <h3 className="text-lg font-bold mb-4">
              {pendingNavigation === 'logout' ? 'Log Out' : 'Unsaved Changes'}
            </h3>
            <p className="mb-6">
              {pendingNavigation === 'logout' 
                ? 'You have unsaved changes. Are you sure you want to discard them and log out?'
                : 'You have unsaved changes. Do you want to save your settings before leaving?'
              }
            </p>
            {pendingNavigation === 'logout' ? (
              <div className="flex space-x-3">
                <button onClick={handleLogoutConfirm} className="flex-1 btn btn-danger">Discard & Logout</button>
                <button onClick={cancelNavigation} className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button onClick={handleGeneralConfirm} className="flex-1 btn btn-primary">Yes, Save</button>
                <button onClick={handleGeneralDiscard} className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">No, Discard</button>
                <button onClick={handleGeneralCancel} className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
