import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { NapTienAIService, type ThongTinViAIDTO, type LichSuNapTienAIItemDTO } from "@/services/nap-tien-ai.service";

function formatVndHienThi(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

function formatUsdHienThi(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  return `$${Number(n).toFixed(4)} USD`;
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

export default function NapTienAI() {
  const [dangTai, setDangTai] = useState<boolean>(true);
  const [thongTinVi, setThongTinVi] = useState<ThongTinViAIDTO | null>(null);
  const [lichSu, setLichSu] = useState<LichSuNapTienAIItemDTO[]>([]);
  const [soTienVndInput, setSoTienVndInput] = useState<string>("");
  const [dangXuLy, setDangXuLy] = useState<boolean>(false);

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      const [viData, lichSuData] = await Promise.all([
        NapTienAIService.layThongTinVi(),
        NapTienAIService.layLichSu()
      ]);
      console.log("📊 Dữ liệu ví AI nhận được:", viData);
      console.log("📜 Lịch sử giao dịch:", lichSuData);
      setThongTinVi(viData);
      setLichSu(lichSuData);
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error?.response?.data?.thongBao || "Không thể tải thông tin ví AI"
      });
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  const tinhToanUsdNhanDuoc = (): number => {
    const soTien = parseFloat(soTienVndInput);
    if (isNaN(soTien) || soTien <= 0 || !thongTinVi) return 0;
    return soTien / thongTinVi.tyGiaHienTai;
  };

  const xuLyNapTien = async () => {
    const soTien = parseFloat(soTienVndInput);

    if (isNaN(soTien) || soTien < 10000) {
      Swal.fire({
        icon: "warning",
        title: "Số tiền không hợp lệ",
        text: "Vui lòng nhập số tiền tối thiểu 10,000 VND"
      });
      return;
    }

    if (thongTinVi && soTien > thongTinVi.soDuVndKhaDung) {
      Swal.fire({
        icon: "warning",
        title: "Số dư không đủ",
        text: `Số dư VND khả dụng của bạn chỉ còn ${formatVndHienThi(thongTinVi.soDuVndKhaDung)}`
      });
      return;
    }

    const usdNhanDuoc = tinhToanUsdNhanDuoc();
    const result = await Swal.fire({
      icon: "question",
      title: "Xác nhận nạp tiền",
      html: `
        <p>Bạn sẽ chuyển đổi <strong>${formatVndHienThi(soTien)}</strong> thành <strong>${formatUsdHienThi(usdNhanDuoc)}</strong></p>
        <p class="text-muted small">Tỷ giá áp dụng: 1 USD = ${thongTinVi?.tyGiaHienTai.toLocaleString("vi-VN")} VND</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy"
    });

    if (!result.isConfirmed) return;

    setDangXuLy(true);
    try {
      const ketQua = await NapTienAIService.napTien(soTien);

      Swal.fire({
        icon: "success",
        title: "Nạp tiền thành công!",
        html: `
          <p>Bạn đã nạp thành công <strong>${formatUsdHienThi(ketQua.soTienUsd)}</strong></p>
          <p class="text-muted small">Số dư AI Balance mới: ${formatUsdHienThi(ketQua.soDuAiBalanceUsdMoi)}</p>
        `
      });

      setSoTienVndInput("");
      await taiDuLieu();
    } catch (error: any) {
      console.error("Lỗi khi nạp tiền:", error);
      Swal.fire({
        icon: "error",
        title: "Nạp tiền thất bại",
        text: error?.response?.data?.thongBao || "Đã xảy ra lỗi khi nạp tiền"
      });
    } finally {
      setDangXuLy(false);
    }
  };

  if (dangTai) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  const usdPreview = tinhToanUsdNhanDuoc();
  const soTienVnd = parseFloat(soTienVndInput) || 0;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Nạp tiền vào ví AI</h2>
        <p className="text-muted">Chuyển đổi doanh thu VND thành AI Balance để sử dụng các tính năng AI</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <TheViThongKeCard
            label="Số dư AI Balance"
            value={formatUsdHienThi(thongTinVi?.soDuAiBalanceUsd)}
            iconClassBi="bi-wallet2"
            accentClass="bg-success-subtle text-success"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TheViThongKeCard
            label="Số dư VND khả dụng"
            value={formatVndHienThi(thongTinVi?.soDuVndKhaDung)}
            iconClassBi="bi-cash-stack"
            accentClass="bg-primary-subtle text-primary"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TheViThongKeCard
            label="Tỷ giá hiện tại"
            value={thongTinVi ? `1 USD = ${thongTinVi.tyGiaHienTai.toLocaleString("vi-VN")} VND` : "—"}
            iconClassBi="bi-currency-exchange"
            accentClass="bg-info-subtle text-info"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <TheViThongKeCard
            label="Bạn sẽ nhận được"
            value={soTienVnd >= 10000 ? formatUsdHienThi(usdPreview) : "—"}
            iconClassBi="bi-arrow-right-circle"
            accentClass="bg-warning-subtle text-warning"
          />
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Form nạp tiền</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label htmlFor="soTienVnd" className="form-label">
                Số tiền VND muốn chuyển đổi
              </label>
              <input
                type="number"
                className="form-control"
                id="soTienVnd"
                placeholder="Nhập số tiền (tối thiểu 10,000 VND)"
                value={soTienVndInput}
                onChange={(e) => setSoTienVndInput(e.target.value)}
                min="10000"
                max={thongTinVi?.soDuVndKhaDung}
                disabled={dangXuLy}
              />
              {soTienVnd > 0 && soTienVnd < 10000 && (
                <div className="text-danger small mt-1">Số tiền tối thiểu là 10,000 VND</div>
              )}
              {thongTinVi && soTienVnd > thongTinVi.soDuVndKhaDung && (
                <div className="text-danger small mt-1">Số dư VND không đủ</div>
              )}
            </div>
            <div className="col-12 col-md-4 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={xuLyNapTien}
                disabled={
                  dangXuLy ||
                  soTienVnd < 10000 ||
                  !thongTinVi ||
                  soTienVnd > thongTinVi.soDuVndKhaDung
                }
              >
                {dangXuLy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Nạp tiền"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Lịch sử nạp tiền</h5>
        </div>
        <div className="card-body">
          {!lichSu || lichSu.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              Chưa có lịch sử nạp tiền
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mã GD</th>
                    <th>Số tiền VND</th>
                    <th>Số tiền USD</th>
                    <th>Tỷ giá</th>
                    <th>Trạng thái</th>
                    <th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {lichSu.map((item) => (
                    <tr key={item.maGiaoDich}>
                      <td>#{item.maGiaoDich}</td>
                      <td>{formatVndHienThi(item.soTienVnd)}</td>
                      <td>{formatUsdHienThi(item.soTienUsd)}</td>
                      <td>{item.tyGiaApDung.toLocaleString("vi-VN")}</td>
                      <td>
                        <span className="badge bg-success">{item.trangThai}</span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
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
