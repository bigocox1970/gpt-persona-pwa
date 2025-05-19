import React from 'react';
import { Moon, Sun, Droplet } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Theme constants
const THEME_VARIABLES = [
  'primary-color',
  'secondary-color',
  'accent-color',
  'success-color',
  'warning-color',
  'error-color',
  'text-primary',
  'text-secondary',
  'background-primary',
  'background-secondary',
];

const PALETTE_PRESETS: {
  name: string;
  light: { [key: string]: string };
  dark: { [key: string]: string };
}[] = [
  {
    name: 'Sunset',
    light: {
      'primary-color': '#D98324',
      'secondary-color': '#443627',
      'accent-color': '#EFDCAB',
      'success-color': '#443627',
      'warning-color': '#D98324',
      'error-color': '#D98324',
      'text-primary': '#443627',
      'text-secondary': '#D98324',
      'background-primary': '#F2F6D0',
      'background-secondary': '#EFDCAB',
    },
    dark: {
      'primary-color': '#EFDCAB',
      'secondary-color': '#D98324',
      'accent-color': '#443627',
      'success-color': '#EFDCAB',
      'warning-color': '#D98324',
      'error-color': '#EFDCAB',
      'text-primary': '#EFDCAB',
      'text-secondary': '#F2F6D0',
      'background-primary': '#443627',
      'background-secondary': '#D98324',
    },
  },
  {
    name: 'Earthy',
    light: {
      'primary-color': '#65451F',
      'secondary-color': '#765827',
      'accent-color': '#C8AE7D',
      'success-color': '#65451F',
      'warning-color': '#C8AE7D',
      'error-color': '#765827',
      'text-primary': '#65451F',
      'text-secondary': '#765827',
      'background-primary': '#EAC696',
      'background-secondary': '#C8AE7D',
    },
    dark: {
      'primary-color': '#C8AE7D',
      'secondary-color': '#65451F',
      'accent-color': '#EAC696',
      'success-color': '#C8AE7D',
      'warning-color': '#EAC696',
      'error-color': '#C8AE7D',
      'text-primary': '#EAC696',
      'text-secondary': '#C8AE7D',
      'background-primary': '#65451F',
      'background-secondary': '#765827',
    },
  },
  {
    name: 'Green Tea',
    light: {
      'primary-color': '#A4B465',
      'secondary-color': '#626F47',
      'accent-color': '#F0BB78',
      'success-color': '#626F47',
      'warning-color': '#F0BB78',
      'error-color': '#A4B465',
      'text-primary': '#626F47',
      'text-secondary': '#A4B465',
      'background-primary': '#F5ECD5',
      'background-secondary': '#A4B465',
    },
    dark: {
      'primary-color': '#F0BB78',
      'secondary-color': '#A4B465',
      'accent-color': '#626F47',
      'success-color': '#F0BB78',
      'warning-color': '#A4B465',
      'error-color': '#F0BB78',
      'text-primary': '#F5ECD5',
      'text-secondary': '#F0BB78',
      'background-primary': '#626F47',
      'background-secondary': '#A4B465',
    },
  },
  {
    name: 'Sand & Sky',
    light: {
      'primary-color': '#F2F6D0',
      'secondary-color': '#EFDCAB',
      'accent-color': '#443627',
      'success-color': '#443627',
      'warning-color': '#EFDCAB',
      'error-color': '#443627',
      'text-primary': '#443627',
      'text-secondary': '#EFDCAB',
      'background-primary': '#F2F6D0',
      'background-secondary': '#EFDCAB',
    },
    dark: {
      'primary-color': '#443627',
      'secondary-color': '#EFDCAB',
      'accent-color': '#F2F6D0',
      'success-color': '#EFDCAB',
      'warning-color': '#F2F6D0',
      'error-color': '#EFDCAB',
      'text-primary': '#EFDCAB',
      'text-secondary': '#F2F6D0',
      'background-primary': '#443627',
      'background-secondary': '#F2F6D0',
    },
  },
];

// Helper function to apply a palette
const applyPalette = (colors: {[key: string]: string}) => {
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
};

interface ThemeSettingsProps {
  initialPalette: number;
  onPaletteChange: (palette: number) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  initialPalette,
  onPaletteChange
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activePalette, setActivePalette] = React.useState<number>(initialPalette);

  // Update activePalette when initialPalette changes
  React.useEffect(() => {
    console.log('ThemeSettings: initialPalette changed to', initialPalette);
    setActivePalette(initialPalette);
  }, [initialPalette]);

  // Apply palette when changed
  React.useEffect(() => {
    console.log('ThemeSettings: Applying palette', activePalette, isDarkMode ? 'dark' : 'light');
    applyPalette(PALETTE_PRESETS[activePalette][isDarkMode ? 'dark' : 'light']);
  }, [activePalette, isDarkMode]);

  // Handle palette selection
  const handlePaletteChange = (index: number) => {
    console.log('ThemeSettings: Palette changed to', index);
    setActivePalette(index);
    onPaletteChange(index);
  };

  return (
    <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        <Droplet className="text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Theme</h2>
      </div>
      
      <div className="space-y-6 pl-9">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        {/* Color Palette Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Palette
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PALETTE_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => handlePaletteChange(i)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  activePalette === i
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[var(--primary-color)]'
                }`}
              >
                <span className="text-sm font-medium mb-2">{preset.name}</span>
                <div className="flex flex-col w-full space-y-2">
                  {/* Light preview */}
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xs mb-1">Light</span>
                    <div className="flex w-full">
                      {THEME_VARIABLES.slice(0, 5).map((key, j) => (
                        <span
                          key={j}
                          className="flex-1 h-4 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg"
                          style={{ background: (preset.light as {[key: string]: string})[key] }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Dark preview */}
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xs mb-1">Dark</span>
                    <div className="flex w-full">
                      {THEME_VARIABLES.slice(0, 5).map((key, j) => (
                        <span
                          key={j}
                          className="flex-1 h-4 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg"
                          style={{ background: (preset.dark as {[key: string]: string})[key] }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
