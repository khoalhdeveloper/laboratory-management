
import { useState, useEffect, useRef } from 'react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

function Footer() {
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
    const [isVisible, setIsVisible] = useState(false);
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, [isVisible]);

    return (
        <footer 
            ref={footerRef}
            className={`bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-900 text-white border-t border-sky-400 dark:border-gray-700 transition-all duration-1000 ${isVisible ? 'animate__animated animate__zoomIn' : 'opacity-0 scale-75'}`}
        >
            <div className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand + Social */}
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="relative inline-grid place-items-center w-14 h-14">
                                <span className="absolute inset-0 rounded-full bg-white" />
                                <img src="/logo.png" alt="LabTrack" className="relative w-12 h-12 object-contain rounded-full" />
                            </span>
                        </div>
                        <p className="mt-4 text-sm opacity-90 dark:opacity-80 max-w-xs">
                           LabTrack provides accurate testing services for blood, kidney function, and urine analysis to support early diagnosis and effective health monitoring
                        </p>
                        <div className="mt-4 flex items-center gap-3 text-white/80">
                            {/* social icons */}
                            <a aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M13 10h3l-1 4h-2v7h-4v-7H7v-4h2V8c0-2.2 1.2-5 5-5h3v4h-2c-.7 0-1 .3-1 1v2z" /></svg>
                            </a>
                            <a aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
                            </a>
                            <a aria-label="YouTube" className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23 7s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.8C16.9 3.7 12 3.7 12 3.7h0s-4.9 0-8.1.2c-.4 0-1.3 0-2.1.8C1.2 5.4 1 7 1 7S.8 8.9.8 10.9v2.1C.8 15 1 17 1 17s.2 1.6.8 2.3c.8.8 1.9.8 2.4.9 1.8.2 7.8.2 7.8.2s4.9 0 8.1-.2c.4 0 1.3 0 2.1-.8.6-.7.8-2.3.8-2.3s.2-2 .2-4v-2c0-2-.2-4-.2-4Zm-13 8.3V8.1l6.2 3.6L10 15.3Z" /></svg>
                            </a>
                            <a aria-label="X" className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M14.7 3h3.1l-6.7 7.7L20 21h-6.2l-4.4-5.6L4.3 21H1.2l7.2-8.3L2 3h6.3l4 5.2L14.7 3Z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Columns */}
                    <div>
                        <div className="text-white/90 dark:text-gray-200 font-semibold">Company</div>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><a className="hover:underline">About Us</a></li>
                            <li><a className="hover:underline">Vision & Mission</a></li>
                            <li><a className="hover:underline">Leadership</a></li>
                            <li><a className="hover:underline">Careers</a></li>
                            <li><a className="hover:underline">News & Article</a></li>
                        </ul>
                    </div>

                    <div>
                        <div className="text-white/90 dark:text-gray-200 font-semibold">Support</div>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><a className="hover:underline">Help Center</a></li>
                            <li><a className="hover:underline">FAQ</a></li>
                            <li><a className="hover:underline">Contact Us</a></li>
                            <li><a className="hover:underline">Tickets</a></li>
                            <li><a className="hover:underline">Get an Appointment</a></li>
                        </ul>
                    </div>

                    <div>
                        <div className="text-white/90 dark:text-gray-200 font-semibold">Contact Info</div>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>support@domain.com</li>
                            <li>1234 Parker Rd. Allentown, New Mexico 12345</li>
                            <li>(012) 0123-4567</li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-8 h-px bg-white/30" />

                {/* Bottom bar */}
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                    <div className="opacity-90 dark:opacity-80">Privacy Policy</div>
                    <div className="opacity-90 dark:opacity-80">Terms & Services</div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

