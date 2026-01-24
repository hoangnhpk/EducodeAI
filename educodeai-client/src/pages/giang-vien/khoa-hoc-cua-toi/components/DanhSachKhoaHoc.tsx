import React from 'react';
import { FaUserGraduate, FaCalendarAlt, FaCog } from 'react-icons/fa';

interface Props {
    DuLieu: any[];
    onXemChiTiet: (id: number) => void;
}

const DanhSachKhoaHoc: React.FC<Props> = ({ DuLieu, onXemChiTiet }) => {

    return (
        <div className="course-grid">
            {DuLieu.map((kh) => (
                <div className="course-card" key={kh.maKhoaHoc}>
                    <div className="image-wrapper">
                        <img src={kh.hinhAnh} alt={kh.tenKhoaHoc} />
                        <span className="status-badge">{kh.trangThai || 'Hoạt động'}</span>
                    </div>
                    <div className="p-3">
                        <h5 className="fw-bold text-dark">{kh.tenKhoaHoc}</h5>
                        <div className="d-flex gap-3 small text-muted my-2">
                            <span><FaUserGraduate /> {kh.soHocVien || 0} HV</span>
                            <span><FaCalendarAlt /> {new Date(kh.ngayTao).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="pg-container">
                            <div className="pg-bar" style={{ width: `${kh.tienDoTrungBinh || 0}%` }}></div>
                        </div>
                        <button className="btn-orange mt-2" onClick={() => onXemChiTiet(kh.maKhoaHoc)}>
                            <FaCog /> Quản lý khóa học
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default DanhSachKhoaHoc;

