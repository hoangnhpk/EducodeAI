import { useState } from "react";
import Swal from "sweetalert2";
import { ThanhToanKhoaHocService } from "@/services/thanh-toan-khoa-hoc.service";

const NhapMaQuaTang = () => {
  const [code, setCode] = useState("");
  const [dangXuLy, setDangXuLy] = useState(false);

  const handleSubmit = async () => {
    const ma = code.trim().toUpperCase();
    if (!ma) {
      await Swal.fire("Thiếu dữ liệu", "Vui lòng nhập mã quà tặng.", "warning");
      return;
    }

    try {
      setDangXuLy(true);
      const ketQua = await ThanhToanKhoaHocService.nhapMaQuaTang(ma);
      await Swal.fire("Thành công", ketQua.thongBao, "success");
      setCode("");
    } catch (error: any) {
      const thongBao = error?.response?.data?.thongBao || "Không thể nhập mã quà tặng lúc này.";
      await Swal.fire("Lỗi", thongBao, "error");
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-3">Nhập mã quà tặng khóa học</h4>
              <p className="text-muted mb-3">
                Nhập mã do người tặng gửi để mở khóa học vào tài khoản của bạn.
              </p>
              <input
                className="form-control form-control-lg mb-3"
                placeholder="Ví dụ: EDG-ABCD-EFGH-JKLM"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button className="btn btn-primary w-100" onClick={() => void handleSubmit()} disabled={dangXuLy}>
                {dangXuLy ? "Đang xử lý..." : "Nhập mã quà tặng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhapMaQuaTang;
