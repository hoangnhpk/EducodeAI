import { MessageSquareText, Star, X } from 'lucide-react';
import type { ReviewItem } from './ReviewAdmin.types';
import { formatDate, getLoaiLabel, getRelativeTime, getTrangThaiClass, getTrangThaiLabel } from './review-admin.utils';

interface Props {
  review: ReviewItem | null;
  onClose: () => void;
  onApprove: (id: number, loai: ReviewItem['loai']) => void;
  onReject: (id: number, loai: ReviewItem['loai']) => void;
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
                <span className={`qtrv-type-badge ${review.loai === 'DanhGia' ? 'is-rating' : 'is-comment'}`}>
                  {review.loai === 'DanhGia' ? <Star size={14} /> : <MessageSquareText size={14} />}
                  {getLoaiLabel(review.loai)}
                </span>
                <h3>{review.tieuDe}</h3>
                <p>{review.lienKet.tenKhoaHoc}</p>
              </div>
              <button type="button" className="qtrv-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="qtrv-drawer__body">
              <section className="qtrv-detail-card">
                <label>Nguoi gui</label>
                <div className="qtrv-user-cell large">
                  <img
                    src={review.nguoiDung.avatar || 'https://ui-avatars.com/api/?name=EduCodeAI'}
                    alt={review.nguoiDung.ten}
                  />
                  <div>
                    <strong>{review.nguoiDung.ten}</strong>
                    <span>{review.nguoiDung.email || 'Khong co email'}</span>
                  </div>
                </div>
              </section>

              <section className="qtrv-detail-grid">
                <div className="qtrv-detail-card">
                  <label>Trang thai</label>
                  <span className={`qtrv-status-badge ${getTrangThaiClass(review.trangThai)}`}>
                    {getTrangThaiLabel(review.trangThai)}
                  </span>
                </div>
                <div className="qtrv-detail-card">
                  <label>Thoi gian</label>
                  <strong>{formatDate(review.ngayTao)}</strong>
                  <small>{getRelativeTime(review.ngayTao)}</small>
                </div>
                <div className="qtrv-detail-card">
                  <label>Doi tuong</label>
                  <strong>{review.lienKet.tenDoiTuong}</strong>
                  <small>{review.lienKet.loaiDoiTuong}</small>
                </div>
                <div className="qtrv-detail-card">
                  <label>Muc sao</label>
                  <strong>{review.soSao ? `${review.soSao}/5 sao` : 'Khong ap dung'}</strong>
                </div>
              </section>

              <section className="qtrv-detail-card">
                <label>Noi dung goc</label>
                <div className="qtrv-detail-content">{review.noiDung}</div>
              </section>
            </div>

            <div className="qtrv-drawer__footer">
              {review.trangThai !== 'DaDuyet' && (
                <button type="button" className="qtrv-primary-btn" onClick={() => onApprove(review.id, review.loai)}>
                  Duyet noi dung
                </button>
              )}
              {review.trangThai !== 'TuChoi' && (
                <button type="button" className="qtrv-secondary-btn" onClick={() => onReject(review.id, review.loai)}>
                  Tu choi
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
