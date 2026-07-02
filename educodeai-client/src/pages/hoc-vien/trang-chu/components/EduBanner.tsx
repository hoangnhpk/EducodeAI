import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
// 1. Import hook từ Context toàn cục
import { useSystemConfig } from '../../../../contexts/SystemConfigContext';

const EduBanner: React.FC = () => {
    // 2. Lấy dữ liệu configs (chứa BannerChinh) từ Kho chứa
    const { configs } = useSystemConfig();

    useEffect(() => {
        const $ = (window as any).jQuery || (window as any).$;
        if ($ && typeof $.fn.owlCarousel === 'function') {
            const timer = setTimeout(() => {
                const $carousel = $('.edu-slider-wrapper');
                $carousel.trigger('destroy.owl.carousel');
                $carousel.owlCarousel({
                    items: 1,
                    loop: true,
                    autoplay: true,
                    autoplayTimeout: 5000,
                    animateOut: 'fadeOut',
                    nav: true,
                    dots: true,
                    navText: [
                        '<span class="custom-nav"><i class="fa fa-angle-left"></i></span>',
                        '<span class="custom-nav"><i class="fa fa-angle-right"></i></span>'
                    ],
                });
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [configs]); // 3. Re-init carousel khi ảnh banner thay đổi

    return (
        <section className="edu-banner-section">
            <div className="edu-slider-wrapper owl-carousel">
                <div className="edu-slide-item">
                    {/* 4. Thay đổi src ảnh thành ảnh từ configs */}
                    <img
                        src={configs?.BannerChinh ? `/img/${configs.BannerChinh}` : "/img/carousel-1.jpg"}
                        alt="Banner"
                        className="edu-bg-img"
                        onError={(e) => { e.currentTarget.src = "/img/carousel-1.jpg"; }}
                    />
                    <div className="edu-overlay">
                        <div className="container">
                            <div className="edu-content-box">
                                <h5 className="edu-subtitle animated slideInDown">KHỞI ĐẦU TƯƠNG LAI</h5>
                                <h1 className="edu-title animated slideInDown">Học Lập Trình <br /> <span>Dễ Dàng & Hiệu Quả</span></h1>
                                <p className="edu-text animated fadeInUp">Lộ trình bài bản từ con số 0 đến khi có việc làm.</p>

                                <div className="edu-btns-container animated fadeInUp">
                                    <Link to="/kham-pha-lo-trinh" className="edu-btn-main btn-orange">
                                        Khám phá ngay
                                    </Link>
                                    <Link to="/about" className="edu-btn-main btn-white">
                                        Xem thêm
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .edu-slide-item { position: relative; height: 650px; width: 100%; overflow: hidden; }
                .edu-bg-img { width: 100%; height: 100%; object-fit: cover; }
                .edu-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 43, 0.6);
                    display: flex; align-items: center; z-index: 1;
                }
                .edu-content-box { position: relative; z-index: 10; color: #ffffff; }
                .edu-subtitle { color: #fb873f !important; font-weight: 700; letter-spacing: 2px; }
                .edu-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; }
                .edu-title span { color: #fb873f; }

                .edu-btns-container {
                    display: flex !important;
                    align-items: center;
                    gap: 15px;
                    margin-top: 30px;
                    width: fit-content;
                }
                .edu-btn-main {
                    min-width: 180px !important;
                    width: fit-content !important;
                    flex: 0 0 auto !important;
                    height: 52px;
                    display: inline-flex !important;
                    align-items: center;
                    justify-content: center;
                    padding: 0 30px;
                    font-weight: 600;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    text-decoration: none !important;
                    white-space: nowrap;
                }
                .btn-orange {
                    background-color: #fb873f !important;
                    color: white !important;
                }
                .btn-orange:hover {
                    background-color: #e6762c !important;
                    transform: translateY(-3px);
                }
                .btn-white {
                    background-color: white !important;
                    color: #1e293b !important;
                }
                .btn-white:hover {
                    background-color: #f8fafc !important;
                    transform: translateY(-3px);
                }
                
                .custom-nav { background: #fb873f; color: #fff; padding: 10px 15px; border-radius: 50%; }
            `}</style>
        </section>
    );
};

export default EduBanner;
