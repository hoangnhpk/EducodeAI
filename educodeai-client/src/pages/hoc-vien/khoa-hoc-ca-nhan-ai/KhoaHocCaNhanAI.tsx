import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiRoadmapService } from '@/services/aiRoadmap.service';
import type { LoTrinhAICuaToiDTO } from './LoTrinhAICuaToiDTO';
import { getAccessToken } from '../../../utils/authStorage';
import { encodeId } from '@/utils/id-helper';
import Swal from 'sweetalert2';

const KhoaHocCaNhanAI = () => {
    const [roadmaps, setRoadmaps] = useState<LoTrinhAICuaToiDTO[]>([]);
    const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);
    const [khoaHocCoSan, setKhoaHocCoSan] = useState<any[]>([]); // Kho chứa ảnh để Dò tìm
    const [loading, setLoading] = useState<boolean>(true);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [viewData, setViewData] = useState<{ title: string, steps: any[], author: string } | null>(null);

    // 👉 ĐÃ SỬA: Thay ảnh JS bằng Icon Code/AI xịn sò
    const getImgUrl = (imgStr: string) => {
        if (!imgStr) return 'https://cdn-icons-png.flaticon.com/512/8633/8633190.png';
        if (imgStr.startsWith('http')) return imgStr;
        return `/img/${imgStr}`;
    };

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
                const rawSteps = jsonData.loTrinh || jsonData.cacChangHoc || jsonData.steps || jsonData.khoaHocSuDung || [];
                let finalSteps: any[] = [];

                if (Array.isArray(rawSteps)) {
                    rawSteps.forEach((item: any) => {
                        if (item.khoaHocSuDung && Array.isArray(item.khoaHocSuDung)) {
                            item.khoaHocSuDung.forEach((kh: any) => {
                                finalSteps.push({
                                    maKhoaHoc: kh.maKhoaHoc || 0,
                                    ten: kh.tenKhoaHoc || kh.ten || "Khóa học",
                                    trangThai: kh.ghiChu || kh.loai || kh.trangThai || "Bắt buộc",
                                    hinhAnh: kh.hinhAnh || ""
                                });
                            });
                        } else {
                            finalSteps.push({
                                maKhoaHoc: item.maKhoaHoc || 0,
                                ten: item.ten || item.tenKhoaHoc || "Khóa học",
                                trangThai: item.trangThai || item.loai || item.ghiChu || "Bắt buộc",
                                hinhAnh: item.hinhAnh || ""
                            });
                        }
                    });
                }

                const extractedTitle = jsonData.tenLoTrinh || jsonData.TenLoTrinh || jsonData.tieuDe;
                return { title: extractedTitle || "Lộ trình AI", steps: finalSteps };
            }
            return fallback;
        } catch { return fallback; }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await aiRoadmapService.getAllLoTrinh();
                setRoadmaps(data);

                const token = getAccessToken();

                const resSaved = await fetch('https://localhost:7284/api/hocvien/kham-pha-lo-trinh/danh-sach-da-luu', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resSaved.ok) {
                    const resultSaved = await resSaved.json();
                    if (resultSaved.success) setSavedRoadmaps(resultSaved.data || []);
                }

                const resKhoaHoc = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resKhoaHoc.ok) {
                    const resultKH = await resKhoaHoc.json();
                    if (resultKH.success) setKhoaHocCoSan(resultKH.data || []);
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRemoveSaved = (id: number) => {
        Swal.fire({
            title: 'Bỏ lưu lộ trình này?',
            text: "Lộ trình sẽ bị xóa khỏi danh sách đã lưu của sếp!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Đồng ý bỏ',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = getAccessToken();
                    const response = await fetch(`https://localhost:7284/api/hocvien/kham-pha-lo-trinh/xoa-da-luu/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        setSavedRoadmaps(prev => prev.filter(item => item.maLoTrinh !== id));
                        Swal.fire('Thành công!', 'Đã bỏ lưu lộ trình.', 'success');
                    } else {
                        Swal.fire('Lỗi!', 'Không thể xóa lộ trình này.', 'error');
                    }
                } catch (error) { console.error("Lỗi khi xóa:", error); }
            }
        });
    };

    const handlePreview = async (item: any, isSavedItem: boolean = false) => {
        setIsPreviewOpen(true);
        setViewData(null); 

        let stepsToMatch: any[] = [];
        let viewTitle = "";
        let viewAuthor = "";

        if (isSavedItem || item.noiDungJSON || item.NoiDungJSON) {
            const clean = getCleanContent(item.noiDungJSON || item.NoiDungJSON || "");
            stepsToMatch = clean.steps;
            viewTitle = clean.title !== "Lộ trình AI" ? clean.title : (item.tenLoTrinh || item.yeuCau || item.tieuDe || "Lộ trình AI");
            viewAuthor = item.tenGiangVien || item.tenNguoiTao || "Hệ thống AI";
        } else {
            try {
                const detail = await aiRoadmapService.getChiTietLoTrinh(item.maLoTrinh);
                detail.giaiDoan?.forEach((gd: any) => {
                    gd.danhSachKhoaHoc?.forEach((kh: any) => {
                        stepsToMatch.push({
                            maKhoaHoc: kh.maKhoaHoc,
                            ten: kh.tenKhoaHoc,
                            trangThai: gd.mucTieu || "Bắt buộc",
                            hinhAnh: ""
                        });
                    });
                });
                viewTitle = detail.tenLoTrinh || item.tenLoTrinh;
                viewAuthor = "Hệ thống AI";
            } catch (err) {
                console.error("Lỗi lấy chi tiết preview:", err);
            }
        }

        const matchedSteps = stepsToMatch.map((step: any) => {
            let img = step.hinhAnh;
            let name = step.ten;

            if (!img && khoaHocCoSan.length > 0) {
                const found = khoaHocCoSan.find(k =>
                    k.tenKhoaHoc.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(k.tenKhoaHoc.toLowerCase())
                );
                if (found) {
                    img = found.hinhAnh;
                    name = found.tenKhoaHoc;
                }
            }
            return { ...step, hinhAnh: img, ten: name };
        });

        setViewData({
            title: viewTitle || "Lộ trình AI",
            steps: matchedSteps,
            author: viewAuthor
        });
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

    return (
        <div className="khoa-hoc-ca-nhan-ai-page">
            {/* KHỐI 1: LỘ TRÌNH ĐANG HỌC */}
            <div className="container-xxl py-5 pt-0">
                <div className="container">
                    <div className="roadmap-wrapper text-center mb-5">
                        <p className="roadmap-eyebrow">Lộ trình học tập được cá nhân hóa bởi AI</p>
                        <div className="roadmap-heading">
                            <h2 className="display-6 mb-1">Danh sách lộ trình phát triển</h2>
                            <p className="text-muted">Lộ trình được thiết kế riêng dựa trên mục tiêu và trình độ của sếp.</p>
                            <Link to="/yeu-cau-lo-trinh-ai" className="btn btn-outline-primary mt-3 rounded-pill px-4 py-2 fw-bold">Tạo lộ trình mới</Link>
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
                                        <div className="d-flex gap-2 mt-2">
                                            <Link to={`/chi-tiet-lo-trinh/${encodeId(item.maLoTrinh)}`} className="btn btn-primary flex-grow-1 py-2">
                                                Vào học ngay
                                            </Link>
                                            <button onClick={() => handlePreview(item)} className="btn btn-outline-primary" title="Xem trước cấu trúc">
                                                <i className="fa fa-eye"></i>
                                            </button>
                                        </div>
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

                    {/* KHỐI 2: LỘ TRÌNH ĐÃ LƯU */}
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
                                                <h3 className="h5 fw-bold">{clean.title !== "Lộ trình AI" ? clean.title : (item.tieuDe || item.yeuCau)}</h3>
                                                <p className="small text-muted mb-3">
                                                    <i className="fa fa-calendar-alt me-1"></i> Lưu ngày: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                                                </p>
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <span className="badge bg-light text-dark border"><i className="fa fa-book me-1"></i> {clean.steps.length} Chặng</span>
                                                    <span className="small text-muted">Bởi: {item.tenGiangVien || "Hệ thống"}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2 mt-auto">
                                                {/* Đã chuyển Link thành Button mở Modal Preview để tránh lỗi nhảy trang */}
                                                <button
                                                    onClick={() => handlePreview(item, true)}
                                                    className="btn btn-warning text-dark flex-grow-1 fw-bold text-center"
                                                >
                                                    Xem chi tiết
                                                </button>

                                                <button onClick={() => handleRemoveSaved(item.maLoTrinh)} className="btn btn-outline-danger" title="Bỏ lưu">
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
                                    <Link to="/kham-pha-lo-trinh" className="text-decoration-none fw-bold">Tìm lộ trình hay ngay &rarr;</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL XEM CHI TIẾT */}
            {isPreviewOpen && viewData && (
                <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="pro-modal-v2" onClick={e => e.stopPropagation()} style={{ width: '650px', background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div className="modal-header-pro" style={{ padding: '24px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800, color: '#1e293b' }}>{viewData.title}</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Tác giả: <strong>{viewData.author}</strong></p>
                            </div>
                            <button onClick={() => setIsPreviewOpen(false)} style={{ width: '36px', height: '36px', background: '#f1f5f9', border: 'none', borderRadius: '50%', color: '#64748b', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="modal-body-pro" style={{ background: '#f8fafc', padding: '30px', maxHeight: '60vh', overflowY: 'auto' }}>
                            {viewData.steps.length > 0 ? viewData.steps.map((step: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: '15px', background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '12px', borderLeft: '4px solid #fb873f', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ width: '32px', height: '32px', background: '#fb873f', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>{i + 1}</div>
                                    <img
                                        src={getImgUrl(step.hinhAnh)}
                                        style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                        // 👉 ĐÃ SỬA: Đồng bộ onError với hình ảnh Flaticon luôn
                                        onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/8633/8633190.png')}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{step.ten}</h4>
                                        <span style={{ fontSize: '0.7rem', background: '#fff7f1', color: '#c2410c', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px', fontWeight: 700 }}>{step.trangThai || "Bắt buộc"}</span>
                                    </div>
                                </div>
                            )) : <p className="text-center" style={{ color: '#64748b' }}>Dữ liệu lộ trình đang được xử lý...</p>}
                        </div>
                        <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', textAlign: 'right', background: '#fff' }}>
                            <button onClick={() => setIsPreviewOpen(false)} className="btn btn-secondary" style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 25px', borderRadius: '10px', fontWeight: 700 }}>ĐÓNG</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhoaHocCaNhanAI;
