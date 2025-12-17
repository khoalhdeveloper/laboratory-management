import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts'
import {
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Settings,
  Beaker,
  Wrench,
  XCircle,
  Download
} from 'lucide-react'
import { exportEquipmentData, exportReagentData, exportEventLogData } from '../../../utils/exportUtils'
import { toast } from '../../../utils/toast'
import { useDarkMode } from './DarkModeUtils'
import { instrumentAPI, reagentAPI, eventLogAPI, type Instrument, type EventLogItem } from '../Axios/Axios'

// Interface definitions matching other pages
interface Equipment {
  id: string
  name: string
  type: string
  room: string
  status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service'
  lastCheck: string
  nextCheck: string
  category?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
}

interface ReagentHistory {
  id: string
  lotNumber: string
  supplier: string
  date: string
  quantity: number
  type: string
  status: string
}

interface EventLog {
  id: string
  eventId: string
  action: string
  eventLogMessage: string
  operator: string
  date: string
  timestamp: string
  status: 'Success' | 'Error' | 'Info' | 'Warning'
  category: string
}

function Dashboard() {
  const navigate = useNavigate()
  const { isDarkMode } = useDarkMode()

  const [reagentHistory, setReagentHistory] = useState<ReagentHistory[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  const [eventStats, setEventStats] = useState<any[]>([])
  const [eventTypeData, setEventTypeData] = useState<any[]>([])

  const [equipmentStatusData, setEquipmentStatusData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadEventData(),
        loadReagentHistory(),
        loadEquipments()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEventData = async () => {
    try {
      const response = await eventLogAPI.getDoctorLogs()
      const apiLogs = response.data.data || []
      
      // Transform API data to match EventLog interface
      const transformedLogs: EventLog[] = apiLogs.map((log: EventLogItem) => {
        let status: 'Success' | 'Error' | 'Info' | 'Warning' = 'Info'
        const message = log.message.toLowerCase()
        if (message.includes('success') || message.includes('created') || message.includes('completed')) {
          status = 'Success'
        } else if (message.includes('error') || message.includes('failed')) {
          status = 'Error'
        } else if (message.includes('warning') || message.includes('deleted')) {
          status = 'Warning'
        }
        
        let action: 'Create' | 'Update' | 'Delete' | 'Modify' = 'Modify'
        if (message.includes('create')) action = 'Create'
        else if (message.includes('update')) action = 'Update'
        else if (message.includes('delete')) action = 'Delete'
        
        let category: 'Test Order' | 'Test Result' | 'Comment' | 'Review' | 'Instrument' | 'User' | 'System' = 'System'
        if (log.role === 'doctor') category = 'Test Order'
        
        const createdDate = new Date(log.createdAt)
        
        return {
          id: log._id,
          eventId: log.event_id,
          action: action,
          eventLogMessage: log.message,
          operator: log.performedBy || 'Unknown User',
          date: createdDate.toISOString().split('T')[0],
          timestamp: createdDate.toLocaleString('en-GB', { 
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
          }).replace(',', ''),
          status: status,
          category: category
        }
      })
      
      setEventLogs(transformedLogs)
      
      // Generate stats for chart (events per day) - show all days in range
      const eventsByDate: any = {}
      
      // Get date range (last 7 days)
      const today = new Date()
      const daysToShow = 7
      
      // Initialize all days with zero events
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateKey = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
        eventsByDate[dateKey] = { 
          date: dateKey, 
          events: 0, 
          info: 0, 
          warning: 0, 
          error: 0, 
          success: 0 
        }
      }
      
      // Fill in actual event counts
      transformedLogs.forEach((log) => {
        const date = new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
        if (eventsByDate[date]) {
          eventsByDate[date].events++
          eventsByDate[date][log.status.toLowerCase()]++
        }
      })
      
      const statsData = Object.values(eventsByDate)
      setEventStats(statsData)
      
      // Calculate event type distribution
      const typeData = [
        { name: 'Success', value: transformedLogs.filter(e => e.status === 'Success').length, color: '#10B981' },
        { name: 'Info', value: transformedLogs.filter(e => e.status === 'Info').length, color: '#3B82F6' },
        { name: 'Warning', value: transformedLogs.filter(e => e.status === 'Warning').length, color: '#F59E0B' },
        { name: 'Error', value: transformedLogs.filter(e => e.status === 'Error').length, color: '#EF4444' }
      ]
      setEventTypeData(typeData)
      
    } catch (error: any) {
      console.error('Error loading event data:', error)
      toast.error(error.response?.data?.message || 'Failed to load event logs')
    }
  }

  const loadReagentHistory = async () => {
    try {
      const response = await reagentAPI.getAll()
      const reagents = response.data.data || []
      
      const formattedReagents: ReagentHistory[] = reagents.map((reagent: any) => {
        // Calculate status based on quantity
        let status = 'Active'
        if (reagent.quantity_available <= 0) {
          status = 'Expired'
        } else if (reagent.quantity_available <= 10) {
          status = 'Expiring Soon'
        }
        
        return {
          id: reagent._id,
          lotNumber: reagent.catalog_number || reagent.reagent_name,
          supplier: reagent.manufacturer || 'N/A',
          date: reagent.created_at ? new Date(reagent.created_at).toLocaleDateString('en-GB') : 'N/A',
          quantity: reagent.quantity_available,
          type: 'supply',
          status: status
        }
      })
      
      setReagentHistory(formattedReagents)
      
    } catch (error: any) {
      console.error('Error loading reagent history:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách thuốc thử')
      // Fallback to empty array on error
      setReagentHistory([])
    }
  }

  const loadEquipments = async () => {
    try {
      const response = await instrumentAPI.getAll()
      const instruments = response.data.instruments || []
      
      const formattedEquipments: Equipment[] = instruments.map((inst: Instrument) => ({
        id: inst.instrument_id,
        name: inst.name,
        type: inst.type,
        category: inst.category || '',
        manufacturer: inst.manufacturer || '',
        model: inst.model || '',
        serialNumber: inst.serial_number || '',
        room: inst.room || '',
        status: inst.status as Equipment['status'],
        lastCheck: inst.last_check ? new Date(inst.last_check).toLocaleDateString('en-GB') : 'N/A',
        nextCheck: inst.next_check ? new Date(inst.next_check).toLocaleDateString('en-GB') : 'N/A'
      }))
      
      setEquipments(formattedEquipments)
      
      // Generate equipment status data
      const statusData = [
        { name: 'Available', value: formattedEquipments.filter(e => e.status === 'Available').length, color: '#10B981' },
        { name: 'In Use', value: formattedEquipments.filter(e => e.status === 'In Use').length, color: '#F59E0B' },
        { name: 'Maintenance', value: formattedEquipments.filter(e => e.status === 'Maintenance').length, color: '#EF4444' },
        { name: 'Out of Service', value: formattedEquipments.filter(e => e.status === 'Out of Service').length, color: '#6B7280' }
      ]
      setEquipmentStatusData(statusData)
      
    } catch (error: any) {
      console.error('Error loading equipments:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách thiết bị')
      // Fallback to empty array on error
      setEquipments([])
      setEquipmentStatusData([])
    }
  }

  // Export handlers
  const handleExportEquipment = async (format: 'excel' | 'pdf') => {
    try {
      const result = exportEquipmentData(equipments, format)
      if (result.success) {
        toast.success(`Equipment data exported to ${format.toUpperCase()} successfully!`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export equipment data')
      console.error('Export error:', error)
    }
  }

  const handleExportReagent = async (format: 'excel' | 'pdf') => {
    try {
      const result = exportReagentData(reagentHistory, format)
      if (result.success) {
        toast.success(`Reagent data exported to ${format.toUpperCase()} successfully!`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export reagent data')
      console.error('Export error:', error)
    }
  }

  const handleExportEventLog = async (format: 'excel' | 'pdf') => {
    try {
      const result = exportEventLogData(eventLogs, format)
      if (result.success) {
        toast.success(`Event log exported to ${format.toUpperCase()} successfully!`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export event log')
      console.error('Export error:', error)
    }
  }

  // Calculate statistics from data
  const stats = {
    totalEquipments: equipments.length,
    activeEquipments: equipments.filter(e => e.status === 'Available' || e.status === 'In Use').length,
    maintenanceEquipments: equipments.filter(e => e.status === 'Maintenance').length,
    totalReagents: reagentHistory.length,
    activeReagents: reagentHistory.filter(r => r.status === 'Active').length,
    expiringReagents: reagentHistory.filter(r => r.status === 'Expiring Soon').length,
    totalEvents: eventLogs.length,
    todayEvents: eventLogs.filter(e => e.date === new Date().toISOString().split('T')[0]).length
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1 whitespace-nowrap"
    switch (status) {
      case 'Available':
      case 'Active':
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'}`}>
            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">{status === 'Available' ? 'Available' : 'Active'}</span>
          </span>
        )
      case 'In Use':
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
            <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">In Use</span>
          </span>
        )
      case 'Maintenance':
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <Wrench className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Maintenance</span>
          </span>
        )
      case 'Out of Service':
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Out of Service</span>
          </span>
        )
      case 'Expiring Soon':
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Expiring Soon</span>
          </span>
        )
      case 'Expired':
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Expired</span>
          </span>
        )
      default:
        return <span className={`${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>{status}</span>
    }
  }

  return loading ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading Dashboard...</p>
      </div>
    </div>
  ) : (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Enhanced Header */}
      <div className={`rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-700'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Laboratory Management Dashboard</h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Overview of equipments, reagents, and system activities</p>
            </div>
          </div>
          <div className="flex lg:block justify-end">
            <div className="text-center lg:text-right bg-white/10 lg:bg-transparent rounded-lg p-3 lg:p-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.todayEvents}</div>
              <div className="text-blue-200 text-sm">Today's Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Equipment</p>
              <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{stats.totalEquipments}</p>
              <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                <TrendingUp className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {stats.activeEquipments} Active
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
              isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
            }`}>
              <Settings className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'  
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Reagents</p>
              <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{stats.totalReagents}</p>
              <p className="text-xs sm:text-sm text-yellow-600 font-medium mt-1">
                <AlertTriangle className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {stats.expiringReagents} Expiring
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
              isDarkMode ? 'bg-green-800' : 'bg-green-100'
            }`}>
              <Beaker className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-green-300' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>System Events</p>
              <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{stats.totalEvents}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">
                <Activity className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Recent Activity
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <FileText className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`} />
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Equipment Overview */}
        <div className={`rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className={`p-4 sm:p-6 rounded-t-xl border-b transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-700' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${
                  isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
                }`}>
                  <Settings className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Equipment Status</h3>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Current status of laboratory instruments</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="relative group">
                  <button className={`text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1 ${
                    isDarkMode 
                      ? 'bg-green-700 hover:bg-green-800' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Export</span>
                  </button>
                  <div className={`absolute top-full left-0 mt-1 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px] ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <button 
                      onClick={() => handleExportEquipment('excel')}
                      className={`block w-full text-left px-3 py-2 text-xs sm:text-sm rounded-t-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export Excel
                    </button>
                    <button 
                      onClick={() => handleExportEquipment('pdf')}
                      className={`block w-full text-left px-3 py-2 text-xs sm:text-sm rounded-b-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/doctor/instrument')}
                  className={`text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-blue-700 hover:bg-blue-800'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className={`p-4 sm:p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Equipment Status Chart */}
            <div className="mb-6">
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {equipmentStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                        border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Equipment */}
            <div>
              <h4 className={`text-sm sm:text-base font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>Recent Equipment</h4>
              <div className="space-y-2 sm:space-y-3">
                {equipments.slice(0, 3).map((equipment) => (
                  <div key={equipment.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs sm:text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.name}</div>
                        <div className="text-xs text-gray-500 truncate">{equipment.room}</div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(equipment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event Log Analytics */}
        <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className={`p-4 sm:p-6 rounded-t-xl border-b ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-700' 
              : 'bg-gradient-to-r from-slate-50 to-gray-50 border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-gray-600' : 'bg-slate-100'
                }`}>
                  <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-600'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Event Log Analytics</h3>
                  <p className={`text-xs sm:text-sm truncate ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>System activities and audit trail</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="relative group">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Export</span>
                  </button>
                  <div className={`absolute top-full left-0 mt-1 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px] ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <button 
                      onClick={() => handleExportEventLog('excel')}
                      className={`block w-full text-left px-3 py-2 text-xs sm:text-sm rounded-t-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export Excel
                    </button>
                    <button 
                      onClick={() => handleExportEventLog('pdf')}
                      className={`block w-full text-left px-3 py-2 text-xs sm:text-sm rounded-b-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/doctor/event-log')}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {/* Event Timeline Chart */}
            <div className="mb-6">
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={eventStats}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        color: isDarkMode ? '#F3F4F6' : '#111827'
                      }}
                    />
                    <Bar 
                      dataKey="events" 
                      fill="#64748B"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Event Types Summary */}
            <div>
              <h4 className={`text-sm sm:text-base font-semibold mb-3 sm:mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>Event Types Distribution</h4>
              <div className="space-y-2 sm:space-y-3">
                {eventTypeData.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className={`text-xs sm:text-sm font-medium truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item.name}</span>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-sm flex-shrink-0 ${
                      isDarkMode 
                        ? 'text-white bg-gray-600' 
                        : 'text-gray-900 bg-white'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reagent History Overview */}
        <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className={`p-4 sm:p-6 rounded-t-xl border-b ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-gray-700' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                }`}>
                  <Beaker className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Reagent Inventory</h3>
                  <p className={`text-xs sm:text-sm truncate ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Chemical supplies and reagents status</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="relative group">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Export</span>
                  </button>
                  <div className={`absolute top-full left-0 mt-1 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px] ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <button 
                      onClick={() => handleExportReagent('excel')}
                      className={`block w-full text-left px-3 py-2 text-xs sm:text-sm rounded-t-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export Excel
                    </button>
                    <button 
                      onClick={() => handleExportReagent('pdf')}
                      className={`block w-full text-left px-3 py-2 text-xs sm:text-sm rounded-b-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/doctor/reagent-history')}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {/* Reagent Status Summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className={`text-center p-2 sm:p-4 rounded-lg ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
              }`}>
                <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.activeReagents}</div>
                <div className="text-[10px] sm:text-xs text-green-600 font-medium">Active</div>
              </div>
              <div className={`text-center p-2 sm:p-4 rounded-lg ${
                isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
              }`}>
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.expiringReagents}</div>
                <div className="text-[10px] sm:text-xs text-yellow-600 font-medium">Expiring</div>
              </div>
              <div className={`text-center p-2 sm:p-4 rounded-lg ${
                isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
              }`}>
                <div className="text-lg sm:text-2xl font-bold text-red-600">
                  {reagentHistory.filter(r => r.status === 'Expired').length}
                </div>
                <div className="text-[10px] sm:text-xs text-red-600 font-medium">Expired</div>
              </div>
            </div>
            
            {/* Recent Reagents */}
            <div>
              <h4 className={`text-sm sm:text-base font-semibold mb-3 sm:mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>Recent Reagents</h4>
              <div className="space-y-2 sm:space-y-3">
                {reagentHistory.slice(0, 4).map((reagent) => (
                  <div key={reagent.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                      }`}>
                        <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs sm:text-sm font-medium truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{reagent.lotNumber}</div>
                        <div className={`text-[10px] sm:text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{reagent.supplier}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      {getStatusBadge(reagent.status)}
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Exp: {reagent.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`p-4 sm:p-6 rounded-t-xl border-b ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-gray-700'
              : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-gray-100'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Frequently used laboratory functions</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <button 
                onClick={() => navigate('/doctor/instrument')}
                className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 text-left ${
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Manage Equipment</div>
                  <div className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Add, edit, and monitor instruments</div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/doctor/reagent-history')}
                className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 text-left ${
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                }`}>
                  <Beaker className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Reagent Management</div>
                  <div className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Track supplies and inventory</div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/doctor/event-log')}
                className={`flex items-center space-x-3 p-3 sm:p-4 border rounded-lg transition-all duration-200 text-left ${
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                }`}>
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>System Logs</div>
                  <div className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Monitor system activities</div>
                </div>
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard