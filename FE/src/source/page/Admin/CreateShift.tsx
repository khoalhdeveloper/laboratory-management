import React, { useState, useEffect, useCallback } from 'react';
import { api, adminAPI } from '../../page/Axios/Axios';
import { toast } from '../../../utils/toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  RefreshCw, 
  UserPlus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileClock,
  Search,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Define a Shift type matching backend fields
interface Shift {
  _id?: string;
  shift_id?: string;
  title?: string;
  date?: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
  status?: 'planned' | 'published' | 'cancelled' | 'completed';
  assigned_users?: Array<{ userid: string; role: string }>;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  [key: string]: any;
}

interface User {
  _id?: string;
  userid: string;
  fullName: string;
  email?: string;
  role: string;
  [key: string]: any;
}

const CreateShift = () => {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null);
  const [assignSelectedDoctors, setAssignSelectedDoctors] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'doctor' | 'nurse'>('all');
  const [showCancelled, setShowCancelled] = useState(true); // Show cancelled shifts by default
  const [searchTerm, setSearchTerm] = useState(''); // Search by shift name
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'published' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showStaffModal, setShowStaffModal] = useState<{ shiftId: string; staff: Array<{ userid: string; role: string }> } | null>(null);

  // Helper to format shift date/time robustly
  const formatShiftDateTime = (item: Shift, timeField: 'start_time' | 'end_time') => {
    try {
      const timeVal = item[timeField];
      const dateVal = item.date;

      // If date contains time already (ISO), prefer it and override time if timeVal provided
      if (dateVal) {
        // If date contains 'T' assume full datetime
        if (dateVal.includes('T')) {
          const d = new Date(dateVal);
          if (timeVal && /^\d{2}:\d{2}/.test(timeVal)) {
            const [hh, mm] = timeVal.split(':').map(Number);
            d.setHours(hh);
            d.setMinutes(mm);
          }
          return isNaN(d.getTime()) ? (timeVal || '') : d.toLocaleString();
        }

        // date is likely YYYY-MM-DD, combine with time
        if (timeVal) {
          const d = new Date(dateVal + 'T' + timeVal);
          return isNaN(d.getTime()) ? (timeVal || '') : d.toLocaleString();
        }

        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
      }

      // Fallback to time only
      return timeVal || '';
    } catch {
      return '';
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await adminAPI.getAllAccounts();
      const allAccounts = Array.isArray(res.data) ? res.data : [];
      const doctorAccounts = allAccounts.filter((acc: any) => acc.role === 'doctor' && acc.isActive !== false);
      setDoctors(doctorAccounts);
    } catch (err: unknown) {
      setDoctors([]);
    }
  };

  const fetchNurses = async () => {
    try {
      const res = await adminAPI.getAllAccounts();
      const allAccounts = Array.isArray(res.data) ? res.data : [];
      const nurseAccounts = allAccounts.filter((acc: any) => acc.role === 'nurse' && acc.isActive !== false);
      setNurses(nurseAccounts);
    } catch (err: unknown) {
      setNurses([]);
    }
  };

  // Lấy danh sách ca làm, bác sĩ và y tá khi load trang
  useEffect(() => {
    fetchShifts();
    fetchDoctors();
    fetchNurses();
    // eslint-disable-next-line
  }, []);

  // Helper function to check and auto-publish shifts that have reached their start time
  const autoPublishShiftsIfNeeded = useCallback(async (shiftsList: Shift[]): Promise<boolean> => {
    try {
      const now = new Date();
      const plannedShifts = shiftsList.filter(
        shift => shift.status === 'planned' && shift.shift_id && shift.date && shift.start_time
      );

      let publishedCount = 0;

      for (const shift of plannedShifts) {
        try {
          if (!shift.start_time || !shift.date) continue;
          
          // Parse date and start_time to create full datetime in LOCAL timezone
          let shiftDate: Date;
          if (typeof shift.date === 'string') {
            // If date is in ISO format with time, parse it
            if (shift.date.includes('T')) {
              // Full ISO datetime - parse it
              shiftDate = new Date(shift.date);
              // If time is separate, override with start_time
              if (shift.start_time && /^\d{2}:\d{2}/.test(shift.start_time)) {
                const [hours, minutes] = shift.start_time.split(':').map(Number);
                // Create date in local timezone by parsing components
                const dateStr = shift.date.split('T')[0]; // Get YYYY-MM-DD part
                const [year, month, day] = dateStr.split('-').map(Number);
                shiftDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
              }
            } else {
              // Date is YYYY-MM-DD format, combine with start_time in LOCAL timezone
              const [hours, minutes] = shift.start_time.split(':').map(Number);
              const [year, month, day] = shift.date.split('-').map(Number);
              // Create date in local timezone (month is 0-indexed in Date constructor)
              shiftDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
            }
          } else {
            // Date is already a Date object or other format
            // Extract date components and combine with start_time in LOCAL timezone
            const tempDate = new Date(shift.date);
            const [hours, minutes] = shift.start_time.split(':').map(Number);
            shiftDate = new Date(
              tempDate.getFullYear(),
              tempDate.getMonth(),
              tempDate.getDate(),
              hours || 0,
              minutes || 0,
              0,
              0
            );
          }

          // Validate the parsed date
          if (isNaN(shiftDate.getTime())) {
            console.warn(`Invalid date/time for shift ${shift.shift_id}:`, shift.date, shift.start_time);
            continue;
          }

          // Check if shift start time has actually arrived or passed
          const timeDiff = now.getTime() - shiftDate.getTime();
          const secondsDiff = timeDiff / 1000;

          // Only publish if start time has PASSED (>= 0 seconds, with small buffer for race conditions)
          // Changed from >= 5 to >= 0 to publish exactly at start time
          if (secondsDiff >= 0) {
            // Auto-publish this shift
            try {
              await api.put(`/shifts/publishShift/${shift.shift_id}`);
              publishedCount++;
            } catch (publishErr) {
              // Silently fail - shift might already be published or have an error
              console.warn(`Failed to auto-publish shift ${shift.shift_id}:`, publishErr);
            }
          }
        } catch (shiftError) {
          console.error(`Error processing shift ${shift.shift_id}:`, shiftError);
        }
      }

      // Return true if any shifts were published (to trigger refresh)
      return publishedCount > 0;
    } catch (error) {
      console.error('Error in autoPublishShiftsIfNeeded:', error);
      return false;
    }
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      setFetchError(null);
      const res = await api.get('/shifts');
      // backend returns { message, total, data }
      const all = (res.data && res.data.data) ? res.data.data : [];
      setShifts(all);
      
      // Auto-publish shifts that have reached their start time (async, don't wait)
      autoPublishShiftsIfNeeded(all).then((shouldRefresh) => {
        if (shouldRefresh) {
          // Refresh shifts list after a short delay to get updated status
          setTimeout(() => {
            fetchShifts();
          }, 1000);
        }
      }).catch(err => {
        console.error('Error in auto-publish check:', err);
      });
    } catch (err: unknown) {
      setShifts([]);
      setFetchError((err as any)?.response?.data?.message || 'Unable to load shifts list.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-check and publish shifts every 10 seconds when component is mounted
  // This ensures shifts are published close to their start time
  useEffect(() => {
    const interval = setInterval(async () => {
      // Check shifts and auto-publish if needed
      if (shifts.length > 0) {
        const shouldRefresh = await autoPublishShiftsIfNeeded(shifts);
        // Refresh shifts list if any shifts were published
        if (shouldRefresh) {
          setTimeout(() => {
            fetchShifts();
          }, 1000);
        }
      }
    }, 10000); // Check every 10 seconds for more accurate timing

    return () => clearInterval(interval);
  }, [shifts, autoPublishShiftsIfNeeded]);

  // Làm mới danh sách khi tạo ca thành công
  useEffect(() => {
    if(success) fetchShifts();
    // eslint-disable-next-line
  }, [success]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Client-side validation
    if (!name.trim()) {
      const errorMsg = 'Shift name is required!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (!startTime) {
      const errorMsg = 'Start time is required!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (!endTime) {
      const errorMsg = 'End time is required!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Validate start time is before end time
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    if (isNaN(startDateTime.getTime())) {
      const errorMsg = 'Invalid start time format!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (isNaN(endDateTime.getTime())) {
      const errorMsg = 'Invalid end time format!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (startDateTime >= endDateTime) {
      const errorMsg = 'End time must be after start time!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Check if shift duration is reasonable (at least 15 minutes)
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    if (durationMinutes < 15) {
      const errorMsg = 'Shift duration must be at least 15 minutes!';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setSubmitLoading(true);
    try {
      // backend expects: title, date, start_time, end_time, assigned_users
      // derive date and time parts from datetime-local inputs
      const startParts = startTime ? startTime.split('T') : [];
      const endParts = endTime ? endTime.split('T') : [];
      const date = startParts[0] || (endParts[0] || '');
      const start_time = startParts[1] || '';
      const end_time = endParts[1] || '';

      // Additional validation for extracted parts
      if (!date || !start_time || !end_time) {
        const errorMsg = 'Please select both start and end times!';
        setError(errorMsg);
        toast.error(errorMsg);
        setSubmitLoading(false);
        return;
      }

      console.log('Creating shift with data:', { title: name, date, start_time, end_time });

      // Create shift
      const response = await api.post('/shifts/createShift', {
        title: name,
        date,
        start_time,
        end_time,
      });

      console.log('Shift created successfully:', response.data);

      // Don't auto-publish when creating new shifts
      // Shifts will be auto-published by the scheduled check (autoPublishShiftsIfNeeded)
      // when their start time actually arrives
      const successMsg = 'Shift created successfully!';
      setSuccess(successMsg);
      toast.success(successMsg);

      // Refresh immediately
      try { await fetchShifts(); } catch {}
      setName('');
      setStartTime('');
      setEndTime('');
      setTimeout(() => setSuccess(''), 1500);
    } catch (err: unknown) {
      // Narrow unknown to any to access axios response safely
      const message = (err as any)?.response?.data?.message || (err as any)?.message || 'An error occurred!';
      console.error('Error creating shift:', err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAssignUsers = async (shift_id: string | null) => {
    if (!shift_id) {
      setError('Shift ID not found!');
      return;
    }

    setAssignLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Map selected userids to their roles (doctor or nurse)
      const assigned_users = assignSelectedDoctors.map(userid => {
        // Find user in doctors or nurses to get their role
        const doctor = doctors.find(d => d.userid === userid);
        const nurse = nurses.find(n => n.userid === userid);
        return {
          userid,
          role: doctor ? 'doctor' : (nurse ? 'nurse' : 'doctor') // default to doctor if not found
        };
      });

      let assignmentSuccess = false;
      let apiError: any = null;
      
      try {
        await api.put(`/shifts/assignUsers/${shift_id}`, {
          assigned_users,
        });
        
        assignmentSuccess = true;
      } catch (apiErr: any) {
        apiError = apiErr;
        
        // The backend might have updated the shift before failing on notification
        // So we verify by checking the actual shift data
        // Retry multiple times with increasing delays to ensure backend has processed
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            // Wait longer with each attempt (1s, 2s, 3s)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            
            // Refresh shifts to get latest state
            const refreshResponse = await api.get('/shifts');
            const allShifts = (refreshResponse.data && refreshResponse.data.data) ? refreshResponse.data.data : [];
            const updatedShift = allShifts.find((s: Shift) => s.shift_id === shift_id);
            
            if (updatedShift) {
              // Compare assigned users with what we requested
              const assignedUsers = updatedShift.assigned_users || [];
              const assignedIds = assignedUsers
                .map((u: {userid: string}) => u.userid || u)
                .sort()
                .join(',');
              const requestedIds = assignSelectedDoctors
                .map(id => id.trim())
                .filter(Boolean)
                .sort()
                .join(',');
              
              // If assignment matches what we requested, it succeeded!
              if (assignedIds === requestedIds) {
                assignmentSuccess = true;
                break; // Exit retry loop
              }
              
              // If counts match but IDs don't, might be a race condition, try once more
              if (attempt < 3 && assignedUsers.length === assignSelectedDoctors.length) {
                continue;
              }
            }
          } catch (refreshErr) {
            // Continue to next attempt
          }
        }
        
        // If assignment didn't succeed after all attempts, we'll show error below
      }
      
      // If assignment succeeded (either from API success or verification), proceed
      if (assignmentSuccess) {
        // Refresh to get latest data
        await fetchShifts();
        setSuccess('Staff assigned successfully!');
        setAssignModalOpen(null);
        setAssignSelectedDoctors([]);
        setTimeout(() => setSuccess(''), 3000);
        return; // Exit early on success
      }
      
      // If we get here, assignment failed - throw error to show to user
      if (apiError) {
        throw apiError;
      } else {
        throw new Error('Failed to assign staff. Please try again.');
      }
    } catch (err: unknown) {
      // Try to refresh shifts anyway to get latest state
      try {
        await fetchShifts();
      } catch (refreshErr) {
      }
      
      const message = (err as any)?.response?.data?.message || (err as any)?.message || 'An error occurred!';
      setError(message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setAssignLoading(false);
    }
  };

  const openAssignModal = (shift: Shift) => {
    const shift_id = shift.shift_id;
    if (!shift_id) return;
    
    // Pre-select already assigned doctors
    const assignedUserIds = (shift.assigned_users || []).map(u => u.userid);
    setAssignSelectedDoctors(assignedUserIds);
                    setAssignModalOpen(shift_id);
    setSearchDoctor(''); // Reset search when opening modal
    setSelectedRoleFilter('all'); // Reset filter when opening modal
  };

  const getUserName = (userid: string) => {
    const user = [...doctors, ...nurses].find(u => u.userid === userid);
    return user?.fullName || userid;
  };

  const getUserRole = (userid: string) => {
    const doctor = doctors.find(d => d.userid === userid);
    const nurse = nurses.find(n => n.userid === userid);
    return doctor ? 'doctor' : (nurse ? 'nurse' : '');
  };

  // Get all users (doctors + nurses) for display
  const getAllUsers = () => {
    const allUsers = [
      ...doctors.map(d => ({ ...d, displayRole: 'doctor' })),
      ...nurses.map(n => ({ ...n, displayRole: 'nurse' }))
    ];
    
    if (selectedRoleFilter === 'all') {
      return allUsers;
    } else if (selectedRoleFilter === 'doctor') {
      return allUsers.filter(u => u.displayRole === 'doctor');
    } else {
      return allUsers.filter(u => u.displayRole === 'nurse');
    }
  };

  // Helper function to check if shift is completed (end_time has passed)
  const isShiftCompleted = (shift: Shift): boolean => {
    if (!shift.date || !shift.end_time) return false;
    try {
      // Parse date - could be ISO string or YYYY-MM-DD
      let dateStr = '';
      if (typeof shift.date === 'string') {
        dateStr = shift.date.includes('T') ? shift.date.split('T')[0] : shift.date;
      } else {
        // If date is already a Date object or other format
        dateStr = new Date(shift.date).toISOString().split('T')[0];
      }

      // Parse end_time (format: HH:MM)
      const [hours, minutes] = shift.end_time.split(':');
      if (!hours || !minutes) return false;

      // Create end datetime in local timezone
      const endDateTime = new Date(`${dateStr}T${hours}:${minutes}:00`);
      const now = new Date();
      
      // Compare: if end time is in the past, shift is completed
      return endDateTime < now;
    } catch (error) {
      return false;
    }
  };

  // Helper function to get display status (including computed completed)
  const getDisplayStatus = (shift: Shift): string => {
    // If shift is cancelled, always show cancelled
    if (shift.status === 'cancelled') return 'cancelled';
    // If shift end time has passed, show as completed
    if (isShiftCompleted(shift)) return 'completed';
    // Otherwise return actual status
    return shift.status || 'planned';
  };

  // Helper function to get status badge
  const getStatusBadge = (shift: Shift) => {
    const displayStatus = getDisplayStatus(shift);
    const baseClasses = "inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium";
    
    switch (displayStatus) {
      case 'cancelled':
  return (
          <span className={`${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800`}>
            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Cancelled</span>
          </span>
        );
      case 'completed':
        return (
          <span className={`${baseClasses} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800`}>
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Completed</span>
          </span>
        );
      case 'published':
        return (
          <span className={`${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800`}>
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Published</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className={`${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800`}>
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Planned</span>
          </span>
        );
    }
  };

  // Filter shifts based on search, status, and showCancelled
  const filteredShifts = shifts
    .filter(shift => {
      // Search filter - search by title/name
      const matchSearch = !searchTerm || 
        (shift.title || shift.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shift.shift_id || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const displayStatus = getDisplayStatus(shift);
      const matchStatus = statusFilter === 'all' || displayStatus === statusFilter;

      // Show cancelled filter
      const matchCancelled = showCancelled || shift.status !== 'cancelled';

      return matchSearch && matchStatus && matchCancelled;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'created':
          // Sort by creation time (newest first by default)
          // If createdAt available, use it; otherwise fallback to shift date + time
          try {
            let aCreated = 0;
            let bCreated = 0;
            
            // Helper to get timestamp from date + time (for newest first sorting)
            const getTimestamp = (shift: Shift): number => {
              // Priority 1: Use createdAt if available
              if (shift.createdAt) {
                try {
                  const created = new Date(shift.createdAt).getTime();
                  if (!isNaN(created) && created > 0) {
                    return created;
                  }
                } catch (e) {
                  // Ignore and fall through
                }
              }
              
              // Priority 2: Use shift date + start_time as proxy for creation time
              try {
                let dateObj: Date | null = null;
                
                if (shift.date) {
                  if (typeof shift.date === 'string') {
                    // Try to parse the date string
                    if (shift.date.includes('T')) {
                      // ISO format with time
                      dateObj = new Date(shift.date);
                    } else if (shift.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      // YYYY-MM-DD format
                      dateObj = new Date(shift.date);
                    } else {
                      // Try parsing as Date
                      dateObj = new Date(shift.date);
                    }
                  } else {
                    // Already a Date object or number
                    dateObj = new Date(shift.date);
                  }
                }
                
                if (dateObj && !isNaN(dateObj.getTime())) {
                  // Add start_time to the date
                  if (shift.start_time) {
                    const timeParts = shift.start_time.split(':');
                    if (timeParts.length >= 2) {
                      const hours = parseInt(timeParts[0], 10) || 0;
                      const minutes = parseInt(timeParts[1], 10) || 0;
                      dateObj.setHours(hours, minutes, 0, 0);
                    }
                  }
                  
                  const timestamp = dateObj.getTime();
                  if (!isNaN(timestamp) && timestamp > 0) {
                    return timestamp;
                  }
                }
              } catch (e) {
              }
              
              // Return a very old timestamp for items without date
              return 0;
            };
            
            aCreated = getTimestamp(a);
            bCreated = getTimestamp(b);
            
            aValue = aCreated;
            bValue = bCreated;
          } catch (e) {
            aValue = 0;
            bValue = 0;
          }
          break;
        case 'name':
          aValue = (a.title || a.name || '').toLowerCase();
          bValue = (b.title || b.name || '').toLowerCase();
          break;
        case 'date':
          // Sort by date and start_time
          try {
            let aDateStr = '';
            if (!a.date) {
              aValue = 0;
            } else if (typeof a.date === 'string') {
              aDateStr = a.date.includes('T') ? a.date.split('T')[0] : a.date;
            } else {
              aDateStr = new Date(a.date).toISOString().split('T')[0];
            }

            let bDateStr = '';
            if (!b.date) {
              bValue = 0;
            } else if (typeof b.date === 'string') {
              bDateStr = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            } else {
              bDateStr = new Date(b.date).toISOString().split('T')[0];
            }
            
            if (aDateStr && bDateStr) {
              const aTime = a.start_time || '00:00';
              const bTime = b.start_time || '00:00';
              
              const aDateTime = new Date(`${aDateStr}T${aTime}:00`);
              const bDateTime = new Date(`${bDateStr}T${bTime}:00`);
              
              aValue = aDateTime.getTime();
              bValue = bDateTime.getTime();
            } else {
              aValue = aDateStr ? 1 : 0;
              bValue = bDateStr ? 1 : 0;
            }
          } catch {
            aValue = 0;
            bValue = 0;
          }
          break;
        case 'status':
          const aStatus = getDisplayStatus(a);
          const bStatus = getDisplayStatus(b);
          // Priority: cancelled > completed > published > planned
          const statusPriority: Record<string, number> = {
            'cancelled': 4,
            'completed': 3,
            'published': 2,
            'planned': 1
          };
          aValue = statusPriority[aStatus] || 0;
          bValue = statusPriority[bStatus] || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleCancelShift = async (shift_id: string) => {
    if (!shift_id) {
      setError('Shift ID not found!');
      return;
    }

    setCancelLoading(shift_id);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/shifts/cancelShift/${shift_id}`);
      setSuccess('Shift cancelled successfully!');
      setCancelConfirm(null);
      await fetchShifts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || (err as any)?.message || 'An error occurred while cancelling shift!';
      setError(message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setCancelLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 text-white shadow-lg">
              <FileClock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Shift Management</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Create and assign shifts for staff</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Shifts</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{shifts.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 ml-2">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Available Doctors</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{doctors.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0 ml-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Available Nurses</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{nurses.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex-shrink-0 ml-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Assigned Shifts</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {shifts.filter(s => s.assigned_users && s.assigned_users.length > 0).length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 ml-2">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            </div>
          </div>

        {/* Create Shift Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-sky-500 to-violet-500 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Create New Shift</h2>
            </div>
          </div>

          <div className="p-4 sm:p-6">
          {/* Success / Error banner */}
          {success && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{success}</p>
              </div>
          )}
          {error && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
          )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
            <div className="sm:col-span-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Shift Name
                </label>
                <div className="relative">
              <input
                required
                    aria-label="Shift name"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20"
                    placeholder="e.g., Morning Shift, Evening Shift..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
                  <FileClock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>

              <div className="sm:col-span-1">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <div className="relative">
              <input
                required
                type="datetime-local"
                    aria-label="Start time"
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base text-gray-900 dark:text-white shadow-sm transition-all focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20"
                value={startTime}
                onChange={e => {
                  setStartTime(e.target.value);
                  // Auto-set min for end time to be after start time
                  if (e.target.value && endTime && new Date(e.target.value) >= new Date(endTime)) {
                    // Clear end time if it becomes invalid
                    setEndTime('');
                  }
                }}
              />
                  <Clock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>

              <div className="sm:col-span-1">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <div className="relative">
              <input
                required
                type="datetime-local"
                    aria-label="End time"
                    min={startTime || new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base text-gray-900 dark:text-white shadow-sm transition-all focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
                  <Clock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                </div>
            </div>

              <div className="sm:col-span-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-violet-500 text-white text-sm sm:text-base font-semibold shadow-lg hover:from-sky-600 hover:to-violet-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{submitLoading ? 'Creating...' : 'Create Shift'}</span>
              </button>
                <button 
                  type="button" 
                  onClick={() => { setName(''); setStartTime(''); setEndTime(''); setError(''); setSuccess(''); }} 
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
              </button>
            </div>
          </form>
          </div>
        </div>

        {/* Shifts List Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Header with title and count */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Shifts List</h3>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {filteredShifts.length} / {shifts.length}
                  </span>
                  {!showCancelled && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-xs font-medium text-orange-700 dark:text-orange-300">
                      {shifts.filter(s => s.status === 'cancelled').length} hidden
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCancelled(!showCancelled)}
                  className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    showCancelled
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                  }`}
                >
                  <X className={`w-3 h-3 sm:w-4 sm:h-4 ${showCancelled ? '' : 'opacity-50'}`} />
                  <span>{showCancelled ? 'Hide Cancelled' : 'Show Cancelled'}</span>
                </button>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by shift name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex-shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="planned">Planned</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-sky-500 mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading shifts...</p>
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">Unable to load list</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center px-4">{fetchError}</p>
              </div>
            ) : filteredShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="p-3 sm:p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 sm:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1">No shifts yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">Create your first shift to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6">
                <table className="w-full min-w-[640px]">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('name');
                            setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <span>Shift Name</span>
                          {sortBy === 'name' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </button>
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('date');
                            setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <span>Start Time</span>
                          {sortBy === 'date' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </button>
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">End Time</th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('status');
                            setSortOrder(sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <span>Staff / Status</span>
                          {sortBy === 'status' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </button>
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredShifts.map((item, idx) => {
                      const isCancelled = item.status === 'cancelled';
                      const isCompleted = isShiftCompleted(item);
                      const isInactive = isCancelled || isCompleted;
                      return (
                      <tr 
                        key={item._id || item.shift_id || idx} 
                        className={`transition-colors ${
                          isCancelled 
                            ? 'bg-red-50/50 dark:bg-red-900/10 opacity-75' 
                            : isCompleted
                            ? 'bg-gray-50/50 dark:bg-gray-800/50 opacity-75'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <div className={`p-1 sm:p-1.5 rounded flex-shrink-0 ${
                              isCancelled 
                                ? 'bg-red-100 dark:bg-red-900/30' 
                                : isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : 'bg-sky-100 dark:bg-sky-900/30'
                            }`}>
                              <FileClock className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                isCancelled 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : isCompleted
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-sky-600 dark:text-sky-400'
                              }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium text-xs sm:text-sm block truncate ${
                                  isInactive
                                    ? 'text-gray-500 dark:text-gray-400 line-through' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {item.title || item.name}
                                </span>
                                {getStatusBadge(item)}
                              </div>
                              <div className="sm:hidden mt-1">
                                <div className={`flex items-center gap-1 text-xs ${
                                  isInactive
                                    ? 'text-gray-500 dark:text-gray-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  <Clock className={`w-3 h-3 ${
                                    isInactive
                                      ? 'text-gray-500 dark:text-gray-400'
                                      : 'text-blue-600 dark:text-blue-400'
                                  }`} />
                                  <span>{formatShiftDateTime(item, 'start_time')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                          <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                            isInactive
                              ? 'text-gray-400 dark:text-gray-500' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            <Clock className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                              isInactive
                                ? 'text-gray-500 dark:text-gray-500' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`} />
                            <span className="truncate">{formatShiftDateTime(item, 'start_time')}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                          <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                            isInactive
                              ? 'text-gray-400 dark:text-gray-500' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            <Clock className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                              isInactive
                                ? 'text-gray-500 dark:text-gray-500' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`} />
                            <span className="truncate">{formatShiftDateTime(item, 'end_time')}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                          {item.assigned_users && item.assigned_users.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                              {/* Mobile: show 2 staff, Desktop: show 3 staff */}
                              {item.assigned_users.slice(0, 3).map((user, uIdx) => {
                                const isDoctor = user.role === 'doctor';
                                const hiddenOnMobile = uIdx >= 2; // Hide 3rd staff on mobile
                                return (
                                  <span 
                                    key={uIdx} 
                                    className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-0.5 rounded-md text-[10px] sm:text-xs font-medium ${
                                      hiddenOnMobile ? 'hidden sm:inline-flex' : ''
                                    } ${
                                      isInactive
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        : isDoctor
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    }`}
                                    title={getUserName(user.userid)}
                                  >
                                    <Users className={`w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 ${
                                      isInactive
                                        ? 'text-slate-600 dark:text-slate-400'
                                        : isDoctor
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-purple-700 dark:text-purple-300'
                                    }`} />
                                    <span className="truncate max-w-[50px] sm:max-w-[70px]">
                                      {getUserName(user.userid)}
                                    </span>
                                    <span className="ml-0.5 text-[9px] sm:text-[10px] opacity-75 flex-shrink-0">
                                      ({isDoctor ? 'Dr' : 'Nu'})
                                    </span>
                                  </span>
                                );
                              })}
                              {/* Show "+X more" badge - appears when > 2 on mobile or > 3 on desktop */}
                              {item.assigned_users.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => setShowStaffModal({ shiftId: item.shift_id || '', staff: item.assigned_users || [] })}
                                  className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-0.5 rounded-md text-[10px] sm:text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                    isInactive
                                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                  }`}
                                  title={`Click to view all ${item.assigned_users.length} staff members`}
                                >
                                  {item.assigned_users.length > 3 ? (
                                    <>
                                      <span className="hidden sm:inline">+{item.assigned_users.length - 3} more</span>
                                      <span className="sm:hidden">+{item.assigned_users.length - 2} more</span>
                                    </>
                                  ) : (
                                    <span className="sm:hidden">+{item.assigned_users.length - 2} more</span>
                                  )}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">Not assigned</span>
                              <span className="sm:hidden">None</span>
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            {!isInactive && item.status !== 'published' && (
                              <button
                                type="button"
                                onClick={() => openAssignModal(item)}
                                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white rounded-lg transition-all hover:shadow-md bg-sky-500 hover:bg-sky-600"
                                title="Assign staff to this shift"
                              >
                                <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Assign</span>
                              </button>
                            )}
                            {!isInactive && (
                              <button
                                type="button"
                                onClick={() => setCancelConfirm(item.shift_id || null)}
                                disabled={cancelLoading === (item.shift_id || '')}
                                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white rounded-lg transition-all hover:shadow-md bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Cancel this shift"
                              >
                                {cancelLoading === (item.shift_id || '') ? (
                                  <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                )}
                                <span className="hidden sm:inline">
                                  {cancelLoading === (item.shift_id || '') ? 'Cancelling...' : 'Cancel'}
                                </span>
                              </button>
                            )}
                            {isInactive && (
                              <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md ${
                                isCancelled 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                {isCancelled ? 'Cancelled' : 'Completed'}
                              </span>
                            )}
                          </div>
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
      </div>

      {/* Assign Staff Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setAssignModalOpen(null);
            setAssignSelectedDoctors([]);
            setSearchDoctor('');
            setSelectedRoleFilter('all');
          }
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-500 to-violet-500 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    </div>
                  <h3 className="text-base sm:text-xl font-bold text-white truncate">Assign Staff to Shift</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAssignModalOpen(null);
                    setAssignSelectedDoctors([]);
                    setSearchDoctor('');
                    setSelectedRoleFilter('all');
                  }}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">

              {/* Error message in modal */}
              {error && (
                <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Select Staff ({assignSelectedDoctors.length} selected)
                </label>
                
                {/* Role Filter Tabs */}
                <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto -mx-1 px-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRoleFilter('all')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedRoleFilter === 'all'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All ({doctors.length + nurses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleFilter('doctor')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedRoleFilter === 'doctor'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Doctors ({doctors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleFilter('nurse')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedRoleFilter === 'nurse'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Nurses ({nurses.length})
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-400/20 transition-all"
                  />
                </div>

                {/* Users List with Checkboxes */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                  {getAllUsers()
                    .filter(user => 
                      user.fullName?.toLowerCase().includes(searchDoctor.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchDoctor.toLowerCase())
                    )
                    .length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                      <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2 sm:mb-3" />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No users found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {getAllUsers()
                        .filter(user => 
                          user.fullName?.toLowerCase().includes(searchDoctor.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchDoctor.toLowerCase())
                        )
                        .map(user => {
                          const isSelected = assignSelectedDoctors.includes(user.userid);
                          const roleColor = user.displayRole === 'doctor' ? 'from-sky-400 to-violet-500' : 'from-pink-400 to-rose-500';
                          const roleBadge = user.displayRole === 'doctor' ? 'Doctor' : 'Nurse';
                          return (
                            <label
                              key={user.userid}
                              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors ${
                                isSelected ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                              }`}
                            >
                              <div className="relative flex-shrink-0 w-5 h-5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setAssignSelectedDoctors(prev => [...prev, user.userid]);
                                    } else {
                                      setAssignSelectedDoctors(prev => prev.filter(id => id !== user.userid));
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`absolute inset-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-sky-500 border-sky-500' 
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-sky-400'
                                }`}>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold flex-shrink-0`}>
                                    {user.fullName?.charAt(0)?.toUpperCase() || user.displayRole?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user.fullName}
                                      </p>
                                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                                        user.displayRole === 'doctor' 
                                          ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                                          : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                                      }`}>
                                        {roleBadge}
                                      </span>
                                    </div>
                                    {user.email && (
                                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {user.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                              )}
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {assignSelectedDoctors.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Selected ({assignSelectedDoctors.length}):</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    {assignSelectedDoctors.map(userid => (
                      <span key={userid} className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium ${
                        getUserRole(userid) === 'doctor'
                          ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                          : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                      }`}>
                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{getUserName(userid)}</span>
                        <span className="ml-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs bg-white/50 dark:bg-black/20 flex-shrink-0">
                          {getUserRole(userid) === 'doctor' ? 'Dr' : 'Nu'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAssignSelectedDoctors(prev => prev.filter(id => id !== userid))}
                          className={`ml-1 p-0.5 rounded transition-colors ${
                            getUserRole(userid) === 'doctor'
                              ? 'hover:bg-sky-200 dark:hover:bg-sky-800'
                              : 'hover:bg-pink-200 dark:hover:bg-pink-800'
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setAssignModalOpen(null);
                    setAssignSelectedDoctors([]);
                    setSearchDoctor('');
                    setSelectedRoleFilter('all');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (assignModalOpen) {
                      handleAssignUsers(assignModalOpen);
                    }
                  }}
                  disabled={assignLoading || !assignModalOpen}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 text-white text-sm font-semibold hover:from-sky-600 hover:to-violet-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {assignLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {assignLoading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff List Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowStaffModal(null);
          }
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden mx-4">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-500 to-violet-500 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Assigned Staff ({showStaffModal.staff.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStaffModal(null)}
                  className="p-1.5 sm:p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2 sm:space-y-3">
                {showStaffModal.staff.map((user, idx) => {
                  const isDoctor = user.role === 'doctor';
                  const roleColor = isDoctor ? 'from-sky-400 to-violet-500' : 'from-pink-400 to-rose-500';
                  const roleBadge = isDoctor ? 'Doctor' : 'Nurse';
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-sm sm:text-base font-semibold flex-shrink-0`}>
                        {getUserName(user.userid)?.charAt(0)?.toUpperCase() || roleBadge.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                            {getUserName(user.userid)}
                          </p>
                          <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-medium ${
                            isDoctor 
                              ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                              : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                          }`}>
                            {roleBadge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          User ID: {user.userid}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStaffModal(null)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setCancelConfirm(null);
          }
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden mx-4">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white truncate">Confirm Cancel</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelConfirm(null)}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium mb-1 sm:mb-2">
                    Are you sure you want to cancel this shift?
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    This shift will be marked as cancelled and all assigned staff will receive a notification about the shift cancellation.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setCancelConfirm(null)}
                  disabled={cancelLoading === cancelConfirm}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (cancelConfirm) {
                      handleCancelShift(cancelConfirm);
                    }
                  }}
                  disabled={cancelLoading === cancelConfirm}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {cancelLoading === cancelConfirm ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {cancelLoading === cancelConfirm ? 'Cancelling...' : 'Cancel Shift'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateShift;
