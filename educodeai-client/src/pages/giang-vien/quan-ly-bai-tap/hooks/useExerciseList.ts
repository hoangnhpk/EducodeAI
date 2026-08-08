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
    const [chiTietBaiTap, setChiTietBaiTap] = useState<any>(null);
    const [modalType, setModalType] = useState<'Quiz' | 'IDE' | null>(null);

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
                    Swal.fire({ icon: 'error', text: "Lỗi hệ thống khi xóa." });
                }
            }
        });
    };

    const handleViewClick = async (baiTap: DanhSachBaiTapDTO) => {
        const maBaiTap = baiTap.maBaiTap;
        const exerciseType = (baiTap.loaiBaiTap || '').trim().toUpperCase();
        const isIde = exerciseType === 'IDE' || exerciseType === 'PRACTICE' || exerciseType.includes('THỰC HÀNH');
        console.log('[ExerciseModal] Fetching exercise:', { id: maBaiTap, type: baiTap.loaiBaiTap });
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        setModalType(isIde ? 'IDE' : 'Quiz');
        setChiTietBaiTap(null);

        try {
            let response;
            if (isIde) {
                response = await BaiTapThucHanhService.getChiTiet(maBaiTap);
                const payload = response?.data ?? response;
                console.log('[ExerciseModal] IDE detail response:', payload);
                const ideData = payload as any;
                setChiTietBaiTap({
                    metadata: { title: ideData?.metadata?.title ?? ideData?.TieuDe ?? baiTap.tenBaiTap, difficulty: ideData?.metadata?.difficulty ?? ideData?.MucDo ?? 'Chưa xác định', language: ideData?.metadata?.language ?? ideData?.NgonNgu ?? 'Chưa xác định' },
                    problemContent: { description: ideData?.problemContent?.description ?? ideData?.MoTaDeBai ?? '' },
                    hints: ideData?.hints ?? [],
                    solution: { code: ideData?.solution?.code ?? ideData?.LoiGiaiMau ?? '', explanation: ideData?.solution?.explanation ?? ideData?.GoiY ?? '' },
                    evaluation: { testCases: ideData?.evaluation?.testCases ?? ideData?.DanhSachTestCase ?? [] },
                    system: ideData?.system ?? { version: '', generatedAt: '', generatedBy: '', validated: false }
                });
            } else {
                const response = await BaiTapService.getChiTietBaiTap(maBaiTap);
                const payload = response?.data ?? response;
                console.log('[ExerciseModal] Quiz detail response:', payload);
                const rawData = payload?.duLieuCauHoiJSON || payload?.duLieuCauHoi || payload?.danhSachCauHoi || '[]';

                const parsedData = typeof rawData === 'string' ? JSON.parse(rawData || '[]') : rawData;
                const danhSachCauHoi = Array.isArray(parsedData) ? parsedData : parsedData?.['C\u00e2u h\u1ecfi'] || parsedData?.cauHoi || parsedData?.questions || [];

                setChiTietBaiTap({
                    ...payload,
                    tenBaiTap: baiTap.tenBaiTap,
                    tenKhoaHoc: baiTap.tenKhoaHoc,
                    tenChuong: baiTap.tenChuong,
                    tenBaiHoc: baiTap.tenBaiHoc,
                    danhSachCauHoi,
                    loaiBaiTap: 'Quiz'
                });
            }
        } catch (error: any) {
            console.error('[ExerciseModal] Failed to fetch detail:', { id: maBaiTap, type: baiTap.loaiBaiTap, status: error?.response?.status, url: error?.config?.url, response: error?.response?.data, error });
            Swal.fire({ icon: 'error', text: 'Lỗi tải chi tiết bài tập!' });
            setIsModalOpen(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setChiTietBaiTap(null);
        setModalType(null);
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
        isModalOpen, closeModal, isLoadingDetails, chiTietBaiTap, modalType
    };

    return {
        isLoading,
        danhSachHienThi,
        filters,
        pagination,
        modalState,
        fetchDanhSach,
        handleDeleteClick,
        handleViewClick
    };
};
