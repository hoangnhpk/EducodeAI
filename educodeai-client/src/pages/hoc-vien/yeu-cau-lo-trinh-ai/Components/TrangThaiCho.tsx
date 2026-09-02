export default function TrangThaiCho() {
  return (
    <div id="state1" className="ai-state bg-light shadow-sm rounded p-4 p-md-3">
      <div className="text-center mb-4">
        <div className="ai-icon">
          <i className="fas fa-robot" style={{ fontSize: "3rem" }}></i>
        </div>
        <h4 className="ai-color mb-3">AI sẽ làm gì?</h4>
        <p className="text-muted">
          Hệ thống AI thông minh sẽ phân tích thông tin của bạn để tạo lộ trình
          học tập tối ưu nhất
        </p>
      </div>

      <div className="mb-4">
        <h6 className="ai-color mb-3">
          <i className="fas fa-chart-line me-2"></i>Quy trình phân tích AI
        </h6>
        <ul className="mb-3">
          <li>
            <strong>Đánh giá năng lực hiện tại:</strong> Phân tích kỹ năng, kiến
            thức và kinh nghiệm bạn đã có
          </li>
          <li>
            <strong>Xác định khoảng cách:</strong> So sánh giữa trình độ hiện tại
            và mục tiêu nghề nghiệp
          </li>
          <li>
            <strong>Tối ưu hóa lộ trình:</strong> Đề xuất các khóa học và dự án phù
            phù hợp với mục tiêu và trình độ của bạn
          </li>
          <li>
            <strong>Phân bổ thời gian:</strong> Lập kế hoạch học tập chi tiết theo
            từng tháng dựa trên thời gian bạn có
          </li>
        </ul>
      </div>

      <div className="mb-4">
        <h6 className="ai-color mb-3">
          <i className="fas fa-star me-2"></i>Lợi ích của AI Roadmap
        </h6>
        <ul className="mb-3">
          <li>Tiết kiệm thời gian tìm kiếm khóa học phù hợp</li>
          <li>Lộ trình được cá nhân hóa 100% theo nhu cầu của bạn</li>
          <li>Đảm bảo học đúng thứ tự, từ cơ bản đến nâng cao</li>
          <li>Cập nhật liên tục theo tiến độ và phản hồi của bạn</li>
        </ul>
      </div>

      <div className="mb-3">
        <h6 className="ai-color mb-3">
          <i className="fas fa-lightbulb me-2"></i>Tính năng nổi bật
        </h6>
        <div className="row g-2">
          <div className="col-6">
            <div className="p-2 bg-white rounded border">
              <small>
                <i className="fas fa-check-circle text-success me-1"></i>Khuyến
                nghị khóa học
              </small>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2 bg-white rounded border">
              <small>
                <i className="fas fa-check-circle text-success me-1"></i>Dự án
                thực hành
              </small>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2 bg-white rounded border">
              <small>
                <i className="fas fa-check-circle text-success me-1"></i>Mốc thời
                gian cụ thể
              </small>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2 bg-white rounded border">
              <small>
                <i className="fas fa-check-circle text-success me-1"></i>Theo dõi
                tiến độ
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-light border mt-4">
        <small className="text-muted">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Lưu ý:</strong> Lộ trình được tạo dựa trên dữ liệu từ hàng nghìn
          học viên thành công. Bạn có thể điều chỉnh theo nhu cầu cá nhân sau
          khi nhận kết quả.
        </small>
      </div>
    </div>
  );
}
