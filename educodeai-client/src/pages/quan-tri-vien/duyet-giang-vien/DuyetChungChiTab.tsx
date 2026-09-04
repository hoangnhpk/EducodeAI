import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useModalA11y } from "@/hooks/useModalA11y";
import {
  HoSoGiangVienAdminService,
  type ChungChiAdminChild,
  type ChungChiAdminFilter,
  type ChungChiAdminItem,
  type QuyetDinhChungChi,
  type TrangThaiChungChi
} from "@/services/ho-so-giang-vien-admin.service";
import { getAnhDaiDienUrl, layChuCaiAvatar, layMauAvatar } from "@/utils/avatarHelper";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ChoDuyet", label: "Chờ duyệt" },
  { value: "CanBoSung", label: "Cần bổ sung" },
  { value: "DaDuyet", label: "Đã duyệt" },
  { value: "TuChoi", label: "Từ chối" }
];

const statusLabel = (value: string) => value === "HonHop"
  ? "Đã xử lý một phần"
  : STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
const statusClass = (value: string) => value === "DaDuyet"
  ? "user-status-active"
  : value === "TuChoi"
    ? "user-status-permanent-locked"
    : "user-status-locked";
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "—";
const formatSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const safeDownloadName = (name: string) => name.replace(/[\\/:*?"<>|]/g, "_") || "chung-chi";
const errorMessage = (error: any, fallback: string) => error?.response?.data?.message ?? fallback;

type DecisionDraft = {
  trangThai: Exclude<TrangThaiChungChi, "ChoDuyet"> | "";
  lyDo: string;
};

const CertificateAvatar = ({ item }: { item: ChungChiAdminItem }) => {
  const [imageError, setImageError] = useState(false);
  const src = getAnhDaiDienUrl(item.anhDaiDienUrl);
  useEffect(() => setImageError(false), [src]);
  if (src && !imageError) return <img className="lecturer-review-avatar" src={src} alt={item.hoTen} onError={() => setImageError(true)} />;
  const color = layMauAvatar(item.hoTen);
  return <div className="lecturer-review-avatar lecturer-review-avatar--fallback" style={{ background: color.bg, color: color.color }}>{layChuCaiAvatar(item.hoTen)}</div>;
};

const DEFAULT_FILTER: ChungChiAdminFilter = {
  tuKhoa: "",
  trangThai: "",
  donViCap: "",
  tuNgay: "",
  denNgay: "",
  trang: 1,
  kichThuocTrang: 10
};

export default function DuyetChungChiTab() {
  const [filter, setFilter] = useState<ChungChiAdminFilter>(DEFAULT_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<ChungChiAdminFilter>(DEFAULT_FILTER);
  const [items, setItems] = useState<ChungChiAdminItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChungChiAdminItem | null>(null);
  const [decisions, setDecisions] = useState<Record<number, DecisionDraft>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  useModalA11y(Boolean(selected), () => {
    if (!processingId) setSelected(null);
  }, detailRef);

  useEffect(() => {
    if (!selected) {
      setDecisions({});
      return;
    }

    setDecisions(Object.fromEntries(
      selected.chungChis
        .filter((certificate) => certificate.trangThai === "ChoDuyet")
        .map((certificate) => [certificate.maTaiLieu, { trangThai: "", lyDo: "" }])
    ));
  }, [selected]);

  const load = useCallback(async (query: ChungChiAdminFilter) => {
    setLoading(true);
    try {
      const result = await HoSoGiangVienAdminService.layDanhSachChungChi(query);
      if (result.tongSoTrang > 0 && query.trang > result.tongSoTrang) {
        const clamped = { ...query, trang: result.tongSoTrang };
        setFilter((current) => ({ ...current, trang: result.tongSoTrang }));
        setAppliedFilter(clamped);
        return;
      }
      setItems(result.duLieu);
      setTotal(result.tongSo);
      setTotalPages(result.tongSoTrang);
    } catch (error: any) {
      await Swal.fire("Lỗi", errorMessage(error, "Không tải được danh sách yêu cầu chứng chỉ."), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(appliedFilter); }, [appliedFilter, load]);

  const applyFilter = () => {
    if (filter.tuNgay && filter.denNgay && filter.denNgay < filter.tuNgay) {
      void Swal.fire("Khoảng ngày chưa hợp lệ", "Ngày kết thúc không được trước ngày bắt đầu.", "warning");
      return;
    }
    setAppliedFilter({ ...filter, trang: 1 });
    setFilter((current) => ({ ...current, trang: 1 }));
  };

  const clearFilter = () => {
    setFilter(DEFAULT_FILTER);
    setAppliedFilter(DEFAULT_FILTER);
  };

  const changePage = (page: number) => {
    const next = Math.max(1, Math.min(page, Math.max(totalPages, 1)));
    setFilter((current) => ({ ...current, trang: next }));
    setAppliedFilter((current) => ({ ...current, trang: next }));
  };

  const download = async (certificate: ChungChiAdminChild) => {
    try {
      const blob = await HoSoGiangVienAdminService.taiChungChi(certificate.maTaiLieu);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = safeDownloadName(certificate.tenFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      await Swal.fire("Lỗi", errorMessage(error, "Không tải được file chứng chỉ."), "error");
    }
  };

  const reloadAfterMutation = async () => {
    const nextPage = items.length === 1 && appliedFilter.trang > 1
      ? appliedFilter.trang - 1
      : appliedFilter.trang;
    if (nextPage !== appliedFilter.trang) {
      setFilter((current) => ({ ...current, trang: nextPage }));
      setAppliedFilter((current) => ({ ...current, trang: nextPage }));
    } else {
      await load(appliedFilter);
    }
  };

  const openDetail = (item: ChungChiAdminItem) => {
    setSelected(item);
  };

  const updateDecision = (maTaiLieu: number, patch: Partial<DecisionDraft>) => {
    setDecisions((current) => ({
      ...current,
      [maTaiLieu]: { ...current[maTaiLieu], ...patch }
    }));
  };

  const fillApproveAll = () => {
    if (!selected) return;
    setDecisions(Object.fromEntries(
      selected.chungChis
        .filter((certificate) => certificate.trangThai === "ChoDuyet")
        .map((certificate) => [certificate.maTaiLieu, { trangThai: "DaDuyet", lyDo: "" }])
    ));
  };

  const submitDecisions = async () => {
    if (!selected) return;
    const pending = selected.chungChis.filter((certificate) => certificate.trangThai === "ChoDuyet");
    const payload: QuyetDinhChungChi[] = [];
    for (const certificate of pending) {
      const draft = decisions[certificate.maTaiLieu];
      if (!draft?.trangThai) {
        await Swal.fire("Chưa đủ quyết định", `Vui lòng chọn cách xử lý cho chứng chỉ “${certificate.tenChungChi}”.`, "warning");
        return;
      }
      const reason = draft.lyDo.trim();
      if (draft.trangThai !== "DaDuyet" && !reason) {
        await Swal.fire("Chưa nhập lý do", `Vui lòng nhập lý do cho chứng chỉ “${certificate.tenChungChi}”.`, "warning");
        return;
      }
      payload.push({
        maTaiLieu: certificate.maTaiLieu,
        trangThai: draft.trangThai,
        lyDo: draft.trangThai === "DaDuyet" ? undefined : reason,
        phienBan: certificate.phienBan
      });
    }

    if (payload.length === 0) return;
    const approved = payload.filter((item) => item.trangThai === "DaDuyet").length;
    const supplement = payload.filter((item) => item.trangThai === "CanBoSung").length;
    const rejected = payload.filter((item) => item.trangThai === "TuChoi").length;
    const confirmation = await Swal.fire({
      title: "Lưu quyết định?",
      html: `Duyệt: <strong>${approved}</strong> · Cần bổ sung: <strong>${supplement}</strong> · Từ chối: <strong>${rejected}</strong>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lưu quyết định",
      cancelButtonText: "Kiểm tra lại",
      customClass: { container: "qlnv-swal-over-modal" }
    });
    if (!confirmation.isConfirmed) return;

    setProcessingId(selected.maDotGui);
    try {
      await HoSoGiangVienAdminService.quyetDinhChungChi(selected.maDotGui, payload);
      setSelected(null);
      await reloadAfterMutation();
      await Swal.fire("Thành công", "Đã lưu quyết định cho từng chứng chỉ.", "success");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setSelected(null);
        await load(appliedFilter);
        await Swal.fire("Dữ liệu đã thay đổi", errorMessage(error, "Yêu cầu đã được xử lý ở nơi khác. Danh sách đã được tải lại."), "warning");
      } else {
        await Swal.fire("Lỗi", errorMessage(error, "Không thể lưu quyết định chứng chỉ."), "error");
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="lecturer-review-card certificate-review-card">
        <form className="certificate-review-toolbar" onSubmit={(event) => { event.preventDefault(); applyFilter(); }}>
          <div className="lecturer-review-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input className="search-input" value={filter.tuKhoa} onChange={(event) => setFilter({ ...filter, tuKhoa: event.target.value })} placeholder="Tên giảng viên, email, tên chứng chỉ..." aria-label="Tìm yêu cầu chứng chỉ" />
          </div>
          <select className="filter-select" value={filter.trangThai} onChange={(event) => setFilter({ ...filter, trangThai: event.target.value })} aria-label="Lọc trạng thái chứng chỉ">
            {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input className="search-input" value={filter.donViCap} onChange={(event) => setFilter({ ...filter, donViCap: event.target.value })} placeholder="Đơn vị cấp" aria-label="Lọc theo đơn vị cấp" />
          <label className="certificate-date-filter">Từ ngày<input type="date" value={filter.tuNgay} onChange={(event) => setFilter({ ...filter, tuNgay: event.target.value })} /></label>
          <label className="certificate-date-filter">Đến ngày<input type="date" value={filter.denNgay} min={filter.tuNgay || undefined} onChange={(event) => setFilter({ ...filter, denNgay: event.target.value })} /></label>
          <button type="submit" className="btn-action btn-edit"><i className="bi bi-funnel" /> Lọc</button>
          <button type="button" className="lecturer-review-clear" onClick={clearFilter}><i className="bi bi-x-circle" /> Xóa lọc</button>
        </form>

        {!loading && <div className="lecturer-review-result-count">Tìm thấy <strong>{total}</strong> đợt gửi chứng chỉ</div>}
        {loading ? (
          <div className="certificate-review-empty">Đang tải danh sách chứng chỉ...</div>
        ) : items.length === 0 ? (
          <div className="certificate-review-empty">Không tìm thấy yêu cầu chứng chỉ nào.</div>
        ) : (
          <div className="table-responsive">
            <table className="user-table certificate-review-table">
              <thead><tr><th>Giảng viên</th><th>Yêu cầu</th><th>Chứng chỉ</th><th>Ngày gửi</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>{items.map((item) => (
                <tr key={item.maDotGui}>
                  <td><div className="certificate-review-user"><CertificateAvatar item={item} /><div><strong>{item.hoTen}</strong><span>{item.email}</span></div></div></td>
                  <td><strong>Một đợt gửi</strong><small>{item.chungChis.map((certificate) => certificate.tenChungChi).join(", ")}</small></td>
                  <td>{item.soLuongChungChi} chứng chỉ</td>
                  <td>{formatDate(item.ngayTaiLen)}</td>
                  <td><span className={`user-status-badge ${statusClass(item.trangThai)}`}><span className="user-status-dot-indicator" />{statusLabel(item.trangThai)}</span></td>
                  <td><div className="action-group"><button type="button" className="btn-action btn-edit" onClick={() => openDetail(item)}><i className="bi bi-eye" /> Xem</button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        <div className="certificate-pagination">
          <label>Hiển thị<select value={filter.kichThuocTrang} onChange={(event) => { const size = Number(event.target.value); setFilter({ ...filter, trang: 1, kichThuocTrang: size }); setAppliedFilter({ ...appliedFilter, trang: 1, kichThuocTrang: size }); }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></label>
          <span>Trang {totalPages === 0 ? 0 : appliedFilter.trang} / {totalPages}</span>
          <div><button type="button" disabled={appliedFilter.trang <= 1} onClick={() => changePage(appliedFilter.trang - 1)} aria-label="Trang trước"><i className="bi bi-chevron-left" /></button><button type="button" disabled={totalPages === 0 || appliedFilter.trang >= totalPages} onClick={() => changePage(appliedFilter.trang + 1)} aria-label="Trang sau"><i className="bi bi-chevron-right" /></button></div>
        </div>
      </div>

      {selected && (
        <div className="qlnv-modal-overlay" onClick={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="qlnv-modal-card certificate-detail-modal" ref={detailRef} role="dialog" aria-modal="true" aria-labelledby="certificate-detail-title">
            <div className="modal-title" id="certificate-detail-title">Chi tiết yêu cầu chứng chỉ</div>
            <div className="certificate-detail-owner"><CertificateAvatar item={selected} /><div className="certificate-detail-owner-info"><strong>{selected.hoTen}</strong><span>{selected.email}</span></div><span className={`user-status-badge ${statusClass(selected.trangThai)}`}>{statusLabel(selected.trangThai)}</span></div>
            <div className="certificate-batch-detail-summary"><strong>{selected.soLuongChungChi} chứng chỉ</strong><span>Gửi ngày {formatDate(selected.ngayTaiLen)}</span></div>
            {selected.lyDoXuLy && <div className="certificate-detail-reason"><strong>Lý do xử lý:</strong> {selected.lyDoXuLy}</div>}
            <div className="certificate-batch-detail-list">
              {selected.chungChis.map((certificate, index) => {
                const draft = decisions[certificate.maTaiLieu];
                const pending = certificate.trangThai === "ChoDuyet";
                return (
                  <section className="certificate-batch-detail-item" key={certificate.maTaiLieu} aria-labelledby={`certificate-child-${certificate.maTaiLieu}`}>
                    <div className="certificate-child-heading">
                      <h4 id={`certificate-child-${certificate.maTaiLieu}`}>{index + 1}. {certificate.tenChungChi}</h4>
                      <span className={`user-status-badge ${statusClass(certificate.trangThai)}`}>{statusLabel(certificate.trangThai)}</span>
                    </div>
                    <dl className="certificate-detail-grid">
                      <div><dt>Đơn vị cấp</dt><dd>{certificate.donViCap || "—"}</dd></div>
                      <div><dt>Ngày cấp</dt><dd>{formatDate(certificate.ngayCap)}</dd></div>
                      <div><dt>Ngày hết hạn</dt><dd>{formatDate(certificate.ngayHetHan)}</dd></div>
                      <div><dt>Mã chứng chỉ</dt><dd>{certificate.maChungChi || "—"}</dd></div>
                      <div className="certificate-detail-wide"><dt>File</dt><dd>{certificate.tenFile} · {formatSize(certificate.kichThuoc)}</dd></div>
                      {certificate.urlXacMinh && <div className="certificate-detail-wide"><dt>URL xác minh do giảng viên cung cấp</dt><dd><a href={certificate.urlXacMinh} target="_blank" rel="noopener noreferrer">{certificate.urlXacMinh}</a></dd></div>}
                    </dl>
                    {certificate.lyDoXuLy && <div className="certificate-detail-reason"><strong>Phản hồi:</strong> {certificate.lyDoXuLy}</div>}
                    <button type="button" className="btn-action btn-edit certificate-download" onClick={() => void download(certificate)}><i className="bi bi-download" /> Tải file riêng tư</button>
                    {pending && draft && (
                      <fieldset className="certificate-decision-fieldset" disabled={processingId !== null}>
                        <legend>Quyết định cho chứng chỉ này</legend>
                        <div className="certificate-decision-options">
                          {([
                            ["DaDuyet", "Duyệt"],
                            ["CanBoSung", "Yêu cầu bổ sung"],
                            ["TuChoi", "Từ chối"]
                          ] as const).map(([value, label]) => (
                            <label key={value}>
                              <input
                                type="radio"
                                name={`decision-${certificate.maTaiLieu}`}
                                value={value}
                                checked={draft.trangThai === value}
                                onChange={() => updateDecision(certificate.maTaiLieu, { trangThai: value, lyDo: value === "DaDuyet" ? "" : draft.lyDo })}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        {(draft.trangThai === "CanBoSung" || draft.trangThai === "TuChoi") && (
                          <label className="certificate-decision-reason">
                            {draft.trangThai === "CanBoSung" ? "Nội dung cần bổ sung" : "Lý do từ chối"} <span className="text-danger">*</span>
                            <textarea
                              maxLength={1000}
                              value={draft.lyDo}
                              onChange={(event) => updateDecision(certificate.maTaiLieu, { lyDo: event.target.value })}
                              placeholder="Nhập nội dung cụ thể cho chứng chỉ này..."
                            />
                          </label>
                        )}
                      </fieldset>
                    )}
                  </section>
                );
              })}
            </div>
            <div className="modal-actions">
              {selected.chungChis.some((certificate) => certificate.trangThai === "ChoDuyet") && (
                <>
                  <button className="btn-cancel" disabled={processingId !== null} onClick={fillApproveAll}>Duyệt tất cả đang chờ</button>
                  <button className="btn-save" disabled={processingId !== null} onClick={() => void submitDecisions()}>{processingId ? "Đang lưu..." : "Lưu quyết định"}</button>
                </>
              )}
              <button className="btn-cancel" disabled={processingId !== null} onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
