import React, { useState } from 'react';
import { useTodos, Todo } from './TodosContext';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Save, Plus, Calendar, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TodosPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { todos, addTodo, updateTodo, deleteTodo, isLoading } = useTodos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    await addTodo({
      title: newTodo.title,
      description: newTodo.description,
      due_date: newTodo.due_date || undefined,
      status: 'pending',
    });

    setNewTodo({ title: '', description: '', due_date: '' });
    setShowAddForm(false);
  };

  const handleStatusChange = async (todo: Todo, status: Todo['status']) => {
    await updateTodo(todo.id, { status });
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Todo List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                value={newTodo.description}
                onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                className="input min-h-[100px]"
              />
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
                  onClick={() => setShowAddForm(false)}
                  className="btn bg-gray-200 dark:bg-gray-600"
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
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">{todo.title}</h3>
                    {todo.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                        {todo.status.replace('_', ' ')}
                      </span>
                      {todo.due_date && (
                        <span className="flex items-center gap-1 text-gray-500">
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
                          ? 'text-green-500'
                          : 'text-gray-400 hover:text-green-500'
                      }`}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500"
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