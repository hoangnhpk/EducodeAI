import { useState } from "react";
import "../../../layouts/hoc-vien/ChiTietKhoaHoc.css";

type Lesson = {
    title: string;
    videoUrl: string;
};

const ChiTietKhoaHoc = () => {
    const [openChapter, setOpenChapter] = useState<number | null>(0);

    const [currentLesson, setCurrentLesson] = useState<Lesson>({
        title: "Giới thiệu về HTML",
        videoUrl: "/videos/html-intro.mp4",
    });

    const toggleChapter = (index: number) => {
        setOpenChapter(openChapter === index ? null : index);
    };

    return (
        <>
            {/* ===== COURSE HEADER ===== */}
            <div className="course-header">
                <div className="course-header-content">
                    <h1 className="course-title">
                        Khóa học HTML cho người mới bắt đầu
                    </h1>

                    <p className="course-subtitle">
                        Bắt đầu từ đầu bằng cách học các kiến thức cơ bản về HTML — nền tảng
                        quan trọng để xây dựng và chỉnh sửa trang web.
                    </p>

                    <div className="course-meta">
                        <div className="course-meta-item rating">
                            <div className="rating-stars">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star-half-alt"></i>
                            </div>
                            <span>4.6 (12.458 đánh giá)</span>
                        </div>

                        <div className="course-meta-item">
                            <i className="fas fa-users"></i> 58.000+ học viên
                        </div>

                        <div className="course-meta-item">
                            <i className="fas fa-clock"></i> 2.5 giờ
                        </div>

                        <div className="course-meta-item">
                            <i className="fas fa-signal"></i> Người mới bắt đầu
                        </div>

                        <div className="course-meta-item">
                            <i className="fas fa-globe"></i> Tiếng Việt
                        </div>
                    </div>

                    <div className="instructor-info">
                        <img
                            src="https://alltop.vn/backend/media/images/posts/695/Tiem_anh_doanh_nhan_1990-60783.jpg"
                            className="instructor-avatar"
                            alt=""
                        />
                        <div>
                            <h5>Nguyễn Văn An</h5>
                            <p>Nhà phát triển Web Senior & Giảng viên</p>
                        </div>
                    </div>

                    <a className="course-action-btn">
                        <i className="fas fa-shopping-cart me-2"></i> Đăng ký khóa học
                    </a>
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="course-main-container">
                <div className="course-content-wrapper">
                    {/* ===== LEFT ===== */}
                    <div className="course-main-content">
                        {/* OVERVIEW */}
                        <div className="course-overview">
                            <h2 className="section-title">Tổng quan khóa học</h2>

                            <p>
                                Thật thú vị: tất cả các trang web đều sử dụng HTML — ngay cả trang này. Đây là phần cơ bản trong bộ công cụ của mọi nhà phát triển web. HTML cung cấp nội dung để cấu trúc trang web, bằng cách sử dụng các phần tử và thẻ, bạn có thể thêm văn bản, hình ảnh, video, biểu mẫu và hơn thế nữa.

                                Học các kiến thức cơ bản về HTML là bước đầu tiên quan trọng trong hành trình phát triển web của bạn và là kỹ năng thiết yếu cho các nhà phát triển front-end và back-end.
                            </p>

                            <h3>Bạn sẽ học được gì?</h3>
                            <ul className="objectives-list">
                                <li>Hiểu cấu trúc HTML</li>
                                <li>Tạo và chỉnh sửa trang web</li>
                                <li>Làm việc với form & table</li>
                                <li>HTML Semantic</li>
                                <li>Nền tảng CSS & JavaScript</li>
                            </ul>

                            {/* ===== SKILLS ===== */}
                            <div className="skills-section">
                                <h3>Kỹ năng đạt được</h3>
                                <div className="skills-tags">
                                    <span className="skill-tag">HTML Structure</span>
                                    <span className="skill-tag">Web Development</span>
                                    <span className="skill-tag">Semantic HTML</span>
                                    <span className="skill-tag">Forms & Tables</span>
                                    <span className="skill-tag">HTML5 Elements</span>
                                    <span className="skill-tag">Web Standards</span>
                                </div>
                            </div>

                            {/* ===== LANGUAGES ===== */}
                            <div style={{ marginTop: "2rem" }}>
                                <h3>Ngôn ngữ lập trình sử dụng</h3>
                                <div className="programming-languages">
                                    <div className="lang-icon">
                                        <i className="fab fa-html5"></i>
                                        <span>HTML5</span>
                                    </div>
                                    <div className="lang-icon">
                                        <i className="fab fa-css3-alt"></i>
                                        <span>CSS3</span>
                                    </div>
                                    <div className="lang-icon">
                                        <i className="fab fa-js"></i>
                                        <span>JavaScript</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===== CURRICULUM ===== */}
                        <div className="course-curriculum">
                            <h2 className="section-title">Nội dung khóa học</h2>

                            {/* ===== CHAPTER 1 ===== */}
                            <div className="chapter-accordion">
                                <div
                                    className={`chapter-header ${openChapter === 0 ? "active" : ""}`}
                                    onClick={() => toggleChapter(0)}
                                >
                                    <div>
                                        <h3>Chương 1: Giới thiệu về HTML</h3>
                                        <span>6 bài • 45 phút</span>
                                    </div>
                                    <i className="fas fa-chevron-down"></i>
                                </div>

                                {openChapter === 0 && (
                                    <div className="chapter-content">
                                        <div className="lesson-item">
                                            Giới thiệu về HTML <span>8:30</span>
                                        </div>
                                        <div className="lesson-item">
                                            Cấu trúc tài liệu HTML <span>12:15</span>
                                        </div>
                                        <div className="lesson-item">
                                            Các phần tử HTML <span>10:45</span>
                                        </div>
                                        <div className="lesson-item">
                                            Thực hành: Trang đầu tiên <span>15 phút</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ===== CHAPTER 2 ===== */}
                            <div className="chapter-accordion">
                                <div
                                    className={`chapter-header ${openChapter === 1 ? "active" : ""}`}
                                    onClick={() => toggleChapter(1)}
                                >
                                    <div>
                                        <h3>Chương 2: HTML Tables và Lists</h3>
                                        <span>5 bài • 40 phút</span>
                                    </div>
                                    <i className="fas fa-chevron-down"></i>
                                </div>

                                {openChapter === 1 && (
                                    <div className="chapter-content">
                                        <div className="lesson-item">
                                            Danh sách trong HTML <span>8:00</span>
                                        </div>
                                        <div className="lesson-item">
                                            Ordered & Unordered List <span>9:30</span>
                                        </div>
                                        <div className="lesson-item">
                                            Bảng (Table) trong HTML <span>10:45</span>
                                        </div>
                                        <div className="lesson-item">
                                            Gộp hàng và cột <span>6:30</span>
                                        </div>
                                        <div className="lesson-item">
                                            Thực hành: Tạo bảng dữ liệu <span>5 phút</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ===== CHAPTER 3 ===== */}
                            <div className="chapter-accordion">
                                <div
                                    className={`chapter-header ${openChapter === 2 ? "active" : ""}`}
                                    onClick={() => toggleChapter(2)}
                                >
                                    <div>
                                        <h3>Chương 3: HTML Forms</h3>
                                        <span>7 bài • 55 phút</span>
                                    </div>
                                    <i className="fas fa-chevron-down"></i>
                                </div>

                                {openChapter === 2 && (
                                    <div className="chapter-content">
                                        <div className="lesson-item">
                                            Giới thiệu về Form <span>7:45</span>
                                        </div>
                                        <div className="lesson-item">
                                            Input và Label <span>9:00</span>
                                        </div>
                                        <div className="lesson-item">
                                            Checkbox & Radio <span>8:30</span>
                                        </div>
                                        <div className="lesson-item">
                                            Select & Textarea <span>9:15</span>
                                        </div>
                                        <div className="lesson-item">
                                            Button & Submit <span>6:00</span>
                                        </div>
                                        <div className="lesson-item">
                                            Thực hành: Form đăng ký <span>14 phút</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ===== CHAPTER 4 ===== */}
                            <div className="chapter-accordion">
                                <div
                                    className={`chapter-header ${openChapter === 3 ? "active" : ""}`}
                                    onClick={() => toggleChapter(3)}
                                >
                                    <div>
                                        <h3>Chương 4: Semantic HTML & Best Practices</h3>
                                        <span>6 bài • 30 phút</span>
                                    </div>
                                    <i className="fas fa-chevron-down"></i>
                                </div>

                                {openChapter === 3 && (
                                    <div className="chapter-content">
                                        <div className="lesson-item">
                                            Semantic HTML là gì? <span>6:30</span>
                                        </div>
                                        <div className="lesson-item">
                                            Header, Nav, Footer <span>7:00</span>
                                        </div>
                                        <div className="lesson-item">
                                            Section & Article <span>6:45</span>
                                        </div>
                                        <div className="lesson-item">
                                            SEO & Accessibility <span>5:15</span>
                                        </div>
                                        <div className="lesson-item">
                                            Thực hành: Chuẩn hóa trang web <span>4:30</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* ===== INSTRUCTOR ===== */}
                        <div className="instructor-section">
                            <h2 className="section-title">Về giảng viên</h2>

                            <div className="instructor-profile">
                                <img
                                    src="https://alltop.vn/backend/media/images/posts/695/Tiem_anh_doanh_nhan_1990-60783.jpg"
                                    className="instructor-avatar-large"
                                    alt=""
                                />

                                <div>
                                    <h3>Nguyễn Văn An</h3>
                                    <p>
                                        Nhà phát triển Web Senior & Giám đốc chương trình giảng dạy
                                    </p>

                                    <div className="instructor-stats">
                                        <div className="stat-item">
                                            <div className="stat-value">4.87</div>
                                            <div className="stat-label">Đánh giá giảng viên</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">58K+</div>
                                            <div className="stat-label">Học viên</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">1.533</div>
                                            <div className="stat-label">Đánh giá</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">29</div>
                                            <div className="stat-label">Courses</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== SIDEBAR ===== */}
                    <div className="course-sidebar">
                        <div className="sidebar-card">
                            <img
                                src="https://prodima.vn/wp-content/uploads/2021/10/html-la-gi-giai-thich-chi-tiet-tu-a-z-ve-html-1.jpg"
                                className="course-preview-image"
                                alt=""
                            />

                            <div className="course-price">
                                Miễn phí <span className="free-badge">FREE</span>
                            </div>

                            <button className="enroll-btn">
                                <i className="fas fa-shopping-cart me-2"></i> Đăng ký ngay
                            </button>

                            <ul className="sidebar-list">
                                <li>⏱ 2.5 giờ</li>
                                <li>▶ 24 bài</li>
                                <li>📊 Beginner</li>
                                <li>🌐 Tiếng Việt</li>
                                <li>🎓 Chứng chỉ</li>
                                <li>♾ Truy cập trọn đời</li>
                            </ul>

                            {/* ===== CERTIFICATE BOX ===== */}
                            <div className="certificate-box">
                                <div className="certificate-icon">
                                    <i className="fas fa-certificate"></i>
                                </div>

                                <h4>Hoàn thành khóa học để nhận chứng chỉ</h4>
                                <p>Chứng chỉ có thể tải về và chia sẻ</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ChiTietKhoaHoc;
