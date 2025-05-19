import React, { createContext, useContext, useState, useEffect } from 'react';
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
    voiceURI?: string;
    rate?: number;
    pitch?: number;
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

  useEffect(() => {
    // Check current auth status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name
        });
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
      // Preserve the user's name when updating settings
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: user?.name,
          settings
        }
      });

      if (error) {
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
      console.error('Settings update error:', error);
      throw error;
    }
  };
  
  const getUserSettings = (): UserSettings | undefined => {
    return user?.settings;
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};