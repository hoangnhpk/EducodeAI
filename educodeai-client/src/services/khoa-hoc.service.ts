import axios from 'axios';

const API_BASE_URL = 'http://localhost:5210/api/giang-vien/KhoaHocCuaToi';

export const khoaHocService = {
    getDanhSachKhoaHocGiangVien: async (maGiangVien: number) => {
        const res = await axios.get(`${API_BASE_URL}/danh-sach/${maGiangVien}`);
        return res.data;
    },
    getChiTietKhoaHoc: async (id: number) => {
        const res = await axios.get(`${API_BASE_URL}/chi-tiet/${id}`);
        return res.data;
    }
};