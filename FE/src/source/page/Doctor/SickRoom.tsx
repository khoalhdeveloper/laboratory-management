import React, { useState, useEffect } from 'react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { roomAPI } from '../Axios/Axios';
import { toast } from '../../../utils/toast';
import { 
  Bed, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  RefreshCw,
  Activity,
  Heart,
  Thermometer,
  Droplet,
  Plus,
  Edit,
  Trash2,
  X,
  UserPlus
} from 'lucide-react';

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  admissionDate: string;
  status: 'stable' | 'critical' | 'recovering' | 'observation';
  contactInfo?: string;
  vitalSigns?: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenLevel: number;
  };
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  type: 'ICU' | 'General' | 'VIP' | 'Emergency';
  capacity: number;
  occupied: number;
  patients: Patient[];
  status: 'available' | 'full' | 'maintenance';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const SickRoom: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    type: 'General' as 'ICU' | 'General' | 'VIP' | 'Emergency',
    capacity: 4,
    notes: ''
  });
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: 0,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    diagnosis: '',
    status: 'observation' as 'stable' | 'critical' | 'recovering' | 'observation'
  });

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await roomAPI.getRooms(params);
      
      console.log('API Response:', response.data);
      console.log('Rooms data:', response.data.data);
      
      if (response.data.success) {
        setRooms(response.data.data);
        console.log('Room statuses:', response.data.data.map((r: any) => ({
          roomNumber: r.roomNumber,
          status: r.status,
          occupied: r.occupied,
          capacity: r.capacity
        })));
      } else {
        throw new Error('Failed to fetch rooms');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error loading rooms';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filterType, filterStatus]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchRooms();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // CRUD Functions
  const handleCreateRoom = async () => {
    // Validation
    if (!formData.roomNumber.trim()) {
      toast.error('Room number is required');
      return;
    }
    if (formData.floor < 1) {
      toast.error('Floor must be at least 1');
      return;
    }
    if (formData.capacity < 1 || formData.capacity > 6) {
      toast.error('Capacity must be between 1 and 6');
      return;
    }

    try {
      const response = await roomAPI.createRoom(formData);
      if (response.data.success) {
        toast.success('Room created successfully');
        setShowCreateModal(false);
        fetchRooms();
        resetForm();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create room';
      toast.error(errorMsg);
      console.error('Create room error:', err);
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    
    // Validation
    if (formData.floor < 1) {
      toast.error('Floor must be at least 1');
      return;
    }
    if (formData.capacity < 1 || formData.capacity > 6) {
      toast.error('Capacity must be between 1 and 6');
      return;
    }

    try {
      const response = await roomAPI.updateRoom(selectedRoom.roomNumber, formData);
      if (response.data.success) {
        toast.success('Room updated successfully');
        setShowEditModal(false);
        fetchRooms();
        resetForm();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update room';
      toast.error(errorMsg);
      console.error('Update room error:', err);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      const response = await roomAPI.deleteRoom(selectedRoom.roomNumber);
      if (response.data.success) {
        toast.success('Room deleted successfully');
        setShowDeleteModal(false);
        fetchRooms();
        setSelectedRoom(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleAddPatient = async () => {
    if (!selectedRoom) return;
    
    // Validation
    if (!patientForm.name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (patientForm.age < 0 || patientForm.age > 150) {
      toast.error('Please enter a valid age (0-150)');
      return;
    }
    if (!patientForm.diagnosis.trim()) {
      toast.error('Diagnosis is required');
      return;
    }

    try {
      const response = await roomAPI.addPatientToRoom(selectedRoom.roomNumber, patientForm);
      if (response.data.success) {
        toast.success('Patient added successfully');
        setShowAddPatientModal(false);
        fetchRooms();
        resetPatientForm();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add patient';
      toast.error(errorMsg);
      console.error('Add patient error:', err);
    }
  };

  const handleRemovePatient = async (roomNumber: string, patientId: string) => {
    if (!confirm('Are you sure you want to remove this patient?')) return;
    try {
      const response = await roomAPI.removePatientFromRoom(roomNumber, patientId);
      if (response.data.success) {
        toast.success('Patient removed successfully');
        fetchRooms();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove patient');
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      floor: 1,
      type: 'General',
      capacity: 4,
      notes: ''
    });
    setSelectedRoom(null);
  };

  const resetPatientForm = () => {
    setPatientForm({
      name: '',
      age: 0,
      gender: 'Male',
      diagnosis: '',
      status: 'observation'
    });
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      notes: room.notes || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (room: Room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const openAddPatientModal = (room: Room) => {
    setSelectedRoom(room);
    resetPatientForm();
    setShowAddPatientModal(true);
  };

  const openEditPatientModal = (room: Room, patient: Patient) => {
    setSelectedRoom(room);
    setSelectedPatient(patient);
    setPatientForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender as 'Male' | 'Female' | 'Other',
      diagnosis: patient.diagnosis,
      status: patient.status
    });
    setShowEditPatientModal(true);
  };

  const handleUpdatePatient = async () => {
    if (!selectedRoom || !selectedPatient) return;
    
    // Validation
    if (!patientForm.name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (patientForm.age < 0 || patientForm.age > 150) {
      toast.error('Please enter a valid age (0-150)');
      return;
    }
    if (!patientForm.diagnosis.trim()) {
      toast.error('Diagnosis is required');
      return;
    }

    try {
      const response = await roomAPI.updatePatientInRoom(
        selectedRoom.roomNumber,
        selectedPatient._id,
        patientForm
      );
      if (response.data.success) {
        toast.success('Patient updated successfully');
        setShowEditPatientModal(false);
        fetchRooms();
        resetPatientForm();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update patient';
      toast.error(errorMsg);
      console.error('Update patient error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'stable':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'recovering':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'observation':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'available':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'full':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'maintenance':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'ICU':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'General':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'VIP':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'Emergency':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Data is already filtered by API, just display it
  const filteredRooms = rooms;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const fullRooms = rooms.filter(r => r.status === 'full').length;
  const totalPatients = rooms.reduce((sum, room) => sum + room.occupied, 0);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-600" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Loading sick rooms...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-16 h-16 text-red-600" />
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Rooms
          </p>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {error}
          </p>
          <button
            onClick={fetchRooms}
            className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sick Room Management
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Monitor and manage patient rooms and occupancy
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Room
            </button>
            <button
              onClick={fetchRooms}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Refresh rooms"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow-sm ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Rooms
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {totalRooms}
              </p>
            </div>
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Bed className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl shadow-sm ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Available
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {availableRooms}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl shadow-sm ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Full Rooms
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {fullRooms}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl shadow-sm ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Patients
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {totalPatients}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`p-4 rounded-xl shadow-sm mb-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by room or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-violet-500`}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-violet-500`}
          >
            <option value="all">All Room Types</option>
            <option value="ICU">ICU</option>
            <option value="General">General</option>
            <option value="VIP">VIP</option>
            <option value="Emergency">Emergency</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-violet-500`}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className={`rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Room Header */}
            <div className={`p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <Bed className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Room {room.roomNumber}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Floor {room.floor}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {room.status !== 'full' && (
                    <button 
                      onClick={() => openAddPatientModal(room)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-blue-400' 
                          : 'hover:bg-blue-50 text-blue-600'
                      }`}
                      title="Add Patient"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => openEditModal(room)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-yellow-400' 
                        : 'hover:bg-yellow-50 text-yellow-600'
                    }`}
                    title="Edit Room"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(room)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-red-400' 
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getRoomTypeColor(room.type)
                }`}>
                  {room.type}
                </span>
                {room.status === 'full' ? (
                  <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-red-600 text-white animate-pulse">
                    🚫 FULL
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(room.status)
                  }`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {room.occupied}/{room.capacity} Beds
                </span>
              </div>
            </div>

            {/* Patients List */}
            <div className="p-4">
              {room.patients.length === 0 ? (
                <div className="text-center py-8">
                  <Bed className={`w-12 h-12 mx-auto mb-2 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No patients in this room
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {room.patients.map((patient) => (
                    <div
                      key={patient._id}
                      className={`p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {patient.name}
                          </h4>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {patient.age} years • {patient.gender}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(patient.status)
                          }`}>
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                          </span>
                          <button
                            onClick={() => openEditPatientModal(room, patient)}
                            className={`p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400`}
                            title="Edit patient"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemovePatient(room.roomNumber, patient._id)}
                            className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400`}
                            title="Remove patient"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-sm mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {patient.diagnosis}
                      </p>

                      {patient.vitalSigns && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Heart className={`w-3 h-3 ${
                              isDarkMode ? 'text-red-400' : 'text-red-600'
                            }`} />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {patient.vitalSigns.heartRate} bpm
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className={`w-3 h-3 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {patient.vitalSigns.bloodPressure}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Thermometer className={`w-3 h-3 ${
                            isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {patient.vitalSigns.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplet className={`w-3 h-3 ${
                            isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            O2: {patient.vitalSigns.oxygenLevel}%
                          </span>
                        </div>
                      </div>
                      )}

                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <Clock className={`w-3 h-3 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                          Admitted: {new Date(patient.admissionDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className={`text-center py-12 rounded-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No rooms found
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Create New Room</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  placeholder="e.g., 101"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Floor *
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  min="1"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Room Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                >
                  <option value="General">General</option>
                  <option value="ICU">ICU</option>
                  <option value="VIP">VIP</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className={`flex gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Edit Room {selectedRoom.roomNumber}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Floor *
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  min="1"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Room Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                >
                  <option value="General">General</option>
                  <option value="ICU">ICU</option>
                  <option value="VIP">VIP</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  rows={3}
                />
              </div>
            </div>
            <div className={`flex gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowEditModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRoom}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Update Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Modal */}
      {showDeleteModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Delete Room</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Are you sure you want to delete Room {selectedRoom.roomNumber}? This action cannot be undone.
              </p>
              {selectedRoom.patients.length > 0 && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    ⚠️ This room has {selectedRoom.patients.length} patient(s). Please transfer them first.
                  </p>
                </div>
              )}
            </div>
            <div className={`flex gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={selectedRoom.patients.length > 0}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add Patient to Room {selectedRoom.roomNumber}</h3>
              <button onClick={() => setShowAddPatientModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  placeholder="Patient full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Age *
                  </label>
                  <input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({...patientForm, age: parseInt(e.target.value)})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                    min="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gender *
                  </label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({...patientForm, gender: e.target.value as any})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Diagnosis *
                </label>
                <textarea
                  value={patientForm.diagnosis}
                  onChange={(e) => setPatientForm({...patientForm, diagnosis: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  rows={3}
                  placeholder="Patient diagnosis"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status *
                </label>
                <select
                  value={patientForm.status}
                  onChange={(e) => setPatientForm({...patientForm, status: e.target.value as any})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                >
                  <option value="observation">Observation</option>
                  <option value="stable">Stable</option>
                  <option value="critical">Critical</option>
                  <option value="recovering">Recovering</option>
                </select>
              </div>
            </div>
            <div className={`flex gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditPatientModal && selectedRoom && selectedPatient && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Edit Patient - {selectedPatient.name}</h3>
              <button onClick={() => setShowEditPatientModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  placeholder="Patient full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Age *
                  </label>
                  <input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({...patientForm, age: parseInt(e.target.value)})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                    min="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gender *
                  </label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({...patientForm, gender: e.target.value as any})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Diagnosis *
                </label>
                <textarea
                  value={patientForm.diagnosis}
                  onChange={(e) => setPatientForm({...patientForm, diagnosis: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  rows={3}
                  placeholder="Patient diagnosis"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status *
                </label>
                <select
                  value={patientForm.status}
                  onChange={(e) => setPatientForm({...patientForm, status: e.target.value as any})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                >
                  <option value="observation">Observation</option>
                  <option value="stable">Stable</option>
                  <option value="critical">Critical</option>
                  <option value="recovering">Recovering</option>
                </select>
              </div>
            </div>
            <div className={`flex gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowEditPatientModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePatient}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Update Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SickRoom;
