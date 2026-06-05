import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import quaTangKhoaHocService, {
  type HocVienTangOptionDTO,
  type KhoaHocTangOptionDTO,
  type QuaTangKhoaHocItemDTO,
} from "@/services/qua-tang-khoa-hoc.service";
import { BsGiftFill, BsSearch } from "react-icons/bs";

const dinhDangTien = (gia: number, donVi: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: donVi || "VND",
    maximumFractionDigits: 0,
  }).format(gia || 0);

export default function TangKhoaHocGiangVien() {
  const [khoaHocs, setKhoaHocs] = useState<KhoaHocTangOptionDTO[]>([]);
  const [dangTaiKhoa, setDangTaiKhoa] = useState(false);
  const [dangTangMaKhoaHoc, setDangTangMaKhoaHoc] = useState<number | null>(null);

  const [lichSu, setLichSu] = useState<QuaTangKhoaHocItemDTO[]>([]);
  const [dangTaiLichSu, setDangTaiLichSu] = useState(false);
  const [tuKhoaLichSu, setTuKhoaLichSu] = useState("");

  const napKhoaHoc = async () => {
    try {
      setDangTaiKhoa(true);
      const data = await quaTangKhoaHocService.layKhoaHocCuaGiangVien();
      setKhoaHocs(data);
    } finally {
      setDangTaiKhoa(false);
    }
  };

  const napLichSu = async (tuKhoa?: string) => {
    try {
      setDangTaiLichSu(true);
      const data = await quaTangKhoaHocService.lichSuGiangVien(undefined, tuKhoa);
      setLichSu(data);
    } finally {
      setDangTaiLichSu(false);
    }
  };

  useEffect(() => {
    void napKhoaHoc();
    void napLichSu();
  }, []);

  const lichSuHienThi = useMemo(() => lichSu.slice(0, 30), [lichSu]);

  const handleTang = async (khoaHoc: KhoaHocTangOptionDTO) => {
    let dsHocVien: HocVienTangOptionDTO[] = [];
    try {
      setDangTangMaKhoaHoc(khoaHoc.maKhoaHoc);
      dsHocVien = await quaTangKhoaHocService.layHocVienCoTheNhanTheoKhoaHoc(khoaHoc.maKhoaHoc);
    } catch {
      await Swal.fire("Lỗi", "Không tải được danh sách học viên có thể nhận.", "error");
      setDangTangMaKhoaHoc(null);
      return;
    }

    if (dsHocVien.length === 0) {
      await Swal.fire("Thông báo", "Không còn học viên phù hợp để nhận quà cho khóa này.", "info");
      setDangTangMaKhoaHoc(null);
      return;
    }

    const ketQua = await Swal.fire({
      title: `Tặng khóa: ${khoaHoc.tenKhoaHoc}`,
      html: `
        <select id="gv-tang-ma-hoc-vien" class="swal2-input">
          ${dsHocVien
            .map((x) => `<option value="${x.maNguoiDung}">#${x.maNguoiDung} - ${x.hoTen} ${x.email ? `(${x.email})` : ""}</option>`)
            .join("")}
        </select>
        <textarea id="gv-tang-loi-nhan" class="swal2-textarea" placeholder="Lời nhắn (tùy chọn)"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Xác nhận tặng",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        const maNguoiNhanRaw = (document.getElementById("gv-tang-ma-hoc-vien") as HTMLSelectElement | null)?.value?.trim() ?? "";
        const loiNhan = (document.getElementById("gv-tang-loi-nhan") as HTMLTextAreaElement | null)?.value?.trim() ?? "";
        const maNguoiNhan = Number(maNguoiNhanRaw);
        if (!Number.isFinite(maNguoiNhan) || maNguoiNhan <= 0) {
          Swal.showValidationMessage("Vui lòng chọn học viên hợp lệ.");
          return;
        }
        return { maNguoiNhan, loiNhan };
      },
    });

    if (!ketQua.isConfirmed || !ketQua.value) {
      setDangTangMaKhoaHoc(null);
      return;
    }

    try {
      const res = await quaTangKhoaHocService.giangVienTang({
        maKhoaHoc: khoaHoc.maKhoaHoc,
        maNguoiNhan: ketQua.value.maNguoiNhan,
        loiNhan: ketQua.value.loiNhan || undefined,
      });
      await Swal.fire("Thành công", res.thongBao || "Tặng khóa học thành công.", "success");
      await napLichSu(tuKhoaLichSu || undefined);
    } catch (error: any) {
      await Swal.fire("Không thể tặng", error?.response?.data?.thongBao || "Đã có lỗi xảy ra.", "error");
    } finally {
      setDangTangMaKhoaHoc(null);
    }
  };

  return (
    <div className="qllh-container">
      <div className="qllh-header">
        <h1 className="qllh-title">Tặng khóa học</h1>
        <p className="qllh-subtitle">Chọn khóa học của bạn, sau đó chọn học viên từ danh sách gợi ý để tặng.</p>
      </div>

      <div className="qllh-table-wrapper" style={{ padding: 16, marginBottom: 20 }}>
        {dangTaiKhoa ? (
          <div style={{ padding: 16 }}>Đang tải danh sách khóa học...</div>
        ) : khoaHocs.length === 0 ? (
          <div style={{ padding: 16 }}>Bạn chưa có khóa học để tặng.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {khoaHocs.map((kh) => (
              <div key={kh.maKhoaHoc} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff" }}>
                <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>{kh.tenKhoaHoc}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 10 }}>
                  Mã khóa học: #{kh.maKhoaHoc} - {dinhDangTien(kh.giaKhoaHoc, kh.donViTienTe)}
                </div>
                <button
                  className="qllh-btn-search"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => void handleTang(kh)}
                  disabled={dangTangMaKhoaHoc === kh.maKhoaHoc}
                >
                  <BsGiftFill />
                  {dangTangMaKhoaHoc === kh.maKhoaHoc ? "Đang xử lý..." : "Tặng khóa học này"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="qllh-table-wrapper">
        <div className="qllh-filter-bar" style={{ marginBottom: 0 }}>
          <div style={{ minWidth: 260 }}>
            <h3 style={{ margin: 0, color: "#9a3412" }}>Lịch sử tặng khóa học</h3>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>Các lượt tặng khóa học gần đây của giảng viên.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void napLichSu(tuKhoaLichSu || undefined);
            }}
            className="qllh-search-form"
            style={{ maxWidth: 520 }}
          >
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <BsSearch style={{ position: "absolute", left: "16px", color: "#9ca3af" }} />
              <input
                type="search"
                placeholder="Tìm theo mã/tên/email..."
                className="qllh-search-input"
                value={tuKhoaLichSu}
                onChange={(e) => setTuKhoaLichSu(e.target.value)}
              />
            </div>
            <button type="submit" className="qllh-btn-search">Lọc</button>
          </form>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="qllh-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khóa học</th>
                <th>Người nhận</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {dangTaiLichSu ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Đang tải lịch sử...</td></tr>
              ) : lichSuHienThi.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Chưa có lịch sử tặng khóa học.</td></tr>
              ) : (
                lichSuHienThi.map((item) => (
                  <tr key={item.maQuaTang}>
                    <td>#{item.maQuaTang}</td>
                    <td>{item.tenKhoaHoc}</td>
                    <td>{item.tenNguoiNhan}<br /><small style={{ color: "#6b7280" }}>{item.emailNguoiNhan || "—"}</small></td>
                    <td>{item.trangThai}</td>
                    <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
