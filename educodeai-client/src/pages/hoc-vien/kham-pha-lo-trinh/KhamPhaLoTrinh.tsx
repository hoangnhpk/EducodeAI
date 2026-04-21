import { useState, useEffect } from 'react';
import './KhamPhaLoTrinh.css';

interface LoTrinhKhamPha {
    maLoTrinh: number; 
    tieuDe: string; 
    ngayTao: string; 
    maGiangVien: number; 
    noiDungJSON: string;
}

interface ChangHoc { 
    ten: string; 
    trangThai: string; 
    hinhAnh: string; 
}

interface LoTrinhChiTiet { 
    maLoTrinh: number; 
    tieuDe: string; 
    tenGiangVien: string; 
    ngayTao: string; 
    cacChangHoc: ChangHoc[]; 
}

const KhamPhaLoTrinh = () => {
    const [danhSach, setDanhSach] = useState<LoTrinhKhamPha[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [page, setPage] = useState(1);
    const [, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<LoTrinhChiTiet | null>(null);

    // ==========================================
    // BỘ LỌC SIÊU CẤP: BÓC TÁCH DỮ LIỆU SẠCH TỪ AI
    // ==========================================
    const getCleanContent = (text: string) => {
        const fallback = { title: "Lộ trình học tập", steps: [] };
        if (!text || typeof text !== 'string') return fallback;

        try {
            let raw = text;
            try {
                raw = JSON.parse(`"${text.replace(/"/g, '\\"')}"`);
            } catch { raw = text; }

            let jsonData: any = null;
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                for (let i = lastBrace; i > firstBrace; i--) {
                    if (raw[i] === '}') {
                        try {
                            const potentialJson = raw.substring(firstBrace, i + 1);
                            jsonData = JSON.parse(potentialJson);
                            break;
                        } catch (e) { continue; }
                    }
                }
            }

            if (!jsonData) {
                const firstBracket = raw.indexOf('[');
                const lastBracket = raw.lastIndexOf(']');
                if (firstBracket !== -1 && lastBracket !== -1) {
                    for (let i = lastBracket; i > firstBracket; i--) {
                        if (raw[i] === ']') {
                            try {
                                const potentialArray = raw.substring(firstBracket, i + 1);
                                jsonData = { steps: JSON.parse(potentialArray) };
                                break;
                            } catch (e) { continue; }
                        }
                    }
                }
            }

            if (jsonData) {
                // Xử lý cấu trúc lồng nhau từ JSON sếp gửi (loTrinh -> khoaHocSuDung)
                const rawSteps = jsonData.loTrinh || jsonData.cacChangHoc || jsonData.steps || [];
                let finalSteps: any[] = [];

                if (Array.isArray(rawSteps)) {
                    rawSteps.forEach((item: any) => {
                        // Nếu là cấu trúc giai đoạn chứa mảng khóa học
                        if (item.khoaHocSuDung && Array.isArray(item.khoaHocSuDung)) {
                            item.khoaHocSuDung.forEach((kh: any) => {
                                finalSteps.push({
                                    ten: kh.tenKhoaHoc || kh.ten || "Khóa học",
                                    trangThai: kh.ghiChu || "Bắt buộc",
                                    hinhAnh: kh.hinhAnh || ""
                                });
                            });
                        } else {
                            finalSteps.push(item);
                        }
                    });
                }

                return {
                    title: jsonData.tenLoTrinh || jsonData.tieuDe || "Lộ trình AI",
                    steps: finalSteps
                };
            }
            return fallback;
        } catch (err) {
            return fallback;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => { 
            setDebouncedTerm(searchTerm); 
            setPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('user_token');
                const searchLower = debouncedTerm.toLowerCase();
                const url = `https://localhost:7284/api/hocvien/kham-pha-lo-trinh/danh-sach?tuKhoa=${encodeURIComponent(searchLower)}&page=${page}&pageSize=9`;
                
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                const result = await res.json();
                if (result.success) { 
                    setDanhSach(result.data.items || []); 
                    setTotalPages(result.data.totalPages || 1); 
                }
            } catch (err) { console.error(err); } 
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [debouncedTerm, page]);

    const handleLuuLoTrinh = async (id: number) => {
        if (!window.confirm("Lưu lộ trình này vào tài khoản cá nhân?")) return;
        try {
            const res = await fetch(`https://localhost:7284/api/hocvien/kham-pha-lo-trinh/luu/${id}`, {
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            });
            const result = await res.json();
            alert(result.message);
        } catch (error) { alert("Lỗi kết nối!"); }
    };

    const handleXemChiTiet = async (id: number) => {
        setIsModalOpen(true); 
        setDetailLoading(true);
        try {
            const res = await fetch(`https://localhost:7284/api/hocvien/kham-pha-lo-trinh/chi-tiet/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            });
            const result = await res.json();
            if (result.success) setDetail(result.data);
        } catch (err) { setIsModalOpen(false); } 
        finally { setDetailLoading(false); }
    };

    return (
        <div className="kp-container">
            <div className="kp-header">
                <div className="kp-header-title">
                    <h1>Khám Phá Lộ Trình AI</h1>
                    <p>Sử dụng trí tuệ nhân tạo để tối ưu hóa việc học của sếp</p>
                </div>
                <div className="kp-search-wrapper">
                    <input className="kp-search-input" placeholder="🔍 Tìm lộ trình..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {isLoading ? (
                <div className="kp-grid">
                    {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="kp-skeleton-card" />)}
                </div>
            ) : (
                <div className="kp-grid">
                    {danhSach.map(item => {
                        const parsed = getCleanContent(item.noiDungJSON);
                        return (
                            <div key={item.maLoTrinh} className="kp-card">
                                <div className="kp-card-content">
                                    <div className="kp-card-badges">
                                        <span className="kp-badge kp-badge-info">📚 {parsed.steps.length} Chặng</span>
                                    </div>
                                    <h3 className="kp-card-title">{parsed.title}</h3>
                                    <p className="kp-card-date">Ngày tạo: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="kp-card-footer">
                                    <button className="kp-btn-view" onClick={() => handleXemChiTiet(item.maLoTrinh)}>Xem chi tiết</button>
                                    <button className="kp-btn-save" onClick={() => handleLuuLoTrinh(item.maLoTrinh)}>Lưu</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="kp-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="kp-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="kp-modal-header">
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>
                                    {getCleanContent(danhSach.find(x => x.maLoTrinh === detail?.maLoTrinh)?.noiDungJSON || "").title}
                                </h2>
                                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    Tác giả: <b>{detail?.tenGiangVien || "liu like"}</b>
                                </p>
                            </div>
                            <button className="kp-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="kp-modal-body">
                            {detailLoading ? <div className="kp-loading-spinner">Đang lấy dữ liệu...</div> : detail && (
                                <div className="kp-modal-timeline">
                                    {(() => {
                                        // QUAN TRỌNG: Lấy dữ liệu từ noiDungJSON của item hiện tại để bóc tách chặng
                                        const originalItem = danhSach.find(x => x.maLoTrinh === detail.maLoTrinh);
                                        const roadmapData = getCleanContent(originalItem?.noiDungJSON || "");
                                        
                                        return roadmapData.steps.map((chang: any, i: number) => (
                                            <div key={i} className="kp-timeline-item">
                                                <div className="kp-item-rank">{i + 1}</div>
                                                <div className="kp-item-icon-wrapper">
                                                    <img 
                                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" 
                                                        className="kp-item-img" 
                                                        onError={e => e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'} 
                                                        alt={chang.ten}
                                                    />
                                                </div>
                                                <div className="kp-item-info">
                                                    <h4>{chang.ten || "Chương trình học"}</h4>
                                                    <span className="kp-item-badge is-req">
                                                        {chang.trangThai || "Bắt buộc"}
                                                    </span>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                        <div className="kp-modal-footer">
                            <button className="btn-save-final" onClick={() => detail && handleLuuLoTrinh(detail.maLoTrinh)}>Đăng ký học ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhamPhaLoTrinh;
