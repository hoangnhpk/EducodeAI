import { Trophy } from "lucide-react";
import type { HocVien } from "./Types";
import "./css/top-students.css";

interface Props {
  students: HocVien[];
}

const TopStudents = ({ students }: Props) => {
  // Sắp xếp theo điểm TB giảm dần và lấy top 5
  const topStudents = [...students]
    .sort((a, b) => Number(b.diemTrungBinh ?? 0) - Number(a.diemTrungBinh ?? 0))
    .slice(0, 5);

  return (
    <div className="top-students-card">
      {/* ===== HEADER ===== */}
      <div className="top-students-header">
        <Trophy color="#facc15" size={20} />
        Top học viên xuất sắc
      </div>

      {/* ===== LIST ===== */}
      <div className="top-students-list">
        {topStudents.map((hocVien, index) => (
          <div key={hocVien.maHocVien ?? `top-${index}`} className="top-student-item">
            <div className="top-rank">{index + 1}</div>

            <div className="top-info">
              <strong>{hocVien.tenHocVien?.trim() || "—"}</strong>
              <span>{hocVien.email?.trim() || "—"}</span>
              <small style={{ color: '#10b981', fontSize: '12px' }}>
                Hoàn thành: {Number(hocVien.tyLeHoanThanh ?? 0).toFixed(1)}%
              </small>
            </div>

            <div className="top-score">
              {Number(hocVien.diemTrungBinh ?? 0).toFixed(1)}/10
            </div>
          </div>
        ))}

        {topStudents.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: '20px' }}>
            Chưa có dữ liệu
          </p>
        )}
      </div>
    </div>
  );
};

export default TopStudents;