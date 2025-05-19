# useTTS Hook (Text-to-Speech)

## Overview
The useTTS hook provides Text-to-Speech functionality for the application, allowing AI responses to be read aloud to the user. It wraps the Web Speech API's SpeechSynthesis interface in a convenient React hook.

## File Location
`src/hooks/useTTS.tsx`

## Key Functionality

### Voice Synthesis
- Convert text to spoken audio
- Control speech playback (start, pause, resume, cancel)
- Adjust speech parameters (rate, pitch, volume)
- Select from available system voices

### Voice Options
The hook provides access to and control over voice parameters:
- `voices`: Array of available system voices
- `options`: Current TTS configuration (voice, rate, pitch)
- `updateOptions`: Function to update TTS settings

### Playback Control
- `speak`: Function to convert text to speech
- `stop`: Function to stop current speech
- `pause`: Function to pause current speech
- `resume`: Function to resume paused speech
- `isSpeaking`: Boolean indicating if speech is currently active

## Implementation Details

### Web Speech API Integration
- Uses the browser's SpeechSynthesis API
- Handles browser compatibility issues
- Manages voice availability and selection

### State Management
- Uses React's useState to track speech state and options
- Uses useEffect to initialize and manage speech synthesis
- Provides callbacks for speech events (start, end, error)

### Options Persistence
- Saves voice preferences to localStorage
- Restores previously selected voice options on initialization

## Usage Example

```jsx
// Inside a component
import { useTTS } from '../hooks/useTTS';

function MyComponent() {
  const { speak, stop, isSpeaking, voices, options, updateOptions } = useTTS();
  
  const handleSpeak = () => {
    speak("Hello, this is a test of the text-to-speech functionality.");
  };
  
  const handleVoiceChange = (voice) => {
    updateOptions({ voice });
  };
  
  return (
    <div>
      <button onClick={handleSpeak} disabled={isSpeaking}>
        {isSpeaking ? 'Speaking...' : 'Speak'}
      </button>
      <button onClick={stop} disabled={!isSpeaking}>
        Stop
      </button>
      
      <select onChange={(e) => handleVoiceChange(voices[e.target.value])}>
        {voices.map((voice, index) => (
          <option key={index} value={index}>
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Limitations and Considerations
- Requires browser support for the Web Speech API
- Voice availability varies by browser and operating system
- May have limited functionality on mobile devices
- Requires user interaction before audio can play (browser policy)

## Future Extensibility
The useTTS hook is designed to be extensible for future features:
- Support for SSML (Speech Synthesis Markup Language)
- Integration with cloud-based TTS services for higher quality voices
- Voice emotion and style control
- Language detection and automatic voice selection
