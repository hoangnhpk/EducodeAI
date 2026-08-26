import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiRoadmapService } from '../../../services/aiRoadmap.service';
import type { LoTrinhAICuaToiDTO, ChiTietGiaiDoanDTO } from './LoTrinhAICuaToiDTO';
import './ChiTietLoTrinhAI.css';
import { decodeId } from '@/utils/id-helper';
import { encodeId } from '@/utils/id-helper';

const ChiTietLoTrinhAI = () => {
    const { id } = useParams<{ id: string }>();
    const realId = decodeId(id || '');
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState<LoTrinhAICuaToiDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleNavigateToCourse = (kh: any) => {
        const safeSlug = kh.slug || 'khoa-hoc';
        navigate(`/khoa-hoc/${safeSlug}/${encodeId(kh.maKhoaHoc)}`);
    };

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

    const getStageLabel = (stageIndex: number, totalStages: number) => {
        if (stageIndex === 1) return 'Bắt đầu';
        if (stageIndex === totalStages) return 'Hoàn thiện';
        return 'Đang học';
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
        <main className="roadmap-detail-container">
            <div className="roadmap-detail-card">
                <button type="button" onClick={() => navigate(-1)} className="back-link">
                    <i className="fas fa-arrow-left" aria-hidden="true"></i>
                    Quay lại danh sách lộ trình
                </button>

                <header className="roadmap-detail-header">
                    <div className="roadmap-header">
                        <p className="roadmap-eyebrow">Lộ trình học tập cá nhân hóa</p>
                        <h1>Chi tiết {roadmap.tenLoTrinh}</h1>
                        <p>{roadmap.moTaChung}</p>
                    </div>
                </header>

                <section className="roadmap-overview-bar" aria-label="Tổng quan lộ trình">
                    <div className="overview-progress">
                        <div className="overview-progress-heading">
                            <span>Tiến độ tổng thể</span>
                            <strong>{roadmap.phanTramHoanThanh}%</strong>
                        </div>
                        <div className="progress-track-custom" role="progressbar" aria-valuenow={roadmap.phanTramHoanThanh} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${roadmap.phanTramHoanThanh}%`}>
                            <div className="progress-bar-custom" style={{ width: `${roadmap.phanTramHoanThanh}%` }}></div>
                        </div>
                        <span className="overview-progress-caption">{roadmap.soGiaiDoanHoanThanh}/{roadmap.tongSoGiaiDoan} giai đoạn đã hoàn thành</span>
                    </div>
                    <div className="overview-stat">
                        <i className="fas fa-layer-group" aria-hidden="true"></i>
                        <span>Giai đoạn</span>
                        <strong>{roadmap.tongSoGiaiDoan}</strong>
                    </div>
                    <div className="overview-stat">
                        <i className="fas fa-clock" aria-hidden="true"></i>
                        <span>Thời gian học</span>
                        <strong>{roadmap.tongThoiGianTuan} tuần</strong>
                    </div>
                </section>

                <section className="roadmap-timeline" aria-label="Các giai đoạn học tập">
                    {roadmap.giaiDoan?.map((gd: ChiTietGiaiDoanDTO, index: number) => (
                        <article key={gd.giaiDoan} className="stage-card" data-stage={gd.giaiDoan} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="stage-card-header">
                                <span className="stage-badge">Giai đoạn {gd.giaiDoan} <span aria-hidden="true">•</span> {getStageLabel(gd.giaiDoan, roadmap.tongSoGiaiDoan)}</span>
                                <span className={`stage-status-badge ${gd.hoanThanh ? 'is-complete' : ''}`}>
                                    <i className={`fas ${gd.hoanThanh ? 'fa-check' : 'fa-hourglass-half'}`} aria-hidden="true"></i>
                                    {gd.hoanThanh ? 'Hoàn thành' : 'Đang thực hiện'}
                                </span>
                            </div>

                            <h2>{gd.mucTieu}</h2>
                            <div className="stage-desc">
                                <strong>Mục tiêu chính</strong>
                                <span>{gd.mucTieu}. Hoàn thành các khóa học bên dưới để vượt qua giai đoạn này.</span>
                            </div>

                            <div className="stage-courses">
                                {gd.danhSachKhoaHoc && gd.danhSachKhoaHoc.length > 0 ? (
                                    gd.danhSachKhoaHoc.map((kh) => (
                                        <button type="button" key={kh.maKhoaHoc} className="course-item" onClick={() => handleNavigateToCourse(kh)}>
                                            <span className="course-item-icon"><i className="fas fa-book-open" aria-hidden="true"></i></span>
                                            <span className="course-item-content">
                                                <strong>{kh.tenKhoaHoc}</strong>
                                                <small>{kh.noiDungChinh}</small>
                                                <span className="course-item-meta"><i className="fas fa-arrow-right" aria-hidden="true"></i> Xem chi tiết khóa học</span>
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="course-item course-item-placeholder">
                                        <span className="course-item-icon"><i className="fas fa-hourglass-half" aria-hidden="true"></i></span>
                                        <span className="course-item-content">
                                            <strong>Khóa học đang cập nhật...</strong>
                                            <small>Dữ liệu chi tiết khóa học cần được map từ Backend.</small>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="stage-stats">
                                <div className="stat-item"><i className="fas fa-book" aria-hidden="true"></i><span>{gd.tongKhoaHoc} khóa học</span></div>
                                <div className="stat-item"><i className="fas fa-check-circle" aria-hidden="true"></i><span>Đã xong: {gd.khoaHocHoanThanh}</span></div>
                                <div className="stat-item"><i className="fas fa-chart-line" aria-hidden="true"></i><span>Tiến độ: {gd.phanTram}%</span></div>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
};

export default ChiTietLoTrinhAI;
