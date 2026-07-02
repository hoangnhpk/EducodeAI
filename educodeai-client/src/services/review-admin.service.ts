import axiosInstance from '@/configs/axios';
import type {
  PagedResult,
  ReviewFilterParams,
  ReviewItem,
  ReviewMutationResponse,
  ReviewServiceResult,
  ThongKeReview,
  ReviewCourseInfo,
} from '../pages/quan-tri-vien/quan-ly-binh-luan-review/components/ReviewAdmin.types';

const mockSeed: ReviewItem[] = [
  {
    id: 1001,
    maNguoiDung: 12,
    maKhoaHoc: 301,
    nguoiDung: {
      id: 12,
      ten: 'Nguyen Van An',
      email: 'an.nguyen@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+An',
    },
    khoaHoc: {
      id: 301,
      tenKhoaHoc: 'ReactJS tu co ban den nang cao',
      giangVien: 'Tran Gia Bao',
    },
    noiDung: 'Lo trinh hoc ro rang, de theo. Mong co them project tong hop cuoi khoa de luyen tap.',
    soSao: 5,
    ngayTao: '2026-04-12T08:15:00Z',
    trangThai: 'DaDuyet',
  },
  {
    id: 1002,
    maNguoiDung: 18,
    maKhoaHoc: 302,
    nguoiDung: {
      id: 18,
      ten: 'Tran Thi Mai',
      email: 'mai.tran@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+Mai',
    },
    khoaHoc: {
      id: 302,
      tenKhoaHoc: 'NodeJS Backend API',
      giangVien: 'Le Minh Thanh',
    },
    noiDung: 'Noi dung khoi dau tot, nhung phan JWT va refresh token can them vi du thuc te hon.',
    soSao: 4,
    ngayTao: '2026-04-11T10:40:00Z',
    trangThai: 'DaDuyet',
  },
  {
    id: 2001,
    maNguoiDung: 26,
    maKhoaHoc: 303,
    nguoiDung: {
      id: 26,
      ten: 'Le Minh Khoa',
      email: 'khoa.le@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Le+Minh+Khoa',
    },
    khoaHoc: {
      id: 303,
      tenKhoaHoc: 'Python co ban',
      giangVien: 'Nguyen Huu Dat',
    },
    noiDung: 'Lo trinh rat ro rang, bai tap vua suc. Mong co them project tong hop cuoi khoa.',
    soSao: 5,
    ngayTao: '2026-04-10T15:30:00Z',
    trangThai: 'DaDuyet',
  },
  {
    id: 2002,
    maNguoiDung: 30,
    maKhoaHoc: 304,
    nguoiDung: {
      id: 30,
      ten: 'Pham Gia Huy',
      email: 'huy.pham@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Pham+Gia+Huy',
    },
    khoaHoc: {
      id: 304,
      tenKhoaHoc: 'HTML CSS cho nguoi moi',
      giangVien: 'Vo Thi Thu',
    },
    noiDung: 'Noi dung on nhung chat luong hinh anh minh hoa chua dong deu, co bai rat mo.',
    soSao: 3,
    ngayTao: '2026-04-09T06:20:00Z',
    trangThai: 'DaDuyet',
  },
  {
    id: 2003,
    maNguoiDung: 31,
    maKhoaHoc: 305,
    nguoiDung: {
      id: 31,
      ten: 'Vo Bao Chau',
      email: 'chau.vo@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Vo+Bao+Chau',
    },
    khoaHoc: {
      id: 305,
      tenKhoaHoc: 'Java nang cao',
      giangVien: 'Doan Quoc Viet',
    },
    noiDung: 'Noi dung review khong phu hop va mang tinh cong kich, can loai bo khoi he thong.',
    soSao: 1,
    ngayTao: '2026-04-08T13:05:00Z',
    trangThai: 'TuChoi',
  },
];

let mockStore = [...mockSeed];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldFallbackToMock = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status === 404;

const calculateThongKe = (items: ReviewItem[]): ThongKeReview => {
  return {
    tongDanhGia: items.length,
    choDuyet: items.filter((item) => item.trangThai === 'ChoDuyet').length,
    daDuyet: items.filter((item) => item.trangThai === 'DaDuyet').length,
    tuChoi: items.filter((item) => item.trangThai === 'TuChoi').length,
    danhGiaTrungBinh: items.length > 0 ? items.reduce((sum, item) => sum + item.soSao, 0) / items.length : 0,
    phanBoSao: {
      star1: items.filter((item) => item.soSao === 1).length,
      star2: items.filter((item) => item.soSao === 2).length,
      star3: items.filter((item) => item.soSao === 3).length,
      star4: items.filter((item) => item.soSao === 4).length,
      star5: items.filter((item) => item.soSao === 5).length,
    },
  };
};

const applyFilters = (items: ReviewItem[], filters?: ReviewFilterParams) => {
  let result = [...items];

  if (filters?.trangThai && filters.trangThai !== 'TatCa') {
    result = result.filter((item) => item.trangThai === filters.trangThai);
  }

  if (filters?.soSao && filters.soSao !== 'TatCa') {
    result = result.filter((item) => item.soSao === filters.soSao);
  }

  if (filters?.maKhoaHoc && filters.maKhoaHoc !== 'TatCa') {
    result = result.filter((item) => item.maKhoaHoc === Number(filters.maKhoaHoc));
  }

  if (filters?.search?.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    result = result.filter((item) =>
      [
        item.nguoiDung.ten,
        item.nguoiDung.email,
        item.noiDung,
        item.khoaHoc.tenKhoaHoc,
        item.khoaHoc.giangVien,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }

  result.sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime());
  return result;
};

const paginate = (items: ReviewItem[], page = 1, pageSize = 10): PagedResult<ReviewItem> => ({
  data: items.slice((page - 1) * pageSize, page * pageSize),
  total: items.length,
  page,
  pageSize,
  totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
});

const buildMockReviews = async (
  filters?: ReviewFilterParams
): Promise<ReviewServiceResult<PagedResult<ReviewItem>>> => {
  await sleep(180);
  const filtered = applyFilters(mockStore, filters);
  return {
    source: 'mock',
    data: paginate(filtered, filters?.page || 1, filters?.pageSize || 10),
  };
};



const buildMockKhoaHocFilters = async (): Promise<ReviewServiceResult<ReviewCourseInfo[]>> => {
  await sleep(120);
  // Derive unique courses from store
  const uniqueCourses = mockStore.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.khoaHoc.id);
    if (!x) {
      return acc.concat([current.khoaHoc]);
    } else {
      return acc;
    }
  }, [] as ReviewCourseInfo[]);
  return { source: 'mock', data: uniqueCourses };
};

const updateMockStatus = async (
  id: number,
  trangThai: ReviewItem['trangThai']
): Promise<ReviewServiceResult<ReviewMutationResponse>> => {
  await sleep(120);
  mockStore = mockStore.map((item) => (item.id === id ? { ...item, trangThai } : item));
  return { source: 'mock', data: { success: true, message: 'Cap nhat thanh cong' } };
};

const removeMockReview = async (
  id: number
): Promise<ReviewServiceResult<ReviewMutationResponse>> => {
  await sleep(120);
  mockStore = mockStore.filter((item) => item.id !== id);
  return { source: 'mock', data: { success: true, message: 'Da xoa thanh cong' } };
};

export const reviewAdminService = {
  async getThongKe(maKhoaHoc?: number): Promise<ReviewServiceResult<ThongKeReview>> {
    try {
      const params = maKhoaHoc ? { maKhoaHoc } : undefined;
      const data = await axiosInstance.get<ThongKeReview>('api/admin/danh-gia/thong-ke', { params });
      return { source: 'api', data };
    } catch (error) {
      if (!shouldFallbackToMock(error)) throw error;
      const filteredStore = maKhoaHoc ? mockStore.filter(x => x.khoaHoc.id === maKhoaHoc) : mockStore;
      await sleep(120);
      return { source: 'mock', data: calculateThongKe(filteredStore) };
    }
  },

  async getReviews(
    params?: ReviewFilterParams
  ): Promise<ReviewServiceResult<PagedResult<ReviewItem>>> {
    try {
      const cleanParams: Record<string, any> = { ...params };
      if (cleanParams.trangThai === 'TatCa') delete cleanParams.trangThai;
      if (cleanParams.soSao === 'TatCa') delete cleanParams.soSao;
      if (cleanParams.maKhoaHoc === 'TatCa') delete cleanParams.maKhoaHoc;
      if (!cleanParams.search?.trim()) delete cleanParams.search;

      const data = await axiosInstance.get<PagedResult<ReviewItem>>('api/admin/danh-gia', { params: cleanParams });
      return { source: 'api', data };
    } catch (error) {
      if (!shouldFallbackToMock(error)) throw error;
      return buildMockReviews(params);
    }
  },

  async getKhoaHocFilters(): Promise<ReviewServiceResult<ReviewCourseInfo[]>> {
    try {
      const data = await axiosInstance.get<ReviewCourseInfo[]>('api/admin/danh-gia/khoa-hoc');
      return { source: 'api', data };
    } catch (error) {
      if (!shouldFallbackToMock(error)) throw error;
      return buildMockKhoaHocFilters();
    }
  },

  async approveReview(id: number): Promise<ReviewServiceResult<ReviewMutationResponse>> {
    try {
      const data = await axiosInstance.put<ReviewMutationResponse>(`api/admin/danh-gia/${id}/approve`);
      return { source: 'api', data };
    } catch (error) {
      if (!shouldFallbackToMock(error)) throw error;
      return updateMockStatus(id, 'DaDuyet');
    }
  },

  async rejectReview(id: number): Promise<ReviewServiceResult<ReviewMutationResponse>> {
    try {
      const data = await axiosInstance.put<ReviewMutationResponse>(`api/admin/danh-gia/${id}/reject`);
      return { source: 'api', data };
    } catch (error) {
      if (!shouldFallbackToMock(error)) throw error;
      return updateMockStatus(id, 'TuChoi');
    }
  },

  async deleteReview(id: number): Promise<ReviewServiceResult<ReviewMutationResponse>> {
    try {
      const data = await axiosInstance.delete<ReviewMutationResponse>(`api/admin/danh-gia/${id}`);
      return { source: 'api', data };
    } catch (error) {
      if (!shouldFallbackToMock(error)) throw error;
      return removeMockReview(id);
    }
  },

  /** Gọi Gemini AI duyệt hàng loạt tất cả review đang ChoDuyet */
  async aiDuyetHangLoat(): Promise<{
    tongXuLy: number;
    soDaDuyet: number;
    soTuChoi: number;
  }> {
    const data = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: { tongXuLy: number; soDaDuyet: number; soTuChoi: number };
    }>('api/admin/danh-gia/ai-duyet-hang-loat');
    return (data as any).data;
  },
};

export default reviewAdminService;
