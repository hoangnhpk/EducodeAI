import axiosClient from '@/configs/axios';
import type {
    KhoaHocGiangVienListDTO,
    KhoaHocGiangVienDetailDTO,
    KhoaHocCreateUpdateDTO,
    ChuongHocCreateUpdateDTO,
    ThemChuongResponseDTO,
    BaiHocVideoCreateUpdateDTO,
    ThemVideoResponseDTO,
} from '@/pages/giang-vien/khoa-hoc-cua-toi/KhoaHocCuaToiDTO';

const BASE = '/api/giang-vien/khoa-hoc';

export const khoaHocCuaToiService = {

    // GET /api/giang-vien/khoa-hoc/{maGiangVien}
    async getDanhSach(maGiangVien: number): Promise<KhoaHocGiangVienListDTO[]> {
        return await axiosClient.get<KhoaHocGiangVienListDTO[]>(`${BASE}/${maGiangVien}`);
    },

    // GET /api/giang-vien/khoa-hoc/{maGiangVien}/{maKhoaHoc}
    async getChiTiet(maGiangVien: number, maKhoaHoc: number): Promise<KhoaHocGiangVienDetailDTO> {
        return await axiosClient.get<KhoaHocGiangVienDetailDTO>(`${BASE}/${maGiangVien}/${maKhoaHoc}`);
    },

    // POST /api/giang-vien/khoa-hoc/{maGiangVien}
    async taoKhoaHoc(maGiangVien: number, dto: KhoaHocCreateUpdateDTO): Promise<boolean> {
        return await axiosClient.post<boolean>(`${BASE}/${maGiangVien}`, dto);
    },

    // PUT /api/giang-vien/khoa-hoc/{maGiangVien}/{maKhoaHoc}
    async capNhatKhoaHoc(maGiangVien: number, maKhoaHoc: number, dto: KhoaHocCreateUpdateDTO): Promise<boolean> {
        return await axiosClient.put<boolean>(`${BASE}/${maGiangVien}/${maKhoaHoc}`, dto);
    },

    // DELETE /api/giang-vien/khoa-hoc/{maGiangVien}/{maKhoaHoc}
    async xoaKhoaHoc(maGiangVien: number, maKhoaHoc: number): Promise<boolean> {
        return await axiosClient.delete<boolean>(`${BASE}/${maGiangVien}/${maKhoaHoc}`);
    },

    // POST /api/giang-vien/khoa-hoc/{maGiangVien}/chuong/{maKhoaHoc}
    async themChuong(maGiangVien: number, maKhoaHoc: number, dto: ChuongHocCreateUpdateDTO): Promise<ThemChuongResponseDTO> {
        return await axiosClient.post<ThemChuongResponseDTO>(`${BASE}/${maGiangVien}/chuong/${maKhoaHoc}`, dto);
    },

    // PUT /api/giang-vien/khoa-hoc/{maGiangVien}/chuong/{maChuong}
    async capNhatChuong(maGiangVien: number, maChuong: number, dto: ChuongHocCreateUpdateDTO): Promise<boolean> {
        return await axiosClient.put<boolean>(`${BASE}/${maGiangVien}/chuong/${maChuong}`, dto);
    },

    // DELETE /api/giang-vien/khoa-hoc/{maGiangVien}/chuong/{maChuong}
    async xoaChuong(maGiangVien: number, maChuong: number): Promise<boolean> {
        return await axiosClient.delete<boolean>(`${BASE}/${maGiangVien}/chuong/${maChuong}`);
    },

    // POST /api/giang-vien/khoa-hoc/{maGiangVien}/video/{maChuong}
    async themVideo(maGiangVien: number, maChuong: number, dto: BaiHocVideoCreateUpdateDTO): Promise<ThemVideoResponseDTO> {
        return await axiosClient.post<ThemVideoResponseDTO>(`${BASE}/${maGiangVien}/video/${maChuong}`, dto);
    },

    // PUT /api/giang-vien/khoa-hoc/{maGiangVien}/video/{maBaiHoc}
    async capNhatVideo(maGiangVien: number, maBaiHoc: number, dto: BaiHocVideoCreateUpdateDTO): Promise<boolean> {
        return await axiosClient.put<boolean>(`${BASE}/${maGiangVien}/video/${maBaiHoc}`, dto);
    },

    // DELETE /api/giang-vien/khoa-hoc/{maGiangVien}/video/{maBaiHoc}
    async xoaVideo(maGiangVien: number, maBaiHoc: number): Promise<boolean> {
        return await axiosClient.delete<boolean>(`${BASE}/${maGiangVien}/video/${maBaiHoc}`);
    },
};
