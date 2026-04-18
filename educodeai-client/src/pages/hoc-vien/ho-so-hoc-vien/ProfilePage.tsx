import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  getHoSoHocVien,
  type HoSoHocVienDTO,
  updateHoSoHocVien,
} from "@/services/ho-so-hoc-vien.service";
import { useNavigate } from "react-router-dom";

const roleLabel = (vaiTro: number): string => {
  switch (vaiTro) {
    case 0:
      return "Quản trị viên";
    case 1:
      return "Giảng viên";
    default:
      return "Học viên";
  }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [hoSo, setHoSo] = useState<HoSoHocVienDTO | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [hoTenMoi, setHoTenMoi] = useState("");

  const chuCaiDau = useMemo(() => {
    const ten = (hoSo?.hoTen ?? "").trim();
    return ten ? ten.charAt(0).toUpperCase() : "?";
  }, [hoSo?.hoTen]);

  const taiHoSo = async () => {
    try {
      setDangTai(true);
      const data = await getHoSoHocVien();

      const raw = localStorage.getItem("user_info");
      if (raw) {
        try {
          const localUser = JSON.parse(raw) as { email?: string; maNguoiDung?: number };
          const localEmail = (localUser.email ?? "").trim().toLowerCase();
          const apiEmail = (data.email ?? "").trim().toLowerCase();
          if (localEmail && apiEmail && localEmail !== apiEmail) {
            localStorage.removeItem("user_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("token");
            localStorage.removeItem("user_info");
            await Swal.fire(
              "Phiên đăng nhập không khớp",
              "Hệ thống phát hiện phiên cũ. Vui lòng đăng nhập lại để đồng bộ tài khoản.",
              "warning"
            );
            navigate("/dang-nhap", { replace: true });
            return;
          }
        } catch {
          // ignore malformed local user info
        }
      }

      setHoSo(data);
      setHoTenMoi(data.hoTen ?? "");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Không tải được hồ sơ cá nhân.";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    void taiHoSo();
  }, [navigate]);

  const luuHoTen = async () => {
    if (!hoSo) return;
    const tenChuan = hoTenMoi.trim();
    if (tenChuan.length < 2) {
      Swal.fire("Thông báo", "Họ tên phải có ít nhất 2 ký tự.", "warning");
      return;
    }
    if (tenChuan === (hoSo.hoTen ?? "").trim()) {
      Swal.fire("Thông báo", "Bạn chưa thay đổi họ tên.", "info");
      return;
    }

    try {
      setDangLuu(true);
      const data = await updateHoSoHocVien({ hoTen: tenChuan });
      setHoSo(data);
      setHoTenMoi(data.hoTen ?? tenChuan);

      const raw = localStorage.getItem("user_info");
      if (raw) {
        try {
          const user = JSON.parse(raw);
          localStorage.setItem(
            "user_info",
            JSON.stringify({ ...user, hoTen: data.hoTen ?? tenChuan, name: data.hoTen ?? tenChuan })
          );
        } catch {
          // ignore broken user_info format
        }
      }

      Swal.fire("Thành công", "Đã cập nhật họ tên.", "success");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Không thể cập nhật họ tên.";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setDangLuu(false);
    }
  };

  if (dangTai) {
    return <div>Đang tải hồ sơ cá nhân...</div>;
  }

  if (!hoSo) {
    return (
      <div>
        <p>Không có dữ liệu hồ sơ.</p>
        <button type="button" className="btn btn-primary" onClick={() => void taiHoSo()}>
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-3">Hồ sơ cá nhân</h2>
      <p className="text-muted mb-4">
        Bạn chỉ có thể chỉnh sửa họ tên. Các thông tin còn lại hiển thị để đối chiếu.
      </p>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                  fontSize: 34,
                  fontWeight: 700,
                }}
              >
                {chuCaiDau}
              </div>
              <h5 className="mb-1">{hoSo.hoTen || "—"}</h5>
              <p className="text-muted mb-1">{hoSo.email || "—"}</p>
              <span className="badge bg-primary-subtle text-primary">
                {roleLabel(hoSo.vaiTro)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Thông tin tài khoản</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Họ tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={hoTenMoi}
                    onChange={(e) => setHoTenMoi(e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={hoSo.email ?? ""} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vai trò</label>
                  <input type="text" className="form-control" value={roleLabel(hoSo.vaiTro)} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tổng khóa học</label>
                  <input type="text" className="form-control" value={String(hoSo.tongKhoaHoc ?? 0)} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Đã hoàn thành</label>
                  <input type="text" className="form-control" value={String(hoSo.daHoanThanh ?? 0)} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Đang học</label>
                  <input type="text" className="form-control" value={String(hoSo.dangHoc ?? 0)} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Chứng chỉ</label>
                  <input type="text" className="form-control" value={String(hoSo.chungChi ?? 0)} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Giờ đã học</label>
                  <input type="text" className="form-control" value={`${hoSo.gioDaHoc ?? 0}h`} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tỷ lệ hoàn thành</label>
                  <input type="text" className="form-control" value={`${hoSo.tyLeHoanThanh ?? 0}%`} disabled />
                </div>
              </div>

              <div className="mt-4 d-flex gap-2 align-items-center">
                <button
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center justify-content-center"
                  style={{
                    minWidth: 130,
                    height: 42,
                    margin: 0,
                    padding: "0 16px",
                    lineHeight: 1,
                    borderRadius: 10,
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                  onClick={() => void luuHoTen()}
                  disabled={dangLuu}
                >
                  {dangLuu ? "Đang lưu..." : "Lưu họ tên"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                  style={{
                    minWidth: 130,
                    height: 42,
                    margin: 0,
                    padding: "0 16px",
                    lineHeight: 1,
                    borderRadius: 10,
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                  onClick={() => setHoTenMoi(hoSo.hoTen ?? "")}
                  disabled={dangLuu}
                >
                  Hoàn tác
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
