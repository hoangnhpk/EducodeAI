import { Outlet } from "react-router-dom";
import HeaderHocVien from "@/layouts/hoc-vien/HeaderHocVien";
import FooterHocVien from "@/layouts/hoc-vien/FooterHocVien";
import "@/assets/styles/variables.css";
import "@/assets/styles/hoc-vien-global.css";

export default function LayoutHocVien() {
  return (
    <div className="hoc-vien-layout">
      <HeaderHocVien />
      <Outlet />
      <FooterHocVien />
    </div>
  );
}
