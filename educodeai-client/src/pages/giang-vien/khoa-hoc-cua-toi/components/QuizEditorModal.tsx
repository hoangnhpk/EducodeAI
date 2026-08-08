import React, { useState, useEffect, useRef } from 'react';
import type { CauHoiChungChi } from '../types';
import { useToastStandalone } from '../components/ui/Toast';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import { useModalA11y } from '@/hooks/useModalA11y';

interface Props {
  maKhoaHoc: number;
  isOpen: boolean;
  onClose: () => void;
}

const QuizEditorModal: React.FC<Props> = ({ maKhoaHoc, isOpen, onClose }) => {
  const { showToast, ToastContainer } = useToastStandalone();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<CauHoiChungChi[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useModalA11y(isOpen, onClose, panelRef);

  useEffect(() => {
    if (isOpen) {
      void fetchQuestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, maKhoaHoc]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getDeChungChi(0, maKhoaHoc);
      setQuestions(data || []);
    } catch {
      showToast('error', 'Không thể tải đề thi chứng chỉ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Validate
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.cauHoi || !q.dapAnA || !q.dapAnB || !q.dapAnC || !q.dapAnD || !q.dapAnDung) {
          showToast('error', `Câu số ${i + 1} không được để trống nội dung và đáp án.`);
          return;
        }
      }

      await api.updateDeChungChi(0, maKhoaHoc, questions);
      showToast('success', 'Đã lưu đề thi thành công!');
      setTimeout(() => onClose(), 1500);
    } catch {
      showToast('error', 'Không thể lưu đề thi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (index: number, field: keyof CauHoiChungChi, value: string) => {
    setQuestions(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [field]: value };
      return clone;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="khm-modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="khm-modal khm-modal-lg fade-in" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="quiz-editor-modal-title" onClick={e => e.stopPropagation()} style={{ margin: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <ToastContainer />
        <div className="khm-modal-header">
          <h2 className="khm-modal-title" id="quiz-editor-modal-title">📝 Xem & Chỉnh sửa Đề thi Chứng chỉ</h2>
          <button className="khm-modal-close" onClick={onClose} disabled={saving} aria-label="Đóng">×</button>
        </div>
        <div className="khm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', background: 'var(--khm-gray-50)', padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--khm-gray-500)' }}>
              <span className="khm-spinner" /> Đang tải dữ liệu...
            </div>
          ) : questions.length === 0 ? (
            <div className="khm-alert khm-alert-warning">
              Đề thi chưa có câu hỏi nào. Vui lòng tạo bằng AI trước.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {questions.map((q, idx) => (
                <div key={idx} className="khm-card" style={{ padding: 20, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 16, right: 20, color: 'var(--khm-gray-400)', fontWeight: 600 }}>#{idx + 1}</div>
                  
                  <div className="khm-form-group" style={{ marginBottom: 16 }}>
                    <label className="khm-form-label">Nội dung câu hỏi</label>
                    <textarea 
                      className="khm-form-input" 
                      rows={2} 
                      value={q.cauHoi} 
                      onChange={(e) => updateQuestion(idx, 'cauHoi', e.target.value)} 
                    />
                  </div>

                  <div className="khm-form-grid-2">
                    <div className="khm-form-group">
                      <label className="khm-form-label">Đáp án A</label>
                      <input className="khm-form-input" value={q.dapAnA} onChange={e => updateQuestion(idx, 'dapAnA', e.target.value)} />
                    </div>
                    <div className="khm-form-group">
                      <label className="khm-form-label">Đáp án B</label>
                      <input className="khm-form-input" value={q.dapAnB} onChange={e => updateQuestion(idx, 'dapAnB', e.target.value)} />
                    </div>
                    <div className="khm-form-group">
                      <label className="khm-form-label">Đáp án C</label>
                      <input className="khm-form-input" value={q.dapAnC} onChange={e => updateQuestion(idx, 'dapAnC', e.target.value)} />
                    </div>
                    <div className="khm-form-group">
                      <label className="khm-form-label">Đáp án D</label>
                      <input className="khm-form-input" value={q.dapAnD} onChange={e => updateQuestion(idx, 'dapAnD', e.target.value)} />
                    </div>
                  </div>

                  <div className="khm-form-grid-2" style={{ marginTop: 12 }}>
                    <div className="khm-form-group">
                      <label className="khm-form-label">Đáp án đúng <span className="req">*</span></label>
                      <select 
                        className="khm-form-select" 
                        value={q.dapAnDung} 
                        onChange={e => updateQuestion(idx, 'dapAnDung', e.target.value)}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div className="khm-form-group">
                      <label className="khm-form-label">Giải thích (Tùy chọn)</label>
                      <input className="khm-form-input" value={q.giaiThich} onChange={e => updateQuestion(idx, 'giaiThich', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="khm-modal-footer">
          <button className="khm-btn khm-btn-outline" onClick={onClose} disabled={saving}>Hủy</button>
          {!loading && questions.length > 0 && (
            <button className="khm-btn khm-btn-primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? <span className="khm-spinner khm-spinner-sm" /> : '💾'} Lưu thay đổi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizEditorModal;
