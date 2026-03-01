import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const EduBanner: React.FC = () => {
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
    }, []);

    return (
        <section className="edu-banner-section">
            <div className="edu-slider-wrapper owl-carousel">
                {/* Slide 1 */}
                <div className="edu-slide-item">
                    <img src="/img/carousel-1.jpg" alt="Banner" className="edu-bg-img" />
                    <div className="edu-overlay">
                        <div className="container">
                            <div className="edu-content-box">
                                <h5 className="edu-subtitle animated slideInDown">KHỞI ĐẦU TƯƠNG LAI</h5>
                                <h1 className="edu-title animated slideInDown">Học Lập Trình <br/> <span>Dễ Dàng & Hiệu Quả</span></h1>
                                <p className="edu-text animated fadeInUp">Lộ trình bài bản từ con số 0 đến khi có việc làm.</p>
                                
                                {/* ÉP HIỂN THỊ NÚT BẰNG CLASS BOOTSTRAP KẾT HỢP CUSTOM */}
                                <div className="edu-btns animated fadeInUp">
                                    <Link to="/courses" className="btn btn-primary py-md-3 px-md-5 me-3 custom-btn-primary">
                                        Khám phá ngay
                                    </Link>
                                    <Link to="/about" className="btn btn-light py-md-3 px-md-5 custom-btn-light">
                                        Xem thêm
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* 1. Sửa lỗi dàn hàng ngang của Carousel */
                .edu-slider-wrapper.owl-carousel .owl-stage { display: flex !important; }
                .edu-slide-item { position: relative; height: 650px; width: 100%; overflow: hidden; }
                .edu-bg-img { width: 100%; height: 100%; object-fit: cover; }

                /* 2. Overlay phải có z-index thấp hơn nội dung */
                .edu-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 43, 0.7); /* Màu tối để nổi bật chữ */
                    display: flex; align-items: center; z-index: 1;
                }

                /* 3. Nội dung và Nút bấm phải có z-index cao hơn */
                .edu-content-box { position: relative; z-index: 10; color: #ffffff !important; }
                .edu-subtitle { color: #fb873f !important; font-weight: 700; letter-spacing: 2px; }
                .edu-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; color: #fff; }
                .edu-title span { color: #fb873f; }

                /* 4. Định nghĩa lại nút bấm nếu Bootstrap không nhận */
                .custom-btn-primary {
                    background-color: #fb873f !important;
                    border-color: #fb873f !important;
                    color: #fff !important;
                    font-weight: 600;
                    border-radius: 4px;
                    display: inline-block !important; /* Ép hiển thị */
                    visibility: visible !important;
                }
                .custom-btn-light {
                    background-color: #ffffff !important;
                    color: #181d38 !important;
                    font-weight: 600;
                    border-radius: 4px;
                    display: inline-block !important;
                    visibility: visible !important;
                }
                
                /* Đảm bảo div chứa nút không bị ẩn */
                .edu-btns { 
                    display: block !important; 
                    margin-top: 30px;
                    position: relative;
                    z-index: 20;
                }
                
                /* Fix cho Owl Nav (Mũi tên) */
                .owl-nav { position: absolute; top: 50%; width: 100%; z-index: 25; pointer-events: none; }
                .custom-nav { pointer-events: all; background: #fb873f; color: #fff; padding: 10px 15px; border-radius: 50%; }
            `}</style>
        </section>
    );
};

export default EduBanner;