import axiosClient from "../configs/axios";

/* ===== DTO ===== */
export interface HoSoHocVienDTO {
  hoTen: string;
  email: string;
  vaiTro: string;
  anhDaiDien?: string;

  tongKhoaHoc: number;
  daHoanThanh: number;
  dangHoc: number;
  chungChi: number;
  gioDaHoc: number;
  tyLeHoanThanh: number;
}

/* ===== UPDATE DTO ===== */
export interface UpdateHoSoHocVienDTO {
  hoTen: string;
  AnhDaiDien?: File | null;
}

/* ===== GET ===== */
export const getHoSoHocVien = async (): Promise<HoSoHocVienDTO> => {
  const response = await axiosClient.get<HoSoHocVienDTO>("/hoc-vien/ho-so");
  return response;

};

/* ===== UPDATE ===== */
export const updateHoSoHocVien = async (
  data: UpdateHoSoHocVienDTO
): Promise<HoSoHocVienDTO> => {
  const formData = new FormData();
  formData.append("hoTen", data.hoTen);

  if (data.AnhDaiDien) {
    formData.append("AnhDaiDien", data.AnhDaiDien);
  }

  const response = await axiosClient.get<HoSoHocVienDTO>("/hoc-vien/ho-so");
  return response;

};

/* ===== DOI MAT KHAU ===== */
export interface DoiMatKhauPayload {
  matKhauCu: string;
  matKhauMoi: string;
  xacNhanMatKhauMoi: string;
}

export const doiMatKhau = async (
  payload: DoiMatKhauPayload
): Promise<void> => {
  await axiosClient.post<void>(
    "/nguoi-dung/doi-mat-khau",
    payload
  );
};
