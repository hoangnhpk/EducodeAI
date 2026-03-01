import { useState } from "react";
import type { DuLieuYeuCauLoTrinh } from "./types";
import "./YeuCauLoTrinhAI.css";

interface Props {
  onSubmit: (data: DuLieuYeuCauLoTrinh) => void;
  isSubmitting?: boolean; // Thêm prop này để disable nút khi đang gửi
}

// Gom state ban đầu cho gọn
const INITIAL_STATE: DuLieuYeuCauLoTrinh = {
  hoTen: "",
  trinhDo: "Người mới",
  phongCachHoc: "video",
  mucTieuNgheNghiep: "",
  thoiGianHoc: "3",
  mucDoCamKet: "10",
  kienThucHienCo: "",
  kinhNghiem: "",
  khoKhan: "",
};

const GOI_Y_MUC_TIEU = [
  // có dữ liệu
  { key: "Data", label: "Data Engineer" },
  { key: "AI", label: "Prompt Engineer / AI Trainer" },
  { key: "Backend", label: "Backend Engineer" },
  { key: "Frontend", label: "Frontend Engineer" },
  { key: "Fullstack", label: "Software Engineer (Fullstack)" },
  { key: "Mobile", label: "Mobile Developer" },
  { key: "Cloud", label: "Cloud Engineer" },
  { key: "DevOps", label: "DevOps Engineer" },

  // Data & AI
  { key: "data_scientist", label: "Trở thành Data Scientist" },
  { key: "ml_engineer", label: "Machine Learning Engineer" },
  { key: "ai_engineer", label: "AI Engineer ứng dụng" },
  { key: "nlp", label: "NLP Specialist" },
  { key: "computer_vision", label: "Computer Vision Engineer" },

  // Product & Business
  { key: "ai_pm", label: "AI Product Manager" },
  { key: "ai_ba", label: "AI Business Analyst" },
  { key: "bi_analyst", label: "Business Intelligence Analyst" },
  { key: "ai_consultant", label: "Technical Consultant (AI/Data)" },

  // Infra
  { key: "cybersecurity", label: "Cybersecurity Specialist" },
];


export default function FormYeuCauLoTrinh({ onSubmit, isSubmitting = false }: Props) {
  // 1. Dùng 1 state object thay vì 10 cái useState lẻ
  const [formData, setFormData] = useState(INITIAL_STATE);

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

  const handleChonMucTieu = (value: string) => {
    setFormData((prev) => ({ ...prev, mucTieuNgheNghiep: value }));
    if (errors.mucTieuNgheNghiep) {
      setErrors((prev) => ({ ...prev, mucTieuNgheNghiep: "" }));
    }
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

    onSubmit(formData);
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
              onChange={handleChange} maxLength={70}
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
          <label className="required-field mb-2 d-block">Mục tiêu nghề nghiệp cụ thể</label>
          <div
            className={`p-3 border rounded ${errors.mucTieuNgheNghiep ? "border-danger" : "border-secondary"
              }`}
          >
            <div className="row g-2">
              {GOI_Y_MUC_TIEU.map(({ key, label }) => (
                <div className="col-md-6" key={key}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="mucTieuNgheNghiep"
                      id={`muc-tieu-${key}`}
                      checked={formData.mucTieuNgheNghiep === key}
                      onChange={() => handleChonMucTieu(key)}
                    />
                    <label className="form-check-label" htmlFor={`muc-tieu-${key}`}>
                      {label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {errors.mucTieuNgheNghiep && (
            <div className="invalid-feedback d-block">{errors.mucTieuNgheNghiep}</div>
          )}
          <small className="form-text text-muted">
            Chọn mục tiêu gần nhất với định hướng của bạn.
          </small>
        </div>
        <div className="col-md-6">
          <div className="form-floating">
            <select
              name="thoiGianHoc"
              className="form-select"
              value={formData.thoiGianHoc}
              onChange={handleChange}
            >
              <option value="3">3 tháng</option>
              <option value="6">6 tháng</option>
              <option value="9">9 tháng</option>
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
          maxLength={100}
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
          maxLength={100}
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
          maxLength={100}
        />
        <label>Khó khăn hiện tại</label>
        <small className="form-text text-muted">Ví dụ: Thiếu kiến thức nền, khó tập
          trung...</small>
      </div>

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
