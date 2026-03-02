import React, { useState, useEffect } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { BaiHocVideoDetailDTO, BaiHocVideoCreateUpdateDTO } from '../KhoaHocCuaToiDTO';
import { FaTimes, FaSave } from 'react-icons/fa';

interface Props {
    mode:       'tao' | 'sua';
    maGiangVien: number;
    maChuong:   number;
    duLieuCu?:  BaiHocVideoDetailDTO;
    onClose:    () => void;
    onSuccess:  (video: BaiHocVideoDetailDTO, isNew: boolean) => void;
}

const EMPTY: BaiHocVideoCreateUpdateDTO = {
    tieuDe: '', moTa: '', linkVideo: '', thoiLuong: 0, thuTu: 1,
};

const ModalVideo: React.FC<Props> = ({ mode, maGiangVien, maChuong, duLieuCu, onClose, onSuccess }) => {
    const [form, setForm]         = useState<BaiHocVideoCreateUpdateDTO>({ ...EMPTY, ...duLieuCu });
    const [errors, setErrors]     = useState<Partial<Record<keyof BaiHocVideoCreateUpdateDTO, string>>>({});
    const [apiError, setApiError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setForm({ ...EMPTY, ...duLieuCu });
        setErrors({});
        setApiError('');
    }, [duLieuCu]);

    const validate = () => {
        const e: typeof errors = {};
        if (!form.tieuDe.trim()) e.tieuDe   = 'Tiêu đề không được để trống.';
        if (form.thoiLuong < 0) e.thoiLuong = 'Thời lượng không hợp lệ.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: (name === 'thoiLuong' || name === 'thuTu') ? Number(value) : value,
        }));
        if (errors[name as keyof BaiHocVideoCreateUpdateDTO])
            setErrors(prev => ({ ...prev, [name]: undefined }));
        setApiError('');
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;

        try {
            setIsSaving(true);
            if (mode === 'tao') {
                const res = await khoaHocCuaToiService.themVideo(maGiangVien, maChuong, form);
                onSuccess({
                    maBaiHoc:  res.maBaiHoc,
                    tieuDe:    res.tieuDe,
                    moTa:      res.moTa,
                    linkVideo: res.linkVideo,
                    thoiLuong: res.thoiLuong,
                    thuTu:     res.thuTu,
                }, true);
            } else {
                await khoaHocCuaToiService.capNhatVideo(maGiangVien, duLieuCu!.maBaiHoc, form);
                onSuccess({ maBaiHoc: duLieuCu!.maBaiHoc, ...form }, false);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Có lỗi xảy ra.';
            setApiError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-custom" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h5 className="mb-0">{mode === 'tao' ? '🎬 Thêm bài học video' : '✏️ Sửa bài học'}</h5>
                    <FaTimes style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body-custom">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Tiêu đề <span className="text-danger">*</span>
                            </label>
                            <input
                                className={`form-control ${errors.tieuDe ? 'is-invalid' : ''}`}
                                name="tieuDe"
                                value={form.tieuDe}
                                onChange={handleChange}
                                placeholder="VD: Bài 1: Cài đặt môi trường"
                                autoFocus
                            />
                            {errors.tieuDe && <div className="invalid-feedback">{errors.tieuDe}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Link video</label>
                            <input
                                className="form-control"
                                name="linkVideo"
                                value={form.linkVideo ?? ''}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Mô tả</label>
                            <textarea
                                className="form-control"
                                name="moTa"
                                value={form.moTa ?? ''}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Mô tả ngắn nội dung bài học..."
                            />
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Thời lượng (phút)</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.thoiLuong ? 'is-invalid' : ''}`}
                                    name="thoiLuong"
                                    value={form.thoiLuong}
                                    onChange={handleChange}
                                    min={0}
                                />
                                {errors.thoiLuong && <div className="invalid-feedback">{errors.thoiLuong}</div>}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Thứ tự</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="thuTu"
                                    value={form.thuTu}
                                    onChange={handleChange}
                                    min={1}
                                />
                            </div>
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
                            style={{ width: 'auto', minWidth: 130 }}
                        >
                            {isSaving
                                ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                                : <><FaSave className="me-1" />{mode === 'tao' ? 'Thêm bài học' : 'Lưu'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalVideo;
