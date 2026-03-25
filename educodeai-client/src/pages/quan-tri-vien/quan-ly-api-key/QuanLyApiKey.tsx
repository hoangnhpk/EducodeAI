import { useState } from "react";
import type { ApiKey, ThongKeHeThong } from "./QuanLyApiKey.types";
import StatCards from "./components/StatCards";
import BangApiKey from "./components/BangApiKey";
import "./QuanLyApiKey.css";

/* =====================================================================
   MOCK DATA  –  Thay bằng dữ liệu thật khi kết nối API
   ===================================================================== */

const MOCK_THONG_KE: ThongKeHeThong = {
  tongRequestHomNay: 14_832,
  tongTokenDaDung: 2_187_400,
  trangThaiHeThong: "Ổn định",
  phanTramTang: 12,
};

const MOCK_API_KEYS: ApiKey[] = [
  /* ---------- 3 Key Chính ---------- */
  {
    id: "AK-001",
    tenKey: "GPT-4o Production",
    maKeyFull: "sk-prod-aZ9mXkQrTP2fNwEB7LVjRcYsDhGpOt14",
    loai: "Chính",
    trangThai: "Hoạt động",
    hanMucRequest: 5_000,
    daSuDungRequest: 3_124,
    hanMucToken: 2_000_000,
    daSuDungToken: 987_500,
    ngayTao: "2024-11-01",
    moTa: "Key chính cho luồng sinh bài AI",
  },
  {
    id: "AK-002",
    tenKey: "GPT-4o Backup #1",
    maKeyFull: "sk-bkp1-mNqLsW8xZoHdFvCU6gIyJKbRpA3eT0",
    loai: "Chính",
    trangThai: "Hoạt động",
    hanMucRequest: 5_000,
    daSuDungRequest: 4_853,
    hanMucToken: 2_000_000,
    daSuDungToken: 1_870_000,
    ngayTao: "2024-11-15",
    moTa: "Dự phòng khi key chính quá tải",
  },
  {
    id: "AK-003",
    tenKey: "Claude-3 Sonnet Main",
    maKeyFull: "sk-ant-main-VrXtP5wKqMjN2sBz1dGA8eHoYLuC9fI0",
    loai: "Chính",
    trangThai: "Đã khóa",
    hanMucRequest: 3_000,
    daSuDungRequest: 0,
    hanMucToken: 1_500_000,
    daSuDungToken: 0,
    ngayTao: "2024-10-20",
    moTa: "Tạm khoá – chờ gia hạn quota",
  },

  /* ---------- 3 Key Phụ ---------- */
  {
    id: "AK-004",
    tenKey: "Gemini 1.5 Flash (Test)",
    maKeyFull: "AIzaSy-test-Kb9Qm3RpLe7TwFhXv4cUjNnOsD2",
    loai: "Phụ",
    trangThai: "Hoạt động",
    hanMucRequest: 1_000,
    daSuDungRequest: 215,
    hanMucToken: 500_000,
    daSuDungToken: 78_200,
    ngayTao: "2025-01-08",
    moTa: "Chạy thử nghiệm tính năng Gemini",
  },
  {
    id: "AK-005",
    tenKey: "Llama-3 (Local Proxy)",
    maKeyFull: "sk-llama-local-Uo8EvT6mQnXjBcFA2sKpID1gNhRL9w",
    loai: "Phụ",
    trangThai: "Hoạt động",
    hanMucRequest: 2_000,
    daSuDungRequest: 1_560,
    hanMucToken: 800_000,
    daSuDungToken: 640_000,
    ngayTao: "2025-02-14",
    moTa: "Proxy tới Llama self-hosted nội bộ",
  },
  {
    id: "AK-006",
    tenKey: "Mistral (R&D)",
    maKeyFull: "sk-mistral-rd-PwZ5xQmKoNvE3AcJ8bULT2fHdGsIY7",
    loai: "Phụ",
    trangThai: "Đã khóa",
    hanMucRequest: 500,
    daSuDungRequest: 0,
    hanMucToken: 200_000,
    daSuDungToken: 0,
    ngayTao: "2025-03-02",
    moTa: "Dùng cho nghiên cứu nội bộ",
  },
];

/* =====================================================================
   PAGE COMPONENT
   ===================================================================== */
const QuanLyApiKey = () => {
  // Trạng thái local – giả lập toggle lock / rotate (không gọi API)
  const [danhSach, setDanhSach] = useState<ApiKey[]>(MOCK_API_KEYS);

  /* ---- Toggle khoá / mở khoá (mock) ---- */
  const handleKhoa = (key: ApiKey) => {
    setDanhSach((prev) =>
      prev.map((k) =>
        k.id === key.id
          ? { ...k, trangThai: k.trangThai === "Hoạt động" ? "Đã khóa" : "Hoạt động" }
          : k
      )
    );
  };

  /* ---- Cấp / Xoay key mới (mock – thay suffix ngẫu nhiên) ---- */
  const handleCapMoi = (key: ApiKey) => {
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
    setDanhSach((prev) =>
      prev.map((k) =>
        k.id === key.id
          ? { ...k, maKeyFull: k.maKeyFull.slice(0, -8) + suffix }
          : k
      )
    );
  };

  /* ---- Mở modal sửa – TODO: tích hợp modal sau ---- */
  const handleSua = (key: ApiKey) => {
    console.log("[TODO] Mở modal sửa key:", key.id);
  };

  /* ---- Thêm key mới – TODO: tích hợp modal sau ---- */
  const handleThemMoi = () => {
    console.log("[TODO] Mở modal thêm key mới");
  };

  // Đếm tổng hợp hiển thị ở header bảng
  const soKeyChinh = danhSach.filter((k) => k.loai === "Chính").length;
  const soKeyPhu = danhSach.filter((k) => k.loai === "Phụ").length;
  const soKeyHoatDong = danhSach.filter((k) => k.trangThai === "Hoạt động").length;

  return (
    <div className="akm-page">

      {/* ======= HEADER ======= */}
      <div className="akm-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="akm-header-icon">
            <i className="bi bi-key-fill"></i>
          </div>
          <div>
            <h1 className="akm-page-title mb-0">Quản lý API Key</h1>
            <p className="akm-page-subtitle mb-0">
              Quản lý toàn bộ API Key của hệ thống EduCodeAI
            </p>
          </div>
        </div>
        <button className="akm-btn-add" onClick={handleThemMoi}>
          <i className="bi bi-plus-lg"></i>
          Thêm Key Mới
        </button>
      </div>

      {/* ======= STAT CARDS ======= */}
      <StatCards thongKe={MOCK_THONG_KE} />

      {/* ======= KEY POOL TABLE ======= */}
      <div className="card border-0 shadow-sm akm-table-card">

        {/* Card header */}
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="akm-section-title">
              <i className="bi bi-collection-fill me-2 text-primary"></i>
              Key Pool
            </span>
            <span className="badge bg-light text-dark border">
              <i className="bi bi-key me-1"></i>{soKeyChinh} Chính
            </span>
            <span className="badge bg-light text-dark border">
              <i className="bi bi-dash-circle me-1"></i>{soKeyPhu} Phụ
            </span>
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
              <i className="bi bi-check-circle me-1"></i>{soKeyHoatDong} Hoạt động
            </span>
          </div>

          {/* Thanh tìm kiếm + nút làm mới */}
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm akm-search-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Tìm key..."
              />
            </div>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
              <i className="bi bi-arrow-clockwise"></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card-body p-0">
          <BangApiKey
            danhSach={danhSach}
            onSua={handleSua}
            onKhoa={handleKhoa}
            onCapMoi={handleCapMoi}
          />
        </div>

        {/* Card footer */}
        <div className="akm-table-footer d-flex align-items-center justify-content-between">
          <span>
            <i className="bi bi-info-circle me-1"></i>
            Hiển thị {danhSach.length} / {danhSach.length} key
          </span>
          <span>
            <i className="bi bi-calendar3 me-1"></i>
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>

      </div>
    </div>
  );
};

export default QuanLyApiKey;
