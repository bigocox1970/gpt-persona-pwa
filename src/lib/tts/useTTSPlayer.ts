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

  // Stop audio playback and clean up resources
  const stop = useCallback(() => {
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

      // Small delay to ensure audio context is fully cleaned up
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a new audio element
      const audio = new Audio();
      
      // Set up event handlers before setting source
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        stop(); // Ensure cleanup on end
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
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
