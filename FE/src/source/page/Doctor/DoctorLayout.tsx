import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { Moon, Sun, User, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { userAPI } from '../Axios/Axios';

// Component nội dung chính với dark mode support
const DoctorLayoutContent: React.FC = () => {
  const { isDarkMode, toggleTheme } = useGlobalTheme();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        console.log('DoctorLayout: Loading user data...');
        
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('DoctorLayout: Token exists:', !!token);
        
        if (!token) {
          console.log('DoctorLayout: No token found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        const response = await userAPI.getCurrentUser();
        console.log('DoctorLayout: API Response:', response);
        
        // Check if response has the expected structure
        let userData;
        if (response.data && response.data.data) {
          // Backend returns { success: true, message: '', data: {...} }
          userData = response.data.data;
        } else if (response.data) {
          // Direct data
          userData = response.data;
        } else {
          console.error('DoctorLayout: Unexpected response structure:', response);
          return;
        }
        
        console.log('DoctorLayout: User data:', userData);
        setUserData(userData);
      } catch (error: any) {
        console.error('DoctorLayout: Failed to load user data:', error);
        
        if (error.response?.status === 401) {
          console.log('DoctorLayout: Authentication failed, redirecting to login');
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

    // Listen for profile update events
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login', { replace: true });
  };

  // Handle profile navigation
  const handleProfile = () => {
    navigate('/doctor/profile');
    setShowProfileDropdown(false);
  };

  const handleEditProfile = () => {
    navigate('/doctor/profile');
    setShowProfileDropdown(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.mobile-sidebar') && !target.closest('.hamburger-button')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileDropdown && !target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
        {/* Mobile Sidebar Overlay - Behind Sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
        )}
        
        {/* Sidebar - Desktop: Fixed, Mobile: Overlay */}
        <DoctorSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          {/* Header - Fixed */}
          <div className={`border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 h-16 sm:h-20 lg:h-24 flex items-center flex-shrink-0 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
              {/* Left Section - Hamburger + Title */}
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                {/* Hamburger Menu - Mobile Only */}
                <button
                  onClick={toggleSidebar}
                  className={`hamburger-button lg:hidden p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Toggle Menu"
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>

                {/* Title */}
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text truncate">
                    Lab Service Dashboard
                  </h1>
                </div>
              </div>

              {/* Right Section - Dark Mode, Notifications and User Profile */}
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 sm:p-2.5 lg:p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? 'text-yellow-400 hover:bg-gray-700 bg-gray-700/50'
                      : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
                  }`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  )}
                </button>

                {/* Notifications */}
                <div className="relative hidden sm:block">
                  <button className={`p-2 sm:p-2.5 lg:p-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-700'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:w-6 lg:w-8 lg:h-8">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  </button>
                  {/* Notification Badge */}
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center font-bold">
                    3
                  </span>
                </div>

                {/* User Profile */}
                <div className="relative profile-dropdown-container">
                  <div 
                    className="flex items-center gap-1 sm:gap-2 lg:gap-4 cursor-pointer hover:bg-opacity-10 hover:bg-gray-500 p-1 sm:p-1.5 lg:p-2 rounded-lg transition-colors duration-300"
                    onClick={toggleDropdown}
                  >
                    {/* Avatar */}
                    <img
                      src={userData?.image || userData?.avatar || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"}
                      alt={userData?.fullName || "Doctor"}
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent ring-blue-500 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400";
                      }}
                    />

                    {/* User Info - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-2">
                      <div className="min-w-0">
                        <div className={`text-sm lg:text-lg font-bold transition-colors duration-300 truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {loading ? 'Loading...' : (userData?.fullName || userData?.username || 'Doctor')}
                        </div>
                        {userData?.role && (
                          <div className={`text-xs lg:text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                          </div>
                        )}
                      </div>
                      <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 transition-all duration-300 flex-shrink-0 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      } ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div 
                      className={`absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg border z-50 transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* User Info Header */}
                      <div className={`p-4 border-b transition-colors duration-300 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <img
                            src={userData?.image || userData?.avatar || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"}
                            alt={userData?.fullName || "Doctor"}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400";
                            }}
                          />
                          <div>
                            <div className={`font-semibold transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {userData?.fullName || userData?.username || 'Doctor'}
                            </div>
                            <div className={`text-sm transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {userData?.email || 'doctor@example.com'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleProfile}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </button>
                        
                        <button
                          onClick={handleEditProfile}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          Edit Profile
                        </button>
                        
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                        
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                              : 'text-red-600 hover:bg-gray-100 hover:text-red-700'
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <main className={`flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            <Outlet />
          </main>
        </div>
      </div>
  );
};

/**
 * Doctor Layout component - Layout chính cho Doctor với Dark Mode support
 * Authentication đã được xử lý ở Router level
 */
const DoctorLayout: React.FC = () => {
  return <DoctorLayoutContent />;
};

export default DoctorLayout;
