import { useState } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/nurse' },
    { id: 'test-orders', label: 'Test Orders', path: '/nurse/test-orders' },
    { id: 'auto-review', label: 'Auto Review', path: '/nurse/auto-review' },
    { id: 'reagents', label: 'Reagents', path: '/nurse/reagents' },
    { id: 'instrument', label: 'Instrument', path: '/nurse/instrument' },
    { id: 'results', label: 'Results', path: '/nurse/results' }
  ]

  const isActive = (path: string) => {
    if (path === '/nurse') return location.pathname === '/nurse'
    return location.pathname.startsWith(path)
  }

  const onClick = (path: string) => {
    if (location.pathname !== path) navigate(path)
  }

  const handleProfile = () => {
    navigate('/nurse/profile')
    setShowProfileDropdown(false)
  }

  const handleLogout = () => {
    // TODO: Implement logout logic (clear tokens, etc.)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 w-64 bg-white h-screen flex flex-col shadow-2xl z-50">
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="LabTrack Logo" className="w-20 h-20 object-contain rounded-full" />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => onClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </button>
            ))}
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
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Header */}
        <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 px-6 py-5 h-24 flex items-center z-40">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Nurse</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-3 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">3</span>
              </div>

              {/* User Profile with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <img src="/logo.png" alt="Nurse" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <span className="text-xl font-bold text-gray-900">Nurse</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleProfile}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 pt-24 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  )
}

export default Layout


