import React from 'react';
import type { DanhSachBaiTapDTO } from '../types';

interface ExerciseTableProps {
    isLoading: boolean;
    danhSachHienThi: DanhSachBaiTapDTO[];
    onViewClick: (maBaiTap: number) => void;
    onDeleteClick: (maBaiTap: number, tenBaiTap: string) => void;
    onCreateClick: () => void;
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
            <table className="table">
                <thead>
                    <tr>
                        <th>Tên BT</th>
                        <th>Loại</th>
                        <th>Khóa học</th>
                        <th>Chương</th>
                        <th>Bài học</th>
                        <th>Trạng thái</th>
                        <th className="exercise-actions-column">Hành động</th>
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
                        danhSachHienThi.map((baiTap) => (
                            <tr key={baiTap.maBaiTap}>
                                <td>
                                    <div className="truncate-text col-ten" title={baiTap.tenBaiTap}>
                                        <strong>{baiTap.tenBaiTap}</strong>
                                    </div>
                                </td>
                                <td>{baiTap.loaiBaiTap}</td>
                                <td>
                                    <div className="truncate-text col-khoahoc" title={baiTap.tenKhoaHoc}>
                                        {baiTap.tenKhoaHoc}
                                    </div>
                                </td>
                                <td>
                                    <div className="truncate-text col-chuong" title={baiTap.tenChuong}>
                                        {baiTap.tenChuong}
                                    </div>
                                </td>
                                <td>
                                    <div className="truncate-text col-ten" title={baiTap.tenBaiHoc}>
                                        {baiTap.tenBaiHoc}
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${baiTap.trangThai === 'Draft' ? 'badge-draft' : 'badge-published'}`}>
                                        {baiTap.trangThai}
                                    </span>
                                </td>
                                <td className="exercise-actions-column">
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
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
