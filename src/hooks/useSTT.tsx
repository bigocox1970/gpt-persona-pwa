import { useState, useEffect, useCallback } from 'react';

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechGrammarList {
  length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

// Declare global types for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface ExtendedSpeechRecognition extends SpeechRecognition {
  mediaStream?: MediaStream;
}

export const useSTT = (defaultOptions?: STTOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<ExtendedSpeechRecognition | null>(null);
  const [options, setOptions] = useState<STTOptions>({
    language: defaultOptions?.language || 'en-US',
    continuous: defaultOptions?.continuous || false,
    interimResults: defaultOptions?.interimResults || true
  });

  // Initialize speech recognition
  useEffect(() => {
    // Clean up any existing instance first
    if (recognition) {
      if (recognition.mediaStream) {
        recognition.mediaStream.getTracks().forEach(track => track.stop());
        recognition.mediaStream = undefined;
      }
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      setIsListening(false);
      setError(null);
    }

    let recognitionInstance: ExtendedSpeechRecognition | null = null;

    const initializeRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Speech recognition is not supported in this browser');
        return null;
      }

      // Create speech recognition instance
      const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionImpl) {
        setError('Speech recognition is not supported in this browser');
        return null;
      }

      try {
        const instance = new SpeechRecognitionImpl() as ExtendedSpeechRecognition;
        
        // Configure options
        instance.lang = options.language || 'en-US';
        instance.continuous = options.continuous || false;
        instance.interimResults = true; // Always enable for better sensitivity
        
        console.log('Speech recognition initialized with language:', instance.lang);
        return instance;
      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setError('Error initializing speech recognition');
        return null;
      }
    };

    const instance = initializeRecognition();
    if (!instance) {
      setRecognition(null);
      return;
    }
    
    recognitionInstance = instance;

    // Set up event handlers
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started');
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
      
      // Clean up media stream
      if (recognitionInstance && recognitionInstance.mediaStream) {
        recognitionInstance.mediaStream.getTracks().forEach(track => track.stop());
        recognitionInstance.mediaStream = undefined;
      }
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event.error);
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
      
      // Clean up media stream on error
      if (recognitionInstance.mediaStream) {
        recognitionInstance.mediaStream.getTracks().forEach(track => track.stop());
        recognitionInstance.mediaStream = undefined;
      }
      
      // Try to restart recognition if it was aborted or audio ended
      if (event.error === 'aborted' || event.error === 'audio-capture') {
        console.log('Attempting to restart recognition...');
        setTimeout(() => {
          if (recognitionInstance && !isListening) {
            recognitionInstance.start();
          }
        }, 1000);
      }
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
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
        // Stop recognition if active
        if (isListening) {
          recognitionInstance.stop();
        }
        
        // Clean up media stream
        if (recognitionInstance.mediaStream) {
          recognitionInstance.mediaStream.getTracks().forEach(track => track.stop());
          recognitionInstance.mediaStream = undefined;
        }
        
        // Remove event listeners
        recognitionInstance.onstart = null;
        recognitionInstance.onend = null;
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        
        // Reset state
        setIsListening(false);
        setError(null);
      }
    };
  }, [options, error]); // Re-initialize when options change or on error

  // Handle microphone permissions
  const ensureMicrophoneAccess = async () => {
    try {
      // First check if we already have permission
      const permissions = await navigator.mediaDevices.enumerateDevices();
      const audioPermission = permissions.find(device => device.kind === 'audioinput');
      
      // If we have a device but no label, we need permission
      if (audioPermission && !audioPermission.label) {
        console.log('Requesting microphone permission...');
      }
      
      // Request microphone access with specific constraints for iOS
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      
      // On iOS, we need to keep the stream active
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log('Audio track ended unexpectedly');
          setError('Audio track ended');
          setIsListening(false);
          // Force reinitialize on track end
          setOptions(prev => ({...prev}));
        };
      });
      
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Error accessing microphone');
      // Force reinitialize on error
      setOptions(prev => ({...prev}));
      return null;
    }
  };

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      // Stop recognition
      recognition.stop();
      
      // Clean up media stream
      if (recognition.mediaStream) {
        recognition.mediaStream.getTracks().forEach(track => track.stop());
        recognition.mediaStream = undefined;
      }
      
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping recognition:', err);
      setIsListening(false);
    }
  }, [recognition]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognition) {
      console.error('Speech recognition not initialized');
      return;
    }
    
    try {
      // If already listening, stop and wait for cleanup
      if (isListening) {
        recognition.stop();
        // Wait for onend event to fire and cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Force cleanup of any existing media stream
      if (recognition.mediaStream) {
        recognition.mediaStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped media track:', track.kind);
        });
        recognition.mediaStream = undefined;
      }
      
      // Reset states
      setError(null);
      setTranscript('');
      setFinalTranscript('');
      
      // Ensure we have microphone access first
      const stream = await ensureMicrophoneAccess();
      if (!stream) {
        throw new Error('Failed to get microphone access');
      }
      
      // Store the stream
      recognition.mediaStream = stream;
      
      // Start recognition
      recognition.start();
      console.log('Starting recognition...');
    } catch (error) {
      console.error('Recognition error:', error);
      setError('Error starting speech recognition');
      if (recognition.mediaStream) {
        recognition.mediaStream.getTracks().forEach(track => track.stop());
        recognition.mediaStream = undefined;
      }
      setIsListening(false);
      // Force reinitialize on error
      setOptions(prev => ({...prev}));
    }
  }, [recognition, isListening, ensureMicrophoneAccess, setOptions]);

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
