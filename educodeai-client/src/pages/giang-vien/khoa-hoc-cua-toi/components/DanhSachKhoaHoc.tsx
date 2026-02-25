import React from 'react';
import type { KhoaHocGiangVienListDTO } from '../KhoaHocCuaToiDTO';
import { FaUserGraduate, FaClock, FaStar, FaTrash, FaCog } from 'react-icons/fa';

const TRINH_DO_MAP: Record<string, { label: string; color: string }> = {
    nguoi_moi: { label: 'Người mới', color: '#27ae60' },
    trung_cap: { label: 'Trung cấp', color: '#f39c12' },
    nang_cao:  { label: 'Nâng cao',  color: '#e74c3c' },
};

interface Props {
    duLieu:          KhoaHocGiangVienListDTO[];
    loadingDeleteId: number | null; // ❶ Nhận id đang xóa từ parent
    onXemChiTiet:    (maKhoaHoc: number) => void;
    onXoa:           (maKhoaHoc: number) => void;
}

const DanhSachKhoaHoc: React.FC<Props> = ({ duLieu, loadingDeleteId, onXemChiTiet, onXoa }) => {
    return (
        <div className="course-grid">
            {duLieu.map(kh => {
                const trinhDo   = TRINH_DO_MAP[kh.trinhDo] ?? { label: kh.trinhDo, color: '#95a5a6' };
                const isDeleting = loadingDeleteId === kh.maKhoaHoc;

                return (
                    <div
                        className={`course-card ${isDeleting ? 'opacity-50' : ''}`}
                        key={kh.maKhoaHoc}
                    >
                        <div className="image-wrapper">
                            <img
                                src={kh.hinhAnh || 'https://placehold.co/400x200/fb873f/white?text=No+Image'}
                                alt={kh.tenKhoaHoc}
                            />
                            <span className="status-badge">{kh.trangThai || 'Hoạt động'}</span>
                            <span
                                className="trinh-do-badge"
                                style={{ backgroundColor: trinhDo.color }}
                            >
                                {trinhDo.label}
                            </span>
                        </div>

                        <div className="course-card-body">
                            <p className="course-linh-vuc">{kh.linhVuc}</p>
                            <h5 className="course-title">{kh.tenKhoaHoc}</h5>

                            <div className="course-meta">
                                <span><FaUserGraduate /> {kh.soHocVien} học viên</span>
                                <span><FaClock /> {kh.thoiLuongGio}h</span>
                                <span className="text-warning">
                                    <FaStar /> {kh.diemDanhGiaTB?.toFixed(1) || '0.0'}
                                </span>
                            </div>

                            <div className="pg-label">
                                <span className="small text-muted">Tiến độ TB</span>
                                <span className="small fw-bold">{Math.round(kh.tienDoTrungBinh || 0)}%</span>
                            </div>
                            <div className="pg-container">
                                <div className="pg-bar" style={{ width: `${kh.tienDoTrungBinh || 0}%` }} />
                            </div>

                            <div className="course-card-actions">
                                <button
                                    className="btn-orange"
                                    onClick={() => onXemChiTiet(kh.maKhoaHoc)}
                                    disabled={isDeleting}
                                >
                                    <FaCog /> Quản lý
                                </button>
                                <button
                                    className="btn-danger-outline"
                                    onClick={() => onXoa(kh.maKhoaHoc)}
                                    disabled={isDeleting}
                                    title="Xóa khóa học"
                                >
                                    {isDeleting
                                        ? <span className="spinner-border spinner-border-sm" />
                                        : <FaTrash />
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DanhSachKhoaHoc;
