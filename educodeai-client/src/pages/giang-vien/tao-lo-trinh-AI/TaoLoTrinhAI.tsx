import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAccessToken } from '../../../utils/authStorage';

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
    tenNguoiTao?: string;
}

const QuanLyLoTrinh = () => {
    const [danhSach, setDanhSach] = useState<LoTrinhAI[]>([]);
    const [khoaHocCoSan, setKhoaHocCoSan] = useState<IKhoaHocGoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<LoTrinhAI> | null>(null);
    const [tempCourses, setTempCourses] = useState<KhoaHocCon[]>([]);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [viewData, setViewData] = useState<{ title: string, steps: any[], author: string } | null>(null);

    // ĐÃ NÂNG CẤP LẤY LUÔN MÃ KHÓA HỌC (maKhoaHoc)
    const getCleanContent = (text: string, backupTitle: string) => {
        const fallback = { title: backupTitle || "Lộ trình AI", steps: [] };
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
                        try { jsonData = JSON.parse(raw.substring(firstBrace, i + 1)); break; } catch { continue; }
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
                                    maKhoaHoc: kh.maKhoaHoc || 0, // <-- THÊM DÒNG NÀY
                                    ten: kh.tenKhoaHoc || kh.ten || "Khóa học",
                                    trangThai: kh.ghiChu || kh.loai || kh.trangThai || "Bắt buộc",
                                    hinhAnh: kh.hinhAnh || ""
                                });
                            });
                        } else {
                            finalSteps.push({
                                maKhoaHoc: item.maKhoaHoc || 0, // <-- THÊM DÒNG NÀY
                                ten: item.ten || item.tenKhoaHoc || "Khóa học",
                                trangThai: item.trangThai || item.loai || item.ghiChu || "Bắt buộc",
                                hinhAnh: item.hinhAnh || ""
                            });
                        }
                    });
                }

                const extractedTitle = jsonData.tenLoTrinh || jsonData.TenLoTrinh || jsonData.tieuDe || jsonData.TieuDe;
                return { title: extractedTitle || backupTitle || "Lộ trình AI", steps: finalSteps };
            }
            return fallback;
        } catch { return fallback; }
    };

    const fetchDanhSach = async () => {
        setIsLoading(true);
        try {
            const token = getAccessToken();
            const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const loTrinhGoc = result.data.filter((item: LoTrinhAI) => item.trangThai !== 'Đã lưu');
                setDanhSach(loTrinhGoc);
            }
        } catch (error) { console.error(error); }
        finally { setTimeout(() => setIsLoading(false), 300); }
    };

    const fetchKhoaHocCoSan = async () => {
        try {
            const token = getAccessToken();
            const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) setKhoaHocCoSan(result.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchDanhSach(); fetchKhoaHocCoSan(); }, []);

    // HÀM HIỂN THỊ ẢNH THÔNG MINH
    const getImgUrl = (imgStr: string) => {
        if (!imgStr) return 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png';
        if (imgStr.startsWith('http')) return imgStr;
        return `/img/${imgStr}`;
    };

    const handlePreview = (item: LoTrinhAI) => {
        const isPrompt = item.yeuCau && item.yeuCau.length > 50;
        const backupTitle = isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau;
        const clean = getCleanContent(item.noiDungJSON, backupTitle);

        // Auto match để view cũng hiện đúng ảnh
        const matchedSteps = clean.steps.map((step: any) => {
            let img = step.hinhAnh;
            if (!step.maKhoaHoc && !img) {
                const found = khoaHocCoSan.find(k => k.tenKhoaHoc.toLowerCase().includes(step.ten.toLowerCase()));
                if (found) img = found.hinhAnh;
            }
            return { ...step, hinhAnh: img };
        });

        setViewData({
            title: clean.title,
            steps: matchedSteps,
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
            confirmButtonColor: 'var(--danger)',
            cancelButtonColor: 'var(--text-muted)',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = getAccessToken();
                    const res = await fetch(`https://localhost:7284/api/giangvien/quan-ly-lo-trinh/xoa/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        Swal.fire('Thành công', 'Đã xóa lộ trình!', 'success');
                        fetchDanhSach();
                    } else {
                        Swal.fire('Thất bại', 'Không thể xóa lộ trình này!', 'error');
                    }
                } catch (error) { console.error(error); }
            }
        });
    };

    const handleSave = async () => {
        if (!editingItem?.yeuCau) return Swal.fire('Cảnh báo', "Vui lòng nhập tên lộ trình!", "warning");
        if (tempCourses.length === 0) return Swal.fire('Cảnh báo', "Chưa có khóa học nào!", "warning");

        try {
            const token = getAccessToken();
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
                    NoiDungJSON: JSON.stringify(tempCourses) // Lưu chính xác mảng đã Edit
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchDanhSach();
                Swal.fire('Thành công', isEditMode ? "Cập nhật thành công!" : "Đã tạo lộ trình mới!", "success");
            } else {
                const err = await response.json();
                Swal.fire('Lỗi', err.message || 'Lỗi từ Backend', 'error');
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
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)' }}>Quản lý Tổng hợp Lộ trình</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Theo dõi và tinh chỉnh tất cả kế hoạch học tập trên hệ thống</p>
                </div>
                <button onClick={() => { setIsEditMode(false); setEditingItem({ yeuCau: '', trangThai: 'Hoạt động' }); setTempCourses([]); setIsModalOpen(true); }}
                    className="btn-add-main">+ THÊM LỘ TRÌNH</button>
            </div>

            <div className="lo-trinh-grid">
                {isLoading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Đang tải danh sách lộ trình...</p>
                    </div>
                ) : danhSach.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', background: 'var(--bg-main)', borderRadius: '16px', border: '2px dashed var(--border-color)' }}>
                        <p style={{ fontSize: '2rem', margin: 0 }}>🗺️</p>
                        <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Chưa có lộ trình nào. Nhấn "+ THÊM LỘ TRÌNH" để tạo mới.</p>
                    </div>
                ) : danhSach.map((item) => {

                    const isPrompt = item.yeuCau && item.yeuCau.length > 50;
                    const backupTitle = isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau;
                    const clean = getCleanContent(item.noiDungJSON, backupTitle);

                    return (
                        <div key={item.maLoTrinh} className="lo-trinh-card pro-card">
                            <div className="card-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span className="badge-status">● {item.trangThai}</span>
                                    <small className="text-muted" style={{ fontWeight: 600 }}>Bởi: {item.tenNguoiTao || "Hệ thống"}</small>
                                </div>
                                <h3 className="card-title">{clean.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Cập nhật: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="card-footer">
                                <span className="id-tag">#{item.maLoTrinh}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handlePreview(item)} className="btn-refresh" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Xem</button>

                                    {/* NÚT SỬA VỚI THUẬT TOÁN SMART MATCHING */}
                                    <button onClick={() => {
                                        setIsEditMode(true);
                                        setEditingItem({ ...item, yeuCau: clean.title });

                                        // Tự động map ID và Ảnh nếu AI không có
                                        const autoMatchedCourses = clean.steps.map((step: any) => {
                                            let mk = step.maKhoaHoc;
                                            let img = step.hinhAnh;
                                            let name = step.ten;

                                            if (!mk && khoaHocCoSan.length > 0) {
                                                const found = khoaHocCoSan.find(k =>
                                                    k.tenKhoaHoc.toLowerCase().includes(name.toLowerCase()) ||
                                                    name.toLowerCase().includes(k.tenKhoaHoc.toLowerCase())
                                                );
                                                if (found) {
                                                    mk = found.maKhoaHoc; img = found.hinhAnh; name = found.tenKhoaHoc;
                                                } else {
                                                    mk = khoaHocCoSan[0].maKhoaHoc; img = khoaHocCoSan[0].hinhAnh; name = khoaHocCoSan[0].tenKhoaHoc;
                                                }
                                            }

                                            // Ép chuẩn trạng thái
                                            let tt = step.trangThai;
                                            if (tt !== 'Bắt buộc' && tt !== 'Nâng cao') tt = 'Bắt buộc';

                                            return { maKhoaHoc: mk, ten: name, hinhAnh: img, trangThai: tt };
                                        });

                                        setTempCourses(autoMatchedCourses);
                                        setIsModalOpen(true);
                                    }} className="btn-edit-small" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Sửa</button>

                                    <button onClick={() => handleDeleteMain(item.maLoTrinh)} className="btn-delete-main-card" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Xóa</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL THÊM / SỬA */}
            {isModalOpen && editingItem && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="pro-modal-v2" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-pro">
                            <h2>{isEditMode ? 'Chỉnh sửa Lộ trình' : 'Tạo mới Lộ trình'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-x">×</button>
                        </div>

                        <div className="modal-body-pro">
                            <div className="form-group-pro" style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '8px' }}>
                                    Tên lộ trình tổng quát <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <input type="text" className="input-pro" value={editingItem.yeuCau} onChange={(e) => setEditingItem({ ...editingItem, yeuCau: e.target.value })} placeholder="Ví dụ: Lập trình Web từ A-Z" />
                            </div>

                            <div className="roadmap-section">
                                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px dashed var(--border-color)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>Cấu trúc các chặng học</h3>
                                    <button onClick={addCourse} className="btn-select-kh"><i className="fa fa-plus me-1"></i> Thêm khóa học</button>
                                </div>

                                <div className="course-scroll-area" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {tempCourses.length === 0 ? (
                                        <div className="empty-state-pro">
                                            <i className="fa fa-folder-open" style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }}></i>
                                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>Chưa có khóa học nào</p>
                                        </div>
                                    ) : tempCourses.map((course, idx) => (
                                        <div key={idx} className="course-item-card">
                                            <div className="course-rank">{idx + 1}</div>
                                            <img src={getImgUrl(course.hinhAnh)} className="course-img-small" onError={(e) => (e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg')} />
                                            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Khóa học</label>
                                                <select className="select-pro" value={course.maKhoaHoc} onChange={(e) => handleCourseSelect(idx, parseInt(e.target.value))}>
                                                    {khoaHocCoSan.map(k => <option key={k.maKhoaHoc} value={k.maKhoaHoc}>{k.tenKhoaHoc}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ flex: '0 0 130px' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Trạng thái</label>
                                                <select className={course.trangThai === 'Bắt buộc' ? 'st-req' : 'st-opt'} value={course.trangThai} onChange={(e) => setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, trangThai: e.target.value } : c))}>
                                                    <option value="Bắt buộc">Bắt buộc</option>
                                                    <option value="Nâng cao">Nâng cao</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                                                <button onClick={() => setTempCourses(tempCourses.filter((_, i) => i !== idx))} className="btn-del-item" title="Xóa chặng này"><i className="fa fa-trash-alt"></i></button>
                                            </div>
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

            {/* MODAL XEM CHI TIẾT */}
            {isPreviewOpen && viewData && (
                <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
                    <div className="pro-modal-v2" onClick={e => e.stopPropagation()} style={{ width: '650px' }}>
                        <div className="modal-header-pro">
                            <div>
                                <h2 style={{ fontSize: '1.3rem' }}>{viewData.title}</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tác giả: <strong>{viewData.author}</strong></p>
                            </div>
                            <button onClick={() => setIsPreviewOpen(false)} className="close-x">×</button>
                        </div>
                        <div className="modal-body-pro" style={{ background: 'var(--bg-main)' }}>
                            <div style={{ padding: '10px' }}>
                                {viewData.steps.length > 0 ? viewData.steps.map((step: any, i: number) => (
                                    <div key={i} className="course-item-card" style={{ marginBottom: '15px', borderLeft: '4px solid var(--ai-accent)' }}>
                                        <div className="course-rank" style={{ background: 'var(--ai-accent)' }}>{i + 1}</div>
                                        <img
                                            src={getImgUrl(step.hinhAnh)}
                                            className="course-img-small"
                                            onError={(e) => (e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg')}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{step.ten}</h4>
                                            <span className="badge-status" style={{ fontSize: '0.7rem', background: 'var(--success-soft)', color: 'var(--success-strong)' }}>{step.trangThai || "Bắt buộc"}</span>
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
                .quan-ly-container, .pro-modal-v2 { font-family: var(--font-main); }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(17, 24, 39, 0.5); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1050;
                }
                .pro-modal-v2 {
                    width: 800px !important; max-width: 95vw !important; background: var(--bg-card) !important;
                    border-radius: var(--radius-lg) !important; display: flex !important; flex-direction: column !important;
                    max-height: 90vh !important; box-shadow: var(--shadow-lg) !important;
                    text-align: left !important; overflow: hidden !important;
                }
                .modal-header-pro { padding: 24px 30px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); }
                .modal-header-pro h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--text-dark); }
                .close-x { width: 36px; height: 36px; background: var(--border-light); border: none; border-radius: 50%; color: var(--text-muted); font-size: 1.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); }
                .close-x:hover { background: var(--danger-soft); color: var(--danger); transform: rotate(90deg); }
                .modal-body-pro { padding: 30px; overflow-y: auto; background: var(--bg-main); flex: 1; }
                .input-pro { width: 100%; padding: 14px 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); margin-top: 8px; font-size: 0.95rem; outline: none; transition: var(--transition-fast); background: var(--bg-card); }
                .input-pro:focus { border-color: var(--ai-accent); box-shadow: 0 0 0 4px var(--ai-accent-soft); }
                .empty-state-pro { text-align: center; padding: 40px 20px; background: var(--bg-card); border: 2px dashed var(--border-color); border-radius: var(--radius-lg); }
                .btn-select-kh { background: var(--ai-accent-soft); color: var(--ai-accent-hover); border: none; padding: 8px 16px; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: var(--transition-fast); }
                .btn-select-kh:hover { background: var(--ai-accent-soft); filter: brightness(0.97); }
                .course-item-card { display: flex; align-items: center; gap: 15px; background: var(--bg-card); padding: 15px; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
                .course-img-small { width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--border-color); }
                .select-pro { border: 1.5px solid var(--border-color); background: var(--bg-main); padding: 12px; border-radius: var(--radius-sm); font-weight: 600; width: 100%; font-size: 0.9rem; outline: none; cursor: pointer;}
                .select-pro:focus { border-color: var(--ai-accent); }
                .st-req { background: var(--danger-soft); color: var(--danger-strong); padding: 12px; border-radius: var(--radius-sm); border: none; font-weight: 700; font-size: 13px; cursor: pointer; width: 100%; outline: none;}
                .st-opt { background: var(--warning-soft); color: var(--warning-strong); padding: 12px; border-radius: var(--radius-sm); border: none; font-weight: 700; font-size: 13px; cursor: pointer; width: 100%; outline: none;}
                .modal-footer-pro { padding: 20px 30px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 15px; background: var(--bg-card); }
                .btn-save-pro { background: var(--success); color: white; border: none; padding: 12px 30px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; transition: var(--transition-fast); }
                .btn-save-pro:hover { background: var(--success-strong); transform: translateY(-2px); }
                .btn-cancel-pro { background: var(--border-light); color: var(--text-main); border: none; padding: 12px 25px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; transition: var(--transition-fast); }
                .btn-cancel-pro:hover { background: var(--border-color); }
                .btn-del-item { background: none; border: none; color: var(--text-light); font-size: 1.3rem; cursor: pointer; transition: var(--transition-fast); padding: 10px 5px; }
                .btn-del-item:hover { color: var(--danger); }
                .btn-add-main { background: linear-gradient(135deg, var(--ai-accent) 0%, var(--ai-accent-hover) 100%) !important; color: white !important; border: none !important; padding: 12px 25px !important; border-radius: var(--radius-md) !important; font-weight: 700 !important; cursor: pointer !important; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3) !important; transition: var(--transition-normal) !important; }
                .btn-add-main:hover { transform: translateY(-2px); filter: brightness(1.05); }
                .course-rank { width: 32px; height: 32px; background: var(--ai-accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
                @media (prefers-reduced-motion: reduce) {
                    .close-x, .btn-add-main, .btn-save-pro { transition: none !important; }
                    .close-x:hover, .btn-add-main:hover, .btn-save-pro:hover { transform: none !important; }
                }
            `}</style>
        </div>
    );
};

export default QuanLyLoTrinh;