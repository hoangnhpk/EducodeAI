import { useState, useEffect } from "react";
import type { KeyApiManage, KeyApiSummary, GeminiModel } from "../QuanLyApiKey.types";
import axiosClient from "@/configs/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: KeyApiManage) => Promise<void>;
  editData?: KeyApiSummary | null;
}

const ModalThemKey = ({ isOpen, onClose, onSave, editData }: Props) => {
  const [formData, setFormData] = useState<KeyApiManage>({
    tenKey: "",
    maKeyRaw: "",
    loaiKey: "Chính",
    thuTuUuTien: 0,
    modelSuDung: "",
    rpmLimit: 15,
    tpmLimit: 1000000,
    rpdLimit: 1500,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelList, setModelList] = useState<GeminiModel[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchModelError, setFetchModelError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModelList([]);
      setFetchModelError(null);
      if (editData) {
        setFormData({
          tenKey: editData.tenKey,
          maKeyRaw: "",
          loaiKey: editData.loaiKey,
          thuTuUuTien: editData.thuTuUuTien,
          modelSuDung: editData.modelSuDung,
          rpmLimit: editData.rpmLimit,
          tpmLimit: editData.tpmLimit,
          rpdLimit: editData.rpdLimit,
        });
        // Nếu là edit, show ngay model đang dùng
        if (editData.modelSuDung) {
          setModelList([{ name: editData.modelSuDung, displayName: editData.modelSuDung }]);
        }
      } else {
        setFormData({
          tenKey: "",
          maKeyRaw: "",
          loaiKey: "Chính",
          thuTuUuTien: 0,
          modelSuDung: "",
          rpmLimit: 15,
          tpmLimit: 1000000,
          rpdLimit: 1500,
        });
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleFetchModels = async () => {
    const key = formData.maKeyRaw || "";
    if (!key.trim()) {
      setFetchModelError("Vui lòng nhập mã API Key trước khi lấy danh sách model.");
      return;
    }
    setIsFetchingModels(true);
    setFetchModelError(null);
    setModelList([]);
    try {
      const res = await axiosClient.post<GeminiModel[]>("/api/KeyApi/fetch-models", JSON.stringify(key), {
        headers: { "Content-Type": "application/json" },
      });
      if (res.length === 0) {
        setFetchModelError("Không tìm thấy model Gemini nào cho key này.");
      } else {
        setModelList(res);
        // Tự chọn model đầu tiên nếu chưa có
        if (!formData.modelSuDung) {
          setFormData((prev) => ({ ...prev, modelSuDung: res[0].name }));
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFetchModelError(msg || "API Key không hợp lệ hoặc bị khóa từ phía Google.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ opacity: 0.5 }}></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg border-0 akm-modal" style={{ borderRadius: "12px" }}>
            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
              <h5 className="modal-title fw-bold fs-5 text-dark">
                {editData ? "Cập nhật API Key" : "Thêm API Key mới"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
            </div>
            <div className="modal-body px-4 pt-3 pb-4">
              <form id="addKeyForm" onSubmit={handleSubmit}>
                {/* Tên Key */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small mb-1">Tên Key</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    placeholder="VD: Gemini 2.5 Pro - Production"
                    value={formData.tenKey}
                    onChange={(e) => setFormData({ ...formData, tenKey: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Mã Key + nút Lấy Model */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small mb-1">
                    Mã Key (Raw){" "}
                    {editData && (
                      <span className="fw-normal text-warning fst-italic">
                        - Bỏ trống nếu không muốn đổi mã
                      </span>
                    )}
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control font-monospace"
                      required={!editData}
                      placeholder={editData ? "Nhập mã mới (nếu cần)" : "AIza..."}
                      value={formData.maKeyRaw}
                      onChange={(e) => {
                        setFormData({ ...formData, maKeyRaw: e.target.value });
                        setModelList([]);
                        setFetchModelError(null);
                      }}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={handleFetchModels}
                      disabled={isFetchingModels || isSubmitting}
                      title="Gọi Google API để lấy danh sách model khả dụng"
                    >
                      {isFetchingModels ? (
                        <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }} />
                      ) : (
                        <i className="bi bi-cloud-download" />
                      )}
                      <span className="d-none d-md-inline">Lấy Model</span>
                    </button>
                  </div>
                  <div className="form-text small" style={{ fontSize: "11.5px" }}>
                    Key sẽ được tự động mã hóa AES khi lưu xuống DB.
                  </div>
                  {fetchModelError && (
                    <div className="alert alert-danger py-1 px-2 mt-1 mb-0 small">{fetchModelError}</div>
                  )}
                </div>

                {/* Chọn Model */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small mb-1">
                    Model sử dụng <span className="text-danger">*</span>
                  </label>
                  {modelList.length > 0 ? (
                    <select
                      className="form-select form-select-sm"
                      required
                      value={formData.modelSuDung}
                      onChange={(e) => setFormData({ ...formData, modelSuDung: e.target.value })}
                      disabled={isSubmitting}
                    >
                      <option value="">-- Chọn model --</option>
                      {modelList.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.displayName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="VD: gemini-1.5-flash"
                      value={formData.modelSuDung}
                      onChange={(e) => setFormData({ ...formData, modelSuDung: e.target.value })}
                      disabled={isSubmitting}
                    />
                  )}
                  <div className="form-text small" style={{ fontSize: "11.5px" }}>
                    Mỗi Key chỉ được gắn 1 model duy nhất. Nhập tên model (ví dụ: gemini-1.5-flash) nếu không tải được danh sách.
                  </div>
                </div>

                {/* Loại Key & Ưu tiên */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small mb-1">Loại Key</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.loaiKey}
                      onChange={(e) => setFormData({ ...formData, loaiKey: e.target.value })}
                      disabled={isSubmitting}
                    >
                      <option value="Chính">Chính</option>
                      <option value="Phụ">Phụ</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small mb-1">Mức ưu tiên</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.thuTuUuTien}
                      onChange={(e) => setFormData({ ...formData, thuTuUuTien: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Rate Limit: RPM / TPM / RPD */}
                <div className="mb-1">
                  <label className="form-label fw-semibold text-muted small mb-2 d-block">
                    Giới hạn Rate Limit{" "}
                    <span className="text-muted fw-normal">(theo cấu hình Gemini của bạn)</span>
                  </label>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label text-muted small mb-1">RPM (Request/Phút)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={1}
                        value={formData.rpmLimit}
                        onChange={(e) => setFormData({ ...formData, rpmLimit: parseInt(e.target.value) || 1 })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small mb-1">TPM (Token/Phút)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={1}
                        value={formData.tpmLimit}
                        onChange={(e) => setFormData({ ...formData, tpmLimit: parseInt(e.target.value) || 1 })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small mb-1">RPD (Request/Ngày)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min={1}
                        value={formData.rpdLimit}
                        onChange={(e) => setFormData({ ...formData, rpdLimit: parseInt(e.target.value) || 1 })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="form-text small mt-1" style={{ fontSize: "11px" }}>
                    Gemini Free Tier mặc định: 15 RPM · 1,000,000 TPM · 1,500 RPD. Reset lúc 00:00 UTC.
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
              <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </button>
              <button
                type="submit"
                form="addKeyForm"
                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{ width: "12px", height: "12px" }}></span>{" "}
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save"></i> Hoàn tất
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalThemKey;
