# Settings Page

## Overview
The Settings page allows users to customize their experience with the application, including theme preferences, voice settings, and account management.

## File Location
`src/pages/Settings.tsx`

## Key Components

### Account Settings
- Displays user information (name, email)
- Provides password change functionality
- Includes logout option

### Voice Output Settings
- Voice selection dropdown for Text-to-Speech (TTS)
- Speech rate adjustment slider
- Pitch adjustment slider
- Test button to preview the selected voice settings

### Voice Input Settings
- Language selection for Speech-to-Text (STT)
- Supports multiple languages for voice recognition

### Display Settings
- Dark mode toggle switch
- Color theme selection with visual previews
- Multiple theme presets (Sunset, Earthy, Green Tea, Sand & Sky)

### Save Button
- Appears when changes have been made but not saved
- Allows users to explicitly save their settings

## Key Functionality

### Theme Management
- Toggle between light and dark mode
- Select from predefined color palettes
- Preview theme colors before applying
- Save theme preferences to localStorage

### Voice Configuration
- Configure Text-to-Speech voice, rate, and pitch
- Test voice settings with sample text
- Select language for Speech-to-Text recognition
- Save voice preferences for future sessions

### Password Management
- Change account password with current password verification
- Form validation for password requirements
- Success/error feedback for password change attempts

### Settings Persistence
- Track unsaved changes to alert users before navigating away
- Save settings to localStorage and/or database
- Confirmation dialog when attempting to leave with unsaved changes

## State Management

The page uses several state variables:
- `isDarkMode`: Tracks the current theme mode
- `activePalette`: Stores the selected color palette index
- `initialPalette`: Keeps track of the saved palette for change detection
- `hasUnsavedChanges`: Indicates if there are unsaved settings
- `showConfirmDialog`: Controls the visibility of the confirmation dialog
- Voice-related states for TTS and STT configuration

## Navigation Handling

- Intercepts navigation attempts when there are unsaved changes
- Provides options to save changes, discard changes, or cancel navigation
- Uses the browser's beforeunload event to catch page refreshes/closes

## Responsive Design
- Adapts to different screen sizes
- Maintains usability on mobile devices
- Optimizes form controls for touch interaction
