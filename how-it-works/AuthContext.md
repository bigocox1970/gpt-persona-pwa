# Auth Context

## Overview
The AuthContext is a React context that manages user authentication state and provides authentication-related functionality throughout the application. It handles user login, registration, logout, and session management.

## File Location
`src/contexts/AuthContext.tsx`

## Key Functionality

### Authentication Management
- User login with email and password
- User registration (sign up)
- Password reset functionality
- Session persistence across page reloads
- User logout

### User Data
The context maintains information about the authenticated user:
- `user`: Object containing user details (id, email, name)
- `isAuthenticated`: Boolean indicating if a user is currently logged in
- `isLoading`: Boolean indicating if an authentication operation is in progress

### Protected Routes
- Provides a mechanism to protect routes that require authentication
- Redirects unauthenticated users to the login page
- Prevents authenticated users from accessing the login page again

## Implementation Details

### Integration with Supabase
- Uses Supabase Auth for authentication services
- Manages JWT tokens for secure API access
- Handles authentication errors and provides meaningful feedback

### State Management
- Uses React's useState to track authentication state
- Uses useEffect to check for existing sessions on application load
- Provides loading states during authentication operations

### Security Considerations
- Secure handling of user credentials
- Token-based authentication
- Session timeout handling
- Protection against common security vulnerabilities

## Context Provider
- Wraps the application to provide authentication functionality to all components
- Initializes by checking for an existing authenticated session
- Manages the authentication state throughout the application lifecycle

## Context Consumer
Components can consume this context to:
- Access the current user's information
- Check if a user is authenticated
- Perform authentication operations (login, logout, etc.)

## Usage Example

```jsx
// Inside a component
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Handle successful login
    } catch (error) {
      // Handle login error
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
}
```

## Future Extensibility
The AuthContext is designed to be extensible for future authentication features:
- Social login integration (Google, Facebook, etc.)
- Two-factor authentication
- Role-based access control
- User profile management
