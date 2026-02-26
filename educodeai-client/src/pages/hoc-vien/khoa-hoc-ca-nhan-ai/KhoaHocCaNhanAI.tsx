import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiRoadmapService } from '@/services/aiRoadmap.service';
import type { LoTrinhAICuaToiDTO } from './LoTrinhAICuaToiDTO';
import './KhoaHocCaNhanAI.css';
import { encodeId } from '@/utils/id-helper';

const KhoaHocCaNhanAI = () => {
    const [roadmaps, setRoadmaps] = useState<LoTrinhAICuaToiDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Hardcode userId = 3 như backend đang test, hoặc lấy từ token
                const data = await aiRoadmapService.getAllLoTrinh();
                setRoadmaps(data);
            } catch (error) {
                console.error("Lỗi khi tải lộ trình:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="khoa-hoc-ca-nhan-ai-page">
            {/* Roadmap Rail Start */}
            <div className="container-xxl py-5 pt-0">
                <div className="container">
                    <div className="roadmap-wrapper text-center">
                        <p className="roadmap-eyebrow">Lộ trình học tập được cá nhân hóa bởi AI</p>
                        <div className="roadmap-heading">
                            <h2 className="display-6 mb-1">Danh sách lộ trình phát triển</h2>
                            <span>
                                Được xây dựng dựa trên mục tiêu nghề nghiệp, trình độ hiện tại và thời gian học của bạn —
                                từng bước đi từ nền tảng cơ bản đến kỹ năng nâng cao.
                            </span>
                        </div>

                        <div className="roadmap-grid">
                            {roadmaps.length > 0 ? (
                                roadmaps.map((item) => (
                                    <div key={item.maLoTrinh} className="roadmap-card roadmap-card-primary text-start">
                                        <div>
                                            <h3>{item.tenLoTrinh}</h3>
                                            <p className="roadmap-path mb-0">
                                                {/* Hiển thị số giai đoạn thay vì text cứng */}
                                                Tổng {item.tongSoGiaiDoan} Giai đoạn
                                            </p>
                                            <small className="text-muted mt-2 d-block" style={{ fontSize: '0.9em' }}>
                                                {item.moTaChung}
                                            </small>
                                        </div>
                                        
                                        <div className="mt-auto">
                                            <div className="progress-meta">
                                                <span>
                                                    Hoàn thành: {item.soGiaiDoanHoanThanh}/{item.tongSoGiaiDoan} Giai đoạn
                                                </span>
                                                <strong>{item.phanTramHoanThanh}%</strong>
                                            </div>
                                            <div className="progress-track">
                                                <div 
                                                    className="progress-bar-custom" 
                                                    style={{ width: `${item.phanTramHoanThanh}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            {/* Link đến trang chi tiết mà ông sắp làm */}
                                            <Link 
                                                to={`/chi-tiet-lo-trinh/${encodeId(item.maLoTrinh)}`} 
                                                className="btn btn-primary px-4 roadmap-cta"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="alert alert-info">
                                        Bạn chưa có lộ trình nào. Hãy tạo mới ngay!
                                    </div>
                                    <Link to="/yeu-cau-lo-trinh-ai" className="btn btn-primary py-3 px-5">
                                        Tạo lộ trình AI mới
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Roadmap Rail End */}

            {/* CTA Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-8">
                            <div className="bg-light p-4 rounded shadow-sm">
                                <h3 className="mb-3">Cần điều chỉnh lộ trình theo mục tiêu riêng?</h3>
                                <p className="mb-0 text-muted">
                                    Gửi yêu cầu tại trang <Link to="/yeu-cau-lo-trinh-ai" className='text-decoration-none'>Lộ trình AI</Link> để 
                                    đội ngũ EDUCODE-AI thiết kế kế hoạch học cá nhân hóa.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/yeu-cau-lo-trinh-ai" className="btn btn-primary py-3 px-5">Trao đổi với AI</Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* CTA End */}
        </div>
    );
};

export default KhoaHocCaNhanAI;