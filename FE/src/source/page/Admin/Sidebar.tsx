import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    navigate("/", { replace: true });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) {
      onClose(); // Close sidebar on mobile after navigation
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative w-64 bg-white dark:bg-gray-900 max-h-screen lg:h-screen flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out transform overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="flex flex-col min-h-full">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="LabTrack Logo"
              className="w-20 h-20 object-contain rounded-full"
            />
          </div>
        </div>

      {/* Close button on mobile */}
      <div className="lg:hidden absolute top-4 right-4">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto pb-32 lg:pb-6">
        <nav className="space-y-2">
          <button
            onClick={() => handleNavigation("/admin/dashboard")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/dashboard" ||
              location.pathname === "/admin"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            Dashboard
          </button>

          <button
            onClick={() => handleNavigation("/admin/accounts")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/accounts"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Accounts
          </button>

          <button
            onClick={() => handleNavigation("/admin/instrument")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/instrument"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Instruments
          </button>

          <button
            onClick={() => handleNavigation("/admin/shifts/create")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/shifts/create"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Shift
          </button>

          <button
            onClick={() => handleNavigation("/admin/reagent-history")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/reagent-history"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.67 2 3 2.67 3 3.5v15C3 19.33 3.67 20 4.5 20h15c.83 0 1.5-.67 1.5-1.5v-15C21 2.67 20.33 2 19.5 2zM19 18.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5v-15c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5v15z" />
            </svg>
            Reagent History
          </button>

          <button
            onClick={() => handleNavigation("/admin/test-orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/test-orders"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            Test Orders
          </button>

          <button
            onClick={() => handleNavigation("/admin/event-log")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/event-log"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Event Log
          </button>

          <button
            onClick={() => handleNavigation("/admin/configuration")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/configuration"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </svg>
            Configuration
          </button>

          <button
            onClick={() => handleNavigation("/admin/edit-profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
              location.pathname === "/admin/edit-profile"
                ? "bg-gradient-to-r from-sky-100 to-violet-100 dark:from-sky-900 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-semibold"
                : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Profile
          </button>

      </nav>
      </div>
      <div className="p-4 sticky bottom-0 bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-sky-300 to-violet-400 text-white hover:from-sky-400 hover:to-violet-500 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          Logout
        </button>
      </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;

