import React from 'react';
import { Mic } from 'lucide-react';

// Available languages for speech recognition
const AVAILABLE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' }
];

interface SpeechSettingsProps {
  initialLanguage: string;
  onLanguageChange: (language: string) => void;
}

const SpeechSettings: React.FC<SpeechSettingsProps> = ({
  initialLanguage,
  onLanguageChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(initialLanguage);

  // Update selectedLanguage when initialLanguage changes
  React.useEffect(() => {
    console.log('SpeechSettings: initialLanguage changed to', initialLanguage);
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    console.log('SpeechSettings: Language changed to', language);
    setSelectedLanguage(language);
    onLanguageChange(language);
  };

  return (
    <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Mic className="text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Speech Input</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recognition Language
          </label>
          <select
            className="input w-full"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            This language will be used for speech recognition when you use the microphone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeechSettings;
