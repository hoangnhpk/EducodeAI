import { CheckCircle2, ShieldAlert, Star } from 'lucide-react';
import type { ThongKeReview } from './ReviewAdmin.types';

interface Props {
  data: ThongKeReview | null;
}

const cards = [
  { key: 'tongDanhGia', title: 'Tổng đánh giá', icon: Star, className: 'qtrv-card qtrv-card--amber' },
  { key: 'danhGiaTrungBinh', title: 'Đánh giá TB', icon: Star, className: 'qtrv-card qtrv-card--blue' },
  { key: 'daDuyet', title: 'Đã duyệt', icon: CheckCircle2, className: 'qtrv-card qtrv-card--green' },
  { key: 'tuChoi', title: 'Từ chối', icon: ShieldAlert, className: 'qtrv-card qtrv-card--red' },
] as const;

export default function ReviewAdminStats({ data }: Props) {
  if (!data) return null;

  const totalRatings = Object.values(data.phanBoSao).reduce((sum, value) => sum + value, 0);

  return (
    <section className="qtrv-overview-grid">
      <div className="qtrv-cards-grid">
        {cards.map(({ key, title, icon: Icon, className }) => (
          <article key={key} className={className}>
            <div className="qtrv-card__icon">
              <Icon size={16} />
            </div>
            <div className="qtrv-card__body">
              <span className="qtrv-card__label">{title}</span>
              <strong className="qtrv-card__value">
                {typeof data[key] === 'number' && key === 'danhGiaTrungBinh'
                  ? (data[key] as number).toFixed(1)
                  : data[key]}
              </strong>
            </div>
          </article>
        ))}
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
