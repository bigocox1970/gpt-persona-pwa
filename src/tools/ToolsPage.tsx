import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StickyNote, CheckSquare, History, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const tools: Tool[] = [
  {
    id: 'notes',
    name: 'Notes',
    description: 'Create and manage notes from your conversations',
    icon: <StickyNote className="w-6 h-6" />,
    path: '/tools/notes'
  },
  {
    id: 'todos',
    name: 'Todo List',
    description: 'Keep track of tasks and ideas from your chats',
    icon: <CheckSquare className="w-6 h-6" />,
    path: '/tools/todos'
  },
  {
    id: 'history',
    name: 'Chat History',
    description: 'View and search through your past conversations',
    icon: <History className="w-6 h-6" />,
    path: '/tools/history'
  }
];

const ToolsPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleToolClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tools</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 cursor-pointer"
              onClick={() => handleToolClick(tool.path)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[var(--primary-color)] bg-opacity-10 rounded-lg text-[var(--primary-color)]">
                  {tool.icon}
                </div>
                <h3 className="text-lg font-medium">{tool.name}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {tool.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ToolsPage;