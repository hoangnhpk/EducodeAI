import { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";

import PasswordInput from "@/components/PasswordInput";

import { useModalA11y } from "@/hooks/useModalA11y";


type Props = {
    hienThi: boolean;
    dangSua: NguoiDung | null;
    onDong: () => void;
    onHoanThanh: (data: {
        hoTen: string;
        email: string;
        matKhau?: string;
        vaiTro: "Admin" | "Giảng viên" | "Học viên";
    }) => void;
};

const ModalNguoiDung = memo(({
    hienThi,
    dangSua,
    onDong,
    onHoanThanh
}: Props) => {

    const [hoTen, setHoTen] = useState("");
    const [email, setEmail] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [vaiTro, setVaiTro] =
        useState<"Admin" | "Giảng viên" | "Học viên">("Học viên");
    const panelRef = useRef<HTMLDivElement>(null);

    useModalA11y(hienThi, onDong, panelRef);

    useEffect(() => {
        if (hienThi) {
            if (dangSua) {
                const raw = dangSua as any;
                setHoTen(dangSua.hoTen || raw.HoTen || "");
                setEmail(dangSua.email || raw.Email || "");
                setVaiTro(dangSua.vaiTro || raw.VaiTro || "Học viên");
                setMatKhau("");
            } else {
                setHoTen("");
                setEmail("");
                setVaiTro("Học viên");
                setMatKhau("");
            }
        }
    }, [hienThi, dangSua]);

    if (!hienThi) return null;

    const handleSubmit = () => {
        if (!hoTen.trim() || !email.trim()) {
            Swal.fire({ title: "Thiếu thông tin", text: "Vui lòng nhập đầy đủ họ tên và email", icon: "warning", customClass: { container: "qlnv-swal-over-modal" } });
            return;
        }
        if (!dangSua && !matKhau.trim()) {
            Swal.fire({ title: "Thiếu thông tin", text: "Vui lòng nhập mật khẩu cho tài khoản mới", icon: "warning", customClass: { container: "qlnv-swal-over-modal" } });
            return;
        }

        onHoanThanh({
            hoTen: hoTen.trim(),
            email: email.trim(),
            matKhau: matKhau.trim() || undefined,
            vaiTro
        });
    };

    const modalContent = (
        <div className="qlnv-modal-overlay" onClick={(e) => e.target === e.currentTarget && onDong()}>
            <div className="qlnv-modal-card" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-nguoi-dung-title">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 id="modal-nguoi-dung-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                        {dangSua ? "Cập nhật người dùng" : "Thêm người dùng"}
                    </h3>
                    <button onClick={onDong} aria-label="Đóng" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)', lineHeight: 1 }}>&times;</button>
                </div>

                <div className="form-group">
                    <label>Họ tên</label>
                    <input
                        placeholder="Nguyễn Văn A"
                        value={hoTen}
                        onChange={(e) => setHoTen(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {!dangSua && (
                    <PasswordInput
                        id="admin-nguoi-dung-mat-khau"
                        label="Mật khẩu"
                        placeholder="••••••••"
                        value={matKhau}
                        onChange={(e) => setMatKhau(e.target.value)}
                        autoComplete="new-password"
                        containerClassName="form-group"
                    />
                )}

                <div className="form-group">
                    <label>Vai trò</label>
                    <select
                        value={vaiTro}
                        onChange={(e) => setVaiTro(e.target.value as any)}
                        className="filter-select"
                        style={{ width: '100%' }}
                    >
                        <option value="Admin">Admin</option>
                        <option value="Giảng viên">Giảng viên</option>
                        <option value="Học viên">Học viên</option>
                    </select>
                </div>

                <div className="modal-actions" style={{ marginTop: '30px' }}>
                    <button className="btn-cancel" onClick={onDong}>
                        Hủy
                    </button>
                    <button className="btn-save" onClick={handleSubmit}>
                        {dangSua ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
});

export default ModalNguoiDung;
