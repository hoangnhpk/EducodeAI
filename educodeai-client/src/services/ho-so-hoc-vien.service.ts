import axiosClient from "../configs/axios";

/* ===== DTO ===== */
export interface HoSoHocVienDTO {
  hoTen: string;
  email: string;
  vaiTro: number;
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

/* ===== DOI MAT KHAU DTO ===== */
export interface DoiMatKhauPayload {
  matKhauCu: string;
  matKhauMoi: string;
  xacNhanMatKhauMoi: string;
}

/* ===== GET HO SO ===== */
export const getHoSoHocVien = async (): Promise<HoSoHocVienDTO> => {
  try {
    console.log("🔄 Đang gọi API /hoc-vien/ho-so...");
    
    const data = await axiosClient.get<HoSoHocVienDTO>("/hoc-vien/ho-so");
    
    console.log("✅ Dữ liệu nhận được:", data);
    
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy hồ sơ:", error);
    
    if (error.response) {
      throw new Error(error.response.data.message || "Lỗi từ server");
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra backend!");
    } else {
      throw error;
    }
  }
};

/* ===== UPDATE HO SO ===== */
export const updateHoSoHocVien = async (
  payload: UpdateHoSoHocVienDTO
): Promise<HoSoHocVienDTO> => {
  try {
    const formData = new FormData();
    
    // Backend C# expect PascalCase cho FormData keys
    formData.append("HoTen", payload.hoTen);

    if (payload.AnhDaiDien) {
      formData.append("AnhDaiDien", payload.AnhDaiDien);
    }

    console.log("🔄 Đang cập nhật hồ sơ...");
    console.log("📤 Gửi data:", {
      HoTen: payload.hoTen,
      HasImage: !!payload.AnhDaiDien
    });
    
    const data = await axiosClient.put<HoSoHocVienDTO>(
      "/hoc-vien/ho-so",
      formData
    );
    
    console.log("✅ Cập nhật thành công:", data);
    
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi cập nhật:", error);
    console.error("❌ Response:", error.response?.data);
    
    if (error.response) {
      throw new Error(error.response.data.message || "Cập nhật thất bại");
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server");
    } else {
      throw error;
    }
  }
};

/* ===== DOI MAT KHAU ===== */
export const doiMatKhau = async (
  payload: DoiMatKhauPayload
): Promise<void> => {
  try {
    console.log("🔄 Đang đổi mật khẩu...");
    
    await axiosClient.post<void>("/nguoi-dung/doi-mat-khau", payload);
    
    console.log("✅ Đổi mật khẩu thành công");
  } catch (error: any) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    throw error;
  }
};