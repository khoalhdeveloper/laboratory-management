
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        // Đọc từ localStorage, nếu không có thì mặc định là chế độ sáng
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            return JSON.parse(savedDarkMode);
        }
        // Chỉ mặc định là chế độ sáng khi lần đầu mở ứng dụng
        return false;
    });

    // Chuyển đổi giữa chế độ sáng và tối
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = (): DarkModeContextType => {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};
