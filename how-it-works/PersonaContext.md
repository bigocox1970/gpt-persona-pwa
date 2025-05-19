# Persona Context

## Overview
The PersonaContext is a React context that manages the available personas and the currently selected persona. It provides this data and related functionality to components throughout the application.

## File Location
`src/contexts/PersonaContext.tsx`

## Key Functionality

### Persona Management
- Loads the list of available personas
- Stores the currently selected persona
- Provides methods to select and switch between personas

### Data Structure
The Persona type includes:
- `id`: Unique identifier for the persona
- `name`: Display name of the persona (e.g., "Albert Einstein")
- `title`: Short description or title (e.g., "Theoretical Physicist")
- `description`: Longer description of the persona
- `image`: URL to the persona's image
- `systemPrompt`: Instructions for the AI to emulate this persona
- `welcomeMessage`: Initial message shown when starting a conversation

### Context Provider
- Wraps the application to provide persona data to all components
- Initializes with a default list of personas
- May fetch additional personas from an API or database

### Context Consumer
Components can consume this context to:
- Access the list of available personas
- Get the currently selected persona
- Select a new persona for conversation

## Implementation Details

### State Management
- Uses React's useState to track the current persona and list of personas
- May use useEffect to load personas from external sources

### Persistence
- May save the selected persona to localStorage or a database
- Restores the previously selected persona on application reload

### Integration Points
- Used by the PersonaSelection page to display available personas
- Used by the Chat page to get the current persona's details
- May be used by other components that need persona information

## Usage Example

```jsx
// Inside a component
import { usePersona } from '../contexts/PersonaContext';

function MyComponent() {
  const { personas, selectedPersona, selectPersona } = usePersona();
  
  return (
    <div>
      <h1>Current Persona: {selectedPersona?.name}</h1>
      <button onClick={() => selectPersona(personas[0])}>
        Switch to {personas[0].name}
      </button>
    </div>
  );
}
```

## Future Extensibility
The PersonaContext is designed to be extensible for future features:
- Adding custom user-created personas
- Categorizing personas by type or era
- Storing user preferences for specific personas
- Tracking conversation history with each persona
