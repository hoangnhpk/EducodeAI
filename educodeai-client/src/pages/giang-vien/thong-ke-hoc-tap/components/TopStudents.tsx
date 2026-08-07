import type { HocVien } from "./Types";
import "./css/top-students.css";

interface Props {
  students: HocVien[];
}

const TopStudents = ({ students }: Props) => {
  const getProgress = (hv: HocVien) => Number(hv.tyLeHoanThanh ?? hv.tienDo ?? 0);
  const getName = (hv: HocVien) => hv.tenHocVien?.trim() || hv.hoTen?.trim() || "—";

  const topStudents = [...students]
    .sort((a, b) => getProgress(b) - getProgress(a))
    .slice(0, 5);

  return (
    <div className="top-students-card">
      <div className="top-students-header">
        <i className="fas fa-trophy" aria-hidden="true" style={{ color: "var(--warning)" }} />
        Top học viên xuất sắc
      </div>

      <div className="top-students-list">
        {topStudents.map((hocVien, index) => (
          <div key={hocVien.maHocVien ?? hocVien.maNguoiDung ?? `top-${index}`} className="top-student-item">
            <div className="top-rank">{index + 1}</div>

            <div className="top-info">
              <strong>{getName(hocVien)}</strong>
              <span>{hocVien.email?.trim() || "—"}</span>
              <small style={{ color: "var(--success)", fontSize: "12px" }}>
                Hoàn thành: {getProgress(hocVien).toFixed(1)}%
              </small>
            </div>

            <div className="top-score">
              {Number(hocVien.diemTrungBinh ?? 0).toFixed(1)}/10
            </div>
          </div>
        ))}

        {topStudents.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
            Chưa có dữ liệu
          </p>
        )}
      </div>
    </div>
  );
};

export default TopStudents;
