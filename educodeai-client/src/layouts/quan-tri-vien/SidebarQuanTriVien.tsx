import { MdSettings, MdPeople} from 'react-icons/md';
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
        
        <NavLink to="/quan-tri-vien/nguoi-dung" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdPeople /></div>
          <span>Người Dùng</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/quan-ly-api-key" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-key-fill"></i></div>
          <span>Quản lý API AI</span>
        </NavLink>

        {/* <div className="nav-group-label">Mở rộng</div>
        <a href="#" className="qtv-nav-link disabled-link">
          <div className="link-icon"><MdRateReview /></div>
          <span>Review & Đánh giá</span>
        </a> */}
        
        {/* <a href="/quan-tri-vien/quan-ly-hoc-vien" className="qtv-nav-link">
          <MdPeople /> Học Viên
        </a> */}

      </nav>

      {/* <div className="qtv-sidebar-footer">
         <p>© 2026 EduCodeAI</p>
      </div> */}
    </aside>
  );
}