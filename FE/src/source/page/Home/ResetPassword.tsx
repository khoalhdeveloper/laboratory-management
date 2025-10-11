import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../Axios/Axios';

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
    
    // States
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
            showNotification('Token không hợp lệ. Vui lòng thử lại.', 'error');
            setTimeout(() => navigate('/login'), 2000);
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
                showNotification('Token không hợp lệ. Vui lòng thử lại.', 'error');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }
            
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < currentTime) {
                showNotification('Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.', 'error');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }
            
            showNotification('Vui lòng nhập mật khẩu mới của bạn.', 'success');
        } catch (error) {
            showNotification('Token không hợp lệ. Vui lòng thử lại.', 'error');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [token, emailFromUrl, navigate]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!token) {
            showNotification('Token không hợp lệ. Vui lòng thử lại.', 'error');
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
            
            
            showNotification('Đổi mật khẩu thành công! Đang chuyển hướng...', 'success');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
            
        } catch (error: any) {
            
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else if (error.response?.status === 400) {
                showNotification('Token không hợp lệ hoặc đã hết hạn.', 'error');
            } else if (error.response?.status === 404) {
                showNotification('Yêu cầu đặt lại mật khẩu không tồn tại.', 'error');
            } else {
                showNotification('Không thể đặt lại mật khẩu. Vui lòng thử lại sau.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-violet-50 flex items-center justify-center p-4">
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
                    <p className="text-gray-600">
                        {email ? `Nhập mật khẩu mới cho ${email}` : 'Nhập mật khẩu mới của bạn'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className={`w-full h-12 px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập mật khẩu mới"
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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                                <span className="text-red-500 text-sm mt-1">{errors.newPassword}</span>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`w-full h-12 px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập lại mật khẩu mới"
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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                                <span className="text-red-500 text-sm mt-1">{errors.confirmPassword}</span>
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
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </div>
                            ) : (
                                'Đặt lại mật khẩu'
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sky-600 hover:text-sky-700 font-medium"
                            >
                                ← Quay lại đăng nhập
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
