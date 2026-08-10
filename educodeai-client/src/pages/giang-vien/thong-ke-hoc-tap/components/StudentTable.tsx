import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { HocVien } from "./Types";
import { formatThoiGianTuGiay } from "@/utils/format-thoi-gian-hoc";
import "./css/student-table.css";

interface Props {
  students: HocVien[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const StudentTable = ({ students, currentPage, totalPages, onPageChange }: Props) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<HocVien | null>(null);

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
    if (tienDo >= 80) return "st-progress-green";
    if (tienDo >= 50) return "st-progress-yellow";
    return "st-progress-red";
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
    if (hocVien.gioHoc != null) return formatThoiGianTuGiay(hocVien.gioHoc);
    return Number(hocVien.diemTrungBinh ?? 0).toFixed(1);
  };
  const getStudyLabel = (hocVien: HocVien) => (hocVien.gioHoc != null ? "Tổng thời gian học" : "Điểm trung bình");

  const getAvatar = (hocVien: HocVien, large = false) => {
    const ten = getName(hocVien);
    if (hocVien.anhDaiDien) {
      return (
        <img
          src={hocVien.anhDaiDien}
          alt={ten || "Học viên"}
          className={large ? "student-avatar-img student-avatar-img--lg" : "student-avatar-img"}
        />
      );
    }
    return (
      <div className={large ? "student-avatar student-avatar--lg" : "student-avatar"}>
        {ten.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  const dongChiTiet = () => setSelected(null);

  const moLopHoc = () => {
    const email = selected?.email?.trim();
    dongChiTiet();
    navigate(email ? `/giang-vien/lop-hoc?search=${encodeURIComponent(email)}` : "/giang-vien/lop-hoc");
  };

  return (
    <div className="student-table-card">
      <table className="student-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>% Hoàn thành</th>
            <th>Nộp</th>
            <th>Thời gian học</th>
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
                    <strong title={getName(hocVien)}>{getName(hocVien)}</strong>
                  </div>
                </td>

                <td title={hocVien.email?.trim() || undefined}>{hocVien.email?.trim() || "—"}</td>

                <td>
                  <div className="st-progress-wrapper">
                    <div className="st-progress-track">
                      <div
                        className={`st-progress-fill ${getProgressClass(progress)}`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
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
                  <button
                    type="button"
                    className="detail-btn"
                    aria-label={`Xem chi tiết ${getName(hocVien)}`}
                    onClick={() => setSelected(hocVien)}
                  >
                    <i className="fas fa-eye" aria-hidden="true" />
                    Chi tiết
                  </button>
                </td>
              </tr>
            );
          })}

          {students.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                Không tìm thấy học viên
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="student-pagination">
          <button
            type="button"
            className="student-pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left" aria-hidden="true" />
            Trước
          </button>

          <div className="student-pagination-info">
            Trang {currentPage} / {totalPages}
          </div>

          <button
            type="button"
            className="student-pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
            <i className="fas fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}

      {selected && (
        <div
          className="st-detail-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) dongChiTiet();
          }}
        >
          <div className="st-detail-modal" role="dialog" aria-modal="true" aria-labelledby="st-detail-title">
            <div className="st-detail-header">
              <h3 id="st-detail-title">Chi tiết học viên</h3>
              <button type="button" className="st-detail-close" onClick={dongChiTiet} aria-label="Đóng">
                ×
              </button>
            </div>

            <div className="st-detail-body">
              <div className="st-detail-profile">
                {getAvatar(selected, true)}
                <div>
                  <div className="st-detail-name">{getName(selected)}</div>
                  <div className="st-detail-email">{selected.email?.trim() || "Không có email"}</div>
                  <div className="st-detail-status">{getStatusBadge(selected.trangThai ?? "")}</div>
                </div>
              </div>

              <div className="st-detail-grid">
                <div className="st-detail-item">
                  <span className="st-detail-label">% Hoàn thành</span>
                  <strong>{getProgress(selected).toFixed(1)}%</strong>
                </div>
                <div className="st-detail-item">
                  <span className="st-detail-label">Bài đã nộp</span>
                  <strong>{getAssignments(selected)}</strong>
                </div>
                <div className="st-detail-item">
                  <span className="st-detail-label">{getStudyLabel(selected)}</span>
                  <strong>{getStudyMetric(selected)}</strong>
                </div>
                <div className="st-detail-item">
                  <span className="st-detail-label">Số khóa tham gia</span>
                  <strong>{Number(selected.soKhoaHocThamGia ?? 0)}</strong>
                </div>
              </div>
            </div>

            <div className="st-detail-footer">
              <button type="button" className="st-detail-btn st-detail-btn--ghost" onClick={dongChiTiet}>
                Đóng
              </button>
              {selected.email?.trim() && (
                <a className="st-detail-btn st-detail-btn--soft" href={`mailto:${selected.email.trim()}`}>
                  Gửi email
                </a>
              )}
              <button type="button" className="st-detail-btn st-detail-btn--primary" onClick={moLopHoc}>
                Xem trong lớp học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
