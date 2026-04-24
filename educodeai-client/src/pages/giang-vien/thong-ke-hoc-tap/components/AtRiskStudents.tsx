import { useState } from "react";
import type { HocVien } from "./Types";
import { AlertTriangle, Mail } from "lucide-react";
import thongKeHocTapService from "@/services/thong-ke-hoc-tap.service";
import "./css/at-risk-students.css";

interface Props {
  students: HocVien[];
}

const AtRiskStudents = ({ students }: Props) => {
  const [sendingStudentId, setSendingStudentId] = useState<number | null>(null);
  const getProgress = (hv: HocVien) => Number(hv.tyLeHoanThanh ?? hv.tienDo ?? 0);
  const getName = (hv: HocVien) => hv.tenHocVien?.trim() || hv.hoTen?.trim() || "—";

  const atRiskStudents = students
    .filter((hv) => hv.trangThai === "Nguy cơ bỏ học" || getProgress(hv) < 50)
    .sort((a, b) => getProgress(a) - getProgress(b))
    .slice(0, 5);

  const handleContact = async (hocVien: HocVien) => {
    const maHocVien = Number(hocVien.maNguoiDung ?? hocVien.maHocVien ?? 0);
    if (!maHocVien) return;

    try {
      setSendingStudentId(maHocVien);
      const res = await thongKeHocTapService.guiCanhBaoHocVienNguyCoBoHoc(maHocVien);

      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        icon: "success",
        title: "Đã gửi cảnh báo",
        text: res.message || "Email cảnh báo đã được gửi cho học viên.",
        confirmButtonText: "Đóng",
      });
    } catch (error: any) {
      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        icon: "error",
        title: "Gửi email thất bại",
        text: error?.response?.data?.message || "Không thể gửi cảnh báo lúc này. Vui lòng thử lại sau.",
        confirmButtonText: "Đóng",
      });
    } finally {
      setSendingStudentId(null);
    }
  };

  return (
    <div className="at-risk-card">
      <div className="at-risk-header">
        <AlertTriangle color="#ef4444" size={20} />
        Học viên có nguy cơ bỏ học
      </div>

      <div className="at-risk-list">
        {atRiskStudents.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
            Không có học viên có nguy cơ bỏ học
          </p>
        ) : (
          atRiskStudents.map((hocVien, idx) => (
            <div key={hocVien.maHocVien ?? hocVien.maNguoiDung ?? `risk-${idx}`} className="at-risk-item">
              <div className="at-risk-icon">
                <AlertTriangle size={18} />
              </div>

              <div className="at-risk-info">
                <strong>{getName(hocVien)}</strong>
                <span>{hocVien.email?.trim() || "—"}</span>
                <small>
                  Hoàn thành: {getProgress(hocVien).toFixed(1)}% • Điểm TB: {Number(hocVien.diemTrungBinh ?? 0).toFixed(1)}
                </small>
              </div>

              <button
                type="button"
                className="at-risk-btn"
                onClick={() => handleContact(hocVien)}
                disabled={!hocVien.email?.trim() || sendingStudentId === Number(hocVien.maNguoiDung ?? hocVien.maHocVien ?? 0)}
                title="Gửi email liên hệ"
              >
                <Mail size={16} />
                {sendingStudentId === Number(hocVien.maNguoiDung ?? hocVien.maHocVien ?? 0) ? "Đang gửi..." : "Liên hệ"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AtRiskStudents;
