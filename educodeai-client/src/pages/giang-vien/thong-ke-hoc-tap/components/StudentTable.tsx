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
      "Chưa học": {
        label: "CHƯA HỌC",
        className: "status-badge status-not-started",
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
  const getProgressClass = (tienDo: number) => {
    if (tienDo >= 80) return "progress-green";
    if (tienDo >= 50) return "progress-yellow";
    return "progress-red";
  };

  /* ===== AVATAR ===== */
  const getAvatar = (hocVien: HocVien) => {
    if (hocVien.anhDaiDien) {
      return (
        <img 
          src={hocVien.anhDaiDien} 
          alt={hocVien.hoTen}
          className="student-avatar-img"
        />
      );
    }
    return (
      <div className="student-avatar">
        {hocVien.hoTen?.charAt(0).toUpperCase() || "U"}
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
            <th>% Hoàn thành</th>
            <th>Số bài đã nộp</th>
            <th>Tổng giờ học</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {students.map((hocVien) => (
            <tr key={hocVien.maNguoiDung}>
              {/* ===== NAME ===== */}
              <td>
                <div className="student-info">
                  {getAvatar(hocVien)}
                  <strong>{hocVien.hoTen}</strong>
                </div>
              </td>

              {/* ===== EMAIL ===== */}
              <td>{hocVien.email}</td>

              {/* ===== PROGRESS ===== */}
              <td>
                <div className="progress-wrapper">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressClass(
                        hocVien.tienDo
                      )}`}
                      style={{ width: `${hocVien.tienDo}%` }}
                    />
                  </div>
                  <strong>{hocVien.tienDo?.toFixed(1) || 0}%</strong>
                </div>
              </td>

              {/* ===== ASSIGNMENTS ===== */}
              <td>
                <span className="assignment-badge">
                  {hocVien.soBaiDaNop} bài
                </span>
              </td>

              {/* ===== STUDY TIME ===== */}
              <td className="avg-score">
                {hocVien.gioHoc?.toFixed(1) || 0}h
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