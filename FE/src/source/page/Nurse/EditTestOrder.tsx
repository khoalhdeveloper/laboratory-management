import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { testOrdersAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'

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

function EditTestOrder() {
  const navigate = useNavigate()
  const { id } = useParams() // order_code từ URL
  
  // State management
  const [testOrder, setTestOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch test order data
  useEffect(() => {
    const fetchTestOrder = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Gọi API để lấy test order theo order_code
        const response = await testOrdersAPI.getOrderByCode(id)
        
        // Handle both response formats
        const order = response.data.data || response.data
        
        if (order) {
          setTestOrder(order)
        } else {
          setError('Test order not found')
        }
      } catch (err: any) {
        console.error('❌ Error fetching test order:', err)
        setError(err.response?.data?.message || 'Failed to fetch test order')
      } finally {
        setLoading(false)
      }
    }

    fetchTestOrder()
  }, [id])

  const handleSubmit = async (values: any) => {
    if (!id) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Chuẩn bị dữ liệu theo format API
      // NOTE: Không gửi patient_name - backend không cho phép sửa tên (lấy từ user account)
      const updateData = {
        date_of_birth: values.dateOfBirth,
        gender: values.gender,
        age: parseInt(values.age),
        address: values.address,
        phone_number: values.phoneNumber,
        email: values.email,
        status: values.status || testOrder?.status,
        priority: values.priority,
        test_type: values.testType,
        notes: values.notes
      }
      
      // Gọi API để cập nhật test order
      await testOrdersAPI.updateOrder(id, updateData)
      
      // Hiển thị toast thành công
      toast.success('Test order updated successfully!', 5000)
      
      // Delay navigation để toast có thời gian hiển thị
      setTimeout(() => {
        navigate('/nurse/test-orders')
      }, 1000)
      
    } catch (err: any) {
      console.error('Error updating test order:', err)
      const errorMessage = err.response?.data?.message || 'Failed to update test order'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/nurse/test-orders')
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 lg:p-8 mb-4 md:mb-8 transition-colors duration-300">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-500"></div>
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading test order...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 lg:p-8 mb-4 md:mb-8 transition-colors duration-300">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error</h3>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/nurse/test-orders')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
              >
                Back to Test Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
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
              <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 dark:from-blue-300 dark:via-purple-300 dark:to-purple-400 mb-2">Edit Test Order</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Update Patient Information for Order #{id}</p>
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
            initialValues={{
              name: testOrder?.patient_name || '',
              dateOfBirth: testOrder?.date_of_birth ? testOrder.date_of_birth.split('T')[0] : '',
              age: testOrder?.age?.toString() || '',
              gender: testOrder?.gender || '',
              address: testOrder?.address || '',
              phoneNumber: testOrder?.phone_number || '',
              email: testOrder?.email || '',
              testType: testOrder?.test_type || '',
              priority: testOrder?.priority || '',
              notes: testOrder?.notes || ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
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
                    <Field
                      type="date"
                      name="dateOfBirth"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                      onChange={(e: any) => {
                        setFieldValue('dateOfBirth', e.target.value)
                        // Auto-calculate age from date of birth
                        if (e.target.value) {
                          const today = new Date()
                          const birthDate = new Date(e.target.value)
                          const age = today.getFullYear() - birthDate.getFullYear()
                          const monthDiff = today.getMonth() - birthDate.getMonth()
                          
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            setFieldValue('age', (age - 1).toString())
                          } else {
                            setFieldValue('age', age.toString())
                          }
                        }
                      }}
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
                      <option value="Urine Test">Urine Test</option>
                      <option value="Culture Test">Culture Test</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
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
                    {isSubmitting ? 'Updating...' : 'Update Test Order'}
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

export default EditTestOrder
