import { useMemo, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BaiTapService } from '@/services/bai-tap.service';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';
import type { DanhSachBaiTapDTO } from '../types';

export const useExerciseList = () => {
    const [danhSachBaiTap, setDanhSachBaiTap] = useState<DanhSachBaiTapDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [tuKhoa, setTuKhoa] = useState('');
    const [locLoai, setLocLoai] = useState('TatCa');
    const [locTrangThai, setLocTrangThai] = useState('TatCa');
    const [locKhoaHoc, setLocKhoaHoc] = useState('TatCa');
    const [trangHienTai, setTrangHienTai] = useState(1);
    const kichThuocTrang = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [chiTietQuiz, setChiTietQuiz] = useState<any>(null);

    const fetchDanhSach = async () => {
        try {
            setIsLoading(true);
            const data = await BaiTapService.getDanhSachByGiangVien();
            setDanhSachBaiTap(data || []);
        } catch (error) {
            console.error("Lỗi tải danh sách bài tập:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDanhSach();
    }, []);

    const handleDeleteClick = async (maBaiTap: number, tenBaiTap: string) => {
        Swal.fire({
            title: `Bạn có chắc muốn xoá bài tập "${tenBaiTap}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then(async result => {
            if (result.isConfirmed) {
                try {
                    const response = await BaiTapService.deleteBaiTap(maBaiTap);
                    if (response.success !== false) {
                        Swal.fire({ icon: 'success', text: `Đã xóa thành công!`, timer: 1500, showConfirmButton: false });
                        setDanhSachBaiTap(prev => prev.filter(bt => bt.maBaiTap !== maBaiTap));
                    } else {
                        Swal.fire({ icon: 'error', text: "Có lỗi xảy ra: " + response.message });
                    }
                } catch (error: any) {
                    const message = error?.response?.data?.message || error?.message || 'Lỗi hệ thống khi xóa.';
                    Swal.fire({ icon: 'error', text: message });
                }
            }
        });
    };

    const handleViewClick = async (maBaiTap: number) => {
        setIsModalOpen(true);
        setIsLoadingDetails(true);

        const baiTap = danhSachBaiTap.find(b => b.maBaiTap === maBaiTap);
        if (!baiTap) return;

        try {
            let response;
            if (baiTap.loaiBaiTap === 'IDE') {
                response = await BaiTapThucHanhService.getChiTiet(maBaiTap);
                setChiTietQuiz({ ...(response?.data ?? response), loaiBaiTap: 'IDE' });
            } else {
                response = await BaiTapService.getChiTietBaiTap(maBaiTap);
                const payload = response?.data ?? response;
                let danhSachCauHoi: any[] = [];
                const rawData = payload?.duLieuCauHoiJSON || payload?.duLieuCauHoi || payload?.danhSachCauHoi || '[]';

                const parsedData = typeof rawData === 'string' ? JSON.parse(rawData || '[]') : rawData;
                if (Array.isArray(parsedData)) {
                    danhSachCauHoi = parsedData;
                } else if (parsedData && typeof parsedData === 'object') {
                    danhSachCauHoi = parsedData['C\u00e2u h\u1ecfi'] || parsedData['C\u00c3\u00a2u h\u00e1\u00bb\u008fi'] || parsedData.cauHoi || parsedData.questions || [];
                }

                setChiTietQuiz({
                    ...payload,
                    tenBaiTap: baiTap.tenBaiTap,
                    tenKhoaHoc: baiTap.tenKhoaHoc,
                    tenChuong: baiTap.tenChuong,
                    tenBaiHoc: baiTap.tenBaiHoc,
                    danhSachCauHoi,
                    loaiBaiTap: 'Quiz'
                });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', text: "Lỗi tải chi tiết bài tập!" });
            setIsModalOpen(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setChiTietQuiz(null);
    };

    const handleUpdatePractice = async (updatedData: any) => {
        const maBaiTap = updatedData?.maBaiTap;
        const maBaiHoc = updatedData?.maBaiHoc;
        if (!maBaiTap || !maBaiHoc) {
            Swal.fire({ icon: 'error', text: 'Không xác định được bài tập hoặc bài học để cập nhật.' });
            return;
        }

        try {
            const response = await BaiTapThucHanhService.updateBaiTap(maBaiTap, {
                ...updatedData,
                maBaiHoc,
            });
            if (response?.success !== false) {
                Swal.fire({ icon: 'success', text: 'Đã cập nhật bài tập thành công!', timer: 1500, showConfirmButton: false });
                setChiTietQuiz({ ...updatedData, loaiBaiTap: 'IDE' });
                await fetchDanhSach();
            } else {
                Swal.fire({ icon: 'error', text: response?.message || 'Không thể cập nhật bài tập.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', text: 'Lỗi hệ thống khi cập nhật bài tập.' });
        }
    };

    const danhSachKhoaHocFilter = useMemo(() => {
        return Array.from(new Set(danhSachBaiTap.map(x => x.tenKhoaHoc).filter(Boolean)));
    }, [danhSachBaiTap]);

    const danhSachDaLoc = useMemo(() => {
        const keyword = tuKhoa.trim().toLowerCase();
        return danhSachBaiTap.filter(bt => {
            const khopTuKhoa = !keyword || [bt.tenBaiTap, bt.tenKhoaHoc, bt.tenChuong, bt.tenBaiHoc]
                .some(v => (v || '').toLowerCase().includes(keyword));
            const khopLoai = locLoai === 'TatCa' || bt.loaiBaiTap === locLoai;
            const khopTrangThai = locTrangThai === 'TatCa' || bt.trangThai === locTrangThai;
            const khopKhoaHoc = locKhoaHoc === 'TatCa' || bt.tenKhoaHoc === locKhoaHoc;
            return khopTuKhoa && khopLoai && khopTrangThai && khopKhoaHoc;
        });
    }, [danhSachBaiTap, tuKhoa, locLoai, locTrangThai, locKhoaHoc]);

    const tongSoTrang = Math.max(1, Math.ceil(danhSachDaLoc.length / kichThuocTrang));
    const danhSachHienThi = danhSachDaLoc.slice((trangHienTai - 1) * kichThuocTrang, trangHienTai * kichThuocTrang);

    useEffect(() => {
        setTrangHienTai(1);
    }, [tuKhoa, locLoai, locTrangThai, locKhoaHoc]);

    const filters = {
        tuKhoa, setTuKhoa,
        locLoai, setLocLoai,
        locTrangThai, setLocTrangThai,
        locKhoaHoc, setLocKhoaHoc,
        danhSachKhoaHocFilter
    };

    const pagination = {
        trangHienTai, setTrangHienTai, tongSoTrang
    };

    const modalState = {
        isModalOpen, closeModal, isLoadingDetails, chiTietQuiz
    };

    return {
        isLoading,
        danhSachHienThi,
        filters,
        pagination,
        modalState,
        fetchDanhSach,
        handleDeleteClick,
        handleViewClick,
        handleUpdatePractice
    };
};
