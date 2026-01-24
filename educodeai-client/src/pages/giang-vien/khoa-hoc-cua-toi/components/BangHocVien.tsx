import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface BangHocVienProps {
    danhSach: any[];
    onXemChiTiet: (hv: any) => void;
}
const BangHocVien: React.FC <BangHocVienProps> = ({danhSach, onXemChiTiet}) => (
    <div className="table-container">
        <table className="table custom-table align-middle mb-0">
            <thead>
                <tr>
                    <th>Học viên</th>
                    <th>Ngày đăng ký</th>
                    <th>Tiến độ</th>
                    <th className="text-center">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {danhSach.map((hv: any) => (
                    <tr key={hv.maNguoiDung}>
                        <td>
                            <div className="fw-bold">{hv.hoTen}</div>
                            <small className="text-muted">{hv.email}</small>
                        </td>
                        <td>{new Date(hv.ngayDangKy).toLocaleDateString('vi-VN')}</td>
                        <td>
                            <div className="pg-container" style={{ width: '120px' }}>
                                <div className="pg-bar" style={{ width: `${hv.tienDo}%` }}></div>
                            </div>
                            <small>{hv.tienDo}%</small>
                        </td>
                        <td className="text-center text-warning">
                            <FaInfoCircle style={{ cursor: 'pointer' }} onClick={() => onXemChiTiet(hv)}/>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
export default BangHocVien;