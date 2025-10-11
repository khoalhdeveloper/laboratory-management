import React, { useState, useEffect } from 'react';
import '../../CSS/Login.css';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../Axios/Axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// ===== Types =====
type NotificationType = 'success' | 'error' | '';

type NotificationState = {
    visible: boolean;
    message: string;
    type: NotificationType;
};

type RegisterData = {
    name: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type LoginData = {
    userName: string;
    password: string;
};

// ===== Validation Schemas =====
const loginValidationSchema = Yup.object({
    userName: Yup.string()
        .required('User Name cannot be empty'),
    password: Yup.string()
        .required('Password cannot be empty')
});

const registerValidationSchema = Yup.object({
    name: Yup.string()
        .required('Full name cannot be empty'),
    userName: Yup.string()
        .required('User Name cannot be empty'),
    email: Yup.string()
        .required('Email cannot be empty')
        .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be @gmail.com format'),
    password: Yup.string()
        .required('Password cannot be empty')
        .min(8, 'Password must be 8-12 characters with uppercase, lowercase and numbers')
        .max(12, 'Password must be 8-12 characters with uppercase, lowercase and numbers')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/, 'Password must be 8-12 characters with uppercase, lowercase and numbers'),
    confirmPassword: Yup.string()
        .required('Confirm password cannot be empty')
        .oneOf([Yup.ref('password')], 'Passwords do not match')
});

const forgotPasswordValidationSchema = Yup.object({
    email: Yup.string()
        .required('Email cannot be empty')
        .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be @gmail.com format')
});

const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [registerStep, setRegisterStep] = useState<number>(1); // 1: Nhập info, 2: Nhập OTP

    // Thông báo
    const [notification, setNotification] = useState<NotificationState>({
        visible: false,
        message: '',
        type: ''
    });

    // Password visibility
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    // Quên mật khẩu - chỉ cần email để gửi link
    const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

    const navigate = useNavigate();

    // Thông báo
    const showNotification = (message: string, type: NotificationType) => {
        setNotification({
            visible: true,
            message,
            type
        });

        // Auto hide after 3 seconds
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    useEffect(() => {
        if (window.location.hash === '#signup') setIsSignUp(true);

        // Check for verification result from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const verified = urlParams.get('verified');
        const error = urlParams.get('error');

        if (verified === 'success') {
            showNotification('Tài khoản đã được kích hoạt thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (error === 'invalid_token') {
            showNotification('Token xác thực không hợp lệ hoặc đã hết hạn.', 'error');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (error === 'account_not_found') {
            showNotification('Không tìm thấy tài khoản.', 'error');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // ======= Đăng nhập =======
    const handleLogin = async (values: LoginData): Promise<void> => {
        try {
            // Call login API - match backend format
            const response = await authAPI.login({
                username: values.userName,  // Backend expects 'username', not 'userName'
                password: values.password
            });


            // Store token and user info
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            
            // Get role from response (prioritize response.data.role over response.data.user.role)
            const userRole = response.data.role || response.data.user?.role || 'user';
            localStorage.setItem('userRole', userRole);
            
            if (response.data.user) {
                localStorage.setItem('userId', response.data.user.id || response.data.user._id);
                localStorage.setItem('userName', response.data.user.userName);
            }

            showNotification('Login successful!', 'success');

            // Navigate to appropriate dashboard based on user role
            
            switch (userRole) {
                case 'admin':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'doctor':
                    navigate('/doctor/dashboard', { replace: true });
                    break;
                case 'nurse':
                    navigate('/nurse', { replace: true });
                    break;
                case 'user':
                default:
                    // For patient users, check if profile is complete
                    try {
                        const userResponse = await userAPI.getCurrentUser();
                        const userData = userResponse.data;
                        
                        
                        const requiredFields = [
                            'fullName',
                            'dateOfBirth', 
                            'age',
                            'gender',
                            'address',
                            'phoneNumber',
                            'email',
                            'identifyNumber'
                        ];
                        
                        const fieldStatus = requiredFields.map(field => {
                            const value = userData[field];
                            const isComplete = value && value.toString().trim() !== '';
                            return isComplete;
                        });
                        
                        const isComplete = fieldStatus.every(status => status);
                        
                        if (isComplete) {
                            navigate('/patient/dashboard', { replace: true });
                        } else {
                            navigate('/patient/incomplete-profile', { replace: true });
                        }
                    } catch (error: any) {
                        // If can't check profile, redirect to incomplete profile page to be safe
                        navigate('/patient/incomplete-profile', { replace: true });
                    }
                    break;
            }

        } catch (error: any) {

            // Handle specific error messages from server
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else if (error.response?.status === 401) {
                showNotification('Invalid username or password. Please try again.', 'error');
            } else if (error.response?.status === 404) {
                showNotification('User not found. Please check your username.', 'error');
            } else {
                showNotification('Login failed. Please try again later.', 'error');
            }
        }
    };



    // ======= Đăng ký 2 bước =======
    // Bước 1: Gửi info -> gửi OTP về email
    const handleRegister = async (values: RegisterData): Promise<void> => {
        try {
            // Call register API - match backend format
            await authAPI.register({
                username: values.userName,  // Backend expects 'username', not 'userName'
                password: values.password,
                email: values.email,
                fullName: values.name,      // Backend expects 'fullName', not 'name'
                role: "user"                      // Backend expects 'role' field
            });

            // Go to step 2 to show confirmation message
            setRegisterStep(2);
            showNotification('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', 'success');

        } catch (error: any) {

            // Handle specific error messages from server
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else if (error.response?.status === 400) {
                showNotification('Invalid registration data. Please check your information.', 'error');
            } else if (error.response?.status === 409) {
                showNotification('User already exists. Please try with different email or username.', 'error');
            } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                showNotification('Cannot connect to server. Please check if the server is running on http://localhost:5000', 'error');
            } else {
                showNotification(`Registration failed: ${error.message || 'Unknown error'}`, 'error');
            }
        }
    };

    // ======= Quên mật khẩu =======
    const handleForgotSubmit = async (values: { email: string }): Promise<void> => {
        try {
            // Call forgot password API
            await authAPI.forgotPassword(values.email);

            // Close modal and show success message
            setShowForgotPassword(false);
            showNotification('Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư và click vào link để đặt lại mật khẩu.', 'success');

        } catch (error: any) {

            // Handle specific error messages from server
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else if (error.response?.status === 404) {
                showNotification('Email không tồn tại trong hệ thống.', 'error');
            } else if (error.response?.status === 400) {
                showNotification('Email không hợp lệ.', 'error');
            } else {
                showNotification('Không thể gửi email xác nhận. Vui lòng thử lại sau.', 'error');
            }
        }
    };


    // ======= Giao diện =======
    return (
        <div className="auth-container">
            {/* Notification */}
            {notification.visible && (
                <div
                    className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Quên mật khẩu */}
            {showForgotPassword && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onClick={() => setShowForgotPassword(false)}
                >
                    <div
                        style={{
                            background: '#fff', padding: 24, borderRadius: 12, minWidth: 280,
                            maxWidth: 380, width: '90vw', height: 'auto',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4">Forgot Password</h3>
                        <Formik
                            initialValues={{ email: '' }}
                            validationSchema={forgotPasswordValidationSchema}
                            onSubmit={handleForgotSubmit}
                        >
                            {({ errors, touched }) => (
                                <Form>
                                    <div className="flex flex-col">
                                        <Field
                                            type="email"
                                            name="email"
                                            className={`w-full h-[42px] px-3 py-2 rounded-md bg-gray-100 border focus:outline-none mb-1 text-sm ${errors.email && touched.email ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="Enter registered email"
                                        />
                                        <ErrorMessage name="email" component="span" className="text-red-500 text-xs mb-3 ml-1" />
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-sky-300 to-violet-400 text-white font-semibold rounded-full px-6 py-2 text-sm mt-2">
                                        Send Confirmation Email
                                    </button>
                                </Form>
                            )}
                        </Formik>
                        <button
                            onClick={() => setShowForgotPassword(false)}
                            style={{ position: 'absolute', top: 8, right: 16, fontSize: 24, color: '#aaa', border: 'none', background: 'none', cursor: 'pointer' }}
                            aria-label="Close"
                        >×</button>
                    </div>
                </div>
            )}

            {/* Đăng ký 2 bước */}
            <div className={`auth-box ${isSignUp ? 'right-panel-active' : ''}`} id="authBox">
                {/* Đăng ký step 1 */}
                {isSignUp && registerStep === 1 && (
                    <div className="form-container sign-up-container ">
                        <Formik
                            initialValues={{
                                name: '',
                                userName: '',
                                email: '',
                                password: '',
                                confirmPassword: ''
                            }}
                            validationSchema={registerValidationSchema}
                            onSubmit={handleRegister}
                        >
                            {({ errors, touched }) => (
                                <Form className="form">
                                    <h2 className="text-6xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-6">Sign Up</h2>
                                    <div className="mt-6 flex flex-col items-center space-y-3">
                                        <div className="flex flex-col">
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Full Name"
                                                className={`w-[450px] h-[60px] px-4 py-2 rounded-md bg-gray-100 border focus:outline-none ${errors.name && touched.name ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <ErrorMessage name="name" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <div className="flex flex-col">
                                            <Field
                                                type="text"
                                                name="userName"
                                                placeholder="User Name"
                                                className={`w-[450px] h-[60px] px-4 py-2 rounded-md bg-gray-100 border focus:outline-none ${errors.userName && touched.userName ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <ErrorMessage name="userName" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <div className="flex flex-col">
                                            <Field
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                                className={`w-[450px] h-[60px] px-4 py-2 rounded-md bg-gray-100 border focus:outline-none ${errors.email && touched.email ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <ErrorMessage name="email" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="relative">
                                                <Field
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    placeholder="Password"
                                                    className={`w-[450px] h-[60px] px-4 py-2 pr-12 rounded-md bg-gray-100 border focus:outline-none ${errors.password && touched.password ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
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
                                            <ErrorMessage name="password" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="relative">
                                                <Field
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    placeholder="Confirm Password"
                                                    className={`w-[450px] h-[60px] px-4 py-2 pr-12 rounded-md bg-gray-100 border focus:outline-none ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
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
                                            <ErrorMessage name="confirmPassword" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <button type="submit" className="bg-gradient-to-r from-sky-300 to-violet-400 text-white text-xl font-semibold rounded-full px-20 py-4 mt-4">
                                            SIGN UP
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}
                {/* Đăng ký step 2 */}
                {isSignUp && registerStep === 2 && (
                    <div className="form-container sign-up-container">
                        <div className="form">
                            <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-[20px]">Đăng ký thành công!</h2>
                            <p className="text-lg text-gray-600 mb-6 px-4 text-center">
                                Chúng tôi đã gửi email xác thực đến email bạn đã đăng ký. 
                                Vui lòng kiểm tra hộp thư và click vào link để kích hoạt tài khoản.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setRegisterStep(1); setIsSignUp(false); }}
                                className="bg-gradient-to-r from-sky-300 to-violet-400 text-white text-xl font-semibold rounded-full px-20 py-4"
                            >
                                QUAY LẠI ĐĂNG NHẬP
                            </button>
                        </div>
                    </div>
                )}
                {/* Đăng nhập */}
                {!isSignUp && (
                    <div className="form-container sign-in-container ">
                        <Formik
                            initialValues={{
                                userName: '',
                                password: ''
                            }}
                            validationSchema={loginValidationSchema}
                            onSubmit={handleLogin}
                        >
                            {({ errors, touched }) => (
                                <Form className="form" noValidate>
                                    <h2 className="text-7xl font-bold text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text mb-10">Sign In</h2>
                                    <div className="mt-15 flex flex-col items-center space-y-5">
                                        <div className="flex flex-col">
                                            <Field
                                                type="text"
                                                name="userName"
                                                placeholder="User Name"
                                                className={`w-[450px] h-[60px] px-4 py-2 rounded-md bg-gray-100 border focus:outline-none ${errors.userName && touched.userName ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <ErrorMessage name="userName" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <div className="flex flex-col">
                                            <Field
                                                type="password"
                                                name="password"
                                                placeholder="Password"
                                                className={`w-[450px] h-[60px] px-4 py-2 rounded-md bg-gray-100 border focus:outline-none ${errors.password && touched.password ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <ErrorMessage name="password" component="span" className="text-red-500 text-sm mt-1 ml-1" />
                                        </div>
                                        <a
                                            href="#"
                                            className="text-xl text-black-500 underline block"
                                            onClick={e => { e.preventDefault(); setShowForgotPassword(true); }}
                                        >
                                            Forgot Password?
                                        </a>
                                        <button type="submit" className="bg-gradient-to-r from-sky-300 to-violet-400 text-white text-xl font-semibold rounded-full px-20 py-5 mt-6 ">
                                            SIGN IN
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}

                {/* Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h2 className="text-6xl font-bold mb-3">Welcome Back!</h2>
                            <p className="mb-5 text-center px-6 text-xl mt-5">To continue connecting with us, please sign in with your personal information</p>
                            <button
                                onClick={() => { setIsSignUp(false); setRegisterStep(1); }}
                                className="group border border-white text-white text-lg font-semibold rounded-full px-16 py-4 mt-6 bg-transparent transition hover:bg-white"
                            >
                                <span className="transition group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-300 group-hover:to-violet-400">SIGN IN</span>
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h2 className="text-6xl font-bold mb-3">Hello New Friend!</h2>
                            <p className="mb-5 text-center px-6 text-xl mt-5">Please enter your personal information to start your journey with us</p>
                            <button
                                onClick={() => setIsSignUp(true)}
                                className="group border border-white text-white text-lg font-semibold rounded-full px-16 py-4 mt-6 bg-transparent transition hover:bg-white"
                            >
                                <span className="transition group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-300 group-hover:to-violet-400">SIGN UP</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Login;