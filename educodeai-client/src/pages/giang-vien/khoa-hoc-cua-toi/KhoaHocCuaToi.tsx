import { useState, useEffect, useCallback } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { KhoaHocGiangVienListDTO } from './KhoaHocCuaToiDTO';
import DanhSachKhoaHoc from './components/DanhSachKhoaHoc';
import ChiTietKhoaHoc from './components/ChiTietKhoaHoc';
import ModalKhoaHoc from './components/ModalKhoaHoc';
import './KhoaHocCuaToi.css';
import Swal from 'sweetalert2';

const getGiangVienId = (): number => {
    try {
        const raw = localStorage.getItem('user_info');
        if (raw) {
            const user = JSON.parse(raw);
            return user.maNguoiDung ?? user.id ?? 1;
        }
    } catch {}
    return 1;
};

type View = 'danh-sach' | 'chi-tiet';

const KhoaHocCuaToi = () => {
    const maGiangVien = getGiangVienId();

    const [view, setView] = useState<View>('danh-sach');
    const [danhSach, setDanhSach] = useState<KhoaHocGiangVienListDTO[]>([]);
    const [maKhoaHocSelected, setMaKhoaHocSelected] = useState<number | null>(null);
    const [showModalTao, setShowModalTao] = useState(false);

    const [loadingList, setLoadingList] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

    const loadDanhSach = useCallback(async () => {
        try {
            setLoadingList(true);
            const data = await khoaHocCuaToiService.getDanhSach(maGiangVien);
            setDanhSach(data);
        } catch {
            Swal.fire('Lỗi', 'Không thể tải danh sách khóa học', 'error');
        } finally {
            setLoadingList(false);
        }
    }, [maGiangVien]);

    useEffect(() => { loadDanhSach(); }, [loadDanhSach]);

    const handleXemChiTiet = (maKhoaHoc: number) => {
        setMaKhoaHocSelected(maKhoaHoc);
        setView('chi-tiet');
    };

    const handleQuayLai = () => {
        setView('danh-sach');
        setMaKhoaHocSelected(null);
        loadDanhSach();
    };

    const handleXoaKhoaHoc = async (maKhoaHoc: number) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: 'Khóa học sẽ bị xóa vĩnh viễn cùng toàn bộ chương và bài học.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });
        if (!isConfirmed) return;

        try {
            setLoadingDelete(maKhoaHoc);
            await khoaHocCuaToiService.xoaKhoaHoc(maGiangVien, maKhoaHoc);
            setDanhSach(prev => prev.filter(k => k.maKhoaHoc !== maKhoaHoc));
            Swal.fire('Đã xóa!', 'Khóa học đã được xóa.', 'success');
        } catch {
            Swal.fire('Lỗi', 'Không thể xóa khóa học này.', 'error');
        } finally {
            setLoadingDelete(null);
        }
    };

    const handleTaoSuccess = () => {
        setShowModalTao(false);
        loadDanhSach();
        Swal.fire({ title: 'Thành công!', text: 'Khóa học đã được tạo.', icon: 'success', timer: 1500, showConfirmButton: false });
    };


    if (loadingList) {
        return (
            <div className="khct-loading">
                <div className="spinner-border text-warning" role="status" />
                <p className="mt-3 text-muted">Đang tải khóa học...</p>
            </div>
        );
    }

    return (
        <div className="khct-wrapper">
            {view === 'danh-sach' && (
                <div className="fade-in">
                    <div className="khct-page-header">
                        <div>
                            <h2 className="khct-page-title">Khóa học của tôi</h2>
                            <p className="text-muted mb-0">Quản lý toàn bộ khóa học bạn đã tạo</p>
                        </div>
                        <button className="btn-orange" onClick={() => setShowModalTao(true)}>
                            <i className="bi bi-plus-lg me-2" />Tạo khóa học mới
                        </button>
                    </div>

                    <div className="khct-quick-stats">
                        <div className="khct-stat-item">
                            <span className="khct-stat-num">{danhSach.length}</span>
                            <span className="khct-stat-label">Khóa học</span>
                        </div>
                        <div className="khct-stat-item">
                            <span className="khct-stat-num">
                                {danhSach.reduce((s, k) => s + k.soHocVien, 0)}
                            </span>
                            <span className="khct-stat-label">Tổng học viên</span>
                        </div>
                        <div className="khct-stat-item">
                            <span className="khct-stat-num text-warning">
                                {danhSach.length > 0
                                    ? (danhSach.reduce((s, k) => s + k.diemDanhGiaTB, 0) / danhSach.length).toFixed(1): '0'}
                            </span>
                            <span className="khct-stat-label">Đánh giá TB</span>
                        </div>
                    </div>

                    {danhSach.length === 0 ? (
                        <div className="khct-empty">
                            <i className="bi bi-journal-x khct-empty-icon" />
                            <p>Bạn chưa có khóa học nào.</p>
                            <button className="btn-orange" onClick={() => setShowModalTao(true)}>
                                Tạo khóa học đầu tiên
                            </button>
                        </div>
                    ) : (
                        <DanhSachKhoaHoc
                            duLieu={danhSach}
                            loadingDeleteId={loadingDelete}
                            onXemChiTiet={handleXemChiTiet}
                            onXoa={handleXoaKhoaHoc}
                        />
                    )}
                </div>
            )}

            {view === 'chi-tiet' && maKhoaHocSelected !== null && (
                <div className="fade-in">
                    <ChiTietKhoaHoc
                        maGiangVien={maGiangVien}
                        maKhoaHoc={maKhoaHocSelected}
                        onQuayLai={handleQuayLai}
                    />
                </div>
            )}

            {showModalTao && (
                <ModalKhoaHoc
                    mode="tao"
                    maGiangVien={maGiangVien}
                    onClose={() => setShowModalTao(false)}
                    onSuccess={handleTaoSuccess}
                />
            )}
        </div>
    );
};

export default KhoaHocCuaToi;
