import React, { useState, useEffect, useCallback } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { KhoaHocGiangVienDetailDTO, HocVienTrongKhoaHocDTO, ChuongHocDetailDTO } from '../KhoaHocCuaToiDTO';
import BangHocVien from './BangHocVien';
import ChiTietHocVien from './ChiTietHocVien';
import ModalKhoaHoc from './ModalKhoaHoc';
import PanelChuong from './PanelChuong';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaEdit, FaUsers, FaBookOpen, FaStar, FaCheckCircle } from 'react-icons/fa';

type Tab = 'hoc-vien' | 'chuong-hoc';

interface Props {
    maGiangVien: number;
    maKhoaHoc:   number;
    onQuayLai:   () => void;
}

const ChiTietKhoaHoc: React.FC<Props> = ({ maGiangVien, maKhoaHoc, onQuayLai }) => {
    const [detail, setDetail]                     = useState<KhoaHocGiangVienDetailDTO | null>(null);
    const [loadingDetail, setLoadingDetail]       = useState(true);
    const [tab, setTab]                           = useState<Tab>('hoc-vien');
    const [selectedHocVien, setSelectedHocVien]   = useState<HocVienTrongKhoaHocDTO | null>(null);
    const [showModalSua, setShowModalSua]         = useState(false);

    const loadDetail = useCallback(async () => {
        try {
            setLoadingDetail(true);
            const data = await khoaHocCuaToiService.getChiTiet(maGiangVien, maKhoaHoc);
            setDetail(data);
        } catch {
            Swal.fire('Lỗi', 'Không thể tải chi tiết khóa học.', 'error');
        } finally {
            setLoadingDetail(false);
        }
    }, [maGiangVien, maKhoaHoc]);

    useEffect(() => { loadDetail(); }, [loadDetail]);

    const handleSuaSuccess = () => {
        setShowModalSua(false);
        loadDetail();
        Swal.fire({ title: 'Đã cập nhật!', icon: 'success', timer: 1500, showConfirmButton: false });
    };

    if (loadingDetail) {
        return (
            <div className="khct-loading">
                <div className="spinner-border text-warning" role="status" />
                <p className="mt-3 text-muted">Đang tải chi tiết...</p>
            </div>
        );
    }

    if (!detail) return <div className="alert alert-danger m-4">Không tìm thấy khóa học.</div>;

    return (
        <div>
            <button className="btn btn-link text-dark fw-bold p-0 mb-3" onClick={onQuayLai}>
                <FaArrowLeft className="me-2" />Quay lại danh sách
            </button>

            {/* Header */}
            <div className="khct-detail-header">
                <div className="khct-detail-img-wrap">
                    <img
                        src={detail.hinhAnh || 'https://placehold.co/280x160/fb873f/white?text=No+Image'}
                        alt={detail.tenKhoaHoc}
                        className="khct-detail-img"
                    />
                </div>
                <div className="khct-detail-info">
                    <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                        <div>
                            <span className="badge bg-warning text-dark me-2">{detail.linhVuc}</span>
                            <span className="badge bg-secondary">{detail.trinhDo}</span>
                        </div>
                        <button className="btn-outline-edit" onClick={() => setShowModalSua(true)}>
                            <FaEdit className="me-1" />Chỉnh sửa
                        </button>
                    </div>
                    <h3 className="khct-detail-title">{detail.tenKhoaHoc}</h3>
                    {detail.moTa && <p className="text-muted small">{detail.moTa}</p>}

                    <div className="stat-row">
                        <div className="stat-card">
                            <FaUsers       className="stat-icon text-primary" />
                            <div className="stat-value">{detail.soHocVien}</div>
                            <div className="small text-muted">Học viên</div>
                        </div>
                        <div className="stat-card">
                            <FaCheckCircle className="stat-icon text-success" />
                            <div className="stat-value">{Math.round(detail.tiLeHoanThanh)}%</div>
                            <div className="small text-muted">Hoàn thành</div>
                        </div>
                        <div className="stat-card">
                            <FaStar        className="stat-icon text-warning" />
                            <div className="stat-value text-warning">{detail.diemDanhGiaTB?.toFixed(1)}</div>
                            <div className="small text-muted">Đánh giá</div>
                        </div>
                        <div className="stat-card">
                            <FaBookOpen    className="stat-icon text-info" />
                            <div className="stat-value">{detail.thoiLuongGio}h</div>
                            <div className="small text-muted">Thời lượng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="khct-tabs">
                <button
                    className={`khct-tab ${tab === 'hoc-vien' ? 'active' : ''}`}
                    onClick={() => setTab('hoc-vien')}
                >
                    <FaUsers className="me-2" />Danh sách học viên
                    <span className="tab-badge">{detail.soHocVien}</span>
                </button>
                <button
                    className={`khct-tab ${tab === 'chuong-hoc' ? 'active' : ''}`}
                    onClick={() => setTab('chuong-hoc')}
                >
                    <FaBookOpen className="me-2" />Chương &amp; Bài học
                    {/* FIX: Hiển thị số chương thật */}
                    <span className="tab-badge">{detail.danhSachChuong.length}</span>
                </button>
            </div>

            <div className="khct-tab-content">
                {tab === 'hoc-vien' && (
                    detail.danhSachHocVien.length === 0 ? (
                        <div className="khct-empty">
                            <i className="bi bi-people khct-empty-icon" />
                            <p>Chưa có học viên đăng ký khóa học này.</p>
                        </div>
                    ) : (
                        <BangHocVien
                            danhSach={detail.danhSachHocVien}
                            onXemChiTiet={setSelectedHocVien}
                        />
                    )
                )}

                {tab === 'chuong-hoc' && (
                    <PanelChuong
                        maGiangVien={maGiangVien}
                        maKhoaHoc={maKhoaHoc}
                        // FIX: Truyền data chương thật từ detail xuống
                        // Trước đây hardcode initialChuongs={[]} → tab luôn trống
                        initialChuongs={detail.danhSachChuong}
                    />
                )}
            </div>

            <ChiTietHocVien hocVien={selectedHocVien} onClose={() => setSelectedHocVien(null)} />

            {showModalSua && (
                <ModalKhoaHoc
                    mode="sua"
                    maGiangVien={maGiangVien}
                    maKhoaHoc={maKhoaHoc}
                    duLieuCu={{
                        tenKhoaHoc:   detail.tenKhoaHoc,
                        moTa:         detail.moTa,
                        hinhAnh:      detail.hinhAnh,
                        linhVuc:      detail.linhVuc,
                        trinhDo:      detail.trinhDo,
                        thoiLuongGio: detail.thoiLuongGio,
                        trangThai:    detail.trangThai,
                        // FIX: Truyền kyNangChinh vào modal — trước đây bị bỏ
                        kyNangChinh:  detail.kyNangChinh,
                    }}
                    onClose={() => setShowModalSua(false)}
                    onSuccess={handleSuaSuccess}
                />
            )}
        </div>
    );
};

export default ChiTietKhoaHoc;
