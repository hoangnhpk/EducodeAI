import React, { useCallback, useEffect, useState } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { KhoaHocGiangVienDetailDTO, HocVienTrongKhoaHocDTO } from '../KhoaHocCuaToiDTO';
import BangHocVien from './BangHocVien';
import ChiTietHocVien from './ChiTietHocVien';
import ModalKhoaHoc from './ModalKhoaHoc';
import PanelChuong from './PanelChuong';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaEdit, FaUsers, FaBookOpen, FaAward, FaRobot } from 'react-icons/fa';

type Tab = 'hoc-vien' | 'chuong-hoc';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const getImageUrl = (url?: string): string => {
    if (!url) return 'https://placehold.co/280x160/fb873f/white?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
};

interface Props {
    maGiangVien: number;
    maKhoaHoc: number;
    onQuayLai: () => void;
}

const ChiTietKhoaHoc: React.FC<Props> = ({ maGiangVien, maKhoaHoc, onQuayLai }) => {
    const [detail, setDetail] = useState<KhoaHocGiangVienDetailDTO | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [tab, setTab] = useState<Tab>('hoc-vien');
    const [selectedHocVien, setSelectedHocVien] = useState<HocVienTrongKhoaHocDTO | null>(null);
    const [showModalSua, setShowModalSua] = useState(false);
    const [dangTaoDeAI, setDangTaoDeAI] = useState(false);

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

    useEffect(() => {
        void loadDetail();
    }, [loadDetail]);

    const handleSuaSuccess = () => {
        setShowModalSua(false);
        void loadDetail();
        void Swal.fire({ title: 'Đã cập nhật!', icon: 'success', timer: 1500, showConfirmButton: false });
    };

    const handleTaoDeAI = async () => {
        if (!detail) return;

        try {
            setDangTaoDeAI(true);
            const result = await khoaHocCuaToiService.taoDeChungChiBangAI(maGiangVien, detail.maKhoaHoc);
            await loadDetail();
            await Swal.fire('Thành công', result.thongBao, 'success');
        } catch (error: any) {
            await Swal.fire('Lỗi', error?.response?.data?.thongBao || error?.response?.data?.message || 'Không thể tạo đề chứng chỉ bằng AI.', 'error');
        } finally {
            setDangTaoDeAI(false);
        }
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

            <div className="khct-detail-header">
                <div className="khct-detail-img-wrap">
                    <img src={getImageUrl(detail.hinhAnh)} alt={detail.tenKhoaHoc} className="khct-detail-img" />
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
                            <div className="stat-value">{detail.soHocVien}</div>
                            <div className="small text-muted">Học viên</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{Math.round(detail.tiLeHoanThanh)}%</div>
                            <div className="small text-muted">Hoàn thành</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value text-warning">{detail.diemDanhGiaTB?.toFixed(1)}</div>
                            <div className="small text-muted">Đánh giá</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{detail.thoiLuongGio}h</div>
                            <div className="small text-muted">Thời lượng</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <FaAward className="text-warning" />
                            <h5 className="mb-0">Cấu hình chứng chỉ</h5>
                        </div>
                        <p className="text-muted mb-2">
                            {detail.coChungChi
                                ? `Khóa học này có cấp chứng chỉ. Điểm đạt ${detail.diemDatChungChi}%, ${detail.soCauHoiChungChi} câu, ${detail.thoiGianLamBaiChungChi} phút.`
                                : 'Khóa học này hiện chưa bật chứng chỉ.'}
                        </p>
                        {detail.coChungChi && (
                            <div className="d-flex flex-wrap gap-2">
                                <span className={`badge ${detail.daCoDeThiChungChi ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                    {detail.daCoDeThiChungChi ? 'Đã có đề chứng chỉ' : 'Chưa có đề chứng chỉ'}
                                </span>
                                {detail.nguonDeChungChi && <span className="badge bg-info-subtle text-info">Nguồn đề: {detail.nguonDeChungChi}</span>}
                                {detail.tenChungChi && <span className="badge bg-light text-dark">{detail.tenChungChi}</span>}
                            </div>
                        )}
                    </div>

                    {detail.coChungChi && (
                        <button className="btn-orange" onClick={handleTaoDeAI} disabled={dangTaoDeAI}>
                            {dangTaoDeAI ? (
                                <><span className="spinner-border spinner-border-sm me-2" />Đang tạo đề...</>
                            ) : (
                                <><FaRobot className="me-2" />Tạo đề chứng chỉ bằng AI</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="khct-tabs">
                <button className={`khct-tab ${tab === 'hoc-vien' ? 'active' : ''}`} onClick={() => setTab('hoc-vien')}>
                    <FaUsers className="me-2" />Danh sách học viên
                    <span className="tab-badge">{detail.soHocVien}</span>
                </button>
                <button className={`khct-tab ${tab === 'chuong-hoc' ? 'active' : ''}`} onClick={() => setTab('chuong-hoc')}>
                    <FaBookOpen className="me-2" />Chương &amp; Bài học
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
                        <BangHocVien danhSach={detail.danhSachHocVien} onXemChiTiet={setSelectedHocVien} />
                    )
                )}

                {tab === 'chuong-hoc' && (
                    <PanelChuong maGiangVien={maGiangVien} maKhoaHoc={maKhoaHoc} initialChuongs={detail.danhSachChuong} />
                )}
            </div>

            <ChiTietHocVien hocVien={selectedHocVien} onClose={() => setSelectedHocVien(null)} />

            {showModalSua && (
                <ModalKhoaHoc
                    mode="sua"
                    maGiangVien={maGiangVien}
                    maKhoaHoc={maKhoaHoc}
                    duLieuCu={{
                        tenKhoaHoc: detail.tenKhoaHoc,
                        moTa: detail.moTa,
                        hinhAnh: detail.hinhAnh,
                        linhVuc: detail.linhVuc,
                        trinhDo: detail.trinhDo,
                        thoiLuongGio: detail.thoiLuongGio,
                        trangThai: detail.trangThai,
                        kyNangChinh: detail.kyNangChinh,
                        coChungChi: detail.coChungChi,
                        tenChungChi: detail.tenChungChi,
                        diemDatChungChi: detail.diemDatChungChi,
                        soCauHoiChungChi: detail.soCauHoiChungChi,
                        thoiGianLamBaiChungChi: detail.thoiGianLamBaiChungChi,
                    }}
                    onClose={() => setShowModalSua(false)}
                    onSuccess={handleSuaSuccess}
                />
            )}
        </div>
    );
};

export default ChiTietKhoaHoc;
