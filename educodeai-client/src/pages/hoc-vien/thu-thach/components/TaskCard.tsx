import type { ReactNode } from 'react';
import {
  BsBook,
  BsCalendar3,
  BsChatDots,
  BsCheckCircleFill,
  BsClock,
  BsPencilSquare,
  BsTrophy,
} from 'react-icons/bs';
import type { NhiemVuThuThach } from '../types';

interface TaskCardProps {
  task: NhiemVuThuThach;
  dangNhan?: boolean;
  onClaim?: () => void;
}

const ICON_MAP: Record<string, ReactNode> = {
  book: <BsBook size={20} />,
  chat: <BsChatDots size={20} />,
  quiz: <BsPencilSquare size={20} />,
  calendar: <BsCalendar3 size={20} />,
  clock: <BsClock size={20} />,
  trophy: <BsTrophy size={20} />,
};

function formatGioHoc(phut: number): string {
  const gio = Math.floor(phut / 60);
  const du = phut % 60;
  if (gio === 0) return `${du}p`;
  if (du === 0) return `${gio}h`;
  return `${gio}h${du}p`;
}

export default function TaskCard({ task, dangNhan, onClaim }: TaskCardProps) {
  const isCompleted = task.trangThai === 'completed';
  const isClaimed = task.trangThai === 'claimed';
  const isReady = isCompleted && !isClaimed;
  const progressLabel = task.maNhiemVu === 'gio_hoc'
    ? `${formatGioHoc(task.giaTriHienTai)}/${formatGioHoc(task.chiTieu)}`
    : task.chiTieu <= 1
      ? `${task.phanTramTienDo}%`
      : task.chiTieu <= 5
        ? `${Math.min(task.giaTriHienTai, task.chiTieu)}/${task.chiTieu}`
        : `${task.phanTramTienDo}%`;

  const progressWidth = task.chiTieu <= 1
    ? task.phanTramTienDo
    : Math.min(100, Math.round((task.giaTriHienTai / task.chiTieu) * 100));

  return (
    <article
      className={[
        'tt-task-card',
        isReady ? 'tt-task-card--ready' : '',
        isClaimed ? 'tt-task-card--claimed' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className={`tt-task-card__icon tt-task-card__icon--${task.icon}`}>
        {ICON_MAP[task.icon] ?? <BsBook size={20} />}
      </div>

      <div className="tt-task-card__body">
        <h3 className="tt-task-card__title">{task.tieuDe}</h3>
        <p className="tt-task-card__desc">{task.moTa}</p>

        <div className="tt-task-card__progress-wrap">
          <div className="tt-task-card__progress-track">
            <div
              className={`tt-task-card__progress-fill ${isClaimed ? 'is-claimed' : ''}`}
              style={{ width: `${isClaimed ? 100 : progressWidth}%` }}
            />
          </div>
          <span className="tt-task-card__progress-label">
            {isClaimed ? (
              <span className="tt-task-card__claimed">
                <BsCheckCircleFill size={13} /> ĐÃ NHẬN
              </span>
            ) : (
              progressLabel
            )}
          </span>
        </div>
      </div>

      <div className="tt-task-card__side">
        {!isReady && (
          <span className="tt-task-card__exp">+{task.expThuong} EXP</span>
        )}
        {isReady ? (
          <button
            type="button"
            className="tt-claim-btn"
            disabled={dangNhan}
            onClick={() => onClaim?.()}
          >
            {dangNhan ? 'Đang nhận...' : `Nhận +${task.expThuong} EXP`}
          </button>
        ) : isClaimed ? (
          <span className="tt-task-card__status tt-task-card__status--claimed">
            <BsCheckCircleFill size={12} /> Hoàn tất
          </span>
        ) : (
          <span className="tt-task-card__status">Đang tiến hành</span>
        )}
      </div>
    </article>
  );
}
