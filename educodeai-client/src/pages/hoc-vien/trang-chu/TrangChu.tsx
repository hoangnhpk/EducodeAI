import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axiosInstance from '@/configs/axios';
import { encodeId } from "@/utils/id-helper";
import { laKhoaHocMienPhi } from "@/utils/format-gia-khoa-hoc";

interface IKhoaHoc {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    slug: string;
    hinhAnh: string;
    linhVuc: string;
    diemDanhGiaTB: number;
    thoiLuongGio: number;
    trinhDo: string;
    kyNangChinh: string;
    khoaHocDaDangKy: boolean;
    giaKhoaHoc: number;
    donViTienTe: string;
}

const parseKyNangTags = (raw?: string): string[] => {
    if (!raw?.trim()) return [];
    return raw.split(',').map((item) => item.trim()).filter(Boolean);
};

const TrangChu: React.FC = () => {
    const [courses, setCourses] = useState<IKhoaHoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSearchPinned, setIsSearchPinned] = useState(false);
    const [navbarBottom, setNavbarBottom] = useState(0);
    const searchPlaceholderRef = useRef<HTMLDivElement>(null);
    const searchBarHeightRef = useRef(0);

    const loadData = async (search: string = '') => {
        setIsLoading(true);
        try {
            const data = await axiosInstance.get<IKhoaHoc[]>('api/KhoaHoc/all', {
                params: { search: search }
            });
            setCourses(data);
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            loadData(searchTerm);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    useEffect(() => {
        const updateSearchBar = () => {
            const navbar = document.querySelector<HTMLElement>('.navbar.sticky-top');
            const bottom = navbar ? Math.max(navbar.getBoundingClientRect().bottom, 0) : 0;
            setNavbarBottom(bottom);

            const placeholder = searchPlaceholderRef.current;
            const scrollY = window.scrollY;
            const placeholderTop = placeholder?.getBoundingClientRect().top ?? Infinity;
            const shouldPin = scrollY > 300 && placeholderTop <= bottom;

            if (placeholder && !shouldPin && placeholder.offsetHeight > 0) {
                searchBarHeightRef.current = placeholder.offsetHeight;
            }

            setIsSearchPinned(shouldPin);
        };

        updateSearchBar();
        window.addEventListener('scroll', updateSearchBar, { passive: true });
        window.addEventListener('resize', updateSearchBar);
        return () => {
            window.removeEventListener('scroll', updateSearchBar);
            window.removeEventListener('resize', updateSearchBar);
        };
    }, []);

    const renderSearchBar = () => (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="search-bar-modern">
                        <div className="search-icon"><i className="fa fa-search"></i></div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Bạn muốn học gì hôm nay? (VD: Java, Python...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
                                <i className="fa fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // UI elements translated from Tailwind to Bootstrap/CSS
    return (
        <div className="home-page-modern">
            {/* 1. Hero Section */}
            <section className="hero-section">
                <div className="hero-bg">
                    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80" alt="Banner" />
                </div>
                <div className="hero-overlay"></div>

                <div className="container position-relative z-index-1 h-100">
                    <div className="row align-items-center h-100">
                        <div className="col-lg-8">
                            <span className="hero-badge mb-4 d-inline-block">
                                Khởi Đầu Tương Lai
                            </span>
                            <h1 className="display-3 fw-bolder text-white mb-4 hero-title">
                                Học Lập Trình <br />
                                <span className="text-primary position-relative d-inline-block mt-2">
                                    Dễ Dàng & Hiệu Quả
                                    <svg className="hero-underline" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" /></svg>
                                </span>
                            </h1>
                            <p className="lead text-light mb-5 fs-5 opacity-75 max-w-xl">
                                Nền tảng e-learning thông minh với lộ trình bài bản, đồ án thực chiến và phòng phỏng vấn ảo được hỗ trợ 100% bởi Trí tuệ nhân tạo.
                            </p>

                            <div className="hero-cta-group">
                                <a href="#courses-section" className="hero-cta-btn hero-cta-btn--primary">
                                    <span>Khám phá khóa học</span>
                                    <i className="fa fa-arrow-right" aria-hidden="true"></i>
                                </a>
                                <a href="#features-section" className="hero-cta-btn hero-cta-btn--outline">

                                    Tìm hiểu thêm
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* 3. Stats Section */}
            <section className="py-5 bg-white border-bottom">
                <div className="container">
                    <div className="row text-center g-4">
                        <div className="col-6 col-md-3 stat-item">
                            <div className="display-5 fw-bolder text-dark mb-2">10K+</div>
                            <p className="text-muted fw-bold">Học viên tin tưởng</p>
                        </div>
                        <div className="col-6 col-md-3 stat-item">
                            <div className="display-5 fw-bolder text-dark mb-2">150+</div>
                            <p className="text-muted fw-bold">Khóa học chất lượng</p>
                        </div>
                        <div className="col-6 col-md-3 stat-item">
                            <div className="display-5 fw-bolder text-dark mb-2">50+</div>
                            <p className="text-muted fw-bold">Chuyên gia giảng dạy</p>
                        </div>
                        <div className="col-6 col-md-3 stat-item border-end-0">
                            <div className="display-5 fw-bolder text-dark mb-2">4.8/5</div>
                            <p className="text-muted fw-bold">Đánh giá trung bình</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Search Bar — ghim ngay dưới navbar khi cuộn */}
            <div
                ref={searchPlaceholderRef}
                className="home-search-wrapper"
                aria-hidden={isSearchPinned}
            >
                {isSearchPinned ? (
                    <div style={{ height: searchBarHeightRef.current }} />
                ) : (
                    <div className="home-search-bar">{renderSearchBar()}</div>
                )}
            </div>

            {isSearchPinned && createPortal(
                <div
                    className="home-search-bar home-search-bar--pinned"
                    style={{ top: navbarBottom }}
                >
                    {renderSearchBar()}
                </div>,
                document.body
            )}

            {/* 4. Features - Hệ sinh thái AI */}
            <section id="features-section" className="py-5 bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase tracking-widest mb-2">Tại sao chọn EduCode?</h6>
                        <h2 className="display-6 fw-bold text-dark mb-4">Hệ sinh thái ứng dụng Trí Tuệ Nhân Tạo</h2>
                        <p className="text-muted fs-5 max-w-3xl mx-auto">Không chỉ là xem video, hệ thống cung cấp các công cụ thực chiến độc quyền giúp bạn sẵn sàng cho môi trường doanh nghiệp.</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="feature-card bg-white p-5 rounded-4 shadow-sm h-100">
                                <div className="icon-box bg-primary-subtle text-primary mb-4">
                                    <i className="fas fa-map-signs"></i>
                                </div>
                                <h3 className="h4 fw-bold text-dark mb-3">AI Sinh Lộ Trình</h3>
                                <p className="text-muted mb-4 leading-relaxed">Phân tích kỹ năng hiện tại và tạo ra một lộ trình học tập cá nhân hóa 100% dành riêng cho bạn.</p>
                                <Link to="/yeu-cau-lo-trinh-ai" className="text-primary fw-bold text-decoration-none feature-link">
                                    Trải nghiệm ngay <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-card bg-white p-5 rounded-4 shadow-sm h-100">
                                <div className="icon-box bg-warning-subtle text-warning mb-4">
                                    <i className="fas fa-laptop-code"></i>
                                </div>
                                <h3 className="h4 fw-bold text-dark mb-3">AI Sinh Đồ Án</h3>
                                <p className="text-muted mb-4 leading-relaxed">Tự động thiết kế yêu cầu, cơ sở dữ liệu và API cho một đồ án thực chiến khớp với trình độ của bạn.</p>
                                <Link to="/sinh-do-an-ai" className="text-primary fw-bold text-decoration-none feature-link">
                                    Tạo đồ án <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-card bg-white p-5 rounded-4 shadow-sm h-100">
                                <div className="icon-box bg-success-subtle text-success mb-4">
                                    <i className="fas fa-user-tie"></i>
                                </div>
                                <h3 className="h4 fw-bold text-dark mb-3">Phỏng Vấn Giả Lập</h3>
                                <p className="text-muted mb-4 leading-relaxed">Luyện tập trực tiếp với Tech Lead AI. Trả lời bằng giọng nói và nhận review điểm ngay lập tức.</p>
                                <Link to="/phong-van-ai" className="text-primary fw-bold text-decoration-none feature-link">
                                    Luyện tập ngay <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Categories */}
            <section className="py-5 bg-white border-top">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase tracking-widest mb-2">Danh mục</h6>
                        <h2 className="display-6 fw-bold text-dark">Chủ đề phổ biến</h2>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {[
                            { name: "C#", icon: "fa-brands fa-microsoft", color: "text-primary", bg: "bg-primary-subtle" },
                            { name: "Python", icon: "fa-brands fa-python", color: "text-warning", bg: "bg-warning-subtle" },
                            { name: "Java", icon: "fa-brands fa-java", color: "text-danger", bg: "bg-danger-subtle" },
                            { name: "AWS", icon: "fa-brands fa-aws", color: "text-warning", bg: "bg-warning-subtle" },
                            { name: "Web Design", icon: "fa-solid fa-palette", color: "text-info", bg: "bg-info-subtle" },
                            { name: "ReactJS", icon: "fa-brands fa-react", color: "text-info", bg: "bg-info-subtle" },
                            { name: "MySQL", icon: "fa-solid fa-database", color: "text-secondary", bg: "bg-secondary-subtle" },
                            { name: "UI/UX", icon: "fa-solid fa-pen-nib", color: "text-success", bg: "bg-success-subtle" }
                        ].map((cat, index) => (
                            <div key={index} className="col-6 col-md-3 col-lg-2" onClick={() => setSearchTerm(cat.name)}>
                                <div className="category-card text-center p-4 bg-white border rounded-4 cursor-pointer transition-all h-100">
                                    <div className={`icon-wrapper d-inline-flex align-items-center justify-content-center rounded-4 fs-2 mb-3 ${cat.bg} ${cat.color}`} style={{ width: '60px', height: '60px' }}>
                                        <i className={cat.icon}></i>
                                    </div>
                                    <h5 className="h6 fw-bold text-dark m-0">{cat.name}</h5>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Courses */}
            <section id="courses-section" className="py-5 bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase tracking-widest mb-2">Hành trình tri thức</h6>
                        <h2 className="display-6 fw-bold text-dark mb-4">
                            {searchTerm ? `Kết quả cho: "${searchTerm}"` : "Khám Phá Các Khóa Học"}
                        </h2>
                    </div>

                    <div className="row g-4">
                        {isLoading ? (
                            <div className="text-center w-100 py-5">
                                <div className="spinner-border text-primary fs-4" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                                <p className="mt-3 text-muted fw-bold">Đang tải khoá học...</p>
                            </div>
                        ) : courses.length > 0 ? (
                            courses.map((kh) => {
                                const skillTags = parseKyNangTags(kh.kyNangChinh);
                                const visibleTags = skillTags.slice(0, 3);
                                const hiddenTagCount = skillTags.length - visibleTags.length;

                                return (
                                <div key={kh.maKhoaHoc} className="col-md-6 col-lg-3">
                                    <div className="course-card card h-100 border-0 rounded-4 shadow-sm overflow-hidden transition-all">
                                        <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                                            <img
                                                src={`/img/${kh.hinhAnh}`}
                                                alt={kh.tenKhoaHoc}
                                                className="w-100 h-100 object-fit-cover course-img"
                                                onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=500&q=80')}
                                            />
                                            <div className="position-absolute top-0 start-0 m-3">
                                                <span className="badge bg-dark px-3 py-2 text-uppercase tracking-wider rounded-3 opacity-75">
                                                    {kh.linhVuc}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body p-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="badge bg-primary-subtle text-primary fw-bold px-2 py-1"><i className="fa fa-layer-group me-1"></i> {kh.trinhDo}</span>
                                                <span className="fw-bold text-dark"><i className="fa fa-star text-warning me-1"></i> {kh.diemDanhGiaTB}</span>
                                            </div>
                                            <h5 className="card-title fw-bold text-dark line-clamp-2 mb-3">{kh.tenKhoaHoc}</h5>
                                            <div className="course-skill-tags mb-3">
                                                {skillTags.length === 0 ? (
                                                    <span className="course-skill-tag course-skill-tag--empty">Đang cập nhật...</span>
                                                ) : (
                                                    <>
                                                        {visibleTags.map((tag, index) => (
                                                            <span key={`${kh.maKhoaHoc}-${tag}-${index}`} className="course-skill-tag">{tag}</span>
                                                        ))}
                                                        {hiddenTagCount > 0 && (
                                                            <span className="course-skill-tag course-skill-tag--more">+{hiddenTagCount}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-auto">
                                                <div className="d-flex align-items-center text-muted small mb-3">
                                                    <i className="fa fa-clock text-primary me-2"></i> {kh.thoiLuongGio} giờ học
                                                </div>
                                                {kh.khoaHocDaDangKy ? (
                                                    <div className="course-card-actions">
                                                        <Link to={`/khoa-hoc/${kh.maKhoaHoc}`} className="btn btn-course-detail">
                                                            Chi tiết
                                                        </Link>
                                                        <Link to={`/khoa-hoc/${kh.slug}/${encodeId(kh.maKhoaHoc)}`} className="btn btn-success rounded-3 fw-bold text-center flex-grow-1" style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className="fa fa-play-circle me-2"></i> Tiếp tục học
                                                        </Link>
                                                    </div>
                                                ) : (

                                                    <div className="course-card-actions">
                                                        <Link to={`/khoa-hoc/${kh.maKhoaHoc}`} className="btn btn-course-detail">
                                                            Chi tiết
                                                        </Link>
                                                        {laKhoaHocMienPhi(kh.donViTienTe) ? (
                                                            <Link to={`/mua-khoa-hoc/${kh.maKhoaHoc}`} className="btn btn-course-buy btn-course-buy--full">
                                                                Học ngay
                                                            </Link>
                                                        ) : (
                                                            <>
                                                                <Link to={`/khoa-hoc/${kh.slug}/${encodeId(kh.maKhoaHoc)}`} className="btn btn-course-trial">
                                                                    Học thử
                                                                </Link>
                                                                <Link to={`/mua-khoa-hoc/${kh.maKhoaHoc}`} className="btn btn-course-buy">
                                                                    Mua ngay
                                                                </Link>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        ) : (
                            <div className="text-center w-100 py-5">
                                <div className="display-1 text-muted mb-3"><i className="fas fa-search-minus"></i></div>
                                <h4 className="text-dark fw-bold mb-3">Không tìm thấy khóa học nào phù hợp!</h4>
                                <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => setSearchTerm('')}>Xóa bộ lọc</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 7. Top Instructors */}
            <section className="py-5 bg-white border-top">
                <div className="container py-5">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h6 className="text-primary fw-bold text-uppercase tracking-widest mb-2">Đội ngũ chuyên gia</h6>
                            <h2 className="display-6 fw-bold text-dark m-0">Giảng viên tiêu biểu</h2>
                        </div>
                        <a href="#" className="fw-bold text-muted text-decoration-none hover-primary d-none d-md-block">Xem tất cả <i className="fas fa-arrow-right ms-1"></i></a>
                    </div>

                    <div className="row g-4">
                        {[
                            { name: "Nguyễn Quốc Hùng", role: "Senior .NET Developer", bg: "0D8ABC" },
                            { name: "Nguyễn Tấn Nhật Khôi", role: "System Architect", bg: "fb873f" },
                            { name: "Nguyễn Huy Hoàng", role: "Frontend Lead", bg: "22c55e" },
                            { name: "Nguyễn Xuân Âu", role: "Cloud & DevOps", bg: "a855f7" }
                        ].map((gv, index) => (
                            <div key={index} className="col-md-6 col-lg-3">
                                <div className="instructor-card bg-light rounded-4 border p-4 text-center transition-all h-100">
                                    <div className="instructor-img-wrap mx-auto mb-4">
                                        <img src={`https://ui-avatars.com/api/?name=${gv.name.replace(/ /g, '+')}&background=${gv.bg}&color=fff&size=200`} alt={gv.name} className="rounded-circle shadow-sm border border-4 border-white instructor-img" style={{ width: '100px', height: '100px' }} />
                                    </div>
                                    <h5 className="fw-bold text-dark">{gv.name}</h5>
                                    <p className="text-primary fw-bold small mb-4">{gv.role}</p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <a href="#" className="social-icon bg-white text-muted rounded-circle d-flex align-items-center justify-content-center shadow-sm"><i className="fab fa-linkedin-in"></i></a>
                                        <a href="#" className="social-icon bg-white text-muted rounded-circle d-flex align-items-center justify-content-center shadow-sm"><i className="fab fa-github"></i></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Reviews */}
            <section className="py-5 text-white position-relative overflow-hidden bg-dark">
                <div className="container py-5 position-relative z-index-1">
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase tracking-widest mb-2">Đánh giá thực tế</h6>
                        <h2 className="display-6 fw-bold m-0">Học viên nói gì về EduCode?</h2>
                    </div>

                    <div className="row g-4">
                        {[
                            { name: "Trần Minh", role: "Fresher Backend", quote: "Nhờ tính năng giả lập phỏng vấn AI, mình đã tự tin hơn rất nhiều khi deal lương thực tế. Các câu hỏi AI đưa ra cực kỳ sát với Technical Interview." },
                            { name: "Vy Văn Khiến", role: "Sinh viên CNTT", quote: "Code trực tiếp trên trình duyệt và được hệ thống test case ẩn tự động chấm điểm. Cảm giác như đang làm bài thi LeetCode vậy!" },
                            { name: "Thu Hoài", role: "Frontend ReactJS", quote: "Giao diện website cực kỳ thân thiện. Chức năng AI sinh đồ án giúp mình tiết kiệm hàng tuần trời ngồi suy nghĩ đề tài làm dự án cuối khóa." }
                        ].map((review, i) => (
                            <div key={i} className="col-md-4">
                                <div className="review-card bg-dark bg-opacity-50 p-4 rounded-4 border border-secondary h-100">
                                    <div className="text-warning mb-3">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                    <p className="text-light opacity-75 fst-italic mb-4">"{review.quote}"</p>
                                    <div className="d-flex align-items-center gap-3 mt-auto">
                                        <img src={`https://ui-avatars.com/api/?name=${review.name.replace(/ /g, '+')}&background=random`} alt="User" className="rounded-circle" style={{ width: '48px', height: '48px' }} />
                                        <div>
                                            <h6 className="fw-bold m-0 text-white">{review.name}</h6>
                                            <small className="text-secondary">{review.role}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. CTA */}
            <section className="py-5 bg-primary">
                <div className="container py-4">
                    <div className="bg-white rounded-4 p-5 p-md-5 d-flex flex-column flex-md-row align-items-center justify-content-between shadow-lg position-relative overflow-hidden">
                        <div className="position-absolute" style={{ right: '-50px', top: '-50px', width: '250px', height: '250px', background: 'rgba(251, 135, 63, 0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
                        <div className="text-center text-md-start mb-4 mb-md-0 position-relative z-index-1">
                            <h2 className="display-6 fw-bold text-dark mb-3">Bạn muốn truyền cảm hứng?</h2>
                            <p className="text-muted fs-5 mb-0" style={{ maxWidth: '600px' }}>Trở thành giảng viên trên EduCode để chia sẻ kiến thức, xây dựng thương hiệu cá nhân và tạo thu nhập thụ động.</p>
                        </div>
                        <div className="position-relative z-index-1">
                            <Link to="/dang-ky-giang-vien" className="btn btn-dark btn-lg rounded-4 px-5 py-3 fw-bold shadow text-decoration-none">
                                Đăng ký Giảng viên ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                /* === CUSTOM CSS FOR MODERN HOME === */
                .tracking-widest { letter-spacing: 0.1em; }
                .leading-relaxed { line-height: 1.625; }
                .max-w-xl { max-width: 36rem; }
                .max-w-3xl { max-width: 48rem; }
                .z-index-1 { z-index: 1; }
                
                /* Hero Section */
                .hero-section {
                    position: relative;
                    height: 600px;
                    display: flex;
                    align-items: center;
                    margin-top: 0;
                }
                .hero-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .hero-bg img {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .hero-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8), transparent);
                }
                .hero-badge {
                    padding: 0.35rem 1rem;
                    border-radius: 50rem;
                    background: rgba(251, 135, 63, 0.2);
                    color: #fb873f;
                    border: 1px solid rgba(251, 135, 63, 0.3);
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 700;
                }
                .hero-underline {
                    position: absolute;
                    width: 100%;
                    height: 12px;
                    bottom: -4px;
                    left: 0;
                    color: rgba(251, 135, 63, 0.4);
                }
                .hero-cta-group {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1rem;
                }
                .hero-cta-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    height: 3.25rem;
                    padding: 0 2rem;
                    border-radius: 50rem;
                    font-size: 1.125rem;
                    font-weight: 700;
                    line-height: 1;
                    white-space: nowrap;
                    text-decoration: none;
                    box-sizing: border-box;
                    border: 2px solid transparent;
                    margin: 0;
                    transition: all 0.25s ease;
                }
                .hero-cta-btn--primary {
                    background: #0d6efd;
                    border-color: #0d6efd;
                    color: #fff;
                    box-shadow: 0 10px 24px rgba(13, 110, 253, 0.35);
                }
                .hero-cta-btn--primary:hover {
                    background: #0b5ed7;
                    border-color: #0b5ed7;
                    color: #fff;
                    transform: translateY(-1px);
                }
                .hero-cta-btn--outline {
                    background: transparent;
                    border-color: rgba(255, 255, 255, 0.9);
                    color: #fff;
                    box-shadow: none;
                }
                .hero-cta-btn--outline:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: #fff;
                    color: #fff;
                    transform: translateY(-1px);
                }

                /* Search Bar */
                .home-search-wrapper {
                    position: relative;
                }
                .home-search-bar {
                    background: #fff;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
                    padding: 0.85rem 0;
                }
                .home-search-bar--pinned {
                    position: fixed;
                    left: 0;
                    right: 0;
                    z-index: 1030;
                }
                .search-bar-modern {
                    display: flex;
                    align-items: center;
                    background: #fff;
                    border: 2px solid #e2e8f0;
                    border-radius: 50rem;
                    height: 3.5rem;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .search-bar-modern:focus-within {
                    border-color: #fb873f;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
                .search-icon {
                    width: 3.5rem;
                    display: grid;
                    place-items: center;
                    color: #94a3b8;
                    font-size: 1.1rem;
                }
                .search-input {
                    flex: 1;
                    height: 100%;
                    border: none;
                    outline: none;
                    font-weight: 600;
                    color: #334155;
                }
                .clear-btn {
                    width: 3.5rem;
                    height: 100%;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: grid;
                    place-items: center;
                }
                .clear-btn:hover { color: #fb873f; }

                /* Stats */
                .stat-item {
                    border-right: 1px solid #f1f5f9;
                }
                @media (max-width: 768px) {
                    .stat-item { border-right: none; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
                }

                /* Feature Card */
                .feature-card {
                    transition: all 0.4s ease;
                    border: 1px solid #f1f5f9;
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important;
                }
                .icon-box {
                    width: 3.5rem; height: 3.5rem;
                    border-radius: 1rem;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                    transition: all 0.3s ease;
                }
                .feature-card:hover .icon-box {
                    transform: scale(1.1);
                }
                .feature-link { transition: all 0.3s ease; }
                .feature-card:hover .feature-link { gap: 0.5rem; }

                /* Category Card */
                .category-card:hover {
                    border-color: #fb873f !important;
                    transform: translateY(-5px);
                }
                .category-card:hover h5 { color: #fb873f !important; }
                .icon-wrapper { transition: all 0.3s ease; }
                .category-card:hover .icon-wrapper { transform: scale(1.1); }

                /* Course Card */
                .course-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .course-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important;
                }
                .course-img { transition: transform 0.5s ease; }
                .course-card:hover .course-img { transform: scale(1.05); }
                .course-skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    min-height: 1.75rem;
                }
                .course-skill-tag {
                    display: inline-flex;
                    align-items: center;
                    max-width: 100%;
                    padding: 0.25rem 0.65rem;
                    border-radius: 50rem;
                    font-size: 0.72rem;
                    font-weight: 600;
                    line-height: 1.2;
                    background: rgba(251, 135, 63, 0.1);
                    color: #c2410c;
                    border: 1px solid rgba(251, 135, 63, 0.22);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .course-skill-tag--more {
                    background: #f1f5f9;
                    color: #64748b;
                    border-color: #e2e8f0;
                }
                .course-skill-tag--empty {
                    background: #f8fafc;
                    color: #94a3b8;
                    border-color: #e2e8f0;
                    font-weight: 500;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    min-height: 3rem;
                }
                .course-card-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }
                .course-card-actions .btn {
                    border-radius: 0.65rem;
                    font-weight: 700;
                    font-size: 0.8125rem;
                    padding: 0.55rem 0.5rem;
                    white-space: nowrap;
                    text-align: center;
                    line-height: 1.2;
                }
                .btn-course-detail {
                    grid-column: 1 / -1;
                    background: #fff;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                }
                .btn-course-detail:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }
                .btn-course-trial {
                    background: #fff;
                    border: 1px solid #fb873f;
                    color: #fb873f;
                }
                .btn-course-trial:hover {
                    background: rgba(251, 135, 63, 0.08);
                    color: #e86f24;
                }
                .btn-course-buy {
                    background: #fb873f;
                    border: 1px solid #fb873f;
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(251, 135, 63, 0.25);
                }
                .btn-course-buy:hover {
                    background: #e86f24;
                    border-color: #e86f24;
                    color: #fff;
                }
                .btn-course-buy--full {
                    grid-column: 1 / -1;
                }

                /* Instructor Card */
                .instructor-card:hover {
                    transform: translateY(-8px);
                    background: #fff !important;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                }
                .instructor-img { transition: transform 0.3s ease; }
                .instructor-card:hover .instructor-img { transform: scale(1.1); }
                .social-icon { width: 36px; height: 36px; transition: all 0.3s ease; text-decoration: none; }
                .social-icon:hover { background: #fb873f !important; color: #fff !important; }

                .hover-primary:hover { color: #fb873f !important; }

                /* Colors */
                .bg-primary-subtle { background-color: rgba(251, 135, 63, 0.1) !important; }
                .text-primary { color: #fb873f !important; }

                /* Button specific sizing */
                .hero-btn {
                    width: 250px !important;
                    height: 56px !important;
                    font-size: 1.1rem !important;
                }
            `}</style>
        </div>
    );
};

export default TrangChu;
