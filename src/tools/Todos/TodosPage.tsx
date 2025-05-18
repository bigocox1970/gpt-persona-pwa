import React, { useState, useEffect } from 'react';
import { useTodos, Todo } from './TodosContext';
import { format } from 'date-fns';
import { X, Trash2, Save, Plus, Calendar, CheckCircle, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSTT } from '../../hooks/useSTT';

const TodosPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { todos, addTodo, updateTodo, deleteTodo, isLoading } = useTodos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [committedDescription, setCommittedDescription] = useState('');

  const { startListening, stopListening, transcript, finalTranscript, isListening, error, clearTranscripts } = useSTT();

  useEffect(() => {
    if (isListening && transcript) {
      setNewTodo(prev => ({ ...prev, description: transcript }));
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (finalTranscript) {
      setCommittedDescription(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
      clearTranscripts();
    }
  }, [finalTranscript]);

  useEffect(() => {
    if (!showAddForm) {
      setCommittedDescription('');
    }
  }, [showAddForm]);

  // Auto-populate title with first few words of description if title is empty
  useEffect(() => {
    if (!newTodo.title && committedDescription) {
      const autoTitle = committedDescription.trim().split(/\s+/).slice(0, 5).join(' ');
      setNewTodo(prev => ({ ...prev, title: autoTitle }));
    }
  }, [committedDescription]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    let title = newTodo.title.trim();
    const description = committedDescription.trim();
    if (!title && description) {
      title = description.split(/\s+/).slice(0, 5).join(' ');
    }
    if (!title) return;
    await addTodo({
      title,
      description,
      due_date: newTodo.due_date || undefined,
      status: 'pending',
    });
    setNewTodo({ title: '', description: '', due_date: '' });
    setCommittedDescription('');
    setShowAddForm(false);
  };

  const handleStatusChange = async (todo: Todo, status: Todo['status']) => {
    await updateTodo(todo.id, { status });
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-[var(--success-color)] text-[var(--background-primary)]';
      case 'in_progress':
        return 'bg-[var(--warning-color)] text-[var(--background-primary)]';
      default:
        return 'bg-[var(--secondary-color)] text-[var(--text-primary)]';
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--text-primary)]/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-[var(--secondary-color)] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Todo List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--primary-color)]/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[var(--secondary-color)]">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Todo
            </button>
          ) : (
            <form onSubmit={handleAddTodo} className="space-y-4">
              <input
                type="text"
                value={newTodo.title}
                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Todo title..."
                className="input"
              />
              <textarea
                value={committedDescription + (isListening && transcript ? transcript : '')}
                onChange={(e) => {
                  setCommittedDescription(e.target.value);
                  setNewTodo(prev => ({ ...prev, description: e.target.value }));
                }}
                placeholder="Description (optional)"
                className="input min-h-[100px]"
              />
              <button
                type="button"
                className={`p-2 rounded-full ml-2 ${isListening ? 'bg-[var(--error-color)] text-[var(--background-primary)]' : 'bg-[var(--secondary-color)] text-[var(--text-primary)]'}`}
                onClick={isListening ? stopListening : startListening}
                tabIndex={-1}
                aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              {isListening && (
                <div className="text-xs text-center mt-2 text-[var(--text-secondary)]">
                  Listening... Tap the microphone to stop.
                </div>
              )}
              {error && (
                <div className="text-xs text-center mt-2 text-[var(--error-color)]">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newTodo.due_date}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, due_date: e.target.value }))}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setCommittedDescription(''); }}
                  className="btn bg-[var(--secondary-color)] text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTodo.title.trim() || isLoading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Todo
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[var(--background-primary)] dark:bg-[var(--background-primary)] rounded-lg p-4 mb-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1 text-[var(--text-primary)]">{todo.title}</h3>
                    {todo.description && (
                      <p className="text-[var(--text-secondary)] mb-2">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                        {todo.status.replace('_', ' ')}
                      </span>
                      {todo.due_date && (
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Calendar size={14} />
                          {format(new Date(todo.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(todo, 'completed')}
                      className={`p-1 rounded ${
                        todo.status === 'completed'
                          ? 'text-[var(--success-color)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--success-color)]'
                      }`}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 hover:bg-[var(--primary-color)]/10 rounded text-[var(--error-color)]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TodosPage;