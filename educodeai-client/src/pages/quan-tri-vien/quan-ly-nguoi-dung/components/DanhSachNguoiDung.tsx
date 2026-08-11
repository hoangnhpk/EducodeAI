import { useState, memo } from "react";
import Swal from 'sweetalert2';
import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";
import ModalKhoaNguoiDung from "./ModalKhoaNguoiDung";

type Props = {
    duLieu: NguoiDung[];
    dangTai: boolean;
    onSua: (u: NguoiDung) => void;
    onXoa: (u: NguoiDung) => void;
    onDoiTrangThai: (u: NguoiDung, lyDo?: string, thoiHan?: string) => void;
};

const getRoleClass = (role: string) => {
    switch (role) {
        case "Admin": return "role-admin";
        case "Giảng viên": return "role-giangvien";
        case "Học viên": return "role-hocvien";
        default: return "role-unknown";
    }
};

const getStatusClass = (status: string) => {
    if (status === "Hoạt động") return "user-status-active";
    if (status === "Khóa vĩnh viễn") return "user-status-permanent-locked";
    return "user-status-locked"; // Tạm khóa
};

const DanhSachNguoiDung = memo(({ duLieu, dangTai, onSua, onXoa, onDoiTrangThai }: Props) => {
    const [nguoiDangKhoa, setNguoiDangKhoa] = useState<NguoiDung | null>(null);

    const getDisplayStatus = (u: NguoiDung) => {
        return u.trangThai || (u as any).TrangThai || (u as any).statusText || "Đang cập nhật...";
    };

    const handleXacNhanKhoa = (u: NguoiDung, lyDo: string, thoiHan: string) => {
        onDoiTrangThai(u, lyDo, thoiHan);
        setNguoiDangKhoa(null);
        Swal.fire({ 
            title: 'Thành công!', 
            text: 'Đã thay đổi trạng thái tài khoản.', 
            icon: 'success', 
            timer: 1200, 
            showConfirmButton: false 
        });
    };

    if (dangTai) {
        return (
            <div className="table-responsive" aria-busy="true" aria-live="polite">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th className="user-col-name">Người dùng</th>
                            <th className="user-col-email">Email</th>
                            <th className="user-col-role">Vai trò</th>
                            <th className="user-col-created">Ngày tạo</th>
                            <th className="user-col-status">Trạng thái</th>
                            <th className="user-col-actions text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={`skeleton-${i}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className="qlnv-skeleton qlnv-skeleton--avatar" />
                                        <span className="qlnv-skeleton qlnv-skeleton--text" style={{ width: '60%' }} />
                                    </div>
                                </td>
                                <td><span className="qlnv-skeleton qlnv-skeleton--text" style={{ width: '80%' }} /></td>
                                <td><span className="qlnv-skeleton qlnv-skeleton--pill" /></td>
                                <td><span className="qlnv-skeleton qlnv-skeleton--text" style={{ width: '70%' }} /></td>
                                <td><span className="qlnv-skeleton qlnv-skeleton--pill" /></td>
                                <td><span className="qlnv-skeleton qlnv-skeleton--text" style={{ width: '90%' }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <span className="visually-hidden">Đang tải danh sách người dùng...</span>
            </div>
        );
    }

    return (
        <>
            <div className="table-responsive">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th className="user-col-name">Người dùng</th>
                            <th className="user-col-email">Email</th>
                            <th className="user-col-role">Vai trò</th>
                            <th className="user-col-created">Ngày tạo</th>
                            <th className="user-col-status">Trạng thái</th>
                            <th className="user-col-actions text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {duLieu.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                                    <i className="bi bi-people" style={{ fontSize: 28, display: 'block', marginBottom: 8, color: 'var(--text-light)' }} aria-hidden="true"></i>
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        ) : (
                            duLieu.map(u => (
                                <tr key={u.maNguoiDung}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {u.anhDaiDien
                                                ? <img src={u.anhDaiDien} alt={u.hoTen}
                                                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                                                : <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'var(--border-light)', color: 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontWeight: 700, fontSize: 13
                                                }}>
                                                    {u.hoTen ? u.hoTen[0].toUpperCase() : '?'}
                                                </div>
                                            }
                                            <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                                                {u.hoTen}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="user-cell-email">{u.email}</td>
                                    <td>
                                        <span className={`badge-role ${getRoleClass(u.vaiTro)}`}>
                                            {u.vaiTro}
                                        </span>
                                    </td>
                                    <td className="user-cell-created">
                                        {u.ngayTao ? new Date(u.ngayTao).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td>
                                        {(() => {
                                            const statusValue = getDisplayStatus(u);
                                            return (
                                                <span className={`user-status-badge ${getStatusClass(statusValue)}`}>
                                                    <span className="user-status-dot-indicator"></span>
                                                    {statusValue}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="user-cell-actions text-center">
                                        <div className="action-group">
                                            <button className="btn-action btn-edit" title="Sửa thông tin" aria-label={`Sửa thông tin ${u.hoTen}`} onClick={() => onSua(u)}>
                                                <i className="bi bi-pencil" aria-hidden="true"></i>
                                                <span>Sửa</span>
                                            </button>
                                            <button
                                                className={`btn-action ${u.trangThai === "Hoạt động" ? "btn-lock" : "btn-unlock"}`}
                                                title={u.trangThai === "Hoạt động" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                aria-label={u.trangThai === "Hoạt động" ? `Khóa tài khoản ${u.hoTen}` : `Mở khóa tài khoản ${u.hoTen}`}
                                                onClick={() => {
                                                    if (u.trangThai === "Hoạt động") {
                                                        setNguoiDangKhoa(u);
                                                    } else {
                                                        onDoiTrangThai(u);
                                                    }
                                                }}
                                            >
                                                <i className={`bi ${u.trangThai === "Hoạt động" ? "bi-lock" : "bi-unlock"}`} aria-hidden="true"></i>
                                                <span>{u.trangThai === "Hoạt động" ? "Khóa" : "Mở khóa"}</span>
                                            </button>
                                            <button className="btn-action btn-delete" title="Xóa vĩnh viễn" aria-label={`Xóa vĩnh viễn ${u.hoTen}`} onClick={() => onXoa(u)}>
                                                <i className="bi bi-trash3" aria-hidden="true"></i>
                                                <span>Xóa</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {nguoiDangKhoa && (
                <ModalKhoaNguoiDung 
                    nguoiDung={nguoiDangKhoa}
                    onDong={() => setNguoiDangKhoa(null)}
                    onXacNhan={handleXacNhanKhoa}
                />
            )}
        </>
    );
});

export default DanhSachNguoiDung;
