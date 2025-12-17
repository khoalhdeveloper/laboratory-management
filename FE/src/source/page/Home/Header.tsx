
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useGlobalTheme();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (isMenuOpen) {
                const target = event.target as HTMLElement;
                const menuElement = document.querySelector('[data-mobile-menu]');
                const hamburgerElement = document.querySelector('[data-hamburger-button]');

                if (menuElement && hamburgerElement &&
                    !menuElement.contains(target) &&
                    !hamburgerElement.contains(target)) {
                    setIsMenuOpen(false);
                }
            }
        };

        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="bg-white/95 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-gradient-to-r dark:supports-[backdrop-filter]:from-gray-800 dark:supports-[backdrop-filter]:to-gray-900 border-b border-neutral-200/50 dark:border-gray-700/50">
            <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between gap-6 relative">
                {/* Logo */}
                <a href="/" className="flex items-center gap-3">
                    <span className="relative inline-grid place-items-center w-16 h-16 md:w-20 md:h-20">
                        <span className="absolute inset-0 rounded-full bg-neutral-100 dark:bg-white" />
                        <img src="/logo.png" alt="LabTrack" className="relative w-12 h-12 md:w-14 md:h-14 object-contain rounded-full" />
                    </span>
                </a>

                {/* Desktop Nav */}
                <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12 text-lg text-neutral-900 dark:text-white font-semibold">
                    <a
                        href="/"
                        className={`font-semibold relative transition-colors ${location.pathname === '/'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-10 after:bg-gradient-to-r after:from-sky-300 after:to-violet-400 after:rounded-full'
                            : 'text-neutral-900 dark:text-white/90 hover:text-neutral-700 dark:hover:text-white'
                            }`}
                    >
                        Home
                    </a>
                    <a
                        href="/services"
                        className={`font-semibold relative transition-colors ${location.pathname === '/services'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-10 after:bg-gradient-to-r after:from-sky-300 after:to-violet-400 after:rounded-full'
                            : 'text-neutral-900 dark:text-white/90 hover:text-neutral-700 dark:hover:text-white'
                            }`}
                    >
                        Services
                    </a>
                    <a
                        href="/about"
                        className={`font-semibold relative transition-colors ${location.pathname === '/about'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-10 after:bg-gradient-to-r after:from-sky-300 after:to-violet-400 after:rounded-full'
                            : 'text-neutral-900 dark:text-white/90 hover:text-neutral-700 dark:hover:text-white'
                            }`}
                    >
                        About
                    </a>
                    <a
                        href="/contact"
                        className={`font-semibold relative transition-colors ${location.pathname === '/contact'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-10 after:bg-gradient-to-r after:from-sky-300 after:to-violet-400 after:rounded-full'
                            : 'text-neutral-900 dark:text-white/90 hover:text-neutral-700 dark:hover:text-white'
                            }`}
                    >
                        Contact
                    </a>
                    <a
                        href="/blog"   
                        className={`font-semibold relative transition-colors ${location.pathname === '/blog'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-10 after:bg-gradient-to-r after:from-sky-300 after:to-violet-400 after:rounded-full'
                            : 'text-neutral-900 dark:text-white/90 hover:text-neutral-700 dark:hover:text-white'
                            }`}
                    >
                        News
                    </a>
                </nav>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center ml-auto gap-4">
                    {/* Dark Mode Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                    >
                        {isDarkMode ? (
                            // Sun icon for light mode
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                        ) : (
                            // Moon icon for dark mode
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    
                    <a href="/login" className="rounded-full bg-gradient-to-r from-sky-300 to-violet-400 dark:bg-white/20 hover:from-sky-400 hover:to-violet-500 dark:hover:bg-white/30 text-white px-7 py-2.5 text-lg font-bold shadow-sm dark:border dark:border-white/30 dark:hover:border-white/50 transition-all">
                        SIGN IN
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
                    aria-label="Toggle menu"
                    data-hamburger-button
                >
                    <span className={`w-6 h-0.5 bg-neutral-700 dark:bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-neutral-700 dark:bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-neutral-700 dark:bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </button>
            </div>

            {/* Mobile Menu Portal */}
            {isMenuOpen && createPortal(
                <>
                    {/* Mobile Menu Overlay */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm"
                        style={{ 
                            zIndex: 99999,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                        onClick={() => {
                            setIsMenuOpen(false);
                        }}
                    />

                    {/* Mobile Menu */}
                    <div
                        className={`md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 border-b-2 border-neutral-300 dark:border-gray-700 shadow-2xl transition-all duration-300 overflow-y-auto ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'}`}
                        style={{ 
                            zIndex: 999999,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            width: '100%',
                            height: 'auto',
                            maxHeight: '100vh',
                            transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)'
                        }}
                        data-mobile-menu
                    >
                <nav className="px-3 py-3 space-y-2">
                    <a
                        href="/"
                        className={`block text-base font-semibold py-1 transition-colors ${location.pathname === '/'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text border-b-2 border-transparent bg-gradient-to-r from-sky-300 to-violet-400 pb-1'
                            : 'text-neutral-700 dark:text-white/90 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                    >
                        Home
                    </a>
                    <a
                        href="/services"
                        className={`block text-base font-semibold py-1 transition-colors ${location.pathname === '/services'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text border-b-2 border-transparent bg-gradient-to-r from-sky-300 to-violet-400 pb-1'
                            : 'text-neutral-700 dark:text-white/90 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                    >
                        Services
                    </a>
                    <a
                        href="/about"
                        className={`block text-base font-semibold py-1 transition-colors ${location.pathname === '/about'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text border-b-2 border-transparent bg-gradient-to-r from-sky-300 to-violet-400 pb-1'
                            : 'text-neutral-700 dark:text-white/90 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                    >
                        About
                    </a>
                    <a
                        href="/contact"
                        className={`block text-base font-semibold py-1 transition-colors ${location.pathname === '/contact'
                            ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text border-b-2 border-transparent bg-gradient-to-r from-sky-300 to-violet-400 pb-1'
                            : 'text-neutral-700 dark:text-white/90 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                    >
                        Contact
                    </a>
                    <div className="pt-3 border-t border-neutral-200 dark:border-gray-700 w-full">
                        {/* Mobile Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center gap-2 w-full mb-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                        >
                            {isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-700">
                                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        
                        <a href="/login" className="block w-full text-center rounded-full bg-gradient-to-r from-sky-300 to-violet-400 dark:bg-white/20 hover:from-sky-400 hover:to-violet-500 dark:hover:bg-white/30 text-white px-3 py-2 text-sm font-bold shadow-sm dark:border dark:border-white/30 dark:hover:border-white/50 transition-all">
                            SIGN IN
                        </a>
                    </div>
                </nav>
                    </div>
                </>,
                document.body
            )}
        </header>
    )
}

export default Header

