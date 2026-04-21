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

    // 👉 ĐÃ THÊM: Gắn "kim bài miễn tử" cho Admin/Giảng viên
    // Báo cho Cửa cuốn Middleware biết "Ta là Admin, cho ta qua!"
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes('/quan-tri-vien')) {
      config.headers["X-Bypass-Maintenance"] = "true";
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
      // KIỂM TRA XEM CÓ PHẢI BỊ KHÓA TÀI KHOẢN KHÔNG (Từ Middleware mới)
      const data = error.response.data;
      if (data?.isBanned) {
        import("sweetalert2").then((Swal) => {
          Swal.default.fire({
            title: "Tài khoản đã bị khóa!",
            html: `Lý do: <b>${data.reason || "Vi phạm quy định hệ thống"}</b><br/>Hệ thống sẽ tự động đăng xuất sau <b>5</b> giây...`,
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
            localStorage.clear();
            window.location.href = "/dang-nhap";
          });
        });
        return Promise.reject(error);
      }

      // Nếu chưa thử refresh
      if (!originalRequest._retry) {
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
          // Hiển thị thông báo và đếm ngược 3 giây
          import("sweetalert2").then((Swal) => {
            Swal.default.fire({
              title: "Hết phiên đăng nhập!",
              html: "Tài khoản của bạn đã được đăng xuất hoặc phiên làm việc đã hết hạn. Hệ thống sẽ chuyển hướng sau <b>3</b> giây...",
              icon: "warning",
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
              allowOutsideClick: false,
              didOpen: () => {
                const b = Swal.default.getHtmlContainer()?.querySelector("b");
                let timerInterval = setInterval(() => {
                  if (b) b.textContent = Math.ceil(Swal.default.getTimerLeft()! / 1000).toString();
                }, 100);
                (Swal as any)._timerInterval = timerInterval;
              },
              willClose: () => {
                clearInterval((Swal as any)._timerInterval);
              }
            }).then(() => {
              localStorage.clear();
              window.location.href = "/dang-nhap";
            });
          });
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
        } catch (err: any) {
          processQueue(err, null);
          
          // NẾU REFRESH TOKEN CŨNG LỖI (Ví dụ: do bị khóa hoặc hết hạn thực sự)
          const errorData = err.response?.data;
          const isLocked = errorData?.isBanned || (typeof errorData === 'string' && errorData.includes("khóa"));

          import("sweetalert2").then((Swal) => {
            Swal.default.fire({
              title: isLocked ? "Tài khoản bị khóa!" : "Hết phiên đăng nhập!",
              html: isLocked 
                ? `Lý do: <b>${errorData?.reason || "Vi phạm quy định"}</b>. Hệ thống sẽ chuyển hướng sau <b>5</b> giây...`
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
              localStorage.clear();
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