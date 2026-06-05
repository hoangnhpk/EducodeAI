import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MaGiamGiaService, type KhoaHocApDungOptionDTO, type MaGiamGiaItemDTO } from "@/services/ma-giam-gia.service";

export default function QuanLyMaGiamGiaAdmin() {
  const [danhSach, setDanhSach] = useState<MaGiamGiaItemDTO[]>([]);
  const [khoaHocOptions, setKhoaHocOptions] = useState<KhoaHocApDungOptionDTO[]>([]);
  const [chonKhoaHoc, setChonKhoaHoc] = useState<number[]>([]);
  const [form, setForm] = useState({
    code: "",
    tenChuongTrinh: "",
    loaiGiamGia: "PERCENT" as "PERCENT" | "FIXED",
    giaTriGiam: 10,
    giamToiDa: 0,
    soLuongToiDa: 0
  });

  const load = async () => {
    const [ds, khoaHoc] = await Promise.all([
      MaGiamGiaService.layDanhSachAdmin(),
      MaGiamGiaService.layKhoaHocAdmin()
    ]);
    setDanhSach(ds);
    setKhoaHocOptions(khoaHoc);
  };

  useEffect(() => {
    void load();
  }, []);

  const sinhMaTuDong = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const randomPart = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((prev) => ({ ...prev, code: `SALE-${randomPart}` }));
  };

  const taoMoi = async () => {
    try {
      if (!form.code || !form.tenChuongTrinh || chonKhoaHoc.length === 0) {
        await Swal.fire("Thiếu dữ liệu", "Vui lòng nhập đầy đủ và chọn ít nhất 1 khóa học.", "warning");
        return;
      }
      await MaGiamGiaService.taoChoAdmin({
        ...form,
        batDauAt: new Date().toISOString(),
        ketThucAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        apDungTatCaKhoaHocCuaGiangVien: false,
        danhSachMaKhoaHoc: chonKhoaHoc,
        giamToiDa: form.loaiGiamGia === "PERCENT" ? form.giamToiDa : undefined
      });
      await Swal.fire("Thành công", "Đã tạo mã giảm giá.", "success");
      setForm({ code: "", tenChuongTrinh: "", loaiGiamGia: "PERCENT", giaTriGiam: 10, giamToiDa: 0, soLuongToiDa: 0 });
      setChonKhoaHoc([]);
      await load();
    } catch (error: any) {
      await Swal.fire("Lỗi", error?.response?.data?.thongBao || "Không thể tạo mã giảm giá.", "error");
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-1">Mã giảm giá (Admin)</h4>
            <div className="text-muted small">Tạo mã nhanh, chọn nhiều khóa bằng Ctrl + click.</div>
          </div>
          <span className="badge bg-light text-dark border">Tổng mã: {danhSach.length}</span>
        </div>
      </div>
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body row g-3">
          <div className="col-lg-4">
            <label className="form-label fw-semibold small">Mã code</label>
            <div className="input-group">
              <input
                className="form-control"
                placeholder="VD: WELCOME10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={sinhMaTuDong}>Sinh mã</button>
            </div>
          </div>
          <div className="col-lg-4">
            <label className="form-label fw-semibold small">Tên chương trình</label>
            <input className="form-control" placeholder="Tên chiến dịch giảm giá" value={form.tenChuongTrinh} onChange={(e) => setForm({ ...form, tenChuongTrinh: e.target.value })} />
          </div>
          <div className="col-lg-4">
            <label className="form-label fw-semibold small">Loại giảm giá</label>
            <select className="form-select" value={form.loaiGiamGia} onChange={(e) => setForm({ ...form, loaiGiamGia: e.target.value as "PERCENT" | "FIXED" })}>
              <option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền</option>
            </select>
          </div>
          <div className="col-md-4"><label className="form-label fw-semibold small">Giá trị giảm</label><input type="number" className="form-control" placeholder="Ví dụ: 10 hoặc 50000" value={form.giaTriGiam} onChange={(e) => setForm({ ...form, giaTriGiam: Number(e.target.value) })} /></div>
          <div className="col-md-4"><label className="form-label fw-semibold small">Giảm tối đa (nếu %)</label><input type="number" className="form-control" placeholder="0 = không giới hạn" value={form.giamToiDa} onChange={(e) => setForm({ ...form, giamToiDa: Number(e.target.value) })} /></div>
          <div className="col-md-4"><label className="form-label fw-semibold small">Số lượt tối đa</label><input type="number" className="form-control" placeholder="0 = không giới hạn" value={form.soLuongToiDa} onChange={(e) => setForm({ ...form, soLuongToiDa: Number(e.target.value) })} /></div>
          <div className="col-12">
            <label className="form-label fw-semibold small">Khóa học áp dụng (giữ Ctrl để chọn nhiều)</label>
            <select multiple size={5} className="form-select" value={chonKhoaHoc.map(String)} onChange={(e) => setChonKhoaHoc(Array.from(e.target.selectedOptions).map((o) => Number(o.value)))}>
              {khoaHocOptions.map((k) => <option key={k.maKhoaHoc} value={k.maKhoaHoc}>{k.tenKhoaHoc} (#{k.maKhoaHoc})</option>)}
            </select>
          </div>
          <div className="col-md-4 d-grid">
            <button className="btn btn-primary fw-semibold" onClick={() => void taoMoi()}>Tạo mã giảm giá</button>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>Code</th><th>Loại</th><th>Giảm</th><th>Đã dùng</th><th>Phạm vi</th></tr>
            </thead>
            <tbody>
              {danhSach.map((x) => (
                <tr key={x.maVoucher}>
                  <td className="fw-semibold">{x.code}</td>
                  <td>{x.loaiGiamGia}</td>
                  <td>{x.giaTriGiam}{x.loaiGiamGia === "PERCENT" ? "%" : ""}{x.giamToiDa ? ` (max ${x.giamToiDa})` : ""}</td>
                  <td>{x.soLuongDaDung}/{x.soLuongToiDa || "∞"}</td>
                  <td><span className="badge bg-light text-dark border">{x.phamViApDung}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
