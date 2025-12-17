import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { instrumentsAPI } from '../Axios/Axios'

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance: string;
  manufacturer?: string;
  model?: string;
  room?: string;
}

function DeviceCheck() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('orderCode') || localStorage.getItem('currentOrderCode') || ''
  
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [deviceStatus, setDeviceStatus] = useState<'idle' | 'checking' | 'ready' | 'error' | 'maintenance' | 'in use'>('idle')
  const [checkingProgress, setCheckingProgress] = useState(0)
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  // Load instruments from API
  useEffect(() => {
    const loadInstruments = async () => {
      try {
        setLoading(true)
        
        const response = await instrumentsAPI.getAllInstruments()
        
        // API response structure: { message, count, instruments: [...] }
        const instruments = response.data.instruments || []
        
        // Transform API data to Device format
        const transformedDevices: Device[] = instruments.map((instrument: any) => ({
          id: instrument.instrument_id,
          name: instrument.name,
          type: instrument.type || 'Laboratory Equipment',
          status: instrument.status === 'Active' ? 'Available' : instrument.status,
          lastMaintenance: instrument.last_check ? new Date(instrument.last_check).toISOString().split('T')[0] : 'N/A',
          nextMaintenance: instrument.next_check ? new Date(instrument.next_check).toISOString().split('T')[0] : 'N/A',
          manufacturer: instrument.manufacturer,
          model: instrument.model,
          room: instrument.room
        }))
        
        setDevices(transformedDevices)
      } catch (error: any) {
        console.error('❌ Error loading instruments:', error)
        // Keep empty array on error
        setDevices([])
      } finally {
        setLoading(false)
      }
    }

    loadInstruments()
  }, [])

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId)
  }

  const handleCheckDevice = () => {
    if (!selectedDevice) return
    
    setDeviceStatus('checking')
    setCheckingProgress(0)
    
    // Simulate device checking process with smoother animation
    const interval = setInterval(() => {
      setCheckingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Simulate device status based on selected device
          const selectedDeviceData = devices.find(d => d.id === selectedDevice)
          if (selectedDeviceData) {
            // Use device's actual status instead of random
            if (selectedDeviceData.status === 'Available') {
              setDeviceStatus('ready')
            } else if (selectedDeviceData.status === 'Maintenance') {
              setDeviceStatus('maintenance')
            } else if (selectedDeviceData.status === 'In Use') {
              setDeviceStatus('in use')
            } else {
              // Fallback to ready for other statuses
              setDeviceStatus('ready')
            }
          } else {
            setDeviceStatus('error')
          }
          return 100
        }
        return prev + 2  // Giảm từ 10 xuống 2 để mượt hơn
      })
    }, 50)  // Giảm từ 200ms xuống 50ms để mượt hơn

    return () => clearInterval(interval)
  }

  const handleContinue = () => {
    if (deviceStatus === 'ready' && selectedDevice) {
      // Lưu thông tin máy vào localStorage
      const selectedDeviceInfo = devices.find(d => d.id === selectedDevice)
      if (selectedDeviceInfo) {
        localStorage.setItem('selectedDevice', JSON.stringify(selectedDeviceInfo))
      }
      
      // Forward orderCode to reagents page
      if (orderCode) {
        navigate(`/nurse/test-orders/reagents?orderCode=${orderCode}`)
      } else {
        navigate('/nurse/test-orders/reagents')
      }
    }
  }


  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Content-only: header/sidebar rendered by Nurse Layout */}
      <div className="max-w-6xl mx-auto">
        {/* Device Selection Section */}
        {deviceStatus === 'idle' && (
          <div className="mb-4 md:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 md:p-8 transition-colors duration-300">
              <div className="text-center mb-4 md:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Select Device</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Choose a laboratory device for testing</p>
              </div>
              
              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading devices...</span>
                  </div>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No devices available</p>
                </div>
              ) : (
                <>
              {/* Device Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-8">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    onClick={() => handleDeviceSelect(device.id)}
                    className={`bg-white dark:bg-gray-700 rounded-lg border-2 p-3 sm:p-4 md:p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedDevice === device.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 md:mb-2">{device.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-3">{device.type}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">ID: {device.id}</p>
                      </div>
                      {selectedDevice === device.id && (
                        <div className="w-6 h-6 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`font-medium ${
                          device.status === 'Available' ? 'text-green-600 dark:text-green-400' :
                          device.status === 'Maintenance' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Maintenance:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{device.lastMaintenance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                </>
              )}

              {/* Check Device Button */}
              {!loading && devices.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleCheckDevice}
                    disabled={!selectedDevice}
                    className={`px-4 py-2 md:px-8 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      selectedDevice
                        ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Check Device Status
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device Check Results */}
        {(deviceStatus === 'checking' || deviceStatus === 'ready' || deviceStatus === 'error' || deviceStatus === 'maintenance' || deviceStatus ==='in use') && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 md:p-8 transition-colors duration-300">
            {/* Device Check Header */}
            <div className="text-center mb-4 md:mb-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Device Status Check</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {deviceStatus === 'checking' ? 'Checking laboratory equipment status...' : 
                 `Checking ${devices.find(d => d.id === selectedDevice)?.name}...`}
              </p>
            </div>

            {/* Device Status Display */}
            <div className="text-center">
              {deviceStatus === 'checking' && (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 h-4 rounded-full transition-all duration-100 ease-out"
                      style={{ width: `${checkingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Checking device status... {checkingProgress}%</p>
                  
                  {/* Spinner */}
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  </div>
                </div>
              )}

              {deviceStatus === 'ready' && (
                <div className="space-y-6">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Device Ready</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">All systems are operational and ready for testing.</p>
                    
                    <button
                      onClick={handleContinue}
                      className="bg-green-500 dark:bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors font-medium"
                    >
                      Continue to Test Selection
                    </button>
                  </div>
                </div>
              )}

              {deviceStatus === 'error' && (
                <div className="space-y-6">
                  {/* Error Icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Device Error</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">Device is experiencing technical issues. Please contact maintenance.</p>
                    
                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={() => setDeviceStatus('idle')}
                        className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-medium"
                      >
                        Select Different Device
                      </button>
                      <button
                        onClick={() => navigate('/nurse/test-orders')}
                        className="bg-gray-500 dark:bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Back to Orders
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(deviceStatus === 'maintenance' || deviceStatus === 'in use') && (
                <div className="space-y-6">
                  {/* Maintenance Icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Device Under Maintenance</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">Device is currently under maintenance. Please try again later.</p>
                    
                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={() => setDeviceStatus('idle')}
                        className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-medium"
                      >
                        Select Different Device
                      </button>
                      <button
                        onClick={() => navigate('/nurse/test-orders')}
                        className="bg-gray-500 dark:bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Back to Orders
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Device Info */}
            {selectedDevice && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Selected Device Information</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Device ID:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{devices.find(d => d.id === selectedDevice)?.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Model:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{devices.find(d => d.id === selectedDevice)?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{devices.find(d => d.id === selectedDevice)?.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Next Maintenance:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{devices.find(d => d.id === selectedDevice)?.nextMaintenance}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceCheck
