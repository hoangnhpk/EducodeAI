import { useState, useEffect } from "react";
import Swal from "sweetalert2";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<KeyApiSummary | null>(null);
  const [thongKe, setThongKe] = useState<ThongKeHeThong>(MOCK_THONG_KE);

  // Phase 5 State
  const [revealedKeys, setRevealedKeys] = useState<Record<number, string>>({});
  const [isRevealing, setIsRevealing] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Fetch danh sách Key từ API
  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res: any = await keyApiService.getAll();
      const rawData: any[] = Array.isArray(res) ? res : (res.data || []);
      const data: KeyApiSummary[] = rawData.map((k: any) => ({
        id: k.id ?? k.ID ?? k.Id ?? 0,
        tenKey: k.tenKey || k.TenKey || "Không tên",
        maKeyMasked: k.maKeyMasked || k.MaKeyMasked || "sk-...***",
        loaiKey: k.loaiKey || k.LoaiKey || "Khác",
        trangThai: k.trangThai ?? k.TrangThai ?? false,
        thuTuUuTien: k.thuTuUuTien ?? k.ThuTuUuTien ?? 0,
        modelSuDung: k.modelSuDung || k.ModelSuDung || "",
        rpmLimit: k.rpmLimit ?? k.RPMLimit ?? 0,
        tpmLimit: k.tpmLimit ?? k.TPMLimit ?? 0,
        rpdLimit: k.rpdLimit ?? k.RPDLimit ?? 0,
        daSuDungRequestHomNay: k.daSuDungRequestHomNay ?? k.DaSuDungRequestHomNay ?? 0,
        daSuDungTokenHomNay: k.daSuDungTokenHomNay ?? k.DaSuDungTokenHomNay ?? 0,
        phanTramRPD: k.phanTramRPD ?? k.PhanTramRPD ?? 0,
        dangBiCooldown: k.dangBiCooldown ?? k.DangBiCooldown ?? false
      }));

      setDanhSach(data);

      const sumReqs = data.reduce((sum, k) => sum + k.daSuDungRequestHomNay, 0);
      const sumToks = data.reduce((sum, k) => sum + k.daSuDungTokenHomNay, 0);
      // Tính % sử dụng trung bình thực tế từ Redis (thay vì hardcode)
      const activeKeys = data.filter(k => k.trangThai && k.rpdLimit > 0);
      const avgPercent = activeKeys.length > 0
        ? Math.round(activeKeys.reduce((sum, k) => sum + k.phanTramRPD, 0) / activeKeys.length)
        : 0;
      setThongKe({
        tongRequestHomNay: sumReqs,
        tongTokenDaDung: sumToks,
        trangThaiHeThong: "Ổn định",
        phanTramTang: avgPercent,
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

  const handleKhoa = async (key: KeyApiSummary) => {
    const newStatus = !key.trangThai;
    try {
      await keyApiService.toggleStatus(key.id, newStatus);
      setDanhSach(prev => prev.map(k => k.id === key.id ? { ...k, trangThai: newStatus } : k));
    } catch (error) {
      console.error("Lỗi đổi trạng thái:", error);
    }
  };

  /* ---- Hiện Key ---- */
  const handleReveal = async (key: KeyApiSummary) => {
    if (revealedKeys[key.id]) {
      const newRevealed = { ...revealedKeys };
      delete newRevealed[key.id];
      setRevealedKeys(newRevealed);
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hiển thị API Key?',
      text: 'Hành động này sẽ được ghi log. Bạn có chắc muốn xem Key này?',
      showCancelButton: true,
      confirmButtonColor: 'var(--warning)',
      confirmButtonText: 'Hiển thị',
      cancelButtonText: 'Hủy'
    });
    
    if (!result.isConfirmed) return;

    try {
      setIsRevealing(key.id);
      const res = await keyApiService.revealKey(key.id);
      const data = (res as any).data ? (res as any).data : res;
      const revealedKey = data.maKeyFull || data.MaKeyFull;
      setRevealedKeys(prev => ({ ...prev, [key.id]: revealedKey }));
      
      // Auto hide after 30s
      setTimeout(() => {
        setRevealedKeys(prev => {
          const updated = { ...prev };
          delete updated[key.id];
          return updated;
        });
      }, 30000);
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Không thể hiển thị API Key', 'error');
    } finally {
      setIsRevealing(null);
    }
  };

  /* ---- Đồng bộ Redis ---- */
  const handleCapMoi = async (key: KeyApiSummary) => {
    try {
      setIsSyncing(key.id);
      await keyApiService.syncToRedis(key.id);
      fetchKeys();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã đồng bộ lên Redis',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error("Lỗi đồng bộ Redis:", error);
      Swal.fire('Lỗi', 'Đồng bộ thất bại', 'error');
    } finally {
      setIsSyncing(null);
    }
  };

  /* ---- Reset Usage ---- */
  const handleResetUsage = async (key: KeyApiSummary) => {
    const result = await Swal.fire({
      icon: 'error',
      title: 'NGUY HIỂM: Reset Usage?',
      text: `Bạn có chắc muốn reset mức sử dụng của key "${key.tenKey}" về 0? Hệ thống sẽ tạo một baseline mới.`,
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Reset'
    });
    
    if (!result.isConfirmed) return;

    try {
      setIsResetting(key.id);
      await keyApiService.resetUsage(key.id);
      fetchKeys();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã reset usage về 0',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Không thể reset usage', 'error');
    } finally {
      setIsResetting(null);
    }
  };

  /* ---- Xóa Key ---- */
  const handleXoa = async (key: KeyApiSummary) => {
    const result = await Swal.fire({
      icon: 'error',
      title: 'Xóa API Key?',
      text: `Bạn có chắc muốn xóa key "${key.tenKey}" không? Hành động này không thể hoàn tác.`,
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      setIsDeleting(key.id);
      await keyApiService.delete(key.id);
      setDanhSach(prev => prev.filter(k => k.id !== key.id));
    } catch (error) {
      console.error("Lỗi xóa key:", error);
    } finally {
      setIsDeleting(null);
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
      Swal.fire("Lỗi", editingKey ? "Lỗi cập nhật Key!" : "Lỗi khi tạo Key hoặc mất kết nối Server!", "error");
    }
  };

  const soKeyChinh = danhSach.filter((k) => k.loaiKey === "Chính").length;
  const soKeyPhu = danhSach.filter((k) => k.loaiKey === "Phụ").length;
  const soKeyHoatDong = danhSach.filter((k) => k.trangThai).length;

  const danhSachLoc = danhSach.filter((k) =>
    k.tenKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* Thay đổi đoạn này trong code của ông */}
          <div className="d-flex align-items-center gap-2 flex-nowrap"> {/* Thêm flex-nowrap để cấm xuống hàng */}
            <div className="input-group input-group-sm akm-search-group" style={{ width: '200px' }}> {/* Set cứng width hoặc dùng class w-50 */}
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Tìm key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 text-nowrap" onClick={fetchKeys}>
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
            danhSach={danhSachLoc}
            revealedKeys={revealedKeys}
            onSua={handleSua}
            onKhoa={handleKhoa}
            onCapMoi={handleCapMoi}
            onResetUsage={handleResetUsage}
            onXoa={handleXoa}
            onReveal={handleReveal}
            isRevealing={isRevealing}
            isSyncing={isSyncing}
            isResetting={isResetting}
            isDeleting={isDeleting}
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
