import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Flag } from 'lucide-react'
import { testResultsAPI } from '../Axios/Axios'

function ResultsList() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTestType, setFilterTestType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [flaggedResults, setFlaggedResults] = useState<Set<string>>(new Set())
  
  // New states for API data
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch test results from API
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await testResultsAPI.getAllTestResults()
        
        // Transform API data to match our display format
        const transformedResults = response.data.data.map((item: any) => {
          const testOrder = item.testOrder || {}
          const testResult = item.testResult || {}
          const createdAtField = testOrder.createdAt
          
          return {
            id: testOrder.order_code || 'Unknown',
            patientName: testOrder.patient_name || 'Unknown Patient',
            testType: testOrder.test_type || 'Unknown Test',
            status: testOrder.status === 'completed' ? 'Completed' : 'Pending',
            priority: testOrder.priority || 'Medium',
            date: createdAtField ? new Date(createdAtField).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            doctor: testResult.doctor_name || testOrder.userid || 'Unknown Doctor',
            timestamp: createdAtField ? new Date(createdAtField).getTime() : 0 // Lưu timestamp để sắp xếp
          }
        })
        
        // Sắp xếp theo timestamp giảm dần (mới nhất lên đầu)
        const sortedResults = transformedResults.sort((a: any, b: any) => b.timestamp - a.timestamp)
        
        setTestResults(sortedResults)
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch test results')
        
        // Fallback to hardcoded data if API fails
        setTestResults([
          {
            id: 'TR-000123',
            patientName: 'Maria Johnson',
            testType: 'Blood Test',
            status: 'Completed',
            priority: 'High',
            date: '2023-01-15',
            doctor: 'Dr. Smith'
          },
          {
            id: 'TR-000125',
            patientName: 'Sarah Wilson',
            testType: 'Blood Test',
            status: 'Completed',
            priority: 'Low',
            date: '2023-02-12',
            doctor: 'Dr. Davis'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTestResults()
  }, [])

  const filteredResults = testResults.filter(result => {
    const matchesSearch = result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTestType = filterTestType === 'all' || result.testType === filterTestType
    const matchesPriority = filterPriority === 'all' || result.priority === filterPriority
    return matchesSearch && matchesTestType && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const resultsPerPage = 5
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentResults = filteredResults.slice(startIndex, endIndex)

  const handleViewResults = (resultId: string) => {
    navigate(`/nurse/results/view/${resultId}`)
  }

  const handleToggleFlag = (resultId: string) => {
    setFlaggedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resultId)) {
        newSet.delete(resultId)
      } else {
        newSet.add(resultId)
      }
      return newSet
    })
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading test results...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/nurse')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-4 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Test Results
            </h1>
            <RefreshCw 
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" 
              onClick={handleRefresh}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Name
              </label>
              <input
                type="text"
                placeholder="Enter patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Type
              </label>
              <select
                value={filterTestType}
                onChange={(e) => setFilterTestType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Test Types</option>
                <option value="Blood Test">Blood Test</option>
                <option value="Fecal Analysis">Fecal Analysis</option>
                <option value="Urinalysis">Urinalysis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-green-600">
                    <tr>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">
                        Result Code
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">
                        Patient
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                        Test Type
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                        Priority
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                        Date
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                        Doctor
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {result.id}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-white">
                          <div className="max-w-[120px] md:max-w-none truncate">{result.patientName}</div>
                          {/* Show additional info on mobile */}
                          <div className="lg:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">{result.testType}</div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-white whitespace-nowrap hidden lg:table-cell">
                          {result.testType}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {result.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(result.priority)}`}>
                            {result.priority}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-white whitespace-nowrap hidden xl:table-cell">
                          {result.date}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-white whitespace-nowrap hidden xl:table-cell">
                          <div className="max-w-[150px] truncate">{result.doctor}</div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                          <div className="flex items-center gap-1 md:gap-2">
                            <button
                              onClick={() => handleViewResults(result.id)}
                              className="group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1"
                              title="View Result"
                            >
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="hidden md:inline">View</span>
                              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                            </button>
                            <Flag 
                              className={`w-3 h-3 md:w-4 md:h-4 cursor-pointer transition-colors ${
                                flaggedResults.has(result.id) 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              onClick={() => handleToggleFlag(result.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredResults.length)}</span> of{' '}
                  <span className="font-medium">{filteredResults.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default ResultsList
