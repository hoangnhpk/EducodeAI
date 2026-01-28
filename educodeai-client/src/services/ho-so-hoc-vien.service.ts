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
  const response = await axiosClient.get("/hoc-vien/ho-so");
  return response.data;
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

  const response = await axiosClient.put(
    "/hoc-vien/ho-so",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export interface DoiMatKhauPayload {
  matKhauCu: string;
  matKhauMoi: string;
  xacNhanMatKhauMoi: string;
}

export const doiMatKhau = async (payload: DoiMatKhauPayload) => {
  const res = await axiosClient.post("/nguoi-dung/doi-mat-khau", payload);
  return res.data;
};