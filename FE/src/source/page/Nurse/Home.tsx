import { useState, useEffect, useCallback } from "react";
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
import "react-calendar/dist/Calendar.css";
import { eventLogAPI, type EventLogItem, testOrdersAPI } from '../Axios/Axios';

interface ChartDataPoint {
  date: string;
  value: number;
  fullDate: string;
  status: 'normal' | 'abnormal';
}

const events = [
  { date: new Date(2022, 8, 8), title: "Monthly doctor's meet" },
  { date: new Date(2022, 8, 15), title: "Important Meeting" },
];

interface RecentActivity {
  id: string;
  description: string;
  time: string;
  date: string;
  user: string;
  status: 'Completed' | 'In Progress' | 'Failed' | 'Warning';
}

function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'year' | 'decade' | 'century'>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Dashboard data state
  const [testsToday, setTestsToday] = useState(0);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState<string | null>(null);
  
  // Recent activities state
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  // Chart data state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setTestsLoading(true);
      setTestsError(null);
      setChartLoading(true);
      setActivitiesLoading(true);
      
      // Fetch all data in parallel
      const [testOrdersResponse, activitiesResponse] = await Promise.allSettled([
        testOrdersAPI.getAllTestOrders(),
        eventLogAPI.getDoctorLogs()
      ]);
      
      // Handle test orders data
      if (testOrdersResponse.status === 'fulfilled') {
        const testOrders = testOrdersResponse.value.data.data || testOrdersResponse.value.data || [];
        
        // Calculate tests today
        const today = new Date().toISOString().split('T')[0];
        const todayCount = testOrders.filter((order: any) => {
          const dateField = order.created_at || order.createdAt || order.dateCreated;
          if (!dateField) return false;
          try {
            const orderDate = new Date(dateField).toISOString().split('T')[0];
            return orderDate === today;
          } catch {
            return false;
          }
        }).length;
        
        setTestsToday(todayCount);
        setTestsLoading(false);
        
        // Generate chart data for last 14 days
        const chartPoints: ChartDataPoint[] = [];
        for (let i = 13; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const ordersOnThisDay = testOrders.filter((order: any) => {
            const dateField = order.createdAt || order.created_at;
            if (!dateField) return false;
            try {
              const orderDate = new Date(dateField).toISOString().split('T')[0];
              return orderDate === dateString;
            } catch {
              return false;
            }
          });
          
          const count = ordersOnThisDay.length;
          const status = count >= 10 ? 'abnormal' : 'normal';
          
          chartPoints.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: count,
            fullDate: dateString,
            status: status
          });
        }
        
        setChartData(chartPoints);
        setChartLoading(false);
      } else {
        console.error('❌ Error fetching test orders:', testOrdersResponse.reason);
        setTestsLoading(false);
        setTestsError('Failed to load test data');
        setChartLoading(false);
        setChartData([]);
      }
      
      // Handle activities data
      if (activitiesResponse.status === 'fulfilled') {
        const apiLogs = activitiesResponse.value.data.data || [];
        
        const activities: RecentActivity[] = apiLogs
          .slice(0, 5)
          .map((log: EventLogItem) => {
            const createdDate = new Date(log.createdAt);
            
            let status: 'Completed' | 'In Progress' | 'Failed' | 'Warning' = 'Completed';
            const message = log.message.toLowerCase();
            if (message.includes('error') || message.includes('failed')) {
              status = 'Failed';
            } else if (message.includes('warning') || message.includes('deleted')) {
              status = 'Warning';
            } else if (message.includes('progress') || message.includes('update')) {
              status = 'In Progress';
            }
            
            return {
              id: log._id,
              description: log.message,
              time: createdDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false
              }),
              date: createdDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
              user: log.performedBy || 'Unknown User',
              status: status
            };
          });
        
        setRecentActivities(activities);
        setActivitiesLoading(false);
      } else {
        console.error('❌ Error fetching activities:', activitiesResponse.reason);
        setRecentActivities([]);
        setActivitiesLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setTestsLoading(false);
      setTestsError('An unexpected error occurred');
      setChartLoading(false);
      setActivitiesLoading(false);
    }
  }, []);

  // Load dashboard data on mount
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

  // Format time and date functions
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

  // Fix onChange function to match Value and event types of react-calendar
  const handleDateChange = (value: any) => {
    let newDate = value instanceof Date ? value : (Array.isArray(value) && value[0] instanceof Date ? value[0] : null);
    if (newDate) {
      setSelectedDate(newDate);
      setCalendarDate(newDate);
    }
  };

  // Handle month/year navigation with arrows
  const handleActiveStartDateChange = (args: { action?: string; activeStartDate: Date | null; value?: any; view?: string }) => {
    if (args.activeStartDate) {
      setCalendarDate(args.activeStartDate);
    }
  };

  // Handle view change
  const handleViewChange = (args: { action?: string; activeStartDate: Date | null; value?: any; view: string }) => {
    setCalendarView(args.view as 'month' | 'year' | 'decade' | 'century');
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const event = events.find((e) => e.date.toDateString() === date.toDateString());
      if (event) {
        return <div style={{ textAlign: 'center' }}><span style={{ color: '#2563eb', fontWeight: 'bold' }}>•</span></div>;
      }
    }
    return null;
  };

  const eventForSelected = events.filter((e) => e.date.toDateString() === selectedDate.toDateString());

  return (
    <>
      <style>{`
        /* Force calendar tiles to be visible in both light and dark mode */
        .custom-calendar-clean .react-calendar__tile {
          color: #1f2937 !important;
          background-color: #ffffff !important;
        }
        .custom-calendar-clean .react-calendar__tile:hover {
          background-color: #f0f9ff !important;
          color: #1d4ed8 !important;
        }
        .custom-calendar-clean .react-calendar__tile--now {
          background-color: #fef3c7 !important;
          color: #92400e !important;
          font-weight: bold !important;
        }
        .custom-calendar-clean .react-calendar__tile--active {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        /* Dark mode overrides */
        .dark .custom-calendar-clean .react-calendar__tile {
          color: #f9fafb !important;
          background-color: #374151 !important;
        }
        .dark .custom-calendar-clean .react-calendar__tile:hover {
          background-color: #4b5563 !important;
          color: #60a5fa !important;
        }
        .dark .custom-calendar-clean .react-calendar__tile--now {
          background-color: #fbbf24 !important;
          color: #92400e !important;
          font-weight: bold !important;
        }
        .dark .custom-calendar-clean .react-calendar__tile--active {
          background-color: #2563eb !important;
          color: white !important;
        }
        .dark .custom-calendar-clean .react-calendar__navigation {
          background-color: #1f2937 !important;
        }
        .dark .custom-calendar-clean .react-calendar__navigation button {
          color: #60a5fa !important;
        }
        .dark .custom-calendar-clean .react-calendar__month-view__weekdays {
          color: #9ca3af !important;
        }
        .dark .custom-calendar-clean .react-calendar__month-view__weekdays__weekday {
          color: #9ca3af !important;
        }
        .dark .custom-calendar-clean .react-calendar__month-view__days__day {
          color: #f9fafb !important;
        }
        .dark .custom-calendar-clean .react-calendar__month-view__days__day--weekend {
          color: #fca5a5 !important;
        }
        .dark .custom-calendar-clean .react-calendar__month-view__days__day--neighboringMonth {
          color: #6b7280 !important;
        }
      `}</style>
      <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden">

      {/* Stats Card - Tests Today Only */}
      <div className="w-full md:max-w-md mb-4 md:mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border-l-4 border-green-500 dark:border-green-400 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1">Tests Today</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {testsLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 md:h-8 w-12 md:w-16 rounded"></div>
                ) : testsError ? (
                  <span className="text-red-500 text-xs md:text-sm">Error</span>
                ) : (
                  testsToday.toLocaleString()
                )}
              </p>
              <p className="text-yellow-500 dark:text-yellow-400 text-xs font-medium mt-2">Current Day</p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7 text-green-600 dark:text-green-400">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 mb-4 md:mb-6 items-start sm:items-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Test Volume</h2>
            <div className="flex flex-wrap gap-3 sm:ml-auto">
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm md:text-base">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Normal Load
              </span>
              <span className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 font-medium text-sm md:text-base">
                <span className="w-3 h-3 bg-yellow-400 inline-block" style={{clipPath:'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius:'2px'}}></span>High Load
              </span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-4">Last 14 days - Laboratory Test Volume</p>
          {chartLoading ? (
            <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-4 mb-6 flex items-center justify-center" style={{ height: 260 }}>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading chart data...</span>
              </div>
            </div>
          ) : (
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-4 mb-6" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#e0e7ff" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{fontSize:14, fill:'#6b7280', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 'auto']} tick={{fontSize:14, fill:'#6b7280', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius:12, background:'#fff', border:'1px solid #e0e7ff', fontSize:14, fontWeight:'bold'}} 
                  formatter={(value: any) => [`${value} orders`, 'Test Orders']}
                />
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
          </div>
          )}
          {!chartLoading && chartData.length > 0 && (
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">Recent Test Results</h3>
              <div className="space-y-2 md:space-y-3">
                {chartData.slice(-5).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className={`w-3 h-3 md:w-4 md:h-4 rounded-full inline-block flex-shrink-0 ${
                      item.status === 'abnormal' 
                        ? 'bg-yellow-400 dark:bg-yellow-500' 
                        : 'bg-green-500 dark:bg-green-400'
                    }`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.fullDate} - {item.value} tests
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100">
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.status === 'abnormal' ? 'High Load' : 'Normal'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2 items-center">
            <input type="text" placeholder="" className="flex-1 border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-3 md:px-4 py-2 text-sm md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 transition" />
            <button className="w-20 md:w-28 h-10 md:h-12 text-sm md:text-lg font-bold rounded-lg shadow bg-black dark:bg-gray-800 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition">See</button>
          </div>
          <div className="w-full text-center mt-2">
            <button className="text-blue-600 dark:text-blue-400 text-base md:text-lg font-bold hover:underline">See detail</button>
                  </div>
                </div>
        <div className="w-full lg:w-80 flex flex-col gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl shadow-lg p-4 md:p-6 text-center text-white border border-violet-200">
            <div className="text-lg md:text-xl font-bold mb-2">Today is {getDayOfWeek(currentTime)}</div>
            <div className="text-violet-100 text-base md:text-lg font-medium">{formatTime(currentTime)}</div>
            <div className="text-violet-200 text-xs md:text-sm mt-2">{formatDate(currentTime)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-5 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h3 className="font-bold mb-2 text-base md:text-lg text-gray-900 dark:text-gray-100">Calendar</h3>
            <div className="mb-2 flex justify-center">
              {calendarView !== 'month' && (
                <button
                  className="mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition"
                  onClick={() => {
                    setCalendarView('month');
                  }}
                >Back</button>
              )}
              <Calendar
                value={selectedDate}
                onChange={handleDateChange}
                tileContent={tileContent}
                className="custom-calendar-clean dark:bg-gray-800 dark:text-gray-100"
                calendarType="gregory"
                prevLabel={<span className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition text-base">&#60;</span>}
                nextLabel={<span className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition text-base">&#62;</span>}
                navigationLabel={({ label }: { label: string }) => (
                  <span className="font-semibold text-base text-blue-600 dark:text-blue-400">{label}</span>
                )}
                tileClassName={({ date, view }: { date: Date; view: string }) => {
                  let classes = "text-sm px-2 py-1 rounded transition-all duration-150 font-medium";
                  if (view === "month") {
                    if (date.toDateString() === selectedDate.toDateString()) {
                      classes += " bg-blue-600 dark:bg-blue-500 text-white shadow";
                    } else {
                      // Base styling for all dates
                      classes += " bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600";
                    }
                    if (date.getDay() === 0 || date.getDay() === 6) {
                      classes += " text-red-500 dark:text-red-400";
                    }
                    if (events.some(e => e.date.toDateString() === date.toDateString())) {
                      classes += " relative";
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
                border-radius: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.07);
                padding: 0.5rem;
                border: 1px solid #e0e7ff;
                max-width: 270px;
                margin: 0 auto;
                background: white;
              }
              
              .dark .custom-calendar-clean {
                background: #1f2937;
                border: 1px solid #374151;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              }
              
              .custom-calendar-clean .react-calendar__tile.relative::after {
                content: '';
                display: block;
                margin: 0 auto;
                width: 8px;
                height: 8px;
                background: #2563eb;
                border-radius: 50%;
                margin-top: 2px;
                box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
              }
              
              .dark .custom-calendar-clean .react-calendar__tile.relative::after {
                background: #60a5fa;
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.4);
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
                width: 28px;
                height: 28px;
                background: transparent;
                border: none;
                margin: 0 2px;
                padding: 0;
                font-size: 1rem;
                color: #2563eb;
                border-radius: 50%;
                box-shadow: none;
                transition: all 0.2s ease;
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
                font-size: 0.95rem;
                font-weight: 600;
                color: #374151;
                letter-spacing: 1px;
                text-align: center;
                border-bottom: 1px dashed #d1d5db;
                padding: 0.5rem 0;
                background: rgba(249, 250, 251, 0.8);
                border-radius: 0.5rem 0.5rem 0 0;
              }
              
              .dark .custom-calendar-clean .react-calendar__month-view__weekdays {
                color: #f3f4f6;
                background: rgba(17, 24, 39, 0.8);
                border-bottom: 1px dashed #6b7280;
              }
            `}</style>
            {eventForSelected.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded shadow text-sm">
                <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Event:</div>
                {eventForSelected.map((e, idx) => (
                  <div key={idx} className="text-gray-700 dark:text-gray-300">{e.title}</div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Activities</h2>
          <button 
            onClick={() => window.location.href = '/nurse/eventlog'}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-lg transition"
          >
            View All
          </button>
        </div>

        {/* Loading State */}
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading activities...</span>
            </div>
          </div>
        ) : recentActivities.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
          </div>
        ) : (
          // Data Table
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Time</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Date</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity, index) => (
                  <tr 
                    key={activity.id} 
                    className={`${index !== recentActivities.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                  >
                    <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-900 dark:text-gray-100">
                      <div className="max-w-[200px] md:max-w-none truncate">{activity.description}</div>
                      <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time} • {activity.date}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{activity.time}</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{activity.date}</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-gray-900 dark:text-gray-100 font-medium">
                      <div className="max-w-[100px] md:max-w-none truncate">{activity.user}</div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        activity.status === 'Completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : activity.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : activity.status === 'Failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Home
