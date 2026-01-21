import type { KetQuaLoTrinhAI } from "./types";
import "./YeuCauLoTrinhAI.css";

export default function TimelineLoTrinh({
  ketQua,
}: {
  ketQua: KetQuaLoTrinhAI;
}) {
  return (
    <div className="roadmap-container">
      {ketQua.loTrinh.map((giaiDoan) => (
        <div key={giaiDoan.GiaiDoan} className="phase-block mb-4">
          <div className="phase-header mb-3 p-3 rounded bg-light border-start border-4 border-warning shadow-sm">
            <h5 className="mb-1 ai-color fw-bold">
              Giai đoạn {giaiDoan.GiaiDoan}
            </h5>
            <p className="mb-0 text-muted fst-italic">
              <i className="fas fa-bullseye me-2"></i>
              Mục tiêu: {giaiDoan.mucTieu}
            </p>
          </div>

          <div className="timeline ms-2">
            {giaiDoan.khoaHocSuDung.map((khoaHoc) => (
              <div className="timeline-item" key={khoaHoc.maKhoaHoc}>
                <div className="timeline-time">
                  Tuần {khoaHoc.TuTuan} – {khoaHoc.DenTuan}
                </div>

                <div className="timeline-content">
                  <h6 className="mb-1 text-primary">Khoá học: {khoaHoc.tenKhoaHoc}</h6>
                  
                  
                  <p className="mb-0 small text-dark mt-2">
                    {khoaHoc.noiDungChinh}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}