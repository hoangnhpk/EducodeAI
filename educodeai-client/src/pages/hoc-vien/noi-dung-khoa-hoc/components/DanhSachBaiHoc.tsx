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
  const currentIndex = tatCaBaiHoc.findIndex(
    (b) => b.id === idBaiHocHienTai
  );

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

  const tinhGio = (phut: number = 0): string => {
    if (phut <= 0) return "0 phút";
    const gio = Math.floor(phut / 60);
    const conLai = phut % 60;
    if (gio > 0 && conLai > 0) return `${gio} giờ ${conLai} phút`;
    if (gio > 0) return `${gio} giờ`;
    return `${conLai} phút`;
  };

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
          const tongThoiLuong = chuong.danhSachBaiHoc.reduce(
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
                    {soBaiHoc} bài • {tinhGio(tongThoiLuong)}
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

                    const daHoanThanh = indexBai < currentIndex;
                    const dangHoc = indexBai === currentIndex;
                    const biKhoa = indexBai > currentIndex;

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
                            {tinhGio(bai.thoiLuong)}
                          </div>
                        </div>

                        <div className="cp-lesson-status">
                          {daHoanThanh && (
                            <i className="fas fa-check-circle text-success"></i>
                          )}
                          {dangHoc && (
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
