import { MessageSquare, Star, Clock, CheckCircle } from 'lucide-react';
import type { ThongKeReview } from './Types';

interface Props {
  data: ThongKeReview | null;
}

export default function ReviewStats({ data }: Props) {
  if (!data) return null;

  return (
    <div className="review-stats-premium">
      <div className="premium-stats-grid">
        <div className="premium-stat-card glass-blue">
          <div className="card-icon-wrapper">
            <MessageSquare size={20} />
          </div>
          <div className="stat-meta">
             <div className="card-value">{data.tongBinhLuan}</div>
             <div className="card-label">Bình luận</div>
          </div>
        </div>

        <div className="premium-stat-card glass-yellow">
          <div className="card-icon-wrapper">
            <Star size={20} />
          </div>
          <div className="stat-meta">
             <div className="card-value">{data.tongDanhGia}</div>
             <div className="card-label">Đánh giá</div>
          </div>
        </div>

        <div className="premium-stat-card glass-orange">
          <div className="card-icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="stat-meta">
             <div className="card-value">{data.choDuyet}</div>
             <div className="card-label">Đang chờ duyệt</div>
          </div>
        </div>

        <div className="premium-stat-card glass-green">
          <div className="card-icon-wrapper">
            <CheckCircle size={20} />
          </div>
          <div className="stat-meta">
             <div className="card-value">{data.daDuyet}</div>
             <div className="card-label">Đã phê duyệt</div>
          </div>
        </div>
      </div>
    </div>
  );
}
