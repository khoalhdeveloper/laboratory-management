import { useState } from "react";
import { Button } from "./ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import Calendar from "react-calendar";

// Dashboard Admin Styles - Moved from Dashboard.css
const dashboardStyles = `
  .admin-dashboard {
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 2rem;
  }
  
  .dark .admin-dashboard {
    background-color: #111827;
  }

  /* React Calendar Base Styles */
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

const demoData = [
  { date: "Mar 27", value: 1 },
  { date: "Apr 1", value: 4 },
  { date: "Apr 7", value: 6 },
  { date: "Apr 13", value: 7.8 },
  { date: "May 5", value: 6.3 },
  { date: "May 15", value: 7.8 },
];

const events = [
  { date: new Date(2022, 8, 8), title: "Monthly doctor's meet" },
  { date: new Date(2022, 8, 15), title: "Important Meeting" },
];

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'year' | 'decade' | 'century'>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // Sửa hàm onChange để đúng kiểu Value và event của react-calendar
  const handleDateChange = (value: any) => {
    let newDate = value instanceof Date ? value : (Array.isArray(value) && value[0] instanceof Date ? value[0] : null);
    if (newDate) {
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
      <style>{dashboardStyles}</style>
      <div className="flex flex-col gap-6 p-8 bg-gradient-to-br from-gray-50 to-sky-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {/* Total Patients */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2,847</p>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 12% from last month</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-violet-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 8% from last month</p>
            </div>
            <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-violet-600">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tests Today */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Tests Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">432</p>
              <p className="text-yellow-500 text-xs font-medium mt-2">→ 2% from yesterday</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-green-600">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$89.4K</p>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 23% from last month</p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-amber-600">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-6 mb-6 items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Graph</h2>
            <span className="flex items-center gap-2 text-green-600 font-medium text-base ml-auto">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Normal
            </span>
            <span className="flex items-center gap-2 text-yellow-500 font-medium text-base">
              <span className="w-3 h-3 bg-yellow-400 inline-block" style={{clipPath:'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius:'2px'}}></span>Abnormalities
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Between March 27 - May 17, 2022</p>
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-xl p-4 mb-6" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoData} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                <XAxis dataKey="date" tick={{fontSize:16, fill:'#6b7280', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 8]} tick={{fontSize:16, fill:'#6b7280', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:12, background:'#fff', border:'1px solid #e0e7ff', fontSize:16, fontWeight:'bold'}} />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#colorValue)" strokeWidth={4} dot={{ r: 7, fill:'#2563eb', stroke:'#fff', strokeWidth:3 }} />
                {/* Normal dot + label */}
                <ReferenceDot x="Apr 7" y={6} r={9} fill="#22c55e" stroke="#fff" label={<text x={0} y={-24} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#22c55e" style={{fontFamily:'inherit'}}>Normal</text>} />
                {/* Abnormal dot + label (yellow, top right) - fix position to always show */}
                <ReferenceDot x="May 15" y={7.8} r={9} fill="#facc15" stroke="#fff" label={<text x={70} y={-24} textAnchor="start" fontSize={18} fontWeight="bold" fill="#facc15" style={{fontFamily:'inherit'}}>Abnormal</text>} />
                {/* Value label (blue, right edge) - move outside chart */}
                <ReferenceLine x="May 15" stroke="#2563eb" label={<text x={70} y={0} textAnchor="start" fontSize={18} fontWeight="bold" fill="#2563eb" style={{fontFamily:'inherit'}}>7.8</text>} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ul className="mb-6">
            <li className="flex items-center gap-3 text-green-600 text-xl mb-3 font-semibold"><span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span> March 27, 2022 <span className="ml-auto text-gray-700 font-bold">4.1 N</span></li>
            <li className="flex items-center gap-3 text-green-600 text-xl mb-3 font-semibold"><span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span> May 5, 2022 <span className="ml-auto text-gray-700 font-bold">6.3 N</span></li>
            <li className="flex items-center gap-3 text-yellow-500 text-xl mb-3 font-semibold"><span className="w-4 h-4 bg-yellow-400 inline-block" style={{clipPath:'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius:'2px'}}></span> May 15, 2022 <span className="ml-auto text-gray-700 font-bold">7.8 N</span></li>
          </ul>
          <div className="flex gap-2 mt-2 items-center">
            <input type="text" placeholder="" className="flex-1 border border-blue-200 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
            <Button variant="default" className="w-28 h-12 text-lg font-bold rounded-lg shadow bg-black text-white hover:bg-blue-600 transition">See</Button>
          </div>
          <div className="w-full text-center mt-2">
            <Button variant="link" className="text-blue-600 text-lg font-bold">See detail</Button>
          </div>
        </div>
        <div className="w-80 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl shadow-lg p-6 text-center text-white border border-violet-200">
            <div className="text-xl font-bold mb-2">Today is Saturday</div>
            <div className="text-violet-100 text-lg font-medium">8:55 AM</div>
            <div className="text-violet-200 text-sm mt-2">October 6, 2025</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">Calendar</h3>
            <div className="mb-2 flex justify-center">
              {calendarView !== 'month' && (
                <button
                  className="mb-2 px-3 py-1 bg-blue-100 text-blue-600 rounded font-medium hover:bg-blue-200 transition"
                  onClick={() => {
                    setCalendarView('month');
                  }}
                >Back</button>
              )}
              <Calendar
                value={selectedDate}
                onChange={handleDateChange}
                tileContent={tileContent}
                className="custom-calendar-clean"
                calendarType="gregory"
                prevLabel={<span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 transition text-base">&#60;</span>}
                nextLabel={<span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 transition text-base">&#62;</span>}
                navigationLabel={({ label }: { label: string }) => (
                  <span className="font-semibold text-base text-blue-600">{label}</span>
                )}
                tileClassName={({ date, view }: { date: Date; view: string }) => {
                  let classes = "text-sm px-2 py-1 rounded transition-all duration-150 bg-white font-medium";
                  if (view === "month") {
                    if (date.toDateString() === selectedDate.toDateString()) {
                      classes += " bg-blue-600 text-white shadow";
                    }
                    if (date.getDay() === 0 || date.getDay() === 6) {
                      classes += " text-red-500";
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
              }
              .custom-calendar-clean .react-calendar__tile.relative::after {
                content: '';
                display: block;
                margin: 0 auto;
                width: 6px;
                height: 6px;
                background: #ef4444;
                border-radius: 50%;
                margin-top: 2px;
              }
              .custom-calendar-clean .react-calendar__tile--active {
                background: #2563eb !important;
                color: #fff !important;
                font-weight: bold;
                box-shadow: 0 2px 8px #2563eb33;
              }
              .custom-calendar-clean .react-calendar__tile:hover {
                background: #e0e7ff;
                color: #2563eb;
                box-shadow: 0 2px 8px #2563eb22;
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
                transition: background 0.2s, box-shadow 0.2s;
              }
              .custom-calendar-clean .react-calendar__navigation button:disabled {
                color: #d1d5db;
                background: transparent;
              }
              .custom-calendar-clean .react-calendar__navigation button:focus {
                outline: none;
                box-shadow: 0 0 0 2px #2563eb33;
              }
              .custom-calendar-clean .react-calendar__month-view__weekdays {
                font-size: 0.95rem;
                font-weight: 500;
                color: #222;
                letter-spacing: 1px;
                text-align: center;
                border-bottom: 1px dashed #d1d5db;
              }
            `}</style>
            {eventForSelected.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded shadow text-sm">
                <div className="font-semibold text-blue-600 mb-1">Event:</div>
                {eventForSelected.map((e, idx) => (
                  <div key={idx} className="text-gray-700">{e.title}</div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-4 text-lg text-gray-900 dark:text-white">Upcoming Events</h3>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="bg-gradient-to-br from-blue-500 to-violet-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-white shadow">
                M
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Monthly doctor's meet</div>
                <div className="text-sm text-gray-500 mt-1">8 April, 2025 | 04:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
          <button className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-lg transition">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">Create account</td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">09:53:15</td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">08/04/2025</td>
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">David Demo</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">Delete account</td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">09:50:16</td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">08/04/2025</td>
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">David Demo</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">Update patient record</td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">09:45:32</td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">08/04/2025</td>
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">Sarah Johnson</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                    In Progress
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
