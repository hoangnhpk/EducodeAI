import { CheckCircle2, Clock3, ShieldAlert, Star } from 'lucide-react';
import type { ThongKeReview } from './ReviewAdmin.types';

interface Props {
  data: ThongKeReview | null;
}

const cards = [
  { key: 'tongDanhGia', title: 'Tong danh gia', icon: Star, className: 'qtrv-card qtrv-card--amber' },
  { key: 'choDuyet', title: 'Cho duyet', icon: Clock3, className: 'qtrv-card qtrv-card--orange' },
  { key: 'daDuyet', title: 'Da duyet', icon: CheckCircle2, className: 'qtrv-card qtrv-card--green' },
  { key: 'tuChoi', title: 'Tu choi', icon: ShieldAlert, className: 'qtrv-card qtrv-card--red' },
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
              <Icon size={22} />
            </div>
            <div className="qtrv-card__body">
              <span className="qtrv-card__label">{title}</span>
              <strong className="qtrv-card__value">{data[key]}</strong>
            </div>
          </article>
        ))}
      </div>

      <aside className="qtrv-rating-panel">
        <div className="qtrv-rating-panel__header">
          <div>
            <h3>Chat luong danh gia</h3>
            <p>Phan bo muc sao cua hoc vien tren toan he thong.</p>
          </div>
          <div className="qtrv-rating-panel__score">
            <strong>{data.danhGiaTrungBinh.toFixed(1)}</strong>
            <span>/ 5.0</span>
          </div>
        </div>

        <div className="qtrv-stars-inline">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              fill={star <= Math.round(data.danhGiaTrungBinh) ? '#f59e0b' : 'none'}
              color={star <= Math.round(data.danhGiaTrungBinh) ? '#f59e0b' : '#d1d5db'}
            />
          ))}
          <span>{totalRatings} danh gia</span>
        </div>

        <div className="qtrv-rating-bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.phanBoSao[`star${star}` as keyof typeof data.phanBoSao];
            const width = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

            return (
              <div key={star} className="qtrv-rating-bar">
                <span>{star} sao</span>
                <div className="qtrv-rating-bar__track">
                  <div className="qtrv-rating-bar__fill" style={{ width: `${width}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
