import { useState } from "react";
import type { DuLieuYeuCauLoTrinh } from "./types";
import "./YeuCauLoTrinhAI.css";

interface Props {
  onSubmit: (data: DuLieuYeuCauLoTrinh) => void;
}

export default function FormYeuCauLoTrinh({ onSubmit }: Props) {
  const [form, setForm] = useState<DuLieuYeuCauLoTrinh>({
    hoTen: "",
    trinhDo: "",
    phongCachHoc: "",
    mucTieuNgheNghiep: "",
    thoiGianHoc: "",
    mucDoCamKet: "",
    cacMangTapTrung: []
  });

  const capNhat = (key: keyof DuLieuYeuCauLoTrinh, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleMang = (mang: string) => {
    capNhat(
      "cacMangTapTrung",
      form.cacMangTapTrung.includes(mang)
        ? form.cacMangTapTrung.filter(x => x !== mang)
        : [...form.cacMangTapTrung, mang]
    );
  };

  return (
    <form
      className="bg-light rounded p-5 h-100"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <h4 className="ai-color mb-4">Bước 1: Thông tin cá nhân</h4>

      <input
        className="form-control mb-3"
        placeholder="Họ và tên"
        required
        onChange={(e) => capNhat("hoTen", e.target.value)}
      />

      <select
        className="form-select mb-3"
        required
        onChange={(e) => capNhat("trinhDo", e.target.value)}
      >
        <option value="">Chọn trình độ</option>
        <option value="beginner">Người mới</option>
        <option value="intermediate">Trung cấp</option>
        <option value="advanced">Nâng cao</option>
      </select>

      <h4 className="ai-color mt-4 mb-3">Bước 2: Mục tiêu</h4>

      <input
        className="form-control mb-3"
        placeholder="Mục tiêu nghề nghiệp"
        required
        onChange={(e) => capNhat("mucTieuNgheNghiep", e.target.value)}
      />

      <h4 className="ai-color mt-4 mb-3">Bước 3: AI tập trung vào</h4>

      {[
        "foundation",
        "backend",
        "database",
        "systemdesign",
        "aiml"
      ].map(mang => (
        <div className="form-check" key={mang}>
          <input
            className="form-check-input"
            type="checkbox"
            onChange={() => toggleMang(mang)}
          />
          <label className="form-check-label">{mang}</label>
        </div>
      ))}

      <button className="btn btn-primary w-100 mt-4">
        🤖 Gửi yêu cầu AI
      </button>
    </form>
  );
}
