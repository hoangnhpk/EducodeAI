import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_info");
    setUser(null);
    alert("Bạn đã đăng xuất thành công!");
    navigate("/dang-nhap");
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
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav ms-auto p-4 p-lg-0">
          <Link to="/" className="nav-item nav-link">
            Trang chủ
          </Link>

          <Link to="/yeu-cau-lo-trinh-ai" className="nav-item nav-link">
            Lộ trình AI
          </Link>

          <Link to="/courses" className="nav-item nav-link">
            Khóa học
          </Link>

          {/* KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP */}
          {user ? (
            <div className="nav-item dropdown px-lg-4">
              <a
                href="#"
                className="nav-link dropdown-toggle d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <img
                  src={user.hinhAnh || user.picture || "/img/user-default.png"}
                  alt="avatar"
                  className="rounded-circle me-2"
                  style={{ width: "35px", height: "35px", objectFit: "cover", border: "1px solid #fb873f" }}
                />
                <span className="fw-bold d-none d-lg-inline">{user.hoTen || user.name}</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end fade-down m-0 shadow-sm border-0">
                <Link to="/profile" className="dropdown-item">
                   Hồ sơ cá nhân
                </Link>
                <Link to="/my-courses" className="dropdown-item">
                   Khóa học của tôi
                </Link>
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