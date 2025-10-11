import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  RefreshCw, 
  Download, 
  Eye, 
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Activity,
  Grid3X3,
  List,
  X
} from 'lucide-react';
import { exportEventLogData } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';

// Types
interface EventLog {
  id: string;
  eventId: string; // E_00001, E_00002, etc.
  action: 'Create' | 'Update' | 'Delete' | 'Modify' | 'Add' | 'Complete' | 'Activate' | 'Lock';
  eventLogMessage: string;
  operator: string;
  date: string;
  timestamp: string;
  status: 'Success' | 'Error' | 'Info' | 'Warning';
  beforeChange?: string; // Nội dung trước khi thay đổi
  afterChange?: string;  // Nội dung sau khi thay đổi
  category: 'Test Order' | 'Test Result' | 'Comment' | 'Review' | 'Instrument' | 'User' | 'System';
}

interface FilterState {
  search: string;
  action: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

const EventLog: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    action: 'All Actions',
    category: 'All Categories',
    dateFrom: '',
    dateTo: '',
    status: 'All Status'
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  
  // Additional states for modern UI
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showStats, setShowStats] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Mock data based on the 10 event IDs provided
  const mockEventLogs: EventLog[] = [
    {
      id: '1',
      eventId: 'E_00001',
      action: 'Create',
      eventLogMessage: 'Event message used when a new test order is created.',
      operator: 'Dr. Huy Nguyen',
      date: '2024-01-15',
      timestamp: '2024-01-15 14:32:15',
      status: 'Success',
      category: 'Test Order',
      beforeChange: 'N/A - New record',
      afterChange: 'Test Order #TO-2024-001 created for Patient ID: P001'
    },
    {
      id: '2',
      eventId: 'E_00002',
      action: 'Update',
      eventLogMessage: 'Event message used when a test order is updated.',
      operator: 'Dr. Sarah Chen',
      date: '2024-01-15',
      timestamp: '2024-01-15 13:45:22',
      status: 'Info',
      category: 'Test Order',
      beforeChange: 'Priority: Normal, Status: Pending',
      afterChange: 'Priority: Urgent, Status: In Progress'
    },
    {
      id: '3',
      eventId: 'E_00003',
      action: 'Delete',
      eventLogMessage: 'Event message used when a test order is deleted.',
      operator: 'Dr. Michael Johnson',
      date: '2024-01-15',
      timestamp: '2024-01-15 12:18:30',
      status: 'Warning',
      category: 'Test Order',
      beforeChange: 'Test Order #TO-2024-002 - Blood Test Panel',
      afterChange: 'N/A - Record deleted'
    },
    {
      id: '4',
      eventId: 'E_00004',
      action: 'Modify',
      eventLogMessage: 'Event message used when a test result is modified.',
      operator: 'Lab Tech. Anna Wilson',
      date: '2024-01-15',
      timestamp: '2024-01-15 11:22:45',
      status: 'Success',
      category: 'Test Result',
      beforeChange: 'Glucose: 95 mg/dL, Cholesterol: 180 mg/dL',
      afterChange: 'Glucose: 98 mg/dL, Cholesterol: 185 mg/dL'
    },
    {
      id: '5',
      eventId: 'E_00005',
      action: 'Add',
      eventLogMessage: 'Event message used when new comment of test result is added.',
      operator: 'Dr. Emily Rodriguez',
      date: '2024-01-15',
      timestamp: '2024-01-15 10:15:12',
      status: 'Info',
      category: 'Comment',
      beforeChange: 'No comments',
      afterChange: 'Comment added: "Patient should follow up in 2 weeks for retest"'
    },
    {
      id: '6',
      eventId: 'E_00006',
      action: 'Modify',
      eventLogMessage: 'Event message used when comment of test result is modified.',
      operator: 'Dr. Emily Rodriguez',
      date: '2024-01-15',
      timestamp: '2024-01-15 09:30:18',
      status: 'Info',
      category: 'Comment',
      beforeChange: 'Comment: "Patient should follow up in 2 weeks"',
      afterChange: 'Comment: "Patient should follow up in 1 week due to elevated levels"'
    },
    {
      id: '7',
      eventId: 'E_00007',
      action: 'Delete',
      eventLogMessage: 'Event message used when comment of test result is deleted.',
      operator: 'Dr. Robert Kim',
      date: '2024-01-14',
      timestamp: '2024-01-14 16:45:33',
      status: 'Warning',
      category: 'Comment',
      beforeChange: 'Comment: "Previous test results were inconclusive"',
      afterChange: 'N/A - Comment deleted'
    },
    {
      id: '8',
      eventId: 'E_00008',
      action: 'Complete',
      eventLogMessage: 'Event message used when completed review.',
      operator: 'Dr. Lisa Thompson',
      date: '2024-01-14',
      timestamp: '2024-01-14 15:20:41',
      status: 'Success',
      category: 'Review',
      beforeChange: 'Review Status: Pending',
      afterChange: 'Review Status: Completed by Dr. Lisa Thompson'
    },
    {
      id: '9',
      eventId: 'E_00009',
      action: 'Activate',
      eventLogMessage: 'Event message used when activate or deactivate instrument.',
      operator: 'Lab Manager John Davis',
      date: '2024-01-14',
      timestamp: '2024-01-14 14:10:55',
      status: 'Success',
      category: 'Instrument',
      beforeChange: 'Instrument XR-2000: Status - Inactive',
      afterChange: 'Instrument XR-2000: Status - Active'
    },
    {
      id: '10',
      eventId: 'E_00010',
      action: 'Lock',
      eventLogMessage: 'Event message used when lock or unlock a user.',
      operator: 'System Administrator',
      date: '2024-01-14',
      timestamp: '2024-01-14 13:05:27',
      status: 'Warning',
      category: 'User',
      beforeChange: 'User account: john.doe@lab.com - Status: Active',
      afterChange: 'User account: john.doe@lab.com - Status: Locked'
    }
  ];

  // Load event logs
  useEffect(() => {
    loadEventLogs();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExportDropdown]);

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
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const loadEventLogs = async () => {
    try {
      setLoading(true);
      // Uncomment this when API is ready
      // const response = await dashboardAPI.getEventLogs();
      // setEventLogs(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setEventLogs(mockEventLogs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading event logs:', error);
      // Fallback to mock data
      setEventLogs(mockEventLogs);
      setLoading(false);
    }
  };

  // Filter event logs
  const filteredLogs = eventLogs.filter(log => {
    const matchesSearch = log.eventLogMessage.toLowerCase().includes(filters.search.toLowerCase()) ||
                         log.operator.toLowerCase().includes(filters.search.toLowerCase()) ||
                         log.eventId.toLowerCase().includes(filters.search.toLowerCase());
    const matchesAction = filters.action === 'All Actions' || log.action === filters.action;
    const matchesCategory = filters.category === 'All Categories' || log.category === filters.category;
    const matchesStatus = filters.status === 'All Status' || log.status === filters.status;
    
    // Date filtering logic
    let matchesDate = true;
    if (filters.dateFrom && filters.dateTo) {
      const logDate = new Date(log.date);
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      matchesDate = logDate >= fromDate && logDate <= toDate;
    } else if (filters.dateFrom) {
      const logDate = new Date(log.date);
      const fromDate = new Date(filters.dateFrom);
      matchesDate = logDate >= fromDate;
    } else if (filters.dateTo) {
      const logDate = new Date(log.date);
      const toDate = new Date(filters.dateTo);
      matchesDate = logDate <= toDate;
    }
    
    return matchesSearch && matchesAction && matchesCategory && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Export functions
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const result = exportEventLogData(filteredLogs, format)
      if (result.success) {
        toast.success(`Event log exported to ${format.toUpperCase()} successfully!`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(`Failed to export event log to ${format.toUpperCase()}`)
      console.error(`Error exporting to ${format}:`, error);
    }
  };

  // Statistics calculations
  const stats = {
    total: eventLogs.length,
    success: eventLogs.filter(e => e.status === 'Success').length,
    error: eventLogs.filter(e => e.status === 'Error').length,
    warning: eventLogs.filter(e => e.status === 'Warning').length,
    info: eventLogs.filter(e => e.status === 'Info').length,
    categories: [...new Set(eventLogs.map(e => e.category))].length,
    actions: [...new Set(eventLogs.map(e => e.action))].length
  };



  // Enhanced status badge function
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1";
    switch (status) {
      case 'Success':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3" />
            Success
          </span>
        );
      case 'Error':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="h-3 w-3" />
            Error
          </span>
        );
      case 'Warning':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case 'Info':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <AlertCircle className="h-3 w-3" />
            Info
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'Create':
      case 'Add':
        return 'text-green-800 bg-green-100';
      case 'Update':
      case 'Modify':
        return 'text-blue-800 bg-blue-100';
      case 'Delete':
        return 'text-red-800 bg-red-100';
      case 'Complete':
        return 'text-purple-800 bg-purple-100';
      case 'Activate':
        return 'text-emerald-800 bg-emerald-100';
      case 'Lock':
        return 'text-orange-800 bg-orange-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">System Event Logs</h1>
              <p className="text-slate-200 text-lg">Monitor system activities and audit trail</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-slate-300">Total Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left side - Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search event ID, message or operator..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                showStats 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </button>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid
              </button>
            </div>

            <button
              onClick={loadEventLogs}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            
            <div className="relative export-dropdown">
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
                <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showExportDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px] animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      handleExport('excel');
                      setShowExportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors duration-200 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      handleExport('pdf');
                      setShowExportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors duration-200 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All Actions">All Actions</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="Modify">Modify</option>
              <option value="Add">Add</option>
              <option value="Complete">Complete</option>
              <option value="Activate">Activate</option>
              <option value="Lock">Lock</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All Categories">All Categories</option>
              <option value="Test Order">Test Order</option>
              <option value="Test Result">Test Result</option>
              <option value="Comment">Comment</option>
              <option value="Review">Review</option>
              <option value="Instrument">Instrument</option>
              <option value="User">User</option>
              <option value="System">System</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All Status">All Status</option>
              <option value="Success">Success</option>
              <option value="Error">Error</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading event logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No event logs found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or refresh the page.</p>
            <button
              onClick={loadEventLogs}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <>
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLogs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-blue-600 font-semibold">{log.eventId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.operator}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{log.timestamp}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of{' '}
                      <span className="font-medium">{filteredLogs.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Grid View */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedLogs.map((log, index) => (
                  <div 
                    key={log.id} 
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-mono text-blue-600 font-semibold">{log.eventId}</div>
                          <div className="text-xs text-gray-500">{log.category}</div>
                        </div>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>

                    {/* Action */}
                    <div className="mb-4">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>

                    {/* Operator and Timestamp */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Operator:</span>
                        <div className="text-sm text-gray-900 truncate">{log.operator}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Time:</span>
                        <div className="text-sm text-gray-900 font-mono">{log.timestamp}</div>
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{log.eventLogMessage}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for Grid */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
             style={{
               backdropFilter: 'blur(8px)',
               WebkitBackdropFilter: 'blur(8px)',
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               transition: 'all 300ms ease-out'
             }}>
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 w-full max-w-4xl transform max-h-[90vh] overflow-y-auto"
               style={{
                 animation: 'modalSlideIn 0.3s ease-out',
                 transformOrigin: 'center',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
               }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Event Log Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Detailed information about the event log entry</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 hover:shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event ID</label>
                    <div className="text-lg font-mono font-bold text-blue-600">
                      {selectedLog?.eventId || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Action</label>
                    <div className="flex items-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getActionColor(selectedLog?.action || 'Create')}`}>
                        {selectedLog?.action || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="text-lg font-medium text-gray-800">
                      {selectedLog?.category || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                    <div className="flex items-center">
                      {getStatusBadge(selectedLog?.status || 'Info')}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Operator</label>
                    <div className="text-lg font-medium text-gray-800">
                      {selectedLog?.operator || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                    <div className="text-lg font-medium text-gray-800">
                      {selectedLog?.date || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timestamp</label>
                    <div className="text-sm font-mono text-gray-800 break-all">
                      {selectedLog?.timestamp || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Message */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Event Message</label>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-md">
                  <p className="text-sm text-gray-900 break-words leading-relaxed">
                    {selectedLog?.eventLogMessage || 'No message available'}
                  </p>
                </div>
              </div>

              {/* Before/After Changes */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm"></span>
                      Before Change
                    </span>
                  </label>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 px-4 py-3 rounded-md min-h-[100px]">
                    <p className="text-sm text-red-900 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedLog?.beforeChange || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></span>
                      After Change
                    </span>
                  </label>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 px-4 py-3 rounded-md min-h-[100px]">
                    <p className="text-sm text-green-900 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedLog?.afterChange || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-4 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
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

export default EventLog;
