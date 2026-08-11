import { useState, useEffect, type MouseEvent } from 'react';
import Swal from 'sweetalert2';
import { getAccessToken } from '../../../utils/authStorage';
import './QuanLyLoTrinh.css';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5210').replace(/\/$/, '');

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
    const [isSaving, setIsSaving] = useState(false);
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
            const response = await fetch(`${API_BASE}/api/giangvien/quan-ly-lo-trinh/danh-sach`, {
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
            const response = await fetch(`${API_BASE}/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error('Không tải được danh sách khóa học', response.status);
                return [];
            }
            const result = await response.json();
            const data = result.success ? (result.data ?? []) : [];
            setKhoaHocCoSan(data);
            return data as IKhoaHocGoc[];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    useEffect(() => { fetchDanhSach(); void fetchKhoaHocCoSan(); }, []);

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
                const found = khoaHocCoSan.find(k => k.tenKhoaHoc.toLowerCase().includes((step.ten || "").toLowerCase()));
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

    const openEdit = async (item: LoTrinhAI) => {
        const isPrompt = item.yeuCau && item.yeuCau.length > 50;
        const backupTitle = isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau;
        const clean = getCleanContent(item.noiDungJSON, backupTitle);

        let danhSachKH = khoaHocCoSan;
        if (danhSachKH.length === 0) {
            danhSachKH = await fetchKhoaHocCoSan();
        }

        setIsEditMode(true);
        setEditingItem({ ...item, yeuCau: clean.title });

        const autoMatchedCourses = clean.steps.map((step: any) => {
            let mk = step.maKhoaHoc;
            let img = step.hinhAnh;
            let name = step.ten;

            if (!mk && danhSachKH.length > 0) {
                const found = danhSachKH.find(k =>
                    k.tenKhoaHoc.toLowerCase().includes((name || "").toLowerCase()) ||
                    (name || "").toLowerCase().includes(k.tenKhoaHoc.toLowerCase())
                );
                if (found) {
                    mk = found.maKhoaHoc; img = found.hinhAnh; name = found.tenKhoaHoc;
                } else {
                    mk = danhSachKH[0].maKhoaHoc; img = danhSachKH[0].hinhAnh; name = danhSachKH[0].tenKhoaHoc;
                }
            }

            let tt = step.trangThai;
            if (tt !== "Bắt buộc" && tt !== "Nâng cao") tt = "Bắt buộc";

            return { maKhoaHoc: mk, ten: name, hinhAnh: img, trangThai: tt };
        });

        setTempCourses(autoMatchedCourses);
        setIsModalOpen(true);
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
                    const res = await fetch(`${API_BASE}/api/giangvien/quan-ly-lo-trinh/xoa/${id}`, {
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

    const dongModal = () => {
        if (isSaving) return;
        setIsModalOpen(false);
    };

    const handleSave = async (e?: MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (isSaving) return;

        const tenLoTrinh = (editingItem?.yeuCau || "").trim();
        if (!tenLoTrinh) {
            await Swal.fire("Cảnh báo", "Vui lòng nhập tên lộ trình!", "warning");
            return;
        }
        if (tempCourses.length === 0) {
            await Swal.fire("Cảnh báo", "Chưa có khóa học nào!", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const token = getAccessToken();
            const method = isEditMode ? "PUT" : "POST";
            const url = isEditMode
                ? `${API_BASE}/api/giangvien/quan-ly-lo-trinh/cap-nhat/${editingItem?.maLoTrinh}`
                : `${API_BASE}/api/giangvien/quan-ly-lo-trinh/them-moi`;

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    YeuCau: tenLoTrinh,
                    TrangThai: editingItem?.trangThai || "Hoạt động",
                    NoiDungJSON: JSON.stringify(tempCourses),
                }),
            });

            if (response.ok) {
                setIsModalOpen(false);
                await fetchDanhSach();
                await Swal.fire(
                    "Thành công",
                    isEditMode ? "Cập nhật thành công!" : "Đã tạo lộ trình mới!",
                    "success"
                );
            } else {
                let message = "Lỗi từ Backend";
                try {
                    const err = await response.json();
                    message = err.message || err.thongBao || message;
                } catch {
                    /* ignore parse error */
                }
                await Swal.fire("Lỗi", message, "error");
            }
        } catch (error) {
            console.error(error);
            await Swal.fire("Lỗi", "Không kết nối được tới máy chủ. Vui lòng thử lại.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const addCourse = async () => {
        let danhSachKH = khoaHocCoSan;
        if (danhSachKH.length === 0) {
            danhSachKH = await fetchKhoaHocCoSan();
        }
        if (danhSachKH.length === 0) {
            await Swal.fire(
                "Chưa có khóa học",
                "Không tải được danh sách khóa học của bạn. Hãy tạo khóa học trước, hoặc kiểm tra kết nối API.",
                "warning"
            );
            return;
        }
        const firstKH = danhSachKH[0];
        setTempCourses((prev) => [
            ...prev,
            {
                maKhoaHoc: firstKH.maKhoaHoc,
                ten: firstKH.tenKhoaHoc,
                hinhAnh: firstKH.hinhAnh,
                trangThai: "Bắt buộc",
            },
        ]);
    };

    const moModalTaoMoi = async () => {
        setIsEditMode(false);
        setEditingItem({ yeuCau: "", trangThai: "Hoạt động" });
        setTempCourses([]);
        setIsModalOpen(true);
        if (khoaHocCoSan.length === 0) {
            await fetchKhoaHocCoSan();
        }
    };

    const handleCourseSelect = (idx: number, maKH: number) => {
        const skh = khoaHocCoSan.find(k => k.maKhoaHoc === maKH);
        if (skh) setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, maKhoaHoc: skh.maKhoaHoc, ten: skh.tenKhoaHoc, hinhAnh: skh.hinhAnh } : c));
    };

    return (
        <div className="gv-page ql-lt-page">
            <div className="ql-lt-top">
                <div>
                    <h1 className="ql-lt-title">Quản lý lộ trình</h1>
                    <p className="ql-lt-subtitle">Theo dõi và tinh chỉnh các kế hoạch học tập trên hệ thống</p>
                </div>
                <button
                    type="button"
                    className="ql-lt-btn-add"
                    onClick={() => void moModalTaoMoi()}
                >
                    <i className="fas fa-plus" aria-hidden="true" />
                    Tạo lộ trình mới
                </button>
            </div>

            {!isLoading && danhSach.length > 0 && (
                <div className="ql-lt-stats">
                    <div className="ql-lt-stat">
                        <div className="ql-lt-stat-icon ql-lt-stat-icon--primary"><i className="fas fa-route" aria-hidden="true" /></div>
                        <div>
                            <div className="ql-lt-stat-value">{danhSach.length}</div>
                            <div className="ql-lt-stat-label">Tổng lộ trình</div>
                        </div>
                    </div>
                    <div className="ql-lt-stat">
                        <div className="ql-lt-stat-icon ql-lt-stat-icon--success"><i className="fas fa-check-circle" aria-hidden="true" /></div>
                        <div>
                            <div className="ql-lt-stat-value">
                                {danhSach.filter((x) => String(x.trangThai || "").toLowerCase().includes("hoạt")).length}
                            </div>
                            <div className="ql-lt-stat-label">Đang hoạt động</div>
                        </div>
                    </div>
                    <div className="ql-lt-stat">
                        <div className="ql-lt-stat-icon ql-lt-stat-icon--info"><i className="fas fa-layer-group" aria-hidden="true" /></div>
                        <div>
                            <div className="ql-lt-stat-value">
                                {danhSach.reduce((sum, item) => {
                                    const isPrompt = item.yeuCau && item.yeuCau.length > 50;
                                    const clean = getCleanContent(item.noiDungJSON, isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau);
                                    return sum + (clean.steps?.length || 0);
                                }, 0)}
                            </div>
                            <div className="ql-lt-stat-label">Tổng khóa trong lộ trình</div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="ql-lt-loading">
                    <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p>Đang tải danh sách lộ trình...</p>
                </div>
            ) : danhSach.length === 0 ? (
                <div className="ql-lt-empty">
                    <div className="ql-lt-empty-icon" aria-hidden="true"><i className="fas fa-map-signs" /></div>
                    <p className="ql-lt-empty-title">Chưa có lộ trình nào</p>
                    <p>Tạo lộ trình đầu tiên để bắt đầu quản lý học tập.</p>
                    <button
                        type="button"
                        className="ql-lt-btn-add"
                        onClick={() => void moModalTaoMoi()}
                    >
                        <i className="fas fa-plus" aria-hidden="true" />
                        Tạo lộ trình mới
                    </button>
                </div>
            ) : (
                <div className="ql-lt-grid">
                    {danhSach.map((item) => {
                        const isPrompt = item.yeuCau && item.yeuCau.length > 50;
                        const backupTitle = isPrompt ? "Lộ trình tùy chỉnh" : item.yeuCau;
                        const clean = getCleanContent(item.noiDungJSON, backupTitle);
                        const soBuoc = Array.isArray(clean.steps) ? clean.steps.length : 0;
                        const isActive = String(item.trangThai || "").toLowerCase().includes("hoạt");
                        const previewSteps = (clean.steps || []).slice(0, 3);

                        return (
                            <article key={item.maLoTrinh} className="ql-lt-card">
                                <div className="ql-lt-card-body">
                                    <div className="ql-lt-card-heading">
                                        <h3 className="ql-lt-card-title" title={clean.title}>{clean.title}</h3>
                                        <span className={`ql-lt-badge ${isActive ? "is-active" : "is-idle"}`}>
                                            {item.trangThai || "—"}
                                        </span>
                                    </div>

                                    <div className="ql-lt-card-meta">
                                        <span><i className="far fa-user" aria-hidden="true" /> {item.tenNguoiTao || "Hệ thống"}</span>
                                        <span><i className="far fa-calendar" aria-hidden="true" /> {new Date(item.ngayTao).toLocaleDateString("vi-VN")}</span>
                                    </div>

                                    <div className="ql-lt-steps">
                                        {previewSteps.length > 0 ? previewSteps.map((step: any, idx: number) => (
                                            <div key={`${item.maLoTrinh}-${idx}`} className="ql-lt-step">
                                                <span className="ql-lt-step-num">{idx + 1}</span>
                                                <span className="ql-lt-step-name">{step.ten || `Khóa học ${idx + 1}`}</span>
                                            </div>
                                        )) : (
                                            <div className="ql-lt-step ql-lt-step--empty">Chưa gắn khóa học</div>
                                        )}
                                        {soBuoc > 3 && (
                                            <div className="ql-lt-step-more">+{soBuoc - 3} khóa khác</div>
                                        )}
                                    </div>

                                    <div className="ql-lt-card-footer">
                                        <span className="ql-lt-course-count">
                                            <i className="fas fa-book-open" aria-hidden="true" />
                                            {soBuoc} khóa học
                                        </span>
                                        <div className="ql-lt-actions">
                                            <button type="button" className="ql-lt-btn ql-lt-btn-view" onClick={() => handlePreview(item)}>
                                                Xem
                                            </button>
                                            <button type="button" className="ql-lt-btn ql-lt-btn-edit" onClick={() => void openEdit(item)}>
                                                Sửa
                                            </button>
                                            <button type="button" className="ql-lt-btn ql-lt-btn-delete" onClick={() => handleDeleteMain(item.maLoTrinh)}>
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* MODAL THÊM / SỬA */}
            {isModalOpen && editingItem && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) dongModal();
                    }}
                >
                    <div className="pro-modal-v2" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                        <div className="modal-header-pro">
                            <h2>{isEditMode ? "Chỉnh sửa Lộ trình" : "Tạo mới Lộ trình"}</h2>
                            <button type="button" onClick={dongModal} className="close-x" disabled={isSaving} aria-label="Đóng">×</button>
                        </div>

                        <div className="modal-body-pro">
                            <div className="form-group-pro" style={{ marginBottom: "25px" }}>
                                <label style={{ display: "block", fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem", marginBottom: "8px" }}>
                                    Tên lộ trình tổng quát <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="input-pro"
                                    value={editingItem.yeuCau}
                                    onChange={(e) => setEditingItem({ ...editingItem, yeuCau: e.target.value })}
                                    placeholder="Ví dụ: Lập trình Web từ A-Z"
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="roadmap-section">
                                <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", paddingBottom: "10px", borderBottom: "2px dashed var(--border-color)" }}>
                                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--text-dark)" }}>Cấu trúc các chặng học</h3>
                                    <button type="button" onClick={() => void addCourse()} className="btn-select-kh" disabled={isSaving}>
                                        <i className="fa fa-plus me-1"></i> Thêm khóa học
                                    </button>
                                </div>

                                <div className="course-scroll-area" style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
                                    {tempCourses.length === 0 ? (
                                        <div className="empty-state-pro">
                                            <i className="fa fa-folder-open" style={{ fontSize: "3rem", color: "var(--text-light)", marginBottom: "15px" }}></i>
                                            <p style={{ margin: 0, fontWeight: 600, color: "var(--text-muted)" }}>Chưa có khóa học nào</p>
                                        </div>
                                    ) : tempCourses.map((course, idx) => (
                                        <div key={idx} className="course-item-card">
                                            <div className="course-rank">{idx + 1}</div>
                                            <img src={getImgUrl(course.hinhAnh)} className="course-img-small" onError={(e) => (e.currentTarget.src = "https://careplusvn.com/Uploads/t/de/default-image_730.jpg")} alt="" />
                                            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "5px", textTransform: "uppercase" }}>Khóa học</label>
                                                <select className="select-pro" value={course.maKhoaHoc} disabled={isSaving} onChange={(e) => handleCourseSelect(idx, parseInt(e.target.value, 10))}>
                                                    {khoaHocCoSan.map((k) => (
                                                        <option key={k.maKhoaHoc} value={k.maKhoaHoc}>{k.tenKhoaHoc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ flex: "0 0 130px" }}>
                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "5px", textTransform: "uppercase" }}>Trạng thái</label>
                                                <select
                                                    className={course.trangThai === "Bắt buộc" ? "st-req" : "st-opt"}
                                                    value={course.trangThai}
                                                    disabled={isSaving}
                                                    onChange={(e) => setTempCourses((prev) => prev.map((c, i) => (i === idx ? { ...c, trangThai: e.target.value } : c)))}
                                                >
                                                    <option value="Bắt buộc">Bắt buộc</option>
                                                    <option value="Nâng cao">Nâng cao</option>
                                                </select>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setTempCourses(tempCourses.filter((_, i) => i !== idx))}
                                                    className="btn-del-item"
                                                    title="Xóa chặng này"
                                                    disabled={isSaving}
                                                >
                                                    <i className="fa fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-pro">
                            <button type="button" onClick={dongModal} className="btn-cancel-pro" disabled={isSaving}>
                                HỦY BỎ
                            </button>
                            <button type="button" onClick={handleSave} className="btn-save-pro" disabled={isSaving}>
                                {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                            </button>
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
        </div>
    );
};

export default QuanLyLoTrinh;