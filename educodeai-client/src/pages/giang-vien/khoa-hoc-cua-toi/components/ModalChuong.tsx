import React, { useState, useEffect } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc-cua-toi.service';
import type { ChuongHocDetailDTO, ChuongHocCreateUpdateDTO } from '../KhoaHocCuaToiDTO';
import { FaTimes, FaSave } from 'react-icons/fa';

interface Props {
    mode:       'tao' | 'sua';
    maGiangVien: number;
    maKhoaHoc:  number;
    duLieuCu?:  ChuongHocDetailDTO;
    onClose:    () => void;
    onSuccess:  (chuong: ChuongHocDetailDTO, isNew: boolean) => void;
}

const ModalChuong: React.FC<Props> = ({ mode, maGiangVien, maKhoaHoc, duLieuCu, onClose, onSuccess }) => {
    const [tenChuong, setTenChuong] = useState(duLieuCu?.tenChuong ?? '');
    const [thuTu,     setThuTu]     = useState(duLieuCu?.thuTu ?? 1);
    const [error,     setError]     = useState('');
    const [apiError,  setApiError]  = useState('');
    const [isSaving,  setIsSaving]  = useState(false);

    useEffect(() => {
        setTenChuong(duLieuCu?.tenChuong ?? '');
        setThuTu(duLieuCu?.thuTu ?? 1);
        setError('');
        setApiError('');
    }, [duLieuCu]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenChuong.trim()) { setError('Tên chương không được để trống.'); return; }

        const dto: ChuongHocCreateUpdateDTO = { tenChuong: tenChuong.trim(), thuTu };

        try {
            setIsSaving(true);
            if (mode === 'tao') {
                const res = await khoaHocCuaToiService.themChuong(maGiangVien, maKhoaHoc, dto);
                onSuccess({
                    maChuong:       res.maChuong,
                    tenChuong:      res.tenChuong,
                    thuTu:          res.thuTu,
                    danhSachBaiHoc: [],
                }, true);
            } else {
                await khoaHocCuaToiService.capNhatChuong(maGiangVien, duLieuCu!.maChuong, dto);
                onSuccess({
                    ...duLieuCu!,
                    tenChuong: dto.tenChuong,
                    thuTu:     dto.thuTu,
                }, false);
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
            <div className="modal-content-custom" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header-custom">
                    <h5 className="mb-0">{mode === 'tao' ? '➕ Thêm chương mới' : '✏️ Sửa chương'}</h5>
                    <FaTimes style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body-custom">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Tên chương <span className="text-danger">*</span>
                            </label>
                            <input
                                className={`form-control ${error ? 'is-invalid' : ''}`}
                                value={tenChuong}
                                onChange={e => { setTenChuong(e.target.value); setError(''); }}
                                placeholder="VD: Giới thiệu về Python"
                                autoFocus
                            />
                            {error && <div className="invalid-feedback">{error}</div>}
                        </div>
                        <div className="mb-0">
                            <label className="form-label fw-semibold">Thứ tự</label>
                            <input
                                type="number"
                                className="form-control"
                                value={thuTu}
                                onChange={e => setThuTu(Number(e.target.value))}
                                min={1}
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
                            style={{ width: 'auto', minWidth: 120 }}
                        >
                            {isSaving
                                ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                                : <><FaSave className="me-1" />{mode === 'tao' ? 'Thêm chương' : 'Lưu'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalChuong;
