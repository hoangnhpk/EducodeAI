import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/configs/axios';
import EduBanner from "./components/EduBanner";
import { encodeId } from "@/utils/id-helper";
import { ChatBot } from '@/pages/hoc-vien/tro-ly-hoi-dap-ai/TroLyAI';
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
}

const TrangChu: React.FC = () => {
    const [courses, setCourses] = useState<IKhoaHoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>(''); // Thêm state tìm kiếm

    // 1. Hàm gọi API - Giữ nguyên logic bóc tách dữ liệu đang chạy của bạn
    const loadData = async (search: string = '') => {
        setIsLoading(true);
        try {
            // Sử dụng params để gửi từ khóa tìm kiếm lên Backend
            const data = await axiosInstance.get<IKhoaHoc[]>('/api/KhoaHoc/all', {
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

    // 2. Tự động tìm kiếm khi searchTerm thay đổi (Debounce 500ms để tránh lag)
    useEffect(() => {
        const delay = setTimeout(() => {
            loadData(searchTerm);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    return (
        <>
            <EduBanner />

            {/* THANH TÌM KIẾM MỚI */}
            <div className="container-fluid bg-white py-4 shadow-sm sticky-top" style={{ top: '0', zIndex: 100 }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="input-group overflow-hidden rounded-pill border border-2 border-primary">
                                <span className="input-group-text bg-white border-0 ps-4">
                                    <i className="fa fa-search text-primary"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 py-3 ps-2 shadow-none"
                                    placeholder="Bạn muốn học gì hôm nay? (VD: Java, Python...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn bg-white border-0 text-muted pe-3"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="fa fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORIES - Cập nhật: Click vào category sẽ tự tìm kiếm */}
            <div className="container-xxl py-5 category">
                <div className="container">
                    <div className="text-center">
                        <h6 className="section-title bg-white text-center px-3">Danh mục</h6>
                        <h1 className="mb-5" style={{ color: '#fb873f' }}>Chủ đề phổ biến</h1>
                    </div>
                    <div className="row g-2 m-2">
                        {["C#", "AWS", "Python", "Java", "Web Design", "Web Development", "MySQL", "UI/UX Design"].map((cat, index) => (
                            <div key={index} className="col-lg-3 col-md-6 text-center" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm(cat)}>
                                <div className="content shadow p-3 mb-2 bg-white rounded transition-hover">
                                    <img src={`img/cat${index + 1}.png`} className="img-fluid" alt={cat} />
                                    <h5 className="my-2">{cat}</h5>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DANH SÁCH KHÓA HỌC */}
            <div className="container-xxl py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <h6 className="section-title bg-light text-center px-3" style={{ color: '#fb873f', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            Hành trình tri thức
                        </h6>
                        <h1 className="display-5 mb-3 fw-bold">
                            {searchTerm ? `Kết quả cho: "${searchTerm}"` : "Khám Phá Các Khóa Học"}
                        </h1>
                    </div>

                    <div className="row g-4">
                        {isLoading ? (
                            <div className="text-center w-100 py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Đang tải khoá học...</p>
                            </div>
                        ) : courses.length > 0 ? (
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
                                                <Link to={`/khoa-hoc/${kh.slug}/${encodeId(kh.maKhoaHoc)}`} className="btn btn-sm btn-primary px-3 rounded-pill">Chi tiết</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center w-100 py-5">
                                <h4 className="text-muted">Không tìm thấy khóa học nào phù hợp!</h4>
                                <button className="btn btn-outline-primary mt-3" onClick={() => setSearchTerm('')}>Xóa bộ lọc</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* <ChatBot /> */}
            <style>{`
                .transition-hover { transition: all 0.3s ease; }
                .transition-hover:hover { transform: translateY(-10px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
                .image-zoom { transition: transform 0.5s ease; }
                .image-zoom:hover { transform: scale(1.1); }
                .bg-dark-gradient { background: linear-gradient(45deg, #181d38, #2c3e50); color: #fff; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </>
    );
};

export default TrangChu;