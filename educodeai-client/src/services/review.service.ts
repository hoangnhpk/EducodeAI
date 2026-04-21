import type {
  BinhLuan,
  DanhGia,
  ThongKeReview,
  ReviewFilterParams,
  PagedResult,
  ReviewItem,
} from '../pages/quan-tri-vien/quan-ly-binh-luan-review/components/Types';

// ==================== MOCK DATA ====================

const mockBinhLuan: (BinhLuan & { maKhoaHoc: number })[] = [
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
    maKhoaHoc: 301,
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
    maKhoaHoc: 301,
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
    maKhoaHoc: 301,
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    maBinhLuan: 10 + i,
    maNguoiDung: 200 + i,
    tenNguoiDung: `Học viên ${i + 1}`,
    avatarUrl: `https://ui-avatars.com/api/?name=Student+${i + 1}`,
    maBaiHoc: 201 + (i % 3),
    tenBaiHoc: `Bài học nâng cao phần ${i + 1}`,
    noiDung: `Nội dung phản hồi thứ ${i + 1} của học viên về bài học này.`,
    maBinhLuanCha: null,
    ngayTao: new Date(Date.now() - i * 86400000).toISOString(),
    trangThai: (i % 3 === 0 ? 'ChoDuyet' : 'DaDuyet') as any,
    maKhoaHoc: 301 + (i % 3),
  }))
];

const mockDanhGia: DanhGia[] = [
  ...Array.from({ length: 15 }, (_, i) => ({
    maDanhGia: 1 + i,
    maNguoiDung: 101 + i,
    tenNguoiDung: `Người dùng ${i + 1}`,
    avatarUrl: `https://ui-avatars.com/api/?name=User+${i + 1}`,
    maKhoaHoc: 301 + (i % 3),
    tenKhoaHoc: i % 3 === 0 ? 'Khóa học Python cơ bản' : (i % 3 === 1 ? 'Khóa học JavaScript nâng cao' : 'Khóa học React từ đầu'),
    soSao: 3 + (i % 3),
    nhanXet: `Đây là đánh giá thứ ${i + 1} của tôi về khóa học này. Rất bổ ích!`,
    ngayDanhGia: new Date(Date.now() - i * 43200000).toISOString(),
    trangThai: (i % 5 === 0 ? 'ChoDuyet' : 'DaDuyet') as any,
  }))
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

    const choDuyetArr = [
      ...mockBinhLuan.filter((x) => x.trangThai === 'ChoDuyet'),
      ...mockDanhGia.filter((x) => x.trangThai === 'ChoDuyet'),
    ];

    const daDuyetArr = [
      ...mockBinhLuan.filter((x) => x.trangThai === 'DaDuyet'),
      ...mockDanhGia.filter((x) => x.trangThai === 'DaDuyet'),
    ];

    const tuChoiArr = [
      ...mockBinhLuan.filter((x) => x.trangThai === 'TuChoi'),
      ...mockDanhGia.filter((x) => x.trangThai === 'TuChoi'),
    ];

    const danhGiaTrungBinh =
      mockDanhGia.reduce((sum, x) => sum + x.soSao, 0) / (mockDanhGia.length || 1);

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
      choDuyet: choDuyetArr.length,
      daDuyet: daDuyetArr.length,
      tuChoi: tuChoiArr.length,
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
    let allItems: (ReviewItem & { maKhoaHoc?: number })[] = [];

    if (!params?.loai || params.loai === 'TatCa' || params.loai === 'BinhLuan') {
      const binhLuanItems = mockBinhLuan.map((x) => ({
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
        maKhoaHoc: x.maKhoaHoc,
      }));
      allItems = [...allItems, ...binhLuanItems];
    }

    if (!params?.loai || params.loai === 'TatCa' || params.loai === 'DanhGia') {
      const danhGiaItems = mockDanhGia.map((x) => ({
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
        maKhoaHoc: x.maKhoaHoc,
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

    // Filter by course
    if (params?.maKhoaHoc && params.maKhoaHoc !== 'TatCa') {
      allItems = allItems.filter((x) => x.maKhoaHoc === params.maKhoaHoc);
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
      data: paginatedItems as ReviewItem[],
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
