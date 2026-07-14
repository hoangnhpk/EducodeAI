import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";
import { hoSoGiangVienService, type TrangThaiHoSo } from "@/services/ho-so-giang-vien.service";
import "./DangKyGiangVien.css";

const CauHinhTrangThai: Record<string, { icon: React.ReactNode; className: string; title: string }> = {
  ChoDuyet: {
    icon: <FaClock />,
    className: "dkgv-status-pending",
    title: "Đang chờ duyệt",
  },
  CanBoSung: {
    icon: <FaExclamationTriangle />,
    className: "dkgv-status-need",
    title: "Cần bổ sung thông tin",
  },
  DaDuyet: {
    icon: <FaCheckCircle />,
    className: "dkgv-status-success",
    title: "Đã được duyệt",
  },
  TuChoi: {
    icon: <FaTimesCircle />,
    className: "dkgv-status-reject",
    title: "Đã bị từ chối",
  },
};

export default function TrangThaiHoSoGiangVien() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [ketQua, setKetQua] = useState<TrangThaiHoSo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập email đã dùng đăng ký.", "error");
      return;
    }
    try {
      setDangTai(true);
      setKetQua(null);
      const res = await hoSoGiangVienService.traCuuTrangThai(email.trim());
      setKetQua(res);
    } catch (error: any) {
      Swal.fire("Không tìm thấy", error?.response?.data?.message ?? "Không tìm thấy hồ sơ với email này.", "error");
    } finally {
      setDangTai(false);
    }
  };

  const cauHinh = ketQua ? CauHinhTrangThai[ketQua.trangThai] : null;

  return (
    <div className="dkgv-container mx-auto" style={{ maxWidth: "640px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/dang-ky-giang-vien" className="text-decoration-none" style={{ color: "#65676b", fontSize: "14px" }}>
          <FaArrowLeft className="me-2" />
          Quay lại trang đăng ký giảng viên
        </Link>
        <h1 className="fw-bold mt-3" style={{ color: "#1c1e21", fontSize: "28px" }}>
          Tra cứu hồ sơ đăng ký
        </h1>
        <p style={{ color: "#65676b", fontSize: "15px" }}>
          Nhập email bạn đã dùng khi đăng ký để xem trạng thái hồ sơ và yêu cầu bổ sung (nếu có).
        </p>
      </div>

      <div className="dkgv-main-card">
        <form onSubmit={handleSubmit} className="dkgv-body">
          <div className="dkgv-form-group">
            <label className="dkgv-form-label">Email đăng ký</label>
            <input
              type="email"
              className="dkgv-form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={dangTai}
            />
          </div>
          <button type="submit" className="dkgv-btn-next brown w-100" disabled={dangTai}>
            {dangTai ? "Đang tra cứu..." : (<><FaSearch className="me-2" /> Tra cứu hồ sơ</>)}
          </button>
        </form>

        {ketQua && cauHinh && (
          <div className="dkgv-body" style={{ borderTop: "1px solid #eee", paddingTop: "24px" }}>
            <div className={`dkgv-status-box ${cauHinh.className}`}>
              <div className="dkgv-status-icon">{cauHinh.icon}</div>
              <div>
                <h5 className="mb-1 fw-bold">{cauHinh.title}</h5>
                <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                  Hồ sơ #{ketQua.maHoSo} · {ketQua.hoTen}
                </p>
              </div>
            </div>


            {ketQua.trangThai === "CanBoSung" && (
              <div className="alert alert-warning mt-3">
                Vui lòng kiểm tra hộp thư email của bạn để biết thêm thông tin bổ sung.
              </div>
            )}

            <div className="mt-3" style={{ fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
              <p className="mb-1"><b>Email:</b> {ketQua.email}</p>
              <p className="mb-1"><b>Ngày nộp:</b> {new Date(ketQua.ngayTao).toLocaleString("vi-VN")}</p>
            </div>

            {ketQua.lyDo && (ketQua.trangThai === "CanBoSung" || ketQua.trangThai === "TuChoi") && (
              <div className={`alert mt-3 ${ketQua.trangThai === "CanBoSung" ? "alert-warning" : "alert-danger"}`}>
                <b>{ketQua.trangThai === "CanBoSung" ? "Nội dung cần bổ sung:" : "Lý do từ chối:"}</b>
                <div className="mt-1">{ketQua.lyDo}</div>
              </div>
            )}

            {ketQua.trangThai === "CanBoSung" && (
              <button
                className="dkgv-btn-next brown w-100 mt-2"
                onClick={() => navigate(`/bo-sung-ho-so/${ketQua.maHoSo}?email=${encodeURIComponent(ketQua.email)}`)}
              >
                <FaExclamationTriangle className="me-2" /> Cập nhật hồ sơ bổ sung
              </button>
            )}

            {ketQua.trangThai === "DaDuyet" && (
              <button className="dkgv-btn-next w-100 mt-2" onClick={() => navigate("/dang-nhap")}>
                <FaCheckCircle className="me-2" /> Đăng nhập ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
