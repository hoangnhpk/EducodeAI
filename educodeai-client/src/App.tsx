import { useEffect } from "react";
import Router from "./router/index";
import { authService } from "./services/auth.service";
import { getDeviceInfo } from "./utils/deviceHelper";
import MaintenanceGuard from "./pages/quan-tri-vien/cau-hinh-he-thong/MaintenanceGuard";

function App() {
  useEffect(() => {
    // 1. Kiểm tra phiên đăng nhập định kỳ (5 giây/lần)
    // Tần suất ngắn hơn để tạo hiệu ứng "lập tức" khi bị đăng xuất từ xa
    const checkSessionInterval = setInterval(async () => {
      const token = localStorage.getItem("user_token");
      if (token) {
        try {
          const { maThietBi } = getDeviceInfo();
          // Gọi API nhẹ để kiểm tra trạng thái phiên hoạt động
          await authService.getDevices(maThietBi);
        } catch (error: any) {
          // Nếu Backend trả về 401, Axios Interceptor sẽ bắt lỗi và hiển thị đếm ngược 3 giây
          console.log("Phiên đã bị vô hiệu hóa.");
        }
      }
    }, 5000); // 5 giây là mức tối ưu cho "lập tức" mà không gây tải server

    return () => clearInterval(checkSessionInterval);
  }, []);

  return (
    <MaintenanceGuard>
      <Router />
      </MaintenanceGuard>
  );
}

export default App;
