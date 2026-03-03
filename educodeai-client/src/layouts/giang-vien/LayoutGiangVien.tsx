import { Outlet } from 'react-router-dom';
import HeaderGiangVien from './HeaderGiangVien';
import SidebarGiangVien from './SidebarGiangVien';
import '../../assets/styles/variables.css';
import '../../assets/styles/UI_GiangVien_QuanTriVien_Kit.css';
import '../../assets/styles/LayoutDashboard.css';

export default function LayoutGiangVien() {
  return (
    <div className="layout-giang-vien">
      <SidebarGiangVien />
      <div className="gv-main-wrapper">
        <HeaderGiangVien />
        <main className="gv-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
