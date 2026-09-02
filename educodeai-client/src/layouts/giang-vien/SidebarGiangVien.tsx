import { Link, useLocation } from 'react-router-dom';

export default function SidebarGiangVien() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="gv-sidebar">
      <div className="gv-sidebar-header">
        <h2><i className="fas fa-graduation-cap" aria-hidden="true" /> Giảng Viên</h2>
      </div>
      <nav className="gv-sidebar-nav">
        <Link to="/giang-vien/thong-ke" className={`gv-nav-link ${isActive('/giang-vien/thong-ke') || location.pathname === '/giang-vien' ? 'active' : ''}`}>
          <i className="fas fa-chart-line" aria-hidden="true" /> Thống Kê
        </Link>

        <Link to="/giang-vien/khoa-hoc-cua-toi" className={`gv-nav-link ${isActive('/giang-vien/khoa-hoc-cua-toi') ? 'active' : ''}`}>
          <i className="fas fa-book" aria-hidden="true" /> Khóa Học
        </Link>
        <Link
          to="/giang-vien/bai-tap"
          className={`gv-nav-link ${isActive('/giang-vien/bai-tap') || isActive('/giang-vien/bai-tap-thuc-hanh') ? 'active' : ''}`}
        >
          <i className="fas fa-code" aria-hidden="true" /> Quản lý bài tập
        </Link>

        <Link to="/giang-vien/chung-chi" className={`gv-nav-link ${isActive('/giang-vien/chung-chi') ? 'active' : ''}`}>
          <i className="fas fa-certificate" aria-hidden="true" /> Chứng Chỉ
        </Link>

        <Link to="/giang-vien/lop-hoc" className={`gv-nav-link ${isActive('/giang-vien/lop-hoc') ? 'active' : ''}`}>
          <i className="fas fa-users" aria-hidden="true" /> Quản Lý Lớp Học
        </Link>

        <Link to="/giang-vien/tang-khoa-hoc" className={`gv-nav-link ${isActive('/giang-vien/tang-khoa-hoc') ? 'active' : ''}`}>
          <i className="fas fa-gift" aria-hidden="true" /> Tặng Khóa Học
        </Link>

        <Link to="/giang-vien/ma-giam-gia" className={`gv-nav-link ${isActive('/giang-vien/ma-giam-gia') ? 'active' : ''}`}>
          <i className="fas fa-tags" aria-hidden="true" /> Mã Giảm Giá
        </Link>

        <Link to="/giang-vien/tao-lo-trinh-AI" className={`gv-nav-link ${isActive('/giang-vien/tao-lo-trinh-AI') ? 'active' : ''}`}>
          <i className="fas fa-route" aria-hidden="true" /> Quản Lý Lộ Trình AI
        </Link>

        <Link to="/giang-vien/rut-tien" className={`gv-nav-link ${isActive('/giang-vien/rut-tien') ? 'active' : ''}`}>
          <i className="fas fa-money-bill-wave" aria-hidden="true" /> Rút Tiền
        </Link>

        <Link to="/giang-vien/nap-tien-ai" className={`gv-nav-link ${isActive('/giang-vien/nap-tien-ai') ? 'active' : ''}`}>
          <i className="fas fa-wallet" aria-hidden="true" /> Nạp tiền AI
        </Link>
      </nav>
    </aside>
  );
}
