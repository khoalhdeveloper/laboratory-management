import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
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

// Interface definitions matching other pages
interface Equipment {
  id: string
  name: string
  type: string
  room: string
  status: 'Active' | 'In Use' | 'Maintenance'
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
      // Mock event logs matching EventLog page
      const mockEventLogs: EventLog[] = [
        {
          id: '1', eventId: 'E_00001', action: 'Create', eventLogMessage: 'Event message used when a new test order is created.',
          operator: 'Dr. Huy Nguyen', date: '2024-01-15', timestamp: '2024-01-15 14:32:15', status: 'Success' as const, category: 'Test Order'
        },
        {
          id: '2', eventId: 'E_00002', action: 'Update', eventLogMessage: 'Event message used when a test order is updated.',
          operator: 'Dr. Sarah Chen', date: '2024-01-15', timestamp: '2024-01-15 13:45:22', status: 'Info' as const, category: 'Test Order'
        },
        {
          id: '3', eventId: 'E_00003', action: 'Delete', eventLogMessage: 'Event message used when a test order is deleted.',
          operator: 'Dr. Michael Johnson', date: '2024-01-15', timestamp: '2024-01-15 12:18:30', status: 'Warning' as const, category: 'Test Order'
        },
        {
          id: '4', eventId: 'E_00004', action: 'Modify', eventLogMessage: 'Event message used when a test result is modified.',
          operator: 'Lab Tech. Anna Wilson', date: '2024-01-15', timestamp: '2024-01-15 11:22:45', status: 'Success' as const, category: 'Test Result'
        },
        {
          id: '5', eventId: 'E_00005', action: 'Add', eventLogMessage: 'Event message used when new comment of test result is added.',
          operator: 'Dr. Emily Rodriguez', date: '2024-01-15', timestamp: '2024-01-15 10:15:12', status: 'Info' as const, category: 'Comment'
        }
      ]
      setEventLogs(mockEventLogs)
      
      // Generate stats for chart (events per day)
      const statsData = [
        { date: '10/09', events: 5, info: 2, warning: 1, error: 0, success: 2 },
        { date: '10/08', events: 3, info: 1, warning: 0, error: 1, success: 1 },
        { date: '10/07', events: 4, info: 2, warning: 1, error: 0, success: 1 },
        { date: '10/06', events: 2, info: 1, warning: 0, error: 0, success: 1 },
        { date: '10/05', events: 1, info: 0, warning: 1, error: 0, success: 0 },
        { date: '10/04', events: 3, info: 1, warning: 0, error: 1, success: 1 }
      ]
      setEventStats(statsData)
      
      // Calculate event type distribution
      const typeData = [
        { name: 'Success', value: mockEventLogs.filter(e => e.status === 'Success').length, color: '#10B981' },
        { name: 'Info', value: mockEventLogs.filter(e => e.status === 'Info').length, color: '#3B82F6' },
        { name: 'Warning', value: mockEventLogs.filter(e => e.status === 'Warning').length, color: '#F59E0B' },
        { name: 'Error', value: mockEventLogs.filter(e => e.status === 'Error').length, color: '#EF4444' }
      ]
      setEventTypeData(typeData)
      
    } catch (error) {
      console.error('Error loading event data:', error)
    }
  }

  const loadReagentHistory = async () => {
    try {
      // Mock data matching ReagentHistory page
      const mockReagents = [
        {
          id: '1', lotNumber: 'LR-2024-001', supplier: 'ChemSupplies Inc.',
          date: '2024-12-31', quantity: 100, type: 'supply', status: 'Active'
        },
        {
          id: '2', lotNumber: 'LR-2024-002', supplier: 'LabChem Co.',
          date: '2024-11-15', quantity: 75, type: 'supply', status: 'Active'
        },
        {
          id: '3', lotNumber: 'LR-2024-003', supplier: 'BioReagents Ltd.',
          date: '2024-10-20', quantity: 50, type: 'supply', status: 'Expiring Soon'
        },
        {
          id: '4', lotNumber: 'LR-2023-015', supplier: 'Global Chemicals',
          date: '2023-09-30', quantity: 0, type: 'supply', status: 'Expired'
        }
      ]
      setReagentHistory(mockReagents)
      
    } catch (error) {
      console.error('Error loading reagent history:', error)
    }
  }

  const loadEquipments = async () => {
    try {
      // Mock data matching Instrucment page
      const mockEquipments: Equipment[] = [
        {
          id: 'EQ-1001', name: 'pH Meter Pro', type: 'pH Meter', category: 'Measurement',
          manufacturer: 'Hanna Instruments', model: 'HI-2020', serialNumber: 'HI2020001',
          room: 'Room A-101', status: 'Active', lastCheck: '15/01/2024', nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1002', name: 'High-Speed Centrifuge', type: 'Centrifuge', category: 'Sample Processing',
          manufacturer: 'Eppendorf', model: '5430R', serialNumber: 'EP5430R002',
          room: 'Room A-102', status: 'In Use', lastCheck: '15/01/2024', nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1003', name: 'UV Spectrophotometer', type: 'Spectrophotometer', category: 'Analysis',
          manufacturer: 'Thermo Scientific', model: 'Evolution 201', serialNumber: 'TS201003',
          room: 'Room A-103', status: 'In Use', lastCheck: '15/01/2024', nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1004', name: 'pH Meter Basic', type: 'pH Meter', category: 'Measurement',
          manufacturer: 'Hanna Instruments', model: 'HI-98103', serialNumber: 'HI98103004',
          room: 'Room A-101', status: 'Maintenance', lastCheck: '15/01/2024', nextCheck: '15/10/2025'
        }
      ]
      setEquipments(mockEquipments)
      
      // Generate equipment status data
      const statusData = [
        { name: 'Active', value: mockEquipments.filter(e => e.status === 'Active').length, color: '#10B981' },
        { name: 'In Use', value: mockEquipments.filter(e => e.status === 'In Use').length, color: '#F59E0B' },
        { name: 'Maintenance', value: mockEquipments.filter(e => e.status === 'Maintenance').length, color: '#EF4444' }
      ]
      setEquipmentStatusData(statusData)
      
    } catch (error) {
      console.error('Error loading equipments:', error)
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
    activeEquipments: equipments.filter(e => e.status === 'Active').length,
    maintenanceEquipments: equipments.filter(e => e.status === 'Maintenance').length,
    totalReagents: reagentHistory.length,
    activeReagents: reagentHistory.filter(r => r.status === 'Active').length,
    expiringReagents: reagentHistory.filter(r => r.status === 'Expiring Soon').length,
    totalEvents: eventLogs.length,
    todayEvents: eventLogs.filter(e => e.date === new Date().toISOString().split('T')[0]).length
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1"
    switch (status) {
      case 'Active':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3" />
            Active
          </span>
        )
      case 'In Use':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Activity className="h-3 w-3" />
            In Use
          </span>
        )
      case 'Maintenance':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <Wrench className="h-3 w-3" />
            Maintenance  
          </span>
        )
      case 'Expiring Soon':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock className="h-3 w-3" />
            Expiring Soon
          </span>
        )
      case 'Expired':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="h-3 w-3" />
            Expired
          </span>
        )
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Laboratory Management Dashboard</h1>
              <p className="text-blue-100 text-lg">Overview of equipments, reagents, and system activities</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <div className="text-blue-200">Today's Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipments}</p>
              <p className="text-sm text-green-600 font-medium mt-1">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                {stats.activeEquipments} Active
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reagents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReagents}</p>
              <p className="text-sm text-yellow-600 font-medium mt-1">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                {stats.expiringReagents} Expiring
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Beaker className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">
                <Activity className="inline h-4 w-4 mr-1" />
                Recent Activity
              </p>
            </div>
            <div className="p-3 bg-slate-100 rounded-full">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Equipment Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Equipment Status</h3>
                  <p className="text-sm text-gray-600">Current status of laboratory instruments</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="relative group">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px]">
                    <button 
                      onClick={() => handleExportEquipment('excel')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Export Excel
                    </button>
                    <button 
                      onClick={() => handleExportEquipment('pdf')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/doctor/instrument')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Equipment Status Chart */}
            <div className="mb-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={equipmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
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
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Equipment */}
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-4">Recent Equipment</h4>
              <div className="space-y-3">
                {equipments.slice(0, 3).map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{equipment.name}</div>
                        <div className="text-xs text-gray-500">{equipment.room}</div>
                      </div>
                    </div>
                    {getStatusBadge(equipment.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event Log Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Event Log Analytics</h3>
                  <p className="text-sm text-gray-600">System activities and audit trail</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="relative group">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px]">
                    <button 
                      onClick={() => handleExportEventLog('excel')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Export Excel
                    </button>
                    <button 
                      onClick={() => handleExportEventLog('pdf')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/doctor/event-log')}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Event Timeline Chart */}
            <div className="mb-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={eventStats}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#64748B" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#E5E7EB" 
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#64748B" 
                      strokeWidth={3}
                      fill="url(#colorEvents)"
                      dot={{ 
                        fill: '#64748B', 
                        strokeWidth: 2, 
                        r: 4,
                        stroke: '#FFFFFF'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Event Types Summary */}
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-4">Event Types Distribution</h4>
              <div className="space-y-3">
                {eventTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reagent History Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Beaker className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reagent Inventory</h3>
                  <p className="text-sm text-gray-600">Chemical supplies and reagents status</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="relative group">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px]">
                    <button 
                      onClick={() => handleExportReagent('excel')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Export Excel
                    </button>
                    <button 
                      onClick={() => handleExportReagent('pdf')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/doctor/reagent-history')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Reagent Status Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.activeReagents}</div>
                <div className="text-xs text-green-600 font-medium">Active</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.expiringReagents}</div>
                <div className="text-xs text-yellow-600 font-medium">Expiring</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {reagentHistory.filter(r => r.status === 'Expired').length}
                </div>
                <div className="text-xs text-red-600 font-medium">Expired</div>
              </div>
            </div>
            
            {/* Recent Reagents */}
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-4">Recent Reagents</h4>
              <div className="space-y-3">
                {reagentHistory.slice(0, 4).map((reagent) => (
                  <div key={reagent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reagent.lotNumber}</div>
                        <div className="text-xs text-gray-500">{reagent.supplier}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(reagent.status)}
                      <div className="text-xs text-gray-500 mt-1">Exp: {reagent.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Frequently used laboratory functions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/doctor/instrument')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Equipment</div>
                  <div className="text-sm text-gray-500">Add, edit, and monitor instruments</div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/doctor/reagent-history')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left"
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <Beaker className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Reagent Management</div>
                  <div className="text-sm text-gray-500">Track supplies and inventory</div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/doctor/event-log')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left"
              >
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">System Logs</div>
                  <div className="text-sm text-gray-500">Monitor system activities</div>
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