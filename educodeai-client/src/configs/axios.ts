import axios from "axios";
import { getDeviceInfo } from "../utils/deviceHelper";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      const { maThietBi } = getDeviceInfo();

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/dang-nhap";
        return Promise.reject(error);
      }

      try {
        const response: any = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/XacThuc/refresh-token?refreshToken=${refreshToken}&maThietBi=${maThietBi}`
        );
        
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem("user_token", token);
        localStorage.setItem("refresh_token", newRefreshToken);

        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        processQueue(null, token);
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/dang-nhap";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("❌ Lỗi API:", error.response?.status);
    return Promise.reject(error);
  }
);

export default axiosClient as {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
};
