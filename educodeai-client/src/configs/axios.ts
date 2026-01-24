import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    console.log("🌐 Base URL:", config.baseURL);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log("📥 Response từ:", response.config.url);
    console.log("📦 Response data:", response.data);
    
    return response.data; // 👈 Trả về data thôi
  },
  (error) => {
    console.error("❌ Lỗi API:", error.response?.status);
    console.error("❌ Chi tiết:", error.response?.data);
    console.error("❌ URL gọi:", error.config?.url);
    
    // if (error.response?.status === 401) {
    //   window.location.href = '/login'
    // }
    
    return Promise.reject(error);
  }
);

export default axiosClient as {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
};