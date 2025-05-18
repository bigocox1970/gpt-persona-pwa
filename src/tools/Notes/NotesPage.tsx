import React, { useState, useEffect } from 'react';
import { useNotes } from './NotesContext';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Save, Plus, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSTT } from '../../hooks/useSTT';

const NotesPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useNotes();
  const [committedNote, setCommittedNote] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { startListening, stopListening, transcript, finalTranscript, isListening, error, clearTranscripts } = useSTT();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!committedNote.trim()) return;
    let title = newNoteTitle.trim();
    if (!title && committedNote.trim()) {
      title = committedNote.trim().split(/\s+/).slice(0, 5).join(' ');
    }
    await addNote(committedNote, title);
    setNewNoteTitle('');
    setCommittedNote('');
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

  useEffect(() => {
    if (finalTranscript) {
      setCommittedNote(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
      clearTranscripts();
    }
  }, [finalTranscript]);

  // Auto-populate newNoteTitle with first few words of committedNote if title is empty
  useEffect(() => {
    if (!newNoteTitle && committedNote) {
      const autoTitle = committedNote.trim().split(/\s+/).slice(0, 5).join(' ');
      setNewNoteTitle(autoTitle);
    }
  }, [committedNote]);

  return (
    <div className="fixed inset-0 bg-[var(--text-primary)]/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-[var(--secondary-color)] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Notes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--primary-color)]/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[var(--secondary-color)]">
          <form onSubmit={handleAddNote} className="flex flex-col gap-2 items-stretch">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note title (optional)"
              className="input"
            />
            <div className="flex gap-2 items-center">
              <button
                type="button"
                className={`p-2 rounded-full ${isListening ? 'bg-[var(--error-color)] text-[var(--background-primary)]' : 'bg-[var(--secondary-color)] text-[var(--text-primary)]'}`}
                onClick={isListening ? stopListening : startListening}
                tabIndex={-1}
                aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input
                type="text"
                value={committedNote + (isListening && transcript ? transcript : '')}
                onChange={e => setCommittedNote(e.target.value)}
                placeholder="Add a new note..."
                className="flex-1 input"
              />
              <button
                type="submit"
                disabled={!committedNote.trim() || isLoading}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Note
              </button>
            </div>
          </form>
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
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[var(--background-primary)] dark:bg-[var(--background-primary)] rounded-lg p-4 mb-4"
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
                        className="btn bg-[var(--secondary-color)] text-[var(--text-primary)]"
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
                    <p className="text-[var(--text-primary)] mb-2">{note.content}</p>
                    <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                      <span>{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1 hover:bg-[var(--primary-color)]/10 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 hover:bg-[var(--primary-color)]/10 rounded text-[var(--error-color)]"
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