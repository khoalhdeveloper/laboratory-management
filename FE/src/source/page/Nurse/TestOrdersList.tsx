import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { testOrdersAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'

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
  createdAt: string;  // Changed from created_at to match backend
  updatedAt: string;  // Changed from updated_at to match backend
}

function TestOrdersList() {
  // State management
  const [testOrders, setTestOrders] = useState<TestOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, orderCode: string | null, orderName: string}>({
    isOpen: false,
    orderCode: null,
    orderName: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  // Fetch test orders do nurse hiện tại tạo từ API
  useEffect(() => {
    const fetchTestOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await testOrdersAPI.getCreatedOrders()
        
        // API trả về { message: "...", data: [...] }, cần lấy response.data.data
        if (response.data && response.data.data) {
          setTestOrders(response.data.data)
        } else {
          setTestOrders([])
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch test orders')
      } finally {
        setLoading(false)
      }
    }

    fetchTestOrders()
  }, [])

  const handleNewTestOrder = () => {
    navigate('/nurse/test-orders/new')
  }

  const handleEditTestOrder = (orderId: string) => {
    // Tìm order_code từ orderId (_id)
    const order = testOrders.find(o => o._id === orderId)
    if (order) {
      navigate(`/nurse/test-orders/edit/${order.order_code}`)
    }
  }

  const handleDeleteClick = (orderCode: string, patientName: string) => {
    setDeleteModal({
      isOpen: true,
      orderCode: orderCode,
      orderName: patientName
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.orderCode) return
    
    try {
      await testOrdersAPI.deleteOrderByCode(deleteModal.orderCode)
      
      // Hiển thị toast thành công
      toast.success('Test order deleted successfully!', 5000)
      
      // Refresh danh sách test orders do nurse tạo sau khi xóa
      const response = await testOrdersAPI.getCreatedOrders()
      if (response.data && response.data.data) {
        setTestOrders(response.data.data)
      }
      setDeleteModal({ isOpen: false, orderCode: null, orderName: '' })
    } catch (err: any) {
      console.error('❌ Error deleting test order:', err)
      const errorMessage = err.response?.data?.message || 'Failed to delete test order'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, orderCode: null, orderName: '' })
  }

  const handleViewDetails = (orderCode: string) => {
    navigate(`/nurse/test-orders/detail/${orderCode}`)
  }

  const handleStartTest = (orderCode: string) => {
    // Lưu order code và navigate đến device check
    localStorage.setItem('currentOrderCode', orderCode)
    navigate(`/nurse/test-orders/device-check?orderCode=${orderCode}`)
  }



  // Uses shared Nurse layout (sidebar + header provided by parent page)

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

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300 w-full max-w-full overflow-hidden">
            {/* Page Header with Add Button */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200">Test Orders</h3>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <button 
                  onClick={handleNewTestOrder}
                  className="w-full sm:w-auto bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Test Order</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Loading test orders...</span>
                </div>
              </div>
            )}
            

            {/* No Data State */}
            {!loading && !error && testOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No test orders found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any test orders yet.</p>
                <button 
                  onClick={handleNewTestOrder}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create your first test order
                </button>
              </div>
            )}

            {/* Table - Only show when not loading and has data */}
            {!loading && !error && testOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-blue-50 dark:bg-gray-700 transition-colors duration-300">
                        <tr>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Order Code</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Patient Name</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden lg:table-cell">Test Type</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Status</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">Priority</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden xl:table-cell">Created Date</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap hidden xl:table-cell">Created By</th>
                          <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-blue-800 dark:text-blue-200 text-xs md:text-sm whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {(() => {
                          const itemsPerPage = 10
                          const startIndex = (currentPage - 1) * itemsPerPage
                          const endIndex = startIndex + itemsPerPage
                          const currentOrders = testOrders.slice(startIndex, endIndex)
                          
                          return currentOrders.map((order, index) => (
                          <tr key={order._id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-600`}>
                            <td className="py-3 md:py-4 px-3 md:px-6 text-gray-800 dark:text-gray-200 font-medium text-xs md:text-sm whitespace-nowrap">{order.order_code}</td>
                            <td className="py-3 md:py-4 px-3 md:px-6 text-gray-800 dark:text-gray-200 text-xs md:text-sm">
                              <div className="max-w-[150px] md:max-w-none truncate">{order.patient_name}</div>
                              {/* Show additional info on mobile */}
                              <div className="lg:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">{order.test_type}</div>
                            </td>
                            <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden lg:table-cell whitespace-nowrap">{order.test_type}</td>
                            <td className="py-3 md:py-4 px-3 md:px-6">
                              <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} whitespace-nowrap`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 md:py-4 px-3 md:px-6 hidden sm:table-cell">
                              <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)} whitespace-nowrap`}>
                                {order.priority}
                              </span>
                            </td>
                            <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm whitespace-nowrap hidden xl:table-cell">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="py-3 md:py-4 px-3 md:px-6 text-gray-600 dark:text-gray-400 text-xs md:text-sm whitespace-nowrap hidden xl:table-cell">{order.created_by}</td>
                            <td className="py-3 md:py-4 px-3 md:px-6">
                              <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                                {/* Test Button - Primary action */}
                                {order.status === 'pending' && (
                                  <button 
                                    onClick={() => handleStartTest(order.order_code)}
                                    className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs md:text-sm font-medium rounded-lg transition-all shadow-sm flex items-center gap-1" 
                                    title="Start Test"
                                  >
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <span className="hidden sm:inline">Test</span>
                                  </button>
                                )}
                                
                                {/* View Button */}
                                <button 
                                  onClick={() => handleViewDetails(order.order_code)}
                                  className="p-1.5 md:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" 
                                  title="View Details"
                                >
                                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                
                                {/* Edit Button */}
                                <button 
                                  onClick={() => handleEditTestOrder(order._id)}
                                  className="p-1.5 md:p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors" 
                                  title="Edit"
                                >
                                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                {/* Delete Button */}
                                <button 
                                  onClick={() => handleDeleteClick(order.order_code, order.patient_name)}
                                  className="p-1.5 md:p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors" 
                                  title="Delete"
                                >
                                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                        })()}
                      </tbody>
                </table>
              </div>
            )}

            {/* Pagination - Only show when has data */}
            {!loading && !error && testOrders.length > 0 && (() => {
              const itemsPerPage = 10
              const totalPages = Math.ceil(testOrders.length / itemsPerPage)
              
              return (
                <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1 md:gap-2 order-2 sm:order-1">
                      <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={currentPage <= 1}
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button 
                        onClick={() => setCurrentPage(1)}
                        className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
                          currentPage === 1 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        1
                      </button>
                      {totalPages > 1 && (
                        <button 
                          onClick={() => setCurrentPage(2)}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
                            currentPage === 2 
                              ? 'bg-blue-500 text-white' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          2
                        </button>
                      )}
                      {totalPages > 2 && (
                        <button 
                          onClick={() => setCurrentPage(3)}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors hidden sm:inline ${
                            currentPage === 3 
                              ? 'bg-blue-500 text-white' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          3
                        </button>
                      )}
                      {totalPages > 4 && (
                        <span className="px-1 md:px-2 text-gray-400 hidden sm:inline text-xs md:text-sm">...</span>
                      )}
                      {totalPages > 3 && (
                        <button 
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors hidden sm:inline ${
                            currentPage === totalPages 
                              ? 'bg-blue-500 text-white' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {totalPages}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={currentPage >= totalPages}
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 order-1 sm:order-2">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

      {/* Delete Confirmation Popup */}
      {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
              <div className="p-4 md:p-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                    Delete Test Order?
                  </h3>
                </div>
                
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                  Delete test order <span className="font-medium">{deleteModal.orderCode}</span> for <span className="font-medium">{deleteModal.orderName}</span>?
                </p>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default TestOrdersList
