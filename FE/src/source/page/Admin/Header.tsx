import { useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
    const userName = localStorage.getItem('userName') || 'Admin';
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-5 h-24 flex items-center transition-colors duration-300">
            <div className="flex justify-between items-center w-full">
                {/* Left Section - Title */}
                <div>
                    <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text dark:from-sky-400 dark:to-violet-500">Admin</h1>
                </div>

                {/* Right Section - Dark Mode Toggle, Notifications and User Profile */}
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <Sun className="w-6 h-6 text-yellow-500" />
                        ) : (
                            <Moon className="w-6 h-6 text-gray-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                            </svg>
                        </button>
                        {/* Notification Badge */}
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            3
                        </span>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white font-bold shadow-md">
                            {userName.charAt(0).toUpperCase()}
                        </div>

                        {/* User Name */}
                        <div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">{userName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;

