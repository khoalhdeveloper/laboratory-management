import React, { useState, useEffect } from 'react';
import { 
  Search,
  Download,
  Eye,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Package,
  Beaker,
  Building2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calendar,
  XCircle
} from 'lucide-react';
import { exportReagentData } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { api } from '../Axios/Axios';

// Types for Usage only (nurse chỉ xem usage)
interface ReagentUsage {
  _id: string;
  reagent_name: string;
  quantity_used: number;
  used_by: string;
  role: string;
  used_at: string;
  notes?: string;
  instrument_id?: string;
  instrument_name?: string;
  procedure?: string;
  used_for?: string;
  created_at: string;
  updated_at: string;
}

interface Batch {
  lot_number: string;
  quantity: number;
  expiration_date: string;
  supply_id: string;
  storage_location?: string;
  received_date: string;
}

interface Reagent {
  _id: string;
  reagent_name: string;
  catalog_number?: string;
  manufacturer?: string;
  cas_number?: string;
  description?: string;
  quantity_available: number;
  unit: string;
  nearest_expiration_date?: string;
  batch_count?: number;
  expiring_soon_count?: number;
  expired_count?: number;
  expiring_soon_quantity?: number;
  expired_quantity?: number;
  batches?: Batch[];
}

const ReagentHistory: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  // Nurse có cả tab usage và reagents
  const [activeTab, setActiveTab] = useState<'usage' | 'reagents'>('usage');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');
  const [reagentNameFilter, setReagentNameFilter] = useState('');

  // Modal states - chỉ cho view
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReagentUsage | Reagent | null>(null);

  // API Data States
  const [usageHistory, setUsageHistory] = useState<ReagentUsage[]>([]);
  const [reagentList, setReagentList] = useState<Reagent[]>([]);
  const [instrumentList, setInstrumentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReagentBatches, setSelectedReagentBatches] = useState<Batch[]>([]);
  
  // Stats for dashboard view
  const [showStats, setShowStats] = useState(true);

  // Load usage history
  const loadUsageHistory = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/reagent-usage/history');
      console.log('Usage history response:', response.data);
      
      if (response.data && response.data.data) {
        console.log('Sample usage record:', response.data.data[0]);
        console.log('All available fields:', Object.keys(response.data.data[0] || {}));
        console.log('Test order ID field:', response.data.data[0]?.test_order_id);
        setUsageHistory(response.data.data);
      } else {
        setUsageHistory([]);
      }
    } catch (error: any) {
      console.error('Error loading usage history:', error);
      toast.error('Failed to load usage history');
      setUsageHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReagents = async () => {
    try {
      const response = await api.get('/reagents/getAllReagents');
      if (response.data.success) {
        // Process reagents to handle MongoDB Decimal128
        const processedReagents = (response.data.data || []).map((reagent: any) => ({
          ...reagent,
          quantity_available: typeof reagent.quantity_available === 'object' && reagent.quantity_available?.$numberDecimal 
            ? parseFloat(reagent.quantity_available.$numberDecimal) 
            : reagent.quantity_available || 0,
          batch_count: typeof reagent.batch_count === 'object' && reagent.batch_count?.$numberDecimal
            ? parseInt(reagent.batch_count.$numberDecimal)
            : reagent.batch_count || 0,
          expiring_soon_count: typeof reagent.expiring_soon_count === 'object' && reagent.expiring_soon_count?.$numberDecimal
            ? parseInt(reagent.expiring_soon_count.$numberDecimal)
            : reagent.expiring_soon_count || 0,
          expired_count: typeof reagent.expired_count === 'object' && reagent.expired_count?.$numberDecimal
            ? parseInt(reagent.expired_count.$numberDecimal)
            : reagent.expired_count || 0,
          expiring_soon_quantity: typeof reagent.expiring_soon_quantity === 'object' && reagent.expiring_soon_quantity?.$numberDecimal
            ? parseFloat(reagent.expiring_soon_quantity.$numberDecimal)
            : reagent.expiring_soon_quantity || 0,
          expired_quantity: typeof reagent.expired_quantity === 'object' && reagent.expired_quantity?.$numberDecimal
            ? parseFloat(reagent.expired_quantity.$numberDecimal)
            : reagent.expired_quantity || 0
        }));
        setReagentList(processedReagents);
      } else {
        setReagentList([]);
      }
    } catch (error) {
      console.error('Error loading reagents:', error);
      setReagentList([]);
    }
  };

  const loadInstruments = async () => {
    try {
      const response = await api.get('/instruments/getAllinstrument');
      
      if (response.data && response.data.instruments) {
        setInstrumentList(response.data.instruments);
      } else {
        setInstrumentList([]);
      }
    } catch (error: any) {
      console.error('Error loading instruments:', error);
      setInstrumentList([]);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    const loadAllData = async () => {
      if (activeTab === 'usage') {
        await Promise.all([
          loadUsageHistory(),
          loadReagents(),
          loadInstruments()
        ]);
      } else if (activeTab === 'reagents') {
        await loadReagentsForTab();
      }
    };
    loadAllData();
  }, [activeTab]);

  // View function (chỉ xem, không chỉnh sửa)
  const handleView = async (item: ReagentUsage | Reagent) => {
    setSelectedItem(item);
    
    // Load batches if viewing reagent
    if ('quantity_available' in item) {
      try {
        setLoading(true);
        // Load batches for this reagent from supply records
        const response = await api.get('/reagent-supply/getAllSupplyRecords');
        
        if (response.data?.success) {
          const allSupplyRecords = response.data.data?.records || response.data.data || [];
          
          // Filter batches for this specific reagent
          const reagentBatches = allSupplyRecords
            .filter((record: any) => 
              record.reagent_name && 
              record.reagent_name.toLowerCase() === item.reagent_name.toLowerCase()
            )
            .map((record: any) => ({
              lot_number: record.lot_number || 'N/A',
              quantity: typeof record.quantity_received === 'object' && record.quantity_received?.$numberDecimal 
                ? parseFloat(record.quantity_received.$numberDecimal)
                : record.quantity_received || 0,
              expiration_date: record.expiration_date,
              supply_id: record._id,
              storage_location: record.storage_location,
              received_date: record.receipt_date || record.created_at
            }));
          
          // Remove duplicates based on lot_number, expiration_date, and storage_location
          const uniqueBatches = reagentBatches.filter((batch: any, index: number, self: any[]) => 
            index === self.findIndex((b: any) => 
              b.lot_number === batch.lot_number && 
              b.expiration_date === batch.expiration_date &&
              b.storage_location === batch.storage_location
            )
          );
          
          setSelectedReagentBatches(uniqueBatches);
        } else {
          setSelectedReagentBatches([]);
        }
      } catch (error) {
        console.error('Error loading batches:', error);
        setSelectedReagentBatches([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedReagentBatches([]);
    }
    
    setShowModal(true);
  };

  // Load reagents list for reagents tab
  const loadReagentsForTab = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reagents/getAllReagents');
      
      if (response.data?.success && response.data?.data) {
        const processedReagents = response.data.data.map((reagent: any) => ({
          ...reagent,
          quantity_available: typeof reagent.quantity_available === 'object' && reagent.quantity_available?.$numberDecimal 
            ? parseFloat(reagent.quantity_available.$numberDecimal) 
            : reagent.quantity_available || 0,
          batch_count: typeof reagent.batch_count === 'object' && reagent.batch_count?.$numberDecimal
            ? parseInt(reagent.batch_count.$numberDecimal)
            : reagent.batch_count || 0,
          expiring_soon_count: typeof reagent.expiring_soon_count === 'object' && reagent.expiring_soon_count?.$numberDecimal
            ? parseInt(reagent.expiring_soon_count.$numberDecimal)
            : reagent.expiring_soon_count || 0,
          expired_count: typeof reagent.expired_count === 'object' && reagent.expired_count?.$numberDecimal
            ? parseInt(reagent.expired_count.$numberDecimal)
            : reagent.expired_count || 0,
          expiring_soon_quantity: typeof reagent.expiring_soon_quantity === 'object' && reagent.expiring_soon_quantity?.$numberDecimal
            ? parseFloat(reagent.expiring_soon_quantity.$numberDecimal)
            : reagent.expiring_soon_quantity || 0,
          expired_quantity: typeof reagent.expired_quantity === 'object' && reagent.expired_quantity?.$numberDecimal
            ? parseFloat(reagent.expired_quantity.$numberDecimal)
            : reagent.expired_quantity || 0
        }));
        setReagentList(processedReagents);
      } else {
        setReagentList([]);
      }
    } catch (error: any) {
      console.error('Error loading reagents:', error);
      toast.error('Failed to load reagents');
      setReagentList([]);
    } finally {
      setLoading(false);
    }
  };

  // Export function
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      let exportData;
      
      if (activeTab === 'usage') {
        exportData = filteredUsageHistory.map(usage => ({
          'Reagent Name': usage.reagent_name,
          'Quantity Used': usage.quantity_used,
          'Used By': usage.used_by,
          'Role': usage.role,
          'Used At': new Date(usage.used_at).toLocaleDateString(),
          'Instrument': usage.instrument_name || 'N/A',
          'Used For': usage.used_for || 'N/A',
          'Procedure': usage.procedure || 'N/A',
          'Notes': usage.notes || 'N/A'
        }));
      } else {
        exportData = filteredReagentList.map(reagent => ({
          'Reagent Name': reagent.reagent_name,
          'Catalog Number': reagent.catalog_number || 'N/A',
          'Manufacturer': reagent.manufacturer || 'N/A',
          'CAS Number': reagent.cas_number || 'N/A',
          'Available Quantity': reagent.quantity_available,
          'Unit': reagent.unit,
          'Description': reagent.description || 'N/A'
        }));
      }
      
      const result = exportReagentData(exportData, format);
      if (result.success) {
        toast.success(`${activeTab} data exported to ${format.toUpperCase()} successfully!`);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      toast.error(`Failed to export ${activeTab} data to ${format.toUpperCase()}`);
      console.error('Export error:', error);
    }
  };

  // Filter functions
  const filteredUsageHistory = Array.isArray(usageHistory) ? usageHistory.filter(usage => {
    const matchSearch = searchTerm === '' || 
      usage.reagent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.used_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usage.used_for && usage.used_for.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usage.procedure && usage.procedure.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usage.notes && usage.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchDate = dateFilter === '' || usage.used_at?.split('T')[0] === dateFilter;
    
    const matchReagentName = reagentNameFilter === '' || usage.reagent_name === reagentNameFilter;
    
    const matchInstrumentName = instrumentFilter === '' || usage.instrument_name === instrumentFilter || usage.instrument_id === instrumentFilter;
    
    return matchSearch && matchDate && matchReagentName && matchInstrumentName;
  }) : [];

  const filteredReagentList = Array.isArray(reagentList) ? reagentList.filter(reagent => {
    const matchSearch = searchTerm === '' ||
      reagent.reagent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.catalog_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.cas_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reagent.description && reagent.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchReagentName = reagentNameFilter === '' || reagent.reagent_name === reagentNameFilter;
    
    return matchSearch && matchReagentName;
  }) : [];

  // Calculate statistics
  const usageStats = {
    total: Array.isArray(usageHistory) ? usageHistory.length : 0,
    used: Array.isArray(usageHistory) ? usageHistory.length : 0,
    thisMonth: Array.isArray(usageHistory) ? usageHistory.filter(u => new Date(u.used_at).getMonth() === new Date().getMonth()).length : 0,
    thisWeek: Array.isArray(usageHistory) ? usageHistory.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.used_at) >= weekAgo;
    }).length : 0,
  };

  const reagentStats = {
    total: Array.isArray(reagentList) ? reagentList.length : 0,
    available: Array.isArray(reagentList) ? reagentList.filter(r => r.quantity_available > 0).length : 0,
    lowStock: Array.isArray(reagentList) ? reagentList.filter(r => r.quantity_available > 0 && r.quantity_available < 100).length : 0,
    outOfStock: Array.isArray(reagentList) ? reagentList.filter(r => r.quantity_available === 0).length : 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Reagent Management
            </h1>
            <p className={`text-sm sm:text-base mt-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              View reagent usage records and reagents inventory (Read-only for Nurses)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowStats(!showStats)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{showStats ? 'Hide' : 'Show'} Stats</span>
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(activeTab === 'usage' ? [
            {
              title: 'Total Usage Records',
              value: usageStats.total.toLocaleString(),
              icon: Activity,
              color: 'purple',
              change: '+12% from last month'
            },
            {
              title: 'Used This Month',
              value: usageStats.thisMonth.toLocaleString(),
              icon: TrendingUp,
              color: 'blue',
              change: '+8% from last month'
            },
            {
              title: 'Used This Week',
              value: usageStats.thisWeek.toLocaleString(),
              icon: Clock,
              color: 'green',
              change: '+15% from last week'
            },
            {
              title: 'Active Usage',
              value: usageStats.used.toLocaleString(),
              icon: BarChart3,
              color: 'orange',
              change: 'All records active'
            }
          ] : [
            {
              title: 'Total Reagents',
              value: reagentStats.total.toLocaleString(),
              icon: Beaker,
              color: 'purple',
              change: 'All reagents listed'
            },
            {
              title: 'Available',
              value: reagentStats.available.toLocaleString(),
              icon: CheckCircle,
              color: 'green',
              change: 'In stock reagents'
            },
            {
              title: 'Low Stock',
              value: reagentStats.lowStock.toLocaleString(),
              icon: AlertTriangle,
              color: 'orange',
              change: '< 100 units remaining'
            },
            {
              title: 'Out of Stock',
              value: reagentStats.outOfStock.toLocaleString(),
              icon: Package,
              color: 'red',
              change: 'Need restocking'
            }
          ]).map((stat, index) => (
            <div
              key={index}
              className={`rounded-lg sm:rounded-xl p-4 sm:p-6 border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
              <p className={`text-xs mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className={`rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('usage')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-300 ${
                activeTab === 'usage'
                  ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow-sm')
                  : (isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <Activity className="inline-block h-4 w-4 mr-2" />
              Usage History
            </button>
            <button
              onClick={() => setActiveTab('reagents')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-300 ${
                activeTab === 'reagents'
                  ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow-sm')
                  : (isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <Beaker className="inline-block h-4 w-4 mr-2" />
              Reagents
            </button>
          </div>
        </div>
      </div>

      {/* Usage Table */}
      {activeTab === 'usage' && (
      <div className={`rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={activeTab === 'usage' ? "Search reagents, users, procedures, or notes..." : "Search reagent name, catalog number, manufacturer..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            {activeTab === 'usage' && (
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <select
              value={reagentNameFilter}
              onChange={(e) => setReagentNameFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Reagents</option>
              {reagentList.map(reagent => (
                <option key={reagent._id} value={reagent.reagent_name}>
                  {reagent.reagent_name}
                </option>
              ))}
            </select>
            
            {activeTab === 'usage' && (
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Instruments</option>
              {instrumentList.map(instrument => (
                <option key={instrument.instrument_id} value={instrument.instrument_id}>
                  {instrument.name}
                </option>
              ))}
            </select>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsageHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>
                No usage records found
              </p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Reagent Information
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Usage Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    User Information
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Purpose & Test ID
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredUsageHistory.map((usage) => (
                  <tr key={usage._id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {usage.reagent_name}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Used: {usage.quantity_used}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-purple-500 mr-2" />
                        <div>
                          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {usage.instrument_name || 'N/A'}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(usage.used_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {usage.used_by.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {usage.used_by}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {usage.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {usage.used_for || usage.procedure ? (
                          <div className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-2 rounded-lg border border-blue-200">
                            <div className="font-semibold">{usage.used_for || usage.procedure}</div>
                            {usage.procedure && usage.used_for && usage.procedure !== usage.used_for && (
                              <div className="text-xs text-blue-600 mt-1">
                                Procedure: {usage.procedure}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                            General Laboratory Use
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(usage)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {/* Reagents Table */}
      {activeTab === 'reagents' && (
      <div className={`rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        {/* Search and Filters for Reagents */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reagent name, catalog number, manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <select
              value={reagentNameFilter}
              onChange={(e) => setReagentNameFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Reagents</option>
              {reagentList.map(reagent => (
                <option key={reagent._id} value={reagent.reagent_name}>
                  {reagent.reagent_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reagents Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredReagentList.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : ''}`}>
                No reagents found
              </p>
            </div>
          ) : (
            <div className={`overflow-hidden shadow-sm border rounded-xl transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-300 ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-indigo-900/30 to-indigo-800/30' 
                      : 'bg-gradient-to-r from-indigo-50 to-indigo-100'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4" />
                          Reagent Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Inventory Details
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Manufacturer
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Status
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  }`}>
                    {filteredReagentList.map((reagent) => (
                      <tr key={reagent._id} className={`transition-colors duration-300 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {reagent.reagent_name}
                            </div>
                            {reagent.catalog_number && (
                              <div className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Cat#: {reagent.catalog_number}
                              </div>
                            )}
                            {reagent.cas_number && (
                              <div className={`text-xs transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                CAS: {reagent.cas_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {reagent.quantity_available} {reagent.unit}
                            </div>
                            <div className={`text-xs transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Available
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {reagent.manufacturer || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 ${
                            reagent.quantity_available > 10
                              ? isDarkMode 
                                ? 'bg-green-900/50 text-green-300 border-green-700' 
                                : 'bg-green-100 text-green-800 border-green-200'
                              : reagent.quantity_available > 0
                                ? isDarkMode 
                                  ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : isDarkMode 
                                  ? 'bg-red-900/50 text-red-300 border-red-700' 
                                  : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {reagent.quantity_available > 10 ? 'In Stock' : reagent.quantity_available > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleView(reagent)}
                              className={`p-2 text-blue-600 hover:text-blue-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
                              }`}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
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
        </div>
      </div>
      )}

      {/* View Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {'quantity_used' in selectedItem ? 'Usage Details' : 'Reagent Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {'quantity_used' in selectedItem ? (
                // Usage details
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Reagent Name
                    </label>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedItem.reagent_name}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Quantity Used
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedItem.quantity_used}
                      </p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Used By
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedItem.used_by}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Role
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedItem.role}
                      </p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Used At
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(selectedItem.used_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedItem.instrument_name && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Instrument
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedItem.instrument_name}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      <span className="flex items-center gap-2">
                        🧪 Usage Information
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Used For:
                        </p>
                        <p className={`text-base font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {selectedItem.used_for || 'General Use'}
                        </p>
                      </div>
                      {selectedItem.procedure && selectedItem.procedure !== selectedItem.used_for && (
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Procedure:
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedItem.procedure}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedItem.notes && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Notes
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedItem.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Reagent details with batch information
                <div className="space-y-6">
                  {/* Batches section */}
                  {selectedReagentBatches.length > 0 && (
                    <div className={`rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500' 
                        : 'bg-white border-gray-100'
                    }`}>
                      <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Package className="h-5 w-5" />
                        Batches & Expiration Dates ({selectedReagentBatches.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedReagentBatches.map((batch, index) => {
                          const expirationDate = new Date(batch.expiration_date);
                          const today = new Date();
                          const daysUntilExpiry = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          const isExpired = daysUntilExpiry < 0;
                          const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
                          
                          return (
                            <div key={index} className={`p-4 rounded-lg border transition-all duration-300 ${
                              isExpired
                                ? isDarkMode 
                                  ? 'bg-red-900/20 border-red-700' 
                                  : 'bg-red-50 border-red-200'
                                : isExpiringSoon
                                  ? isDarkMode 
                                    ? 'bg-orange-900/20 border-orange-700' 
                                    : 'bg-orange-50 border-orange-200'
                                  : isDarkMode 
                                    ? 'bg-gray-700 border-gray-600' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={`text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Lot Number</label>
                                    <p className={`text-sm font-semibold transition-colors duration-300 ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{batch.lot_number}</p>
                                  </div>
                                  <div>
                                    <label className={`text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Quantity</label>
                                    <p className={`text-sm font-semibold transition-colors duration-300 ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{batch.quantity} {selectedItem.unit}</p>
                                  </div>
                                  <div>
                                    <label className={`text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Expiration Date</label>
                                    <p className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-300 ${
                                      isExpired
                                        ? 'text-red-600'
                                        : isExpiringSoon
                                          ? 'text-orange-600'
                                          : isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      <Calendar className="h-4 w-4" />
                                      {expirationDate.toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <label className={`text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Received Date</label>
                                    <p className={`text-sm transition-colors duration-300 ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                      {new Date(batch.received_date).toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  {batch.storage_location && (
                                    <div className="col-span-2">
                                      <label className={`text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>Storage Location</label>
                                      <p className={`text-sm transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>{batch.storage_location}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  {isExpired ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode 
                                        ? 'bg-red-900/50 text-red-300' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      <XCircle className="h-3 w-3" />
                                      Expired
                                    </span>
                                  ) : isExpiringSoon ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode 
                                        ? 'bg-orange-900/50 text-orange-300' 
                                        : 'bg-orange-100 text-orange-800'
                                    }`}>
                                      <AlertTriangle className="h-3 w-3" />
                                      {daysUntilExpiry}d left
                                    </span>
                                  ) : (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                      isDarkMode 
                                        ? 'bg-green-900/50 text-green-300' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      <CheckCircle className="h-3 w-3" />
                                      Good
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Record Details */}
                  <div className={`rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Record Details</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedItem && Object.entries(selectedItem)
                        .filter(([key]) => {
                          // Hide _id and _raw fields
                          if (key.includes('_id') || key.includes('_raw')) return false;
                          return true;
                        })
                        .map(([key, value]) => {
                          // Format date fields
                          let displayValue = value?.toString() || 'N/A';
                          const dateFields = ['date', 'Date', 'createdAt', 'updatedAt', 'created_at', 'updated_at'];
                          const isDateField = dateFields.some(field => key.includes(field));
                          
                          if (isDateField && value) {
                            try {
                              const date = new Date(value as string);
                              if (!isNaN(date.getTime())) {
                                displayValue = date.toLocaleDateString('en-GB', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                });
                              }
                            } catch (e) {
                              // Keep original value if parsing fails
                            }
                          }
                          
                          return (
                            <div key={key} className={`p-4 rounded-lg border transition-colors duration-300 ${
                              isDarkMode 
                                ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500' 
                                : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>{key.replace(/([A-Z_])/g, ' $1').trim()}</label>
                              <div className={`text-sm font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{displayValue}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReagentHistory;