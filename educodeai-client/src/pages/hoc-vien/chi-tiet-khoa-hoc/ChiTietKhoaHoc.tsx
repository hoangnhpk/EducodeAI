import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // THÊM useNavigate
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2"; // THÊM Swal để hiện thông báo
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
  
  // State xử lý lúc đang bấm nút Đăng ký (để hiện loading trên nút)
  const [isEnrolling, setIsEnrolling] = useState(false); 

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

  // ==========================================
  // HÀM XỬ LÝ ĐĂNG KÝ KHÓA HỌC
  // ==========================================
  const handleDangKy = async () => {
    if (!course) return;

    // Nếu đã đăng ký rồi -> Bấm nút là chuyển thẳng qua trang Học luôn
    if (course.khoaHocDaDangKy) {
      navigate(`/khoa-hoc/${course.slug}/${encodeId(course.maKhoaHoc)}`); // Sửa lại đường dẫn cho khớp với Router của bạn
      return;
    }

    const token = localStorage.getItem("user_token"); // Lấy token từ nơi bạn lưu trữ
    if (!token) {
      Swal.fire("Cảnh báo", "Bạn cần đăng nhập để đăng ký khóa học này!", "warning").then(() => {
          // navigate("/login"); // Mở comment dòng này nếu muốn đẩy user ra trang đăng nhập
      });
      return;
    }

    try {
      setIsEnrolling(true);

      // Gọi API Đăng ký bạn vừa viết ở Backend
      const response = await axios.post(
        `https://localhost:7284/api/hocvien/chitietkhoahoc/dang-ky`, // <-- SỬA ĐÚNG ĐƯỜNG DẪN API ĐĂNG KÝ CỦA BẠN
        { maKhoaHoc: course.maKhoaHoc },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Bắt buộc phải có token
          },
        }
      );

      // Bắn pháo hoa thành công
      Swal.fire({
        title: 'Đăng ký thành công!',
        text: 'Chào mừng bạn đến với khóa học.',
        icon: 'success',
        confirmButtonText: 'Vào học ngay',
        confirmButtonColor: '#f69050'
      }).then(() => {
        // Chuyển hướng user sang màn hình học Video
        navigate(`/khoa-hoc/${course.slug}/${encodeId(course.maKhoaHoc)}`); 
      });

    } catch (err: any) {
      // Xử lý lỗi (Ví dụ: Backend báo lỗi 400 "Đã đăng ký rồi")
      const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký khóa học.";
      
      if (err.response?.status === 400 && errorMessage.includes("đã đăng ký")) {
        Swal.fire("Thông báo", "Bạn đã đăng ký khóa học này rồi!", "info").then(() => {
            navigate(`/noi-dung-khoa-hoc/${course.maKhoaHoc}`);
        });
      } else {
        Swal.fire("Thất bại", errorMessage, "error");
      }
    } finally {
      setIsEnrolling(false);
    }
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
                Miễn phí <span className="free-badge">FREE</span>
              </div>

              {/* ===== NÚT BẤM ĐÃ ĐƯỢC NÂNG CẤP ===== */}
              <button 
                className="enroll-btn" 
                onClick={handleDangKy}
                disabled={isEnrolling}
                style={{ 
                    backgroundColor: course.khoaHocDaDangKy ? '#28a745' : undefined,
                    opacity: isEnrolling ? 0.7 : 1,
                    cursor: isEnrolling ? 'not-allowed' : 'pointer'
                }}
              >
                {isEnrolling ? (
                  <><i className="fas fa-spinner fa-spin me-2"></i> Đang xử lý...</>
                ) : course.khoaHocDaDangKy ? (
                  "Tiếp tục học"
                ) : (
                  "Đăng ký ngay"
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