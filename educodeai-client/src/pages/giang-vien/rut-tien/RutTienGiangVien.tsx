import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { DANH_MUC_NGAN_HANG_MAC_DINH } from "@/constants/danh-muc-ngan-hang-mac-dinh";
import { RutTienGiangVienService } from "@/services/rut-tien-giang-vien.service";
import type { NganHangItemDTO, ThongTinViGiangVienDTO, YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";

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

  const kiemTraVoiVietQr = async () => {
    if (!maNganHang || !soTaiKhoanNhanTien.trim() || !tenTaiKhoanNhanTien.trim()) {
      Swal.fire("Thông báo", "Vui lòng chọn ngân hàng, nhập số tài khoản và tên chủ tài khoản.", "warning");
      return;
    }

    try {
      const kq = await RutTienGiangVienService.kiemTraTaiKhoan({
        maNganHang,
        soTaiKhoan: soTaiKhoanNhanTien.trim(),
        tenChuTaiKhoan: tenTaiKhoanNhanTien.trim()
      });
      const icon =
        kq.thieuCauHinhVietQrLookup
          ? "warning"
          : kq.timThayTaiKhoan && kq.tenKhop
            ? "success"
            : kq.timThayTaiKhoan
              ? "warning"
              : "info";
      const thongBaoHtml = kq.thongBao.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      Swal.fire({
        title: "Kết quả tra cứu VietQR.io",
        html: `<p style="text-align:left">${thongBaoHtml}</p>${
          kq.tenChuTaiKhoanTuVietQr
            ? `<p><b>Tên từ VietQR.io:</b> ${String(kq.tenChuTaiKhoanTuVietQr).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
            : ""
        }`,
        icon,
        width: kq.thieuCauHinhVietQrLookup ? "32em" : undefined
      });
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không gọi được kiểm tra tài khoản.", "error");
    }
  };

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
    return <div>Đang tải dữ liệu ví giảng viên...</div>;
  }

  const apiBase = import.meta.env.VITE_API_URL ?? "";

  return (
    <div>
      <h2>Ví giảng viên</h2>

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

      <div className="dashboard-card" style={{ marginBottom: 16, padding: 16 }}>
        <p><b>Tổng doanh thu ghi nhận:</b> {thongTinVi?.tongDoanhThuDaGhiNhan?.toLocaleString("vi-VN")} VND</p>
        <p><b>Tổng đang chờ xử lý rút:</b> {thongTinVi?.tongDangChoXuLyRut?.toLocaleString("vi-VN")} VND</p>
        <p><b>Tổng đã chuyển khoản:</b> {thongTinVi?.tongDaChuyenKhoan?.toLocaleString("vi-VN")} VND</p>
        <p><b>Số dư khả dụng:</b> {thongTinVi?.soDuKhaDung?.toLocaleString("vi-VN")} VND</p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 16, padding: 16 }}>
        <h3>Tài khoản nhận tiền (mỗi giảng viên chỉ 1 tài khoản)</h3>
        <p style={{ fontSize: 13, color: "#555" }}>
          Tra cứu số tài khoản qua API VietQR.io (POST /v2/lookup). Cấu hình{" "}
          <code>VietQrLookup:ClientId</code> và <code>VietQrLookup:ApiKey</code> trên server (lấy tại{" "}
          <a href="https://my.vietqr.io/" target="_blank" rel="noreferrer">
            my.vietqr.io
          </a>
          ). Khác hoàn toàn với cấu hình SePay thanh toán khóa học.
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
          {!daCoTaiKhoanNhanTien && (
            <button type="button" className="btn btn-outline-secondary" onClick={kiemTraVoiVietQr}>
              Kiểm tra với VietQR.io
            </button>
          )}
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

      <div className="dashboard-card" style={{ marginBottom: 16, padding: 16 }}>
        <h3>Tạo yêu cầu rút tiền</h3>
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

      <div className="dashboard-card" style={{ padding: 16 }}>
        <h3>Lịch sử yêu cầu rút</h3>
        {lichSuRutTien.length === 0 ? (
          <p>Chưa có yêu cầu rút tiền nào.</p>
        ) : (
          <table className="table table-striped">
            <thead>
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
                  <td>{item.trangThaiYeuCau}</td>
                  <td>{item.noiDungChuyenKhoan ?? "-"}</td>
                  <td>{item.ghiChuAdmin ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
