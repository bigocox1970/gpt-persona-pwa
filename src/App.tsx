import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Chat from './pages/Chat';
import PersonaSelection from './pages/PersonaSelection';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PersonaProvider } from './contexts/PersonaContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotesProvider } from './tools/Notes/NotesContext';
import { TodosProvider } from './tools/Todos/TodosContext';
import NotesPage from './tools/Notes/NotesPage';
import TodosPage from './tools/Todos/TodosPage';
import ToolsPage from './tools/ToolsPage';
import ChatHistory from './pages/ChatHistory';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return isAuthenticated ? <>{children}</> : null;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showTools, setShowTools] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTodos, setShowTodos] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  // Store the previous location before opening tools
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);

  const handleToolsClick = () => {
    // Store current location before showing tools
    setPreviousLocation(location.pathname);
    // Show tools overlay
    setShowTools(true);
    setShowNotes(false);
    setShowTodos(false);
    setShowHistory(false);
  };

  const handleClose = () => {
    // Close all tool overlays
    setShowTools(false);
    setShowNotes(false);
    setShowTodos(false);
    setShowHistory(false);
    
    // If we have a previous location stored, navigate back to it
    if (previousLocation) {
      navigate(previousLocation);
    }
  };
  


  return (
    <>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/personas" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/personas" /> : <Login />} />
        <Route 
          path="/personas" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={handleToolsClick}>
                <PersonaSelection />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={handleToolsClick}>
                <Chat />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={handleToolsClick}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showTools && <ToolsPage 
        onClose={handleClose} 
        onSelectNotes={() => {
          setShowTools(false);
          setShowNotes(true);
        }} 
        onSelectTodos={() => {
          setShowTools(false);
          setShowTodos(true);
        }}
        onSelectHistory={() => {
          setShowTools(false);
          setShowHistory(true);
        }}
      />}
      {showNotes && <NotesPage onClose={handleClose} />}
      {showTodos && <TodosPage onClose={handleClose} />}
      {showHistory && <ChatHistory onClose={handleClose} />}
    </>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceWorker.js')
          .then(() => {
            console.log('ServiceWorker registration successful');
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }

    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <PersonaProvider>
          <NotesProvider>
            <TodosProvider>
              {!isOnline && (
                <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-1 text-center text-sm z-50">
                  You are currently offline. Some features may be limited.
                </div>
              )}
              <AppRoutes />
            </TodosProvider>
          </NotesProvider>
        </PersonaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;