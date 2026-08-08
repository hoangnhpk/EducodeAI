import axiosClient from '@/configs/axios';

export interface GuiMailHangLoatRequest {
  maKhoaHoc: number;
  danhSachMaNguoiDung: number[];
  tieuDe: string;
  noiDungHtml: string;
}

export interface GuiMailHangLoatResult {
  success: boolean;
  message: string;
  soLuongDaXepHang?: number;
}

// Interceptor của axiosClient trả thẳng response.data (body), backend bọc { success, data }
// nên ở đây lấy tiếp trường `data` bên trong.
const layData = <T>(res: any, fallback: T): T => (res?.data ?? fallback) as T;

const lopHocService = {
  async layDanhSachKhoa(): Promise<any[]> {
    const res = await axiosClient.get('/api/giang-vien/lop-hoc/danh-sach-khoa');
    return layData<any[]>(res, []);
  },

  async layDanhSachHocVien(maKhoaHoc?: number, search?: string): Promise<any[]> {
    const params: Record<string, string | number> = {};
    if (maKhoaHoc && maKhoaHoc > 0) params.maKhoaHoc = maKhoaHoc;
    if (search) params.search = search;
    const res = await axiosClient.get('/api/giang-vien/lop-hoc/danh-sach-hoc-vien', { params });
    return layData<any[]>(res, []);
  },

  async layTienDoChiTiet(maKhoaHoc: number, maNguoiDung: number): Promise<any | null> {
    const res = await axiosClient.get(
      `/api/giang-vien/lop-hoc/${maKhoaHoc}/hoc-vien/${maNguoiDung}/tien-do-chi-tiet`
    );
    return layData<any | null>(res, null);
  },

  async layCacKhoaHocCuaHocVien(maNguoiDung: number): Promise<any[]> {
    const res = await axiosClient.get(
      `/api/giang-vien/lop-hoc/hoc-vien/${maNguoiDung}/khoa-hoc`
    );
    return layData<any[]>(res, []);
  },

  async guiMailHangLoat(payload: GuiMailHangLoatRequest): Promise<GuiMailHangLoatResult> {
    const res: any = await axiosClient.post('/api/giang-vien/lop-hoc/gui-mail-hang-loat', payload);
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'Đã xếp hàng gửi email.',
      soLuongDaXepHang: res?.soLuongDaXepHang,
    };
  },
};

export default lopHocService;
