import { useState, useEffect, useCallback } from "react";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import Calendar from "react-calendar";
import { adminAPI, testOrdersAPI, eventLogAPI } from "../Axios/Axios";

const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const dashboardStyles = `
  .admin-dashboard {
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 2rem;
  }
  
  .dark .admin-dashboard {
    background-color: #111827;
  }

  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border: 1px solid #e5e7eb;
    font-family: inherit;
    line-height: 1.125em;
  }
  
  .dark .react-calendar {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }
  
  .dark .react-calendar__navigation button:disabled {
    background-color: #374151;
    color: #6b7280;
  }
  
  .dark .react-calendar__navigation button:enabled:hover,
  .dark .react-calendar__navigation button:enabled:focus {
    background-color: #4b5563;
  }
  
  .dark .react-calendar__month-view__days__day--weekend {
    color: #f87171;
  }
  
  .dark .react-calendar__month-view__days__day--neighboringMonth {
    color: #6b7280;
  }
  
  .dark .react-calendar__tile:disabled {
    background-color: #374151;
    color: #6b7280;
  }
  
  .dark .react-calendar__tile:enabled:hover,
  .dark .react-calendar__tile:enabled:focus {
    background-color: #4b5563;
  }
  
  .dark .react-calendar__tile--now {
    background: #fbbf24;
    color: #92400e;
  }
  
  .dark .react-calendar__tile--now:enabled:hover,
  .dark .react-calendar__tile--now:enabled:focus {
    background: #f59e0b;
    color: #92400e;
  }
  
  .dark .react-calendar__tile--hasActive {
    background: #3b82f6;
  }
  
  .dark .react-calendar__tile--hasActive:enabled:hover,
  .dark .react-calendar__tile--hasActive:enabled:focus {
    background: #2563eb;
  }
  
  .dark .react-calendar__tile--active {
    background: #2563eb;
    color: white;
  }
  
  .dark .react-calendar__tile--active:enabled:hover,
  .dark .react-calendar__tile--active:enabled:focus {
    background: #1d4ed8;
  }
  
  .dark .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: #4b5563;
  }
  
  .react-calendar--doubleView {
    width: 700px;
  }
  
  .react-calendar--doubleView .react-calendar__viewContainer {
    display: flex;
    margin: -0.5em;
  }
  
  .react-calendar--doubleView .react-calendar__viewContainer > * {
    width: 50%;
    margin: 0.5em;
  }
  
  .react-calendar,
  .react-calendar *,
  .react-calendar *:before,
  .react-calendar *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  
  .react-calendar button {
    margin: 0;
    border: 0;
    outline: none;
  }
  
  .react-calendar button:enabled:hover {
    cursor: pointer;
  }
  
  .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: 1em;
  }
  
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
  }
  
  .react-calendar__navigation button:disabled {
    background-color: #f0f0f0;
  }
  
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #e6e6e6;
  }
  
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
  }
  
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
  }
  
  .react-calendar__month-view__weekNumbers .react-calendar__tile {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    font-weight: bold;
  }
  
  .react-calendar__month-view__days__day--weekend {
    color: #d10000;
  }
  
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #757575;
  }
  
  .react-calendar__year-view .react-calendar__tile,
  .react-calendar__decade-view .react-calendar__tile,
  .react-calendar__century-view .react-calendar__tile {
    padding: 2em 0.5em;
  }
  
  .react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    background: none;
    text-align: center;
    line-height: 16px;
    font-size: 0.833em;
  }
  
  .react-calendar__tile:disabled {
    background-color: #f0f0f0;
  }
  
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #e6e6e6;
  }
  
  .react-calendar__tile--now {
    background: #ffff76;
  }
  
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #ffffa9;
  }
  
  .react-calendar__tile--hasActive {
    background: #76baff;
  }
  
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: #a9d4ff;
  }
  
  .react-calendar__tile--active {
    background: #006edc;
    color: white;
  }
  
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #1087ff;
  }
  
  .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: #e6e6e6;
  }

  .admin-dashboard__container {
    max-width: 72rem;
    margin: 0 auto;
  }

  .admin-dashboard__title {
    font-size: 1.875rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #1f2937;
  }

  .admin-dashboard__stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .admin-dashboard__stats {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .admin-dashboard__card {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .admin-dashboard__card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .admin-dashboard__card-value {
    font-size: 2.25rem;
    font-weight: bold;
  }

  .admin-dashboard__activity {
    margin-top: 2.5rem;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    padding: 1.5rem;
  }

  .admin-dashboard__activity-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #374151;
  }

  .admin-dashboard__activity-list {
    padding-left: 1.5rem;
    color: #4b5563;
  }

  .admin-dashboard__activity-list li {
    margin-bottom: 0.5rem;
  }
`;

const generateRealisticData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseTests = Math.floor(Math.random() * 50) + 20;
    const weekendFactor = (date.getDay() === 0 || date.getDay() === 6) ? 0.3 : 1;
    const tests = Math.floor(baseTests * weekendFactor);
    
    const status = tests >= 50 ? 'abnormal' : 'normal';
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: tests,
      fullDate: date.toISOString().split('T')[0],
      status: status,
      successRate: Math.floor(Math.random() * 20) + 80,
      avgProcessingTime: Math.floor(Math.random() * 60) + 30,
    });
  }
  
  return data;
};

const generateChartDataFromTestOrders = (testOrders: any[]) => {
  const data = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayOrders = testOrders.filter((order: any) => {
      // Try different possible date field names
      const dateField = order.created_at || order.createdAt || order.dateCreated || order.timestamp || order.created;
      if (!dateField) return false;
      try {
        const orderDate = new Date(dateField).toISOString().split('T')[0];
        return orderDate === dateString;
      } catch (error) {
        return false;
      }
    });
    
    const testsCount = dayOrders.length;
    
    let status = 'normal';
    if (testsCount >= 8) {
      status = 'abnormal';
    } else if (testsCount >= 5) {
      // Check if there are many pending orders which might indicate high load
      const pendingCount = dayOrders.filter((order: any) => order.status === 'pending').length;
      if (pendingCount >= 3) {
        status = 'abnormal';
      }
    }
    
    const successRate = dayOrders.length > 0 
      ? Math.floor((dayOrders.filter((o: any) => o.status === 'completed').length / dayOrders.length) * 100)
      : 100;
    
    const avgProcessingTime = Math.floor(Math.random() * 60) + 30;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: testsCount,
      fullDate: dateString,
      status: status,
      successRate: successRate,
      avgProcessingTime: avgProcessingTime,
    });
  }
  
  return data;
};


const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'year' | 'decade' | 'century'>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [previousSelectedDate, setPreviousSelectedDate] = useState<Date | null>(null);
  const [previousCalendarDate, setPreviousCalendarDate] = useState<Date | null>(null);
  
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    testsToday: 0,
    loading: true,
    error: null as string | null
  });
  
  const [chartData, setChartData] = useState(generateRealisticData());
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentDate(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Memoized fetch function with better error handling
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      setChartLoading(true);
      setChartError(null);
      setActivitiesLoading(true);
      
      // Fetch all data in parallel
      const [accountsResponse, testOrdersResponse, activitiesResponse] = await Promise.allSettled([
        adminAPI.getAllAccounts(),
        testOrdersAPI.getAllTestOrders(),
        eventLogAPI.getAllLogs()
      ]);
      
      // Handle accounts data
      if (accountsResponse.status === 'fulfilled') {
        const accounts = accountsResponse.value.data;
        const totalPatients = accounts.filter((acc: any) => acc.role === 'user').length;
        const totalDoctors = accounts.filter((acc: any) => acc.role === 'doctor').length;
        
        setDashboardData(prev => ({
          ...prev,
          totalPatients,
          totalDoctors,
          loading: false
        }));
      } else {
        setDashboardData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load account data' 
        }));
      }
      
      // Handle test orders data
      if (testOrdersResponse.status === 'fulfilled') {
        const testOrders = testOrdersResponse.value.data.data || testOrdersResponse.value.data || [];
        
        const today = new Date().toISOString().split('T')[0];
        const testsToday = testOrders.filter((order: any) => {
          const dateField = order.created_at || order.createdAt || order.dateCreated || order.timestamp || order.created;
          if (!dateField) return false;
          try {
            const orderDate = new Date(dateField).toISOString().split('T')[0];
            return orderDate === today;
          } catch (error) {
            return false;
          }
        }).length;
        
        setDashboardData(prev => ({
          ...prev,
          testsToday,
          loading: false
        }));
        
        const chartDataFromAPI = generateChartDataFromTestOrders(testOrders);
        setChartData(chartDataFromAPI);
        setChartLoading(false);
      } else {
        setChartError('Failed to load chart data');
        setChartLoading(false);
        // Fallback to generated data
        setChartData(generateRealisticData());
      }
      
      // Handle activities data
      if (activitiesResponse.status === 'fulfilled') {
        const activities = activitiesResponse.value.data.data || activitiesResponse.value.data || [];
        setRecentActivities(activities.slice(0, 5));
        setActivitiesLoading(false);
      } else {
        setRecentActivities([]);
        setActivitiesLoading(false);
      }
      
    } catch (error) {
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred' 
      }));
      setChartLoading(false);
      setChartError('Failed to load chart data');
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Helper functions for formatting time and date
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Sửa hàm onChange để đúng kiểu Value và event của react-calendar
  const handleDateChange = (value: any) => {
    let newDate = value instanceof Date ? value : (Array.isArray(value) && value[0] instanceof Date ? value[0] : null);
    if (newDate) {
      // Lưu trữ thời gian đã chọn trước đó
      setPreviousSelectedDate(selectedDate);
      setPreviousCalendarDate(calendarDate);
      
      setSelectedDate(newDate);
      setCalendarDate(newDate);
    }
  };

  // Xử lý chuyển tháng/năm bằng mũi tên
  const handleActiveStartDateChange = (args: { action?: string; activeStartDate: Date | null; value?: any; view?: string }) => {
    if (args.activeStartDate) {
      setCalendarDate(args.activeStartDate);
    }
  };

  // Xử lý chuyển view
  const handleViewChange = (args: { action?: string; activeStartDate: Date | null; value?: any; view: string }) => {
    // Lưu trữ thời gian hiện tại khi chuyển view
    if (args.view !== 'month') {
      setPreviousSelectedDate(selectedDate);
      setPreviousCalendarDate(calendarDate);
    }
    setCalendarView(args.view as 'month' | 'year' | 'decade' | 'century');
  };

  // Xử lý nút Back - quay về thời gian hiện tại hoặc đã chọn trước đó
  const handleBackToCurrent = () => {
    if (previousSelectedDate && previousCalendarDate) {
      // Quay về thời gian đã chọn trước đó
      setSelectedDate(previousSelectedDate);
      setCalendarDate(previousCalendarDate);
      setCalendarView('month');
      
      // Reset previous values sau khi sử dụng
      setPreviousSelectedDate(null);
      setPreviousCalendarDate(null);
    } else {
      // Quay về thời gian hiện tại
      const now = new Date();
      setSelectedDate(now);
      setCalendarDate(now);
      setCalendarView('month');
    }
  };


  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-sky-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={dashboardData.loading || chartLoading}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm sm:text-base rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <svg 
            className={`w-4 h-4 ${(dashboardData.loading || chartLoading) ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-2 sm:mb-4">
        {/* Total Patients */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105 dark:shadow-gray-900/20">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">Total Patients</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {dashboardData.loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 dark:bg-gray-700 h-6 sm:h-8 w-12 sm:w-16 rounded" />
                ) : dashboardData.error ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  dashboardData.totalPatients.toLocaleString()
                )}
              </p>
              <p className="text-green-500 dark:text-green-400 text-xs font-medium mt-1 sm:mt-2">Active Users</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 flex-shrink-0 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-violet-500 hover:shadow-xl transition-all duration-300 hover:scale-105 dark:shadow-gray-900/20">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">Total Doctors</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {dashboardData.loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 dark:bg-gray-700 h-6 sm:h-8 w-12 sm:w-16 rounded" />
                ) : dashboardData.error ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  dashboardData.totalDoctors.toLocaleString()
                )}
              </p>
              <p className="text-green-500 dark:text-green-400 text-xs font-medium mt-1 sm:mt-2">Medical Staff</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/20 dark:shadow-violet-500/30 flex-shrink-0 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600 dark:text-violet-400">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tests Today */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105 dark:shadow-gray-900/20">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">Tests Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {dashboardData.loading ? (
                  <span className="inline-block animate-pulse bg-gray-200 dark:bg-gray-700 h-6 sm:h-8 w-12 sm:w-16 rounded" />
                ) : dashboardData.error ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  dashboardData.testsToday.toLocaleString()
                )}
              </p>
              <p className="text-yellow-500 dark:text-yellow-400 text-xs font-medium mt-1 sm:mt-2">Current Day</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 dark:shadow-green-500/30 flex-shrink-0 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700 dark:shadow-gray-900/20">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4 sm:mb-6 items-start sm:items-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Daily Test Volume</h2>
            <div className="flex gap-3 sm:gap-4 sm:ml-auto flex-wrap">
              <span className="flex items-center gap-1 sm:gap-2 text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm lg:text-base">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 dark:bg-green-400 inline-block"></span>Normal Load
              </span>
              <span className="flex items-center gap-1 sm:gap-2 text-yellow-500 dark:text-yellow-400 font-medium text-xs sm:text-sm lg:text-base">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 dark:bg-yellow-500 inline-block" style={{clipPath:'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius:'2px'}}></span>High Load
              </span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Last 14 days - Laboratory Test Volume</p>
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 h-[200px] sm:h-[260px]">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
                </div>
              </div>
            ) : chartError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-2">⚠️</div>
                  <p className="text-red-500 font-medium mb-2">Failed to load chart data</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{chartError}</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#e0e7ff" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{fontSize:16, fill:'#6b7280', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{fontSize:16, fill:'#6b7280', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius:12, background:'#fff', border:'1px solid #e0e7ff', fontSize:16, fontWeight:'bold'}} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    fill="url(#colorValue)" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={(props) => {
                      const { cx, cy, payload } = props;
                      if (!cx || !cy) return <></>;
                      
                      const isHighLoad = payload?.status === 'abnormal';
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHighLoad ? 6 : 4}
                          fill={isHighLoad ? "#facc15" : "#22c55e"}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Test Results</h3>
            <div className="space-y-2 sm:space-y-3">
              {chartData.slice(-3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full inline-block flex-shrink-0 ${
                    item.status === 'abnormal' 
                      ? 'bg-yellow-400 dark:bg-yellow-500' 
                      : 'bg-green-500 dark:bg-green-400'
                  }`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.fullDate} - {item.value} tests
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="hidden sm:inline">Success Rate: {item.successRate}% | Avg Time: {item.avgProcessingTime}min</span>
                      <span className="sm:hidden">{item.successRate}% | {item.avgProcessingTime}min</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {item.status === 'abnormal' ? 'High Load' : 'Normal'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-80 flex flex-col gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-center text-white border border-violet-200">
            <div className="text-lg sm:text-xl font-bold mb-2">Today is {getDayOfWeek(currentDate)}</div>
            <div className="text-violet-100 text-base sm:text-lg font-medium">{formatTime(currentTime)}</div>
            <div className="text-violet-200 text-xs sm:text-sm mt-2">{formatDate(currentDate)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-100 dark:border-gray-700 dark:shadow-gray-900/20">
            <h3 className="font-bold mb-2 text-base sm:text-lg text-gray-900 dark:text-white">Calendar</h3>
            <div className="mb-2 flex justify-center">
              {calendarView !== 'month' && (
                <button
                  className="mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition"
                  onClick={handleBackToCurrent}
                >Back</button>
              )}
              <Calendar
                value={selectedDate}
                onChange={handleDateChange}
                className="custom-calendar-clean"
                calendarType="gregory"
                defaultValue={currentDate}
                prevLabel={<span className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md">&#60;</span>}
                nextLabel={<span className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md">&#62;</span>}
                navigationLabel={({ label }: { label: string }) => (
                  <span className="font-semibold text-base text-blue-600 dark:text-blue-400">{label}</span>
                )}
                tileClassName={({ date, view }: { date: Date; view: string }) => {
                  let classes = "text-sm px-2 py-1 rounded transition-all duration-150 bg-white dark:bg-gray-800 font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700";
                  if (view === "month") {
                    if (date.toDateString() === selectedDate.toDateString()) {
                      classes += " bg-blue-600 dark:bg-blue-500 text-white shadow-lg ring-2 ring-blue-200 dark:ring-blue-400";
                    }
                    if (date.getDay() === 0 || date.getDay() === 6) {
                      classes += " text-red-600 dark:text-red-400 font-semibold";
                    }
                    // Highlight today
                    if (date.toDateString() === new Date().toDateString() && date.toDateString() !== selectedDate.toDateString()) {
                      classes += " ring-2 ring-amber-300 dark:ring-amber-500 bg-amber-50 dark:bg-amber-900/20";
                    }
                  }
                  return classes;
                }}
                formatShortWeekday={(locale: string | undefined, date: Date) => date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}
                onViewChange={handleViewChange}
                onActiveStartDateChange={handleActiveStartDateChange}
                view={calendarView}
                activeStartDate={calendarDate}
              />
            </div>
            <style>{`
              .custom-calendar-clean {
                font-family: inherit;
                border-radius: 0.75rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                padding: 0.5rem;
                border: 1px solid #e0e7ff;
                max-width: 100%;
                width: 100%;
                margin: 0 auto;
                background: white;
              }
              
              @media (min-width: 640px) {
                .custom-calendar-clean {
                  max-width: 270px;
                  border-radius: 1rem;
                }
              }
              
              .dark .custom-calendar-clean {
                background: #1f2937;
                border: 1px solid #374151;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              }
              .custom-calendar-clean .react-calendar__tile--active {
                background: #2563eb !important;
                color: #fff !important;
                font-weight: bold;
                box-shadow: 0 2px 8px #2563eb33;
              }
              .custom-calendar-clean .react-calendar__tile:hover {
                background: #f0f9ff;
                color: #1d4ed8;
                box-shadow: 0 2px 8px rgba(29, 78, 216, 0.15);
                transform: translateY(-1px);
              }
              
              .dark .custom-calendar-clean .react-calendar__tile:hover {
                background: #374151;
                color: #60a5fa;
                box-shadow: 0 2px 8px rgba(96, 165, 250, 0.2);
              }
              .custom-calendar-clean .react-calendar__navigation button {
                min-width: 0;
                width: 24px;
                height: 24px;
                background: transparent;
                border: none;
                margin: 0 1px;
                padding: 0;
                font-size: 0.875rem;
                color: #2563eb;
                border-radius: 50%;
                box-shadow: none;
                transition: all 0.2s ease;
              }
              
              @media (min-width: 640px) {
                .custom-calendar-clean .react-calendar__navigation button {
                  width: 28px;
                  height: 28px;
                  margin: 0 2px;
                  font-size: 1rem;
                }
              }
              
              .custom-calendar-clean .react-calendar__navigation button:hover {
                background: #f0f9ff;
                color: #1d4ed8;
                box-shadow: 0 2px 4px rgba(29, 78, 216, 0.1);
              }
              
              .dark .custom-calendar-clean .react-calendar__navigation button {
                color: #60a5fa;
              }
              .custom-calendar-clean .react-calendar__navigation button:disabled {
                color: #9ca3af;
                background: transparent;
                cursor: not-allowed;
                opacity: 0.5;
              }
              
              .dark .custom-calendar-clean .react-calendar__navigation button:disabled {
                color: #6b7280;
              }
              .custom-calendar-clean .react-calendar__navigation button:focus {
                outline: none;
                box-shadow: 0 0 0 2px #2563eb33;
              }
              .custom-calendar-clean .react-calendar__month-view__weekdays {
                font-size: 0.75rem;
                font-weight: 600;
                color: #374151;
                letter-spacing: 0.5px;
                text-align: center;
                border-bottom: 1px dashed #d1d5db;
                padding: 0.375rem 0;
                background: rgba(249, 250, 251, 0.8);
                border-radius: 0.5rem 0.5rem 0 0;
              }
              
              @media (min-width: 640px) {
                .custom-calendar-clean .react-calendar__month-view__weekdays {
                  font-size: 0.95rem;
                  letter-spacing: 1px;
                  padding: 0.5rem 0;
                }
              }
              
              .dark .custom-calendar-clean .react-calendar__month-view__weekdays {
                color: #f3f4f6;
                background: rgba(17, 24, 39, 0.8);
                border-bottom: 1px dashed #6b7280;
              }
            `}</style>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 dark:shadow-gray-900/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition">
            View All
          </button>
        </div>
        
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading activities...</p>
            </div>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📝</div>
            <p className="text-gray-500 dark:text-gray-400">No recent activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Time</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.slice(0, 5).map((activity: any, index: number) => {
                  const activityDate = new Date(activity.createdAt);
                  const timeString = activityDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  });
                  const dateString = activityDate.toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  });
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-900 dark:text-white font-medium text-sm">
                        <div className="truncate max-w-[200px] sm:max-w-none">
                          {activity.message || 'System activity'}
                        </div>
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {timeString} • {dateString}
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">{timeString}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">{dateString}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-900 dark:text-white font-medium text-sm">
                        <div className="truncate max-w-[100px] sm:max-w-none">
                          {activity.performedBy || 'System'}
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.role === 'admin' 
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : activity.role === 'doctor'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : activity.role === 'nurse'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                        }`}>
                          {activity.role || 'User'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Dashboard;
