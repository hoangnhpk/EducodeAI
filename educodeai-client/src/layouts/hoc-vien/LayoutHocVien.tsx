import { Outlet } from "react-router-dom";
import HeaderHocVien from "@/layouts/hoc-vien/HeaderHocVien";
import FooterHocVien from "@/layouts/hoc-vien/FooterHocVien";
import "@/assets/styles/UI_HocVien_Kit.css";
// import "@/assets/js/main_HocVien.js";

export default function LayoutHocVien() {
  return (
    <div className="hoc-vien-layout">
      <HeaderHocVien />
      <Outlet />
      <FooterHocVien />
    </div>
  );
}
