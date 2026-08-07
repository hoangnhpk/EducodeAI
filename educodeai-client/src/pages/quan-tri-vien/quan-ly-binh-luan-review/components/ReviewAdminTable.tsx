import Swal from 'sweetalert2';
import type { ReviewItem } from './ReviewAdmin.types';
import { formatDate, getTrangThaiClass, getTrangThaiLabel, truncateText } from './review-admin.utils';

interface Props {
  reviews: ReviewItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPreview: (review: ReviewItem) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

const renderStars = (count: number) => (
  <div className="qtrv-stars-cell">
    {[1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={star <= count ? 'fas fa-star' : 'far fa-star'}
        style={{ color: star <= count ? 'var(--warning)' : 'var(--text-light)' }}
        aria-hidden="true"
      />
    ))}
  </div>
);

export default function ReviewAdminTable({
  reviews,
  currentPage,
  totalPages,
  totalItems,
  loading,
  onPageChange,
  onPreview,
  onApprove,
  onReject,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="qtrv-table-state">
        <div className="qtrv-spinner" />
        <p>Đang tải danh sách đánh giá...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="qtrv-table-state">
        <i className="fas fa-comment-dots" style={{ fontSize: 42 }} aria-hidden="true" />
        <p>Không có đánh giá nào phù hợp bộ lọc hiện tại.</p>
      </div>
    );
  }

  return (
    <section className="qtrv-table-card">
      <div className="qtrv-table-card__header">
        <div>
          <h3>Danh sách kiểm duyệt</h3>
          <p>
            Tổng cộng {totalItems} mục. Trang {currentPage}/{totalPages}.
          </p>
        </div>
      </div>

      <div className="qtrv-table-wrap">
        <table className="qtrv-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Khóa học</th>
              <th>Nội dung đánh giá</th>
              <th>Sao</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <div className="qtrv-user-cell">
                    <img
                      src={review.nguoiDung.avatar || 'https://ui-avatars.com/api/?name=EduCodeAI'}
                      alt={review.nguoiDung.ten}
                    />
                    <div>
                      <strong>{review.nguoiDung.ten}</strong>
                      <span>{review.nguoiDung.email || 'Không có email'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="qtrv-linked-cell">
                    <strong>{review.khoaHoc.tenKhoaHoc}</strong>
                    <span>{review.khoaHoc.giangVien || 'Khóa học trong hệ thống'}</span>
                  </div>
                </td>
                <td>
                  <div className="qtrv-content-cell">
                    <p>{truncateText(review.noiDung, 100)}</p>
                  </div>
                </td>
                <td>{renderStars(review.soSao)}</td>
                <td>
                  <span className="qtrv-date-cell">{formatDate(review.ngayTao)}</span>
                </td>
                <td>
                  <span className={`qtrv-status-badge ${getTrangThaiClass(review.trangThai)}`}>
                    {getTrangThaiLabel(review.trangThai)}
                  </span>
                </td>
                <td>
                  <div className="qtrv-action-row">
                    <button type="button" className="qtrv-icon-btn" onClick={() => onPreview(review)} title="Xem chi tiết" aria-label="Xem chi tiết">
                      <i className="fas fa-eye" aria-hidden="true" />
                    </button>

                    {review.trangThai !== 'DaDuyet' && (
                      <button
                        type="button"
                        className="qtrv-icon-btn success"
                        onClick={() => onApprove(review.id)}
                        title="Duyệt"
                        aria-label="Duyệt"
                      >
                        <i className="fas fa-circle-check" aria-hidden="true" />
                      </button>
                    )}

                    {review.trangThai !== 'TuChoi' && (
                      <button
                        type="button"
                        className="qtrv-icon-btn warning"
                        onClick={() => onReject(review.id)}
                        title="Từ chối"
                        aria-label="Từ chối"
                      >
                        <i className="fas fa-shield-xmark" aria-hidden="true" />
                      </button>
                    )}

                    <button
                      type="button"
                      className="qtrv-icon-btn danger"
                      onClick={() => {
                        Swal.fire({
                          title: 'Xóa nội dung này?',
                          text: 'Hành động này không thể hoàn tác.',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText: 'Xóa',
                          cancelButtonText: 'Hủy',
                          confirmButtonColor: 'var(--danger)',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            onDelete(review.id);
                          }
                        });
                      }}
                      title="Xóa"
                      aria-label="Xóa"
                    >
                      <i className="fas fa-trash" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="qtrv-pagination">
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Trước
        </button>

        <div className="qtrv-pagination__numbers">
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(Math.max(0, currentPage - 3), Math.max(5, currentPage + 2))
            .map((page) => (
              <button
                key={page}
                type="button"
                className={page === currentPage ? 'active' : ''}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
        </div>

        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Sau
        </button>
      </div>
    </section>
  );
}
