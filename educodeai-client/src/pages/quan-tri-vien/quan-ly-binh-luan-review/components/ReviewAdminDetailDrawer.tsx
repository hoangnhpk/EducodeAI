import { Star, X } from 'lucide-react';
import type { ReviewItem } from './ReviewAdmin.types';
import { formatDate, getRelativeTime, getTrangThaiClass, getTrangThaiLabel } from './review-admin.utils';

interface Props {
  review: ReviewItem | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function ReviewAdminDetailDrawer({ review, onClose, onApprove, onReject }: Props) {
  return (
    <div className={`qtrv-drawer-backdrop ${review ? 'open' : ''}`} onClick={onClose}>
      <aside
        className={`qtrv-drawer ${review ? 'open' : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        {review && (
          <>
            <div className="qtrv-drawer__header">
              <div>
                <span className="qtrv-type-badge is-rating">
                  <Star size={14} />
                  Đánh giá khóa học
                </span>
                <h3>{review.khoaHoc.tenKhoaHoc}</h3>
                <p>{review.khoaHoc.giangVien || 'Nội dung đánh giá từ học viên'}</p>
              </div>
              <button type="button" className="qtrv-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="qtrv-drawer__body">
              <section className="qtrv-detail-card">
                <label>Người gửi</label>
                <div className="qtrv-user-cell large">
                  <img
                    src={review.nguoiDung.avatar || 'https://ui-avatars.com/api/?name=EduCodeAI'}
                    alt={review.nguoiDung.ten}
                  />
                  <div>
                    <strong>{review.nguoiDung.ten}</strong>
                    <span>{review.nguoiDung.email || 'Không có email'}</span>
                  </div>
                </div>
              </section>

              <section className="qtrv-detail-grid">
                <div className="qtrv-detail-card">
                  <label>Trạng thái</label>
                  <span className={`qtrv-status-badge ${getTrangThaiClass(review.trangThai)}`}>
                    {getTrangThaiLabel(review.trangThai)}
                  </span>
                </div>
                <div className="qtrv-detail-card">
                  <label>Thời gian</label>
                  <strong>{formatDate(review.ngayTao)}</strong>
                  <small>{getRelativeTime(review.ngayTao)}</small>
                </div>
                <div className="qtrv-detail-card">
                  <label>Đối tượng</label>
                  <strong>{review.khoaHoc.tenKhoaHoc}</strong>
                  <small>Khóa học</small>
                </div>
                <div className="qtrv-detail-card">
                  <label>Mức sao</label>
                  <strong>{review.soSao}/5 sao</strong>
                </div>
              </section>

              <section className="qtrv-detail-card">
                <label>Nội dung gốc</label>
                <div className="qtrv-detail-content">{review.noiDung}</div>
              </section>
            </div>

            <div className="qtrv-drawer__footer">
              {review.trangThai !== 'DaDuyet' && (
                <button type="button" className="qtrv-primary-btn" onClick={() => onApprove(review.id)}>
                  Duyệt nội dung
                </button>
              )}
              {review.trangThai !== 'TuChoi' && (
                <button type="button" className="qtrv-secondary-btn" onClick={() => onReject(review.id)}>
                  Từ chối
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
