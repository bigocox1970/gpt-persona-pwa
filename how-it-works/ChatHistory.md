# Chat History Page

## Overview
The Chat History page displays a list of previous conversations the user has had with different personas. It allows users to browse, resume, or delete past conversations.

## File Location
`src/pages/ChatHistory.tsx`

## Key Components

### History List
- Displays a list of previous conversations
- Shows the persona name, date, and preview of the last message
- Sorts conversations by most recent first

### Conversation Item
- Individual entry for each conversation
- Displays persona image, name, and timestamp
- Shows a snippet of the last message
- Includes options to resume or delete the conversation

### Empty State
- Displayed when the user has no previous conversations
- Provides guidance on how to start a new conversation

## Key Functionality

### Conversation Management
- Load conversation history from the database
- Group conversations by persona
- Sort conversations by date
- Filter conversations by persona (optional)

### Navigation
- Resume a conversation by clicking on a history item
- Navigate back to the persona selection page
- Access settings or other app features

### Data Operations
- Delete individual conversations
- Clear all conversation history (with confirmation)
- Refresh history list after operations

## State Management

The page uses several state variables:
- `conversations`: Array of conversation history items
- `isLoading`: Indicates when history is being fetched
- `selectedFilter`: Tracks any active filters for the history list
- `showConfirmDelete`: Controls visibility of delete confirmation dialog

## Integration with Contexts

- **AuthContext**: Ensures the user is authenticated and retrieves user-specific history
- **PersonaContext**: Provides persona details for the conversation history items

## Data Persistence
- Conversation history is stored in the database (Supabase)
- History is associated with the specific user account
- Deleted conversations are permanently removed from storage

## Responsive Design
- Adapts to different screen sizes
- Optimizes list view for mobile devices
- Maintains usability across different device types
