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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { exportEventLogData } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { eventLogAPI, type EventLogItem } from '../Axios/Axios';

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
  const { isDarkMode } = useGlobalTheme();
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
      
      // Call API to get doctor event logs
      const response = await eventLogAPI.getDoctorLogs();
      const apiLogs = response.data.data || [];
      
      // Transform API data to match EventLog interface
      const transformedLogs: EventLog[] = apiLogs.map((log: EventLogItem) => {
        // Determine status based on message or default to Info
        let status: 'Success' | 'Error' | 'Info' | 'Warning' = 'Info';
        const message = log.message.toLowerCase();
        if (message.includes('success') || message.includes('created') || message.includes('completed')) {
          status = 'Success';
        } else if (message.includes('error') || message.includes('failed')) {
          status = 'Error';
        } else if (message.includes('warning') || message.includes('deleted')) {
          status = 'Warning';
        }
        
        // Determine action from message
        let action: EventLog['action'] = 'Modify';
        if (message.includes('create')) action = 'Create';
        else if (message.includes('update')) action = 'Update';
        else if (message.includes('delete')) action = 'Delete';
        else if (message.includes('add')) action = 'Add';
        else if (message.includes('complete')) action = 'Complete';
        else if (message.includes('activate')) action = 'Activate';
        else if (message.includes('lock')) action = 'Lock';
        
        // Determine category from role or message
        let category: EventLog['category'] = 'System';
        if (log.role === 'doctor') category = 'Test Order';
        else if (message.includes('instrument')) category = 'Instrument';
        else if (message.includes('result')) category = 'Test Result';
        else if (message.includes('comment')) category = 'Comment';
        else if (message.includes('review')) category = 'Review';
        else if (message.includes('user')) category = 'User';
        
        // BE already returns VN time, so use it directly without conversion
        const createdAt = String(log.createdAt || '');
        const datePart = createdAt.split('T')[0] || '';
        const timePart = createdAt.split('T')[1]?.split('.')[0] || '';
        const formattedTimestamp = `${datePart.split('-').reverse().join('/')} ${timePart}`;
        
        return {
          id: log._id,
          eventId: log.event_id,
          action: action,
          eventLogMessage: log.message,
          operator: log.performedBy || 'Unknown User',
          date: datePart,
          timestamp: formattedTimestamp,
          status: status,
          category: category,
          beforeChange: 'N/A',
          afterChange: 'N/A'
        };
      });
      
      setEventLogs(transformedLogs);
      toast.success('Event logs loaded successfully');
    } catch (error: any) {
      console.error('Error loading event logs:', error);
      toast.error(error.response?.data?.message || 'Failed to load event logs');
      // Fallback to mock data on error
      setEventLogs(mockEventLogs);
    } finally {
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
    const baseClasses = "px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1 whitespace-nowrap";
    switch (status) {
      case 'Success':
        return (
          <span className={`${baseClasses} transition-colors duration-300 ${
            isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
          }`}>
            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Success</span>
          </span>
        );
      case 'Error':
        return (
          <span className={`${baseClasses} transition-colors duration-300 ${
            isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
          }`}>
            <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Error</span>
          </span>
        );
      case 'Warning':
        return (
          <span className={`${baseClasses} transition-colors duration-300 ${
            isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Warning</span>
          </span>
        );
      case 'Info':
        return (
          <span className={`${baseClasses} transition-colors duration-300 ${
            isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
          }`}>
            <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden xs:inline">Info</span>
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
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
        return isDarkMode ? 'text-green-300 bg-green-900/30' : 'text-green-800 bg-green-100';
      case 'Update':
      case 'Modify':
        return isDarkMode ? 'text-blue-300 bg-blue-900/30' : 'text-blue-800 bg-blue-100';
      case 'Delete':
        return isDarkMode ? 'text-red-300 bg-red-900/30' : 'text-red-800 bg-red-100';
      case 'Complete':
        return isDarkMode ? 'text-purple-300 bg-purple-900/30' : 'text-purple-800 bg-purple-100';
      case 'Activate':
        return isDarkMode ? 'text-emerald-300 bg-emerald-900/30' : 'text-emerald-800 bg-emerald-100';
      case 'Lock':
        return isDarkMode ? 'text-orange-300 bg-orange-900/30' : 'text-orange-800 bg-orange-100';
      default:
        return isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className={`min-h-screen p-3 sm:p-4 lg:p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
    }`}>
      {/* Enhanced Header */}
      <div className={`rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
          : 'bg-gradient-to-r from-slate-700 to-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">System Event Logs</h1>
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg">Monitor system activities and audit trail</p>
            </div>
          </div>
          <div className="flex sm:hidden lg:block">
            <div className="text-left sm:text-right bg-white/10 sm:bg-transparent rounded-lg p-3 sm:p-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
              <div className="text-slate-300 text-sm">Total Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Events</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Warnings</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.categories}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          {/* Left side - Search */}
          <div className="flex-1 max-w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search event ID, message or operator..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                showStats 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Stats</span>
            </button>

            <div className={`flex items-center rounded-lg p-1 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? isDarkMode
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? isDarkMode
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            <button
              onClick={loadEventLogs}
              className={`inline-flex items-center px-3 sm:px-4 py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <div className="relative export-dropdown">
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <svg className={`ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showExportDropdown && (
                <div className={`absolute top-full right-0 mt-1 border rounded-lg shadow-lg z-20 min-w-[120px] sm:min-w-[140px] animate-in slide-in-from-top-2 duration-200 ${
                  isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={() => {
                      handleExport('excel');
                      setShowExportDropdown(false);
                    }}
                    className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-t-lg transition-colors duration-200 flex items-center ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      handleExport('pdf');
                      setShowExportDropdown(false);
                    }}
                    className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-b-lg transition-colors duration-200 flex items-center ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div>
            <label className={`block text-xs font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
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
            <label className={`block text-xs font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
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
            <label className={`block text-xs font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="All Status">All Status</option>
              <option value="Success">Success</option>
              <option value="Error">Error</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>From Date</label>
            <div className="relative">
              <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className={`w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>To Date</label>
            <div className="relative">
              <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className={`w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`rounded-xl shadow-sm border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading event logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No event logs found</h3>
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
                <thead className={`transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Event ID
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Action
                    </th>
                    <th className={`hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Category
                    </th>
                    <th className={`hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Operator
                    </th>
                    <th className={`hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Timestamp
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode 
                    ? 'bg-gray-800 divide-gray-700' 
                    : 'bg-white divide-gray-200'
                }`}>
                  {paginatedLogs.map((log, index) => (
                    <tr key={log.id} className={`transition-colors duration-150 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`} style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-mono text-blue-600 font-semibold">{log.eventId}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{log.category}</div>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{log.operator}</div>
                      </td>
                      <td className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{log.timestamp}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetailModal(true);
                          }}
                          className={`inline-flex items-center px-2 sm:px-3 py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 ${
                            isDarkMode 
                              ? 'text-blue-300 bg-blue-900/30 hover:bg-blue-900/50' 
                              : 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                          }`}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`px-3 sm:px-6 py-3 flex items-center justify-between border-t transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
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
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
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
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {paginatedLogs.map((log, index) => (
                  <div 
                    key={log.id} 
                    className={`border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${
                          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                        }`}>
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-mono text-blue-600 font-semibold truncate">{log.eventId}</div>
                          <div className={`text-[10px] sm:text-xs transition-colors duration-300 truncate ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{log.category}</div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(log.status)}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mb-3 sm:mb-4">
                      <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>

                    {/* Operator and Timestamp */}
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div>
                        <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Operator:</span>
                        <div className={`text-xs sm:text-sm truncate transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{log.operator}</div>
                      </div>
                      <div>
                        <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Time:</span>
                        <div className={`text-xs sm:text-sm font-mono transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{log.timestamp}</div>
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className="mb-3 sm:mb-4">
                      <p className={`text-xs sm:text-sm line-clamp-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{log.eventLogMessage}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailModal(true);
                        }}
                        className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                          isDarkMode 
                            ? 'border-blue-600 text-blue-300 bg-blue-900/30 hover:bg-blue-900/50' 
                            : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for Grid */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex items-center justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-l-md border text-xs sm:text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="hidden xs:inline">Previous</span>
                      <span className="xs:hidden"><ChevronLeft className="h-4 w-4" /></span>
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
                          className={`relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium transition-colors duration-200 ${
                            page === currentPage
                              ? isDarkMode
                                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                : 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
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
                      className={`relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-r-md border text-xs sm:text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span className="xs:hidden"><ChevronRight className="h-4 w-4" /></span>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
             style={{
               backdropFilter: 'blur(8px)',
               WebkitBackdropFilter: 'blur(8px)',
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               transition: 'all 300ms ease-out'
             }}>
          <div className={`rounded-lg sm:rounded-xl shadow-2xl border p-4 sm:p-6 lg:p-8 w-full max-w-4xl transform max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}
               style={{
                 animation: 'modalSlideIn 0.3s ease-out',
                 transformOrigin: 'center',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
               }}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-indigo-700 to-indigo-800' 
                    : 'bg-gradient-to-br from-indigo-100 to-indigo-200'
                }`}>
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Event Log Details</h3>
                  <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 transition-colors duration-300 truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Detailed information about the event log entry</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 hover:shadow-md flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Event ID</label>
                    <div className="text-base sm:text-lg font-mono font-bold text-blue-600 break-all">
                      {selectedLog?.eventId || 'N/A'}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Action</label>
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium rounded-full ${getActionColor(selectedLog?.action || 'Create')}`}>
                        {selectedLog?.action || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Category</label>
                    <div className={`text-base sm:text-lg font-medium transition-colors duration-300 break-words ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {selectedLog?.category || 'N/A'}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Status</label>
                    <div className="flex items-center">
                      {getStatusBadge(selectedLog?.status || 'Info')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Operator</label>
                    <div className={`text-base sm:text-lg font-medium transition-colors duration-300 break-words ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {selectedLog?.operator || 'N/A'}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Date</label>
                    <div className={`text-base sm:text-lg font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {selectedLog?.date || 'N/A'}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Timestamp</label>
                    <div className={`text-xs sm:text-sm font-mono break-all transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {selectedLog?.timestamp || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Message */}
              <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500' 
                  : 'bg-white border-gray-100'
              }`}>
                <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Event Message</label>
                <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}>
                  <p className={`text-xs sm:text-sm break-words leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedLog?.eventLogMessage || 'No message available'}
                  </p>
                </div>
              </div>

              {/* Before/After Changes */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500' 
                    : 'bg-white border-gray-100'
                }`}>
                  <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span className="flex items-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-1.5 sm:mr-2 shadow-sm flex-shrink-0"></span>
                      <span className="text-[10px] sm:text-xs">Before Change</span>
                    </span>
                  </label>
                  <div className={`border px-3 sm:px-4 py-2 sm:py-3 rounded-md min-h-[80px] sm:min-h-[100px] transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-red-900/30 to-red-800/30 border-red-800' 
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  }`}>
                    <p className={`text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed transition-colors duration-300 ${
                      isDarkMode ? 'text-red-200' : 'text-red-900'
                    }`}>
                      {selectedLog?.beforeChange || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className={`rounded-lg p-3 sm:p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500' 
                    : 'bg-white border-gray-100'
                }`}>
                  <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span className="flex items-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1.5 sm:mr-2 shadow-sm flex-shrink-0"></span>
                      <span className="text-[10px] sm:text-xs">After Change</span>
                    </span>
                  </label>
                  <div className={`border px-3 sm:px-4 py-2 sm:py-3 rounded-md min-h-[80px] sm:min-h-[100px] transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-800' 
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}>
                    <p className={`text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed transition-colors duration-300 ${
                      isDarkMode ? 'text-green-200' : 'text-green-900'
                    }`}>
                      {selectedLog?.afterChange || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
                className={`w-full sm:flex-1 border-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:shadow-md ${
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
    </div>
  );
};

export default EventLog;
