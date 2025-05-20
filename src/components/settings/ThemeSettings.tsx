import React, { useState } from 'react';
import { Moon, Sun, Droplet, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Theme constants
const THEME_VARIABLES = [
  { key: 'primary-color', label: 'Primary' },
  { key: 'secondary-color', label: 'Secondary' },
  { key: 'accent-color', label: 'Accent' },
  { key: 'success-color', label: 'Success' },
  { key: 'warning-color', label: 'Warning' },
  { key: 'error-color', label: 'Error' },
  { key: 'text-primary', label: 'Text Primary' },
  { key: 'text-secondary', label: 'Text Secondary' },
  { key: 'background-primary', label: 'Background' },
  { key: 'background-secondary', label: 'Background Alt' },
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

// Helper function to get custom colors from localStorage
const getCustomColors = (paletteIndex: number, isDark: boolean): {[key: string]: string} | null => {
  const key = `custom_colors_${paletteIndex}_${isDark ? 'dark' : 'light'}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};

// Helper function to save custom colors to localStorage
const saveCustomColors = (paletteIndex: number, isDark: boolean, colors: {[key: string]: string}) => {
  const key = `custom_colors_${paletteIndex}_${isDark ? 'dark' : 'light'}`;
  localStorage.setItem(key, JSON.stringify(colors));
};

interface ThemeSettingsProps {
  initialPalette: number;
  onPaletteChange: (palette: number) => void;
  onCustomColorsChange?: (colors: {[key: string]: string}) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  initialPalette,
  onPaletteChange,
  onCustomColorsChange
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activePalette, setActivePalette] = React.useState<number>(initialPalette);

  // Update activePalette when initialPalette changes
  React.useEffect(() => {
    console.log('ThemeSettings: initialPalette changed to', initialPalette);
    setActivePalette(initialPalette);
  }, [initialPalette]);

  // State for custom colors
  const [customColors, setCustomColors] = useState<{[key: string]: string}>({});
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  
  // Apply palette when changed
  React.useEffect(() => {
    console.log('ThemeSettings: Applying palette', activePalette, isDarkMode ? 'dark' : 'light');
    
    // Check for custom colors first
    const savedCustomColors = getCustomColors(activePalette, isDarkMode);
    
    if (savedCustomColors) {
      console.log('Applying custom colors:', savedCustomColors);
      setCustomColors(savedCustomColors);
      applyPalette(savedCustomColors);
      
      // Notify parent component about custom colors
      if (onCustomColorsChange) {
        onCustomColorsChange(savedCustomColors);
      }
    } else {
      // Apply default palette
      const defaultColors = PALETTE_PRESETS[activePalette][isDarkMode ? 'dark' : 'light'];
      setCustomColors(defaultColors);
      applyPalette(defaultColors);
      
      // Notify parent component about default colors
      if (onCustomColorsChange) {
        onCustomColorsChange(defaultColors);
      }
    }
  }, [activePalette, isDarkMode, onCustomColorsChange]);

  // Handle palette selection
  const handlePaletteChange = (index: number) => {
    console.log('ThemeSettings: Palette changed to', index);
    setActivePalette(index);
    onPaletteChange(index);
  };

  return (
    <div className="bg-[var(--background-secondary)] dark:bg-[var(--background-secondary)] rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Droplet className="text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">Theme</h2>
      </div>
      
      <div className="space-y-6">
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
                      {THEME_VARIABLES.slice(0, 5).map((variable, j) => (
                        <span
                          key={j}
                          className="flex-1 h-4 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg"
                          style={{ background: (preset.light as {[key: string]: string})[variable.key] }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Dark preview */}
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xs mb-1">Dark</span>
                    <div className="flex w-full">
                      {THEME_VARIABLES.slice(0, 5).map((variable, j) => (
                        <span
                          key={j}
                          className="flex-1 h-4 rounded-l-none rounded-r-none first:rounded-l-lg last:rounded-r-lg"
                          style={{ background: (preset.dark as {[key: string]: string})[variable.key] }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Color Customization */}
        {activePalette !== undefined && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Customize Colors
              </label>
              <button
                onClick={() => {
                  // Reset to default colors
                  const defaultColors = PALETTE_PRESETS[activePalette][isDarkMode ? 'dark' : 'light'];
                  setCustomColors(defaultColors);
                  applyPalette(defaultColors);
                  
                  // Remove custom colors from localStorage
                  const key = `custom_colors_${activePalette}_${isDarkMode ? 'dark' : 'light'}`;
                  localStorage.removeItem(key);
                  
                  // Notify parent component about default colors
                  if (onCustomColorsChange) {
                    onCustomColorsChange(defaultColors);
                  }
                }}
                className="flex items-center text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
              >
                <RefreshCw size={12} className="mr-1" />
                Reset
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {THEME_VARIABLES.map((variable) => (
                <div 
                  key={variable.key}
                  className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded"
                >
                  <div 
                    className="w-6 h-6 rounded mr-2 cursor-pointer border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: customColors[variable.key] || '#ffffff' }}
                    onClick={() => setShowColorPicker(variable.key)}
                  />
                  <span className="text-xs">{variable.label}</span>
                  
                  {showColorPicker === variable.key && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowColorPicker(null)}>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                        <h3 className="text-sm font-medium mb-2">Select {variable.label} Color</h3>
                        <input 
                          type="color" 
                          value={customColors[variable.key] || '#ffffff'}
                          onChange={(e) => {
                            const newColors = { ...customColors, [variable.key]: e.target.value };
                            setCustomColors(newColors);
                            document.documentElement.style.setProperty(`--${variable.key}`, e.target.value);
                            saveCustomColors(activePalette, isDarkMode, newColors);
                            
                            // Notify parent component about custom colors
                            if (onCustomColorsChange) {
                              onCustomColorsChange(newColors);
                            }
                          }}
                          className="w-full h-10 mb-3"
                        />
                        <div className="flex justify-end">
                          <button 
                            className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded"
                            onClick={() => setShowColorPicker(null)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;
