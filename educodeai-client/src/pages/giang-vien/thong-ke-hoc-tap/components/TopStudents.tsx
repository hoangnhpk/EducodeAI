import { Trophy } from "lucide-react";
import type { Student } from "./Types";
import "./css/top-students.css";

interface Props {
  students: Student[];
}

const TopStudents = ({ students }: Props) => {
  const topStudents = [...students]
    .sort((a, b) => b.avgScore - a.avgScore)
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
        {topStudents.map((student, index) => (
          <div key={student.id} className="top-student-item">
            <div className="top-rank">{index + 1}</div>

            <div className="top-info">
              <strong>{student.name}</strong>
              <span>{student.email}</span>
            </div>

            <div className="top-score">{student.avgScore}/10</div>
          </div>
        ))}

        {topStudents.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Chưa có dữ liệu
          </p>
        )}
      </div>
    </div>
  );
};

export default TopStudents;
