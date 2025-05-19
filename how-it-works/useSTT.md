# useSTT Hook (Speech-to-Text)

## Overview
The useSTT hook provides Speech-to-Text functionality for the application, allowing users to dictate messages instead of typing. It wraps the Web Speech API's SpeechRecognition interface in a convenient React hook.

## File Location
`src/hooks/useSTT.tsx`

## Key Functionality

### Voice Recognition
- Convert spoken words to text
- Start and stop voice recognition
- Handle recognition results and errors
- Support for multiple languages

### Recognition Options
The hook provides access to and control over recognition parameters:
- `language`: The language to use for speech recognition
- `continuous`: Whether to continuously recognize speech
- `interimResults`: Whether to return interim results before final recognition

### Control Functions
- `start`: Function to begin speech recognition
- `stop`: Function to stop speech recognition
- `isListening`: Boolean indicating if recognition is currently active
- `transcript`: The current recognized text
- `clearTranscript`: Function to clear the current transcript

## Implementation Details

### Web Speech API Integration
- Uses the browser's SpeechRecognition API
- Handles browser compatibility issues
- Provides a consistent interface across browsers

### State Management
- Uses React's useState to track recognition state and results
- Uses useEffect to initialize and manage speech recognition
- Provides callbacks for recognition events (result, error, end)

### Options Persistence
- Saves language preferences to localStorage
- Restores previously selected language on initialization

## Usage Example

```jsx
// Inside a component
import { useSTT } from '../hooks/useSTT';

function MyComponent() {
  const { start, stop, isListening, transcript, clearTranscript, updateOptions } = useSTT();
  
  const handleToggleListening = () => {
    if (isListening) {
      stop();
    } else {
      clearTranscript();
      start();
    }
  };
  
  const handleLanguageChange = (language) => {
    updateOptions({ language });
  };
  
  return (
    <div>
      <button onClick={handleToggleListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      
      <select onChange={(e) => handleLanguageChange(e.target.value)}>
        <option value="en-US">English (US)</option>
        <option value="en-GB">English (UK)</option>
        <option value="es-ES">Spanish</option>
        <option value="fr-FR">French</option>
      </select>
      
      <div>
        <p>Transcript: {transcript}</p>
      </div>
    </div>
  );
}
```

## Limitations and Considerations
- Requires browser support for the Web Speech API
- Recognition quality varies by browser and device
- May have limited language support depending on the browser
- Requires user permission to access the microphone
- Works best with a good quality microphone and minimal background noise

## Future Extensibility
The useSTT hook is designed to be extensible for future features:
- Improved noise cancellation
- Speaker identification
- Dialect and accent recognition
- Integration with cloud-based STT services for higher accuracy
- Command recognition for voice control of the application
