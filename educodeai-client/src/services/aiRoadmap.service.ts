import axios from "@/configs/axios";
import type { DuLieuYeuCauLoTrinh, KetQuaLoTrinhAI } from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/Components/types";

export const aiRoadmapService = {
  async taoLoTrinh(data: DuLieuYeuCauLoTrinh) {
    const thoiGianHocDuKien = Number(data.thoiGianHoc);
    const thoiGianMoiTuan = Number(data.mucDoCamKet);

    const payload = {
      trinhDoHienTai: data.trinhDo,
      phongCachHoc: data.phongCachHoc,
      mucTieuNgheNghiep: data.mucTieuNgheNghiep,
      thoiGianHocDuKien: Number.isFinite(thoiGianHocDuKien)
        ? thoiGianHocDuKien
        : undefined,
      thoiGianMoiTuan: Number.isFinite(thoiGianMoiTuan)
        ? thoiGianMoiTuan
        : undefined,
      kienThucHienCo: data.kienThucHienCo,
      kinhNghiemThucTe: data.kinhNghiem,
      khoKhanHienTai: data.khoKhan,
      linhVucTapTrung: data.cacMangTapTrung
    };

    const res = await (axios as any).post(
      "/api/LoTrinhAI",
      payload,
      {
        timeout: 120000, // 120s - Tha hồ cho AI suy ngẫm
      }
    ) as { maLoTrinh: number; noiDungJSON: string };
    

    let noiDung: KetQuaLoTrinhAI | null = null;
    try {
      noiDung = JSON.parse(res.noiDungJSON);
    } catch (error) {
      console.error("Không thể parse JSON lộ trình AI:", error);
      throw new Error("AI trả về dữ liệu không hợp lệ");
    }

    if (!noiDung || !Array.isArray(noiDung.loTrinh)) {
      throw new Error("Dữ liệu AI thiếu cấu trúc lộ trình");
    }

    return {
      ...noiDung,
      loTrinh: noiDung.loTrinh ?? [],
      maLoTrinh: res.maLoTrinh
    };
  },

  async capNhatLoTrinh(maLoTrinh: number, yeuCauMoi: string) {
    const res = await (axios as any).put(
      "/api/LoTrinhAI/cap-nhat",
      { maLoTrinh, yeuCauMoi },
      { timeout: 120000 }
    ) as { maLoTrinh: number; noiDungJSON: string };

    const noiDung = JSON.parse(res.noiDungJSON);
    
    return {
        ...noiDung,
        loTrinh: noiDung.loTrinh ?? [],
        maLoTrinh: res.maLoTrinh
    } as KetQuaLoTrinhAI;
},

  async xacNhanLoTrinh(maLoTrinh: number) {
    return await axios.post(`/api/LoTrinhAI/xac-nhan/${maLoTrinh}`);
  }
  
};
