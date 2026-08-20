import React, { useState, useEffect, useRef, useCallback } from "react";

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
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  const clearHideTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showNav = useCallback(() => {
    setIsVisible(true);
    clearHideTimer();
    timerRef.current = window.setTimeout(() => {
      if (!isHoveringRef.current) setIsVisible(false);
    }, 3000);
  }, [clearHideTimer]);

  useEffect(() => {
    const handleScroll = () => showNav();
    const handlePointerActivity = (event: PointerEvent) => {
      if (window.innerHeight - event.clientY < 140) showNav();
    };
    const handleFocus = () => showNav();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointerdown", handlePointerActivity, { passive: true });
    window.addEventListener("pointermove", handlePointerActivity, { passive: true });
    window.addEventListener("focusin", handleFocus);

    const frame = window.requestAnimationFrame(showNav);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerdown", handlePointerActivity);
      window.removeEventListener("pointermove", handlePointerActivity);
      window.removeEventListener("focusin", handleFocus);
      clearHideTimer();
    };
  }, [clearHideTimer, showNav]);

  useEffect(() => {
    if (!daHoanThanhBaiHienTai) return;
    const frame = window.requestAnimationFrame(showNav);
    return () => window.cancelAnimationFrame(frame);
  }, [daHoanThanhBaiHienTai, showNav]);

  const handleEnter = () => {
    isHoveringRef.current = true;
    clearHideTimer();
    setIsVisible(true);
  };

  const handleLeave = () => {
    isHoveringRef.current = false;
    showNav();
  };

  return (
    <div className="cp-floating-nav-reveal-zone" onPointerEnter={handleEnter} onPointerLeave={handleLeave}>
      <div
        className={`cp-floating-nav ${isVisible ? "visible" : "hidden"}`}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        <button className={`cp-nav-btn ${!hasPrev ? "disabled" : ""}`} onClick={onPrev} disabled={!hasPrev}>
          <i className="fas fa-arrow-left"></i>
          <span>Bài trước</span>
        </button>
        <button className={`cp-nav-btn ${!choPhepNext ? "locked" : ""}`} onClick={onNext} disabled={!choPhepNext}>
          <span>Bài tiếp theo</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};
