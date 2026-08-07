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
        return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách người dùng...</div>;
    }

    return (
        <>
            <div className="table-responsive">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>Người dùng</th>
                            <th style={{ width: '25%' }}>Email</th>
                            <th style={{ width: '15%' }}>Vai trò</th>
                            <th style={{ width: '120px' }}>Ngày tạo</th>
                            <th style={{ width: '20%' }}>Trạng thái</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {duLieu.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
                                                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #f1f5f9' }} />
                                                : <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: '#f1f5f9', color: '#64748b', 
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontWeight: 700, fontSize: 13
                                                }}>
                                                    {u.hoTen ? u.hoTen[0].toUpperCase() : '?'}
                                                </div>
                                            }
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                                {u.hoTen}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>{u.email}</td>
                                    <td>
                                        <span className={`badge-role ${getRoleClass(u.vaiTro)}`}>
                                            {u.vaiTro}
                                        </span>
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>
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
                                    <td>
                                        <div className="action-group">
                                            <button className="btn-action btn-edit" title="Sửa thông tin" onClick={() => onSua(u)}>Sửa</button>
                                            <button
                                                className={`btn-action ${u.trangThai === "Hoạt động" ? "btn-lock" : "btn-unlock"}`}
                                                title={u.trangThai === "Hoạt động" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                onClick={() => {
                                                    if (u.trangThai === "Hoạt động") { 
                                                        setNguoiDangKhoa(u); 
                                                    } else { 
                                                        onDoiTrangThai(u); 
                                                    }
                                                }}
                                            >
                                                {u.trangThai === "Hoạt động" ? "Khóa" : "Mở"}
                                            </button>
                                            <button className="btn-action btn-delete" title="Xóa vĩnh viễn" onClick={() => onXoa(u)}>Xóa</button>
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
