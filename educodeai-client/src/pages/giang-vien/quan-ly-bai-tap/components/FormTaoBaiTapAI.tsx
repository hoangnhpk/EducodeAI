import { useState } from 'react';
import type { GenerateBaiTapThucHanhDTO } from '../types';

interface Props {
  baiHocId: number | null;
  tenBaiHoc: string;
  isGenerating: boolean;
  onGenerate: (dto: GenerateBaiTapThucHanhDTO) => void;
}

export default function FormTaoBaiTapAI({ baiHocId, tenBaiHoc, isGenerating, onGenerate }: Props) {
  const [mucDo, setMucDo] = useState('Trung bình');
  const [ngonNgu, setNgonNgu] = useState('Python');
  const [thoiGian, setThoiGian] = useState(30);
  const [yeuCau, setYeuCau] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baiHocId) return;

    onGenerate({
      lessonId: baiHocId,
      maBaiHoc: baiHocId,
      MaBaiHoc: baiHocId, // Thêm cả PascalCase cho chắc
      difficulty: mucDo,
      language: ngonNgu,
      topicTags: [], // Gửi mảng rỗng vì backend yêu cầu field này
      estimatedTime: thoiGian,
      customInstructions: yeuCau,
    });
  };

  return (
    <div className="btth-section-block mb-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <div className="p-2 rounded-3 me-3" style={{ background: 'var(--ai-accent-soft)' }}>
          <i className="bi bi-robot fs-5" style={{ color: 'var(--ai-accent)' }} aria-hidden="true" />
        </div>
        <div>
          <h5 className="m-0 fw-bold" style={{ color: 'var(--text-main)' }}>Bước 2: Cấu hình và Sinh bài tập bằng AI</h5>
          <p className="m-0 text-muted" style={{ fontSize: '12px' }}>Tùy chỉnh yêu cầu để AI soạn thảo nội dung phù hợp nhất</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Tên bài học hiển thị readonly */}
          <div className="col-12 mb-4">
            <label className="btth-label">Bài học đang chọn</label>
            <div className="selected-lesson-box">
              <i className="bi bi-journal-text" aria-hidden="true" />
              <span style={{ fontWeight: 600, color: baiHocId ? 'var(--text-main)' : 'var(--text-light)' }}>
                {tenBaiHoc || 'Vui lòng chọn bài học ở bước 1...'}
              </span>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <label className="btth-label">Mức độ khó</label>
            <select className="form-select form-control" value={mucDo} onChange={(e) => setMucDo(e.target.value)}>
              <option value="Dễ">Dễ (Cơ bản)</option>
              <option value="Trung bình">Trung bình (Phổ thông)</option>
              <option value="Khó">Khó (Nâng cao)</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="btth-label">Ngôn ngữ lập trình</label>
            <select className="form-select form-control" value={ngonNgu} onChange={(e) => setNgonNgu(e.target.value)}>
              <option value="Python">Python</option>
              <option value="C++">C++</option>
              <option value="C">C</option>
              <option value="C#">C#</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
              <option value="Ruby">Ruby</option>
              <option value="PHP">PHP</option>
              <option value="Swift">Swift</option>
              <option value="Scala">Scala</option>
              <option value="R">R</option>
              <option value="Kotlin">Kotlin</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="btth-label">Thời gian làm bài (phút)</label>
            <input
              type="number"
              className="form-control"
              value={thoiGian}
              onChange={(e) => setThoiGian(Number(e.target.value))}
              min={5}
              max={180}
            />
          </div>

          <div className="col-12 mb-3">
            <label className="btth-label">Yêu cầu bổ sung cho AI</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Ví dụ: Tập trung vào vòng lặp for, đừng dùng thư viện ngoài..."
              value={yeuCau}
              onChange={(e) => setYeuCau(e.target.value)}
              style={{ minHeight: '100px' }}
            />
          </div>
        </div>

        <div className="mt-4 pt-2">
          <button
            type="submit"
            className="btn w-100 py-3 d-flex align-items-center justify-content-center gap-2 btth-generate-btn"
            style={{ borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', background: 'var(--ai-accent)', color: 'var(--text-white)', boxShadow: 'var(--shadow-sm)' }}
            disabled={!baiHocId || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                AI đang suy nghĩ và soạn đề bài...
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles fs-5" aria-hidden="true" />
                Dùng AI sinh bài tập ngay
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
