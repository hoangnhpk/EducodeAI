import { Outlet } from "react-router-dom";

import "@/assets/styles/variables.css";
import "@/assets/styles/hoc-vien-global.css";

export default function LayoutHocVien() {
  return (
    <div className="hoc-vien-layout">
      <Outlet />
    </div>
  );
}
