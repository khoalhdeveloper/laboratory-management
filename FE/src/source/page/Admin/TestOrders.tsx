import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { testOrdersAPI } from '../Axios/Axios'
import { toast } from '../../../utils/toast'

// Types
interface TestOrder {
  _id: string;
  userid: string;
  created_by: string;
  order_code: string;
  patient_name: string;
  date_of_birth: string;
  gender: string;
  age: number;
  address: string;
  phone_number: string;
  email: string;
  status: string;
  priority: string;
  test_type: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ModalState {
  delete: { isOpen: boolean; orderCode: string | null; orderName: string };
  edit: { isOpen: boolean; order: TestOrder | null };
}

// Constants
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priority' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' }
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'patient_name', label: 'Patient Name' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' }
];

const TEST_TYPE_OPTIONS = [
  { value: '', label: 'Select test type' },
  { value: 'Blood Test', label: 'Blood Test' },
  { value: 'Urine Test', label: 'Urine Test' },
  { value: 'Culture Test', label: 'Culture Test' },
  { value: 'X-Ray', label: 'X-Ray' },
  { value: 'MRI', label: 'MRI' },
  { value: 'CT Scan', label: 'CT Scan' }
];

// Utility functions
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    // Backend đã cộng thêm 7 giờ rồi, nhưng vẫn có Z ở cuối
    // Cần trừ đi 7 giờ để có UTC time thực sự, rồi mới convert sang VN time
    let date: Date;
    
    if (dateString.endsWith('Z')) {
      // Nếu có Z, đây là UTC format nhưng thực tế đã là VN time
      // Trừ đi 7 giờ để có UTC time thực sự
      const utcDate = new Date(dateString);
      date = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    // Convert từ UTC sang timezone Việt Nam
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  } catch (error) {
    return 'N/A';
  }
};

const formatTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    // Backend đã cộng thêm 7 giờ rồi, nhưng vẫn có Z ở cuối
    // Cần trừ đi 7 giờ để có UTC time thực sự, rồi mới convert sang VN time
    let date: Date;
    
    if (dateString.endsWith('Z')) {
      // Nếu có Z, đây là UTC format nhưng thực tế đã là VN time
      // Trừ đi 7 giờ để có UTC time thực sự
      const utcDate = new Date(dateString);
      date = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    // Convert từ UTC sang timezone Việt Nam
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  } catch (error) {
    return 'N/A';
  }
};

const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

// Custom hooks
const useTestOrders = () => {
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testOrdersAPI.getAllTestOrders();
      
      // Check if response.data.data exists, otherwise use response.data directly
      const testOrdersData = response.data.data || response.data;
      
      if (Array.isArray(testOrdersData)) {
        setTestOrders(testOrdersData);
      } else {
        setTestOrders([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch test orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestOrders();
  }, [fetchTestOrders]);

  return { testOrders, setTestOrders, loading, error, refetch: fetchTestOrders };
};

// Skeleton Loading Component
const SkeletonRow = memo(() => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
    </td>
  </tr>
));

SkeletonRow.displayName = 'SkeletonRow';

const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return { filters, updateFilter };
};

const useModals = () => {
  const [modals, setModals] = useState<ModalState>({
    delete: { isOpen: false, orderCode: null, orderName: '' },
    edit: { isOpen: false, order: null }
  });

  const openModal = useCallback((type: keyof ModalState, data?: any) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, ...data }
    }));
  }, []);

  const closeModal = useCallback((type: keyof ModalState) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, orderCode: null, orderName: '', order: null }
    }));
  }, []);

  return { modals, openModal, closeModal };
};

// Main component
const TestOrders = memo(() => {
  const navigate = useNavigate();
  const { testOrders, loading, error, refetch } = useTestOrders();
  const { filters, updateFilter } = useFilters();
  const { modals, openModal, closeModal } = useModals();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized filtered and sorted orders
  const filteredAndSortedOrders = useMemo(() => {
    return testOrders
      .filter(order => {
        const matchesSearch = order.patient_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                            order.order_code.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                            order.userid.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesStatus = filters.statusFilter === 'all' || order.status === filters.statusFilter;
        const matchesPriority = filters.priorityFilter === 'all' || order.priority === filters.priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let aValue = a[filters.sortBy as keyof TestOrder];
        let bValue = b[filters.sortBy as keyof TestOrder];
        
        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }
        
        if (filters.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [testOrders, filters]);

  // Statistics
  const stats = useMemo(() => ({
    total: testOrders.length,
    pending: testOrders.filter(o => o.status === 'pending').length,
    processing: testOrders.filter(o => o.status === 'processing').length,
    completed: testOrders.filter(o => o.status === 'completed').length
  }), [testOrders]);

  // Event handlers
  const handleUpdateOrder = useCallback(async (orderCode: string, orderData: any) => {
    try {
      setIsSubmitting(true);
      const orderDataWithNumberAge = {
        ...orderData,
        age: parseInt(orderData.age) || 0
      };
      
      await testOrdersAPI.updateOrder(orderCode, orderDataWithNumberAge);
      toast.success('Test order updated successfully!');
      await refetch();
      closeModal('edit');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update test order';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [refetch, closeModal]);

  const handleDeleteOrder = useCallback(async () => {
    if (!modals.delete.orderCode) return;
    
    try {
      await testOrdersAPI.deleteOrderByCode(modals.delete.orderCode);
      toast.success('Test order deleted successfully!');
      await refetch();
      closeModal('delete');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete test order';
      toast.error(errorMessage);
    }
  }, [modals.delete.orderCode, refetch, closeModal]);

  const handleStatusUpdate = useCallback(async (orderCode: string, newStatus: string) => {
    try {
      await testOrdersAPI.updateOrderStatus(orderCode, newStatus);
      toast.success('Status updated successfully!');
      await refetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
    }
  }, [refetch]);

  // Enhanced Loading state with skeleton
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>

          {/* Controls Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-10 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {[...Array(9)].map((_, i) => (
                      <th key={i} className="px-6 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2" id="page-title">
            Test Orders Management
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
            Manage all test orders in the system
          </p>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Enhanced Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by patient name, order code, or user ID..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
                aria-label="Search test orders"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => updateFilter('searchTerm', '')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Enhanced Filters */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" htmlFor="status-filter">Status</label>
              <select
                  id="status-filter"
                value={filters.statusFilter}
                onChange={(e) => updateFilter('statusFilter', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                  aria-label="Filter by status"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              </div>
              
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" htmlFor="priority-filter">Priority</label>
              <select
                  id="priority-filter"
                value={filters.priorityFilter}
                onChange={(e) => updateFilter('priorityFilter', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                  aria-label="Filter by priority"
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end justify-between">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 flex-1">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" htmlFor="sort-by">Sort By</label>
              <select
                  id="sort-by"
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                  aria-label="Sort by"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              </div>
              
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1" htmlFor="sort-order">Order</label>
              <button
                  id="sort-order"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all duration-200 flex items-center gap-2 justify-center text-sm"
                  aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                  <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                  <span className="text-xs">{filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
          </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
          </div>
          </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{stats.processing}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Processing</div>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Test orders table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span>Order Code</span>
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span>Patient</span>
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">User ID</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Test Type</th>
                  <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                  <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Test Orders Found</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {testOrders.length === 0 
                              ? "There are no test orders in the system yet."
                              : "No test orders match your current filters. Try adjusting your search criteria."
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono">
                        {order.order_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{order.patient_name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{order.age} years, {order.gender}</div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {order.userid}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.order_code, e.target.value)}
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-violet-500 transition-all duration-200`}
                          aria-label={`Update status for order ${order.order_code}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {order.priority}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {order.test_type}
                        </span>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.created_by}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="font-medium">{formatDate(order.createdAt)}</div>
                            <div className="text-xs text-gray-400">
                              {formatTime(order.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => navigate(`/admin/test-orders/detail/${order.order_code}`)}
                            className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-colors duration-200"
                            aria-label={`View details for order ${order.order_code}`}
                            title="View Details"
                          >
                            <svg className="h-3 w-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => openModal('edit', { order })}
                            className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-violet-700 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/30 transition-colors duration-200"
                            aria-label={`Edit order ${order.order_code}`}
                            title="Edit Order"
                          >
                            <svg className="h-3 w-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => openModal('delete', { orderCode: order.order_code, orderName: order.patient_name })}
                            className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors duration-200"
                            aria-label={`Delete order ${order.order_code}`}
                            title="Delete Order"
                          >
                            <svg className="h-3 w-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
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

        {/* Modals */}
        <DeleteModal
          isOpen={modals.delete.isOpen}
          orderName={modals.delete.orderName}
          onClose={() => closeModal('delete')}
          onConfirm={handleDeleteOrder}
        />

        <EditOrderModal
          isOpen={modals.edit.isOpen}
          onClose={() => closeModal('edit')}
          onSubmit={handleUpdateOrder}
          order={modals.edit.order}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
});

TestOrders.displayName = 'TestOrders';

// Modal Components
const DeleteModal = memo(({ isOpen, orderName, onClose, onConfirm }: {
  isOpen: boolean;
  orderName: string;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Confirm Delete</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Are you sure you want to delete test order for <strong>{orderName}</strong>? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteModal.displayName = 'DeleteModal';

const EditOrderModal = memo(({ isOpen, onClose, onSubmit, order, isSubmitting }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderCode: string, data: any) => void;
  order: TestOrder | null;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    date_of_birth: '',
    gender: '',
    age: '',
    address: '',
    phone_number: '',
    email: '',
    test_type: '',
    priority: 'normal',
    notes: ''
  });

  useEffect(() => {
    if (order) {
      setFormData({
        patient_name: order.patient_name,
        date_of_birth: order.date_of_birth,
        gender: order.gender,
        age: order.age.toString(),
        address: order.address,
        phone_number: order.phone_number,
        email: order.email,
        test_type: order.test_type,
        priority: order.priority,
        notes: order.notes
      });
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patient_name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!formData.test_type.trim()) {
      toast.error('Test type is required');
      return;
    }
    if (!formData.gender) {
      toast.error('Gender is required');
      return;
    }
    if (!formData.date_of_birth) {
      toast.error('Date of birth is required');
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      toast.error('Valid age is required');
      return;
    }
    
    if (order) {
      onSubmit(order.order_code, formData);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Edit Test Order</h3>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={formData.patient_name}
                onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Type *</label>
              <select
                required
                value={formData.test_type}
                onChange={(e) => setFormData({...formData, test_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {TEST_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm sm:text-base font-medium"
            >
              {isSubmitting ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EditOrderModal.displayName = 'EditOrderModal';

export default TestOrders;