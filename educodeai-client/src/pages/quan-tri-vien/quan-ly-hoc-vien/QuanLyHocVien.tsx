import React, { useState, useEffect, useRef } from 'react';
import './QuanLyHocVien.css';
import Swal from 'sweetalert2';
import quaTangKhoaHocService from '@/services/qua-tang-khoa-hoc.service';
import { useModalA11y } from '@/hooks/useModalA11y';

interface HocVien { maNguoiDung: number; hoTen: string; email: string; anhDaiDien: string | null; trangThai: string; ngayThamGia: string; lyDoKhoa?: string | null; }
interface FilterParams { Keyword: string; TrangThai: string; Page: number; PageSize: number; }
interface LichSuQuaTang {
    maQuaTang: number;
    tenKhoaHoc: string;
    tenNguoiTang: string;
    tenNguoiNhan: string;
    emailNguoiNhan?: string;
    loaiNguoiTang: string;
    trangThai: string;
    createdAt: string;
}

//  THÊM trangThai và lyDoKhoa VÀO STATE
interface FormDataState { maNguoiDung: number | ''; hoTen: string; email: string; matKhauMoi: string; trangThai: string; lyDoKhoa: string; }
interface FormErrors { hoTen: string; email: string; matKhauMoi: string; lyDoKhoa: string; }

const TABS = ['Tất cả', 'Hoạt động', 'Bị khóa'];

export default function QuanLyHocVien() {
    const [hocViens, setHocViens] = useState<HocVien[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [loiTai, setLoiTai] = useState<boolean>(false);

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
    const [dangTangCho, setDangTangCho] = useState<number | null>(null);
    const [lichSuQuaTang, setLichSuQuaTang] = useState<LichSuQuaTang[]>([]);
    const [dangTaiLichSu, setDangTaiLichSu] = useState<boolean>(false);
    const [tuKhoaLichSu, setTuKhoaLichSu] = useState<string>('');
    const [trangLichSu, setTrangLichSu] = useState<number>(1);
    const pageSizeLichSu = 10;

    const formModalRef = useRef<HTMLDivElement>(null);
    const deleteModalRef = useRef<HTMLDivElement>(null);
    useModalA11y(isModalOpen, () => setIsModalOpen(false), formModalRef);
    useModalA11y(isDeleteModalOpen, () => setIsDeleteModalOpen(false), deleteModalRef);

    const API_URL = import.meta.env.VITE_API_URL;

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchHocViens = async () => {
        setLoading(true);
        setLoiTai(false);
        try {
            const queryParams = new URLSearchParams(Object.entries(filters).reduce((acc, [key, val]) => { acc[key] = String(val); return acc; }, {} as Record<string, string>)).toString();
            const response = await fetch(`${API_URL}/api/admin/hoc-vien?${queryParams}`);
            const result = await response.json();
            if (result.success) { setHocViens(result.data.data); setTotal(result.data.total); }
        } catch (error) { console.error(error); setLoiTai(true); } finally { setLoading(false); }
    };

    useEffect(() => { fetchHocViens(); }, [filters.Page, filters.TrangThai, filters.Keyword]);
    useEffect(() => { void fetchLichSuQuaTang(); }, []);

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

    const fetchLichSuQuaTang = async (tuKhoa?: string) => {
        try {
            setDangTaiLichSu(true);
            const data = await quaTangKhoaHocService.lichSuAdmin(tuKhoa);
            setLichSuQuaTang(data);
            setTrangLichSu(1);
        } catch (error) {
            setLichSuQuaTang([]);
        } finally {
            setDangTaiLichSu(false);
        }
    };

    const tongTrangLichSu = Math.max(1, Math.ceil(lichSuQuaTang.length / pageSizeLichSu));
    const lichSuTrangHienTai = lichSuQuaTang.slice((trangLichSu - 1) * pageSizeLichSu, trangLichSu * pageSizeLichSu);

    const xuatCsvLichSu = () => {
        if (lichSuQuaTang.length === 0) {
            showToast("Không có dữ liệu để xuất CSV.", "error");
            return;
        }
        const headers = ["MaQuaTang", "TenKhoaHoc", "TenNguoiTang", "TenNguoiNhan", "EmailNguoiNhan", "LoaiNguoiTang", "TrangThai", "CreatedAt"];
        const rows = lichSuQuaTang.map((x) => [
            x.maQuaTang,
            `"${(x.tenKhoaHoc || "").replace(/"/g, '""')}"`,
            `"${(x.tenNguoiTang || "").replace(/"/g, '""')}"`,
            `"${(x.tenNguoiNhan || "").replace(/"/g, '""')}"`,
            `"${(x.emailNguoiNhan || "").replace(/"/g, '""')}"`,
            x.loaiNguoiTang,
            x.trangThai,
            x.createdAt
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lich-su-qua-tang-admin-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleTangKhoaHoc = async (hocVien: HocVien) => {
        let khoaHocOptions: { id: number; label: string }[] = [];
        try {
            const dsKhoaHoc = await quaTangKhoaHocService.layKhoaHocCoTheTangChoHocVien(hocVien.maNguoiDung);
            khoaHocOptions = dsKhoaHoc.map((x) => ({
                id: x.maKhoaHoc,
                label: `#${x.maKhoaHoc} - ${x.tenKhoaHoc}`
            }));
        } catch {
            showToast("Không tải được danh sách khóa học có thể tặng.", "error");
            return;
        }

        if (khoaHocOptions.length === 0) {
            showToast("Học viên này đã sở hữu tất cả khóa học phù hợp.", "error");
            return;
        }

        const ketQua = await Swal.fire({
            title: `Tặng khóa học cho ${hocVien.hoTen}`,
            html: `
                <select id="tang-ma-khoa-hoc" class="swal2-input">
                    ${khoaHocOptions.map((x) => `<option value="${x.id}">${x.label}</option>`).join("")}
                </select>
                <textarea id="tang-loi-nhan" class="swal2-textarea" placeholder="Lời nhắn (tùy chọn)"></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Xác nhận tặng',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const maKhoaHocRaw = (document.getElementById('tang-ma-khoa-hoc') as HTMLSelectElement | null)?.value?.trim() ?? '';
                const loiNhan = (document.getElementById('tang-loi-nhan') as HTMLTextAreaElement | null)?.value?.trim() ?? '';
                const maKhoaHoc = Number(maKhoaHocRaw);
                if (!Number.isFinite(maKhoaHoc) || maKhoaHoc <= 0) {
                    Swal.showValidationMessage('Vui lòng chọn khóa học hợp lệ.');
                    return;
                }
                return { maKhoaHoc, loiNhan };
            }
        });

        if (!ketQua.isConfirmed || !ketQua.value) return;

        try {
            setDangTangCho(hocVien.maNguoiDung);
            const res = await quaTangKhoaHocService.adminTang({
                maKhoaHoc: ketQua.value.maKhoaHoc,
                maNguoiNhan: hocVien.maNguoiDung,
                loiNhan: ketQua.value.loiNhan || undefined
            });
            showToast(res.thongBao || "Tặng khóa học thành công!", "success");
            await fetchLichSuQuaTang(tuKhoaLichSu || undefined);
        } catch (error: any) {
            showToast(error?.response?.data?.thongBao || "Không thể tặng khóa học.", "error");
        } finally {
            setDangTangCho(null);
        }
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
                    {toast.type === 'success'
                        ? <i className="fas fa-circle-check" style={{ fontSize: 20 }} aria-hidden="true" />
                        : <i className="fas fa-circle-xmark" style={{ fontSize: 20 }} aria-hidden="true" />}
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="qlhv-header">
                <div>
                    <h1 className="qlhv-title">Quản Lý Học Viên</h1>
                    <p className="qlhv-subtitle">Quản lý tài khoản và trạng thái của học viên trong hệ thống.</p>
                </div>
                <button onClick={() => openModal('add')} className="qlhv-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-user-plus" style={{ fontSize: 18 }} aria-hidden="true" /> Thêm học viên
                </button>
            </div>

            <div className="qlhv-card" style={{ marginTop: 20 }}>
                <div className="qlhv-filter-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--primary-hover)' }}>Lịch sử tặng khóa học</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Theo dõi các lượt tặng khóa gần đây của hệ thống.</p>
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void fetchLichSuQuaTang(tuKhoaLichSu || undefined);
                        }}
                        style={{ display: 'flex', gap: 8 }}
                    >
                        <input
                            className="qlhv-input"
                            placeholder="Tìm mã/tên/email..."
                            value={tuKhoaLichSu}
                            onChange={(e) => setTuKhoaLichSu(e.target.value)}
                        />
                        <button type="submit" className="qlhv-btn-search">Lọc</button>
                        <button type="button" className="qlhv-btn-search" onClick={xuatCsvLichSu}>Xuất CSV</button>
                    </form>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="qlhv-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Khóa học</th>
                                <th>Người tặng</th>
                                <th>Người nhận</th>
                                <th>Loại</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dangTaiLichSu ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>Đang tải lịch sử...</td></tr>
                            ) : lichSuQuaTang.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>Chưa có dữ liệu lịch sử tặng khóa.</td></tr>
                            ) : (
                                lichSuTrangHienTai.map((item) => (
                                    <tr key={item.maQuaTang}>
                                        <td>#{item.maQuaTang}</td>
                                        <td>{item.tenKhoaHoc}</td>
                                        <td>{item.tenNguoiTang}</td>
                                        <td>{item.tenNguoiNhan}<br /><small style={{ color: 'var(--text-muted)' }}>{item.emailNguoiNhan || '—'}</small></td>
                                        <td>{item.loaiNguoiTang}</td>
                                        <td>{item.trangThai}</td>
                                        <td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!dangTaiLichSu && lichSuQuaTang.length > 0 && (
                    <div className="qlhv-pagination">
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Trang <b style={{ color: 'var(--primary-hover)' }}>{trangLichSu}</b> / {tongTrangLichSu}
                        </span>
                        <div>
                            <button
                                disabled={trangLichSu === 1}
                                onClick={() => setTrangLichSu((p) => Math.max(1, p - 1))}
                                className="qlhv-page-btn"
                                title="Trang trước"
                            >
                                <i className="fas fa-chevron-left" aria-hidden="true" />
                            </button>
                            <button
                                disabled={trangLichSu >= tongTrangLichSu}
                                onClick={() => setTrangLichSu((p) => Math.min(tongTrangLichSu, p + 1))}
                                className="qlhv-page-btn"
                                title="Trang sau"
                            >
                                <i className="fas fa-chevron-right" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
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
                            <i className="fas fa-magnifying-glass" aria-hidden="true" /> Tìm kiếm
                        </button>
                    </form>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="qlhv-table">
                        <thead>
                            <tr><th>Mã Học Viên</th><th>Học Viên</th><th>Email</th><th>Trạng thái</th><th style={{ textAlign: 'right' }}>Hành động</th></tr>
                        </thead>
                        <tbody>
                            {loiTai ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--danger-strong)' }}>
                                    <i className="fas fa-triangle-exclamation" style={{ display: 'block', margin: '0 auto 8px', fontSize: 28 }} aria-hidden="true" />
                                    Không tải được danh sách học viên.
                                    <div style={{ marginTop: 12 }}>
                                        <button type="button" className="qlhv-btn-search" onClick={() => fetchHocViens()}>Thử lại</button>
                                    </div>
                                </td></tr>
                            ) : loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={`hv-skeleton-${i}`}>
                                        <td><span className="qlhv-skeleton qlhv-skeleton--text" style={{ width: '40%' }} /></td>
                                        <td><div className="qlhv-td-user"><span className="qlhv-skeleton qlhv-skeleton--avatar" /><span className="qlhv-skeleton qlhv-skeleton--text" style={{ width: '60%' }} /></div></td>
                                        <td><span className="qlhv-skeleton qlhv-skeleton--text" style={{ width: '80%' }} /></td>
                                        <td><span className="qlhv-skeleton qlhv-skeleton--pill" /></td>
                                        <td><span className="qlhv-skeleton qlhv-skeleton--text" style={{ width: '90%' }} /></td>
                                    </tr>
                                ))
                            ) : (
                                hocViens.map(hv => (
                                    <tr key={hv.maNguoiDung}>
                                        <td style={{ color: 'var(--text-light)' }}>#{hv.maNguoiDung}</td>
                                        <td>
                                            <div className="qlhv-td-user">
                                                <div className="qlhv-avatar">
                                                    {hv.anhDaiDien ? <img src={`${API_URL}${hv.anhDaiDien}`} alt="avt" /> : <i className="fas fa-user" style={{ fontSize: 24, color: 'var(--primary)' }} aria-hidden="true" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{hv.hoTen}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Tham gia: {new Date(hv.ngayThamGia).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{hv.email}</td>
                                        <td><span className={`qlhv-badge ${hv.trangThai === 'Hoạt động' ? 'active' : 'locked'}`}>{hv.trangThai}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => void handleTangKhoaHoc(hv)}
                                                className="qlhv-action-btn"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--warning-strong)' }}
                                                disabled={dangTangCho === hv.maNguoiDung}
                                            >
                                                <i className="fas fa-gift" aria-hidden="true" /> {dangTangCho === hv.maNguoiDung ? 'Đang tặng...' : 'Tặng khóa'}
                                            </button>
                                            <button onClick={() => openModal('edit', hv)} className="qlhv-action-btn qlhv-btn-edit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <i className="fas fa-pen-to-square" aria-hidden="true" /> Sửa
                                            </button>
                                            <button onClick={() => handleDeleteClick(hv.maNguoiDung)} className="qlhv-action-btn qlhv-btn-delete" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <i className="fas fa-trash" aria-hidden="true" /> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                )))}
                            {!loiTai && !loading && hocViens.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)' }}>Không có dữ liệu.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {totalPages > 0 && (
                    <div className="qlhv-pagination">
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Trang <b style={{ color: 'var(--primary-hover)' }}>{filters.Page}</b> / {totalPages}</span>
                        <div>
                            <button
                                disabled={filters.Page === 1}
                                onClick={() => setFilters({ ...filters, Page: filters.Page - 1 })}
                                className="qlhv-page-btn"
                                aria-label="Trang trước"
                                title="Trang trước"
                            >
                                <i className="fas fa-chevron-left" aria-hidden="true" />
                            </button>
                            <button
                                disabled={filters.Page >= totalPages}
                                onClick={() => setFilters({ ...filters, Page: filters.Page + 1 })}
                                className="qlhv-page-btn"
                                aria-label="Trang sau"
                                title="Trang sau"
                            >
                                <i className="fas fa-chevron-right" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa */}
            {isModalOpen && (
                <div className="qlhv-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="qlhv-modal-content" ref={formModalRef} role="dialog" aria-modal="true" aria-labelledby="qlhv-form-modal-title">
                        <h2 id="qlhv-form-modal-title" className="qlhv-title" style={{ marginBottom: '24px' }}>{modalMode === 'add' ? 'Thêm Học Viên' : 'Cập Nhật Học Viên'}</h2>
                        <form onSubmit={handleSave} noValidate>
                            <div className="qlhv-form-group">
                                <label>Họ và tên</label>
                                <input type="text" className="qlhv-input" style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.hoTen ? 'var(--danger)' : '' }} value={formData.hoTen} onChange={e => { setFormData({ ...formData, hoTen: e.target.value }); setFormErrors({ ...formErrors, hoTen: '' }); }} />
                                {formErrors.hoTen && <span className="qlhv-error-text">{formErrors.hoTen}</span>}
                            </div>

                            <div className="qlhv-form-group">
                                <label>Email</label>
                                <input type="email" className="qlhv-input" style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.email ? 'var(--danger)' : '' }} value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }} />
                                {formErrors.email && <span className="qlhv-error-text">{formErrors.email}</span>}
                            </div>

                            <div className="qlhv-form-group">
                                <label>{modalMode === 'add' ? 'Mật khẩu' : 'Mật khẩu mới (Bỏ trống nếu không đổi)'}</label>
                                <input type="password" className="qlhv-input" style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.matKhauMoi ? 'var(--danger)' : '' }} value={formData.matKhauMoi} onChange={e => { setFormData({ ...formData, matKhauMoi: e.target.value }); setFormErrors({ ...formErrors, matKhauMoi: '' }); }} />
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
                                    <label>Lý do khóa <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <textarea
                                        className="qlhv-input"
                                        placeholder="Nhập lý do vi phạm hoặc khóa tài khoản..."
                                        style={{ width: '100%', boxSizing: 'border-box', borderColor: formErrors.lyDoKhoa ? 'var(--danger)' : '' }}
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
                <div className="qlhv-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
                    <div className="qlhv-modal-content" ref={deleteModalRef} role="dialog" aria-modal="true" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <i className="fas fa-triangle-exclamation" style={{ fontSize: 56, color: 'var(--danger)' }} aria-hidden="true" />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '12px' }}>
                            Xác nhận xóa?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px', lineHeight: '1.5' }}>
                            Bạn có chắc chắn muốn xóa học viên này khỏi hệ thống? Hành động này <b style={{ color: 'var(--danger)' }}>không thể hoàn tác</b>.
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