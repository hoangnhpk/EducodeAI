import { useState } from "react";
import type { TrangThaiAI, DuLieuYeuCauLoTrinh, KetQuaLoTrinhAI } from "./Components/types";
import FormYeuCauLoTrinh from "./Components/FormYeuCauLoTrinh";
import AiPanel from "./Components/AiPanel";
import "./Components/YeuCauLoTrinhAI.css"
import { aiRoadmapService } from "../../../services/aiRoadmap.service";

export default function YeuCauLoTrinhAI() {
  const [trangThaiAI, setTrangThaiAI] = useState<TrangThaiAI>("cho");
  const [ketQuaAI, setKetQuaAI] = useState<KetQuaLoTrinhAI | null>(null);

  const xuLyGuiForm = async (duLieu: DuLieuYeuCauLoTrinh) => {
    try {
      setTrangThaiAI("dang_phan_tich");

      const ketQua = await aiRoadmapService.taoLoTrinh(duLieu);

      setKetQuaAI(ketQua);
      setTrangThaiAI("da_co_ket_qua");
    } catch (error) {
      console.error("Lỗi tạo lộ trình AI:", error);
      alert("Không thể tạo lộ trình. Vui lòng thử lại.");
      setTrangThaiAI("cho");
    }
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h6 className="section-title bg-white px-3">AI Roadmap</h6>
          <h1 className="ai-color">
            Yêu cầu lộ trình học tập cá nhân hóa với AI
          </h1>
          <p>AI sẽ phân tích thông tin của bạn để tạo lộ trình phù hợp nhất</p>
        </div>

        <div className="row align-items-stretch">
          <div className="col-lg-6">
            <FormYeuCauLoTrinh onSubmit={xuLyGuiForm} />
          </div>

          <div className="col-lg-6">
            <AiPanel trangThaiAI={trangThaiAI} ketQua={ketQuaAI} />
          </div>
        </div>
      </div>
    </div>
  );
}
