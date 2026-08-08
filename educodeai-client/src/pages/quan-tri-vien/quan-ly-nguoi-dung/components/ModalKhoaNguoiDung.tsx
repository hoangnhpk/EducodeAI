import { useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";
import { useModalA11y } from "@/hooks/useModalA11y";

type Props = {
    nguoiDung: NguoiDung | null;
    onDong: () => void;
    onXacNhan: (u: NguoiDung, lyDo: string, thoiHan: string) => void;
};

const ModalKhoaNguoiDung = memo(({ nguoiDung, onDong, onXacNhan }: Props) => {
    const [lyDoChon, setLyDoChon] = useState("Vi phạm điều khoản cộng đồng");
    const [lyDoChiTiet, setLyDoChiTiet] = useState("");
    const [thoiHan, setThoiHan] = useState("1d");
    const panelRef = useRef<HTMLDivElement>(null);

    useModalA11y(!!nguoiDung, onDong, panelRef);

    if (!nguoiDung) return null;

    const handleXacNhan = () => {
        const lyDoTongHop = lyDoChon + (lyDoChiTiet ? `: ${lyDoChiTiet}` : "");
        onXacNhan(nguoiDung, lyDoTongHop, thoiHan);
    };

    const hoTen = nguoiDung.hoTen || (nguoiDung as any).HoTen;

    const modalContent = (
        <div className="qlnv-modal-overlay" onClick={(e) => e.target === e.currentTarget && onDong()}>
            <div className="qlnv-modal-card" style={{ maxWidth: 450 }} ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-khoa-title">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 id="modal-khoa-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>Khóa người dùng</h3>
                    <button onClick={onDong} aria-label="Đóng" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)', lineHeight: 1 }}>&times;</button>
                </div>

                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
                    Bạn đang thực hiện khóa tài khoản của <strong>{hoTen}</strong>
                </p>

                <div className="form-group">
                    <label>Lý do phổ biến</label>
                    <select
                        className="modal-input"
                        value={lyDoChon}
                        onChange={(e) => setLyDoChon(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                    >
                        <option value="Vi phạm điều khoản cộng đồng">Vi phạm điều khoản cộng đồng</option>
                        <option value="Spam nội dung">Spam nội dung</option>
                        <option value="Hành vi không chừng mực">Hành vi không chừng mực</option>
                        <option value="Gian lận trong học tập">Gian lận trong học tập</option>
                        <option value="Khác">Lý do khác</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Thời hạn khóa</label>
                    <select
                        className="modal-input"
                        value={thoiHan}
                        onChange={(e) => setThoiHan(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                    >
                        <option value="15s">15 giây (Test)</option>
                        <option value="1d">1 ngày</option>
                        <option value="3d">3 ngày</option>
                        <option value="1w">1 tuần</option>
                        <option value="2w">2 tuần</option>
                        <option value="1m">1 tháng</option>
                        <option value="vinh-vien">Vĩnh viễn</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Chi tiết lý do (Tùy chọn)</label>
                    <textarea
                        rows={3}
                        placeholder="Nhập thêm chi tiết nếu cần..."
                        value={lyDoChiTiet}
                        onChange={(e) => setLyDoChiTiet(e.target.value)}
                        className="modal-input"
                        style={{ resize: "vertical", width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                    />
                </div>

                <div className="modal-actions" style={{ marginTop: '25px' }}>
                    <button className="btn-cancel" onClick={onDong}>Hủy</button>
                    <button className="btn-action btn-lock" onClick={handleXacNhan} style={{ background: 'var(--danger)', color: 'var(--text-white)', border: 'none', fontWeight: 600 }}>
                        Xác nhận khóa
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
});

export default ModalKhoaNguoiDung;
