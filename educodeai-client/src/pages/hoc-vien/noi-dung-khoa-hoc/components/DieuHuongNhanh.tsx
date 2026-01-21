import React from "react";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  daHoanThanhBaiHienTai: boolean;
}

export const DieuHuongNhanh: React.FC<Props> = ({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  daHoanThanhBaiHienTai,
}) => {
  const choPhepNext = hasNext && daHoanThanhBaiHienTai;

  return (
    <div className="cp-floating-nav">
      <button
        className={`cp-nav-btn ${!hasPrev ? "disabled" : ""}`}
        onClick={onPrev}
        disabled={!hasPrev}
      >
        <i className="fas fa-arrow-left"></i>
        <span>Bài trước</span>
      </button>

      <button
        className={`cp-nav-btn ${!choPhepNext ? "locked" : ""}`}
        onClick={onNext}
        disabled={!choPhepNext}
      >
        <span>Bài tiếp theo</span>
        <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
};
