import { BsClock, BsStarFill } from 'react-icons/bs';
import DanhHieuBadge from './DanhHieuBadge';

interface StatsBarProps {
  huyHieu: string;
  maCodeDanhHieu?: string | null;
  tongExp: number;
  demNguoc: string;
}

export default function StatsBar({ huyHieu, maCodeDanhHieu, tongExp, demNguoc }: StatsBarProps) {
  const maCode = maCodeDanhHieu ?? 'tan_binh';

  return (
    <div className="tt-stats-bar">
      <div className="tt-stat">
        <div className="tt-stat__icon tt-stat__icon--badge">
          <DanhHieuBadge maCode={maCode} size={36} />
        </div>
        <div>
          <span className="tt-stat__label">Huy hiệu hiện tại</span>
          <strong className="tt-stat__value">{huyHieu}</strong>
        </div>
      </div>

      <div className="tt-stat">
        <div className="tt-stat__icon tt-stat__icon--exp">
          <BsStarFill size={18} />
        </div>
        <div>
          <span className="tt-stat__label">Tổng điểm EXP</span>
          <strong className="tt-stat__value">{tongExp.toLocaleString('vi-VN')}</strong>
        </div>
      </div>

      <div className="tt-stat tt-stat--timer">
        <div className="tt-stat__icon tt-stat__icon--clock">
          <BsClock size={18} />
        </div>
        <div>
          <span className="tt-stat__label">Làm mới nhiệm vụ sau</span>
          <strong className="tt-stat__value">{demNguoc}</strong>
        </div>
      </div>
    </div>
  );
}
