import { MdSchool, MdBook, MdEditNote, MdDashboard } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';

export default function SidebarGiangVien() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="gv-sidebar">
      <div className="gv-sidebar-header">
        <h2><MdSchool /> Giảng Viên</h2>
      </div>
      <nav className="gv-sidebar-nav">
        <Link 
          to="/giang-vien/thong-ke" 
          className={`gv-nav-link ${isActive('/giang-vien/thong-ke') || location.pathname === '/giang-vien' ? 'active' : ''}`}
        >
          <MdDashboard /> Thống Kê
        </Link>
        <Link 
          to="/giang-vien/khoa-hoc-cua-toi" 
          className={`gv-nav-link ${isActive('/giang-vien/khoa-hoc-cua-toi') ? 'active' : ''}`}
        >
          <MdBook /> Khóa Học
        </Link>
        <Link 
          to="/giang-vien/bai-tap" 
          className={`gv-nav-link ${isActive('/giang-vien/bai-tap') ? 'active' : ''}`}
        >
          <MdEditNote /> Bài Tập
        </Link>
        <Link 
          to="/giang-vien/tao-lo-trinh-AI" 
          className={`gv-nav-link ${isActive('/giang-vien/tao-lo-trinh-AI') ? 'active' : ''}`}
        >
          <MdEditNote /> Quản Lý Lộ Trình AI
        </Link>
      </nav>
    </aside>
  );
}
