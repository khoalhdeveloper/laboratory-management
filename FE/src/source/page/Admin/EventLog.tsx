import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Activity,
  Info,
  Plus,
  Edit,
  Trash2,
  Check,
  Power,
  Lock,
  LogIn,
  LogOut,
  Filter,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { eventLogAPI, type EventLogItem } from '../Axios/Axios';

interface EventLog {
  id: string;
  eventId: string;
  action: 'Create' | 'Update' | 'Delete' | 'Modify' | 'Add' | 'Complete' | 'Activate' | 'Lock' | 'Login' | 'Logout';
  eventLogMessage: string;
  operator: string;
  date: string;
  timestamp: string;
  status: 'Success' | 'Error' | 'Info' | 'Warning';
  category: 'Test Order' | 'Test Result' | 'Comment' | 'Review' | 'Instrument' | 'User' | 'System' | 'Authentication' | 'Security' | 'Data';
  createdAt: string;
}

// Helper function to transform API data to UI format
const transformEventLogData = (apiData: any): EventLog[] => {
  const dataArray = Array.isArray(apiData) ? apiData : (apiData?.data ? apiData.data : []);
  
  return dataArray.map((item: EventLogItem) => {
    // Extract action from message
    const messageText = item.message.toLowerCase();
    let action: EventLog['action'] = 'Create';
    
    if (messageText.includes('create') || messageText.includes('created')) {
      action = 'Create';
    } else if (messageText.includes('update') || messageText.includes('updated') || messageText.includes('modify') || messageText.includes('modified')) {
      action = 'Update';
    } else if (messageText.includes('delete') || messageText.includes('deleted') || messageText.includes('remove') || messageText.includes('removed')) {
      action = 'Delete';
    } else if (messageText.includes('add') || messageText.includes('added')) {
      action = 'Add';
    } else if (messageText.includes('complete') || messageText.includes('completed')) {
      action = 'Complete';
    } else if (messageText.includes('activate') || messageText.includes('activated')) {
      action = 'Activate';
    } else if (messageText.includes('lock') || messageText.includes('locked')) {
      action = 'Lock';
    } else if (messageText.includes('login') || messageText.includes('logged in')) {
      action = 'Login';
    } else if (messageText.includes('logout') || messageText.includes('logged out')) {
      action = 'Logout';
    }
    
    // Determine status based on message content
    let status: EventLog['status'] = 'Info';
    if (item.message.toLowerCase().includes('error') || item.message.toLowerCase().includes('failed')) {
      status = 'Error';
    } else if (item.message.toLowerCase().includes('success') || item.message.toLowerCase().includes('completed')) {
      status = 'Success';
    } else if (item.message.toLowerCase().includes('warning') || item.message.toLowerCase().includes('caution')) {
      status = 'Warning';
    }
    
    // Determine category based on role first, then message content
    let category: EventLog['category'] = 'System';
    const categoryMessage = item.message.toLowerCase();
    
    if (item.role === 'doctor') {
      category = 'Test Order';
    } else if (categoryMessage.includes('test order') || categoryMessage.includes('testorder') || categoryMessage.includes('order_code') || categoryMessage.includes('patient_name')) {
      category = 'Test Order';
    } else if (categoryMessage.includes('test result') || categoryMessage.includes('testresult') || categoryMessage.includes('wbc') || categoryMessage.includes('rbc') || categoryMessage.includes('hgb')) {
      category = 'Test Result';
    } else if (categoryMessage.includes('comment') || categoryMessage.includes('doctor_name')) {
      category = 'Comment';
    } else if (categoryMessage.includes('review') || categoryMessage.includes('final')) {
      category = 'Review';
    } else if (categoryMessage.includes('instrument') || categoryMessage.includes('equipment') || categoryMessage.includes('device')) {
      category = 'Instrument';
    } else if (categoryMessage.includes('user') || categoryMessage.includes('account') || categoryMessage.includes('profile') || categoryMessage.includes('password')) {
      category = 'User';
    } else if (categoryMessage.includes('login') || categoryMessage.includes('logout') || categoryMessage.includes('authentication')) {
      category = 'Authentication';
    } else if (categoryMessage.includes('reagent') || categoryMessage.includes('supply') || categoryMessage.includes('usage')) {
      category = 'Data';
    }
    
    const createdAt = new Date(item.createdAt);
    
    // Server stores time in UTC, browser automatically converts to local timezone
    const dateStr = createdAt.toISOString().split('T')[0];
    const timeStr = createdAt.toISOString().split('T')[1].split('.')[0];
    
    return {
      id: item._id,
      eventId: item.event_id,
      action,
      eventLogMessage: item.message,
      operator: item.performedBy || 'System',
      date: dateStr,
      timestamp: timeStr,
      status,
      category,
      createdAt: item.createdAt
    };
  });
};

const STATUSES = ['Create', 'Update', 'Delete'] as const;
const OPERATORS = ['nurse', 'admin', 'doctor'] as const;
const CATEGORIES = ['Test Order', 'Test Result', 'Instrument', 'User', 'System', 'Data'] as const;

const STATUS_ICONS = {
  Create: Plus,
  Update: Edit,
  Delete: Trash2
};

// Memoized components for better performance
const EventLogRow = memo(({ log, onViewDetails, getActionColor, getActionIcon, getCategoryColor, getStatusColor, getStatusIcon }: {
  log: EventLog;
  onViewDetails: (log: EventLog) => void;
  getActionColor: (action: string) => string;
  getActionIcon: (action: string) => React.ReactNode;
  getCategoryColor: (category: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-mono text-gray-900 dark:text-white">
        {log.eventId}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex justify-start">
        <span className={getActionColor(log.action)}>
          {getActionIcon(log.action)}
          {log.action}
        </span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex justify-start">
        <span className={`inline-flex items-center justify-start px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 w-[110px] ${getCategoryColor(log.category)}`}>
          {log.category}
        </span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
        {getStatusIcon(log.status)}
        {log.status}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      {log.operator}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      {log.date}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
      {log.timestamp}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button 
        onClick={() => onViewDetails(log)}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 flex items-center"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(log);
          }
        }}
        tabIndex={0}
        aria-label={`View details for event ${log.eventId}`}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </button>
    </td>
  </tr>
));

const EventLogCard = memo(({ log, onViewDetails, getActionColor, getActionIcon, getCategoryColor, getStatusColor, getStatusIcon }: {
  log: EventLog;
  onViewDetails: (log: EventLog) => void;
  getActionColor: (action: string) => string;
  getActionIcon: (action: string) => React.ReactNode;
  getCategoryColor: (category: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white font-semibold truncate max-w-[150px] sm:max-w-none">
            {log.eventId}
          </span>
          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
            {getStatusIcon(log.status)}
            {log.status}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <span className={getActionColor(log.action)}>
            {getActionIcon(log.action)}
            {log.action}
          </span>
          <span className={`inline-flex items-center justify-start px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 w-[95px] sm:w-[110px] ${getCategoryColor(log.category)}`}>
            {log.category}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 space-y-0.5 sm:space-y-1">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{log.operator}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="text-xs">{log.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="text-xs">{log.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onViewDetails(log)}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 flex items-center flex-shrink-0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails(log);
          }
        }}
        tabIndex={0}
        aria-label={`View details for event ${log.eventId}`}
      >
        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
        <span className="text-xs sm:text-sm">View</span>
      </button>
    </div>
  </div>
));

const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading event logs...</p>
    </div>
  </div>
));

const EmptyState = memo(({ filters, resetFilters }: { filters: any; resetFilters: () => void }) => (
  <div className="text-center py-12">
    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No event logs found</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {filters.search || filters.status !== 'All Actions' || filters.operator !== 'All Operators' || filters.category !== 'All Categories'
        ? 'Try adjusting your search or filters to see more results.'
        : 'No event logs have been recorded yet.'
      }
    </p>
    {(filters.search || filters.status !== 'All Actions' || filters.operator !== 'All Operators' || filters.category !== 'All Categories') && (
      <button
        onClick={resetFilters}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
      >
        Clear Filters
      </button>
    )}
  </div>
));

const AdminEventLog: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: 'All Actions',
    operator: 'All Operators',
    category: 'All Categories'
  });

  // Load event logs with improved error handling
  const loadEventLogs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await eventLogAPI.getAllLogs();
      
      // Handle API response structure: { total: number, data: EventLog[] }
      let eventLogData = response.data.data || [];
      
      const transformedData = transformEventLogData(eventLogData);
      setEventLogs(transformedData);
    } catch (err: any) {
      // Enhanced error handling with specific messages
      const errorMessages = {
        401: 'Unauthorized. Please log in again.',
        403: 'Access denied. You do not have permission to view event logs.',
        404: 'Event logs not found. Please try again later.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'Server error. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.'
      };
      
      const status = err.response?.status;
      const message = errorMessages[status as keyof typeof errorMessages] || 
                    (err.message || 'Failed to load event logs. Please try again.');
      
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEventLogs();
  }, [loadEventLogs]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search to improve performance and make searching easier
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.search]);


  // Filter and sort event logs with comprehensive search
  const filteredLogs = useMemo(() => {
    let filtered = eventLogs;

    // Search filter with debounced search - search in all visible table columns
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(log => 
        log.eventId.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        log.operator.toLowerCase().includes(searchLower) ||
        log.date.toLowerCase().includes(searchLower) ||
        log.timestamp.toLowerCase().includes(searchLower) ||
        log.status.toLowerCase().includes(searchLower)
      );
    }

    // Action filter (using the status filter UI)
    if (filters.status !== 'All Actions') {
      filtered = filtered.filter(log => log.action === filters.status);
    }

    // Operator filter
    if (filters.operator !== 'All Operators') {
      filtered = filtered.filter(log => log.operator.toLowerCase() === filters.operator.toLowerCase());
    }

    // Category filter
    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    // Sort by createdAt (newest first)
    return filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [eventLogs, filters.status, filters.operator, filters.category, debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  // Get status color with softer, less bright styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'Error':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'Warning':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      case 'Info':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Create':
      case 'Add':
        return <Plus className="h-3 w-3 mr-1" />;
      case 'Update':
      case 'Modify':
        return <Edit className="h-3 w-3 mr-1" />;
      case 'Delete':
        return <Trash2 className="h-3 w-3 mr-1" />;
      case 'Complete':
        return <Check className="h-3 w-3 mr-1" />;
      case 'Activate':
        return <Power className="h-3 w-3 mr-1" />;
      case 'Lock':
        return <Lock className="h-3 w-3 mr-1" />;
      case 'Login':
        return <LogIn className="h-3 w-3 mr-1" />;
      case 'Logout':
        return <LogOut className="h-3 w-3 mr-1" />;
      default:
        return <Activity className="h-3 w-3 mr-1" />;
    }
  };

  // Get action color with softer, less bright styling
  const getActionColor = (action: string) => {
    const baseClass = 'inline-flex items-center justify-start px-3 py-1.5 text-xs font-bold rounded-full border transition-all duration-300 hover:shadow-md hover:scale-105 w-[85px]';
    
    switch (action) {
      case 'Create':
      case 'Add':
        return `${baseClass} text-white bg-gradient-to-r from-green-600 to-green-700 border-green-500 hover:from-green-700 hover:to-green-800 shadow-green-500/20 shadow-sm`;
      case 'Update':
      case 'Modify':
        return `${baseClass} text-white bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/20 shadow-sm`;
      case 'Delete':
        return `${baseClass} text-white bg-gradient-to-r from-red-600 to-red-700 border-red-500 hover:from-red-700 hover:to-red-800 shadow-red-500/20 shadow-sm`;
      case 'Complete':
        return `${baseClass} text-white bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/20 shadow-sm`;
      case 'Activate':
        return `${baseClass} text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-500 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/20 shadow-sm`;
      case 'Lock':
        return `${baseClass} text-white bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500 hover:from-orange-700 hover:to-orange-800 shadow-orange-500/20 shadow-sm`;
      case 'Login':
        return `${baseClass} text-white bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/20 shadow-sm`;
      case 'Logout':
        return `${baseClass} text-white bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 hover:from-gray-700 hover:to-gray-800 shadow-gray-500/20 shadow-sm`;
      default:
        return `${baseClass} text-white bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 hover:from-gray-700 hover:to-gray-800 shadow-gray-500/20 shadow-sm`;
    }
  };

  // Get category color with softer, less bright styling
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Test Order':
        return 'text-white bg-gradient-to-r from-amber-600 to-orange-700 border-amber-500 hover:from-amber-700 hover:to-orange-800 shadow-amber-500/20 shadow-sm';
      case 'Test Result':
        return 'text-white bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/20 shadow-sm';
      case 'Comment':
        return 'text-white bg-gradient-to-r from-orange-600 to-red-600 border-orange-500 hover:from-orange-700 hover:to-red-700 shadow-orange-500/20 shadow-sm';
      case 'Review':
        return 'text-white bg-gradient-to-r from-indigo-600 to-blue-700 border-indigo-500 hover:from-indigo-700 hover:to-blue-800 shadow-indigo-500/20 shadow-sm';
      case 'Instrument':
        return 'text-white bg-gradient-to-r from-cyan-600 to-teal-700 border-cyan-500 hover:from-cyan-700 hover:to-teal-800 shadow-cyan-500/20 shadow-sm';
      case 'User':
        return 'text-white bg-gradient-to-r from-emerald-600 to-green-700 border-emerald-500 hover:from-emerald-700 hover:to-green-800 shadow-emerald-500/20 shadow-sm';
      case 'Authentication':
        return 'text-white bg-gradient-to-r from-violet-600 to-purple-700 border-violet-500 hover:from-violet-700 hover:to-purple-800 shadow-violet-500/20 shadow-sm';
      case 'Data':
        return 'text-white bg-gradient-to-r from-slate-600 to-gray-700 border-slate-500 hover:from-slate-700 hover:to-gray-800 shadow-slate-500/20 shadow-sm';
      case 'System':
        return 'text-white bg-gradient-to-r from-gray-600 to-slate-700 border-gray-500 hover:from-gray-700 hover:to-slate-800 shadow-gray-500/20 shadow-sm';
      default:
        return 'text-white bg-gradient-to-r from-gray-600 to-slate-700 border-gray-500 hover:from-gray-700 hover:to-slate-800 shadow-gray-500/20 shadow-sm';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Info;
    return <IconComponent className="h-3 w-3 mr-1" />;
  };


  const handleRefresh = useCallback(() => {
    loadEventLogs(true);
  }, [loadEventLogs]);

  const handleViewDetails = useCallback((log: EventLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'All Actions',
      operator: 'All Operators',
      category: 'All Categories'
    });
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 lg:p-6 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="mb-2 sm:mb-0">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
          <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Event Logs
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
              Monitor and manage system event logs and activities
            </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              )}
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              <span className="sm:hidden">{refreshing ? '...' : 'Refresh'}</span>
            </button>
            
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 lg:mb-8">
        <div className="p-4 sm:p-5 lg:p-6">
          {/* Search Bar with improved accessibility */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="search-input" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Search Event Logs
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <input
                 id="search-input"
                type="text"
                 placeholder="Search event ID, action, operator..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 lg:py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm transition-all duration-200 shadow-sm focus:shadow-md"
                aria-label="Search event logs"
                aria-describedby="search-help"
                autoComplete="off"
                autoFocus={false}
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
             <p id="search-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
               <span className="hidden sm:inline">Search by event ID, action, category, operator, date, time, or status • Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd> to focus search</span>
               <span className="sm:hidden">Search all fields</span>
             </p>
             

            {/* Filter Dropdowns - Horizontal Layout */}
            <div className="mt-4 sm:mt-5 lg:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Operator Filter Dropdown */}
            <div>
                  <label htmlFor="operator-filter" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline-block align-text-bottom" />
                    Filter by Operator:
                  </label>
              <select
                    id="operator-filter"
                    value={filters.operator}
                    onChange={(e) => handleFilterChange('operator', e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm focus:shadow-md"
                    aria-label="Filter event logs by operator"
                  >
                    <option value="All Operators">All Operators</option>
                    {OPERATORS.map((operator) => (
                      <option key={operator} value={operator}>
                        {operator.charAt(0).toUpperCase() + operator.slice(1)}
                      </option>
                ))}
              </select>
            </div>

                {/* Category Filter Dropdown */}
            <div>
                  <label htmlFor="category-filter" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline-block align-text-bottom" />
                    Filter by Category:
                  </label>
              <select
                    id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm focus:shadow-md"
                    aria-label="Filter event logs by category"
              >
                <option value="All Categories">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                ))}
              </select>
            </div>
            </div>
            </div>
          </div>


          {/* Action Filter Buttons */}
          <div className="mt-4 sm:mt-5 lg:mt-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Filter by Action:
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {['All Actions', ...STATUSES].map((action) => {
                const isSelected = filters.status === action;
                const ActionIcon = action === 'All Actions' ? Activity : STATUS_ICONS[action as keyof typeof STATUS_ICONS];
              
              return (
                <button
                    key={action}
                    onClick={() => handleFilterChange('status', action)}
                    className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200 hover:scale-105 ${
                    isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md'
                  }`}
                    aria-pressed={isSelected}
                    aria-label={`Filter by ${action} action`}
                >
                    {ActionIcon && <ActionIcon className="h-3 w-3 mr-1 sm:mr-1.5" />}
                    {action}
                </button>
              );
            })}
          </div>
            
            {/* Clear Filters Button */}
            {(filters.search || filters.status !== 'All Actions' || filters.operator !== 'All Operators' || filters.category !== 'All Categories') && (
              <div className="mt-2.5 sm:mt-3">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Clear all filters"
                >
                  <X className="h-3 w-3 mr-1 sm:mr-1.5" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{filteredLogs.length}</span> events
        </div>
        
        {error && (
          <div className="flex items-center text-red-600 text-xs sm:text-sm">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Event Logs</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                Try Again
                </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState filters={filters} resetFilters={resetFilters} />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Event ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Operator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedLogs.map((log) => (
                      <EventLogRow
                        key={log.id}
                        log={log}
                        onViewDetails={handleViewDetails}
                        getActionColor={getActionColor}
                        getActionIcon={getActionIcon}
                        getCategoryColor={getCategoryColor}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden">
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
                  {paginatedLogs.map((log) => (
                    <EventLogCard
                      key={log.id}
                      log={log}
                      onViewDetails={handleViewDetails}
                      getActionColor={getActionColor}
                      getActionIcon={getActionIcon}
                      getCategoryColor={getCategoryColor}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination with improved accessibility */}
              {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      aria-label="Go to previous page"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      aria-label="Go to next page"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end">
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-label="Go to previous page"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;
                          const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          // First page
                          if (startPage > 1) {
                            pages.push(
                          <button
                                key={1}
                                onClick={() => handlePageChange(1)}
                                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                aria-label="Go to page 1"
                              >
                                1
                              </button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                  ...
                                </span>
                              );
                            }
                          }
                          
                          // Visible pages
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium transition-colors duration-200 ${
                                  i === currentPage
                                ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                                aria-label={`Go to page ${i}`}
                                aria-current={i === currentPage ? 'page' : undefined}
                          >
                                {i}
                          </button>
                            );
                          }
                          
                          // Last page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                  ...
                                </span>
                              );
                            }
                            pages.push(
                              <button
                                key={totalPages}
                                onClick={() => handlePageChange(totalPages)}
                                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                aria-label={`Go to page ${totalPages}`}
                              >
                                {totalPages}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-label="Go to next page"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal with improved accessibility */}
      {showDetailModal && selectedLog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Event Details
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-3 sm:space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Event ID</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono break-all">
                      {selectedLog.eventId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Timestamp</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                      {selectedLog.timestamp}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Performed By</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {selectedLog.operator}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                </div>

                {/* Action and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Action</p>
                    <span className={getActionColor(selectedLog.action)}>
                      {getActionIcon(selectedLog.action)}
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Category</p>
                    <span className={`inline-flex items-center justify-start px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 w-[95px] sm:w-[110px] ${getCategoryColor(selectedLog.category)}`}>
                      {selectedLog.category}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Message</p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                      {selectedLog.eventLogMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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

export default AdminEventLog;