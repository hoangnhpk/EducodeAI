import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiRoadmapService } from '@/services/aiRoadmap.service';
import type { LoTrinhAICuaToiDTO } from './LoTrinhAICuaToiDTO';
import './KhoaHocCaNhanAI.css';
import { encodeId } from '@/utils/id-helper';

const KhoaHocCaNhanAI = () => {
    const [roadmaps, setRoadmaps] = useState<LoTrinhAICuaToiDTO[]>([]);
    const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]); // Mới: Danh sách lộ trình đã lưu
    const [loading, setLoading] = useState<boolean>(true);

    // ==========================================
    // BỘ LỌC XỬ LÝ DỮ LIỆU AI (ĐỒNG BỘ TOÀN HỆ THỐNG)
    // ==========================================
    const getCleanContent = (text: string) => {
        const fallback = { title: "Lộ trình học tập", steps: [] };
        if (!text) return fallback;
        try {
            let raw = text;
            try { raw = JSON.parse(`"${text.replace(/"/g, '\\"')}"`); } catch { raw = text; }

            let jsonData: any = null;
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                for (let i = lastBrace; i > firstBrace; i--) {
                    if (raw[i] === '}') {
                        try { jsonData = JSON.parse(raw.substring(firstBrace, i + 1)); break; } catch { continue; }
                    }
                }
            }
            if (jsonData) {
                const rawSteps = jsonData.loTrinh || jsonData.cacChangHoc || jsonData.steps || [];
                return { title: jsonData.tenLoTrinh || jsonData.tieuDe || "Lộ trình AI", steps: rawSteps };
            }
            return fallback;
        } catch { return fallback; }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy lộ trình cá nhân (do AI tạo riêng)
                const data = await aiRoadmapService.getAllLoTrinh();
                setRoadmaps(data);

                // 2. Lấy lộ trình đã lưu từ trang Khám phá (Cần API riêng của sếp)
                const token = localStorage.getItem('user_token');
                const resSaved = await fetch('https://localhost:7284/api/hocvien/kham-pha-lo-trinh/danh-sach-da-luu', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const resultSaved = await resSaved.json();
                if (resultSaved.success) setSavedRoadmaps(resultSaved.data || []);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
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
            <div className="container-xxl py-5 pt-0">
                <div className="container">
                    {/* KHỐI 1: LỘ TRÌNH PHÁT TRIỂN (CÁ NHÂN) */}
                    <div className="roadmap-wrapper text-center mb-5">
                        <p className="roadmap-eyebrow">Lộ trình học tập được cá nhân hóa bởi AI</p>
                        <div className="roadmap-heading">
                            <h2 className="display-6 mb-1">Danh sách lộ trình phát triển</h2>
                            <p className="text-muted">Lộ trình được thiết kế riêng dựa trên mục tiêu và trình độ của sếp.</p>
                        </div>

                        <div className="roadmap-grid">
                            {roadmaps.length > 0 ? (
                                roadmaps.map((item) => (
                                    <div key={item.maLoTrinh} className="roadmap-card roadmap-card-primary text-start shadow-sm">
                                        <div className="card-top">
                                            <span className="badge bg-primary mb-2">ĐANG HỌC</span>
                                            <h3 className="h5 fw-bold">{item.tenLoTrinh}</h3>
                                            <p className="roadmap-path small text-primary mb-2">
                                                <i className="fa fa-layer-group me-1"></i> Tổng {item.tongSoGiaiDoan} Giai đoạn
                                            </p>
                                            <small className="text-muted line-clamp-2">{item.moTaChung}</small>
                                        </div>
                                        
                                        <div className="mt-4 mb-3">
                                            <div className="progress-meta d-flex justify-content-between mb-1 small">
                                                <span>Hoàn thành: {item.soGiaiDoanHoanThanh}/{item.tongSoGiaiDoan}</span>
                                                <strong className="text-primary">{item.phanTramHoanThanh}%</strong>
                                            </div>
                                            <div className="progress" style={{ height: '6px' }}>
                                                <div className="progress-bar" style={{ width: `${item.phanTramHoanThanh}%` }}></div>
                                            </div>
                                        </div>

                                        <Link to={`/chi-tiet-lo-trinh/${encodeId(item.maLoTrinh)}`} className="btn btn-primary w-100 py-2 mt-2">
                                            Vào học ngay
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 py-4 bg-light rounded-4 border border-dashed">
                                    <p className="mb-3">Sếp chưa có lộ trình cá nhân nào.</p>
                                    <Link to="/yeu-cau-lo-trinh-ai" className="btn btn-outline-primary btn-sm">Tạo mới ngay</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KHỐI 2: LỘ TRÌNH ĐÃ LƯU (MỚI THÊM) */}
                    <div className="saved-roadmap-section mt-5 pt-5 border-top">
                        <div className="text-center mb-4">
                            <h2 className="h3 fw-bold"><i className="fa fa-bookmark text-warning me-2"></i>Lộ trình sếp đã lưu</h2>
                            <p className="text-muted">Các lộ trình hay sếp đã nhặt từ cộng đồng Khám phá.</p>
                        </div>

                        <div className="roadmap-grid">
                            {savedRoadmaps.length > 0 ? (
                                savedRoadmaps.map((item) => {
                                    const clean = getCleanContent(item.noiDungJSON);
                                    return (
                                        <div key={item.maLoTrinh} className="roadmap-card saved-card text-start shadow-sm border-start border-4 border-warning">
                                            <div className="card-top">
                                                <span className="badge bg-warning text-dark mb-2">ĐÃ LƯU</span>
                                                <h3 className="h5 fw-bold">{clean.title}</h3>
                                                <p className="small text-muted mb-3">
                                                    <i className="fa fa-calendar-alt me-1"></i> Lưu ngày: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                                                </p>
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <span className="badge bg-light text-dark border"><i className="fa fa-book me-1"></i> {clean.steps.length} Chặng</span>
                                                    <span className="small text-muted">Bởi: {item.tenGiangVien || "liu like"}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="d-flex gap-2 mt-auto">
                                                <Link to={`/chi-tiet-lo-trinh/${encodeId(item.maLoTrinh)}`} className="btn btn-warning text-dark flex-grow-1 fw-bold">
                                                    Xem chi tiết
                                                </Link>
                                                <button className="btn btn-outline-danger" title="Bỏ lưu">
                                                    <i className="fa fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-12 text-center py-5 opacity-75">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="80" className="mb-3" style={{ filter: 'grayscale(1)' }} alt="empty" />
                                    <p>Sếp chưa lưu lộ trình nào từ trang Khám phá.</p>
                                    <Link to="/kham-pha-lo-trinh" className="text-decoration-none fw-bold">Tìm lộ trình hay ngay →</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container-xxl py-5 mt-4">
                <div className="container">
                    <div className="row g-4 align-items-center bg-dark text-white rounded-4 p-5 mx-0 shadow-lg">
                        <div className="col-lg-8">
                            <h3 className="mb-2 text-white">Sếp muốn một lộ trình đột phá hơn?</h3>
                            <p className="mb-0 text-white-50">
                                Hãy trao đổi với AI để tinh chỉnh lộ trình theo đúng mong muốn và thời gian biểu của sếp.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end">
                            <Link to="/yeu-cau-lo-trinh-ai" className="btn btn-primary btn-lg px-5 shadow">Trao đổi với AI</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KhoaHocCaNhanAI;