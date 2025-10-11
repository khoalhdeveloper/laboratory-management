import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all stored user data
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    // Navigate to home page
    navigate("/", { replace: true });
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen flex flex-col shadow-2xl relative z-50 transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center justify-center">
          <img
            src="/logo.png"
            alt="LabTrack Logo"
            className="w-20 h-20 object-contain rounded-full"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {/* Dashboard */}
          <a
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
          </a>

          {/* Account Management */}
          <a
            href="/admin/accounts"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
          </a>

          {/* Doctor Management */}
          <a
            href="/admin/doctors"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === "/admin/doctors"
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
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
            </svg>
            Doctors
          </a>


          {/* Reagent History */}
          <a
            href="/admin/reagent-history"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
          </a>

          {/* Event Log */}
          <a
            href="/admin/event-log"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
          </a>

      </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4">
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
  );
};

export default Sidebar;

