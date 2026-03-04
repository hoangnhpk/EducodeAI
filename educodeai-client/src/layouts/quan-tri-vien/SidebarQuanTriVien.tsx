import { MdDashboard, MdSettings, MdPeople, MdRateReview, MdBuildCircle } from 'react-icons/md';

export default function SidebarQuanTriVien() {
  return (
    <aside className="qtv-sidebar">
      <div className="qtv-sidebar-header">
        <h2><MdSettings /> Quản Trị</h2>
      </div>
      <nav className="qtv-sidebar-nav">
        {/* <a href="/quan-tri-vien" className="qtv-nav-link active">
          <MdDashboard /> Dashboard
        </a> */}
        <a href="/quan-tri-vien/nguoi-dung" className="qtv-nav-link">
          <MdPeople /> Người Dùng
        </a>
        {/* <a href="/quan-tri-vien/quan-ly-binh-luan-review" className="qtv-nav-link">
          <MdRateReview /> Review
        </a>
        <a href="/quan-tri-vien/cau-hinh" className="qtv-nav-link">
          <MdBuildCircle /> Cấu Hình
        </a> */}
      </nav>
    </aside>
  );
}
