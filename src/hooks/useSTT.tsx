// useSTT.tsx
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React hook for speech-to-text using webkitSpeechRecognition.
 * 
 * This version creates a new recognition instance for each start,
 * ensures all event handlers are cleaned up, and fully releases the mic,
 * including on iOS Safari and Android Chrome.
 * 
 * Key points:
 * - Recognition instance is created fresh for each start.
 * - All event handlers are cleaned up after use.
 * - MediaStream is only used for forced mic release on mobile after recognition ends.
 * - Cleanup is robust and synchronous.
 */

// --- Type Declarations (Web Speech API) ---
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

// --- Main Hook ---
export const useSTT = (defaultOptions?: STTOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<STTOptions>({
    language: 'en-US',
    continuous: false, // iOS: continuous mode is buggy
    interimResults: true,
    ...defaultOptions
  });

  // Ref to hold the current recognition instance for cleanup
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Helper: Clear all event handlers on the recognition instance
  const clearRecognitionHandlers = (rec: SpeechRecognition | null) => {
    if (!rec) return;
    rec.onstart = null;
    rec.onend = null;
    rec.onresult = null;
    rec.onerror = null;
    rec.onspeechend = null;
    rec.onspeechstart = null;
    rec.onsoundend = null;
    rec.onsoundstart = null;
    rec.onnomatch = null;
    rec.onaudioend = null;
    rec.onaudiostart = null;
  };

  // Helper: Force-release the mic on mobile after recognition ends
  const forceReleaseMicMobile = async () => {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach(track => track.stop());
      } catch {
        // Ignore errors (user may have denied permission)
      }
    }
  };

  // Cleanup function to stop recognition and release mic
  const cleanupRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onend = null; // Prevent recursion
        rec.stop();
        rec.abort();
      } catch {}
      clearRecognitionHandlers(rec);
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Start listening: create a new recognition instance, attach handlers, and start
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }
    const SpeechRecognitionImpl = window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      setError('Speech recognition not supported');
      return;
    }

    // Clean up any previous instance
    cleanupRecognition();

    // Create new recognition instance
    const rec = new SpeechRecognitionImpl();
    recognitionRef.current = rec;
    rec.lang = options.language || 'en-US';
    rec.continuous = false; // iOS: continuous mode is buggy
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setFinalTranscript('');
    };
    rec.onend = async () => {
      setIsListening(false);
      clearRecognitionHandlers(rec);
      recognitionRef.current = null;
      await forceReleaseMicMobile();
    };
    rec.onspeechend = () => {
      rec.stop();
    };
    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
      clearRecognitionHandlers(rec);
      recognitionRef.current = null;
    };
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setTranscript(interim);
      if (final) setFinalTranscript(final.trim());
    };

    try {
      rec.start();
    } catch (err) {
      setError('Error starting recognition');
      setIsListening(false);
      clearRecognitionHandlers(rec);
      recognitionRef.current = null;
    }
  }, [options.language, cleanupRecognition]);

  // Stop listening: stop/abort recognition and cleanup
  const stopListening = useCallback(() => {
    cleanupRecognition();
    forceReleaseMicMobile();
  }, [cleanupRecognition]);

  // Clear transcripts only
  const clearTranscripts = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  // Expose API
  return {
    startListening,
    stopListening,
    transcript,
    finalTranscript,
    isListening,
    error,
    updateOptions: (newOptions: Partial<STTOptions>) => setOptions(prev => ({ ...prev, ...newOptions })),
    clearTranscripts,
    isSupported: !!window.webkitSpeechRecognition
  };
};

/**
 * --- Explanation of Key Steps ---
 * 
 * 1. A new recognition instance is created for each start, avoiding stale or cleaned-up instances.
 * 2. All event handlers are cleaned up after use to prevent leaks.
 * 3. After recognition ends, the mic is force-released on mobile by requesting and stopping a new stream.
 * 4. Cleanup is synchronous and robust, and always runs on unmount.
 * 5. State is reset on each start and after recognition ends.
 */
