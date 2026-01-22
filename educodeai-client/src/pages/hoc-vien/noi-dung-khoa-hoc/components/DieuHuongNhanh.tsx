import React, { useState, useEffect, useRef } from "react";

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

  // State quản lý việc hiển thị (true = hiện, false = ẩn)
  const [isVisible, setIsVisible] = useState(true);
  
  // --- SỬA LỖI Ở ĐÂY: Đổi NodeJS.Timeout thành any ---
  const timerRef = useRef<any>(null);
  // ---------------------------------------------------

  // Ref để biết chuột có đang nằm trên thanh điều hướng không
  const isHoveringRef = useRef(false);

  // Hàm: Hiện thanh điều hướng và reset bộ đếm ẩn
  const showNav = () => {
    setIsVisible(true);
    
    // Xóa bộ đếm cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Thiết lập bộ đếm mới: Sau 3 giây sẽ ẩn (nếu chuột không đang đè lên)
    timerRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setIsVisible(false);
      }
    }, 3000); // 3000ms = 3 giây
  };

  // 1. Xử lý sự kiện Lăn chuột (Scroll) & Di chuột (MouseMove)
  useEffect(() => {
    const handleScroll = () => showNav();

    const handleMouseMove = (e: MouseEvent) => {
      // Nếu di chuột xuống vùng đáy màn hình (cách đáy 100px) thì hiện lên
      if (window.innerHeight - e.clientY < 100) {
        showNav();
      }
    };

    // Gắn sự kiện
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    // Kích hoạt lần đầu tiên khi component mount
    showNav();

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 2. Xử lý sự kiện: Khi bài học hoàn thành -> Tự động hiện lên
  useEffect(() => {
    if (daHoanThanhBaiHienTai) {
      showNav();
    }
  }, [daHoanThanhBaiHienTai]);

  return (
    <div 
      className={`cp-floating-nav ${isVisible ? "visible" : "hidden"}`}
      // Khi chuột vào thanh này, giữ nó luôn hiện
      onMouseEnter={() => {
        isHoveringRef.current = true;
        setIsVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      // Khi chuột rời đi, bắt đầu đếm ngược để ẩn
      onMouseLeave={() => {
        isHoveringRef.current = false;
        showNav();
      }}
    >
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