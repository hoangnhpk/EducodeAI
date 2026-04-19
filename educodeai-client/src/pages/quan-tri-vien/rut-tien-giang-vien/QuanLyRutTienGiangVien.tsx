import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { RutTienGiangVienService } from "@/services/rut-tien-giang-vien.service";
import type { YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";
import { hienThiTrangThaiYeuCauRutTien } from "@/utils/rut-tien-trang-thai";
import { enrichYeuCauRutTienVoiQrPreview } from "@/utils/vietqr-rut-tien";

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
    <div>
      <h2>Quản lý rút tiền giảng viên</h2>


      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select
          className="form-select"
          style={{ maxWidth: 280 }}
          value={trangThaiLoc}
          onChange={(e) => setTrangThaiLoc(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="CHO_DUYET">Chờ xử lý</option>
          <option value="CHO_CHUYEN_KHOAN">Đang chuyển khoản</option>
          <option value="DA_CHUYEN_KHOAN">Thành công</option>
          <option value="TU_CHOI">Bị từ chối</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => taiDanhSach(trangThaiLoc)}>
          Lọc
        </button>
      </div>

      {dangTai ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Mã YC</th>
                <th>Giảng viên</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ width: 140 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((item) => (
                <tr key={item.maYeuCauRutTien}>
                  <td>{item.maYeuCauRutTien}</td>
                  <td>{item.tenGiangVien}</td>
                  <td>{item.soTienYeuCau.toLocaleString("vi-VN")} VND</td>
                  <td>{hienThiTrangThaiYeuCauRutTien(item.trangThaiYeuCau)}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => moModalChiTiet(item.maYeuCauRutTien)}>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {moChiTiet && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.45)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết yêu cầu rút tiền #{chiTiet?.maYeuCauRutTien ?? "…"}</h5>
                <button type="button" className="btn-close" aria-label="Đóng" onClick={dongModal} />
              </div>
              <div className="modal-body">
                {!chiTiet ? (
                  <p>Đang tải...</p>
                ) : (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p>
                          <strong>Giảng viên:</strong> {chiTiet.tenGiangVien}
                        </p>
                        <p>
                          <strong>Email:</strong> {chiTiet.emailGiangVien ?? "—"}
                        </p>
                        <p>
                          <strong>Số tiền:</strong> {chiTiet.soTienYeuCau.toLocaleString("vi-VN")} {chiTiet.loaiTien}
                        </p>
                        <p>
                          <strong>Trạng thái:</strong> {hienThiTrangThaiYeuCauRutTien(chiTiet.trangThaiYeuCau)}{" "}
                          <small className="text-muted">({chiTiet.trangThaiYeuCau})</small>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Ngân hàng (mã VietQR):</strong> {chiTiet.maNganHangNhan}
                        </p>
                        <p>
                          <strong>Số tài khoản:</strong> {chiTiet.soTaiKhoanNhan}
                        </p>
                        <p>
                          <strong>Tên chủ TK:</strong> {chiTiet.tenTaiKhoanNhan}
                        </p>
                        <p>
                          <strong>Nội dung CK (bắt buộc khớp SePay):</strong> {chiTiet.noiDungChuyenKhoan ?? "—"}
                        </p>
                        <p className="small text-muted mb-0">
                          Ghi đúng mã nội dung này khi chuyển từ TK MB trên SePay (mã ngẫu nhiên gắn với yêu cầu, không đoán trước được).
                        </p>
                      </div>
                    </div>

                    {chiTiet.duongDanAnhQr ? (
                      <div className="text-center mb-3">
                        <p className="fw-bold">Mã QR chuyển khoản (VietQR)</p>
                        <img
                          src={chiTiet.duongDanAnhQr}
                          alt="QR chuyển khoản"
                          style={{ maxWidth: 280, height: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}
                        />
                        <div className="mt-2">
                          <a href={chiTiet.duongDanAnhQr} target="_blank" rel="noreferrer" className="small">
                            Mở ảnh QR trong tab mới
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">
                        {!chiTiet.maNganHangNhan?.trim() || !chiTiet.soTaiKhoanNhan?.trim()
                          ? "Không tạo được URL QR: thiếu mã VietQR hoặc số tài khoản nhận trên yêu cầu."
                          : "Không tạo được ảnh QR. Hãy đóng và mở lại chi tiết, hoặc tải lại trang."}
                      </p>
                    )}

                    {chiTiet.ghiChuAdmin && (
                      <p>
                        <strong>Ghi chú admin:</strong> {chiTiet.ghiChuAdmin}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer flex-wrap gap-2">
                <button type="button" className="btn btn-secondary" onClick={dongModal}>
                  Đóng
                </button>
                {chiTiet && coTheXuLyTrongModal && (
                  <>
                    <button type="button" className="btn btn-success" onClick={() => void xacNhanDaChuyenKhoan()}>
                      Đã thanh toán
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => void tuChoiThanhToan()}>
                      Từ chối thanh toán
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
