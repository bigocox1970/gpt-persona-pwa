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
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    let recognitionInstance: ExtendedSpeechRecognition | null = null;

    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Microphone access granted');

        // Create speech recognition instance after permission is granted
        const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionImpl) {
          setError('Speech recognition is not supported in this browser');
          return;
        }
        recognitionInstance = new SpeechRecognitionImpl() as ExtendedSpeechRecognition;
        
        // Configure options
        recognitionInstance.lang = options.language || 'en-US';
        recognitionInstance.continuous = options.continuous || false;
        recognitionInstance.interimResults = true; // Always enable for better sensitivity
        
        // Store the stream
        recognitionInstance.mediaStream = stream;
        
        console.log('Speech recognition initialized with language:', recognitionInstance.lang);

        // Set up event handlers
        recognitionInstance.onstart = () => {
          setIsListening(true);
          setError(null);
          console.log('Speech recognition started');
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          console.log('Speech recognition ended');
          
          // Don't stop the media stream on end, keep it alive for next recognition
          if (recognitionInstance?.mediaStream) {
            console.log('Keeping media stream alive for next recognition');
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Recognition error:', event.error);
          setError(`Recognition error: ${event.error}`);
          setIsListening(false);
          
          // Only stop stream on fatal errors
          if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            if (recognitionInstance?.mediaStream) {
              recognitionInstance.mediaStream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped media track due to fatal error:', track.kind);
              });
              recognitionInstance.mediaStream = undefined;
            }
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
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        setError('Error accessing microphone');
      });

    return () => {
      if (recognitionInstance) {
        // Stop recognition if active
        if (isListening) {
          recognitionInstance.stop();
        }
        
        // Remove event listeners
        recognitionInstance.onstart = null;
        recognitionInstance.onend = null;
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        
        // Stop and cleanup media stream
        if (recognitionInstance.mediaStream) {
          recognitionInstance.mediaStream.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped media track on cleanup:', track.kind);
          });
          recognitionInstance.mediaStream = undefined;
        }
      }
    };
  }, [options, isListening]);

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
