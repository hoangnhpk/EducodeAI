import React, { useState, useEffect, useRef } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { KhoaHocCreateUpdateDTO } from '../KhoaHocCuaToiDTO';
import { FaTimes, FaSave, FaUpload } from 'react-icons/fa';
import axiosClient from '@/configs/axios';

const LINH_VUC_OPTIONS = ['Lập trình Web', 'Lập trình Mobile', 'Data Science', 'AI/ML', 'DevOps', 'Bảo mật', 'Khác'];
const TRINH_DO_OPTIONS = [
    { value: 'nguoi_moi', label: 'Người mới' },
    { value: 'trung_cap', label: 'Trung cấp' },
    { value: 'nang_cao',  label: 'Nâng cao' },
];
const TRANG_THAI_OPTIONS = ['Hoạt động', 'Nháp', 'Đã khóa'];

const EMPTY_FORM: KhoaHocCreateUpdateDTO = {
    tenKhoaHoc:   '',
    moTa:         '',
    hinhAnh:      '',
    linhVuc:      LINH_VUC_OPTIONS[0],
    trinhDo:      'nguoi_moi',
    thoiLuongGio: 0,
    trangThai:    'Hoạt động',
    kyNangChinh:  '',
};

interface Props {
    mode:        'tao' | 'sua';
    maGiangVien: number;
    maKhoaHoc?:  number;
    duLieuCu?:   Partial<KhoaHocCreateUpdateDTO>;
    onClose:     () => void;
    onSuccess:   () => void;
}

const ModalKhoaHoc: React.FC<Props> = ({ mode, maGiangVien, maKhoaHoc, duLieuCu, onClose, onSuccess }) => {
    const [form, setForm]           = useState<KhoaHocCreateUpdateDTO>({ ...EMPTY_FORM, ...duLieuCu });
    const [isSaving, setIsSaving]   = useState(false);
    const [isUploading, setIsUploading] = useState(false);  // ← trạng thái upload ảnh
    const [errors, setErrors]       = useState<Partial<Record<keyof KhoaHocCreateUpdateDTO, string>>>({});
    const [apiError, setApiError]   = useState('');
    const fileInputRef              = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setForm({ ...EMPTY_FORM, ...duLieuCu });
        setErrors({});
        setApiError('');
    }, [duLieuCu]);

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.tenKhoaHoc.trim()) e.tenKhoaHoc  = 'Tên khóa học không được để trống.';
        if (!form.linhVuc)           e.linhVuc      = 'Vui lòng chọn lĩnh vực.';
        if (!form.trinhDo)           e.trinhDo      = 'Vui lòng chọn trình độ.';
        if (form.thoiLuongGio < 0)   e.thoiLuongGio = 'Thời lượng không hợp lệ.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'thoiLuongGio' ? Number(value) : value }));
        if (errors[name as keyof KhoaHocCreateUpdateDTO])
            setErrors(prev => ({ ...prev, [name]: undefined }));
        setApiError('');
    };

    // ── Upload ảnh ngay khi chọn file, lưu URL vào form.hinhAnh ──
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate phía client trước khi gửi
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setApiError('Chỉ chấp nhận file ảnh (jpg, png, webp, gif).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setApiError('Kích thước ảnh không được vượt quá 5MB.');
            return;
        }

        try {
            setIsUploading(true);
            setApiError('');

            const formData = new FormData();
            formData.append('file', file);

            // Gọi endpoint upload riêng
            const res = await axiosClient.post<{ url: string }>('/api/giang-vien/khoa-hoc/upload-hinh-anh', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Thêm base URL của BE để ảnh hiện đúng
            const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
            setForm(prev => ({ ...prev, hinhAnh: `${baseUrl}${res.url}` }));
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? 'Upload ảnh thất bại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAnh = () => {
        setForm(prev => ({ ...prev, hinhAnh: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Submit vẫn gửi JSON như cũ, không thay đổi gì ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setIsSaving(true);
            if (mode === 'tao') {
                await khoaHocCuaToiService.taoKhoaHoc(maGiangVien, form);
            } else {
                await khoaHocCuaToiService.capNhatKhoaHoc(maGiangVien, maKhoaHoc!, form);
            }
            onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.';
            setApiError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content-custom"
                style={{ maxWidth: 620 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-custom">
                    <h5 className="mb-0">
                        {mode === 'tao' ? ' Tạo khóa học mới' : ' Chỉnh sửa khóa học'}
                    </h5>
                    <FaTimes style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body-custom">

                        {apiError && (
                            <div className="alert alert-danger py-2 mb-3">{apiError}</div>
                        )}

                        {/* Tên khóa học */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Tên khóa học <span className="text-danger">*</span>
                            </label>
                            <input
                                className={`form-control ${errors.tenKhoaHoc ? 'is-invalid' : ''}`}
                                name="tenKhoaHoc"
                                value={form.tenKhoaHoc}
                                onChange={handleChange}
                                placeholder="VD: Lập trình Python từ đầu"
                                autoFocus
                            />
                            {errors.tenKhoaHoc && <div className="invalid-feedback">{errors.tenKhoaHoc}</div>}
                        </div>

                        {/* Mô tả */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Mô tả</label>
                            <textarea
                                className="form-control"
                                name="moTa"
                                value={form.moTa ?? ''}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Mô tả ngắn về nội dung và mục tiêu khóa học..."
                            />
                        </div>

                        {/* ── Hình ảnh ── */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Hình ảnh</label>

                            {/* Vùng preview / click chọn ảnh */}
                            <div
                                className="border rounded d-flex align-items-center justify-content-center"
                                style={{
                                    minHeight: 120,
                                    cursor: isUploading ? 'wait' : 'pointer',
                                    background: '#f8f9fa',
                                    overflow: 'hidden',
                                }}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="text-center text-muted py-3">
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Đang tải ảnh lên...
                                    </div>
                                ) : form.hinhAnh ? (
                                    <img
                                        src={form.hinhAnh}
                                        alt="Preview"
                                        style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                                    />
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        <FaUpload size={24} className="mb-2" />
                                        <div style={{ fontSize: 13 }}>Nhấn để chọn ảnh từ máy</div>
                                        <div style={{ fontSize: 11 }}>JPG, PNG, WEBP, GIF · Tối đa 5MB</div>
                                    </div>
                                )}
                            </div>

                            {/* Input file ẩn */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {/* Nút đổi ảnh / xóa ảnh */}
                            {form.hinhAnh && !isUploading && (
                                <div className="d-flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FaUpload className="me-1" />Đổi ảnh
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={handleRemoveAnh}
                                    >
                                        <FaTimes className="me-1" />Xóa ảnh
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="row g-3">
                            {/* Lĩnh vực */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Lĩnh vực <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.linhVuc ? 'is-invalid' : ''}`}
                                    name="linhVuc"
                                    value={form.linhVuc}
                                    onChange={handleChange}
                                >
                                    {LINH_VUC_OPTIONS.map(lv => (
                                        <option key={lv} value={lv}>{lv}</option>
                                    ))}
                                </select>
                                {errors.linhVuc && <div className="invalid-feedback">{errors.linhVuc}</div>}
                            </div>

                            {/* Trình độ */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Trình độ <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.trinhDo ? 'is-invalid' : ''}`}
                                    name="trinhDo"
                                    value={form.trinhDo}
                                    onChange={handleChange}
                                >
                                    {TRINH_DO_OPTIONS.map(td => (
                                        <option key={td.value} value={td.value}>{td.label}</option>
                                    ))}
                                </select>
                                {errors.trinhDo && <div className="invalid-feedback">{errors.trinhDo}</div>}
                            </div>

                            {/* Thời lượng */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Thời lượng (giờ)</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.thoiLuongGio ? 'is-invalid' : ''}`}
                                    name="thoiLuongGio"
                                    value={form.thoiLuongGio}
                                    onChange={handleChange}
                                    min={0}
                                />
                                {errors.thoiLuongGio && <div className="invalid-feedback">{errors.thoiLuongGio}</div>}
                            </div>

                            {/* Trạng thái */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Trạng thái</label>
                                <select
                                    className="form-select"
                                    name="trangThai"
                                    value={form.trangThai ?? ''}
                                    onChange={handleChange}
                                >
                                    {TRANG_THAI_OPTIONS.map(tt => (
                                        <option key={tt} value={tt}>{tt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Kỹ năng chính */}
                        <div className="mb-0 mt-3">
                            <label className="form-label fw-semibold">Kỹ năng chính</label>
                            <input
                                className="form-control"
                                name="kyNangChinh"
                                value={form.kyNangChinh ?? ''}
                                onChange={handleChange}
                                placeholder="VD: Python, OOP, Algorithm..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            <FaTimes className="me-1" />Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-orange"
                            disabled={isSaving || isUploading}  // ← chặn submit khi đang upload
                            style={{ minWidth: 130, width: 'auto' }}
                        >
                            {isSaving
                                ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                                : <><FaSave className="me-1" />{mode === 'tao' ? 'Tạo mới' : 'Lưu thay đổi'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalKhoaHoc;