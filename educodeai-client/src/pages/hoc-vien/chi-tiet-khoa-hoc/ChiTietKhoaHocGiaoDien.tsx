import { useState } from 'react';
import './ChiTietKhoaHocGiaoDien.css';

const ChiTietKhoaHocGiaoDien = () => {
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);

  const toggleSection = (id: number) => {
    if (expandedSections.includes(id)) {
      setExpandedSections(expandedSections.filter(s => s !== id));
    } else {
      setExpandedSections([...expandedSections, id]);
    }
  };

  const expandAll = () => {
    setExpandedSections([1, 2, 3]);
  };

  return (
    <div className="chi-tiet-giao-dien-container">
      {/* HEADER BANNER */}
      <div className="ctgd-header-banner">
        <div className="ctgd-header-inner">
          <div className="ctgd-header-content">
            <div className="ctgd-badges">
              <span className="ctgd-badge ctgd-badge-popular">Phổ biến nhất</span>
              <span className="ctgd-badge ctgd-badge-category">Phát triển Web</span>
            </div>
            
            <h1 className="ctgd-title">Lập trình Python từ cơ bản đến nâng cao</h1>
            <p className="ctgd-subtitle">
              Làm chủ ngôn ngữ lập trình mạnh mẽ nhất hiện nay thông qua các dự án thực tế về Khoa học dữ liệu, AI và Phát triển Web cùng các chuyên gia hàng đầu.
            </p>

            <div className="ctgd-stats">
              <div className="ctgd-rating">
                <span className="ctgd-rating-score">4.8</span>
                <span className="ctgd-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                </span>
                <span className="ctgd-rating-count">(12,450 đánh giá)</span>
              </div>
              <div className="ctgd-students">
                <i className="fas fa-user-friends"></i>
                <span>85,200 học viên đã tham gia</span>
              </div>
            </div>

            <div className="ctgd-instructor-top">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Instructor" 
                className="ctgd-instructor-avatar"
              />
              <div className="ctgd-instructor-info-top">
                <span className="ctgd-instructor-label">Giảng viên bởi</span>
                <span className="ctgd-instructor-name-top">Dr. Nguyễn Minh Quân</span>
              </div>
            </div>
          </div>
          {/* Empty spacer for the right side where sidebar will overlap */}
          <div style={{ width: '360px', flexShrink: 0 }} className="d-none d-lg-block"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ctgd-main">
        <div className="ctgd-content">
          
          {/* WHAT YOU'LL LEARN */}
          <section className="ctgd-section-learn">
            <h2 className="ctgd-section-title">Bạn sẽ học được gì?</h2>
            <div className="ctgd-learn-list">
              <div className="ctgd-learn-item">
                <i className="fas fa-check-circle ctgd-learn-icon"></i>
                <span>Làm chủ cú pháp Python từ Zero đến Hero</span>
              </div>
              <div className="ctgd-learn-item">
                <i className="fas fa-check-circle ctgd-learn-icon"></i>
                <span>Tự tay xây dựng 5 dự án thực tế</span>
              </div>
              <div className="ctgd-learn-item">
                <i className="fas fa-check-circle ctgd-learn-icon"></i>
                <span>Thao tác với thư viện Pandas và NumPy</span>
              </div>
              <div className="ctgd-learn-item">
                <i className="fas fa-check-circle ctgd-learn-icon"></i>
                <span>Hiểu sâu về Lập trình hướng đối tượng (OOP)</span>
              </div>
              <div className="ctgd-learn-item">
                <i className="fas fa-check-circle ctgd-learn-icon"></i>
                <span>Xây dựng Web Scraping với BeautifulSoup</span>
              </div>
              <div className="ctgd-learn-item">
                <i className="fas fa-check-circle ctgd-learn-icon"></i>
                <span>Tự động hóa công việc văn phòng hàng ngày</span>
              </div>
            </div>
          </section>

          {/* CURRICULUM */}
          <section className="ctgd-curriculum">
            <h2 className="ctgd-section-title">Nội dung khóa học</h2>
            <div className="ctgd-curriculum-header">
              <div className="ctgd-curriculum-stats">
                24 phần • 158 bài giảng • 22 giờ 45 phút tổng thời lượng
              </div>
              <button className="ctgd-expand-btn" onClick={expandAll}>Mở rộng tất cả</button>
            </div>

            {/* Chapter 1 */}
            <div className="ctgd-chapter">
              <div className="ctgd-chapter-header" onClick={() => toggleSection(1)}>
                <div className="ctgd-chapter-title-wrap">
                  <i className={`fas fa-chevron-${expandedSections.includes(1) ? 'up' : 'down'} ctgd-chapter-icon`}></i>
                  <span className="ctgd-chapter-title">Phần 1: Giới thiệu và Cài đặt môi trường</span>
                </div>
                <span className="ctgd-chapter-meta">4 bài giảng • 25 phút</span>
              </div>
              {expandedSections.includes(1) && (
                <div className="ctgd-chapter-body">
                  <div className="ctgd-lesson">
                    <div className="ctgd-lesson-left">
                      <i className="fas fa-play-circle ctgd-lesson-icon"></i>
                      <span>Chào mừng bạn đến với khóa học</span>
                    </div>
                    <div className="ctgd-lesson-right">
                      <a href="#" className="ctgd-preview-link">Xem thử</a>
                      <span className="ctgd-lesson-duration">05:20</span>
                    </div>
                  </div>
                  <div className="ctgd-lesson">
                    <div className="ctgd-lesson-left">
                      <i className="fas fa-play-circle ctgd-lesson-icon"></i>
                      <span>Cài đặt Python 3 trên Windows và Mac</span>
                    </div>
                    <div className="ctgd-lesson-right">
                      <span className="ctgd-lesson-duration">08:15</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter 2 */}
            <div className="ctgd-chapter">
              <div className="ctgd-chapter-header" onClick={() => toggleSection(2)}>
                <div className="ctgd-chapter-title-wrap">
                  <i className={`fas fa-chevron-${expandedSections.includes(2) ? 'up' : 'down'} ctgd-chapter-icon`}></i>
                  <span className="ctgd-chapter-title">Phần 2: Nền tảng Python cơ bản</span>
                </div>
                <span className="ctgd-chapter-meta">12 bài giảng • 1 giờ 45 phút</span>
              </div>
              {expandedSections.includes(2) && (
                <div className="ctgd-chapter-body">
                   <div className="ctgd-lesson">
                    <div className="ctgd-lesson-left">
                      <i className="fas fa-play-circle ctgd-lesson-icon"></i>
                      <span>Biến và các kiểu dữ liệu cơ bản</span>
                    </div>
                    <div className="ctgd-lesson-right">
                      <span className="ctgd-lesson-duration">10:30</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter 3 */}
            <div className="ctgd-chapter">
              <div className="ctgd-chapter-header" onClick={() => toggleSection(3)}>
                <div className="ctgd-chapter-title-wrap">
                  <i className={`fas fa-chevron-${expandedSections.includes(3) ? 'up' : 'down'} ctgd-chapter-icon`}></i>
                  <span className="ctgd-chapter-title">Phần 3: Cấu trúc dữ liệu nâng cao</span>
                </div>
                <span className="ctgd-chapter-meta">8 bài giảng • 2 giờ 15 phút</span>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="ctgd-description">
            <h2 className="ctgd-section-title">Mô tả khóa học</h2>
            <p>Chào mừng bạn đến với hành trình chinh phục Python. Khóa học này được thiết kế để đưa bạn từ một người chưa biết gì về lập trình trở thành một nhà phát triển Python tự tin.</p>
            <p>Chúng tôi không chỉ dạy cú pháp. Chúng tôi dạy bạn cách tư duy như một lập trình viên thực thụ. Qua mỗi bài học, bạn sẽ áp dụng kiến thức vào các bài tập thực hành nhỏ, giúp củng cố tư duy logic và khả năng giải quyết vấn đề.</p>
            <ul>
              <li>Bài giảng video chất lượng 4K cực nét.</li>
              <li>Hệ thống bài tập tự động chấm điểm trên nền tảng EducodeAI.</li>
              <li>Cộng đồng hỗ trợ 24/7 từ các trợ giảng chuyên môn.</li>
              <li>Chứng chỉ hoàn thành có giá trị trong hồ sơ năng lực.</li>
            </ul>
          </section>

          {/* INSTRUCTOR INFO */}
          <section className="ctgd-instructor-box">
            <h2 className="ctgd-section-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Thông tin giảng viên</h2>
            <div className="ctgd-instructor-profile">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256" 
                alt="Dr. Nguyễn Minh Quân" 
                className="ctgd-instructor-avatar-large" 
              />
              <div className="ctgd-instructor-details">
                <h3 className="ctgd-instructor-name">Dr. Nguyễn Minh Quân</h3>
                <div className="ctgd-instructor-headline">Chuyên gia Khoa học Dữ liệu tại TechCorp & Giảng viên Đại học</div>
                <div className="ctgd-instructor-stats">
                  <div className="ctgd-instructor-stats-item">
                    <i className="fas fa-star" style={{color: 'var(--primary)'}}></i>
                    <span>4.9 Xếp hạng</span>
                  </div>
                  <div className="ctgd-instructor-stats-item">
                    <i className="fas fa-user-friends" style={{color: 'var(--primary)'}}></i>
                    <span>250,000 Học viên</span>
                  </div>
                  <div className="ctgd-instructor-stats-item">
                    <i className="fas fa-play-circle" style={{color: 'var(--primary)'}}></i>
                    <span>15 Khóa học</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ctgd-instructor-bio">
              Với hơn 10 năm kinh nghiệm trong ngành phần mềm và 5 năm giảng dạy, tôi đam mê việc chia sẻ kiến thức công nghệ theo cách dễ hiểu nhất.
            </div>
            <div className="ctgd-social-links">
              <a href="#" className="ctgd-social-btn"><i className="fas fa-globe"></i></a>
              <a href="#" className="ctgd-social-btn"><i className="fas fa-share-alt"></i></a>
            </div>
          </section>

          {/* REVIEWS */}
          <section className="ctgd-reviews">
            <h2 className="ctgd-section-title">Đánh giá từ học viên</h2>
            <div className="ctgd-reviews-summary">
              <div className="ctgd-reviews-overall">
                <div className="ctgd-reviews-score">4.8</div>
                <div className="ctgd-reviews-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                </div>
                <div className="ctgd-reviews-label">Xếp hạng khóa học</div>
              </div>
              <div className="ctgd-reviews-bars">
                {[
                  { stars: 5, percent: 80 },
                  { stars: 4, percent: 15 },
                  { stars: 3, percent: 3 },
                  { stars: 2, percent: 1 },
                  { stars: 1, percent: 1 },
                ].map(item => (
                  <div className="ctgd-review-bar-item" key={item.stars}>
                    <div className="ctgd-review-bar-track">
                      <div className="ctgd-review-bar-fill" style={{ width: `${item.percent}%` }}></div>
                    </div>
                    <div className="ctgd-review-bar-label">
                      <i className="fas fa-star" style={{ color: 'var(--primary)', fontSize: '12px', marginRight: '4px' }}></i>
                      {item.stars} sao
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ctgd-review-list">
              <div className="ctgd-review-item">
                <div className="ctgd-review-header">
                  <div className="ctgd-reviewer-avatar">H</div>
                  <div className="ctgd-reviewer-info">
                    <div className="ctgd-reviewer-name">Hải Lâm</div>
                    <div className="ctgd-review-meta">
                      <div className="ctgd-stars" style={{ fontSize: '12px' }}>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                      </div>
                      <span>1 tuần trước</span>
                    </div>
                  </div>
                </div>
                <div className="ctgd-review-text">
                  Khóa học cực kỳ chi tiết, giảng viên rất chuẩn xíu. Đặc biệt là phần bài tập thực hành giúp mình mở mang rất nhiều. Rất đáng đồng tiền bát gạo!
                </div>
              </div>

              <div className="ctgd-review-item">
                <div className="ctgd-review-header">
                  <div className="ctgd-reviewer-avatar">A</div>
                  <div className="ctgd-reviewer-info">
                    <div className="ctgd-reviewer-name">Anh Hoàng</div>
                    <div className="ctgd-review-meta">
                      <div className="ctgd-stars" style={{ fontSize: '12px' }}>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="far fa-star"></i>
                      </div>
                      <span>2 tuần trước</span>
                    </div>
                  </div>
                </div>
                <div className="ctgd-review-text">
                  Nội dung phong phú, tuy nhiên phần nâng cao hơi khó với người mới bắt đầu như mình. Cần dành nhiều thời gian hơn để nghiên cứu.
                </div>
              </div>
            </div>
            
            <button className="ctgd-more-reviews-btn">Xem thêm tất cả đánh giá</button>
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="ctgd-sidebar-wrapper">
          <div className="ctgd-sidebar-card">
            <div className="ctgd-video-preview">
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=450" 
                alt="Video Preview" 
                className="ctgd-video-thumb"
              />
              <div className="ctgd-play-btn">
                <i className="fas fa-play"></i>
              </div>
              <div className="ctgd-video-label">Xem video giới thiệu</div>
            </div>
            
            <div className="ctgd-card-body">
              <div className="ctgd-price-section">
                <div className="ctgd-price-current">599.000đ</div>
                <div className="ctgd-price-old-wrap">
                  <span className="ctgd-discount-badge">Giảm 50%</span>
                  <span className="ctgd-price-old">1.200.000đ</span>
                </div>
              </div>

              <div className="ctgd-action-buttons">
                <button className="ctgd-btn-primary">Đăng ký ngay</button>
                <button className="ctgd-btn-secondary">Thêm vào giỏ hàng</button>
              </div>

              <div className="ctgd-guarantee">Cam kết hoàn tiền trong 7 ngày</div>

              <div className="ctgd-includes">
                <h4 className="ctgd-includes-title">Khóa học bao gồm:</h4>
                <div className="ctgd-includes-list">
                  <div className="ctgd-includes-item">
                    <i className="fas fa-video ctgd-includes-icon"></i>
                    <span>22.5 giờ video HD</span>
                  </div>
                  <div className="ctgd-includes-item">
                    <i className="fas fa-laptop-code ctgd-includes-icon"></i>
                    <span>45 bài tập thực hành</span>
                  </div>
                  <div className="ctgd-includes-item">
                    <i className="fas fa-file-pdf ctgd-includes-icon"></i>
                    <span>Tài liệu PDF đi kèm</span>
                  </div>
                  <div className="ctgd-includes-item">
                    <i className="fas fa-mobile-alt ctgd-includes-icon"></i>
                    <span>Học trên máy tính & điện thoại</span>
                  </div>
                  <div className="ctgd-includes-item">
                    <i className="fas fa-certificate ctgd-includes-icon"></i>
                    <span>Chứng chỉ hoàn thành khóa học</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ctgd-card-footer">
              <button className="ctgd-footer-btn">
                <i className="fas fa-share-alt"></i>
                <span>Chia sẻ</span>
              </button>
              <button className="ctgd-footer-btn">
                <i className="far fa-heart"></i>
                <span>Yêu thích</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietKhoaHocGiaoDien;
