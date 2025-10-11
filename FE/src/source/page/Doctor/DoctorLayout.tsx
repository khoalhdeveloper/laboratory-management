import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';

/**
 * Doctor Layout component - Layout chính cho Doctor
 * Authentication đã được xử lý ở Router level
 */
const DoctorLayout: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Sidebar - Fixed */}
        <DoctorSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          {/* Header - Fixed */}
          <div className="bg-white border-b border-gray-200 px-6 py-5 h-24 flex items-center flex-shrink-0">
            <div className="flex justify-between items-center w-full">
              {/* Left Section - Title */}
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Doctor Dashboard</h1>
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
                  {/* Avatar */}
                  <img
                    src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Dr. Huy"
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  {/* User Name */}
                  <div>
                    <span className="text-xl font-bold text-gray-900">Dr. Huy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
  );
};

export default DoctorLayout;
