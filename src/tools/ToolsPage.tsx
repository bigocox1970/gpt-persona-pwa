import React from 'react';
import { StickyNote, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface ToolsPageProps {
  onSelectNotes: () => void;
  onSelectTodos: () => void;
}

const ToolsPage: React.FC<ToolsPageProps> = ({ onSelectNotes, onSelectTodos }) => {
  
  // Define tools with actions that use the provided callbacks
  const tools: Tool[] = [
    {
      id: 'notes',
      name: 'Notes',
      description: 'Create and manage notes from your conversations',
      icon: <StickyNote className="w-6 h-6" />,
      action: onSelectNotes
    },
    {
      id: 'todos',
      name: 'Todo List',
      description: 'Keep track of tasks and ideas from your chats',
      icon: <CheckSquare className="w-6 h-6" />,
      action: onSelectTodos
    }
  ];

  // Handle tool click by executing the tool's action
  const handleToolClick = (action: () => void) => {
    action();
  };

  return (
    <div className="max-w-3xl mx-auto w-full pt-2.5 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl p-4 cursor-pointer shadow-sm"
            onClick={() => handleToolClick(tool.action)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--primary-color)] bg-opacity-10 rounded-lg text-[var(--primary-color)]">
                {tool.icon}
              </div>
              <h3 className="text-lg font-medium">{tool.name}</h3>
            </div>
            <p className="text-[var(--text-primary)] dark:text-[var(--text-primary)] text-opacity-70 dark:text-opacity-70 text-sm">
              {tool.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
