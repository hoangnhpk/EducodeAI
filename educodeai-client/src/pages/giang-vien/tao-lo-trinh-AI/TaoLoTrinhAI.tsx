import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './QuanLyLoTrinh.css';

interface IKhoaHocGoc {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    hinhAnh: string;
}

interface KhoaHocCon {
    maKhoaHoc: number;
    ten: string;
    hinhAnh: string;
    trangThai: string;
}

interface LoTrinhAI {
    maLoTrinh: number;
    yeuCau: string;
    trangThai: string;
    ngayTao: string;
    noiDungJSON: string;
    tenNguoiTao?: string; // Mới: Để biết lộ trình của ai
}

const QuanLyLoTrinh = () => {
    const [danhSach, setDanhSach] = useState<LoTrinhAI[]>([]);
    const [khoaHocCoSan, setKhoaHocCoSan] = useState<IKhoaHocGoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Modal Thêm/Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<LoTrinhAI> | null>(null);
    const [tempCourses, setTempCourses] = useState<KhoaHocCon[]>([]);

    // Modal Xem chi tiết (Preview)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [viewData, setViewData] = useState<{title: string, steps: any[], author: string} | null>(null);

    // ==========================================
    // BỘ LỌC XỬ LÝ DỮ LIỆU AI (GIỮ NGUYÊN LOGIC 100 ĐIỂM)
    // ==========================================
    const getCleanContent = (text: string) => {
        const fallback = { title: "Lộ trình học tập", steps: [] };
        if (!text || typeof text !== 'string') return fallback;

        try {
            let raw = text;
            try { raw = JSON.parse(`"${text.replace(/"/g, '\\"')}"`); } catch { raw = text; }

            let jsonData: any = null;
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                for (let i = lastBrace; i > firstBrace; i--) {
                    if (raw[i] === '}') {
                        try {
                            jsonData = JSON.parse(raw.substring(firstBrace, i + 1));
                            break;
                        } catch { continue; }
                    }
                }
            }

            if (!jsonData) {
                const firstBracket = raw.indexOf('[');
                const lastBracket = raw.lastIndexOf(']');
                if (firstBracket !== -1 && lastBracket !== -1) {
                    for (let i = lastBracket; i > firstBracket; i--) {
                        if (raw[i] === ']') {
                            try { jsonData = { steps: JSON.parse(raw.substring(firstBracket, i + 1)) }; break; } catch { continue; }
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
                                    ten: kh.tenKhoaHoc || kh.ten || "Khóa học",
                                    trangThai: kh.ghiChu || "Bắt buộc",
                                    hinhAnh: kh.hinhAnh || ""
                                });
                            });
                        } else {
                            finalSteps.push({
                                ten: item.ten || item.tenKhoaHoc || "Khóa học",
                                trangThai: item.trangThai || "Bắt buộc",
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
        } catch { return fallback; }
    };

    const fetchDanhSach = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setDanhSach(result.data); // Backend đã trả về list tổng
            }
        } catch (error) { console.error(error); }
        finally { setTimeout(() => setIsLoading(false), 300); }
    };

    const fetchKhoaHocCoSan = async () => {
        try {
            const token = localStorage.getItem('user_token');
            const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) setKhoaHocCoSan(result.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchDanhSach(); fetchKhoaHocCoSan(); }, []);

    const handlePreview = (item: LoTrinhAI) => {
        const parsed = getCleanContent(item.noiDungJSON);
        setViewData({
            title: parsed.title,
            steps: parsed.steps,
            author: item.tenNguoiTao || "Hệ thống AI"
        });
        setIsPreviewOpen(true);
    };

    const handleDeleteMain = (id: number) => {
        Swal.fire({
            title: 'Xóa toàn bộ lộ trình?',
            text: `Hành động này sẽ xóa vĩnh viễn lộ trình #${id}!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('user_token');
                    const res = await fetch(`https://localhost:7284/api/giangvien/quan-ly-lo-trinh/xoa/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        Swal.fire('Thành công', 'Đã xóa lộ trình!', 'success');
                        fetchDanhSach();
                    }
                } catch (error) { console.error(error); }
            }
        });
    };

    const handleSave = async () => {
        if (!editingItem?.yeuCau) return Swal.fire('Cảnh báo', "Vui lòng nhập tên lộ trình!", "warning");
        
        try {
            const token = localStorage.getItem('user_token');
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode
                ? `https://localhost:7284/api/giangvien/quan-ly-lo-trinh/cap-nhat/${editingItem.maLoTrinh}`
                : `https://localhost:7284/api/giangvien/quan-ly-lo-trinh/them-moi`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    YeuCau: editingItem.yeuCau,
                    TrangThai: editingItem.trangThai || 'Hoạt động',
                    NoiDungJSON: JSON.stringify(tempCourses)
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchDanhSach();
                Swal.fire('Thành công', isEditMode ? "Cập nhật thành công!" : "Đã tạo lộ trình mới!", "success");
            }
        } catch (error) { console.error(error); }
    };

    const addCourse = () => {
        if (khoaHocCoSan.length === 0) return;
        const firstKH = khoaHocCoSan[0];
        setTempCourses([...tempCourses, {
            maKhoaHoc: firstKH.maKhoaHoc, ten: firstKH.tenKhoaHoc, hinhAnh: firstKH.hinhAnh, trangThai: 'Bắt buộc'
        }]);
    };

    const handleCourseSelect = (idx: number, maKH: number) => {
        const skh = khoaHocCoSan.find(k => k.maKhoaHoc === maKH);
        if (skh) setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, maKhoaHoc: skh.maKhoaHoc, ten: skh.tenKhoaHoc, hinhAnh: skh.hinhAnh } : c));
    };

    return (
        <div className="quan-ly-container">
            <div className="quan-ly-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>Quản lý Tổng hợp Lộ trình</h1>
                    <p style={{ color: '#64748b' }}>Theo dõi và tinh chỉnh tất cả kế hoạch học tập trên hệ thống</p>
                </div>
                <button onClick={() => { setIsEditMode(false); setEditingItem({ yeuCau: '', trangThai: 'Hoạt động' }); setTempCourses([]); setIsModalOpen(true); }}
                    className="btn-add-main">+ THÊM LỘ TRÌNH</button>
            </div>

            <div className="lo-trinh-grid">
                {danhSach.map((item) => {
                    const clean = getCleanContent(item.noiDungJSON);
                    return (
                        <div key={item.maLoTrinh} className="lo-trinh-card pro-card">
                            <div className="card-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span className="badge-status">● {item.trangThai}</span>
                                    <small className="text-muted" style={{ fontWeight: 600 }}>Bởi: {item.tenNguoiTao || "Hệ thống"}</small>
                                </div>
                                <h3 className="card-title">{clean.title || item.yeuCau}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cập nhật: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="card-footer">
                                <span className="id-tag">#{item.maLoTrinh}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handlePreview(item)} className="btn-refresh" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Xem</button>
                                    <button onClick={() => { 
                                        setIsEditMode(true); 
                                        setEditingItem(item); 
                                        setTempCourses(clean.steps); 
                                        setIsModalOpen(true); 
                                    }} className="btn-edit-small" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Sửa</button>
                                    <button onClick={() => handleDeleteMain(item.maLoTrinh)} className="btn-delete-main-card" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Xóa</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL THÊM / SỬA (GIỮ NGUYÊN FORM CŨ) */}
            {isModalOpen && editingItem && (
                <div className="modal-overlay">
                    <div className="modal-content pro-modal-v2">
                        <div className="modal-header-pro">
                            <h2>{isEditMode ? 'Chỉnh sửa Lộ trình' : 'Tạo mới Lộ trình'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-x">×</button>
                        </div>
                        <div className="modal-body-pro">
                            <div className="form-group-pro" style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Tên lộ trình tổng quát</label>
                                <input type="text" className="input-pro" value={editingItem.yeuCau} onChange={(e) => setEditingItem({...editingItem, yeuCau: e.target.value})} placeholder="Ví dụ: Lập trình Web từ A-Z" />
                            </div>
                            <div className="roadmap-section">
                                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Cấu trúc các chặng học</h3>
                                    <button onClick={addCourse} className="btn-select-kh">+ Chọn khóa học</button>
                                </div>
                                <div className="course-scroll-area" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {tempCourses.map((course, idx) => (
                                        <div key={idx} className="course-item-card">
                                            <div className="course-rank">{idx + 1}</div>
                                            <img src={`/img/${course.hinhAnh}`} className="course-img-small" onError={(e) => (e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg')} />
                                            <div style={{ flex: 2 }}>
                                                <select className="select-pro" value={course.maKhoaHoc} onChange={(e) => handleCourseSelect(idx, parseInt(e.target.value))}>
                                                    {khoaHocCoSan.map(k => <option key={k.maKhoaHoc} value={k.maKhoaHoc}>{k.tenKhoaHoc}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <select className={`status-select ${course.trangThai === 'Bắt buộc' ? 'st-req' : 'st-opt'}`} value={course.trangThai} onChange={(e) => setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, trangThai: e.target.value } : c))}>
                                                    <option value="Bắt buộc">Bắt buộc</option>
                                                    <option value="Nâng cao">Nâng cao</option>
                                                </select>
                                            </div>
                                            <button onClick={() => setTempCourses(tempCourses.filter((_, i) => i !== idx))} className="btn-del-item"><i className="fa fa-trash-alt"></i></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer-pro">
                            <button onClick={() => setIsModalOpen(false)} className="btn-cancel-pro">HỦY BỎ</button>
                            <button onClick={handleSave} className="btn-save-pro">LƯU THAY ĐỔI</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XEM CHI TIẾT (PREVIEW) - GIỐNG TRANG KHÁM PHÁ */}
            {isPreviewOpen && viewData && (
                <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
                    <div className="pro-modal-v2" onClick={e => e.stopPropagation()} style={{ width: '650px' }}>
                        <div className="modal-header-pro">
                            <div>
                                <h2 style={{ fontSize: '1.3rem' }}>{viewData.title}</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Tác giả: <strong>{viewData.author}</strong></p>
                            </div>
                            <button onClick={() => setIsPreviewOpen(false)} className="close-x">×</button>
                        </div>
                        <div className="modal-body-pro" style={{ background: '#f8fafc' }}>
                            <div style={{ padding: '10px' }}>
                                {viewData.steps.length > 0 ? viewData.steps.map((step: any, i: number) => (
                                    <div key={i} className="course-item-card" style={{ marginBottom: '15px', borderLeft: '4px solid #2563eb' }}>
                                        <div className="course-rank" style={{ background: '#2563eb' }}>{i + 1}</div>
                                        <img 
                                            src={step.hinhAnh ? `/img/${step.hinhAnh}` : 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'} 
                                            className="course-img-small"
                                            onError={(e) => (e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg')}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{step.ten}</h4>
                                            <span className="badge-status" style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534' }}>{step.trangThai || "Bắt buộc"}</span>
                                        </div>
                                    </div>
                                )) : <p className="text-center">Dữ liệu lộ trình đang được xử lý...</p>}
                            </div>
                        </div>
                        <div className="modal-footer-pro">
                            <button onClick={() => setIsPreviewOpen(false)} className="btn-cancel-pro">ĐÓNG</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .quan-ly-container, .pro-modal-v2 { font-family: 'Inter', sans-serif !important; }
                .btn-add-main { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; color: white !important; border: none !important; padding: 12px 25px !important; border-radius: 12px !important; font-weight: 700 !important; cursor: pointer !important; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3) !important; transition: 0.3s !important; }
                .btn-add-main:hover { transform: translateY(-2px); filter: brightness(1.1); }
                .course-rank { width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
                .st-req { background: #fee2e2; color: #dc2626; }
                .st-opt { background: #fef3c7; color: #d97706; }
                .btn-save-pro { background: #10b981; color: white; border: none; padding: 12px 35px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-save-pro:hover { background: #059669; transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

export default QuanLyLoTrinh;
