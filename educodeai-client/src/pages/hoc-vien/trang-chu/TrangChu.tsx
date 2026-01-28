import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/configs/axios';
import EduBanner from "./components/EduBanner";
// Định nghĩa Interface chuẩn theo dữ liệu từ API
interface IKhoaHoc {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    hinhAnh: string;
    linhVuc: string;
    diemDanhGiaTB: number;
    thoiLuongGio: number;
    trinhDo: string;
    kyNangChinh: string;
}

const TrangChu: React.FC = () => {
    const [courses, setCourses] = useState<IKhoaHoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 1. Gọi API lấy dữ liệu khóa học
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await axiosInstance.get<IKhoaHoc[]>('/KhoaHoc/all');
                setCourses(data);
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <>
            {/* Banner Section - Owl Carousel */}
            <EduBanner />

            {/* --- PHẦN CATEGORIES THÊM VÀO ĐÂY --- */}
            <div className="container-xxl py-5 category">
                <div className="container">
                    <div className="text-center">
                        <h6 className="section-title bg-white text-center px-3">Danh mục</h6>
                        <h1 className="mb-5" style={{ color: '#fb873f' }}>Chủ đề phổ biến để khám phá</h1>
                    </div>
                    <div className="row g-2 m-2">
                        {/* Item 1 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat1.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">Microsoft Excel</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat2.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">AWS</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat3.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">Python</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 4 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat4.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">Java</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 5 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat5.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">Web Design</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 6 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat6.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">Web Development</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 7 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat7.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">MySQL</a>
                                </h5>
                            </div>
                        </div>
                        {/* Item 8 */}
                        <div className="col-lg-3 col-md-6 text-center">
                            <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                <img src="img/cat8.png" className="img-fluid" alt="categories" />
                                <h5 className="my-2">
                                    <a href="#" className="text-center text-decoration-none">UI/UX Design</a>
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* --- KẾT THÚC PHẦN CATEGORIES --- */}

            {/* Courses Section */}
            <div className="container-xxl py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <h6 className="section-title bg-light text-center px-3" style={{ color: '#fb873f', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            Hành trình tri thức
                        </h6>
                        <h1 className="display-5 mb-3 fw-bold">Khám Phá Các Khóa Học</h1>
                    </div>
                    <div className="row g-4">
                        {isLoading ? (
                            <div className="text-center w-100 py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Đang kết nối SQL Server...</p>
                            </div>
                        ) : (
                            courses.length > 0 ? (
                                courses.map((kh) => (
                                    <div key={kh.maKhoaHoc} className="col-lg-3 col-md-6">
                                        <div className="course-item shadow-sm border-0 rounded-4 overflow-hidden bg-white h-100 transition-hover">
                                            <div className="position-relative overflow-hidden">
                                                <img className="img-fluid w-100 image-zoom"
                                                    src={`/img/${kh.hinhAnh}`}
                                                    alt={kh.tenKhoaHoc}
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                    onError={(e) => (e.currentTarget.src = '/img/default.jpg')} />
                                                <div className="position-absolute top-0 start-0 m-3">
                                                    <span className="badge bg-dark-gradient px-3 py-2" style={{ borderRadius: '50px' }}>
                                                        {kh.linhVuc}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-primary fw-bold"><i className="fa fa-layer-group me-1"></i>{kh.trinhDo}</small>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fa fa-star text-warning me-1 small"></i>
                                                        <small className="fw-bold text-muted">{kh.diemDanhGiaTB}</small>
                                                    </div>
                                                </div>
                                                <h5 className="mb-3 text-dark fw-bold line-clamp-2" style={{ height: '3rem' }}>{kh.tenKhoaHoc}</h5>
                                                <p className="small text-muted text-truncate mb-3 bg-light p-2 rounded">
                                                    <i className="fa fa-code me-2"></i>{kh.kyNangChinh || "Đang cập nhật..."}
                                                </p>
                                                <div className="d-flex justify-content-between border-top pt-3 align-items-center">
                                                    <small className="text-muted"><i className="fa fa-clock text-primary me-2"></i>{kh.thoiLuongGio} giờ</small>
                                                    <Link to={`/course/${kh.maKhoaHoc}`} className="btn btn-sm btn-primary px-3 rounded-pill">Chi tiết</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center w-100">Không có dữ liệu.</div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Bổ sung CSS */}
            <style>{`
                .header-carousel .owl-nav {
                    position: absolute;
                    width: 100%;
                    height: 40px;
                    top: 50%;
                    left: 0;
                    padding: 0 30px;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    z-index: 10;
                    pointer-events: none;
                }
                .header-carousel .owl-nav button {
                    pointer-events: all;
                    width: 45px;
                    height: 45px;
                    background: rgba(251, 135, 63, 0.7) !important;
                    color: #fff !important;
                    border-radius: 50% !important;
                    font-size: 1.2rem !important;
                    transition: 0.3s;
                }
                .header-carousel .owl-nav button:hover {
                    background: #fb873f !important;
                }
                .transition-hover:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
                }
                .image-zoom:hover { transform: scale(1.1); }
                .bg-dark-gradient { background: linear-gradient(45deg, #181d38, #2c3e50); color: #fff; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .content img {
                    max-height: 80px;
                    margin-bottom: 15px;
                }
            `}</style>
        </>
    );
};

export default TrangChu;