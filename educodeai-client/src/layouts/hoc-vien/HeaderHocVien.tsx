import { Link } from "react-router-dom";

export default function HeaderHocVien() {
  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
      <Link
        to="/"
        className="navbar-brand d-flex align-items-center px-4 px-lg-5"
      >
        <p className="m-0 fw-bold" style={{ fontSize: 25 }}>
          <img src="/img/icon.png" alt="" height={50} />
          Secret<span style={{ color: "#fb873f" }}>Coder</span>
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

          {/* <div className="nav-item dropdown">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              Trang
            </a>
            <div className="dropdown-menu fade-down m-0">
              <Link to="/team" className="dropdown-item">
                Đội ngũ
              </Link>
              <Link to="/testimonial" className="dropdown-item">
                Phản hồi
              </Link>
            </div>
          </div>

          <Link to="/contact" className="nav-item nav-link">
            Liên hệ
          </Link> */}

          <Link to="/login" className="nav-item nav-link">
            <i className="fa fa-user"></i>
          </Link>
        </div>
      </div>
    </nav>
  );
}
