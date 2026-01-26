import type { HocVien } from "./Types";
import { AlertTriangle, Mail } from "lucide-react";
import "./css/at-risk-students.css";

interface Props {
  students: HocVien[];
}

const AtRiskStudents = ({ students }: Props) => {
  // Lọc học viên có nguy cơ bỏ học hoặc tỷ lệ hoàn thành < 50%
  const atRiskStudents = students
    .filter(
      (hv) => 
        hv.trangThai === "Nguy cơ bỏ học" || 
        hv.tyLeHoanThanh < 50
    )
    .sort((a, b) => a.tyLeHoanThanh - b.tyLeHoanThanh) // Sắp xếp theo tỷ lệ tăng dần (thấp nhất trước)
    .slice(0, 5);

  const handleContact = (hocVien: HocVien) => {
    // TODO: Implement send email functionality
    window.location.href = `mailto:${hocVien.email}?subject=Hỗ trợ học tập&body=Xin chào ${hocVien.tenHocVien}`;
  };

  return (
    <div className="at-risk-card">
      {/* ===== HEADER ===== */}
      <div className="at-risk-header">
        <AlertTriangle color="#ef4444" size={20} />
        Học viên có nguy cơ bỏ học
      </div>

      {/* ===== LIST ===== */}
      <div className="at-risk-list">
        {atRiskStudents.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: '20px' }}>
            Không có học viên có nguy cơ bỏ học
          </p>
        ) : (
          atRiskStudents.map((hocVien) => (
            <div key={hocVien.maHocVien} className="at-risk-item">
              <div className="at-risk-icon">
                <AlertTriangle size={18} />
              </div>

              <div className="at-risk-info">
                <strong>{hocVien.tenHocVien}</strong>
                <span>{hocVien.email}</span>
                <small>
                  Hoàn thành: {hocVien.tyLeHoanThanh.toFixed(1)}% • 
                  Điểm TB: {hocVien.diemTrungBinh.toFixed(1)}
                </small>
              </div>

              <button 
                className="at-risk-btn"
                onClick={() => handleContact(hocVien)}
                title="Gửi email liên hệ"
              >
                <Mail size={16} />
                Liên hệ
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AtRiskStudents;