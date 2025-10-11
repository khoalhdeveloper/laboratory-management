import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ThemeProvider } from './context/ThemeContext';

/**
 * Admin Home component - Layout chính cho Admin
 * Authentication đã được xử lý ở Router level
 */
function Home() {
    return (
        <ThemeProvider>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <Header />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}

export default Home;
