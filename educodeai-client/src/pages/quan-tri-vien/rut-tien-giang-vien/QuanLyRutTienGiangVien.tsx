import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RutTienGiangVienService } from "@/services/rut-tien-giang-vien.service";
import type { YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";

export default function QuanLyRutTienGiangVien() {
  const [dangTai, setDangTai] = useState<boolean>(true);
  const [trangThaiLoc, setTrangThaiLoc] = useState<string>("");
  const [danhSach, setDanhSach] = useState<YeuCauRutTienChiTietDTO[]>([]);

  const taiDanhSach = async (trangThai?: string) => {
    try {
      setDangTai(true);
      const duLieu = await RutTienGiangVienService.layDanhSachAdmin(trangThai || undefined);
      setDanhSach(duLieu);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không tải được danh sách rút tiền.", "error");
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const duyetYeuCau = async (maYeuCauRutTien: number) => {
    try {
      await RutTienGiangVienService.duyetYeuCau(maYeuCauRutTien);
      Swal.fire("Thành công", "Đã duyệt yêu cầu và tạo QR chuyển khoản.", "success");
      await taiDanhSach(trangThaiLoc);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không thể duyệt yêu cầu.", "error");
    }
  };

  const tuChoiYeuCau = async (maYeuCauRutTien: number) => {
    const ketQua = await Swal.fire({
      title: "Từ chối yêu cầu",
      input: "text",
      inputLabel: "Lý do từ chối",
      inputPlaceholder: "Nhập lý do",
      showCancelButton: true,
      confirmButtonText: "Xác nhận từ chối",
      cancelButtonText: "Hủy"
    });

    if (!ketQua.isConfirmed || !ketQua.value) {
      return;
    }

    try {
      await RutTienGiangVienService.tuChoiYeuCau(maYeuCauRutTien, ketQua.value);
      Swal.fire("Thành công", "Đã từ chối yêu cầu rút tiền.", "success");
      await taiDanhSach(trangThaiLoc);
    } catch (error: any) {
      Swal.fire("Lỗi", error?.response?.data?.thongBao ?? "Không thể từ chối yêu cầu.", "error");
    }
  };

  return (
    <div>
      <h2>Quản lý rút tiền giảng viên</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <select value={trangThaiLoc} onChange={(e) => setTrangThaiLoc(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="CHO_DUYET">CHO_DUYET</option>
          <option value="CHO_CHUYEN_KHOAN">CHO_CHUYEN_KHOAN</option>
          <option value="DA_CHUYEN_KHOAN">DA_CHUYEN_KHOAN</option>
          <option value="TU_CHOI">TU_CHOI</option>
        </select>
        <button className="btn btn-primary" onClick={() => taiDanhSach(trangThaiLoc)}>Lọc</button>
      </div>

      {dangTai ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Mã YC</th>
              <th>Giảng viên</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Nội dung CK</th>
              <th>QR</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((item) => (
              <tr key={item.maYeuCauRutTien}>
                <td>{item.maYeuCauRutTien}</td>
                <td>{item.tenGiangVien}</td>
                <td>{item.soTienYeuCau.toLocaleString("vi-VN")} VND</td>
                <td>{item.trangThaiYeuCau}</td>
                <td>{item.noiDungChuyenKhoan ?? "-"}</td>
                <td>
                  {item.duongDanAnhQr ? (
                    <a href={item.duongDanAnhQr} target="_blank" rel="noreferrer">Mở QR</a>
                  ) : "-"}
                </td>
                <td>
                  {item.trangThaiYeuCau === "CHO_DUYET" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-success" onClick={() => duyetYeuCau(item.maYeuCauRutTien)}>Duyệt</button>
                      <button className="btn btn-danger" onClick={() => tuChoiYeuCau(item.maYeuCauRutTien)}>Từ chối</button>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
