import type { TrangThaiAI, KetQuaLoTrinhAI } from "./types";
import TrangThaiCho from "./TrangThaiCho";
import TrangThaiDangPhanTich from "./TrangThaiDangPhanTich";
import "./YeuCauLoTrinhAI.css";

interface Props {
  trangThaiAI: TrangThaiAI;
  ketQua: KetQuaLoTrinhAI | null;
}

export default function AiPanel({ trangThaiAI }: Props) {
  if (trangThaiAI === "cho") return <TrangThaiCho />;
  if (trangThaiAI === "dang_phan_tich") return <TrangThaiDangPhanTich />;
  return null;
}
