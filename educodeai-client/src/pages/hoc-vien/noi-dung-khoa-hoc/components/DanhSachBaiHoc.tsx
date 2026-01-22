import React, { useEffect, useState } from "react";
import type { ChuongHoc } from "@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO";

interface Props {
  cacChuong: ChuongHoc[];
  idBaiHocHienTai: number;
  onChonBaiHoc: (id: number) => void;
}

export const DanhSachBaiHoc: React.FC<Props> = ({
  cacChuong,
  idBaiHocHienTai,
  onChonBaiHoc,
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
      case "video":
        return "fa-play-circle";
      case "ide":
        return "fa-code";
      case "quiz":
        return "fa-question-circle";
      default:
        return "fa-align-left";
    }
  };

  // --- SỬA HÀM TÍNH GIỜ (Nhận vào Giây) ---
  const tinhThoiGian = (giay: number = 0): string => {
    if (giay <= 0) return "00:00";
    
    const gio = Math.floor(giay / 3600);
    const phut = Math.floor((giay % 3600) / 60);
    const giayConLai = Math.round(giay % 60); // Làm tròn giây

    // Format mm:ss
    const phutStr = phut.toString().padStart(2, '0');
    const giayStr = giayConLai.toString().padStart(2, '0');

    if (gio > 0) {
      return `${gio}:${phutStr}:${giayStr}`; // Ví dụ: 1:05:30
    }
    return `${phutStr}:${giayStr}`; // Ví dụ: 05:30
  };
  // ----------------------------------------

  return (
    <aside className="cp-right">
      <div className="cp-right-header">
        <h2>Nội dung khóa học</h2>
        <div className="cp-right-sub">
          {cacChuong.length} chương •{" "}
          {cacChuong.reduce(
            (total, c) => total + c.danhSachBaiHoc.length,
            0
          )}{" "}
          bài học
        </div>
      </div>

      <div className="cp-outline">
        {cacChuong.map((chuong) => {
          const isOpen = openChapters.includes(chuong.id);

          const soBaiHoc = chuong.danhSachBaiHoc.length;
          
          // Tính tổng thời lượng của chương (đơn vị: giây)
          const tongThoiLuongGiay = chuong.danhSachBaiHoc.reduce(
            (total, bai) => total + (bai.thoiLuong ?? 0),
            0
          );

          return (
            <div key={chuong.id} className="cp-chapter">
              <div
                className="cp-chapter-header"
                onClick={() => toggleChapter(chuong.id)}
              >
                <div>
                  <div className="cp-chapter-title">{chuong.tieuDe}</div>
                  <div className="cp-chapter-meta">
                    {/* Hiển thị tổng thời gian chương */}
                    {soBaiHoc} bài • {tinhThoiGian(tongThoiLuongGiay)}
                  </div>
                </div>
                <i
                  className={`fas fa-chevron-${isOpen ? "up" : "down"}`}
                ></i>
              </div>

              {isOpen && (
                <div className="cp-chapter-lessons open">
                  {chuong.danhSachBaiHoc.map((bai) => {
                    const indexBai = tatCaBaiHoc.findIndex(
                      (b) => b.id === bai.id
                    );

                    const daHoanThanh = bai.daXem === true;
                    const dangHoc = bai.id === idBaiHocHienTai;
                    const biKhoa = indexBai > 0 && !tatCaBaiHoc[indexBai - 1].daXem;
                    
                    return (
                      <div
                        key={bai.id}
                        className={`cp-lesson-item
                          ${dangHoc ? "cp-lesson-active" : ""}
                          ${biKhoa ? "cp-lesson-locked" : ""}
                        `}
                        onClick={() => {
                          if (!biKhoa) onChonBaiHoc(bai.id);
                        }}
                      >
                        <div
                          className={`cp-lesson-icon ${bai.loaiBaiHoc.toLowerCase()}`}
                        >
                          <i
                            className={`fas ${getIconClass(
                              bai.loaiBaiHoc
                            )}`}
                          ></i>
                        </div>

                        <div className="cp-lesson-main">
                          <div className="cp-lesson-title">{bai.tieuDe}</div>
                          <div className="cp-lesson-meta">
                            {/* Hiển thị thời gian từng bài */}
                            {tinhThoiGian(bai.thoiLuong)}
                          </div>
                        </div>

                        <div className="cp-lesson-status">
                          {daHoanThanh && (
                            <i className="fas fa-check-circle text-success"></i>
                          )}
                          {dangHoc && !daHoanThanh && (
                            <i className="far fa-dot-circle"></i>
                          )}
                          {biKhoa && <i className="fas fa-lock"></i>}
                        </div>
                      </div>
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