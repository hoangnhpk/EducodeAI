import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './KhamPhaLoTrinh.css';

interface LoTrinhKhamPha {
    maLoTrinh: number; 
    tieuDe: string; 
    ngayTao: string; 
    maGiangVien: number; 
    noiDungJSON: string;
}

interface ChangHoc { 
    maKhoaHoc: number; // Đã thêm mã khóa học
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

// 👉 ĐÃ THÊM: Interface cho Khóa học gốc từ DB
interface IKhoaHocGoc {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    hinhAnh: string;
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
    
    // 👉 ĐÃ THÊM: State lưu trữ "Từ điển" khóa học có sẵn
    const [khoaHocCoSan, setKhoaHocCoSan] = useState<IKhoaHocGoc[]>([]);

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
                const rawSteps = jsonData.loTrinh || jsonData.cacChangHoc || jsonData.steps || jsonData.khoaHocSuDung || [];
                let finalSteps: any[] = [];

                if (Array.isArray(rawSteps)) {
                    rawSteps.forEach((item: any) => {
                        if (item.khoaHocSuDung && Array.isArray(item.khoaHocSuDung)) {
                            item.khoaHocSuDung.forEach((kh: any) => {
                                finalSteps.push({
                                    maKhoaHoc: kh.maKhoaHoc || 0, // 👉 Lấy mã khóa học
                                    ten: kh.tenKhoaHoc || kh.ten || "Khóa học",
                                    trangThai: kh.ghiChu || kh.loai || kh.trangThai || "Bắt buộc",
                                    hinhAnh: kh.hinhAnh || ""
                                });
                            });
                        } else {
                            finalSteps.push({
                                maKhoaHoc: item.maKhoaHoc || 0, // 👉 Lấy mã khóa học
                                ten: item.ten || item.tenKhoaHoc || "Khóa học",
                                trangThai: item.trangThai || item.loai || item.ghiChu || "Bắt buộc",
                                hinhAnh: item.hinhAnh || ""
                            });
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

    // Hàm backup nếu lấy ảnh từ khóa học bị lỗi
    const getSmartIcon = (courseName: string, fallbackImg: string) => {
        const nameLower = (courseName || "").toLowerCase();
        
        if (nameLower.includes('javascript') || nameLower.includes('js')) 
            return 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png';
        if (nameLower.includes('react')) 
            return 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';
        if (nameLower.includes('c#') || nameLower.includes('csharp') || nameLower.includes('.net')) 
            return 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png';
        if (nameLower.includes('nhập môn') || nameLower.includes('cơ bản') || nameLower.includes('it')) 
            return 'https://cdn-icons-png.flaticon.com/512/1197/1197408.png';
        if (nameLower.includes('database') || nameLower.includes('sql') || nameLower.includes('dữ liệu')) 
            return 'https://cdn-icons-png.flaticon.com/512/2885/2885412.png';
            
        const shortName = (courseName || "AI").substring(0, 2).toUpperCase();
        return fallbackImg && fallbackImg.startsWith('http') 
            ? fallbackImg 
            : `https://placehold.co/100x100/1e293b/ffffff?text=${shortName}`;
    };

    // 👉 ĐÃ THÊM: Gọi API lấy danh sách khóa học gốc làm "Từ điển"
    useEffect(() => {
        const fetchKhoaHocCoSan = async () => {
            try {
                const token = localStorage.getItem('user_token');
                // Lưu ý: Nếu sếp có API này dành riêng cho /hocvien/ thì sửa lại đường dẫn nhé
                const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) setKhoaHocCoSan(result.data);
            } catch (error) { console.error("Lỗi lấy danh sách khóa học:", error); }
        };
        fetchKhoaHocCoSan();
    }, []);

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
        const kq = await Swal.fire({
            title: 'Lưu lộ trình',
            text: 'Lưu lộ trình này vào tài khoản cá nhân?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#f69050'
        });
        if (!kq.isConfirmed) return;
        try {
            const res = await fetch(`https://localhost:7284/api/hocvien/kham-pha-lo-trinh/luu/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            });
            const result = await res.json();
            await Swal.fire('Thông báo', result.message, result.success ? 'success' : 'info');
        } catch (error) { await Swal.fire('Lỗi', 'Lỗi kết nối!', 'error'); }
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
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)' }}>
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
                                        const originalItem = danhSach.find(x => x.maLoTrinh === detail.maLoTrinh);
                                        const roadmapData = getCleanContent(originalItem?.noiDungJSON || "");
                                        
                                        return roadmapData.steps.map((chang: any, i: number) => {
                                            
                                            // 👉 THUẬT TOÁN MATCHING KẾT HỢP
                                            let finalImgSrc = "";
                                            
                                            // 1. Cố gắng tìm trong DB có khóa học nào trùng ID hoặc trùng Tên không
                                            const matchedCourse = khoaHocCoSan.find(k => 
                                                (chang.maKhoaHoc && k.maKhoaHoc === chang.maKhoaHoc) || 
                                                k.tenKhoaHoc.toLowerCase().includes(chang.ten.toLowerCase()) || 
                                                chang.ten.toLowerCase().includes(k.tenKhoaHoc.toLowerCase())
                                            );

                                            if (matchedCourse && matchedCourse.hinhAnh) {
                                                // 2. Nếu khớp DB -> Lấy ảnh gốc (xử lý link có http hoặc gắn /img/ vào)
                                                finalImgSrc = matchedCourse.hinhAnh.startsWith('http') 
                                                    ? matchedCourse.hinhAnh 
                                                    : `/img/${matchedCourse.hinhAnh}`;
                                            } else {
                                                // 3. Nếu AI bịa ra khóa hoàn toàn mới -> Gọi Smart Icon
                                                finalImgSrc = getSmartIcon(chang.ten, chang.hinhAnh);
                                            }

                                            return (
                                                <div key={i} className="kp-timeline-item">
                                                    <div className="kp-item-rank">{i + 1}</div>
                                                    <div className="kp-item-icon-wrapper">
                                                        <img 
                                                            src={finalImgSrc} 
                                                            className="kp-item-img" 
                                                            onError={e => {
                                                                const shortName = (chang.ten || "AI").substring(0, 2).toUpperCase();
                                                                e.currentTarget.src = `https://placehold.co/100x100/1e293b/ffffff?text=${shortName}`;
                                                            }} 
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
                                            );
                                        });
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