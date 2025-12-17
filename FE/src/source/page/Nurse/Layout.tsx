import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext'
import { Sun, Moon, Settings, LogOut, ChevronDown, LayoutDashboard, FileSpreadsheet, Beaker, Microscope, FlaskConical, CalendarClock, Video, Activity } from 'lucide-react'
import { userAPI, notificationAPI } from '../Axios/Axios'
import NotificationModal from './NotificationModal'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { isDarkMode, toggleTheme } = useGlobalTheme()
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        
        // Check if token exists
        const token = localStorage.getItem('token')
        
        if (!token) {
          navigate('/login', { replace: true })
          return
        }
        
        const response = await userAPI.getCurrentUser()
        
        // Check if response has the expected structure
        let userData
        if (response.data && response.data.data) {
          // Backend returns { success: true, message: '', data: {...} }
          userData = response.data.data
        } else if (response.data) {
          // Direct data
          userData = response.data
        } else {
          console.error('DoctorLayout: Unexpected response structure:', response)
          return
        }
        
        setUserData(userData)
        
        
        if (userData.userid) {
          localStorage.setItem('userId', userData.userid)
        }
      } catch (error: any) {
        console.error('DoctorLayout: Failed to load user data:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          localStorage.removeItem('userId')
          navigate('/login', { replace: true })
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()

    // Listen for profile update events
    const handleProfileUpdate = () => {
      loadUserData()
    }

    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [navigate])

  // Load unread notifications count
  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getWarehouseMessages()
      if (response.data && response.data.data) {
        const unreadNotifications = response.data.data.filter((notif: any) => !notif.isRead)
        setUnreadCount(unreadNotifications.length)
      }
    } catch (error) {
      console.error('Failed to load unread notifications count:', error)
    }
  }

  // Load unread count on mount and periodically
  useEffect(() => {
    loadUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/nurse', icon: LayoutDashboard },
    { id: 'test-orders', label: 'Test Orders', path: '/nurse/test-orders', icon: FileSpreadsheet },
    { id: 'reagents', label: 'Reagents', path: '/nurse/reagents', icon: Beaker },
    { id: 'instrument', label: 'Instrument', path: '/nurse/instrument', icon: Microscope },
    { id: 'results', label: 'Results', path: '/nurse/results', icon: FlaskConical },
    { id: 'schedule', label: 'Schedule', path: '/nurse/schedule', icon: CalendarClock },
    { id: 'group-call', label: 'Meeting', path: '/nurse/group-call', icon: Video },
    { id: 'eventlog', label: 'Event Log', path: '/nurse/eventlog', icon: Activity }
  ]

  const isActive = (path: string) => {
    if (path === '/nurse') return location.pathname === '/nurse'
    return location.pathname.startsWith(path)
  }

  const onClick = (path: string) => {
    if (location.pathname !== path) navigate(path)
    setIsSidebarOpen(false) // Close sidebar on mobile after navigation
  }

  const handleProfile = () => {
    navigate('/nurse/profile')
    setShowProfileDropdown(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex w-full max-w-full overflow-x-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`fixed left-0 top-0 w-64 bg-white dark:bg-gray-800 h-screen flex flex-col shadow-2xl z-50 transition-all duration-300 overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="LabTrack Logo" className="w-20 h-20 object-contain rounded-full" />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon as any
              return (
              <button
                key={item.id}
                onClick={() => onClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {Icon ? <Icon className="w-5 h-5" /> : null}
                {item.label}
              </button>
              )
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-sky-300 to-violet-400 text-white hover:from-sky-400 hover:to-violet-500 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content with fixed header */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full min-w-0">
        {/* Fixed Header */}
        <header className={`border-b px-4 py-3 h-16 md:h-20 flex items-center flex-shrink-0 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center w-full gap-2 md:gap-4">
            {/* Left Section - Hamburger & Title */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Hamburger Menu - Mobile Only */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h1 className="text-lg md:text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                Doctor Dashboard
              </h1>
            </div>

            {/* Right Section - Dark Mode, Notifications and User Profile */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'text-yellow-400 hover:bg-gray-700 bg-gray-700/50'
                    : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Moon className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationModal(true)}
                  className={`p-2 transition-colors duration-300 hover:scale-110 ${
                    isDarkMode ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                </button>
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 md:min-w-6 md:h-6 flex items-center justify-center font-bold px-1 md:px-1.5 animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <div 
                  className="flex items-center gap-1 md:gap-2 cursor-pointer hover:bg-opacity-10 hover:bg-gray-500 p-1 md:p-2 rounded-lg transition-colors duration-300"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {/* Avatar */}
                  <img
                    src={userData?.image || userData?.avatar || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"}
                    alt={userData?.fullName || "Doctor"}
                    className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent ring-blue-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400";
                    }}
                  />

                  {/* User Info - Hide on small screens */}
                  <div className="hidden md:flex items-center gap-2">
                    <div>
                      <div className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {loading ? 'Loading...' : (userData?.fullName || userData?.username || 'Nurse')}
                      </div>
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                       Doctor
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </div>
                </div>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div 
                    className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-50 transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfile}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-300 ${
                          isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </button>
                      
                      <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                      
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-300 ${
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
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300 w-full min-w-0">
          <div className="w-full max-w-full p-2 sm:p-3 md:p-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onNotificationRead={loadUnreadCount}
      />
    </div>
  )
}

export default Layout
