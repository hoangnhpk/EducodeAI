import React from "react";

const FooterHocVien: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
      <a
        href="/"
        className="navbar-brand d-flex align-items-center px-4 px-lg-5"
      >
        <p className="m-0 fw-bold" style={{ fontSize: 25 }}>
          <img src="img/icon.png" alt="Logo" height={50} />{" "}
          Secret<span style={{ color: "#fb873f" }}>Coder</span>
        </p>
      </a>

      <button
        type="button"
        className="navbar-toggler me-4"
        data-bs-toggle="collapse"
        data-bs-target="#navbarCollapse"
        aria-controls="navbarCollapse"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav ms-auto p-4 p-lg-0">
          <a href="/" className="nav-item nav-link">
            Trang chủ
          </a>
          <a href="/about" className="nav-item nav-link">
            Giới thiệu
          </a>
          <a href="/courses" className="nav-item nav-link">
            Khóa học
          </a>

          <div className="nav-item dropdown">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              Trang
            </a>
            <div className="dropdown-menu fade-down m-0">
              <a href="/team" className="dropdown-item">
                Đội ngũ
              </a>
              <a href="/testimonial" className="dropdown-item">
                Phản hồi
              </a>
            </div>
          </div>

          <a href="/contact" className="nav-item nav-link">
            Liên hệ
          </a>

          <a href="/login" className="nav-item nav-link">
            <i className="fa fa-user"></i>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default FooterHocVien;
