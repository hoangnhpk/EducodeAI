import React, { useState, useEffect } from 'react';
import './QuanLyHocVien.css';
import {
    BsCheckCircleFill, BsXCircleFill, BsPersonPlusFill, BsSearch,
    BsPencilSquare, BsTrashFill, BsPersonFill, BsExclamationTriangleFill,
    BsChevronLeft, BsChevronRight
} from 'react-icons/bs';

interface HocVien { maNguoiDung: number; hoTen: string; email: string; anhDaiDien: string | null; trangThai: string; ngayThamGia: string; lyDoKhoa?: string | null; }
interface FilterParams { Keyword: string; TrangThai: string; Page: number; PageSize: number; }

//  THÊM trangThai và lyDoKhoa VÀO STATE
interface FormDataState { maNguoiDung: number | ''; hoTen: string; email: string; matKhauMoi: string; trangThai: string; lyDoKhoa: string; }
interface FormErrors { hoTen: string; email: string; matKhauMoi: string; lyDoKhoa: string; }

const TABS = ['Tất cả', 'Hoạt động', 'Bị khóa'];

export default function QuanLyHocVien() {
    const [hocViens, setHocViens] = useState<HocVien[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<string>('Tất cả');
    const [searchInput, setSearchInput] = useState<string>('');
    const [filters, setFilters] = useState<FilterParams>({ Keyword: '', TrangThai: '', Page: 1, PageSize: 10 });

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    //  KHỞI TẠO STATE CÓ THÊM TRẠNG THÁI VÀ LÝ DO
    const [formData, setFormData] = useState<FormDataState>({ maNguoiDung: '', hoTen: '', email: '', matKhauMoi: '', trangThai: 'Hoạt động', lyDoKhoa: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({ hoTen: '', email: '', matKhauMoi: '', lyDoKhoa: '' });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchHocViens = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(Object.entries(filters).reduce((acc, [key, val]) => { acc[key] = String(val); return acc; }, {} as Record<string, string>)).toString();
            const response = await fetch(`${API_URL}/api/admin/hoc-vien?${queryParams}`);
            const result = await response.json();
            if (result.success) { setHocViens(result.data.data); setTotal(result.data.total); }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchHocViens(); }, [filters.Page, filters.TrangThai, filters.Keyword]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);

        // Đơn giản là bấm tab nào gửi thẳng tên tab đó xuống Backend, bấm "Tất cả" thì gửi rỗng
        setFilters({
            ...filters,
            TrangThai: tab === 'Tất cả' ? '' : tab,
            Page: 1
        });
    };
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setFilters({ ...filters, Keyword: searchInput, Page: 1 }); };

    const handleDeleteClick = (id: number) => { setStudentToDelete(id); setIsDeleteModalOpen(true); };

    const confirmDelete = async () => {
        if (studentToDelete === null) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/hoc-vien/${studentToDelete}`, { method: 'DELETE' });
            if (res.ok) { showToast("Đã xóa học viên thành công!", "success"); fetchHocViens(); }
            else { showToast("Xóa thất bại. Có lỗi xảy ra!", "error"); }
        } catch (error) { showToast("Lỗi kết nối Server!", "error"); }
        finally { setIsDeleteModalOpen(false); setStudentToDelete(null); }
    };

    const openModal = (mode: 'add' | 'edit', hv: HocVien | null = null) => {
        setModalMode(mode);
        setFormErrors({ hoTen: '', email: '', matKhauMoi: '', lyDoKhoa: '' });

        if (mode === 'edit' && hv) {
            setFormData({
                maNguoiDung: hv.maNguoiDung,
                hoTen: hv.hoTen,
                email: hv.email,
                matKhauMoi: '',
                trangThai: hv.trangThai || 'Hoạt động',
                lyDoKhoa: hv.lyDoKhoa || ''
            });
        } else {
            setFormData({ maNguoiDung: '', hoTen: '', email: '', matKhauMoi: '', trangThai: 'Hoạt động', lyDoKhoa: '' });
        }
        setIsModalOpen(true);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        const errors: FormErrors = { hoTen: '', email: '', matKhauMoi: '', lyDoKhoa: '' };

        if (!formData.hoTen.trim()) { errors.hoTen = 'Họ tên không được trống'; isValid = false; }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { errors.email = 'Email không hợp lệ'; isValid = false; }
        if (modalMode === 'add' && (!formData.matKhauMoi || formData.matKhauMoi.length < 8)) { errors.matKhauMoi = 'Mật khẩu >= 8 ký tự'; isValid = false; }

        // 🔴 BẮT LỖI LÝ DO KHÓA
        if (modalMode === 'edit' && formData.trangThai === 'Bị khóa' && !formData.lyDoKhoa.trim()) {
            errors.lyDoKhoa = 'Vui lòng nhập lý do khóa tài khoản học viên này!';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        const url = modalMode === 'add' ? `${API_URL}/api/admin/hoc-vien` : `${API_URL}/api/admin/hoc-vien/${formData.maNguoiDung}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        //  ĐÓNG GÓI JSON GỬI LÊN BE BAO GỒM CẢ TRẠNG THÁI VÀ LÝ DO KHÓA
        const payload = {
            HoTen: formData.hoTen,
            Email: formData.email,
            ...(modalMode === 'add' ? { MatKhau: formData.matKhauMoi } : {
                MatKhauMoi: formData.matKhauMoi,
                TrangThai: formData.trangThai,
                LyDoKhoa: formData.trangThai === 'Bị khóa' ? formData.lyDoKhoa : null
            })
        };

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(false);
                fetchHocViens();
                showToast(data.message || (modalMode === 'add' ? "Thêm mới thành công!" : "Cập nhật thành công!"), "success");
            } else {
                showToast(data.message || "Lỗi lưu dữ liệu!", "error");
                setFormErrors({ ...formErrors, email: data.message });
            }
        } catch (error) { showToast("Lỗi kết nối Server!", "error"); }
    };

    const totalPages = Math.ceil(total / filters.PageSize);

    return (
        <div className="qlhv-container relative">
            {toast && (
                <div className={`qlhv-toast ${toast.type}`}>
                    {toast.type === 'success' ? <BsCheckCircleFill size={20} /> : <BsXCircleFill size={20} />}
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="qlhv-header">
                <div>
                    <h1 className="qlhv-title">Quản Lý Học Viên</h1>
                    <p className="qlhv-subtitle">Quản lý tài khoản và trạng thái của học viên trong hệ thống.</p>
                </div>
                <button onClick={() => openModal('add')} className="qlhv-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BsPersonPlusFill size={18} /> Thêm học viên
                </button>
            </div>

            <div className="qlhv-card">
                <div className="qlhv-tabs">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => handleTabChange(tab)} className={`qlhv-tab-btn ${activeTab === tab ? 'active' : ''}`}>{tab}</button>
                    ))}
                </div>

                <div className="qlhv-filter-bar">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input type="text" placeholder="Tìm theo Mã, Họ tên hoặc Email..." className="qlhv-input" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                        <button type="submit" className="qlhv-btn-search" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BsSearch /> Tìm kiếm
                        </button>
                    </form>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="qlhv-table">
                        <thead>
                            <tr><th>Mã Học Viên</th><th>Học Viên</th><th>Email</th><th>Trạng thái</th><th style={{ textAlign: 'right' }}>Hành động</th></tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#f97316' }}>Đang tải...</td></tr> :
                                hocViens.map(hv => (
                                    <tr key={hv.maNguoiDung}>
                                        <td style={{ color: '#9ca3af' }}>#{hv.maNguoiDung}</td>
                                        <td>
                                            <div className="qlhv-td-user">
                                                <div className="qlhv-avatar">
                                                    {hv.anhDaiDien ? <img src={`${API_URL}${hv.anhDaiDien}`} alt="avt" /> : <BsPersonFill size={24} color="#f97316" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{hv.hoTen}</div>
                                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Tham gia: {new Date(hv.ngayThamGia).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{hv.email}</td>
                                        <td><span className={`qlhv-badge ${hv.trangThai === 'Hoạt động' ? 'active' : 'locked'}`}>{hv.trangThai}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openModal('edit', hv)} className="qlhv-action-btn qlhv-btn-edit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <BsPencilSquare /> Sửa
                                            </button>
                                            <button onClick={() => handleDeleteClick(hv.maNguoiDung)} className="qlhv-action-btn qlhv-btn-delete" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <BsTrashFill /> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            {!loading && hocViens.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {totalPages > 0 && (
                    <div className="qlhv-pagination">
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Trang <b style={{ color: '#ea580c' }}>{filters.Page}</b> / {totalPages}</span>
                        <div>
                            <button
                                disabled={filters.Page === 1}
                                onClick={() => setFilters({ ...filters, Page: filters.Page - 1 })}
                                className="qlhv-page-btn"
                                aria-label="Trang trước"
                                title="Trang trước"
                            >
                                <BsChevronLeft size={18} />
                            </button>
                            <button
                                disabled={filters.Page >= totalPages}
                                onClick={() => setFilters({ ...filters, Page: filters.Page + 1 })}
                                className="qlhv-page-btn"
                                aria-label="Trang sau"
                                title="Trang sau"
                            >
                                <BsChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa */}
            {isModalOpen && (
                <div className="qlhv-modal-overlay">
                    <div className="qlhv-modal-content">
                        <h2 className="qlhv-title" style={{ marginBottom: '24px' }}>{modalMode === 'add' ? 'Thêm Học Viên' : 'Cập Nhật Học Viên'}</h2>
                        <form onSubmit={handleSave} noValidate>
                            <div className="qlhv-form-group">
                                <label>Họ và tên</label>
                                <input type="text" className="qlhv-input" style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.hoTen ? '#ef4444' : '' }} value={formData.hoTen} onChange={e => { setFormData({ ...formData, hoTen: e.target.value }); setFormErrors({ ...formErrors, hoTen: '' }); }} />
                                {formErrors.hoTen && <span className="qlhv-error-text">{formErrors.hoTen}</span>}
                            </div>

                            <div className="qlhv-form-group">
                                <label>Email</label>
                                <input type="email" className="qlhv-input" style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.email ? '#ef4444' : '' }} value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }} />
                                {formErrors.email && <span className="qlhv-error-text">{formErrors.email}</span>}
                            </div>

                            <div className="qlhv-form-group">
                                <label>{modalMode === 'add' ? 'Mật khẩu' : 'Mật khẩu mới (Bỏ trống nếu không đổi)'}</label>
                                <input type="password" className="qlhv-input" style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.matKhauMoi ? '#ef4444' : '' }} value={formData.matKhauMoi} onChange={e => { setFormData({ ...formData, matKhauMoi: e.target.value }); setFormErrors({ ...formErrors, matKhauMoi: '' }); }} />
                                {formErrors.matKhauMoi && <span className="qlhv-error-text">{formErrors.matKhauMoi}</span>}
                            </div>

                            {/*  HIỂN THỊ CHỌN TRẠNG THÁI KHI Ở CHẾ ĐỘ SỬA */}
                            {modalMode === 'edit' && (
                                <div className="qlhv-form-group">
                                    <label>Trạng thái tài khoản</label>
                                    <select
                                        className="qlhv-input"
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                        value={formData.trangThai}
                                        onChange={e => {
                                            setFormData({ ...formData, trangThai: e.target.value });
                                            if (e.target.value === 'Hoạt động') setFormErrors({ ...formErrors, lyDoKhoa: '' });
                                        }}
                                    >
                                        <option value="Hoạt động">Hoạt động</option>
                                        <option value="Bị khóa">Khóa tài khoản</option>
                                    </select>
                                </div>
                            )}

                            {/*  HIỂN THỊ Ô NHẬP LÝ DO KHI CHỌN "BỊ KHÓA" */}
                            {modalMode === 'edit' && formData.trangThai === 'Bị khóa' && (
                                <div className="qlhv-form-group" style={{ animation: 'fadeIn 0.3s' }}>
                                    <label>Lý do khóa <span style={{ color: '#ef4444' }}>*</span></label>
                                    <textarea
                                        className="qlhv-input"
                                        placeholder="Nhập lý do vi phạm hoặc khóa tài khoản..."
                                        style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.lyDoKhoa ? '#ef4444' : '' }}
                                        value={formData.lyDoKhoa}
                                        onChange={e => { setFormData({ ...formData, lyDoKhoa: e.target.value }); setFormErrors({ ...formErrors, lyDoKhoa: '' }); }}
                                    />
                                    {formErrors.lyDoKhoa && <span className="qlhv-error-text">{formErrors.lyDoKhoa}</span>}
                                </div>
                            )}

                            <div className="qlhv-modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="qlhv-btn-cancel">Hủy bỏ</button>
                                <button type="submit" className="qlhv-btn-primary">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xác nhận Xóa */}
            {isDeleteModalOpen && (
                <div className="qlhv-modal-overlay">
                    <div className="qlhv-modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <BsExclamationTriangleFill size={56} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
                            Xác nhận xóa?
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '28px', lineHeight: '1.5' }}>
                            Bạn có chắc chắn muốn xóa học viên này khỏi hệ thống? Hành động này <b style={{ color: '#ef4444' }}>không thể hoàn tác</b>.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="qlhv-btn-cancel">
                                Quay lại
                            </button>
                            <button onClick={confirmDelete} className="qlhv-btn-danger">
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}