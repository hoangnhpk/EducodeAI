
import { MdSettings, MdPeople, MdDashboard } from 'react-icons/md';
import { NavLink } from 'react-router-dom'; // Dùng NavLink để tự động active cho xịn

export default function SidebarQuanTriVien() {
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
        <NavLink
          to="/quan-tri-vien/cau-hinh-he-thong"
          className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="link-icon"><i className="fa fa-cogs"></i></div>
          <span>Cấu hình hệ thống</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/rut-tien-giang-vien" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-wallet2"></i></div>
          <span>Rút tiền giảng viên</span>
        </NavLink>

        {/* <div className="nav-group-label">Mở rộng</div>
        <a href="#" className="qtv-nav-link disabled-link">
          <div className="link-icon"><MdRateReview /></div>
          <span>Review & Đánh giá</span>
        </a> */}

        {/* <a href="/quan-tri-vien/tang-khoa-hoc" className="qtv-nav-link">
          <MdPeople /> Học Viên
        </a> */}

      </nav>

      {/* <div className="qtv-sidebar-footer">
         <p>© 2026 EduCodeAI</p>
      </div> */}
    </aside>
  );
}