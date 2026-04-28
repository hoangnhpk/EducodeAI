import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  ThanhToanKhoaHocService,
  type LichSuMaQuaTangDTO
} from "@/services/thanh-toan-khoa-hoc.service";

const trangThaiHienThi = (trangThai: string) => {
  const key = (trangThai || "").toUpperCase();
  if (key === "PENDING_PAYMENT") return { label: "Chờ thanh toán", cls: "bg-secondary" };
  if (key === "ACTIVE") return { label: "Đã kích hoạt", cls: "bg-success" };
  if (key === "REDEEMED") return { label: "Đã được sử dụng", cls: "bg-primary" };
  if (key === "EXPIRED") return { label: "Hết hạn", cls: "bg-danger" };
  return { label: trangThai, cls: "bg-dark" };
};

const fmtMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0
  }).format(value);

const fmtDate = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("vi-VN");
};

const LichSuMaQuaTang = () => {
  const [loading, setLoading] = useState(true);
  const [duLieu, setDuLieu] = useState<LichSuMaQuaTangDTO[]>([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ThanhToanKhoaHocService.layLichSuMaQuaTang();
        setDuLieu(data ?? []);
      } catch (error: any) {
        const thongBao = error?.response?.data?.thongBao || "Không tải được lịch sử mã quà tặng.";
        await Swal.fire("Lỗi", thongBao, "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const danhSachLoc = useMemo(() => {
    const key = tuKhoa.trim().toLowerCase();
    return duLieu.filter((x) => {
      if (locTrangThai !== "ALL" && x.trangThai !== locTrangThai) return false;
      if (!key) return true;
      return (
        x.code.toLowerCase().includes(key) ||
        x.tenKhoaHoc.toLowerCase().includes(key) ||
        (x.tenNguoiNhan || "").toLowerCase().includes(key) ||
        String(x.maDonHang).includes(key) ||
        x.noiDungChuyenKhoan.toLowerCase().includes(key)
      );
    });
  }, [duLieu, locTrangThai, tuKhoa]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await Swal.fire("Đã copy", "Mã quà tặng đã được copy.", "success");
    } catch {
      await Swal.fire("Lỗi", "Không thể copy mã trong trình duyệt hiện tại.", "error");
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h4 className="fw-bold mb-0">Lịch sử mã quà tặng</h4>
        <span className="badge bg-light text-dark border">Tổng: {duLieu.length} mã</span>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body row g-2">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Tìm theo mã code, khóa học, người nhận, mã đơn..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={locTrangThai} onChange={(e) => setLocTrangThai(e.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING_PAYMENT">Chờ thanh toán</option>
              <option value="ACTIVE">Đã kích hoạt</option>
              <option value="REDEEMED">Đã được sử dụng</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã code</th>
                <th>Khóa học</th>
                <th>Thanh toán</th>
                <th>Người nhận</th>
                <th>Trạng thái</th>
                <th>Mốc thời gian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Đang tải dữ liệu...</td></tr>
              ) : danhSachLoc.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-muted">Không có dữ liệu phù hợp.</td></tr>
              ) : (
                danhSachLoc.map((item) => {
                  const trangThai = trangThaiHienThi(item.trangThai);
                  return (
                    <tr key={item.maQuaTang}>
                      <td>
                        <div className="fw-semibold">{item.code}</div>
                        <button className="btn btn-sm btn-outline-secondary mt-1" onClick={() => void handleCopy(item.code)}>
                          Copy mã
                        </button>
                      </td>
                      <td>
                        <div className="fw-semibold">{item.tenKhoaHoc}</div>
                        <div className="text-muted small">Mã khóa: #{item.maKhoaHoc}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{fmtMoney(item.soTien, item.donViTienTe)}</div>
                        <div className="small text-muted">Đơn: #{item.maDonHang}</div>
                        <div className="small text-primary">{item.noiDungChuyenKhoan}</div>
                      </td>
                      <td>{item.tenNguoiNhan || <span className="text-muted">Chưa có</span>}</td>
                      <td><span className={`badge ${trangThai.cls}`}>{trangThai.label}</span></td>
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
};

export default LichSuMaQuaTang;
