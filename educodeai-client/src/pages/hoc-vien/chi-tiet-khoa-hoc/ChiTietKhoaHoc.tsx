import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "../../../layouts/hoc-vien/ChiTietKhoaHoc.css";

type BaiHoc = {
  maBaiHoc: number;
  tenBaiHoc?: string;
  tenBai?: string;
  TenBaiHoc?: string;
  videoUrl?: string;
  thoiLuong?: string;
  thoi_luong?: string;
};

type Chuong = {
  maChuong: number;
  tenChuong: string;
  baiHocs?: BaiHoc[];
};

type KhoaHoc = {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa?: string;
  chuongs?: Chuong[];
};

const ChiTietKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<KhoaHoc>(
          `https://localhost:7284/api/hocvien/chitietkhoahoc/${id}`
        );

        setCourse(res.data);
      } catch (err) {
        const error = err as AxiosError;

        if (error.response) {
          setError(`Lỗi server: ${error.response.status}`);
        } else if (error.request) {
          setError("Không kết nối được tới server.");
        } else {
          setError("Có lỗi xảy ra.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const toggleChapter = (index: number) => {
    setOpenChapter(openChapter === index ? null : index);
  };

  if (loading) return <h3 style={{ padding: 40 }}>Đang tải dữ liệu...</h3>;
  if (error) return <h3 style={{ padding: 40, color: "red" }}>{error}</h3>;
  if (!course) return <h3 style={{ padding: 40 }}>Không tìm thấy khóa học</h3>;

  return (
    <>
      {/* ===== COURSE HEADER ===== */}
      <div className="course-header">
        <div className="course-header-content">
          <h1 className="course-title">{course.tenKhoaHoc}</h1>

          <p className="course-subtitle">
            {course.moTa || "Chưa có mô tả cho khóa học này."}
          </p>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="course-main-container">
        <div className="course-content-wrapper">

          {/* ===== LEFT ===== */}
          <div className="course-main-content">

            <div className="course-curriculum">
              <h2 className="section-title">Nội dung khóa học</h2>

              {course.chuongs && course.chuongs.length > 0 ? (
                course.chuongs.map((chuong, index) => (
                  <div key={chuong.maChuong} className="chapter-accordion">
                    <div
                      className={`chapter-header ${
                        openChapter === index ? "active" : ""
                      }`}
                      onClick={() => toggleChapter(index)}
                    >
                      <div>
                        <h3>{chuong.tenChuong}</h3>
                        <span>
                          {chuong.baiHocs?.length || 0} bài
                        </span>
                      </div>
                      <i className="fas fa-chevron-down"></i>
                    </div>

                    {openChapter === index && (
                      <div className="chapter-content">
                        {chuong.baiHocs && chuong.baiHocs.length > 0 ? (
                          chuong.baiHocs.map((bai) => (
                            <div key={bai.maBaiHoc} className="lesson-item">
                              {/* 🔥 Xử lý tên bài học an toàn */}
                              {
                                bai.tenBaiHoc ||
                                bai.tenBai ||
                                bai.TenBaiHoc ||
                                "Không có tên bài"
                              }
                              <span>
                                {bai.thoiLuong ||
                                  bai.thoi_luong ||
                                  ""}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="lesson-item">
                            Chưa có bài học
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>Chưa có chương nào</p>
              )}
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="course-sidebar">
            <div className="sidebar-card">
              <div className="course-price">
                Miễn phí <span className="free-badge">FREE</span>
              </div>

              <button className="enroll-btn">
                Đăng ký ngay
              </button>

              <ul className="sidebar-list">
                <li>
                  ▶{" "}
                  {course.chuongs?.reduce(
                    (total, c) => total + (c.baiHocs?.length || 0),
                    0
                  ) || 0}{" "}
                  bài học
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChiTietKhoaHoc;