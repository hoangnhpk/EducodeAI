import { MdSchool, MdBook, MdEditNote, MdQuiz, MdCode, MdPeople, MdDashboard } from 'react-icons/md';
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
        </a>
        <a href="/giang-vien/bai-tap-thuc-hanh" className="gv-nav-link">
          <MdCode /> Bài tập thực hành (AI)
        </a>
        <a href="/giang-vien/bai-tap" className="gv-nav-link">
          <MdQuiz /> Quản lý bài tập (Quiz)
        </a>
        <a href="/giang-vien/lop-hoc" className="gv-nav-link">
          <MdPeople /> Quản Lý Lớp Học
        </a>
        <a href="/giang-vien/tao-lo-trinh-AI" className="gv-nav-link">
          <MdEditNote /> Quản Lý Lộ Trình AI
        </Link>
      </nav>
    </aside>
  );
}
