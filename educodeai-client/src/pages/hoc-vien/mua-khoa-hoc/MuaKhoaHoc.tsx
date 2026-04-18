import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { encodeId } from "@/utils/id-helper";
import {
  ThanhToanKhoaHocService,
  type ThongTinMuaKhoaHocDTO,
  type ThongTinMaQRThanhToanDTO
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

const dinhDangTien = (soTien: number, donViTienTe: string): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: donViTienTe || "VND",
    maximumFractionDigits: 0
  }).format(soTien);
};

const MuaKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [duLieuKhoaHoc, setDuLieuKhoaHoc] = useState<ThongTinMuaKhoaHocDTO | null>(null);
  const [duLieuQr, setDuLieuQr] = useState<ThongTinMaQRThanhToanDTO | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangMua, setDangMua] = useState(false);
  const [hienModalQr, setHienModalQr] = useState(false);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const boDemKiemTraRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  useEffect(() => {
    return () => {
      dungBoDemKiemTra();
    };
  }, []);

  const xuLyMuaNgay = async () => {
    if (!duLieuKhoaHoc) return;
    try {
      setDangMua(true);
      daChuyenTrangRef.current = false;
      const duLieuMaQr = await ThanhToanKhoaHocService.taoMaQrThanhToan(duLieuKhoaHoc.maKhoaHoc);
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

  const kiemTraNgayBayGio = async () => {
    if (!duLieuQr || !duLieuKhoaHoc) return;
    try {
      const trangThai = await ThanhToanKhoaHocService.kiemTraTrangThaiThanhToan(duLieuQr.maDonHang);
      if (trangThai.daMoKhoaHoc || trangThai.trangThaiDonHang === "PAID") {
        daChuyenTrangRef.current = true;
        dungBoDemKiemTra();
        setHienModalQr(false);
        await Swal.fire("Thành công", "Hệ thống đã nhận thanh toán, khóa học đã mở.", "success");
        chuyenSangTrangHoc(duLieuKhoaHoc.maKhoaHoc, duLieuKhoaHoc.tenKhoaHoc);
      } else {
        await Swal.fire("Thông báo", "Hệ thống chưa nhận được tiền về. Bạn chờ thêm vài giây nhé.", "info");
      }
    } catch {
      await Swal.fire("Lỗi", "Không kiểm tra được trạng thái thanh toán lúc này.", "error");
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

              {duLieuKhoaHoc.daMua ? (
                <button
                  className="btn btn-success w-100 py-2"
                  onClick={() => chuyenSangTrangHoc(duLieuKhoaHoc.maKhoaHoc, duLieuKhoaHoc.tenKhoaHoc)}
                >
                  Bạn đã mua khóa học - Vào học ngay
                </button>
              ) : (
                <button
                  className="btn btn-primary w-100 py-2"
                  disabled={dangMua || !duLieuKhoaHoc.choPhepMua}
                  onClick={xuLyMuaNgay}
                >
                  {dangMua ? "Đang tạo mã QR..." : "Thanh toán khóa học"}
                </button>
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
                style={{ width: 280, height: 280, objectFit: "contain" }}
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

            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-fill" onClick={kiemTraNgayBayGio}>
                Tôi đã chuyển khoản xong
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
    </div>
  );
};

export default MuaKhoaHoc;
