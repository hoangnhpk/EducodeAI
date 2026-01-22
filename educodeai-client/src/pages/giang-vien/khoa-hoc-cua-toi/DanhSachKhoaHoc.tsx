import React from 'react';
import { FaUserGraduate, FaCalendarAlt, FaCog } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { khoaHocService } from '../../../services/khoa-hoc.service';

interface KhoaHocDTO {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    hinhAnh: string | null;
    trangThai: string;
    soHocVien: number;
    tienDoTrungBinh: number;
    ngayTao: string;
}

interface Props { onXemChiTiet: (id: number) => void; }


const DanhSachKhoaHoc: React.FC<Props> = ({ onXemChiTiet }) => {
    const { data: danhSach, isLoading, error } = useQuery({
        queryKey: ['khoa-hoc-giang-vien'],
        queryFn: () => khoaHocService.getDanhSachKhoaHocGiangVien(1)
    });
    if (isLoading) return <div className="course-container">Đang tải dữ liệu...</div>;
    if (error) return <div className="course-container">Lỗi kết nối Server</div>;

    return (
        <div className="course-container">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h2 className="section-title">Danh sách khoá học của tôi</h2>
                    <p style={{ color: '#666' }}>Quản lý và vận hành các khoá học mà bạn đang giảng dạy.</p>
                </div>
            </div>

            <div className="course-grid">
                {danhSach?.map((kh: KhoaHocDTO) => (
                    <div key={kh.maKhoaHoc} className="course-card">
                        <div className="image-wrapper">
                            <img src={kh.hinhAnh || "https://via.placeholder.com/400x200"} alt={kh.tenKhoaHoc} />
                            <span className="status-badge">{kh.trangThai || "Đang dạy"}</span>
                            <span className="student-count-badge">{kh.soHocVien}/50</span>
                        </div>
                        <div style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 5px 0' }}>{kh.tenKhoaHoc}</h4>
                            <p style={{ fontSize: '14px', color: '#666' }}>Lớp: {kh.tenKhoaHoc}</p>
                            
                            <div style={{ display: 'flex', gap: '15px', margin: '10px 0', fontSize: '13px', color: '#888' }}>
                                <span><FaUserGraduate /> {kh.soHocVien} Học viên</span>
                                <span><FaCalendarAlt /> {new Date(kh.ngayTao).toLocaleDateString('vi-VN')}</span>
                            </div>

                            <div style={{ height: '6px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${kh.tienDoTrungBinh}%`, background: '#fb873f', height: '100%' }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <small style={{ color: '#888' }}>Tỉ lệ hoàn thành: {kh.tienDoTrungBinh}%</small>
                                <button className="btn-orange" onClick={() => onXemChiTiet(kh.maKhoaHoc)}>
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