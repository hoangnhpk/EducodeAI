import React from 'react';
import type { HocVienTrongKhoaHocDTO } from '../KhoaHocCuaToiDTO';
import { FaUserGraduate, FaTimes, FaEnvelope, FaCalendarAlt, FaChartLine, FaStar } from 'react-icons/fa';

interface Props {
    hocVien: HocVienTrongKhoaHocDTO | null;
    onClose: () => void;
}

const ChiTietHocVien: React.FC<Props> = ({ hocVien, onClose }) => {
    if (!hocVien) return null;

    const trangThaiTienDo = hocVien.tienDo >= 100
        ? { label: 'Hoàn thành', color: '#27ae60' }
        : hocVien.tienDo > 0
        ? { label: 'Đang học', color: '#3498db' }
        : { label: 'Chưa bắt đầu', color: '#95a5a6' };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h5 className="mb-0"><FaUserGraduate className="me-2" />Chi tiết học viên</h5>
                    <FaTimes style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <div className="modal-body-custom">
                    <div className="d-flex align-items-center mb-4 gap-3">
                        {hocVien.anhDaiDien ? (
                            <img src={hocVien.anhDaiDien} alt={hocVien.hoTen} className="avatar-placeholder" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="avatar-placeholder">
                                {hocVien.hoTen.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h4 className="mb-0 fw-bold">{hocVien.hoTen}</h4>
                            <span className="text-muted small"><FaEnvelope className="me-1" />{hocVien.email}</span>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label"><FaChartLine className="me-1" />Tiến độ học</div>
                            <div className="info-value text-primary">{hocVien.tienDo}%</div>
                            <div className="pg-container mt-2">
                                <div className="pg-bar" style={{ width: `${hocVien.tienDo}%`, background: trangThaiTienDo.color }} />
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-label"><FaStar className="me-1" />Điểm trung bình</div>
                            <div className="info-value" style={{ color: hocVien.diemTrungBinh != null && hocVien.diemTrungBinh >= 8 ? '#27ae60' : '#f39c12' }}>
                                {hocVien.diemTrungBinh != null ? `${hocVien.diemTrungBinh.toFixed(1)}/10` : '—'}
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-label"><FaCalendarAlt className="me-1" />Ngày đăng ký</div>
                            <div className="info-value" style={{ fontSize: '0.9rem' }}>
                                {new Date(hocVien.ngayDangKy).toLocaleDateString('vi-VN', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Trạng thái</div>
                            <div className="info-value">
                                <span className="badge" style={{ backgroundColor: trangThaiTienDo.color, fontSize: '0.85rem' }}>
                                    {trangThaiTienDo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChiTietHocVien;
