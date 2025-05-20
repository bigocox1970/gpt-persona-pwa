import { useState, useCallback, useEffect } from 'react';
import { fetchTTS } from '../lib/tts/openaiTTS';
import { useTTSPlayer } from '../lib/tts/useTTSPlayer';

interface TTSOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
  openaiVoice?: "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy";
  openaiModel?: "tts-1" | "tts-1-hd";
  useOpenAI?: boolean;
}

const TTS_SETTINGS_KEY = 'tts_settings';

export const useTTS = (defaultOptions?: TTSOptions) => {
  const { playBlob, stop: stopOpenAI, isPlaying } = useTTSPlayer();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [options, setOptions] = useState<TTSOptions>(() => {
    const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        rate: parsed.rate || 1,
        pitch: parsed.pitch || 1,
        voice: null, // Voice will be set after loading available voices
        openaiVoice: parsed.openaiVoice || "nova",
        openaiModel: parsed.openaiModel || "tts-1",
        useOpenAI: parsed.useOpenAI || false
      };
    }
    return {
      rate: defaultOptions?.rate || 1,
      pitch: defaultOptions?.pitch || 1,
      voice: null,
      openaiVoice: defaultOptions?.openaiVoice || "nova",
      openaiModel: defaultOptions?.openaiModel || "tts-1",
      useOpenAI: defaultOptions?.useOpenAI || false
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
        // Fallback to browser TTS
        if (window.speechSynthesis) {
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

  const updateOptions = useCallback((newOptions: Partial<TTSOptions>) => {
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
      
      // Update speaking state when OpenAI TTS is toggled
      if (newOptions.useOpenAI !== undefined) {
        setSpeaking(false);
        stop();
      }
      
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
