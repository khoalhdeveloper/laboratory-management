import { useState } from 'react'
import { testResultsAPI } from '../Axios/Axios'

function TestResultsAPI() {
  const [orderCode, setOrderCode] = useState('ORD-2')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGetTestResults = async () => {
    if (!orderCode.trim()) {
      setError('Please enter an order code')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)
      
      const response = await testResultsAPI.getTestResults(orderCode.trim())
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'API call failed')
    } finally {
      setLoading(false)
    }
  }

  const testSaveTestResults = async () => {
    if (!orderCode.trim()) {
      setError('Please enter an order code')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)
      
      const resultsData = {
        result_summary: 'Kết quả xét nghiệm bình thường',
        result_details: 'RBC, WBC, HGB trong mức bình thường',
        wbc_value: 7.5,
        rbc_value: 4.5,
        hgb_value: 14,
        hct_value: 42,
        plt_value: 250,
        mcv_value: 85,
        mch_value: 28,
        mchc_value: 33,
        flag: 'normal',
        status: 'completed',
        instrument_id: 'EQ-1001'
      }
      
      const response = await testResultsAPI.saveTestResults(orderCode.trim(), resultsData)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'API call failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Results API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test getTestResults */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test getTestResults</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Code
            </label>
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter order code (e.g., ORD-2)"
            />
          </div>
          
          <button
            onClick={testGetTestResults}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test getTestResults'}
          </button>
        </div>

        {/* Test saveTestResults */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test saveTestResults</h2>
          <p className="text-gray-600 mb-4">Test lưu kết quả xét nghiệm máu</p>
          
          <button
            onClick={testSaveTestResults}
            disabled={loading}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test saveTestResults'}
          </button>
        </div>
      </div>

      {/* Results */}
      {(error || result) && (
        <div className="mt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h3 className="text-red-800 font-semibold">Error:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-green-800 font-semibold mb-2">Success:</h3>
              <pre className="text-green-700 text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TestResultsAPI
