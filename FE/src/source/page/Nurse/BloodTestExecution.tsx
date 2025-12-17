import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { testResultsAPI, testOrdersAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'
import './BloodTestExecution.css'
// import img1 from '/anh1.png'
// import img2 from '/anh2.png'
// import bgSrc from '/nen.png'

function BloodTestExecution() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [showResult, setShowResult] = useState(false)
  const [phase, setPhase] = useState('idle') // 'idle' | 'loading' | 'done'
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const timersRef = useRef<number[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [bloodTestResults, setBloodTestResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [videoKey, setVideoKey] = useState(0)
  
  // New states for test order data
  const [testOrder, setTestOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadingSteps = [
    'System initialization',
    'Sensor check',
    'Device calibration',
    'Sample preparation',
    'Analyzing sample...'
  ]

  // Generate random blood test results within normal ranges
  const generateRandomResults = () => {
    // Random gender for more realistic results (70% female, 30% male for demo)
    const isFemale = Math.random() < 0.7
    
    const results = {
      wbc: {
        value: (4 + Math.random() * 6).toFixed(1), // 4.0 - 10.0 x10³/µL
        normalRange: '4,000–10,000',
        unit: 'x10³/µL',
        percentage: Math.floor(40 + Math.random() * 60) // 40-100%
      },
      rbc: {
        value: isFemale 
          ? (4.2 + Math.random() * 1.2).toFixed(1) // Female: 4.2 - 5.4
          : (4.7 + Math.random() * 1.4).toFixed(1), // Male: 4.7 - 6.1
        normalRange: isFemale ? '4.2–5.4 (F)' : '4.7–6.1 (M)',
        unit: 'x10⁶/µL',
        percentage: Math.floor(70 + Math.random() * 30) // 70-100%
      },
      hemoglobin: {
        value: isFemale 
          ? (12 + Math.random() * 4).toFixed(1) // Female: 12.0 - 16.0
          : (14 + Math.random() * 4).toFixed(1), // Male: 14.0 - 18.0
        normalRange: isFemale ? '12–16 (F)' : '14–18 (M)',
        unit: 'g/dL',
        percentage: Math.floor(30 + Math.random() * 70) // 30-100%
      },
      hematocrit: {
        value: isFemale 
          ? (37 + Math.random() * 10).toFixed(1) // Female: 37.0 - 47.0
          : (42 + Math.random() * 10).toFixed(1), // Male: 42.0 - 52.0
        normalRange: isFemale ? '37–47% (F)' : '42–52% (M)',
        unit: '%',
        percentage: Math.floor(35 + Math.random() * 65) // 35-100%
      },
      platelet: {
        value: Math.floor(150 + Math.random() * 200), // 150 - 350 x10³/µL
        normalRange: '150,000–350,000',
        unit: 'x10³/µL',
        percentage: Math.floor(60 + Math.random() * 40) // 60-100%
      },
      mcv: {
        value: Math.floor(80 + Math.random() * 20), // 80 - 100 fL
        normalRange: '80–100',
        unit: 'fL',
        percentage: Math.floor(25 + Math.random() * 75) // 25-100%
      },
      mch: {
        value: Math.floor(27 + Math.random() * 6), // 27 - 33 pg
        normalRange: '27–33',
        unit: 'pg',
        percentage: Math.floor(30 + Math.random() * 70) // 30-100%
      },
      mchc: {
        value: (32 + Math.random() * 4).toFixed(1), // 32.0 - 36.0 g/dL
        normalRange: '32–36',
        unit: 'g/dL',
        percentage: Math.floor(35 + Math.random() * 65) // 35-100%
      }
    }
    return results
  }

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }

  // function resetAll() {
  //   clearTimers()
  //   setPhase('idle')
  //   setProgress(0)
  //   setCurrentStepIndex(0)
  //   setShowResult(false)
  //   setShowDetails(false)
  // }

  function startTest() {
    clearTimers()
    setPhase('loading')
    setProgress(0)
    setCurrentStepIndex(0)
    setShowDetails(false)
    
    // Restart video by changing key
    setVideoKey(prev => prev + 1)
    
    // Delay showing image 2 for smoother effect
    setTimeout(() => {
      setShowResult(true)
    }, 1000) // Delay 1 second before switching to image 2

    // Simulate step-by-step loading with smooth progress
    const totalMs = 8000  // Increased from 5000ms to 8000ms (8 seconds)
    const tickMs = 50     // Reduced from 100ms to 50ms for smoother effect
    const totalTicks = Math.ceil(totalMs / tickMs)
    for (let i = 1; i <= totalTicks; i++) {
      const t = setTimeout(() => {
        const p = Math.min(100, Math.round((i / totalTicks) * 100))
        setProgress(p)
        const stepIdx = Math.min(
          loadingSteps.length - 1,
          Math.floor((i / totalTicks) * loadingSteps.length)
        )
        setCurrentStepIndex(stepIdx)
        if (i === totalTicks) {
          setPhase('done')
          setShowResult(true)
          // Generate random results when test is completed
          setBloodTestResults(generateRandomResults())
          // Video will stop automatically since we're not looping it
        }
      }, i * tickMs)
      timersRef.current.push(t as unknown as number)
    }
  }

  const handleBackToOrders = () => {
    navigate('/nurse/test-orders')
  }


  const handleSaveResults = async () => {
    if (!bloodTestResults) return

    try {
      setIsSaving(true)
      
      // Lấy order code từ localStorage
      const orderCode = localStorage.getItem('currentOrderCode') || 'ORD-2' // Fallback
      
      // Lấy thông tin máy đã chọn từ localStorage
      const selectedDevice = JSON.parse(localStorage.getItem('selectedDevice') || '{}')
      const instrumentId = selectedDevice.id || 'EQ-1001' // Fallback
      const instrumentName = selectedDevice.name || 'Unknown Device'
      
      // Chuẩn bị dữ liệu kết quả
      const resultsData = {
        result_summary: `Kết quả xét nghiệm máu tự động - ${instrumentName}`,
        result_details: `Kết quả được tạo tự động bởi hệ thống sử dụng máy ${instrumentName}`,
        wbc_value: parseFloat(bloodTestResults.wbc.value),
        rbc_value: parseFloat(bloodTestResults.rbc.value),
        hgb_value: parseFloat(bloodTestResults.hemoglobin.value),
        hct_value: parseFloat(bloodTestResults.hematocrit.value),
        plt_value: parseFloat(bloodTestResults.platelet.value),
        mcv_value: parseFloat(bloodTestResults.mcv.value),
        mch_value: parseFloat(bloodTestResults.mch.value),
        mchc_value: parseFloat(bloodTestResults.mchc.value),
        flag: 'normal',
        status: 'completed',
        instrument_id: instrumentId
      }
      
      // Bước 1: Cập nhật test order status thành 'processing' trước
      try {
        await testOrdersAPI.updateOrder(orderCode, { status: 'processing' })
      } catch (updateErr: any) {
        console.warn('⚠️ Failed to update test order status to processing:', updateErr)
        // Vẫn tiếp tục thử lưu kết quả
      }
      
      // Bước 2: Lưu kết quả xét nghiệm
      await testResultsAPI.saveTestResults(orderCode, resultsData)
      
      toast.success('Blood test results saved successfully!', 5000)
      
      // Navigate đến trang kết quả
      setTimeout(() => {
        navigate('/nurse/results')
      }, 2000)
      
    } catch (err: any) {
      console.error('❌ Error saving results:', err)
      const errorMessage = err.response?.data?.message || 'Failed to save test results'
      toast.error(errorMessage)
      
      // Hiển thị thông tin debug chi tiết
      if (err.response?.data?.message?.includes('processing')) {
        toast.error('Test order must be in "processing" status. Please update order status first.')
      } else if (err.response?.data?.message?.includes('already has a result')) {
        toast.error('This test order already has results. Cannot create duplicate results.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Fetch test order data when component mounts
  useEffect(() => {
    const fetchTestOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Ưu tiên lấy order code từ URL params, fallback sang localStorage
        const orderCodeFromURL = searchParams.get('orderCode')
        const orderCodeFromStorage = localStorage.getItem('currentOrderCode')
        const orderCode = orderCodeFromURL || orderCodeFromStorage
        
        if (!orderCode) {
          setError('No test order found. Please create a test order first.')
          setLoading(false)
          return
        }
        
        const response = await testOrdersAPI.getOrderByCode(orderCode)
        
        // Handle both response formats: response.data.data or response.data
        const orderData = response.data.data || response.data
        setTestOrder(orderData)
        
        // Save to localStorage for future use (fallback)
        if (orderCode && !orderCodeFromStorage) {
          localStorage.setItem('currentOrderCode', orderCode)
        }
        
      } catch (err: any) {
        console.error('❌ Error fetching test order:', err)
        console.error('❌ Error details:', err.response?.data)
        setError(err.response?.data?.message || 'Failed to fetch test order')
        
        // No fallback data - show error instead
        setTestOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTestOrder()
  }, [searchParams])

  useEffect(() => {
    // Auto start test when component mounts
    startTest()
    return () => clearTimers()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="relative min-h-screen bg-center bg-cover flex items-center justify-center px-4 pt-16 pb-8 overflow-hidden"
           style={{ backgroundImage: `url('/nen.png')` }}>
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white/75 backdrop-blur-md shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading test order data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="relative min-h-screen bg-center bg-cover flex items-center justify-center px-4 pt-16 pb-8 overflow-hidden"
           style={{ backgroundImage: `url('/nen.png')` }}>
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white/75 backdrop-blur-md shadow-xl p-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/nurse/test-orders')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="relative min-h-screen bg-center bg-cover flex items-start justify-center px-4 pt-16 pb-8 overflow-hidden"
        style={{ backgroundImage: `url('/nen.png')` }}
      >
        {/* Overlay to keep content readable */}
        <div className="pointer-events-none absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(244,114,182,0.25),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="relative z-10 w-full max-w-6xl rounded-3xl border border-slate-200 bg-white/75 backdrop-blur-md shadow-xl panel-pattern">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
            {/* LEFT: Controls and content */}
            <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col relative">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 px-3 py-1 text-xs font-medium ring-1 ring-rose-200">
                  LAB TEST
                </span>
                <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-800 leading-tight">
                  Blood Test System
                </h1>
               
                {/* 2x2 feature grid, responsive and state-aware */}
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-lg">
                  {[
                    { t: 'Sensor Check', d: 'Signal stabilization' },
                    { t: 'Calibration', d: 'Automatic • ISO' },
                    { t: 'Sample Preparation', d: 'Standard volume' },
                    { t: 'Biosafety', d: 'Level II disinfection' },
                  ].map((s, idx) => {
                    const activeIdx = Math.min(3, currentStepIndex)
                    const isActive = phase !== 'idle' && phase !== 'done' && idx === activeIdx
                    const isDone = phase === 'done' || (phase !== 'idle' && idx < activeIdx)
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-2xl border p-4 shadow-sm transition-all ${
                          isActive
                            ? 'border-fuchsia-300/70 bg-white/80 ring-2 ring-fuchsia-200'
                            : isDone
                            ? 'border-emerald-200 bg-white/80'
                            : 'border-slate-200/70 bg-white/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`grid h-9 w-9 place-items-center rounded-full ring-2 shadow ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-300'
                                : isActive
                                ? 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-300'
                                : 'bg-slate-50 text-slate-600 ring-slate-300'
                            }`}
                          >
                            {isDone ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            ) : (
                              <span className="text-xs font-semibold">{idx + 1}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-slate-800 font-medium truncate">{s.t}</div>
                            <div className="mt-1 text-xs text-slate-500 truncate">{s.d}</div>
                          </div>
                          {isActive && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-fuchsia-50 text-fuchsia-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-fuchsia-200">
                              Running
                            </span>
                          )}
                          {phase === 'done' && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-emerald-200">
                              OK
                            </span>
                          )}
                        </div>
                        <div className={`absolute left-0 right-0 top-0 h-1 rounded-t-2xl ${
                          isDone ? 'bg-emerald-400' : isActive ? 'bg-gradient-to-r from-fuchsia-400 to-indigo-400' : 'bg-slate-200'
                        }`} />
                      </div>
                    )
                  })}
                </div>

                {/* Decorative DNA helix watermark to reduce emptiness */}
                <div className="pointer-events-none absolute -bottom-6 -left-6 hidden md:block opacity-40">
                  <svg width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>
                    <path d="M10 10 C 80 40, 180 0, 250 30" stroke="url(#g1)" strokeWidth="2" opacity="0.6" />
                    <path d="M10 150 C 80 120, 180 160, 250 130" stroke="url(#g1)" strokeWidth="2" opacity="0.6" />
                    {Array.from({length:12}).map((_,i)=><div key={i}></div>)}
                  </svg>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (phase === 'done') {
                        setShowDetails(true)
                        return
                      }
                      if (phase === 'idle') startTest()
                    }}
                    className={`inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      phase === 'done'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 hover:shadow-emerald-500/40'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 hover:shadow-rose-500/40'
                    }`}
                    disabled={phase === 'loading'}
                  >
                    {phase === 'loading' && 'In progress…'}
                    {phase === 'idle' && 'Start Test'}
                    {phase === 'done' && 'View Results'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBackToOrders}
                    className="inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 text-gray-700 bg-white/80 hover:bg-white border border-gray-300 shadow-lg transition-all active:scale-[0.98]"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Video panel */}
            <div className="lg:col-span-7 relative p-6 lg:p-8 lg:border-l lg:border-slate-200/70">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200 bg-gradient-to-br from-rose-50/30 to-pink-50/30 p-4 lg:p-6 flex items-center justify-center">
                {/* Blood test video display */}
                <div className="flex items-center justify-center w-full h-full">
                  <video 
                    src="/BloodTest.mp4" 
                    autoPlay
                    muted
                    playsInline
                    className="max-w-full max-h-full object-contain"
                    key={`bloodtest-video-${videoKey}`}
                  />
                </div>

                {/* Slim progress bar at bottom (visible when loading) */}
                {phase !== 'idle' && (
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="relative h-2.5 w-full rounded-full bg-slate-200/80 overflow-visible shadow-inner ring-1 ring-slate-300/40">
                      {/* Filled progress */}
                      <div
                        className={`h-full rounded-full ${
                          phase === 'done'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                            : 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 progress-animated'
                        } transition-[width] duration-300 shadow-[0_0_12px_rgba(244,114,182,0.35)]`}
                        style={{ width: `${progress}%` }}
                      />
                      {/* Moving dot indicator */}
                      <span
                        className={`progress-dot ${phase === 'done' ? 'bg-emerald-400' : 'bg-white'} shadow`}
                        style={{ left: `calc(${progress}% - 7px)` }}
                      />
                    </div>
                  </div>
                )}

                {/* Minimal status badge (doesn't cover image) */}
                {(phase === 'loading' || phase === 'done') && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-md">
                    {phase === 'loading' ? (
                      <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-rose-500 animate-spin" />
                    ) : (
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    )}
                    <span>
                      {phase === 'loading' ? 'Sample attached – analyzing' : 'Results ready'}
                    </span>
                  </div>
                )}

                {/* Accent glow */}
                <div
                  className={`pointer-events-none absolute -inset-14 rounded-[3rem] bg-gradient-to-tr from-rose-300/20 via-fuchsia-300/20 to-indigo-300/20 blur-3xl transition-opacity duration-700 ${
                    showResult ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
              {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-white rounded-xl sm:rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Blood Test Results</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Completed at {new Date().toLocaleString('en-US')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1">
              {/* Patient Info */}
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Patient:</span>
                    <span className="ml-2 text-gray-800">{testOrder?.patient_name || 'Maria Johnson'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test code:</span>
                    <span className="ml-2 text-gray-800">{testOrder?.order_code || 'TO-000123'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test executed by:</span>
                    <span className="ml-2 text-gray-800">{testOrder?.created_by || 'Dr. Smith'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test date:</span>
                    <span className="ml-2 text-gray-800">{new Date().toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                {/* WBC */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">WBC</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.wbc.value || '6.7'} {bloodTestResults?.wbc.unit || 'x10³/µL'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.wbc.normalRange || '4,000–10,000'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.wbc.percentage || 67}%`}}></div>
                  </div>
                </div>
                
                {/* RBC */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">RBC</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.rbc.value || '4.8'} {bloodTestResults?.rbc.unit || 'x10⁶/µL'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.rbc.normalRange || '4.2–5.4 (F)'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.rbc.percentage || 75}%`}}></div>
                  </div>
                </div>
                
                {/* Hemoglobin */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Hb/HGB</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.hemoglobin.value || '13.8'} {bloodTestResults?.hemoglobin.unit || 'g/dL'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.hemoglobin.normalRange || '12–16 (F)'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.hemoglobin.percentage || 45}%`}}></div>
                  </div>
                </div>
                
                {/* Hematocrit */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">HCT</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.hematocrit.value || '41.2'}{bloodTestResults?.hematocrit.unit || '%'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.hematocrit.normalRange || '37–47% (F)'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.hematocrit.percentage || 42}%`}}></div>
                  </div>
                </div>
                
                {/* Platelet */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">PLT</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.platelet.value || '285'} {bloodTestResults?.platelet.unit || 'x10³/µL'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.platelet.normalRange || '150,000–350,000'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.platelet.percentage || 68}%`}}></div>
                  </div>
                </div>
                
                {/* MCV */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">MCV</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.mcv.value || '86'} {bloodTestResults?.mcv.unit || 'fL'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.mcv.normalRange || '80–100'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.mcv.percentage || 30}%`}}></div>
                  </div>
                </div>
                
                {/* MCH */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">MCH</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.mch.value || '29'} {bloodTestResults?.mch.unit || 'pg'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.mch.normalRange || '27–33'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.mch.percentage || 33}%`}}></div>
                  </div>
                </div>
                
                {/* MCHC */}
                <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">MCHC</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {bloodTestResults?.mchc.value || '33.5'} {bloodTestResults?.mchc.unit || 'g/dL'}
                  </div>
                  <div className="text-xs text-gray-400">Normal: {bloodTestResults?.mchc.normalRange || '32–36'}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${bloodTestResults?.mchc.percentage || 37}%`}}></div>
                  </div>
                </div>
                    </div>

             
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="flex justify-end gap-2 md:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={handleSaveResults}
                disabled={isSaving}
                className="px-4 md:px-6 py-2 md:py-2.5 text-white bg-blue-500 hover:bg-blue-600 border border-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default BloodTestExecution
