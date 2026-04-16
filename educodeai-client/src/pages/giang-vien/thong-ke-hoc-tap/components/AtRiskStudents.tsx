import type { HocVien } from "./Types";
import { AlertTriangle, Mail } from "lucide-react";
import "./css/at-risk-students.css";

interface Props {
  students: HocVien[];
}

const AtRiskStudents = ({ students }: Props) => {
  // Lọc học viên có nguy cơ bỏ học hoặc tỷ lệ hoàn thành < 50%
  const atRiskStudents = students
    .filter((hv) => {
      const tyLe = Number(hv.tyLeHoanThanh ?? 0);
      return hv.trangThai === "Nguy cơ bỏ học" || tyLe < 50;
    })
    .sort((a, b) => Number(a.tyLeHoanThanh ?? 0) - Number(b.tyLeHoanThanh ?? 0))
    .slice(0, 5);

  const handleContact = (hocVien: HocVien) => {
    const email = hocVien.email?.trim() || "";
    const ten = hocVien.tenHocVien?.trim() || "bạn";
    if (!email) return;
    window.location.href = `mailto:${email}?subject=Hỗ trợ học tập&body=Xin chào ${encodeURIComponent(ten)}`;
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
          atRiskStudents.map((hocVien, idx) => (
            <div key={hocVien.maHocVien ?? `risk-${idx}`} className="at-risk-item">
              <div className="at-risk-icon">
                <AlertTriangle size={18} />
              </div>

              <div className="at-risk-info">
                <strong>{hocVien.tenHocVien?.trim() || "—"}</strong>
                <span>{hocVien.email?.trim() || "—"}</span>
                <small>
                  Hoàn thành: {Number(hocVien.tyLeHoanThanh ?? 0).toFixed(1)}% •
                  Điểm TB: {Number(hocVien.diemTrungBinh ?? 0).toFixed(1)}
                </small>
              </div>

              <button
                type="button"
                className="at-risk-btn"
                onClick={() => handleContact(hocVien)}
                disabled={!hocVien.email?.trim()}
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