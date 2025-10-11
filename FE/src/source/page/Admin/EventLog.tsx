import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter, 
  Calendar,
  User,
  Clock,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  FileText,
  TrendingUp,
  Activity,
  Shield,
  Database,
  Settings,
  Users,
  TestTube,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';

interface EventLog {
  id: string;
  eventId: string; // E_00001, E_00002, etc.
  action: 'Create' | 'Update' | 'Delete' | 'Modify' | 'Add' | 'Complete' | 'Activate' | 'Lock' | 'Login' | 'Logout';
  eventLogMessage: string;
  operator: string;
  date: string;
  timestamp: string;
  status: 'Success' | 'Error' | 'Info' | 'Warning';
  beforeChange?: string; // Nội dung trước khi thay đổi
  afterChange?: string;  // Nội dung sau khi thay đổi
  category: 'Test Order' | 'Test Result' | 'Comment' | 'Review' | 'Instrument' | 'User' | 'System' | 'Authentication' | 'Security' | 'Data';
}

// Constants for better maintainability
const ACTIONS = ['Create', 'Update', 'Delete', 'Modify', 'Add', 'Complete', 'Activate', 'Lock', 'Login', 'Logout'] as const;
const CATEGORIES = ['Test Order', 'Test Result', 'Comment', 'Review', 'Instrument', 'User', 'System', 'Authentication', 'Security', 'Data'] as const;
const STATUSES = ['Success', 'Error', 'Info', 'Warning'] as const;

// Category icons mapping
const CATEGORY_ICONS = {
  'Test Order': TestTube,
  'Test Result': Activity,
  'Comment': MessageSquare,
  'Review': CheckCircle,
  'Instrument': Settings,
  'User': Users,
  'System': Database,
  'Authentication': Shield,
  'Security': Shield,
  'Data': Database
} as const;

// Status icons mapping
const STATUS_ICONS = {
  'Success': CheckCircle,
  'Error': XCircle,
  'Info': Info,
  'Warning': AlertTriangle
} as const;

const AdminEventLog: React.FC = () => {
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    action: 'All Actions',
    category: 'All Categories',
    dateFrom: '',
    dateTo: '',
    status: 'All Status'
  });

  useEffect(() => {
    loadEventLogs();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const loadEventLogs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEventLogs: EventLog[] = [
        {
          id: '1',
          eventId: 'E_00001',
          action: 'Create',
          eventLogMessage: 'Event message used when a new test order is created.',
          operator: 'Admin User',
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
      
      setEventLogs(mockEventLogs);
    } catch (err) {
      setError('Failed to load event logs. Please try again.');
      console.error('Error loading event logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Filter event logs with useMemo for performance
  const filteredLogs = useMemo(() => {
    return eventLogs.filter(log => {
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
  }, [eventLogs, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Get status badge class with icons
  const getStatusBadgeClass = (status: string) => {
    const baseClass = 'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200';
    switch (status) {
      case 'Success':
        return `${baseClass} bg-green-100 text-green-800 hover:bg-green-200`;
      case 'Error':
        return `${baseClass} bg-red-100 text-red-800 hover:bg-red-200`;
      case 'Info':
        return `${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      case 'Warning':
        return `${baseClass} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 dark:text-gray-200 hover:bg-gray-200`;
    }
  };

  // Get action color with enhanced styling
  const getActionColor = (action: string) => {
    const baseClass = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-all duration-200 hover:shadow-sm';
    switch (action) {
      case 'Create':
      case 'Add':
        return `${baseClass} text-green-700 bg-green-50 border-green-200 hover:bg-green-100`;
      case 'Update':
      case 'Modify':
        return `${baseClass} text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100`;
      case 'Delete':
        return `${baseClass} text-red-700 bg-red-50 border-red-200 hover:bg-red-100`;
      case 'Complete':
        return `${baseClass} text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100`;
      case 'Activate':
        return `${baseClass} text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100`;
      case 'Lock':
        return `${baseClass} text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100`;
      case 'Login':
        return `${baseClass} text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100`;
      case 'Logout':
        return `${baseClass} text-gray-700 dark:text-gray-300 bg-gray-50 border-gray-200 dark:border-gray-600 hover:bg-gray-100`;
      default:
        return `${baseClass} text-gray-700 dark:text-gray-300 bg-gray-50 border-gray-200 dark:border-gray-600 hover:bg-gray-100`;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Database;
    return <IconComponent className="h-3 w-3 mr-1" />;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Info;
    return <IconComponent className="h-3 w-3 mr-1" />;
  };

  const handleExport = useCallback(async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);
      setShowExportDropdown(false);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual export functionality
      console.log(`Exporting to ${format}...`);
      
      // For now, show success message
      alert(`Export to ${format.toUpperCase()} completed successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Failed to export to ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadEventLogs(true);
  }, [loadEventLogs]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Event Logs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Monitor and manage system event logs and activities
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-green-100 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {eventLogs.filter(log => log.status === 'Success').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-red-100 rounded">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Errors</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {eventLogs.filter(log => log.status === 'Error').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-yellow-100 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Warnings</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {eventLogs.filter(log => log.status === 'Warning').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Info</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {eventLogs.filter(log => log.status === 'Info').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading || refreshing}
              className="flex items-center transition-all duration-200 hover:shadow-md"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <div className="relative">
              <Button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
              
              {/* Export Dropdown */}
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fadeIn">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search event ID, message or operator..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Action Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
              <div className="relative">
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="All Actions">All Actions</option>
                  {ACTIONS.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="All Categories">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Database className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['All Status', ...STATUSES].map((status) => {
              const isSelected = filters.status === status;
              const StatusIcon = status === 'All Status' ? Activity : STATUS_ICONS[status as keyof typeof STATUS_ICONS];
              
              return (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400'
                  }`}
                >
                  {StatusIcon && <StatusIcon className="h-4 w-4 mr-2" />}
                  {status}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{filteredLogs.length}</span> events
            </p>
          </div>
          
          {filteredLogs.length !== eventLogs.length && (
            <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
              <p className="text-xs text-blue-700">
                <Filter className="h-3 w-3 inline mr-1" />
                {eventLogs.length - filteredLogs.length} events filtered out
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading event logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No event logs found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                Try adjusting your search criteria or refresh the page to load new events.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Event ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Operator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {paginatedLogs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-blue-600 font-semibold">{log.eventId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{log.operator}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-mono">{log.timestamp}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadgeClass(log.status)}>
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedLog(log);
                                setShowDetailModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {paginatedLogs.map((log) => (
                  <div key={log.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-mono text-blue-600 font-semibold">{log.eventId}</div>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                      <span className={getStatusBadgeClass(log.status)}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </div>

                    {/* Operator and Timestamp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Operator:</span>
                        <div className="text-sm text-gray-900 dark:text-white">{log.operator}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Time:</span>
                        <div className="text-sm text-gray-900 dark:text-white font-mono">{log.timestamp}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Event ID</label>
                    <div className="text-lg font-mono font-bold text-blue-600">
                      {selectedLog?.eventId || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Action</label>
                    <div className="flex items-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getActionColor(selectedLog?.action || 'Create')}`}>
                        {selectedLog?.action || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {selectedLog?.category || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
                    <div className="flex items-center">
                      <span className={getStatusBadgeClass(selectedLog?.status || 'Info')}>
                        {selectedLog?.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Operator</label>
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {selectedLog?.operator || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Date</label>
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {selectedLog?.date || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Timestamp</label>
                    <div className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                      {selectedLog?.timestamp || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Message */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Event Message</label>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-white break-words leading-relaxed">
                    {selectedLog?.eventLogMessage || 'No message available'}
                  </p>
                </div>
              </div>

              {/* Before/After Changes */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm"></span>
                      Before Change
                    </span>
                  </label>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border border-red-200 dark:border-red-700 px-4 py-3 rounded-md min-h-[100px]">
                    <p className="text-sm text-red-900 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedLog?.beforeChange || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></span>
                      After Change
                    </span>
                  </label>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 px-4 py-3 rounded-md min-h-[100px]">
                    <p className="text-sm text-green-900 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedLog?.afterChange || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLog(null);
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventLog;
