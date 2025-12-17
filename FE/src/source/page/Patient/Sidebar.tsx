import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userAPI } from '../Axios/Axios';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
    const [isProfileComplete, setIsProfileComplete] = useState(true);

    const checkProfileCompleteness = (userData: any): boolean => {
        const requiredFields = [
            'fullName',
            'dateOfBirth', 
            'age',
            'gender',
            'address',
            'phoneNumber',
            'email',
            'identifyNumber'
        ];

        return requiredFields.every(field => {
            const value = userData[field];
            return value && value.toString().trim() !== '';
        });
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await userAPI.getCurrentUser();
                const userData = response.data;
                
                let actualUserData;
                if (userData.data) {
                    actualUserData = userData.data;
                } else {
                    actualUserData = userData;
                }
                
                const isComplete = checkProfileCompleteness(actualUserData);
                setIsProfileComplete(isComplete);
            } catch (error) {
                setIsProfileComplete(false);
            }
        };

        loadUserData();
    }, [location.pathname]);

    useEffect(() => {
        const handleProfileUpdate = () => {
            const loadUserData = async () => {
                try {
                    const response = await userAPI.getCurrentUser();
                    const userData = response.data;
                    setIsProfileComplete(checkProfileCompleteness(userData));
                } catch (error) {
                    setIsProfileComplete(false);
                }
            };
            loadUserData();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    const handleDashboardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isProfileComplete) {
            navigate('/patient/incomplete-profile');
        } else {
            navigate('/patient/dashboard');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');

        navigate('/', { replace: true });
    };

    return (
        <div className="w-64 bg-white dark:bg-gray-900 h-screen flex flex-col shadow-2xl relative z-50 transition-colors duration-300 lg:flex hidden">
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="LabTrack Logo"
                        className="w-20 h-20 object-contain rounded-full"
                    />
                </div>
            </div>

            <div className="px-4 py-6">
                <nav className="space-y-2">
                    <button
                        onClick={handleDashboardClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/patient/dashboard' || location.pathname === '/patient'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                            : isProfileComplete 
                                ? 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800'
                                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        Dashboard
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isProfileComplete) {
                                navigate('/patient/incomplete-profile');
                            } else {
                                navigate('/patient/profile');
                            }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/patient/profile'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                            : isProfileComplete 
                                ? 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800'
                                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        Profile
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isProfileComplete) {
                                navigate('/patient/incomplete-profile');
                            } else {
                                navigate('/patient/schedule');
                            }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/patient/schedule'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                            : isProfileComplete 
                                ? 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800'
                                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z" />
                        </svg>
                        Schedule
                    </button>
                </nav>
            </div>

            <div className="mt-auto p-4 pb-6">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-sky-300 to-violet-400 text-white hover:from-sky-400 hover:to-violet-500 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
