import React, { useState } from 'react';
import { useNotes } from './NotesContext';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Save, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotesPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useNotes();
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addNote(newNote);
    setNewNote('');
  };

  const handleStartEdit = (note: { id: string; content: string }) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (id: string) => {
    await updateNote(id, editContent);
    setEditingId(null);
    setEditContent('');
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
          <h2 className="text-xl font-semibold">Notes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new note..."
              className="flex-1 input"
            />
            <button
              type="submit"
              disabled={!newNote.trim() || isLoading}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Note
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4"
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full input min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn bg-gray-200 dark:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{note.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default NotesPage;