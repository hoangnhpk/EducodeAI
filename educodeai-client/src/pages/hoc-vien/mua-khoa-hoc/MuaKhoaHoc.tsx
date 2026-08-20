import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { encodeId } from "@/utils/id-helper";
import { formatGiaKhoaHoc, laKhoaHocMienPhi } from "@/utils/format-gia-khoa-hoc";
import {
  ThanhToanKhoaHocService,
  type ThongTinMuaKhoaHocDTO,
  type ThongTinMaQRThanhToanDTO,
  type ThongTinMaQuaTangDTO
} from "@/services/thanh-toan-khoa-hoc.service";

const taoSlug = (chuoi: string): string => {
  return chuoi
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

const dinhDangTien = (soTien: number, donViTienTe: string): string =>
  formatGiaKhoaHoc(soTien, donViTienTe);

const MuaKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [duLieuKhoaHoc, setDuLieuKhoaHoc] = useState<ThongTinMuaKhoaHocDTO | null>(null);
  const [duLieuQr, setDuLieuQr] = useState<ThongTinMaQRThanhToanDTO | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangMua, setDangMua] = useState(false);
  const [dangTaoMaTang, setDangTaoMaTang] = useState(false);
  const [hienModalQr, setHienModalQr] = useState(false);
  const [hienModalGift, setHienModalGift] = useState(false);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [dangGuiHoTro, setDangGuiHoTro] = useState(false);
  const [thoiGianChoHoTroConLai, setThoiGianChoHoTroConLai] = useState(0);
  const [duLieuGift, setDuLieuGift] = useState<ThongTinMaQuaTangDTO | null>(null);
  const [maVoucher, setMaVoucher] = useState("");
  const boDemKiemTraRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boDemMoHoTroRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const daChuyenTrangRef = useRef(false);

  const chuyenSangTrangHoc = (maKhoaHoc: number, tenKhoaHoc: string) => {
    navigate(`/khoa-hoc/${taoSlug(tenKhoaHoc)}/${encodeId(maKhoaHoc)}`);
  };

  useEffect(() => {
    const taiThongTin = async () => {
      if (!id) return;
      try {
        setDangTai(true);
        const thongTin = await ThanhToanKhoaHocService.layThongTinMuaKhoaHoc(Number(id));
        setDuLieuKhoaHoc(thongTin);
      } catch (loi: any) {
        const thongBao = loi?.response?.data?.thongBao || "Không thể tải thông tin mua khóa học.";
        await Swal.fire("Lỗi", thongBao, "error");
        navigate("/");
      } finally {
        setDangTai(false);
      }
    };

    taiThongTin();
  }, [id, navigate]);

  const dungBoDemKiemTra = () => {
    if (boDemKiemTraRef.current) {
      clearInterval(boDemKiemTraRef.current);
      boDemKiemTraRef.current = null;
    }
  };

  const dungBoDemMoHoTro = () => {
    if (boDemMoHoTroRef.current) {
      clearInterval(boDemMoHoTroRef.current);
      boDemMoHoTroRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      dungBoDemKiemTra();
      dungBoDemMoHoTro();
    };
  }, []);

  useEffect(() => {
    dungBoDemMoHoTro();
    const coModalThanhToanMo = (hienModalQr && !!duLieuQr) || (hienModalGift && !!duLieuGift);
    if (!coModalThanhToanMo) {
      setThoiGianChoHoTroConLai(0);
      return;
    }

    const mocMoNut = Date.now() + 20000;
    const capNhat = () => {
      const conLai = Math.max(0, Math.ceil((mocMoNut - Date.now()) / 1000));
      setThoiGianChoHoTroConLai(conLai);
      if (conLai <= 0) {
        dungBoDemMoHoTro();
      }
    };

    capNhat();
    boDemMoHoTroRef.current = setInterval(capNhat, 1000);
    return () => dungBoDemMoHoTro();
  }, [hienModalQr, duLieuQr?.maDonHang, hienModalGift, duLieuGift?.maDonHang]);

  const xuLyMuaNgay = async () => {
    if (!duLieuKhoaHoc) return;
    try {
      setDangMua(true);
      daChuyenTrangRef.current = false;

      if (duLieuKhoaHoc.laMienPhi || laKhoaHocMienPhi(duLieuKhoaHoc.donViTienTe)) {
        const ketQua = await ThanhToanKhoaHocService.muaNgay(duLieuKhoaHoc.maKhoaHoc);
        if (ketQua.thanhCong || ketQua.daMua) {
          await Swal.fire("Thành công", ketQua.thongBao || "Đăng ký khóa học miễn phí thành công.", "success");
          chuyenSangTrangHoc(duLieuKhoaHoc.maKhoaHoc, duLieuKhoaHoc.tenKhoaHoc);
        } else {
          await Swal.fire("Thất bại", ketQua.thongBao, "error");
        }
        return;
      }

      const duLieuMaQr = await ThanhToanKhoaHocService.taoMaQrThanhToan(duLieuKhoaHoc.maKhoaHoc, maVoucher);
      setDuLieuQr(duLieuMaQr);
      setHienModalQr(true);

      dungBoDemKiemTra();
      boDemKiemTraRef.current = setInterval(async () => {
        if (dangKiemTra || daChuyenTrangRef.current) return;
        try {
          setDangKiemTra(true);
          const trangThai = await ThanhToanKhoaHocService.kiemTraTrangThaiThanhToan(duLieuMaQr.maDonHang);
          if (trangThai.daMoKhoaHoc || trangThai.trangThaiDonHang === "PAID") {
            daChuyenTrangRef.current = true;
            dungBoDemKiemTra();
            setHienModalQr(false);
            await Swal.fire("Thành công", "Hệ thống đã nhận thanh toán, khóa học đã mở.", "success");
            chuyenSangTrangHoc(duLieuKhoaHoc.maKhoaHoc, duLieuKhoaHoc.tenKhoaHoc);
          }
        } catch {
          // Không hiển thị lỗi trong lúc polling để tránh gây nhiễu UX
        } finally {
          setDangKiemTra(false);
        }
      }, 3000);
    } catch (loi: any) {
      const thongBao = loi?.response?.data?.thongBao || loi?.response?.data?.message || "Mua khóa học thất bại.";
      await Swal.fire("Thất bại", thongBao, "error");
    } finally {
      setDangMua(false);
    }
  };

  const xuLyTaoMaQuaTang = async () => {
    if (!duLieuKhoaHoc) return;
    try {
      setDangTaoMaTang(true);
      const gift = await ThanhToanKhoaHocService.taoMaQuaTang(duLieuKhoaHoc.maKhoaHoc, maVoucher);
      setDuLieuGift(gift);
      setHienModalGift(true);

      dungBoDemKiemTra();
      boDemKiemTraRef.current = setInterval(async () => {
        if (dangKiemTra) return;
        try {
          setDangKiemTra(true);
          const trangThai = await ThanhToanKhoaHocService.kiemTraTrangThaiMaQuaTang(gift.maDonHang);
          if (trangThai.sanSangSuDung) {
            dungBoDemKiemTra();
            await Swal.fire("Thành công", "Mã quà tặng đã được kích hoạt. Bạn có thể gửi code cho người nhận.", "success");
          }
        } catch {
          // noop
        } finally {
          setDangKiemTra(false);
        }
      }, 3000);
    } catch (loi: any) {
      const thongBao = loi?.response?.data?.thongBao || "Không thể tạo mã quà tặng.";
      await Swal.fire("Lỗi", thongBao, "error");
    } finally {
      setDangTaoMaTang(false);
    }
  };

  const guiYeuCauHoTroTheoDonHang = async (maDonHang: number, dongModal: () => void) => {
    if (thoiGianChoHoTroConLai > 0) return;

    const ketQua = await Swal.fire({
      title: "Gửi yêu cầu admin hỗ trợ?",
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;text-align:left;">
          <input
            id="ht-lien-lac"
            placeholder="SĐT/Zalo/Email liên hệ nhanh"
            style="width:100%;margin:0;box-sizing:border-box;height:auto;padding:10px 12px;font-size:1rem;border:1px solid #d9d9d9;border-radius:8px;"
          />
          <textarea
            id="ht-noi-dung"
            rows="3"
            placeholder="Mô tả ngắn (tùy chọn)"
            style="width:100%;margin:0;box-sizing:border-box;height:auto;padding:10px 12px;font-size:1rem;border:1px solid #d9d9d9;border-radius:8px;resize:vertical;"
          ></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Gửi yêu cầu",
      cancelButtonText: "Hủy",
      focusConfirm: false,
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) {
          container.style.zIndex = "12000";
        }
      },
      preConfirm: () => {
        const lienLac = (document.getElementById("ht-lien-lac") as HTMLInputElement | null)?.value?.trim() ?? "";
        const noiDung = (document.getElementById("ht-noi-dung") as HTMLTextAreaElement | null)?.value?.trim() ?? "";
        if (!lienLac) {
          Swal.showValidationMessage("Vui lòng nhập thông tin liên lạc nhanh.");
          return;
        }
        return { lienLac, noiDung };
      }
    });

    if (!ketQua.isConfirmed || !ketQua.value) return;

    try {
      setDangGuiHoTro(true);
      await ThanhToanKhoaHocService.taoYeuCauHoTroThanhToan(
        maDonHang,
        ketQua.value.lienLac,
        ketQua.value.noiDung || undefined
      );
      dungBoDemKiemTra();
      dungBoDemMoHoTro();
      dongModal();
      await Swal.fire(
        "Đã gửi",
        "Admin đã nhận yêu cầu hỗ trợ của bạn. Vui lòng giữ lại nội dung chuyển khoản để đối soát.",
        "success"
      );
    } catch (loi: any) {
      const thongBao = loi?.response?.data?.thongBao || "Không gửi được yêu cầu hỗ trợ lúc này.";
      await Swal.fire("Lỗi", thongBao, "error");
    } finally {
      setDangGuiHoTro(false);
    }
  };

  if (dangTai) {
    return <div className="container py-5 text-center">Đang tải thông tin mua khóa học...</div>;
  }

  if (!duLieuKhoaHoc) {
    return <div className="container py-5 text-center text-danger">Không tìm thấy khóa học.</div>;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-3">{duLieuKhoaHoc.tenKhoaHoc}</h3>
              <p className="text-muted">{duLieuKhoaHoc.moTa || "Khóa học chưa có mô tả."}</p>

              <div className="d-flex align-items-center justify-content-between bg-light rounded p-3 mb-4">
                <div>
                  <div className="small text-muted">Giá khóa học</div>
                  <div className="h4 m-0 text-primary fw-bold">
                    {dinhDangTien(duLieuKhoaHoc.giaKhoaHoc, duLieuKhoaHoc.donViTienTe)}
                  </div>
                </div>
                <span className="badge bg-warning text-dark">Marketplace</span>
              </div>

              <div className="mb-3">
                {!laKhoaHocMienPhi(duLieuKhoaHoc.donViTienTe) && !duLieuKhoaHoc.laMienPhi && (
                  <>
                    <label className="form-label fw-semibold">Mã giảm giá (nếu có)</label>
                    <input
                      className="form-control"
                      placeholder="Nhập mã giảm giá trước khi tạo QR"
                      value={maVoucher}
                      onChange={(e) => setMaVoucher(e.target.value.toUpperCase())}
                    />
                    <div className="form-text">
                      Mỗi đơn chỉ dùng 1 mã, mã sẽ được đối soát khi thanh toán thành công.
                    </div>
                  </>
                )}
              </div>

              {duLieuKhoaHoc.daMua ? (
                <button
                  className="btn btn-success w-100 py-2"
                  onClick={() => chuyenSangTrangHoc(duLieuKhoaHoc.maKhoaHoc, duLieuKhoaHoc.tenKhoaHoc)}
                >
                  Bạn đã mua khóa học - Vào học ngay
                </button>
              ) : laKhoaHocMienPhi(duLieuKhoaHoc.donViTienTe) || duLieuKhoaHoc.laMienPhi ? (
                <button
                  className="btn btn-success w-100 py-2"
                  disabled={dangMua || !duLieuKhoaHoc.choPhepMua}
                  onClick={() => void xuLyMuaNgay()}
                >
                  {dangMua ? "Đang đăng ký..." : "Học miễn phí ngay"}
                </button>
              ) : (
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary w-100 py-2"
                    disabled={dangMua || !duLieuKhoaHoc.choPhepMua}
                    onClick={xuLyMuaNgay}
                  >
                    {dangMua ? "Đang tạo mã QR..." : "Thanh toán khóa học"}
                  </button>
                  <button
                    className="btn btn-outline-success w-100 py-2"
                    disabled={dangTaoMaTang || !duLieuKhoaHoc.choPhepMua}
                    onClick={() => void xuLyTaoMaQuaTang()}
                  >
                    {dangTaoMaTang ? "Đang tạo mã quà..." : "Tặng khóa học bằng mã code"}
                  </button>
                </div>
              )}

              {!duLieuKhoaHoc.choPhepMua && (
                <div className="text-danger mt-3 small">Khóa học hiện chưa mở bán.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hienModalQr && duLieuQr && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div className="bg-white rounded p-4" style={{ width: "min(520px, 95vw)" }}>
            <h4 className="fw-bold mb-2">Quét mã để thanh toán</h4>
            <p className="text-muted mb-3">Hệ thống tự kiểm tra trạng thái mỗi 3 giây sau khi tiền về.</p>

            <div className="text-center mb-3">
              <img
                src={duLieuQr.duongDanAnhQr}
                alt="Ma QR thanh toan"
                style={{ width: 'min(280px, 100%)', height: 'auto', aspectRatio: '1', objectFit: 'contain' }}
              />
            </div>

            <div className="bg-light rounded p-3 mb-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Số tiền</span>
                <strong>{dinhDangTien(duLieuQr.soTienCanThanhToan, duLieuQr.donViTienTe)}</strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">Nội dung chuyển khoản</span>
                <strong className="text-primary">{duLieuQr.noiDungChuyenKhoan}</strong>
              </div>
            </div>

            <div className="small text-muted mb-3">
              Sau 30 giây chuyển khoản thành công mà không thấy hệ thống cập nhật, hãy bấm nút báo admin hỗ trợ.
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-warning flex-fill"
                disabled={dangGuiHoTro || thoiGianChoHoTroConLai > 0}
                onClick={() =>
                  void guiYeuCauHoTroTheoDonHang(duLieuQr.maDonHang, () => {
                    setHienModalQr(false);
                  })
                }
              >
                {dangGuiHoTro
                  ? "Đang gửi..."
                  : thoiGianChoHoTroConLai > 0
                    ? `Báo admin hỗ trợ (${thoiGianChoHoTroConLai}s)`
                    : "Báo admin hỗ trợ"}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setHienModalQr(false);
                  dungBoDemKiemTra();
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {hienModalGift && duLieuGift && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div className="bg-white rounded p-4" style={{ width: "min(520px, 95vw)" }}>
            <h4 className="fw-bold mb-2">Mã quà tặng: {duLieuGift.code}</h4>
            <p className="text-muted mb-3">Thanh toán xong, mã sẽ tự kích hoạt để người nhận nhập.</p>
            <div className="text-center mb-3">
              <img src={duLieuGift.duongDanAnhQr} alt="Ma QR qua tang" style={{ width: 'min(280px, 100%)', height: 'auto', aspectRatio: '1', objectFit: 'contain' }} />
            </div>
            <div className="bg-light rounded p-3 mb-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Số tiền</span>
                <strong>{dinhDangTien(duLieuGift.soTienCanThanhToan, duLieuGift.donViTienTe)}</strong>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">Nội dung CK</span>
                <strong className="text-primary">{duLieuGift.noiDungChuyenKhoan}</strong>
              </div>
            </div>
            <div className="small text-muted mb-3">
              Sau 30 giây chuyển khoản thành công mà không thấy hệ thống cập nhật, hãy bấm nút báo admin hỗ trợ.
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-warning flex-fill"
                disabled={dangGuiHoTro || thoiGianChoHoTroConLai > 0}
                onClick={() =>
                  void guiYeuCauHoTroTheoDonHang(duLieuGift.maDonHang, () => {
                    setHienModalGift(false);
                  })
                }
              >
                {dangGuiHoTro
                  ? "Đang gửi..."
                  : thoiGianChoHoTroConLai > 0
                    ? `Báo admin hỗ trợ (${thoiGianChoHoTroConLai}s)`
                    : "Báo admin hỗ trợ"}
              </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setHienModalGift(false);
                dungBoDemKiemTra();
              }}
            >
              Đóng
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuaKhoaHoc;
