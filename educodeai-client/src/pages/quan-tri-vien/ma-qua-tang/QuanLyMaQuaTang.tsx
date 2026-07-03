import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { MaQuaTangAdminService } from "@/services/ma-qua-tang-admin.service";
import type { LichSuMaQuaTangDTO } from "@/services/thanh-toan-khoa-hoc.service";

const trangThaiHienThi = (trangThai: string) => {
  const key = (trangThai || "").toUpperCase();
  if (key === "PENDING_PAYMENT") return { label: "Chờ thanh toán", cls: "bg-secondary" };
  if (key === "ACTIVE") return { label: "Đã kích hoạt", cls: "bg-success" };
  if (key === "REDEEMED") return { label: "Đã sử dụng", cls: "bg-primary" };
  if (key === "EXPIRED") return { label: "Hết hạn", cls: "bg-danger" };
  return { label: key, cls: "bg-dark" };
};

const fmtMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: currency || "VND", maximumFractionDigits: 0 }).format(value);

const fmtDate = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("vi-VN");
};

export default function QuanLyMaQuaTang() {
  const [duLieu, setDuLieu] = useState<LichSuMaQuaTangDTO[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [tuKhoa, setTuKhoa] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("ALL");

  useEffect(() => {
    const taiDanhSach = async () => {
      try {
        setDangTai(true);
        const data = await MaQuaTangAdminService.layDanhSach();
        setDuLieu(data ?? []);
      } catch (error: any) {
        const thongBao = error?.response?.data?.thongBao || "Không tải được danh sách mã quà tặng.";
        await Swal.fire("Lỗi", thongBao, "error");
      } finally {
        setDangTai(false);
      }
    };
    void taiDanhSach();
  }, []);

  const danhSachLoc = useMemo(() => {
    const key = tuKhoa.trim().toLowerCase();
    return duLieu.filter((x) => {
      if (locTrangThai !== "ALL" && x.trangThai !== locTrangThai) return false;
      if (!key) return true;
      return (
        x.code.toLowerCase().includes(key) ||
        x.tenKhoaHoc.toLowerCase().includes(key) ||
        (x.tenNguoiTang || "").toLowerCase().includes(key) ||
        (x.emailNguoiTang || "").toLowerCase().includes(key) ||
        (x.tenNguoiNhan || "").toLowerCase().includes(key) ||
        (x.emailNguoiNhan || "").toLowerCase().includes(key) ||
        String(x.maDonHang).includes(key) ||
        x.noiDungChuyenKhoan.toLowerCase().includes(key)
      );
    });
  }, [duLieu, locTrangThai, tuKhoa]);

  return (
    <div className="container-fluid py-3">
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Quản lý mã quà tặng học viên</h4>
          <div className="text-muted">Theo dõi toàn bộ code học viên tặng nhau trong hệ thống.</div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body row g-2">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Tìm theo code, khóa học, người tặng/người nhận, mã đơn, nội dung chuyển khoản..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={locTrangThai} onChange={(e) => setLocTrangThai(e.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING_PAYMENT">Chờ thanh toán</option>
              <option value="ACTIVE">Đã kích hoạt</option>
              <option value="REDEEMED">Đã sử dụng</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Khóa học</th>
                <th>Người tặng</th>
                <th>Người nhận</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Mốc thời gian</th>
              </tr>
            </thead>
            <tbody>
              {dangTai ? (
                <tr><td colSpan={7} className="text-center py-4">Đang tải...</td></tr>
              ) : danhSachLoc.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Không có dữ liệu phù hợp.</td></tr>
              ) : (
                danhSachLoc.map((item) => {
                  const tt = trangThaiHienThi(item.trangThai);
                  return (
                    <tr key={item.maQuaTang}>
                      <td>
                        <div className="fw-semibold">{item.code}</div>
                        <div className="small text-muted">#{item.maQuaTang}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{item.tenKhoaHoc}</div>
                        <div className="small text-muted">Mã khóa: #{item.maKhoaHoc}</div>
                      </td>
                      <td>
                        <div>{item.tenNguoiTang || "--"}</div>
                        <div className="small text-muted">{item.emailNguoiTang || "--"}</div>
                      </td>
                      <td>
                        <div>{item.tenNguoiNhan || <span className="text-muted">Chưa có</span>}</div>
                        <div className="small text-muted">{item.emailNguoiNhan || "--"}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{fmtMoney(item.soTien, item.donViTienTe)}</div>
                        <div className="small text-muted">Đơn: #{item.maDonHang}</div>
                        <div className="small text-primary">{item.noiDungChuyenKhoan}</div>
                      </td>
                      <td><span className={`badge ${tt.cls}`}>{tt.label}</span></td>
                      <td className="small">
                        <div><b>Tạo:</b> {fmtDate(item.createdAt)}</div>
                        <div><b>Kích hoạt:</b> {fmtDate(item.activatedAt)}</div>
                        <div><b>Sử dụng:</b> {fmtDate(item.redeemedAt)}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
