import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { userAPI, notificationAPI } from '../Axios/Axios';
import ThemeToggle from '../../../components/ThemeToggle';
import NotificationModal from './NotificationModal';

interface UserData {
    userid?: string;
    id?: string;
    fullName?: string;
    image?: string;
    avatar?: string;
}

function Header() {
    const location = useLocation();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                
                setUserData(actualUserData);
            } catch {
                // Error loading user data, user data will remain null
            } finally {
                setLoading(false);
            }
        };

        loadUserData();

        const handleProfileUpdate = () => {
            loadUserData();
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    // Load notification count
    useEffect(() => {
        const loadNotificationCount = async () => {
            if (!userData?.userid && !userData?.id) return;
            
            try {
                const userId = userData?.userid || userData?.id;
                if (!userId) return;
                
                const response = await notificationAPI.getMessagesByUserId(userId);
                
                if (response.data && response.data.data) {
                    const unreadCount = response.data.data.filter((notification: { isRead: boolean }) => !notification.isRead).length;
                    setNotificationCount(unreadCount);
                }
            } catch {
                // Silently fail for notification count
            }
        };

        if (userData) {
            loadNotificationCount();
        }
    }, [userData]);

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-5 h-24 flex items-center transition-colors duration-300">
            <div className="flex justify-between items-center w-full">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
                    aria-label="Toggle menu"
                >
                    <span className={`w-6 h-0.5 bg-neutral-700 dark:bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-neutral-700 dark:bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-neutral-700 dark:bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </button>

                <div className="lg:block hidden">
                    <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text dark:from-sky-400 dark:to-violet-500">Patient</h1>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105" />

                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationModalOpen(true)}
                            className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                            </svg>
                        </button>
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {notificationCount}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gray-200 animate-pulse"></div>
                                <div className="w-16 lg:w-24 h-4 lg:h-6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <>
                                {(userData?.image && userData.image.trim() !== '') || (userData?.avatar && userData.avatar.trim() !== '') ? (
                                    <img
                                        src={userData.image || userData.avatar}
                                        alt={userData.fullName || 'User'}
                                        className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                                        <img
                                            src="https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"
                                            alt="Default Avatar"
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = `
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-gray-400">
                                                            <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
                                                        </svg>
                                                    `;
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <span className="text-sm lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {userData?.fullName || 'User'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed top-0 left-0 w-64 bg-white dark:bg-gray-900 h-screen shadow-2xl transition-all duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <img
                            src="/logo.png"
                            alt="LabTrack Logo"
                            className="w-16 h-16 object-contain rounded-full"
                        />
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-2">
                        <a
                            href="/patient/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/patient/dashboard' || location.pathname === '/patient'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                                : 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                            </svg>
                            Dashboard
                        </a>

                        <a
                            href="/patient/profile"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/patient/profile'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                                : 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                            Profile
                        </a>

                        <a
                            href="/patient/schedule"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/patient/schedule'
                                ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                                : 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z" />
                            </svg>
                            Schedule
                        </a>
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userName');
                                window.location.href = '/';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-sky-300 to-violet-400 text-white hover:from-sky-400 hover:to-violet-500 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5h-6a1.5 1.5 0 01-1.5-1.5V15a.75.75 0 00-1.5 0v3.75a3 3 0 003 3h6a3 3 0 003-3V5.25a3 3 0 00-3-3h-6a3 3 0 00-3 3V9a.75.75 0 001.5 0V5.25a1.5 1.5 0 011.5-1.5h6zm-5.03 8.47a.75.75 0 000 1.06l1.72 1.72H8a.75.75 0 000 1.5h5.19l-1.72 1.72a.75.75 0 101.06 1.06l3-3a.75.75 0 000-1.06l-3-3a.75.75 0 00-1.06 0z" clipRule="evenodd" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <NotificationModal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                userId={userData?.userid || userData?.id || ''}
                onNotificationRead={() => {
                    // Giảm số lượng thông báo chưa đọc
                    setNotificationCount(prev => Math.max(0, prev - 1));
                }}
            />
        </div>
    );
}

export default Header;
