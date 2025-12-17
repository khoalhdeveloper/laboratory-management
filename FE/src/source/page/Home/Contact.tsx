import React, { useState, useEffect, useRef } from 'react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { chatAPI } from '../Axios/Axios';

function Contact() {
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
    });

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

    // Automatically send welcome message when opening chat for the first time
    useEffect(() => {
        if (showChat && !hasWelcomed && messages.length === 0) {
            setHasWelcomed(true);
            setIsLoading(true);
            
            const welcomeMessage = "Welcome to our laboratory management application!";
            const promptText = `Please respond briefly in English: ${welcomeMessage}`;
            
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
            // Add prompt to request brief response in user's language
            const promptText = `Please respond briefly in the same language as the following message: ${messageText}`;
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will contact you soon.');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                        Contact Our Laboratory
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Get in touch with our team for laboratory testing services, appointments, or general inquiries
                    </p>
                </div>
            </section>

              {/* Contact Information */}
            <section 
                data-animate-id="contact-info"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('contact-info') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div 
                        data-animate-id="contact-left"
                        className={`transition-all duration-1000 ${visibleElements.has('contact-left') ? 'animate__animated animate__fadeInLeft' : 'opacity-0 translate-x-[-50px]'}`}
                    >
                        <h2 className="text-3xl font-bold mb-6">
                            {"Get in Touch".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Get in Touch".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center">
                                    📍
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {"Laboratory Address".split(' ').map((word, index) => (
                                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                                {word}
                                                {index < "Laboratory Address".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-gray-300">
                                        1234 Medical Center Drive<br />
                                        Suite 200, Laboratory Building<br />
                                        Healthcare District, CA 90210
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center">
                                    📞
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {"Phone Numbers".split(' ').map((word, index) => (
                                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                                {word}
                                                {index < "Phone Numbers".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-gray-300">
                                        Main: (555) 123-4567<br />
                                        Emergency: (555) 123-HELP<br />
                                        Fax: (555) 123-4568
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center">
                                    ✉️
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {"Email Addresses".split(' ').map((word, index) => (
                                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                                {word}
                                                {index < "Email Addresses".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-gray-300">
                                        General: info@labtest.com<br />
                                        Results: results@labtest.com<br />
                                        Emergency: emergency@labtest.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center">
                                    🕒
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {"Operating Hours".split(' ').map((word, index) => (
                                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                                {word}
                                                {index < "Operating Hours".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-gray-300">
                                        Monday - Friday: 6:00 AM - 8:00 PM<br />
                                        Saturday: 7:00 AM - 4:00 PM<br />
                                        Sunday: 8:00 AM - 2:00 PM<br />
                                        <span className="text-sky-600 font-semibold">Emergency: 24/7</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                  
                    {/* Contact Form */}
                    <div 
                        data-animate-id="contact-right"
                        className={`transition-all duration-1000 ${visibleElements.has('contact-right') ? 'animate__animated animate__fadeInRight' : 'opacity-0 translate-x-[50px]'}`}
                    >
                        <h2 className="text-3xl font-bold mb-6">
                            {"Send Us a Message".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Send Us a Message".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-gray-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-gray-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-gray-300 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-gray-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-gray-300 mb-2">Service Needed</label>
                                    <select
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-gray-500"
                                        required
                                    >
                                        <option value="" className="text-gray-900 dark:text-white">Select a service</option>
                                        <option value="blood-chemistry" className="text-gray-900 dark:text-white">Blood Chemistry Analysis</option>
                                        <option value="hematology" className="text-gray-900 dark:text-white">Hematology Testing</option>
                                        <option value="immunology" className="text-gray-900 dark:text-white">Immunology & Serology</option>
                                        <option value="microbiology" className="text-gray-900 dark:text-white">Microbiology Testing</option>
                                        <option value="toxicology" className="text-gray-900 dark:text-white">Toxicology Screening</option>
                                        <option value="specialized" className="text-gray-900 dark:text-white">Specialized Testing</option>
                                        <option value="consultation" className="text-gray-900 dark:text-white">Laboratory Consultation</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-gray-300 mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-gray-500"
                                    placeholder="Please describe your testing needs or questions..."
                                    style={{ colorScheme: 'dark' }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-8 py-3 rounded-lg font-semibold hover:from-sky-400 hover:to-violet-500 transition-all"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </section>
            

            {/* Services Overview */}
            <section 
                data-animate-id="services-overview"
                className={`bg-white dark:bg-gray-800 py-16 transition-all duration-1000 ${visibleElements.has('services-overview') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            {"Our Testing Services".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Our Testing Services".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Comprehensive laboratory testing services for accurate medical diagnosis
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 border border-sky-200 dark:border-gray-600">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">🧪</div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Blood Chemistry</h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Complete metabolic panels, glucose, cholesterol, and liver function tests</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 border border-sky-200 dark:border-gray-600">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">🔬</div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Hematology</h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Complete blood counts, coagulation studies, and blood typing</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 border border-sky-200 dark:border-gray-600">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">🦠</div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Microbiology</h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Pathogen identification, culture sensitivity, and infectious disease testing</p>
                        </div>
                    </div>
                </div>
            </section>

           {/* Emergency Contact */}
           <section 
                data-animate-id="emergency"
                className={`bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-700 text-white py-16 transition-all duration-1000 ${visibleElements.has('emergency') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Emergency Laboratory Services</h2>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        For urgent medical testing needs, our emergency laboratory is available 24/7
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:555-123-HELP"
                            className="bg-white text-sky-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                        >
                            📞 Call Emergency Lab: (555) 123-HELP
                        </a>
                        <a
                            href="mailto:emergency@labtest.com"
                            className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-sky-600 transition-colors"
                        >
                            ✉️ Email Emergency Team
                        </a>
                    </div>
                </div>
            </section>

            
            {/* Map Section */}
            <section 
                data-animate-id="map"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('map') ? 'animate__animated animate__zoomIn' : 'opacity-0 scale-50'}`}
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">
                        {"Find Our Laboratory".split(' ').map((word, index) => (
                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                {word}
                                {index < "Find Our Laboratory".split(' ').length - 1 && '\u00A0'}
                            </span>
                        ))}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Located in the heart of the medical district with easy access and parking
                    </p>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125413.96360140525!2d106.68605415087411!3d10.79703419258277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527374c43baad%3A0xb8b244d75d12213e!2sFPT%20Software%20Tp.H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1762401218908!5m2!1svi!2s"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="FPT Software Ho Chi Minh City Location Map"
                    ></iframe>
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

export default Contact
