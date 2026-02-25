import React, { useState, useEffect } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { KhoaHocCreateUpdateDTO } from '../KhoaHocCuaToiDTO';
import { FaTimes, FaSave } from 'react-icons/fa';

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
    mode:       'tao' | 'sua';
    maGiangVien: number;
    maKhoaHoc?: number;
    duLieuCu?:  Partial<KhoaHocCreateUpdateDTO>;
    onClose:    () => void;
    onSuccess:  () => void;
}

const ModalKhoaHoc: React.FC<Props> = ({ mode, maGiangVien, maKhoaHoc, duLieuCu, onClose, onSuccess }) => {
    const [form, setForm]       = useState<KhoaHocCreateUpdateDTO>({ ...EMPTY_FORM, ...duLieuCu });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors]   = useState<Partial<Record<keyof KhoaHocCreateUpdateDTO, string>>>({});
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        setForm({ ...EMPTY_FORM, ...duLieuCu });
        setErrors({});
        setApiError('');
    }, [duLieuCu]);

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.tenKhoaHoc.trim())  e.tenKhoaHoc   = 'Tên khóa học không được để trống.';
        if (!form.linhVuc)            e.linhVuc       = 'Vui lòng chọn lĩnh vực.';
        if (!form.trinhDo)            e.trinhDo       = 'Vui lòng chọn trình độ.';
        if (form.thoiLuongGio < 0)    e.thoiLuongGio  = 'Thời lượng không hợp lệ.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'thoiLuongGio' ? Number(value) : value }));
        if (errors[name as keyof KhoaHocCreateUpdateDTO]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        setApiError('');
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

                        {/* Lỗi API */}
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

                        {/* Hình ảnh */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Link hình ảnh</label>
                            <input
                                className="form-control"
                                name="hinhAnh"
                                value={form.hinhAnh ?? ''}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
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
                            disabled={isSaving}
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
