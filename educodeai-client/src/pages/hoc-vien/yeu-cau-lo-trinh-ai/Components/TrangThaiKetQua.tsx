import { useState } from "react";
import type { KetQuaLoTrinhAI } from "./types";
import TimelineLoTrinh from "./TimelineLoTrinh";

interface Props {
  ketQua: KetQuaLoTrinhAI | null;
  onModify: (yeuCau: string) => void; // Hàm callback khi sửa
  onConfirm: () => void;              // Hàm callback khi áp dụng
  isProcessing: boolean;              // Trạng thái đang call API
}

export default function TrangThaiKetQua({ ketQua, onModify, onConfirm, isProcessing }: Props) {
  const [yeuCauSua, setYeuCauSua] = useState("");
  const [isEditting, setIsEditting] = useState(false); // Toggle hiện khung nhập

  if (!ketQua) return null;

  return (
    <div className="ai-panel bg-light shadow-sm rounded p-4 p-md-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="ai-color m-0">
          {ketQua.tenLoTrinh}
        </h6>
        <span className="badge bg-warning text-dark">Bản Nháp (Draft)</span>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="ai-color m-0">
          Tổng thời gian: {ketQua.tongThoiGianTuan} tuần
        </h4>
      </div>

      <TimelineLoTrinh ketQua={ketQua} />

      <hr className="my-4" style={{ borderColor: "#fb873f" }} />

      {/* KHU VỰC ACTION BUTTONS */}
      <div className="action-area">
        {!isEditting ? (
          <div className="d-flex gap-3">
            <button 
                className="btn btn-outline-secondary flex-grow-1 py-2"
                onClick={() => setIsEditting(true)}
                disabled={isProcessing}
            >
              <i className="fas fa-edit me-2"></i>Chỉnh sửa lộ trình
            </button>
            <button 
                className="btn btn-outline-primary flex-grow-1 py-2 fw-bold"
                onClick={onConfirm}
                disabled={isProcessing}
            >
              {isProcessing ? "Đang xử lý..." : <span><i className="fas fa-check-circle me-2"></i>Áp dụng lộ trình này</span>}
            </button>
          </div>
        ) : (
          <div className="edit-box bg-white p-3 rounded border border-warning">
            <label className="form-label fw-bold text-dark">Bạn muốn sửa đổi gì?</label>
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Ví dụ: Giảm bớt phần SQL, tập trung thêm vào ReactJS..."
              value={yeuCauSua}
              onChange={(e) => setYeuCauSua(e.target.value)}
              disabled={isProcessing}
            />
            <div className="d-flex gap-2 justify-content-end">
              <button 
                className="btn btn-light"
                onClick={() => setIsEditting(false)}
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button 
                className="btn btn-warning text-white fw-bold"
                onClick={() => {
                    if(yeuCauSua.trim()) onModify(yeuCauSua);
                }}
                disabled={isProcessing || !yeuCauSua.trim()}
              >
                 {isProcessing ? "AI đang sửa..." : "Gửi yêu cầu sửa"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}