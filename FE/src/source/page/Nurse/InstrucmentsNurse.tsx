import { useState, useEffect } from 'react'
import { 
  Eye, 
  Trash2, 
  Search, 
  Download,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  BarChart3,
  TrendingUp,
  MapPin,
  Calendar,
  Wrench
} from 'lucide-react'
import { exportEquipmentData } from '../../../utils/exportUtils'
import { toast } from '../../../utils/toast'
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext'
import { instrumentAPI, type Instrument as InstrumentType } from '../Axios/Axios'

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

function Instrucment() {
  const { isDarkMode } = useGlobalTheme()

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roomFilter, setRoomFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    loadEquipments()
  }, [])

  // Add modal animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadEquipments = async () => {
    try {
      const response = await instrumentAPI.getAll()
      const instruments = response.data.instruments || []
      
      const formattedEquipments: Equipment[] = instruments.map((inst: InstrumentType) => ({
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
      toast.success('Tải danh sách thiết bị thành công')
    } catch (error: any) {
      console.error('Error loading equipments:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách thiết bị')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'Available':
        return <span className={`${baseClasses} ${
          isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
        }`}>Available</span>
      case 'In Use':
        return <span className={`${baseClasses} ${
          isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
        }`}>In Use</span>
      case 'Maintenance':
        return <span className={`${baseClasses} ${
          isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
        }`}>Maintenance</span>
      case 'Out of Service':
        return <span className={`${baseClasses} ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
        }`}>Out of Service</span>
      default:
        return <span className={`${baseClasses} ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
        }`}>{status}</span>
    }
  }

  const handleDeleteEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteEquipment = async () => {
    if (selectedEquipment) {
      try {
        await instrumentAPI.delete(selectedEquipment.id)
        toast.success('Xóa thiết bị thành công')
        setIsDeleteModalOpen(false)
        setSelectedEquipment(null)
        loadEquipments()
      } catch (error: any) {
        console.error('Error deleting equipment:', error)
        toast.error(error.response?.data?.message || 'Lỗi khi xóa thiết bị')
      }
    }
  }

  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsViewModalOpen(true)
  }

  // Export functions
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const result = exportEquipmentData(filteredEquipments, format)
      if (result.success) {
        toast.success(`Equipment data exported to ${format.toUpperCase()} successfully!`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(`Failed to export equipment data to ${format.toUpperCase()}`)
      console.error('Export error:', error)
    }
  }

  // Filter functions
  const filteredEquipments = equipments.filter(equipment => {
    const matchSearch = searchTerm === '' || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = statusFilter === 'All' || equipment.status === statusFilter
    const matchRoom = roomFilter === 'All' || equipment.room === roomFilter
    const matchType = typeFilter === 'All' || equipment.type === typeFilter
    
    return matchSearch && matchStatus && matchRoom && matchType
  })

  // Statistics calculations
  const stats = {
    total: equipments.length,
    active: equipments.filter(e => e.status === 'Available').length,
    inUse: equipments.filter(e => e.status === 'In Use').length,
    maintenance: equipments.filter(e => e.status === 'Maintenance').length,
    rooms: [...new Set(equipments.map(e => e.room))].length,
    types: [...new Set(equipments.map(e => e.type))].length
  }

  // Get unique values for filters
  const uniqueRooms = [...new Set(equipments.map(e => e.room))]
  const uniqueTypes = [...new Set(equipments.map(e => e.type))]

  return (
    <div className="w-full max-w-full overflow-hidden transition-colors">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-4 md:mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Laboratory Equipment</h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg">Monitor, manage and maintain instruments</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-200">Total Equipment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-8">
        <div className={`lg:col-span-2 rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Equipment</p>
              <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
              <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                <TrendingUp className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                All systems operational
              </p>
            </div>
            <div className={`p-2 md:p-3 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-full ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>In Use</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{stats.inUse}</p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-full ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <Activity className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Maintenance</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-full ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
              <Wrench className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg md:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Locations</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{stats.rooms}</p>
            </div>
            <div className={`p-1.5 md:p-2 rounded-full ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={`rounded-xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 md:mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 md:py-2.5 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm md:text-base ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-white'
                }`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-white'
              }`}
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>

            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className={`px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-white'
              }`}
            >
              <option value="All">All Rooms</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-white'
              }`}
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <div className={`flex rounded-lg border overflow-hidden ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
            </div>

            <div className="relative group">
              <button className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 border rounded-lg transition-colors text-xs md:text-sm ${
                isDarkMode 
                  ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}>
                <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className={`absolute top-full left-0 mt-1 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px] ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <button 
                  onClick={() => handleExport('excel')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Export Excel
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredEquipments.length}</span> of <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipments.length}</span> equipment
            {searchTerm && (
              <span> matching "<span className="font-semibold text-blue-600">{searchTerm}</span>"</span>
            )}
          </p>
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredEquipments.map((equipment) => (
            <div key={equipment.id} className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded-full ${
                      equipment.status === 'Available' ? 
                        (isDarkMode ? 'bg-green-900/50' : 'bg-green-100') :
                      equipment.status === 'In Use' ? 
                        (isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100') : 
                        (isDarkMode ? 'bg-red-900/50' : 'bg-red-100')
                    }`}>
                      {equipment.status === 'Available' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : equipment.status === 'In Use' ? (
                        <Activity className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <Wrench className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    {getStatusBadge(equipment.status)}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.name}</h3>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{equipment.type}</p>
                  <div className={`flex items-center text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="h-4 w-4 mr-1" />
                    {equipment.room}
                  </div>
                  <div className={`text-xs font-mono px-2 py-1 rounded ${
                    isDarkMode 
                      ? 'text-gray-400 bg-gray-700' 
                      : 'text-gray-500 bg-gray-50'
                  }`}>
                    {equipment.id}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manufacturer</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.manufacturer}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Model</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.model}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Check</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.lastCheck}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Next Check</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.nextCheck}</p>
                  </div>
                </div>
              </div>

              <div className={`flex space-x-2 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <button 
                  onClick={() => handleViewEquipment(equipment)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 rounded-lg transition-colors text-sm font-medium ${
                    isDarkMode ? 'hover:text-blue-400 hover:bg-blue-900/30' : 'hover:text-blue-800 hover:bg-blue-50'
                  }`}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button 
                  onClick={() => handleDeleteEquipment(equipment)}
                  className={`flex items-center justify-center px-3 py-2 text-red-600 rounded-lg transition-colors text-sm font-medium ${
                    isDarkMode ? 'hover:text-red-400 hover:bg-red-900/30' : 'hover:text-red-800 hover:bg-red-50'
                  }`}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className={`rounded-xl shadow-lg mb-4 md:mb-8 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className={`p-3 sm:p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-base md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Equipment Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Equipment</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Details</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Location</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Maintenance</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode 
                  ? 'bg-gray-800 divide-gray-700' 
                  : 'bg-white divide-gray-200'
              }`}>
                {filteredEquipments.map((equipment) => (
                  <tr key={equipment.id} className={`transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          equipment.status === 'Available' ? 
                            (isDarkMode ? 'bg-green-900/50' : 'bg-green-100') :
                          equipment.status === 'In Use' ? 
                            (isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100') : 
                            (isDarkMode ? 'bg-red-900/50' : 'bg-red-100')
                        }`}>
                          {equipment.status === 'Available' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : equipment.status === 'In Use' ? (
                            <Activity className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Wrench className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{equipment.name}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{equipment.type}</div>
                          <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{equipment.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{equipment.manufacturer}</div>
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>{equipment.model}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{equipment.serialNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <MapPin className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        {equipment.room}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(equipment.status)}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="space-y-1">
                        <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-xs">Last: {equipment.lastCheck}</span>
                        </div>
                        <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-xs">Next: {equipment.nextCheck}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewEquipment(equipment)}
                          className={`p-2 text-blue-600 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:text-blue-400 hover:bg-blue-900/30' 
                              : 'hover:text-blue-800 hover:bg-blue-100'
                          }`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleViewEquipment(equipment)}
                          className={`p-2 text-orange-600 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:text-orange-400 hover:bg-orange-900/30' 
                              : 'hover:text-orange-800 hover:bg-orange-100'
                          }`}
                          title="Check Equipment"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipment(equipment)}
                          className={`p-2 text-red-600 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:text-red-400 hover:bg-red-900/30' 
                              : 'hover:text-red-800 hover:bg-red-100'
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEquipments.length === 0 && (
        <div className={`rounded-xl shadow-lg p-12 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="max-w-md mx-auto">
            <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Settings className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No equipment found</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {searchTerm || statusFilter !== 'All' || roomFilter !== 'All' || typeFilter !== 'All'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first piece of equipment.'
              }
            </p>
          </div>
        </div>
      )}



      {/* View Equipment Modal */}
      {isViewModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`rounded-xl p-8 w-full max-w-lg shadow-2xl transform transition-all ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                }`}>
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Equipment Details</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>View equipment information</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`rounded-xl p-6 space-y-5 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Equipment ID</label>
                    <p className={`text-lg font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.id}</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Equipment Name</label>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.name}</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Equipment Type</label>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.type}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Room Location</label>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.room}</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Status</label>
                    <div className="flex items-center">
                      {getStatusBadge(selectedEquipment.status)}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>Last Check</label>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.lastCheck}</p>
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>Next Check</label>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.nextCheck}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex space-x-4 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className={`flex-1 border-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`rounded-xl p-8 w-full max-w-lg shadow-2xl transform transition-all ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Equipment</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Permanent action - cannot be undone</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className={`border-l-4 border-red-400 p-6 rounded-lg mb-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-900/30 to-red-800/30' 
                  : 'bg-gradient-to-r from-red-50 to-red-100'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Warning: Permanent Deletion</h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                      This action cannot be undone. The equipment will be permanently removed from the system.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`border-2 rounded-lg p-4 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <h5 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Equipment to be deleted:</h5>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                  }`}>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipment Name:</span>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.name}</span>
                  </div>
                  <div className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                  }`}>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipment ID:</span>
                    <span className={`text-sm font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Room:</span>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.room}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex space-x-4 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={confirmDeleteEquipment}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Equipment
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`flex-1 border-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Instrucment