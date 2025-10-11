import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'

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
    .required('Email is required')
})

// Initial form values
const initialValues = {
  name: 'Nguyễn Văn A',
  dateOfBirth: '',
  age: '',
  gender: '',
  address: '',
  phoneNumber: '+84...',
  email: ''
}

function NewTestOrder() {
  const navigate = useNavigate()

  const handleSubmit = (values: any) => {
    console.log('Saving test order:', values)
    // Here you would make API call to save the test order
    // After successful save, navigate to device check
    navigate('/nurse/test-orders/device-check')
  }

  const handleCancel = () => {
    navigate('/nurse/test-orders')
  }
  // Uses shared Nurse Layout (sidebar + header provided by parent layout)

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-sky-100 to-violet-100 overflow-y-auto">
      {/* Form Content (content-only) */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {/* Form Header */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 mb-2">New Test Order</h3>
            <p className="text-gray-600">Patient Information</p>
          </div>
          
          {/* Form Fields */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Row 1: Name and Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient's name <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter patient's name"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of birth <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="date"
                      name="dateOfBirth"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* Row 2: Age and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <Field
                      type="text"
                      name="age"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Auto-calculated"
                      readOnly
                    />
                    <p className="text-sm text-gray-500 mt-1">Auto-calculated from DOB</p>
                    <ErrorMessage name="age" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="gender"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* Row 3: Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Field
                    type="text"
                    name="address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter patient's address"
                  />
                  <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Row 4: Phone and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="tel"
                      name="phoneNumber"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-8 pb-6 border-t border-gray-200 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-sky-300 to-violet-400 text-white rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold disabled:opacity-50 shadow-md"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default NewTestOrder
