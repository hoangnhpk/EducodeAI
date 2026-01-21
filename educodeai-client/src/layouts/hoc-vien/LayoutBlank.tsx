import { Outlet } from "react-router-dom";

import "@/assets/styles/UI_HocVien_Kit.css";

export default function LayoutHocVien() {
  return (
    <div className="hoc-vien-layout">
      <Outlet />
    </div>
  );
}
