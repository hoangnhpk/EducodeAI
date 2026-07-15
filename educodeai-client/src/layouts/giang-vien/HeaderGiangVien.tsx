import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function HeaderGiangVien() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: "Bạn có chắc chắn muốn đăng xuất?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--danger)',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      await authService.logout();
      navigate('/dang-nhap');
    }
  };

  return (
    <header className="gv-header">
      <div className="gv-header-left">
        <h1 className="gv-page-title">Giảng Viên</h1>
        <p className="gv-page-subtitle">Quản lý khóa học và bài tập</p>
      </div>
      <div className="gv-header-right d-flex align-items-center gap-3">
        <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket" aria-hidden="true" /> Đăng xuất
        </button>
      </div>
    </header>
  );
}
