import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testOrdersAPI } from '../Axios/Axios'

// Interface cho Test Order từ API
interface TestOrder {
  _id: string;
  userid: string;
  created_by: string;
  order_code: string;
  patient_name: string;
  date_of_birth: string;
  gender: string;
  age: number;
  address: string;
  phone_number: string;
  email: string;
  status: string;
  priority: string;
  test_type: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

function TestOrderDetail() {
  const { orderCode } = useParams<{ orderCode: string }>()
  const navigate = useNavigate()
  
  const [testOrder, setTestOrder] = useState<TestOrder | null>(null)
  const [loading, setLoading] = useState(false) // Changed to false initially
  const [error, setError] = useState<string | null>(null)

  // Fetch chi tiết test order
  useEffect(() => {
    const fetchTestOrderDetail = async () => {
      if (!orderCode) {
        console.warn('⚠️ No orderCode in URL params')
        setError('Order code is required. Please provide a valid order code in the URL.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await testOrdersAPI.getOrderByCode(orderCode)
        
        setTestOrder(response.data.data)
      } catch (err: any) {
        console.error('❌ Error fetching test order detail:', err)
        setError(err.response?.data?.message || 'Failed to fetch test order detail')
      } finally {
        setLoading(false)
      }
    }

    fetchTestOrderDetail()
  }, [orderCode])

  const handleBack = () => {
    navigate('/nurse/test-orders')
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-500"></div>
          <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading test order detail...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-red-500 text-base md:text-lg font-semibold mb-4">Error</div>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
          >
            Back to Test Orders
          </button>
        </div>
      </div>
    )
  }

  if (!testOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-semibold mb-4">Test Order Not Found</div>
          <button 
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
          >
            Back to Test Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button 
              onClick={handleBack}
              className="p-1.5 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-200">Test Order Detail</h1>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(testOrder.status)}`}>
              {testOrder.status}
            </span>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getPriorityColor(testOrder.priority)}`}>
              {testOrder.priority}
            </span>
          </div>
        </div>

        {/* Test Order Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 md:mb-4">Basic Information</h3>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Order Code</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 font-mono">{testOrder.order_code}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Patient Name</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">{testOrder.patient_name}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Test Type</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">{testOrder.test_type}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Created By</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">{testOrder.created_by}</p>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 md:mb-4">Patient Details</h3>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">{testOrder.date_of_birth}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Gender</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 capitalize">{testOrder.gender}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Age</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">{testOrder.age}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">{testOrder.phone_number}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 break-all">{testOrder.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-4 md:mt-6">
            <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Address</label>
            <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 mt-1">{testOrder.address}</p>
          </div>

          {/* Notes */}
          {testOrder.notes && (
            <div className="mt-4 md:mt-6">
              <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
              <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 mt-1 bg-gray-50 dark:bg-gray-700 p-2 md:p-3 rounded-lg">
                {testOrder.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Created At</label>
                <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                  {new Date(testOrder.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Updated At</label>
                <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                  {new Date(testOrder.updated_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestOrderDetail