import { useState, useEffect } from "react";
import type { KeyApiManage, KeyApiSummary } from "../QuanLyApiKey.types";

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
    hanMucRequest: 5000,
    hanMucToken: 2000000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          tenKey: editData.tenKey,
          maKeyRaw: "", 
          loaiKey: editData.loaiKey,
          thuTuUuTien: editData.thuTuUuTien,
          hanMucRequest: editData.hanMucRequest,
          hanMucToken: editData.hanMucToken,
        });
      } else {
        setFormData({
          tenKey: "",
          maKeyRaw: "",
          loaiKey: "Chính",
          thuTuUuTien: 0,
          hanMucRequest: 5000,
          hanMucToken: 2000000,
        });
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

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
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 akm-modal" style={{ borderRadius: "12px" }}>
            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
              <h5 className="modal-title fw-bold fs-5 text-dark">
                {editData ? "Cập nhật API Key" : "Thêm API Key mới"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
            </div>
            <div className="modal-body px-4 pt-3 pb-4">
              <form id="addKeyForm" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small mb-1">Tên Key</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    placeholder="VD: GPT-4o Production"
                    value={formData.tenKey}
                    onChange={(e) => setFormData({ ...formData, tenKey: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small mb-1">
                    Mã Key (Raw) {editData && <span className="fw-normal text-warning fst-italic">- Bỏ trống nếu không muốn đổi mã</span>}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    required={!editData}
                    placeholder={editData ? "Nhập mã mới (nếu cần)" : "sk-..."}
                    value={formData.maKeyRaw}
                    onChange={(e) => setFormData({ ...formData, maKeyRaw: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <div className="form-text small" style={{ fontSize: "11.5px" }}>Key sẽ được tự động mã hóa AES khi lưu xuống DB.</div>
                </div>
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
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small mb-1">Hạn mức Request</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      min={0}
                      value={formData.hanMucRequest}
                      onChange={(e) => setFormData({ ...formData, hanMucRequest: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted small mb-1">Hạn mức Token</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      min={0}
                      value={formData.hanMucToken}
                      onChange={(e) => setFormData({ ...formData, hanMucToken: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
              <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </button>
              <button type="submit" form="addKeyForm" className="btn btn-sm btn-primary d-flex align-items-center gap-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm" aria-hidden="true" style={{ width: "12px", height: "12px"}}></span> Đang lưu...</>
                ) : (
                  <><i className="bi bi-save"></i> Hoàn tất</>
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
