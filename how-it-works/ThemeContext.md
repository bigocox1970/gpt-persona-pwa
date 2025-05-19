# Theme Context

## Overview
The ThemeContext is a React context that manages the application's theme settings, including dark/light mode and color palette preferences. It provides theme-related functionality to components throughout the application.

## File Location
`src/contexts/ThemeContext.tsx`

## Key Functionality

### Theme Management
- Toggle between dark and light modes
- Apply color palettes to the application
- Store user theme preferences
- Restore theme settings on application reload

### Theme Data
The context maintains information about the current theme:
- `isDarkMode`: Boolean indicating if dark mode is active
- `theme`: Object containing theme variables and colors
- `activePalette`: The currently selected color palette

### CSS Variable Integration
- Applies theme colors using CSS variables
- Updates the document root with theme variables
- Allows for consistent theming across the application

## Implementation Details

### State Management
- Uses React's useState to track theme state
- Uses useEffect to apply theme changes to the DOM
- Uses localStorage to persist theme preferences

### Theme Application
- Sets CSS variables on the document root element
- Adds/removes the 'dark' class on the document body
- Updates meta theme-color for mobile browsers

### Media Query Detection
- Detects user's system preference for dark/light mode
- Applies the preferred mode on first visit
- Allows user preference to override system preference

## Context Provider
- Wraps the application to provide theme functionality to all components
- Initializes by checking for saved theme preferences
- Manages theme state throughout the application lifecycle

## Context Consumer
Components can consume this context to:
- Check the current theme mode
- Toggle between dark and light modes
- Access theme colors and variables

## Usage Example

```jsx
// Inside a component
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div>
      <p>Current mode: {isDarkMode ? 'Dark' : 'Light'}</p>
      <button onClick={toggleDarkMode}>
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

## Future Extensibility
The ThemeContext is designed to be extensible for future theming features:
- Custom user-created themes
- More granular theme customization
- Theme scheduling (automatic switching based on time of day)
- Accessibility theme options
