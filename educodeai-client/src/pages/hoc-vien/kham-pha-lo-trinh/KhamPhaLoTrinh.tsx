import React, { useState, useEffect } from 'react';
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
    const [totalPages, setTotalPages] = useState(1);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<LoTrinhChiTiet | null>(null);

    // Xử lý Debounce tìm kiếm
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
                // Chuyển từ khóa về chữ thường để gửi lên Server (Server cũng nên dùng .ToLower() khi so sánh)
                const searchLower = debouncedTerm.toLowerCase();
                const url = `https://localhost:7284/api/hocvien/kham-pha-lo-trinh/danh-sach?tuKhoa=${encodeURIComponent(searchLower)}&page=${page}&pageSize=9`;
                
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                const result = await res.json();
                if (result.success) { 
                    setDanhSach(result.data.items || []); 
                    setTotalPages(result.data.totalPages || 1); 
                }
            } catch (err) { 
                console.error(err); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchData();
    }, [debouncedTerm, page]);

    const handleLuuLoTrinh = async (id: number) => {
        if (!window.confirm("Bạn muốn lưu lộ trình này vào tài khoản cá nhân?")) return;
        try {
            const res = await fetch(`https://localhost:7284/api/hocvien/kham-pha-lo-trinh/luu/${id}`, {
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            });
            const result = await res.json();
            alert(result.message);
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        }
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
        } catch (err) { 
            setIsModalOpen(false); 
        } finally { 
            setDetailLoading(false); 
        }
    };

    return (
        <div className="kp-container">
            <div className="kp-header">
                <div className="kp-header-title">
                    <h1>Khám Phá Lộ Trình AI</h1>
                    <p>Tìm và học ngay các lộ trình chuẩn từ chuyên gia</p>
                </div>
                <div className="kp-search-wrapper">
                    <input 
                        className="kp-search-input" 
                        placeholder="🔍 Tìm kiếm lộ trình (không phân biệt hoa thường)..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="kp-grid">
                    {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="kp-skeleton-card" />)}
                </div>
            ) : danhSach.length === 0 ? (
                <div className="kp-empty">
                    <p>Không tìm thấy lộ trình nào phù hợp sếp ơi! 😅</p>
                </div>
            ) : (
                <>
                    <div className="kp-grid">
                        {danhSach.map(item => {
                            let soChang = 0;
                            try { soChang = JSON.parse(item.noiDungJSON).length; } catch { soChang = 0; }
                            
                            return (
                                <div key={item.maLoTrinh} className="kp-card">
                                    <div className="kp-card-content">
                                        <div className="kp-card-badges">
                                            <span className="kp-badge kp-badge-info">📚 {soChang} Chặng học</span>
                                        </div>
                                        <h3 className="kp-card-title">{item.tieuDe}</h3>
                                        <p className="kp-card-date">Cập nhật: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="kp-card-footer">
                                        <button className="kp-btn-view" onClick={() => handleXemChiTiet(item.maLoTrinh)}>Xem chi tiết</button>
                                        <button className="kp-btn-save" onClick={() => handleLuuLoTrinh(item.maLoTrinh)}>Lưu</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div className="kp-pagination">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
                            <span>{page} / {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
                        </div>
                    )}
                </>
            )}

            {/* MODAL CHI TIẾT LỘ TRÌNH (FIXED) */}
            {isModalOpen && (
                <div className="kp-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="kp-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="kp-modal-header">
    <div>
        {/* Hiện tên lộ trình to, rõ ràng làm tiêu đề chính */}
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', lineHeight: '1.3' }}>
            {detail?.tieuDe || 'Chi tiết lộ trình'}
        </h2>
        
        {/* Hiện tên tác giả và số chặng học ở dưới nhỏ hơn */}
        {detail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                    Tác giả: <span style={{ color: '#2563eb', fontWeight: 700 }}>{detail.tenGiangVien}</span>
                </p>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                    Tổng cộng: <span style={{ color: '#10b981', fontWeight: 700 }}>{detail.cacChangHoc.length} chặng</span>
                </p>
            </div>
        )}
    </div>
    <button className="kp-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
</div>

                        <div className="kp-modal-body">
                            {detailLoading ? (
                                <div className="kp-loading-spinner">Đang lấy dữ liệu...</div>
                            ) : detail && (
                                <div className="kp-modal-timeline">
                                    {detail.cacChangHoc.length > 0 ? detail.cacChangHoc.map((chang, i) => (
                                        <div key={i} className="kp-timeline-item">
                                            <div className="kp-item-rank">0{i + 1}</div>
                                            <img 
                                                src={`/img/${chang.hinhAnh}`} 
                                                className="kp-item-img" 
                                                onError={(e) => (e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg')}
                                                alt={chang.ten}
                                            />
                                            <div className="kp-item-info">
                                                <h4>{chang.ten}</h4>
                                                <span className={`kp-item-badge ${chang.trangThai === 'Bắt buộc' ? 'is-req' : 'is-opt'}`}>
                                                    {chang.trangThai}
                                                </span>
                                            </div>
                                        </div>
                                    )) : <p style={{textAlign: 'center', padding: '20px'}}>Lộ trình này chưa có nội dung chi tiết.</p>}
                                </div>
                            )}
                        </div>

                        <div className="kp-modal-footer">
                            <button className="btn-save-final" onClick={() => detail && handleLuuLoTrinh(detail.maLoTrinh)}>
                                Đăng ký lộ trình này
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KhamPhaLoTrinh;