import { useState } from 'react';
import type { GenerateQuizAIDTO } from '../types';

interface Props {
  baiHocId: number | null;
  tenBaiHoc: string;
  isGenerating: boolean;
  onGenerate: (dto: GenerateQuizAIDTO) => void;
}

export default function FormTaoQuizAI({ baiHocId, tenBaiHoc, isGenerating, onGenerate }: Props) {
  const [soCau, setSoCau] = useState(5);
  const [doKho, setDoKho] = useState('Trung bình');
  const [tieuDe, setTieuDe] = useState('');
  const [tomTat, setTomTat] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baiHocId) return;
    onGenerate({
      MaBaiHoc: baiHocId,
      SoCauHoi: soCau,
      DoKho: doKho,
      TieuDe: tieuDe || `Quiz - ${tenBaiHoc}`,
      NoiDungTomTat: tomTat,
    });
  };

  return (
    <div className="btth-section-block mb-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <div className="bg-warning bg-opacity-10 p-2 rounded-3 me-3">
          <i className="bi bi-patch-question fs-5 text-warning" />
        </div>
        <div>
          <h5 className="m-0 fw-bold" style={{ color: '#1e293b' }}>Bước 2: Cấu hình Quiz và Sinh câu hỏi bằng AI</h5>
          <p className="m-0 text-muted" style={{ fontSize: '12px' }}>AI sẽ đọc nội dung bài học và tạo câu hỏi trắc nghiệm phù hợp</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Bài học readonly */}
          <div className="col-12 mb-4">
            <label className="btth-label">Bài học đang chọn</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                <i className="bi bi-journal-text" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                style={{ borderRadius: '0 10px 10px 0', background: '#f8fafc', fontWeight: 600, color: baiHocId ? '#0F172A' : '#94A3B8' }}
                value={tenBaiHoc || 'Vui lòng chọn bài học ở bước 1...'}
                readOnly
              />
            </div>
          </div>

          {/* Tiêu đề quiz */}
          <div className="col-12 mb-3">
            <label className="btth-label">Tiêu đề Quiz</label>
            <input
              type="text"
              className="form-control"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder={`Quiz - ${tenBaiHoc || 'tên bài học'}`}
            />
          </div>

          {/* Số câu + Độ khó */}
          <div className="col-md-6 mb-3">
            <label className="btth-label">Số câu hỏi</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={soCau}
                onChange={(e) => setSoCau(Math.min(20, Math.max(3, Number(e.target.value))))}
                min={3}
                max={20}
              />
              <span className="input-group-text bg-light">câu</span>
            </div>
            <small className="text-muted">Tối thiểu 3, tối đa 20 câu</small>
          </div>

          <div className="col-md-6 mb-3">
            <label className="btth-label">Độ khó</label>
            <select className="form-select form-control" value={doKho} onChange={(e) => setDoKho(e.target.value)}>
              <option value="Dễ">Dễ — Câu hỏi cơ bản, nhận biết</option>
              <option value="Trung bình">Trung bình — Câu hỏi ứng dụng</option>
              <option value="Khó">Khó — Câu hỏi phân tích, tổng hợp</option>
            </select>
          </div>

          {/* Nội dung tóm tắt bổ sung */}
          <div className="col-12 mb-3">
            <label className="btth-label">Nội dung trọng tâm cần hỏi (tuỳ chọn)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Ví dụ: Tập trung vào khái niệm biến, kiểu dữ liệu và vòng lặp for..."
              value={tomTat}
              onChange={(e) => setTomTat(e.target.value)}
              style={{ minHeight: '90px' }}
            />
          </div>
        </div>

        <div className="mt-4 pt-2">
          <button
            type="submit"
            className="btn btn-warning w-100 py-3 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: '12px', fontWeight: 700, fontSize: '15px', color: '#78350f', boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.25)' }}
            disabled={!baiHocId || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                AI đang phân tích bài học và soạn câu hỏi...
              </>
            ) : (
              <>
                <i className="bi bi-patch-question-fill fs-5" />
                Dùng AI sinh câu hỏi trắc nghiệm
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
