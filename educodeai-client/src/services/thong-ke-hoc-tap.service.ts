import axios from 'axios';
import type {
  ThongKeOverview,
  TrangThaiHocVien,
  HocVien,
  PagedResult,
  HocVienParams,
} from '../pages/giang-vien/thong-ke-hoc-tap/components/Types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5210';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/giang-vien/thong-ke`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Token expired or invalid');
    }
    return Promise.reject(error);
  }
);

// ================== API FUNCTIONS ==================

export const thongKeHocTapService = {
  /**
   * Lấy thống kê tổng quan
   * GET /api/giang-vien/thong-ke/overview
   */
  getOverview: async (): Promise<ThongKeOverview> => {
    const response = await apiClient.get<ThongKeOverview>('/overview');
    return response.data;
  },

  /**
   * Lấy trạng thái học viên (cho biểu đồ)
   * GET /api/giang-vien/thong-ke/trang-thai-hoc-vien
   */
  getTrangThaiHocVien: async (): Promise<TrangThaiHocVien[]> => {
    const response = await apiClient.get<TrangThaiHocVien[]>('/trang-thai-hoc-vien');
    return response.data;
  },

  /**
   * Lấy danh sách học viên (có phân trang và search)
   * GET /api/giang-vien/thong-ke/hoc-vien
   */
  getHocVien: async (params?: HocVienParams): Promise<PagedResult<HocVien>> => {
    const response = await apiClient.get<PagedResult<HocVien>>('/hoc-vien', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        search: params?.search || undefined,
      },
    });
    return response.data;
  },
};

export default thongKeHocTapService;