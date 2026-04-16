import { useEffect, useState } from "react";
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

  const taiDanhSach = async (trangThai?: string) => {
    try {
      setDangTai(true);
      const duLieu = await RutTienGiangVienService.layDanhSachAdmin(trangThai || undefined);
      setDanhSach(duLieu);
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { thongBao?: string } } }).response?.data?.thongBao
          : undefined;
      Swal.fire("Lỗi", msg ?? "Không tải được danh sách rút tiền.", "error");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

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
      <p style={{ color: "#64748b", marginBottom: 16 }}>
        Yêu cầu mới từ giảng viên hiển thị ở đây. Mở chi tiết để xem QR VietQR (theo STK giảng viên cung cấp), sau đó chọn{" "}
        <strong>Đã thanh toán</strong> hoặc <strong>Từ chối thanh toán</strong>.
      </p>

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
                          <strong>Nội dung CK gợi ý:</strong> {chiTiet.noiDungChuyenKhoan ?? "—"}
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
                      <p className="text-muted">Không tạo được URL QR (thiếu dữ liệu ngân hàng).</p>
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
