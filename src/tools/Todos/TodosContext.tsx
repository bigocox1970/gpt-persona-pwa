import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  chat_id?: string;
  created_at: string;
  updated_at: string;
}

interface TodosContextType {
  todos: Todo[];
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TodosContext = createContext<TodosContextType>({
  todos: [],
  addTodo: async () => {},
  updateTodo: async () => {},
  deleteTodo: async () => {},
  isLoading: false,
  error: null,
});

export const useTodos = () => useContext(TodosContext);

export const TodosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (todo: Partial<Todo>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .insert({
          ...todo,
          user_id: user.id,
          status: todo.status || 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      setTodos(prev => [data, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setTodos(prev => prev.map(todo => todo.id === id ? data : todo));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TodosContext.Provider value={{
      todos,
      addTodo,
      updateTodo,
      deleteTodo,
      isLoading,
      error,
    }}>
      {children}
    </TodosContext.Provider>
  );
};