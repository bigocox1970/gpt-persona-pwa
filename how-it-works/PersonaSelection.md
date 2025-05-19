# Persona Selection Page

## Overview
The Persona Selection page is the entry point for users to browse and select different AI personas to chat with. It features a card-based interface with smooth animations for browsing through available personas.

## File Location
`src/pages/PersonaSelection.tsx`

## Key Components

### WelcomeCard
- **Purpose**: Serves as an introduction screen before showing the persona selection cards
- **Features**:
  - Displays a splash image
  - Shows the title "AI with Personality"
  - Provides a brief description of the application
  - Includes a "Browse Personas" button to proceed to persona selection

### PersonaCard
- **Purpose**: Displays information about each persona
- **Features**:
  - Shows the persona's image as a background
  - Displays the persona's name, title, and description
  - Includes a "Start Conversation" button to begin chatting with the selected persona
  - Has a gradient overlay for better text readability

## Key Functionality

### Card Navigation
- Users can navigate between persona cards using:
  - Left/right arrow buttons on the screen
  - Keyboard arrow keys
  - Touch swipe gestures on mobile devices
- The navigation includes a 3D flip animation when transitioning between cards

### Card Selection
- When a user selects a persona:
  - The `selectPersona` function from the PersonaContext is called
  - The user is navigated to the Chat page
  - The selected persona becomes the active conversation partner

## State Management

The page uses several state variables:
- `showWelcome`: Controls whether to show the welcome card or persona cards
- `currentIndex`: Tracks the currently displayed persona card
- `isFlipping`: Manages the card flip animation state
- `flipDirection`: Determines the direction of the flip animation ('left' or 'right')
- `nextIndex`: Stores the index of the next card to be displayed

## Animations

The page includes several animations:
- 3D card flip effect when navigating between personas
- Smooth transitions for buttons and interactive elements

## Responsive Design
The page is fully responsive and adapts to different screen sizes:
- On smaller screens, the cards take up more of the available space
- Touch controls are optimized for mobile use
- Visual elements scale appropriately for different device sizes
