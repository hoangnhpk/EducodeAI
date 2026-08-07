import { useState, useEffect } from "react";
import type { TrangThaiAI, DuLieuYeuCauLoTrinh, KetQuaLoTrinhAI } from "./Components/types";
import FormYeuCauLoTrinh from "./Components/FormYeuCauLoTrinh";
import AiPanel from "./Components/AiPanel";
import "./Components/YeuCauLoTrinhAI.css"
import { aiRoadmapService } from "../../../services/aiRoadmap.service";
import TrangThaiKetQua from "./Components/TrangThaiKetQua"
import Swal from "sweetalert2";
import { getUserId } from "../../../utils/authHelper";

import axiosInstance from "../../../configs/axios";

export default function YeuCauLoTrinhAI() {
  const [trangThaiAI, setTrangThaiAI] = useState<TrangThaiAI>("cho");
  const [ketQuaAI, setKetQuaAI] = useState<KetQuaLoTrinhAI | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIAvailable, setIsAIAvailable] = useState<boolean>(true);

  useEffect(() => {
    const checkAIStatus = async () => {
        try {
            const res = await axiosInstance.get<any>('/api/SinhDoAnAI/check-ai-status');
            setIsAIAvailable((res as any).isAvailable !== false);
        } catch (err) {
            console.error('Failed to check AI status:', err);
        }
    };
    checkAIStatus();
  }, []);

  const xuLyGuiForm = async (duLieu: DuLieuYeuCauLoTrinh) => {
    const userId = getUserId();
    if (!userId) {
      Swal.fire({
        icon: "warning",
        text: "Bạn cần đăng nhập để tạo lộ trình AI"
      });
      window.location.href = "/dang-nhap";
      return;
    }

    try {
      setTrangThaiAI("dang_phan_tich");
      const ketQua = await aiRoadmapService.taoLoTrinh(duLieu);
      setKetQuaAI(ketQua);
      setTrangThaiAI("da_co_ket_qua");
    } catch (error) {
      console.error(error);
      setTrangThaiAI("cho");
      Swal.fire({ icon: 'error', text: "Lỗi khi tạo lộ trình" });
    }
  };

  const handleModify = async (yeuCauSua: string) => {
    if (!ketQuaAI?.maLoTrinh) return;
    try {
      setIsProcessing(true);
      const ketQuaMoi = await aiRoadmapService.capNhatLoTrinh(ketQuaAI.maLoTrinh, yeuCauSua);
      setKetQuaAI(ketQuaMoi);
      Swal.fire({ icon: 'success', text: "AI đã chỉnh sửa lộ trình theo ý bạn!", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', text: "Lỗi khi sửa lộ trình. Vui lòng thử lại." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!ketQuaAI?.maLoTrinh) return;
    try {
      setIsProcessing(true);
      await aiRoadmapService.xacNhanLoTrinh(ketQuaAI.maLoTrinh);

      Swal.fire({ icon: 'success', text: "Chúc mừng! Lộ trình học tập đã được áp dụng.", timer: 1500, showConfirmButton: false });
      window.location.href = "/khoa-hoc-ai-cua-toi";
    } catch (error) {
      Swal.fire({ icon: 'error', text: "Có lỗi xảy ra khi lưu lộ trình." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-xxl py-5 roadmap-page">
      <div className="container">
        <div className="text-center mb-5">
          <h6 className="section-title bg-white px-3">AI Roadmap</h6>
          <h1 className="ai-color">Yêu cầu lộ trình học tập cá nhân hóa với AI</h1>
          <p>AI sẽ phân tích thông tin của bạn để tạo lộ trình phù hợp nhất</p>
        </div>

        {!isAIAvailable && (
          <div className="roadmap-ai-alert" role="alert">
            <i className="fas fa-circle-exclamation" aria-hidden="true" />
            Hệ thống AI hiện đang hết lượt sử dụng hoặc đang bận. Vui lòng quay lại sau ít phút!
          </div>
        )}

        <div className="roadmap-layout">
          <div className="roadmap-form-column">
            <FormYeuCauLoTrinh onSubmit={xuLyGuiForm} isSubmitting={trangThaiAI === "dang_phan_tich"} isAIAvailable={isAIAvailable} />
          </div>
          <div className="roadmap-sidebar-column">
            {trangThaiAI === "da_co_ket_qua" ? (
              <TrangThaiKetQua ketQua={ketQuaAI} onModify={handleModify} onConfirm={handleConfirm} isProcessing={isProcessing} />
            ) : <AiPanel trangThaiAI={trangThaiAI} ketQua={null} />}
          </div>
        </div>
      </div>
    </div>
  );
}
