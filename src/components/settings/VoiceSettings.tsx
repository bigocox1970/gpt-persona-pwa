import React, { useState, useEffect, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

interface VoiceSettingsProps {
  initialVoice: SpeechSynthesisVoice | null;
  initialRate: number;
  initialPitch: number;
  openaiTTS?: boolean;
  openaiVoice?: string;
  openaiModel?: string;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onOpenAITTSChange?: (enabled: boolean) => void;
  onOpenAIVoiceChange?: (voice: string) => void;
  onOpenAIModelChange?: (model: string) => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  initialVoice,
  initialRate,
  initialPitch,
  openaiTTS = false,
  openaiVoice = "nova",
  openaiModel = "tts-1",
  onVoiceChange,
  onRateChange,
  onPitchChange,
  onOpenAITTSChange,
  onOpenAIVoiceChange,
  onOpenAIModelChange
}) => {
  const { voices, speak } = useTTS();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(initialVoice);
  const [speechRate, setSpeechRate] = useState<number>(initialRate);
  const [speechPitch, setSpeechPitch] = useState<number>(initialPitch);
  const [useOpenAITTS, setUseOpenAITTS] = useState<boolean>(openaiTTS);
  const [selectedOpenAIVoice, setSelectedOpenAIVoice] = useState<string>(openaiVoice);
  const [selectedOpenAIModel, setSelectedOpenAIModel] = useState<string>(openaiModel);
  
  // Update state when props change
  useEffect(() => {
    console.log('[VoiceSettings] openaiTTS prop changed:', openaiTTS);
    setUseOpenAITTS(openaiTTS);
  }, [openaiTTS]);
  
  useEffect(() => {
    console.log('[VoiceSettings] openaiVoice prop changed:', openaiVoice);
    setSelectedOpenAIVoice(openaiVoice);
  }, [openaiVoice]);
  
  useEffect(() => {
    console.log('[VoiceSettings] openaiModel prop changed:', openaiModel);
    setSelectedOpenAIModel(openaiModel);
  }, [openaiModel]);

  // Filter voices to show only unique ones (some browsers have duplicates)
  useEffect(() => {
    const uniqueVoices = voices.filter((voice, index, self) =>
      index === self.findIndex((v) => v.voiceURI === voice.voiceURI)
    );
    setAvailableVoices(uniqueVoices);
    console.log('Filtered voices:', uniqueVoices);
    
    // Update selectedVoice when initialVoice changes
    if (initialVoice) {
      console.log('Setting selectedVoice from initialVoice:', initialVoice.name);
      setSelectedVoice(initialVoice);
    }
  }, [voices, initialVoice]);

  // Handle voice selection change
  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const voiceURI = e.target.value;
      console.log('[VOICE CHANGE] Selected voice URI:', voiceURI);
      
      // If empty selection, set to null
      if (!voiceURI) {
        console.log('[VOICE CHANGE] Setting voice to null');
        setSelectedVoice(null);
        onVoiceChange(null);
        
        // Force a re-render to ensure the UI updates
        setTimeout(() => {
          console.log('[VOICE CHANGE] Forced update after setting voice to null');
        }, 0);
        return;
      }
      
      // Find the selected voice in the available voices
      const voice = voices.find(v => v.voiceURI === voiceURI);
      
      if (voice) {
        // Immediately update the selected voice state
        console.log('[VOICE CHANGE] Setting selected voice to:', voice.name);
        setSelectedVoice(voice);
        
        // Call the callback with a slight delay to ensure state is updated
        setTimeout(() => {
          console.log('[VOICE CHANGE] Calling onVoiceChange callback with:', voice.name);
          onVoiceChange(voice);
        }, 0);
        
        // Speak a test phrase with the new voice
        speak('This is a test of the selected voice.', { voice });
      } else {
        console.error('[VOICE CHANGE] Could not find voice with URI:', voiceURI);
        alert('Error: Could not find the selected voice. Please try another voice.');
      }
    } catch (error) {
      console.error('[VOICE CHANGE] Error changing voice:', error);
      alert('An error occurred while changing voices. Please try again.');
    }
  }, [voices, speak, onVoiceChange]);

  // Handle speech rate change
  const handleSpeechRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSpeechRate(rate);
    onRateChange(rate);
  }, [onRateChange]);

  // Handle speech pitch change
  const handleSpeechPitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const pitch = parseFloat(e.target.value);
    setSpeechPitch(pitch);
    onPitchChange(pitch);
  }, [onPitchChange]);
  
  // Handle OpenAI TTS toggle
  const handleOpenAITTSChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setUseOpenAITTS(enabled);
    if (onOpenAITTSChange) {
      onOpenAITTSChange(enabled);
    }
  }, [onOpenAITTSChange]);
  
  // Handle OpenAI voice change
  const handleOpenAIVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = e.target.value;
    setSelectedOpenAIVoice(voice);
    if (onOpenAIVoiceChange) {
      onOpenAIVoiceChange(voice);
    }
  }, [onOpenAIVoiceChange]);
  
  // Handle OpenAI model change
  const handleOpenAIModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedOpenAIModel(model);
    if (onOpenAIModelChange) {
      onOpenAIModelChange(model);
    }
  }, [onOpenAIModelChange]);
  
  // Test OpenAI voice
  const testOpenAIVoice = useCallback(() => {
    speak('This is a test of the selected OpenAI voice.', { 
      useOpenAI: true,
      openaiVoice: selectedOpenAIVoice as "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy",
      openaiModel: selectedOpenAIModel as "tts-1" | "tts-1-hd"
    });
  }, [speak, selectedOpenAIVoice, selectedOpenAIModel]);

  return (
    <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Volume2 className="text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Voice Output</h2>
      </div>
      
      <div className="space-y-6">
        {/* OpenAI TTS Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="openai-tts-toggle"
            checked={useOpenAITTS}
            onChange={handleOpenAITTSChange}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="openai-tts-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Use OpenAI Text-to-Speech
          </label>
        </div>
        
        {/* OpenAI TTS Settings */}
        {useOpenAITTS && (
          <div className="space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OpenAI Voice
              </label>
              <select
                className="input w-full"
                value={selectedOpenAIVoice}
                onChange={handleOpenAIVoiceChange}
                id="openai-voice-selector"
              >
                <option value="nova">Nova (Female)</option>
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="fable">Fable (Male)</option>
                <option value="onyx">Onyx (Male)</option>
                <option value="shimmer">Shimmer (Female)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OpenAI Model
              </label>
              <select
                className="input w-full"
                value={selectedOpenAIModel}
                onChange={handleOpenAIModelChange}
                id="openai-model-selector"
              >
                <option value="tts-1">Standard (tts-1)</option>
                <option value="tts-1-hd">High Definition (tts-1-hd)</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={testOpenAIVoice}
              className="btn text-sm py-1.5"
            >
              Test OpenAI Voice
            </button>
          </div>
        )}
        
        {/* Browser TTS Settings */}
        <div className={useOpenAITTS ? "opacity-50" : ""}>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {useOpenAITTS ? "Browser Voice (Fallback)" : "Browser Voice"}
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice
            </label>
          <div className="flex flex-col space-y-2">
            <select 
              className="input w-full"
              value={selectedVoice?.voiceURI || ''}
              onChange={handleVoiceChange}
              id="voice-selector"
            >
              <option value="">Select a voice</option>
              {availableVoices.length > 0 ? (
                availableVoices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading voices...</option>
              )}
            </select>
            <button
              type="button"
              onClick={() => selectedVoice && speak('This is a test of the selected voice.', { voice: selectedVoice })}
              className="btn text-sm py-1.5"
              disabled={!selectedVoice}
            >
              Test Voice
            </button>
          </div>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Speech Rate: {speechRate.toFixed(1)}
            </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={handleSpeechRateChange}
            className="w-full"
          />
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pitch: {speechPitch.toFixed(1)}
            </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechPitch}
            onChange={handleSpeechPitchChange}
            className="w-full"
          />
        </div>
        
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500">
            <p>Selected Voice: {selectedVoice?.name || 'None'} ({selectedVoice?.lang || 'None'})</p>
            <p>Rate: {speechRate} | Pitch: {speechPitch}</p>
          </div>
        </div>
        
        {/* OpenAI Debug info */}
        {useOpenAITTS && (
          <div className="mt-2 text-xs text-gray-500">
            <p>OpenAI Voice: {selectedOpenAIVoice}</p>
            <p>OpenAI Model: {selectedOpenAIModel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSettings;
