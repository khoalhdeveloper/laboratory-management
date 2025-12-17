import { useState, useEffect } from 'react';
import { Button, DatePicker, Select, Tag, Space, Spin, Empty, ConfigProvider, theme } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined, ToolOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { api as axiosClient } from '../Axios/Axios';
import { toast } from '../../../utils/toast';
import { useDarkMode } from './DarkModeUtils';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Types
interface Shift {
  _id: string;
  shift_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  department?: string;
  instrument_id?: string;
  assigned_users: Array<{
    userid: string;
    username: string;
    role?: string;
  }>;
  notes?: string;
  status: 'planned' | 'published' | 'cancelled' | 'completed';
  created_by: string;
  updated_by?: string;
  createdAt: string;
  updatedAt: string;
}

interface ShiftResponse {
  message: string;
  total: number;
  data: Shift[];
}

// Status Tag styles
const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'success';
    case 'planned':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'completed':
      return 'processing';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return 'Published';
    case 'planned':
      return 'Planned';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const Schedule = () => {
  const { isDarkMode } = useDarkMode();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;

  // Fetch shifts
  const fetchMyShifts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
      }

      console.log('Fetching shifts with params:', params);
      const response = await axiosClient.get<ShiftResponse>('/shifts/my', { params });
      
      if (response.data && response.data.data) {
        setShifts(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      console.error('Error fetching shifts:', error);
      toast.error(error.response?.data?.message || 'Failed to load work schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateRange, statusFilter, departmentFilter]);

  // Calculate statistics
  const stats = {
    total: shifts.length,
    published: shifts.filter(s => s.status === 'published').length,
    planned: shifts.filter(s => s.status === 'planned').length,
    cancelled: shifts.filter(s => s.status === 'cancelled').length,
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleReset = () => {
    setDateRange(null);
    setStatusFilter('all');
    setDepartmentFilter('all');
    setPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    setPage(1);
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'published': return '#22c55e';
      case 'planned': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgContainer: isDarkMode ? '#1f2937' : '#ffffff',
          colorBorder: isDarkMode ? '#374151' : '#d1d5db',
          colorText: isDarkMode ? '#e5e7eb' : '#1f2937',
          colorTextPlaceholder: isDarkMode ? '#6b7280' : '#9ca3af',
          colorPrimary: '#2563eb',
        },
      }}
    >
      <div className={`min-h-screen p-3 sm:p-4 lg:p-6 transition-colors ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 w-full">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0 flex items-center justify-center">
                <CalendarOutlined style={{ fontSize: '20px' }} className="sm:text-2xl lg:text-3xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl lg:text-3xl font-bold mb-0.5 sm:mb-1 lg:mb-2 leading-tight">
                  My Work Schedule
                </h1>
                <p className="text-blue-100 text-[10px] sm:text-sm lg:text-lg leading-tight line-clamp-2 sm:line-clamp-1">
                  View and manage your assigned work shifts
                </p>
              </div>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <div className="text-right whitespace-nowrap">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-blue-200 text-sm">Total Shifts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Shifts
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.total}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <CalendarOutlined style={{ fontSize: '20px' }} className={`sm:text-2xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Published
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.published}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <ClockCircleOutlined style={{ fontSize: '20px' }} className={`sm:text-2xl ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Planned
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {stats.planned}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                <TeamOutlined style={{ fontSize: '20px' }} className={`sm:text-2xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-100'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cancelled
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {stats.cancelled}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                <FileTextOutlined style={{ fontSize: '20px' }} className={`sm:text-2xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className={`rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Filter Options
            </h2>
            <Button 
              onClick={handleReset}
              size="middle"
              className={`font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Reset All
            </Button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="lg:col-span-2">
              <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                Date Range
              </label>
              <RangePicker
                className="w-full"
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={['From Date', 'To Date']}
                size="middle"
                allowClear
              />
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                Status
              </label>
              <Select
                className="w-full"
                value={statusFilter}
                onChange={handleStatusChange}
                size="middle"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">All Status</Option>
                <Option value="published">Published</Option>
                <Option value="planned">Planned</Option>
                <Option value="cancelled">Cancelled</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                Department
              </label>
              <Select
                className="w-full"
                value={departmentFilter}
                onChange={handleDepartmentChange}
                size="middle"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">All Departments</Option>
                <Option value="Hematology">Hematology</Option>
                <Option value="Biochemistry">Biochemistry</Option>
                <Option value="Microbiology">Microbiology</Option>
                <Option value="Immunology">Immunology</Option>
                <Option value="Molecular">Molecular</Option>
                <Option value="Pathology">Pathology</Option>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{shifts.length}</span> of <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{total}</span> shift{total !== 1 ? 's' : ''}
                {(statusFilter !== 'all' || departmentFilter !== 'all' || dateRange) && (
                  <span className="ml-1">with active filters</span>
                )}
              </p>
              {(statusFilter !== 'all' || departmentFilter !== 'all' || dateRange) && (
                <div className="flex flex-wrap gap-1.5">
                  {dateRange && (
                    <Tag 
                      closable 
                      onClose={() => setDateRange(null)}
                      color="blue"
                      className="text-xs"
                    >
                      {dateRange[0]?.format('DD/MM')} - {dateRange[1]?.format('DD/MM')}
                    </Tag>
                  )}
                  {statusFilter !== 'all' && (
                    <Tag 
                      closable 
                      onClose={() => setStatusFilter('all')}
                      color="green"
                      className="text-xs"
                    >
                      Status: {statusFilter}
                    </Tag>
                  )}
                  {departmentFilter !== 'all' && (
                    <Tag 
                      closable 
                      onClose={() => setDepartmentFilter('all')}
                      color="purple"
                      className="text-xs"
                    >
                      Dept: {departmentFilter}
                    </Tag>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shifts List */}
        {loading ? (
          <div className={`flex justify-center items-center min-h-[400px] rounded-xl sm:rounded-2xl shadow-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
          }`}>
            <Spin size="large" tip="Loading work schedule..." />
          </div>
        ) : shifts.length === 0 ? (
          <div className={`py-16 rounded-xl sm:rounded-2xl shadow-lg ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
          }`}>
            <Empty
              description={
                <span className={isDarkMode ? 'text-gray-400' : 'text-slate-600'}>
                  No shifts assigned
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {shifts.map((shift, index) => (
              <div
                key={shift._id}
                className={`rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-100'
                }`}
                style={{ 
                  borderLeft: `4px solid ${getStatusBorderColor(shift.status)}`,
                  animationDelay: `${index * 0.05}s` 
                }}
              >
                {/* Shift Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 sm:mb-5">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                      isDarkMode ? 'bg-blue-500/10' : 'bg-sky-50'
                    }`}>
                      <CalendarOutlined className={`text-base sm:text-lg ${
                        isDarkMode ? 'text-blue-400' : 'text-sky-600'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-base sm:text-lg font-bold truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {shift.title}
                      </h3>
                    </div>
                  </div>
                  <Tag 
                    color={getStatusColor(shift.status)}
                    className="px-3 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-full self-start"
                  >
                    {getStatusText(shift.status)}
                  </Tag>
                </div>

                {/* Shift Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                  }`}>
                    <CalendarOutlined className={`text-base sm:text-lg flex-shrink-0 ${
                      isDarkMode ? 'text-blue-400' : 'text-sky-600'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[10px] sm:text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-slate-500'
                      }`}>
                        Date
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold truncate ${
                        isDarkMode ? 'text-gray-200' : 'text-slate-700'
                      }`}>
                        {dayjs(shift.date).format('DD/MM/YYYY')}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                  }`}>
                    <ClockCircleOutlined className={`text-base sm:text-lg flex-shrink-0 ${
                      isDarkMode ? 'text-blue-400' : 'text-sky-600'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[10px] sm:text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-slate-500'
                      }`}>
                        Time
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold truncate ${
                        isDarkMode ? 'text-gray-200' : 'text-slate-700'
                      }`}>
                        {shift.start_time} - {shift.end_time}
                      </div>
                    </div>
                  </div>

                  {shift.department && (
                    <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                    }`}>
                      <TeamOutlined className={`text-base sm:text-lg flex-shrink-0 ${
                        isDarkMode ? 'text-blue-400' : 'text-sky-600'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-[10px] sm:text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-slate-500'
                        }`}>
                          Department
                        </div>
                        <div className={`text-xs sm:text-sm font-semibold truncate ${
                          isDarkMode ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          {shift.department}
                        </div>
                      </div>
                    </div>
                  )}

                  {shift.instrument_id && (
                    <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                    }`}>
                      <ToolOutlined className={`text-base sm:text-lg flex-shrink-0 ${
                        isDarkMode ? 'text-blue-400' : 'text-sky-600'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-[10px] sm:text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-slate-500'
                        }`}>
                          Equipment
                        </div>
                        <div className={`text-xs sm:text-sm font-semibold truncate ${
                          isDarkMode ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          {shift.instrument_id}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {shift.notes && (
                  <div className={`flex items-start gap-2 sm:gap-3 mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700/30 border border-gray-700' 
                      : 'bg-blue-50/50 border border-blue-100'
                  }`}>
                    <FileTextOutlined className={`text-base sm:text-lg mt-0.5 flex-shrink-0 ${
                      isDarkMode ? 'text-blue-400' : 'text-sky-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] sm:text-xs font-semibold mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        Notes
                      </div>
                      <div className={`text-xs sm:text-sm break-words ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>
                        {shift.notes}
                      </div>
                    </div>
                  </div>
                )}

                {shift.assigned_users && shift.assigned_users.length > 0 && (
                  <div className={`flex items-start gap-2 sm:gap-3 mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700/30 border border-gray-700' 
                      : 'bg-blue-50/50 border border-blue-100'
                  }`}>
                    <TeamOutlined className={`text-base sm:text-lg mt-0.5 flex-shrink-0 ${
                      isDarkMode ? 'text-blue-400' : 'text-sky-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        Assigned Staff
                      </div>
                      <Space size={[6, 6]} wrap>
                        {shift.assigned_users.map((user, idx) => (
                          <Tag 
                            key={idx} 
                            color="blue"
                            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium text-xs"
                          >
                            {user.username}
                            {user.role && ` (${user.role})`}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {total > limit && (
              <div className={`mt-6 sm:mt-8 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-100'
              }`}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    size="middle"
                    className={`w-full sm:w-auto min-w-[100px] sm:min-w-[120px] ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                        : 'disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    Previous
                  </Button>
                  <div className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-slate-100'
                  }`}>
                    <span className={`text-sm sm:text-base font-semibold ${
                      isDarkMode ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      Page {page} / {Math.ceil(total / limit)}
                    </span>
                  </div>
                  <Button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage(page + 1)}
                    size="middle"
                    className={`w-full sm:w-auto min-w-[100px] sm:min-w-[120px] ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600 disabled:bg-gray-800 disabled:text-gray-500' 
                        : 'disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default Schedule;
