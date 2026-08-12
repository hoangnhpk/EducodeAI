import React from 'react';
import type { DanhSachBaiTapDTO } from '../types';

interface ExerciseTableProps {
    isLoading: boolean;
    danhSachHienThi: DanhSachBaiTapDTO[];
    onViewClick: (maBaiTap: number) => void;
    onDeleteClick: (maBaiTap: number, tenBaiTap: string) => void;
    onCreateClick: () => void;
}

function getTrangThaiBadge(trangThai?: string) {
    const raw = (trangThai || '').trim();
    const key = raw.toLowerCase();
    const isDraft = ['draft', 'nháp', 'nhap', 'ẩn', 'an'].includes(key);
    const label =
        key === 'draft' || key === 'nháp' || key === 'nhap' ? 'Nháp'
        : key === 'published' || key === 'hiển thị' || key === 'hien thi' ? 'Hiển thị'
        : raw || '—';

    return {
        label,
        className: `qlbt-badge ${isDraft ? 'qlbt-badge--draft' : 'qlbt-badge--published'}`,
    };
}

export const ExerciseTable: React.FC<ExerciseTableProps> = ({
    isLoading,
    danhSachHienThi,
    onViewClick,
    onDeleteClick,
    onCreateClick
}) => {
    return (
        <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table qlbt-table">
                <thead>
                    <tr>
                        <th className="qlbt-col-ten">Tên BT</th>
                        <th className="qlbt-col-loai">Loại</th>
                        <th className="qlbt-col-khoa-hoc">Khóa học</th>
                        <th className="qlbt-col-chuong">Chương</th>
                        <th className="qlbt-col-bai-hoc">Bài học</th>
                        <th className="qlbt-col-trang-thai">Trạng thái</th>
                        <th className="qlbt-col-hanh-dong">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                                <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}></i>
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    ) : danhSachHienThi.length === 0 ? (
                        <tr className="empty-row">
                            <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <div className="d-flex flex-column align-items-center justify-content-center opacity-75">
                                    <i className="bi bi-folder-x mb-3" style={{ fontSize: '48px', color: 'var(--text-light)' }} aria-hidden="true"></i>
                                    <h5 className="fw-bold mb-2 text-secondary">Chưa có bài tập nào</h5>
                                    <p className="text-muted mb-4" style={{ fontSize: '14px', maxWidth: '300px' }}>Hiện tại danh sách bài tập đang trống. Hãy bắt đầu thiết kế bài tập lập trình hoặc câu hỏi trắc nghiệm mới bằng AI nhé!</p>
                                    <button className="btn btn-primary px-4 py-2" style={{ borderRadius: '10px', fontWeight: 600 }} onClick={onCreateClick}>
                                        <i className="bi bi-plus-lg me-2"></i>Tạo bài tập mới ngay
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        danhSachHienThi.map((baiTap) => {
                            const status = getTrangThaiBadge(baiTap.trangThai);
                            return (
                                <tr key={baiTap.maBaiTap}>
                                    <td className="qlbt-col-ten">
                                        <div className="truncate-text" title={baiTap.tenBaiTap}>
                                            <strong>{baiTap.tenBaiTap}</strong>
                                        </div>
                                    </td>
                                    <td className="qlbt-col-loai">{baiTap.loaiBaiTap}</td>
                                    <td className="qlbt-col-khoa-hoc">
                                        <div className="truncate-text" title={baiTap.tenKhoaHoc}>
                                            {baiTap.tenKhoaHoc}
                                        </div>
                                    </td>
                                    <td className="qlbt-col-chuong">
                                        <div className="truncate-text" title={baiTap.tenChuong}>
                                            {baiTap.tenChuong}
                                        </div>
                                    </td>
                                    <td className="qlbt-col-bai-hoc">
                                        <div className="truncate-text" title={baiTap.tenBaiHoc}>
                                            {baiTap.tenBaiHoc}
                                        </div>
                                    </td>
                                    <td className="qlbt-col-trang-thai">
                                        <span className={status.className}>{status.label}</span>
                                    </td>
                                    <td className="qlbt-col-hanh-dong">
                                        <div className="actions-group">
                                            <button className="action-btn view-btn" onClick={() => onViewClick(baiTap.maBaiTap)}>
                                                <i className="bi bi-eye"></i> Xem
                                            </button>
                                            <button className="action-btn delete-btn"
                                                onClick={() => onDeleteClick(baiTap.maBaiTap, baiTap.tenBaiTap)}
                                            >
                                                <i className="bi bi-trash"></i> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};
