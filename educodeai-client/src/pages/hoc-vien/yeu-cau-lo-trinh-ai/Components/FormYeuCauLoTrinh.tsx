import { useMemo, useState } from "react";
import type { DuLieuYeuCauLoTrinh } from "./types";
import "./YeuCauLoTrinhAI.css";

interface Props { onSubmit: (data: DuLieuYeuCauLoTrinh) => void; isSubmitting?: boolean; isAIAvailable?: boolean; }
const INITIAL_STATE: DuLieuYeuCauLoTrinh = { hoTen: "", trinhDo: "Người mới", phongCachHoc: "video", mucTieuNgheNghiep: "", thoiGianHoc: "3", mucDoCamKet: "10", kienThucHienCo: "", kinhNghiem: "", khoKhan: "" };
const GOI_Y_MUC_TIEU = [
  { key: "Data", label: "Data Engineer", icon: "fa-database" }, { key: "AI", label: "Prompt Engineer / AI Trainer", icon: "fa-wand-magic-sparkles" },
  { key: "Backend", label: "Backend Engineer", icon: "fa-server" }, { key: "Frontend", label: "Frontend Engineer", icon: "fa-code" },
  { key: "Fullstack", label: "Software Engineer (Fullstack)", icon: "fa-layer-group" }, { key: "Mobile", label: "Mobile Developer", icon: "fa-mobile-screen" },
  { key: "Cloud", label: "Cloud Engineer", icon: "fa-cloud" }, { key: "DevOps", label: "DevOps Engineer", icon: "fa-gears" },
  { key: "data_scientist", label: "Trở thành Data Scientist", icon: "fa-chart-line" }, { key: "ml_engineer", label: "Machine Learning Engineer", icon: "fa-brain" },
  { key: "ai_engineer", label: "AI Engineer ứng dụng", icon: "fa-robot" }, { key: "nlp", label: "NLP Specialist", icon: "fa-comments" },
  { key: "computer_vision", label: "Computer Vision Engineer", icon: "fa-eye" }, { key: "ai_pm", label: "AI Product Manager", icon: "fa-briefcase" },
  { key: "ai_ba", label: "AI Business Analyst", icon: "fa-chart-pie" }, { key: "bi_analyst", label: "Business Intelligence Analyst", icon: "fa-table" },
  { key: "ai_consultant", label: "Technical Consultant (AI/Data)", icon: "fa-user-tie" }, { key: "cybersecurity", label: "Cybersecurity Specialist", icon: "fa-shield-halved" },
];

export default function FormYeuCauLoTrinh({ onSubmit, isSubmitting = false, isAIAvailable = true }: Props) {
  const [formData, setFormData] = useState(INITIAL_STATE); const [errors, setErrors] = useState<Record<string, string>>({}); const [showMore, setShowMore] = useState(false); const [query, setQuery] = useState("");
  const update = (name: string, value: string) => { setFormData(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: "" })); };
  const extraRoles = useMemo(() => GOI_Y_MUC_TIEU.slice(8).filter(r => r.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const submit = (e: React.FormEvent) => { e.preventDefault(); const next: Record<string, string> = {}; if (!formData.hoTen.trim()) next.hoTen = "Vui lòng nhập họ và tên"; if (!formData.trinhDo) next.trinhDo = "Vui lòng chọn trình độ"; if (!formData.mucTieuNgheNghiep) next.mucTieuNgheNghiep = "Vui lòng chọn mục tiêu nghề nghiệp"; setErrors(next); if (!Object.keys(next).length) onSubmit(formData); };
  const field = (name: keyof DuLieuYeuCauLoTrinh, label: string, children: React.ReactNode, required = false) => <div className="roadmap-field"><label htmlFor={name} className="roadmap-label">{label}{required && <span aria-hidden="true"> *</span>}</label>{children}{errors[name] && <small className="roadmap-error" id={`${name}-error`}>{errors[name]}</small>}</div>;
  return <form onSubmit={submit} className="roadmap-form-card">
    <section><h2 className="roadmap-step-title"><i className="fas fa-user-circle" aria-hidden="true" /> Bước 1: Thông tin cá nhân</h2><div className="roadmap-grid roadmap-grid-2">
      {field("hoTen", "Họ và tên", <input id="hoTen" name="hoTen" value={formData.hoTen} onChange={e => update("hoTen", e.target.value)} maxLength={70} placeholder="Nhập họ và tên của bạn" aria-invalid={!!errors.hoTen} aria-describedby={errors.hoTen ? "hoTen-error" : undefined} />, true)}
      {field("trinhDo", "Trình độ hiện tại", <select id="trinhDo" name="trinhDo" value={formData.trinhDo} onChange={e => update("trinhDo", e.target.value)}><option value="Người mới">Người mới bắt đầu</option><option value="Trung cấp">Trung cấp</option><option value="Nâng cao">Nâng cao</option></select>, true)}
      {field("phongCachHoc", "Phong cách học ưa thích", <select id="phongCachHoc" name="phongCachHoc" value={formData.phongCachHoc} onChange={e => update("phongCachHoc", e.target.value)}><option value="video">Video và bài giảng</option><option value="reading">Đọc sách và tài liệu</option><option value="hands-on">Thực hành dự án</option><option value="mixed">Kết hợp nhiều cách</option></select>, true)}
    </div></section>
    <section><h2 className="roadmap-step-title"><i className="fas fa-bullseye" aria-hidden="true" /> Bước 2: Mục tiêu nghề nghiệp</h2>{field("mucTieuNgheNghiep", "Mục tiêu nghề nghiệp cụ thể", <fieldset className={`role-select ${errors.mucTieuNgheNghiep ? "has-error" : ""}`}><legend className="sr-only">Chọn mục tiêu nghề nghiệp</legend><div className="role-grid">{GOI_Y_MUC_TIEU.slice(0, 8).map(role => <RoleCard key={role.key} role={role} selected={formData.mucTieuNgheNghiep === role.key} onSelect={() => update("mucTieuNgheNghiep", role.key)} />)}</div><button type="button" className="role-more-button" onClick={() => setShowMore(v => !v)} aria-expanded={showMore}>{showMore ? "Thu gọn vai trò" : "Xem thêm / Tìm kiếm vai trò khác"}</button>{showMore && <div className="role-extra"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm vai trò..." aria-label="Tìm kiếm vai trò" /><div className="role-grid">{extraRoles.map(role => <RoleCard key={role.key} role={role} selected={formData.mucTieuNgheNghiep === role.key} onSelect={() => update("mucTieuNgheNghiep", role.key)} />)}</div></div>}</fieldset>, true)}<p className="roadmap-helper">Chọn mục tiêu gần nhất với định hướng của bạn.</p><div className="roadmap-grid roadmap-grid-2">
      {field("thoiGianHoc", "Thời gian học dự kiến", <select id="thoiGianHoc" name="thoiGianHoc" value={formData.thoiGianHoc} onChange={e => update("thoiGianHoc", e.target.value)}><option value="3">3 tháng</option><option value="6">6 tháng</option><option value="9">9 tháng</option><option value="12">1 năm</option></select>)}
      {field("mucDoCamKet", "Mức độ cam kết", <select id="mucDoCamKet" name="mucDoCamKet" value={formData.mucDoCamKet} onChange={e => update("mucDoCamKet", e.target.value)}><option value="10">Part-time (5-10h/tuần)</option><option value="30">Full-time (20-40h/tuần)</option><option value="50">Intensive (40h+/tuần)</option></select>)}
    </div></section>
    <section><h2 className="roadmap-step-title"><i className="fas fa-brain" aria-hidden="true" /> Bước 3: Kiến thức và kinh nghiệm</h2><div className="roadmap-text-fields">
      {field("kienThucHienCo", "Kiến thức hiện có", <textarea id="kienThucHienCo" name="kienThucHienCo" value={formData.kienThucHienCo} onChange={e => update("kienThucHienCo", e.target.value)} maxLength={100} placeholder="Ví dụ: Python, SQL, Machine Learning cơ bản, Excel..." />)}
      {field("kinhNghiem", "Kinh nghiệm thực tế", <textarea id="kinhNghiem" name="kinhNghiem" value={formData.kinhNghiem} onChange={e => update("kinhNghiem", e.target.value)} maxLength={100} placeholder="Ví dụ: Dự án cá nhân, công việc trước đây..." />)}
      {field("khoKhan", "Khó khăn hiện tại", <textarea id="khoKhan" name="khoKhan" value={formData.khoKhan} onChange={e => update("khoKhan", e.target.value)} maxLength={100} placeholder="Ví dụ: Thiếu kiến thức nền, khó tập trung..." />)}
    </div></section>
    <button type="submit" className="roadmap-submit" disabled={isSubmitting || !isAIAvailable}>{isSubmitting ? <><span className="spinner-border spinner-border-sm" /> Đang phân tích...</> : !isAIAvailable ? <><i className="fas fa-lock" /> AI đang bận...</> : <><i className="fas fa-magic" /> Khởi tạo lộ trình AI</>}</button>
  </form>;
}
function RoleCard({ role, selected, onSelect }: { role: typeof GOI_Y_MUC_TIEU[number]; selected: boolean; onSelect: () => void }) { return <button type="button" role="radio" aria-checked={selected} className={`role-card ${selected ? "selected" : ""}`} onClick={onSelect}><i className={`fas ${role.icon}`} aria-hidden="true" /><span>{role.label}</span></button>; }
