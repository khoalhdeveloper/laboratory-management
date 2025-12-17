import React, { useState, useEffect } from 'react';
import { userAPI } from '../Axios/Axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

interface AdminData {
    _id?: string;
    userid?: string;
    username: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    identifyNumber?: string;
    age?: number;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    role: string;
    avatar?: string;
    image?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const EditProfile: React.FC = () => {
    const { isDarkMode } = useGlobalTheme();
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [avatar, setAvatar] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    
    const [notification, setNotification] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | '';
    }>({
        visible: false,
        message: '',
        type: ''
    });

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

    // Validation schema for personal information
    const personalValidationSchema = Yup.object({
        username: Yup.string().required('Username is required'),
        fullName: Yup.string().required('Full name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        phoneNumber: Yup.string().matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
        age: Yup.number().min(0, 'Age must be at least 0').max(150, 'Age must be at most 150'),
        identifyNumber: Yup.string().matches(/^\d{12}$/, 'Identify number must be exactly 12 digits'),
        gender: Yup.string().oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
        dateOfBirth: Yup.date().max(new Date(), 'Date of birth cannot be in the future')
    });

    // Validation schema for password change
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

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({
            visible: true,
            message,
            type
        });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Load admin data
    useEffect(() => {
        const loadAdminData = async () => {
            try {
                setLoading(true);
                
                // Check if token exists
                const token = localStorage.getItem('token');
                
                if (!token) {
                    showNotification('No authentication token found. Please login again.', 'error');
                    return;
                }
                
                const response = await userAPI.getCurrentUser();
                
                // Check if response has the expected structure
                let adminData;
                if (response.data && response.data.data) {
                    // Backend returns { success: true, message: '', data: {...} }
                    adminData = response.data.data;
                } else if (response.data) {
                    // Direct data
                    adminData = response.data;
                } else {
                    showNotification('Invalid response format from server.', 'error');
                    return;
                }
                
                setAdminData(adminData);
                
                // Set avatar
                const avatarUrl = adminData.image || adminData.avatar;
                if (avatarUrl && avatarUrl.trim() !== '') {
                    setAvatar(avatarUrl);
                } else {
                    setAvatar('');
                }
            } catch (error: any) {
                if (error.response?.status === 401) {
                    showNotification('Authentication failed. Please login again.', 'error');
                    // Clear invalid token
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                } else if (error.response?.status === 404) {
                    showNotification('Admin account not found.', 'error');
                } else if (error.response?.data?.message) {
                    showNotification(error.response.data.message, 'error');
                } else {
                    showNotification('Unable to load admin information. Please try again.', 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, []);

    // Upload image to Cloudinary
    const handleUploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "avatarUploadClient");
        formData.append("cloud_name", "dp4gsczko");

        const res = await fetch("https://api.cloudinary.com/v1_1/dp4gsczko/image/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.secure_url;
    };

    // Handle avatar update
    const handleUpdateAvatar = async () => {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            document.body.appendChild(fileInput);
            fileInput.click();
            
            fileInput.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    try {
                        setIsUploading(true);
                        setUploadMessage(null);
                        
                        const uploadedUrl = await handleUploadImage(file);
                        
                        const updatedData = {
                            ...adminData,
                            image: uploadedUrl
                        };
                        
                        await userAPI.updateProfile(updatedData);
                        
                        setAvatar(uploadedUrl);
                        setAdminData(prev => prev ? { ...prev, avatar: uploadedUrl, image: uploadedUrl } : null);
                        
                        setIsUploading(false);
                        setUploadMessage({ type: 'success', message: 'Avatar updated successfully!' });
                        showNotification('Avatar updated successfully!', 'success');
                        
                        window.dispatchEvent(new CustomEvent('profileUpdated'));
                        
                        setTimeout(() => {
                            setUploadMessage(null);
                        }, 3000);
                        
                    } catch (error: any) {
                        setIsUploading(false);
                        setUploadMessage({ type: 'error', message: 'Failed to update avatar. Please try again.' });
                        showNotification('Unable to update avatar. Please try again.', 'error');
                        
                        setTimeout(() => {
                            setUploadMessage(null);
                        }, 5000);
                    }
                }
                
                document.body.removeChild(fileInput);
            };
            
            fileInput.oncancel = () => {
                document.body.removeChild(fileInput);
            };
            
        } catch (error) {
            showNotification('Unable to open file picker. Please try again.', 'error');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            
            // Prepare data for API call
            const updateData = {
                ...values,
                age: values.age ? Number(values.age) : undefined
            };
            
            await userAPI.updateProfile(updateData);
            showNotification('Profile updated successfully!', 'success');
            setIsEditing(false);
            
            // Dispatch event to notify other components that profile was updated
            window.dispatchEvent(new CustomEvent('profileUpdated'));
            
            // Reload admin data to get updated information
            const response = await userAPI.getCurrentUser();
            const updatedAdminData = response.data?.data || response.data;
            setAdminData(updatedAdminData);
            
        } catch (error: any) {
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else {
                showNotification('Unable to update profile. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (values: any) => {
        if (!adminData || (!adminData._id && !adminData.userid)) {
            showNotification('Admin information not found. Please reload the page.', 'error');
            return;
        }

        try {
            setLoading(true);
            
            const userIdToUse = adminData.userid || adminData._id;
            if (!userIdToUse) {
                showNotification('Admin ID not found. Please reload the page.', 'error');
                return;
            }
            
            await userAPI.changePassword(userIdToUse, {
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            
            showNotification('Password changed successfully! Please use your new password for future logins.', 'success');
            
            // Reset form data
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
            
        } catch (error: any) {
            if (error.response?.status === 400 && error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes('Mật khẩu cũ không đúng') || 
                    errorMessage.includes('old password') || 
                    errorMessage.includes('current password')) {
                    showNotification('Current password is incorrect. Please try again.', 'error');
                } else {
                    showNotification(errorMessage, 'error');
                }
            } else if (error.response?.status === 404) {
                showNotification('Admin account not found. Please contact support.', 'error');
            } else {
                showNotification('Unable to change password. Please check your connection and try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex justify-center items-center py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</span>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-3 sm:p-4 lg:p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-sky-100 to-violet-100'}`}>
            {/* Enhanced Notification */}
            {notification.visible && (
                <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-md px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-xl border-l-4 transition-all duration-300 transform ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border-green-500 text-green-800' 
                        : 'bg-red-50 border-red-500 text-red-800'
                }`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {notification.type === 'success' ? (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        )}
                        <div className="font-medium text-xs sm:text-sm">
                            {notification.message}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Title */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                    {"Admin Profile".split(' ').map((word, index) => (
                        <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                            {word}
                            {index < "Admin Profile".split(' ').length - 1 && '\u00A0'}
                        </span>
                    ))}
                </h1>
            </div>

            <div className={`max-w-4xl mx-auto rounded-lg p-4 sm:p-5 lg:p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                {/* Avatar Section */}
                <div className="mb-6 sm:mb-7 lg:mb-8 text-center">
                    <div className="relative inline-block">
                        {avatar && avatar.trim() !== '' ? (
                            <img
                                src={avatar}
                                alt="Profile Avatar"
                                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                <img
                                    src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400"
                                    alt="Default Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        )}
                        {/* Update avatar button */}
                        <button
                            onClick={handleUpdateAvatar}
                            className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1.5 sm:p-2 cursor-pointer hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isUploading}
                            title="Select and Update Avatar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                    </div>
                    <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Click the star to select and update your avatar
                    </p>
                    {isUploading && (
                        <div className="mt-2 text-xs sm:text-sm text-blue-600">
                            <div className="flex items-center justify-center gap-2">
                                Uploading...
                            </div>
                        </div>
                    )}
                    {uploadMessage && (
                        <div className={`mt-2 text-xs sm:text-sm ${uploadMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {uploadMessage.message}
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 sm:mb-7 lg:mb-8">
                    <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-blue-300'}`}>
                        <nav className="flex gap-4 sm:gap-8 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-300 ${activeTab === 'personal'
                                    ? 'border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400'
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:border-blue-300`
                                    }`}
                            >
                                <span className="hidden sm:inline">Personal Information</span>
                                <span className="sm:hidden">Personal</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-300 ${activeTab === 'password'
                                    ? 'border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400'
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:border-blue-300`
                                    }`}
                            >
                                <span className="hidden sm:inline">Change Password</span>
                                <span className="sm:hidden">Password</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Personal Information Tab */}
                {activeTab === 'personal' && adminData && (
                    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                        {!isEditing ? (
                            /* Read-only view */
                            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                                <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {/* Username */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>USERNAME</p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.username || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>EMAIL</p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>PHONE NUMBER</p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Age */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>AGE</p>
                                                <p className={`text-xs sm:text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.age || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>GENDER</p>
                                                <p className={`text-xs sm:text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {adminData.gender ? adminData.gender.charAt(0).toUpperCase() + adminData.gender.slice(1) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>FULL NAME</p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.fullName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>DATE OF BIRTH</p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {adminData.dateOfBirth ? 
                                                        new Date(adminData.dateOfBirth).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        }).replace(/\//g, '-') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>ADDRESS</p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CCCD */}
                                    <div className={`p-3 sm:p-4 rounded-lg border shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'}`}>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Identify Number                                                </p>
                                                <p className={`text-xs sm:text-sm lg:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{adminData.identifyNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 sm:gap-4 mt-4 sm:mt-5 lg:mt-6">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold text-xs sm:text-sm"
                                    >
                                        <span className="hidden sm:inline">Edit Profile</span>
                                        <span className="sm:hidden">Edit</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Edit form */
                            <Formik
                                initialValues={{
                                    username: adminData.username || '',
                                    fullName: adminData.fullName || '',
                                    email: adminData.email || '',
                                    phoneNumber: adminData.phoneNumber || '',
                                    identifyNumber: adminData.identifyNumber || '',
                                    age: adminData.age || '',
                                    address: adminData.address || '',
                                    gender: adminData.gender || '',
                                    dateOfBirth: adminData.dateOfBirth ? new Date(adminData.dateOfBirth).toISOString().split('T')[0] : ''
                                }}
                                validationSchema={personalValidationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize={true}
                            >
                                {({ errors, touched }) => (
                                    <Form className="space-y-4 sm:space-y-5 lg:space-y-6">
                                        <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Edit Personal Information
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* Username */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Username *
                                                </label>
                                                <Field
                                                    name="username"
                                                    type="text"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.username && touched.username ? 'border-red-500' : ''}`}
                                                />
                                                {errors.username && touched.username && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.username}</p>
                                                )}
                                            </div>

                                            {/* Full Name */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Full Name *
                                                </label>
                                                <Field
                                                    name="fullName"
                                                    type="text"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                                                />
                                                {errors.fullName && touched.fullName && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullName}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Email *
                                                </label>
                                                <Field
                                                    name="email"
                                                    type="email"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                                />
                                                {errors.email && touched.email && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
                                                )}
                                            </div>

                                            {/* Phone Number */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Phone Number
                                                </label>
                                                <Field name="phoneNumber">
                                                    {({ field, form }: any) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="0123456789"
                                                            maxLength={10}
                                                            className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                // Only allow digits
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                form.setFieldValue('phoneNumber', value);
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                {errors.phoneNumber && touched.phoneNumber && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phoneNumber}</p>
                                                )}
                                            </div>

                                            {/* Age */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Age
                                                </label>
                                                <Field
                                                    name="age"
                                                    type="number"
                                                    min="1"
                                                    max="120"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.age && touched.age ? 'border-red-500' : ''}`}
                                                />
                                                {errors.age && touched.age && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.age}</p>
                                                )}
                                            </div>

                                            {/* Gender */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Gender
                                                </label>
                                                <Field
                                                    as="select"
                                                    name="gender"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </Field>
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Date of Birth
                                                </label>
                                                <Field
                                                    name="dateOfBirth"
                                                    type="date"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                />
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    Address
                                                </label>
                                                <Field
                                                    name="address"
                                                    type="text"
                                                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                />
                                            </div>

                                            {/* CCCD */}
                                            <div>
                                                <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                    CCCD (Identify Number)
                                                </label>
                                                <Field name="identifyNumber">
                                                    {({ field, form }: any) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="123456789012"
                                                            maxLength={12}
                                                            className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } ${errors.identifyNumber && touched.identifyNumber ? 'border-red-500' : ''}`}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                // Only allow digits
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                form.setFieldValue('identifyNumber', value);
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                {errors.identifyNumber && touched.identifyNumber && (
                                                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.identifyNumber}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-5 lg:mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 text-xs sm:text-sm ${
                                                    isDarkMode 
                                                        ? 'bg-gray-600 text-white hover:bg-gray-500' 
                                                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                }`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold disabled:opacity-50 text-xs sm:text-sm"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </div>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <Formik
                        initialValues={passwordData}
                        validationSchema={passwordValidationSchema}
                        onSubmit={handlePasswordSubmit}
                        enableReinitialize={true}
                    >
                        {({ errors, touched, setFieldValue }) => (
                            <Form className="space-y-4 sm:space-y-5 lg:space-y-6">
                                <div className="max-w-md mx-auto">
                                    <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-5 lg:mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Change Password
                                    </h3>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div>
                                            <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                Current Password *
                                            </label>
                                            <div className="relative">
                                                <Field
                                                    name="currentPassword"
                                                    type={showPasswords.currentPassword ? 'text' : 'password'}
                                                    className={`w-full px-3 py-2 pr-10 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : ''}`}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setFieldValue('currentPassword', e.target.value);
                                                        setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                                                >
                                                    {showPasswords.currentPassword ? (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.currentPassword && touched.currentPassword && (
                                                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.currentPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                New Password *
                                            </label>
                                            <div className="relative">
                                                <Field
                                                    name="newPassword"
                                                    type={showPasswords.newPassword ? 'text' : 'password'}
                                                    className={`w-full px-3 py-2 pr-10 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.newPassword && touched.newPassword ? 'border-red-500' : ''}`}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setFieldValue('newPassword', e.target.value);
                                                        setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                                                >
                                                    {showPasswords.newPassword ? (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.newPassword && touched.newPassword && (
                                                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.newPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                                Confirm New Password *
                                            </label>
                                            <div className="relative">
                                                <Field
                                                    name="confirmPassword"
                                                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                                                    className={`w-full px-3 py-2 pr-10 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setFieldValue('confirmPassword', e.target.value);
                                                        setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                                >
                                                    {showPasswords.confirmPassword ? (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && touched.confirmPassword && (
                                                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-4 sm:mt-5 lg:mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold disabled:opacity-50 text-xs sm:text-sm"
                                        >
                                            {loading ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};

export default EditProfile;
