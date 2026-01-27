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
    const token = localStorage.getItem("token");

    // Gắn token nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    console.log("🌐 Base URL:", config.baseURL);
    console.log("📦 Payload type:", config.data instanceof FormData ? "FormData" : "JSON");
    console.log("🔐 Token:", token ? "Có" : "Không có");

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================
// Response Interceptor
// ======================
axiosClient.interceptors.response.use(
  (response) => {
    console.log("📥 Response từ:", response.config.url);
    console.log("📦 Response data:", response.data);

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
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
};
