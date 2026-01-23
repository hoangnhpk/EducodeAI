import type { Student } from "./Types";
import { AlertTriangle, Mail } from "lucide-react";
import "./css/at-risk-students.css";

interface Props {
  students: Student[];
}

const AtRiskStudents = ({ students }: Props) => {
  const atRiskStudents = students
    .filter(
      (s) => s.status === "at-risk" || s.completion < 50
    )
    .slice(0, 5);

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
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Không có học viên có nguy cơ bỏ học
          </p>
        ) : (
          atRiskStudents.map((student) => (
            <div key={student.id} className="at-risk-item">
              <div className="at-risk-icon">
                <AlertTriangle size={18} />
              </div>

              <div className="at-risk-info">
                <strong>{student.name}</strong>
                <span>{student.email}</span>
                <small>Hoàn thành: {student.completion}%</small>
              </div>

              <button className="at-risk-btn">
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
