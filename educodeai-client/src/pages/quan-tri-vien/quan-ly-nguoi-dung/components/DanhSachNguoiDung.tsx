import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";

type Props = {
    duLieu: NguoiDung[];
    dangTai: boolean;
    onSua: (u: NguoiDung) => void;
    onXoa: (u: NguoiDung) => void;
    onDoiTrangThai: (u: NguoiDung) => void;
};

const DanhSachNguoiDung = ({
    duLieu,
    dangTai,
    onSua,
    onXoa,
    onDoiTrangThai
}: Props) => {

    if (dangTai) return <p>Đang tải...</p>;

    return (
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
                            <span className="badge-role">
                                {u.vaiTro}
                            </span>
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
                                onClick={() => onDoiTrangThai(u)}
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
    );
};

export default DanhSachNguoiDung;