import { Outlet } from 'react-router-dom';
import HeaderQuanTriVien from './HeaderQuanTriVien';
import SidebarQuanTriVien from './SidebarQuanTriVien';
import '../../assets/styles/UI_GiangVien_QuanTriVien_Kit.css';
import '../../assets/styles/LayoutDashboard.css';

export default function LayoutQuanTriVien() {
  return (
    <div className="layout-qtv">
      <SidebarQuanTriVien />
      <div className="qtv-main-wrapper">
        <HeaderQuanTriVien />
        <main className="qtv-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
