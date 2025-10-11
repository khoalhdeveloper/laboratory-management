import React from 'react';
import { useNavigate } from 'react-router-dom';

const Error: React.FC = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };


    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative" style={{
            backgroundImage: 'url(/bgerror.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
        }}>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Laboratory Icon */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-cyan-200 to-teal-300 rounded-full mb-6">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                </div>

                {/* Error Code */}
                <div className="mb-6">
                    <h1 className="text-8xl font-bold bg-gradient-to-r from-cyan-200 to-teal-300 bg-clip-text text-transparent mb-4">
                        404
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-cyan-200 to-teal-300 mx-auto rounded-full"></div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Laboratory Not Found
                    </h2>
                    <p className="text-lg text-white/90 mb-2">
                        Sorry, the page you are looking for does not exist in the laboratory management system.
                    </p>
                    <p className="text-lg text-white/90">
                        The page may have been moved or you may have entered the wrong address.
                    </p>
                </div>

                {/* Laboratory Elements */}
                <div className="mb-8 flex justify-center space-x-8">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-300 to-violet-400 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Equipment</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-300 to-violet-400 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Samples</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-300 to-violet-400 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Results</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleGoHome}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-300 to-teal-400 text-white font-semibold rounded-full hover:from-cyan-400 hover:to-teal-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Home Page
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-white/80">
                        If you believe this is an error, please contact the technical support team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Error;
