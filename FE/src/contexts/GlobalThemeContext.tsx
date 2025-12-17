import React, { createContext, useContext, useState, useEffect } from 'react';

interface GlobalThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export const GlobalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('globalTheme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('globalTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <GlobalThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </GlobalThemeContext.Provider>
  );
};

export const useGlobalTheme = (): GlobalThemeContextType => {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
};