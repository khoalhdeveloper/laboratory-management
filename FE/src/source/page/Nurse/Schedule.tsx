import { useState, useEffect, useCallback } from "react";
import { message, Tag, Button, Pagination, Spin, Empty } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { api } from "../Axios/Axios";

// Configure dayjs to handle timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");
import { useNavigate } from "react-router-dom";

interface Consultation {
  consultationId: string;
  userid: string;
  nurseId: string;
  patientName?: string;
  scheduledTime: string;
  endTime: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
}

const statusColor: Record<string, string> = {
  pending: "orange",
  approved: "green",
  completed: "blue",
  cancelled: "red",
};

const Schedule = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(dayjs().tz());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const nurseUserId = localStorage.getItem("userid") || localStorage.getItem("userId");

  // Fetch lịch tư vấn
  const fetchNurseConsultations = useCallback(async () => {
    if (!nurseUserId) {
      message.error("You are not logged in!");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get<Consultation[]>(`/consultations/nurse/${nurseUserId}`);
      setConsultations(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Could not load your consultations");
    } finally {
      setLoading(false);
    }
  }, [nurseUserId]);

  useEffect(() => {
    fetchNurseConsultations();
  }, [fetchNurseConsultations]);

  // Ensure consultations are fetched and filtered correctly
  const filteredConsultations = consultations.filter(c => 
    c.status === "pending" || c.status === "approved"
  );

  const getCurrentWeekDates = () => {
    // Make sure we're working with local time
    const startOfWeek = currentWeek.clone().tz().startOf('week');
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = startOfWeek.clone().add(i, 'day');
      return {
        date: date,
        label: date.format('DD/MM'),
        dayName: date.locale('en').format('dddd'),
      };
    });
    return dates;
  };

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek.add(1, 'week'));
  };

  const handlePrevWeek = () => {
    setCurrentWeek(currentWeek.subtract(1, 'week'));
  };

  const timeSlots = [
    { label: 'Slot 1', time: '08:00 - 09:00' },
    { label: 'Slot 2', time: '10:00 - 11:00' },
    { label: 'Slot 3', time: '13:00 - 14:00' },
    { label: 'Slot 4', time: '15:00 - 16:00' },
  ];

  // Cập nhật trạng thái
  const handleUpdateStatus = async (consultationId: string, status: "approved" | "cancelled" | "completed") => {
    try {
      const hide = message.loading("Updating status...", 0);
      await api.put(`/consultations/status/${consultationId}`, { status });
      hide();
      const statusText = status === "approved" ? "approved" : status === "cancelled" ? "cancelled" : "completed";
      message.success(`Successfully ${statusText} the appointment!`);
      fetchNurseConsultations();
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    }
  };

  const handleJoinRoom = (consultation: { consultationId: string }) => {
    if (!nurseUserId) {
      message.error("Could not identify your UID to join!");
      return;
    }
    navigate(`/nurse/consultation/${consultation.consultationId}/zegocloud`);
  };

  if (loading) return <Spin size="large" className="p-4 sm:p-8 text-center" />;

  if (consultations.length === 0) return <Empty description="You don't have any consultations yet." className="p-4 sm:p-8" />;
  
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-200">Consultation Schedule</h1>
          <div className="flex flex-wrap gap-2 sm:space-x-2">
            <Button onClick={handlePrevWeek} size="small" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">&lt; Previous Week</span>
              <span className="sm:hidden">&lt; Prev</span>
            </Button>
            <Button onClick={() => setCurrentWeek(dayjs())} size="small" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Current Week</span>
              <span className="sm:hidden">Today</span>
            </Button>
            <Button onClick={handleNextWeek} size="small" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Next Week &gt;</span>
              <span className="sm:hidden">Next &gt;</span>
            </Button>
          </div>
        </div>

        {/* Weekly Schedule Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 sm:mb-8 overflow-x-auto -mx-4 sm:mx-0 border dark:border-gray-700">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="bg-teal-50 dark:bg-teal-900">
                  <th className="p-2 sm:p-4 border-b dark:border-gray-700 text-left text-xs sm:text-sm text-teal-700 dark:text-teal-300 whitespace-nowrap sticky left-0 bg-teal-50 dark:bg-teal-900 z-10">Time</th>
                  {getCurrentWeekDates().map((day) => (
                    <th key={day.date.format()} className="p-2 sm:p-4 border-b dark:border-gray-700 text-center text-xs sm:text-sm text-teal-700 dark:text-teal-300 min-w-[120px] sm:min-w-[150px]">
                      <div className="font-semibold">{day.dayName}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{day.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.label} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-2 sm:p-4 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">{slot.time}</td>
                    {getCurrentWeekDates().map((day) => {
                      const consultation = filteredConsultations.find(c => {
                        // Convert UTC time to local time
                        const consultationTime = dayjs(c.scheduledTime).tz();
                        const slotStartTime = slot.time.split(' - ')[0];
                        
                        // Compare only the date part
                        const isSameDay = consultationTime.format('YYYY-MM-DD') === day.date.format('YYYY-MM-DD');
                        // Convert slot time to 24-hour format for comparison
                        const slotHour = parseInt(slotStartTime.split(':')[0]);
                        const slotMinute = parseInt(slotStartTime.split(':')[1]);
                        const consultationHour = consultationTime.hour();
                        const consultationMinute = consultationTime.minute();
                        
                        const isSameTime = consultationHour === slotHour && consultationMinute === slotMinute;
                        
                        return isSameDay && isSameTime;
                      });

                      return (
                        <td key={day.date.format()} className="p-2 sm:p-4 border-l dark:border-gray-700 align-top">
                          {consultation && (consultation.status === "pending" || consultation.status === "approved") && (
                            <div className="p-2 rounded bg-gray-50 dark:bg-gray-700 min-w-[110px]">
                              <div className="text-xs sm:text-sm font-medium dark:text-gray-200 truncate" title={consultation.patientName || consultation.userid}>
                                {consultation.patientName || consultation.userid}
                              </div>
                              <Tag
                                color={statusColor[consultation.status]}
                                className="mt-1 text-xs"
                              >
                                {consultation.status}
                              </Tag>
                              {consultation.status === "pending" && (
                                <div className="mt-2">
                                  <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => handleUpdateStatus(consultation.consultationId, "approved")}
                                    className="bg-green-500 hover:bg-green-600 text-xs w-full"
                                  >
                                    Approve
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 dark:text-gray-200">Booking History</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold dark:text-gray-200 whitespace-nowrap">Patient</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold dark:text-gray-200 whitespace-nowrap">Date</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold dark:text-gray-200 whitespace-nowrap">Time</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold dark:text-gray-200 hidden md:table-cell">Notes</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold dark:text-gray-200 whitespace-nowrap">Status</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold dark:text-gray-200 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {consultations
                    .filter(c => c.status !== "pending")
                    .sort((a, b) => dayjs(b.scheduledTime).valueOf() - dayjs(a.scheduledTime).valueOf())
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((consultation) => (
                      <tr key={consultation.consultationId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap max-w-[120px] truncate" title={consultation.patientName || consultation.userid}>
                          {consultation.patientName || consultation.userid}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap">
                          <span className="hidden sm:inline">{dayjs(consultation.scheduledTime).format('DD/MM/YYYY')}</span>
                          <span className="sm:hidden">{dayjs(consultation.scheduledTime).format('DD/MM')}</span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap">
                          {dayjs(consultation.scheduledTime).format('HH:mm')}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-xs truncate" title={consultation.notes || 'No notes'}>
                          {consultation.notes || 'No notes'}
                        </td>
                        <td className="p-2 sm:p-3 whitespace-nowrap">
                          <Tag color={statusColor[consultation.status]} className="text-xs">
                            <span className="hidden sm:inline">{consultation.status}</span>
                            <span className="sm:hidden">
                              {consultation.status === "approved" ? "✓" :
                               consultation.status === "pending" ? "⏳" :
                               consultation.status === "completed" ? "✓✓" : 
                               consultation.status === "cancelled" ? "✗" : "⏳"}
                            </span>
                          </Tag>
                        </td>
                        <td className="p-2 sm:p-3 whitespace-nowrap">
                          {consultation.status === "approved" ? (
                            <div className="flex flex-col gap-1">
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleJoinRoom(consultation)}
                                className="bg-blue-500 hover:bg-blue-600 text-xs h-7 sm:h-auto"
                              >
                                Join
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleUpdateStatus(consultation.consultationId, "completed")}
                                className="text-xs h-7 sm:h-auto"
                              >
                                Complete
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex justify-center sm:justify-end">
            <Pagination
              current={currentPage}
              total={consultations.filter(c => c.status !== "pending").length}
              pageSize={pageSize}
              onChange={(page: number) => setCurrentPage(page)}
              showSizeChanger={false}
              size="small"
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
