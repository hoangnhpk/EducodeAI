import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { RutTienGiangVienService } from "@/services/rut-tien-giang-vien.service";
import type { YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";
import { hienThiTrangThaiYeuCauRutTien } from "@/utils/rut-tien-trang-thai";
import { enrichYeuCauRutTienVoiQrPreview } from "@/utils/vietqr-rut-tien";
import "./QuanLyRutTienGiangVien.css";

const getStatusClassName = (status: string) => {
  switch (status) {
    case "CHO_DUYET":
      return "adm-wd-badge--wait";
    case "CHO_CHUYEN_KHOAN":
      return "adm-wd-badge--progress";
    case "DA_CHUYEN_KHOAN":
      return "adm-wd-badge--done";
    case "TU_CHOI":
      return "adm-wd-badge--reject";
    default:
      return "adm-wd-badge--default";
  }
};

export default function QuanLyRutTienGiangVien() {
  const [dangTai, setDangTai] = useState<boolean>(true);
  const [trangThaiLoc, setTrangThaiLoc] = useState<string>("");
  const [danhSach, setDanhSach] = useState<YeuCauRutTienChiTietDTO[]>([]);

  const [moChiTiet, setMoChiTiet] = useState(false);
  const [chiTiet, setChiTiet] = useState<YeuCauRutTienChiTietDTO | null>(null);
  const boDemModalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boDemBangRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const taiDanhSach = async (trangThai?: string, imLang = false) => {
    try {
      if (!imLang) setDangTai(true);
      const duLieu = await RutTienGiangVienService.layDanhSachAdmin(trangThai || undefined);
      setDanhSach(duLieu);
    } catch (error: unknown) {
      if (!imLang) {
        const msg =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { thongBao?: string } } }).response?.data?.thongBao
            : undefined;
        Swal.fire("Lỗi", msg ?? "Không tải được danh sách rút tiền.", "error");
      }
    } finally {
      if (!imLang) setDangTai(false);
    }
  };

  useEffect(() => {
    void taiDanhSach();
  }, []);

  /** Khi còn yêu cầu chờ xử lý: làm mới bảng định kỳ (admin không cần F5 sau webhook SePay). */
  const coYeuCauDangCho = danhSach.some(
    (x) => x.trangThaiYeuCau === "CHO_DUYET" || x.trangThaiYeuCau === "CHO_CHUYEN_KHOAN"
  );
  useEffect(() => {
    if (!coYeuCauDangCho) {
      if (boDemBangRef.current) {
        clearInterval(boDemBangRef.current);
        boDemBangRef.current = null;
      }
      return;
    }
    boDemBangRef.current = setInterval(() => {
      void taiDanhSach(trangThaiLoc, true);
    }, 5000);
    return () => {
      if (boDemBangRef.current) {
        clearInterval(boDemBangRef.current);
        boDemBangRef.current = null;
      }
    };
  }, [coYeuCauDangCho, trangThaiLoc]);

  /**
   * Giống trang mua khóa học: khi modal chi tiết mở, poll API để bắt SePay webhook đã cập nhật DB → Swal + đồng bộ UI.
   */
  useEffect(() => {
    if (boDemModalRef.current) {
      clearInterval(boDemModalRef.current);
      boDemModalRef.current = null;
    }
    if (!moChiTiet || !chiTiet) return;
    if (chiTiet.trangThaiYeuCau === "DA_CHUYEN_KHOAN" || chiTiet.trangThaiYeuCau === "TU_CHOI") {
      return;
    }

    const ma = chiTiet.maYeuCauRutTien;
    let trangThaiTruoc = chiTiet.trangThaiYeuCau;

    boDemModalRef.current = setInterval(async () => {
      try {
        const moi = await RutTienGiangVienService.layChiTietAdmin(ma);
        const enriched = enrichYeuCauRutTienVoiQrPreview(moi);
        setChiTiet(enriched);

        const daChuyen =
          (trangThaiTruoc === "CHO_DUYET" || trangThaiTruoc === "CHO_CHUYEN_KHOAN") &&
          moi.trangThaiYeuCau === "DA_CHUYEN_KHOAN";
        if (daChuyen) {
          trangThaiTruoc = "DA_CHUYEN_KHOAN";
          if (boDemModalRef.current) {
            clearInterval(boDemModalRef.current);
            boDemModalRef.current = null;
          }
          await Swal.fire(
            "Thành công",
            "Hệ thống đã nhận xác nhận từ SePay (chuyển khoản tiền ra). Yêu cầu đã hoàn tất.",
            "success"
          );
          void taiDanhSach(trangThaiLoc, true);
          return;
        }

        if (trangThaiTruoc !== "TU_CHOI" && moi.trangThaiYeuCau === "TU_CHOI") {
          trangThaiTruoc = "TU_CHOI";
          if (boDemModalRef.current) {
            clearInterval(boDemModalRef.current);
            boDemModalRef.current = null;
          }
          await Swal.fire("Thông báo", "Yêu cầu đã được cập nhật trạng thái từ chối.", "info");
          void taiDanhSach(trangThaiLoc, true);
          return;
        }

        trangThaiTruoc = moi.trangThaiYeuCau;
      } catch {
        // im lặng khi poll
      }
    }, 3000);

    return () => {
      if (boDemModalRef.current) {
        clearInterval(boDemModalRef.current);
        boDemModalRef.current = null;
      }
    };
  }, [moChiTiet, chiTiet?.maYeuCauRutTien, chiTiet?.trangThaiYeuCau, trangThaiLoc]);

  const moModalChiTiet = (maYeuCauRutTien: number) => {
    const row = danhSach.find((x) => x.maYeuCauRutTien === maYeuCauRutTien);
    if (!row) {
      Swal.fire("Lỗi", "Không tìm thấy yêu cầu trong danh sách. Hãy bấm Lọc / tải lại trang.", "error");
      return;
    }
    setChiTiet(enrichYeuCauRutTienVoiQrPreview({ ...row }));
    setMoChiTiet(true);
  };

  const dongModal = () => {
    setMoChiTiet(false);
    setChiTiet(null);
  };

  const saoChepNoiDungChuyenKhoan = async () => {
    const noiDung = chiTiet?.noiDungChuyenKhoan?.trim();
    if (!noiDung) return;

    try {
      await navigator.clipboard.writeText(noiDung);
      await Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Đã sao chép mã chuyển khoản", showConfirmButton: false, timer: 1800 });
    } catch {
      await Swal.fire("Lỗi", "Không thể sao chép mã chuyển khoản.", "error");
    }
  };

  const xacNhanDaChuyenKhoan = async () => {
    if (!chiTiet) return;
    const xacNhan = await Swal.fire({
      title: "Xác nhận đã chuyển khoản?",
      text: "Hệ thống sẽ ghi nhận yêu cầu này là thành công (đã thanh toán cho giảng viên).",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đã thanh toán",
      cancelButtonText: "Hủy"
    });
    if (!xacNhan.isConfirmed) return;

    try {
      await RutTienGiangVienService.xacNhanDaChuyenKhoan(chiTiet.maYeuCauRutTien);
      Swal.fire("Thành công", "Đã cập nhật trạng thái chuyển khoản.", "success");
      dongModal();
      await taiDanhSach(trangThaiLoc);
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { thongBao?: string } } }).response?.data?.thongBao
          : undefined;
      Swal.fire("Lỗi", msg ?? "Không thể xác nhận.", "error");
    }
  };

  const tuChoiThanhToan = async () => {
    if (!chiTiet) return;
    const ketQua = await Swal.fire({
      title: "Từ chối thanh toán",
      input: "text",
      inputLabel: "Lý do từ chối (hiển thị cho giảng viên)",
      inputPlaceholder: "Nhập lý do",
      showCancelButton: true,
      confirmButtonText: "Xác nhận từ chối",
      cancelButtonText: "Hủy",
      inputValidator: (v) => (!v?.trim() ? "Vui lòng nhập lý do" : undefined)
    });

    if (!ketQua.isConfirmed || !ketQua.value?.trim()) {
      return;
    }

    try {
      await RutTienGiangVienService.tuChoiYeuCau(chiTiet.maYeuCauRutTien, ketQua.value.trim());
      Swal.fire("Thành công", "Đã từ chối yêu cầu. Số dư khả dụng của giảng viên được khôi phục.", "success");
      dongModal();
      await taiDanhSach(trangThaiLoc);
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { thongBao?: string } } }).response?.data?.thongBao
          : undefined;
      Swal.fire("Lỗi", msg ?? "Không thể từ chối.", "error");
    }
  };

  const coTheXuLyTrongModal =
    !!chiTiet &&
    (chiTiet!.trangThaiYeuCau === "CHO_DUYET" || chiTiet!.trangThaiYeuCau === "CHO_CHUYEN_KHOAN");

  return (
    <div className="adm-wd-page qtv-page-content">
      <header className="adm-wd-header">
        <div className="adm-wd-header__titles">
          <div className="adm-wd-header__icon" aria-hidden="true">
            <i className="bi bi-wallet2" />
          </div>
          <div>
            <h1 className="adm-wd-title">Quản lý rút tiền giảng viên</h1>
            <p className="adm-wd-subtitle">Quản lý và xử lý các yêu cầu rút tiền từ giảng viên trong hệ thống.</p>
          </div>
        </div>
      </header>

      <section className="adm-wd-card" aria-label="Danh sách yêu cầu rút tiền">
        <div className="adm-wd-card-header">
          <h2 className="adm-wd-section-title">Danh sách yêu cầu</h2>
          <div className="adm-wd-toolbar">
            <select
              className="adm-wd-select"
              value={trangThaiLoc}
              onChange={(e) => setTrangThaiLoc(e.target.value)}
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CHO_DUYET">Chờ xử lý</option>
              <option value="CHO_CHUYEN_KHOAN">Đang chuyển khoản</option>
              <option value="DA_CHUYEN_KHOAN">Thành công</option>
              <option value="TU_CHOI">Bị từ chối</option>
            </select>
            <button type="button" className="adm-wd-btn adm-wd-btn--primary" onClick={() => taiDanhSach(trangThaiLoc)}>
              Lọc
            </button>
          </div>
        </div>

        <div className="adm-wd-tablewrap">
          {dangTai ? (
            <div className="adm-wd-state">Đang tải dữ liệu...</div>
          ) : (
            <table className="adm-wd-table">
              <thead>
                <tr>
                  <th>Mã YC</th>
                  <th>Giảng viên</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="adm-wd-action-col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="adm-wd-state">Chưa có yêu cầu rút tiền nào.</td>
                  </tr>
                ) : (
                  danhSach.map((item) => (
                    <tr key={item.maYeuCauRutTien}>
                      <td>#{item.maYeuCauRutTien}</td>
                      <td>{item.tenGiangVien}</td>
                      <td className="adm-wd-amount">{item.soTienYeuCau.toLocaleString("vi-VN")} VND</td>
                      <td>
                        <span className={`adm-wd-badge ${getStatusClassName(item.trangThaiYeuCau)}`}>
                          {hienThiTrangThaiYeuCauRutTien(item.trangThaiYeuCau)}
                        </span>
                      </td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}</td>
                      <td className="adm-wd-action-cell">
                        <button type="button" className="adm-wd-btn adm-wd-btn--ghost adm-wd-btn--sm" onClick={() => moModalChiTiet(item.maYeuCauRutTien)}>
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {moChiTiet && (
        <div className="adm-wd-modal" role="presentation">
          <div className="adm-wd-modal__backdrop" onClick={dongModal} />
          <div className="adm-wd-modal__panel" role="dialog" aria-modal="true" aria-labelledby="adm-wd-modal-title">
            <div className="adm-wd-modal__header">
              <h2 id="adm-wd-modal-title" className="adm-wd-modal__title">Chi tiết yêu cầu rút tiền #{chiTiet?.maYeuCauRutTien ?? "…"}</h2>
              <button type="button" className="adm-wd-modal__close" aria-label="Đóng" onClick={dongModal}>×</button>
            </div>
            <div className="adm-wd-modal__body">
              {!chiTiet ? (
                <p>Đang tải...</p>
              ) : (
                <div className="adm-wd-modal-layout">
                  <div className="adm-wd-modal-qr-column adm-wd-info-card">
                    {chiTiet.duongDanAnhQr ? (
                      <>
                        <img className="adm-wd-qr__img" src={chiTiet.duongDanAnhQr} alt="QR chuyển khoản" />
                        <a href={chiTiet.duongDanAnhQr} target="_blank" rel="noreferrer" className="adm-wd-qr__link">
                          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                          Mở ảnh trong tab mới
                        </a>
                      </>
                    ) : (
                      <p className="adm-wd-hint">{!chiTiet.maNganHangNhan?.trim() || !chiTiet.soTaiKhoanNhan?.trim() ? "Không tạo được URL QR: thiếu mã VietQR hoặc số tài khoản nhận trên yêu cầu." : "Không tạo được ảnh QR. Hãy đóng và mở lại chi tiết, hoặc tải lại trang."}</p>
                    )}
                  </div>

                  <div className="adm-wd-modal-info-column">
                    <div className="adm-wd-detail-grid">
                      <div className="adm-wd-general-info adm-wd-info-card">
                        <h3 className="adm-wd-info-card__title">Thông tin giảng viên</h3>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Giảng viên</span><strong className="adm-wd-field__value">{chiTiet.tenGiangVien}</strong></div>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Email</span><strong className="adm-wd-field__value">{chiTiet.emailGiangVien ?? "—"}</strong></div>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Số tiền</span><strong className="adm-wd-field__value">{chiTiet.soTienYeuCau.toLocaleString("vi-VN")} {chiTiet.loaiTien}</strong></div>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Trạng thái</span><span className={`adm-wd-badge ${getStatusClassName(chiTiet.trangThaiYeuCau)}`}>{hienThiTrangThaiYeuCauRutTien(chiTiet.trangThaiYeuCau)}</span></div>
                      </div>

                      <div className="adm-wd-bank-box adm-wd-info-card">
                        <h3 className="adm-wd-info-card__title">Thông tin chuyển khoản</h3>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Ngân hàng (mã VietQR)</span><strong className="adm-wd-field__value">{chiTiet.maNganHangNhan}</strong></div>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Số tài khoản</span><strong className="adm-wd-field__value">{chiTiet.soTaiKhoanNhan}</strong></div>
                        <div className="adm-wd-field"><span className="adm-wd-field__label">Tên chủ TK</span><strong className="adm-wd-field__value">{chiTiet.tenTaiKhoanNhan}</strong></div>
                        <div className="adm-wd-field adm-wd-field--copy"><span className="adm-wd-field__label">Nội dung CK</span><div className="adm-wd-copy-row"><strong className="adm-wd-field__value">{chiTiet.noiDungChuyenKhoan ?? "—"}</strong><button type="button" className="adm-wd-copy-btn" onClick={() => void saoChepNoiDungChuyenKhoan()} disabled={!chiTiet.noiDungChuyenKhoan} aria-label="Sao chép nội dung chuyển khoản">Sao chép</button></div></div>
                        <p className="adm-wd-hint">Ghi đúng mã nội dung này khi chuyển từ TK MB trên SePay.</p>
                      </div>
                    </div>

                    {chiTiet.ghiChuAdmin && <p className="adm-wd-note"><strong>Ghi chú admin:</strong> {chiTiet.ghiChuAdmin}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="adm-wd-modal__footer">
              <button type="button" className="adm-wd-btn adm-wd-btn--secondary" onClick={dongModal}>Đóng</button>
              {chiTiet && coTheXuLyTrongModal && (
                <>
                  <button type="button" className="adm-wd-btn adm-wd-btn--success" onClick={() => void xacNhanDaChuyenKhoan()}>Đã thanh toán</button>
                  <button type="button" className="adm-wd-btn adm-wd-btn--danger" onClick={() => void tuChoiThanhToan()}>Từ chối thanh toán</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
