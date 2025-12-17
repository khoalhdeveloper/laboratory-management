

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { chatAPI } from '../Axios/Axios';



function Home() {
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'ai'; time: string }>>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [_sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasWelcomed, setHasWelcomed] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for scroll-triggered animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const elementId = entry.target.getAttribute('data-animate-id');
                        if (elementId) {
                            setVisibleElements(prev => new Set([...prev, elementId]));
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all elements with data-animate-id
        const animatedElements = document.querySelectorAll('[data-animate-id]');
        animatedElements.forEach((el) => observer.observe(el));

        return () => {
            animatedElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    // Check token in URL and navigate to reset password page
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const emailFromUrl = urlParams.get('email');
        
        if (tokenFromUrl && emailFromUrl) {
            // Navigate to reset-password page with token and email in URL
            navigate('/reset-password', { replace: true });
        }
    }, [navigate]);

    // Auto scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Automatically send welcome message when opening chat for the first time
    useEffect(() => {
        if (showChat && !hasWelcomed && messages.length === 0) {
            setHasWelcomed(true);
            setIsLoading(true);
            
            const welcomeMessage = "Welcome to our laboratory management application! Please respond in a friendly and concise manner.";
            
            chatAPI.sendMessage({
                text: welcomeMessage
            })
            .then((response) => {
                if (response.data && response.data.reply) {
                    const aiResponse = {
                        text: response.data.reply.content,
                        sender: 'ai' as const,
                        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, aiResponse]);
                    
                    if (response.data.reply.sessionId) {
                        setSessionId(response.data.reply.sessionId);
                    }
                }
            })
            .catch((error: any) => {
                console.error('Error sending welcome message:', error);
                const errorResponse = {
                    text: 'Sorry, an error occurred while sending the message. Please try again later.',
                    sender: 'ai' as const,
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, errorResponse]);
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }, [showChat, hasWelcomed, messages.length]);

    // Function to send message
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            text: inputMessage,
            sender: 'user' as const,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        const messageText = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            // Send user's message directly - AI will detect language and respond accordingly
            const response = await chatAPI.sendMessage({
                text: messageText
            });

            if (response.data && response.data.reply) {
                const aiResponse = {
                    text: response.data.reply.content,
                    sender: 'ai' as const,
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiResponse]);
                
                // Save sessionId if available
                if (response.data.reply.sessionId) {
                    setSessionId(response.data.reply.sessionId);
                }
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            const errorResponse = {
                text: 'Sorry, an error occurred while sending the message. Please try again later.',
                sender: 'ai' as const,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Hero */}
            <section className="max-w-[1200px] mx-auto px-6 pt-10 pb-8 grid md:grid-cols-2 gap-8 items-center">
                <div 
                    data-animate-id="hero-left"
                    className={`transition-all duration-1000 ${visibleElements.has('hero-left') ? 'animate__animated animate__fadeInLeft' : 'opacity-0 translate-x-[-50px]'}`}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
                        <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Comprehensive</span> Laboratory
                        Management System
                    </h1>
                    <p className="mt-4 text-neutral-600 dark:text-gray-300 text-sm max-w-xl">
                        Manage users, roles, test results, reagents, instruments, and system health in one unified platform
                    </p>
                    <div className="mt-6">
                        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-2 text-sm font-semibold shadow-sm hover:from-sky-400 hover:to-violet-500">
                            Learn More
                        </button>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-xs text-neutral-600 dark:text-gray-300">
                        <div className="flex -space-x-2">
                            <img className="w-6 h-6 rounded-full border" src="https://i.pravatar.cc/24?img=1" />
                            <img className="w-6 h-6 rounded-full border" src="https://i.pravatar.cc/24?img=2" />
                            <img className="w-6 h-6 rounded-full border" src="https://i.pravatar.cc/24?img=3" />
                        </div>
                        <span className="font-semibold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">100K +</span>
                        <span>Test Results Stored</span>
                    </div>
                </div>
                <div 
                    data-animate-id="hero-right"
                    className={`relative transition-all duration-1000 ${visibleElements.has('hero-right') ? 'animate__animated animate__fadeInRight' : 'opacity-0 translate-x-[50px]'}`}
                >
                    <img
                        src="https://mdfinstruments.vn/uploaded/Goc-tu-van/bac-si-xet-nghiem-hoc-nganh-gi-1.jpg"
                        alt="Doctor performing tests in laboratory"
                        loading="lazy"
                        className="rounded-2xl w-full h-80 object-cover bg-neutral-100"
                    />
                    <div className="absolute -top-4 sm:-top-8 left-3 right-3 sm:left-auto sm:right-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-5">
                        <div className="px-3 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                <CountUp start={0} end={1000} duration={4} suffix="+" separator="," />
                            </div>
                            <div className="text-xs sm:text-xs text-neutral-500 dark:text-gray-400 mt-1 leading-tight">Tests processed per day</div>
                        </div>
                        <div className="px-3 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                <CountUp start={0} end={99.9} duration={4} suffix="%" decimals={1} />
                            </div>
                            <div className="text-xs sm:text-xs text-neutral-500 dark:text-gray-400 mt-1 leading-tight">System uptime & reliability</div>
                        </div>
                        <div className="px-3 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                <CountUp start={0} end={500} duration={4} suffix="+" separator="," />
                            </div>
                            <div className="text-xs sm:text-xs text-neutral-500 dark:text-gray-400 mt-1 leading-tight">Managed lab instruments</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section 
                data-animate-id="services"
                className={`max-w-[1200px] mx-auto px-6 py-8 transition-all duration-1000 ${visibleElements.has('services') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <h2 className="text-center text-3xl font-bold">
                    <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Comprehensive</span>
                    <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text"> Medical</span>
                    <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text"> Services</span>
                </h2>
                <div className="mt-6 grid md:grid-cols-3 gap-5">
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold">✓</span>
                            <div className="font-semibold text-gray-900 dark:text-white">General Check-Ups</div>
                        </div>
                        <img src="https://images.pexels.com/photos/5863372/pexels-photo-5863372.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="General Check-Ups" loading="lazy" className="mt-4 w-full h-44 object-cover rounded-xl bg-neutral-100" />
                        <p className="mt-3 text-sm text-neutral-600 dark:text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold">✓</span>
                            <div className="font-semibold text-gray-900 dark:text-white">Specialized Services</div>
                        </div>
                        <img src="https://images.pexels.com/photos/8376235/pexels-photo-8376235.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Specialized Services" loading="lazy" className="mt-4 w-full h-44 object-cover rounded-xl bg-neutral-100" />
                        <p className="mt-3 text-sm text-neutral-600 dark:text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold">✓</span>
                            <div className="font-semibold text-gray-900 dark:text-white">Laboratory Services</div>
                        </div>
                        <img src="https://images.pexels.com/photos/3735703/pexels-photo-3735703.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Laboratory Services" loading="lazy" className="mt-4 w-full h-44 object-cover rounded-xl bg-neutral-100" />
                        <p className="mt-3 text-sm text-neutral-600 dark:text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
            </section>

            {/* Why choose us + video */}
            <section className="max-w-[1200px] mx-auto px-6 py-8 grid md:grid-cols-2 gap-8 items-center">
                <img
                    src="https://images.pexels.com/photos/5726808/pexels-photo-5726808.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Doctor with patients"
                    loading="lazy"
                    data-animate-id="about-left"
                    className={`rounded-2xl w-full h-80 object-cover bg-neutral-100 transition-all duration-1000 ${visibleElements.has('about-left') ? 'animate__animated animate__fadeInLeftBig' : 'opacity-0 translate-x-[-100px]'}`}
                />
                <div 
                    data-animate-id="about-right"
                    className={`transition-all duration-1000 ${visibleElements.has('about-right') ? 'animate__animated animate__fadeInRightBig' : 'opacity-0 translate-x-[100px]'}`}
                >
                    <div className="font-semibold">
                        <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">ABOUT</span>
                        <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text"> US</span>
                    </div>
                    <h3 className="text-3xl font-extrabold leading-snug text-gray-900 dark:text-white">Professional Doctor With Years Of Experience</h3>
                    <p className="mt-3 text-neutral-600 dark:text-gray-300 text-sm">Lorem ipsum dolor sit amet consectetur. Nec metus nibh eget ipsum nisl in venenatis.</p>
                    <div className="mt-5 flex items-center gap-4">
                        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-2 text-sm font-semibold shadow-sm hover:from-sky-400 hover:to-violet-500">Learn more</button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-sky-300 hover:to-violet-400 hover:text-white transition-all">
                            <span className="grid place-items-center w-5 h-5 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white">▶</span>
                            Watch video
                        </button>
                    </div>
                </div>
            </section>

            {/* Our Expert Team */}
            <section 
                data-animate-id="team"
                className={`max-w-[1200px] mx-auto px-6 py-10 transition-all duration-1000 ${visibleElements.has('team') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <h3 className="text-center text-3xl font-bold">
                    <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Our</span>
                    <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text"> Expert</span>
                    <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text"> Team</span>
                </h3>
                <div className="mt-6 grid md:grid-cols-4 gap-6">
                    <img
                        src="https://tse1.mm.bing.net/th/id/OIP.zyOMCzoT02Q5SvT6BWSzvQHaGM?rs=1&pid=ImgDetMain&o=7&rm=3"
                        alt="Doctor portrait"
                        loading="lazy"
                        className="rounded-2xl w-full h-72 object-cover"
                    />
                    <div className="relative overflow-hidden rounded-2xl">
                        <img
                            src="https://png.pngtree.com/thumb_back/fw800/background/20230227/pngtree-female-scientist-researcher-conducting-an-experiment-in-a-labora-female-scientist-image_1720513.jpg"
                            alt="Senior doctor"
                            loading="lazy"
                            className="w-full h-72 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-700/80 to-transparent" />
                        <div className="absolute left-0 right-0 bottom-3 px-4">
                            <div className="rounded-full bg-white/90 dark:bg-gray-800/90 text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-sm font-semibold px-4 py-2 w-fit shadow">
                                Jordan Thompson
                                <span className="ml-2 text-xs font-normal text-neutral-600 dark:text-gray-400">Senior Doctor</span>
                            </div>
                            <button className="mt-2 inline-flex items-center gap-1 text-xs rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-3 py-1 shadow hover:from-sky-400 hover:to-violet-500">
                                Doctor profile
                                <span className="inline-block -rotate-45">↗</span>
                            </button>
                        </div>
                    </div>
                    <img
                        src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1200"
                        alt="Doctor portrait"
                        loading="lazy"
                        className="rounded-2xl w-full h-72 object-cover"
                    />
                    <img
                        src="https://images.pexels.com/photos/8460094/pexels-photo-8460094.jpeg?auto=compress&cs=tinysrgb&w=1200"
                        alt="Doctor portrait"
                        loading="lazy"
                        className="rounded-2xl w-full h-72 object-cover"
                    />
                </div>
            </section>

            {/* Testimonials simplified */}
            <section className="max-w-[1200px] mx-auto px-6 py-10 ">
                <div 
                    data-animate-id="testimonials-header"
                    className={`text-center transition-all duration-1000 ${visibleElements.has('testimonials-header') ? 'animate__animated animate__rotateIn' : 'opacity-0 scale-50'}`}
                >
                    <div className="font-semibold">
                        <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">TESTIMONIAL</span>
                    </div>
                    <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">Customer Feedback</h3>
                </div>
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div 
                        data-animate-id="testimonial-1"
                        className={`rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-all duration-1000 ${visibleElements.has('testimonial-1') ? 'animate__animated animate__rotateInDownLeft' : 'opacity-0 translate-x-[-100px] rotate-[-10deg]'}`}
                    >
                        <p className="text-neutral-700 dark:text-gray-300 text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <div className="mt-4 flex items-center gap-3">
                            <img className="w-10 h-10 rounded-full" src="https://i.pravatar.cc/40?img=5" />
                            <div>
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">Wade Warren</div>
                                <div className="text-[11px] text-neutral-500 dark:text-gray-400">GRAPHIC DESIGNER</div>
                            </div>
                        </div>
                    </div>
                    <div 
                        data-animate-id="testimonial-2"
                        className={`rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-all duration-1000 ${visibleElements.has('testimonial-2') ? 'animate__animated animate__rotateInDownRight' : 'opacity-0 translate-x-[100px] rotate-[10deg]'}`}
                    >
                        <p className="text-neutral-700 dark:text-gray-300 text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <div className="mt-4 flex items-center gap-3">
                            <img className="w-10 h-10 rounded-full" src="https://i.pravatar.cc/40?img=6" />
                            <div>
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">Wade Warren</div>
                                <div className="text-[11px] text-neutral-500 dark:text-gray-400">GRAPHIC DESIGNER</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact + News simplified */}
            <section 
                data-animate-id="contact"
                className={`max-w-[1200px] mx-auto px-6 pb-16 transition-all duration-1000 ${visibleElements.has('contact') ? 'animate__animated animate__bounceIn' : 'opacity-0 scale-75'}`}
            >
                <div className="rounded-3xl bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-700 text-white p-6 grid md:grid-cols-2 gap-6 items-center">
                    <img
                        src="https://images.pexels.com/photos/8460343/pexels-photo-8460343.jpeg?auto=compress&cs=tinysrgb&w=1000"
                        alt="Doctor portrait"
                        loading="lazy"
                        className="rounded-2xl w-full h-64 object-cover hidden md:block bg-neutral-100"
                    />
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            className="rounded-lg bg-white/15 dark:bg-gray-600/30 border border-white/30 dark:border-gray-500/50 text-white placeholder-white/80 dark:placeholder-gray-300/80 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/60 dark:focus:ring-gray-400/60"
                            placeholder="Your name"
                        />
                        <input
                            className="rounded-lg bg-white/15 dark:bg-gray-600/30 border border-white/30 dark:border-gray-500/50 text-white placeholder-white/80 dark:placeholder-gray-300/80 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/60 dark:focus:ring-gray-400/60"
                            placeholder="Your email"
                        />
                        <input
                            className="rounded-lg bg-white/15 dark:bg-gray-600/30 border border-white/30 dark:border-gray-500/50 text-white placeholder-white/80 dark:placeholder-gray-300/80 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/60 dark:focus:ring-gray-400/60"
                            placeholder="Phone number"
                        />
                        <select
                            className="rounded-lg bg-white/15 dark:bg-gray-600/30 border border-white/30 dark:border-gray-500/50 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/60 dark:focus:ring-gray-400/60"
                            defaultValue=""
                        >
                            <option value="" disabled className="text-neutral-800 dark:text-gray-300">Select Services</option>
                            <option className="text-neutral-800 dark:text-gray-300">General Check-Ups</option>
                            <option className="text-neutral-800 dark:text-gray-300">Laboratory</option>
                            <option className="text-neutral-800 dark:text-gray-300">Consultation</option>
                        </select>
                        <textarea
                            className="rounded-lg bg-white/15 dark:bg-gray-600/30 border border-white/30 dark:border-gray-500/50 text-white placeholder-white/80 dark:placeholder-gray-300/80 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/60 dark:focus:ring-gray-400/60 md:col-span-2"
                            placeholder="Message"
                            rows={4}
                        />
                        <div className="md:col-span-2">
                            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-2 text-sm font-semibold shadow-sm hover:from-sky-400 hover:to-violet-500 transition-all">Send message</button>
                        </div>
                    </form>
                </div>

                <div 
                    data-animate-id="news"
                    className={`mt-10 transition-all duration-1000 ${visibleElements.has('news') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text">News & Articles</h3>
                        <button className="rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-4 py-1.5 text-sm hover:from-sky-400 hover:to-violet-500">View all</button>
                    </div>
                    <div className="mt-5 grid md:grid-cols-3 gap-5">
                        {[
                            'https://png.pngtree.com/thumb_back/fw800/background/20230306/pngtree-lab-assistant-testing-blood-samples-in-hospital-photo-image_1820884.jpg',
                            'https://vinalab.org.vn/Upload/kien-thuc-huu-ich/cong-dung-phong-thi-nghiem.jpg',
                            'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop',
                        ].map((src, idx) => (
                            <article key={idx} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <img src={src} alt="Laboratory article" loading="lazy" className="w-full h-40 object-cover bg-neutral-100" />
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Lorem ipsum dolor sit amet, consectetur adipis cing elit ligula non</h4>
                                    <button className="mt-3 text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-sm font-semibold hover:from-sky-400 hover:to-violet-500">Learn more</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chat AI Button & Back to Top Button */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {/* Chat AI Button */}
                <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden cursor-pointer"
                    aria-label="Chat with Lab AI"
                    title="Chat with Lab AI"
                >
                    {/* Chatbot Icon - Chatbot image */}
                    <img 
                        src="/chatbot-icon.jpg" 
                        alt="Lab AI" 
                        className="w-full h-full object-cover rounded-full"
                    />
                    {/* AI Badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        AI
                    </span>
                </button>

                {/* Back to Top Button */}
                {showBackToTop && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white shadow-lg hover:from-sky-400 hover:to-violet-500 transition-all duration-300 flex items-center justify-center"
                        aria-label="Back to top"
                        title="Back to top"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M12 2l8 8h-5v10h-6V10H4l8-8z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Chat Window */}
            {showChat && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-700 dark:to-gray-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/chatbot-icon.jpg" 
                                alt="Lab AI" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                            <div>
                                <h3 className="font-bold text-lg">Lab AI</h3>
                                <p className="text-xs opacity-90">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowChat(false);
                                // Reset when closing chat so reopening will send welcome message
                                setTimeout(() => {
                                    setHasWelcomed(false);
                                    setMessages([]);
                                }, 300);
                            }}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Close chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                        {messages.length === 0 && !isLoading ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                <p className="text-sm">Loading...</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.sender === 'ai' && (
                                        <img 
                                            src="/chatbot-icon.jpg" 
                                            alt="Lab AI" 
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-sky-300 to-violet-400 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-start">
                                <img 
                                    src="/chatbot-icon.jpg" 
                                    alt="Lab AI" 
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && inputMessage.trim()) {
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white flex items-center justify-center hover:from-sky-400 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home

