import { useState } from 'react'
import { testResultsAPI, testOrdersAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'

interface BloodTestResults {
  result_summary: string;
  result_details: string;
  wbc_value: number;
  rbc_value: number;
  hgb_value: number;
  hct_value: number;
  plt_value: number;
  mcv_value: number;
  mch_value: number;
  mchc_value: number;
  flag: string;
  status: string;
  instrument_id: string;
}

function BloodTestResults() {
  const [orderCode, setOrderCode] = useState('ORD-1')
  const [results, setResults] = useState<BloodTestResults>({
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
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSaveResults = async () => {
    if (!orderCode.trim()) {
      toast.error('Please enter an order code')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      // Bước 1: Cập nhật test order status thành 'processing' trước
      try {
        await testOrdersAPI.updateOrder(orderCode, { status: 'processing' })
      } catch (updateErr: any) {
        console.warn('⚠️ Failed to update test order status to processing:', updateErr)
        // Vẫn tiếp tục thử lưu kết quả
      }
      
      // Bước 2: Lưu test results
      await testResultsAPI.saveTestResults(orderCode, results)
      
      setSuccess(true)
      toast.success('Blood test results saved successfully!', 5000)
      
    } catch (err: any) {
      console.error('❌ Error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save test results'
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Hiển thị thông tin debug chi tiết
      if (err.response?.data?.message?.includes('processing')) {
        toast.error('Test order must be in "processing" status. Please update order status first.')
      } else if (err.response?.data?.message?.includes('already has a result')) {
        toast.error('This test order already has results. Cannot create duplicate results.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BloodTestResults, value: string | number) => {
    setResults(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Blood Test Results</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
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

        {/* Blood Test Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WBC Value</label>
            <input
              type="number"
              step="0.1"
              value={results.wbc_value}
              onChange={(e) => handleInputChange('wbc_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RBC Value</label>
            <input
              type="number"
              step="0.1"
              value={results.rbc_value}
              onChange={(e) => handleInputChange('rbc_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HGB Value</label>
            <input
              type="number"
              step="0.1"
              value={results.hgb_value}
              onChange={(e) => handleInputChange('hgb_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HCT Value</label>
            <input
              type="number"
              step="0.1"
              value={results.hct_value}
              onChange={(e) => handleInputChange('hct_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PLT Value</label>
            <input
              type="number"
              step="0.1"
              value={results.plt_value}
              onChange={(e) => handleInputChange('plt_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MCV Value</label>
            <input
              type="number"
              step="0.1"
              value={results.mcv_value}
              onChange={(e) => handleInputChange('mcv_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MCH Value</label>
            <input
              type="number"
              step="0.1"
              value={results.mch_value}
              onChange={(e) => handleInputChange('mch_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MCHC Value</label>
            <input
              type="number"
              step="0.1"
              value={results.mchc_value}
              onChange={(e) => handleInputChange('mchc_value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Summary and Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Result Summary</label>
            <input
              type="text"
              value={results.result_summary}
              onChange={(e) => handleInputChange('result_summary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flag</label>
            <select
              value={results.flag}
              onChange={(e) => handleInputChange('flag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Result Details</label>
          <textarea
            value={results.result_details}
            onChange={(e) => handleInputChange('result_details', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={results.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrument ID</label>
            <input
              type="text"
              value={results.instrument_id}
              onChange={(e) => handleInputChange('instrument_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSaveResults}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Blood Test Results'}
        </button>

        {/* Results */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-800 font-semibold">Success:</h3>
            <p className="text-green-600">Blood test results saved successfully!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BloodTestResults
