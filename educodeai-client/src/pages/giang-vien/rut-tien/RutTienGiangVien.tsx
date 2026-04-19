import { useEffect, useState } from "react";
import { hienThiTrangThaiYeuCauRutTien } from "@/utils/rut-tien-trang-thai";
import Swal from "sweetalert2";
import { DANH_MUC_NGAN_HANG_MAC_DINH } from "@/constants/danh-muc-ngan-hang-mac-dinh";
import { RutTienGiangVienService } from "@/services/rut-tien-giang-vien.service";
import type { NganHangItemDTO, ThongTinViGiangVienDTO, YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";

function formatVndHienThi(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

function TheViThongKeCard({
  label,
  value,
  iconClassBi,
  accentClass
}: {
  label: string;
  value: string;
  iconClassBi: string;
  accentClass: string;
}) {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body p-3 p-md-4 d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <span className="text-muted small fw-medium" style={{ maxWidth: "72%" }}>
            {label}
          </span>
          <span className={`rounded-3 p-2 d-inline-flex align-items-center justify-content-center flex-shrink-0 ${accentClass}`}>
            <i className={`bi ${iconClassBi} fs-5`} aria-hidden />
          </span>
        </div>
        <div className="fs-5 fw-bold text-dark lh-sm mt-auto text-break">{value}</div>
      </div>
    </div>
  );
}

function laLoiKhongKetNoiApi(error: unknown): boolean {
  if (error && typeof error === "object" && "response" in error) {
    return (error as { response?: unknown }).response === undefined;
  }
  return true;
}

function layThongBaoLoi(error: unknown): string {
  const e = error as { response?: { data?: { thongBao?: string } }; message?: string };
  if (e?.response?.data && typeof e.response.data === "object" && "thongBao" in e.response.data) {
    return String((e.response.data as { thongBao?: string }).thongBao ?? "");
  }
  return e?.message ?? "";
}

export default function RutTienGiangVien() {
  const [dangTai, setDangTai] = useState<boolean>(true);
  const [thongTinVi, setThongTinVi] = useState<ThongTinViGiangVienDTO | null>(null);
  const [lichSuRutTien, setLichSuRutTien] = useState<YeuCauRutTienChiTietDTO[]>([]);
  const [canhBaoKhongKetNoiApi, setCanhBaoKhongKetNoiApi] = useState<boolean>(false);
  const [danhMucNganHang, setDanhMucNganHang] = useState<NganHangItemDTO[]>(DANH_MUC_NGAN_HANG_MAC_DINH);
  const [maNganHang, setMaNganHang] = useState<string>("");
  const [soTaiKhoanNhanTien, setSoTaiKhoanNhanTien] = useState<string>("");
  const [tenTaiKhoanNhanTien, setTenTaiKhoanNhanTien] = useState<string>("");
  const [soTienYeuCau, setSoTienYeuCau] = useState<string>("");
  const daCoTaiKhoanNhanTien = Boolean(
    thongTinVi?.maNganHangNhanTien && thongTinVi?.soTaiKhoanNhanTien && thongTinVi?.tenTaiKhoanNhanTien
  );

  const taiDuLieu = async () => {
    setDangTai(true);
    setCanhBaoKhongKetNoiApi(false);
    setDanhMucNganHang(DANH_MUC_NGAN_HANG_MAC_DINH);

    const ketQua = await Promise.allSettled([
      RutTienGiangVienService.layThongTinVi(),
      RutTienGiangVienService.layLichSuRutTien(),
      RutTienGiangVienService.layDanhMucNganHang()
    ]);

    const rVi = ketQua[0];
    const rLichSu = ketQua[1];
    const rDanhMuc = ketQua[2];

    if (rDanhMuc.status === "fulfilled" && Array.isArray(rDanhMuc.value) && rDanhMuc.value.length > 0) {
      setDanhMucNganHang(rDanhMuc.value);
    }

    const danhMucHienTai =
      rDanhMuc.status === "fulfilled" && rDanhMuc.value.length > 0 ? rDanhMuc.value : DANH_MUC_NGAN_HANG_MAC_DINH;

    if (rLichSu.status === "fulfilled") {
      setLichSuRutTien(rLichSu.value);
    } else {
      setLichSuRutTien([]);
    }

    if (rVi.status === "fulfilled") {
      const vi = rVi.value;
      setThongTinVi(vi);
      const maTuPhienBan =
        vi.maNganHangChon ??
        danhMucHienTai.find((x) => x.maVietQr === vi.maNganHangNhanTien)?.ma ??
        "";
      setMaNganHang(maTuPhienBan);
      setSoTaiKhoanNhanTien(vi.soTaiKhoanNhanTien ?? "");
      setTenTaiKhoanNhanTien(vi.tenTaiKhoanNhanTien ?? "");
    } else {
      setThongTinVi(null);
      const loi = rVi.reason;
      if (laLoiKhongKetNoiApi(loi)) {
        setCanhBaoKhongKetNoiApi(true);
      } else {
        Swal.fire("Lỗi", layThongBaoLoi(loi) || "Không tải được dữ liệu ví giảng viên.", "error");
      }
    }

    setDangTai(false);
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  const themTaiKhoanNhanTien = async () => {
    try {
      await RutTienGiangVienService.themTaiKhoanNhanTien({
        maNganHangNhanTien: maNganHang,
        soTaiKhoanNhanTien,
        tenTaiKhoanNhanTien
      });
      Swal.fire("Thành công", "Đã thêm tài khoản nhận tiền.", "success");
      await taiDuLieu();
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không thể thêm tài khoản nhận tiền.", "error");
    }
  };

  const xoaTaiKhoanNhanTien = async () => {
    const xacNhan = await Swal.fire({
      title: "Xóa tài khoản nhận tiền?",
      text: "Bạn cần xóa tài khoản hiện tại trước khi thêm tài khoản mới.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });

    if (!xacNhan.isConfirmed) {
      return;
    }

    try {
      await RutTienGiangVienService.xoaTaiKhoanNhanTien();
      setMaNganHang("");
      setSoTaiKhoanNhanTien("");
      setTenTaiKhoanNhanTien("");
      Swal.fire("Thành công", "Đã xóa tài khoản nhận tiền.", "success");
      await taiDuLieu();
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không thể xóa tài khoản nhận tiền.", "error");
    }
  };

  const guiYeuCauRutTien = async () => {
    const soTien = Number(soTienYeuCau);
    if (!soTien || soTien < 10000) {
      Swal.fire("Thông báo", "Số tiền rút tối thiểu là 10,000 VND.", "warning");
      return;
    }

    try {
      await RutTienGiangVienService.taoYeuCauRutTien(soTien);
      setSoTienYeuCau("");
      Swal.fire("Thành công", "Đã gửi yêu cầu rút tiền đến admin.", "success");
      await taiDuLieu();
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không thể tạo yêu cầu rút tiền.", "error");
    }
  };

  if (dangTai) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3 text-muted">
        <div className="spinner-border text-primary" role="status" aria-label="Đang tải" />
        <span>Đang tải dữ liệu ví giảng viên…</span>
      </div>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL ?? "";

  return (
    <div className="gv-rut-tien-page">
      <div className="mb-4">
        <h2 className="h3 fw-bold text-dark mb-1">Ví giảng viên</h2>
        <p className="text-muted small mb-0">Tổng quan doanh thu và các khoản rút — số dư khả dụng là phần bạn có thể yêu cầu rút.</p>
      </div>

      {canhBaoKhongKetNoiApi && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: 16 }}>
          <strong>Không kết nối được tới API.</strong> Trình duyệt báo <code>ERR_CONNECTION_REFUSED</code> — backend
          chưa chạy hoặc sai địa chỉ. Hãy mở terminal trong{" "}
          <code>educodeai-server</code> và chạy:{" "}
          <code>dotnet run --launch-profile https</code> (HTTPS cổng 7284 theo{" "}
          <code>launchSettings.json</code>). Biến <code>VITE_API_URL</code> của frontend phải trùng, ví dụ{" "}
          <code>https://localhost:7284</code>. Hiện tại: <code>{apiBase || "(chưa đặt)"}</code>
        </div>
      )}

      <section className="mb-4" aria-label="Tổng quan ví">
        <div className="row g-3 g-lg-4">
          <div className="col-12 col-md-6 col-xl-3">
            <TheViThongKeCard
              label="Tổng doanh thu ghi nhận"
              value={formatVndHienThi(thongTinVi?.tongDoanhThuDaGhiNhan)}
              iconClassBi="bi-graph-up-arrow"
              accentClass="bg-primary-subtle text-primary"
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <TheViThongKeCard
              label="Đang chờ xử lý rút"
              value={formatVndHienThi(thongTinVi?.tongDangChoXuLyRut)}
              iconClassBi="bi-hourglass-split"
              accentClass="bg-warning-subtle text-warning"
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <TheViThongKeCard
              label="Đã chuyển khoản"
              value={formatVndHienThi(thongTinVi?.tongDaChuyenKhoan)}
              iconClassBi="bi-check2-circle"
              accentClass="bg-success-subtle text-success"
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div
              className="card h-100 border-primary border-2 shadow-sm overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #f8fafc 0%, #eff6ff 48%, #e0f2fe 100%)"
              }}
            >
              <div className="card-body p-3 p-md-4 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                  <span className="text-primary fw-semibold small" style={{ maxWidth: "72%" }}>
                    Số dư khả dụng
                  </span>
                  <span className="rounded-3 p-2 d-inline-flex bg-primary text-white flex-shrink-0">
                    <i className="bi bi-wallet2 fs-5" aria-hidden />
                  </span>
                </div>
                <div className="fs-4 fw-bold text-primary lh-sm text-break">
                  {formatVndHienThi(thongTinVi?.soDuKhaDung)}
                </div>
                <p className="small text-muted mb-0 mt-2">Có thể dùng để gửi yêu cầu rút bên dưới.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
        <h3 className="h5 fw-bold mb-2">Tài khoản nhận tiền (mỗi giảng viên chỉ 1 tài khoản)</h3>
        <p style={{ fontSize: 13, color: "#555" }}>
          Vui lòng nhập đúng ngân hàng, số tài khoản và tên chủ tài khoản để admin chuyển khoản. Hệ thống không tra cứu
          STK qua bên thứ ba.
        </p>
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <select
            disabled={daCoTaiKhoanNhanTien}
            value={maNganHang}
            onChange={(e) => setMaNganHang(e.target.value)}
          >
            <option value="">— Chọn ngân hàng —</option>
            {danhMucNganHang.map((nh) => (
              <option key={nh.ma} value={nh.ma}>
                {nh.tenHienThi}
              </option>
            ))}
          </select>
          <input disabled={daCoTaiKhoanNhanTien} value={soTaiKhoanNhanTien} onChange={(e) => setSoTaiKhoanNhanTien(e.target.value)} placeholder="Số tài khoản nhận" />
          <input disabled={daCoTaiKhoanNhanTien} value={tenTaiKhoanNhanTien} onChange={(e) => setTenTaiKhoanNhanTien(e.target.value)} placeholder="Tên chủ tài khoản (không dấu hoặc có dấu đều được)" />
          {!daCoTaiKhoanNhanTien ? (
            <button className="btn btn-primary" onClick={themTaiKhoanNhanTien}>Thêm tài khoản nhận tiền</button>
          ) : (
            <button className="btn btn-danger" onClick={xoaTaiKhoanNhanTien}>Xóa tài khoản hiện tại</button>
          )}
        </div>
        {daCoTaiKhoanNhanTien && (
          <p style={{ marginTop: 8, color: "#b45309" }}>
            Bạn đã có tài khoản nhận tiền. Muốn đổi tài khoản, vui lòng xóa tài khoản hiện tại trước.
          </p>
        )}
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
        <h3 className="h5 fw-bold mb-3">Tạo yêu cầu rút tiền</h3>
        <div style={{ display: "flex", gap: 8, maxWidth: 420 }}>
          <input
            value={soTienYeuCau}
            onChange={(e) => setSoTienYeuCau(e.target.value)}
            type="number"
            min={10000}
            placeholder="Số tiền muốn rút"
            style={{ flex: 1 }}
          />
          <button className="btn btn-success" onClick={guiYeuCauRutTien}>Gửi yêu cầu</button>
        </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4">
        <h3 className="h5 fw-bold mb-3">Lịch sử yêu cầu rút</h3>
        {lichSuRutTien.length === 0 ? (
          <p>Chưa có yêu cầu rút tiền nào.</p>
        ) : (
          <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã YC</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Nội dung CK</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {lichSuRutTien.map((item) => (
                <tr key={item.maYeuCauRutTien}>
                  <td>{item.maYeuCauRutTien}</td>
                  <td>{item.soTienYeuCau.toLocaleString("vi-VN")} VND</td>
                  <td>{hienThiTrangThaiYeuCauRutTien(item.trangThaiYeuCau)}</td>
                  <td>{item.noiDungChuyenKhoan ?? "-"}</td>
                  <td>{item.ghiChuAdmin ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
