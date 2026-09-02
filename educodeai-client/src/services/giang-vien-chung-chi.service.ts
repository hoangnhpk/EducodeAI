import axiosClient from "@/configs/axios";
import type { LecturerCertificateUpload } from "@/components/LecturerDocumentUpload";

export interface ChungChiGiangVien {
  maTaiLieu: number;
  clientRequestId: string;
  phienBan: number;
  tenChungChi: string;
  donViCap?: string;
  ngayCap?: string;
  ngayHetHan?: string;
  maChungChi?: string;
  maChungChiChe?: string;
  urlXacMinh?: string;
  trangThai: "ChoDuyet" | "CanBoSung" | "DaDuyet" | "TuChoi" | string;
  lyDoXuLy?: string;
  hienThiCongKhai: boolean;
  ngayTaiLen: string;
  ngayCapNhat: string;
  ngayDuyet?: string;
}

export interface DotGuiChungChiGiangVien {
  maDotGui: string;
  trangThai: "ChoDuyet" | "CanBoSung" | "DaDuyet" | "TuChoi" | string;
  lyDoXuLy?: string;
  ngayTaiLen: string;
  ngayCapNhat: string;
  ngayDuyet?: string;
  chungChis: ChungChiGiangVien[];
}

export interface ChungChiBoSungUpload extends LecturerCertificateUpload {
  maTaiLieu: number;
  phienBan: number;
}

const appendCertificate = (formData: FormData, certificate: LecturerCertificateUpload, index: number) => {
  const prefix = `Certificates[${index}]`;
  formData.append(`${prefix}.ClientId`, certificate.clientId);
  formData.append(`${prefix}.File`, certificate.file);
  formData.append(`${prefix}.TenChungChi`, certificate.tenChungChi.trim());
  if (certificate.donViCap.trim()) formData.append(`${prefix}.DonViCap`, certificate.donViCap.trim());
  if (certificate.ngayCap) formData.append(`${prefix}.NgayCap`, certificate.ngayCap);
  if (certificate.ngayHetHan) formData.append(`${prefix}.NgayHetHan`, certificate.ngayHetHan);
  if (certificate.maChungChi.trim()) formData.append(`${prefix}.MaChungChi`, certificate.maChungChi.trim());
  if (certificate.urlXacMinh.trim()) formData.append(`${prefix}.UrlXacMinh`, certificate.urlXacMinh.trim());
  if (certificate.relativePath) formData.append(`${prefix}.RelativePath`, certificate.relativePath);
};

export const GiangVienChungChiService = {
  layDanhSach: async (): Promise<DotGuiChungChiGiangVien[]> =>
    await axiosClient.get<DotGuiChungChiGiangVien[]>("/api/giang-vien/chung-chi"),

  guiYeuCau: async (certificates: LecturerCertificateUpload[]) => {
    const formData = new FormData();
    certificates.forEach((certificate, index) => appendCertificate(formData, certificate, index));
    return await axiosClient.post("/api/giang-vien/chung-chi", formData);
  },

  boSung: async (maDotGui: string, certificates: ChungChiBoSungUpload[]) => {
    const formData = new FormData();
    certificates.forEach((certificate, index) => {
      const prefix = `Certificates[${index}]`;
      formData.append(`${prefix}.MaTaiLieu`, String(certificate.maTaiLieu));
      formData.append(`${prefix}.PhienBan`, String(certificate.phienBan));
      formData.append(`${prefix}.File`, certificate.file);
      formData.append(`${prefix}.TenChungChi`, certificate.tenChungChi.trim());
      if (certificate.donViCap.trim()) formData.append(`${prefix}.DonViCap`, certificate.donViCap.trim());
      if (certificate.ngayCap) formData.append(`${prefix}.NgayCap`, certificate.ngayCap);
      if (certificate.ngayHetHan) formData.append(`${prefix}.NgayHetHan`, certificate.ngayHetHan);
      if (certificate.maChungChi.trim()) formData.append(`${prefix}.MaChungChi`, certificate.maChungChi.trim());
      if (certificate.urlXacMinh.trim()) formData.append(`${prefix}.UrlXacMinh`, certificate.urlXacMinh.trim());
    });
    return await axiosClient.put(`/api/giang-vien/chung-chi/dot-gui/${maDotGui}/bo-sung`, formData);
  },

  capNhatHienThi: async (maTaiLieu: number, hienThiCongKhai: boolean) =>
    await axiosClient.put(`/api/giang-vien/chung-chi/${maTaiLieu}/hien-thi`, { hienThiCongKhai })
};
