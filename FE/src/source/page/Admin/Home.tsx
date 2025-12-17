import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Hamburger menu button for mobile */}
                <div className="lg:hidden fixed top-4 left-4 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Home;
