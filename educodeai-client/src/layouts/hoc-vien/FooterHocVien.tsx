import React from "react";
import { Link } from "react-router-dom";
import { useSystemConfig } from "../../contexts/SystemConfigContext";

// Footer nền tối nên dùng bản logo cam-trắng, không dùng logo chính của header.
// Không lấy từ configs.LogoUrl vì ô cấu hình đó đang bị khóa (disabled) bên admin.
const LOGO_FOOTER = "/img/logoedu_trang_cam.png";

const NHOM_LIEN_KET: { tieuDe: string; muc: { nhan: string; duong: string }[] }[] = [
  {
    tieuDe: "Khám phá",
    muc: [
      { nhan: "Trang chủ", duong: "/" },
      { nhan: "Khám phá lộ trình", duong: "/kham-pha-lo-trinh" },
      { nhan: "Khóa học của tôi", duong: "/hoc-vien/khoa-hoc-cua-toi" },
      { nhan: "Không gian học tập", duong: "/khong-gian-hoc-tap" },
      { nhan: "Thử thách học tập", duong: "/thu-thach-hoc-tap" }
    ]
  },
  {
    tieuDe: "Công cụ AI",
    muc: [
      { nhan: "Sinh lộ trình AI", duong: "/yeu-cau-lo-trinh-ai" },
      { nhan: "Sinh đồ án AI", duong: "/sinh-do-an-ai" },
      { nhan: "Phỏng vấn AI", duong: "/phong-van-ai" },
      { nhan: "Khóa học AI của tôi", duong: "/khoa-hoc-ai-cua-toi" }
    ]
  }
];

const FooterHocVien: React.FC = () => {
  const { configs } = useSystemConfig();

  const tenWebsite = configs?.TenWebsite || "EduCodeAI";
  const soDienThoai = configs?.SoDienThoai;
  const emailLienHe = configs?.EmailLienHe;
  const diaChi = configs?.DiaChi;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-5 site-footer-main">
          {/* Thương hiệu */}
          <div className="col-lg-4 col-md-12">
            <Link to="/" className="site-footer-brand">
              <img src={LOGO_FOOTER} alt={tenWebsite} className="site-footer-logo" />
              <span>{tenWebsite}</span>
            </Link>
            <p className="site-footer-tagline">
              Nền tảng e-learning với lộ trình bài bản, đồ án thực chiến và
              phòng phỏng vấn ảo được hỗ trợ bởi Trí tuệ nhân tạo.
            </p>
            <Link to="/dang-ky-giang-vien" className="site-footer-cta">
              <i className="fa-solid fa-chalkboard-user" aria-hidden="true"></i>
              Trở thành giảng viên
            </Link>
          </div>

          {/* Các nhóm liên kết */}
          {NHOM_LIEN_KET.map((nhom) => (
            <div key={nhom.tieuDe} className="col-lg-2 col-md-4 col-6">
              <h5 className="site-footer-heading">{nhom.tieuDe}</h5>
              <ul className="site-footer-links">
                {nhom.muc.map((muc) => (
                  <li key={muc.duong}>
                    <Link to={muc.duong}>{muc.nhan}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Liên hệ */}
          <div className="col-lg-4 col-md-4 col-12">
            <h5 className="site-footer-heading">Liên hệ</h5>
            <ul className="site-footer-contact">
              {diaChi && (
                <li>
                  <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                  <span>{diaChi}</span>
                </li>
              )}
              {soDienThoai && (
                <li>
                  <i className="fa-solid fa-phone" aria-hidden="true"></i>
                  <a href={`tel:${soDienThoai.replace(/\s/g, "")}`}>{soDienThoai}</a>
                </li>
              )}
              {emailLienHe && (
                <li>
                  <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                  <a href={`mailto:${emailLienHe}`}>{emailLienHe}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>
            © {new Date().getFullYear()} {tenWebsite}. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterHocVien;
