import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { testResultsAPI, testOrdersAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'
import './StoolUrineTestExecution.css'

function StoolUrineTestExecution() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [phase, setPhase] = useState<'idle' | 'testing' | 'done'>('idle')
  const [testStarted, setTestStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  // Machine animation - now using GIF for Urine test
  const [machineImage] = useState('/gifxetnghiem.gif')
  const [isAnimating, setIsAnimating] = useState(false)
 
  
  const loadingSteps = [
    'Sample Preparation',
    'Reagent Application',
    'Reaction Time',
    'Color Analysis',
    'Results Processing...'
  ]
  
  // Test order data
  const [testOrder, setTestOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refs for DOM elements (removed dropRef since we removed the pipette)
  const pad1Ref = useRef<HTMLDivElement>(null)
  const pad2Ref = useRef<HTMLDivElement>(null)
  const pad3Ref = useRef<HTMLDivElement>(null)

  // Original colors for test pads
  const originalColors = {
    pad1: '#f0e68c', // Light yellow
    pad2: '#add8e6', // Light blue
    pad3: '#f0f0f0'  // Light gray
  }

  // Result colors after reaction
  // (pad result colors removed — this test uses machine image swap instead)

  // Generate random test results for stool/urine tests
  // Urine test parameters based on document
  const generateTestResults = () => {
    const leuValue = Math.random() < 0.8 ? 'Negative' : `${(15 + Math.random() * 10).toFixed(0)}`;
    const proValue = Math.random() < 0.7 ? 'Negative' : `${(7.5 + Math.random() * 12.5).toFixed(1)}`;
    const bldValue = Math.random() < 0.9 ? 'Negative' : `${(0.015 + Math.random() * 0.047).toFixed(3)}`;
    const ketValue = Math.random() < 0.85 ? 'Negative' : `${(2.5 + Math.random() * 2.5).toFixed(1)}`;
    const gluValue = Math.random() < 0.8 ? 'Negative' : `${(50 + Math.random() * 50).toFixed(0)}`;
    
    return {
      leukocytes: {
        value: leuValue,
        normalRange: 'Negative (or 15–25 leu/UL)',
        unit: leuValue === 'Negative' ? '' : 'leu/UL',
        status: leuValue === 'Negative' ? 'normal' : 'abnormal',
        abbrev: 'LEU'
      },
      nitrite: {
        value: Math.random() < 0.85 ? 'Negative' : 'Positive',
        normalRange: 'Negative',
        unit: '',
        status: Math.random() < 0.85 ? 'normal' : 'abnormal',
        abbrev: 'NIT'
      },
      protein: {
        value: proValue,
        normalRange: 'Negative (or 7.5–20 mg/dL)',
        unit: proValue === 'Negative' ? '' : 'mg/dL',
        status: proValue === 'Negative' ? 'normal' : 'abnormal',
        abbrev: 'PRO'
      },
      pH: {
        value: (4.6 + Math.random() * 3.4).toFixed(1), // 4.6 - 8.0
        normalRange: '4.6–8.0',
        unit: '',
        status: 'normal',
        abbrev: 'pH'
      },
      blood: {
        value: bldValue,
        normalRange: 'Negative (or 0.015–0.062 mg/dL)',
        unit: bldValue === 'Negative' ? '' : 'mg/dL',
        status: bldValue === 'Negative' ? 'normal' : 'abnormal',
        abbrev: 'BLD'
      },
      specificGravity: {
        value: (1.000 + Math.random() * 0.030).toFixed(3), // 1.000 - 1.030
        normalRange: '1.000–1.030',
        unit: '',
        status: 'normal',
        abbrev: 'SG'
      },
      ketone: {
        value: ketValue,
        normalRange: 'Negative (or 2.5–5 mg/dL)',
        unit: ketValue === 'Negative' ? '' : 'mg/dL',
        status: ketValue === 'Negative' ? 'normal' : 'abnormal',
        abbrev: 'KET'
      },
      glucose: {
        value: gluValue,
        normalRange: 'Negative (or 50–100 mg/dL)',
        unit: gluValue === 'Negative' ? '' : 'mg/dL',
        status: gluValue === 'Negative' ? 'normal' : 'abnormal',
        abbrev: 'GLU'
      }
    }
  }

  const startTest = () => {
    if (phase !== 'idle') return
    
    setPhase('testing')
    setTestStarted(true)
    setProgress(0)
    setCurrentStepIndex(0)
    setIsAnimating(true)
    
    // Reset pad colors to original
    if (pad1Ref.current) {
      pad1Ref.current.style.transition = 'none'
      pad1Ref.current.style.backgroundColor = originalColors.pad1
    }
    if (pad2Ref.current) {
      pad2Ref.current.style.transition = 'none'
      pad2Ref.current.style.backgroundColor = originalColors.pad2
    }
    if (pad3Ref.current) {
      pad3Ref.current.style.transition = 'none'
      pad3Ref.current.style.backgroundColor = originalColors.pad3
    }
    
    // GIF already showing from start, no need to change
    
    // Simulate progress with steps (similar to BloodTestExecution)
    const totalMs = 6000  // 6 seconds total
    const tickMs = 50
    const totalTicks = Math.ceil(totalMs / tickMs)
    
    for (let i = 1; i <= totalTicks; i++) {
      setTimeout(() => {
        const p = Math.min(100, Math.round((i / totalTicks) * 100))
        setProgress(p)
        const stepIdx = Math.min(
          loadingSteps.length - 1,
          Math.floor((i / totalTicks) * loadingSteps.length)
        )
        setCurrentStepIndex(stepIdx)
      }, i * tickMs)
    }
    
    // Complete test after all steps
    setTimeout(() => {
      setPhase('done')
      setProgress(100)
      setCurrentStepIndex(loadingSteps.length - 1)
      setIsAnimating(false)
      setShowResults(true)
      const results = generateTestResults()
      setTestResults(results)
      // Keep GIF showing, don't switch to static image
    }, totalMs)
  }

  const handleBackToOrders = () => {
    navigate('/nurse/test-orders')
  }

  const handleSaveResults = async () => {
    if (!testResults) return

    try {
      setIsSaving(true)
      
      const orderCode = localStorage.getItem('currentOrderCode') || searchParams.get('orderCode') || ''
      const selectedDevice = JSON.parse(localStorage.getItem('selectedDevice') || '{}')
      
      const instrumentId = selectedDevice.instrument_id || selectedDevice.id || selectedDevice._id
      const instrumentName = selectedDevice.name || 'Unknown Device'
      const testType = testOrder?.test_type || 'Xét nghiệm nước tiểu'
      
      if (!instrumentId) {
        toast.error('Instrument not selected. Please go back and select an instrument.')
        return
      }
      
      // Prepare results data
      // Map stool/urine test results to the existing schema
      // Store detailed results in result_details as JSON
      const hasAbnormalResults = Object.values(testResults).some((r: any) => r.status === 'abnormal')
      
      // Map test type to backend enum values
      let backendTestType = testType
      if (testType === 'Urine Test' || testType === 'Xét nghiệm nước tiểu' || testType.toLowerCase().includes('urine')) {
        backendTestType = 'Urinalysis'
      } else if (testType === 'Stool Test' || testType === 'Xét nghiệm phân' || testType.toLowerCase().includes('stool') || testType.toLowerCase().includes('fecal')) {
        backendTestType = 'Fecal Analysis'
      }
      
      const resultsData = {
        test_type: backendTestType, // Use mapped enum value
        result_summary: `Kết quả ${testType} tự động - ${instrumentName}`,
        
        // Extract Urine test fields from results
        leu_value: testResults.leukocytes?.value || null,
        nit_value: testResults.nitrite?.value || null,
        pro_value: testResults.protein?.value || null,
        ph_value: testResults.pH?.value ? parseFloat(testResults.pH.value) : null,
        bld_value: testResults.blood?.value || null,
        sg_value: testResults.specificGravity?.value ? parseFloat(testResults.specificGravity.value) : null,
        ket_value: testResults.ketone?.value || null,
        glu_value: testResults.glucose?.value || null,
        flag: hasAbnormalResults ? 'abnormal' : 'normal',
        status: 'completed',
        instrument_id: instrumentId
      }
      
      // Update test order status to processing first (required by backend)
      if (testOrder?.status !== 'processing') {
        try {
          await testOrdersAPI.updateOrder(orderCode, { status: 'processing' })
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (updateErr: any) {
          throw new Error('Cannot update test order status to processing: ' + (updateErr.response?.data?.message || updateErr.message))
        }
      }
      
      // Save test results
      await testResultsAPI.saveTestResults(orderCode, resultsData as any)
      
      toast.success('Test results saved successfully!', 5000)
      
      // Navigate to results page
      setTimeout(() => {
        navigate('/nurse/results')
      }, 2000)
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save test results'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Fetch test order data
  useEffect(() => {
    const fetchTestOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const orderCodeFromURL = searchParams.get('orderCode')
        const orderCodeFromStorage = localStorage.getItem('currentOrderCode')
        const orderCode = orderCodeFromURL || orderCodeFromStorage
        
        if (!orderCode) {
          setError('No test order found. Please create a test order first.')
          setLoading(false)
          return
        }
        
        const response = await testOrdersAPI.getOrderByCode(orderCode)
        const orderData = response.data.data || response.data
        setTestOrder(orderData)
        
        if (orderCode && !orderCodeFromStorage) {
          localStorage.setItem('currentOrderCode', orderCode)
        }
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch test order')
        setTestOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTestOrder()
  }, [searchParams])

  // Auto-start test when component is ready (similar to BloodTestExecution)
  useEffect(() => {
    if (!loading && testOrder && phase === 'idle' && !testStarted) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        startTest()
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, testOrder, testStarted])

  if (loading) {
    return (
      <div 
        className="relative min-h-screen bg-center bg-cover flex items-center justify-center px-4 pt-16 pb-8 overflow-hidden"
        style={{ backgroundImage: `url('/nen.png')` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white/75 backdrop-blur-md shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading test order data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="relative min-h-screen bg-center bg-cover flex items-center justify-center px-4 pt-16 pb-8 overflow-hidden"
        style={{ backgroundImage: `url('/nen.png')` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
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

  const testType = testOrder?.test_type || 'Xét nghiệm nước tiểu'
  const isUrine = testType === 'Xét nghiệm nước tiểu' || testType === 'Urine Test' || testType === 'Urinalysis'

  return (
    <>
      <div
        className="relative min-h-screen bg-center bg-cover flex items-start justify-center px-4 pt-16 pb-8 overflow-hidden"
        style={{ backgroundImage: `url('/nen.png')` }}
      >
        {/* Overlay to keep content readable */}
        <div className="pointer-events-none absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.25),transparent_60%)]" />
        <div className="relative z-10 w-full max-w-6xl rounded-3xl border border-slate-200 bg-white/75 backdrop-blur-md shadow-xl panel-pattern">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
            {/* LEFT: Controls and content */}
            <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col relative">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium ring-1 ring-blue-200">
                  LAB TEST
                </span>
                <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-800 leading-tight">
                  {isUrine ? 'Urine Test System' : 'Stool Test System'}
                </h1>
               
                {/* 2x2 feature grid, responsive and state-aware */}
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-lg">
                  {loadingSteps.slice(0, 4).map((s, idx) => {
                    const activeIdx = Math.min(3, currentStepIndex)
                    const isActive = phase === 'testing' && idx === activeIdx
                    const isDone = phase === 'done' || (phase === 'testing' && idx < activeIdx)
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-2xl border p-4 shadow-sm transition-all ${
                          isActive
                            ? 'border-blue-300/70 bg-white/80 ring-2 ring-blue-200'
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
                                ? 'bg-blue-50 text-blue-700 ring-blue-300'
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
                            <div className="text-slate-800 font-medium truncate text-sm">{s}</div>
                            <div className="mt-1 text-xs text-slate-500 truncate">
                              {idx === 0 && 'Preparing sample'}
                              {idx === 1 && 'Applying reagents'}
                              {idx === 2 && 'Waiting for reaction'}
                              {idx === 3 && 'Analyzing colors'}
                            </div>
                          </div>
                          {isActive && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-blue-200">
                              Running
                            </span>
                          )}
                          {phase === 'done' && idx === 3 && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-emerald-200">
                              OK
                            </span>
                          )}
                        </div>
                        <div className={`absolute left-0 right-0 top-0 h-1 rounded-t-2xl ${
                          isDone ? 'bg-emerald-400' : isActive ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-slate-200'
                        }`} />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (phase === 'done') {
                        setShowResults(true)
                        return
                      }
                      if (phase === 'idle') startTest()
                    }}
                    className={`inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      phase === 'done'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 hover:shadow-emerald-500/40'
                        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 hover:shadow-blue-500/40'
                    }`}
                    disabled={phase === 'testing'}
                  >
                    {phase === 'testing' && 'In progress…'}
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

            {/* RIGHT: Test Animation Panel */}
            <div className="lg:col-span-7 relative p-6 lg:p-8 lg:border-l lg:border-slate-200/70">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200 bg-gradient-to-br from-blue-50/30 to-purple-50/30 p-4 lg:p-6 flex items-center justify-center">
                {/* Machine GIF Display */}
                <div className="flex items-center justify-center w-full h-full">
                  {machineImage.endsWith('.mp4') ? (
                    <video 
                      src={machineImage} 
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-w-full max-h-full object-contain"
                      key={machineImage}
                    />
                  ) : (
                    <img 
                      src={machineImage} 
                      alt="Urine Test Machine"
                      className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                        isAnimating ? 'opacity-100' : 'opacity-95'
                      }`}
                      key={machineImage}
                    />
                  )}
                </div>

                {/* Slim progress bar at bottom (visible when testing) */}
                {phase !== 'idle' && (
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="relative h-2.5 w-full rounded-full bg-slate-200/80 overflow-visible shadow-inner ring-1 ring-slate-300/40">
                      {/* Filled progress */}
                      <div
                        className={`h-full rounded-full ${
                          phase === 'done'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                            : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 progress-animated'
                        } transition-[width] duration-300 shadow-[0_0_12px_rgba(99,102,241,0.35)]`}
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

                {/* Minimal status badge */}
                {(phase === 'testing' || phase === 'done') && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-md">
                    {phase === 'testing' ? (
                      <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
                    ) : (
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    )}
                    <span>
                      {phase === 'testing' ? 'Sample attached – analyzing' : 'Results ready'}
                    </span>
                  </div>
                )}

                {/* Accent glow */}
                <div
                  className={`pointer-events-none absolute -inset-14 rounded-[3rem] bg-gradient-to-tr from-blue-300/20 via-indigo-300/20 to-purple-300/20 blur-3xl transition-opacity duration-700 ${
                    phase === 'done' ? 'opacity-100' : phase === 'testing' ? 'opacity-50' : 'opacity-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && testResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResults(false)}
          />
          
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
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                    {testType} Results
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Completed at {new Date().toLocaleString('en-US')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResults(false)}
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
                    <span className="ml-2 text-gray-800">{testOrder?.patient_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test code:</span>
                    <span className="ml-2 text-gray-800">{testOrder?.order_code || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test type:</span>
                    <span className="ml-2 text-gray-800">{testType}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test date:</span>
                    <span className="ml-2 text-gray-800">{new Date().toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                {Object.entries(testResults).map(([key, result]: [string, any]) => (
                  <div 
                    key={key}
                    className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700 uppercase">
                        {result.abbrev || key}
                      </div>
                      <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                        result.status === 'normal' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.status === 'normal' ? '✓' : '!'}
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      {result.value} {result.unit && <span className="text-sm text-gray-600">{result.unit}</span>}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 border-t border-gray-100 pt-1 mt-1">
                      Normal: {result.normalRange}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 md:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 md:px-6 py-2 md:py-2.5 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-sm md:text-base font-medium"
              >
                Close
              </button>
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

export default StoolUrineTestExecution

