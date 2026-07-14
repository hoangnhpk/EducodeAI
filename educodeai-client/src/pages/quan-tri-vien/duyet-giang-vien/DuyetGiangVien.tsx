import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { HoSoGiangVienAdminService } from "@/services/ho-so-giang-vien-admin.service";
import type { HoSoGiangVienListItem, HoSoGiangVienDetail } from "@/services/ho-so-giang-vien-admin.service";
import "../quan-ly-nguoi-dung/QuanLyNguoiDung.css";

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

const modalWarningSwal = {
  icon: "warning" as const,
  customClass: {
    container: "qlnv-swal-over-modal"
  }
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
  const [dangTai, setDangTai] = useState(true);
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [danhSach, setDanhSach] = useState<HoSoGiangVienListItem[]>([]);
  const [chiTiet, setChiTiet] = useState<HoSoGiangVienDetail | null>(null);
  const [moModal, setMoModal] = useState(false);
  const [hienGiayTo, setHienGiayTo] = useState(false);
  const [maHoSoBoSung, setMaHoSoBoSung] = useState<number | null>(null);
  const [noiDungBoSung, setNoiDungBoSung] = useState("");
  const [maHoSoTuChoi, setMaHoSoTuChoi] = useState<number | null>(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");

  const taiDanhSach = async (tt?: string) => {
    try {
      setDangTai(true);
      const duLieu = await HoSoGiangVienAdminService.layDanhSach(tt);
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

  const handleLoc = (tt: string) => {
    setTrangThaiLoc(tt);
    void taiDanhSach(tt);
  };



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

  const xacNhanDuyet = async (maHoSo: number) => {
    const confirm = await Swal.fire({
      title: "Duyệt hồ sơ?",
      text: "Tài khoản giảng viên sẽ được tạo và email thông báo sẽ gửi đến giảng viên.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Duyệt",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#10b981"
    });
    if (!confirm.isConfirmed) return;

    try {
      await HoSoGiangVienAdminService.duyetHoSo(maHoSo);
      Swal.fire("Thành công", "Đã duyệt hồ sơ và tạo tài khoản giảng viên.", "success");
      setMoModal(false);
      void taiDanhSach(trangThaiLoc);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không thể duyệt hồ sơ.", "error");
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
      void taiDanhSach(trangThaiLoc);
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
      void taiDanhSach(trangThaiLoc);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không thể gửi yêu cầu bổ sung.", "error");
    }
  };

  const baseUrl = import.meta.env.VITE_API_URL || "";
  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Duyệt hồ sơ đăng ký giảng viên</h3>
      </div>

      <div className="toolbar">
        <select
          className="filter-select"
          value={trangThaiLoc}
          onChange={(e) => handleLoc(e.target.value)}
        >
          {TRANG_THAI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {dangTai ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Đang tải danh sách hồ sơ...
        </div>
      ) : danhSach.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
          Không tìm thấy hồ sơ nào
        </div>
      ) : (
        <div className="table-responsive">
          <table className="user-table" style={{ tableLayout: "fixed" }}>
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
              {danhSach.map((hs) => {
                const tt = hienThiTrangThai(hs.trangThaiHoSo);
                return (
                  <tr key={hs.maHoSoDangKyGiangVien}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        {hs.anhDaiDienUrl ? (
                          <img
                            src={`${baseUrl}${hs.anhDaiDienUrl}`}
                            alt={hs.hoTen}
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--border-light)', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0
                          }}>
                            {hs.hoTen ? hs.hoTen[0].toUpperCase() : '?'}
                          </div>
                        )}
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
                        <button className="btn-action btn-edit" title="Xem chi tiết" onClick={() => xemChiTiet(hs.maHoSoDangKyGiangVien)}>
                          Xem
                        </button>
                        {hs.trangThaiHoSo === "ChoDuyet" && (
                          <>
                            <button className="btn-action btn-unlock" title="Duyệt hồ sơ" onClick={() => xacNhanDuyet(hs.maHoSoDangKyGiangVien)}>
                              Duyệt
                            </button>
                            <button className="btn-action btn-lock" title="Yêu cầu bổ sung" onClick={() => xacNhanBoSung(hs.maHoSoDangKyGiangVien)}>
                              Bổ sung
                            </button>
                            <button className="btn-action btn-delete" title="Từ chối hồ sơ" onClick={() => xacNhanTuChoi(hs.maHoSoDangKyGiangVien)}>
                              Từ chối
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

      {/* MODAL Y?U C?U B? SUNG */}
      {maHoSoBoSung && (
        <div className="qlnv-modal-overlay" onClick={(event) => event.target === event.currentTarget && dongModalBoSung()}>
          <div className="qlnv-modal-card" role="dialog" aria-modal="true" style={{ maxWidth: 560 }}>
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
          <div className="qlnv-modal-card" role="dialog" aria-modal="true" style={{ maxWidth: 560 }}>
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
          <div className="qlnv-modal-card" role="dialog" aria-modal="true" style={{ maxWidth: 760 }}>
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
                    {chiTiet.anhDaiDienUrl ? (
                      <img src={`${baseUrl}${chiTiet.anhDaiDienUrl}`} alt="Avatar" style={{ maxWidth: 120, borderRadius: 8 }} />
                    ) : <span className="text-muted">Không có</span>}
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
                    <button className="btn-save" onClick={() => xacNhanDuyet(chiTiet.maHoSoDangKyGiangVien)}>
                      <i className="bi bi-check-lg" /> Duyệt & tạo tài khoản
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
    </div>
  );
}
