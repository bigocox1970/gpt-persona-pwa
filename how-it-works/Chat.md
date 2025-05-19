# Chat Page

## Overview
The Chat page is the core interaction area where users communicate with the selected AI persona. It provides a messaging interface with support for text input, voice input, and voice output.

## File Location
`src/pages/Chat.tsx`

## Key Components

### ChatHeader
- Displays the current persona's information (name, image)
- Provides navigation options and access to settings

### MessageList
- Renders the conversation history between the user and the AI persona
- Differentiates between user messages and AI responses with distinct styling
- Supports auto-scrolling to the latest message

### MessageInput
- Text input field for typing messages
- Voice input button for speech-to-text functionality
- Send button to submit messages

### TypingIndicator
- Visual indicator showing when the AI is "thinking" or generating a response

## Key Functionality

### Message Handling
- User messages are sent to the AI service (OpenAI)
- AI responses are processed and displayed with the persona's characteristics
- Messages are stored in the conversation history

### Voice Interaction
- Text-to-Speech (TTS): AI responses can be read aloud using the device's speech synthesis
- Speech-to-Text (STT): Users can dictate messages instead of typing

### Context Management
- The chat maintains context of the conversation history
- The selected persona's characteristics influence the AI's responses
- System prompts define the persona's behavior and knowledge

## State Management

The page uses several state variables:
- `messages`: Array of messages in the current conversation
- `isLoading`: Tracks when a response is being generated
- `inputValue`: Current text in the input field
- `isSpeaking`: Indicates if TTS is currently active
- `isListening`: Tracks if STT is currently capturing audio

## Integration with Contexts

- **PersonaContext**: Provides the selected persona's details and characteristics
- **AuthContext**: Ensures the user is authenticated and manages user-specific data
- **TTS/STT Hooks**: Provides voice input and output functionality

## Data Persistence
- Conversations are saved to the database (Supabase)
- Users can resume conversations from previous sessions
- Message history is associated with specific user-persona pairs

## Responsive Design
- Adapts to different screen sizes from mobile to desktop
- Optimizes the chat interface for touch interactions on mobile devices
- Maintains readability and usability across devices
