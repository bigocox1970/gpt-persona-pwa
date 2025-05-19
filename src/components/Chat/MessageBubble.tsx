import React from 'react';
import { motion } from 'framer-motion';
import '../../markdown-styles.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: isUser ? 20 : -20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: { 
        duration: 0.3
      }
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <motion.div
        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
          {isUser ? (
            message.text
          ) : (
            <div className="markdown-content">
              {message.text}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1 px-2">
          {time}
        </span>
      </motion.div>
    </div>
  );
};

export default MessageBubble;
