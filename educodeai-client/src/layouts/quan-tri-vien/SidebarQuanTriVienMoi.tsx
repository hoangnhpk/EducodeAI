import { MdPeople, MdRateReview, MdSettings,MdDashboard } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

export default function SidebarQuanTriVienMoi() {
  return (
    <aside className="qtv-sidebar">
      <div className="qtv-sidebar-header">
        <div className="header-logo">
          <MdSettings className="header-icon-spin" />
          <span>QUẢN TRỊ</span>
        </div>
        <small className="system-label">EduCodeAI System</small>
      </div>

      <nav className="qtv-sidebar-nav">

         <NavLink to="/quan-tri-vien/thong-ke" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdDashboard /></div>
          <span>Thống kê</span>
        </NavLink>
        <NavLink to="/quan-tri-vien/nguoi-dung" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdPeople /></div>
          <span>Người Dùng</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/quan-ly-api-key" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-key-fill"></i></div>
          <span>Quản lý API AI</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/quan-ly-binh-luan-review" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdRateReview /></div>
          <span>Đánh giá khóa học</span>
        </NavLink>
      </nav>
    </aside>
  );
}
