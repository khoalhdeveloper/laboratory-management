import { useState, useEffect } from 'react'
import { 
  Plus, 
  Eye, 
  Edit, 
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
  Wrench,
  X
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roomFilter, setRoomFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newEquipment, setNewEquipment] = useState<{
    name: string
    type: string
    room: string
    status: Equipment['status']
    manufacturer: string
    model: string
    serialNumber: string
    category: string
    lastCheck: string
    nextCheck: string
  }>({
    name: '',
    type: '',
    room: '',
    status: 'Available',
    manufacturer: '',
    model: '',
    serialNumber: '',
    category: '',
    lastCheck: '',
    nextCheck: ''
  })
  const [editEquipment, setEditEquipment] = useState<{
    name: string
    type: string
    room: string
    status: Equipment['status']
    manufacturer: string
    model: string
    serialNumber: string
    category: string
    lastCheck: string
    nextCheck: string
  }>({
    name: '',
    type: '',
    room: '',
    status: 'Available',
    manufacturer: '',
    model: '',
    serialNumber: '',
    category: '',
    lastCheck: '',
    nextCheck: ''
  })

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

  // Field Error Component
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <p className="mt-1 text-sm text-red-500">
        {error}
      </p>
    )
  }

  // Validation function
  const validateEquipmentForm = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}
    
    // Validate Equipment Name (Required)
    if (!newEquipment.name?.trim()) {
      errors.name = 'Equipment name is required'
    }
    
    // Validate Equipment Type (Required)
    if (!newEquipment.type?.trim()) {
      errors.type = 'Equipment type is required'
    }
    
    // Validate Room Location (Required)
    if (!newEquipment.room?.trim()) {
      errors.room = 'Room location is required'
    }
    
    // Validate Manufacturer (Required)
    if (!newEquipment.manufacturer?.trim()) {
      errors.manufacturer = 'Manufacturer is required'
    }
    
    // Validate Model (Required)
    if (!newEquipment.model?.trim()) {
      errors.model = 'Model is required'
    }
    
    // Validate Serial Number (Required)
    if (!newEquipment.serialNumber?.trim()) {
      errors.serialNumber = 'Serial number is required'
    }
    
    // Validate Category (Required)
    if (!newEquipment.category?.trim()) {
      errors.category = 'Category is required'
    }
    
    // Validate Last Check (must be in the past or today)
    if (newEquipment.lastCheck) {
      const lastCheckDate = new Date(newEquipment.lastCheck)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      
      if (lastCheckDate > today) {
        errors.lastCheck = 'Last check date must be today or in the past'
      }
    }
    
    // Validate Next Check (must be in the future)
    if (newEquipment.nextCheck) {
      const nextCheckDate = new Date(newEquipment.nextCheck)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today
      
      if (nextCheckDate <= today) {
        errors.nextCheck = 'Next check date must be in the future'
      }
    }
    
    // Validate that Next Check is after Last Check
    if (newEquipment.lastCheck && newEquipment.nextCheck) {
      const lastCheckDate = new Date(newEquipment.lastCheck)
      const nextCheckDate = new Date(newEquipment.nextCheck)
      
      if (nextCheckDate <= lastCheckDate) {
        errors.nextCheck = 'Next check date must be after last check date'
      }
    }
    
    return { valid: Object.keys(errors).length === 0, errors }
  }

  const updateFormField = (field: string, value: any) => {
    setNewEquipment({ ...newEquipment, [field]: value })
    // Clear error when user types
    if (formErrors[field]) {
      const newErrors = { ...formErrors }
      delete newErrors[field]
      setFormErrors(newErrors)
    }
  }

  const handleOpenAddModal = () => {
    setFormErrors({}) // Clear all previous errors
    setIsAddModalOpen(true)
  }

  const handleAddEquipment = async () => {
    // Validate form
    const validation = validateEquipmentForm()
    if (!validation.valid) {
      setFormErrors(validation.errors)
      toast.error('Please fix the validation errors')
      return
    }
    setFormErrors({}) // Clear errors if validation passes
    
    try {
      const instrumentData = {
        name: newEquipment.name,
        type: newEquipment.type,
        category: newEquipment.category,
        manufacturer: newEquipment.manufacturer,
        model: newEquipment.model,
        serial_number: newEquipment.serialNumber,
        room: newEquipment.room,
        status: newEquipment.status,
        last_check: newEquipment.lastCheck ? new Date(newEquipment.lastCheck).toISOString() : undefined,
        next_check: newEquipment.nextCheck ? new Date(newEquipment.nextCheck).toISOString() : undefined
      }
      
      await instrumentAPI.create(instrumentData)
      toast.success('Thêm thiết bị thành công')
      setNewEquipment({ 
        name: '', 
        type: '', 
        room: '', 
        status: 'Available',
        manufacturer: '',
        model: '',
        serialNumber: '',
        category: '',
        lastCheck: '',
        nextCheck: ''
      })
      setIsAddModalOpen(false)
      loadEquipments()
    } catch (error: any) {
      console.error('Error adding equipment:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi thêm thiết bị')
    }
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setEditEquipment({
      name: equipment.name,
      type: equipment.type,
      room: equipment.room,
      status: equipment.status,
      manufacturer: equipment.manufacturer || '',
      model: equipment.model || '',
      serialNumber: equipment.serialNumber || '',
      category: equipment.category || '',
      lastCheck: equipment.lastCheck,
      nextCheck: equipment.nextCheck
    })
    setFormErrors({}) // Clear errors when opening edit modal
    setIsEditModalOpen(true)
  }

  // Validation function for Edit form
  const validateEditEquipmentForm = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}
    
    // Validate Equipment Name (Required)
    if (!editEquipment.name?.trim()) {
      errors.name = 'Equipment name is required'
    }
    
    // Validate Equipment Type (Required)
    if (!editEquipment.type?.trim()) {
      errors.type = 'Equipment type is required'
    }
    
    // Validate Room Location (Required)
    if (!editEquipment.room?.trim()) {
      errors.room = 'Room location is required'
    }
    
    // Validate Manufacturer (Required)
    if (!editEquipment.manufacturer?.trim()) {
      errors.manufacturer = 'Manufacturer is required'
    }
    
    // Validate Model (Required)
    if (!editEquipment.model?.trim()) {
      errors.model = 'Model is required'
    }
    
    // Validate Serial Number (Required)
    if (!editEquipment.serialNumber?.trim()) {
      errors.serialNumber = 'Serial number is required'
    }
    
    // Validate Category (Required)
    if (!editEquipment.category?.trim()) {
      errors.category = 'Category is required'
    }
    
    // Validate Last Check (must be in the past or today)
    if (editEquipment.lastCheck) {
      const lastCheckDate = new Date(editEquipment.lastCheck)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      
      if (lastCheckDate > today) {
        errors.lastCheck = 'Last check date must be today or in the past'
      }
    }
    
    // Validate Next Check (must be in the future)
    if (editEquipment.nextCheck) {
      const nextCheckDate = new Date(editEquipment.nextCheck)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today
      
      if (nextCheckDate <= today) {
        errors.nextCheck = 'Next check date must be in the future'
      }
    }
    
    // Validate that Next Check is after Last Check
    if (editEquipment.lastCheck && editEquipment.nextCheck) {
      const lastCheckDate = new Date(editEquipment.lastCheck)
      const nextCheckDate = new Date(editEquipment.nextCheck)
      
      if (nextCheckDate <= lastCheckDate) {
        errors.nextCheck = 'Next check date must be after last check date'
      }
    }
    
    return { valid: Object.keys(errors).length === 0, errors }
  }

  const updateEditFormField = (field: string, value: any) => {
    setEditEquipment({ ...editEquipment, [field]: value })
    // Clear error when user types
    if (formErrors[field]) {
      const newErrors = { ...formErrors }
      delete newErrors[field]
      setFormErrors(newErrors)
    }
  }

  const handleUpdateEquipment = async () => {
    // Validate form
    const validation = validateEditEquipmentForm()
    if (!validation.valid) {
      setFormErrors(validation.errors)
      toast.error('Please fix the validation errors')
      return
    }
    setFormErrors({}) // Clear errors if validation passes

    if (selectedEquipment) {
      try {
        const updateData = {
          name: editEquipment.name,
          type: editEquipment.type,
          category: editEquipment.category,
          manufacturer: editEquipment.manufacturer,
          model: editEquipment.model,
          serial_number: editEquipment.serialNumber,
          room: editEquipment.room,
          status: editEquipment.status,
          last_check: editEquipment.lastCheck ? new Date(editEquipment.lastCheck).toISOString() : null,
          next_check: editEquipment.nextCheck ? new Date(editEquipment.nextCheck).toISOString() : null
        }
        
        await instrumentAPI.update(selectedEquipment.id, updateData)
        toast.success('Cập nhật thiết bị thành công')
        setIsEditModalOpen(false)
        setSelectedEquipment(null)
        setEditEquipment({ 
          name: '', 
          type: '', 
          room: '', 
          status: 'Available',
          manufacturer: '',
          model: '',
          serialNumber: '',
          category: '',
          lastCheck: '',
          nextCheck: ''
        })
        loadEquipments()
      } catch (error: any) {
        console.error('Error updating equipment:', error)
        toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thiết bị')
      }
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

  const handleCheckEquipment = async (equipment: Equipment) => {
    try {
      const updateData = {
        last_check: new Date().toISOString(),
        next_check: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Available'
      }
      
      await instrumentAPI.update(equipment.id, updateData)
      toast.success('Kiểm tra thiết bị thành công')
      loadEquipments()
    } catch (error: any) {
      console.error('Error checking equipment:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi kiểm tra thiết bị')
    }
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
    <div className={`min-h-screen p-3 sm:p-4 lg:p-6 transition-colors ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 w-full">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-3xl font-bold mb-0.5 sm:mb-1 lg:mb-2 leading-tight">Laboratory Equipment Registry</h1>
              <p className="text-blue-100 text-[10px] sm:text-sm lg:text-lg leading-tight line-clamp-2 sm:line-clamp-1">Monitor, manage and maintain your laboratory instruments</p>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="text-right whitespace-nowrap">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-200 text-sm">Total Equipment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        <div className={`col-span-2 sm:col-span-3 lg:col-span-2 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Equipment</p>
              <p className={`text-2xl sm:text-3xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
              <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                <TrendingUp className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">All systems operational</span>
                <span className="sm:hidden">Operational</span>
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>In Use</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.inUse}</p>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Maintenance</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
              <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Locations</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.rooms}</p>
            </div>
            <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-100'
      }`}>
        <div className="flex flex-col gap-4">
          {/* Search and Filters Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 lg:py-3 w-full border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-white'
                }`}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
              className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
          </div>

          {/* Filters Row 2 and Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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

            {/* Action Buttons */}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3 justify-end flex-wrap">
              <div className={`flex rounded-lg border overflow-hidden ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
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
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
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
                <button className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}>
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <div className={`absolute top-full right-0 mt-1 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px] ${
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

              <button 
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium text-xs sm:text-sm whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Equipment</span>
                <span className="sm:hidden">Add</span>
              </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {filteredEquipments.map((equipment) => (
            <div key={equipment.id} className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
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
                  onClick={() => handleEditEquipment(equipment)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-green-600 rounded-lg transition-colors text-sm font-medium ${
                    isDarkMode ? 'hover:text-green-400 hover:bg-green-900/30' : 'hover:text-green-800 hover:bg-green-50'
                  }`}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleCheckEquipment(equipment)}
                  className={`flex items-center justify-center px-3 py-2 text-orange-600 rounded-lg transition-colors text-sm font-medium ${
                    isDarkMode ? 'hover:text-orange-400 hover:bg-orange-900/30' : 'hover:text-orange-800 hover:bg-orange-50'
                  }`}
                  title="Check Equipment"
                >
                  <CheckCircle className="h-4 w-4" />
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
        <div className={`rounded-xl shadow-lg mb-8 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Equipment Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
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
                          onClick={() => handleEditEquipment(equipment)}
                          className={`p-2 text-green-600 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:text-green-400 hover:bg-green-900/30' 
                              : 'hover:text-green-800 hover:bg-green-100'
                          }`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleCheckEquipment(equipment)}
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
            {(!searchTerm && statusFilter === 'All' && roomFilter === 'All' && typeFilter === 'All') && (
              <button 
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                Add First Equipment
              </button>
            )}
          </div>
        </div>
      )}



      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4"
             style={{
               backdropFilter: 'blur(8px)',
               WebkitBackdropFilter: 'blur(8px)',
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               transition: 'all 300ms ease-out'
             }}>
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl lg:max-w-2xl shadow-2xl transform transition-all max-h-[95vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}
               style={{
                 animation: 'modalSlideIn 0.3s ease-out',
                 transformOrigin: 'center',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
               }}>
            <div className={`flex items-center justify-between mb-4 sm:mb-5 lg:mb-6 pb-3 sm:pb-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-800 to-blue-900' 
                    : 'bg-gradient-to-br from-blue-100 to-blue-200'
                }`}>
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Equipment</h3>
                  <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Fill in the equipment details below</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 hover:shadow-md flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.name
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter equipment name"
                    required
                  />
                  <FieldError error={formErrors.name} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Equipment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newEquipment.type}
                    onChange={(e) => updateFormField('type', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.type
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="pH Meter">pH Meter</option>
                    <option value="Centrifuge">Centrifuge</option>
                    <option value="Spectrophotometer">Spectrophotometer</option>
                    <option value="Microscope">Microscope</option>
                    <option value="Scale">Scale</option>
                  </select>
                  <FieldError error={formErrors.type} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Room Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newEquipment.room}
                    onChange={(e) => updateFormField('room', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.room
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    required
                  >
                    <option value="">Select room</option>
                    <option value="Room A-101">Room A-101</option>
                    <option value="Room A-102">Room A-102</option>
                    <option value="Room A-103">Room A-103</option>
                    <option value="Room B-101">Room B-101</option>
                    <option value="Room B-102">Room B-102</option>
                  </select>
                  <FieldError error={formErrors.room} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </label>
                  <select
                    value={newEquipment.status}
                    onChange={(e) => setNewEquipment({...newEquipment, status: e.target.value as Equipment['status']})}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Settings className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEquipment.manufacturer}
                    onChange={(e) => updateFormField('manufacturer', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.manufacturer
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter manufacturer"
                    required
                  />
                  <FieldError error={formErrors.manufacturer} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Activity className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEquipment.model}
                    onChange={(e) => updateFormField('model', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.model
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter model"
                    required
                  />
                  <FieldError error={formErrors.model} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <BarChart3 className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEquipment.serialNumber}
                    onChange={(e) => updateFormField('serialNumber', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.serialNumber
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter serial number"
                    required
                  />
                  <FieldError error={formErrors.serialNumber} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newEquipment.category}
                    onChange={(e) => updateFormField('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.category
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Measurement">Measurement</option>
                    <option value="Sample Processing">Sample Processing</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Observation">Observation</option>
                    <option value="General">General</option>
                  </select>
                  <FieldError error={formErrors.category} />
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Last Check
                  </label>
                  <input
                    type="date"
                    value={newEquipment.lastCheck}
                    onChange={(e) => updateFormField('lastCheck', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.lastCheck
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                  />
                  <FieldError error={formErrors.lastCheck} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Clock className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Next Check
                  </label>
                  <input
                    type="date"
                    value={newEquipment.nextCheck}
                    onChange={(e) => updateFormField('nextCheck', e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.nextCheck
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                  />
                  <FieldError error={formErrors.nextCheck} />
                </div>
              </div>
            </div>
            
            <div className={`flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:space-x-3 lg:space-x-4 pt-4 sm:pt-5 lg:pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className={`w-full sm:w-auto sm:flex-1 border-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEquipment}
                className="w-full sm:w-auto sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add Equipment</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Equipment Modal */}
      {isViewModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4">
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-2xl transform transition-all max-h-[95vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Equipment Details</h3>
                  <p className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>View equipment information</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-5 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100'
            }`}>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Equipment ID</label>
                    <p className={`text-sm sm:text-base lg:text-lg font-mono font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.id}</p>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Equipment Name</label>
                    <p className={`text-sm sm:text-base lg:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.name}</p>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Equipment Type</label>
                    <p className={`text-sm sm:text-base lg:text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.type}</p>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Room Location</label>
                    <p className={`text-sm sm:text-base lg:text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.room}</p>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Status</label>
                    <div className="flex items-center">
                      {getStatusBadge(selectedEquipment.status)}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-white border border-gray-100'
                  }`}>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                      <div>
                        <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>Last Check</label>
                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.lastCheck}</p>
                      </div>
                      <div>
                        <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>Next Check</label>
                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.nextCheck}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:space-x-3 lg:space-x-4 pt-4 sm:pt-5 lg:pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className={`w-full sm:w-auto sm:flex-1 border-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEditEquipment(selectedEquipment)
                }}
                className="w-full sm:w-auto sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">Edit Equipment</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {isEditModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4">
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-2xl transform transition-all max-h-[95vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Equipment</h3>
                  <p className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Update equipment information</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEquipment.name}
                    onChange={(e) => updateEditFormField('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.name
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter equipment name"
                    required
                  />
                  <FieldError error={formErrors.name} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Equipment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editEquipment.type}
                    onChange={(e) => updateEditFormField('type', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.type
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="pH Meter">pH Meter</option>
                    <option value="Centrifuge">Centrifuge</option>
                    <option value="Spectrophotometer">Spectrophotometer</option>
                    <option value="Microscope">Microscope</option>
                    <option value="Scale">Scale</option>
                  </select>
                  <FieldError error={formErrors.type} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Room Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editEquipment.room}
                    onChange={(e) => updateEditFormField('room', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.room
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    required
                  >
                    <option value="">Select room</option>
                    <option value="Room A-101">Room A-101</option>
                    <option value="Room A-102">Room A-102</option>
                    <option value="Room A-103">Room A-103</option>
                    <option value="Room B-101">Room B-101</option>
                    <option value="Room B-102">Room B-102</option>
                  </select>
                  <FieldError error={formErrors.room} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <svg className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </label>
                  <select
                    value={editEquipment.status}
                    onChange={(e) => setEditEquipment({...editEquipment, status: e.target.value as Equipment['status']})}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>

              {/* Additional Edit Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Settings className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEquipment.manufacturer}
                    onChange={(e) => updateEditFormField('manufacturer', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.manufacturer
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter manufacturer"
                    required
                  />
                  <FieldError error={formErrors.manufacturer} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Activity className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEquipment.model}
                    onChange={(e) => updateEditFormField('model', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.model
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter model"
                    required
                  />
                  <FieldError error={formErrors.model} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <BarChart3 className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editEquipment.serialNumber}
                    onChange={(e) => updateEditFormField('serialNumber', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.serialNumber
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Enter serial number"
                    required
                  />
                  <FieldError error={formErrors.serialNumber} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editEquipment.category}
                    onChange={(e) => updateEditFormField('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.category
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Measurement">Measurement</option>
                    <option value="Sample Processing">Sample Processing</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Observation">Observation</option>
                    <option value="General">General</option>
                  </select>
                  <FieldError error={formErrors.category} />
                </div>
              </div>

              {/* Date Fields for Edit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Last Check
                  </label>
                  <input
                    type="date"
                    value={editEquipment.lastCheck}
                    onChange={(e) => updateEditFormField('lastCheck', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.lastCheck
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                  />
                  <FieldError error={formErrors.lastCheck} />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    <Clock className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Next Check
                  </label>
                  <input
                    type="date"
                    value={editEquipment.nextCheck}
                    onChange={(e) => updateEditFormField('nextCheck', e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      formErrors.nextCheck
                        ? 'border-red-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-white'
                    }`}
                  />
                  <FieldError error={formErrors.nextCheck} />
                </div>
              </div>
            </div>
            
            <div className={`flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:space-x-3 lg:space-x-4 pt-4 sm:pt-5 lg:pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className={`w-full sm:w-auto sm:flex-1 border-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateEquipment}
                className="w-full sm:w-auto sm:flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Update Equipment</span>
                <span className="sm:hidden">Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4">
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-2xl transform transition-all max-h-[95vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Equipment</h3>
                  <p className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Permanent action - cannot be undone</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 sm:mb-5 lg:mb-6">
              <div className={`border-l-4 border-red-400 p-3 sm:p-4 lg:p-6 rounded-lg mb-3 sm:mb-4 lg:mb-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-900/30 to-red-800/30' 
                  : 'bg-gradient-to-r from-red-50 to-red-100'
              }`}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm sm:text-base lg:text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Warning: Permanent Deletion</h4>
                    <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                      This action cannot be undone. The equipment will be permanently removed from the system.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`border-2 rounded-lg p-3 sm:p-4 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <h5 className={`text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Equipment to be deleted:</h5>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className={`flex justify-between items-center py-1.5 sm:py-2 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                  }`}>
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipment Name:</span>
                    <span className={`text-xs sm:text-sm font-semibold truncate ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.name}</span>
                  </div>
                  <div className={`flex justify-between items-center py-1.5 sm:py-2 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                  }`}>
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipment ID:</span>
                    <span className={`text-xs sm:text-sm font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 sm:py-2">
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Room:</span>
                    <span className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedEquipment.room}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:space-x-3 lg:space-x-4 pt-4 sm:pt-5 lg:pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`w-full sm:w-auto sm:flex-1 border-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteEquipment}
                className="w-full sm:w-auto sm:flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete Equipment</span>
                <span className="sm:hidden">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Instrucment