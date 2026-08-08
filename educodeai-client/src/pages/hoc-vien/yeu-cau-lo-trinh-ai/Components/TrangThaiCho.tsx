import "./YeuCauLoTrinhAI.css";

const steps = ["Đánh giá năng lực hiện tại", "Xác định khoảng cách kỹ năng", "Tối ưu hóa lộ trình", "Phân bổ thời gian học"];
const benefits = ["Tiết kiệm thời gian tìm kiếm khóa học", "Lộ trình cá nhân hóa theo nhu cầu", "Học đúng thứ tự từ cơ bản đến nâng cao", "Cập nhật theo tiến độ và phản hồi"];
const features = ["Khuyến nghị khóa học", "Dự án thực hành", "Mốc thời gian cụ thể", "Theo dõi tiến độ"];

export default function TrangThaiCho() {
  return <div className="roadmap-sidebar-card">
    <div className="ai-hero"><div className="ai-robot-badge"><i className="fas fa-robot" aria-hidden="true" /></div><h2 className="ai-color mb-2">AI sẽ làm gì?</h2><p className="text-muted mb-0">Hệ thống AI sẽ phân tích thông tin để tạo lộ trình học tập tối ưu cho bạn.</p></div>
    <section className="ai-subcard"><h3><i className="fas fa-chart-line me-2" aria-hidden="true" />Quy trình phân tích</h3><ol className="mb-0">{steps.map((step, index) => <li key={step}><strong>{index + 1}. {step}:</strong> AI đối chiếu dữ liệu để đề xuất hướng học phù hợp.</li>)}</ol></section>
    <section className="ai-subcard"><h3><i className="fas fa-star me-2" aria-hidden="true" />Lợi ích của AI Roadmap</h3><ul>{benefits.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section className="ai-subcard"><h3><i className="fas fa-lightbulb me-2" aria-hidden="true" />Tính năng nổi bật</h3><div className="ai-feature-grid">{features.map(item => <div className="ai-feature-tag" key={item}><i className="fas fa-check-circle" aria-hidden="true" />{item}</div>)}</div></section>
    <div className="ai-note"><i className="fas fa-info-circle me-2" aria-hidden="true" /><strong>Lưu ý:</strong> Bạn có thể điều chỉnh lộ trình theo nhu cầu cá nhân sau khi nhận kết quả.</div>
  </div>;
}
