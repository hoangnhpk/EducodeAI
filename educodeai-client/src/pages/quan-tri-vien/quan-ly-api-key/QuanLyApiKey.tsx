import { useState, useEffect } from "react";
import type { KeyApiSummary, KeyApiManage, ThongKeHeThong } from "./QuanLyApiKey.types";
import { keyApiService } from "../../../services/key-api.service";
import StatCards from "./components/StatCards";
import BangApiKey from "./components/BangApiKey";
import ModalThemKey from "./components/ModalThemKey";
import "./QuanLyApiKey.css";

// MOCK Thống kê hệ thống vì API chưa hỗ trợ dashboard tổng hợp
const MOCK_THONG_KE: ThongKeHeThong = {
  tongRequestHomNay: 0,
  tongTokenDaDung: 0,
  trangThaiHeThong: "Đang tải...",
  phanTramTang: 0,
};

const QuanLyApiKey = () => {
  const [danhSach, setDanhSach] = useState<KeyApiSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<KeyApiSummary | null>(null);
  const [thongKe, setThongKe] = useState<ThongKeHeThong>(MOCK_THONG_KE);

  // Fetch danh sách Key từ API
  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res: any = await keyApiService.getAll();

      // Axios trả về response.data nếu không có interceptor tự unwrap, 
      // hoặc trả thẳng array nếu có. Ta check tuỳ trường hợp.
      const rawData: any[] = Array.isArray(res) ? res : (res.data || []);

      // Đề phòng trường hợp C# Serialize JSON giữ nguyên PascalCase thay vì camelCase mặc định
      // Dùng || thay vì ?? để ghi đè chuỗi rỗng ("") nếu Backend đang chạy bản cũ chưa Rebuild
      const data: KeyApiSummary[] = rawData.map((k: any) => ({
        id: k.id ?? k.ID ?? k.Id ?? 0,
        tenKey: k.tenKey || k.TenKey || "Không tên",
        maKeyFull: k.maKeyFull || k.MaKeyFull || `sk-...${k.id || k.ID || k.Id || "0"}`,
        loaiKey: k.loaiKey || k.LoaiKey || "Khác",
        trangThai: k.trangThai ?? k.TrangThai ?? false,
        thuTuUuTien: k.thuTuUuTien ?? k.ThuTuUuTien ?? 0,
        hanMucRequest: k.hanMucRequest ?? k.HanMucRequest ?? 0,
        daSuDungRequest: k.daSuDungRequest ?? k.DaSuDungRequest ?? 0,
        hanMucToken: k.hanMucToken ?? k.HanMucToken ?? 0,
        daSuDungToken: k.daSuDungToken ?? k.DaSuDungToken ?? 0,
        phanTramSuDung: k.phanTramSuDung ?? k.PhanTramSuDung ?? 0
      }));

      setDanhSach(data);

      // Tính toán thống kê nháp từ danh sách key
      const sumReqs = data.reduce((sum, k: any) => sum + (k.daSuDungRequest ?? k.DaSuDungRequest ?? 0), 0);
      const sumToks = data.reduce((sum, k: any) => sum + (k.daSuDungToken ?? k.DaSuDungToken ?? 0), 0);
      setThongKe({
        tongRequestHomNay: sumReqs,
        tongTokenDaDung: sumToks,
        trangThaiHeThong: "Ổn định",
        phanTramTang: 12,
      });
    } catch (error) {
      console.error("Lỗi khi tải API Key:", error);
      setThongKe(prev => ({ ...prev, trangThaiHeThong: "Mất kết nối API" }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  /* ---- Toggle khoá / mở khoá ---- */
  const handleKhoa = async (key: KeyApiSummary) => {
    const newStatus = !key.trangThai;
    try {
      await keyApiService.toggleStatus(key.id, newStatus);
      // Cập nhật local state
      setDanhSach(prev => prev.map(k => k.id === key.id ? { ...k, trangThai: newStatus } : k));
    } catch (error) {
      console.error("Lỗi đổi trạng thái:", error);
    }
  };

  /* ---- Đồng bộ Redis ---- */
  const handleCapMoi = async (key: KeyApiSummary) => {
    try {
      await keyApiService.syncToRedis(key.id);
      fetchKeys();
    } catch (error) {
      console.error("Lỗi đồng bộ Redis:", error);
    }
  };

  /* ---- Xóa Key ---- */
  const handleXoa = async (key: KeyApiSummary) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Key này không?")) return;
    try {
      await keyApiService.delete(key.id);
      setDanhSach(prev => prev.filter(k => k.id !== key.id));
    } catch (error) {
      console.error("Lỗi xóa key:", error);
    }
  };

  /* ---- Modal Thêm Mới ---- */
  const handleThemMoi = () => {
    setEditingKey(null);
    setIsModalOpen(true);
  };

  /* ---- Chỉnh sửa Key ---- */
  const handleSua = (key: KeyApiSummary) => {
    setEditingKey(key);
    setIsModalOpen(true);
  };

  const handleSaveKey = async (data: KeyApiManage) => {
    try {
      if (editingKey) {
        await keyApiService.update(editingKey.id, data);
      } else {
        await keyApiService.create(data);
      }
      setIsModalOpen(false);
      fetchKeys(); // reload
    } catch (err) {
      console.error(err);
      alert(editingKey ? "Lỗi cập nhật Key!" : "Lỗi khi tạo Key hoặc mất kết nối Server!");
    }
  };

  const soKeyChinh = danhSach.filter((k) => k.loaiKey === "Chính").length;
  const soKeyPhu = danhSach.filter((k) => k.loaiKey === "Phụ").length;
  const soKeyHoatDong = danhSach.filter((k) => k.trangThai).length;

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
              Quản lý toàn bộ API Key của hệ thống EduCodeAI {isLoading && "(Đang tải...)"}
            </p>
          </div>
        </div>
        <button className="akm-btn-add" onClick={handleThemMoi}>
          <i className="bi bi-plus-lg"></i>
          Thêm Key Mới
        </button>
      </div>

      {/* ======= STAT CARDS ======= */}
      <StatCards thongKe={thongKe} />

      {/* ======= KEY POOL TABLE ======= */}
      <div className="card border-0 shadow-sm akm-table-card">
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
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={fetchKeys}>
              <i className={`bi bi-arrow-clockwise ${isLoading ? "fa-spin" : ""}`}></i>
              Làm mới
            </button>
          </div>
        </div>

        <div className="card-body p-0 position-relative">
          {isLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 10 }}>
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          )}
          <BangApiKey
            danhSach={danhSach}
            onSua={handleSua}
            onKhoa={handleKhoa}
            onCapMoi={handleCapMoi}
            onXoa={handleXoa}
          />
        </div>

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

      {/* ======= MODAL ======= */}
      <ModalThemKey
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveKey}
        editData={editingKey}
      />
    </div>
  );
};

export default QuanLyApiKey;
