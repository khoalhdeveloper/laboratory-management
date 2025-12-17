import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from '../../../utils/toast';

const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://deloy-project.vercel.app/api';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

let hasShownSessionToast = false;

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;
            const requestUrl = (error.config as any)?.url || '';
            const isLoginRequest = typeof requestUrl === 'string' && requestUrl.includes('/auth/login');
            const isOnLoginPage = window.location.pathname.includes('/login');

            switch (status) {
                case 401:
                    // If this is a login attempt failure or the user is already on the login page,
                    // show the error and do not redirect to home.
                    if (isLoginRequest || isOnLoginPage) {
                        const message = (error.response.data as any)?.message || 'Invalid username or password.';
                        toast.error(message);
                        break;
                    }

                    // Otherwise, treat as session expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userName');

                    if (!hasShownSessionToast) {
                        hasShownSessionToast = true;
                        toast.warning('Session expired. Please log in again.');
                        setTimeout(() => { hasShownSessionToast = false; }, 2000);
                    }

                    if (!isOnLoginPage && window.location.pathname !== '/') {
                        window.location.href = '/';
                    }

                    break;

                case 440: 
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    
                    if (!hasShownSessionToast) {
                        hasShownSessionToast = true;
                        toast.warning('Session expired. Please log in again.');
                        setTimeout(() => { hasShownSessionToast = false; }, 2000);
                    }
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/';
                    }
                    break;

                case 403:
                    break;

                case 404:
                    break;

                case 422:
                    break;

                case 500:
                    break;

                default:
                    break;
            }
        } else if (error.request) {
        } else {
        }

        return Promise.reject(error);
    }
);

export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.get<T>(url, config);
    },

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.post<T>(url, data, config);
    },

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.put<T>(url, data, config);
    },

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.patch<T>(url, data, config);
    },

    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.delete<T>(url, config);
    },
};

export const authAPI = {
    login: (credentials: { username: string; password: string }) => {
        return api.post('/auth/login', credentials);
    },

    register: (userData: { 
        username: string; 
        password: string; 
        email: string; 
        fullName: string; 
        role: string;
        phoneNumber?: string;
        identifyNumber?: string;
        age?: number;
        gender?: string;
        address?: string;
        dateOfBirth?: string;
        image?: string;
        avatar?: string;
    }) => {
        return api.post('/auth/register', userData);
    },

    googleLogin: (credential: string) => {
        return api.post('/auth/google', { credential });
    },

    forgotPassword: (email: string) => {
        return api.post('/auth/forgot-password', { email });
    },

    resetPassword: (token: string, newPassword: string) => {
        return api.post(`/auth/reset-password/${token}`, { newPassword });
    },
};

export const userAPI = {
    getCurrentUser: () => {
        return api.get('/user/me');
    },

    updateProfile: (userData: any) => {
        return api.put('/user/accounts/update-my-account', userData);
    },

    changePassword: (userId: string, passwordData: { oldPassword: string; newPassword: string }) => {
        return api.post(`/user/accounts/change-password/${userId}`, passwordData);
    },

    getUserHistory: (userId: string) => {
        return api.get(`/user/accounts/history/${userId}`);
    },
};

export const adminAPI = {
    getAllAccounts: () => {
        return api.get('/admin/accounts/get-all-accounts');
    },

    // Get account by userid
    getAccountByUserId: async (userid: string) => {
        const response = await api.get('/admin/accounts/get-all-accounts');
        const accounts = response.data;
        const account = accounts.find((acc: any) => acc.userid === userid);
        return { data: account };
    },

    // Get account by email
    getAccountByEmail: async (email: string) => {
        const response = await api.get(`/admin/accounts/by-email/${encodeURIComponent(email)}`);
        return response;
    },

    updateAccount: (userid: string, accountData: {
        username?: string;
        email?: string;
        fullName?: string;
        phoneNumber?: string;
        identifyNumber?: string;
        age?: number;
        gender?: string;
        address?: string;
        dateOfBirth?: Date;
        role?: string;
        image?: string;
        avatar?: string;
    }) => {
        return api.put(`/admin/accounts/update-account/${userid}`, accountData);
    },

    deleteAccount: (userid: string, isActive: boolean) => {
        return api.put('/admin/accounts/delete-account', { userid, isActive });
    },

    changeAccountPassword: (userid: string, passwordData: { oldPassword: string; newPassword: string }) => {
        return api.post(`/admin/accounts/change-password/${userid}`, passwordData);
    },

    updatePassword: (userid: string, passwordData: { password: string }) => {
        return api.post(`/admin/accounts/change-password/${userid}`, {
            oldPassword: "admin_reset_password", // Gửi giá trị đặc biệt cho admin
            newPassword: passwordData.password
        });
    },

    getAccountHistory: (userid: string) => {
        return api.get(`/admin/accounts/history/${userid}`);
    },

    verifyAccount: (userid: string) => {
        return api.put(`/admin/accounts/verify-account/${userid}`);
    },

    getMyAccount: () => {
        return api.get('/admin/accounts/get-my-account');
    },
};

export const rolesAPI = {
    getRolePrivileges: (roleCode: string) => {
        return api.get(`/roles/get-roles/${roleCode}`);
    },

    updateRolePrivileges: (roleCode: string, privileges: string[]) => {
        return api.put(`/roles/update-roles/${roleCode}`, { privileges });
    },
};

export const testOrdersAPI = {
    // Get my test orders (for users)
    getMyOrders: () => {
        return api.get('/test-orders/getMyTestOrders');
    },

    // Get created test orders (for nurses/admins)
    getCreatedOrders: () => {
        return api.get('/test-orders/getCreatedTestOrders');
    },

    // Get test order by code
    getOrderByCode: (orderCode: string) => {
        return api.get(`/test-orders/getTestOrderByCode/${orderCode}`);
    },

    getOrderById: (orderId: string) => {
        return api.get(`/test-orders/${orderId}`);
    },

    // Create test order (for nurses/admins)
    // Note: patient_name is optional - backend will auto-fill from user account if not provided
    createTestOrder: (orderData: {
        userid: string;
        patient_name?: string;
        date_of_birth?: string;
        gender?: string;
        age?: number;
        address?: string;
        phone_number?: string;
        email?: string;
        status?: string;
        priority?: string;
        test_type?: string;
        notes?: string;
    }) => {
        return api.post('/test-orders/recordTestOrder', orderData);
    },

    // Update test order
    updateOrder: (orderCode: string, orderData: {
        patient_name?: string;
        date_of_birth?: string;
        gender?: string;
        age?: number;
        address?: string;
        phone_number?: string;
        email?: string;
        status?: string;
        priority?: string;
        test_type?: string;
        notes?: string;
    }) => {
        return api.put(`/test-orders/updateTestOrder/${orderCode}`, orderData);
    },

    // Delete test order
    deleteOrderByCode: (orderCode: string) => {
        return api.delete(`/test-orders/deleteTestOrder/${orderCode}`);
    },

    // Update test order status
    updateOrderStatus: (orderCode: string, status: string) => {
        return api.put(`/test-orders/updateTestOrderStatus/${orderCode}`, { status });
    },

    // Admin methods - Get all test orders (admin only)
    getAllTestOrders: () => {
        return api.get('/test-orders/getAllTestOrders');
    },
};

export const testResultsAPI = {
    saveTestResults: (orderCode: string, resultsData: {
        result_summary: string;
        result_details: string;
        wbc_value: number;
        rbc_value: number;
        hgb_value: number;
        hct_value: number;
        plt_value: number;
        mcv_value: number;
        mch_value: number;
        mchc_value: number;
        flag: string;
        status: string;
        instrument_id: string;
    }) => {
        return api.post(`/test-results/createTestResult/${orderCode}`, resultsData);
    },

    getTestResults: (orderCode: string) => {
        return api.get(`/test-results/getTestResultByOrderCode/${orderCode}`);
    },

    getAllTestResults: () => {
        return api.get('/test-results/getAllTestResults');
    },

    getMyTestResults: () => {
        return api.get('/test-results/getMyTestResults');
    },

    getMyPerformedTestResults: () => {
        return api.get('/test-results/getMyPerformedTestResults');
    },

};

// ==================== REAGENT MANAGEMENT TYPES ====================
export interface ReagentSupply {
    _id: string;
    reagent_name: string;
    catalog_number: string;
    vendor_name: string;
    vendor_id: string;
    po_number: string;
    order_date: string;
    receipt_date: string;
    quantity_received: number;
    unit_of_measure: string;
    lot_number: string;
    expiration_date: string;
    received_by: string;
    storage_location: string;
    status: string;
    receipt_date_time: string;
    created_at: string;
    updated_at: string;
}

export interface ReagentUsage {
    _id: string;
    reagent_name: string;
    quantity_used: number;
    used_by: string;
    role: string;
    used_at: string;
    notes?: string;
    instrument_id?: string;
    instrument_name?: string;
    procedure?: string;
    used_for?: string;
    created_at: string;
    updated_at: string;
}

export interface ReagentVendor {
    _id: string;
    vendor_id: string;
    vendor_name: string;
    contact_info: {
        email: string;
        phone: string;
        address: string;
    };
    created_at: string;
    updated_at?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ==================== REAGENT SUPPLY API ====================
export const reagentSupplyAPI = {
    // Get all supply records with filters
    getAll: (filters?: {
        reagent_name?: string;
        vendor_name?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }
        const queryString = params.toString();
        return api.get(`/reagent-supply/getAllSupplyRecords${queryString ? `?${queryString}` : ''}`);
    },

    // Get supply record by ID
    getById: (id: string) => {
        return api.get(`/reagent-supply/getSupplyRecordById/${id}`);
    },

    // Create new supply record
    create: (data: Partial<ReagentSupply>) => {
        return api.post('/reagent-supply/createSupplyRecord', data);
    },

    // Update supply record
    update: (id: string, data: Partial<ReagentSupply>) => {
        return api.put(`/reagent-supply/updateSupplyRecord/${id}`, data);
    },

    // Delete supply record
    delete: (id: string) => {
        return api.delete(`/reagent-supply/deleteSupplyRecord/${id}`);
    }
};

// ==================== REAGENT USAGE API ====================
export const reagentUsageAPI = {
    // Get usage history
    getHistory: (filters?: {
        reagent_name?: string;
        used_by?: string;
        role?: string;
        instrument_id?: string;
        instrument_name?: string;
        procedure?: string;
        used_for?: string;
        from_date?: string;
        to_date?: string;
        limit?: number;
        page?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value.toString());
            });
        }
        return api.get(`/reagent-usage/history?${params.toString()}`);
    },

    // Get usage history by instrument
    getHistoryByInstrument: (instrumentId: string) => {
        return api.get(`/reagent-usage/historyByInstrument/${instrumentId}`);
    },

    // Get usage history by used_for
    getHistoryByUsedFor: (usedFor: string) => {
        return api.get(`/reagent-usage/historyByUsedFor/${usedFor}`);
    },

    // Use reagents
    useReagents: (data: {
        reagents: Array<{
            reagent_name: string;
            quantity_used: number;
        }>;
        instrument_id?: string;
        procedure?: string;
        notes?: string;
        used_for?: string;
    }) => {
        return api.post('/reagent-usage/use', data);
    },

    // Use reagents for instrument
    useForInstrument: (data: {
        reagents: Array<{
            reagent_name: string;
            quantity_used: number;
        }>;
        instrument_id: string;
        procedure?: string;
        notes?: string;
        used_for?: string;
    }) => {
        return api.post('/reagent-usage/use-for-instrument', data);
    }
};

// ==================== VENDOR API ====================
export const vendorAPI = {
    // Get all vendors
    getAll: () => {
        return api.get('/vendors/getAllVendors');
    },

    // Get vendor by ID
    getById: (vendorId: string) => {
        return api.get(`/vendors/getVendorById/${vendorId}`);
    },

    // Create new vendor
    create: (data: Partial<ReagentVendor>) => {
        return api.post('/vendors/createVendor', data);
    },

    // Update vendor
    update: (vendorId: string, data: Partial<ReagentVendor>) => {
        return api.put(`/vendors/updateVendor/${vendorId}`, data);
    },

    // Delete vendor
    delete: (vendorId: string) => {
        return api.delete(`/vendors/deleteVendor/${vendorId}`);
    }
};

// ==================== REAGENT API ====================
export const reagentAPI = {
    // Get all reagents
    getAll: () => {
        return api.get('/reagents/getAllReagents');
    },

    // Search reagents by name (can be used to get single reagent)
    searchByName: (name: string) => {
        return api.get(`/reagents/searchReagentsByName/${name}`);
    },

    // Create new reagent
    create: (data: any) => {
        return api.post('/reagents/createReagent', data);
    },

    // Update reagent by name
    update: (name: string, data: any) => {
        return api.put(`/reagents/updateReagentByName/${name}`, data);
    },

    // Delete reagent by name
    delete: (name: string) => {
        return api.delete(`/reagents/deleteReagentByName/${name}`);
    }
};

// ==================== INSTRUMENT API ====================
export interface Instrument {
    _id?: string;
    instrument_id: string;
    name: string;
    type: string;
    category?: string;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    room?: string;
    status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service';
    last_check?: Date | string | null;
    next_check?: Date | string | null;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface InstrumentTestHistory {
    testResult: {
        result_summary: string;
        result_details: string;
        wbc_value: number;
        rbc_value: number;
        hgb_value: number;
        hct_value: number;
        plt_value: number;
        mcv_value: number;
        mch_value: number;
        mchc_value: number;
        flag: string;
        status: string;
        doctor_name: string;
        created_at: Date | string;
    };
    testOrder: {
        order_code: string;
        patient_name: string;
        userid: string;
        status: string;
        test_type: string;
        created_at: Date | string;
    };
}

export const instrumentAPI = {
    // Get all instruments with optional filters
    getAll: (filters?: {
        status?: string;
        type?: string;
        category?: string;
        room?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }
        const queryString = params.toString();
        return api.get(`/instruments/getAllinstrument${queryString ? `?${queryString}` : ''}`);
    },
    
    // Alias for getAll - for consistency
    getAllInstruments: (filters?: {
        status?: string;
        type?: string;
        category?: string;
        room?: string;
    }) => {
        return instrumentAPI.getAll(filters);
    },

    // Get instrument by ID
    getById: (instrumentId: string) => {
        return api.get(`/instruments/getinstrumentById/${instrumentId}`);
    },

    // Get instrument test history
    getTestHistory: (instrumentId: string, params?: {
        page?: number;
        limit?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        return api.get(`/instruments/getTestHistory/${instrumentId}${queryString ? `?${queryString}` : ''}`);
    },

    // Create new instrument
    create: (data: {
        name: string;
        type: string;
        category?: string;
        manufacturer?: string;
        model?: string;
        serial_number?: string;
        room?: string;
        status?: string;
        last_check?: Date | string;
        next_check?: Date | string;
    }) => {
        return api.post('/instruments/createinstrument', data);
    },

    // Update instrument
    update: (instrumentId: string, data: {
        name?: string;
        type?: string;
        category?: string;
        manufacturer?: string;
        model?: string;
        serial_number?: string;
        room?: string;
        status?: string;
        last_check?: Date | string | null;
        next_check?: Date | string | null;
    }) => {
        return api.put(`/instruments/updateinstrument/${instrumentId}`, data);
    },

    // Delete instrument
    delete: (instrumentId: string) => {
        return api.delete(`/instruments/deleteinstrument/${instrumentId}`);
    }
};

// ==================== EVENT LOG API ====================
export interface EventLogItem {
    _id: string;
    event_id: string;
    message: string;
    performedBy?: string;
    role?: string;
    createdAt: Date | string;
}

export const eventLogAPI = {
    // Get all event logs (admin only)
    getAllLogs: () => {
        return api.get('/event-logs/getAllLog');
    },

    // Get doctor event logs (doctor only)
    getDoctorLogs: () => {
        return api.get('/event-logs/getDoctorLog');
    }
};

// ==================== TEST COMMENTS API ====================
export interface TestComment {
    comment_id: string;
    content: string;
    doctor_name: string;
    doctor_id: string;
    is_final: boolean;
    created_at: string;
    updated_at?: string;
    _id: string;
}

export interface TestCommentsResponse {
    order_code: string;
    comments_count: number;
    final_comments_count: number;
    final_comments: TestComment[];
    all_comments: TestComment[];
}

export const testCommentsAPI = {
    // Get all comments by order code
    getCommentsByOrderCode: (orderCode: string) => {
        return api.get(`/test-comments/getCommentsByOrderCode/${orderCode}`);
    },

    // Add a new comment
    addComment: (orderCode: string, content: string) => {
        return api.post(`/test-comments/addComment/${orderCode}`, { content });
    },

    // Update a comment
    updateComment: (commentId: string, content: string) => {
        return api.put(`/test-comments/updateComment/${commentId}`, { content });
    },

    // Delete a comment
    deleteComment: (commentId: string) => {
        return api.delete(`/test-comments/deleteComment/${commentId}`);
    },

    // Mark/unmark comment as final
    markFinalComment: (orderCode: string, commentId: string) => {
        return api.put(`/test-comments/markFinalComment/${orderCode}/${commentId}`);
    }
};

// ==================== AI REVIEW API ====================
export interface AIAnalysisResponse {
    success: boolean;
    message: string;
    data: {
        order_code: string;
        test_type: string;
        ai_description: string;
        model: string;
    };
}

export interface AIDescriptionResponse {
    success: boolean;
    message: string;
    data: {
        order_code: string;
        test_type: string;
        ai_description: string | null;
        has_ai_description: boolean;
    };
}

export const aiReviewAPI = {
    // Phân tích kết quả xét nghiệm bằng AI - tăng timeout cho AI processing
    analyzeWithAI: (orderCode: string) => {
        return api.post(`/ai-reviews/analyze/${orderCode}`, {}, {
            timeout: 60000 // 60 giây cho AI analysis
        });
    },

    // Lấy mô tả AI theo order code
    getAIDescription: (orderCode: string) => {
        return api.get(`/ai-reviews/description/${orderCode}`);
    },

    // Cập nhật mô tả AI
    updateAIDescription: (orderCode: string, description: string) => {
        return api.put(`/ai-reviews/description/${orderCode}`, { description });
    }
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
    // Lấy thông báo theo user ID
    getMessagesByUserId: (userId: string) => {
        return api.get(`/messages/getMessage/${userId}`);
    },
    
    // Lấy thông báo warehouse (cho Nurse)
    getWarehouseMessages: () => {
        return api.get(`/messages/warehouse`);
    },
    
    // Đánh dấu thông báo đã đọc
    readMessage: (messageId: string) => {
        return api.put(`/messages/readMessage/${messageId}`);
    }
};

// ==================== SETTINGS API ====================
export interface SystemSettings {
  _id?: string;
  sessionTimeoutMinutes: number;
  jwtExpirationHours: number;
  maxFailedLoginAttempts: number;
  inactivityLockDays: number;
  createdAt?: string;
  updatedAt?: string;
}

export const settingsAPI = {
  // Get system settings
  getSettings: () => {
    return api.get('/settings/getConfig');
  },

  // Update system settings
  updateSettings: (settings: {
    sessionTimeoutMinutes?: number;
    jwtExpirationHours?: number;
    maxFailedLoginAttempts?: number;
    inactivityLockDays?: number;
  }) => {
    return api.put('/settings/updateConfig', settings);
  }
};

// ==================== CHAT AI API ====================
export interface ChatMessage {
    text: string;
}

export interface ChatResponse {
    reply: {
        content: string;
        sessionId: string;
    };
    historySaved: boolean;
}

export const chatAPI = {
    // Gửi tin nhắn đến AI chat
    sendMessage: (message: ChatMessage) => {
        return api.post<ChatResponse>('/chat/chatai', message);
    }
};

// ==================== BLOG API ====================
export interface BlogPost {
    id: number | string;
    title: string;
    description: string;
    imageUrl: string;
    source: string;
    sourceUrl: string;
    category: string;
    publishedAt: string;
    isFromAPI?: boolean;
}

export interface BlogResponse {
    success: boolean;
    data: BlogPost[];
}

export const blogAPI = {
    // Get news from NewsAPI only
    getNews: () => {
        return api.get<BlogResponse>('/blogs/news');
    },

    // Get public blogs from database (backup)
    getPublicBlogs: () => {
        return api.get<BlogResponse>('/blogs/public');
    }
};

// ==================== ROOM API ====================
export const roomAPI = {
    // Get all rooms with optional filters
    getRooms: (params?: { 
        type?: string; 
        status?: string; 
        floor?: number; 
        search?: string 
    }) => {
        return api.get('/rooms', { params });
    },

    // Get single room by room number
    getRoomByNumber: (roomNumber: string) => {
        return api.get(`/rooms/${roomNumber}`);
    },

    // Create new room
    createRoom: (roomData: {
        roomNumber: string;
        floor: number;
        type: 'ICU' | 'General' | 'VIP' | 'Emergency';
        capacity: number;
        notes?: string;
    }) => {
        return api.post('/rooms', roomData);
    },

    // Update room information
    updateRoom: (roomNumber: string, updateData: any) => {
        return api.put(`/rooms/${roomNumber}`, updateData);
    },

    // Delete room
    deleteRoom: (roomNumber: string) => {
        return api.delete(`/rooms/${roomNumber}`);
    },

    // Add patient to room
    addPatientToRoom: (roomNumber: string, patientData: any) => {
        return api.post(`/rooms/${roomNumber}/patients`, patientData);
    },

    // Remove patient from room
    removePatientFromRoom: (roomNumber: string, patientId: string) => {
        return api.delete(`/rooms/${roomNumber}/patients/${patientId}`);
    },

    // Update patient in room
    updatePatientInRoom: (roomNumber: string, patientId: string, updateData: any) => {
        return api.put(`/rooms/${roomNumber}/patients/${patientId}`, updateData);
    },

    // Get room statistics
    getRoomStatistics: () => {
        return api.get('/rooms/statistics');
    }
};

// ==================== EXPORT ALIASES ====================
// Export alias for instrumentAPI as instrumentsAPI for consistency
export const instrumentsAPI = instrumentAPI;
