import type { HocVien } from "./Types";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import "./css/student-table.css";

interface Props {
  students: HocVien[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const StudentTable = ({ students, currentPage, totalPages, onPageChange }: Props) => {
  /* ===== STATUS BADGE ===== */
  const getStatusBadge = (trangThai: string) => {
    const map: Record<string, { label: string; className: string }> = {
      "Hoàn thành": {
        label: "HOÀN THÀNH",
        className: "status-badge status-completed",
      },
      "Đang học": {
        label: "ĐANG HỌC",
        className: "status-badge status-learning",
      },
      "Nguy cơ bỏ học": {
        label: "NGUY CƠ BỎ HỌC",
        className: "status-badge status-risk",
      },
      "Chưa bắt đầu": {
        label: "CHƯA BẮT ĐẦU",
        className: "status-badge status-not-started",
      },
    };

    return (
      <span className={map[trangThai]?.className || "status-badge"}>
        {map[trangThai]?.label || trangThai}
      </span>
    );
  };

  /* ===== PROGRESS COLOR ===== */
  const getProgressClass = (tyLeHoanThanh: number) => {
    if (tyLeHoanThanh >= 80) return "progress-green";
    if (tyLeHoanThanh >= 50) return "progress-yellow";
    return "progress-red";
  };

  /* ===== AVATAR ===== */
  const getAvatar = (hocVien: HocVien) => {
    if (hocVien.anhDaiDien) {
      return (
        <img 
          src={hocVien.anhDaiDien} 
          alt={hocVien.tenHocVien}
          className="student-avatar-img"
        />
      );
    }
    return (
      <div className="student-avatar">
        {hocVien.tenHocVien.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="student-table-card">
      <table className="student-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Khóa học</th>
            <th>% Hoàn thành</th>
            <th>Số bài đã nộp</th>
            <th>Điểm TB</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {students.map((hocVien) => (
            <tr key={hocVien.maHocVien}>
              {/* ===== NAME ===== */}
              <td>
                <div className="student-info">
                  {getAvatar(hocVien)}
                  <strong>{hocVien.tenHocVien}</strong>
                </div>
              </td>

              {/* ===== EMAIL ===== */}
              <td>{hocVien.email}</td>

              {/* ===== COURSES ===== */}
              <td>
                <span className="course-badge">
                  {hocVien.soKhoaHocThamGia} khóa
                </span>
              </td>

              {/* ===== PROGRESS ===== */}
              <td>
                <div className="progress-wrapper">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressClass(
                        hocVien.tyLeHoanThanh
                      )}`}
                      style={{ width: `${hocVien.tyLeHoanThanh}%` }}
                    />
                  </div>
                  <strong>{hocVien.tyLeHoanThanh.toFixed(1)}%</strong>
                </div>
              </td>

              {/* ===== ASSIGNMENTS ===== */}
              <td>
                <span className="assignment-badge">
                  {hocVien.soBaiTapHoanThanh}/{hocVien.tongBaiTap}
                </span>
              </td>

              {/* ===== AVG SCORE ===== */}
              <td className="avg-score">
                {hocVien.diemTrungBinh.toFixed(1)}
              </td>

              {/* ===== STATUS ===== */}
              <td>{getStatusBadge(hocVien.trangThai)}</td>

              {/* ===== ACTION ===== */}
              <td>
                <button className="detail-btn">
                  <Eye size={16} />
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}

          {students.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                Không tìm thấy học viên
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            Trước
          </button>

          <div className="pagination-info">
            Trang {currentPage} / {totalPages}
          </div>

          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentTable;