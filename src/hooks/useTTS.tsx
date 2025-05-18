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
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      
      if (!options.voice && availableVoices.length > 0) {
        const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.voiceURI) {
            const savedVoice = availableVoices.find(v => v.voiceURI === parsed.voiceURI);
            if (savedVoice) {
              setOptions(prev => ({ ...prev, voice: savedVoice }));
            }
          }
        }
      }
    };

    loadVoices();
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      synth.cancel();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
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
    utterance.rate = currentOptions.rate || 1;
    utterance.pitch = currentOptions.pitch || 1;
    if (currentOptions.voice) {
      utterance.voice = currentOptions.voice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synth.speak(utterance);
  }, [options]);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const updateOptions = useCallback((newOptions: Partial<TTSOptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify({
        ...updated,
        voiceURI: updated.voice?.voiceURI
      }));
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