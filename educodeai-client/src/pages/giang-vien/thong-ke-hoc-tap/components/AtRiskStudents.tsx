import type { HocVien } from "./Types";
import { AlertTriangle, Mail } from "lucide-react";
import "./css/at-risk-students.css";

interface Props {
  students: HocVien[];
}

const AtRiskStudents = ({ students }: Props) => {
  const getProgress = (hv: HocVien) => Number(hv.tyLeHoanThanh ?? hv.tienDo ?? 0);
  const getName = (hv: HocVien) => hv.tenHocVien?.trim() || hv.hoTen?.trim() || "—";

  const atRiskStudents = students
    .filter((hv) => hv.trangThai === "Nguy cơ bỏ học" || getProgress(hv) < 50)
    .sort((a, b) => getProgress(a) - getProgress(b))
    .slice(0, 5);

  const handleContact = (hocVien: HocVien) => {
    const email = hocVien.email?.trim() || "";
    if (!email) return;
    const ten = getName(hocVien);
    window.location.href = `mailto:${email}?subject=Hỗ trợ học tập&body=Xin chào ${encodeURIComponent(ten)}`;
  };

  return (
    <div className="at-risk-card">
      <div className="at-risk-header">
        <AlertTriangle color="#ef4444" size={20} />
        Học viên có nguy cơ bỏ học
      </div>

      <div className="at-risk-list">
        {atRiskStudents.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
            Không có học viên có nguy cơ bỏ học
          </p>
        ) : (
          atRiskStudents.map((hocVien, idx) => (
            <div key={hocVien.maHocVien ?? hocVien.maNguoiDung ?? `risk-${idx}`} className="at-risk-item">
              <div className="at-risk-icon">
                <AlertTriangle size={18} />
              </div>

              <div className="at-risk-info">
                <strong>{getName(hocVien)}</strong>
                <span>{hocVien.email?.trim() || "—"}</span>
                <small>
                  Hoàn thành: {getProgress(hocVien).toFixed(1)}% • Điểm TB: {Number(hocVien.diemTrungBinh ?? 0).toFixed(1)}
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
