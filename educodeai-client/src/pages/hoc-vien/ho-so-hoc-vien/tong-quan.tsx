import { useState } from "react";
import type { HoSoHocVienDTO } from "../../../services/ho-so-hoc-vien.service";
import { updateHoSoHocVien } from "../../../services/ho-so-hoc-vien.service";
import "./css/tong-quan.css";

interface TongQuanProps {
  data: HoSoHocVienDTO;
}

const TongQuan = ({ data }: TongQuanProps) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: data.hoTen,
    AnhDaiDien: null as File | null
  });
  const [previewImage, setPreviewImage] = useState(data.anhDaiDien || "");
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi tên
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hoTen: e.target.value }));
  };

  // Xử lý upload ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, AnhDaiDien: file }));
      
      // Preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang cập nhật hồ sơ:", formData);
      
      await updateHoSoHocVien(formData);
      
      alert("✅ Cập nhật thành công!");
      setShowModal(false);
      
      // Reload trang để lấy data mới
      window.location.reload();
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật:", error);
      alert(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tong-quan-container">
      <div className="tong-quan-layout">
        
        {/* ===== LEFT: PROFILE CARD ===== */}
        <div className="profile-card">
          <div className="avatar-wrapper">
            {previewImage || data.anhDaiDien ? (
              <img
                src={previewImage || data.anhDaiDien}
                alt={data.hoTen}
                className="avatar-img"
              />
            ) : (
              <div className="avatar-img" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold'
              }}>
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

        {/* ===== RIGHT: MAIN CONTENT ===== */}
        <div className="main-content">
          <div className="content-header">
            <h1>Tóm Tắt Học Tập</h1>
            <p>
              Đây là không gian học tập cá nhân của bạn trên Secret Coder. 
              Tại đây bạn có thể nhanh chóng xem tiến độ tổng thể, các khóa học 
              bạn đang tham gia và những thành tích bạn đã đạt được.
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

          <div className="progress-section">
            <h3>Tiến độ học tập tổng thể</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${data.tyLeHoanThanh}%` }}
              >
                {data.tyLeHoanThanh > 0 && `${data.tyLeHoanThanh}%`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh Sửa Hồ Sơ</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="avatar-edit">
                <div className="avatar-preview">
                  {previewImage || data.anhDaiDien ? (
                    <img src={previewImage || data.anhDaiDien} alt="Preview" />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '28px', fontWeight: 'bold', color: 'white',
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      borderRadius: '50%'
                    }}>
                      {data.hoTen.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="avatar-upload" className="upload-btn">
                    Đổi ảnh đại diện
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Họ và Tên</label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={handleNameChange}
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={data.email} 
                  disabled 
                  style={{ 
                    background: '#f1f5f9', 
                    cursor: 'not-allowed',
                    color: '#64748b'
                  }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
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