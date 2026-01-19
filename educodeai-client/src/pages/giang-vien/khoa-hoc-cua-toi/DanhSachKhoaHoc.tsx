import React from 'react';
import { FaUserGraduate, FaCalendarAlt, FaCog } from 'react-icons/fa';

interface KhoaHoc {
    Id: number;
    hoTen: string;
    Lop: string;
    soHocVien: string;
    Ngay: string;
    tienDo: number;
    hinhAnh: string;
}

interface Props { onXemChiTiet: (id: number) => void; }

const DanhSachKhoaHoc: React.FC<Props> = ({ onXemChiTiet }) => {
    const duLieuMau: KhoaHoc[] = [
        { Id: 1, hoTen: "HTML Course for Beginners", Lop: "HTML & CSS Co ban - K24", soHocVien: "45/50", Ngay: "15/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { Id: 2, hoTen: "Lap trinh React Fullstack", Lop: "React Fullstack - K24", soHocVien: "45/50", Ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { Id: 3, hoTen: "Lap trinh React Fullstack", Lop: "React Fullstack - K24", soHocVien: "45/50", Ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { Id: 4, hoTen: "Lap trinh React Fullstack", Lop: "React Fullstack - K24", soHocVien: "45/50", Ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { Id: 5, hoTen: "Lap trinh React Fullstack", Lop: "React Fullstack - K24", soHocVien: "45/50", Ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
        { Id: 6, hoTen: "Lap trinh React Fullstack", Lop: "React Fullstack - K24", soHocVien: "45/50", Ngay: "10/01/2024", tienDo: 78, hinhAnh: "https://via.placeholder.com/400x200" },
    ];

    return (
        <div className="course-container">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h2 className="section-title">Danh sách khoá học của tôi</h2>
                    <p style={{ color: '#666' }}>Quản lý các khoá học và chương trình giảng dạy.</p>
                </div>
            </div>

            <div className="course-grid">
                {duLieuMau.map(kh => (
                    <div key={kh.Id} className="course-card">
                        <div className="image-wrapper">
                            <img src={kh.hinhAnh} alt={kh.hoTen} />
                            <span className="status-badge">Đang dạy</span>
                            <span className="student-count-badge">{kh.soHocVien}</span>
                        </div>
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 5px 0' }}>{kh.hoTen}</h4>
                            <p style={{ fontSize: '14px', color: '#666' }}>Lớp: {kh.Lop}</p>
                            <div style={{ display: 'flex', gap: '15px', margin: '10px 0', fontSize: '13px', color: '#888' }}>
                                <span><FaUserGraduate /> {kh.soHocVien.split('/')[0]} Học Viên</span>
                                <span><FaCalendarAlt /> {kh.Ngay}</span>
                            </div>
                            <div style={{ height: '6px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${kh.tienDo}%`, background: '#fb873f', height: '100%' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <small style={{ color: '#888' }}>Tỉ lệ hoàn thành {kh.tienDo}%</small>
                                <button className="btn-orange" onClick={() => onXemChiTiet(kh.Id)}>
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