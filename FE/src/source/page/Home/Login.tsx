import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../Axios/Axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import '../../CSS/Login.css';


// ===== Types =====
type RegisterData = { name: string; userName: string; email: string; password: string; confirmPassword: string; };
type LoginData = { userName: string; password: string; };

// ===== Validation Schemas =====
const loginValidationSchema = Yup.object({
    userName: Yup.string().required('User Name cannot be empty'),
    password: Yup.string().required('Password cannot be empty')
});
const registerValidationSchema = Yup.object({
    name: Yup.string().required('Full name cannot be empty'),
    userName: Yup.string().required('User Name cannot be empty'),
    email: Yup.string().required('Email cannot be empty').matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be @gmail.com format'),
    password: Yup.string().required('Password cannot be empty').min(8, 'Password must be 8-12 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/, 'Password must contain uppercase, lowercase, and numbers'),
    confirmPassword: Yup.string().required('Confirm password cannot be empty').oneOf([Yup.ref('password')], 'Passwords do not match')
});
const forgotPasswordValidationSchema = Yup.object({
    email: Yup.string().required('Email cannot be empty').matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be @gmail.com format')
});

const Login: React.FC = () => {
    // ===== State and Hooks =====
    const [isSignUp, setIsSignUp] = useState(false);
    const [registerStep, setRegisterStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
    
    const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
    const navigate = useNavigate();

    // ===== useEffect and API Handlers =====
    useEffect(() => {
        if (window.location.hash === '#signup') setIsSignUp(true);
        const urlParams = new URLSearchParams(window.location.search);
        const verified = urlParams.get('verified');
        const error = urlParams.get('error');
        if (verified === 'success') {
            toast.success('Account activated! You can now sign in.', { toastId: 'account-verified-success' });
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (error) {
            const message = error === 'invalid_token' ? 'Invalid or expired token.' : 'Account not found.';
            toast.error(message, { toastId: `account-verification-${error}` });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleLogin = async (values: LoginData) => {setIsLoading(true); try { const response = await authAPI.login({ username: values.userName, password: values.password }); localStorage.setItem('token', response.data.token); const userRole = response.data.role || response.data.user?.role || 'user'; localStorage.setItem('userRole', userRole); if (response.data.user) { localStorage.setItem('userId', response.data.user.id || response.data.user._id); localStorage.setItem('userName', response.data.user.userName); } console.clear(); const roleMap: { [key: string]: string } = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', nurse: '/nurse' }; const destination = roleMap[userRole] || '/patient/dashboard'; navigate(destination, { replace: true }); } catch (error: any) { const errorMessage = error.response?.data?.message || 'Login failed.'; toast.error(`❌ ${errorMessage}`, { toastId: 'login-error' }); } finally { setIsLoading(false); } };
 
    const handleRegister = async (values: RegisterData) => { setIsLoading(true); try { await authAPI.register({ username: values.userName, password: values.password, email: values.email, fullName: values.name, role: "user" }); setRegisterStep(2); toast.success('Registration successful! Please check your email to verify your account.', { toastId: 'register-success' }); } catch (error: any) { let errorMessage = `Registration failed: ${error.message || 'Unknown error'}`; if (error.response?.status === 409) { errorMessage = 'User already exists.'; } else if (error.code === 'NETWORK_ERROR') { errorMessage = 'Unable to connect to server.'; } toast.error(errorMessage, { toastId: 'register-error' }); } finally { setIsLoading(false); } };
    const handleForgotSubmit = async (values: { email: string }): Promise<void> => { setIsLoading(true); try { await authAPI.forgotPassword(values.email); setShowForgotPassword(false); toast.success('Confirmation email has been sent. Please check your inbox.', { toastId: 'forgot-password-success' }); } catch (error: any) { let errorMessage = 'Unable to send confirmation email. Please try again later.'; if (error.response?.status === 404) { errorMessage = 'Email does not exist in the system.'; } else if (error.response?.status === 400) { errorMessage = 'Invalid email.'; } toast.error(errorMessage); } finally { setIsLoading(false); } };

    const EyeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
    const EyeOffIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>;
    
  
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            const response = await authAPI.googleLogin(credentialResponse.credential);
            localStorage.setItem('token', response.data.token);
            const userRole = response.data.role || response.data.user?.role || 'user';
            localStorage.setItem('userRole', userRole);
            if (response.data.user) {
                localStorage.setItem('userId', response.data.user.id || response.data.user._id);
                localStorage.setItem('userName', response.data.user.userName || response.data.user.email);
            }
            toast.success('✅ Google login successful!');
            const roleMap: { [key: string]: string } = { 
                admin: '/admin/dashboard', 
                doctor: '/doctor/dashboard', 
                nurse: '/nurse' 
            };
            const destination = roleMap[userRole] || '/patient/dashboard';
            navigate(destination, { replace: true });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Google login failed.';
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error('❌ Google login failed. Please try again.');
    };

    return (
        <>
            <style>{`
                /* --- Base and Mobile-First Styles --- */
                .auth-container-responsive { display: flex; justify-content: center; align-items: center; padding: 1rem; width: 100%; min-height: 100vh; background: linear-gradient(to bottom right, #eff6ff, #f3e8ff); }
                .auth-box-responsive { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border-radius: 1.5rem; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15); width: 100%; max-width: 500px; min-height: 700px; position: relative; overflow: hidden; }
                .form-container-responsive { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem; width: 100%; height: 100%; text-align: center; }
                .form-container-responsive form { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .form-container-responsive .input-group { width: 100%; position: relative; }
                .form-container-responsive h2 { font-size: 3rem; font-weight: bold; margin-bottom: 2rem; background: linear-gradient(to right, #38bdf8, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .form-container-responsive .input-field { width: 100%; height: 55px; padding: 0 1.25rem; border-radius: 0.75rem; background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #000; font-size: 1rem; }
                .form-container-responsive .password-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b7280; }
                .form-container-responsive button[type="submit"] { width: auto; padding: 1rem 5rem; margin-top: 1.5rem; border-radius: 9999px; font-weight: 600; color: white; background: linear-gradient(to right, #38bdf8, #8b5cf6); cursor: pointer; border: none; transition: opacity 0.2s; font-size: 1.1rem; }
                .form-container-responsive button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
                .error-message { color: #ef4444; font-size: 0.875rem; text-align: left; width: 100%; margin-top: 0.25rem; }
                .overlay-container-responsive { display: none; }
                .mobile-toggle { margin-top: 1.5rem; font-size: 0.95rem; color: #4b5563; }
                .mobile-toggle button { font-weight: 600; color: #3b82f6; background: none; border: none; cursor: pointer; }
                .mobile-toggle button:hover { text-decoration: underline; }
                .loading-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px); }
                .loading-overlay > div { display: flex; flex-direction: column; align-items: center; padding: 1.5rem 2.5rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); }
                .loader { width: 60px; height: 25px; border: 2px solid #000000; box-sizing: border-box; border-radius: 50%; display: grid; animation: l2 2s infinite linear; margin-bottom: 1.5rem; }
                .loader:before, .loader:after { content: ""; grid-area: 1/1; border: inherit; border-radius: 50%; animation: inherit; animation-duration: 3s; }
                .loader:after { --s: -1; }
                @keyframes l2 { 100% { transform: rotate(calc(var(--s, 1) * 1turn)); } }
                .loading-text { color: #000000; font-size: 0.875rem; font-weight: 500; }
                .divider { display: flex; align-items: center; width: 100%; margin: 1.25rem 0; }
                .divider-line { flex-grow: 1; height: 1px; background-color: #d1d5db; }
                .divider-text { padding: 0 1rem; font-size: 0.95rem; color: #6b7280; }

                /* --- Styles for the Forgot Password Modal --- */
                .forgot-password-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); }
                .forgot-password-modal { background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); width: 90%; max-width: 450px; text-align: center; }
                .forgot-password-modal h3 { font-size: 1.75rem; font-weight: bold; margin-bottom: 1.5rem; color: #374151; }
                .forgot-password-modal form { display: flex; flex-direction: column; gap: 1rem; }

                /* START: CSS FIX FOR MODAL INPUT AND BUTTON */
                .forgot-password-modal .input-field { width: 100%; height: 55px; padding: 0 1.25rem; border-radius: 0.75rem; background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #000; font-size: 1rem; }
                .forgot-password-modal button[type="submit"] { width: 100%; padding: 0.9rem 2rem; margin-top: 0.5rem; border-radius: 9999px; font-weight: 600; color: white; background: linear-gradient(to right, #38bdf8, #8b5cf6); cursor: pointer; border: none; transition: opacity 0.2s; font-size: 1rem; }
                .forgot-password-modal button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
                /* END: CSS FIX */
                
                /* --- Desktop Styles --- */
                @media (min-width: 1024px) {
                    .auth-box-responsive { max-width: 1100px; min-height: 750px; display: flex; }
                    .form-container-responsive { width: 50%; position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; padding: 3rem; }
                    .form-container-responsive h2 { font-size: 3.5rem; margin-bottom: 2.5rem; }
                    .form-container-responsive form { gap: 1.0rem; max-width: 480px; }
                    .form-container-responsive .input-group { width: 400px; margin-bottom: 0.2rem; }
                    .form-container-responsive .input-field { width: 400px; height: 60px; font-size: 1.05rem; padding: 0 1.5rem; }
                    .form-container-responsive button[type="submit"] { font-size: 1.15rem; padding: 1.1rem 5.5rem; margin-top: 0.75rem; }
                    .sign-in-container { left: 0; z-index: 2; }
                    .sign-up-container { left: 0; opacity: 0; z-index: 1; }
                    .auth-box-responsive.right-panel-active .sign-in-container { transform: translateX(100%); opacity: 0; }
                    .auth-box-responsive.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; }
                    .overlay-container-responsive { display: block; position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
                    .auth-box-responsive.right-panel-active .overlay-container-responsive { transform: translateX(-100%); }
                    .overlay { background: linear-gradient(to right, #38bdf8, #8b5cf6); color: #fff; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                    .auth-box-responsive.right-panel-active .overlay { transform: translateX(50%); }
                    .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                    .overlay-left { transform: translateX(-20%); }
                    .overlay-right { right: 0; transform: translateX(0); }
                    .auth-box-responsive.right-panel-active .overlay-left { transform: translateX(0); }
                    .auth-box-responsive.right-panel-active .overlay-right { transform: translateX(20%); }
                    .overlay-panel h2 { font-size: 2.5rem; }
                    .overlay-panel p { font-size: 1.1rem; margin: 1rem 0; }
                    .overlay-panel button { border: 2px solid white; background-color: transparent; color: white; padding: 0.75rem 3rem; border-radius: 9999px; font-weight: 600; cursor: pointer; }
                    .mobile-toggle { display: none; }
                }

                /* Style cho custom button */
                .custom-google-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    width: 100%;
                    max-width: 400px; /* Căn chỉnh với các input khác */
                    height: 55px;
                    padding: 0 1.25rem;
                    border-radius: 0.75rem;
                    background-color: #fff;
                    border: 1px solid #e5e7eb;
                    color: #374151;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .custom-google-btn:hover {
                    background-color: #f9fafb;
                }
            `}</style>
            
            {showForgotPassword && (
                <div className="forgot-password-overlay" onClick={() => setShowForgotPassword(false)}>
                    <div className="forgot-password-modal" onClick={e => e.stopPropagation()}>
                        <h3>Forgot Password</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Enter your email and we'll send you a link to reset your password.</p>
                        <Formik
                            initialValues={{ email: '' }}
                            validationSchema={forgotPasswordValidationSchema}
                            onSubmit={handleForgotSubmit}
                        >
                            <Form>
                                <div className="input-group">
                                    <Field name="email" type="email" placeholder="Your Email Address" className="input-field" />
                                    <ErrorMessage name="email" component="div" className="error-message" />
                                </div>
                                <button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Reset Link'}</button>
                            </Form>
                        </Formik>
                    </div>
                </div>
            )}

            <div className="auth-container-responsive">
    
                    <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            
    <div className="square"></div>
    <div className="square"></div>
    <div className="square"></div>
    <div className="square"></div>
    <div className="square"></div>
                <div className={`auth-box-responsive ${isSignUp ? 'right-panel-active' : ''}`}>

                    {/* Sign-Up Form */}
                    
                    <div className="form-container-responsive sign-up-container">
                        <div className={!isSignUp ? 'hidden lg:block' : ''}>
                            {registerStep === 1 ? (
                                <Formik initialValues={{ name: '', userName: '', email: '', password: '', confirmPassword: '' }} validationSchema={registerValidationSchema} onSubmit={handleRegister}>
                                    <Form>
                                        <h2>Sign Up</h2>
                                        <div className="input-group"><Field name="name" type="text" placeholder="Full Name" className="input-field" /><ErrorMessage name="name" component="div" className="error-message" /></div>
                                        <div className="input-group"><Field name="userName" type="text" placeholder="User Name" className="input-field" /><ErrorMessage name="userName" component="div" className="error-message" /></div>
                                        <div className="input-group"><Field name="email" type="email" placeholder="Email" className="input-field" /><ErrorMessage name="email" component="div" className="error-message" /></div>
                                        <div className="input-group"><Field name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button><ErrorMessage name="password" component="div" className="error-message" /></div>
                                        <div className="input-group"><Field name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" className="input-field" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button><ErrorMessage name="confirmPassword" component="div" className="error-message" /></div>
                                        <button type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : 'SIGN UP'}</button>
                                        <p className="mobile-toggle">Already have an account? <button type="button" onClick={() => setIsSignUp(false)}>Sign In</button></p>
                                    </Form>
                                </Formik>
                            ) : (
                                <div>
                                    <h2>Registration Successful!</h2>
                                    <p style={{ padding: '0 1rem', color: '#4b5563' }}>Please check your inbox and click the link to activate your account.</p>
                                    <button type="button" onClick={() => { setRegisterStep(1); setIsSignUp(false); }} style={{padding: '0.75rem 2rem'}}>BACK TO SIGN IN</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sign-In Form */}
                    <div className="form-container-responsive sign-in-container">
                        <div className={isSignUp ? 'hidden lg:block' : ''}>
                            <Formik initialValues={{ userName: '', password: '' }} validationSchema={loginValidationSchema} onSubmit={handleLogin}>
                                <Form>
                                    <h2>Sign In</h2>
                                    <div className="input-group"><Field name="userName" type="text" placeholder="User Name" className="input-field" /><ErrorMessage name="userName" component="div" className="error-message" /></div>
                                    <div className="input-group"><Field name="password" type={showLoginPassword ? 'text' : 'password'} placeholder="Password" className="input-field" /><button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="password-toggle">{showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}</button><ErrorMessage name="password" component="div" className="error-message" /></div>
                                    <button type="button" onClick={() => setShowForgotPassword(true)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '0.9rem', marginTop: '-0.5rem' }}>Forgot Password?</button>
                                    <button type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : 'SIGN IN'}</button>
                                    <div className="divider"><div className="divider-line"></div><span className="divider-text">OR</span><div className="divider-line"></div></div>
                                    
                                    <GoogleOAuthProvider clientId="551262879023-45i3u7ndla97qnnf2kfdl5ccm8s2pbfn.apps.googleusercontent.com">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const btn = document.querySelector('.custom-google-btn-hidden div[role="button"]') as HTMLDivElement;
                                                btn?.click();
                                            }} 
                                            className="custom-google-btn"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                            </svg>
                                            <div className='signin-gg-text'>
                                                SIGN IN WITH GOOGLE
                                            </div>
                                        </button>
                                        <div className="custom-google-btn-hidden">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                            />
                                        </div>
                                    </GoogleOAuthProvider>
                                    
                                    <p className="mobile-toggle">Don't have an account? <button type="button" onClick={() => setIsSignUp(true)}>Sign Up</button></p>
                                </Form>
                            </Formik>
                        </div>
                    </div>

                    {/* Overlay for Desktop */}
                    <div className="overlay-container-responsive">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left"><h2 className="text-4xl font-bold mb-3">Welcome Back!</h2><p>To continue connecting with us, please sign in</p><button onClick={() => setIsSignUp(false)}>SIGN IN</button></div>
                            <div className="overlay-panel overlay-right"><h2 className="text-4xl font-bold mb-3">Hello New Friend!</h2><p>Enter your personal details to start your journey</p><button onClick={() => setIsSignUp(true)}>SIGN UP</button></div>
                        </div>
                    </div>
                </div>
                
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="text-center">
                        <div className="loader"></div>
                        <p className="loading-text">Processing...</p>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={5000} theme="light" />
        </>
    );
};

export default Login;