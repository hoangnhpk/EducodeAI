import { MdLogout } from 'react-icons/md';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function HeaderQuanTriVien() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: "Bạn có chắc chắn muốn đăng xuất?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#fb873f',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      await authService.logout();
      navigate('/dang-nhap');
    }
  };

  return (
    <header className="qtv-header">
      <div className="qtv-header-left">
        <h1 className="qtv-page-title">Quản Trị Hệ Thống</h1>
      </div>
      <div className="qtv-header-right d-flex align-items-center gap-3">
        <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleLogout}>
          <MdLogout /> Đăng xuất
        </button>
      </div>
    </header>
  );
}
