import type { KetQuaLoTrinhAI } from "./types";
import "./YeuCauLoTrinhAI.css"

export default function TimelineLoTrinh({
  ketQua
}: {
  ketQua: KetQuaLoTrinhAI;
}) {
  return (
    <div className="timeline">
      {ketQua.loTrinh.map((giaiDoan) =>
        giaiDoan.khoaHocSuDung.map((khoaHoc) => (
          <div className="timeline-item" key={khoaHoc.maKhoaHoc}>
            <div className="timeline-time">
              Tuần {khoaHoc.TuTuan} – {khoaHoc.DenTuan}
            </div>

            <div className="timeline-content">
              <h6 className="mb-1">{khoaHoc.tenKhoaHoc}</h6>
              <p className="mb-1 small text-muted">
                Giai đoạn {giaiDoan.GiaiDoan}
              </p>
              <p className="mb-0">{khoaHoc.noiDungChinh}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
