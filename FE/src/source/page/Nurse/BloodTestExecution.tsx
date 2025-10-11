import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BloodTestExecution.css'
import img1 from '/anh1.png'
import img2 from '/anh2.png'
import bgSrc from '/nen.png'

function BloodTestExecution() {
  const navigate = useNavigate()
  const [showResult, setShowResult] = useState(false)
  const [phase, setPhase] = useState('idle') // 'idle' | 'loading' | 'done'
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const timersRef = useRef<number[]>([])
  const [showDetails, setShowDetails] = useState(false)

  const loadingSteps = [
    'System initialization',
    'Sensor check',
    'Device calibration',
    'Sample preparation',
    'Analyzing sample...'
  ]

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }

  function resetAll() {
    clearTimers()
    setPhase('idle')
    setProgress(0)
    setCurrentStepIndex(0)
    setShowResult(false)
    setShowDetails(false)
  }

  function startTest() {
    clearTimers()
    setPhase('loading')
    setProgress(0)
    setCurrentStepIndex(0)
    setShowDetails(false)
    
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
        }
      }, i * tickMs)
      timersRef.current.push(t)
    }
  }

  const handleBackToOrders = () => {
    navigate('/nurse/test-orders')
  }

  useEffect(() => {
    // Auto start test when component mounts
    startTest()
    return () => clearTimers()
  }, [])

  return (
    <>
      <div
        className="relative min-h-screen bg-center bg-cover flex items-start justify-center px-4 pt-16 pb-8 overflow-hidden"
        style={{ backgroundImage: `url(${bgSrc})` }}
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

            {/* RIGHT: Image panel */}
            <div className="lg:col-span-7 relative p-6 lg:p-8 lg:border-l lg:border-slate-200/70">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200 bg-slate-50 p-2">
                {/* Base image */}
                <img
                  src={img1}
                  alt="Initial image"
                  className={`absolute inset-0 h-full w-full object-contain transition-all duration-1000 ease-in-out ${
                    showResult ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                />

                {/* Result image */}
                <img
                  src={img2}
                  alt="Test results"
                  className={`absolute inset-0 h-full w-full object-contain transition-all duration-1000 ease-in-out ${
                    showResult ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                />

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Blood Test Results</h3>
                  <p className="text-sm text-gray-600">Completed at {new Date().toLocaleString('en-US')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Patient Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Patient:</span>
                    <span className="ml-2 text-gray-800">Maria Johnson</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test code:</span>
                    <span className="ml-2 text-gray-800">TO-000123</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test executed by:</span>
                    <span className="ml-2 text-gray-800">Dr. Smith</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Test date:</span>
                    <span className="ml-2 text-gray-800">{new Date().toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* WBC */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">WBC</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">6.7 x10³/µL</div>
                  <div className="text-xs text-gray-400">Normal: 4,000–10,000</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '67%'}}></div>
                  </div>
                </div>
                
                {/* RBC */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">RBC</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">4.8 x10⁶/µL</div>
                  <div className="text-xs text-gray-400">Normal: 4.2–5.4 (F)</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                {/* Hemoglobin */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">Hb/HGB</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">13.8 g/dL</div>
                  <div className="text-xs text-gray-400">Normal: 12–16 (F)</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                
                {/* Hematocrit */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">HCT</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">41.2%</div>
                  <div className="text-xs text-gray-400">Normal: 37–47% (F)</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>
                
                {/* Platelet */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">PLT</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">285 x10³/µL</div>
                  <div className="text-xs text-gray-400">Normal: 150,000–350,000</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
                
                {/* MCV */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">MCV</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">86 fL</div>
                  <div className="text-xs text-gray-400">Normal: 80–100</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </div>
                
                {/* MCH */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">MCH</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">29 pg</div>
                  <div className="text-xs text-gray-400">Normal: 27–33</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '33%'}}></div>
                  </div>
                </div>
                
                {/* MCHC */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 mb-1">MCHC</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">33.5 g/dL</div>
                  <div className="text-xs text-gray-400">Normal: 32–36</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '37%'}}></div>
                  </div>
                </div>
                    </div>

             
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 bg-blue-500 text-white border border-gray-300 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BloodTestExecution
