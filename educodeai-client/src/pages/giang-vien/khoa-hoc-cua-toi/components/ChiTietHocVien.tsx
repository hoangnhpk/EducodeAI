import React from 'react';
import { FaUserGraduate, FaTimes, FaEnvelope, FaCalendarAlt, FaChartLine, FaStar } from 'react-icons/fa';

interface ModalChiTietHocVien {
    hocVien: any;
    onClose: () => void;
}

const ModalChiTietHocVien: React.FC<ModalChiTietHocVien> = ({ hocVien, onClose }) => {
    if (!hocVien) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h5><FaUserGraduate className="me-2" /> Chi tiết học viên</h5>
                    <FaTimes className="btn-close-white" onClick={onClose} style={{cursor: 'pointer'}} />
                </div>
                
                <div className="modal-body-custom">
                    <div className="d-flex align-items-center mb-4">
                        <div className="avatar-placeholder me-3">
                            {hocVien.hoTen?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="mb-0 fw-bold">{hocVien.hoTen}</h4>
                            <span className="text-muted"><FaEnvelope className="me-1" /> {hocVien.email}</span>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label"><FaChartLine className="me-1" /> Tiến độ học</div>
                            <div className="info-value text-primary">{hocVien.tienDo}%</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label"><FaStar className="me-1" /> Điểm trung bình</div>
                            <div className="info-value text-success">{hocVien.diemTrungBinh || 0}/10</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label"><FaCalendarAlt className="me-1" /> Ngày đăng ký</div>
                            <div className="info-value" style={{fontSize: '0.95rem'}}>
                                {new Date(hocVien.ngayDangKy).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Trạng thái</div>
                            <div className="info-value text-info">Đang học</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalChiTietHocVien;