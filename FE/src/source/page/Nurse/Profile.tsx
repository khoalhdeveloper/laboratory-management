import React, { useState } from 'react';

function Profile() {
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [avatar, setAvatar] = useState('https://images.pexels.com/photos/8460094/pexels-photo-8460094.jpeg?auto=compress&cs=tinysrgb&w=400');
     const[isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'Johnathan Doe',
        dateOfBirth: '07/15/1985',
        age: '32',
        gender: 'male',
        address: '123 Main Street, City, State 12345',
        phoneNumber: '+1 234 567 8900',
        email: 'john.doe@example.com',
        identifyNumber: '123456789'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

     const [errors, setErrors] = useState<{ [key: string]: string }>({});
     const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
     const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ''
            }));
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
  const [newAvatar, setNewAvatar] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       try {
         setIsUploading(true);
         setUploadMessage(null); // Clear previous message
         const uploadedUrl = await handleUploadImage(file);
         setAvatar(uploadedUrl);
         setIsUploading(false);
         setUploadMessage({ type: 'success', message: 'Avatar updated successfully!' });
         
         // Auto hide message after 3 seconds
         setTimeout(() => {
           setUploadMessage(null);
         }, 3000);
       } catch (error) {
         console.error('Error uploading avatar:', error);
         setIsUploading(false);
         setUploadMessage({ type: 'error', message: 'Failed to upload avatar. Please try again.' });
         
         // Auto hide error message after 5 seconds
         setTimeout(() => {
           setUploadMessage(null);
         }, 5000);
       }
     }
   };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        // Date of Birth validation
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else {
            const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
            if (!dateRegex.test(formData.dateOfBirth)) {
                newErrors.dateOfBirth = 'Date must be in MM/DD/YYYY format';
            }
        }

        // Age validation
        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else {
            const age = parseInt(formData.age);
            if (isNaN(age) || age < 0 || age > 150) {
                newErrors.age = 'Age must be a valid number between 0-150';
            }
        }

        // Gender validation
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        // Phone Number validation
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        } else {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
                newErrors.phoneNumber = 'Please enter a valid phone number';
            }
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        // Identify Number validation
        if (!formData.identifyNumber.trim()) {
            newErrors.identifyNumber = 'Identify number is required';
        } else {
            const idRegex = /^[0-9]{9,12}$/;
            if (!idRegex.test(formData.identifyNumber)) {
                newErrors.identifyNumber = 'Identify number must be 9-12 digits';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'New password must be at least 8 characters';
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Profile data:', formData);
            alert('Profile updated successfully!');
            setIsEditing(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original values if needed
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePasswordForm()) {
            console.log('Password change data:', passwordData);
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    };

    return (
        <div className="flex-1 p-6 bg-gradient-to-br from-sky-100 to-violet-100">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 mb-2">Nurse Profile</h1>
                </div>

                {/* Avatar Upload Section */}
                <div className="mb-8 text-center">
                    <div className="relative inline-block">
                        <img
                            src={avatar}
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <label className="absolute bottom-0 right-0 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-full p-2 cursor-pointer hover:from-sky-400 hover:to-violet-500 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {isUploading ? 'Uploading...' : 'Click the camera icon to upload a new avatar'}
                    </p>
                    
                    {/* Upload Message */}
                    {uploadMessage && (
                        <div className={`mt-4 p-3 rounded-lg border ${
                            uploadMessage.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            <div className="flex items-center">
                                <div className={`w-5 h-5 mr-2 ${
                                    uploadMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {uploadMessage.type === 'success' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm font-medium">{uploadMessage.message}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-blue-300">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal'
                                    ? 'border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400'
                                    : 'border-transparent text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:border-blue-300'
                                    }`}
                            >
                                Personal Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
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
                    <div className="space-y-6">
                        {!isEditing ? (
                            /* Read-only view with icons */
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">Personal Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Email */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">EMAIL</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.email || 'Not provided'}</p>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">PHONE NUMBER</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.phoneNumber || 'Not provided'}</p>
                                    </div>

                                    {/* Age */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">AGE</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.age || 'Not provided'}</p>
                                    </div>

                                    {/* Gender */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">GENDER</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Not provided'}</p>
                                    </div>

                                    {/* Full Name */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">FULL NAME</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.fullName || 'Not provided'}</p>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">DATE OF BIRTH</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.dateOfBirth || 'Not provided'}</p>
                                    </div>

                                    {/* Address */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">ADDRESS</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.address || 'Not provided'}</p>
                                    </div>

                                    {/* Identify Number */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 uppercase font-medium">CCCD</p>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">{formData.identifyNumber || 'Not provided'}</p>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleEdit}
                                        className="px-6 py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Edit form */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.fullName ? 'border-red-500' : ''}`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.fullName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                            Date of Birth *
                                        </label>
                                        <input
                                            type="text"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                                            placeholder="MM/DD/YYYY"
                                        />
                                        {errors.dateOfBirth && (
                                            <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                                        )}
                                    </div>

                                    {/* Age */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                            Age *
                                        </label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.age ? 'border-red-500' : ''}`}
                                            placeholder="Enter your age"
                                            min="0"
                                            max="150"
                                        />
                                        {errors.age && (
                                            <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                            Gender *
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.gender ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.phoneNumber ? 'border-red-500' : ''}`}
                                            placeholder="+1 234 567 8900"
                                        />
                                        {errors.phoneNumber && (
                                            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                        <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.email ? 'border-red-500' : ''}`}
                                            placeholder="example@email.com"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                        Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.address ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full address"
                                    />
                                    {errors.address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                    )}
                                </div>

                                {/* Identify Number */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                        Identify Number (CMND/CCCD) *
                                    </label>
                                    <input
                                        type="text"
                                        name="identifyNumber"
                                        value={formData.identifyNumber}
                                        onChange={handleChange}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.identifyNumber ? 'border-red-500' : ''}`}
                                        placeholder="Enter your identify number"
                                    />
                                    {errors.identifyNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.identifyNumber}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold"
                                    >
                                        Update Profile
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="max-w-md mx-auto">
                            <div className="space-y-6">
                                {/* Current Password */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                        Current Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                                        placeholder="Enter your current password"
                                    />
                                    {passwordErrors.currentPassword && (
                                        <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                        New Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                                        placeholder="Enter your new password"
                                    />
                                    {passwordErrors.newPassword && (
                                        <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                                        placeholder="Confirm your new password"
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile;