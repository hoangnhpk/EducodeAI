import { useState } from "react";
import "./chinh-sua-ho-so.css";

interface Props {
  hoTen: string;
  email: string;
  soDienThoai?: string;
  onClose: () => void;
}

const ChinhSuaHoSo = ({ hoTen, email, soDienThoai, onClose }: Props) => {
  const [fullName, setFullName] = useState(hoTen);
  const [phone, setPhone] = useState(soDienThoai || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Call API update profile
    console.log("Cập nhật hồ sơ:", {
      fullName,
      phone,
    });

    onClose();
  };

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-modal">
        <h2>Chỉnh sửa hồ sơ</h2>
        <p className="subtitle">Cập nhật thông tin cá nhân của bạn</p>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} disabled />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="edit-profile-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>

            <button type="submit" className="btn-save">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChinhSuaHoSo;
