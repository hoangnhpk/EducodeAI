import { useState } from "react";
import type {
  HoSoHocVienDTO,
  UpdateHoSoHocVienDTO,
} from "../../../services/ho-so-hoc-vien.service";
import { updateHoSoHocVien } from "../../../services/ho-so-hoc-vien.service";
import "./ho-so-hoc-vien.css";

interface Props {
  data: HoSoHocVienDTO;
}

const TongQuan = ({ data }: Props) => {
  const [showEdit, setShowEdit] = useState(false);
  const [hoTen, setHoTen] = useState(data.hoTen);
  const [anhDaiDien, setAnhDaiDien] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);


  const handleSave = async () => {
    const payload: UpdateHoSoHocVienDTO = {
      hoTen,
      AnhDaiDien: anhDaiDien,
    };

    try {
      setLoading(true);
      await updateHoSoHocVien(payload);
      setShowEdit(false);
      window.location.reload(); // reload lại hồ sơ cho chắc
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tong-quan-container">
      <div className="tong-quan-content">
        <div className="tong-quan-header">
          <h1>Tóm Tắt Học Tập</h1>
          <p>
            Đây là không gian học tập cá nhân của bạn. Bạn có thể xem tiến độ,
            khóa học và chỉnh sửa hồ sơ cá nhân.
          </p>
        </div>

        <div className="tong-quan-grid">
          {/* PROFILE CARD */}
          <div className="student-profile-card">
            <div className="student-profile-content">
              <div className="student-avatar">
                {data.anhDaiDien ? (
                  <img
                    src={`http://localhost:5210${data.anhDaiDien}`}
                    alt="avatar"
                    className="avatar-img"
                  />
                ) : (
                  <span>{data.hoTen?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>


              <h2 className="student-name">{data.hoTen}</h2>
              <p className="student-role">{data.vaiTro}</p>
              <p className="student-email">{data.email}</p>

              <button
                className="edit-profile-btn"
                onClick={() => setShowEdit(true)}
              >
                ✏️ Chỉnh Sửa Hồ Sơ
              </button>

              <div className="student-stats-grid">
                <div className="student-stat-item">
                  <div className="student-stat-number">{data.tongKhoaHoc}</div>
                  <div className="student-stat-label">Khóa Học</div>
                </div>
                <div className="student-stat-item">
                  <div className="student-stat-number">{data.daHoanThanh}</div>
                  <div className="student-stat-label">Hoàn Thành</div>
                </div>
                <div className="student-stat-item">
                  <div className="student-stat-number">{data.chungChi}</div>
                  <div className="student-stat-label">Chứng Chỉ</div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-cards-grid">
            <div className="stat-card hours">
              <p className="stat-label">Giờ Đã Học</p>
              <h2 className="stat-value">{data.gioDaHoc}h</h2>
            </div>

            <div className="stat-card current">
              <p className="stat-label">Đang Học</p>
              <h2 className="stat-value">{data.dangHoc}</h2>
            </div>

            <div className="stat-card completion">
              <p className="stat-label">Tỷ Lệ Hoàn Thành</p>
              <h2 className="stat-value">{data.tyLeHoanThanh}%</h2>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${data.tyLeHoanThanh}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chỉnh sửa hồ sơ</h2>
              <button
                className="modal-close"
                onClick={() => setShowEdit(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* AVATAR */}
              <div className="avatar-edit">
                <div className="avatar-preview">
                  {anhDaiDien ? (
                    <img
                      src={URL.createObjectURL(anhDaiDien)}
                      alt="preview"
                      className="avatar-img"
                    />
                  ) : data.anhDaiDien ? (
                    <img
                      src={`http://localhost:5210${data.anhDaiDien}`}
                      alt="avatar"
                      className="avatar-img"
                    />
                  ) : (
                    <span>{hoTen?.[0]?.toUpperCase() || "?"}</span>
                  )}
                </div>

                <label className="upload-btn">
                  Đổi ảnh đại diện
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setAnhDaiDien(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>

              {/* NAME */}
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TongQuan;
