import type { KetQuaLoTrinhAI } from "./types";
import TimelineLoTrinh from "./TimelineLoTrinh";

export default function TrangThaiKetQua({
  ketQua
}: {
  ketQua: KetQuaLoTrinhAI | null;
}) {
  if (!ketQua) return null;

  return (
    <div className="ai-panel">
      <h4 className="ai-color mb-3">
        Tổng thời gian học: {ketQua.tongThoiGianTuan} tuần
      </h4>

      <TimelineLoTrinh ketQua={ketQua} />
    </div>
  );
}
