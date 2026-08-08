import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axiosInstance from '@/configs/axios';
import { encodeId } from "@/utils/id-helper";
import { laKhoaHocMienPhi } from "@/utils/format-gia-khoa-hoc";
import { jobOpenings } from './data/jobOpenings';

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

const CourseRating: React.FC<{ level: string; rating: number }> = ({ level, rating }) => (
    <div className="course-card-rating">
        <span className="course-level-badge"><i className="fa fa-layer-group" aria-hidden="true" /> {level}</span>
        <span className="course-rating-value"><i className="fa fa-star" aria-hidden="true" /> {rating.toFixed(1)}</span>
    </div>
);

const TagList: React.FC<{ tags: string[]; courseId: number }> = ({ tags, courseId }) => {
    const visibleTags = tags.slice(0, 3);
    const hiddenTagCount = tags.length - visibleTags.length;
    if (!tags.length) return <div className="course-skill-tags"><span className="course-skill-tag course-skill-tag--empty">Đang cập nhật...</span></div>;
    return <div className="course-skill-tags">
        {visibleTags.map((tag, index) => <span key={`${courseId}-${tag}-${index}`} className="course-skill-tag">{tag}</span>)}
        {hiddenTagCount > 0 && <span className="course-skill-tag course-skill-tag--more">+{hiddenTagCount}</span>}
    </div>;
};

const CourseCard: React.FC<{ course: IKhoaHoc }> = ({ course: kh }) => {
    const isFree = laKhoaHocMienPhi(kh.donViTienTe);
    const detailUrl = `/khoa-hoc/${kh.maKhoaHoc}`;
    const learnUrl = `/khoa-hoc/${kh.slug}/${encodeId(kh.maKhoaHoc)}`;
    return <article className="course-card">
        <div className="course-card-thumbnail">
            <img src={`/img/${kh.hinhAnh}`} alt={kh.tenKhoaHoc} className="course-img" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=500&q=80'; }} />
            <span className="course-card-category">{kh.linhVuc}</span>
        </div>
        <div className="course-card-body">
            <CourseRating level={kh.trinhDo} rating={kh.diemDanhGiaTB} />
            <h3 className="course-card-title">{kh.tenKhoaHoc}</h3>
            <TagList tags={parseKyNangTags(kh.kyNangChinh)} courseId={kh.maKhoaHoc} />
            <div className="course-card-footer">
                <div className="course-duration"><i className="fa fa-clock" aria-hidden="true" /> {kh.thoiLuongGio} giờ học</div>
                <div className="course-card-actions">
                    <Link to={detailUrl} className="btn-course-detail">Chi tiết</Link>
                    {kh.khoaHocDaDangKy ? <Link to={learnUrl} className="btn-course-continue"><i className="fa fa-play-circle" aria-hidden="true" /> Tiếp tục học</Link> : isFree ? <Link to={`/mua-khoa-hoc/${kh.maKhoaHoc}`} className="btn-course-buy btn-course-buy--full">Học ngay</Link> : <><Link to={learnUrl} className="btn-course-trial">Học thử</Link><Link to={`/mua-khoa-hoc/${kh.maKhoaHoc}`} className="btn-course-buy">Mua ngay</Link></>}
                </div>
            </div>
        </div>
    </article>;
};

const TrangChu: React.FC = () => {
    const [courses, setCourses] = useState<IKhoaHoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSearchPinned, setIsSearchPinned] = useState(false);
    const searchPlaceholderRef = useRef<HTMLDivElement>(null);
    const searchBarHeightRef = useRef(0);
    const [danhGiaTrangChu, setDanhGiaTrangChu] = useState<any[]>([]);
    const [displayedReviews, setDisplayedReviews] = useState<any[]>([]);
    const [reviewFading, setReviewFading] = useState(false);
    const [giangVienTieuBieu, setGiangVienTieuBieu] = useState<any[]>([]);
    const [filterMaGV, setFilterMaGV] = useState<number | null>(null);
    const [filterTenGV, setFilterTenGV] = useState<string>('');

    const loadData = async (search: string = '', maGV: number | null = null) => {
        setIsLoading(true);
        try {
            const data = await axiosInstance.get<IKhoaHoc[]>('api/KhoaHoc/all', {
                params: { search: search, maGiangVien: maGV }
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
            loadData(searchTerm, filterMaGV);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm, filterMaGV]);

    // Lấy đánh giá thực tế và giảng viên tiêu biểu từ DB để hiển thị trên trang chủ
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [danhGiaRes, giangVienRes] = await Promise.all([
                    axiosInstance.get<any[]>('api/hocvien/chitietkhoahoc/danh-gia-trang-chu?soLuong=10'),
                    axiosInstance.get<any[]>('api/hocvien/chitietkhoahoc/giang-vien-tieu-bieu?soLuong=4')
                ]);
                setDanhGiaTrangChu(danhGiaRes);
                setGiangVienTieuBieu(giangVienRes);
            } catch (err) {
                console.error('Lỗi lấy dữ liệu trang chủ:', err);
            }
        };
        fetchData();
    }, []);

    // Hiển thị 3 đánh giá ngẫu nhiên ban đầu
    useEffect(() => {
        if (danhGiaTrangChu.length > 0 && displayedReviews.length === 0) {
            const shuffled = [...danhGiaTrangChu].sort(() => Math.random() - 0.5);
            setDisplayedReviews(shuffled.slice(0, 3));
        }
    }, [danhGiaTrangChu]);

    // Xáo trộn 3 đánh giá mỗi 30 giây với hiệu ứng
    useEffect(() => {
        if (danhGiaTrangChu.length <= 3) return;
        const interval = setInterval(() => {
            setReviewFading(true);
            setTimeout(() => {
                const shuffled = [...danhGiaTrangChu].sort(() => Math.random() - 0.5);
                setDisplayedReviews(shuffled.slice(0, 3));
                setReviewFading(false);
            }, 700);
        }, 30000);
        return () => clearInterval(interval);
    }, [danhGiaTrangChu]);

    useEffect(() => {
        const updateSearchBar = () => {
            const navbar = document.querySelector<HTMLElement>('.navbar.sticky-top');
            const bottom = navbar ? Math.max(navbar.getBoundingClientRect().bottom, 0) : 0;

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
                <div className="hero-orb hero-orb--1" aria-hidden="true"></div>
                <div className="hero-orb hero-orb--2" aria-hidden="true"></div>
                <div className="hero-grid" aria-hidden="true"></div>

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
                                <a href="#courses-section" className="hero-cta-btn hero-cta-btn--primary" onClick={(e) => {
                                    e.preventDefault();
                                    const el = document.getElementById('courses-section');
                                    if (el) {
                                        const navbar = document.querySelector<HTMLElement>('.navbar.sticky-top');
                                        const offset = navbar ? navbar.offsetHeight + 10 : 70;
                                        window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
                                    }
                                }}>
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



            {/* 3. Stats Section — strip nổi đè lên đáy hero */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-card">
                        <div className="row text-center g-0">
                            {[
                                { icon: 'fa-user-graduate', value: '10K+', label: 'Học viên tin tưởng' },
                                { icon: 'fa-book-open', value: '150+', label: 'Khóa học chất lượng' },
                                { icon: 'fa-chalkboard-user', value: '50+', label: 'Chuyên gia giảng dạy' },
                                { icon: 'fa-star', value: '4.8/5', label: 'Đánh giá trung bình' }
                            ].map((s, i) => (
                                <div key={i} className="col-6 col-md-3 stat-item">
                                    <div className="stat-icon"><i className={`fa-solid ${s.icon}`} aria-hidden="true"></i></div>
                                    <div className="stat-value">{s.value}</div>
                                    <p className="stat-label">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>



            {/* 5. Features - Hệ sinh thái AI */}
            <section id="features-section" className="py-5 bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h6 className="section-eyebrow mb-3">Tại sao chọn EduCode?</h6>
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

            {/* 3. Search Bar — ghim trên cùng khi cuộn, ghi đè header */}
            <div
                ref={searchPlaceholderRef}
                className="home-search-wrapper"
                aria-hidden={isSearchPinned}
            >
                {isSearchPinned ? (
                    <div style={{ height: searchBarHeightRef.current }} />
                ) : (
                    <div className="home-search-bar my-4">{renderSearchBar()}</div>
                )}
            </div>

            {isSearchPinned && createPortal(
                <div
                    className="home-search-bar home-search-bar--pinned"
                    style={{ top: 0, zIndex: 1050, background: '#fff', paddingTop: '10px', paddingBottom: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    {renderSearchBar()}
                </div>,
                document.body
            )}


            {/* 5. Categories */}
            <section className="py-5 bg-white border-top">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <h6 className="section-eyebrow mb-3">Danh mục</h6>
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
                            <div key={index} className="col-6 col-md-3 col-lg-2" onClick={() => {
                                setSearchTerm(cat.name);
                                setTimeout(() => {
                                    const el = document.getElementById('courses-section');
                                    if (el) {
                                        const navbar = document.querySelector<HTMLElement>('.navbar.sticky-top');
                                        const offset = navbar ? navbar.offsetHeight + 10 : 70;
                                        window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
                                    }
                                }, 100);
                            }}>
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
                        <h6 className="section-eyebrow mb-3">Hành trình tri thức</h6>
                        <h2 className="display-6 fw-bold text-dark mb-4">
                            {filterMaGV && filterTenGV ? `Khóa học của giảng viên: ${filterTenGV}` : (searchTerm ? `Kết quả cho: "${searchTerm}"` : "Khám Phá Các Khóa Học")}
                        </h2>
                    </div>

                    <div className="row g-4">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="col-md-6 col-lg-3" aria-hidden="true">
                                    <div className="course-card card h-100 border-0 overflow-hidden">
                                        <div className="course-skeleton-thumb skeleton-shimmer" />
                                        <div className="card-body p-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="course-skeleton-line skeleton-shimmer" style={{ width: '35%' }} />
                                                <span className="course-skeleton-line skeleton-shimmer" style={{ width: '20%' }} />
                                            </div>
                                            <span className="course-skeleton-line skeleton-shimmer mb-2" style={{ width: '90%' }} />
                                            <span className="course-skeleton-line skeleton-shimmer mb-3" style={{ width: '60%' }} />
                                            <div className="d-flex gap-2 mb-3">
                                                <span className="course-skeleton-pill skeleton-shimmer" />
                                                <span className="course-skeleton-pill skeleton-shimmer" />
                                            </div>
                                            <div className="mt-auto">
                                                <span className="course-skeleton-btn skeleton-shimmer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : courses.length > 0 ? (
                            courses.map((kh) => (
                                <div key={kh.maKhoaHoc} className="col-md-6 col-lg-3 d-flex">
                                    <CourseCard course={kh} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center w-100 py-5">
                                <div className="display-1 text-muted mb-3"><i className="fas fa-search-minus"></i></div>
                                <h4 className="text-dark fw-bold mb-2">Không tìm thấy khóa học nào phù hợp!</h4>
                                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                                    {filterMaGV || searchTerm
                                        ? `Không có kết quả. Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả khóa học.`
                                        : 'Hiện chưa có khóa học nào. Vui lòng quay lại sau.'}
                                </p>
                                {(filterMaGV || searchTerm) && (
                                    <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => { setSearchTerm(''); setFilterMaGV(null); setFilterTenGV(''); }}>
                                        <i className="fa fa-list me-2"></i>Xem tất cả
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {filterMaGV && courses.length > 0 && (
                        <div className="text-center mt-5">
                            <button className="btn btn-outline-primary rounded-pill px-5 py-2" onClick={() => { setSearchTerm(''); setFilterMaGV(null); setFilterTenGV(''); }}>
                                <i className="fa fa-list me-2"></i>Xem tất cả khóa học
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* 7. Top Instructors */}
            <section className="py-5 bg-white border-top">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h6 className="section-eyebrow mb-3">Đội ngũ chuyên gia</h6>
                        <h2 className="display-6 fw-bold text-dark m-0">Giảng viên tiêu biểu</h2>
                    </div>

                    <div className="row g-4">
                        {(giangVienTieuBieu.length > 0 ? giangVienTieuBieu : []).map((gv, index) => {
                            const colors = ['#0D8ABC', '#fb873f', '#22c55e', '#a855f7'];
                            const bgColor = colors[index % colors.length];
                            const hoTen = gv.hoTen || 'Ẩn danh';
                            const initials = hoTen.split(' ').map((w: string) => w[0]).join('').slice(-2).toUpperCase();
                            const avatarSrc = gv.anhDaiDien;
                            const hasAvatar = avatarSrc && !avatarSrc.includes('default') && avatarSrc.startsWith('http');

                            return (
                                <div key={gv.maGiangVien || index} className="col-md-6 col-lg-3">
                                    <div className="instructor-card bg-light rounded-4 border p-4 text-center transition-all h-100 position-relative">
                                        <div className="position-absolute top-0 end-0 mt-3 me-3 bg-warning text-dark px-2 py-1 rounded-pill fw-bold" style={{ fontSize: '12px' }}>
                                            <i className="fas fa-star me-1"></i>
                                            {gv.diemTrungBinh ? gv.diemTrungBinh.toFixed(1) : "5.0"}
                                        </div>
                                        <div className="instructor-img-wrap mx-auto mb-4 mt-2">
                                            {hasAvatar ? (
                                                <img src={avatarSrc} alt={hoTen} className="rounded-circle shadow-sm border border-4 border-white instructor-img" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="rounded-circle shadow-sm border border-4 border-white instructor-img d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px', background: bgColor, color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                                                    {initials}
                                                </div>
                                            )}
                                        </div>
                                        <h5 className="fw-bold text-dark">{hoTen}</h5>
                                        <p className="text-primary fw-bold small mb-2">{gv.chuyenMon}</p>
                                        <p className="text-muted small mb-3">{gv.tongKhoaHoc} Khóa học xuất bản</p>
                                        <button 
                                            className="btn btn-outline-primary rounded-pill px-4 py-2 mt-auto"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilterMaGV(gv.maGiangVien);
                                                setFilterTenGV(hoTen);
                                                setTimeout(() => {
                                                    const el = document.getElementById('courses-section');
                                                    if (el) {
                                                        const navbar = document.querySelector<HTMLElement>('.navbar.sticky-top');
                                                        const offset = navbar ? navbar.offsetHeight + 10 : 70;
                                                        window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
                                                    }
                                                }, 100);
                                            }}
                                        >
                                            <i className="fas fa-search me-2"></i>Xem khóa học
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {giangVienTieuBieu.length === 0 && (
                            <div className="col-12 text-center py-4">
                                <p className="text-secondary fs-5 mb-0">Chưa có giảng viên tiêu biểu.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 8. Reviews */}
            <section className="py-5 position-relative overflow-hidden bg-light border-top">
                <div className="container py-5 position-relative z-index-1">
                    <div className="text-center mb-5">
                        <h6 className="section-eyebrow mb-3">Đánh giá thực tế</h6>
                        <h2 className="display-6 fw-bold m-0 text-dark">Học viên nói gì về EduCode?</h2>
                    </div>

                    <div className="row g-4">
                        {(displayedReviews.length > 0 ? displayedReviews : []).map((review: any, i: number) => {
                            const hoTen = review.nguoiDung?.hoTen || 'Ẩn danh';
                            const initials = hoTen.split(' ').map((w: string) => w[0]).join('').slice(-2).toUpperCase();
                            const avatarColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
                            const bgColor = avatarColors[(review.maDanhGia || i) % avatarColors.length];
                            const avatarSrc = review.nguoiDung?.anhDaiDien;
                            const hasAvatar = avatarSrc && !avatarSrc.includes('default') && avatarSrc.startsWith('http');

                            return (
                                <div key={`review-${review.maDanhGia}-${i}`} className={`col-md-4 review-rotate-wrapper ${reviewFading ? 'review-exit' : 'review-enter'}`}
                                     style={{ animationDelay: `${i * 150}ms` }}>
                                    <div className="review-card p-4 rounded-4 h-100 d-flex flex-column position-relative bg-white" style={{
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                                    }}>
                                        {/* Quote icon */}
                                        <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '40px', opacity: 0.05, color: '#000', fontFamily: 'Georgia, serif' }}>"</div>

                                        {/* Stars */}
                                        <div className="mb-3" style={{ fontSize: '16px', letterSpacing: '2px' }}>
                                            {Array.from({ length: 5 }).map((_, s) => (
                                                <i key={s} className="fas fa-star" style={{ color: s < review.soSao ? '#fbbf24' : '#e5e7eb' }}></i>
                                            ))}
                                        </div>

                                        {/* Review content */}
                                        <p className="mb-3 flex-grow-1" style={{ color: '#4b5563', fontStyle: 'italic', lineHeight: '1.7', fontSize: '15px' }}>
                                            "{review.nhanXet}"
                                        </p>

                                        {/* Course info */}
                                        <div className="mb-3 p-2 rounded-3 bg-white border">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <i className="fas fa-book-open" style={{ color: '#3b82f6', fontSize: '12px' }}></i>
                                                <small style={{ color: '#1e40af', fontWeight: 500 }}>{review.khoaHoc?.tenKhoaHoc || 'Khóa học'}</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="fas fa-chalkboard-teacher" style={{ color: '#8b5cf6', fontSize: '12px' }}></i>
                                                <small style={{ color: '#5b21b6' }}>GV: {review.khoaHoc?.giangVien || 'Chưa rõ'}</small>
                                            </div>
                                        </div>

                                        {/* User info */}
                                        <div className="d-flex align-items-center gap-3 mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                            {hasAvatar ? (
                                                <img src={avatarSrc} alt={hoTen} className="rounded-circle shadow-sm" style={{ width: '44px', height: '44px', objectFit: 'cover', border: '2px solid #fff' }} />
                                            ) : (
                                                <div className="rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{
                                                    width: '44px', height: '44px', minWidth: '44px',
                                                    background: bgColor,
                                                    color: '#fff', fontWeight: 700, fontSize: '15px',
                                                    border: '2px solid #fff'
                                                }}>
                                                    {initials}
                                                </div>
                                            )}
                                            <div>
                                                <h6 className="fw-bold m-0 text-dark" style={{ fontSize: '14px' }}>{hoTen}</h6>
                                                <small className="text-muted" style={{ fontSize: '12px' }}>Học viên EduCode</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {danhGiaTrangChu.length === 0 && (
                            <div className="col-12 text-center py-4">
                                <p className="text-secondary fs-5 mb-0">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 9. CTA */}
            <section className="py-5 bg-primary">
                <div className="container py-4">
                    <div className="bg-white rounded-4 p-5 p-md-5 d-flex flex-column flex-md-row align-items-center justify-content-between shadow-lg position-relative overflow-hidden">
                        <div className="position-absolute" style={{ right: '-50px', top: '-50px', width: '250px', height: '250px', background: 'rgba(246, 144, 80, 0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
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
                    height: 640px;
                    display: flex;
                    align-items: center;
                    margin-top: 0;
                    overflow: hidden;
                    background: #0b1120;
                }
                .hero-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .hero-bg img {
                    width: 100%; height: 100%; object-fit: cover;
                    opacity: 0.5;
                    transform: scale(1.05);
                }
                .hero-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background:
                        linear-gradient(105deg, rgba(11, 17, 32, 0.97) 0%, rgba(17, 24, 39, 0.85) 42%, rgba(17, 24, 39, 0.35) 100%),
                        radial-gradient(circle at 78% 20%, rgba(246, 144, 80, 0.28), transparent 45%),
                        radial-gradient(circle at 90% 85%, rgba(139, 92, 246, 0.22), transparent 40%);
                }
                .hero-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    opacity: 0.55;
                    pointer-events: none;
                    z-index: 0;
                    animation: heroFloat 9s ease-in-out infinite;
                }
                .hero-orb--1 {
                    width: 340px; height: 340px;
                    right: 8%; top: 12%;
                    background: radial-gradient(circle, var(--primary), transparent 70%);
                }
                .hero-orb--2 {
                    width: 280px; height: 280px;
                    right: 26%; bottom: 6%;
                    background: radial-gradient(circle, var(--ai-accent), transparent 70%);
                    animation-delay: -4.5s;
                }
                @keyframes heroFloat {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-26px) translateX(14px); }
                }
                .hero-grid {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
                    background-size: 46px 46px;
                    mask-image: radial-gradient(ellipse 80% 60% at 60% 40%, #000 30%, transparent 75%);
                    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 60% 40%, #000 30%, transparent 75%);
                }
                .hero-title {
                    letter-spacing: -0.02em;
                    text-shadow: 0 2px 30px rgba(0,0,0,0.35);
                }
                .hero-badge {
                    padding: 0.45rem 1.15rem;
                    border-radius: 50rem;
                    background: rgba(246, 144, 80, 0.12);
                    color: var(--primary);
                    border: 1px solid rgba(246, 144, 80, 0.35);
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.25);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    font-weight: 700;
                }
                .hero-underline {
                    position: absolute;
                    width: 100%;
                    height: 12px;
                    bottom: -4px;
                    left: 0;
                    color: rgba(246, 144, 80, 0.4);
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
                    background: var(--primary);
                    border-color: var(--primary);
                    color: #fff;
                    box-shadow: 0 10px 24px rgba(246, 144, 80, 0.35);
                }
                .hero-cta-btn--primary:hover {
                    background: var(--primary-hover);
                    border-color: var(--primary-hover);
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
                    border-bottom: 1px solid var(--border-color);
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
                    border: 2px solid var(--border-color);
                    border-radius: 50rem;
                    height: 3.5rem;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .search-bar-modern:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
                .search-icon {
                    width: 3.5rem;
                    display: grid;
                    place-items: center;
                    color: var(--text-light);
                    font-size: 1.1rem;
                }
                .search-input {
                    flex: 1;
                    height: 100%;
                    border: none;
                    outline: none;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .search-input:focus-visible {
                    outline: 2px solid var(--primary);
                    outline-offset: 2px;
                }
                .search-input:focus-visible {
                    outline: 2px solid var(--primary);
                    outline-offset: -2px;
                }
                .clear-btn {
                    width: 3.5rem;
                    height: 100%;
                    background: none;
                    border: none;
                    color: var(--text-light);
                    cursor: pointer;
                    display: grid;
                    place-items: center;
                }
                .clear-btn:hover { color: var(--primary); }

                /* Stats — strip nổi đè lên đáy hero */
                .stats-section {
                    position: relative;
                    z-index: 2;
                    margin-top: -3.5rem;
                    padding-bottom: 1.5rem;
                }
                .stats-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    padding: 1.5rem 0.5rem;
                }
                .stat-item {
                    border-right: 1px solid var(--border-light);
                    padding: 0.5rem 1rem;
                    transition: transform var(--transition-fast);
                }
                .stat-item:last-child { border-right: none; }
                .stat-item:hover { transform: translateY(-3px); }
                .stat-icon {
                    width: 2.75rem; height: 2.75rem;
                    margin: 0 auto 0.6rem;
                    display: grid; place-items: center;
                    border-radius: var(--radius-md);
                    background: var(--primary-soft);
                    color: var(--primary-dark);
                    font-size: 1.1rem;
                }
                .stat-value {
                    font-size: 1.9rem;
                    font-weight: 800;
                    color: var(--text-dark);
                    line-height: 1.1;
                    letter-spacing: -0.01em;
                }
                .stat-label {
                    margin: 0.35rem 0 0;
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                @media (max-width: 768px) {
                    .stats-section { margin-top: -2rem; }
                    .stat-item:nth-child(odd) { border-right: 1px solid var(--border-light); }
                    .stat-item:nth-child(even) { border-right: none; }
                    .stat-item:nth-child(-n+2) { border-bottom: 1px solid var(--border-light); padding-bottom: 1.1rem; margin-bottom: 0.4rem; }
                }

                /* Feature Card */
                .feature-card {
                    position: relative;
                    transition: transform 0.35s cubic-bezier(.2,.7,.3,1), box-shadow 0.35s ease, border-color 0.35s ease;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg) !important;
                    overflow: hidden;
                }
                .feature-card::before {
                    content: "";
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--primary), var(--ai-accent));
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.4s ease;
                }
                .feature-card:hover {
                    transform: translateY(-10px);
                    border-color: transparent;
                    box-shadow: 0 24px 48px -12px rgba(17, 24, 39, 0.18) !important;
                }
                .feature-card:hover::before { transform: scaleX(1); }
                .icon-box {
                    width: 3.75rem; height: 3.75rem;
                    border-radius: var(--radius-md);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .feature-card:hover .icon-box {
                    transform: scale(1.08) rotate(-4deg);
                    box-shadow: 0 10px 22px -6px rgba(246, 144, 80, 0.45);
                }
                .feature-link { transition: gap 0.3s ease; }
                .feature-card:hover .feature-link { gap: 0.5rem; }

                /* Category Card */
                .category-card {
                    transition: transform 0.3s cubic-bezier(.2,.7,.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
                    border-radius: var(--radius-lg) !important;
                }
                .category-card:hover {
                    border-color: var(--primary) !important;
                    transform: translateY(-6px);
                    box-shadow: 0 16px 32px -12px rgba(246, 144, 80, 0.35);
                }
                .category-card:hover h5 { color: var(--primary) !important; }
                .icon-wrapper { transition: transform 0.3s ease; }
                .category-card:hover .icon-wrapper { transform: scale(1.12) translateY(-2px); }

                /* Course Card */
                .course-card { width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--border-light); border-radius: 1rem; overflow: hidden; box-shadow: 0 .125rem .5rem rgba(17,24,39,.06); transition: transform .3s ease, box-shadow .3s ease; }
                .course-card:hover { transform: translateY(-4px); box-shadow: 0 1rem 2rem rgba(17,24,39,.12); }
                .course-card-thumbnail { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: var(--bg-main); }
                .course-img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
                .course-card:hover .course-img { transform: scale(1.05); }
                .course-card-category { position: absolute; top: .75rem; left: .75rem; max-width: calc(100% - 1.5rem); padding: .4rem .65rem; border-radius: .45rem; background: rgba(17,24,39,.78); color: #fff; font-size: .65rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .course-card-body { display: flex; flex: 1; flex-direction: column; gap: .85rem; padding: 1.25rem; min-width: 0; }
                .course-card-rating { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--text-main); font-size: .75rem; font-weight: 700; }
                .course-level-badge { max-width: 70%; padding: .3rem .5rem; border-radius: .4rem; background: var(--primary-soft); color: var(--primary-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .course-rating-value { white-space: nowrap; }
                .course-rating-value i { color: var(--warning); }
                .course-card-title { display: -webkit-box; min-height: 3rem; margin: 0; overflow: hidden; color: var(--text-main); font-size: 1rem; font-weight: 700; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
                .course-skill-tags { display: flex; flex-wrap: wrap; gap: .375rem; min-height: 1.75rem; }
                .course-skill-tag { display: inline-flex; align-items: center; max-width: 100%; padding: .25rem .6rem; border: 1px solid rgba(246,144,80,.22); border-radius: 50rem; background: var(--primary-soft); color: var(--primary-dark); font-size: .72rem; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .course-skill-tag--more { border-color: var(--border-color); background: var(--border-light); color: var(--text-muted); }
                .course-skill-tag--empty { border-color: var(--border-color); background: var(--bg-main); color: var(--text-light); font-weight: 500; }
                .course-card-footer { display: flex; flex: 1; flex-direction: column; justify-content: flex-end; gap: .75rem; margin-top: auto; }
                .course-duration { color: var(--text-muted); font-size: .8rem; }
                .course-duration i { margin-right: .4rem; color: var(--primary); }
                .course-card-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
                .course-card-actions a { display: flex; min-height: 2.65rem; align-items: center; justify-content: center; border-radius: .65rem; font-size: .8rem; font-weight: 700; line-height: 1.2; padding: .55rem .5rem; text-align: center; text-decoration: none; white-space: nowrap; }
                .btn-course-detail { grid-column: 1 / -1; border: 1px solid var(--border-color); background: #fff; color: var(--text-main); }
                .btn-course-detail:hover { border-color: var(--text-light); background: var(--bg-main); color: var(--text-main); }
                .btn-course-trial { border: 1px solid var(--primary); background: #fff; color: var(--primary); }
                .btn-course-trial:hover { background: rgba(246,144,80,.08); color: var(--primary-hover); }
                .btn-course-buy { border: 1px solid var(--primary); background: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(246,144,80,.25); }
                .btn-course-buy:hover { border-color: var(--primary-hover); background: var(--primary-hover); color: #fff; }
                .btn-course-buy--full, .btn-course-continue { grid-column: 1 / -1; }
                .btn-course-continue { border: 1px solid #059669; background: #059669; color: #fff; }
                .btn-course-continue:hover { border-color: #047857; background: #047857; color: #fff; }
                @media (prefers-reduced-motion: reduce) { .course-card, .course-img { transition: none; } .course-card:hover { transform: none; } .course-card:hover .course-img { transform: none; } }

                /* Instructor Card */
                .instructor-card {
                    border-radius: var(--radius-lg) !important;
                    transition: transform 0.35s cubic-bezier(.2,.7,.3,1), box-shadow 0.35s ease, background 0.35s ease;
                }
                .instructor-card:hover {
                    transform: translateY(-10px);
                    background: #fff !important;
                    box-shadow: 0 24px 48px -12px rgba(17, 24, 39, 0.18);
                }
                .instructor-img { transition: transform 0.3s ease; }
                .instructor-card:hover .instructor-img { transform: scale(1.08); }
                .social-icon { width: 38px; height: 38px; transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease; text-decoration: none; }
                .social-icon:hover { background: var(--primary) !important; color: #fff !important; transform: translateY(-2px); }

                .hover-primary:hover { color: var(--primary) !important; }

                /* Section eyebrow — pill badge */
                .section-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.95rem;
                    border-radius: 50rem;
                    background: var(--primary-soft);
                    color: var(--primary-dark);
                    border: 1px solid rgba(246, 144, 80, 0.25);
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .section-eyebrow::before {
                    content: '';
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: var(--primary);
                }
                /* Trên nền tối (section reviews) */
                .bg-dark .section-eyebrow {
                    background: rgba(246, 144, 80, 0.14);
                    color: var(--primary);
                    border-color: rgba(246, 144, 80, 0.35);
                }

                /* Colors */
                .bg-primary-subtle { background-color: var(--primary-soft) !important; }
                .text-primary { color: var(--primary) !important; }

                /* Button specific sizing */
                .hero-btn {
                    width: 250px !important;
                    height: 56px !important;
                    font-size: 1.1rem !important;
                }

                /* Course Skeleton (loading) */
                .course-skeleton-thumb {
                    height: 200px;
                    width: 100%;
                }
                .course-skeleton-line {
                    display: block;
                    height: 0.85rem;
                    border-radius: var(--radius-sm);
                }
                .course-skeleton-pill {
                    display: inline-block;
                    height: 1.35rem;
                    width: 4.5rem;
                    border-radius: 50rem;
                }
                .course-skeleton-btn {
                    display: block;
                    height: 42px;
                    width: 100%;
                    border-radius: var(--radius-md);
                }
                .skeleton-shimmer {
                    background: linear-gradient(
                        90deg,
                        var(--border-light) 25%,
                        var(--border-color) 37%,
                        var(--border-light) 63%
                    );
                    background-size: 400% 100%;
                    animation: skeleton-loading 1.4s ease infinite;
                }
                @keyframes skeleton-loading {
                    0% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .skeleton-shimmer { animation: none; }
                    .hero-orb { animation: none; }
                    .hero-cta-btn,
                    .feature-card,
                    .course-card,
                    .course-img,
                    .category-card,
                    .instructor-card,
                    .instructor-img,
                    .icon-box,
                    .icon-wrapper,
                    .social-icon,
                    .feature-link {
                        transition: none !important;
                    }
                    .feature-card:hover,
                    .course-card:hover,
                    .category-card:hover,
                    .instructor-card:hover,
                    .hero-cta-btn:hover {
                        transform: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default TrangChu;
