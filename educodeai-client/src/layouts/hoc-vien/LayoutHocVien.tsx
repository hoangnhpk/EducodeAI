import { Outlet } from "react-router-dom";
import HeaderHocVien from "@/layouts/hoc-vien/HeaderHocVien";
import "@/assets/styles/UI_HocVien_Kit.css";

export default function LayoutHocVien() {
  return (
    <div className="hoc-vien-layout">
      <HeaderHocVien />
      <Outlet />
    </div>
  );
}
