import api from '../../../shared/configs/api';
import type {
  BuyNowResultDTO,
  GiftHistoryItemDTO,
  GiftQrDTO,
  GiftStatusDTO,
  PaymentStatusDTO,
  PaymentSupportDTO,
  PurchaseInfoDTO,
  QrPaymentDTO,
  RedeemGiftResultDTO,
} from '../types';

const GOC = '/hocvien/thanh-toan-khoa-hoc';

/** Adapter contract từ thanh-toan-khoa-hoc.service.ts (web). */
export const CommerceService = {
  /** GET /api/hocvien/thanh-toan-khoa-hoc/{maKhoaHoc} */
  layThongTinMua: async (maKhoaHoc: number): Promise<PurchaseInfoDTO> => {
    const res = await api.get<PurchaseInfoDTO>(`${GOC}/${maKhoaHoc}`);
    return res.data;
  },

  /** POST mua-ngay — dùng cho khóa miễn phí (đăng ký ngay không cần QR). */
  muaNgay: async (maKhoaHoc: number): Promise<BuyNowResultDTO> => {
    const res = await api.post<BuyNowResultDTO>(`${GOC}/mua-ngay`, { maKhoaHoc });
    return res.data;
  },

  /** POST tao-ma-qr — tạo QR thanh toán, voucher tùy chọn. */
  taoMaQrThanhToan: async (maKhoaHoc: number, maVoucher?: string): Promise<QrPaymentDTO> => {
    const res = await api.post<QrPaymentDTO>(`${GOC}/tao-ma-qr`, {
      maKhoaHoc,
      maVoucher: maVoucher?.trim() || undefined,
    });
    return res.data;
  },

  /** GET kiem-tra-trang-thai/{maDonHang} — polling sau khi hiện QR. */
  kiemTraTrangThaiThanhToan: async (maDonHang: number): Promise<PaymentStatusDTO> => {
    const res = await api.get<PaymentStatusDTO>(`${GOC}/kiem-tra-trang-thai/${maDonHang}`);
    return res.data;
  },

  /** POST tao-ma-qua-tang — mua khóa làm quà, voucher tùy chọn. */
  taoMaQuaTang: async (maKhoaHoc: number, maVoucher?: string): Promise<GiftQrDTO> => {
    const res = await api.post<GiftQrDTO>(`${GOC}/tao-ma-qua-tang`, {
      maKhoaHoc,
      maVoucher: maVoucher?.trim() || undefined,
    });
    return res.data;
  },

  /** GET kiem-tra-trang-thai-ma-qua-tang/{maDonHang} */
  kiemTraTrangThaiMaQuaTang: async (maDonHang: number): Promise<GiftStatusDTO> => {
    const res = await api.get<GiftStatusDTO>(`${GOC}/kiem-tra-trang-thai-ma-qua-tang/${maDonHang}`);
    return res.data;
  },

  /** POST nhap-ma-qua-tang */
  nhapMaQuaTang: async (code: string): Promise<RedeemGiftResultDTO> => {
    const res = await api.post<RedeemGiftResultDTO>(`${GOC}/nhap-ma-qua-tang`, { code });
    return res.data;
  },

  /** GET lich-su-ma-qua-tang */
  layLichSuMaQuaTang: async (): Promise<GiftHistoryItemDTO[]> => {
    const res = await api.get<GiftHistoryItemDTO[]>(`${GOC}/lich-su-ma-qua-tang`);
    return res.data;
  },

  /** POST {maDonHang}/yeu-cau-ho-tro — báo admin hỗ trợ đơn hàng. */
  taoYeuCauHoTro: async (
    maDonHang: number,
    thongTinLienLac: string,
    noiDungHocVien?: string
  ): Promise<PaymentSupportDTO> => {
    const res = await api.post<PaymentSupportDTO>(`${GOC}/${maDonHang}/yeu-cau-ho-tro`, {
      thongTinLienLac,
      noiDungHocVien,
    });
    return res.data;
  },
};

/** Lấy message lỗi backend giống cách web đọc `loi?.response?.data?.thongBao`. */
export function docLoiBackend(error: unknown, macDinh: string): string {
  const e = error as { response?: { data?: { thongBao?: string; message?: string } } };
  return e?.response?.data?.thongBao || e?.response?.data?.message || macDinh;
}
