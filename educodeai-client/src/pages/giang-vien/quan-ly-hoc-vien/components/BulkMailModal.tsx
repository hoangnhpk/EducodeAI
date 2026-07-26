import { useEffect, useMemo, useRef, useState } from 'react';

type MauKey = 'nhac_nhe' | 'khen' | 'trong';

interface NguoiNhan {
  maNguoiDung: number;
  hoTen: string;
  email: string;
  tag?: string | null;
}

interface MauConfig {
  label: string;
  tieuDe: string;
  heading: string;
  headingColor: string;
  noiDung: string;
}

const MAU_NHAC_NHE: MauConfig = {
  label: 'Lời nhắc nhẹ nhàng',
  tieuDe: 'Bạn ơi, lớp đang chờ bạn quay lại!',
  heading: 'Nhắc nhở tiến độ học tập',
  headingColor: '#dc2626',
  noiDung:
    'Trong những ngày gần đây, giảng viên nhận thấy bạn chưa quay lại tiếp tục học trên lớp. EduCodeAI ghi nhận tiến độ hiện tại của bạn và mong bạn sắp xếp một chút thời gian để hoàn thành các bài học còn dang dở.\n\nMỗi bước nhỏ hôm nay sẽ giúp bạn tiến gần hơn tới mục tiêu cuối khóa — lớp học vẫn luôn sẵn sàng đón bạn quay lại!',
};

const MAU_KHEN: MauConfig = {
  label: 'Khen xuất sắc',
  tieuDe: 'Tuyệt vời! Bạn đang học rất tốt',
  heading: 'Chúc mừng tiến độ xuất sắc!',
  headingColor: '#16a34a',
  noiDung:
    'Giảng viên rất ấn tượng với tinh thần học tập nghiêm túc và nhịp độ ổn định mà bạn đang duy trì trên lớp. EduCodeAI chúc mừng bạn đã đạt được mức tiến độ đáng kể và hy vọng bạn sẽ tiếp tục phát huy phong độ này trong các chương học sắp tới.\n\nHãy giữ vững đà học tập — bạn đang đi đúng hướng!',
};

const MAU_TRONG: MauConfig = {
  label: 'Tùy chỉnh',
  tieuDe: '',
  heading: 'Thông báo từ giảng viên',
  headingColor: '#2563eb',
  noiDung: '',
};

const MAU_MAP: Record<MauKey, MauConfig> = {
  nhac_nhe: MAU_NHAC_NHE,
  khen: MAU_KHEN,
  trong: MAU_TRONG,
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainTextToHtmlBlocks(text: string): string {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return '';

  return parts
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#555;font-size:16px;line-height:1.7;text-align:center;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`
    )
    .join('');
}

/** Template email đồng bộ với giao diện EduCodeAI */
function buildEmailHtml(mau: MauKey, heading: string, headingColor: string, userBody: string): string {
  const userHtml = plainTextToHtmlBlocks(userBody);
  const year = new Date().getFullYear();
  const isKhen = mau === 'khen';
  const isNhac = mau === 'nhac_nhe';
  const accent = isKhen ? '#16a34a' : isNhac ? '#dc2626' : '#2563eb';
  const boxBg = isKhen ? '#f0fdf4' : isNhac ? '#fef2f2' : '#fff8f3';
  const boxBorder = isKhen ? '#bbf7d0' : isNhac ? '#fecaca' : '#bfdbfe';
  const topBar = isKhen ? '#16a34a' : isNhac ? '#dc2626' : '#2563eb';

  return `<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);border:1px solid #eaeaea;">
<div style="height:4px;background:${topBar};"></div>
<div style="background-color:#fcfcfc;padding:22px 0 20px;text-align:center;border-bottom:1px solid #f0f0f0;">
<h1 style="margin:0;font-size:26px;font-weight:800;color:#333;letter-spacing:1px;">EDUCODE<span style="color:#2563eb;">AI</span></h1>
</div>
<div style="padding:36px 30px 40px;">
<div style="text-align:center;margin-bottom:6px;">
<p style="color:#9ca3af;font-size:14px;margin:0 0 8px;">Chào</p>
<p style="color:#111827;font-size:30px;font-weight:800;margin:0;line-height:1.25;">{{hoTen}}</p>
<div style="width:48px;height:3px;background:${accent};border-radius:99px;margin:16px auto 0;"></div>
</div>
<h2 style="color:${headingColor};font-size:20px;margin:20px 0 22px;text-align:center;font-weight:700;letter-spacing:0.01em;">${escapeHtml(heading)}</h2>
${userHtml}
<div style="background-color:${boxBg};border:1px solid ${boxBorder};border-left:4px solid ${accent};border-radius:10px;padding:20px 22px;text-align:center;margin:28px auto 0;max-width:440px;">
<div style="font-size:11px;color:${accent};font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;">Tiến độ khóa học</div>
<p style="color:#1f2937;font-size:15px;font-weight:700;margin:0 0 12px;line-height:1.5;">{{tenKhoaHoc}}</p>
<div style="background:#e5e7eb;border-radius:99px;height:8px;overflow:hidden;margin:0 auto 12px;max-width:280px;">
<div style="background:${accent};height:100%;width:{{tienDo}}%;border-radius:99px;"></div>
</div>
<p style="color:${accent};font-size:32px;font-weight:800;margin:0;letter-spacing:0.5px;">{{tienDo}}%</p>
</div>
<p style="color:#888;font-size:14px;text-align:center;margin-top:28px;line-height:1.65;">
Email được gửi từ giảng viên qua hệ thống EduCodeAI.<br/>
Vui lòng đăng nhập để tiếp tục học và cập nhật tiến độ của bạn.
</p>
</div>
<div style="background-color:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
<p style="color:#999;font-size:13px;margin:0 0 8px;">Nếu bạn cần hỗ trợ, vui lòng liên hệ giảng viên hoặc bộ phận chăm sóc học viên.</p>
<p style="color:#bbb;font-size:12px;margin:0;">© ${year} EduCodeAI. All rights reserved.</p>
</div>
</div>`;
}

interface BulkMailModalProps {
  open: boolean;
  tenKhoaHoc: string;
  nguoiNhan: NguoiNhan[];
  dangGui: boolean;
  onClose: () => void;
  onRemoveNguoiNhan: (maNguoiDung: number) => void;
  onSend: (tieuDe: string, noiDungHtml: string) => void;
}

export default function BulkMailModal({
  open,
  tenKhoaHoc,
  nguoiNhan,
  dangGui,
  onClose,
  onRemoveNguoiNhan,
  onSend,
}: BulkMailModalProps) {
  const [mau, setMau] = useState<MauKey>('nhac_nhe');
  const [tieuDe, setTieuDe] = useState(MAU_NHAC_NHE.tieuDe);
  const [noiDung, setNoiDung] = useState(MAU_NHAC_NHE.noiDung);
  const editorRef = useRef<HTMLDivElement>(null);

  const cfg = MAU_MAP[mau];

  useEffect(() => {
    if (!open) return;
    setMau('nhac_nhe');
    setTieuDe(MAU_NHAC_NHE.tieuDe);
    setNoiDung(MAU_NHAC_NHE.noiDung);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerText = MAU_NHAC_NHE.noiDung;
    });
  }, [open]);

  const moTaNguoiNhan = useMemo(() => {
    const n = nguoiNhan.length;
    if (n === 0) return 'Chưa chọn học viên nào';
    const giamChan = nguoiNhan.filter((h) => h.tag === 'giam_chan').length;
    if (giamChan === n) {
      return `Sẽ gửi đến ${n} học viên cần nhắc nhở`;
    }
    return `Sẽ gửi đến ${n} học viên · Khóa: ${tenKhoaHoc}`;
  }, [nguoiNhan, tenKhoaHoc]);

  const htmlGuiDi = useMemo(
    () => buildEmailHtml(mau, cfg.heading, cfg.headingColor, noiDung),
    [mau, cfg.heading, cfg.headingColor, noiDung]
  );

  const chonMau = (key: MauKey) => {
    const next = MAU_MAP[key];
    setMau(key);
    setTieuDe(next.tieuDe);
    setNoiDung(next.noiDung);
    if (editorRef.current) editorRef.current.innerText = next.noiDung;
  };

  const applyFormat = (cmd: 'bold' | 'italic' | 'underline') => {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    setNoiDung(editorRef.current?.innerText ?? '');
  };

  const handleEditorInput = () => {
    setNoiDung(editorRef.current?.innerText ?? '');
  };

  const handleSend = () => {
    if (!tieuDe.trim() || nguoiNhan.length === 0) return;
    onSend(tieuDe.trim(), htmlGuiDi);
  };

  if (!open) return null;

  return (
    <div className="qllh-modal-overlay" onClick={onClose}>
      <div className="qllh-bulk-modal qllh-bulk-modal--v2" onClick={(e) => e.stopPropagation()}>
        <div className="qllh-bulk-header">
          <div className="qllh-bulk-header__icon">
            <i className="bi bi-envelope-paper" aria-hidden="true" />
          </div>
          <div className="qllh-bulk-header__text">
            <h2>Gửi mail nhắc nhở hàng loạt</h2>
            <p>{moTaNguoiNhan}</p>
          </div>
          <button type="button" className="qllh-btn-close" onClick={onClose} aria-label="Đóng">
            <i className="bi bi-x-lg" style={{ fontSize: 22 }} aria-hidden="true" />
          </button>
        </div>

        <div className="qllh-bulk-body qllh-bulk-body--v2">
          <div className="qllh-bulk-field">
            <label className="qllh-bulk-label">
              Người nhận <span className="qllh-bulk-label__count">({nguoiNhan.length})</span>
            </label>
            <div className="qllh-recipient-chips">
              {nguoiNhan.length === 0 ? (
                <span className="qllh-recipient-empty">Chưa có học viên được chọn</span>
              ) : (
                nguoiNhan.map((hv) => (
                  <span key={hv.maNguoiDung} className="qllh-recipient-chip">
                    <span className="qllh-recipient-chip__email" title={hv.hoTen}>
                      {hv.email}
                    </span>
                    <button
                      type="button"
                      className="qllh-recipient-chip__remove"
                      onClick={() => onRemoveNguoiNhan(hv.maNguoiDung)}
                      aria-label={`Bỏ ${hv.hoTen}`}
                    >
                      <i className="bi bi-x-lg" style={{ fontSize: 14 }} aria-hidden="true" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="qllh-bulk-field">
            <label className="qllh-bulk-label" htmlFor="bulk-mail-subject">
              Tiêu đề email
            </label>
            <input
              id="bulk-mail-subject"
              className="qllh-bulk-input"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Bạn ơi, lớp đang chờ bạn quay lại!"
            />
          </div>

          <div className="qllh-bulk-field">
            <label className="qllh-bulk-label" htmlFor="bulk-mail-template">
              Mẫu nhanh
            </label>
            <select
              id="bulk-mail-template"
              className="qllh-bulk-select"
              value={mau}
              onChange={(e) => chonMau(e.target.value as MauKey)}
            >
              {(Object.keys(MAU_MAP) as MauKey[]).map((key) => (
                <option key={key} value={key}>
                  {MAU_MAP[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="qllh-bulk-field">
            <label className="qllh-bulk-label">Nội dung</label>
            <div className="qllh-rich-editor">
              <div className="qllh-rich-editor__toolbar">
                <button type="button" onClick={() => applyFormat('bold')} title="In đậm">
                  <i className="bi bi-type-bold" style={{ fontSize: 15 }} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => applyFormat('italic')} title="In nghiêng">
                  <i className="bi bi-type-italic" style={{ fontSize: 15 }} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => applyFormat('underline')} title="Gạch chân">
                  <i className="bi bi-type-underline" style={{ fontSize: 15 }} aria-hidden="true" />
                </button>
              </div>
              <div
                ref={editorRef}
                className="qllh-rich-editor__area"
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                data-placeholder="Nhập nội dung..."
              />
            </div>
            <p className="qllh-bulk-hint">
              Tên học viên, tiến độ và khóa học sẽ tự điền cho từng người nhận.
            </p>
          </div>
        </div>

        <div className="qllh-bulk-footer">
          <p className="qllh-bulk-footer__note">
            <i className="bi bi-info-circle" style={{ fontSize: 14 }} aria-hidden="true" />
            Hệ thống sẽ gửi nền (background), bạn không cần chờ.
          </p>
          <div className="qllh-bulk-footer__actions">
            <button type="button" className="qllh-bulk-btn-cancel" onClick={onClose} disabled={dangGui}>
              Hủy
            </button>
            <button
              type="button"
              className="qllh-bulk-btn-send"
              disabled={dangGui || !tieuDe.trim() || nguoiNhan.length === 0 || !noiDung.trim()}
              onClick={handleSend}
            >
              <i className="bi bi-send-fill" style={{ fontSize: 14 }} aria-hidden="true" />
              {dangGui ? 'Đang gửi...' : 'Gửi ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
