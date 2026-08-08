import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { redirectToLoginOnce } from "../../utils/sessionTermination";

export default function HeaderHocVien() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const userData = localStorage.getItem("user_info");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user:", error);
      }
    }
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      redirectToLoginOnce(navigate);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
      <Link
        to="/"
        className="navbar-brand d-flex align-items-center px-4 px-lg-5"
      >
        <p className="m-0 fw-bold" style={{ fontSize: 25 }}>
          <img src="/img/icon.png" alt="" height={50} />
          EDUCODE<span style={{ color: "#fb873f" }}>AI</span>
        </p>
      </Link>

      <button
        type="button"
        className="navbar-toggler me-4"
        data-bs-toggle="collapse"
        data-bs-target="#navbarCollapse"
        aria-controls="navbarCollapse"
        aria-expanded="false"
        aria-label="Mở menu điều hướng"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav ms-auto p-4 p-lg-0">
          <Link to="/" className="nav-item nav-link">
            Trang chủ
          </Link>

          <div className="nav-item dropdown">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={(e) => e.preventDefault()}
            >
              Hệ Sinh Thái AI
            </a>
            <div className="dropdown-menu fade-down m-0 shadow-sm border-0">
              <Link to="/yeu-cau-lo-trinh-ai" className="dropdown-item">
                Lộ trình AI
              </Link>
              <Link to="/sinh-do-an-ai" className="dropdown-item">
                Sinh đồ án AI
              </Link>
              <Link to="/phong-van-ai" className="dropdown-item">
                Phỏng vấn AI
              </Link>
            </div>
          </div>

          <Link to="/khong-gian-hoc-tap" className="nav-item nav-link">
            Không gian học tập
          </Link>

          <Link to="/thu-thach-hoc-tap" className="nav-item nav-link">
            Thử thách học tập
          </Link>

          {/* KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP */}
          {user ? (
            <div className="nav-item dropdown px-lg-4">
              <button
                type="button"
                className="nav-link dropdown-toggle d-flex align-items-center border-0 bg-transparent"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Mở menu tài khoản"
              >
                <span className="fw-bold d-none d-lg-inline">{user.hoTen || user.name}</span>
              </button>

              {/* DANH SÁCH MENU XỔ XUỐNG */}
              <div className="dropdown-menu dropdown-menu-end fade-down m-0 shadow-sm border-0">
                <Link to="/profile" className="dropdown-item">
                  Hồ sơ cá nhân
                </Link>
                <Link to="/khong-gian-hoc-tap" className="dropdown-item">
                  Không gian học tập
                </Link>
                <Link to="/thu-thach-hoc-tap" className="dropdown-item">
                  Thử thách học tập
                </Link>
                <Link to="/hoc-vien/khoa-hoc-cua-toi" className="dropdown-item">
                  Khóa học của tôi
                </Link>
                <Link to="/hoc-vien/nhap-ma-qua-tang" className="dropdown-item">
                  Nhập mã quà tặng
                </Link>
                <Link to="/hoc-vien/lich-su-ma-qua-tang" className="dropdown-item">
                  Lịch sử mã quà tặng
                </Link>
                <Link to="/khoa-hoc-ai-cua-toi" className="dropdown-item">
                  Lộ trình của tôi
                </Link>

                {/* --- ĐÂY LÀ PHẦN BẢO MẬT TÀI KHOẢN XỔ SANG TRÁI --- */}
                <div className="dropdown-submenu position-relative"> {/* Thêm position-relative vào đây */}
                  <Link
                    to="#"
                    className="dropdown-item d-flex justify-content-between align-items-center"
                    onClick={(e) => e.preventDefault()}
                  >
                    Bảo mật tài khoản <i className="fa fa-chevron-left ms-2 text-muted" style={{ fontSize: '12px' }}></i>
                  </Link>

                  {/* Submenu con */}
                  <div className="dropdown-menu shadow border-0">
                    <Link to="/bao-mat" className="dropdown-item">
                      Đổi mật khẩu
                    </Link>
                    <Link to="/thiet-bi" className="dropdown-item">
                      Thiết bị đăng nhập
                    </Link>
                  </div>
                </div>
                {/* ------------------------------------------------ */}

                <hr className="dropdown-divider" />
                <button
                  onClick={handleLogout}
                  className="dropdown-item text-danger fw-bold"
                >
                  <i className="fa fa-sign-out-alt me-2"></i> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link to="/dang-nhap" className="nav-item nav-link">
              <i className="fa fa-user me-2"></i> Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
