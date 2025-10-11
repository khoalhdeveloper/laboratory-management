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

function Instrucment() {
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
  const [newEquipment, setNewEquipment] = useState<{
    name: string
    type: string
    room: string
    status: Equipment['status']
    manufacturer: string
    model: string
    serialNumber: string
    category: string
  }>({
    name: '',
    type: '',
    room: '',
    status: 'Active',
    manufacturer: '',
    model: '',
    serialNumber: '',
    category: ''
  })
  const [editEquipment, setEditEquipment] = useState<{
    name: string
    type: string
    room: string
    status: Equipment['status']
  }>({
    name: '',
    type: '',
    room: '',
    status: 'Active'
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
      // Enhanced mock data
      setEquipments([
        {
          id: 'EQ-1001',
          name: 'pH Meter Pro',
          type: 'pH Meter',
          category: 'Measurement',
          manufacturer: 'Hanna Instruments',
          model: 'HI-2020',
          serialNumber: 'HI2020001',
          room: 'Room A-101',
          status: 'Active',
          lastCheck: '15/01/2024',
          nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1002',
          name: 'High-Speed Centrifuge',
          type: 'Centrifuge',
          category: 'Sample Processing',
          manufacturer: 'Eppendorf',
          model: '5430R',
          serialNumber: 'EP5430R002',
          room: 'Room A-102',
          status: 'In Use',
          lastCheck: '15/01/2024',
          nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1003',
          name: 'UV Spectrophotometer',
          type: 'Spectrophotometer',
          category: 'Analysis',
          manufacturer: 'Thermo Scientific',
          model: 'Evolution 201',
          serialNumber: 'TS201003',
          room: 'Room A-103',
          status: 'In Use',
          lastCheck: '15/01/2024',
          nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1004',
          name: 'pH Meter Basic',
          type: 'pH Meter',
          category: 'Measurement',
          manufacturer: 'Hanna Instruments',
          model: 'HI-98103',
          serialNumber: 'HI98103004',
          room: 'Room A-101',
          status: 'Maintenance',
          lastCheck: '15/01/2024',
          nextCheck: '15/10/2025'
        },
        {
          id: 'EQ-1005',
          name: 'Digital Microscope',
          type: 'Microscope',
          category: 'Observation',
          manufacturer: 'Olympus',
          model: 'CX23',
          serialNumber: 'OL23005',
          room: 'Room B-101',
          status: 'Active',
          lastCheck: '10/01/2024',
          nextCheck: '10/10/2025'
        },
        {
          id: 'EQ-1006',
          name: 'Analytical Balance',
          type: 'Scale',
          category: 'Measurement',
          manufacturer: 'Sartorius',
          model: 'Cubis II',
          serialNumber: 'SAR2006',
          room: 'Room B-102',
          status: 'Active',
          lastCheck: '20/01/2024',
          nextCheck: '20/10/2025'
        }
      ])
    } catch (error) {
      console.error('Error loading equipments:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'Active':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>
      case 'In Use':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>In Use</span>
      case 'Maintenance':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Maintenance</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
    }
  }

  const handleAddEquipment = () => {
    if (newEquipment.name && newEquipment.type && newEquipment.room && newEquipment.manufacturer && newEquipment.model) {
      const equipment: Equipment = {
        id: `EQ-${Date.now()}`,
        name: newEquipment.name,
        type: newEquipment.type,
        room: newEquipment.room,
        status: newEquipment.status,
        manufacturer: newEquipment.manufacturer,
        model: newEquipment.model,
        serialNumber: newEquipment.serialNumber,
        category: newEquipment.category,
        lastCheck: new Date().toLocaleDateString('en-GB'),
        nextCheck: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
      }
      setEquipments([...equipments, equipment])
      setNewEquipment({ 
        name: '', 
        type: '', 
        room: '', 
        status: 'Active',
        manufacturer: '',
        model: '',
        serialNumber: '',
        category: ''
      })
      setIsAddModalOpen(false)
    }
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setEditEquipment({
      name: equipment.name,
      type: equipment.type,
      room: equipment.room,
      status: equipment.status
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateEquipment = () => {
    if (selectedEquipment && editEquipment.name && editEquipment.type && editEquipment.room) {
      const updatedEquipments = equipments.map(eq => 
        eq.id === selectedEquipment.id 
          ? {
              ...eq,
              name: editEquipment.name,
              type: editEquipment.type,
              room: editEquipment.room,
              status: editEquipment.status,
              lastCheck: new Date().toLocaleDateString('en-GB')
            }
          : eq
      )
      setEquipments(updatedEquipments)
      setIsEditModalOpen(false)
      setSelectedEquipment(null)
      setEditEquipment({ name: '', type: '', room: '', status: 'Active' })
    }
  }

  const handleDeleteEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteEquipment = () => {
    if (selectedEquipment) {
      const updatedEquipments = equipments.filter(eq => eq.id !== selectedEquipment.id)
      setEquipments(updatedEquipments)
      setIsDeleteModalOpen(false)
      setSelectedEquipment(null)
    }
  }

  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsViewModalOpen(true)
  }

  const handleCheckEquipment = (equipment: Equipment) => {
    const updatedEquipments = equipments.map(eq => 
      eq.id === equipment.id 
        ? {
            ...eq,
            lastCheck: new Date().toLocaleDateString('en-GB'),
            nextCheck: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
            status: 'Active' as Equipment['status']
          }
        : eq
    )
    setEquipments(updatedEquipments)
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
    active: equipments.filter(e => e.status === 'Active').length,
    inUse: equipments.filter(e => e.status === 'In Use').length,
    maintenance: equipments.filter(e => e.status === 'Maintenance').length,
    rooms: [...new Set(equipments.map(e => e.room))].length,
    types: [...new Set(equipments.map(e => e.type))].length
  }

  // Get unique values for filters
  const uniqueRooms = [...new Set(equipments.map(e => e.room))]
  const uniqueTypes = [...new Set(equipments.map(e => e.type))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Laboratory Equipment Registry</h1>
              <p className="text-blue-100 text-lg">Monitor, manage and maintain your laboratory instruments</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Equipment</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-green-600 font-medium mt-1">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                All systems operational
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Use</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inUse}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Maintenance</p>
              <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <Wrench className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Locations</p>
              <p className="text-2xl font-bold text-purple-600">{stats.rooms}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            >
              <option value="All">All Rooms</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-[120px]">
                <button 
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  Export Excel
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                >
                  Export PDF
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredEquipments.length}</span> of <span className="font-semibold text-gray-900">{equipments.length}</span> equipment
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
            <div key={equipment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded-full ${
                      equipment.status === 'Active' ? 'bg-green-100' :
                      equipment.status === 'In Use' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {equipment.status === 'Active' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : equipment.status === 'In Use' ? (
                        <Activity className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <Wrench className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    {getStatusBadge(equipment.status)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{equipment.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{equipment.type}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {equipment.room}
                  </div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                    {equipment.id}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Manufacturer</p>
                      <p className="font-medium text-gray-900">{equipment.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Model</p>
                      <p className="font-medium text-gray-900">{equipment.model}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Last Check</p>
                    <p className="font-medium text-gray-900">{equipment.lastCheck}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Next Check</p>
                    <p className="font-medium text-gray-900">{equipment.nextCheck}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-gray-100">
                <button 
                  onClick={() => handleViewEquipment(equipment)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button 
                  onClick={() => handleEditEquipment(equipment)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleCheckEquipment(equipment)}
                  className="flex items-center justify-center px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                  title="Check Equipment"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEquipment(equipment)}
                  className="flex items-center justify-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Equipment Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipments.map((equipment) => (
                  <tr key={equipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          equipment.status === 'Active' ? 'bg-green-100' :
                          equipment.status === 'In Use' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {equipment.status === 'Active' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : equipment.status === 'In Use' ? (
                            <Activity className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Wrench className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{equipment.name}</div>
                          <div className="text-sm text-gray-500">{equipment.type}</div>
                          <div className="text-xs text-gray-400 font-mono">{equipment.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{equipment.manufacturer}</div>
                        <div className="text-gray-500">{equipment.model}</div>
                        <div className="text-xs text-gray-400">{equipment.serialNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {equipment.room}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(equipment.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-xs">Last: {equipment.lastCheck}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-xs">Next: {equipment.nextCheck}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewEquipment(equipment)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEquipment(equipment)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleCheckEquipment(equipment)}
                          className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-colors"
                          title="Check Equipment"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipment(equipment)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'All' || roomFilter !== 'All' || typeFilter !== 'All'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first piece of equipment.'
              }
            </p>
            {(!searchTerm && statusFilter === 'All' && roomFilter === 'All' && typeFilter === 'All') && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
             style={{
               backdropFilter: 'blur(8px)',
               WebkitBackdropFilter: 'blur(8px)',
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               transition: 'all 300ms ease-out'
             }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 transform transition-all max-h-[90vh] overflow-y-auto"
               style={{
                 animation: 'modalSlideIn 0.3s ease-out',
                 transformOrigin: 'center',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
               }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Equipment</h3>
                  <p className="text-sm text-gray-500 mt-1">Fill in the equipment details below</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 hover:shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter equipment name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Equipment Type
                  </label>
                  <select
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="pH Meter">pH Meter</option>
                    <option value="Centrifuge">Centrifuge</option>
                    <option value="Spectrophotometer">Spectrophotometer</option>
                    <option value="Microscope">Microscope</option>
                    <option value="Scale">Scale</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Room Location
                  </label>
                  <select
                    value={newEquipment.room}
                    onChange={(e) => setNewEquipment({...newEquipment, room: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select room</option>
                    <option value="Room A-101">Room A-101</option>
                    <option value="Room A-102">Room A-102</option>
                    <option value="Room A-103">Room A-103</option>
                    <option value="Room B-101">Room B-101</option>
                    <option value="Room B-102">Room B-102</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </label>
                  <select
                    value={newEquipment.status}
                    onChange={(e) => setNewEquipment({...newEquipment, status: e.target.value as Equipment['status']})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-gray-500" />
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={newEquipment.manufacturer}
                    onChange={(e) => setNewEquipment({...newEquipment, manufacturer: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter manufacturer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-gray-500" />
                    Model
                  </label>
                  <input
                    type="text"
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter model"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter serial number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                    Category
                  </label>
                  <select
                    value={newEquipment.category}
                    onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Measurement">Measurement</option>
                    <option value="Sample Processing">Sample Processing</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Observation">Observation</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-6 border-t border-gray-100">
              <button 
                onClick={handleAddEquipment}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Equipment
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Equipment Modal */}
      {isViewModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Equipment Details</h3>
                  <p className="text-sm text-gray-500">View equipment information</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Equipment ID</label>
                    <p className="text-lg font-mono font-bold text-gray-900">{selectedEquipment.id}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Equipment Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedEquipment.name}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Equipment Type</label>
                    <p className="text-lg font-medium text-gray-800">{selectedEquipment.type}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Room Location</label>
                    <p className="text-lg font-medium text-gray-800">{selectedEquipment.room}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                    <div className="flex items-center">
                      {getStatusBadge(selectedEquipment.status)}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Check</label>
                        <p className="text-sm font-medium text-gray-800">{selectedEquipment.lastCheck}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Check</label>
                        <p className="text-sm font-medium text-gray-800">{selectedEquipment.nextCheck}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEditEquipment(selectedEquipment)
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Equipment
              </button>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {isEditModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Equipment</h3>
                  <p className="text-sm text-gray-500">Update equipment information</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    value={editEquipment.name}
                    onChange={(e) => setEditEquipment({...editEquipment, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter equipment name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Equipment Type
                  </label>
                  <select
                    value={editEquipment.type}
                    onChange={(e) => setEditEquipment({...editEquipment, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="pH Meter">pH Meter</option>
                    <option value="Centrifuge">Centrifuge</option>
                    <option value="Spectrophotometer">Spectrophotometer</option>
                    <option value="Microscope">Microscope</option>
                    <option value="Scale">Scale</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Room Location
                  </label>
                  <select
                    value={editEquipment.room}
                    onChange={(e) => setEditEquipment({...editEquipment, room: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select room</option>
                    <option value="Room A-101">Room A-101</option>
                    <option value="Room A-102">Room A-102</option>
                    <option value="Room A-103">Room A-103</option>
                    <option value="Room B-101">Room B-101</option>
                    <option value="Room B-102">Room B-102</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </label>
                  <select
                    value={editEquipment.status}
                    onChange={(e) => setEditEquipment({...editEquipment, status: e.target.value as Equipment['status']})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-6 border-t border-gray-100">
              <button 
                onClick={handleUpdateEquipment}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Update Equipment
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEquipment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Equipment</h3>
                  <p className="text-sm text-gray-500">Permanent action - cannot be undone</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold text-red-800">Warning: Permanent Deletion</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. The equipment will be permanently removed from the system.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Equipment to be deleted:</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Equipment Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedEquipment.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Equipment ID:</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{selectedEquipment.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Room:</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedEquipment.room}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
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
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
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