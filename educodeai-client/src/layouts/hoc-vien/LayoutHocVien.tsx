
import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import HeaderHocVien from "@/layouts/hoc-vien/HeaderHocVien";
import FooterHocVien from "@/layouts/hoc-vien/FooterHocVien";
import "@/assets/styles/variables.css";
import "@/assets/styles/hoc-vien-global.css";

export default function LayoutHocVien() {
  // G.11: bỏ polling check-trang-thai mỗi 10 giây. Khóa tài khoản nay được đẩy realtime
  // qua SignalR (event UserLocked ở sessionHub.ts) và enforce bởi SessionCheckMiddleware.
  return (
    <div className="hoc-vien-layout">
      <HeaderHocVien />
      <Outlet />
      <FooterHocVien />
    </div>
  );
}
