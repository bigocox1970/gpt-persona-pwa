// useSTT.tsx
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom React hook for speech-to-text using webkitSpeechRecognition or OpenAI Whisper.
 * 
 * If useOpenAI is true, uses MediaRecorder to record audio and sends it to the backend for OpenAI Whisper transcription.
 * If useOpenAI is false, uses browser's webkitSpeechRecognition.
 */

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
  useOpenAI?: boolean;
}

export const useSTT = (defaultOptions?: STTOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<STTOptions>({
    language: 'en-US',
    continuous: false,
    interimResults: true,
    ...defaultOptions
  });

  // For browser STT
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // For OpenAI STT
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        rec.onend = null;
        rec.stop();
        rec.abort();
      } catch {}
      clearRecognitionHandlers(rec);
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup function for OpenAI STT
  const cleanupMediaRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsListening(false);
  }, []);

  // --- Pseudo-streaming OpenAI STT ---
  // Timer for chunked recording
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Store the last transcript to avoid duplicate UI updates
  const lastTranscriptRef = useRef<string>("");

  // Start listening: either browser STT or OpenAI STT
  const startListening = useCallback(() => {
    if (options.useOpenAI) {
      // Simple OpenAI Whisper STT (single utterance, no chunking)
      if (isListening) return;
      setError(null);
      setTranscript('');
      setFinalTranscript('');
      audioChunksRef.current = [];

      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstart = () => {
          setIsListening(true);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = [];
          stream.getTracks().forEach(track => track.stop());
          try {
            const formData = new FormData();
            formData.append("file", audioBlob, "audio.webm");
            const response = await fetch("/.netlify/functions/stt", {
              method: "POST",
              body: formData
            });
            if (!response.ok) {
              const errText = await response.text();
              setError("STT error: " + errText);
              setIsListening(false);
              return;
            }
            const data = await response.json();
            setTranscript(data.transcript || "");
            setFinalTranscript(data.transcript || "");
            setIsListening(false);
          } catch (err: any) {
            setError("STT error: " + (err?.message || "Unknown error"));
            setIsListening(false);
          }
        };

        recorder.onerror = (e) => {
          setError("Recording error");
          setIsListening(false);
        };

        recorder.start();
      }).catch(err => {
        setError("Could not access microphone: " + (err?.message || "Unknown error"));
        setIsListening(false);
      });
      return;
    }

    // Browser STT
    if (isListening || recognitionRef.current) {
      return;
    }
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }
    const SpeechRecognitionImpl = window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      setError('Speech recognition not supported');
      return;
    }

    cleanupRecognition();

    const rec = new SpeechRecognitionImpl();
    recognitionRef.current = rec;
    rec.lang = options.language || 'en-US';
    rec.continuous = false;
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
  }, [options.language, options.useOpenAI, cleanupRecognition, isListening]);

  // Stop listening: stop/abort recognition and cleanup
  const stopListening = useCallback(() => {
    if (options.useOpenAI) {
      if (mediaRecorderRef.current && typeof mediaRecorderRef.current.stop === "function") {
        mediaRecorderRef.current.stop();
      }
      return;
    }
    cleanupRecognition();
    forceReleaseMicMobile();
  }, [options.useOpenAI, cleanupRecognition]);

  // Clear transcripts only
  const clearTranscripts = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
      cleanupMediaRecorder();
    };
  }, [cleanupRecognition, cleanupMediaRecorder]);

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
    isSupported: !!window.webkitSpeechRecognition || !!window.MediaRecorder
  };
};
