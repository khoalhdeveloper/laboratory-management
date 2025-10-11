import { useState } from "react";
import { Button } from "../Admin/ui/button";
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
import "react-calendar/dist/Calendar.css";

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

function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'year' | 'decade' | 'century'>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

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
    <div className="flex flex-col gap-6 p-8 bg-gradient-to-br from-gray-50 to-sky-50 min-h-screen">
      {/* Stats Cards - Only 3 cards without Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">2,847</p>
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
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-violet-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900">156</p>
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
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Tests Today</p>
              <p className="text-3xl font-bold text-gray-900">432</p>
              <p className="text-yellow-500 text-xs font-medium mt-2">→ 2% from yesterday</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-green-600">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
            </div>
                  </div>
                </div>
              </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex gap-6 mb-6 items-center">
            <h2 className="text-2xl font-bold text-gray-900">Activity Graph</h2>
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
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <h3 className="font-bold mb-2 text-lg text-gray-900">Calendar</h3>
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
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <h3 className="font-bold mb-4 text-lg text-gray-900">Upcoming Events</h3>
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
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
          <button className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition">
            View All
          </button>
        </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 px-4 text-gray-900">Create account</td>
                <td className="py-4 px-4 text-gray-600">09:53:15</td>
                <td className="py-4 px-4 text-gray-600">08/04/2025</td>
                <td className="py-4 px-4 text-gray-900 font-medium">David Demo</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 px-4 text-gray-900">Delete account</td>
                <td className="py-4 px-4 text-gray-600">09:50:16</td>
                <td className="py-4 px-4 text-gray-600">08/04/2025</td>
                <td className="py-4 px-4 text-gray-900 font-medium">David Demo</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Completed
                  </span>
                    </td>
                  </tr>
              <tr className="hover:bg-gray-50 transition">
                <td className="py-4 px-4 text-gray-900">Update patient record</td>
                <td className="py-4 px-4 text-gray-600">09:45:32</td>
                <td className="py-4 px-4 text-gray-600">08/04/2025</td>
                <td className="py-4 px-4 text-gray-900 font-medium">Sarah Johnson</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    In Progress
                  </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
      </div>
    </div>
  )
}

export default Home
