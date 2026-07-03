import { CheckCircle2, Clock, ShieldAlert, Star, TrendingUp } from 'lucide-react';
import type { ThongKeReview } from './ReviewAdmin.types';

interface Props {
  data: ThongKeReview | null;
}

export default function ReviewAdminStats({ data }: Props) {
  if (!data) return null;

  const totalRatings = Object.values(data.phanBoSao).reduce((sum, value) => sum + value, 0);
  // Tính số chờ duyệt: nếu API trả về trực tiếp thì dùng, không thì tính từ tổng
  const choDuyet = data.choDuyet ?? (data.tongDanhGia - data.daDuyet - data.tuChoi);

  return (
    <section className="qtrv-overview-grid">
      {/* Thêm keyframe pulse cho dot indicator */}
      <style>{`
        @keyframes qtrv-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      <div className="qtrv-cards-grid">
        {/* Tổng đánh giá */}
        <article className="qtrv-card qtrv-card--blue">
          <div className="qtrv-card__icon">
            <TrendingUp size={16} />
          </div>
          <div className="qtrv-card__body">
            <span className="qtrv-card__label">Tổng đánh giá</span>
            <strong className="qtrv-card__value">{data.tongDanhGia}</strong>
          </div>
        </article>

        {/* Chờ duyệt – quan trọng nhất cho Admin */}
        <article className="qtrv-card qtrv-card--amber" style={{ position: 'relative' }}>
          <div className="qtrv-card__icon">
            <Clock size={16} />
          </div>
          <div className="qtrv-card__body">
            <span className="qtrv-card__label">Chờ duyệt</span>
            <strong className="qtrv-card__value" style={{ color: choDuyet > 0 ? '#d97706' : undefined }}>
              {choDuyet}
            </strong>
          </div>
          {choDuyet > 0 && (
            <span style={{
              position: 'absolute', top: 8, right: 8,
              width: 8, height: 8, borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 0 3px #fff8ed',
              animation: 'qtrv-pulse 1.5s ease-in-out infinite'
            }} title={`${choDuyet} đánh giá cần xét duyệt`} />
          )}
        </article>

        {/* Đã duyệt */}
        <article className="qtrv-card qtrv-card--green">
          <div className="qtrv-card__icon">
            <CheckCircle2 size={16} />
          </div>
          <div className="qtrv-card__body">
            <span className="qtrv-card__label">Đã duyệt</span>
            <strong className="qtrv-card__value">{data.daDuyet}</strong>
          </div>
        </article>

        {/* Từ chối */}
        <article className="qtrv-card qtrv-card--red">
          <div className="qtrv-card__icon">
            <ShieldAlert size={16} />
          </div>
          <div className="qtrv-card__body">
            <span className="qtrv-card__label">Từ chối</span>
            <strong className="qtrv-card__value">{data.tuChoi}</strong>
          </div>
        </article>
      </div>

      <aside className="qtrv-rating-panel">
        <div className="qtrv-rating-panel__header">
          <h3>Chất lượng</h3>
          <div className="qtrv-rating-panel__score">
            <strong>{data.danhGiaTrungBinh.toFixed(1)}</strong>
            <span>/ 5.0</span>
          </div>
        </div>
        <div className="qtrv-stars-inline">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              fill={star <= Math.round(data.danhGiaTrungBinh) ? '#f59e0b' : 'none'}
              color={star <= Math.round(data.danhGiaTrungBinh) ? '#f59e0b' : '#d1d5db'}
            />
          ))}
          <span>{totalRatings} đánh giá</span>
        </div>
      </aside>
    </section>
  );
}
