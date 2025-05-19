# Todos Context

## Overview
The TodosContext is a React context that manages the state and operations for the Todos functionality across the application. It provides methods for creating, reading, updating, and deleting tasks, as well as synchronizing with the database.

## File Location
`src/tools/Todos/TodosContext.tsx`

## Key Functionality

### Task Management
- Fetch all todos for the current user
- Create new todos
- Update existing todos (completion status, details)
- Delete todos
- Filter and sort todos

### Data Structure
Each todo typically contains:
- `id`: Unique identifier
- `title`: Task description
- `completed`: Boolean completion status
- `dueDate`: Optional due date
- `priority`: Optional priority level
- `createdAt`: Creation timestamp
- `userId`: Owner of the task

### State Management
The context maintains several pieces of state:
- `todos`: Array of all user todos
- `isLoading`: Boolean indicating if todos are being fetched
- `error`: Any error that occurred during operations
- `filter`: Current filter applied to the todos list

## Implementation Details

### Database Integration
- Uses Supabase for data storage and retrieval
- Implements real-time subscription for live updates
- Handles offline/online synchronization

### Authentication Integration
- Connects with AuthContext to get the current user
- Ensures todos are associated with the correct user
- Implements permission checks for todo operations

### Optimization Techniques
- Implements caching for better performance
- Uses optimistic UI updates for immediate feedback
- Batches database operations when possible

## Context Provider
- Wraps the application (or relevant parts) to provide todos functionality
- Initializes by fetching todos from the database
- Manages the todos state throughout the application lifecycle

## Context Consumer
Components can consume this context to:
- Access the list of todos
- Perform CRUD operations on todos
- Apply filters and sorting
- Get the loading and error states

## Usage Example

```jsx
// Inside a component
import { useTodos } from '../tools/Todos/TodosContext';

function MyComponent() {
  const { 
    todos, 
    isLoading, 
    createTodo, 
    updateTodo, 
    deleteTodo, 
    toggleComplete,
    setFilter
  } = useTodos();
  
  const handleCreateTodo = () => {
    createTodo({ title: 'New task', completed: false });
  };
  
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  return (
    <div>
      <button onClick={handleCreateTodo}>Add New Task</button>
      
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          <h2>Active Tasks ({activeTodos.length})</h2>
          <ul>
            {activeTodos.map(todo => (
              <li key={todo.id}>
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => toggleComplete(todo.id, !todo.completed)} 
                />
                <span>{todo.title}</span>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </li>
            ))}
          </ul>
          
          <h2>Completed Tasks ({completedTodos.length})</h2>
          <ul>
            {completedTodos.map(todo => (
              <li key={todo.id}>
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => toggleComplete(todo.id, !todo.completed)} 
                />
                <span style={{ textDecoration: 'line-through' }}>{todo.title}</span>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

## Future Extensibility
The TodosContext is designed to be extensible for future features:
- Task categories and tags
- Advanced filtering and sorting options
- Task statistics and productivity metrics
- Recurring task management
- Task prioritization algorithms
- Integration with calendar and reminders
