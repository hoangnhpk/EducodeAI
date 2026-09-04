export default function TrangThaiDangPhanTich() {
  return (
    <section className="ai-analysis-panel" role="status" aria-live="polite" aria-label="AI đang phân tích lộ trình">
      <div className="ai-analysis-icon" aria-hidden="true">
        <i className="fas fa-wand-magic-sparkles"></i>
      </div>
      <div className="ai-analysis-copy">
        <span className="ai-analysis-kicker">AI ROADMAP</span>
        <h4>AI đang phân tích lộ trình của bạn</h4>
        <p>Hệ thống đang đối chiếu mục tiêu, trình độ và thời gian học để xây dựng lộ trình phù hợp.</p>
      </div>

      <div className="ai-analysis-progress" aria-hidden="true">
        <span></span>
      </div>

      <div className="ai-analysis-steps" aria-hidden="true">
        <div className="ai-analysis-step is-active">
          <i className="fas fa-circle-notch"></i>
          <span>Đánh giá thông tin đầu vào</span>
        </div>
        <div className="ai-analysis-step">
          <i className="fas fa-circle"></i>
          <span>Đối chiếu khóa học phù hợp</span>
        </div>
        <div className="ai-analysis-step">
          <i className="fas fa-circle"></i>
          <span>Sắp xếp lộ trình học tập</span>
        </div>
      </div>

      <span className="visually-hidden">Vui lòng chờ trong khi AI hoàn thành phân tích.</span>
    </section>
  );
}
