import React from 'react';
import SettingsManager from '../components/settings/SettingsManager';

const Settings: React.FC = () => {
  return (
    <div className="min-h-full bg-[var(--background-primary)] dark:bg-[var(--background-primary)] pt-2.5 px-4 pb-20">
      {/* Settings Manager Component */}
      <SettingsManager />
    </div>
  );
};

export default Settings;
