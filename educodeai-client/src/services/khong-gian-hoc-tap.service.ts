import axiosClient from '@/configs/axios';

export interface KhongGianHocTapItem {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  hinhAnh: string | null;
  tongSoBaiHoc: number;
  soBaiDaHoc: number;
  phanTramTienDo: number;
  slug: string;
  ngayDangKy: string;
  trangThaiDangKy: string | null;
}

export async function layDanhSachKhongGianHocTap(): Promise<KhongGianHocTapItem[]> {
  const body = await axiosClient.get<{ success: boolean; data: KhongGianHocTapItem[] }>(
    '/api/hoc-vien/khong-gian-hoc-tap'
  );
  return body.data ?? [];
}
