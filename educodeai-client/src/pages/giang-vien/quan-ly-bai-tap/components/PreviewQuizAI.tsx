import { useState } from 'react';
import type { CauHoiQuizDTO, QuizAIData, CreateQuizDTO } from '../types';
import './PreviewQuizAI.css';

const DAP_AN_LABELS = ['A', 'B', 'C', 'D'];

interface Props {
  data: QuizAIData;
  baiHocId: number;
  isSaving: boolean;
  onSave: (dto: CreateQuizDTO) => void;
  onCancel: () => void;
}

export default function PreviewQuizAI({ data, baiHocId, isSaving, onSave, onCancel }: Props) {
  const cauHois: CauHoiQuizDTO[] = data?.['Câu hỏi'] || [];
  const [localCauHois, setLocalCauHois] = useState<CauHoiQuizDTO[]>(cauHois);

  // Cài đặt lưu quiz
  const [thoiGian, setThoiGian] = useState(15);
  const [diemCanDat, setDiemCanDat] = useState(60);
  const [choPhepLamLai, setChoPhepLamLai] = useState(true);
  const [daoCauHoi, setDaoCauHoi] = useState(false);

  const handleNoiDungChange = (idx: number, value: string) => {
    setLocalCauHois(prev => prev.map((c, i) => i === idx ? { ...c, NoiDung: value } : c));
  };

  const handleLuaChonChange = (qIdx: number, aIdx: number, value: string) => {
    setLocalCauHois(prev => prev.map((c, i) => {
      if (i !== qIdx) return c;
      const newLC = [...c.LuaChon];
      newLC[aIdx] = value;
      return { ...c, LuaChon: newLC };
    }));
  };

  const handleDapAnChange = (idx: number, value: string) => {
    setLocalCauHois(prev => prev.map((c, i) => i === idx ? { ...c, DapAnDung: value } : c));
  };

  const handleXoaCau = (idx: number) => {
    setLocalCauHois(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const dto: CreateQuizDTO = {
      MaBaiHoc: baiHocId,
      ThoiGianLamBai: thoiGian,
      DiemCanDat: diemCanDat,
      ChoPhepLamLai: choPhepLamLai,
      DaoCauHoi: daoCauHoi,
      DuLieuCauHoi: JSON.stringify(localCauHois),
    };
    onSave(dto);
  };

  const getDifficultyBadge = (d: string) => {
    const cls = d === 'Dễ' ? 'btth-badge-easy' : d === 'Khó' ? 'btth-badge-hard' : 'btth-badge-medium';
    return <span className={`badge ${cls}`}>{d}</span>;
  };

  return (
    <div style={{ background: 'var(--bg-main)' }}>
      <div className="p-4 pb-5">
        <div className="d-flex flex-column gap-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Header info */}
          <div className="bg-white p-4 rounded-4 shadow-sm border quiz-preview-header">
            <div className="quiz-preview-title">
              <label className="text-uppercase fw-bold mb-1" style={{ fontSize: '11px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Tên Quiz</label>
              <p className="fw-bold m-0" style={{ fontSize: '20px', color: 'var(--text-main)' }}>{data?.['Tiêu đề'] || 'Quiz AI'}</p>
            </div>
            <div className="quiz-preview-meta">
              <div className="quiz-preview-stat">
                <label className="text-uppercase fw-bold mb-1 d-block" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Độ khó</label>
                {getDifficultyBadge(data?.['Độ khó'] || 'Trung bình')}
              </div>
              <div className="quiz-preview-stat">
                <label className="text-uppercase fw-bold mb-1 d-block" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số câu</label>
                <span className="fw-bold" style={{ fontSize: '20px', color: 'var(--ai-accent)' }}>{localCauHois.length}</span>
              </div>
            </div>
          </div>

          {/* Cài đặt quiz */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 rounded-3 me-3" style={{ background: 'var(--ai-accent-soft)' }}>
                <i className="bi bi-sliders fs-5" style={{ color: 'var(--ai-accent)' }} />
              </div>
              <h5 className="m-0 fw-bold" style={{ color: 'var(--text-dark)' }}>Cài đặt Quiz</h5>
            </div>
            <div className="quiz-settings-grid">
              <div>
                <label className="btth-label">Thời gian (phút)</label>
                <input type="number" className="form-control" value={thoiGian}
                  onChange={e => setThoiGian(Number(e.target.value))} min={5} max={180} />
              </div>
              <div>
                <label className="btth-label">Điểm cần đạt (%)</label>
                <input type="number" className="form-control" value={diemCanDat}
                  onChange={e => setDiemCanDat(Number(e.target.value))} min={0} max={100} />
              </div>
              <div className="quiz-setting-toggle">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={choPhepLamLai}
                    onChange={e => setChoPhepLamLai(e.target.checked)} id="sw-lamLai" />
                  <label className="form-check-label fw-semibold" htmlFor="sw-lamLai">Cho phép làm lại</label>
                </div>
              </div>
              <div className="quiz-setting-toggle">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={daoCauHoi}
                    onChange={e => setDaoCauHoi(e.target.checked)} id="sw-dao" />
                  <label className="form-check-label fw-semibold" htmlFor="sw-dao">Đảo câu hỏi</label>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <div className="p-2 rounded-3 me-3" style={{ background: 'var(--success-soft)' }}>
                  <i className="bi bi-list-check fs-5 text-success" />
                </div>
                <h5 className="m-0 fw-bold" style={{ color: 'var(--text-dark)' }}>Câu hỏi ({localCauHois.length})</h5>
              </div>
              <span className="text-muted" style={{ fontSize: '12px' }}>Chỉnh sửa trực tiếp nếu cần</span>
            </div>

            <div className="d-flex flex-column gap-3">
              {localCauHois.map((cau, qIdx) => (
                <div key={qIdx} className="p-4 rounded-3 border" style={{ background: 'var(--bg-main)' }}>
                  {/* Header câu hỏi */}
                  <div className="quiz-question-header">
                    <span className="fw-bold px-3 py-2 rounded-3 flex-shrink-0"
                      style={{ background: 'var(--ai-accent)', color: 'white', fontSize: '14px', minWidth: '42px', textAlign: 'center' }}>
                      {qIdx + 1}
                    </span>
                    <textarea
                      className="form-control flex-grow-1 border-0"
                      style={{ minHeight: '70px', fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)', background: 'white', resize: 'none' }}
                      value={cau.NoiDung}
                      onChange={e => handleNoiDungChange(qIdx, e.target.value)}
                    />
                    <button className="btn btn-sm quiz-question-delete flex-shrink-0" onClick={() => handleXoaCau(qIdx)}
                      title="Xóa câu này">
                      <i className="bi bi-trash" />
                    </button>
                  </div>

                  {/* Đáp án */}
                  <div className="row g-2 ms-5">
                    {(cau.LuaChon || []).map((luaChon, aIdx) => {
                      const label = DAP_AN_LABELS[aIdx] || String(aIdx + 1);
                      const isCorrect = cau.DapAnDung === label;
                      return (
                        <div key={aIdx} className="col-md-6">
                          <div className={`quiz-answer-option ${isCorrect ? 'border-success bg-success bg-opacity-10' : 'bg-white'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDapAnChange(qIdx, label)}>
                            <span className={`quiz-answer-label ${isCorrect ? 'bg-success text-white' : 'bg-light text-secondary'}`}
                              style={{ fontSize: '13px', minWidth: '28px', textAlign: 'center' }}>
                              {label}
                            </span>
                            <input
                              type="text"
                              className="form-control border-0 p-0"
                              style={{ background: 'transparent', fontSize: '14px', fontWeight: isCorrect ? 700 : 400, color: isCorrect ? 'var(--success-strong)' : 'var(--text-main)' }}
                              value={luaChon}
                              onChange={e => handleLuaChonChange(qIdx, aIdx, e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                            {isCorrect && <i className="bi bi-check-circle-fill text-success flex-shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="quiz-answer-help ms-5">
                    <small className="text-muted">Click vào đáp án để chọn đáp án đúng</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="quiz-preview-actions">
            <button className="btn btn-light px-5 py-3 fw-bold" onClick={onCancel}
              disabled={isSaving} style={{ borderRadius: '12px' }}>
              Huỷ bỏ
            </button>
            <button className="btn btn-primary px-5 py-3 fw-bold shadow-sm" onClick={handleSave}
              disabled={isSaving || localCauHois.length === 0}
              style={{ borderRadius: '12px' }}>
              {isSaving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Đang lưu Quiz...</>
              ) : (
                <><i className="bi bi-cloud-check-fill me-2" />Lưu Quiz vào hệ thống</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
