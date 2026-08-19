import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MaGiamGiaService, type KhoaHocApDungOptionDTO, type MaGiamGiaItemDTO } from "@/services/ma-giam-gia.service";
import "./QuanLyMaGiamGiaGiangVien.css";

export default function QuanLyMaGiamGiaGiangVien() {
  const [danhSach, setDanhSach] = useState<MaGiamGiaItemDTO[]>([]);
  const [khoaHocOptions, setKhoaHocOptions] = useState<KhoaHocApDungOptionDTO[]>([]);
  const [chonKhoaHoc, setChonKhoaHoc] = useState<number[]>([]);
  const [apDungTatCa, setApDungTatCa] = useState(false);
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
      MaGiamGiaService.layDanhSachGiangVien(),
      MaGiamGiaService.layKhoaHocGiangVien()
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
    setForm((prev) => ({ ...prev, code: `TEACH-${randomPart}` }));
  };

  const taoMoi = async () => {
    try {
      if (!form.code || !form.tenChuongTrinh) {
        await Swal.fire("Thiếu dữ liệu", "Vui lòng nhập code và tên chương trình.", "warning");
        return;
      }
      if (!apDungTatCa && chonKhoaHoc.length === 0) {
        await Swal.fire("Thiếu khóa học", "Vui lòng chọn ít nhất 1 khóa hoặc bật áp dụng tất cả khóa của bạn.", "warning");
        return;
      }
      await MaGiamGiaService.taoChoGiangVien({
        ...form,
        batDauAt: new Date().toISOString(),
        ketThucAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        apDungTatCaKhoaHocCuaGiangVien: apDungTatCa,
        danhSachMaKhoaHoc: apDungTatCa ? [] : chonKhoaHoc,
        giamToiDa: form.loaiGiamGia === "PERCENT" ? form.giamToiDa : undefined
      });
      await Swal.fire("Thành công", "Đã tạo mã giảm giá.", "success");
      setForm({ code: "", tenChuongTrinh: "", loaiGiamGia: "PERCENT", giaTriGiam: 10, giamToiDa: 0, soLuongToiDa: 0 });
      setChonKhoaHoc([]);
      setApDungTatCa(false);
      await load();
    } catch (error: any) {
      await Swal.fire("Lỗi", error?.response?.data?.thongBao || "Không thể tạo mã giảm giá.", "error");
    }
  };

  return (
    <div className="gv-page mgg-page">
      <header className="mgg-header">
        <div>
          <h2 className="mgg-title">Mã giảm giá (Giảng viên)</h2>
          <p className="mgg-subtitle">Bạn có thể chọn 1 hoặc nhiều khóa học bằng Ctrl + click.</p>
        </div>
        <span className="mgg-count">Tổng mã: {danhSach.length}</span>
      </header>

      <section className="mgg-card" aria-label="Tạo mã giảm giá">
        <div className="mgg-form-grid">
          <div className="mgg-field">
            <label className="mgg-label" htmlFor="mgg-code">Mã code</label>
            <div className="mgg-code-row">
              <input
                id="mgg-code"
                className="mgg-input"
                placeholder="VD: FLASH20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              <button type="button" className="mgg-btn-gen" onClick={sinhMaTuDong}>
                Sinh mã
              </button>
            </div>
          </div>

          <div className="mgg-field">
            <label className="mgg-label" htmlFor="mgg-ten">Tên chương trình</label>
            <input
              id="mgg-ten"
              className="mgg-input"
              placeholder="Tên chiến dịch giảm giá"
              value={form.tenChuongTrinh}
              onChange={(e) => setForm({ ...form, tenChuongTrinh: e.target.value })}
            />
          </div>

          <div className="mgg-field">
            <label className="mgg-label" htmlFor="mgg-loai">Loại giảm giá</label>
            <select
              id="mgg-loai"
              className="mgg-input"
              value={form.loaiGiamGia}
              onChange={(e) => setForm({ ...form, loaiGiamGia: e.target.value as "PERCENT" | "FIXED" })}
            >
              <option value="PERCENT">Phần trăm</option>
              <option value="FIXED">Số tiền</option>
            </select>
          </div>

          <div className="mgg-field">
            <label className="mgg-label" htmlFor="mgg-giatri">Giá trị giảm</label>
            <input
              id="mgg-giatri"
              type="number"
              className="mgg-input"
              placeholder="Ví dụ: 10 hoặc 50000"
              value={form.giaTriGiam}
              onChange={(e) => setForm({ ...form, giaTriGiam: Number(e.target.value) })}
            />
          </div>

          <div className="mgg-field">
            <label className="mgg-label" htmlFor="mgg-toida">Giảm tối đa (nếu %)</label>
            <input
              id="mgg-toida"
              type="number"
              className="mgg-input"
              placeholder="0 = không giới hạn"
              value={form.giamToiDa}
              onChange={(e) => setForm({ ...form, giamToiDa: Number(e.target.value) })}
            />
          </div>

          <div className="mgg-field">
            <label className="mgg-label" htmlFor="mgg-soluot">Số lượt tối đa</label>
            <input
              id="mgg-soluot"
              type="number"
              className="mgg-input"
              placeholder="0 = không giới hạn"
              value={form.soLuongToiDa}
              onChange={(e) => setForm({ ...form, soLuongToiDa: Number(e.target.value) })}
            />
          </div>

          <div className="mgg-field mgg-field--full">
            <label className="mgg-check">
              <input
                type="checkbox"
                checked={apDungTatCa}
                onChange={(e) => setApDungTatCa(e.target.checked)}
              />
              Áp dụng tất cả khóa học của tôi
            </label>
          </div>

          {!apDungTatCa && (
            <div className="mgg-field mgg-field--full">
              <label className="mgg-label" htmlFor="mgg-khoahoc">
                Khóa học áp dụng (giữ Ctrl để chọn nhiều)
              </label>
              <select
                id="mgg-khoahoc"
                multiple
                size={5}
                className="mgg-input mgg-courses"
                value={chonKhoaHoc.map(String)}
                onChange={(e) => setChonKhoaHoc(Array.from(e.target.selectedOptions).map((o) => Number(o.value)))}
              >
                {khoaHocOptions.map((k) => (
                  <option key={k.maKhoaHoc} value={k.maKhoaHoc}>
                    {k.tenKhoaHoc} (#{k.maKhoaHoc})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mgg-field mgg-field--full mgg-actions">
            <button type="button" className="mgg-btn-primary" onClick={() => void taoMoi()}>
              Tạo mã giảm giá
            </button>
          </div>
        </div>
      </section>

      <section className="mgg-card" aria-label="Danh sách mã giảm giá">
        <div className="mgg-table-wrap">
          <table className="mgg-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Loại</th>
                <th>Giảm</th>
                <th>Đã dùng</th>
                <th>Phạm vi</th>
              </tr>
            </thead>
            <tbody>
              {danhSach.map((x) => (
                <tr key={x.maVoucher}>
                  <td className="mgg-code-cell">{x.code}</td>
                  <td>{x.loaiGiamGia}</td>
                  <td>
                    {x.giaTriGiam}
                    {x.loaiGiamGia === "PERCENT" ? "%" : ""}
                    {x.giamToiDa ? ` (max ${x.giamToiDa})` : ""}
                  </td>
                  <td>
                    {x.soLuongDaDung}/{x.soLuongToiDa || "∞"}
                  </td>
                  <td>
                    <span className="mgg-scope">{x.phamViApDung}</span>
                  </td>
                </tr>
              ))}
              {danhSach.length === 0 && (
                <tr>
                  <td colSpan={5} className="mgg-empty">
                    Chưa có mã giảm giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
