import React, { useState } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { ChuongHocDetailDTO, BaiHocVideoDTO, BaiHocVideoDetailDTO } from '../KhoaHocCuaToiDTO';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaVideo, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import ModalChuong from './ModalChuong';
import ModalVideo from './ModalVideo';

interface ChuongVoiBaiHoc extends ChuongHocDetailDTO {
    expanded: boolean;
}

interface DeleteLoading {
    type: 'chuong' | 'video';
    id:   number;
}

interface Props {
    maGiangVien:     number;
    maKhoaHoc:       number;
    initialChuongs:  ChuongHocDetailDTO[];
    onChuongChange?: () => void;
}

const PanelChuong: React.FC<Props> = ({ maGiangVien, maKhoaHoc, initialChuongs, onChuongChange }) => {

    const [chuongs, setChuongs] = useState<ChuongVoiBaiHoc[]>(() =>
        initialChuongs.map(c => ({ ...c, expanded: false }))
    );

    const [deleteLoading, setDeleteLoading] = useState<DeleteLoading | null>(null);

    const [modalChuong, setModalChuong] = useState<
        { open: false } |
        { open: true; mode: 'tao' } |
        { open: true; mode: 'sua'; data: ChuongHocDetailDTO }
    >({ open: false });

    const [modalVideo, setModalVideo] = useState<
        { open: false } |
        { open: true; mode: 'tao'; maChuong: number } |
        { open: true; mode: 'sua'; maChuong: number; data: BaiHocVideoDetailDTO }
    >({ open: false });

    const toggleExpand = (maChuong: number) =>
        setChuongs(prev => prev.map(c =>
            c.maChuong === maChuong ? { ...c, expanded: !c.expanded } : c
        ));

    const handleXoaChuong = async (maChuong: number) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Xóa chương này?',
            text: 'Toàn bộ bài học trong chương cũng sẽ bị xóa.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (!isConfirmed) return;

        try {
            setDeleteLoading({ type: 'chuong', id: maChuong });
            await khoaHocCuaToiService.xoaChuong(maGiangVien, maChuong);
            setChuongs(prev => prev.filter(c => c.maChuong !== maChuong));
            onChuongChange?.();
            Swal.fire({ title: 'Đã xóa!', icon: 'success', timer: 1200, showConfirmButton: false });
        } catch {
            Swal.fire('Lỗi', 'Không thể xóa chương.', 'error');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleXoaVideo = async (maBaiHoc: number, maChuong: number) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Xóa bài học này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (!isConfirmed) return;

        try {
            setDeleteLoading({ type: 'video', id: maBaiHoc });
            await khoaHocCuaToiService.xoaVideo(maGiangVien, maBaiHoc);
            setChuongs(prev => prev.map(c =>
                c.maChuong === maChuong
                    ? { ...c, danhSachBaiHoc: c.danhSachBaiHoc.filter(b => b.maBaiHoc !== maBaiHoc) }
                    : c
            ));
            Swal.fire({ title: 'Đã xóa!', icon: 'success', timer: 1200, showConfirmButton: false });
        } catch {
            Swal.fire('Lỗi', 'Không thể xóa bài học.', 'error');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleChuongSuccess = (chuong: ChuongHocDetailDTO, isNew: boolean) => {
        setChuongs(prev =>
            isNew
                ? [...prev, { ...chuong, danhSachBaiHoc: [], expanded: true }]
                : prev.map(c => c.maChuong === chuong.maChuong ? { ...c, ...chuong } : c)
        );
        setModalChuong({ open: false });
        onChuongChange?.();
        Swal.fire({
            title: 'Thành công!',
            text: isNew ? 'Chương đã được thêm.' : 'Chương đã được cập nhật.',
            icon: 'success', timer: 1200, showConfirmButton: false,
        });
    };

    const handleVideoSuccess = (video: BaiHocVideoDetailDTO, maChuong: number, isNew: boolean) => {
        setChuongs(prev => prev.map(c => {
            if (c.maChuong !== maChuong) return c;
            return {
                ...c,
                danhSachBaiHoc: isNew
                    ? [...c.danhSachBaiHoc, video]
                    : c.danhSachBaiHoc.map(b => b.maBaiHoc === video.maBaiHoc ? video : b),
            };
        }));
        setModalVideo({ open: false });
        Swal.fire({
            title: 'Thành công!',
            text: isNew ? 'Bài học đã được thêm.' : 'Bài học đã được cập nhật.',
            icon: 'success', timer: 1200, showConfirmButton: false,
        });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{chuongs.length} chương</span>
                <button
                    className="btn-orange"
                    style={{ padding: '8px 18px', width: 'auto' }}
                    onClick={() => setModalChuong({ open: true, mode: 'tao' })}
                >
                    <FaPlus className="me-2" />Thêm chương
                </button>
            </div>

            {chuongs.length === 0 ? (
                <div className="khct-empty">
                    <i className="bi bi-collection khct-empty-icon" />
                    <p>Khóa học chưa có chương nào.</p>
                </div>
            ) : (
                <div className="chuong-list">
                    {[...chuongs].sort((a, b) => a.thuTu - b.thuTu).map(chuong => {
                        const isDeletingChuong = deleteLoading?.type === 'chuong' && deleteLoading.id === chuong.maChuong;

                        return (
                            <div key={chuong.maChuong} className="chuong-item">
                                <div className="chuong-header" onClick={() => toggleExpand(chuong.maChuong)}>
                                    <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                                        {chuong.expanded
                                            ? <FaChevronDown className="text-muted flex-shrink-0" />
                                            : <FaChevronRight className="text-muted flex-shrink-0" />
                                        }
                                        <span className="chuong-so">Chương {chuong.thuTu}</span>
                                        <span className="chuong-ten">{chuong.tenChuong}</span>
                                        <span className="chuong-bai-count">{chuong.danhSachBaiHoc.length} bài</span>
                                    </div>
                                    <div className="d-flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="btn btn-sm btn-outline-warning"
                                            title="Thêm video"
                                            onClick={() => setModalVideo({ open: true, mode: 'tao', maChuong: chuong.maChuong })}
                                        >
                                            <FaVideo />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            title="Sửa chương"
                                            onClick={() => setModalChuong({ open: true, mode: 'sua', data: chuong })}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            title="Xóa chương"
                                            disabled={isDeletingChuong}
                                            onClick={() => handleXoaChuong(chuong.maChuong)}
                                        >
                                            {isDeletingChuong
                                                ? <span className="spinner-border spinner-border-sm" />
                                                : <FaTrash />
                                            }
                                        </button>
                                    </div>
                                </div>

                                {chuong.expanded && (
                                    <div className="chuong-bai-list">
                                        {chuong.danhSachBaiHoc.length === 0 ? (
                                            <p className="text-muted small py-2 px-4">
                                                Chưa có bài học nào. Bấm <FaVideo className="mx-1 text-warning" /> để thêm.
                                            </p>
                                        ) : (
                                            [...chuong.danhSachBaiHoc].sort((a, b) => a.thuTu - b.thuTu).map(bai => {
                                                const isDeletingVideo = deleteLoading?.type === 'video' && deleteLoading.id === bai.maBaiHoc;
                                                return (
                                                    <div key={bai.maBaiHoc} className="bai-hoc-item">
                                                        <div className="d-flex align-items-center gap-2 min-w-0">
                                                            <FaVideo className="text-warning flex-shrink-0" />
                                                            <span className="bai-so text-muted">{bai.thuTu}.</span>
                                                            <span className="bai-ten">{bai.tieuDe}</span>
                                                            <span className="bai-tg text-muted small">{bai.thoiLuong} phút</span>
                                                        </div>
                                                        <div className="d-flex gap-2 flex-shrink-0">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                title="Sửa video"
                                                                onClick={() => setModalVideo({ open: true, mode: 'sua', maChuong: chuong.maChuong, data: bai })}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Xóa video"
                                                                disabled={isDeletingVideo}
                                                                onClick={() => handleXoaVideo(bai.maBaiHoc, chuong.maChuong)}
                                                            >
                                                                {isDeletingVideo
                                                                    ? <span className="spinner-border spinner-border-sm" />
                                                                    : <FaTrash />
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {modalChuong.open && (
                <ModalChuong
                    mode={modalChuong.mode}
                    maGiangVien={maGiangVien}
                    maKhoaHoc={maKhoaHoc}
                    duLieuCu={modalChuong.mode === 'sua' ? modalChuong.data : undefined}
                    onClose={() => setModalChuong({ open: false })}
                    onSuccess={handleChuongSuccess}
                />
            )}

            {modalVideo.open && (
                <ModalVideo
                    mode={modalVideo.mode}
                    maGiangVien={maGiangVien}
                    maChuong={modalVideo.maChuong}
                    duLieuCu={modalVideo.mode === 'sua' ? modalVideo.data : undefined}
                    onClose={() => setModalVideo({ open: false })}
                    onSuccess={(video, isNew) => handleVideoSuccess(video, modalVideo.maChuong, isNew)}
                />
            )}
        </div>
    );
};

export default PanelChuong;
