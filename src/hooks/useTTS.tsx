import { useState, useCallback, useEffect } from 'react';
import { fetchTTS } from '../lib/tts/openaiTTS';
import { useTTSPlayer } from '../lib/tts/useTTSPlayer';

// Declare WebKit interfaces
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface TTSOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
  openaiVoice?: "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy";
  openaiModel?: "tts-1" | "tts-1-hd";
  useOpenAI?: boolean;
  allowBrowserFallback?: boolean;
}

const TTS_SETTINGS_KEY = 'tts_settings';

export const useTTS = (defaultOptions?: TTSOptions) => {
  const { playBlob, stop: stopOpenAI, isPlaying } = useTTSPlayer();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  // Initialize options from localStorage or defaults
  const [options, setOptions] = useState<TTSOptions>(() => {
    try {
      const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        console.log('Loaded TTS settings from localStorage:', parsed);
        return {
          rate: parsed.rate ?? 1,
          pitch: parsed.pitch ?? 1,
          voice: null, // Voice will be set after loading available voices
          openaiVoice: parsed.openaiVoice ?? "nova",
          openaiModel: parsed.openaiModel ?? "tts-1",
          useOpenAI: parsed.useOpenAI ?? false
        };
      }
    } catch (error) {
      console.error('Error loading TTS settings:', error);
    }
    
    // Default settings - make OpenAI TTS the default
    const defaults = {
      rate: defaultOptions?.rate ?? 1,
      pitch: defaultOptions?.pitch ?? 1,
      voice: null,
      openaiVoice: defaultOptions?.openaiVoice ?? "nova",
      openaiModel: defaultOptions?.openaiModel ?? "tts-1",
      useOpenAI: true // Always default to OpenAI TTS unless explicitly disabled
    };
    console.log('Using default TTS settings:', defaults);
    return defaults;
  });

  // Force initialize settings from localStorage or set defaults
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
      let settings;
      
      if (savedSettings) {
        // If we have saved settings, parse them
        const parsed = JSON.parse(savedSettings);
        console.log('Found saved TTS settings:', parsed);
        
        // Only use useOpenAI: false if it was explicitly set to false
        const useOpenAI = parsed.useOpenAI === false ? false : true;
        
        settings = {
          rate: parsed.rate ?? 1,
          pitch: parsed.pitch ?? 1,
          openaiVoice: parsed.openaiVoice ?? "nova",
          openaiModel: parsed.openaiModel ?? "tts-1",
          useOpenAI
        };
      } else {
        // If no saved settings, use defaults with OpenAI enabled
        settings = {
          rate: 1,
          pitch: 1,
          openaiVoice: "nova",
          openaiModel: "tts-1",
          useOpenAI: true
        };
      }
      
      console.log('Initializing TTS with settings:', settings);
      
      // Save settings to localStorage
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(settings));
      
      // Update options immediately
      setOptions(prev => ({
        ...prev,
        ...settings
      }));
    } catch (error) {
      console.error('Error initializing TTS settings:', error);
      // On error, ensure we still default to OpenAI
      setOptions(prev => ({
        ...prev,
        useOpenAI: true
      }));
    }
  }, []); // Run once on mount

  // Load voices and initialize settings
  useEffect(() => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      try {
        // Force Chrome to load voices
        if (synth.getVoices().length === 0) {
          console.log('No voices available yet, waiting...');
        }
        
        const availableVoices = synth.getVoices();
        console.log('Loaded voices:', availableVoices.length);
        setVoices(availableVoices);
        
        // Always try to load the saved voice when voices are available
        const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
        if (savedSettings && availableVoices.length > 0) {
          try {
            const parsed = JSON.parse(savedSettings);
            console.log('Loading saved TTS settings:', parsed);
            
            // Update all settings
            const updatedOptions: TTSOptions = {
              rate: parsed.rate ?? options.rate,
              pitch: parsed.pitch ?? options.pitch,
              openaiVoice: parsed.openaiVoice ?? options.openaiVoice,
              openaiModel: parsed.openaiModel ?? options.openaiModel,
              useOpenAI: parsed.useOpenAI ?? options.useOpenAI,
              voice: null // Will be set below
            };
            
            // Try to find saved voice
            if (parsed.voiceURI) {
              const savedVoice = availableVoices.find(v => v.voiceURI === parsed.voiceURI);
              if (savedVoice) {
                console.log('Found saved voice:', savedVoice.name);
                updatedOptions.voice = savedVoice;
              } else {
                console.log('Saved voice not found, using default');
                updatedOptions.voice = availableVoices.find(v => v.default) || availableVoices[0];
              }
            }
            
            // Update all options at once
            setOptions(updatedOptions);
            console.log('Updated TTS options:', updatedOptions);
          } catch (e) {
            console.error('Error parsing saved TTS settings:', e);
          }
        }
      } catch (e) {
        console.error('Error loading voices:', e);
      }
    };

    // Initial load
    loadVoices();
    
    // Set up event listener for voices loaded
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Try again after a short delay (helps on some browsers)
    const retryTimer = setTimeout(loadVoices, 1000);

    return () => {
      clearTimeout(retryTimer);
      synth.cancel();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Helper function to normalize speech rate based on voice
  const normalizeRate = useCallback((rate: number, voice: SpeechSynthesisVoice | null): number => {
    if (!voice) return rate;
    
    // Return the rate as is without any adjustments
    // This fixes the issue with voices being sped up
    return rate;
    
    /* Removed voice-specific adjustments as they were causing issues
    // Some voices are naturally faster or slower than others
    // Adjust rate based on voice characteristics
    const voiceName = voice.name.toLowerCase();
    
    // Slow down voices that tend to be too fast
    if (voiceName.includes('microsoft') && voiceName.includes('neural')) {
      // Microsoft Neural voices tend to be faster
      return rate * 0.85;
    }
    
    // Speed up voices that tend to be too slow
    if (voiceName.includes('google')) {
      // Google voices tend to be slower
      return rate * 1.1;
    }
    
    return rate;
    */
  }, []);

  // Helper function to use browser's built-in TTS
  const speakWithBrowserTTS = useCallback((text: string, currentOptions: TTSOptions) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice first so we can normalize rate based on voice
    if (currentOptions.voice) {
      utterance.voice = currentOptions.voice;
    }
    
    // Normalize rate based on selected voice
    const normalizedRate = normalizeRate(currentOptions.rate || 1, utterance.voice);
    console.log(`Speech rate: original=${currentOptions.rate}, normalized=${normalizedRate} for voice ${utterance.voice?.name || 'default'}`);
    
    utterance.rate = normalizedRate;
    utterance.pitch = currentOptions.pitch || 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synth.speak(utterance);
  }, [normalizeRate]);

  // Update speaking state when isPlaying changes
  useEffect(() => {
    if (options.useOpenAI) {
      setSpeaking(isPlaying);
    }
  }, [isPlaying, options.useOpenAI]);

  const speak = useCallback(async (text: string, customOptions?: TTSOptions) => {
    const currentOptions = { ...options, ...customOptions };
    
    // Always cancel any existing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Use OpenAI TTS if enabled
    if (currentOptions.useOpenAI) {
      try {
        // setSpeaking will be handled by isPlaying effect
        const blob = await fetchTTS({
          text,
          voice: currentOptions.openaiVoice,
          model: currentOptions.openaiModel
        });
        await playBlob(blob);
      } catch (error) {
        console.error('OpenAI TTS error:', error);
        setSpeaking(false);
        // Only fallback to browser TTS if explicitly allowed
        if (window.speechSynthesis && currentOptions.allowBrowserFallback) {
          speakWithBrowserTTS(text, currentOptions);
        }
      }
      return;
    }
    
    // Use browser TTS
    speakWithBrowserTTS(text, currentOptions);
  }, [options, playBlob, speakWithBrowserTTS]);

  const stop = useCallback(() => {
    if (options.useOpenAI) {
      stopOpenAI();
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setSpeaking(false);
  }, [options.useOpenAI, stopOpenAI]);

  const updateOptions = useCallback(async (newOptions: Partial<TTSOptions>) => {
    // Reset speech synthesis when switching TTS modes
    if (newOptions.useOpenAI !== undefined) {
      setSpeaking(false);
      stop();
      
      // Ensure all audio contexts are properly cleaned up
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        // Force a reset of the speech synthesis engine
        setTimeout(() => {
          window.speechSynthesis.resume();
          window.speechSynthesis.cancel();
        }, 100);
      }
      
      // Release any existing audio contexts
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      if (AudioContextImpl) {
        try {
          const tempContext = new AudioContextImpl();
          await tempContext.close();
        } catch (err) {
          console.error('Error cleaning up audio context:', err);
        }
      }
    }

    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      
      // Save to localStorage with explicit voiceURI
      const saveData = {
        rate: updated.rate,
        pitch: updated.pitch,
        voiceURI: updated.voice?.voiceURI || null,
        openaiVoice: updated.openaiVoice,
        openaiModel: updated.openaiModel,
        useOpenAI: updated.useOpenAI
      };
      
      console.log('Saving TTS settings to localStorage:', saveData);
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(saveData));
      
      return updated;
    });
  }, [stop]);

  const selectVoice = useCallback((criteria: { name?: string; lang?: string }) => {
    if (!voices.length) return;

    let selectedVoice: SpeechSynthesisVoice | null = null;
    if (criteria.name) {
      const found = voices.find(voice => voice.name.includes(criteria.name!));
      if (found) selectedVoice = found;
    } else if (criteria.lang) {
      const found = voices.find(voice => voice.lang.includes(criteria.lang!));
      if (found) selectedVoice = found;
    }

    if (selectedVoice) {
      updateOptions({ voice: selectedVoice });
    }
  }, [voices, updateOptions]);

  return {
    speak,
    stop,
    speaking,
    voices,
    options,
    updateOptions,
    selectVoice
  };
};
