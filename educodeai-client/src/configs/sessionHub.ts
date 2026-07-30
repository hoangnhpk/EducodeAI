import * as signalR from "@microsoft/signalr";
import { clearAuthTokens, getAuthTokens } from "../utils/authStorage";

// Kết nối SignalR SessionHub (Phase G.9): nhận event revoke/khóa realtime để logout UI
// ngay, thay cho việc polling mỗi 10 giây. Access token lấy từ localStorage qua
// accessTokenFactory (cách chuẩn SignalR); C.10 hoãn nên token vẫn ở localStorage.

let connection: signalR.HubConnection | null = null;
let isForcingLogout = false;

const getToken = () => getAuthTokens().accessToken || "";

const forceLogout = (title: string, message: string) => {
  if (isForcingLogout) return;
  isForcingLogout = true;

  void import("sweetalert2").then((Swal) => {
    Swal.default.fire({
      title,
      html: message,
      icon: "warning",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
    }).then(() => {
      clearAuthTokens();
      localStorage.removeItem("user_info");
      window.location.href = "/dang-nhap";
    });
  });
};

export const startSessionHub = async (): Promise<void> => {
  if (connection) return;
  const token = getToken();
  if (!token) return;

  const baseUrl = import.meta.env.VITE_API_URL || "";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/sessionHub`, {
      // accessTokenFactory: token đi ở query string access_token cho WS/SSE (chuẩn SignalR),
      // backend đọc qua JwtBearerEvents.OnMessageReceived. Kết nối chạy trên HTTPS/WSS.
      accessTokenFactory: () => getToken(),
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Error)
    .build();

  connection.on("SessionRevoked", () => {
    forceLogout("Phiên đã bị đăng xuất", "Thiết bị này vừa bị đăng xuất từ xa. Đang chuyển về trang đăng nhập...");
  });

  connection.on("UserLocked", () => {
    forceLogout("Tài khoản đã bị khóa", "Tài khoản của bạn vừa bị khóa. Đang chuyển về trang đăng nhập...");
  });

  connection.on("SessionListChanged", () => {
    // Trang quản lý thiết bị lắng nghe event này để refetch (G.14).
    window.dispatchEvent(new Event("SessionListChanged"));
  });

  // Khi reconnect thành công: đồng bộ MỘT lần trạng thái phiên (G.12), không polling.
  connection.onreconnected(() => {
    void syncSessionStateOnce();
  });

  try {
    await connection.start();
  } catch {
    // Kết nối lỗi không mở quyền: middleware + cache vẫn enforce ở backend.
    connection = null;
  }
};

export const stopSessionHub = async (): Promise<void> => {
  if (!connection) return;
  const c = connection;
  connection = null;
  try {
    await c.stop();
  } catch {
    // ignore
  }
};

// Gọi một lần sau khi reconnect để bắt trường hợp bị revoke/khóa trong lúc mất kết nối.
const syncSessionStateOnce = async (): Promise<void> => {
  const token = getToken();
  if (!token) return;
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${baseUrl}/api/XacThuc/session-state`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.isValid === false) {
      forceLogout(
        data.isBanned ? "Tài khoản đã bị khóa" : "Phiên đã bị đăng xuất",
        "Phiên làm việc không còn hiệu lực. Đang chuyển về trang đăng nhập..."
      );
    }
  } catch {
    // ignore: request kế tiếp qua axios vẫn bị backend chặn nếu phiên đã revoke.
  }
};
