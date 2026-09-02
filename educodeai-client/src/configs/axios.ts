import axios from "axios";
import { getDeviceInfo } from "../utils/deviceHelper";
import { clearAuthTokens, getAuthTokens, setAuthTokens } from "../utils/authStorage";
import { getSessionGeneration, isLoggingOut } from "../utils/authLifecycle";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Tăng lên 60s để hỗ trợ AI sinh đồ án/lộ trình
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const escapeHtml = (value: unknown): string => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

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

        isRefreshing = true;

        const { maThietBi } = getDeviceInfo();
        const refreshGeneration = getSessionGeneration();

        try {
          // Refresh token nằm trong cookie HttpOnly (JS không đọc được);
          // gửi kèm tự động nhờ withCredentials. Không truyền token qua URL.
          const response: any = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/XacThuc/refresh-token`,
            { maThietBi },
            { withCredentials: true }
          );

          const token = response.data?.token;
          if (typeof token !== "string" || !token.trim()) {
            throw new Error("Refresh response không chứa access token hợp lệ.");
          }
          if (isLoggingOut() || refreshGeneration !== getSessionGeneration()) {
            processQueue(error, null);
            return Promise.reject(error);
          }
          setAuthTokens(token.trim());

          axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token.trim()}`;
          processQueue(null, token.trim());
          return axiosClient(originalRequest);
        } catch (err: any) {
          processQueue(err, null);

          if (refreshGeneration !== getSessionGeneration()) {
            return Promise.reject(err);
          }

          // NẾU REFRESH TOKEN CŨNG LỖI (Ví dụ: do bị khóa hoặc hết hạn thực sự)
          const errorData = err.response?.data;
          const isLocked = errorData?.isBanned || (typeof errorData === 'string' && errorData.includes("khóa"));

          import("sweetalert2").then((Swal) => {
            if (refreshGeneration !== getSessionGeneration()) return;
            Swal.default.fire({
              title: isLocked ? "Tài khoản bị khóa!" : "Hết phiên đăng nhập!",
              html: isLocked
                ? `Lý do: <b>${escapeHtml(errorData?.reason || "Vi phạm quy định")}</b>. Hệ thống sẽ chuyển hướng sau <b>5</b> giây...`
                : "Phiên làm việc của bạn đã kết thúc. Hệ thống sẽ chuyển hướng sau <b>3</b> giây...",
              icon: "error",
              timer: isLocked ? 5000 : 3000,
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
              if (refreshGeneration !== getSessionGeneration()) return;
              clearAuthTokens();
              localStorage.removeItem("user_info");
              window.location.href = "/dang-nhap";
            });
          });
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
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