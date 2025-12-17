import { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { chatAPI } from '../Axios/Axios';


function About() {
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

    // Auto scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Tự động gửi welcome message khi mở chat lần đầu
    useEffect(() => {
        if (showChat && !hasWelcomed && messages.length === 0) {
            setHasWelcomed(true);
            setIsLoading(true);
            
            const welcomeMessage = "Chào mừng bạn đến với ứng dụng quản lý phòng thí nghiệm của chúng tôi!";
            const promptText = `Hãy trả lời thật ngắn gọn bằng tiếng Anh: ${welcomeMessage}`;
            
            chatAPI.sendMessage({
                text: promptText
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

    // Hàm gửi tin nhắn
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
            // Thêm prompt để yêu cầu trả lời ngắn gọn theo ngôn ngữ của user
            const promptText = `Hãy trả lời thật ngắn gọn bằng cùng ngôn ngữ với tin nhắn sau: ${messageText}`;
            const response = await chatAPI.sendMessage({
                text: promptText
            });

            if (response.data && response.data.reply) {
                const aiResponse = {
                    text: response.data.reply.content,
                    sender: 'ai' as const,
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiResponse]);
                
                // Lưu sessionId nếu có
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
        <div className="bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Hero Section */}
            <section 
                data-animate-id="hero"
                className={`bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-700 text-white py-20 transition-all duration-1000 ${visibleElements.has('hero') ? 'animate__animated animate__fadeInDown' : 'opacity-0 translate-y-[-50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        About Our Laboratory
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Leading the way in blood chemistry and laboratory testing with cutting-edge technology and expert professionals
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section 
                data-animate-id="mission-vision"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('mission-vision') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div 
                        data-animate-id="mission"
                        className={`transition-all duration-1000 ${visibleElements.has('mission') ? 'animate__animated animate__fadeInLeft' : 'opacity-0 translate-x-[-50px]'}`}
                    >
                        <h2 className="text-3xl font-bold mb-6">
                            {"Our Mission".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Our Mission".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <p className="text-neutral-600 dark:text-gray-300 mb-6">
                            To provide accurate, reliable, and timely laboratory testing services that support healthcare providers
                            in delivering the best possible patient care. We are committed to maintaining the highest standards
                            of quality and precision in every test we perform.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center text-sm font-bold">✓</span>
                                <p className="text-sm text-neutral-700 dark:text-gray-300">Accurate test results with 99.9% reliability</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center text-sm font-bold">✓</span>
                                <p className="text-sm text-neutral-700 dark:text-gray-300">Fast turnaround times for critical tests</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center text-sm font-bold">✓</span>
                                <p className="text-sm text-neutral-700 dark:text-gray-300">Advanced technology and equipment</p>
                            </div>
                        </div>
                    </div>
                    <div 
                        data-animate-id="vision"
                        className={`transition-all duration-1000 ${visibleElements.has('vision') ? 'animate__animated animate__fadeInRight' : 'opacity-0 translate-x-[50px]'}`}
                    >
                        <h2 className="text-3xl font-bold mb-6">
                            {"Our Vision".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Our Vision".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <p className="text-neutral-600 dark:text-gray-300 mb-6">
                            To be the leading laboratory testing facility in the region, recognized for our innovation,
                            accuracy, and commitment to advancing medical science through cutting-edge blood chemistry
                            and diagnostic testing.
                        </p>
                        <div className="bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-700 dark:to-gray-600 text-white p-6 rounded-2xl">
                            <h3 className="font-bold text-lg mb-2">Quality Promise</h3>
                            <p className="text-sm opacity-90">
                                Every test is performed with the utmost care and precision, ensuring that healthcare providers
                                receive the most accurate information to guide patient treatment decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section 
                data-animate-id="story"
                className={`bg-white dark:bg-gray-800 py-16 transition-all duration-1000 ${visibleElements.has('story') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            {"Our Story".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Our Story".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Founded with a vision to revolutionize laboratory testing through innovation and excellence
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">
                                {visibleElements.has('story') && (
                                    <CountUp start={0} end={2015} duration={3} separator="" />
                                )}
                            </div>
                            <h3 className="font-semibold mb-2">
                                <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Foundation</span>
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Started as a small laboratory with a focus on blood chemistry testing</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">
                                {visibleElements.has('story') && (
                                    <CountUp start={0} end={2018} duration={3} separator="" />
                                )}
                            </div>
                            <h3 className="font-semibold mb-2">
                                <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Expansion</span>
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Expanded services to include comprehensive diagnostic testing</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">
                                {visibleElements.has('story') && (
                                    <CountUp start={0} end={2023} duration={3} separator="" />
                                )}
                            </div>
                            <h3 className="font-semibold mb-2">
                                <span className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">Innovation</span>
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Launched advanced molecular diagnostics and genetic testing</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Team Section */}
             <section 
                data-animate-id="team"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('team') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        {"Meet Our Expert Team".split(' ').map((word, index) => (
                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                {word}
                                {index < "Meet Our Expert Team".split(' ').length - 1 && '\u00A0'}
                            </span>
                        ))}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Our highly qualified professionals bring years of experience in laboratory medicine and diagnostic testing
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <img
                            src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"
                            alt="Dr. Sarah Johnson"
                            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                        />
                        <h3 className="font-bold text-lg">
                            {"Dr. Sarah Johnson".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Dr. Sarah Johnson".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h3>
                        <p className="text-sky-600 dark:text-sky-400 font-semibold mb-2">Chief Laboratory Director</p>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">15+ years experience in clinical chemistry and laboratory management</p>
                    </div>
                    <div className="text-center">
                        <img
                            src="https://images.pexels.com/photos/8460094/pexels-photo-8460094.jpeg?auto=compress&cs=tinysrgb&w=400"
                            alt="Dr. Michael Chen"
                            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                        />
                        <h3 className="font-bold text-lg">
                            {"Dr. Michael Chen".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Dr. Michael Chen".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h3>
                        <p className="text-sky-600 dark:text-sky-400 font-semibold mb-2">Hematology Specialist</p>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">Expert in blood cell analysis and coagulation studies</p>
                    </div>
                    <div className="text-center">
                        <img
                            src="https://images.pexels.com/photos/5726808/pexels-photo-5726808.jpeg?auto=compress&cs=tinysrgb&w=400"
                            alt="Dr. Emily Rodriguez"
                            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                        />
                        <h3 className="font-bold text-lg">
                            {"Dr. Emily Rodriguez".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Dr. Emily Rodriguez".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h3>
                        <p className="text-sky-600 dark:text-sky-400 font-semibold mb-2">Molecular Diagnostics Lead</p>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">Specialist in genetic testing and molecular pathology</p>
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section 
                data-animate-id="certifications"
                className={`bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-700 text-white py-16 transition-all duration-1000 ${visibleElements.has('certifications') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Accreditations & Certifications</h2>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            We maintain the highest standards through rigorous accreditation and continuous quality improvement
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 text-white grid place-items-center font-bold text-xl mx-auto mb-4">🏆</div>
                            <h3 className="font-semibold mb-2">CAP Certified</h3>
                            <p className="text-sm opacity-90">College of American Pathologists</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 text-white grid place-items-center font-bold text-xl mx-auto mb-4">🔬</div>
                            <h3 className="font-semibold mb-2">CLIA Licensed</h3>
                            <p className="text-sm opacity-90">Clinical Laboratory Improvement</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 text-white grid place-items-center font-bold text-xl mx-auto mb-4">⭐</div>
                            <h3 className="font-semibold mb-2">ISO 15189</h3>
                            <p className="text-sm opacity-90">Medical Laboratory Quality</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 text-white grid place-items-center font-bold text-xl mx-auto mb-4">🛡️</div>
                            <h3 className="font-semibold mb-2">HIPAA Compliant</h3>
                            <p className="text-sm opacity-90">Patient Privacy Protection</p>
                        </div>
                    </div>
                </div>
            </section>
               
            {/* Statistics */}
            <section 
                data-animate-id="statistics"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('statistics') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        {"Our Impact".split(' ').map((word, index) => (
                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                {word}
                                {index < "Our Impact".split(' ').length - 1 && '\u00A0'}
                            </span>
                        ))}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Numbers that reflect our commitment to excellence and service
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-2">
                            {visibleElements.has('statistics') && (
                                <CountUp start={0} end={50000} duration={4} suffix="+" separator="," />
                            )}
                        </div>
                        <p className="text-neutral-600 dark:text-gray-300">Tests Performed Monthly</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-2">
                            {visibleElements.has('statistics') && (
                                <CountUp start={0} end={99.9} duration={4} suffix="%" decimals={1} />
                            )}
                        </div>
                        <p className="text-neutral-600 dark:text-gray-300">Accuracy Rate</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-2">24/7</div>
                        <p className="text-neutral-600 dark:text-gray-300">Emergency Testing</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-2">
                            {visibleElements.has('statistics') && (
                                <CountUp start={0} end={15} duration={4} suffix="+" />
                            )}
                        </div>
                        <p className="text-neutral-600 dark:text-gray-300">Years of Experience</p>
                    </div>
                </div>
            </section>

            {/* Chat AI Button & Back to Top Button */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {/* Chat AI Button */}
                <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden cursor-pointer"
                    aria-label="Trò chuyện với Lab AI"
                    title="Trò chuyện với Lab AI"
                >
                    {/* Chatbot Icon - Ảnh chatbot */}
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
                        aria-label="Về đầu trang"
                        title="Về đầu trang"
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
                                setTimeout(() => {
                                    setHasWelcomed(false);
                                    setMessages([]);
                                }, 300);
                            }}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Đóng chat"
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
                                aria-label="Gửi tin nhắn"
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

export default About
