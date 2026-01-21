import axios from "axios";
import type { DuLieuYeuCauLoTrinh, KetQuaLoTrinhAI } from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/Components/types";

export const aiRoadmapService = {
  async taoLoTrinh(data: DuLieuYeuCauLoTrinh) {
    const res = await axios.post<KetQuaLoTrinhAI>(
      "/api/LoTrinhAI",
      data
    );
    return res.data;
  }
};
