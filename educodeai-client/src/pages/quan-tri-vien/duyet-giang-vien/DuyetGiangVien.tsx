import { useEffect, useState } from "react";
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

export default function DuyetGiangVien() {
  const [dangTai, setDangTai] = useState(true);
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [danhSach, setDanhSach] = useState<HoSoGiangVienListItem[]>([]);
  const [chiTiet, setChiTiet] = useState<HoSoGiangVienDetail | null>(null);
  const [moModal, setMoModal] = useState(false);

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
      confirmButtonColor: "#28a745"
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

  const xacNhanTuChoi = async (maHoSo: number) => {
    const { value: lyDo, isConfirmed } = await Swal.fire({
      title: "Lý do từ chối",
      input: "textarea",
      inputPlaceholder: "Nhập lý do từ chối hồ sơ...",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc3545",
      inputValidator: (v) => (!v.trim() ? "Vui lòng nhập lý do" : undefined)
    });
    if (!isConfirmed) return;

    try {
      await HoSoGiangVienAdminService.tuChoiHoSo(maHoSo, lyDo.trim());
      Swal.fire("Thành công", "Đã từ chối hồ sơ và gửi email thông báo.", "success");
      setMoModal(false);
      void taiDanhSach(trangThaiLoc);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.message ?? "Không thể từ chối hồ sơ.", "error");
    }
  };

  const xacNhanBoSung = async (maHoSo: number) => {
    const { value: noiDung, isConfirmed } = await Swal.fire({
      title: "Yêu cầu bổ sung",
      input: "textarea",
      inputPlaceholder: "Nhập nội dung cần giảng viên bổ sung...",
      showCancelButton: true,
      confirmButtonText: "Gửi yêu cầu",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#fb873f",
      inputValidator: (v) => (!v.trim() ? "Vui lòng nhập nội dung" : undefined)
    });
    if (!isConfirmed) return;

    try {
      await HoSoGiangVienAdminService.yeuCauBoSung(maHoSo, noiDung.trim());
      Swal.fire("Thành công", "Đã gửi yêu cầu bổ sung hồ sơ.", "success");
      setMoModal(false);
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
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Đang tải danh sách hồ sơ...
        </div>
      ) : danhSach.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
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
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #f1f5f9', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: '#f1f5f9', color: '#64748b',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0
                          }}>
                            {hs.hoTen ? hs.hoTen[0].toUpperCase() : '?'}
                          </div>
                        )}
                        <span style={{ ...ellipsisStyle, fontWeight: 600, color: '#1e293b' }} title={hs.hoTen}>
                          {hs.hoTen}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={hs.email}>
                      {hs.email}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={hs.linhVucGiangDay}>
                      {hs.linhVucGiangDay}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>
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

      {/* MODAL CHI TIẾT */}
      {moModal && chiTiet && (
        <div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết hồ sơ: {chiTiet.hoTen}</h5>
                <button type="button" className="btn-close" onClick={() => setMoModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <p><b>Tài khoản đăng nhập:</b> {chiTiet.taiKhoan}</p>
                    <p><b>Email:</b> {chiTiet.email}</p>
                    <p><b>Số điện thoại:</b> {chiTiet.soDienThoai || "—"}</p>
                    <p><b>Lĩnh vực giảng dạy:</b> {chiTiet.linhVucGiangDay}</p>
                    <p><b>LinkedIn:</b> {chiTiet.linkedInUrl ? <a href={chiTiet.linkedInUrl} target="_blank" rel="noreferrer">Xem</a> : "—"}</p>
                    <p><b>Website:</b> {chiTiet.websiteUrl ? <a href={chiTiet.websiteUrl} target="_blank" rel="noreferrer">Xem</a> : "—"}</p>
                  </div>
                  <div className="col-md-6">
                    <p><b>Loại giấy tờ:</b> {chiTiet.loaiGiayTo}</p>
                    <p><b>Số giấy tờ:</b> {chiTiet.soGiayTo}</p>
                    <p><b>Ngân hàng:</b> {chiTiet.tenNganHang || "—"}</p>
                    <p><b>Số TK nhận tiền:</b> {chiTiet.soTaiKhoanNhanTien || "—"}</p>
                    <p><b>Tên chủ TK:</b> {chiTiet.tenChuTaiKhoan || "—"}</p>
                    <p><b>Mã số thuế:</b> {chiTiet.maSoThue || "—"}</p>
                  </div>
                  <div className="col-12">
                    <p><b>Tiểu sử:</b></p>
                    <p className="text-muted">{chiTiet.tieuSu}</p>
                  </div>
                  <div className="col-12">
                    <p><b>Ảnh đại diện:</b></p>
                    {chiTiet.anhDaiDienUrl ? (
                      <img src={`${baseUrl}${chiTiet.anhDaiDienUrl}`} alt="Avatar" style={{ maxWidth: 120, borderRadius: 8 }} />
                    ) : <span className="text-muted">Không có</span>}
                  </div>
                  <div className="col-md-6">
                    <p><b>Ảnh giấy tờ mặt trước:</b></p>
                    <img src={`${baseUrl}${chiTiet.anhGiayToMatTruocUrl}`} alt="Mặt trước" style={{ maxWidth: "100%", borderRadius: 8 }} />
                  </div>
                  <div className="col-md-6">
                    <p><b>Ảnh giấy tờ mặt sau:</b></p>
                    <img src={`${baseUrl}${chiTiet.anhGiayToMatSauUrl}`} alt="Mặt sau" style={{ maxWidth: "100%", borderRadius: 8 }} />
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
              <div className="modal-footer">
                {chiTiet.trangThaiHoSo === "ChoDuyet" && (
                  <>
                    <button className="btn btn-success" onClick={() => xacNhanDuyet(chiTiet.maHoSoDangKyGiangVien)}>
                      <i className="bi bi-check-lg" /> Duyệt & tạo tài khoản
                    </button>
                    <button className="btn btn-outline-warning" onClick={() => xacNhanBoSung(chiTiet.maHoSoDangKyGiangVien)}>
                      <i className="bi bi-pencil" /> Yêu cầu bổ sung
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => xacNhanTuChoi(chiTiet.maHoSoDangKyGiangVien)}>
                      <i className="bi bi-x-lg" /> Từ chối
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={() => setMoModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}