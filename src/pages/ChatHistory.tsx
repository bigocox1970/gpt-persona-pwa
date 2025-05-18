import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatSession {
  id: string;
  created_at: string;
  persona_id: string;
  last_message_at: string;
  persona: {
    id: string;
    name: string;
    title: string;
    description: string;
    image_url: string;
  };
  messages: {
    id: string;
    content: string;
    sender: string;
    created_at: string;
  }[];
}

const ChatHistory: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data: sessions, error: sessionsError } = await supabase
          .from('chat_sessions')
          .select(`
            *,
            persona:personas(*),
            messages:messages(*)
          `)
          .eq('user_id', user.id)
          .order('last_message_at', { ascending: false });

        if (sessionsError) throw sessionsError;
        setChatSessions(sessions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [user]);

  const formatMessagePreview = (messages: ChatSession['messages']) => {
    if (!messages.length) return 'No messages';
    return messages[messages.length - 1].content.slice(0, 100) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chat History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : chatSessions.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
              No chat history found
            </div>
          ) : (
            <div className="space-y-6">
              {chatSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden"
                >
                  <div className="flex items-start p-4">
                    <img
                      src={session.persona.image_url}
                      alt={session.persona.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        {session.persona.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {session.persona.title}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(session.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          {session.messages.length} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatMessagePreview(session.messages)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Last message: {format(new Date(session.last_message_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatHistory;