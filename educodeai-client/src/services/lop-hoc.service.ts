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

const lopHocService = {
  async guiMailHangLoat(payload: GuiMailHangLoatRequest): Promise<GuiMailHangLoatResult> {
    const res = await axiosClient.post('/api/giang-vien/lop-hoc/gui-mail-hang-loat', payload);
    return {
      success: res.data?.success ?? true,
      message: res.data?.message ?? 'Đã xếp hàng gửi email.',
      soLuongDaXepHang: res.data?.soLuongDaXepHang,
    };
  },
};

export default lopHocService;
