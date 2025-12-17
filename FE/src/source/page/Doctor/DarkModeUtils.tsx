import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

// Dark mode utility function for consistent styling
export const getDarkModeClasses = (isDarkMode: boolean) => ({
  // Background classes
  cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
  pageBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
  headerBg: isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50',
  
  // Text classes
  textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
  textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
  textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  
  // Border classes
  border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  borderLight: isDarkMode ? 'border-gray-600' : 'border-gray-100',
  
  // Input classes
  input: isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500',
    
  // Button classes
  button: isDarkMode 
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600'
    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200',
    
  // Table classes
  tableHeader: isDarkMode 
    ? 'bg-gradient-to-r from-gray-700 to-gray-800' 
    : 'bg-gradient-to-r from-gray-50 to-gray-100',
  tableRow: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50',
  
  // Modal classes
  modal: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  modalOverlay: 'backdrop-blur-lg bg-black/50',
  
  // Tab classes
  tabActive: isDarkMode 
    ? 'border-blue-400 text-blue-300 bg-gray-700' 
    : 'border-blue-500 text-blue-600 bg-blue-50',
  tabInactive: isDarkMode 
    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 hover:bg-gray-700'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50',
    
  // Status colors (maintain original colors but adjust for dark mode)
  statusReceived: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  statusPartial: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  statusReturned: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  statusUsed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
});

// Hook to get dark mode classes
export const useDarkModeClasses = () => {
  const { isDarkMode } = useGlobalTheme();
  return getDarkModeClasses(isDarkMode);
};

// Hook to get dark mode state (alias for compatibility)
export const useDarkMode = () => {
  return useGlobalTheme();
};
