import axios from "axios";
import { clearAuthTokens, getAuthTokens } from "../utils/authStorage";
import { getSessionGeneration, isLoggingOut } from "../utils/authLifecycle";
import { refreshSession } from "./refreshSession";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Tăng lên 60s để hỗ trợ AI sinh đồ án/lộ trình
  withCredentials: true,
});

const escapeHtml = (value: unknown): string => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

// ======================
// Request Interceptor
// ======================
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthTokens().accessToken;
    (config as any)._authGeneration = getSessionGeneration();

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

    // Nếu lỗi 401
    if (error.response?.status === 401) {
      const requestUrl = String(originalRequest?.url || '');
      const isAuthLifecycleRequest = requestUrl.includes('/dang-nhap')
        || requestUrl.includes('/google-login')
        || requestUrl.includes('/facebook-login')
        || requestUrl.includes('/refresh-token')
        || requestUrl.includes('/dang-xuat');
      if (isLoggingOut() || isAuthLifecycleRequest) {
        return Promise.reject(error);
      }

      const requestGeneration = originalRequest?._authGeneration;
      if (typeof requestGeneration === 'number' && requestGeneration !== getSessionGeneration()) {
        return Promise.reject(error);
      }

      // KIỂM TRA XEM CÓ PHẢI BỊ KHÓA TÀI KHOẢN KHÔNG (Từ Middleware mới)
      const data = error.response.data;
      if (data?.isBanned) {
        const bannedGeneration = getSessionGeneration();
        import("sweetalert2").then((Swal) => {
          if (bannedGeneration !== getSessionGeneration()) return;
          Swal.default.fire({
            title: "Tài khoản đã bị khóa!",
            html: `Lý do: <b>${escapeHtml(data.reason || "Vi phạm quy định hệ thống")}</b><br/>Hệ thống sẽ tự động đăng xuất sau <b>5</b> giây...`,
            icon: "error",
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
              const b = Swal.default.getHtmlContainer()?.querySelector("b:last-child");
              let timerInterval = setInterval(() => {
                if (b) b.textContent = Math.ceil(Swal.default.getTimerLeft()! / 1000).toString();
              }, 100);
              (Swal as any)._timerInterval = timerInterval;
            },
            willClose: () => {
              clearInterval((Swal as any)._timerInterval);
            }
          }).then(() => {
            if (bannedGeneration !== getSessionGeneration()) return;
            clearAuthTokens();
            localStorage.removeItem("user_info");
            window.location.href = "/dang-nhap";
          });
        });
        return Promise.reject(error);
      }

      // Nếu chưa thử refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const refreshGeneration = getSessionGeneration();
        const result = await refreshSession();
        if (result.outcome !== 'success' || !result.token) {
          return Promise.reject(result.error || error);
        }
        if (refreshGeneration !== getSessionGeneration() || isLoggingOut()) return Promise.reject(error);
        const token = result.token;
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      }
    }

    // 👉 ĐÃ THÊM: Cảm biến bắt lỗi bảo trì
    if (error.response?.status === 503) {
      window.dispatchEvent(new Event('BaoTriKhanCap'));
    }

    return Promise.reject(error);
  }
);

export default axiosClient as {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
};