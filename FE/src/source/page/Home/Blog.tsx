import React, { useState, useEffect, useRef } from "react";
import 'animate.css'; // Thêm dòng này để import animate.css
import '../../CSS/Loading.css'; // Import Loading.css
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { chatAPI, blogAPI, type BlogPost } from '../Axios/Axios';

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'ai'; time: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [_sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode: _isDarkMode } = useGlobalTheme();



  // API - Fetch news from NewsAPI only
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getNews();
      
      const data = response.data as any;
      if (data.success) {
        setBlogs(data.data);
        
        // Chỉ hiển thị error nếu không có data, nếu có fallback data thì OK
        if (data.summary?.note && data.data.length === 0) {
          setError(`Info: ${data.summary.note}`);
        } else if (data.summary?.note) {
          setError(null); // Clear any previous errors
        }
      } else {
        setError(`API Error: ${data.message || 'Unable to load fresh news'}`);
      }
    } catch (error: any) {
      setError(`Network Error: ${error.response?.data?.message || error.message || 'Connection failed'}`);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchBlogs();
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-animate-id');
            if (elementId) setVisibleElements(prev => new Set([...prev, elementId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const animatedElements = document.querySelectorAll('[data-animate-id]');
    animatedElements.forEach(el => observer.observe(el));
    return () => { animatedElements.forEach(el => observer.unobserve(el)); };
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

   const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const openInNewTab = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer");

   const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);


  const LoadingState = () => (
    <div className="flex items-center justify-center p-8">
      <div className="loader"></div>
      <span className="ml-2 text-lg">Loading news...</span>
    </div>
  );

  const ErrorState = () => (
    <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-red-800">{error}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={fetchBlogs}
          className="px-3 py-1 text-sm bg-white border border-red-300 rounded hover:bg-red-50 transition"
        >
          🔄 Retry
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center p-8">
      <div className="text-4xl mb-4">📖</div>
      <h3 className="text-lg font-medium text-gray-600">No news available</h3>
      <p className="text-gray-500">Fresh medical news will load automatically</p>
    </div>
  );

  const BlogCard = ({ blog, idx }: { blog: BlogPost, idx: number }) => (
    <div
      className={`group bg-white dark:bg-gray-900 border border-transparent rounded-2xl shadow-xl hover:shadow-[0_8px_40px_-8px_rgba(56,189,248,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden transform hover:scale-[1.045] active:scale-100 min-h-[580px] md:min-h-[540px] cursor-pointer  w-full max-w-[430px] mx-auto
      relative
      before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300 before:z-10
      before:pointer-events-none group-hover:before:bg-[linear-gradient(90deg,#38bdf8_0%,#a855f7_100%)]
      group-hover:border-transparent border-2 group-hover:border-0
    `}
      style={{ WebkitMaskImage: '', maskImage: '', animationDelay: `${idx * 0.12}s` }}
      title={blog.sourceUrl}
      onClick={() => openInNewTab(blog.sourceUrl)}
    >
      <div className="w-full aspect-[16/8] bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center relative z-20 rounded-t-2xl">
        {blog.imageUrl ? (
          <>
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{background: 'linear-gradient(90deg,rgba(14,165,233,0.12),rgba(168,85,247,0.12))'}} />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-5xl select-none">
            <span className="text-6xl mb-1">📷</span>
            <span className="text-base font-medium mt-1 opacity-70">No Image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow justify-between px-6 py-5 z-20">
        <div>
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-[18px]">📅</span>
              <span>{formatDate(blog.publishedAt)}</span>
            </span>
          </div>
          <h3 className="font-bold text-[20px] leading-snug mb-2 line-clamp-2 text-gray-900 dark:text-white text-center transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-violet-500">
            {blog.title}
          </h3>
          {blog.description && (
            <p className="text-gray-700 dark:text-gray-200 text-[15px] leading-relaxed line-clamp-3 text-center transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200/90">
              {blog.description}
            </p>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center">
          <span className="text-[15px] text-gray-500 dark:text-gray-400 font-medium">
            {blog.source}
          </span>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section */}
      <section
        data-animate-id="hero"
        className={`bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-700 text-white py-20 transition-all duration-1000 px-6 text-center ${visibleElements.has('hero') ? 'animate__animated animate__fadeInDown' : 'opacity-0 translate-y-[-50px]'}`}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">News Section</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Explore the freshest updates and insights from medical sources worldwide.
        </p>
      </section>

      {/* States */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : blogs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {currentBlogs.map((b, idx) => (
              <BlogCard key={b.id} blog={b} idx={idx} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'text-white bg-gradient-to-r from-sky-300 to-violet-400'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

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
                <p className="text-sm">Loading</p>
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
  );
};

export default Blog;
