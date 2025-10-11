import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DoctorSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all stored user data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');

        // Navigate to home page
        navigate('/', { replace: true });
    };

    return (
        <div className="w-64 bg-white h-screen flex flex-col shadow-2xl fixed left-0 top-0 z-50">
            {/* Logo Section - Fixed */}
            <div className="p-6 flex-shrink-0">
                <div className="flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="LabTrack Logo"
                        className="w-20 h-20 object-contain rounded-full"
                    />
                </div>
            </div>

            {/* Navigation Menu - Scrollable */}
            <div className="flex-1 px-4 py-6 overflow-y-auto">
                <nav className="space-y-2">
                    {/* Dashboard */}
                    <a
                        href="/doctor/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/doctor/dashboard' || location.pathname === '/doctor'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        Dashboard
                    </a>

                    {/* Event Log */}
                    <a
                        href="/doctor/event-log"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/doctor/event-log'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Event Log
                    </a>

                    {/* Reagent History */}
                    <a
                        href="/doctor/reagent-history"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/doctor/reagent-history'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Reagent History
                    </a>

                    {/* Instruments */}
                    <a
                        href="/doctor/instrument"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/doctor/instrument'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Instruments
                    </a>

                    {/* Export */}
                    <a
                        href="/doctor/export"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === '/doctor/export'
                            ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-violet-700 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </a>
                </nav>
            </div>

            {/* Logout Button - Fixed at Bottom */}
            <div className="p-4 flex-shrink-0">
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
};

export default DoctorSidebar;
