import { useState, useEffect } from 'react';
import { userAPI } from '../Axios/Axios';

function Header() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await userAPI.getCurrentUser();
                setUserData(response.data);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        loadUserData();

        // Listen for profile update events
        const handleProfileUpdate = () => {
            loadUserData();
        };

        // Listen for custom event when profile is updated
        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-5 h-24 flex items-center">
            <div className="flex justify-between items-center w-full">
                {/* Left Section - Title */}
                <div>
                    <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Patient</h1>
                </div>

                {/* Right Section - Notifications and User Profile */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-3 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
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
                        {loading ? (
                            /* Loading State */
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <>
                                {/* Avatar */}
                                {(userData?.image || userData?.avatar) ? (
                                    <img
                                        src={userData.image || userData.avatar}
                                        alt={userData.fullName || 'User'}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400">
                                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}

                                {/* User Name */}
                                <div>
                                    <span className="text-xl font-bold text-gray-900">
                                        {userData?.fullName || 'User'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
