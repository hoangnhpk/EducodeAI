import { useState } from "react";
import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";

type Props = {
    duLieu: NguoiDung[];
    dangTai: boolean;
    onSua: (u: NguoiDung) => void;
    onXoa: (u: NguoiDung) => void;
    onDoiTrangThai: (u: NguoiDung, lyDo?: string) => void; // ← thêm lyDo
};

const DanhSachNguoiDung = ({
    duLieu,
    dangTai,
    onSua,
    onXoa,
    onDoiTrangThai
}: Props) => {

    const [nguoiDangKhoa, setNguoiDangKhoa] = useState<NguoiDung | null>(null);
    const [lyDo, setLyDo] = useState("");

    const handleXacNhanKhoa = () => {
        if (!lyDo.trim()) {
            alert("Vui lòng nhập lý do khóa");
            return;
        }
        onDoiTrangThai(nguoiDangKhoa!, lyDo.trim());
        setNguoiDangKhoa(null);
        setLyDo("");
    };

    if (dangTai) return <p>Đang tải...</p>;

    return (
        <>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {duLieu.map(u => (
                        <tr key={u.maNguoiDung}>
                            <td>{u.hoTen}</td>
                            <td>{u.email}</td>

                            <td>
                                <span className="badge-role">{u.vaiTro}</span>
                            </td>

                            <td>
                                <span className={`status-dot ${u.trangThai ? "active" : "locked"}`}>
                                    {u.trangThai ? "Hoạt động" : "Đã khóa"}
                                </span>
                            </td>

                            <td className="action-cell">
                                <button
                                    className="btn-action btn-edit"
                                    onClick={() => onSua(u)}
                                >
                                    Sửa
                                </button>

                                <button
                                    className={`btn-action ${u.trangThai ? "btn-lock" : "btn-unlock"}`}
                                    onClick={() => {
                                        if (u.trangThai) {
                                            // Đang hoạt động → cần lý do khóa
                                            setNguoiDangKhoa(u);
                                            setLyDo("");
                                        } else {
                                            // Đang khóa → mở thẳng, không cần lý do
                                            onDoiTrangThai(u);
                                        }
                                    }}
                                >
                                    {u.trangThai ? "Khóa" : "Mở"}
                                </button>

                                <button
                                    className="btn-action btn-delete"
                                    onClick={() => onXoa(u)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal lý do khóa */}
            {nguoiDangKhoa && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 420 }}>
                        <h2 className="modal-title">Khóa người dùng</h2>
                        <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
                            Bạn đang khóa tài khoản <strong>{nguoiDangKhoa.hoTen}</strong>.
                            Vui lòng nhập lý do.
                        </p>

                        <div className="form-group">
                            <label>Lý do khóa</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập lý do khóa tài khoản..."
                                value={lyDo}
                                onChange={(e) => setLyDo(e.target.value)}
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                    fontSize: 14,
                                    outline: "none",
                                    resize: "vertical",
                                    fontFamily: "inherit"
                                }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setNguoiDangKhoa(null)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-action btn-lock"
                                style={{ padding: "9px 20px" }}
                                onClick={handleXacNhanKhoa}
                            >
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