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
  const getStatusBadge = (trangThai: string) => {
    const map: Record<string, { label: string; className: string }> = {
      "Hoàn thành": { label: "HOÀN THÀNH", className: "status-badge status-completed" },
      "Đang học": { label: "ĐANG HỌC", className: "status-badge status-learning" },
      "Nguy cơ bỏ học": { label: "NGUY CƠ BỎ HỌC", className: "status-badge status-risk" },
      "Chưa học": { label: "CHƯA HỌC", className: "status-badge status-not-started" },
      "Chưa bắt đầu": { label: "CHƯA BẮT ĐẦU", className: "status-badge status-not-started" },
    };

    return <span className={map[trangThai]?.className || "status-badge"}>{map[trangThai]?.label || trangThai}</span>;
  };

  const getProgressClass = (tienDo: number) => {
    if (tienDo >= 80) return "progress-green";
    if (tienDo >= 50) return "progress-yellow";
    return "progress-red";
  };

  const getName = (hocVien: HocVien) => hocVien.tenHocVien?.trim() || hocVien.hoTen?.trim() || "—";
  const getProgress = (hocVien: HocVien) => Number(hocVien.tyLeHoanThanh ?? hocVien.tienDo ?? 0);
  const getAssignments = (hocVien: HocVien) => {
    if (hocVien.soBaiTapHoanThanh != null || hocVien.tongBaiTap != null) {
      return `${Number(hocVien.soBaiTapHoanThanh ?? 0)}/${Number(hocVien.tongBaiTap ?? 0)}`;
    }
    return `${Number(hocVien.soBaiDaNop ?? 0)} bài`;
  };
  const getStudyMetric = (hocVien: HocVien) => {
    if (hocVien.gioHoc != null) return `${Number(hocVien.gioHoc).toFixed(1)}h`;
    return Number(hocVien.diemTrungBinh ?? 0).toFixed(1);
  };

  const getAvatar = (hocVien: HocVien) => {
    const ten = getName(hocVien);
    if (hocVien.anhDaiDien) {
      return <img src={hocVien.anhDaiDien} alt={ten || "Học viên"} className="student-avatar-img" />;
    }
    return <div className="student-avatar">{ten.charAt(0).toUpperCase() || "?"}</div>;
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
          {students.map((hocVien, rowIndex) => {
            const progress = getProgress(hocVien);
            return (
              <tr key={hocVien.maHocVien ?? hocVien.maNguoiDung ?? `student-${rowIndex}`}>
                <td>
                  <div className="student-info">
                    {getAvatar(hocVien)}
                    <strong>{getName(hocVien)}</strong>
                  </div>
                </td>

                <td>{hocVien.email?.trim() || "—"}</td>

                <td>
                  <div className="progress-wrapper">
                    <div className="progress-bar">
                      <div className={`progress-fill ${getProgressClass(progress)}`} style={{ width: `${progress}%` }} />
                    </div>
                    <strong>{progress.toFixed(1)}%</strong>
                  </div>
                </td>

                <td>
                  <span className="assignment-badge">{getAssignments(hocVien)}</span>
                </td>

                <td className="avg-score">{getStudyMetric(hocVien)}</td>

                <td>{getStatusBadge(hocVien.trangThai ?? "")}</td>

                <td>
                  <button className="detail-btn">
                    <Eye size={16} />
                    Chi tiết
                  </button>
                </td>
              </tr>
            );
          })}

          {students.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                Không tìm thấy học viên
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft size={18} />
            Trước
          </button>

          <div className="pagination-info">Trang {currentPage} / {totalPages}</div>

          <button className="pagination-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Sau
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
