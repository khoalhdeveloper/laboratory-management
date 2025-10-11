import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Base URL cho API - sử dụng proxy trong development
const BASE_URL = (typeof window !== 'undefined' && (window as any).REACT_APP_API_URL) || '/api';

// Tạo instance axios với cấu hình cơ bản
const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }


        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Xử lý response và error
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {

        return response;
    },
    (error: AxiosError) => {
        // Xử lý các lỗi HTTP
        if (error.response) {
            const { status } = error.response;

            switch (status) {
                case 401:
                    // Token hết hạn hoặc không hợp lệ
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    // Redirect to login page
                    window.location.href = '/login';
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
            // Network error
        } else {
            // Other error
        }

        return Promise.reject(error);
    }
);

// API Methods
export const api = {
    // GET request
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.get<T>(url, config);
    },

    // POST request
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.post<T>(url, data, config);
    },

    // PUT request
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.put<T>(url, data, config);
    },

    // PATCH request
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.patch<T>(url, data, config);
    },

    // DELETE request
    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.delete<T>(url, config);
    },
};

// Auth API endpoints
export const authAPI = {
    // Đăng nhập
    login: (credentials: { username: string; password: string }) => {
        return api.post('/auth/login', credentials);
    },

    // Đăng ký
    register: (userData: { username: string; password: string; email: string; fullName: string; role: string }) => {
        return api.post('/auth/register', userData);
    },

    // Quên mật khẩu
    forgotPassword: (email: string) => {
        return api.post('/auth/forgot-password', { email });
    },

    // Đặt lại mật khẩu
    resetPassword: (token: string, newPassword: string) => {
        return api.post(`/auth/reset-password/${token}`, { newPassword });
    },
};

// User API endpoints
export const userAPI = {
    // Lấy thông tin user hiện tại
    getCurrentUser: () => {
        return api.get('/user/me');
    },

    // Cập nhật thông tin profile
    updateProfile: (userData: any) => {
        return api.put('/user/accounts/update-my-account', userData);
    },

    // Đổi mật khẩu
    changePassword: (userId: string, passwordData: { oldPassword: string; newPassword: string }) => {
        return api.post(`/user/accounts/change-password/${userId}`, passwordData);
    },
};
