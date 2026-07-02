import React, { useEffect } from "react";
import { useSystemConfig } from "../../contexts/SystemConfigContext";

const FooterHocVien: React.FC = () => {
  // Lấy dữ liệu cấu hình từ Context
  const { configs } = useSystemConfig();

  // Thêm useEffect để theo dõi sự thay đổi của configs (Realtime)
  useEffect(() => {
    // Component sẽ tự động re-render khi configs trong Context thay đổi
  }, [configs]);

  return (
    <div
      className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn"
      data-wow-delay="0.1s"
    >
      <div className="container py-5">
        <div className="row g-5">
          {/* Cột 1 */}
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-3">Liên kết nhanh</h4>
            <p>
              <a className="text-light" href="/about">
                Về chúng tôi
              </a>
            </p>
            <p>
              <a className="text-light" href="/contact">
                Liên hệ
              </a>
            </p>
            <p>
              <a className="text-light" href="#">
                Chính sách bảo mật
              </a>
            </p>
            <p>
              <a className="text-light" href="#">
                Điều khoản &amp; Điều kiện
              </a>
            </p>
            <p>
              <a className="text-light" href="#">
                Câu hỏi thường gặp &amp; Trợ giúp
              </a>
            </p>
          </div>

          {/* Cột 2 */}
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-3">Liên hệ</h4>
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-3"></i>
              {configs?.DiaChi || "123 Đường, TP.HCM, Việt Nam"}
            </p>
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3"></i>
              {configs?.SoDienThoai || "+84 123 456 789"}
            </p>
            <p className="mb-2">
              <i className="fa fa-envelope me-3"></i>
              {configs?.EmailLienHe || "support@educodeai.vn"}
            </p>

            <div className="d-flex pt-2">
              <a className="btn btn-outline-light btn-social" href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="#">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="#">
                <i className="fab fa-youtube"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="#">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Cột 3 */}
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-3">Đăng ký nhận bản tin</h4>
            <p>
              Đăng ký ngay và tham gia cộng đồng học viên đang phát triển của
              chúng tôi, cam kết với giáo dục suốt đời!
            </p>

            <div
              className="position-relative mx-auto"
              style={{ maxWidth: 400 }}
            >
              <form>
                <input
                  className="form-control border-0 w-100 py-3 ps-4 pe-5"
                  type="email"
                  placeholder="Email của bạn"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              ©{" "}
              <a className="border-bottom" href="/">
                {configs?.TenWebsite || "EduCodeAI"}
              </a>
              , All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterHocVien;