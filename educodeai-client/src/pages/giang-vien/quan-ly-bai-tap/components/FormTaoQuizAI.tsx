import { useState } from 'react';
import type { GenerateQuizAIDTO } from '../types';

interface Props {
  baiHocId: number | null;
  tenBaiHoc: string;
  language: string;
  isGenerating: boolean;
  onGenerate: (dto: GenerateQuizAIDTO) => void;
}

export default function FormTaoQuizAI({ baiHocId, tenBaiHoc, language, isGenerating, onGenerate }: Props) {
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
      NgonNgu: language,
    });
  };

  return (
    <div className="btth-section-block mb-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <div className="p-2 rounded-3 me-3" style={{ background: 'var(--ai-accent-soft)' }}>
          <i className="bi bi-patch-question fs-5" style={{ color: 'var(--ai-accent)' }} aria-hidden="true" />
        </div>
        <div>
          <h5 className="m-0 fw-bold" style={{ color: 'var(--text-main)' }}>Bước 2: Cấu hình Quiz và Sinh câu hỏi bằng AI</h5>
          <p className="m-0 text-muted" style={{ fontSize: '12px' }}>AI sẽ đọc nội dung bài học và tạo câu hỏi trắc nghiệm phù hợp</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Bài học readonly */}
          <div className="col-12 mb-4">
            <label className="btth-label">Bài học đang chọn</label>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '40px', width: '100%', overflow: 'hidden', border: '1px solid var(--border-color, #dee2e6)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '48px', flex: '0 0 48px', background: '#f8f9fa', borderRight: '1px solid var(--border-color, #dee2e6)' }}><i className="bi bi-journal-text" aria-hidden="true" /></span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 12px', fontWeight: 600, color: baiHocId ? 'var(--text-main)' : 'var(--text-light)' }}>{tenBaiHoc || 'Vui lòng chọn bài học ở bước 1...'}</span>
            </div>
          </div>

          <div className="btth-language-title-grid">
            {/* Ngôn ngữ lấy theo khóa học */}
            <div className="mb-3">
              <label className="btth-label">Ngôn ngữ lập trình</label>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '40px', width: '100%', overflow: 'hidden', border: '1px solid var(--border-color, #dee2e6)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '48px', flex: '0 0 48px', background: '#f8f9fa', borderRight: '1px solid var(--border-color, #dee2e6)' }}><i className="bi bi-code-slash" aria-hidden="true" /></span>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 12px' }}>{language || 'Lấy theo khóa học'}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="btth-label">Tiêu đề Quiz</label>
              <input
                type="text"
                className="form-control"
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                placeholder={`Quiz - ${tenBaiHoc || 'tên bài học'}`}
              />
            </div>
          </div>

          {/* Số câu + Độ khó */}
          <div className="col-md-6 mb-3">
            <label className="btth-label">Số câu hỏi</label>
            <div className="btth-input-addon" role="group" aria-label="Số câu hỏi">
              <input
                type="number"
                className="form-control"
                value={soCau}
                onChange={(e) => setSoCau(Math.min(20, Math.max(3, Number(e.target.value))))}
                min={3}
                max={20}
              />
              <span className="btth-input-addon__suffix">câu</span>
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
            className="btn w-100 py-3 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', background: 'var(--ai-accent)', color: 'var(--text-white)', boxShadow: 'var(--shadow-md)' }}
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
