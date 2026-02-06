import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiRoadmapService } from '../../../services/aiRoadmap.service';
import type { LoTrinhAICuaToiDTO, ChiTietGiaiDoanDTO } from './LoTrinhAICuaToiDTO';
import './ChiTietLoTrinhAI.css';
import { decodeId } from '@/utils/id-helper';

const ChiTietLoTrinhAI = () => {
    const { id } = useParams<{ id: string }>();
    const realId = decodeId(id || '');
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState<LoTrinhAICuaToiDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!realId) return;
        const fetchData = async () => {
            try {
                const data = await aiRoadmapService.getChiTietLoTrinh(realId);
                setRoadmap(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết lộ trình:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getStageBadgeClass = (stageIndex: number, totalStages: number) => {
        if (stageIndex === 1) return 'beginner';
        if (stageIndex === totalStages) return 'advanced';
        return 'intermediate';
    };

    const getStageLabel = (stageIndex: number, totalStages: number) => {
        if (stageIndex === 1) return 'Beginner';
        if (stageIndex === totalStages) return 'Advanced';
        return 'Intermediate';
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!roadmap) {
        return <div className="text-center mt-5">Không tìm thấy lộ trình.</div>;
    }

    return (
        <div className="roadmap-detail-container">
            <div className="roadmap-detail-card">
                {/* Back Link */}
                <div onClick={() => navigate(-1)} className="back-link">
                    <i className="fas fa-arrow-left"></i>
                    Quay lại danh sách lộ trình
                </div>

                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <div className="roadmap-header">
                        <h2>Chi tiết {roadmap.tenLoTrinh}</h2>
                        <p>{roadmap.moTaChung}</p>
                    </div>
                    <div className="mt-3 mt-md-0">
                        <div className="mb-2 text-end">
                            <strong>Tiến độ tổng thể</strong>
                        </div>
                        <div className="progress-track-custom mb-2">
                            <div 
                                className="progress-bar-custom" 
                                style={{ width: `${roadmap.phanTramHoanThanh}%` }}
                            ></div>
                        </div>
                        <div className="progress-meta">
                            <span className="text-muted">{roadmap.phanTramHoanThanh}% hoàn thành</span>
                            <span className="text-muted fw-bold text-primary">
                                {roadmap.soGiaiDoanHoanThanh}/{roadmap.tongSoGiaiDoan} Giai đoạn
                            </span>
                        </div>
                        <div className="timeline-summary-card" aria-label="Tổng thời gian học">
                            <span className="summary-label">Tổng thời gian học</span>
                            <strong className="summary-value">{roadmap.tongThoiGianTuan} tuần</strong>
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="roadmap-timeline">
                    {roadmap.giaiDoan?.map((gd: ChiTietGiaiDoanDTO, index: number) => (
                        <div 
                            key={gd.giaiDoan} 
                            className="stage-card" 
                            data-stage={gd.giaiDoan}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <span className={`stage-badge ${getStageBadgeClass(gd.giaiDoan, roadmap.tongSoGiaiDoan)}`}>
                                Giai đoạn {gd.giaiDoan} • {getStageLabel(gd.giaiDoan, roadmap.tongSoGiaiDoan)}
                            </span>
                            
                            {/* Trạng thái giai đoạn */}
                            <div className="float-end">
                                {gd.hoanThanh ? (
                                    <span className="badge bg-success"><i className="fas fa-check me-1"></i> Hoàn thành</span>
                                ) : (
                                    <span className="badge bg-light text-dark border">Đang thực hiện</span>
                                )}
                            </div>

                            <h4>{gd.mucTieu}</h4> {/* Tạm dùng Mục tiêu làm tiêu đề giai đoạn */}

                            <div className="stage-desc">
                                Mục tiêu chính: {gd.mucTieu}. Hoàn thành các khóa học bên dưới để vượt qua giai đoạn này.
                            </div>

                            <div className="stage-courses">
                                {gd.danhSachKhoaHoc && gd.danhSachKhoaHoc.length > 0 ? (
                                    gd.danhSachKhoaHoc.map((kh) => (
                                        <div key={kh.maKhoaHoc} className={`course-item`}>
                                            <h6>{kh.tenKhoaHoc}</h6>
                                            <small>{kh.noiDungChinh}</small>
                                        </div>
                                    ))
                                ) : (
                                    // Placeholder khi chưa có dữ liệu chi tiết khóa học từ BE
                                    <>
                                        <div className="course-item">
                                            <h6>Khóa học đang cập nhật...</h6>
                                            <small>Dữ liệu chi tiết khóa học cần được map từ Backend.</small>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="stage-stats">
                                <div className="stat-item">
                                    <i className="fas fa-book"></i>
                                    <span>{gd.tongKhoaHoc} khóa học</span>
                                </div>
                                <div className="stat-item">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Đã xong: {gd.khoaHocHoanThanh}</span>
                                </div>
                                <div className="stat-item">
                                    <i className="fas fa-chart-line"></i>
                                    <span>Tiến độ: {gd.phanTram}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChiTietLoTrinhAI;
