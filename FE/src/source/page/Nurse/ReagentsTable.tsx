import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { reagentAPI, testOrdersAPI, reagentUsageAPI } from '../Axios/Axios'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

interface Reagent {
  _id: string;
  reagent_name: string;
  catalog_number?: string;
  manufacturer?: string;
  cas_number?: string;
  description?: string;
  quantity_available: number;
  unit: string;
  created_at?: string;
}

function ReagentsTable() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('orderCode') || localStorage.getItem('currentOrderCode') || ''
  
  const [reagents, setReagents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testOrder, setTestOrder] = useState<any>(null)

  useEffect(() => {
    const loadReagents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await reagentAPI.getAll()
        
        let reagentsData = response.data.data || response.data.reagents || []
        
        if (reagentsData.length === 0 && Array.isArray(response.data)) {
          reagentsData = response.data
        }
        
        // Transform API data to match UI format
        const transformedReagents = reagentsData.map((reagent: Reagent) => {
          const quantity = reagent.quantity_available || 0
          // Determine status based on quantity (threshold can be adjusted)
          let status = 'Available'
          if (quantity === 0) {
            status = 'Out of Stock'
          } else if (quantity < 100) {
            status = 'Low Stock'
          }
          
          return {
            id: reagent._id,
            name: reagent.reagent_name,
            quantity: quantity,
            unit: reagent.unit || 'ml',
            expiryDate: reagent.created_at 
              ? new Date(reagent.created_at).toISOString().split('T')[0] 
              : 'N/A',
            status: status,
            required: true,
            usage: 'As needed', // Default value since API doesn't provide this
            description: [reagent.manufacturer, reagent.catalog_number, reagent.description]
              .filter(Boolean)
              .join(' - ') || 'Standard reagent',
            catalogNumber: reagent.catalog_number,
            manufacturer: reagent.manufacturer
          }
        })
        
        setReagents(transformedReagents)
      } catch (error: any) {
        console.error('❌ Error loading reagents:', error)
        setError(error.message || 'Failed to load reagents')
        setReagents([])
      } finally {
        setLoading(false)
      }
    }

    loadReagents()
  }, [])

  // Load test order to determine test type
  useEffect(() => {
    const loadTestOrder = async () => {
      if (!orderCode) return
      
      try {
        const response = await testOrdersAPI.getOrderByCode(orderCode)
        const orderData = response.data.data || response.data
        setTestOrder(orderData)
      } catch (error: any) {
        console.error('Error loading test order:', error)
      }
    }

    loadTestOrder()
  }, [orderCode])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'Low Stock':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'Out of Stock':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getTestTypeName = () => {
    return 'Differential Count'
  }

  const handleBack = () => {
    // Forward orderCode back to device-check
    if (orderCode) {
      navigate(`/nurse/test-orders/device-check?orderCode=${orderCode}`)
    } else {
      navigate('/nurse/test-orders/device-check')
    }
  }

  const handleContinue = async () => {
    // Check if all required reagents are available
    const requiredReagents = reagents.filter(r => r.required)
    const unavailableReagents = requiredReagents.filter(r => r.status === 'Out of Stock')
    
    if (unavailableReagents.length > 0) {
      toast.error('Cannot proceed: Some required reagents are out of stock.')
      return
    }
    
    try {
      const selectedDeviceStr = localStorage.getItem('selectedDevice')
      const selectedDevice = selectedDeviceStr ? JSON.parse(selectedDeviceStr) : null
      
      if (!selectedDevice) {
        toast.error('Device information not found. Please go back and select device again.')
        return
      }
      
      const reagentsToUse = requiredReagents.map(reagent => ({
        reagent_name: reagent.name,
        quantity_used: 0.5
      }))
      
      await reagentUsageAPI.useForInstrument({
        reagents: reagentsToUse,
        instrument_id: selectedDevice.id,
        procedure: testOrder?.test_type || 'Laboratory Test',
        notes: `Test order: ${orderCode}`,
        used_for: orderCode
      })
      
      toast.success('✅ Reagents have been deducted from inventory')
      
      const testType = testOrder?.test_type || ''
      let executionPath = ''
      
      if (
        testType === 'Urine Test' || 
        testType === 'Urinalysis' || 
        testType === 'Xét nghiệm nước tiểu' ||
        testType.toLowerCase().includes('urine')
      ) {
        executionPath = 'urine-test-execution'
      } 
      else if (
        testType === 'Fecal Analysis' ||
        testType === 'Stool Test' ||
        testType === 'Xét nghiệm phân' ||
        testType.toLowerCase().includes('stool') ||
        testType.toLowerCase().includes('fecal')
      ) {
        executionPath = 'stool-urine-test-execution'
      } else {
        executionPath = 'blood-test-execution'
      }
      if (orderCode) {
        navigate(`/nurse/test-orders/${executionPath}?orderCode=${orderCode}`)
      } else {
        navigate(`/nurse/test-orders/${executionPath}`)
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to use reagents. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reagents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Error Loading Reagents</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/nurse/test-orders/device-check')}
                className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
     
     <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
       

      
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">Required Reagents</h2>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              

              

              
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Reagents for {getTestTypeName()}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">All reagents are required for comprehensive differential count analysis</p>
            </div>

            {/* Reagents Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
              {reagents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No reagents available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-blue-50 dark:bg-gray-700 transition-colors duration-300">
                          <tr>
                            <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Name</th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden lg:table-cell">Catalog #</th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden xl:table-cell">Manufacturer</th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Qty</th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">Unit</th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {reagents.map((reagent, index) => (
                            <tr key={reagent.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-gray-800 dark:text-gray-200 font-medium text-xs md:text-sm">
                                <div className="max-w-[120px] md:max-w-none truncate">{reagent.name}</div>
                                {/* Show additional info on mobile */}
                                <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {reagent.quantity} {reagent.unit}
                                </div>
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden lg:table-cell whitespace-nowrap">{reagent.catalogNumber || 'N/A'}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden xl:table-cell">
                                <div className="max-w-[150px] truncate">{reagent.manufacturer || 'N/A'}</div>
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm whitespace-nowrap">{reagent.quantity}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden sm:table-cell whitespace-nowrap">{reagent.unit}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reagent.status)} whitespace-nowrap`}>
                                  {reagent.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4 transition-colors duration-300">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Reagents</div>
                <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{reagents.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4 transition-colors duration-300">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">All Required</div>
                <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{reagents.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4 transition-colors duration-300 sm:col-span-2 md:col-span-1">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Available</div>
                <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{reagents.filter(r => r.status === 'Available').length}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 md:mt-8">
              <button
                onClick={handleBack}
                className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md:text-base order-2 sm:order-1"
              >
                Back to Test Selection
              </button>
              
              <button
                onClick={handleContinue}
                className="w-full sm:w-auto bg-blue-500 dark:bg-blue-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-medium text-sm md:text-base order-1 sm:order-2"
              >
                Proceed with Test
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ReagentsTable
