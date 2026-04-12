import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { ChuongHoc } from "@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO";

interface Props {
  cacChuong: ChuongHoc[];
  idBaiHocHienTai: number;
  tabActive: string; // Nhận biến tabActive để biết đang mở Video hay Quiz
  videoDaXongLocal: number[]; // Nhận danh sách video đã xem xong trong phiên học
  onChonBaiHoc: (id: number, tabDeMo?: 'hoc' | 'quiz') => void;
  className?: string; // Class bổ sung (ví dụ: 'mobile-open' khi mở drawer)
}

export const DanhSachBaiHoc: React.FC<Props> = ({
  cacChuong,
  idBaiHocHienTai,
  tabActive,
  videoDaXongLocal,
  onChonBaiHoc,
  className = '',
}) => {
  const [openChapters, setOpenChapters] = useState<number[]>([]);

  const tatCaBaiHoc = cacChuong.flatMap((c) => c.danhSachBaiHoc);

  useEffect(() => {
    const chuongDangHoc = cacChuong.find((c) =>
      c.danhSachBaiHoc.some((b) => b.id === idBaiHocHienTai)
    );
    if (chuongDangHoc) {
      setOpenChapters([chuongDangHoc.id]);
    }
  }, [idBaiHocHienTai, cacChuong]);

  const toggleChapter = (id: number) => {
    setOpenChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getIconClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "video": return "fa-play-circle";
      case "ide": return "fa-code";
      case "quiz": return "fa-question-circle";
      default: return "fa-align-left";
    }
  };

  const tinhThoiGian = (giay: number = 0): string => {
    if (giay <= 0) return "00:00";
    const gio = Math.floor(giay / 3600);
    const phut = Math.floor((giay % 3600) / 60);
    const giayConLai = Math.round(giay % 60);
    const phutStr = phut.toString().padStart(2, '0');
    const giayStr = giayConLai.toString().padStart(2, '0');
    if (gio > 0) return `${gio}:${phutStr}:${giayStr}`;
    return `${phutStr}:${giayStr}`;
  };

  return (
    <aside className={`cp-right${className ? ` ${className}` : ''}`}>
      <div className="cp-right-header">
        <h2>Nội dung khóa học</h2>
        <div className="cp-right-sub">
          {cacChuong.length} chương •{" "}
          {cacChuong.reduce((total, c) => total + c.danhSachBaiHoc.length, 0)} bài học
        </div>
      </div>

      <div className="cp-outline">
        {cacChuong.map((chuong) => {
          const isOpen = openChapters.includes(chuong.id);
          const soBaiHoc = chuong.danhSachBaiHoc.length;

          const tongThoiLuongGiay = chuong.danhSachBaiHoc.reduce(
            (total, bai) => total + (bai.thoiLuong ?? 0), 0
          );

          return (
            <div key={chuong.id} className="cp-chapter">
              <div className="cp-chapter-header" onClick={() => toggleChapter(chuong.id)}>
                <div>
                  <div className="cp-chapter-title">{chuong.tieuDe}</div>
                  <div className="cp-chapter-meta">
                    {soBaiHoc} bài • {tinhThoiGian(tongThoiLuongGiay)}
                  </div>
                </div>
                <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
              </div>

              {isOpen && (
                <div className="cp-chapter-lessons open">
                  {chuong.danhSachBaiHoc.map((bai) => {
                    const indexBai = tatCaBaiHoc.findIndex((b) => b.id === bai.id);

                    const daHoanThanh = bai.daXem === true; // Tức là đã vượt qua cả lý thuyết & quiz

                    // Bài Video bị khóa nếu bài TRƯỚC ĐÓ chưa hoàn thành
                    const biKhoa = indexBai > 0 && !tatCaBaiHoc[indexBai - 1].daXem;

                    // Quiz bị khóa nếu Video bị khóa HOẶC (chưa pass quiz VÀ chưa cày xong video)
                    const quizBiKhoa = biKhoa || (!daHoanThanh && !videoDaXongLocal.includes(bai.id));

                    // Xác định mục nào đang được chọn để bôi màu Cam
                    const dangHocVideo = bai.id === idBaiHocHienTai && tabActive !== 'quiz';
                    const dangHocQuiz = bai.id === idBaiHocHienTai && tabActive === 'quiz';

                    return (
                      <React.Fragment key={bai.id}>
                        {/* 1. MỤC BÀI HỌC CHÍNH (VIDEO/TEXT) */}
                        <div
                          className={`cp-lesson-item ${dangHocVideo ? "cp-lesson-active" : ""} ${biKhoa ? "cp-lesson-locked" : ""}`}
                          onClick={() => {
                            if (!biKhoa) onChonBaiHoc(bai.id, 'hoc');
                          }}
                        >
                          <div className={`cp-lesson-icon ${bai.loaiBaiHoc.toLowerCase()}`}>
                            <i className={`fas ${getIconClass(bai.loaiBaiHoc)}`}></i>
                          </div>

                          <div className="cp-lesson-main">
                            <div className="cp-lesson-title">{bai.tieuDe}</div>
                            <div className="cp-lesson-meta">{tinhThoiGian(bai.thoiLuong)}</div>
                          </div>

                          <div className="cp-lesson-status">
                            {daHoanThanh && <i className="fas fa-check-circle text-success"></i>}
                            {dangHocVideo && !daHoanThanh && <i className="far fa-dot-circle"></i>}
                            {biKhoa && <i className="fas fa-lock"></i>}
                          </div>
                        </div>

                        {/* 2. MỤC QUIZ (ĐÍNH KÈM) */}
                        {bai.thongTinQuiz && (
                          <div
                            className={`cp-lesson-item cp-lesson-quiz-sub ${dangHocQuiz ? "cp-lesson-active" : ""} ${quizBiKhoa ? "cp-lesson-locked" : ""}`}
                            onClick={() => {
                              if (!quizBiKhoa) {
                                onChonBaiHoc(bai.id, 'quiz');
                              } else {
                                Swal.fire({
                                  title: 'Chưa mở khóa',
                                  text: 'Bạn cần xem xong bài học video ở trên để mở khóa phần bài tập này!',
                                  icon: 'warning',
                                  confirmButtonColor: '#f69050',
                                  timer: 2000
                                });
                              }
                            }}
                            style={{
                              paddingLeft: '3.5rem',
                              backgroundColor: dangHocQuiz ? 'var(--cp-bg-active, #fff5eb)' : '#fcfcfc',
                              borderTop: '1px dashed #eee',
                              opacity: quizBiKhoa ? 0.6 : 1
                            }}
                          >
                            <div className="cp-lesson-icon quiz" style={{ background: 'transparent' }}>
                              <i className="fas fa-tasks" style={{ color: quizBiKhoa ? '#9ca3af' : '#f69050' }}></i>
                            </div>

                            <div className="cp-lesson-main">
                              <div className="cp-lesson-title" style={{ fontSize: '0.85rem' }}>
                                Bài tập trắc nghiệm
                              </div>
                              <div className="cp-lesson-meta">
                                <i className="far fa-clock me-1"></i> {bai.thongTinQuiz.thoiGianLamBai} phút
                                <span className="mx-1">•</span> Yêu cầu {bai.thongTinQuiz.diemCanDat}%
                              </div>
                            </div>

                            <div className="cp-lesson-status">
                              {/* Hiện ổ khóa nếu chưa được làm, nếu đã hoàn thành (daXem) thì hiện tích xanh */}
                              {quizBiKhoa ? (
                                <i className="fas fa-lock"></i>
                              ) : (
                                daHoanThanh ? <i className="fas fa-check-circle text-success" style={{ fontSize: '0.8rem' }}></i> : (dangHocQuiz && <i className="far fa-dot-circle"></i>)
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};