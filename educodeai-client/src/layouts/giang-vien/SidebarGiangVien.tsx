import { MdSchool, MdBook, MdEditNote, MdCode, MdPeople, MdDashboard, MdCardGiftcard, MdAccountBalanceWallet } from 'react-icons/md';
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
        <Link to="/giang-vien/thong-ke" className={`gv-nav-link ${isActive('/giang-vien/thong-ke') || location.pathname === '/giang-vien' ? 'active' : ''}`}>
          <MdDashboard /> Thống Kê
        </Link>

        <Link to="/giang-vien/khoa-hoc-cua-toi" className={`gv-nav-link ${isActive('/giang-vien/khoa-hoc-cua-toi') ? 'active' : ''}`}>
          <MdBook /> Khóa Học
        </Link>
        <Link
          to="/giang-vien/bai-tap"
          className={`gv-nav-link ${isActive('/giang-vien/bai-tap') || isActive('/giang-vien/bai-tap-thuc-hanh') ? 'active' : ''}`}
        >
          <MdCode /> Quản lý bài tập
        </Link>

        <Link to="/giang-vien/lop-hoc" className={`gv-nav-link ${isActive('/giang-vien/lop-hoc') ? 'active' : ''}`}>
          <MdPeople /> Quản Lý Lớp Học
        </Link>

        <Link to="/giang-vien/tang-khoa-hoc" className={`gv-nav-link ${isActive('/giang-vien/tang-khoa-hoc') ? 'active' : ''}`}>
          <MdCardGiftcard /> Tặng Khóa Học
        </Link>

        <Link to="/giang-vien/ma-giam-gia" className={`gv-nav-link ${isActive('/giang-vien/ma-giam-gia') ? 'active' : ''}`}>
          <MdCardGiftcard /> Mã Giảm Giá
        </Link>

        <Link to="/giang-vien/tao-lo-trinh-AI" className={`gv-nav-link ${isActive('/giang-vien/tao-lo-trinh-AI') ? 'active' : ''}`}>
          <MdEditNote /> Quản Lý Lộ Trình AI
        </Link>

        <Link to="/giang-vien/rut-tien" className={`gv-nav-link ${isActive('/giang-vien/rut-tien') ? 'active' : ''}`}>
          <MdEditNote /> Rút Tiền
        </Link>

        <Link to="/giang-vien/nap-tien-ai" className={`gv-nav-link ${isActive('/giang-vien/nap-tien-ai') ? 'active' : ''}`}>
          <MdAccountBalanceWallet /> Nạp tiền AI
        </Link>
      </nav>
    </aside>
  );
}
