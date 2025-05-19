# Notes Page

## Overview
The Notes Page provides a simple note-taking functionality within the application. It allows users to create, edit, view, and delete text notes that can be used alongside their chat conversations.

## File Location
`src/tools/Notes/NotesPage.tsx`

## Key Components

### Note List
- Displays all saved notes in a scrollable list
- Shows note titles and previews of content
- Sorts notes by most recently modified
- Allows selection of notes for viewing/editing

### Note Editor
- Text editor for creating and modifying notes
- Rich text formatting options (optional)
- Auto-save functionality
- Character/word count (optional)

### Note Controls
- Create new note button
- Delete note button
- Search/filter notes functionality
- Sort options (by date, title, etc.)

## Key Functionality

### Note Management
- Create new notes
- Edit existing notes
- Delete unwanted notes
- Search through note content

### Data Persistence
- Notes are saved to the database (Supabase)
- Changes are synchronized across devices
- Offline support with local storage backup

### Integration with Chat
- Option to share notes in chat conversations
- Ability to create notes from chat content
- References to personas in notes

## Implementation Details

### State Management
- Uses NotesContext for global notes state
- Local component state for editor functionality
- Optimistic UI updates for better user experience

### Data Structure
Each note typically contains:
- `id`: Unique identifier
- `title`: Note title
- `content`: Note body text
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp
- `userId`: Owner of the note

### Responsive Design
- Adapts layout based on screen size
- List view for mobile devices
- Side-by-side list and editor for larger screens

## Integration with NotesContext

The NotesPage consumes the NotesContext to:
- Fetch all notes for the current user
- Add new notes to the database
- Update existing notes
- Delete notes from the database

## Future Extensibility
The Notes functionality is designed to be extensible for future features:
- Rich text formatting
- Image and file attachments
- Note categories/tags
- Collaborative notes
- Export/import functionality
- Voice notes integration
