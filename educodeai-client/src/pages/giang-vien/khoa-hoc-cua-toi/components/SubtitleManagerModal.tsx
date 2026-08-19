import React, { useState, useRef } from 'react';
import type { BaiHocDetail } from '../types';
import { taiLenPhuDe, taoPhuDeAI, GIA_PHU_DE_AI_MOI_PHUT_USD } from '@/services/media.service';
import { useModalA11y } from '@/hooks/useModalA11y';

interface SubtitleManagerModalProps {
  dangMo: boolean;
  baiHoc: BaiHocDetail | null;
  dongModal: () => void;
  khiCapNhat: (baiHoc: BaiHocDetail) => void;
}



const SubtitleManagerModal: React.FC<SubtitleManagerModalProps> = ({ dangMo, baiHoc, dongModal, khiCapNhat }) => {
  const [luaChon, setLuaChon] = useState<'none' | 'manual' | 'ai'>('none');
  const [filePhuDe, setFilePhuDe] = useState<File | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [thanhCong, setThanhCong] = useState<string | null>(null);
  
  const refInputFile = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (baiHoc?.hasSubtitle) {
      setLuaChon(baiHoc.subtitleSource === 'ai' ? 'ai' : 'manual');
    } else {
      setLuaChon('none');
    }
    setFilePhuDe(null);
    setLoi(null);
    setThanhCong(null);
  }, [baiHoc, dangMo]);

  useModalA11y(dangMo && !!baiHoc, dongModal, panelRef);

  if (!dangMo || !baiHoc) return null;

  const xuLyTaiLenThuCong = async () => {
    if (!filePhuDe) {
      setLoi('Vui lòng chọn file phụ đề (.srt hoặc .vtt).');
      return;
    }
    
    setDangXuLy(true);
    setLoi(null);
    setThanhCong(null);

    try {
      const data = await taiLenPhuDe(filePhuDe, baiHoc.maBaiHoc);
      setThanhCong('Đã tải lên và lưu phụ đề thành công!');
      khiCapNhat({ ...baiHoc, hasSubtitle: true, subtitleSource: 'manual', subtitleUrl: data.url });
    } catch (err: any) {
      setLoi(err.message || 'Lỗi khi upload phụ đề.');
    } finally {
      setDangXuLy(false);
    }
  };

  const xuLyTaoPhuDeAI = async () => {
    setDangXuLy(true);
    setLoi(null);
    setThanhCong(null);

    try {
      await taoPhuDeAI(baiHoc.maBaiHoc);
      setThanhCong('Đã gửi yêu cầu AI thành công. Phụ đề sẽ có sẵn sau vài phút.');
      khiCapNhat({ ...baiHoc, videoStatus: 'Processing_Subtitle', subtitleSource: 'ai' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi yêu cầu tạo phụ đề AI.';
      setLoi(errorMsg);
    } finally {
      setDangXuLy(false);
    }
  };

  const chiPhiDuKien = baiHoc.thoiLuong > 0 ? (Math.ceil(baiHoc.thoiLuong / 60) * GIA_PHU_DE_AI_MOI_PHUT_USD).toFixed(2) : GIA_PHU_DE_AI_MOI_PHUT_USD.toFixed(3);

  return (
    <div className="khm-modal-backdrop" onClick={dongModal}>
      <div className="khm-modal khm-modal-md" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="subtitle-modal-title" onClick={e => e.stopPropagation()}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title" id="subtitle-modal-title">Quản lý Phụ đề (Subtitles)</h3>
          <button className="khm-modal-close" onClick={dongModal} disabled={dangXuLy} aria-label="Đóng">×</button>
        </div>
        <div className="khm-modal-body">
          <p className="khm-text-sm khm-text-muted khm-mb-16">
            Bài học: <strong>{baiHoc.tieuDe}</strong>
          </p>

          {loi && <div className="khm-alert khm-alert-danger khm-mb-16">{loi}</div>}
          {thanhCong && <div className="khm-alert khm-alert-success khm-mb-16">{thanhCong}</div>}

          <div className="khm-flex khm-gap-16" style={{ flexDirection: 'column' }}>
            <label className="khm-flex khm-gap-8" style={{ alignItems: 'flex-start', cursor: 'pointer', padding: 12, border: '1px solid var(--khm-gray-200)', borderRadius: 8, background: luaChon === 'none' ? 'var(--khm-gray-50)' : 'var(--khm-white)' }}>
              <input type="radio" name="subtitleOpt" checked={luaChon === 'none'} onChange={() => setLuaChon('none')} style={{ marginTop: 4, width: 'auto', flexShrink: 0 }} disabled={dangXuLy} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Không có phụ đề</strong>
                <span className="khm-text-sm khm-text-muted">Các tính năng AI (như hỏi đáp, trắc nghiệm AI) có thể bị hạn chế đối với học viên.</span>
              </div>
            </label>

            <label className="khm-flex khm-gap-8" style={{ alignItems: 'flex-start', cursor: 'pointer', padding: 12, border: '1px solid var(--khm-gray-200)', borderRadius: 8, background: luaChon === 'manual' ? 'var(--primary-soft)' : 'var(--bg-card)' }}>
              <input type="radio" name="subtitleOpt" checked={luaChon === 'manual'} onChange={() => setLuaChon('manual')} style={{ marginTop: 4, width: 'auto', flexShrink: 0 }} disabled={dangXuLy} />
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>Tự upload file (Miễn phí)</strong>
                <span className="khm-text-sm khm-text-muted">Tải lên file phụ đề định dạng .srt hoặc .vtt.</span>
                
                {luaChon === 'manual' && (
                  <div className="khm-mt-12">
                    <input 
                      type="file" 
                      accept=".srt,.vtt"
                      className="khm-form-input khm-text-sm"
                      ref={refInputFile}
                      onChange={e => setFilePhuDe(e.target.files?.[0] || null)}
                      disabled={dangXuLy}
                    />
                    <button 
                      className="khm-btn khm-btn-primary khm-btn-sm khm-mt-8"
                      onClick={xuLyTaiLenThuCong}
                      disabled={!filePhuDe || dangXuLy}
                    >
                      {dangXuLy ? <><span className="khm-spinner khm-spinner-sm" /> Đang tải lên...</> : 'Tải lên phụ đề'}
                    </button>
                  </div>
                )}
              </div>
            </label>

            <label className="khm-flex khm-gap-8" style={{ alignItems: 'flex-start', cursor: 'pointer', padding: 12, border: '1px solid var(--khm-gray-200)', borderRadius: 8, background: luaChon === 'ai' ? 'var(--ai-accent-soft)' : 'var(--bg-card)' }}>
              <input type="radio" name="subtitleOpt" checked={luaChon === 'ai'} onChange={() => setLuaChon('ai')} style={{ marginTop: 4, width: 'auto', flexShrink: 0 }} disabled={dangXuLy} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4, color: 'var(--ai-accent-hover)' }}>Dùng AI Transcription (Có phí) ✨</strong>
                <span className="khm-text-sm khm-text-muted">Tự động nhận diện giọng nói và tạo phụ đề (Hỗ trợ tiếng Việt).</span>
                
                {luaChon === 'ai' && (
                  <div className="khm-mt-12 khm-p-12" style={{ background: 'var(--ai-accent-soft)', borderRadius: 6 }}>
                    <div className="khm-text-sm khm-mb-8">
                      <strong>Chi phí ước tính:</strong> ${chiPhiDuKien} USD <br/>
                      <span className="khm-text-muted">(Dựa trên thời lượng {Math.ceil(baiHoc.thoiLuong / 60)} phút)</span>
                    </div>
                    <div className="khm-text-xs khm-text-muted khm-mb-12">
                      <input type="checkbox" id="gdpr_consent" className="khm-mr-4" required />
                      <label htmlFor="gdpr_consent">Tôi xác nhận video không chứa thông tin cá nhân nhạy cảm vi phạm GDPR.</label>
                    </div>
                    <button 
                      className="khm-btn khm-btn-sm" 
                      style={{ background: 'var(--ai-accent)', color: 'var(--text-white)', border: 'none' }}
                      onClick={() => {
                        const cb = document.getElementById('gdpr_consent') as HTMLInputElement;
                        if (!cb.checked) {
                          setLoi('Vui lòng đồng ý với điều khoản GDPR.');
                          return;
                        }
                        xuLyTaoPhuDeAI();
                      }}
                      disabled={dangXuLy}
                    >
                      {dangXuLy ? <><span className="khm-spinner khm-spinner-sm" /> Đang gửi yêu cầu...</> : 'Tạo Phụ đề bằng AI'}
                    </button>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleManagerModal;
