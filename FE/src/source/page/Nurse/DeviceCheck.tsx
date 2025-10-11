import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DeviceCheck() {
  const navigate = useNavigate()
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [deviceStatus, setDeviceStatus] = useState<'idle' | 'checking' | 'ready' | 'error' | 'maintenance'>('idle')
  const [checkingProgress, setCheckingProgress] = useState(0)

  const devices = [
    {
      id: 'LAB-001',
      name: 'AutoAnalyzer Pro',
      type: 'Blood Chemistry Analyzer',
      status: 'Available',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-02-15'
    },
    {
      id: 'LAB-002',
      name: 'Hematology Analyzer',
      type: 'Blood Cell Counter',
      status: 'Available',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'LAB-003',
      name: 'Urine Analyzer',
      type: 'Urinalysis System',
      status: 'Maintenance',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-01-25'
    },
    {
      id: 'LAB-004',
      name: 'Microbiology Incubator',
      type: 'Culture System',
      status: 'Available',
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-12'
    },
    {
      id: 'LAB-005',
      name: 'Immunoassay Analyzer',
      type: 'Hormone Testing',
      status: 'Error',
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08'
    }
  ]

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
            } else if (selectedDeviceData.status === 'Error') {
              setDeviceStatus('error')
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
    if (deviceStatus === 'ready') {
      navigate('/nurse/test-orders/reagents')
    }
  }


  return (
    <div className="p-6">
      {/* Content-only: header/sidebar rendered by Nurse Layout */}
      <div className="max-w-6xl mx-auto">
        {/* Device Selection Section */}
        {deviceStatus === 'idle' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Device</h3>
                <p className="text-gray-600">Choose a laboratory device for testing</p>
              </div>
              {/* Device Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    onClick={() => handleDeviceSelect(device.id)}
                    className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedDevice === device.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{device.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{device.type}</p>
                        <p className="text-sm font-medium text-gray-700">ID: {device.id}</p>
                      </div>
                      {selectedDevice === device.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          device.status === 'Available' ? 'text-green-600' :
                          device.status === 'Maintenance' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Maintenance:</span>
                        <span className="font-medium">{device.lastMaintenance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Check Device Button */}
              <div className="text-center">
                <button
                  onClick={handleCheckDevice}
                  disabled={!selectedDevice}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    selectedDevice
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Check Device Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device Check Results */}
        {(deviceStatus === 'checking' || deviceStatus === 'ready' || deviceStatus === 'error' || deviceStatus === 'maintenance') && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Device Check Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Device Status Check</h3>
              <p className="text-gray-600">
                {deviceStatus === 'checking' ? 'Checking laboratory equipment status...' : 
                 `Checking ${devices.find(d => d.id === selectedDevice)?.name}...`}
              </p>
            </div>

            {/* Device Status Display */}
            <div className="text-center">
              {deviceStatus === 'checking' && (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-100 ease-out"
                      style={{ width: `${checkingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600">Checking device status... {checkingProgress}%</p>
                  
                  {/* Spinner */}
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                </div>
              )}

              {deviceStatus === 'ready' && (
                <div className="space-y-6">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-green-600 mb-2">Device Ready</h4>
                    <p className="text-gray-600 mb-6">All systems are operational and ready for testing.</p>
                    
                    <button
                      onClick={handleContinue}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
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
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-red-600 mb-2">Device Error</h4>
                    <p className="text-gray-600 mb-6">Device is experiencing technical issues. Please contact maintenance.</p>
                    
                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={() => setDeviceStatus('idle')}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Select Different Device
                      </button>
                      <button
                        onClick={() => navigate('/nurse/test-orders')}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        Back to Orders
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deviceStatus === 'maintenance' && (
                <div className="space-y-6">
                  {/* Maintenance Icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-yellow-600 mb-2">Device Under Maintenance</h4>
                    <p className="text-gray-600 mb-6">Device is currently under maintenance. Please try again later.</p>
                    
                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={() => setDeviceStatus('idle')}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Select Different Device
                      </button>
                      <button
                        onClick={() => navigate('/nurse/test-orders')}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
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
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h5 className="font-semibold text-gray-800 mb-3">Selected Device Information</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Device ID:</span>
                    <span className="ml-2 font-medium">{devices.find(d => d.id === selectedDevice)?.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Model:</span>
                    <span className="ml-2 font-medium">{devices.find(d => d.id === selectedDevice)?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{devices.find(d => d.id === selectedDevice)?.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Maintenance:</span>
                    <span className="ml-2 font-medium">{devices.find(d => d.id === selectedDevice)?.nextMaintenance}</span>
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
