import type {
  BinhLuan,
  DanhGia,
  ThongKeReview,
  ReviewFilterParams,
  PagedResult,
  ReviewItem,
} from '../pages/quan-tri-vien/quan-ly-binh-luan-review/components/Types';

// ==================== MOCK DATA ====================

const mockBinhLuan: BinhLuan[] = [
  {
    maBinhLuan: 1,
    maNguoiDung: 101,
    tenNguoiDung: 'Nguyễn Văn A',
    avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+A',
    maBaiHoc: 201,
    tenBaiHoc: 'Bài 1: Giới thiệu về Python',
    noiDung: 'Bài học rất hay và dễ hiểu! Cảm ơn thầy.',
    maBinhLuanCha: null,
    ngayTao: '2025-01-20T10:30:00',
    trangThai: 'ChoDuyet',
  },
  {
    maBinhLuan: 2,
    maNguoiDung: 102,
    tenNguoiDung: 'Trần Thị B',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tran+Thi+B',
    maBaiHoc: 202,
    tenBaiHoc: 'Bài 2: Biến và kiểu dữ liệu',
    noiDung: 'Mình chưa hiểu rõ phần kiểu dữ liệu, thầy có thể giải thích thêm không ạ?',
    maBinhLuanCha: null,
    ngayTao: '2025-01-21T14:20:00',
    trangThai: 'DaDuyet',
  },
  {
    maBinhLuan: 3,
    maNguoiDung: 103,
    tenNguoiDung: 'Lê Minh C',
    avatarUrl: 'https://ui-avatars.com/api/?name=Le+Minh+C',
    maBaiHoc: 203,
    tenBaiHoc: 'Bài 3: Vòng lặp',
    noiDung: 'Spam link kiếm tiền online tại đây...',
    maBinhLuanCha: null,
    ngayTao: '2025-01-22T09:15:00',
    trangThai: 'TuChoi',
  },
];

const mockDanhGia: DanhGia[] = [
  {
    maDanhGia: 1,
    maNguoiDung: 101,
    tenNguoiDung: 'Nguyễn Văn A',
    avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+A',
    maKhoaHoc: 301,
    tenKhoaHoc: 'Khóa học Python cơ bản',
    soSao: 5,
    nhanXet: 'Khóa học xuất sắc! Nội dung chi tiết, dễ hiểu. Rất đáng để học.',
    ngayDanhGia: '2025-01-23T16:45:00',
    trangThai: 'DaDuyet',
  },
  {
    maDanhGia: 2,
    maNguoiDung: 102,
    tenNguoiDung: 'Trần Thị B',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tran+Thi+B',
    maKhoaHoc: 302,
    tenKhoaHoc: 'Khóa học JavaScript nâng cao',
    soSao: 4,
    nhanXet: 'Khóa học tốt nhưng hơi khó với người mới bắt đầu.',
    ngayDanhGia: '2025-01-24T11:30:00',
    trangThai: 'ChoDuyet',
  },
  {
    maDanhGia: 3,
    maNguoiDung: 103,
    tenNguoiDung: 'Lê Minh C',
    avatarUrl: 'https://ui-avatars.com/api/?name=Le+Minh+C',
    maKhoaHoc: 303,
    tenKhoaHoc: 'Khóa học React từ đầu',
    soSao: 1,
    nhanXet: 'Khóa học quá tệ, lãng phí tiền!!!',
    ngayDanhGia: '2025-01-25T08:20:00',
    trangThai: 'TuChoi',
  },
  {
    maDanhGia: 4,
    maNguoiDung: 104,
    tenNguoiDung: 'Phạm Thị D',
    avatarUrl: 'https://ui-avatars.com/api/?name=Pham+Thi+D',
    maKhoaHoc: 301,
    tenKhoaHoc: 'Khóa học Python cơ bản',
    soSao: 5,
    nhanXet: 'Thầy giảng rất nhiệt tình, bài tập thực hành hay.',
    ngayDanhGia: '2025-01-26T13:10:00',
    trangThai: 'ChoDuyet',
  },
];

// ==================== SERVICE FUNCTIONS ====================

export const reviewService = {
  /**
   * Lấy thống kê tổng quan
   */
  getThongKe: async (): Promise<ThongKeReview> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const tongBinhLuan = mockBinhLuan.length;
    const tongDanhGia = mockDanhGia.length;

    const choDuyet = [
      ...mockBinhLuan.filter((x) => x.trangThai === 'ChoDuyet'),
      ...mockDanhGia.filter((x) => x.trangThai === 'ChoDuyet'),
    ].length;

    const daDuyet = [
      ...mockBinhLuan.filter((x) => x.trangThai === 'DaDuyet'),
      ...mockDanhGia.filter((x) => x.trangThai === 'DaDuyet'),
    ].length;

    const tuChoi = [
      ...mockBinhLuan.filter((x) => x.trangThai === 'TuChoi'),
      ...mockDanhGia.filter((x) => x.trangThai === 'TuChoi'),
    ].length;

    const danhGiaTrungBinh =
      mockDanhGia.reduce((sum, x) => sum + x.soSao, 0) / mockDanhGia.length;

    const phanBoSao = {
      star1: mockDanhGia.filter((x) => x.soSao === 1).length,
      star2: mockDanhGia.filter((x) => x.soSao === 2).length,
      star3: mockDanhGia.filter((x) => x.soSao === 3).length,
      star4: mockDanhGia.filter((x) => x.soSao === 4).length,
      star5: mockDanhGia.filter((x) => x.soSao === 5).length,
    };

    return {
      tongBinhLuan,
      tongDanhGia,
      choDuyet,
      daDuyet,
      tuChoi,
      danhGiaTrungBinh,
      phanBoSao,
    };
  },

  /**
   * Lấy danh sách review (bình luận + đánh giá)
   */
  getReviews: async (
    params?: ReviewFilterParams
  ): Promise<PagedResult<ReviewItem>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Convert to ReviewItem
    let allItems: ReviewItem[] = [];

    if (!params?.loai || params.loai === 'TatCa' || params.loai === 'BinhLuan') {
      const binhLuanItems: ReviewItem[] = mockBinhLuan.map((x) => ({
        id: x.maBinhLuan,
        loai: 'BinhLuan' as const,
        nguoiDung: {
          id: x.maNguoiDung,
          ten: x.tenNguoiDung,
          avatar: x.avatarUrl,
        },
        tieuDe: x.tenBaiHoc,
        noiDung: x.noiDung,
        ngayTao: x.ngayTao,
        trangThai: x.trangThai,
      }));
      allItems = [...allItems, ...binhLuanItems];
    }

    if (!params?.loai || params.loai === 'TatCa' || params.loai === 'DanhGia') {
      const danhGiaItems: ReviewItem[] = mockDanhGia.map((x) => ({
        id: x.maDanhGia,
        loai: 'DanhGia' as const,
        nguoiDung: {
          id: x.maNguoiDung,
          ten: x.tenNguoiDung,
          avatar: x.avatarUrl,
        },
        tieuDe: x.tenKhoaHoc,
        noiDung: x.nhanXet,
        soSao: x.soSao,
        ngayTao: x.ngayDanhGia,
        trangThai: x.trangThai,
      }));
      allItems = [...allItems, ...danhGiaItems];
    }

    // Filter by status
    if (params?.trangThai && params.trangThai !== 'TatCa') {
      allItems = allItems.filter((x) => x.trangThai === params.trangThai);
    }

    // Filter by stars (only for DanhGia)
    if (params?.soSao && params.soSao !== 'TatCa') {
      allItems = allItems.filter(
        (x) => x.loai === 'DanhGia' && x.soSao === params.soSao
      );
    }

    // Filter by search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      allItems = allItems.filter(
        (x) =>
          x.nguoiDung.ten.toLowerCase().includes(searchLower) ||
          x.tieuDe.toLowerCase().includes(searchLower) ||
          x.noiDung.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    allItems.sort(
      (a, b) =>
        new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
    );

    // Pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      total: allItems.length,
      page,
      pageSize,
      totalPages: Math.ceil(allItems.length / pageSize),
    };
  },

  /**
   * Duyệt review
   */
  approveReview: async (id: number, loai: 'BinhLuan' | 'DanhGia'): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (loai === 'BinhLuan') {
      const item = mockBinhLuan.find((x) => x.maBinhLuan === id);
      if (item) item.trangThai = 'DaDuyet';
    } else {
      const item = mockDanhGia.find((x) => x.maDanhGia === id);
      if (item) item.trangThai = 'DaDuyet';
    }
  },

  /**
   * Từ chối review
   */
  rejectReview: async (id: number, loai: 'BinhLuan' | 'DanhGia'): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (loai === 'BinhLuan') {
      const item = mockBinhLuan.find((x) => x.maBinhLuan === id);
      if (item) item.trangThai = 'TuChoi';
    } else {
      const item = mockDanhGia.find((x) => x.maDanhGia === id);
      if (item) item.trangThai = 'TuChoi';
    }
  },

  /**
   * Xóa review
   */
  deleteReview: async (id: number, loai: 'BinhLuan' | 'DanhGia'): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (loai === 'BinhLuan') {
      const index = mockBinhLuan.findIndex((x) => x.maBinhLuan === id);
      if (index !== -1) mockBinhLuan.splice(index, 1);
    } else {
      const index = mockDanhGia.findIndex((x) => x.maDanhGia === id);
      if (index !== -1) mockDanhGia.splice(index, 1);
    }
  },
};

export default reviewService;