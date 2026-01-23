import type { Student } from "./Types";
import { Eye } from "lucide-react";
import "./css/student-table.css";

interface Props {
  students: Student[];
  searchTerm: string;
}

const StudentTable = ({ students, searchTerm }: Props) => {
  /* ===== STATUS BADGE ===== */
  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; className: string }
    > = {
      completed: {
        label: "HOÀN THÀNH",
        className: "status-badge status-completed",
      },
      "in-progress": {
        label: "ĐANG HỌC",
        className: "status-badge status-learning",
      },
      "at-risk": {
        label: "NGUY CƠ BỎ HỌC",
        className: "status-badge status-risk",
      },
    };

    return (
      <span className={map[status]?.className}>
        {map[status]?.label}
      </span>
    );
  };

  /* ===== FILTER ===== */
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ===== PROGRESS COLOR ===== */
  const getProgressClass = (completion: number) => {
    if (completion >= 80) return "progress-green";
    if (completion >= 50) return "progress-yellow";
    return "progress-red";
  };

  return (
    <div className="student-table-card">
      <table className="student-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>% Hoàn thành</th>
            <th>Số bài đã nộp</th>
            <th>Điểm TB</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              {/* ===== NAME ===== */}
              <td>
                <div className="student-info">
                  <div className="student-avatar">
                    {student.name.charAt(0)}
                  </div>
                  <strong>{student.name}</strong>
                </div>
              </td>

              {/* ===== EMAIL ===== */}
              <td>{student.email}</td>

              {/* ===== PROGRESS ===== */}
              <td>
                <div className="progress-wrapper">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressClass(
                        student.completion
                      )}`}
                      style={{ width: `${student.completion}%` }}
                    />
                  </div>
                  <strong>{student.completion}%</strong>
                </div>
              </td>

              {/* ===== ASSIGNMENTS ===== */}
              <td>
                <span className="assignment-badge">
                  {student.assignments}/12
                </span>
              </td>

              {/* ===== AVG SCORE ===== */}
              <td className="avg-score">{student.avgScore}</td>

              {/* ===== STATUS ===== */}
              <td>{getStatusBadge(student.status)}</td>

              {/* ===== ACTION ===== */}
              <td>
                <button className="detail-btn">
                  <Eye size={16} />
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}

          {filteredStudents.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                Không tìm thấy học viên
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
