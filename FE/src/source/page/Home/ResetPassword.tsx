import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../Axios/Axios';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import '../../../source/CSS/Loading.css';

// ===== Types =====
type NotificationType = 'success' | 'error' | '';

type NotificationState = {
    visible: boolean;
    message: string;
    type: NotificationType;
};

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isDarkMode } = useGlobalTheme();
    
    // States
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    
    // Validation errors
    const [errors, setErrors] = useState<{
        newPassword: string;
        confirmPassword: string;
    }>({
        newPassword: '',
        confirmPassword: ''
    });
    
    // Notification
    const [notification, setNotification] = useState<NotificationState>({
        visible: false,
        message: '',
        type: ''
    });

    // Get token and email from URL
    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    // Show notification
    const showNotification = (message: string, type: NotificationType) => {
        setNotification({
            visible: true,
            message,
            type
        });

        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Validate password
    const validatePassword = (password: string): boolean => {
        if (password.length < 8 || password.length > 12) return false;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return hasUpperCase && hasLowerCase && hasNumbers;
    };

    // Check token validity on component mount
    useEffect(() => {
        if (!token) {
            showNotification('Invalid token. Please try again.', 'error');
            setTimeout(() => {
                setIsNavigating(true);
                navigate('/login');
            }, 2000);
            return;
        }

        // Set email if available
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }

        // Basic token validation
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                showNotification('Invalid token. Please try again.', 'error');
                setTimeout(() => {
                    setIsNavigating(true);
                    navigate('/login');
                }, 2000);
                return;
            }
            
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < currentTime) {
                showNotification('Token has expired. Please request a new password reset.', 'error');
                setTimeout(() => {
                    setIsNavigating(true);
                    navigate('/login');
                }, 2000);
                return;
            }
            
            showNotification('Please enter your new password.', 'success');
        } catch (error) {
            showNotification('Invalid token. Please try again.', 'error');
            setTimeout(() => {
                setIsNavigating(true);
                navigate('/login');
            }, 2000);
        }
    }, [token, emailFromUrl, navigate]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!token) {
            showNotification('Invalid token. Please try again.', 'error');
            return;
        }

        // Validate all fields
        const newErrors = {
            newPassword: !newPassword ? 'Password cannot be empty' :
                !validatePassword(newPassword) ? 'Password must be 8-12 characters with uppercase, lowercase and numbers' : '',
            confirmPassword: !confirmPassword ? 'Confirm password cannot be empty' : ''
        };

        setErrors(newErrors);

        // Check if any errors exist
        if (Object.values(newErrors).some(error => error !== '')) {
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
            return;
        }

        setIsLoading(true);

        try {
            
            await authAPI.resetPassword(token, newPassword);
            
            
            showNotification('Password changed successfully! Redirecting...', 'success');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                setIsNavigating(true);
                navigate('/login', { replace: true });
            }, 2000);
            
        } catch (error: any) {
            
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else if (error.response?.status === 400) {
                showNotification('Invalid or expired token.', 'error');
            } else if (error.response?.status === 404) {
                showNotification('Password reset request not found.', 'error');
            } else {
                showNotification('Unable to reset password. Please try again later.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-violet-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            {/* Fullscreen Loading Overlay */}
            {(isLoading || isNavigating) && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`flex flex-col items-center justify-center space-y-4 p-8 rounded-2xl shadow-2xl ${
                        isDarkMode 
                            ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-gray-700/50' 
                            : 'bg-gradient-to-br from-white/95 to-gray-50/95 border border-gray-200/50'
                    }`}>
                        <div className="loader" style={{
                            borderColor: '#000000'
                        }}></div>
                        <p className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                            {isNavigating ? 'Redirecting...' : 'Processing...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.visible && (
                <div
                    className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {notification.message}
                </div>
            )}

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-2">
                        Reset Password
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {email ? `Enter new password for ${email}` : 'Enter your new password'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className={`w-full h-12 px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${
                                        errors.newPassword ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        // Real-time validation
                                        let error = '';
                                        if (!e.target.value) {
                                            error = 'Password cannot be empty';
                                        } else if (!validatePassword(e.target.value)) {
                                            error = 'Password must be 8-12 characters with uppercase, lowercase and numbers';
                                        }
                                        setErrors(prev => ({ ...prev, newPassword: error }));
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <span className="text-red-500 text-sm mt-1 text-left w-full block">{errors.newPassword}</span>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`w-full h-12 px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${
                                        errors.confirmPassword ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        // Real-time validation
                                        let error = '';
                                        if (!e.target.value) {
                                            error = 'Confirm password cannot be empty';
                                        } else if (e.target.value !== newPassword) {
                                            error = 'Passwords do not match';
                                        }
                                        setErrors(prev => ({ ...prev, confirmPassword: error }));
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="text-red-500 text-sm mt-1 text-left w-full block">{errors.confirmPassword}</span>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-sky-300 to-violet-400 text-white font-semibold rounded-lg hover:from-sky-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="loader" style={{
                                        borderColor: '#000000'
                                    }}></div>
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNavigating(true);
                                    navigate('/login');
                                }}
                                disabled={isNavigating}
                                className="text-sky-600 hover:text-sky-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
