# GPT Persona PWA Documentation

This directory contains documentation for the GPT Persona PWA, explaining how each page and function of the application works.

## Application Overview

GPT Persona is a Progressive Web Application (PWA) that allows users to chat with different AI personas. The app includes features like:

- Persona selection with a card-based UI
- Chat functionality with AI personas
- User authentication
- Theme customization
- Voice input and output capabilities
- Additional tools like Notes and Todos

## Documentation Structure

The documentation is organized into separate markdown files for each major component of the application:

### Pages
- [PersonaSelection.md](./pages/PersonaSelection.md) - The persona selection page
- [Chat.md](./pages/Chat.md) - The main chat interface
- [ChatHistory.md](./pages/ChatHistory.md) - Chat history page
- [Settings.md](./pages/Settings.md) - Settings page
- [Login.md](./pages/Login.md) - Login page

### Contexts
- [PersonaContext.md](./contexts/PersonaContext.md) - Manages persona data and selection
- [AuthContext.md](./contexts/AuthContext.md) - Handles user authentication
- [ThemeContext.md](./contexts/ThemeContext.md) - Manages theme settings

### Hooks
- [useTTS.md](./hooks/useTTS.md) - Text-to-Speech functionality
- [useSTT.md](./hooks/useSTT.md) - Speech-to-Text functionality

### Tools
- [ToolsPage.md](./tools/ToolsPage.md) - Main tools page
- [NotesPage.md](./tools/NotesPage.md) - Notes functionality
- [TodosPage.md](./tools/TodosPage.md) - Todos functionality

## Application Architecture

The application follows a modular architecture with:

1. **Pages** - React components that represent full pages in the application
2. **Contexts** - React contexts that provide state management across components
3. **Hooks** - Custom React hooks that encapsulate reusable logic
4. **Components** - Reusable UI components
5. **Tools** - Additional functionality like Notes and Todos

This modular approach makes it easier to maintain and extend the application as it grows in complexity.
