# Speech-to-Text (STT) Implementation

## Overview

The speech-to-text functionality in the chat interface uses the Web Speech API's `SpeechRecognition` interface to enable voice input. This is implemented through a custom React hook `useSTT` that manages the speech recognition lifecycle and state.

## Key Components

### 1. useSTT Hook (src/hooks/useSTT.tsx)

The core functionality is encapsulated in a custom hook that provides:
- Speech recognition initialization and cleanup
- Microphone stream management
- State management for transcripts and listening status
- Error handling and recovery
- Event handling for speech recognition events

### 2. Chat Interface Integration (src/components/Chat/ChatInterface.tsx)

The chat interface uses the useSTT hook to:
- Toggle voice input on/off
- Display listening status
- Update input field with transcribed text
- Handle errors and user feedback

## Technical Implementation

### Speech Recognition Lifecycle

1. **Initialization**
   - Creates a new SpeechRecognition instance
   - Configures language and recognition options
   - Sets up event handlers for various recognition states
   - Initializes media stream management

2. **Starting Recognition**
   ```typescript
   const startListening = async () => {
     // Clean up any existing streams
     // Request microphone permissions
     // Start recognition
     // Handle errors and recovery
   }
   ```

3. **Stopping Recognition**
   ```typescript
   const stopListening = () => {
     // Stop recognition
     // Clean up media streams
     // Reset states
   }
   ```

### Media Stream Management

The implementation carefully manages media streams to ensure proper cleanup:
- Tracks are stopped when recognition ends
- Streams are cleaned up on errors
- Resources are released when component unmounts

### Error Handling and Recovery

The system includes robust error handling:
1. Microphone permission errors
2. Recognition errors
3. Network or system errors
4. Automatic recovery attempts for certain error types

### State Management

Several states are managed:
- `isListening`: Current recognition status
- `transcript`: Current interim transcript
- `finalTranscript`: Completed speech segments
- `error`: Any error states
- `recognition`: The recognition instance

## Usage in Chat Interface

1. **Activation**
   - User clicks microphone button
   - Permission requested if needed
   - Recognition starts
   - UI updates to show active state

2. **During Recognition**
   - Interim results update input field
   - Final results trigger input updates
   - Error states are handled and displayed

3. **Deactivation**
   - User clicks microphone again
   - Recognition stops
   - Resources are cleaned up
   - UI returns to inactive state

## Best Practices Implemented

1. **Resource Management**
   - Proper cleanup of media streams
   - Event listener cleanup
   - State reset on unmount

2. **Error Recovery**
   - Automatic retry on certain errors
   - Clear error messaging
   - Graceful fallback behaviors

3. **User Experience**
   - Visual feedback for status
   - Clear error messages
   - Smooth state transitions

4. **Performance**
   - Efficient cleanup between uses
   - Proper memory management
   - Optimized re-renders

## Browser Support

The implementation supports:
- Chrome/Edge (SpeechRecognition)
- Safari/iOS (webkitSpeechRecognition)
- Fallback messaging for unsupported browsers

## Security Considerations

1. **Permissions**
   - Explicit microphone permission requests
   - Clear user feedback about permission status
   - Proper error handling for denied permissions

2. **Data Handling**
   - Local processing of voice input
   - Clear feedback when recording
   - Immediate cleanup of resources

## Future Improvements

Potential areas for enhancement:
1. Offline support
2. Multiple language support
3. Enhanced error recovery
4. Background noise handling
5. Alternative voice input methods
