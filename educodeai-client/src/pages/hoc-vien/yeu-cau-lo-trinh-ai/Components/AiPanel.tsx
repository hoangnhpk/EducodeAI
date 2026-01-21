import type { TrangThaiAI, KetQuaLoTrinhAI } from "./types";
import TrangThaiCho from "./TrangThaiCho";
import TrangThaiDangPhanTich from "./TrangThaiDangPhanTich";
import TrangThaiKetQua from "./TrangThaiKetQua";
import "./AiPanel.css";

interface Props {
  trangThaiAI: TrangThaiAI;
  ketQua: KetQuaLoTrinhAI | null;
}

export default function AiPanel({ trangThaiAI, ketQua }: Props) {
  if (trangThaiAI === "cho") return <TrangThaiCho />;
  if (trangThaiAI === "dang_phan_tich") return <TrangThaiDangPhanTich />;
  return <TrangThaiKetQua ketQua={ketQua} />;
}
