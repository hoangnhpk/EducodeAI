import React from 'react';
import { FaUserGraduate, FaCalendarAlt, FaCog } from 'react-icons/fa';

interface KhoaHoc {
    id: number;
    ten: string;
    lop: string;
    soHocVien: string;
    ngay: string;
    tienDo: number;
    hinhAnh: string;
}

interface Props { onXemChiTiet: (id: number) => void; }

const DanhSachKhoaHoc: React.FC<Props> = ({ onXemChiTiet }) => {
    const duLieuMau: KhoaHoc[] = [
        { id: 1, ten: "HTML Course for Beginners", lop: "HTML & CSS Co ban - K24", soHocVien: "45/50", ngay: "15/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 2, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 3, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 4, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 5, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 6, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 7, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { id: 8, ten: "Lap trinh React Fullstack", lop: "React Fullstack - K24", soHocVien: "45/50", ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" }
    ];

    return (
        <div className="course-container">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h2 className="section-title">Danh sách khoá học của tôi</h2>
                    <p style={{ color: '#666' }}>Quản lý và vận hành các khoá học mà bạn đang giảng dạy.</p>
                </div>
            </div>

            <div className="course-grid">
                {duLieuMau.map(kh => (
                    <div key={kh.id} className="course-card">
                        <div className="image-wrapper">
                            <img src={kh.hinhAnh} alt={kh.ten} />
                            <span className="status-badge">Đang dạy</span>
                            <span className="student-count-badge">{kh.soHocVien}</span>
                        </div>
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 5px 0' }}>{kh.ten}</h4>
                            <p style={{ fontSize: '14px', color: '#666' }}>Lớp: {kh.lop}</p>
                            <div style={{ display: 'flex', gap: '15px', margin: '10px 0', fontSize: '13px', color: '#888' }}>
                                <span><FaUserGraduate /> {kh.soHocVien.split('/')[0]} Học viên</span>
                                <span><FaCalendarAlt /> {kh.ngay}</span>
                            </div>
                            <div style={{ height: '6px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${kh.tienDo}%`, background: '#fb873f', height: '100%' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <small style={{ color: '#888' }}>Tỉ lệ hoàn thành:  {kh.tienDo}%</small>
                                <button className="btn-orange" onClick={() => onXemChiTiet(kh.id)}>
                                    <FaCog /> Chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default DanhSachKhoaHoc;