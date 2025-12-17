import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../Axios/Axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

function IncompleteProfile() {
    const navigate = useNavigate();
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
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

    const validationSchema = Yup.object({
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
            const result = `${year}-${month}-${day}`;
            return result;
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
            
            // Adjust age if birthday hasn't occurred this year
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age >= 0 ? age.toString() : '';
        } catch (error) {
            return '';
        }
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
               } else {
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
                
           } catch (error: any) {
                if (error.response?.status === 403) {
                    showNotification('Invalid or expired token. Please login again.', 'error');
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userId');
                        navigate('/login');
                    }, 2000);
                } else {
                    showNotification('Unable to load user information. Please try again.', 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

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


    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            
            await userAPI.updateProfile(values);
            showNotification('Profile updated successfully!', 'success');
            
            window.dispatchEvent(new CustomEvent('profileUpdated'));
            
            setTimeout(() => {
                navigate('/patient/dashboard');
            }, 1500);
        } catch (error: any) {
            if (error.response?.status === 403) {
                showNotification('Invalid or expired token. Please login again.', 'error');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    navigate('/login');
                }, 2000);
            } else if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else {
                showNotification('Unable to update profile. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-3 lg:p-6 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-800 dark:to-gray-900 min-h-screen">
            {notification.visible && (
                <div className={`fixed top-4 right-4 z-50 px-4 lg:px-6 py-2 lg:py-3 rounded-lg shadow-lg text-white font-medium text-sm lg:text-base ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 mb-2">Complete Personal Information</h1>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Please fill in all required information to use the system</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8 lg:py-12">
                        <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-sm lg:text-base text-gray-600 dark:text-gray-400">Loading...</span>
                    </div>
                ) : (
                    <Formik
                        initialValues={formData}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                    >
                        {({ setFieldValue, errors, touched, values }) => (
                            <Form className="space-y-4 lg:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {/* Full Name */}
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Full Name *
                                </label>
                                <Field
                                    type="text"
                                    name="fullName"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                                    placeholder="Enter your full name"
                                />
                                <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                            </div>

                            {/* Date of Birth */}
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Date of Birth *
                                </label>
                                <div className="flex gap-1 lg:gap-2">
                                    {/* Day */}
                                    <Field
                                        as="select"
                                        name="day"
                                        className={`flex-1 px-1 lg:px-2 py-1 border-none bg-transparent text-xs lg:text-sm text-gray-700 dark:text-black focus:outline-none ${errors.day && touched.day ? 'border-red-500' : ''}`}
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
                                        className={`flex-1 px-1 lg:px-2 py-1 border-none bg-transparent text-xs lg:text-sm text-gray-700 dark:text-black focus:outline-none ${errors.month && touched.month ? 'border-red-500' : ''}`}
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
                                        className={`flex-1 px-1 lg:px-2 py-1 border-none bg-transparent text-xs lg:text-sm text-gray-700 dark:text-black focus:outline-none ${errors.year && touched.year ? 'border-red-500' : ''}`}
                                        onChange={(e: any) => handleFieldChange('year', e.target.value, setFieldValue, values)}
                                    >
                                        <option value="">Year</option>
                                        {generateYears().map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </Field>
                                </div>
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-xs lg:text-sm mt-1">{typeof errors.dateOfBirth === 'string' ? errors.dateOfBirth : String(errors.dateOfBirth)}</p>
                                )}
                            </div>

                            {/* Age - Auto calculated from date of birth */}
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Age
                                </label>
                                <Field
                                    type="text"
                                    name="age"
                                    className="w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none cursor-not-allowed"
                                    placeholder="Will be calculated from date of birth"
                                    readOnly
                                    disabled
                                />
                                <ErrorMessage name="age" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                            </div>

                            {/* Gender */}
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Gender *
                                </label>
                                <Field
                                    as="select"
                                    name="gender"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none ${errors.gender && touched.gender ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Field>
                                <ErrorMessage name="gender" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                            </div>

                            {/* Phone Number */}
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Phone Number *
                                </label>
                                <Field
                                    type="tel"
                                    name="phoneNumber"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
                                    placeholder="0123456789"
                                    maxLength={10}
                                    onChange={(e: any) => handleFieldChange('phoneNumber', e.target.value, setFieldValue, values)}
                                />
                                <ErrorMessage name="phoneNumber" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                            </div>

                            {/* Email */}
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Email *
                                </label>
                                <Field
                                    type="email"
                                    name="email"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                    placeholder="example@email.com"
                                />
                                <ErrorMessage name="email" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                            <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                Address *
                            </label>
                            <Field
                                as="textarea"
                                name="address"
                                rows={3}
                                className={`w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none ${errors.address && touched.address ? 'border-red-500' : ''}`}
                                placeholder="Enter your full address"
                            />
                            <ErrorMessage name="address" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                        </div>

                        {/* Identify Number */}
                        <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                            <label className="block text-xs lg:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                Identify Number (CMND/CCCD) *
                            </label>
                            <Field
                                type="text"
                                name="identifyNumber"
                                className={`w-full px-0 py-0 border-none bg-transparent text-sm lg:text-base text-gray-700 dark:text-black focus:outline-none ${errors.identifyNumber && touched.identifyNumber ? 'border-red-500' : ''}`}
                                placeholder="123456789012"
                                maxLength={12}
                                onChange={(e: any) => handleFieldChange('identifyNumber', e.target.value, setFieldValue, values)}
                            />
                            <ErrorMessage name="identifyNumber" component="p" className="text-red-500 text-xs lg:text-sm mt-1" />
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                className="px-4 lg:px-8 py-2 lg:py-4 bg-gradient-to-r from-sky-400 to-violet-500 text-white rounded-lg hover:from-sky-500 hover:to-violet-600 transition-all font-semibold text-sm lg:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Complete Profile
                            </button>
                        </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
}

export default IncompleteProfile;
