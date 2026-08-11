import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import quaTangKhoaHocService, {
  type HocVienTangOptionDTO,
  type KhoaHocTangOptionDTO,
  type QuaTangKhoaHocItemDTO,
} from "@/services/qua-tang-khoa-hoc.service";
import "./TangKhoaHoc.css";

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
    <div className="gv-page tkh-container">
      <div className="tkh-header">
        <h1 className="tkh-title">Tặng khóa học</h1>
        <p className="tkh-subtitle">Chọn khóa học của bạn, sau đó chọn học viên từ danh sách gợi ý để tặng.</p>
      </div>

      <div className="tkh-panel">
        {dangTaiKhoa ? (
          <div className="tkh-placeholder">
            <i className="fas fa-spinner fa-spin" aria-hidden="true" />
            Đang tải danh sách khóa học...
          </div>
        ) : khoaHocs.length === 0 ? (
          <div className="tkh-placeholder">
            <i className="fas fa-box-open" aria-hidden="true" />
            Bạn chưa có khóa học để tặng.
          </div>
        ) : (
          <div className="tkh-grid">
            {khoaHocs.map((kh) => (
              <div key={kh.maKhoaHoc} className="tkh-card">
                <div className="tkh-card-title">{kh.tenKhoaHoc}</div>
                <div className="tkh-card-meta">
                  Mã khóa học: #{kh.maKhoaHoc} - <span className="tkh-card-price">{dinhDangTien(kh.giaKhoaHoc, kh.donViTienTe)}</span>
                </div>
                <div className="tkh-card-spacer" />
                <button
                  className="tkh-btn-tang"
                  onClick={() => void handleTang(kh)}
                  disabled={dangTangMaKhoaHoc === kh.maKhoaHoc}
                >
                  <i className={dangTangMaKhoaHoc === kh.maKhoaHoc ? "fas fa-spinner fa-spin" : "fas fa-gift"} aria-hidden="true" />
                  {dangTangMaKhoaHoc === kh.maKhoaHoc ? "Đang xử lý..." : "Tặng khóa học này"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tkh-panel">
        <div className="tkh-history-bar">
          <div className="tkh-history-heading">
            <h3 className="tkh-history-title">Lịch sử tặng khóa học</h3>
            <p className="tkh-history-desc">Các lượt tặng khóa học gần đây của giảng viên.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void napLichSu(tuKhoaLichSu || undefined);
            }}
            className="tkh-search-form"
          >
            <div className="tkh-search-field">
              <i className="fas fa-magnifying-glass tkh-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Tìm theo mã/tên/email..."
                className="tkh-search-input"
                value={tuKhoaLichSu}
                onChange={(e) => setTuKhoaLichSu(e.target.value)}
              />
            </div>
            <button type="submit" className="tkh-btn-filter">Lọc</button>
          </form>
        </div>

        <div className="tkh-table-scroll">
          <table className="tkh-table">
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
                <tr><td colSpan={5} className="tkh-table-empty">Đang tải lịch sử...</td></tr>
              ) : lichSuHienThi.length === 0 ? (
                <tr><td colSpan={5} className="tkh-table-empty">Chưa có lịch sử tặng khóa học.</td></tr>
              ) : (
                lichSuHienThi.map((item) => (
                  <tr key={item.maQuaTang}>
                    <td>#{item.maQuaTang}</td>
                    <td>{item.tenKhoaHoc}</td>
                    <td>{item.tenNguoiNhan}<br /><small className="tkh-cell-sub">{item.emailNguoiNhan || "—"}</small></td>
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
