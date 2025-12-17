import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

interface DoctorSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDarkMode } = useGlobalTheme();

    const handleLogout = () => {
        // Clear all stored user data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');

        // Navigate to home page
        navigate('/', { replace: true });
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        // Close sidebar on mobile after navigation
        setIsSidebarOpen(false);
    };

    return (
        <div className={`mobile-sidebar w-64 h-screen flex flex-col shadow-2xl fixed left-0 top-0 z-50 transition-all duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Logo Section - Fixed */}
            <div className="p-4 sm:p-6 flex-shrink-0">
                <div className="flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="LabTrack Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full"
                    />
                </div>
            </div>

            {/* Navigation Menu - Scrollable */}
            <div className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
                <nav className="space-y-1.5 sm:space-y-2">
                    {/* Dashboard */}
                    <button
                        onClick={() => handleNavigate('/doctor/dashboard')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/dashboard' || location.pathname === '/doctor'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        <span className="text-sm sm:text-base">Dashboard</span>
                    </button>

                    {/* Event Log */}
                    <button
                        onClick={() => handleNavigate('/doctor/event-log')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/event-log'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Event Log</span>
                    </button>

                    {/* Schedule */}
                    <button
                        onClick={() => handleNavigate('/doctor/schedule')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/schedule'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                        </svg>
                        <span className="text-sm sm:text-base">My Schedule</span>
                    </button>

                    {/* Reagent History */}
                    <button
                        onClick={() => handleNavigate('/doctor/reagent-history')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/reagent-history'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className="text-sm sm:text-base">Reagent History</span>
                    </button>

                    {/* Instruments */}
                    <button
                        onClick={() => handleNavigate('/doctor/instrument')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/instrument'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Instruments</span>
                    </button>

                    {/* Sick Room */}
                    <button
                        onClick={() => handleNavigate('/doctor/sick-room')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/sick-room'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M20 9V6h-3V4h-2v2h-2V4H11v2H9V4H7v2H4v3H2v2h2v2H2v2h2v2H2v2h2v3h16v-3h2v-2h-2v-2h2v-2h-2v-2h2V9h-2zm-3 9H7v-2h10v2zm0-4H7v-2h10v2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Sick Room</span>
                    </button>

                    {/* Profile */}
                    <button
                        onClick={() => handleNavigate('/doctor/profile')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left ${
                            location.pathname === '/doctor/profile'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold dark:from-sky-800 dark:to-violet-800 dark:text-violet-300'
                                : isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-sm sm:text-base">Profile</span>
                    </button>

                </nav>
            </div>

            {/* Logout Button - Fixed at Bottom */}
            <div className="p-3 sm:p-4 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-sky-300 to-violet-400 hover:from-sky-400 hover:to-violet-500 shadow-lg shadow-violet-500/25"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    <span className="text-sm sm:text-base">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default DoctorSidebar;
