import { CheckCircle, XCircle, Trash2, MessageSquare, Star, Calendar, Clock, ArrowRight } from 'lucide-react';
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
      <div className="premium-stars-inline">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            fill={i <= count ? '#fbbf24' : 'none'}
            color={i <= count ? '#fbbf24' : '#d1d5db'}
            strokeWidth={2.5}
          />
        ))}
      </div>
    );
  };

  const renderStatus = (status: string) => {
    const statusConfig = {
      ChoDuyet: { label: 'Chờ duyệt', class: 'st-pending', icon: <Clock size={14} /> },
      DaDuyet: { label: 'Đã duyệt', class: 'st-approved', icon: <CheckCircle size={14} /> },
      TuChoi: { label: 'Từ chối', class: 'st-rejected', icon: <XCircle size={14} /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ChoDuyet;
    return (
      <span className={`premium-status-pill ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="list-loading-state">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card-premium"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="list-empty-state">
        <div className="empty-icon-wrap">
           <MessageSquare size={48} strokeWidth={1.5} color="#94a3b8" />
        </div>
        <h3>Không có dữ liệu</h3>
        <p>Thử điều chỉnh bộ lọc để tìm kiếm kết quả khác</p>
      </div>
    );
  }

  return (
    <div className="premium-review-list">
      <div className="review-cards-grid">
        {reviews.map((review) => (
          <div key={`${review.loai}-${review.id}`} className={`review-card-item ${review.trangThai === 'ChoDuyet' ? 'is-waiting' : ''}`}>
            {/* Card Header: User & Meta */}
            <div className="card-top">
              <div className="user-profile">
                <img
                  src={review.nguoiDung.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.nguoiDung.ten)}&background=random`}
                  alt={review.nguoiDung.ten}
                  className="user-avatar-l"
                />
                <div className="user-info-text">
                  <h4>{review.nguoiDung.ten}</h4>
                  <div className="meta-row">
                    <span className="meta-item"><Calendar size={12} /> {formatDate(review.ngayTao)}</span>
                    <span className="dot">•</span>
                    <span className="meta-item type-label">
                       {review.loai === 'BinhLuan' ? 'Bình luận bài học' : 'Đánh giá khóa học'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-status-area">
                {renderStatus(review.trangThai)}
              </div>
            </div>

            {/* Card Body: Ratings & Content */}
            <div className="card-main">
              <div className="target-info">
                 <span className="target-label">Mục tiêu:</span>
                 <span className="target-name">{review.tieuDe}</span>
                 <ArrowRight size={14} className="target-arrow" />
              </div>

              <div className="feedback-container">
                 {review.loai === 'DanhGia' && review.soSao && (
                   <div className="rating-row-premium">
                      {renderStars(review.soSao)}
                      <span className="rating-score">{review.soSao}/5</span>
                   </div>
                 )}
                 <div className="content-body-premium">
                    <p>{review.noiDung}</p>
                 </div>
              </div>
            </div>

            {/* Card Footer: Actions */}
            <div className="card-footer-premium">
              <div className="action-group-left">
                 {/* Có thể thêm các nút phụ ở đây */}
              </div>
              <div className="action-group-right">
                {review.trangThai === 'ChoDuyet' && (
                  <>
                    <button
                      className="btn-premium-action approve"
                      onClick={() => onApprove(review.id, review.loai)}
                    >
                      <CheckCircle size={16} />
                      <span>Duyệt nội dung</span>
                    </button>
                    <button
                      className="btn-premium-action reject"
                      onClick={() => onReject(review.id, review.loai)}
                    >
                      <XCircle size={16} />
                      <span>Từ chối</span>
                    </button>
                  </>
                )}
                <button
                  className="btn-premium-action delete"
                  onClick={() => onDelete(review.id, review.loai)}
                  title="Xóa nội dung"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="premium-pagination-simple">
          <button
            className="btn-p-nav-simple"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>
          
          <div className="p-num-list">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`p-num-btn ${page === currentPage ? 'is-active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="btn-p-nav-simple"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
