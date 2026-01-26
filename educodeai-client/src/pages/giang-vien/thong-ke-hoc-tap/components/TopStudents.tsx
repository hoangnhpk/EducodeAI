import { Trophy } from "lucide-react";
import type { HocVien } from "./Types";
import "./css/top-students.css";

interface Props {
  students: HocVien[];
}

const TopStudents = ({ students }: Props) => {
  // Sắp xếp theo điểm TB giảm dần và lấy top 5
  const topStudents = [...students]
    .sort((a, b) => b.diemTrungBinh - a.diemTrungBinh)
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
          <div key={hocVien.maHocVien} className="top-student-item">
            <div className="top-rank">{index + 1}</div>

            <div className="top-info">
              <strong>{hocVien.tenHocVien}</strong>
              <span>{hocVien.email}</span>
              <small style={{ color: '#10b981', fontSize: '12px' }}>
                Hoàn thành: {hocVien.tyLeHoanThanh.toFixed(1)}%
              </small>
            </div>

            <div className="top-score">
              {hocVien.diemTrungBinh.toFixed(1)}/10
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