import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../Axios/Axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import '../../CSS/Loading.css';
import ChangePassword from './ChangePassword';
import HistoryProfile from './HistoryProfile';

function Profile() {
    const navigate = useNavigate();
    const { isDarkMode } = useGlobalTheme();
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


    const personalValidationSchema = Yup.object({
        fullName: Yup.string().required('Full name is required'),
        day: Yup.string().required('Day is required'),
        month: Yup.string().required('Month is required'),
        year: Yup.string().required('Year is required'),
        age: Yup.string()
            .required('Age is required (auto calculated from date of birth)'),
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


    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
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

    const combineDateOfBirth = (day: string, month: string, year: string) => {
        if (day && month && year) {
            return `${year}-${month}-${day}`;
        }
        return '';
    };

    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return '';
        
        try {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age >= 0 ? age.toString() : '';
        } catch (error) {
            return '';
        }
    };

    const formatDateOfBirthForDisplay = (dateString: string) => {
        if (!dateString) return '';
        
        
        try {
            if (dateString.includes('T') && dateString.includes('Z')) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString();
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
            else if (dateString.includes('-') && !dateString.includes('T')) {
                const dateParts = dateString.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
            else if (dateString.includes('/')) {
                const dateParts = dateString.split('/');
                if (dateParts.length === 3) {
                    const [month, day, year] = dateParts;
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
            else {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString();
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
        } catch (error) {
        }
        
        return dateString;
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                   const response = await userAPI.getCurrentUser();
                   const userData = response.data;
                   
                   let actualUserData;
                   if (userData.data) {
                       actualUserData = userData.data;
                   } else {
                       actualUserData = userData;
                   }
                
                setCurrentUser(actualUserData);
                
                let day = '', month = '', year = '';
                if (actualUserData.dateOfBirth) {
                    try {
                        if (actualUserData.dateOfBirth.includes('T') && actualUserData.dateOfBirth.includes('Z')) {
                            const date = new Date(actualUserData.dateOfBirth);
                            if (!isNaN(date.getTime())) {
                                year = date.getFullYear().toString();
                                month = (date.getMonth() + 1).toString().padStart(2, '0');
                                day = date.getDate().toString().padStart(2, '0');
                            }
                        }
                        else if (actualUserData.dateOfBirth.includes('-') && !actualUserData.dateOfBirth.includes('T')) {
                            const dateParts = actualUserData.dateOfBirth.split('-');
                            if (dateParts.length === 3) {
                                year = dateParts[0];
                                month = dateParts[1];
                                day = dateParts[2];
                            }
                        } 
                        else if (actualUserData.dateOfBirth.includes('/')) {
                            const dateParts = actualUserData.dateOfBirth.split('/');
                            if (dateParts.length === 3) {
                                month = dateParts[0];
                                day = dateParts[1];
                                year = dateParts[2];
                            }
                        }
                       } catch (error) {
                       }
                }

                const calculatedAge = day && month && year ? calculateAge(combineDateOfBirth(day, month, year)) : '';

                setFormData({
                    fullName: actualUserData.fullName || '',
                    dateOfBirth: actualUserData.dateOfBirth || '',
                    day: day,
                    month: month,
                    year: year,
                    age: calculatedAge || actualUserData.age || '',
                    gender: actualUserData.gender || '',
                    address: actualUserData.address || '',
                    phoneNumber: actualUserData.phoneNumber || '',
                    email: actualUserData.email || '',
                    identifyNumber: actualUserData.identifyNumber || ''
                });
                
                const avatarUrl = actualUserData.image || actualUserData.avatar;
                if (avatarUrl && avatarUrl.trim() !== '') {
                    setAvatar(avatarUrl);
                } else {
                    setAvatar('');
                }
                
            } catch (error: any) {
                showNotification('Unable to load user information. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    useEffect(() => {
        if (!loading && !isProfileComplete()) {
            navigate('/patient/incomplete-profile', { replace: true });
        }
    }, [loading, navigate]);

    useEffect(() => {
        if (!isProfileComplete() && (activeTab === 'password' || activeTab === 'history')) {
            setActiveTab('personal');
            navigate('/patient/incomplete-profile');
        }
    }, [formData, activeTab, navigate]);



    const handleFieldChange = (name: string, value: string, setFieldValue: any, currentValues: any) => {
        if (name === 'day' || name === 'month' || name === 'year') {
            setFieldValue(name, value);
            const newData = { ...currentValues, [name]: value };
            const newDateOfBirth = combineDateOfBirth(newData.day, newData.month, newData.year);
            setFieldValue('dateOfBirth', newDateOfBirth);
            
            if (newDateOfBirth) {
                const calculatedAge = calculateAge(newDateOfBirth);
                setFieldValue('age', calculatedAge);
            }
        } else {
            let processedValue = value;
            if (name === 'phoneNumber' || name === 'identifyNumber') {
                processedValue = value.replace(/\D/g, '');
            }
            setFieldValue(name, processedValue);
        }
    };


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
             
             const updatedFormData = {
               ...formData,
               image: uploadedUrl
             };
             
             await userAPI.updateProfile(updatedFormData);
             
             setAvatar(uploadedUrl);
             setCurrentUser((prev: any) => prev ? { ...prev, avatar: uploadedUrl, image: uploadedUrl } : null);
             
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
            setIsUpdating(true);
            await userAPI.updateProfile(values);
            showNotification('Profile updated successfully!', 'success');
            setIsEditing(false);
            
            window.dispatchEvent(new CustomEvent('profileUpdated'));
            
            const response = await userAPI.getCurrentUser();
            const userData = response.data;
            setCurrentUser(userData);
            
            let day = '', month = '', year = '';
            if (userData.dateOfBirth) {
                try {
                    if (userData.dateOfBirth.includes('T') && userData.dateOfBirth.includes('Z')) {
                        const date = new Date(userData.dateOfBirth);
                        if (!isNaN(date.getTime())) {
                            year = date.getFullYear().toString();
                            month = (date.getMonth() + 1).toString().padStart(2, '0');
                            day = date.getDate().toString().padStart(2, '0');
                        }
                    }
                    else if (userData.dateOfBirth.includes('-') && !userData.dateOfBirth.includes('T')) {
                        const dateParts = userData.dateOfBirth.split('-');
                        if (dateParts.length === 3) {
                            year = dateParts[0];
                            month = dateParts[1];
                            day = dateParts[2];
                        }
                    } 
                    else if (userData.dateOfBirth.includes('/')) {
                        const dateParts = userData.dateOfBirth.split('/');
                        if (dateParts.length === 3) {
                            month = dateParts[0];
                            day = dateParts[1];
                            year = dateParts[2];
                        }
                    }
                       } catch (error) {
                       }
            }

            const calculatedAge = day && month && year ? calculateAge(combineDateOfBirth(day, month, year)) : '';

            setFormData({
                fullName: userData.fullName || '',
                dateOfBirth: userData.dateOfBirth || '',
                day: day,
                month: month,
                year: year,
                age: calculatedAge || userData.age || '',
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
                showNotification('Unable to update profile. Please try again.', 'error');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = async () => {
        setIsEditing(false);
        try {
            setLoading(true);
            const response = await userAPI.getCurrentUser();
            const userData = response.data;
            
            setCurrentUser(userData);
            
            let day = '', month = '', year = '';
            if (userData.dateOfBirth) {
                try {
                    if (userData.dateOfBirth.includes('T') && userData.dateOfBirth.includes('Z')) {
                        const date = new Date(userData.dateOfBirth);
                        if (!isNaN(date.getTime())) {
                            year = date.getFullYear().toString();
                            month = (date.getMonth() + 1).toString().padStart(2, '0');
                            day = date.getDate().toString().padStart(2, '0');
                        }
                    }
                    else if (userData.dateOfBirth.includes('-') && !userData.dateOfBirth.includes('T')) {
                        const dateParts = userData.dateOfBirth.split('-');
                        if (dateParts.length === 3) {
                            year = dateParts[0];
                            month = dateParts[1];
                            day = dateParts[2];
                        }
                    } 
                    else if (userData.dateOfBirth.includes('/')) {
                        const dateParts = userData.dateOfBirth.split('/');
                        if (dateParts.length === 3) {
                            month = dateParts[0];
                            day = dateParts[1];
                            year = dateParts[2];
                        }
                    }
                } catch (error) {
                    // Error handling
                }
            }

            const calculatedAge = day && month && year ? calculateAge(combineDateOfBirth(day, month, year)) : '';

            setFormData({
                fullName: userData.fullName || '',
                dateOfBirth: userData.dateOfBirth || '',
                day: day,
                month: month,
                year: year,
                age: calculatedAge || userData.age || '',
                gender: userData.gender || '',
                address: userData.address || '',
                phoneNumber: userData.phoneNumber || '',
                email: userData.email || '',
                identifyNumber: userData.identifyNumber || ''
            });
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex-1 p-3 lg:p-6 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-800 dark:to-gray-900 min-h-screen">
            {notification.visible && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    {"Patient Profile".split(' ').map((word, index) => (
                        <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                            {word}
                            {index < "Patient Profile".split(' ').length - 1 && '\u00A0'}
                        </span>
                    ))}
                </h1>
            </div>

            <div className="max-w-4xl mx-auto bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 lg:p-6">

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="loader" style={{
                            borderColor: isDarkMode ? '#ffffff' : '#000000'
                        }}></div>
                        <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</span>
                    </div>
                ) : (
                    <>
                <div className="mb-8 text-center">
                    <div className="relative inline-block">
                        {avatar && avatar.trim() !== '' ? (
                            <img
                                src={avatar}
                                alt="Profile Avatar"
                                className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                <img
                                    src="https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"
                                    alt="Default Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = `
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 lg:w-16 lg:h-16 text-gray-400">
                                                    <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
                                                </svg>
                                            `;
                                        }
                                    }}
                                />
                            </div>
                        )}
                        <button
                            onClick={handleUpdateAvatar}
                            className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1.5 lg:p-2 cursor-pointer hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isUploading}
                            title="Select and Update Avatar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 lg:w-5 lg:h-5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                        
                    </div>
                    <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                        Click the star to select and update your avatar
                    </p>
                    {isUploading && (
                        <div className={`mt-2 text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <div className="flex items-center justify-center gap-2">
                                <div className="loader" style={{
                                    borderColor: isDarkMode ? '#ffffff' : '#000000',
                                    width: '16px',
                                    height: '7px'
                                }}></div>
                                Uploading...
                            </div>
                        </div>
                    )}
                    {uploadMessage && (
                        <div className={`mt-2 text-sm ${uploadMessage.type === 'success' ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                            {uploadMessage.message}
                        </div>
                    )}
                </div>


                <div className="mb-8">
                    <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-blue-300'}`}>
                        <nav className="flex space-x-4 lg:space-x-8 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`py-3 lg:py-4 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${activeTab === 'personal'
                                    ? `border-blue-500 text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 hover:border-gray-500' : 'text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:border-blue-300'}`
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
                                className={`py-3 lg:py-4 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${activeTab === 'password'
                                    ? `border-blue-500 text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 hover:border-gray-500' : 'text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:border-blue-300'}`
                                    }`}
                            >
                                Change Password
                            </button>
                            <button
                                onClick={() => {
                                    if (isProfileComplete()) {
                                        setActiveTab('history');
                                    } else {
                                        navigate('/patient/incomplete-profile');
                                    }
                                }}
                                className={`py-3 lg:py-4 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${activeTab === 'history'
                                    ? `border-blue-500 text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 hover:border-gray-500' : 'text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:border-blue-300'}`
                                    }`}
                            >
                                History
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'personal' && (
                    <div className="space-y-6 relative">
                        {!isEditing ? (
                            <div className="space-y-6">
                                <h3 className="text-base lg:text-lg font-bold">
                                    {"Personal Information".split(' ').map((word, index) => (
                                        <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                                            {word}
                                            {index < "Personal Information".split(' ').length - 1 && '\u00A0'}
                                        </span>
                                    ))}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>EMAIL</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.email || ''}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>PHONE NUMBER</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.phoneNumber || ''}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>AGE</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.age || ''}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>GENDER</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : ''}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>FULL NAME</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.fullName || ''}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>DATE OF BIRTH</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formatDateOfBirthForDisplay(formData.dateOfBirth)}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>ADDRESS</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.address || ''}</p>
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className={`text-xs text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'} uppercase font-medium`}>CCCD</p>
                                        </div>
                                        <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{formData.identifyNumber || ''}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={handleEdit}
                                        className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold text-xs lg:text-sm"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                                
                            </div>
                        ) : (
                            <Formik
                                initialValues={formData}
                                validationSchema={personalValidationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize={true}
                            >
                                {({ setFieldValue, errors, touched, values }) => (
                                    <Form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <label className="block text-xs font-semibold mb-2 uppercase">
                                            {"Full Name *".split(' ').map((word, index) => (
                                                <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                    {word}
                                                    {index < "Full Name *".split(' ').length - 1 && '\u00A0'}
                                                </span>
                                            ))}
                                        </label>
                                        <Field
                                            type="text"
                                            name="fullName"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-700 placeholder:text-gray-500'} focus:outline-none ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                                            placeholder="Enter your full name"
                                        />
                                        <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <label className="block text-xs font-semibold mb-2 uppercase">
                                            {"Date of Birth *".split(' ').map((word, index) => (
                                                <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                    {word}
                                                    {index < "Date of Birth *".split(' ').length - 1 && '\u00A0'}
                                                </span>
                                            ))}
                                        </label>
                                        <div className="flex gap-1 lg:gap-2">
                                            <Field
                                                as="select"
                                                name="day"
                                                className={`flex-1 px-1 lg:px-2 py-1 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.day && touched.day ? 'border-red-500' : ''}`}
                                                onChange={(e: any) => handleFieldChange('day', e.target.value, setFieldValue, values)}
                                            >
                                                <option value="">Day</option>
                                                {generateDays().map(day => (
                                                    <option key={day} value={day} selected={values.day === day}>{day}</option>
                                                ))}
                                            </Field>
                                            
                                            <Field
                                                as="select"
                                                name="month"
                                                className={`flex-1 px-1 lg:px-2 py-1 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.month && touched.month ? 'border-red-500' : ''}`}
                                                onChange={(e: any) => handleFieldChange('month', e.target.value, setFieldValue, values)}
                                            >
                                                <option value="">Month</option>
                                                {generateMonths().map(month => (
                                                    <option key={month} value={month} selected={values.month === month}>{month}</option>
                                                ))}
                                            </Field>
                                            
                                            <Field
                                                as="select"
                                                name="year"
                                                className={`flex-1 px-1 lg:px-2 py-1 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.year && touched.year ? 'border-red-500' : ''}`}
                                                onChange={(e: any) => handleFieldChange('year', e.target.value, setFieldValue, values)}
                                            >
                                                <option value="">Year</option>
                                                {generateYears().map(year => (
                                                    <option key={year} value={year} selected={values.year === year}>{year}</option>
                                                ))}
                                            </Field>
                                        </div>
                                        {errors.dateOfBirth && (
                                            <p className="text-red-500 text-xs lg:text-sm mt-1">{typeof errors.dateOfBirth === 'string' ? errors.dateOfBirth : String(errors.dateOfBirth)}</p>
                                        )}
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <label className="block text-xs font-semibold mb-2 uppercase">
                                            {"Age".split(' ').map((word, index) => (
                                                <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                    {word}
                                                    {index < "Age".split(' ').length - 1 && '\u00A0'}
                                                </span>
                                            ))}
                                        </label>
                                        <Field
                                            type="text"
                                            name="age"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none cursor-not-allowed`}
                                            placeholder="Will be calculated from date of birth"
                                            readOnly
                                            disabled
                                        />
                                        <ErrorMessage name="age" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <label className="block text-xs font-semibold mb-2 uppercase">
                                            {"Gender *".split(' ').map((word, index) => (
                                                <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                    {word}
                                                    {index < "Gender *".split(' ').length - 1 && '\u00A0'}
                                                </span>
                                            ))}
                                        </label>
                                        <Field
                                            as="select"
                                            name="gender"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} focus:outline-none ${errors.gender && touched.gender ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male" selected={values.gender === 'male'}>Male</option>
                                            <option value="female" selected={values.gender === 'female'}>Female</option>
                                            <option value="other" selected={values.gender === 'other'}>Other</option>
                                        </Field>
                                        <ErrorMessage name="gender" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <label className="block text-xs font-semibold mb-2 uppercase">
                                            {"Phone Number *".split(' ').map((word, index) => (
                                                <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                    {word}
                                                    {index < "Phone Number *".split(' ').length - 1 && '\u00A0'}
                                                </span>
                                            ))}
                                        </label>
                                        <Field
                                            type="tel"
                                            name="phoneNumber"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-700 placeholder:text-gray-500'} focus:outline-none ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
                                            placeholder="0123456789"
                                            maxLength={10}
                                            onChange={(e: any) => handleFieldChange('phoneNumber', e.target.value, setFieldValue, values)}
                                        />
                                        <ErrorMessage name="phoneNumber" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                    </div>

                                    <div className={`p-3 lg:p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                        <label className="block text-xs font-semibold mb-2 uppercase">
                                            {"Email *".split(' ').map((word, index) => (
                                                <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                    {word}
                                                    {index < "Email *".split(' ').length - 1 && '\u00A0'}
                                                </span>
                                            ))}
                                        </label>
                                        <Field
                                            type="email"
                                            name="email"
                                            className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-700 placeholder:text-gray-500'} focus:outline-none ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                            placeholder="example@email.com"
                                        />
                                        <ErrorMessage name="email" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                    </div>
                                </div>

                                <div className={`p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                    <label className="block text-xs font-semibold mb-2 uppercase">
                                        {"Address *".split(' ').map((word, index) => (
                                            <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                {word}
                                                {index < "Address *".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="address"
                                        rows={3}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-700 placeholder:text-gray-500'} focus:outline-none ${errors.address && touched.address ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full address"
                                    />
                                    <ErrorMessage name="address" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                </div>

                                <div className={`p-4 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-blue-300'} shadow-sm hover:shadow-md transition-shadow`}>
                                    <label className="block text-xs font-semibold mb-2 uppercase">
                                        {"Identify Number (CMND/CCCD) *".split(' ').map((word, index) => (
                                            <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-300 to-purple-400'}`}>
                                                {word}
                                                {index < "Identify Number (CMND/CCCD) *".split(' ').length - 1 && '\u00A0'}
                                            </span>
                                        ))}
                                    </label>
                                    <Field
                                        type="text"
                                        name="identifyNumber"
                                        className={`w-full px-0 py-0 border-none bg-transparent text-xs lg:text-sm ${isDarkMode ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-700 placeholder:text-gray-500'} focus:outline-none ${errors.identifyNumber && touched.identifyNumber ? 'border-red-500' : ''}`}
                                        placeholder="123456789012"
                                        maxLength={12}
                                        onChange={(e: any) => handleFieldChange('identifyNumber', e.target.value, setFieldValue, values)}
                                    />
                                    <ErrorMessage name="identifyNumber" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                                </div>

                                <div className={`flex justify-end gap-4 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                    <button
                                        onClick={handleCancel}
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
                                        {isUpdating ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </div>
                                    </Form>
                                )}
                            </Formik>
                        )}
                        
                        {isUpdating && (
                            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm flex items-center justify-center rounded-lg z-10`}>
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="loader" style={{
                                        borderColor: isDarkMode ? '#ffffff' : '#000000'
                                    }}></div>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Updating profile...</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'password' && (
                    <ChangePassword 
                        currentUser={currentUser}
                        showNotification={showNotification}
                    />
                )}

                {activeTab === 'history' && (
                    <HistoryProfile 
                        showNotification={showNotification}
                    />
                )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;