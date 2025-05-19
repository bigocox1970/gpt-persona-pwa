import { useState, useCallback, useEffect } from 'react';

interface TTSOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
}

const TTS_SETTINGS_KEY = 'tts_settings';

export const useTTS = (defaultOptions?: TTSOptions) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [options, setOptions] = useState<TTSOptions>(() => {
    const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        rate: parsed.rate || 1,
        pitch: parsed.pitch || 1,
        voice: null // Voice will be set after loading available voices
      };
    }
    return {
      rate: defaultOptions?.rate || 1,
      pitch: defaultOptions?.pitch || 1,
      voice: null
    };
  });

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
            console.log('Parsed saved settings:', parsed);
            
            if (parsed.voiceURI) {
              const savedVoice = availableVoices.find(v => v.voiceURI === parsed.voiceURI);
              if (savedVoice) {
                console.log('Found saved voice:', savedVoice.name);
                setOptions(prev => ({ ...prev, voice: savedVoice }));
              } else {
                console.log('Saved voice not found, using default');
                // If saved voice not found, use default
                const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
                setOptions(prev => ({ ...prev, voice: defaultVoice }));
              }
            }
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

  const speak = useCallback((text: string, customOptions?: TTSOptions) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const currentOptions = { ...options, ...customOptions };
    
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
  }, [options, normalizeRate]);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const updateOptions = useCallback((newOptions: Partial<TTSOptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      
      // Save to localStorage with explicit voiceURI
      const saveData = {
        rate: updated.rate,
        pitch: updated.pitch,
        voiceURI: updated.voice?.voiceURI || null
      };
      
      console.log('Saving TTS settings to localStorage:', saveData);
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(saveData));
      
      return updated;
    });
  }, []);

  const selectVoice = useCallback((criteria: { name?: string; lang?: string }) => {
    if (!voices.length) return;

    let selectedVoice = null;
    if (criteria.name) {
      selectedVoice = voices.find(voice => voice.name.includes(criteria.name!));
    } else if (criteria.lang) {
      selectedVoice = voices.find(voice => voice.lang.includes(criteria.lang!));
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
