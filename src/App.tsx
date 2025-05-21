import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Chat from './pages/Chat';
import PersonaSelection from './pages/PersonaSelection';
import Settings from './pages/Settings';
import Login from './pages/Login';
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
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <PersonaSelection />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <Chat />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tools" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <ToolsPage 
                  onSelectNotes={() => navigate('/notes')}
                  onSelectTodos={() => navigate('/todos')}
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/notes" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <NotesPage onClose={() => navigate(-1)} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/todos" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <TodosPage onClose={() => navigate(-1)} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <Layout onToolsClick={() => navigate('/tools')}>
                <ChatHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { getUserSettings, fetchUserSettings } = useAuth();
  
  // Refresh settings when app becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserSettings();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUserSettings]);

  // Initialize settings on app load
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Load settings from Supabase
        const userSettings = getUserSettings();
        if (userSettings) {
          // Initialize theme settings
          if (userSettings.theme) {
            localStorage.setItem('activePalette', String(userSettings.theme.activePalette));
          }

          // Initialize TTS settings
          if (userSettings.tts) {
            localStorage.setItem('tts_settings', JSON.stringify({
              useOpenAI: userSettings.tts.openaiTTS,
              openaiVoice: userSettings.tts.openaiVoice,
              openaiModel: userSettings.tts.openaiModel,
              rate: userSettings.tts.rate,
              pitch: userSettings.tts.pitch
            }));
          }

          // Initialize STT settings
          if (userSettings.stt) {
            localStorage.setItem('stt_settings', JSON.stringify({
              language: userSettings.stt.language
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
      }
    };

    initializeSettings();
  }, [getUserSettings]);

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
