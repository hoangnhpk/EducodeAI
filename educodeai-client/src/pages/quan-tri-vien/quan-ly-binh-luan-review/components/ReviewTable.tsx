import { CheckCircle, XCircle, Trash2, MessageSquare, Star } from 'lucide-react';
import type { ReviewItem } from './Types';
import { formatDate } from './utils';
import Swal from 'sweetalert2';

interface Props {
  reviews: ReviewItem[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onApprove: (id: number, loai: 'BinhLuan' | 'DanhGia') => void;
  onReject: (id: number, loai: 'BinhLuan' | 'DanhGia') => void;
  onDelete: (id: number, loai: 'BinhLuan' | 'DanhGia') => void;
}

export default function ReviewTable({
  reviews,
  currentPage,
  totalPages,
  loading,
  onPageChange,
  onApprove,
  onReject,
  onDelete,
}: Props) {
  const renderStars = (count: number) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            fill={i <= count ? '#fbbf24' : 'none'}
            color={i <= count ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  const renderStatus = (status: string) => {
    const statusConfig = {
      ChoDuyet: { label: 'Chờ duyệt', class: 'status-pending' },
      DaDuyet: { label: 'Đã duyệt', class: 'status-approved' },
      TuChoi: { label: 'Từ chối', class: 'status-rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="review-table-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="review-table-container">
        <div className="empty-state">
          <MessageSquare size={48} color="#9ca3af" />
          <p>Không tìm thấy bình luận hoặc đánh giá nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-table-container">
      <table className="review-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>Loại</th>
            <th style={{ width: '180px' }}>Người dùng</th>
            <th style={{ width: '200px' }}>Bài học / Khóa học</th>
            <th>Nội dung</th>
            <th style={{ width: '100px' }}>Đánh giá</th>
            <th style={{ width: '120px' }}>Ngày tạo</th>
            <th style={{ width: '100px' }}>Trạng thái</th>
            <th style={{ width: '150px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={`${review.loai}-${review.id}`}>
              {/* Loại */}
              <td>
                <span
                  className={`type-badge ${
                    review.loai === 'BinhLuan' ? 'type-comment' : 'type-rating'
                  }`}
                >
                  {review.loai === 'BinhLuan' ? (
                    <MessageSquare size={14} />
                  ) : (
                    <Star size={14} />
                  )}
                </span>
              </td>

              {/* Người dùng */}
              <td>
                <div className="user-info">
                  <img
                    src={review.nguoiDung.avatar || 'https://ui-avatars.com/api/?name=User'}
                    alt={review.nguoiDung.ten}
                    className="user-avatar"
                  />
                  <span className="user-name">{review.nguoiDung.ten}</span>
                </div>
              </td>

              {/* Tiêu đề */}
              <td>
                <span className="course-title" title={review.tieuDe}>
                  {review.tieuDe}
                </span>
              </td>

              {/* Nội dung */}
              <td>
                <div className="review-content" title={review.noiDung}>
                  {review.noiDung}
                </div>
              </td>

              {/* Đánh giá (chỉ hiện với DanhGia) */}
              <td>
                {review.loai === 'DanhGia' && review.soSao
                  ? renderStars(review.soSao)
                  : <span style={{ color: '#9ca3af' }}>—</span>}
              </td>

              {/* Ngày tạo */}
              <td>
                <span className="date-text">{formatDate(review.ngayTao)}</span>
              </td>

              {/* Trạng thái */}
              <td>{renderStatus(review.trangThai)}</td>

              {/* Thao tác */}
              <td>
                <div className="action-buttons">
                  {review.trangThai === 'ChoDuyet' && (
                    <>
                      <button
                        className="btn-action btn-approve"
                        onClick={() => onApprove(review.id, review.loai)}
                        title="Duyệt"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        className="btn-action btn-reject"
                        onClick={() => onReject(review.id, review.loai)}
                        title="Từ chối"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}

                  <button
                    className="btn-action btn-delete"
                    onClick={() => {
                      Swal.fire({
                        title: 'Bạn có chắc muốn xóa?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Xóa',
                        cancelButtonText: 'Hủy'
                      }).then(res => {
                        if (res.isConfirmed) onDelete(review.id, review.loai);
                      });
                    }}
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ← Trước
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn-page-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="btn-page"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}