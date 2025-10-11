import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Calendar, 
  User, 
  Search, 
  Filter,
  Download,
  Eye,
  Clock,
  Building2,
  Beaker,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { exportReagentData } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';

interface ReagentSupply {
  id: string;
  reagentName: string;
  catalogNumber: string;
  manufacturer: string;
  casNumber?: string;
  vendorName: string;
  vendorId: string;
  poNumber: string;
  orderDate: string;
  receiptDate: string;
  quantityReceived: number;
  unitOfMeasure: string;
  lotNumber: string;
  expirationDate: string;
  receivedBy: string;
  receiptDateTime: string;
  storageLocation: string;
  status: 'Received' | 'Partial Shipment' | 'Returned';
}

interface ReagentVendor {
  _id: string;
  vendor_id: string;
  vendor_name: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
  created_at: string;
}

interface ReagentUsage {
  id: string;
  reagentName: string;
  catalogNumber: string;
  lotNumber: string;
  quantityUsed: number;
  unitOfMeasure: string;
  usageDate: string;
  usageTime: string;
  usedBy: string;
  purpose: string;
  testId?: string;
  remainingQuantity: number;
  status: 'Used' | 'Consumed' | 'Expired';
}

const ReagentHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'supply' | 'usage' | 'vendors'>('supply');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  // Add CSS animations for modal (matching EventLog styles)
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
  
  // CRUD States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
  const [selectedItem, setSelectedItem] = useState<ReagentSupply | ReagentUsage | ReagentVendor | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  
  // Stats for dashboard view
  const [showStats, setShowStats] = useState(true);

  // Mock data for Reagent Supply History
  const supplyHistory: ReagentSupply[] = [
    {
      id: 'SUP001',
      reagentName: 'Glucose Test Solution',
      catalogNumber: 'GTS-2024-001',
      manufacturer: 'BioMed Labs',
      casNumber: '50-99-7',
      vendorName: 'MedSupply Corp',
      vendorId: 'VEN001',
      poNumber: 'PO-2024-0156',
      orderDate: '2024-10-01',
      receiptDate: '2024-10-05',
      quantityReceived: 50,
      unitOfMeasure: 'bottles',
      lotNumber: 'LOT-24-10-001',
      expirationDate: '2025-10-05',
      receivedBy: 'Dr. Sarah Johnson',
      receiptDateTime: '2024-10-05 09:30:00',
      storageLocation: 'Cold Storage A-1',
      status: 'Received'
    },
    {
      id: 'SUP002',
      reagentName: 'Blood Count Reagent',
      catalogNumber: 'BCR-2024-002',
      manufacturer: 'LabTech Solutions',
      casNumber: '7732-18-5',
      vendorName: 'Scientific Supplies Ltd',
      vendorId: 'VEN002',
      poNumber: 'PO-2024-0157',
      orderDate: '2024-09-28',
      receiptDate: '2024-10-03',
      quantityReceived: 25,
      unitOfMeasure: 'vials',
      lotNumber: 'LOT-24-09-028',
      expirationDate: '2025-09-28',
      receivedBy: 'Dr. Michael Chen',
      receiptDateTime: '2024-10-03 14:15:00',
      storageLocation: 'Room Temperature B-2',
      status: 'Partial Shipment'
    }
  ];

  // Mock data for Reagent Usage History
  const usageHistory: ReagentUsage[] = [
    {
      id: 'USE001',
      reagentName: 'Glucose Test Solution',
      catalogNumber: 'GTS-2024-001',
      lotNumber: 'LOT-24-10-001',
      quantityUsed: 5,
      unitOfMeasure: 'ml',
      usageDate: '2024-10-08',
      usageTime: '10:30:00',
      usedBy: 'Dr. Sarah Johnson',
      purpose: 'Blood Glucose Test - Patient ID: PT001',
      testId: 'TST-2024-1001',
      remainingQuantity: 45,
      status: 'Used'
    },
    {
      id: 'USE002',
      reagentName: 'Blood Count Reagent',
      catalogNumber: 'BCR-2024-002',
      lotNumber: 'LOT-24-09-028',
      quantityUsed: 3,
      unitOfMeasure: 'ml',
      usageDate: '2024-10-07',
      usageTime: '15:45:00',
      usedBy: 'Dr. Michael Chen',
      purpose: 'Complete Blood Count - Patient ID: PT002',
      testId: 'TST-2024-1002',
      remainingQuantity: 22,
      status: 'Used'
    }
  ];

  // Mock data for Reagent Vendors
  const vendorList: ReagentVendor[] = [
    {
      _id: "6702f1010000000000010001",
      vendor_id: "VND-1001",
      vendor_name: "MedSupply Corp",
      contact_info: {
        email: "contact@medsupplycorp.com",
        phone: "+1-202-555-0101",
        address: "45 Health Park Avenue, New York, USA"
      },
      created_at: "2025-10-09T10:00:00Z"
    },
    {
      _id: "6702f1010000000000010002",
      vendor_id: "VND-1002",
      vendor_name: "Scientific Supplies Ltd",
      contact_info: {
        email: "sales@scientificsupplies.com",
        phone: "+44-20-7946-1234",
        address: "12 Innovation Street, London, UK"
      },
      created_at: "2025-10-09T10:00:00Z"
    }
  ];

  // CRUD Functions
  const handleAdd = () => {
    setModalType('add');
    setSelectedItem(null);
    setEditFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: ReagentSupply | ReagentUsage | ReagentVendor) => {
    setModalType('edit');
    setSelectedItem(item);
    setEditFormData({...item});
    setShowModal(true);
  };

  const handleView = (item: ReagentSupply | ReagentUsage | ReagentVendor) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: ReagentSupply | ReagentUsage | ReagentVendor) => {
    setModalType('delete');
    setSelectedItem(item);
    setShowModal(true);
  };

  // Export functions
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      let dataToExport: any[] = [];
      let exportData: any[] = [];
      
      if (activeTab === 'supply') {
        dataToExport = filteredSupplyHistory;
        exportData = dataToExport.map(item => ({
          id: item.id,
          lotNumber: item.lotNumber,
          supplier: item.vendorName,
          date: item.receiptDate,
          quantity: item.quantityReceived,
          type: activeTab,
          status: item.status
        }));
      } else if (activeTab === 'usage') {
        dataToExport = filteredUsageHistory;
        exportData = dataToExport.map(item => ({
          id: item.id,
          lotNumber: item.lotNumber,
          supplier: '',
          date: item.usageDate,
          quantity: item.quantityUsed,
          type: activeTab,
          status: item.status
        }));
      } else if (activeTab === 'vendors') {
        dataToExport = filteredVendorList;
        exportData = dataToExport.map(item => ({
          id: item.vendor_id,
          name: item.vendor_name,
          email: item.contact_info.email,
          phone: item.contact_info.phone,
          address: item.contact_info.address,
          type: activeTab,
          created: item.created_at
        }));
      }
      
      const result = exportReagentData(exportData, format);
      if (result.success) {
        toast.success(`${activeTab === 'vendors' ? 'Vendor' : 'Reagent'} data exported to ${format.toUpperCase()} successfully!`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to export ${activeTab === 'vendors' ? 'vendor' : 'reagent'} data to ${format.toUpperCase()}`);
      console.error('Export error:', error);
    }
  };

  // Filter functions
  const filteredSupplyHistory = supplyHistory.filter(supply => {
    const matchSearch = searchTerm === '' || 
      supply.reagentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.catalogNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDate = dateFilter === '' || supply.receiptDate === dateFilter;
    
    const matchVendor = vendorFilter === '' || supply.vendorName === vendorFilter;
    
    return matchSearch && matchDate && matchVendor;
  });

  const filteredUsageHistory = usageHistory.filter(usage => {
    const matchSearch = searchTerm === '' || 
      usage.reagentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.catalogNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.usedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDate = dateFilter === '' || usage.usageDate === dateFilter;
    
    return matchSearch && matchDate;
  });

  const filteredVendorList = vendorList.filter(vendor => {
    const matchSearch = searchTerm === '' || 
      vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_info.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_info.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
      case 'Used':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Partial Shipment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Returned':
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Consumed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
      case 'Used':
        return <CheckCircle className="h-4 w-4" />;
      case 'Partial Shipment':
        return <AlertCircle className="h-4 w-4" />;
      case 'Returned':
      case 'Expired':
        return <XCircle className="h-4 w-4" />;
      case 'Consumed':
        return <Activity className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const supplyStats = {
    total: supplyHistory.length,
    received: supplyHistory.filter(s => s.status === 'Received').length,
    partial: supplyHistory.filter(s => s.status === 'Partial Shipment').length,
    returned: supplyHistory.filter(s => s.status === 'Returned').length,
  };

  const usageStats = {
    total: usageHistory.length,
    used: usageHistory.filter(u => u.status === 'Used').length,
    consumed: usageHistory.filter(u => u.status === 'Consumed').length,
    expired: usageHistory.filter(u => u.status === 'Expired').length,
  };

  const vendorStats = {
    total: vendorList.length,
    active: vendorList.length, // All vendors are considered active for now
    newThisMonth: vendorList.filter(v => new Date(v.created_at).getMonth() === new Date().getMonth()).length,
    countries: [...new Set(vendorList.map(v => v.contact_info.address.split(', ').pop()))].length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Beaker className="h-8 w-8 text-white" />
              </div>
              Reagent Management System
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Track reagent supply, usage history, and vendor management for compliance and audit purposes</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <BarChart3 className="h-4 w-4" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md">
              <Plus className="h-4 w-4" />
              Add Record
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
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
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTab === 'supply' ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Supplies</p>
                    <p className="text-2xl font-bold text-gray-900">{supplyStats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Received</p>
                    <p className="text-2xl font-bold text-gray-900">{supplyStats.received}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Success rate: 85%</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Partial Shipments</p>
                    <p className="text-2xl font-bold text-gray-900">{supplyStats.partial}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Pending completion</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Returned</p>
                    <p className="text-2xl font-bold text-gray-900">{supplyStats.returned}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Quality issues</span>
                </div>
              </div>
            </>
          ) : activeTab === 'usage' ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Usage</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.total}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8% from last week</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Usage</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.used}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Currently in use</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consumed</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.consumed}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Fully utilized</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expired</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.expired}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Needs disposal</span>
                </div>
              </div>
            </>
          ) : (
            // Vendor Statistics
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                    <p className="text-2xl font-bold text-gray-900">{vendorStats.total}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Active partnerships</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                    <p className="text-2xl font-bold text-gray-900">{vendorStats.active}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Currently supplying</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{vendorStats.newThisMonth}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Recently added</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Countries</p>
                    <p className="text-2xl font-bold text-gray-900">{vendorStats.countries}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Global reach</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('supply')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'supply'
                  ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1">
                <div className={`p-1 rounded-full ${activeTab === 'supply' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  <Truck className="h-4 w-4" />
                </div>
                <span className="font-semibold">Supply History</span>
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === 'supply' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                  {supplyStats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'usage'
                  ? 'border-purple-500 text-purple-600 bg-purple-50 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1">
                <div className={`p-1 rounded-full ${activeTab === 'usage' ? 'bg-purple-200' : 'bg-gray-200'}`}>
                  <Package className="h-4 w-4" />
                </div>
                <span className="font-semibold">Usage History</span>
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === 'usage' ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
                  {usageStats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'vendors'
                  ? 'border-green-500 text-green-600 bg-green-50 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1">
                <div className={`p-1 rounded-full ${activeTab === 'vendors' ? 'bg-green-200' : 'bg-gray-200'}`}>
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-semibold">Vendors</span>
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === 'vendors' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                  {vendorStats.total}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Filters & Actions */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={activeTab === 'vendors' ? "Search vendors..." : "Search reagents..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
              {activeTab !== 'vendors' && (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  />
                </div>
              )}
              {activeTab === 'supply' && (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white shadow-sm"
                  >
                    <option value="">All Vendors</option>
                    <option value="MedSupply Corp">MedSupply Corp</option>
                    <option value="Scientific Supplies Ltd">Scientific Supplies Ltd</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </button>
              {(searchTerm || dateFilter || vendorFilter) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                    setVendorFilter('');
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
              <button 
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
              >
                <Plus className="h-4 w-4" />
                Add New {activeTab === 'supply' ? 'Supply' : activeTab === 'usage' ? 'Usage' : 'Vendor'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || dateFilter || vendorFilter) && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-700">
              Showing <span className="font-semibold">
                {activeTab === 'supply' ? filteredSupplyHistory.length : 
                 activeTab === 'usage' ? filteredUsageHistory.length : 
                 filteredVendorList.length}
              </span> of <span className="font-semibold">
                {activeTab === 'supply' ? supplyHistory.length : 
                 activeTab === 'usage' ? usageHistory.length : 
                 vendorList.length}
              </span> {activeTab === 'supply' ? 'supply' : activeTab === 'usage' ? 'usage' : 'vendor'} records
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {dateFilter && <span> for date {dateFilter}</span>}
              {vendorFilter && <span> from vendor "{vendorFilter}"</span>}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 bg-white">
          {activeTab === 'supply' ? (
            /* Supply History Table */
            <div className="overflow-hidden shadow-sm border border-gray-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4" />
                          Reagent Information
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Vendor Details
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Order Information
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Batch Information
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSupplyHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No supply records found</h3>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSupplyHistory.map((supply) => (
                      <tr key={supply.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900">{supply.reagentName}</div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">Cat: {supply.catalogNumber}</div>
                            <div className="text-xs text-blue-600 font-medium">Mfg: {supply.manufacturer}</div>
                            {supply.casNumber && (
                              <div className="text-xs text-gray-500">CAS: {supply.casNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {supply.vendorName}
                            </div>
                            <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">ID: {supply.vendorId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">PO: {supply.poNumber}</div>
                            <div className="text-xs text-gray-500">Ordered: {supply.orderDate}</div>
                            <div className="text-xs text-green-600 font-medium">Received: {supply.receiptDate}</div>
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                              {supply.quantityReceived} {supply.unitOfMeasure}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">Lot: {supply.lotNumber}</div>
                            <div className="text-xs text-orange-600">Exp: {supply.expirationDate}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {supply.receivedBy}
                            </div>
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{supply.storageLocation}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(supply.status)}
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(supply.status)}`}>
                              {supply.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleView(supply)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(supply)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(supply)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'usage' ? (
            /* Usage History Table */
            <div className="overflow-hidden shadow-sm border border-gray-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4" />
                          Reagent Information
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Usage Details
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          User Information
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Purpose & Test ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsageHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No usage records found</h3>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsageHistory.map((usage) => (
                      <tr key={usage.id} className="hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900">{usage.reagentName}</div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">Cat: {usage.catalogNumber}</div>
                            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded font-medium">Lot: {usage.lotNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                                Used: {usage.quantityUsed} {usage.unitOfMeasure}
                              </div>
                            </div>
                            <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                              Remaining: {usage.remainingQuantity} {usage.unitOfMeasure}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                              <Clock className="h-3 w-3" />
                              {usage.usageDate} at {usage.usageTime}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-purple-600" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{usage.usedBy}</div>
                              <div className="text-xs text-gray-500">Laboratory Staff</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-900 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                              {usage.purpose}
                            </div>
                            {usage.testId && (
                              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono font-medium">
                                Test ID: {usage.testId}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(usage.status)}
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(usage.status)}`}>
                              {usage.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleView(usage)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(usage)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(usage)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Vendor Table */
            <div className="overflow-hidden shadow-sm border border-gray-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-50 to-green-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Vendor Information
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact Details
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Registration Info
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVendorList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVendorList.map((vendor) => (
                      <tr key={vendor._id} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              {vendor.vendor_name}
                            </div>
                            <div className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded inline-block font-mono">
                              ID: {vendor.vendor_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {vendor.contact_info.email}
                            </div>
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              📞 {vendor.contact_info.phone}
                            </div>
                            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-start gap-1">
                              <span>📍</span>
                              <span>{vendor.contact_info.address}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              Created: {new Date(vendor.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-medium">
                              Active Vendor
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleView(vendor)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(vendor)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(vendor)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal for CRUD Operations */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
               style={{
                 backdropFilter: 'blur(8px)',
                 WebkitBackdropFilter: 'blur(8px)',
                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
                 transition: 'all 300ms ease-out'
               }}
               onClick={(e) => {
                 if (e.target === e.currentTarget) {
                   setShowModal(false);
                 }
               }}>
            <div className="bg-white rounded-xl p-8 w-full max-w-4xl transform max-h-[90vh] overflow-y-auto"
                 style={{
                   animation: 'modalSlideIn 0.3s ease-out',
                   transformOrigin: 'center',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                   border: '1px solid rgba(255, 255, 255, 0.1)'
                 }}
                 onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
                    {modalType === 'view' ? (
                      <Eye className="w-6 h-6 text-indigo-600" />
                    ) : modalType === 'edit' ? (
                      <Edit className="w-6 h-6 text-indigo-600" />
                    ) : modalType === 'add' ? (
                      <Plus className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">
                      {modalType} {activeTab === 'supply' ? 'Supply' : activeTab === 'usage' ? 'Usage' : 'Vendor'} Record
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {modalType === 'view' ? 'Detailed information about the record' :
                       modalType === 'edit' ? 'Modify the existing record' :
                       modalType === 'add' ? 'Create a new record' :
                       'Confirm deletion of this record'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 hover:shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="rounded-xl p-6 space-y-6"
                   style={{
                     background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                   }}>
                {modalType === 'delete' ? (
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Record</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Are you sure you want to delete this record? This action cannot be undone.
                    </p>
                  </div>
                ) : modalType === 'view' ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                         style={{
                           backdropFilter: 'blur(10px)',
                           WebkitBackdropFilter: 'blur(10px)',
                           background: 'rgba(255, 255, 255, 0.95)'
                         }}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Record Details</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {selectedItem && Object.entries(selectedItem).map(([key, value]) => (
                          <div key={key} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <div className="text-sm font-medium text-gray-900">{value?.toString() || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                         style={{
                           backdropFilter: 'blur(10px)',
                           WebkitBackdropFilter: 'blur(10px)',
                           background: 'rgba(255, 255, 255, 0.95)'
                         }}>
                      <h4 className="text-lg font-semibold text-green-900 mb-4">
                        {modalType === 'add' ? 'Add New Record' : 'Edit Record'}
                      </h4>
                      <p className="text-green-700 mb-6">
                        {modalType === 'add' ? 'Create a new' : 'Modify the existing'} {activeTab} record.
                      </p>
                      
                      {/* Form Fields */}
                      <form className="space-y-4">
                        {activeTab === 'supply' ? (
                          // Supply Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reagent Name</label>
                              <input
                                type="text"
                                value={editFormData.reagentName || ''}
                                onChange={(e) => setEditFormData({...editFormData, reagentName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter reagent name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Catalog Number</label>
                              <input
                                type="text"
                                value={editFormData.catalogNumber || ''}
                                onChange={(e) => setEditFormData({...editFormData, catalogNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter catalog number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                              <input
                                type="text"
                                value={editFormData.manufacturer || ''}
                                onChange={(e) => setEditFormData({...editFormData, manufacturer: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter manufacturer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CAS Number</label>
                              <input
                                type="text"
                                value={editFormData.casNumber || ''}
                                onChange={(e) => setEditFormData({...editFormData, casNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter CAS number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                              <input
                                type="text"
                                value={editFormData.vendorName || ''}
                                onChange={(e) => setEditFormData({...editFormData, vendorName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter vendor name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Lot Number</label>
                              <input
                                type="text"
                                value={editFormData.lotNumber || ''}
                                onChange={(e) => setEditFormData({...editFormData, lotNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter lot number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Received</label>
                              <input
                                type="number"
                                value={editFormData.quantityReceived || ''}
                                onChange={(e) => setEditFormData({...editFormData, quantityReceived: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter quantity"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
                              <input
                                type="text"
                                value={editFormData.unitOfMeasure || ''}
                                onChange={(e) => setEditFormData({...editFormData, unitOfMeasure: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter unit"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
                              <input
                                type="date"
                                value={editFormData.expirationDate || ''}
                                onChange={(e) => setEditFormData({...editFormData, expirationDate: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
                              <input
                                type="text"
                                value={editFormData.storageLocation || ''}
                                onChange={(e) => setEditFormData({...editFormData, storageLocation: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter storage location"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                              <select
                                value={editFormData.status || 'Received'}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="Received">Received</option>
                                <option value="Partial Shipment">Partial Shipment</option>
                                <option value="Returned">Returned</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Received By</label>
                              <input
                                type="text"
                                value={editFormData.receivedBy || ''}
                                onChange={(e) => setEditFormData({...editFormData, receivedBy: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter receiver name"
                              />
                            </div>
                          </div>
                        ) : activeTab === 'usage' ? (
                          // Usage Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reagent Name</label>
                              <input
                                type="text"
                                value={editFormData.reagentName || ''}
                                onChange={(e) => setEditFormData({...editFormData, reagentName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter reagent name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Catalog Number</label>
                              <input
                                type="text"
                                value={editFormData.catalogNumber || ''}
                                onChange={(e) => setEditFormData({...editFormData, catalogNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter catalog number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Lot Number</label>
                              <input
                                type="text"
                                value={editFormData.lotNumber || ''}
                                onChange={(e) => setEditFormData({...editFormData, lotNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter lot number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Used</label>
                              <input
                                type="number"
                                value={editFormData.quantityUsed || ''}
                                onChange={(e) => setEditFormData({...editFormData, quantityUsed: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter quantity used"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
                              <input
                                type="text"
                                value={editFormData.unitOfMeasure || ''}
                                onChange={(e) => setEditFormData({...editFormData, unitOfMeasure: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter unit"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Usage Date</label>
                              <input
                                type="date"
                                value={editFormData.usageDate || ''}
                                onChange={(e) => setEditFormData({...editFormData, usageDate: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Usage Time</label>
                              <input
                                type="time"
                                value={editFormData.usageTime || ''}
                                onChange={(e) => setEditFormData({...editFormData, usageTime: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Used By</label>
                              <input
                                type="text"
                                value={editFormData.usedBy || ''}
                                onChange={(e) => setEditFormData({...editFormData, usedBy: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter user name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Quantity</label>
                              <input
                                type="number"
                                value={editFormData.remainingQuantity || ''}
                                onChange={(e) => setEditFormData({...editFormData, remainingQuantity: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter remaining quantity"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Test ID</label>
                              <input
                                type="text"
                                value={editFormData.testId || ''}
                                onChange={(e) => setEditFormData({...editFormData, testId: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter test ID (optional)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                              <select
                                value={editFormData.status || 'Used'}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="Used">Used</option>
                                <option value="Consumed">Consumed</option>
                                <option value="Expired">Expired</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                              <textarea
                                value={editFormData.purpose || ''}
                                onChange={(e) => setEditFormData({...editFormData, purpose: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter purpose of usage"
                              />
                            </div>
                          </div>
                        ) : (
                          // Vendor Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor ID</label>
                              <input
                                type="text"
                                value={editFormData.vendor_id || ''}
                                onChange={(e) => setEditFormData({...editFormData, vendor_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter vendor ID"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                              <input
                                type="text"
                                value={editFormData.vendor_name || ''}
                                onChange={(e) => setEditFormData({...editFormData, vendor_name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter vendor name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={editFormData.contact_info?.email || ''}
                                onChange={(e) => setEditFormData({
                                  ...editFormData, 
                                  contact_info: {
                                    ...editFormData.contact_info,
                                    email: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter email address"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                              <input
                                type="text"
                                value={editFormData.contact_info?.phone || ''}
                                onChange={(e) => setEditFormData({
                                  ...editFormData, 
                                  contact_info: {
                                    ...editFormData.contact_info,
                                    phone: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter phone number"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                              <textarea
                                value={editFormData.contact_info?.address || ''}
                                onChange={(e) => setEditFormData({
                                  ...editFormData, 
                                  contact_info: {
                                    ...editFormData.contact_info,
                                    address: e.target.value
                                  }
                                })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter vendor address"
                              />
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-4 pt-6 mt-6 border-t border-gray-200"
                   style={{
                     background: 'rgba(249, 250, 251, 0.8)',
                     backdropFilter: 'blur(8px)',
                     WebkitBackdropFilter: 'blur(8px)'
                   }}>
                {modalType === 'delete' ? (
                  <>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle delete logic here
                        setShowModal(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md"
                    >
                      Delete
                    </button>
                  </>
                ) : modalType === 'view' ? (
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle save/update logic here
                        console.log('Saving data:', editFormData);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {modalType === 'add' ? 'Save' : 'Update'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReagentHistory;
