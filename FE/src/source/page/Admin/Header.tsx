import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../../components/ThemeToggle';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { userAPI } from '../Axios/Axios';

const Header = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useGlobalTheme();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                
                const token = localStorage.getItem('token');
                
                if (!token) {
                    navigate('/login', { replace: true });
                    return;
                }
                
                const response = await userAPI.getCurrentUser();
                
                let userData;
                if (response.data && response.data.data) {
                    userData = response.data.data;
                } else if (response.data) {
                    userData = response.data;
                } else {
                    return;
                }
                
                setUserData(userData);
            } catch (error: any) {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    navigate('/login', { replace: true });
                }
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
    }, [navigate]);


    return (
        <div className={`border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 h-16 sm:h-20 lg:h-24 flex items-center flex-shrink-0 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
        }`}>
            <div className="flex justify-between items-center w-full">
                <div className="lg:ml-0 ml-12">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text truncate max-w-[120px] sm:max-w-none">
                        Admin Dashboard
                    </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <ThemeToggle className="p-2 sm:p-2.5 lg:p-3 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg" />

                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                        <img
                            src={userData?.image || userData?.avatar || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"}
                            alt={userData?.fullName || "Admin"}
                            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-transparent ring-blue-500 dark:ring-blue-400 shadow-lg hover:scale-110 transition-all duration-300"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400";
                            }}
                        />
  
                        <div className="hover:scale-105 transition-all duration-300 hidden sm:block">
                            <div className={`text-sm sm:text-base lg:text-lg font-bold transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {loading ? 'Loading...' : (userData?.fullName || userData?.username || 'Admin')}
                            </div>
                            {userData?.role && (
                                <div className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                }`}>
                                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;

