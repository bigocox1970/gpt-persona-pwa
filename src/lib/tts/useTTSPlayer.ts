/**
 * TTS Player Hook
 * This hook manages audio playback for both browser and mobile platforms
 */

import { useRef, useState, useCallback, useEffect } from 'react';

export function useTTSPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        stop();
      }
    };
  }, []);

  // Play audio from a blob
  const playBlob = useCallback(async (blob: Blob) => {
    try {
      // Stop any currently playing audio
      stop();

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a new audio element
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // Set up event handlers
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      // Play the audio
      await audio.play();
      
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      return false;
    }
  }, []);

  // Stop audio playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
      audioRef.current = null;
    }
  }, []);

  return {
    playBlob,
    stop,
    isPlaying
  };
}
