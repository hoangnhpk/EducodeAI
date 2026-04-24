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

type GiangVien = {
  maGiangVien: number;
  hoTen: string;
  anhDaiDien?: string;
};

type KhoaHoc = {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa?: string;
  kyNangChinh?: string;
  giaKhoaHoc?: number;
  donViTienTe?: string;
  chuongs?: Chuong[];
  khoaHocDaDangKy?: boolean;
  slug?: string; 
  diemDanhGiaTB?: number;
  tongDanhGia?: number;
  coChungChi?: boolean;
  tenChungChi?: string;
  thoiLuongGio?: number;
  giangVien?: GiangVien;
};

type DanhGia = {
  maDanhGia: number;
  soSao: number;
  nhanXet: string;
  ngayDanhGia: string;
  nguoiDung: {
    hoTen: string;
    anhDaiDien?: string;
  }
};

type DanhGiaResponse = {
  items: DanhGia[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const ChiTietKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Khởi tạo điều hướng

  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // State cho Đánh giá (Reviews)
  const [reviews, setReviews] = useState<DanhGiaResponse | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("all"); // "all", "positive", "negative"
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

  // Fetch Đánh giá khi đổi Trang hoặc Filter
  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get<DanhGiaResponse>(
          `https://localhost:7284/api/hocvien/chitietkhoahoc/${id}/danh-gia?page=${reviewPage}&pageSize=5&filter=${reviewFilter}`
        );
        setReviews(res.data);
      } catch (err) {
        console.error("Lỗi lấy đánh giá:", err);
      }
    };

    fetchReviews();
  }, [id, reviewPage, reviewFilter]);

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

            {/* NHẬN XÉT ĐÁNH GIÁ */}
            <div className="course-reviews mt-5" style={{ padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 className="section-title mb-0" style={{ borderBottom: 'none', paddingBottom: 0 }}>Đánh giá học viên ({course.tongDanhGia || 0})</h2>
                <div>
                  <select 
                    className="form-select form-select-sm" 
                    value={reviewFilter} 
                    onChange={(e) => { setReviewFilter(e.target.value); setReviewPage(1); }}
                    style={{ width: 'auto', display: 'inline-block', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="all">Tất cả đánh giá</option>
                    <option value="positive">Tích cực (4-5 sao)</option>
                    <option value="negative">Tiêu cực (1-3 sao)</option>
                  </select>
                </div>
              </div>

              {reviews && reviews.items.length > 0 ? (
                <div className="reviews-list">
                  {reviews.items.map(r => (
                    <div key={r.maDanhGia} className="review-item" style={{ padding: '15px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        {r.nguoiDung.anhDaiDien && r.nguoiDung.anhDaiDien.trim() !== '' && r.nguoiDung.anhDaiDien !== 'null' ? (
                          <img 
                            src={r.nguoiDung.anhDaiDien} 
                            alt="avatar" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #f1f5f9' }} 
                          />
                        ) : (
                          <div style={{
                              width: '40px', height: '40px', borderRadius: '50%',
                              background: '#f1f5f9', color: '#64748b', 
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 700, fontSize: 16
                          }}>
                              {r.nguoiDung.hoTen ? r.nguoiDung.hoTen[0].toUpperCase() : '?'}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <h6 style={{ margin: 0, fontWeight: 'bold' }}>{r.nguoiDung.hoTen}</h6>
                          <div style={{ color: '#ffc107', fontSize: '14px', margin: '5px 0' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i key={i} className={i < r.soSao ? "fas fa-star" : "far fa-star"}></i>
                            ))}
                            <span style={{ color: '#666', marginLeft: '10px', fontSize: '12px' }}>
                              {new Date(r.ngayDanhGia).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#444' }}>{r.nhanXet}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Phân trang */}
                  {reviews.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        disabled={reviewPage === 1}
                        onClick={() => setReviewPage(p => p - 1)}
                        style={{ borderRadius: '6px' }}
                      >
                        Trước
                      </button>
                      <span style={{ lineHeight: '30px', fontWeight: '500' }}>{reviewPage} / {reviews.totalPages}</span>
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        disabled={reviewPage === reviews.totalPages}
                        onClick={() => setReviewPage(p => p + 1)}
                        style={{ borderRadius: '6px' }}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Chưa có đánh giá nào phù hợp.</p>
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
                <li>
                  <i className="fas fa-clock text-primary me-2"></i> {course.thoiLuongGio || 0} giờ học
                </li>
                {course.coChungChi && (
                  <li>
                    <i className="fas fa-certificate text-warning me-2"></i> Chứng chỉ: <span style={{fontWeight: 600}}>{course.tenChungChi || "Hoàn thành khóa học"}</span>
                  </li>
                )}
              </ul>

              {/* THÔNG TIN GIẢNG VIÊN */}
              {course.giangVien && (
                <div className="instructor-info mt-4" style={{ paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  <h6 style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Giảng viên hướng dẫn</h6>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {course.giangVien.anhDaiDien && course.giangVien.anhDaiDien.trim() !== '' && course.giangVien.anhDaiDien !== 'null' ? (
                      <img 
                        src={course.giangVien.anhDaiDien} 
                        alt="avatar" 
                        style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f69050' }} 
                      />
                    ) : (
                      <div style={{
                          width: '45px', height: '45px', borderRadius: '50%',
                          background: '#f1f5f9', color: '#64748b',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, fontSize: 18
                      }}>
                          {course.giangVien.hoTen ? course.giangVien.hoTen[0].toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{course.giangVien.hoTen}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Giảng viên EduCodeAI</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChiTietKhoaHoc;