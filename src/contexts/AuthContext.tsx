import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  settings?: UserSettings;
}

interface UserSettings {
  theme?: {
    activePalette?: number;
    isDarkMode?: boolean;
  };
  tts?: {
    // Store voice preferences instead of exact URI
    voiceLanguage?: string;  // e.g., 'en-US', 'en-GB'
    voiceName?: string;      // Name of the voice for matching
    voiceGender?: string;    // 'male' or 'female' if available
    rate?: number;
    pitch?: number;
    openaiTTS?: boolean; // Whether to use OpenAI TTS
    openaiVoice?: "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy";
    openaiModel?: "tts-1" | "tts-1-hd";
  };
  stt?: {
    language?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  saveUserSettings: (settings: UserSettings) => Promise<void>;
  getUserSettings: () => UserSettings | undefined;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updatePassword: async () => {},
  updateUserProfile: async () => {},
  saveUserSettings: async () => {},
  getUserSettings: () => undefined,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current auth status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Extract user metadata
        const metadata = session.user.user_metadata;
        
        // Reconstruct settings object from flattened metadata
        const settings: UserSettings = {
          theme: {
            activePalette: metadata.theme_palette,
            isDarkMode: metadata.theme_dark_mode
          },
          tts: {
            voiceLanguage: metadata.tts_voice_language,
            voiceName: metadata.tts_voice_name,
            voiceGender: metadata.tts_voice_gender,
            rate: metadata.tts_rate,
            pitch: metadata.tts_pitch,
            openaiTTS: metadata.tts_openai_tts === true || metadata.tts_openai_tts === 'true',
            openaiVoice: metadata.tts_openai_voice as "nova" | "shimmer" | "echo" | "onyx" | "fable" | "alloy" || "nova",
            openaiModel: metadata.tts_openai_model as "tts-1" | "tts-1-hd" || "tts-1",
          },
          stt: {
            language: metadata.stt_language
          }
        };
        
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: metadata.name,
          settings: settings
        });
        
        console.log('Loaded user settings from Supabase:', settings);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updatePassword = async (_currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (name: string) => {
    try {
      // Keep existing settings when updating name
      const currentData = user?.settings || {};
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          name,
          settings: currentData
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          name
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };
  
  const saveUserSettings = async (settings: UserSettings) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Log for debugging
      console.log('Saving user settings:', settings);
      
      // Flatten the settings structure to avoid nesting issues
      const userData = {
        name: user.name,
        theme_palette: settings.theme?.activePalette,
        theme_dark_mode: settings.theme?.isDarkMode,
        tts_voice_language: settings.tts?.voiceLanguage,
        tts_voice_name: settings.tts?.voiceName,
        tts_voice_gender: settings.tts?.voiceGender,
        tts_rate: settings.tts?.rate,
        tts_pitch: settings.tts?.pitch,
        tts_openai_tts: settings.tts?.openaiTTS ?? false,
        tts_openai_voice: settings.tts?.openaiVoice || "nova",
        tts_openai_model: settings.tts?.openaiModel || "tts-1",
        stt_language: settings.stt?.language
      };
      
      console.log('Sending user data to Supabase:', userData);
      
      // Update user metadata with flattened structure
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });

      console.log('Supabase response:', data);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          settings
        });
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  };
  
  const getUserSettings = (): UserSettings | undefined => {
    return user?.settings;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updatePassword,
        updateUserProfile,
        saveUserSettings,
        getUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
