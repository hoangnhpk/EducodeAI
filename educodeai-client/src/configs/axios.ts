import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  withCredentials: true,
});

// ======================
// Request Interceptor
// ======================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_token");

    // Gắn token nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================
// Response Interceptor
// ======================
axiosClient.interceptors.response.use(
  (response) => {

    // trả về response.data để service dùng trực tiếp
    return response.data;
  },
  (error) => {
    console.error("❌ Lỗi API:", error.response?.status);
    console.error("❌ Chi tiết:", error.response?.data);
    console.error("❌ URL gọi:", error.config?.url);

    // if (error.response?.status === 401) {
    //   localStorage.removeItem("token");
    //   window.location.href = "/login";
    // }

    return Promise.reject(error);
  }
);

export default axiosClient as {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
};
