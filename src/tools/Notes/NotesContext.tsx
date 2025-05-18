import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Note {
  id: string;
  content: string;
  chat_id?: string;
  message_id?: string;
  created_at: string;
  updated_at: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (content: string, chatId?: string, messageId?: string) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const NotesContext = createContext<NotesContextType>({
  notes: [],
  addNote: async () => {},
  updateNote: async () => {},
  deleteNote: async () => {},
  isLoading: false,
  error: null,
});

export const useNotes = () => useContext(NotesContext);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (content: string, chatId?: string, messageId?: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          content,
          chat_id: chatId,
          message_id: messageId,
        })
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => [data, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (id: string, content: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .update({ content })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => prev.map(note => note.id === id ? data : note));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotesContext.Provider value={{
      notes,
      addNote,
      updateNote,
      deleteNote,
      isLoading,
      error,
    }}>
      {children}
    </NotesContext.Provider>
  );
};