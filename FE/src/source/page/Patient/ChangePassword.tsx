import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { userAPI } from '../Axios/Axios';
import '../../CSS/Loading.css';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

interface ChangePasswordProps {
    currentUser: any;
    showNotification: (message: string, type: 'success' | 'error') => void;
}
function ChangePassword({ currentUser, showNotification }: ChangePasswordProps) {
    const { isDarkMode } = useGlobalTheme();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    
    const [isUpdating, setIsUpdating] = useState(false);

    const passwordValidationSchema = Yup.object({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string()
            .required('New password is required')
            .min(8, 'Password must be 8-12 characters with uppercase, lowercase and numbers')
            .max(12, 'Password must be 8-12 characters with uppercase, lowercase and numbers')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/, 'Password must be 8-12 characters with uppercase, lowercase and numbers'),
        confirmPassword: Yup.string()
            .required('Confirm password is required')
            .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    });

    const handlePasswordSubmit = async (values: any) => {
        if (!currentUser || (!currentUser._id && !currentUser.userid)) {
            showNotification('User information not found. Please refresh the page.', 'error');
            return;
        }

        try {
            setIsUpdating(true);
            
            const userIdToUse = currentUser.userid || currentUser._id;
            
            await userAPI.changePassword(userIdToUse, {
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            
            showNotification('Password changed successfully!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
        } catch (error: any) {
            if (error.response?.status === 400 && error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes('current password') || errorMessage.includes('old password')) {
                } else {
                    showNotification(errorMessage, 'error');
                }
            } else {
                showNotification('Unable to change password. Please try again.', 'error');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative">
            <h3 className="text-base lg:text-lg font-bold mb-6">
                {"Change Password".split(' ').map((word, index) => (
                    <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-sky-300 to-violet-400' : 'bg-gradient-to-r from-sky-300 to-violet-400'}`}>
                        {word}
                        {index < "Change Password".split(' ').length - 1 && '\u00A0'}
                    </span>
                ))}
            </h3>
            
            <Formik
                initialValues={passwordData}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordSubmit}
                enableReinitialize={true}
            >
                {({ errors, touched }) => (
                    <Form className="space-y-6">
                        <div className="max-w-md mx-auto">
                            <div className="space-y-4 lg:space-y-6">
                                <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                    <label className="block text-xs font-semibold mb-2 uppercase">
                                        {"Current Password *".split(' ').map((word, index) => (
                                            <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                {word}
                                                {index < "Current Password *".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showPasswords.currentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            className={`w-full px-0 py-0 pr-8 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : ''}`}
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            className={`absolute right-0 top-0 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                                            onClick={() => setShowPasswords(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                                        >
                                            {showPasswords.currentPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="currentPassword" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                </div>

                                <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                    <label className="block text-xs font-semibold mb-2 uppercase">
                                        {"New Password *".split(' ').map((word, index) => (
                                            <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                {word}
                                                {index < "New Password *".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showPasswords.newPassword ? "text" : "password"}
                                            name="newPassword"
                                            className={`w-full px-0 py-0 pr-8 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.newPassword && touched.newPassword ? 'border-red-500' : ''}`}
                                            placeholder="Enter your new password"
                                        />
                                        <button
                                            type="button"
                                            className={`absolute right-0 top-0 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                                            onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                                        >
                                            {showPasswords.newPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="newPassword" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                </div>

                                <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                    <label className="block text-xs font-semibold mb-2 uppercase">
                                        {"Confirm New Password *".split(' ').map((word, index) => (
                                            <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                {word}
                                                {index < "Confirm New Password *".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            className={`w-full px-0 py-0 pr-8 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                                            placeholder="Confirm your new password"
                                        />
                                        <button
                                            type="button"
                                            className={`absolute right-0 top-0 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                        >
                                            {showPasswords.confirmPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                </div>

                                <div className={`flex justify-end gap-4 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
                                        }}
                                        className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md text-xs lg:text-sm font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-all font-semibold text-xs lg:text-sm ${
                                            isUpdating 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-sky-300 to-violet-400 hover:from-sky-400 hover:to-violet-500'
                                        }`}
                                    >
                                        {isUpdating ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        
            {isUpdating && (
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm flex items-center justify-center rounded-lg z-10`}>
                    <div className="flex flex-col items-center space-y-3">
                        <div className="loader" style={{
                            borderColor: isDarkMode ? '#ffffff' : '#000000'
                        }}></div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium text-xs lg:text-sm`}>Changing password...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChangePassword;
