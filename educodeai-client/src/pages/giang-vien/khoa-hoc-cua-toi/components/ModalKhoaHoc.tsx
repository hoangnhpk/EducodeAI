import React, { useEffect, useRef, useState } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { KhoaHocCreateUpdateDTO } from '../KhoaHocCuaToiDTO';
import { FaTimes, FaSave, FaUpload } from 'react-icons/fa';
import axiosClient from '@/configs/axios';

const LINH_VUC_OPTIONS = ['Lập trình Web', 'Lập trình Mobile', 'Data Science', 'AI/ML', 'DevOps', 'Bảo mật', 'Khác'];
const TRINH_DO_OPTIONS = [
    { value: 'nguoi_moi', label: 'Người mới' },
    { value: 'trung_cap', label: 'Trung cấp' },
    { value: 'nang_cao', label: 'Nâng cao' },
];
const TRANG_THAI_OPTIONS = ['Hoạt động', 'Nháp', 'Đã khóa'];

const EMPTY_FORM: KhoaHocCreateUpdateDTO = {
    tenKhoaHoc: '',
    moTa: '',
    hinhAnh: '',
    linhVuc: LINH_VUC_OPTIONS[0],
    trinhDo: 'nguoi_moi',
    thoiLuongGio: 0,
    trangThai: 'Hoạt động',
    kyNangChinh: '',
    coChungChi: false,
    tenChungChi: 'Chứng nhận hoàn thành',
    diemDatChungChi: 80,
    soCauHoiChungChi: 20,
    thoiGianLamBaiChungChi: 30,
    giaKhoaHoc: 10000,
    donViTienTe: 'VND',
    choPhepMua: true,
};

interface Props {
    mode: 'tao' | 'sua';
    maGiangVien: number;
    maKhoaHoc?: number;
    duLieuCu?: Partial<KhoaHocCreateUpdateDTO>;
    onClose: () => void;
    onSuccess: () => void;
}

const ModalKhoaHoc: React.FC<Props> = ({ mode, maGiangVien, maKhoaHoc, duLieuCu, onClose, onSuccess }) => {
    const [form, setForm] = useState<KhoaHocCreateUpdateDTO>({ ...EMPTY_FORM, ...duLieuCu });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof KhoaHocCreateUpdateDTO, string>>>({});
    const [apiError, setApiError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setForm({ ...EMPTY_FORM, ...duLieuCu });
        setErrors({});
        setApiError('');
    }, [duLieuCu]);

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.tenKhoaHoc.trim()) e.tenKhoaHoc = 'Tên khóa học không được để trống.';
        if (!form.linhVuc) e.linhVuc = 'Vui lòng chọn lĩnh vực.';
        if (!form.trinhDo) e.trinhDo = 'Vui lòng chọn trình độ.';
        if (form.thoiLuongGio < 0) e.thoiLuongGio = 'Thời lượng không hợp lệ.';

        if (form.coChungChi) {
            if (!form.tenChungChi?.trim()) e.tenChungChi = 'Vui lòng nhập tên chứng chỉ.';
            if (form.diemDatChungChi < 1 || form.diemDatChungChi > 100) e.diemDatChungChi = 'Điểm đạt phải từ 1 đến 100.';
            if (form.soCauHoiChungChi < 1) e.soCauHoiChungChi = 'Số câu hỏi phải lớn hơn 0.';
            if (form.thoiGianLamBaiChungChi < 1) e.thoiGianLamBaiChungChi = 'Thời gian làm bài phải lớn hơn 0.';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox'
                ? checked
                : ['thoiLuongGio', 'diemDatChungChi', 'soCauHoiChungChi', 'thoiGianLamBaiChungChi'].includes(name)
                    ? Number(value)
                    : value
        }));

        if (errors[name as keyof KhoaHocCreateUpdateDTO]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        setApiError('');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setApiError('Chỉ chấp nhận file ảnh jpg, png, webp hoặc gif.');
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

            const res = await axiosClient.post<{ url: string }>('/api/giang-vien/khoa-hoc/upload-hinh-anh', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
            setForm((prev) => ({ ...prev, hinhAnh: `${baseUrl}${res.url}` }));
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? 'Upload ảnh thất bại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAnh = () => {
        setForm((prev) => ({ ...prev, hinhAnh: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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
            <div className="modal-content-custom" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h5 className="mb-0">{mode === 'tao' ? 'Tạo khóa học mới' : 'Chỉnh sửa khóa học'}</h5>
                    <FaTimes style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body-custom">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Tên khóa học <span className="text-danger">*</span>
                            </label>
                            <input
                                className={`form-control ${errors.tenKhoaHoc ? 'is-invalid' : ''}`}
                                name="tenKhoaHoc"
                                value={form.tenKhoaHoc}
                                onChange={handleChange}
                                placeholder="Ví dụ: Lập trình Python từ đầu"
                                autoFocus
                            />
                            {errors.tenKhoaHoc && <div className="invalid-feedback">{errors.tenKhoaHoc}</div>}
                        </div>

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

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Hình ảnh</label>
                            <div
                                className="border rounded d-flex align-items-center justify-content-center"
                                style={{ minHeight: 120, cursor: isUploading ? 'wait' : 'pointer', background: '#f8f9fa', overflow: 'hidden' }}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="text-center text-muted py-3">
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Đang tải ảnh lên...
                                    </div>
                                ) : form.hinhAnh ? (
                                    <img src={form.hinhAnh} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        <FaUpload size={24} className="mb-2" />
                                        <div style={{ fontSize: 13 }}>Nhấn để chọn ảnh từ máy</div>
                                        <div style={{ fontSize: 11 }}>JPG, PNG, WEBP, GIF · Tối đa 5MB</div>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {form.hinhAnh && !isUploading && (
                                <div className="d-flex gap-2 mt-2">
                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fileInputRef.current?.click()}>
                                        <FaUpload className="me-1" />Đổi ảnh
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveAnh}>
                                        <FaTimes className="me-1" />Xóa ảnh
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Lĩnh vực <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.linhVuc ? 'is-invalid' : ''}`} name="linhVuc" value={form.linhVuc} onChange={handleChange}>
                                    {LINH_VUC_OPTIONS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                                </select>
                                {errors.linhVuc && <div className="invalid-feedback">{errors.linhVuc}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Trình độ <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.trinhDo ? 'is-invalid' : ''}`} name="trinhDo" value={form.trinhDo} onChange={handleChange}>
                                    {TRINH_DO_OPTIONS.map((td) => <option key={td.value} value={td.value}>{td.label}</option>)}
                                </select>
                                {errors.trinhDo && <div className="invalid-feedback">{errors.trinhDo}</div>}
                            </div>

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

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Trạng thái</label>
                                <select className="form-select" name="trangThai" value={form.trangThai ?? ''} onChange={handleChange}>
                                    {TRANG_THAI_OPTIONS.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-3 mt-3">
                            <label className="form-label fw-semibold">Kỹ năng chính</label>
                            <input
                                className="form-control"
                                name="kyNangChinh"
                                value={form.kyNangChinh ?? ''}
                                onChange={handleChange}
                                placeholder="Ví dụ: Python, OOP, Algorithm..."
                            />
                        </div>

                        <div className="border rounded-4 p-3 mt-3" style={{ background: '#fffaf5', borderColor: 'rgba(246,144,80,0.2)' }}>
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="coChungChi"
                                    name="coChungChi"
                                    checked={form.coChungChi}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label fw-semibold" htmlFor="coChungChi">
                                    Khóa học có cấp chứng chỉ
                                </label>
                            </div>

                            {form.coChungChi && (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Tên chứng chỉ</label>
                                        <input
                                            className={`form-control ${errors.tenChungChi ? 'is-invalid' : ''}`}
                                            name="tenChungChi"
                                            value={form.tenChungChi ?? ''}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: Chứng nhận hoàn thành khóa học"
                                        />
                                        {errors.tenChungChi && <div className="invalid-feedback">{errors.tenChungChi}</div>}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Điểm đạt (%)</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.diemDatChungChi ? 'is-invalid' : ''}`}
                                            name="diemDatChungChi"
                                            value={form.diemDatChungChi}
                                            onChange={handleChange}
                                            min={1}
                                            max={100}
                                        />
                                        {errors.diemDatChungChi && <div className="invalid-feedback">{errors.diemDatChungChi}</div>}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Số câu hỏi</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.soCauHoiChungChi ? 'is-invalid' : ''}`}
                                            name="soCauHoiChungChi"
                                            value={form.soCauHoiChungChi}
                                            onChange={handleChange}
                                            min={1}
                                        />
                                        {errors.soCauHoiChungChi && <div className="invalid-feedback">{errors.soCauHoiChungChi}</div>}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Thời gian làm bài (phút)</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.thoiGianLamBaiChungChi ? 'is-invalid' : ''}`}
                                            name="thoiGianLamBaiChungChi"
                                            value={form.thoiGianLamBaiChungChi}
                                            onChange={handleChange}
                                            min={1}
                                        />
                                        {errors.thoiGianLamBaiChungChi && <div className="invalid-feedback">{errors.thoiGianLamBaiChungChi}</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            <FaTimes className="me-1" />Hủy
                        </button>
                        <button type="submit" className="btn-orange" disabled={isSaving || isUploading} style={{ minWidth: 140, width: 'auto' }}>
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
