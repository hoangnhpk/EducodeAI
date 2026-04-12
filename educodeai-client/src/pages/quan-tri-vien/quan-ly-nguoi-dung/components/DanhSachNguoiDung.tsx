import { useState } from "react";
import Swal from 'sweetalert2';
import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";

type Props = {
    duLieu: NguoiDung[];
    dangTai: boolean;
    onSua: (u: NguoiDung) => void;
    onXoa: (u: NguoiDung) => void;
    onDoiTrangThai: (u: NguoiDung, lyDo?: string) => void;
};

const DanhSachNguoiDung = ({ duLieu, dangTai, onSua, onXoa, onDoiTrangThai }: Props) => {

    const [nguoiDangKhoa, setNguoiDangKhoa] = useState<NguoiDung | null>(null);
    const [lyDo, setLyDo] = useState("");

    const handleXacNhanKhoa = () => {
        if (!lyDo.trim()) {
            Swal.fire({ title: 'Thiếu thông tin', text: 'Vui lòng nhập lý do khóa.', icon: 'warning' });
            return;
        }
        onDoiTrangThai(nguoiDangKhoa!, lyDo.trim());
        setNguoiDangKhoa(null);
        setLyDo("");
        Swal.fire({ title: 'Đã khóa tài khoản!', icon: 'success', timer: 1200, showConfirmButton: false });
    };

    if (dangTai) return <p>Đang tải...</p>;

    return (
        <>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {duLieu.map(u => (
                        <tr key={u.maNguoiDung}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {u.anhDaiDien
                                        ? <img src={u.anhDaiDien} alt={u.hoTen}
                                            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                                        : <div style={{
                                            width: 34, height: 34, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
                                            color: 'white', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0
                                        }}>
                                            {/* {(u.hoTen ?? 'U')[0].toUpperCase()} */}
                                        </div>
                                    }
                                    <span style={{ fontWeight: 500 }}>{u.hoTen}</span>
                                </div>
                            </td>
                            <td>{u.email}</td>
                            <td><span className="badge-role">{u.vaiTro}</span></td>
                            <td style={{ color: '#64748b', fontSize: 13 }}>
                                {u.ngayTao ? new Date(u.ngayTao).toLocaleDateString('vi-VN') : '—'}
                            </td>
                            <td>
                                <span className={`status-dot ${u.trangThai ? "active" : "locked"}`}>
                                    {u.trangThai ? "Hoạt động" : "Đã khóa"}
                                </span>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                                <div className="action-group">
                                    <button className="btn-action btn-edit" onClick={() => onSua(u)}>Sửa</button>
                                    <button
                                        className={`btn-action ${u.trangThai ? "btn-lock" : "btn-unlock"}`}
                                        onClick={() => {
                                            if (u.trangThai) { setNguoiDangKhoa(u); setLyDo(""); }
                                            else { onDoiTrangThai(u); }
                                        }}
                                    >
                                        {u.trangThai ? "Khóa" : "Mở"}
                                    </button>
                                    <button className="btn-action btn-delete" onClick={() => onXoa(u)}>Xóa</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {nguoiDangKhoa && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 420 }}>
                        <h2 className="modal-title">Khóa người dùng</h2>
                        <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
                            Bạn đang khóa tài khoản <strong>{nguoiDangKhoa.hoTen}</strong>. Vui lòng nhập lý do.
                        </p>
                        <div className="form-group">
                            <label>Lý do khóa</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập lý do khóa tài khoản..."
                                value={lyDo}
                                onChange={(e) => setLyDo(e.target.value)}
                                style={{
                                    padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd",
                                    fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit"
                                }}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setNguoiDangKhoa(null)}>Hủy</button>
                            <button className="btn-action btn-lock" style={{ padding: "9px 20px" }} onClick={handleXacNhanKhoa}>
                                Xác nhận khóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DanhSachNguoiDung;