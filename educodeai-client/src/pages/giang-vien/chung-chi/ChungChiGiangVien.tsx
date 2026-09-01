import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import LecturerDocumentUpload, {
  type LecturerCertificateUpload,
  validateCertificateMetadata,
  validateLecturerDocuments
} from "@/components/LecturerDocumentUpload";
import {
  GiangVienChungChiService,
  type ChungChiBoSungUpload,
  type ChungChiGiangVien,
  type DotGuiChungChiGiangVien
} from "@/services/giang-vien-chung-chi.service";
import "@/pages/auth/DangKyGiangVien.css";
import "./ChungChiGiangVien.css";

const STATUS: Record<string, { label: string; className: string }> = {
  ChoDuyet: { label: "Chờ duyệt", className: "pending" },
  CanBoSung: { label: "Cần bổ sung", className: "supplement" },
  DaDuyet: { label: "Đã duyệt", className: "approved" },
  TuChoi: { label: "Từ chối", className: "rejected" },
  HonHop: { label: "Đã xử lý một phần", className: "mixed" }
};

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("vi-VN").format(new Date(value))
  : "—";

const errorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.thongBao === "string" && data.thongBao.trim()) return data.thongBao;
  if (data?.errors && typeof data.errors === "object") {
    const details = Object.values(data.errors)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
    if (details.length > 0) return details.join("\n");
  }
  if (typeof data?.title === "string" && data.title.trim()) return data.title;
  return fallback;
};

export default function ChungChiGiangVien() {
  const [danhSach, setDanhSach] = useState<DotGuiChungChiGiangVien[]>([]);
  const [certificates, setCertificates] = useState<LecturerCertificateUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supplementingBatch, setSupplementingBatch] = useState<string | null>(null);
  const [supplementDrafts, setSupplementDrafts] = useState<Record<number, ChungChiBoSungUpload>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDanhSach(await GiangVienChungChiService.layDanhSach());
    } catch (error: any) {
      await Swal.fire("Lỗi", errorMessage(error, "Không tải được danh sách chứng chỉ."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (certificates.length === 0) {
      await Swal.fire("Chưa chọn chứng chỉ", "Vui lòng chọn ít nhất một file chứng chỉ.", "warning");
      return;
    }

    const metadataError = validateCertificateMetadata(certificates);
    if (metadataError) {
      await Swal.fire("Thông tin chưa hợp lệ", metadataError, "warning");
      return;
    }

    const fileError = await validateLecturerDocuments([], certificates.map((item) => item.file), false);
    if (fileError) {
      await Swal.fire("File chưa hợp lệ", fileError, "warning");
      return;
    }

    setSubmitting(true);
    try {
      await GiangVienChungChiService.guiYeuCau(certificates);
      setCertificates([]);
      await Swal.fire("Đã gửi yêu cầu", `${certificates.length} chứng chỉ đã được gom trong một yêu cầu duyệt.`, "success");
      await load();
    } catch (error: any) {
      await Swal.fire("Không thể gửi", errorMessage(error, "Không thể gửi yêu cầu chứng chỉ."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisibility = async (item: ChungChiGiangVien) => {
    const nextValue = !item.hienThiCongKhai;
    const confirmation = await Swal.fire({
      title: nextValue ? "Hiển thị chứng chỉ?" : "Ẩn chứng chỉ?",
      text: nextValue
        ? "Metadata chứng chỉ này sẽ xuất hiện trên trang khóa học của bạn."
        : "Chứng chỉ sẽ không còn xuất hiện trên trang khóa học.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: nextValue ? "Hiển thị" : "Ẩn",
      cancelButtonText: "Hủy"
    });
    if (!confirmation.isConfirmed) return;

    setUpdatingId(item.maTaiLieu);
    try {
      await GiangVienChungChiService.capNhatHienThi(item.maTaiLieu, nextValue);
      setDanhSach((current) => current.map((batch) => ({
        ...batch,
        chungChis: batch.chungChis.map((certificate) => certificate.maTaiLieu === item.maTaiLieu
          ? { ...certificate, hienThiCongKhai: nextValue }
          : certificate)
      })));
      await Swal.fire("Thành công", nextValue ? "Đã bật hiển thị chứng chỉ." : "Đã ẩn chứng chỉ.", "success");
    } catch (error: any) {
      await Swal.fire("Không thể cập nhật", errorMessage(error, "Không thể thay đổi trạng thái hiển thị."), "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const selectSupplementFile = async (
    batchId: string,
    item: ChungChiGiangVien,
    file?: File
  ) => {
    if (!file) return;
    if (!Number.isSafeInteger(item.phienBan) || item.phienBan < 0) {
      await load();
      await Swal.fire(
        "Dữ liệu chứng chỉ đã cũ",
        "Danh sách đã được tải lại. Vui lòng chọn lại file bổ sung.",
        "warning"
      );
      return;
    }
    const fileError = await validateLecturerDocuments([], [file], false);
    if (fileError) {
      await Swal.fire("File chưa hợp lệ", fileError, "warning");
      return;
    }

    setSupplementingBatch(batchId);
    setSupplementDrafts((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([maTaiLieu]) =>
          danhSach
            .find((batch) => batch.maDotGui === batchId)
            ?.chungChis.some((certificate) => certificate.maTaiLieu === Number(maTaiLieu))
        )
      );
      return {
        ...next,
        [item.maTaiLieu]: {
          maTaiLieu: item.maTaiLieu,
          phienBan: item.phienBan,
          clientId: item.clientRequestId,
          file,
          tenChungChi: item.tenChungChi,
          donViCap: item.donViCap ?? "",
          ngayCap: item.ngayCap ?? "",
          ngayHetHan: item.ngayHetHan ?? "",
          maChungChi: item.maChungChi ?? "",
          urlXacMinh: item.urlXacMinh ?? "",
          relativePath: file.name
        }
      };
    });
  };

  const updateSupplementDraft = (
    maTaiLieu: number,
    patch: Partial<ChungChiBoSungUpload>
  ) => {
    setSupplementDrafts((current) => ({
      ...current,
      [maTaiLieu]: { ...current[maTaiLieu], ...patch }
    }));
  };

  const removeSupplementDraft = (maTaiLieu: number) => {
    setSupplementDrafts((current) => {
      const next = { ...current };
      delete next[maTaiLieu];
      return next;
    });
  };

  const submitSupplement = async (batch: DotGuiChungChiGiangVien) => {
    const drafts = batch.chungChis
      .map((item) => supplementDrafts[item.maTaiLieu])
      .filter((item): item is ChungChiBoSungUpload => Boolean(item));
    if (drafts.length === 0) {
      await Swal.fire("Chưa chọn file", "Vui lòng chọn file thay thế cho ít nhất một chứng chỉ cần bổ sung.", "warning");
      return;
    }

    const hasStaleDraft = drafts.some((draft) => {
      const current = batch.chungChis.find((item) => item.maTaiLieu === draft.maTaiLieu);
      return !current ||
        current.trangThai !== "CanBoSung" ||
        !Number.isSafeInteger(draft.phienBan) ||
        draft.phienBan < 0 ||
        current.phienBan !== draft.phienBan;
    });
    if (hasStaleDraft) {
      setSupplementDrafts((current) => {
        const next = { ...current };
        batch.chungChis.forEach((item) => delete next[item.maTaiLieu]);
        return next;
      });
      setSupplementingBatch(null);
      await load();
      await Swal.fire(
        "Dữ liệu chứng chỉ đã thay đổi",
        "Danh sách đã được tải lại. Vui lòng chọn lại file cho chứng chỉ cần bổ sung.",
        "warning"
      );
      return;
    }

    const metadataError = validateCertificateMetadata(drafts);
    if (metadataError) {
      await Swal.fire("Thông tin chưa hợp lệ", metadataError, "warning");
      return;
    }
    const fileError = await validateLecturerDocuments([], drafts.map((item) => item.file), false);
    if (fileError) {
      await Swal.fire("File chưa hợp lệ", fileError, "warning");
      return;
    }

    setSubmitting(true);
    try {
      await GiangVienChungChiService.boSung(batch.maDotGui, drafts);
      setSupplementDrafts((current) => {
        const next = { ...current };
        drafts.forEach((item) => delete next[item.maTaiLieu]);
        return next;
      });
      setSupplementingBatch(null);
      await Swal.fire("Đã gửi bổ sung", `${drafts.length} chứng chỉ đã được gửi lại để duyệt. Các chứng chỉ khác được giữ nguyên.`, "success");
      await load();
    } catch (error: any) {
      if (error?.response?.status === 409) await load();
      await Swal.fire("Không thể gửi bổ sung", errorMessage(error, "Không thể gửi lại chứng chỉ."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalCertificates = danhSach.reduce((total, batch) => total + batch.chungChis.length, 0);

  return (
    <div className="gv-page gv-certificate-page">
      <header className="gv-certificate-header">
        <div>
          <h1>Chứng chỉ</h1>
          <p>Gửi chứng chỉ để quản trị viên duyệt và chủ động chọn chứng chỉ được hiển thị trên trang khóa học.</p>
        </div>
        <span className="gv-certificate-count">{danhSach.length} yêu cầu · {totalCertificates} chứng chỉ</span>
      </header>

      <section className="gv-certificate-panel" aria-labelledby="gv-certificate-upload-title">
        <div className="gv-certificate-panel-heading">
          <div>
            <h2 id="gv-certificate-upload-title">Gửi chứng chỉ mới</h2>
            <p>Các chứng chỉ gửi cùng lúc được gom thành một yêu cầu. File gốc chỉ quản trị viên có thể xem.</p>
          </div>
        </div>
        <LecturerDocumentUpload
          cvFiles={[]}
          certificates={certificates}
          onCvFilesChange={() => undefined}
          onCertificatesChange={setCertificates}
          onError={(message) => void Swal.fire("File chưa hợp lệ", message, "warning")}
          requireCv={false}
          showCv={false}
        />
        <div className="gv-certificate-submit-row">
          <button type="button" className="gv-certificate-primary" disabled={submitting || certificates.length === 0} onClick={() => void submit()}>
            <i className="fas fa-paper-plane" aria-hidden="true" />
            {submitting ? "Đang gửi..." : `Gửi yêu cầu duyệt${certificates.length ? ` (${certificates.length})` : ""}`}
          </button>
        </div>
      </section>

      <section className="gv-certificate-panel" aria-labelledby="gv-certificate-list-title">
        <div className="gv-certificate-panel-heading">
          <div>
            <h2 id="gv-certificate-list-title">Các yêu cầu chứng chỉ</h2>
            <p>Mỗi khối tương ứng một lần gửi; quản trị viên có thể xử lý riêng từng chứng chỉ trong cùng khối.</p>
          </div>
        </div>

        {loading ? (
          <div className="gv-certificate-empty">Đang tải danh sách...</div>
        ) : danhSach.length === 0 ? (
          <div className="gv-certificate-empty">
            <i className="fas fa-certificate" aria-hidden="true" />
            <strong>Chưa có yêu cầu chứng chỉ</strong>
            <span>Chọn file ở phía trên để gửi yêu cầu đầu tiên.</span>
          </div>
        ) : (
          <div className="gv-certificate-list">
            {danhSach.map((batch) => {
              const status = STATUS[batch.trangThai] ?? { label: batch.trangThai, className: "unknown" };
              return (
                <section className="gv-certificate-card gv-certificate-batch" key={batch.maDotGui}>
                  <div className="gv-certificate-card-top">
                    <div className="gv-certificate-icon"><i className="fas fa-layer-group" aria-hidden="true" /></div>
                    <div className="gv-certificate-title">
                      <h3>Yêu cầu gồm {batch.chungChis.length} chứng chỉ</h3>
                      <span>Gửi ngày {formatDate(batch.ngayTaiLen)}</span>
                    </div>
                    <span className={`gv-certificate-status ${status.className}`}>{status.label}</span>
                  </div>
                  {batch.lyDoXuLy && (
                    <div className="gv-certificate-reason"><strong>Phản hồi từ quản trị viên:</strong> {batch.lyDoXuLy}</div>
                  )}
                  <div className="gv-certificate-batch-items">
                    {batch.chungChis.map((item) => {
                      const approved = item.trangThai === "DaDuyet";
                      const childStatus = STATUS[item.trangThai] ?? { label: item.trangThai, className: "unknown" };
                      const supplementDraft = supplementDrafts[item.maTaiLieu];
                      return (
                        <article className="gv-certificate-batch-item" key={item.maTaiLieu}>
                          <div className="gv-certificate-card-top">
                            <div className="gv-certificate-icon"><i className="fas fa-award" aria-hidden="true" /></div>
                            <div className="gv-certificate-title">
                              <h3>{item.tenChungChi}</h3>
                              <span>{item.donViCap || "Chưa cung cấp đơn vị cấp"}</span>
                            </div>
                            <span className={`gv-certificate-status ${childStatus.className}`}>{childStatus.label}</span>
                          </div>
                          <dl className="gv-certificate-meta">
                            <div><dt>Ngày cấp</dt><dd>{formatDate(item.ngayCap)}</dd></div>
                            <div><dt>Ngày hết hạn</dt><dd>{formatDate(item.ngayHetHan)}</dd></div>
                            <div><dt>Mã chứng chỉ</dt><dd>{item.maChungChiChe || "—"}</dd></div>
                          </dl>
                          {item.lyDoXuLy && (
                            <div className="gv-certificate-reason"><strong>Phản hồi:</strong> {item.lyDoXuLy}</div>
                          )}
                          {item.trangThai === "CanBoSung" && !supplementDraft && (
                            <div className="gv-certificate-supplement-start">
                              <label className="gv-certificate-secondary">
                                <i className="fas fa-file-arrow-up" aria-hidden="true" />
                                Chọn file bổ sung
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                                  disabled={submitting}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    event.target.value = "";
                                    void selectSupplementFile(batch.maDotGui, item, file);
                                  }}
                                />
                              </label>
                              <span>Chỉ chứng chỉ này được gửi lại; các chứng chỉ khác giữ nguyên.</span>
                            </div>
                          )}
                          {item.trangThai === "CanBoSung" && supplementDraft && (
                            <div className="gv-certificate-supplement-editor">
                              <div className="gv-certificate-supplement-file">
                                <strong>{supplementDraft.file.name}</strong>
                                <button type="button" disabled={submitting} onClick={() => removeSupplementDraft(item.maTaiLieu)} aria-label={`Bỏ file bổ sung ${supplementDraft.file.name}`}>
                                  <i className="fas fa-xmark" aria-hidden="true" />
                                </button>
                              </div>
                              <div className="gv-certificate-supplement-fields">
                                <label>Tên chứng chỉ <span className="text-danger">*</span><input maxLength={200} value={supplementDraft.tenChungChi} disabled={submitting} onChange={(event) => updateSupplementDraft(item.maTaiLieu, { tenChungChi: event.target.value })} /></label>
                                <label>Đơn vị cấp<input maxLength={200} value={supplementDraft.donViCap} disabled={submitting} onChange={(event) => updateSupplementDraft(item.maTaiLieu, { donViCap: event.target.value })} /></label>
                                <label>Ngày cấp<input type="date" value={supplementDraft.ngayCap} disabled={submitting} onChange={(event) => updateSupplementDraft(item.maTaiLieu, { ngayCap: event.target.value })} /></label>
                                <label>Ngày hết hạn<input type="date" min={supplementDraft.ngayCap || undefined} value={supplementDraft.ngayHetHan} disabled={submitting} onChange={(event) => updateSupplementDraft(item.maTaiLieu, { ngayHetHan: event.target.value })} /></label>
                                <label>Mã chứng chỉ<input maxLength={100} value={supplementDraft.maChungChi} disabled={submitting} onChange={(event) => updateSupplementDraft(item.maTaiLieu, { maChungChi: event.target.value })} /></label>
                                <label>URL xác minh<input type="url" maxLength={500} value={supplementDraft.urlXacMinh} disabled={submitting} onChange={(event) => updateSupplementDraft(item.maTaiLieu, { urlXacMinh: event.target.value })} placeholder="https://..." /></label>
                              </div>
                            </div>
                          )}
                          <div className="gv-certificate-card-footer">
                            <div>
                              <strong>Hiển thị trên trang khóa học</strong>
                              <span>{approved ? (item.hienThiCongKhai ? "Đang hiển thị" : "Đang ẩn") : "Chỉ khả dụng sau khi chứng chỉ này được duyệt"}</span>
                            </div>
                            <label className={`gv-certificate-switch ${approved ? "" : "disabled"}`}>
                              <input
                                type="checkbox"
                                checked={approved && item.hienThiCongKhai}
                                disabled={!approved || updatingId === item.maTaiLieu}
                                onChange={() => void toggleVisibility(item)}
                                aria-label={`${item.hienThiCongKhai ? "Ẩn" : "Hiển thị"} ${item.tenChungChi}`}
                              />
                              <span aria-hidden="true" />
                            </label>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {batch.chungChis.some((item) => supplementDrafts[item.maTaiLieu]) && (
                    <div className="gv-certificate-supplement-actions">
                      <span>
                        Đã chọn {batch.chungChis.filter((item) => supplementDrafts[item.maTaiLieu]).length} chứng chỉ cần gửi lại.
                      </span>
                      <button
                        type="button"
                        className="gv-certificate-primary"
                        disabled={submitting || supplementingBatch !== batch.maDotGui}
                        onClick={() => void submitSupplement(batch)}
                      >
                        <i className="fas fa-paper-plane" aria-hidden="true" />
                        {submitting && supplementingBatch === batch.maDotGui ? "Đang gửi..." : "Gửi lại các chứng chỉ đã chọn"}
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
