import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSettingsProps {
  initialUsername: string;
  onUsernameChange: (username: string) => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  initialUsername,
  onUsernameChange,
  onPasswordChange
}) => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    onUsernameChange(newUsername);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await onPasswordChange(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Hide form after successful change
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordError('Failed to update password. Please check your current password and try again.');
    }
  };

  return (
    <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
      {/* Profile Section */}
      <div className="flex items-center space-x-3 mb-4">
        <User className="text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Profile</h2>
      </div>
      
      <div className="space-y-6 pl-9">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className="input w-full"
            placeholder="Your display name"
          />
        </div>
        
        {/* Password Change Button */}
        {!showPasswordForm && (
          <div>
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="btn text-sm py-1.5 flex items-center space-x-2"
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>
          </div>
        )}
        
        {/* Password Change Form */}
        {showPasswordForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
            onSubmit={handlePasswordChange}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            
            {passwordSuccess && (
              <div className="text-green-500 text-sm">Password updated successfully!</div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn btn-primary text-sm py-1.5"
              >
                Update Password
              </button>
              
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="btn text-sm py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
