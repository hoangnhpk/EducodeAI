import React from 'react';
import { FaEnvelope, FaInfoCircle, FaArrowLeft, FaStar } from 'react-icons/fa';

interface Props { idKhoaHoc: number; onQuayLai: () => void; }

const ChiTietKhoaHoc: React.FC<Props> = ({ idKhoaHoc, onQuayLai }) => {
    return (
        <div className="course-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h2 className="section-title">Chi tiết khoá học</h2>
                    <p>Lớp: <b>JavaScript Co ban - K24</b></p>
                </div>
            </div>

            {/* 4 The thong ke */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card">
                    <small style={{ color: '#888', fontWeight: 'bold' }}>SĨ SỐ</small>
                    <div className="stat-value">45/50</div>
                </div>
                <div className="stat-card">
                    <small style={{ color: '#888', fontWeight: 'bold' }}>TỈ LỆ HOÀN THÀNH</small>
                    <div className="stat-value" style={{ color: '#198754' }}>78%</div>
                </div>
                <div className="stat-card">
                    <small style={{ color: '#888', fontWeight: 'bold' }}>BÀI TẬP CHƯA CHẤM</small>
                    <div className="stat-value" style={{ color: '#fb873f' }}>12</div>
                </div>
                <div className="stat-card">
                    <small style={{ color: '#888', fontWeight: 'bold' }}>ĐÁNH GIÁ</small>
                    <div className="stat-value" style={{ color: '#ffc107' }}>4.9 <FaStar size={18} /></div>
                </div>
            </div>

            {/* Bang hoc vien */}
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                    <h3 style={{ margin: 0 }}>Danh sách học viên</h3>
                </div>
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Ngày tham gia</th>
                            <th>Tiến độ</th>
                            <th>Điểm trung bình</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div className="avatar-circle" style={{ background: '#e3f2fd', color: '#2196f3' }}>NA</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Nguyen Van An</div>
                                        <small style={{ color: '#888' }}>an.nguyen@email.com</small>
                                    </div>
                                </div>
                            </td>
                            <td>12/10/2025</td>
                            <td>
                                <div style={{ width: '100px', height: '6px', background: '#eee', borderRadius: '10px' }}>
                                    <div style={{ width: '85%', background: '#fb873f', height: '100%' }}></div>
                                </div>
                                <small>85%</small>
                            </td>
                            <td><b>8.5</b></td>
                            <td>
                                <FaEnvelope style={{ color: '#fb873f', marginRight: '10px', cursor: 'pointer' }} />
                                <FaInfoCircle style={{ color: '#fb873f', cursor: 'pointer' }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button className="btn-orange" style={{ margin: '0 auto', background: '#ff8a44' }} onClick={onQuayLai}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>
        </div>
    );
};
export default ChiTietKhoaHoc;