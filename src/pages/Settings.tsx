import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsManager from '../components/settings/SettingsManager';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[var(--background-primary)] dark:bg-[var(--background-primary)] p-4 pb-20">
      {/* Navigation Buttons */}
      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => navigate('/chat')}
            className="text-[var(--primary-color)] font-medium"
          >
            &larr; Back to Chat
          </button>
          <button 
            onClick={() => navigate('/admin/personas')}
            className="text-[var(--primary-color)] font-medium"
          >
            Personas
          </button>
        </div>
      </div>
      
      {/* Settings Manager Component */}
      <SettingsManager />
    </div>
  );
};

export default Settings;
