/**
 * TTS Player Hook
 * This hook manages audio playback for both browser and mobile platforms
 */

import { useRef, useState, useCallback, useEffect } from 'react';

export function useTTSPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        stop();
      }
    };
  }, []);

  // Stop audio playback and clean up resources
  const stop = useCallback(async () => {
    if (audioRef.current) {
      try {
        // Stop playback
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Remove event listeners
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        
        // Release media stream if it exists
        if (audioRef.current.srcObject instanceof MediaStream) {
          const stream = audioRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          audioRef.current.srcObject = null;
        }
        
        // Release src URL
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = '';
        }
        
        // Clean up existing audio context
        if (audioContextRef.current) {
          try {
            await audioContextRef.current.close();
            audioContextRef.current = null;
          } catch (err) {
            console.error('Error cleaning up audio context:', err);
          }
        }
        
        setIsPlaying(false);
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
      audioRef.current = null;
    }
  }, []);

  // Play audio from a blob
  const playBlob = useCallback(async (blob: Blob) => {
    try {
      // Stop any currently playing audio and ensure cleanup
      stop();

      // Clean up any existing audio context
      if (audioContextRef.current) {
        try {
          await audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (err) {
          console.error('Error cleaning up audio context:', err);
        }
      }

      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a new audio element with high priority
      const audio = new Audio();
      audio.preload = 'auto';
      
      // Initialize audio context and connect it
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextImpl();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(audioContext.destination);
      
      // Set up event handlers before setting source
      audio.onplay = () => {
        setIsPlaying(true);
        // Resume audio context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
      };
      audio.onended = () => {
        setIsPlaying(false);
        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
        }
        stop(); // Ensure cleanup on end
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
        }
        stop(); // Ensure cleanup on error
      };
      
      // Set source and store reference
      audio.src = url;
      audioRef.current = audio;
      
      // Play the audio
      await audio.play();
      
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      stop(); // Ensure cleanup on error
      return false;
    }
  }, [stop]); // Include stop in dependencies

  return {
    playBlob,
    stop,
    isPlaying
  };
}
