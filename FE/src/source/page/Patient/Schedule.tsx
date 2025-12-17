import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  DatePicker,
  Input,
  Form,
  message,
  Tag,
  Spin,
  Empty,
  Select,
} from "antd";

const { TextArea } = Input;
import dayjs from "dayjs";
import { api } from "../Axios/Axios";
import "dayjs/locale/vi";
import { useNavigate } from "react-router-dom";

dayjs.locale("vi");


const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userid || payload.userId || payload.id;
  } catch {
    return null;
  }
};

interface Nurse {
  userid: string;
  username: string;
  fullName: string;
  email: string;
  image?: string;
  specialization?: string;
}

interface Consultation {
  consultationId: string;
  userid: string;
  nurseId: string;
  nurseName?: string;
  nurseUsername?: string;
  scheduledTime: string;
  endTime: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  notes?: string;
  meetingLink?: string;
}

const PatientSchedule = () => {
  const navigate = useNavigate();
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  
  const getBookedSlots = (date: dayjs.Dayjs) => {
    if (!date) return [];
    const dateStr = date.format('YYYY-MM-DD');
    
    console.log("getBookedSlots called with:", { dateStr, allConsultations });
   
    const booked = (allConsultations || [])
      .filter(app => {
        const appDate = dayjs(app.scheduledTime).format('YYYY-MM-DD');
        const isDateMatch = appDate === dateStr;
        const isStatusMatch = app.status === 'pending' || app.status === 'approved';
        
        console.log("Checking app:", { 
          appDate, 
          isDateMatch, 
          isStatusMatch,
          time: dayjs(app.scheduledTime).format('HH:mm')
        });
        
        return isDateMatch && isStatusMatch;
      })
      .map(app => dayjs(app.scheduledTime).format('HH:mm'));
    
    console.log("Booked slots for this nurse:", booked);
    return booked;
  };
  
 
  const allowedTimeSlots = [
    { value: "08:00", label: "08:00" },
    { value: "10:00", label: "10:00" },
    { value: "13:00", label: "13:00" },
    { value: "15:00", label: "15:00" },
    { value: "16:00", label: "16:00" }
  ];

  const userid = getUserIdFromToken() || localStorage.getItem("userid") || localStorage.getItem("userId");

  // Fetch user's consultations
  const fetchUserConsultations = async () => {
    setLoading(true);
    try {
      const res = await api.get<Consultation[]>("/consultations/my-consultations");
      const data = res.data;
      setConsultations(Array.isArray(data) ? data : []);
    } catch {
      message.error("Not able to load your consultations");
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultations for a specific nurse (all patients with this nurse)
  const fetchNurseConsultations = async (nurseId: string) => {
    try {
      // Get all consultations for this nurse from all patients
      const res = await api.get<Consultation[]>(`/consultations/nurse/${nurseId}`);
      console.log("All consultations for this nurse:", res.data);
      console.log("NurseId:", nurseId);
      setAllConsultations(res.data || []);
    } catch (error) {
      console.error("Could not fetch consultations for nurse:", error);
      setAllConsultations([]);
    }
  };

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const res = await api.get<Nurse[]>("/consultations/nurses/all");
        const data = res.data;
        setNurses(Array.isArray(data) ? data : []);
      } catch {
        message.error("Not able to load nurse list");
        setNurses([]);
      }
    };

    fetchNurses();
    fetchUserConsultations();
  }, []);


  const openModal = (nurse: Nurse) => {
    setSelectedNurse(nurse);
    fetchNurseConsultations(nurse.userid);
    setIsModalVisible(true);
  };

 
  const handleBookConsultation = async () => {
    try {
      const values = await form.validateFields();
      
   
      const bookedSlots = getBookedSlots(values.date);
      if (bookedSlots.includes(values.time)) {
        message.error('This time slot has been booked');
        return;
      }

      const [hours, minutes] = values.time.split(':');
      const scheduledTime = dayjs(values.date)
        .hour(parseInt(hours))
        .minute(parseInt(minutes))
        .second(0)
        .toISOString();

      await api.post("/consultations/request", {
        nurseUsername: selectedNurse?.username,
        scheduledTime,
        notes: values.notes || "",
      });

      message.success("Booking successful!");
      setIsModalVisible(false);
      form.resetFields();
      fetchUserConsultations();
    } catch {
      message.error("Unable to book appointment");
    }
  };

  
  const handleJoinRoom = (consultation: Consultation) => {
  
    if (!userid) {
      message.error("Cannot determine your UID to join!");
      return;
    }

    const targetUrl = `/patient/consultation/${consultation.consultationId}/zegocloud`;
    

    navigate(targetUrl, {
      state: { 
        roomId: consultation.consultationId,
        userId: userid,
        userName: "Patient"
      }
    });

    
    setTimeout(() => {
      if (window.location.pathname === "/patient/schedule") {
        console.warn("⚠️ [Patient] Navigate failed, using window.location.href");
        window.location.href = targetUrl;
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#e6f7f6] to-[#f0f9f8] dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <span className="text-[#5FB8B3] text-2xl sm:text-3xl">💉</span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#2c7a75] dark:text-teal-300">Book Consultation</h1>
      </div>

      {/* Doctor List */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-700 dark:text-gray-200">Doctors List</h2>
        {nurses.length === 0 ? (
          <Empty description="No doctors available." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.isArray(nurses) && nurses.map((nurse) => (
              <div 
                key={nurse.userid} 
                className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative border dark:border-gray-700"
              >
                {/* Ảnh và gradient overlay */}
                <div className="relative h-48 sm:h-52">
                  <img
                    src={nurse.image || "/default-nurse.jpg"}
                    alt={nurse.fullName}
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    style={{ objectPosition: 'center 20%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60"></div>
                </div>

                {/* Status badge */}
                {/* Doctor Information */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-cyan-300 transition-colors">
                    {nurse.fullName}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-200 mb-2 sm:mb-3">
                    {nurse.specialization || "General Medicine"}
                  </p>
                  
                  {/* Email với hiệu ứng backdrop */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-100 truncate">
                      <span className="mr-2">✉️</span>
                      {nurse.email}
                    </p>
                  </div>

                  {/* Book Button */}
                  <Button 
                    type="primary"
                    onClick={() => openModal(nurse)}
                    className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-[#5FB8B3] hover:from-[#5FB8B3] hover:to-cyan-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span className="text-base sm:text-lg mr-1">📅</span>
                    <span className="hidden sm:inline">Book Appointment Now</span>
                    <span className="sm:hidden">Book Now</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-700 dark:text-gray-200">Booking History</h2>
        {consultations.length === 0 ? (
          <Empty description="No consultations yet." />
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-[#e6f7f6] dark:bg-teal-900">
                    <tr>
                      <th className="py-3 px-3 sm:px-4 text-left text-xs sm:text-sm text-[#2c7a75] dark:text-teal-300 font-semibold whitespace-nowrap">Date</th>
                      <th className="py-3 px-3 sm:px-4 text-left text-xs sm:text-sm text-[#2c7a75] dark:text-teal-300 font-semibold whitespace-nowrap">Time</th>
                      <th className="py-3 px-3 sm:px-4 text-left text-xs sm:text-sm text-[#2c7a75] dark:text-teal-300 font-semibold whitespace-nowrap">Doctor</th>
                      <th className="py-3 px-3 sm:px-4 text-left text-xs sm:text-sm text-[#2c7a75] dark:text-teal-300 font-semibold hidden md:table-cell">Notes</th>
                      <th className="py-3 px-3 sm:px-4 text-left text-xs sm:text-sm text-[#2c7a75] dark:text-teal-300 font-semibold whitespace-nowrap">Status</th>
                      <th className="py-3 px-3 sm:px-4 text-left text-xs sm:text-sm text-[#2c7a75] dark:text-teal-300 font-semibold whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-[#E3F6F5] dark:divide-gray-700">
                    {Array.isArray(consultations) && consultations.map((item) => (
                      <tr 
                        key={item.consultationId} 
                        className="hover:bg-[#f0f9f8] dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap">
                          <span className="hidden sm:inline">{dayjs(item.scheduledTime).format("DD/MM/YYYY")}</span>
                          <span className="sm:hidden">{dayjs(item.scheduledTime).format("DD/MM")}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-nowrap">
                          {dayjs(item.scheduledTime).format("HH:mm")}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {item.nurseName || item.nurseUsername || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                          {item.notes || "No notes"}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                          <Tag 
                            color={
                              item.status === "approved" ? "success" : 
                              item.status === "pending" ? "warning" : 
                              item.status === "completed" ? "processing" : "error"
                            }
                            className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                          >
                            <span className="hidden sm:inline">
                              {item.status === "approved" ? "Confirmed" :
                               item.status === "pending" ? "Pending" :
                               item.status === "completed" ? "Completed" : "Cancelled"}
                            </span>
                            <span className="sm:hidden">
                              {item.status === "approved" ? "✓" :
                               item.status === "pending" ? "⏳" :
                               item.status === "completed" ? "✓✓" : "✗"}
                            </span>
                          </Tag>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                          {item.status === "approved" ? (
                            <Button
                              type="primary"
                              onClick={() => handleJoinRoom(item)}
                              className="bg-gradient-to-r from-[#5FB8B3] to-[#4a9d99] hover:from-[#4a9d99] hover:to-[#2c7a75] border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-2 h-10 text-sm font-semibold flex items-center justify-center gap-2"
                            >
                              
                              <span>Join Room</span>
                            </Button>
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
          </div>
        )}
      </div>

      {/* Modal booking */}
      <Modal
        title={
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold">Book Consultation</h3>
            <p className="text-sm sm:text-base text-gray-500 mt-1">with Dr. {selectedNurse?.fullName}</p>
          </div>
        }
        open={isModalVisible}
        onOk={handleBookConsultation}
        onCancel={() => setIsModalVisible(false)}
        okText="Confirm Booking"
        cancelText="Cancel"
        width="95%"
        style={{ maxWidth: '600px' }}
        className="custom-modal"
      >
        <div className="bg-blue-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={selectedNurse?.image || "/default-nurse.jpg"}
              alt={selectedNurse?.fullName}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base sm:text-lg dark:text-gray-200 truncate">{selectedNurse?.fullName}</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">{selectedNurse?.specialization || "General Medicine"}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{selectedNurse?.email}</p>
            </div>
          </div>
        </div>

        <Form layout="vertical" form={form} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Form.Item
              label="Appointment Date"
              name="date"
              rules={[{ required: true, message: "Please select a date!" }]}
              className="mb-3 sm:mb-0"
            >
              <DatePicker 
                className="w-full" 
                disabledDate={(d) => d < dayjs()} 
                format="DD/MM/YYYY"
                placeholder="Select date"
                onChange={(date) => {
                  // Reset selected time when date changes
                  form.setFieldValue('time', undefined);
                  if (date) {
                    // Update form with new date
                    form.setFieldValue('date', date);
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="Appointment Time"
              name="time"
              rules={[{ required: true, message: "Please select a time!" }]}
              className="mb-3 sm:mb-0"
            >
              <Select
                placeholder="Select time"
                className="w-full"
                onChange={(time) => form.setFieldValue('time', time)}
              >
                {allowedTimeSlots.map(time => {
                  const date = form.getFieldValue('date');
                  const isBooked = date && getBookedSlots(dayjs(date)).includes(time.value);
                  return (
                    <Select.Option 
                      key={time.value} 
                      value={time.value} 
                      disabled={isBooked}
                    >
                      <span className="text-sm sm:text-base">{time.label}</span>
                      {isBooked && <span className="text-red-500 ml-2 text-xs sm:text-sm">(Already booked)</span>}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>

          <Form.Item 
            label="Notes for Doctor" 
            name="notes"
            help="Please briefly describe your condition"
          >
            <TextArea 
              rows={4} 
              placeholder="Example: I need consultation about..." 
              className="resize-none text-sm sm:text-base"
            />
          </Form.Item>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg mt-3 sm:mt-4">
            <h5 className="font-medium mb-2 text-sm sm:text-base dark:text-gray-200">Important Notes:</h5>
            <ul className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm space-y-1">
              <li>• Please book at least 24 hours in advance</li>
              <li>• Consultation duration is 30 minutes</li>
              <li>• You can cancel appointments up to 2 hours before</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientSchedule;
