import { useEffect, useState } from 'react';
import { MdPeople, MdRateReview, MdSettings, MdDashboard, MdCardGiftcard, MdSchool } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import { HoSoGiangVienAdminService } from '@/services/ho-so-giang-vien-admin.service';

export default function SidebarQuanTriVienMoi() {
  const [choDuyetCount, setChoDuyetCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      try {
        const count = await HoSoGiangVienAdminService.demChoDuyet();
        if (active) setChoDuyetCount(count);
      } catch {
        // bỏ qua lỗi (ví dụ chưa đăng nhập admin)
      }
    };
    fetchCount();
    // Cập nhật mỗi 30 giây để badge luôn mới
    const interval = setInterval(fetchCount, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

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

        <NavLink to="/quan-tri-vien/duyet-giang-vien" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdSchool /></div>
          <span>Duyệt giảng viên</span>
          {choDuyetCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              borderRadius: '999px',
              padding: '0 8px',
              fontSize: '12px',
              fontWeight: 700,
              minWidth: '22px',
              textAlign: 'center',
              lineHeight: '20px'
            }}>{choDuyetCount}</span>
          )}
        </NavLink>

        <NavLink to="/quan-tri-vien/quan-ly-api-key" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-key-fill"></i></div>
          <span>Quản lý API AI</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/tang-khoa-hoc" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdCardGiftcard /></div>
          <span>Tặng khóa học</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/quan-ly-binh-luan-review" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdRateReview /></div>
          <span>Đánh giá khóa học</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/cau-hinh-he-thong" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="fa fa-cogs"></i></div>
          <span>Cấu hình hệ thống</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/rut-tien-giang-vien" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-wallet2" aria-hidden /></div>
          <span>Rút tiền giảng viên</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/ho-tro-thanh-toan-hoc-vien" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-headset" aria-hidden /></div>
          <span>Hỗ trợ thanh toán</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/ma-qua-tang" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><MdCardGiftcard /></div>
          <span>Mã quà tặng học viên</span>
        </NavLink>

        <NavLink to="/quan-tri-vien/ma-giam-gia" className={({ isActive }) => `qtv-nav-link ${isActive ? 'active' : ''}`}>
          <div className="link-icon"><i className="bi bi-ticket-perforated" aria-hidden /></div>
          <span>Mã giảm giá</span>
        </NavLink>
      </nav>
    </aside>
  );
}
