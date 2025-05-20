import { useState, useEffect, useCallback } from 'react';

// Declare global types for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export const useSTT = (defaultOptions?: STTOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [options, setOptions] = useState<STTOptions>({
    language: defaultOptions?.language || 'en-US',
    continuous: defaultOptions?.continuous || false,
    interimResults: defaultOptions?.interimResults || true
  });

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure options
    recognitionInstance.lang = options.language || 'en-US';
    recognitionInstance.continuous = options.continuous || false;
    recognitionInstance.interimResults = options.interimResults || true;
    
    console.log('Speech recognition initialized with language:', recognitionInstance.lang);

    // Set up event handlers
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscriptValue = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscriptValue += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript);
      
      if (finalTranscriptValue) {
        setFinalTranscript(finalTranscriptValue.trim());
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.onstart = null;
        recognitionInstance.onend = null;
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        
        if (isListening) {
          recognitionInstance.stop();
        }
      }
    };
  }, [options]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setTranscript('');
    setFinalTranscript('');
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Recognition error:', err);
      setError('Error starting speech recognition');
    }
  }, [recognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognition || !isListening) return;
    
    try {
      recognition.stop();
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, [recognition, isListening]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<STTOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Clear transcripts
  const clearTranscripts = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  return {
    startListening,
    stopListening,
    transcript,
    finalTranscript,
    isListening,
    error,
    updateOptions,
    clearTranscripts,
    isSupported: !!recognition
  };
};
