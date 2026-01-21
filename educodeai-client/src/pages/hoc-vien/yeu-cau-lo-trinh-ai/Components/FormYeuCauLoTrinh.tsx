import { useState } from "react";
import type { DuLieuYeuCauLoTrinh, TrinhDo } from "./types";
import "./YeuCauLoTrinhAI.css";

interface Props {
  onSubmit: (data: DuLieuYeuCauLoTrinh) => void;
  isSubmitting?: boolean; // Thêm prop này để disable nút khi đang gửi
}

// Gom state ban đầu cho gọn
const INITIAL_STATE = {
  hoTen: "",
  trinhDo: "" as TrinhDo,
  phongCachHoc: "",
  mucTieuNgheNghiep: "",
  thoiGianHoc: "",
  mucDoCamKet: "",
  kienThucHienCo: "",
  kinhNghiem: "",
  khoKhan: "",
};

export default function FormYeuCauLoTrinh({ onSubmit, isSubmitting = false }: Props) {
  // 1. Dùng 1 state object thay vì 10 cái useState lẻ
  const [formData, setFormData] = useState(INITIAL_STATE);

  // State riêng cho mảng checkbox và field "Khác"
  const [cacMangTapTrung, setCacMangTapTrung] = useState<string[]>([]);
  const [isKhac, setIsKhac] = useState(false);
  const [mangKhac, setMangKhac] = useState("");

  // State validate (đơn giản hoá)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hàm handle change chung cho tất cả input/select/textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleMang = (value: string) => {
    setCacMangTapTrung((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.trinhDo) newErrors.trinhDo = "Vui lòng chọn trình độ";
    if (!formData.mucTieuNgheNghiep.trim()) newErrors.mucTieuNgheNghiep = "Mục tiêu là bắt buộc";
    // ... thêm các validate khác nếu cần

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const xuLySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const danhSachMang = isKhac && mangKhac.trim()
      ? [...cacMangTapTrung, mangKhac.trim()]
      : cacMangTapTrung;

    onSubmit({
      ...formData,
      cacMangTapTrung: danhSachMang,
    });
  };

  return (
    <form onSubmit={xuLySubmit} className="bg-light rounded p-4 p-md-5 h-100 shadow-sm">
      {/* BƯỚC 1 */}
      <h4 className="mb-4 ai-color fw-bold"><i className="fas fa-user-circle me-2"></i>Bước 1: Thông tin cá nhân</h4>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-floating">
            <input
              name="hoTen"
              className={`form-control ${errors.hoTen ? "is-invalid" : ""}`}
              placeholder="Họ và tên"
              value={formData.hoTen}
              onChange={handleChange}
            />
            <label className="required-field">Họ và tên</label>
            <div className="invalid-feedback">{errors.hoTen}</div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <select
              name="trinhDo"
              className={`form-select ${errors.trinhDo ? "is-invalid" : ""}`}
              value={formData.trinhDo}
              onChange={handleChange}
            >
              <option value="">Chọn trình độ hiện tại</option>
              <option value="Người mới">Người mới bắt đầu</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Nâng cao">Nâng cao</option>
            </select>
            <label className="required-field">Trình độ hiện tại</label>
            <div className="invalid-feedback">{errors.trinhDo}</div>
          </div>
        </div>

        <div className="col-12">
          <div className="form-floating">
            <select
              name="phongCachHoc"
              className="form-select"
              value={formData.phongCachHoc}
              onChange={handleChange}
            >
              <option value="">Chọn phong cách học</option>
              <option value="video">Video và bài giảng</option>
              <option value="reading">Đọc sách và tài liệu</option>
              <option value="hands-on">Thực hành dự án</option>
              <option value="mixed">Kết hợp nhiều cách</option>
            </select>
            <label className="required-field">Phong cách học ưa thích</label>
          </div>
        </div>
      </div>

      {/* BƯỚC 2 */}
      <h4 className="mt-5 mb-4 ai-color fw-bold"><i className="fas fa-bullseye me-2"></i>Bước 2: Mục tiêu nghề nghiệp</h4>

      <div className="row g-3">
        <div className="col-12">
          <div className="form-floating">
            <input
              name="mucTieuNgheNghiep"
              type="text"
              className={`form-control ${errors.mucTieuNgheNghiep ? "is-invalid" : ""}`}
              placeholder="Ví dụ: Trở thành Data Scientist"
              value={formData.mucTieuNgheNghiep}
              onChange={handleChange}
            />
            <label className="required-field">Mục tiêu nghề nghiệp cụ thể</label>
            <div className="invalid-feedback">{errors.mucTieuNgheNghiep}</div>
            <small className="form-text text-muted">Hãy mô tả rõ ràng vai trò bạn muốn đạt
                                            được.</small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-floating">
            <select
              name="thoiGianHoc"
              className="form-select"
              value={formData.thoiGianHoc}
              onChange={handleChange}
            >
              <option value="">Chọn thời gian học</option>
              <option value="1">1 tháng</option>
              <option value="3">3 tháng</option>
              <option value="6">6 tháng</option>
              <option value="12">1 năm</option>
            </select>
            <label className="required-field">Thời gian học dự kiến</label>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-floating">
            <select
              name="mucDoCamKet"
              className="form-select"
              value={formData.mucDoCamKet}
              onChange={handleChange}
            >
              <option value="">Mức độ cam kết</option>
              <option value="10">Part-time (5-10h/tuần)</option>
              <option value="30">Full-time (20-40h/tuần)</option>
              <option value="50">Intensive (40h+/tuần)</option>
            </select>
            <label className="required-field">Cam kết thời gian</label>
          </div>
        </div>
      </div>

      {/* BƯỚC 3 */}
      <h4 className="mt-5 mb-4 ai-color fw-bold"><i className="fas fa-brain me-2"></i>Bước 3: Kiến thức & Kinh nghiệm</h4>

      <div className="form-floating mb-3">
        <textarea
          name="kienThucHienCo"
          className="form-control textarea-height"
          value={formData.kienThucHienCo}
          onChange={handleChange}
        />
        <label>Kiến thức hiện có</label>
        <small className="form-text text-muted">Ví dụ: Python, SQL, Machine Learning cơ bản,
                                            Excel...</small>
      </div>

      <div className="form-floating mb-3">
        <textarea
          name="kinhNghiem"
          className="form-control textarea-height"
          value={formData.kinhNghiem}
          onChange={handleChange}
        />
        <label>Kinh nghiệm thực tế</label>
        <small className="form-text text-muted">Ví dụ: Dự án cá nhân, công việc trước
                                            đây...</small>
      </div>

      <div className="form-floating mb-3">
        <textarea
          name="khoKhan"
          className="form-control textarea-height-100"
          value={formData.khoKhan}
          onChange={handleChange}
        />
        <label>Khó khăn hiện tại</label>
        <small className="form-text text-muted">Ví dụ: Thiếu kiến thức nền, khó tập
                                            trung...</small>
      </div>

      <label className="mb-2 fw-bold">Bạn muốn AI tập trung mạnh vào mảng nào?</label>
      <div className="row g-2 mb-3">
        {["Frontend", "DevOps", "Backend", "Database", "Clean Code", "System Design", "AI"].map((mang) => (
          <div className="col-md-6" key={mang}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={cacMangTapTrung.includes(mang)}
                onChange={() => toggleMang(mang)}
              />
              <label className="form-check-label">{mang}</label>
            </div>
          </div>
        ))}
        <div className="col-md-6">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isKhac}
              onChange={(e) => setIsKhac(e.target.checked)}
            />
            <label className="form-check-label">Khác</label>
          </div>
        </div>
      </div>

      {isKhac && (
        <input
          className="form-control mb-3"
          placeholder="Nhập lĩnh vực khác..."
          value={mangKhac}
          onChange={(e) => setMangKhac(e.target.value)}
        />
      )}

      <button
        type="submit"
        className="btn btn-primary w-100 py-3 fw-bold text-uppercase shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span><span className="spinner-border spinner-border-sm me-2" />Đang phân tích...</span>
        ) : (
          <span><i className="fas fa-magic me-2"></i>Khởi tạo lộ trình AI</span>
        )}
      </button>
    </form>
  );
}