
import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from "react-router-dom";

import { Outlet } from "react-router-dom";

import HeaderHocVien from "@/layouts/hoc-vien/HeaderHocVien";
import FooterHocVien from "@/layouts/hoc-vien/FooterHocVien";
import "@/assets/styles/variables.css";
import "@/assets/styles/hoc-vien-global.css";

export default function LayoutHocVien() {

  const navigate = useNavigate();
  const location = useLocation();
  const hideFooter = location.pathname.includes('/sinh-do-an-ai') || 
                     location.pathname.includes('/phong-van-ai') || 
                     location.pathname.includes('/phong-van-do-an');

useEffect(() => {
    const checkBanStatus = async () => {
      // 1. Lấy token (Lấy 'token', nếu không có thì lấy 'user_token' cho chắc ăn)
      const token = localStorage.getItem('token') || localStorage.getItem('user_token'); 
      if (!token) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/auth/check-trang-thai`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          
          // NẾU TÀI KHOẢN BỊ KHÓA
          if (data.isBanned) {
            // 2. QUÉT SẠCH SÀNH SANH MỌI DẤU VẾT TRONG LOCAL STORAGE CỦA SẾP
            localStorage.removeItem('token');
            localStorage.removeItem('user_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_info');
            localStorage.removeItem('login_success');

            // 3. Hiển thị thông báo
            alert(`TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!\n\nLý do: ${data.reason}\n\nHệ thống sẽ tự động đăng xuất ngay lập tức.`);

            // 4. Sút thẳng ra ngoài trang đăng nhập
            navigate('/dang-nhap', { replace: true });
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái tài khoản:", error);
      }
    };

    checkBanStatus();
    const intervalId = setInterval(checkBanStatus, 10000); 
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className="hoc-vien-layout">
      <HeaderHocVien />
      <Outlet />
      {!hideFooter && <FooterHocVien />}
    </div>
  );
}