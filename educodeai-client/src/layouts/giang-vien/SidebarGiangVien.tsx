import { MdDashboard, MdSchool, MdBook, MdEditNote, MdInsertChart } from 'react-icons/md';

export default function SidebarGiangVien() {
  return (
    <aside className="gv-sidebar">
      <div className="gv-sidebar-header">
        <h2><MdSchool /> Giảng Viên</h2>
      </div>
      <nav className="gv-sidebar-nav">
        {/* <a href="/giang-vien" className="gv-nav-link active">
          <MdDashboard /> Dashboard
        </a> */}
        <a href="/giang-vien/khoa-hoc-cua-toi" className="gv-nav-link">
          <MdBook /> Khóa Học
        </a>
        <a href="/giang-vien/bai-tap" className="gv-nav-link">
          <MdEditNote /> Bài Tập
        </a>
        <a href="/giang-vien/tao-lo-trinh-AI" className="gv-nav-link">
          <MdEditNote /> Quản Lý Lộ Trình AI
        </a>
        {/* <a href="/giang-vien/thong-ke" className="gv-nav-link">
          <MdInsertChart /> Thống Kê
        </a> */}
      </nav>
    </aside>
  );
}
