import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { HoTroThanhToanAdminService, type HoTroThanhToanDanhSachItemDTO } from "@/services/ho-tro-thanh-toan-admin.service";
import type { HoTroThanhToanChiTietDTO } from "@/services/thanh-toan-khoa-hoc.service";

const hienThiTrangThai = (trangThai: string) => {
  switch (trangThai) {
    case "SUPPORT_PENDING":
      return "Chờ admin xử lý";
    case "SUPPORT_APPROVED":
      return "Đã chấp thuận";
    case "SUPPORT_REJECTED":
      return "Đã từ chối";
    default:
      return trangThai;
  }
};

export default function QuanLyHoTroThanhToanHocVien() {
  const [dangTai, setDangTai] = useState(true);
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [danhSach, setDanhSach] = useState<HoTroThanhToanDanhSachItemDTO[]>([]);
  const [chiTiet, setChiTiet] = useState<HoTroThanhToanChiTietDTO | null>(null);
  const [moChiTiet, setMoChiTiet] = useState(false);

  const taiDanhSach = async (imLang = false) => {
    try {
      if (!imLang) setDangTai(true);
      const duLieu = await HoTroThanhToanAdminService.layDanhSach(
        trangThaiLoc || undefined,
        tuKhoa || undefined
      );
      setDanhSach(duLieu);
    } catch (error: any) {
      if (!imLang) {
        await Swal.fire("Lỗi", error?.response?.data?.thongBao || "Không tải được danh sách hỗ trợ.", "error");
      }
    } finally {
      if (!imLang) setDangTai(false);
    }
  };

  useEffect(() => {
    void taiDanhSach();
  }, []);

  const xemChiTiet = async (maGiaoDichHoTro: number) => {
    try {
      const duLieu = await HoTroThanhToanAdminService.layChiTiet(maGiaoDichHoTro);
      setChiTiet(duLieu);
      setMoChiTiet(true);
    } catch (error: any) {
      await Swal.fire("Lỗi", error?.response?.data?.thongBao || "Không tải được chi tiết yêu cầu.", "error");
    }
  };

  const dongChiTiet = () => {
    setMoChiTiet(false);
    setChiTiet(null);
  };

  const chapThuan = async () => {
    if (!chiTiet) return;
    const kq = await Swal.fire({
      title: "Chấp thuận yêu cầu hỗ trợ?",
      text: "Hệ thống sẽ mở khóa học cho học viên như đã thanh toán thành công.",
      icon: "question",
      input: "text",
      inputLabel: "Ghi chú admin (tùy chọn)",
      showCancelButton: true,
      confirmButtonText: "Chấp thuận",
      cancelButtonText: "Hủy"
    });
    if (!kq.isConfirmed) return;

    try {
      await HoTroThanhToanAdminService.chapThuan(
        chiTiet.maGiaoDichHoTro,
        (kq.value || "").trim() || undefined
      );
      await Swal.fire("Thành công", "Đã chấp thuận yêu cầu và ghi nhận thanh toán.", "success");
      dongChiTiet();
      await taiDanhSach(true);
    } catch (error: any) {
      await Swal.fire("Lỗi", error?.response?.data?.thongBao || "Không thể chấp thuận yêu cầu.", "error");
    }
  };

  const tuChoi = async () => {
    if (!chiTiet) return;
    const kq = await Swal.fire({
      title: "Từ chối yêu cầu hỗ trợ",
      input: "text",
      inputLabel: "Lý do / ghi chú (khuyên dùng)",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Hủy"
    });
    if (!kq.isConfirmed) return;

    try {
      await HoTroThanhToanAdminService.tuChoi(
        chiTiet.maGiaoDichHoTro,
        (kq.value || "").trim() || undefined
      );
      await Swal.fire("Đã từ chối", "Yêu cầu hỗ trợ đã được cập nhật trạng thái từ chối.", "success");
      dongChiTiet();
      await taiDanhSach(true);
    } catch (error: any) {
      await Swal.fire("Lỗi", error?.response?.data?.thongBao || "Không thể từ chối yêu cầu.", "error");
    }
  };

  const coTheXuLy = chiTiet?.trangThaiHoTro === "SUPPORT_PENDING";

  return (
    <div>
      <h2>Hỗ trợ thanh toán học viên</h2>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select
          className="form-select"
          style={{ maxWidth: 260 }}
          value={trangThaiLoc}
          onChange={(e) => setTrangThaiLoc(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="SUPPORT_PENDING">Chờ admin xử lý</option>
          <option value="SUPPORT_APPROVED">Đã chấp thuận</option>
          <option value="SUPPORT_REJECTED">Đã từ chối</option>
        </select>
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Tìm theo mã đơn, học viên, email, khóa học, liên hệ..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => void taiDanhSach()}>
          Lọc / Tìm kiếm
        </button>
      </div>

      {dangTai ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Mã hỗ trợ</th>
                <th>Mã đơn</th>
                <th>Nội dung CK</th>
                <th>Học viên</th>
                <th>Khóa học</th>
                <th>Liên hệ</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th style={{ width: 130 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((item) => (
                <tr key={item.maGiaoDichHoTro}>
                  <td>{item.maGiaoDichHoTro}</td>
                  <td>#{item.maDonHang}</td>
                  <td><code>{item.noiDungChuyenKhoan}</code></td>
                  <td>
                    <div>{item.tenHocVien}</div>
                    <small className="text-muted">{item.emailHocVien || "—"}</small>
                  </td>
                  <td>{item.khoaHocDaiDien || "—"}</td>
                  <td>{item.thongTinLienLac || "—"}</td>
                  <td>{hienThiTrangThai(item.trangThaiHoTro)}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => void xemChiTiet(item.maGiaoDichHoTro)}>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {danhSach.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted">
                    Không có yêu cầu hỗ trợ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {moChiTiet && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết yêu cầu hỗ trợ #{chiTiet?.maGiaoDichHoTro}</h5>
                <button className="btn-close" onClick={dongChiTiet} />
              </div>
              <div className="modal-body">
                {!chiTiet ? (
                  <p>Đang tải...</p>
                ) : (
                  <>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <p><strong>Học viên:</strong> {chiTiet.tenHocVien}</p>
                        <p><strong>Email:</strong> {chiTiet.emailHocVien || "—"}</p>
                        <p><strong>Mã tham chiếu:</strong> Đơn #{chiTiet.maDonHang}</p>
                        <p><strong>Nội dung chuyển khoản:</strong> <code>{chiTiet.noiDungChuyenKhoan}</code></p>
                        <p><strong>Số tiền:</strong> {chiTiet.soTienDonHang.toLocaleString("vi-VN")} {chiTiet.loaiTien}</p>
                        <p><strong>Trạng thái hỗ trợ:</strong> {hienThiTrangThai(chiTiet.trangThaiHoTro)}</p>
                        <p><strong>Trạng thái đơn:</strong> {chiTiet.trangThaiDonHang}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Liên hệ nhanh:</strong> {chiTiet.thongTinLienLac || "—"}</p>
                        <p><strong>Nội dung học viên:</strong> {chiTiet.noiDungHocVien || "—"}</p>
                        <p><strong>Ghi chú admin:</strong> {chiTiet.ghiChuAdmin || "—"}</p>
                        <p><strong>Ngày gửi:</strong> {chiTiet.createdAt ? new Date(chiTiet.createdAt).toLocaleString("vi-VN") : "—"}</p>
                        <p><strong>Lúc xử lý:</strong> {chiTiet.xuLyLuc ? new Date(chiTiet.xuLyLuc).toLocaleString("vi-VN") : "—"}</p>
                      </div>
                    </div>

                    <div className="mb-2 fw-bold">Danh sách khóa học trong đơn</div>
                    <ul className="mb-0">
                      {chiTiet.danhSachKhoaHoc.map((khoaHoc) => (
                        <li key={khoaHoc.maKhoaHoc}>
                          #{khoaHoc.maKhoaHoc} - {khoaHoc.tenKhoaHoc}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={dongChiTiet}>Đóng</button>
                {coTheXuLy && (
                  <>
                    <button className="btn btn-success" onClick={() => void chapThuan()}>
                      Chấp thuận
                    </button>
                    <button className="btn btn-danger" onClick={() => void tuChoi()}>
                      Từ chối
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
