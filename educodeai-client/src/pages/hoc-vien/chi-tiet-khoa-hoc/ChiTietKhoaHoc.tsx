import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // THÊM useNavigate
import axios, { AxiosError } from "axios";
import "../../../layouts/hoc-vien/ChiTietKhoaHoc.css";
import { encodeId } from '@/utils/id-helper';
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
  giaKhoaHoc?: number;
  donViTienTe?: string;
  chuongs?: Chuong[];
  khoaHocDaDangKy?: boolean;
  slug?: string; 
};

const ChiTietKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Khởi tạo điều hướng

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
        
        // Lấy token để check xem user đăng nhập chưa (nếu API chi tiết có kiểm tra trạng thái)
        const token = localStorage.getItem("user_token"); 
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get<KhoaHoc>(
          `https://localhost:7284/api/hocvien/chitietkhoahoc/${id}`,
          { headers }
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

  const dinhDangTien = (soTien?: number, donViTienTe?: string) => {
    if (!soTien) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: donViTienTe || "VND",
      maximumFractionDigits: 0
    }).format(soTien);
  };

  // ==========================================
  // HÀM XỬ LÝ CHUYỂN HƯỚNG ĐẾN MUA KHÓA HỌC
  // ==========================================
  const handleDangKy = async () => {
    if (!course) return;

    // Nếu đã đăng ký rồi -> Bấm nút là chuyển thẳng qua trang Học luôn
    if (course.khoaHocDaDangKy) {
      navigate(`/khoa-hoc/${course.slug}/${encodeId(course.maKhoaHoc)}`); // Sửa lại đường dẫn cho khớp với Router của bạn
      return;
    }
    navigate(`/mua-khoa-hoc/${course.maKhoaHoc}`);
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
                {dinhDangTien(course.giaKhoaHoc, course.donViTienTe)} <span className="free-badge">VND</span>
              </div>

              {/* ===== NÚT BẤM ĐÃ ĐƯỢC NÂNG CẤP ===== */}
              <button 
                className="enroll-btn" 
                onClick={handleDangKy}
                style={{ 
                    backgroundColor: course.khoaHocDaDangKy ? '#28a745' : undefined,
                    opacity: 1,
                    cursor: 'pointer'
                }}
              >
                {course.khoaHocDaDangKy ? (
                  "Tiếp tục học"
                ) : (
                  "Mua khóa học"
                )}
              </button>

              <ul className="sidebar-list mt-3">
                <li>
                  <i className="fas fa-play-circle text-primary me-2"></i>{" "}
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