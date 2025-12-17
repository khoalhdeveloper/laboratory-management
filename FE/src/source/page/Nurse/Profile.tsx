import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../Axios/Axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [avatar, setAvatar] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        day: '',
        month: '',
        year: '',
        age: '',
        gender: '',
        address: '',
        phoneNumber: '',
        email: '',
        identifyNumber: ''
    });
    const [currentUser, setCurrentUser] = useState<any>(null);

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
        fullName: Yup.string().required('Full name is required'),
        day: Yup.string().required('Day is required'),
        month: Yup.string().required('Month is required'),
        year: Yup.string().required('Year is required'),
        age: Yup.number()
            .required('Age is required')
            .min(0, 'Age must be at least 0')
            .max(150, 'Age must be at most 150'),
        gender: Yup.string().required('Gender is required'),
        address: Yup.string().required('Address is required'),
        phoneNumber: Yup.string()
            .required('Phone number is required')
            .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
        email: Yup.string()
            .required('Email is required')
            .email('Please enter a valid email address'),
        identifyNumber: Yup.string()
            .required('Identify number is required')
            .matches(/^\d{12}$/, 'Identify number must be exactly 12 digits')
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

    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | '';
    }>({
        visible: false,
        message: '',
        type: ''
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

    // Function to check if profile is complete
    const isProfileComplete = (): boolean => {
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

        return requiredFields.every(field => {
            const value = formData[field as keyof typeof formData];
            return value && value.toString().trim() !== '';
        });
    };


    // Generate date options
    const generateDays = () => {
        const days = [];
        for (let i = 1; i <= 31; i++) {
            days.push(i.toString().padStart(2, '0'));
        }
        return days;
    };

    const generateMonths = () => {
        const months = [];
        for (let i = 1; i <= 12; i++) {
            months.push(i.toString().padStart(2, '0'));
        }
        return months;
    };

    const generateYears = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 100; i--) {
            years.push(i.toString());
        }
        return years;
    };

    // Combine date parts into dateOfBirth (YYYY-MM-DD format)
    const combineDateOfBirth = (day: string, month: string, year: string) => {
        if (day && month && year) {
            return `${year}-${month}-${day}`;
        }
        return '';
    };

    const formatDateOfBirthForDisplay = (dateString: string) => {
        if (!dateString) return '';
        
        try {
            // Handle ISO 8601 format (e.g., "2004-05-15T00:00:00.000Z")
            if (dateString.includes('T') && dateString.includes('Z')) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString();
                    return `${day}-${month}-${year}`;
                }
            }
            // Handle YYYY-MM-DD format
            else if (dateString.includes('-') && !dateString.includes('T')) {
                const dateParts = dateString.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    return `${day}-${month}-${year}`;
                }
            }
            // Handle MM/DD/YYYY format (legacy)
            else if (dateString.includes('/')) {
                const dateParts = dateString.split('/');
                if (dateParts.length === 3) {
                    const [month, day, year] = dateParts;
                    return `${day}-${month}-${year}`;
                }
            }
                       } catch (error) {
                           // Date parsing error, continue with empty values
                       }
        
        return dateString; // Return original if can't parse
    };

    // Load user data when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                   const response = await userAPI.getCurrentUser();
                   const userData = response.data;
                   
                   // Handle different response structures
                   let actualUserData;
                   if (userData.data) {
                       actualUserData = userData.data;
                   } else {
                       actualUserData = userData;
                   }
                
                // Lưu thông tin user đầy đủ
                setCurrentUser(actualUserData);
                
                // Parse dateOfBirth if exists (support ISO 8601, YYYY-MM-DD, and MM/DD/YYYY formats)
                let day = '', month = '', year = '';
                if (actualUserData.dateOfBirth) {
                    try {
                        // Check if it's ISO 8601 format (e.g., "2004-05-15T00:00:00.000Z")
                        if (actualUserData.dateOfBirth.includes('T') && actualUserData.dateOfBirth.includes('Z')) {
                            const date = new Date(actualUserData.dateOfBirth);
                            if (!isNaN(date.getTime())) {
                                year = date.getFullYear().toString();
                                month = (date.getMonth() + 1).toString().padStart(2, '0');
                                day = date.getDate().toString().padStart(2, '0');
                            }
                        }
                        // Check if it's YYYY-MM-DD format
                        else if (actualUserData.dateOfBirth.includes('-') && !actualUserData.dateOfBirth.includes('T')) {
                            const dateParts = actualUserData.dateOfBirth.split('-');
                            if (dateParts.length === 3) {
                                year = dateParts[0];
                                month = dateParts[1];
                                day = dateParts[2];
                            }
                        } 
                        // Check if it's MM/DD/YYYY format (legacy)
                        else if (actualUserData.dateOfBirth.includes('/')) {
                            const dateParts = actualUserData.dateOfBirth.split('/');
                            if (dateParts.length === 3) {
                                month = dateParts[0];
                                day = dateParts[1];
                                year = dateParts[2];
                            }
                        }
                       } catch (error) {
                           // Date parsing error, continue with empty values
                       }
                }

                const newFormData = {
                    fullName: actualUserData.fullName || '',
                    dateOfBirth: actualUserData.dateOfBirth || '',
                    day: day,
                    month: month,
                    year: year,
                    age: actualUserData.age || '',
                    gender: actualUserData.gender || '',
                    address: actualUserData.address || '',
                    phoneNumber: actualUserData.phoneNumber || '',
                    email: actualUserData.email || '',
                    identifyNumber: actualUserData.identifyNumber || ''
                };
                setFormData(newFormData);
                
                // Set avatar from image field or avatar field
                const avatarUrl = actualUserData.image || actualUserData.avatar;
                if (avatarUrl && avatarUrl.trim() !== '') {
                    setAvatar(avatarUrl);
                } else {
                    setAvatar(''); // Clear avatar if empty
                }
                
            } catch (error: any) {
                console.error('Load user data error:', error);
                
                // Check if it's an authentication error
                if (error.response?.status === 401 || error.response?.status === 403) {
                    // Clear tokens and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    navigate('/login', { replace: true });
                    return;
                }
                
                showNotification('Không thể tải thông tin người dùng. Vui lòng thử lại.', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    // Redirect to incomplete profile if profile is not complete
    useEffect(() => {
        if (!loading && !isProfileComplete()) {
            navigate('/nurse/incomplete-profile', { replace: true });
        }
    }, [loading, navigate]);

    // Force user to stay on personal tab if profile is incomplete
    useEffect(() => {
        if (!isProfileComplete() && activeTab === 'password') {
            setActiveTab('personal');
            navigate('/nurse/incomplete-profile');
        }
    }, [formData, activeTab, navigate]);


    const handleFieldChange = (name: string, value: string, setFieldValue: any, currentValues: any) => {
        // Handle date selection
        if (name === 'day' || name === 'month' || name === 'year') {
            setFieldValue(name, value);
            // Update dateOfBirth when any date part changes
            const newData = { ...currentValues, [name]: value };
            const newDateOfBirth = combineDateOfBirth(newData.day, newData.month, newData.year);
            setFieldValue('dateOfBirth', newDateOfBirth);
        } else {
            // Handle phone number and identify number - only allow digits
            let processedValue = value;
            if (name === 'phoneNumber' || name === 'identifyNumber') {
                // Remove all non-digit characters
                processedValue = value.replace(/\D/g, '');
            }
            setFieldValue(name, processedValue);
        }
    };


   // Thêm hàm upload ảnh lên Cloudinary
  const handleUploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "avatarUploadClient"); // preset bạn đã tạo
    formData.append("cloud_name", "dp4gsczko");

    const res = await fetch("https://api.cloudinary.com/v1_1/dp4gsczko/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; // Trả về URL ảnh sau khi upload thành công
  };

   // Function to handle star button click - open file picker and update avatar
   const handleUpdateAvatar = async () => {
     try {
       // Create a file input element
       const fileInput = document.createElement('input');
       fileInput.type = 'file';
       fileInput.accept = 'image/*';
       fileInput.style.display = 'none';
       
       // Add to DOM temporarily
       document.body.appendChild(fileInput);
       
       // Trigger file picker
       fileInput.click();
       
       // Handle file selection
       fileInput.onchange = async (e) => {
         const file = (e.target as HTMLInputElement).files?.[0];
         if (file) {
           try {
             setIsUploading(true);
             setUploadMessage(null);
             
             // Upload image to Cloudinary
             const uploadedUrl = await handleUploadImage(file);
             
             // Update profile with new image URL
             const updatedFormData = {
               ...formData,
               image: uploadedUrl
             };
             
             await userAPI.updateProfile(updatedFormData);
             
             // Update local state
             setAvatar(uploadedUrl);
             setCurrentUser((prev: any) => prev ? { ...prev, avatar: uploadedUrl, image: uploadedUrl } : null);
             
             setIsUploading(false);
             setUploadMessage({ type: 'success', message: 'Avatar updated successfully!' });
             showNotification('Cập nhật avatar thành công!', 'success');
             
             // Dispatch event to notify other components that profile was updated
             window.dispatchEvent(new CustomEvent('profileUpdated'));
             
             // Auto hide message after 3 seconds
             setTimeout(() => {
               setUploadMessage(null);
             }, 3000);
             
           } catch (error: any) {
             setIsUploading(false);
             setUploadMessage({ type: 'error', message: 'Failed to update avatar. Please try again.' });
             showNotification('Không thể cập nhật avatar. Vui lòng thử lại.', 'error');
             
             // Auto hide error message after 5 seconds
             setTimeout(() => {
               setUploadMessage(null);
             }, 5000);
           }
         }
         
         // Clean up
         document.body.removeChild(fileInput);
       };
       
       // Handle cancel
       fileInput.oncancel = () => {
         document.body.removeChild(fileInput);
       };
       
     } catch (error) {
       showNotification('Không thể mở file picker. Vui lòng thử lại.', 'error');
     }
   };



    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await userAPI.updateProfile(values);
            showNotification('Cập nhật thông tin thành công!', 'success');
            setIsEditing(false);
            
            // Dispatch event to notify other components that profile was updated
            window.dispatchEvent(new CustomEvent('profileUpdated'));
            
            // Reload user data to get updated information
            const response = await userAPI.getCurrentUser();
            const userData = response.data;
            setCurrentUser(userData);
            
            // Parse dateOfBirth if exists (support ISO 8601, YYYY-MM-DD, and MM/DD/YYYY formats)
            let day = '', month = '', year = '';
            if (userData.dateOfBirth) {
                try {
                    // Check if it's ISO 8601 format (e.g., "2004-05-15T00:00:00.000Z")
                    if (userData.dateOfBirth.includes('T') && userData.dateOfBirth.includes('Z')) {
                        const date = new Date(userData.dateOfBirth);
                        if (!isNaN(date.getTime())) {
                            year = date.getFullYear().toString();
                            month = (date.getMonth() + 1).toString().padStart(2, '0');
                            day = date.getDate().toString().padStart(2, '0');
                        }
                    }
                    // Check if it's YYYY-MM-DD format
                    else if (userData.dateOfBirth.includes('-') && !userData.dateOfBirth.includes('T')) {
                        const dateParts = userData.dateOfBirth.split('-');
                        if (dateParts.length === 3) {
                            year = dateParts[0];
                            month = dateParts[1];
                            day = dateParts[2];
                        }
                    } 
                    // Check if it's MM/DD/YYYY format (legacy)
                    else if (userData.dateOfBirth.includes('/')) {
                        const dateParts = userData.dateOfBirth.split('/');
                        if (dateParts.length === 3) {
                            month = dateParts[0];
                            day = dateParts[1];
                            year = dateParts[2];
                        }
                    }
                       } catch (error) {
                           // Date parsing error, continue with empty values
                       }
            }

            setFormData({
                fullName: userData.fullName || '',
                dateOfBirth: userData.dateOfBirth || '',
                day: day,
                month: month,
                year: year,
                age: userData.age || '',
                gender: userData.gender || '',
                address: userData.address || '',
                phoneNumber: userData.phoneNumber || '',
                email: userData.email || '',
                identifyNumber: userData.identifyNumber || ''
            });
            
        } catch (error: any) {
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else {
                showNotification('Không thể cập nhật thông tin. Vui lòng thử lại.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = async () => {
        setIsEditing(false);
        // Reload user data to reset form
        try {
            setLoading(true);
            const response = await userAPI.getCurrentUser();
            const userData = response.data;
            
            // Cập nhật currentUser
            setCurrentUser(userData);
            
            // Parse dateOfBirth if exists
            let day = '', month = '', year = '';
            if (userData.dateOfBirth) {
                const dateParts = userData.dateOfBirth.split('/');
                if (dateParts.length === 3) {
                    month = dateParts[0];
                    day = dateParts[1];
                    year = dateParts[2];
                }
            }

            setFormData({
                fullName: userData.fullName || '',
                dateOfBirth: userData.dateOfBirth || '',
                day: day,
                month: month,
                year: year,
                age: userData.age || '',
                gender: userData.gender || '',
                address: userData.address || '',
                phoneNumber: userData.phoneNumber || '',
                email: userData.email || '',
                identifyNumber: userData.identifyNumber || ''
            });
                       } catch (error) {
                           // Date parsing error, continue with empty values
                       } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (values: any) => {
        if (!currentUser || (!currentUser._id && !currentUser.userid)) {
            showNotification('Không tìm thấy thông tin người dùng. Vui lòng tải lại trang.', 'error');
            return;
        }

        try {
            setLoading(true);
            
            // Sử dụng userid thay vì _id
            const userIdToUse = currentUser.userid || currentUser._id;
            
            await userAPI.changePassword(userIdToUse, {
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            showNotification('Đổi mật khẩu thành công!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
        } catch (error: any) {
            // Xử lý lỗi mật khẩu hiện tại sai
            if (error.response?.status === 400 && error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes('mật khẩu hiện tại') || errorMessage.includes('current password') || errorMessage.includes('old password')) {
                    // Password error will be handled by Formik validation
                } else {
                    showNotification(errorMessage, 'error');
                }
            } else {
                showNotification('Không thể đổi mật khẩu. Vui lòng thử lại.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-800 dark:to-gray-900 min-h-screen">
            {/* Notification */}
            {notification.visible && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg text-white font-medium text-sm md:text-base ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}

            {/* Doctor Profile Title - Top Left */}
            <div className="mb-4 md:mb-6 lg:mb-8">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                    {"Doctor Profile".split(' ').map((word, index) => (
                        <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                            {word}  
                            {index < "Doctor Profile".split(' ').length - 1 && '\u00A0'}
                        </span>
                    ))}
                </h1>
            </div>

            <div className="max-w-4xl mx-auto bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 md:p-4 lg:p-6">

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-sm md:text-base text-gray-600 dark:text-gray-400">Đang tải...</span>
                    </div>
                ) : (
                    <>
                {/* Avatar Upload Section */}
                <div className="mb-4 md:mb-6 lg:mb-8 text-center">
                    <div className="relative inline-block">
                        {avatar && avatar.trim() !== '' ? (
                            <img
                                src={avatar}
                                alt="Profile Avatar"
                                className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 md:border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-2 md:border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                <img
                                    src="https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"
                                    alt="Default Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                        // Fallback nếu ảnh không load được
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-gray-400">
                                                    <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
                                                </svg>
                                            `;
                                        }
                                    }}
                                />
                            </div>
                        )}
                        {/* Star button to update avatar */}
                        <button
                            onClick={handleUpdateAvatar}
                            className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1.5 md:p-2 cursor-pointer hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isUploading}
                            title="Select and Update Avatar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                        
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">
                        Click the star to select and update your avatar
                    </p>
                    {isUploading && (
                        <div className="mt-2 text-sm text-blue-600">
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Uploading...
                            </div>
                        </div>
                    )}
                    {uploadMessage && (
                        <div className={`mt-2 text-sm ${uploadMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {uploadMessage.message}
                        </div>
                    )}
                </div>


                {/* Tab Navigation */}
                <div className="mb-4 md:mb-6 lg:mb-8">
                    <div className="border-b border-blue-300">
                        <nav className="flex space-x-4 md:space-x-8">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`py-2 md:py-3 lg:py-4 px-1 border-b-2 font-medium text-xs md:text-sm ${activeTab === 'personal'
                                    ? 'border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400'
                                    : 'border-transparent text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:border-blue-300'
                                    }`}
                            >
                                Personal Information
                            </button>
                            <button
                                onClick={() => {
                                    if (isProfileComplete()) {
                                        setActiveTab('password');
                                    } else {
                                        navigate('/patient/incomplete-profile');
                                    }
                                }}
                                className={`py-2 md:py-3 lg:py-4 px-1 border-b-2 font-medium text-xs md:text-sm ${activeTab === 'password'
                                    ? 'border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400'
                                    : 'border-transparent text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:border-blue-300'
                                    }`}
                            >
                                Change Password
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                    <div className="space-y-4 md:space-y-6">
                        {!isEditing ? (
                            /* Read-only view with icons */
                            <div className="space-y-4 md:space-y-6">
                                <h3 className="text-base md:text-lg font-bold">
                                    {"Personal Information".split(' ').map((word, index) => (
                                        <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                                            {word}
                                            {index < "Personal Information".split(' ').length - 1 && '\u00A0'}
                                        </span>
                                    ))}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                                    {/* Email */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">EMAIL</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium break-words">{formData.email || 'No email data'}</p>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">PHONE NUMBER</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formData.phoneNumber || 'No phone data'}</p>
                                    </div>

                                    {/* Age */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">AGE</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formData.age || ''}</p>
                                    </div>

                                    {/* Gender */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">GENDER</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : ''}</p>
                                    </div>

                                    {/* Full Name */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">FULL NAME</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formData.fullName || 'No name data'}</p>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">DATE OF BIRTH</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formatDateOfBirthForDisplay(formData.dateOfBirth)}</p>
                                    </div>

                                    {/* Address */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">ADDRESS</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formData.address || ''}</p>
                                    </div>

                                    {/* Identify Number */}
                                    <div className="p-2.5 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-blue-600">
                                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">CCCD</p>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-700 font-medium">{formData.identifyNumber || ''}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 md:gap-4 mt-4 md:mt-6">
                                    <button
                                        onClick={handleEdit}
                                        className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Edit form */
                            <Formik
                                initialValues={formData}
                                validationSchema={personalValidationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize={true}
                            >
                                {({ setFieldValue, errors, touched, values }) => (
                                    <Form className="space-y-4 md:space-y-6">
                                <div className="grid md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                                    {/* Full Name */}
                                    <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                            Full Name *
                                        </label>
                                        <Field
                                            type="text"
                                            name="fullName"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                                            placeholder="Enter your full name"
                                        />
                                        <ErrorMessage name="fullName" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                            Date of Birth *
                                        </label>
                                        <div className="flex gap-1 md:gap-2">
                                            {/* Day */}
                                            <Field
                                                as="select"
                                                name="day"
                                                className={`flex-1 px-1 md:px-2 py-0.5 md:py-1 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.day && touched.day ? 'border-red-500' : ''}`}
                                                onChange={(e: any) => handleFieldChange('day', e.target.value, setFieldValue, values)}
                                            >
                                                <option value="">Day</option>
                                                {generateDays().map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </Field>
                                            
                                            {/* Month */}
                                            <Field
                                                as="select"
                                                name="month"
                                                className={`flex-1 px-1 md:px-2 py-0.5 md:py-1 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.month && touched.month ? 'border-red-500' : ''}`}
                                                onChange={(e: any) => handleFieldChange('month', e.target.value, setFieldValue, values)}
                                            >
                                                <option value="">Month</option>
                                                {generateMonths().map(month => (
                                                    <option key={month} value={month}>{month}</option>
                                                ))}
                                            </Field>
                                            
                                            {/* Year */}
                                            <Field
                                                as="select"
                                                name="year"
                                                className={`flex-1 px-1 md:px-2 py-0.5 md:py-1 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.year && touched.year ? 'border-red-500' : ''}`}
                                                onChange={(e: any) => handleFieldChange('year', e.target.value, setFieldValue, values)}
                                            >
                                                <option value="">Year</option>
                                                {generateYears().map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </Field>
                                        </div>
                                        {errors.dateOfBirth && (
                                            <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.dateOfBirth}</p>
                                        )}
                                    </div>

                                    {/* Age */}
                                    <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                            Age *
                                        </label>
                                        <Field
                                            type="number"
                                            name="age"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.age && touched.age ? 'border-red-500' : ''}`}
                                            placeholder="Enter your age"
                                            min="0"
                                            max="150"
                                        />
                                        <ErrorMessage name="age" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                    </div>

                                    {/* Gender */}
                                    <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                            Gender *
                                        </label>
                                        <Field
                                            as="select"
                                            name="gender"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.gender && touched.gender ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </Field>
                                        <ErrorMessage name="gender" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                            Phone Number *
                                        </label>
                                        <Field
                                            type="tel"
                                            name="phoneNumber"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
                                            placeholder="0123456789"
                                            maxLength={10}
                                            onChange={(e: any) => handleFieldChange('phoneNumber', e.target.value, setFieldValue, values)}
                                        />
                                        <ErrorMessage name="phoneNumber" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                    </div>

                                    {/* Email */}
                                    <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                            Email *
                                        </label>
                                        <Field
                                            type="email"
                                            name="email"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                            placeholder="example@email.com"
                                        />
                                        <ErrorMessage name="email" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                        Address *
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="address"
                                        rows={3}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.address && touched.address ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full address"
                                    />
                                    <ErrorMessage name="address" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                </div>

                                {/* Identify Number */}
                                <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                        Identify Number (CMND/CCCD) *
                                    </label>
                                    <Field
                                        type="text"
                                        name="identifyNumber"
                                        className={`w-full px-0 py-0 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.identifyNumber && touched.identifyNumber ? 'border-red-500' : ''}`}
                                        placeholder="123456789012"
                                        maxLength={12}
                                        onChange={(e: any) => handleFieldChange('identifyNumber', e.target.value, setFieldValue, values)}
                                    />
                                    <ErrorMessage name="identifyNumber" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleCancel}
                                        className="px-3 py-1.5 md:px-6 md:py-3 text-xs md:text-sm lg:text-base bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 md:px-6 md:py-3 text-xs md:text-sm lg:text-base bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold"
                                    >
                                        Update Profile
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
                        {({ errors, touched }) => (
                            <Form className="space-y-4 md:space-y-6">
                        <div className="max-w-md mx-auto">
                            <div className="space-y-4 md:space-y-6">
                                {/* Current Password */}
                                <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                    <Field
                                            type={showPasswords.currentPassword ? "text" : "password"}
                                        name="currentPassword"
                                            className={`w-full px-0 py-0 pr-6 md:pr-8 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : ''}`}
                                        placeholder="Enter your current password"
                                    />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                                        >
                                            {showPasswords.currentPassword ? (
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="currentPassword" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                </div>

                                {/* New Password */}
                                <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                    <Field
                                            type={showPasswords.newPassword ? "text" : "password"}
                                        name="newPassword"
                                            className={`w-full px-0 py-0 pr-6 md:pr-8 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.newPassword && touched.newPassword ? 'border-red-500' : ''}`}
                                        placeholder="Enter your new password"
                                    />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                                        >
                                            {showPasswords.newPassword ? (
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="newPassword" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                </div>

                                {/* Confirm Password */}
                                <div className="p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-[10px] md:text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-1.5 md:mb-2 uppercase">
                                        Confirm New Password *
                                    </label>
                                    <div className="relative">
                                    <Field
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                            className={`w-full px-0 py-0 pr-6 md:pr-8 border-none bg-transparent text-xs md:text-sm text-gray-700 focus:outline-none ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                                        placeholder="Confirm your new password"
                                    />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                        >
                                            {showPasswords.confirmPassword ? (
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-[10px] md:text-xs mt-1" />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
                                        }}
                                        className="px-3 py-1.5 md:px-6 md:py-3 text-xs md:text-sm lg:text-base bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 md:px-6 md:py-3 text-xs md:text-sm lg:text-base bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                            </Form>
                        )}
                    </Formik>
                )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;