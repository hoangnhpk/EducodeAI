import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useModalA11y } from "@/hooks/useModalA11y";
import { HoSoGiangVienAdminService } from "@/services/ho-so-giang-vien-admin.service";
import type { HoSoGiangVienListItem, HoSoGiangVienDetail } from "@/services/ho-so-giang-vien-admin.service";
import { getAnhDaiDienUrl, layChuCaiAvatar, layMauAvatar } from "@/utils/avatarHelper";
import DuyetChungChiTab from "./DuyetChungChiTab";
import "@/assets/styles/AdminTableControls.css";
import "./DuyetGiangVien.css";

const TRANG_THAI_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ChoDuyet", label: "Chờ duyệt" },
  { value: "CanBoSung", label: "Cần bổ sung" },
  { value: "DaDuyet", label: "Đã duyệt" },
  { value: "TuChoi", label: "Từ chối" }
];

const hienThiTrangThai = (tt: string): { text: string; className: string } => {
  switch (tt) {
    case "ChoDuyet":
      return { text: "Chờ duyệt", className: "user-status-locked" };
    case "CanBoSung":
      return { text: "Cần bổ sung", className: "user-status-locked" };
    case "DaDuyet":
      return { text: "Đã duyệt", className: "user-status-active" };
    case "TuChoi":
      return { text: "Từ chối", className: "user-status-permanent-locked" };
    default:
      return { text: tt, className: "user-status-locked" };
  }
};

const ellipsisStyle = {
  display: "block",
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
} as const;

const toExternalUrl = (value?: string | null) => {
  const url = value?.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const chuanHoaTuKhoa = (value?: string | null) => (value ?? "")
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/đ/g, "d")
  .trim();

const formatFileSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const safeDownloadName = (name: string) => name.replace(/[\\/:*?"<>|]/g, "_") || "tai-lieu";

const modalWarningSwal = {
  icon: "warning" as const,
  customClass: {
    container: "qlnv-swal-over-modal"
  }
};

const InstructorApplicationAvatar = ({ src, name }: { src?: string | null; name: string }) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getAnhDaiDienUrl(src);
  const avatarColor = layMauAvatar(name);

  useEffect(() => setImageError(false), [avatarUrl]);

  if (avatarUrl && !imageError) {
    return <img src={avatarUrl} alt={name} className="lecturer-review-avatar" onError={() => setImageError(true)} />;
  }

  return (
    <div className="lecturer-review-avatar lecturer-review-avatar--fallback" style={{ background: avatarColor.bg, color: avatarColor.color }}>
      {layChuCaiAvatar(name)}
    </div>
  );
};

const CCCD_FIELD_LABELS: Record<string, string> = {
  loaiGiayTo: "Lo\u1ea1i gi\u1ea5y t\u1edd",
  hoTen: "H\u1ecd t\u00ean",
  soGiayTo: "S\u1ed1 gi\u1ea5y t\u1edd",
  ngaySinh: "Ng\u00e0y sinh",
  gioiTinh: "Gi\u1edbi t\u00ednh",
  ngayCap: "Ng\u00e0y c\u1ea5p",
  noiCap: "N\u01a1i c\u1ea5p",
  diaChi: "\u0110\u1ecba ch\u1ec9",
  quocTich: "Qu\u1ed1c t\u1ecbch",
  nguyenQuan: "Qu\u00ea qu\u00e1n"
};


export default function DuyetGiangVien() {
  const [activeTab, setActiveTab] = useState<"accounts" | "certificates">("accounts");
  const [dangTai, setDangTai] = useState(true);
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [linhVucLoc, setLinhVucLoc] = useState("");
  const [loaiGiayToLoc, setLoaiGiayToLoc] = useState("");
  const [danhSach, setDanhSach] = useState<HoSoGiangVienListItem[]>([]);
  const [chiTiet, setChiTiet] = useState<HoSoGiangVienDetail | null>(null);
  const [moModal, setMoModal] = useState(false);
  const [hienGiayTo, setHienGiayTo] = useState(false);
  const [maHoSoBoSung, setMaHoSoBoSung] = useState<number | null>(null);
  const [noiDungBoSung, setNoiDungBoSung] = useState("");
  const [maHoSoTuChoi, setMaHoSoTuChoi] = useState<number | null>(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");
  const [maHoSoDangDuyet, setMaHoSoDangDuyet] = useState<number | null>(null);

  const chiTietModalRef = useRef<HTMLDivElement>(null);
  const boSungModalRef = useRef<HTMLDivElement>(null);
  const tuChoiModalRef = useRef<HTMLDivElement>(null);
  useModalA11y(moModal && !!chiTiet, () => setMoModal(false), chiTietModalRef);
  useModalA11y(maHoSoBoSung !== null, () => { setMaHoSoBoSung(null); setNoiDungBoSung(""); }, boSungModalRef);
  useModalA11y(maHoSoTuChoi !== null, () => { setMaHoSoTuChoi(null); setLyDoTuChoi(""); }, tuChoiModalRef);

  const taiDanhSach = async () => {
    try {
      setDangTai(true);
      const duLieu = await HoSoGiangVienAdminService.layDanhSach();
      setDanhSach(duLieu);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không tải được danh sách hồ sơ.", "error");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    void taiDanhSach();
  }, []);

  const linhVucOptions = useMemo(() => Array.from(new Set(
    danhSach.map((hs) => hs.linhVucGiangDay?.trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, "vi")), [danhSach]);

  const loaiGiayToOptions = useMemo(() => Array.from(new Set(
    danhSach.map((hs) => hs.loaiGiayTo?.trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, "vi")), [danhSach]);

  const danhSachHienThi = useMemo(() => {
    const keyword = chuanHoaTuKhoa(tuKhoa);
    return danhSach.filter((hs) => {
      const khopTuKhoa = !keyword || [
        hs.hoTen,
        hs.email,
        hs.soDienThoai,
        hs.linhVucGiangDay,
        hs.loaiGiayTo,
        String(hs.maHoSoDangKyGiangVien)
      ].some((value) => chuanHoaTuKhoa(value).includes(keyword));

      return khopTuKhoa
        && (!trangThaiLoc || hs.trangThaiHoSo === trangThaiLoc)
        && (!linhVucLoc || hs.linhVucGiangDay?.trim() === linhVucLoc)
        && (!loaiGiayToLoc || hs.loaiGiayTo?.trim() === loaiGiayToLoc);
    });
  }, [danhSach, linhVucLoc, loaiGiayToLoc, trangThaiLoc, tuKhoa]);

  const xoaBoLoc = () => {
    setTuKhoa("");
    setTrangThaiLoc("");
    setLinhVucLoc("");
    setLoaiGiayToLoc("");
  };

  const coBoLoc = Boolean(tuKhoa || trangThaiLoc || linhVucLoc || loaiGiayToLoc);



  const xemChiTiet = async (maHoSo: number) => {
    try {
      const ct = await HoSoGiangVienAdminService.layChiTiet(maHoSo);
      setChiTiet(ct);
      setMoModal(true);
      setHienGiayTo(false);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không tải được chi tiết hồ sơ.", "error");
    }
  };

  const taiTaiLieu = async (maTaiLieu: number, tenFile: string) => {
    if (!chiTiet) return;
    try {
      const blob = await HoSoGiangVienAdminService.taiTaiLieu(chiTiet.maHoSoDangKyGiangVien, maTaiLieu);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = safeDownloadName(tenFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không tải được tài liệu.", "error");
    }
  };

  const xacNhanDuyet = async (maHoSo: number) => {
    const confirm = await Swal.fire({
      title: "Duyệt hồ sơ?",
      text: "Tài khoản giảng viên sẽ được tạo và email thông báo sẽ gửi đến giảng viên.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Duyệt",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "var(--success)",
      customClass: {
        container: "qlnv-swal-over-modal"
      }
    });
    if (!confirm.isConfirmed) return;

    try {
      setMaHoSoDangDuyet(maHoSo);
      const result = await HoSoGiangVienAdminService.duyetHoSo(maHoSo);
      setMoModal(false);
      await taiDanhSach();
      await Swal.fire("Thành công", result?.message ?? "Đã duyệt hồ sơ và tạo tài khoản giảng viên.", "success");
    } catch (error: any) {
      await Swal.fire("Lỗi", error?.response?.data?.message ?? "Không thể duyệt hồ sơ.", "error");
    } finally {
      setMaHoSoDangDuyet(null);
    }
  };

  const xacNhanTuChoi = (maHoSo: number) => {
    setMoModal(false);
    setMaHoSoTuChoi(maHoSo);
    setLyDoTuChoi("");
  };

  const dongModalTuChoi = () => {
    setMaHoSoTuChoi(null);
    setLyDoTuChoi("");
  };

  const guiTuChoi = async () => {
    if (!maHoSoTuChoi) return;

    const lyDo = lyDoTuChoi.trim();
    if (!lyDo) {
      Swal.fire({
        ...modalWarningSwal,
        title: "\u0054hi\u1ebfu l\u00fd do",
        text: "\u0056ui l\u00f2ng nh\u1eadp l\u00fd do t\u1eeb ch\u1ed1i h\u1ed3 s\u01a1."
      });
      return;
    }

    try {
      await HoSoGiangVienAdminService.tuChoiHoSo(maHoSoTuChoi, lyDo);
      dongModalTuChoi();
      Swal.fire("Thành công", "Đã từ chối hồ sơ và gửi email thông báo.", "success");
      void taiDanhSach();
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không thể từ chối hồ sơ.", "error");
    }
  };

  const xacNhanBoSung = (maHoSo: number) => {
    setMoModal(false);
    setMaHoSoBoSung(maHoSo);
    setNoiDungBoSung("");
  };

  const dongModalBoSung = () => {
    setMaHoSoBoSung(null);
    setNoiDungBoSung("");
  };

  const guiYeuCauBoSung = async () => {
    if (!maHoSoBoSung) return;

    const noiDung = noiDungBoSung.trim();
    if (!noiDung) {
      Swal.fire({
        ...modalWarningSwal,
        title: "\u0054hi\u1ebfu n\u1ed9i dung",
        text: "\u0056ui l\u00f2ng nh\u1eadp n\u1ed9i dung c\u1ea7n b\u1ed5 sung."
      });
      return;
    }

    try {
      await HoSoGiangVienAdminService.yeuCauBoSung(maHoSoBoSung, noiDung);
      dongModalBoSung();
      Swal.fire("Thành công", "Đã gửi yêu cầu bổ sung hồ sơ.", "success");
      void taiDanhSach();
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không thể gửi yêu cầu bổ sung.", "error");
    }
  };

  return (
    <div className="qtv-page-content lecturer-review-page">
      <div className="lecturer-review-header">
        <h3 className="fw-bold mb-0">Duyệt giảng viên</h3>
      </div>

      <div className="lecturer-review-tabs" role="tablist" aria-label="Loại yêu cầu cần duyệt">
        <button type="button" role="tab" aria-selected={activeTab === "accounts"} className={`lecturer-review-tab ${activeTab === "accounts" ? "active" : ""}`} onClick={() => setActiveTab("accounts")}>
          <i className="bi bi-person-check" aria-hidden="true" /> Tài khoản
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "certificates"} className={`lecturer-review-tab ${activeTab === "certificates" ? "active" : ""}`} onClick={() => setActiveTab("certificates")}>
          <i className="bi bi-award" aria-hidden="true" /> Chứng chỉ
        </button>
      </div>

      {activeTab === "certificates" ? <DuyetChungChiTab /> : <>
      <div className="lecturer-review-card">
        <div className="lecturer-review-toolbar">
          <div className="lecturer-review-search">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              className="search-input"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT, lĩnh vực..."
              aria-label="Tìm kiếm hồ sơ giảng viên"
            />
          </div>
          <select className="filter-select" value={trangThaiLoc} onChange={(e) => setTrangThaiLoc(e.target.value)} aria-label="Lọc theo trạng thái">
            {TRANG_THAI_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select className="filter-select" value={linhVucLoc} onChange={(e) => setLinhVucLoc(e.target.value)} aria-label="Lọc theo lĩnh vực">
            <option value="">Tất cả lĩnh vực</option>
            {linhVucOptions.map((linhVuc) => <option key={linhVuc} value={linhVuc}>{linhVuc}</option>)}
          </select>
          <select className="filter-select" value={loaiGiayToLoc} onChange={(e) => setLoaiGiayToLoc(e.target.value)} aria-label="Lọc theo loại giấy tờ">
            <option value="">Tất cả giấy tờ</option>
            {loaiGiayToOptions.map((loaiGiayTo) => <option key={loaiGiayTo} value={loaiGiayTo}>{loaiGiayTo}</option>)}
          </select>
          {coBoLoc && (
            <button type="button" className="lecturer-review-clear" onClick={xoaBoLoc}>
              <i className="bi bi-x-circle" aria-hidden="true"></i>
              Xóa lọc
            </button>
          )}
        </div>

        {!dangTai && (
          <div className="lecturer-review-result-count">
            Hiển thị <strong>{danhSachHienThi.length}</strong> / {danhSach.length} hồ sơ
          </div>
        )}

      {dangTai ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Đang tải danh sách hồ sơ...
        </div>
      ) : danhSachHienThi.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
          Không tìm thấy hồ sơ nào
        </div>
      ) : (
        <div className="table-responsive">
          <table className="user-table lecturer-review-table">
            <thead>
              <tr>
                <th style={{ width: '23%' }}>Người dùng</th>
                <th style={{ width: '22%' }}>Email</th>
                <th style={{ width: '14%' }}>Lĩnh vực</th>
                <th style={{ width: '120px' }}>Ngày đăng ký</th>
                <th style={{ width: '18%' }}>Trạng thái</th>
                <th style={{ width: '280px', textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {danhSachHienThi.map((hs) => {
                const tt = hienThiTrangThai(hs.trangThaiHoSo);
                return (
                  <tr key={hs.maHoSoDangKyGiangVien}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <InstructorApplicationAvatar src={hs.anhDaiDienUrl} name={hs.hoTen} />
                        <span style={{ ...ellipsisStyle, fontWeight: 600, color: 'var(--text-dark)' }} title={hs.hoTen}>
                          {hs.hoTen}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={hs.email}>
                      {hs.email}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={hs.linhVucGiangDay}>
                      {hs.linhVucGiangDay}
                    </td>
                    <td style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                      {new Date(hs.ngayTao).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <span className={`user-status-badge ${tt.className}`}>
                        <span className="user-status-dot-indicator"></span>
                        {tt.text}
                      </span>
                    </td>
                    <td>
                      <div className="action-group" style={{ justifyContent: 'center' }}>
                        <button className="btn-action btn-edit" title="Xem chi tiết" aria-label={`Xem chi tiết hồ sơ ${hs.hoTen}`} onClick={() => xemChiTiet(hs.maHoSoDangKyGiangVien)}>
                          <i className="bi bi-eye" aria-hidden="true"></i>
                          <span>Xem</span>
                        </button>
                        {hs.trangThaiHoSo === "ChoDuyet" && (
                          <>
                            <button
                              className="btn-action btn-unlock"
                              title="Duyệt hồ sơ"
                              aria-label={`Duyệt hồ sơ ${hs.hoTen}`}
                              disabled={maHoSoDangDuyet !== null}
                              onClick={() => xacNhanDuyet(hs.maHoSoDangKyGiangVien)}
                            >
                              <i className={`bi ${maHoSoDangDuyet === hs.maHoSoDangKyGiangVien ? "bi-arrow-repeat lecturer-review-spin" : "bi-check-lg"}`} aria-hidden="true"></i>
                              <span>{maHoSoDangDuyet === hs.maHoSoDangKyGiangVien ? "Đang duyệt" : "Duyệt"}</span>
                            </button>
                            <button className="btn-action btn-lock" title="Yêu cầu bổ sung" aria-label={`Yêu cầu bổ sung hồ sơ ${hs.hoTen}`} onClick={() => xacNhanBoSung(hs.maHoSoDangKyGiangVien)}>
                              <i className="bi bi-pencil" aria-hidden="true"></i>
                              <span>Bổ sung</span>
                            </button>
                            <button className="btn-action btn-delete" title="Từ chối hồ sơ" aria-label={`Từ chối hồ sơ ${hs.hoTen}`} onClick={() => xacNhanTuChoi(hs.maHoSoDangKyGiangVien)}>
                              <i className="bi bi-x-lg" aria-hidden="true"></i>
                              <span>Từ chối</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* MODAL Y?U C?U B? SUNG */}
      {maHoSoBoSung && (
        <div className="qlnv-modal-overlay" onClick={(event) => event.target === event.currentTarget && dongModalBoSung()}>
          <div className="qlnv-modal-card" ref={boSungModalRef} role="dialog" aria-modal="true" style={{ maxWidth: 560 }}>
            <div className="modal-title">Yêu cầu bổ sung hồ sơ</div>
            <div className="form-group">
                            <textarea
                rows={5}
                value={noiDungBoSung}
                onChange={(event) => setNoiDungBoSung(event.target.value)}
                placeholder="Nhập nội dung cần giảng viên bổ sung..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={dongModalBoSung}>Huỷ</button>
              <button className="btn-save" onClick={guiYeuCauBoSung}>Gửi yêu cầu</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL T? CH?I */}
      {maHoSoTuChoi && (
        <div className="qlnv-modal-overlay" onClick={(event) => event.target === event.currentTarget && dongModalTuChoi()}>
          <div className="qlnv-modal-card" ref={tuChoiModalRef} role="dialog" aria-modal="true" style={{ maxWidth: 560 }}>
            <div className="modal-title">Lý do từ chối</div>
            <div className="form-group">
                            <textarea
                rows={5}
                value={lyDoTuChoi}
                onChange={(event) => setLyDoTuChoi(event.target.value)}
                placeholder="Nhập lý do từ chối hồ sơ..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={dongModalTuChoi}>Huỷ</button>
              <button
                className="btn-save"
                style={{ background: "var(--danger)", boxShadow: "0 8px 20px rgba(239, 68, 68, 0.28)" }}
                onClick={guiTuChoi}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {moModal && chiTiet && (
        <div className="qlnv-modal-overlay" onClick={(event) => event.target === event.currentTarget && setMoModal(false)}>
          <div className="qlnv-modal-card" ref={chiTietModalRef} role="dialog" aria-modal="true" style={{ maxWidth: 760 }}>
            <div className="modal-title">Chi tiết hồ sơ: {chiTiet.hoTen}</div>
            <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 4 }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p><b>Tài khoản đăng nhập:</b> {chiTiet.taiKhoan}</p>
                    <p><b>Email:</b> {chiTiet.email}</p>
                    <p><b>Số điện thoại:</b> {chiTiet.soDienThoai || "—"}</p>
                    <p><b>Lĩnh vực giảng dạy:</b> {chiTiet.linhVucGiangDay}</p>
                    <p><b>LinkedIn:</b> {toExternalUrl(chiTiet.linkedInUrl) ? <a href={toExternalUrl(chiTiet.linkedInUrl)!} target="_blank" rel="noopener noreferrer">Xem</a> : "?"}</p>
                    <p><b>Website:</b> {toExternalUrl(chiTiet.websiteUrl) ? <a href={toExternalUrl(chiTiet.websiteUrl)!} target="_blank" rel="noopener noreferrer">Xem</a> : "?"}</p>
                  </div>
                  <div className="col-md-6">
                    <p><b>Phương thức thanh toán:</b> {chiTiet.phuongThucThanhToan || "—"}</p>
                    <p><b>Ngân hàng:</b> {chiTiet.tenNganHang || "—"}</p>
                    <p><b>Số TK nhận tiền:</b> {chiTiet.soTaiKhoanNhanTien || "—"}</p>
                    <p><b>Tên chủ TK:</b> {chiTiet.tenChuTaiKhoan || "—"}</p>
                    <p><b>Mã số thuế:</b> {chiTiet.maSoThue || "—"}</p>
                    <p><b>Loại đối tượng thuế:</b> {chiTiet.loaiDoiTuongThue === "DoanhNghiep" ? "Doanh nghiệp" : chiTiet.loaiDoiTuongThue === "CaNhan" ? "Cá nhân" : chiTiet.loaiDoiTuongThue?.trim() || "Chưa khai báo"}</p>
                  </div>
                  <div className="col-12">
                    <p><b>Tiểu sử:</b></p>
                    <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{chiTiet.tieuSu || "—"}</p>
                  </div>
                  <div className="col-12">
                    <p><b>Ảnh đại diện:</b></p>
                    <div className="lecturer-review-detail-avatar">
                      <InstructorApplicationAvatar src={chiTiet.anhDaiDienUrl} name={chiTiet.hoTen} />
                    </div>
                  </div>
                  <div className="col-12 mt-4">
                    <h6 className="mb-3 fw-bold">CV và chứng chỉ chuyên môn</h6>
                    {chiTiet.taiLieus?.length ? (
                      <div className="lecturer-document-review-list">
                        {chiTiet.taiLieus.map((taiLieu) => (
                          <div className="lecturer-document-review-item" key={taiLieu.maTaiLieu}>
                            <div className="lecturer-document-review-icon">
                              <i className={`bi ${taiLieu.loaiTaiLieu === "CV" ? "bi-file-earmark-person" : "bi-award"}`} aria-hidden="true" />
                            </div>
                            <div className="lecturer-document-review-info">
                              <strong>{taiLieu.loaiTaiLieu === "ChungChi" ? (taiLieu.tenChungChi || "Chứng chỉ chuyên môn (dữ liệu cũ)") : taiLieu.tenFile}</strong>
                              <span>
                                {taiLieu.loaiTaiLieu === "CV" ? "CV" : "Chứng chỉ"} · {formatFileSize(taiLieu.kichThuoc)} · {hienThiTrangThai(taiLieu.trangThai).text}
                              </span>
                              {taiLieu.loaiTaiLieu === "ChungChi" && (
                                <div className="lecturer-certificate-review-metadata">
                                  <span><b>File:</b> {taiLieu.tenFile}</span>
                                  {taiLieu.donViCap && <span><b>Đơn vị cấp:</b> {taiLieu.donViCap}</span>}
                                  {(taiLieu.ngayCapChungChi || taiLieu.ngayHetHanChungChi) && (
                                    <span><b>Hiệu lực:</b> {taiLieu.ngayCapChungChi ? new Date(`${taiLieu.ngayCapChungChi}T00:00:00`).toLocaleDateString("vi-VN") : "—"} đến {taiLieu.ngayHetHanChungChi ? new Date(`${taiLieu.ngayHetHanChungChi}T00:00:00`).toLocaleDateString("vi-VN") : "không thời hạn"}</span>
                                  )}
                                  {taiLieu.maChungChi && <span><b>Mã chứng chỉ:</b> {taiLieu.maChungChi}</span>}
                                  {taiLieu.urlXacMinh && <a href={taiLieu.urlXacMinh} target="_blank" rel="noopener noreferrer">Mở trang xác minh</a>}
                                </div>
                              )}
                              {taiLieu.lyDoTuChoi && <small>Lý do: {taiLieu.lyDoTuChoi}</small>}
                            </div>
                            <button type="button" className="btn-action btn-edit" onClick={() => void taiTaiLieu(taiLieu.maTaiLieu, taiLieu.tenFile)}>
                              <i className="bi bi-download" aria-hidden="true" />
                              <span>Tải xuống</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-warning mb-0">Hồ sơ chưa có CV hoặc chứng chỉ chuyên môn.</div>
                    )}
                  </div>
                  <div className="col-12 mt-4">
                    <div className="d-flex align-items-center mb-3">
                      <h6 className="mb-0 me-2 fw-bold">Giấy tờ tùy thân</h6>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary border-0" 
                        onClick={() => setHienGiayTo(!hienGiayTo)}
                        title={hienGiayTo ? "Ẩn" : "Hiện"}
                      >
                        <i className={`bi ${hienGiayTo ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                      </button>
                    </div>
                    {hienGiayTo ? (
                      <div className="row g-3 p-3 bg-light rounded border">
                        <div className="col-md-6">
                          <p><b>Loại giấy tờ:</b> {chiTiet.loaiGiayTo}</p>
                        </div>
                        <div className="col-md-6">
                          <p><b>Số giấy tờ:</b> {chiTiet.soGiayTo}</p>
                        </div>
                        <div className="col-12">
                          <p className="mb-2"><b>Dữ liệu quét đã mã hóa:</b></p>
                          {chiTiet.thongTinCccdQuet && Object.keys(chiTiet.thongTinCccdQuet).length > 0 ? (
                            <dl className="row mb-0">
                              {Object.entries(chiTiet.thongTinCccdQuet).map(([key, value]) => (
                                <React.Fragment key={key}>
                                  <dt className="col-sm-3">{CCCD_FIELD_LABELS[key] || key}</dt>
                                  <dd className="col-sm-9">{value || "—"}</dd>
                                </React.Fragment>
                              ))}
                            </dl>
                          ) : <span className="text-muted">Chưa có dữ liệu quét hoặc dữ liệu cũ chưa được mã hóa.</span>}
                          <small className="text-muted d-block mt-2">Ảnh CCCD không được lưu trong hệ thống.</small>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted fst-italic">Thông tin đã bị ẩn để bảo mật. Bấm vào biểu tượng mắt để xem.</p>
                    )}
                  </div>
                  {chiTiet.lyDoTuChoi && chiTiet.trangThaiHoSo === "CanBoSung" && (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <b>Yêu cầu bổ sung đã gửi cho giảng viên:</b> {chiTiet.lyDoTuChoi}
                        <div className="small text-muted mt-1">Giảng viên sẽ cập nhật qua trang tra cứu hồ sơ. Khi nộp lại, hồ sơ sẽ chuyển về "Chờ duyệt".</div>
                      </div>
                    </div>
                  )}
                  {chiTiet.lyDoTuChoi && chiTiet.trangThaiHoSo === "TuChoi" && (
                    <div className="col-12">
                      <div className="alert alert-danger">
                        <b>Lý do từ chối:</b> {chiTiet.lyDoTuChoi}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            <div className="modal-actions">
                {chiTiet.trangThaiHoSo === "ChoDuyet" && (
                  <>
                    <button
                      className="btn-save"
                      disabled={maHoSoDangDuyet !== null}
                      onClick={() => xacNhanDuyet(chiTiet.maHoSoDangKyGiangVien)}
                    >
                      <i className={`bi ${maHoSoDangDuyet === chiTiet.maHoSoDangKyGiangVien ? "bi-arrow-repeat lecturer-review-spin" : "bi-check-lg"}`} />
                      {maHoSoDangDuyet === chiTiet.maHoSoDangKyGiangVien ? " Đang duyệt..." : " Duyệt & tạo tài khoản"}
                    </button>
                    <button className="btn-cancel" onClick={() => xacNhanBoSung(chiTiet.maHoSoDangKyGiangVien)}>
                      <i className="bi bi-pencil" /> Yêu cầu bổ sung
                    </button>
                    <button
                      className="btn-cancel"
                      style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                      onClick={() => xacNhanTuChoi(chiTiet.maHoSoDangKyGiangVien)}
                    >
                      <i className="bi bi-x-lg" /> Từ chối
                    </button>
                  </>
                )}
                <button className="btn-cancel" onClick={() => setMoModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  );
}
