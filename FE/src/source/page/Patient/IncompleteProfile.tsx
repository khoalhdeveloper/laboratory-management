import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../Axios/Axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function IncompleteProfile() {
    const navigate = useNavigate();
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

    // Validation schema
    const validationSchema = Yup.object({
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
            const result = `${year}-${month}-${day}`;
            return result;
        }
        return '';
    };

    // Load user data when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                
                
                const response = await userAPI.getCurrentUser();
                const userData = response.data;
                
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
                    }
                } else {
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
                
                if (error.response?.status === 403) {
                    showNotification('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 'error');
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userId');
                        navigate('/login');
                    }, 2000);
                } else {
                    showNotification('Không thể tải thông tin người dùng. Vui lòng thử lại.', 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleFieldChange = (name: string, value: string, setFieldValue: any) => {
        // Handle date selection
        if (name === 'day' || name === 'month' || name === 'year') {
            setFieldValue(name, value);
            // Update dateOfBirth when any date part changes
            const currentValues = formData;
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


    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            
            await userAPI.updateProfile(values);
            showNotification('Cập nhật thông tin thành công!', 'success');
            
            // Dispatch event to notify other components that profile was updated
            window.dispatchEvent(new CustomEvent('profileUpdated'));
            
            // Redirect to dashboard after successful update
            setTimeout(() => {
                navigate('/patient/dashboard');
            }, 1500);
        } catch (error: any) {
            if (error.response?.status === 403) {
                showNotification('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 'error');
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    navigate('/login');
                }, 2000);
            } else if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else {
                showNotification('Không thể cập nhật thông tin. Vui lòng thử lại.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-6 bg-gradient-to-br from-sky-100 to-violet-100">
            {/* Notification */}
            {notification.visible && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 mb-2">Hoàn thiện thông tin cá nhân</h1>
                    <p className="text-gray-600">Vui lòng điền đầy đủ thông tin bắt buộc để sử dụng hệ thống</p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Đang tải...</span>
                    </div>
                ) : (
                    <Formik
                        initialValues={formData}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                    >
                        {({ setFieldValue, errors, touched }) => (
                            <Form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Full Name *
                                </label>
                                <Field
                                    type="text"
                                    name="fullName"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                                    placeholder="Enter your full name"
                                />
                                <ErrorMessage name="fullName" component="p" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Date of Birth */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Date of Birth *
                                </label>
                                <div className="flex gap-2">
                                    {/* Day */}
                                    <Field
                                        as="select"
                                        name="day"
                                        className={`flex-1 px-2 py-1 border-none bg-transparent text-gray-700 focus:outline-none ${errors.day && touched.day ? 'border-red-500' : ''}`}
                                        onChange={(e: any) => handleFieldChange('day', e.target.value, setFieldValue)}
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
                                        className={`flex-1 px-2 py-1 border-none bg-transparent text-gray-700 focus:outline-none ${errors.month && touched.month ? 'border-red-500' : ''}`}
                                        onChange={(e: any) => handleFieldChange('month', e.target.value, setFieldValue)}
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
                                        className={`flex-1 px-2 py-1 border-none bg-transparent text-gray-700 focus:outline-none ${errors.year && touched.year ? 'border-red-500' : ''}`}
                                        onChange={(e: any) => handleFieldChange('year', e.target.value, setFieldValue)}
                                    >
                                        <option value="">Year</option>
                                        {generateYears().map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </Field>
                                </div>
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            {/* Age */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Age *
                                </label>
                                <Field
                                    type="number"
                                    name="age"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.age && touched.age ? 'border-red-500' : ''}`}
                                    placeholder="Enter your age"
                                    min="0"
                                    max="150"
                                />
                                <ErrorMessage name="age" component="p" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Gender */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Gender *
                                </label>
                                <Field
                                    as="select"
                                    name="gender"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.gender && touched.gender ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Field>
                                <ErrorMessage name="gender" component="p" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Phone Number */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Phone Number *
                                </label>
                                <Field
                                    type="tel"
                                    name="phoneNumber"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
                                    placeholder="0123456789"
                                    maxLength={10}
                                    onChange={(e: any) => handleFieldChange('phoneNumber', e.target.value, setFieldValue)}
                                />
                                <ErrorMessage name="phoneNumber" component="p" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Email */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                    Email *
                                </label>
                                <Field
                                    type="email"
                                    name="email"
                                    className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                    placeholder="example@email.com"
                                />
                                <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                            <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                Address *
                            </label>
                            <Field
                                as="textarea"
                                name="address"
                                rows={3}
                                className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.address && touched.address ? 'border-red-500' : ''}`}
                                placeholder="Enter your full address"
                            />
                            <ErrorMessage name="address" component="p" className="text-red-500 text-sm mt-1" />
                        </div>

                        {/* Identify Number */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                            <label className="block text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2 uppercase">
                                Identify Number (CMND/CCCD) *
                            </label>
                            <Field
                                type="text"
                                name="identifyNumber"
                                className={`w-full px-0 py-0 border-none bg-transparent text-gray-700 focus:outline-none ${errors.identifyNumber && touched.identifyNumber ? 'border-red-500' : ''}`}
                                placeholder="123456789012"
                                maxLength={12}
                                onChange={(e: any) => handleFieldChange('identifyNumber', e.target.value, setFieldValue)}
                            />
                            <ErrorMessage name="identifyNumber" component="p" className="text-red-500 text-sm mt-1" />
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-sky-400 to-violet-500 text-white rounded-lg hover:from-sky-500 hover:to-violet-600 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Hoàn thiện thông tin
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
