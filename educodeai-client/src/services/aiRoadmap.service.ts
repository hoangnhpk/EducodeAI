import axios from "@/configs/axios";
import type { DuLieuYeuCauLoTrinh, KetQuaLoTrinhAI } from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/Components/types";
import type {LoTrinhAICuaToiDTO} from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/LoTrinhAICuaToiDTO"

export const aiRoadmapService = {
  async taoLoTrinh(data: DuLieuYeuCauLoTrinh) {
    const thoiGianHocDuKien = data.thoiGianHoc ? Number(data.thoiGianHoc) : undefined;
    const thoiGianMoiTuan = data.mucDoCamKet ? Number(data.mucDoCamKet) : undefined;

    const payload = {
      trinhDoHienTai: data.trinhDo,
      mucTieuNgheNghiep: data.mucTieuNgheNghiep,
      thoiGianHocDuKien,
      thoiGianMoiTuan,
      kienThucHienCo: data.kienThucHienCo,
      kinhNghiemThucTe: data.kinhNghiem,
      khoKhanHienTai: data.khoKhan
    };

    const res = await (axios as any).post(
      "/api/lo-trinh-ai/them",
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
      maLoTrinh: undefined
    };
  },

  async capNhatLoTrinh(draft: KetQuaLoTrinhAI, yeuCauMoi: string) {
    const res = await (axios as any).put(
      "/api/lo-trinh-ai/cap-nhat",
      { noiDungJSON: JSON.stringify(draft), yeuCauMoi },
      { timeout: 120000 }
    ) as { maLoTrinh?: number; noiDungJSON: string };

    const noiDung = JSON.parse(res.noiDungJSON);

    return {
      ...noiDung,
      loTrinh: noiDung.loTrinh ?? [],
      maLoTrinh: undefined
    } as KetQuaLoTrinhAI;
  },

  async xacNhanLoTrinh(draft: KetQuaLoTrinhAI, yeuCau?: string) {
    return await axios.post("/api/lo-trinh-ai/xac-nhan", {
      noiDungJSON: JSON.stringify(draft),
      yeuCau
    });
  },

  async getAllLoTrinh(): Promise<LoTrinhAICuaToiDTO[]> {
    const url = '/api/lo-trinh-ai/lay-tat-ca-lo-trinh';
    const res = await axios.get(url);
    return res as LoTrinhAICuaToiDTO[];
  },

  async getChiTietLoTrinh(maLoTrinh: number): Promise<LoTrinhAICuaToiDTO> {
    const url = `/api/lo-trinh-ai/chi-tiet/${maLoTrinh}`;
    // Ép kiểu về DTO
    const res = await (axios as any).get(url); 
    return res as LoTrinhAICuaToiDTO; 
  }

};
