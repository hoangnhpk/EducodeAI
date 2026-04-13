import { MessageSquare, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { ThongKeReview } from './Types';

interface Props {
  data: ThongKeReview | null;
}

export default function ReviewStats({ data }: Props) {
  if (!data) return null;

  const renderStarBar = (star: number, count: number) => {
    const total = Object.values(data.phanBoSao).reduce((a, b) => a + b, 0);
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div className="star-bar" key={star}>
        <span className="star-label">{star} ⭐</span>
        <div className="star-progress">
          <div
            className="star-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="star-count">{count}</span>
      </div>
    );
  };

  return (
    <div className="review-stats-section">
      {/* Cards Row */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.tongBinhLuan}</div>
            <div className="stat-label">Bình luận</div>
          </div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.tongDanhGia}</div>
            <div className="stat-label">Đánh giá</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.choDuyet}</div>
            <div className="stat-label">Chờ duyệt</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.daDuyet}</div>
            <div className="stat-label">Đã duyệt</div>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.tuChoi}</div>
            <div className="stat-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="rating-overview-card">
        <h3>Phân bổ đánh giá</h3>
        
        <div className="rating-summary">
          <div className="rating-avg">
            <div className="avg-number">{data.danhGiaTrungBinh.toFixed(1)}</div>
            <div className="avg-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i <= Math.round(data.danhGiaTrungBinh) ? '#fbbf24' : 'none'}
                  color={i <= Math.round(data.danhGiaTrungBinh) ? '#fbbf24' : '#d1d5db'}
                />
              ))}
            </div>
            <div className="avg-label">
              Trung bình từ {data.tongDanhGia} đánh giá
            </div>
          </div>

          <div className="rating-bars">
            {renderStarBar(5, data.phanBoSao.star5)}
            {renderStarBar(4, data.phanBoSao.star4)}
            {renderStarBar(3, data.phanBoSao.star3)}
            {renderStarBar(2, data.phanBoSao.star2)}
            {renderStarBar(1, data.phanBoSao.star1)}
          </div>
        </div>
      </div>
    </div>
  );
}