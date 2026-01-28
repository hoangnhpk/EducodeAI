import { useState } from "react";
import axios from "@/configs/axios";

const CaiDat = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [assignmentNotif, setAssignmentNotif] = useState(true);

  // ===== ĐỔI MẬT KHẨU =====
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!matKhauCu || !matKhauMoi || !xacNhan) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (matKhauMoi !== xacNhan) {
      alert("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);

      const res: any = await axios.post(
        "/NguoiDung/doi-mat-khau",
        {
          matKhauCu,
          matKhauMoi,
          xacNhanMatKhauMoi: xacNhan,
        }
      );


      console.log("API response:", res);

      alert(res?.message || res?.data?.message || "Đổi mật khẩu thành công");

      setShowChangePassword(false);
      setMatKhauCu("");
      setMatKhauMoi("");
      setXacNhan("");
    } catch (err) {
      console.error(err);
      alert("Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="cai-dat-container">
      <h2>Cài Đặt</h2>
      <p className="subtitle">Quản lý thông báo, bảo mật và tài khoản</p>

      {/* ===== THÔNG BÁO ===== */}
      <div className="settings-card">
        <h3>🔔 Thông báo</h3>

        <div className="settings-item">
          <label>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
            />
            <span>Nhận email về khóa học mới</span>
          </label>
        </div>

        <div className="settings-item">
          <label>
            <input
              type="checkbox"
              checked={assignmentNotif}
              onChange={(e) => setAssignmentNotif(e.target.checked)}
            />
            <span>Nhận thông báo về bài tập</span>
          </label>
        </div>
      </div>

      {/* ===== BẢO MẬT ===== */}
      <div className="settings-card">
        <h3>🔒 Bảo mật</h3>

        <button
          className="settings-action-btn"
          onClick={() => setShowChangePassword(true)}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* ===== TÀI KHOẢN ===== */}
      <div className="settings-card danger">
        <h3>⚠️ Tài khoản</h3>

        <button className="settings-action-btn danger">
          Xóa tài khoản
        </button>
      </div>

      {/* ===== MODAL ĐỔI MẬT KHẨU ===== */}
      {showChangePassword && (
        <div
          className="modal-overlay"
          onClick={() => setShowChangePassword(false)}
        >
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🔒 Đổi mật khẩu</h2>
              <button
                className="modal-close"
                onClick={() => setShowChangePassword(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={matKhauCu}
                  onChange={(e) => setMatKhauCu(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={matKhauMoi}
                  onChange={(e) => setMatKhauMoi(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={xacNhan}
                  onChange={(e) => setXacNhan(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowChangePassword(false)}
              >
                Hủy
              </button>

              <button
                className="btn-primary"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaiDat;
