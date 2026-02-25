import React from 'react';
import type { HocVienTrongKhoaHocDTO } from '../KhoaHocCuaToiDTO';
import { FaInfoCircle } from 'react-icons/fa';

interface Props {
    danhSach: HocVienTrongKhoaHocDTO[];
    onXemChiTiet: (hv: HocVienTrongKhoaHocDTO) => void;
}

const BangHocVien: React.FC<Props> = ({ danhSach, onXemChiTiet }) => (
    <div className="table-container">
        <table className="table custom-table align-middle mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Học viên</th>
                    <th>Ngày đăng ký</th>
                    <th>Tiến độ</th>
                    <th>Điểm TB</th>
                    <th className="text-center">Chi tiết</th>
                </tr>
            </thead>
            <tbody>
                {danhSach.map((hv, idx) => (
                    <tr key={hv.maNguoiDung}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                            <div className="d-flex align-items-center gap-2">
                                {hv.anhDaiDien ? (
                                    <img src={hv.anhDaiDien} alt={hv.hoTen} className="hv-avatar" />
                                ) : (
                                    <div className="hv-avatar-placeholder">{hv.hoTen.charAt(0).toUpperCase()}</div>
                                )}
                                <div>
                                    <div className="fw-bold">{hv.hoTen}</div>
                                    <small className="text-muted">{hv.email}</small>
                                </div>
                            </div>
                        </td>
                        <td className="small">{new Date(hv.ngayDangKy).toLocaleDateString('vi-VN')}</td>
                        <td>
                            <div className="d-flex align-items-center gap-2">
                                <div className="pg-container flex-grow-1" style={{ minWidth: 80 }}>
                                    <div
                                        className="pg-bar"
                                        style={{
                                            width: `${hv.tienDo}%`,
                                            background: hv.tienDo >= 80 ? '#27ae60' : hv.tienDo >= 40 ? '#f39c12' : '#fb873f'
                                        }}
                                    />
                                </div>
                                <small className="fw-bold" style={{ minWidth: 36 }}>{hv.tienDo}%</small>
                            </div>
                        </td>
                        <td>
                            {hv.diemTrungBinh != null ? (
                                <span className={`fw-bold ${hv.diemTrungBinh >= 8 ? 'text-success' : hv.diemTrungBinh >= 5 ? 'text-warning' : 'text-danger'}`}>
                                    {hv.diemTrungBinh.toFixed(1)}
                                </span>
                            ) : (
                                <span className="text-muted small">—</span>
                            )}
                        </td>
                        <td className="text-center">
                            <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => onXemChiTiet(hv)}
                                title="Xem chi tiết"
                            >
                                <FaInfoCircle />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default BangHocVien;
