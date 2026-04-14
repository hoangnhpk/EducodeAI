import { useState } from "react";
import type { HoSoHocVienDTO } from "../../../services/ho-so-hoc-vien.service";
import { updateHoSoHocVien } from "../../../services/ho-so-hoc-vien.service";
import "./css/tong-quan.css";
import Swal from "sweetalert2";

// 👉 URL backend (bỏ /api)
const BE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

interface TongQuanProps {
  data: HoSoHocVienDTO;
}

const TongQuan = ({ data }: TongQuanProps) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: data.hoTen,
    AnhDaiDien: null as File | null,
  });

  // 👉 previewImage luôn là URL HỢP LỆ để <img> dùng
  const [previewImage, setPreviewImage] = useState<string>(
    data.anhDaiDien ? `${BE_URL}${data.anhDaiDien}` : ""
  );

  const [loading, setLoading] = useState(false);

  // ===== HANDLE NAME =====
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, hoTen: e.target.value }));
  };

  // ===== HANDLE IMAGE =====
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, AnhDaiDien: file }));

    // Preview base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang cập nhật hồ sơ:", formData);

      await updateHoSoHocVien(formData);

      Swal.fire({ icon: 'success', text: "✅ Cập nhật thành công!", timer: 1500, showConfirmButton: false });
      setShowModal(false);

      // Reload để lấy data mới từ API
      window.location.reload();
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật:", error);
      Swal.fire({ icon: 'error', text: error.message || "Có lỗi xảy ra!", timer: 2000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  // ===== AVATAR SRC =====
  const avatarSrc =
    previewImage ||
    (data.anhDaiDien ? `${BE_URL}${data.anhDaiDien}` : "");

  return (
    <div className="tong-quan-container">
      <div className="tong-quan-layout">
        {/* ===== LEFT ===== */}
        <div className="profile-card">
          <div className="avatar-wrapper">
            {avatarSrc ? (
              <img src={avatarSrc} alt={data.hoTen} className="avatar-img" />
            ) : (
              <div
                className="avatar-img"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  fontSize: "48px",
                  fontWeight: "bold",
                }}
              >
                {data.hoTen.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2>{data.hoTen}</h2>
            <span className="role">
              {data.vaiTro === 1 ? "Học Viên" : "Giảng Viên"}
            </span>
            <p className="email">{data.email}</p>
          </div>

          <button
            className="edit-profile-btn"
            onClick={() => setShowModal(true)}
          >
            Chỉnh Sửa Hồ Sơ
          </button>

          <div className="profile-mini-stats">
            <div className="mini-stat-item">
              <h3>{data.tongKhoaHoc}</h3>
              <p>Khóa Học</p>
            </div>
            <div className="mini-stat-item">
              <h3>{data.daHoanThanh}</h3>
              <p>Đã Hoàn Thành</p>
            </div>
            <div className="mini-stat-item">
              <h3>{data.chungChi}</h3>
              <p>Chứng Chỉ</p>
            </div>
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="main-content">
          <div className="content-header">
            <h1>Tóm Tắt Học Tập</h1>
            <p>
              Đây là không gian học tập cá nhân của bạn trên Secret Coder.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card blue">
              <span className="stat-label">Giờ Đã Học</span>
              <div className="stat-value">{data.gioDaHoc}h</div>
            </div>
            <div className="stat-card purple">
              <span className="stat-label">Đang Học</span>
              <div className="stat-value">{data.dangHoc}</div>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Tỷ Lệ Hoàn Thành</span>
              <div className="stat-value">{data.tyLeHoanThanh}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chỉnh Sửa Hồ Sơ</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="avatar-edit">
                <div className="avatar-preview">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Preview" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "white",
                        background:
                          "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        borderRadius: "50%",
                      }}
                    >
                      {data.hoTen.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <label htmlFor="avatar-upload" className="upload-btn">
                  Đổi ảnh đại diện
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="form-group">
                <label>Họ và Tên</label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={handleNameChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={data.email} disabled />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TongQuan;
