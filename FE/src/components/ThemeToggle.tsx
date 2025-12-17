import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useGlobalTheme } from '../contexts/GlobalThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { isDarkMode, toggleTheme } = useGlobalTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg ${
        isDarkMode
          ? 'text-yellow-400 hover:bg-gray-700 bg-gray-700/50 hover:shadow-yellow-400/20 shadow-yellow-400/10'
          : 'text-gray-600 hover:bg-gray-100 bg-gray-50 hover:shadow-gray-400/20 shadow-gray-400/10'
      } ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;