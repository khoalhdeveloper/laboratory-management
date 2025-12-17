import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { testOrdersAPI, adminAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'
import { Calendar, ChevronDown, Mail, X } from 'lucide-react'

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required'),
  age: Yup.number()
    .required('Age is required')
    .min(0, 'Age must be a positive number')
    .max(150, 'Age must be realistic'),
  gender: Yup.string()
    .required('Gender is required'),
  address: Yup.string()
    .required('Address is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required'),
  email: Yup.string()
    .email('Must be a valid email format')
    .required('Email is required'),
  testType: Yup.string()
    .required('Test type is required'),
  priority: Yup.string()
    .required('Priority is required'),
  notes: Yup.string()
    .required('Notes are required')
})

// Initial form values
const initialValues = {
  name: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  address: '',
  phoneNumber: '',
  email: '',
  testType: '',
  priority: '',
  notes: ''
}

// Custom Date Picker Component
const DatePickerField = ({ name, setFieldValue, value }: { name: string, setFieldValue: any, value?: string }) => {
  const [selectedDate, setSelectedDate] = useState({
    day: '',
    month: '',
    year: ''
  })
  const [isOpen, setIsOpen] = useState(false)

  // Parse initial value from Formik
  useEffect(() => {
    if (value && value !== '') {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          setSelectedDate({
            day: String(date.getDate()),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            year: String(date.getFullYear())
          })
        }
      } catch (error) {
        console.error('Error parsing date:', error)
      }
    }
  }, [value])

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

  const handleDateChange = (field: string, value: string) => {
    const newDate = { ...selectedDate, [field]: value }
    setSelectedDate(newDate)
    
    if (newDate.day && newDate.month && newDate.year) {
      const dateString = `${newDate.year}-${newDate.month}-${newDate.day.padStart(2, '0')}`
      setFieldValue(name, dateString)
      
      // Auto-calculate age
      const today = new Date()
      const birthDate = new Date(dateString)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFieldValue('age', (age - 1).toString())
      } else {
        setFieldValue('age', age.toString())
      }
    }
  }

  const formatDisplayDate = () => {
    if (selectedDate.day && selectedDate.month && selectedDate.year) {
      const monthName = months.find(m => m.value === selectedDate.month)?.label
      return `${selectedDate.day} ${monthName} ${selectedDate.year}`
    }
    return 'Select date of birth'
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <span className={selectedDate.day ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {formatDisplayDate()}
        </span>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Day */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Day</label>
              <select
                value={selectedDate.day}
                onChange={(e) => handleDateChange('day', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Month</label>
              <select
                value={selectedDate.month}
                onChange={(e) => handleDateChange('month', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Year</label>
              <select
                value={selectedDate.year}
                onChange={(e) => handleDateChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => {
                setSelectedDate({ day: '', month: '', year: '' })
                setFieldValue(name, '')
                setIsOpen(false)
              }}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NewTestOrder() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Email verification modal states
  const [showEmailModal, setShowEmailModal] = useState(true)
  const [emailLookup, setEmailLookup] = useState('')
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [initialFormValues, setInitialFormValues] = useState(initialValues)

  // Clear patient userid when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('patientUserId')
    }
  }, [])

  // Handle email confirmation
  const handleConfirmEmail = async () => {
    if (!emailLookup.trim()) {
      toast.error('Please enter email address')
      return
    }

    try {
      setLoadingLookup(true)
      
      const response = await adminAPI.getAccountByEmail(emailLookup.trim())
      
      if (!response.data || !response.data.userid) {
        toast.error('Email not found in system')
        return
      }

      const account = response.data
      
      localStorage.setItem('patientUserId', account.userid)
      
      const prefillValues: any = {
        name: account.fullName || '',
        email: account.email || '',
        phoneNumber: account.phoneNumber || '',
        address: account.address || '',
        gender: account.gender || '',
        testType: '',
        priority: '',
        notes: ''
      }
      
      if (account.dateOfBirth) {
        const dob = new Date(account.dateOfBirth)
        const dateString = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`
        prefillValues.dateOfBirth = dateString
        
        if (account.age) {
          prefillValues.age = account.age.toString()
        } else {
          const today = new Date()
          let age = today.getFullYear() - dob.getFullYear()
          const monthDiff = today.getMonth() - dob.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--
          }
          prefillValues.age = age.toString()
        }
      } else {
        prefillValues.dateOfBirth = ''
        prefillValues.age = ''
      }
      
      setInitialFormValues(prefillValues)
      toast.success(`Found patient: ${account.fullName}`)
      setShowEmailModal(false)
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to lookup email')
    } finally {
      setLoadingLookup(false)
    }
  }

  // Handle skip email verification
  const handleSkipEmail = () => {
    localStorage.removeItem('patientUserId')
    setShowEmailModal(false)
    toast.info('You can manually enter patient information. Form is now editable.')
  }

  const handleSubmit = async (values: any, resetForm?: () => void) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const userId = localStorage.getItem('patientUserId')
      const finalUserId = userId || 'User20'
      
      if (!userId) {
        toast.info('Creating test order with manual information (using system default account)')
      }
      const orderData = {
        userid: finalUserId,
        patient_name: values.name, // Backend sẽ tự lấy từ userAccount.fullName hoặc tạo mới (hoặc dùng giá trị này cho user mới)
        date_of_birth: values.dateOfBirth,
        gender: values.gender,
        age: parseInt(values.age),
        address: values.address,
        phone_number: values.phoneNumber,
        email: values.email,
        status: 'pending',
        priority: values.priority,
        test_type: values.testType,
        notes: values.notes
      }
      
      // Gọi API để tạo test order
      await testOrdersAPI.createTestOrder(orderData)
      
      toast.success('Test order created successfully! Go to Test Orders to perform the test.', 5000)
      
      // Reset form sau khi tạo thành công
      if (resetForm) {
        resetForm()
      }
      
      // Reset initial form values để đảm bảo form được reset hoàn toàn
      setInitialFormValues(initialValues)
      
      // Navigate back to test orders list to follow the standard workflow
      // User will then select the test order and go through: Device Check → Reagents → Test Execution
      setTimeout(() => {
        navigate('/nurse/test-orders')
      }, 1500)
      
    } catch (err: any) {
      console.error('Error creating test order:', err)
      const errorMessage = err.response?.data?.message || 'Failed to create test order'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/nurse/test-orders')
  }
  // Uses shared Nurse Layout (sidebar + header provided by parent layout)

  return (
    <>
      {/* Email Verification Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">Verify Patient Email</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Optional - auto-fill patient information</p>
                </div>
              </div>
              <button
                onClick={handleSkipEmail}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Skip (manual entry)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6">
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patient Email Address <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="email"
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmEmail()}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                placeholder="e.g. patient@example.com"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Enter patient's registered email to auto-fill information, or click Skip to enter manually
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <button
                onClick={handleSkipEmail}
                className="px-3 py-2 md:px-4 md:py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                New Patient
              </button>
              <button
                onClick={handleConfirmEmail}
                disabled={loadingLookup}
                className="px-4 py-2 md:px-6 md:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm md:text-base"
              >
                {loadingLookup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Checking...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Verify Email</span>
                    <span className="sm:hidden">Verify</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input::placeholder {
          color: rgb(156 163 175);
        }
        .dark input::placeholder {
          color: rgb(156 163 175);
        }
        select::placeholder {
          color: rgb(156 163 175);
        }
        .dark select::placeholder {
          color: rgb(156 163 175);
        }
      `}</style>
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto transition-colors duration-300">
      {/* Form Content (content-only) */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 lg:p-8 mb-4 md:mb-8 transition-colors duration-300">
          {/* Form Header */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 dark:from-blue-300 dark:via-purple-300 dark:to-purple-400 mb-2">New Test Order</h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Patient Information</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm md:text-base text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
          
          {/* Form Fields */}
          <Formik
            initialValues={initialFormValues}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              handleSubmit(values, resetForm)
            }}
            enableReinitialize={true}
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-4 md:space-y-6">
                {/* Row 1: Name and Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Patient's name <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                      placeholder="Enter patient's name"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of birth <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <DatePickerField
                      name="dateOfBirth"
                      setFieldValue={setFieldValue}
                      value={values.dateOfBirth}
                    />
                    <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                </div>

                {/* Row 2: Age and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <Field
                      type="text"
                      name="age"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                      placeholder="Auto-calculated"
                      readOnly
                    />
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Auto-calculated from DOB</p>
                    <ErrorMessage name="age" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <Field
                      as="select"
                      name="gender"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                </div>

                {/* Row 3: Address */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <Field
                    type="text"
                    name="address"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                    placeholder="Enter patient's address"
                  />
                  <ErrorMessage name="address" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                </div>

                {/* Row 4: Phone and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone number <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <Field
                      type="tel"
                      name="phoneNumber"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                      placeholder="Enter phone number"
                    />
                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                      placeholder="Enter email address"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                </div>

                {/* Row 5: Test Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Type <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <Field
                      as="select"
                      name="testType"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                    >
                      <option value="">Select test type</option>
                      <option value="Blood Test">Blood Test</option>
                      <option value="Urinalysis">Urinalysis</option>
                      <option value="Fecal Analysis">Fecal Analysis</option>
                    </Field>
                    <ErrorMessage name="testType" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <Field
                      as="select"
                      name="priority"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                    >
                      <option value="">Select priority</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </Field>
                    <ErrorMessage name="priority" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                  </div>
                </div>

                {/* Row 6: Notes */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <Field
                    as="textarea"
                    name="notes"
                    rows={4}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                    placeholder="Enter test notes and instructions"
                  />
                  <ErrorMessage name="notes" component="div" className="text-red-500 dark:text-red-400 text-xs md:text-sm mt-1" />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 md:pt-8 pb-4 md:pb-6 border-t border-gray-200 dark:border-gray-600 mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 shadow-md text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-sky-300 to-violet-400 dark:from-sky-400 dark:to-violet-500 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 dark:hover:from-sky-500 dark:hover:to-violet-600 transition-all font-semibold disabled:opacity-50 shadow-md text-sm md:text-base"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Test Order'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      </div>
    </>
  )
}

export default NewTestOrder
