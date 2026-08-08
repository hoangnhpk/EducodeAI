import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAccessToken } from '../../../utils/authStorage';
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

    const getImgUrl = (imgStr: string) => {
        if (!imgStr) return 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png';
        if (imgStr.startsWith('http')) return imgStr;
        return `/img/${imgStr}`;
    };

    const handlePreview = (item: LoTrinhAI) => {
        const isPrompt = item.yeuCau && item.yeuCau.length > 50;
        const backupTitle = isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau;
        const clean = getCleanContent(item.noiDungJSON, backupTitle);

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
                    NoiDungJSON: JSON.stringify(tempCourses)
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

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingItem({ yeuCau: '', trangThai: 'Hoạt động' });
        setTempCourses([]);
        setIsModalOpen(true);
    };

    const openEditModal = (item: LoTrinhAI, clean: { title: string; steps: any[] }) => {
        setIsEditMode(true);
        setEditingItem({ ...item, yeuCau: clean.title });

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

            let tt = step.trangThai;
            if (tt !== 'Bắt buộc' && tt !== 'Nâng cao') tt = 'Bắt buộc';

            return { maKhoaHoc: mk, ten: name, hinhAnh: img, trangThai: tt };
        });

        setTempCourses(autoMatchedCourses);
        setIsModalOpen(true);
    };

    return (
        <div className="ql-lt-page">
            <div className="ql-lt-header">
                <div>
                    <h1>Quản lý tổng hợp lộ trình</h1>
                    <p>Theo dõi và tinh chỉnh tất cả kế hoạch học tập trên hệ thống</p>
                </div>
                <button type="button" onClick={openCreateModal} className="ql-lt-btn-add">
                    <i className="bi bi-plus-lg" aria-hidden="true" />
                    Thêm lộ trình
                </button>
            </div>

            <div className="ql-lt-grid">
                {isLoading ? (
                    <div className="ql-lt-state">
                        <div className="ql-lt-spinner" role="status" aria-label="Đang tải" />
                        <strong>Đang tải danh sách lộ trình...</strong>
                    </div>
                ) : danhSach.length === 0 ? (
                    <div className="ql-lt-state">
                        <strong>Chưa có lộ trình nào</strong>
                        <span>Nhấn “Thêm lộ trình” để tạo mới.</span>
                    </div>
                ) : danhSach.map((item) => {
                    const isPrompt = item.yeuCau && item.yeuCau.length > 50;
                    const backupTitle = isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau;
                    const clean = getCleanContent(item.noiDungJSON, backupTitle);
                    const courseCount = clean.steps.length;

                    return (
                        <article key={item.maLoTrinh} className="ql-lt-card">
                            <div className="ql-lt-card-body">
                                <div className="ql-lt-card-top">
                                    <span className="ql-lt-badge">{item.trangThai}</span>
                                    <span className="ql-lt-author" title={item.tenNguoiTao || "Hệ thống"}>
                                        Bởi: {item.tenNguoiTao || "Hệ thống"}
                                    </span>
                                </div>

                                <h3 className="ql-lt-card-title">{clean.title}</h3>

                                <div className="ql-lt-meta">
                                    <span className="ql-lt-id">#{item.maLoTrinh}</span>
                                    <span className="ql-lt-meta-item">
                                        Cập nhật: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className="ql-lt-meta-item">
                                        {courseCount} khóa học
                                    </span>
                                </div>
                            </div>

                            <div className="ql-lt-card-actions">
                                <button type="button" onClick={() => handlePreview(item)} className="ql-lt-action ql-lt-action--view">
                                    <i className="bi bi-eye" aria-hidden="true" />
                                    Xem
                                </button>
                                <button type="button" onClick={() => openEditModal(item, clean)} className="ql-lt-action ql-lt-action--edit">
                                    <i className="bi bi-pencil" aria-hidden="true" />
                                    Sửa
                                </button>
                                <button type="button" onClick={() => handleDeleteMain(item.maLoTrinh)} className="ql-lt-action ql-lt-action--delete">
                                    <i className="bi bi-trash" aria-hidden="true" />
                                    Xóa
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {isModalOpen && editingItem && (
                <div className="ql-lt-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="ql-lt-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                        <div className="ql-lt-modal-header">
                            <h2>{isEditMode ? 'Chỉnh sửa lộ trình' : 'Tạo mới lộ trình'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="ql-lt-close" aria-label="Đóng">×</button>
                        </div>

                        <div className="ql-lt-modal-body">
                            <div className="ql-lt-field">
                                <label>
                                    Tên lộ trình tổng quát <span>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="ql-lt-input"
                                    value={editingItem.yeuCau}
                                    onChange={(e) => setEditingItem({ ...editingItem, yeuCau: e.target.value })}
                                    placeholder="Ví dụ: Lập trình Web từ A-Z"
                                />
                            </div>

                            <div className="ql-lt-section-head">
                                <h3>Cấu trúc các chặng học</h3>
                                <button type="button" onClick={addCourse} className="ql-lt-btn-ghost">
                                    <i className="bi bi-plus me-1" aria-hidden="true" />
                                    Thêm khóa học
                                </button>
                            </div>

                            <div className="ql-lt-scroll">
                                {tempCourses.length === 0 ? (
                                    <div className="ql-lt-empty-box">Chưa có khóa học nào trong lộ trình</div>
                                ) : tempCourses.map((course, idx) => (
                                    <div key={idx} className="ql-lt-course">
                                        <div className="ql-lt-rank">{idx + 1}</div>
                                        <img
                                            src={getImgUrl(course.hinhAnh)}
                                            className="ql-lt-course-img"
                                            alt=""
                                            onError={(e) => { e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg'; }}
                                        />
                                        <div className="ql-lt-course-fields">
                                            <div>
                                                <label>Khóa học</label>
                                                <select
                                                    className="ql-lt-select"
                                                    value={course.maKhoaHoc}
                                                    onChange={(e) => handleCourseSelect(idx, parseInt(e.target.value))}
                                                >
                                                    {khoaHocCoSan.map(k => (
                                                        <option key={k.maKhoaHoc} value={k.maKhoaHoc}>{k.tenKhoaHoc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label>Trạng thái</label>
                                                <select
                                                    className={`ql-lt-select ${course.trangThai === 'Bắt buộc' ? 'ql-lt-st-req' : 'ql-lt-st-opt'}`}
                                                    value={course.trangThai}
                                                    onChange={(e) => setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, trangThai: e.target.value } : c))}
                                                >
                                                    <option value="Bắt buộc">Bắt buộc</option>
                                                    <option value="Nâng cao">Nâng cao</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTempCourses(tempCourses.filter((_, i) => i !== idx))}
                                            className="ql-lt-btn-icon"
                                            title="Xóa chặng này"
                                            aria-label="Xóa chặng này"
                                        >
                                            <i className="bi bi-trash" aria-hidden="true" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ql-lt-modal-footer">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="ql-lt-btn-cancel">Hủy bỏ</button>
                            <button type="button" onClick={handleSave} className="ql-lt-btn-save">Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}

            {isPreviewOpen && viewData && (
                <div className="ql-lt-overlay" onClick={() => setIsPreviewOpen(false)}>
                    <div className="ql-lt-modal ql-lt-modal--sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                        <div className="ql-lt-modal-header">
                            <div>
                                <h2>{viewData.title}</h2>
                                <p>Tác giả: <strong>{viewData.author}</strong></p>
                            </div>
                            <button type="button" onClick={() => setIsPreviewOpen(false)} className="ql-lt-close" aria-label="Đóng">×</button>
                        </div>
                        <div className="ql-lt-modal-body">
                            {viewData.steps.length > 0 ? viewData.steps.map((step: any, i: number) => (
                                <div key={i} className="ql-lt-course ql-lt-course--preview">
                                    <div className="ql-lt-rank">{i + 1}</div>
                                    <img
                                        src={getImgUrl(step.hinhAnh)}
                                        className="ql-lt-course-img"
                                        alt=""
                                        onError={(e) => { e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg'; }}
                                    />
                                    <div>
                                        <h4 className="ql-lt-course-name">{step.ten}</h4>
                                        <span className="ql-lt-chip">{step.trangThai || "Bắt buộc"}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="ql-lt-empty-box">Dữ liệu lộ trình đang được xử lý...</div>
                            )}
                        </div>
                        <div className="ql-lt-modal-footer">
                            <button type="button" onClick={() => setIsPreviewOpen(false)} className="ql-lt-btn-cancel">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyLoTrinh;
