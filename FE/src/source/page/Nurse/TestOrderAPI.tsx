import { useState } from 'react'
import { testOrdersAPI } from '../Axios/Axios'

function TestOrderAPI() {
  const [orderCode, setOrderCode] = useState('ORD-1')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTestAPI = async () => {
    if (!orderCode.trim()) {
      setError('Please enter an order code')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)
      
      const response = await testOrdersAPI.getOrderByCode(orderCode.trim())
      
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'API call failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Test Order API Test</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Code
          </label>
          <input
            type="text"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter order code (e.g., ORD-1)"
          />
        </div>
        
        <button
          onClick={handleTestAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-800 font-semibold mb-2">Success:</h3>
            <pre className="text-green-700 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestOrderAPI
