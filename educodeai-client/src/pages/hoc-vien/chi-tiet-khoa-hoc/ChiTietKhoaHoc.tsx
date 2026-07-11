import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ChiTietKhoaHocService } from "../../../services/chi-tiet-khoa-hoc.service";
import type { ChiTietKhoaHocDTO, DanhGiaDTO } from "../../../services/chi-tiet-khoa-hoc.service";
import "./ChiTietKhoaHocGiaoDien.css";
import { getMediaUrl } from "../../../utils/mediaUrl";

type VideoPreview = { type: 'youtube' | 'direct'; src: string };

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

const getYouTubeVideoId = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] ?? null;
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const parts = url.pathname.split('/').filter(Boolean);
    if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && parts[1]) return parts[1];
  }
  return null;
};

const getVideoPreview = (value?: string | null): VideoPreview | null => {
  const input = value?.trim();
  if (!input) return null;
  if (input.startsWith('/uploads/')) {
    return VIDEO_EXTENSIONS.some(ext => input.toLowerCase().split('?')[0].endsWith(ext)) ? { type: 'direct', src: getMediaUrl(input) } : null;
  }
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) return { type: 'youtube', src: `https://www.youtube.com/embed/${youtubeId}` };
    if (VIDEO_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext))) return { type: 'direct', src: getMediaUrl(input) };
  } catch { return null; }
  return null;
};

const ChiTietKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [khoaHoc, setKhoaHoc] = useState<ChiTietKhoaHocDTO | null>(null);
  const [danhGias, setDanhGias] = useState<DanhGiaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(Number(id));
    }
  }, [id]);

  const fetchData = async (courseId: number) => {
    try {
      setLoading(true);
      const data = await ChiTietKhoaHocService.getChiTietKhoaHoc(courseId);
      setKhoaHoc(data);
      
      // Expand the first chapter by default
      if (data.chuongs && data.chuongs.length > 0) {
        setExpandedSections([data.chuongs[0].maChuong]);
      }
      
      const danhGiaRes = await ChiTietKhoaHocService.getDanhGiaKhoaHoc(courseId);
      setDanhGias(danhGiaRes.items || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Không thể tải dữ liệu khóa học', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: number) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(s => s !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const expandAll = () => {
    if (khoaHoc?.chuongs) {
      setExpandedSections(khoaHoc.chuongs.map(c => c.maChuong));
    }
  };

  const handleDangKy = async () => {
    if (!id || !khoaHoc) return;

    if (khoaHoc.khoaHocDaDangKy) {
      navigate(`/khoa-hoc/${khoaHoc.slug}/${id}`);
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      Swal.fire({
        title: 'Cần đăng nhập',
        text: 'Bạn cần đăng nhập để đăng ký khóa học',
        icon: 'warning',
        confirmButtonText: 'Đăng nhập ngay'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dang-nhap');
        }
      });
      return;
    }

    if (khoaHoc.giaKhoaHoc > 0 && khoaHoc.donViTienTe?.toUpperCase() !== 'FREE') {
      navigate(`/mua-khoa-hoc/${id}`);
      return;
    }

    try {
      await ChiTietKhoaHocService.dangKyKhoaHoc(Number(id));
      Swal.fire('Thành công', 'Đăng ký khóa học thành công!', 'success');
      fetchData(Number(id)); // Reload data to get updated status
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký.';
      Swal.fire('Lỗi', msg, 'error');
    }
  };

  if (loading) {
    return <div className="text-center p-5">Đang tải chi tiết khóa học...</div>;
  }

  if (!khoaHoc) {
    return <div className="text-center p-5">Không tìm thấy khóa học</div>;
  }

  // Calculate total lessons
  const totalLessons = khoaHoc.chuongs.reduce((acc, chuong) => acc + chuong.baiHocs.length, 0);
  const videoPreview = getVideoPreview(khoaHoc.videoGioiThieu);
  const bannerImageUrl = getMediaUrl(khoaHoc.hinhAnh);

  return (
    <div className="chi-tiet-giao-dien-container">
      {/* HEADER BANNER */}
      <div
        className="ctgd-header-banner"
        style={bannerImageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(20, 20, 20, 0.88), rgba(20, 20, 20, 0.72)), url(${bannerImageUrl})` } : undefined}
      >
        <div className="ctgd-header-inner">
          <div className="ctgd-header-content">
            <div className="ctgd-badges">
              {khoaHoc.diemDanhGiaTB >= 4.5 && (
                <span className="ctgd-badge ctgd-badge-popular">Phổ biến nhất</span>
              )}
              <span className="ctgd-badge ctgd-badge-category">{khoaHoc.linhVuc || "Chung"}</span>
            </div>
            
            <h1 className="ctgd-title">{khoaHoc.tenKhoaHoc}</h1>
            <p className="ctgd-subtitle">
              {khoaHoc.moTa || "Làm chủ ngôn ngữ lập trình mạnh mẽ nhất hiện nay thông qua các dự án thực tế."}
            </p>

            <div className="ctgd-stats">
              <div className="ctgd-rating">
                <span className="ctgd-rating-score">{khoaHoc.diemDanhGiaTB.toFixed(1)}</span>
                <span className="ctgd-stars">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(khoaHoc.diemDanhGiaTB) ? '' : (i < khoaHoc.diemDanhGiaTB ? 'fa-star-half-alt' : 'text-muted')}`}></i>
                  ))}
                </span>
                <span className="ctgd-rating-count">({khoaHoc.tongDanhGia} đánh giá)</span>
              </div>
              <div className="ctgd-students">
                <i className="fas fa-user-friends"></i>
                <span>{khoaHoc.tongSoHocVien.toLocaleString()} học viên • Trình độ: {khoaHoc.trinhDo}</span>
              </div>
            </div>

            <div className="ctgd-instructor-top">
              <img 
                src={khoaHoc.giangVien?.anhDaiDien || "https://ui-avatars.com/api/?name=" + (khoaHoc.giangVien?.hoTen || "GV")} 
                alt="Instructor" 
                className="ctgd-instructor-avatar"
              />
              <div className="ctgd-instructor-info-top">
                <span className="ctgd-instructor-label">Giảng viên bởi</span>
                <span className="ctgd-instructor-name-top">{khoaHoc.giangVien?.hoTen || "Đang cập nhật"}</span>
              </div>
            </div>
          </div>
          {/* Empty spacer for the right side where sidebar will overlap */}
          <div style={{ width: '360px', flexShrink: 0 }} className="d-none d-lg-block"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ctgd-main">
        <div className="ctgd-content">
          
          {/* WHAT YOU'LL LEARN (Lấy dữ liệu từ API) */}
          {khoaHoc.banSeHocDuocGi && khoaHoc.banSeHocDuocGi.length > 0 && (
            <section className="ctgd-section-learn">
              <h2 className="ctgd-section-title">Bạn sẽ học được gì?</h2>
              <div className="ctgd-learn-list">
                {khoaHoc.banSeHocDuocGi.map((item, index) => (
                  <div className="ctgd-learn-item" key={index}>
                    <i className="fas fa-check-circle ctgd-learn-icon"></i>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CURRICULUM (Lấy dữ liệu API) */}
          <section className="ctgd-curriculum">
            <h2 className="ctgd-section-title">Nội dung khóa học</h2>
            <div className="ctgd-curriculum-header">
              <div className="ctgd-curriculum-stats">
                {khoaHoc.chuongs.length} phần • {totalLessons} bài giảng • {khoaHoc.thoiLuongGio} giờ tổng thời lượng
              </div>
              <button className="ctgd-expand-btn" onClick={expandAll}>Mở rộng tất cả</button>
            </div>

            {khoaHoc.chuongs.map((chuong, index) => (
              <div className="ctgd-chapter" key={chuong.maChuong}>
                <div className="ctgd-chapter-header" onClick={() => toggleSection(chuong.maChuong)}>
                  <div className="ctgd-chapter-title-wrap">
                    <i className={`fas fa-chevron-${expandedSections.includes(chuong.maChuong) ? 'up' : 'down'} ctgd-chapter-icon`}></i>
                    <span className="ctgd-chapter-title">Phần {index + 1}: {chuong.tenChuong}</span>
                  </div>
                  <span className="ctgd-chapter-meta">{chuong.baiHocs.length} bài giảng</span>
                </div>
                {expandedSections.includes(chuong.maChuong) && (
                  <div className="ctgd-chapter-body">
                    {chuong.baiHocs.map(bai => (
                      <div className="ctgd-lesson" key={bai.maBaiHoc}>
                        <div className="ctgd-lesson-left">
                          <i className="fas fa-play-circle ctgd-lesson-icon"></i>
                          <span>{bai.tenBaiHoc}</span>
                        </div>
                        <div className="ctgd-lesson-right">
                          {/* <a href="#" className="ctgd-preview-link">Xem thử</a> */}
                          <span className="ctgd-lesson-duration">{Math.floor(bai.thoiLuong / 60)}:{(bai.thoiLuong % 60).toString().padStart(2, '0')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* DESCRIPTION */}
          <section className="ctgd-description">
            <h2 className="ctgd-section-title">Mô tả khóa học</h2>
            <p>Chào mừng bạn đến với khóa học <strong>{khoaHoc.tenKhoaHoc}</strong>.</p>
            <p>Khóa học này sẽ giúp bạn trang bị đầy đủ kỹ năng: {khoaHoc.moTa}</p>
            <ul>
              <li>Bài giảng video chất lượng cao.</li>
              <li>Hệ thống bài tập tự động chấm điểm trên nền tảng EducodeAI.</li>
              {khoaHoc.coChungChi && <li>Chứng chỉ hoàn thành: {khoaHoc.tenChungChi || khoaHoc.tenKhoaHoc}.</li>}
            </ul>
          </section>

          {/* INSTRUCTOR INFO */}
          <section className="ctgd-instructor-box">
            <h2 className="ctgd-section-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Thông tin giảng viên</h2>
            <div className="ctgd-instructor-profile">
              <img 
                src={khoaHoc.giangVien?.anhDaiDien || "https://ui-avatars.com/api/?name=" + (khoaHoc.giangVien?.hoTen || "GV")} 
                alt={khoaHoc.giangVien?.hoTen || "Giảng viên"} 
                className="ctgd-instructor-avatar-large" 
              />
              <div className="ctgd-instructor-details">
                <h3 className="ctgd-instructor-name">{khoaHoc.giangVien?.hoTen || "Đang cập nhật"}</h3>
                <div className="ctgd-instructor-headline">Giảng viên tại EducodeAI</div>
                <div className="ctgd-instructor-stats">
                  <div className="ctgd-instructor-stats-item">
                    <i className="fas fa-star" style={{color: '#f69050'}}></i>
                    <span>Giảng viên uy tín</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ctgd-instructor-bio">
              Luôn đồng hành cùng học viên trong hành trình chinh phục kiến thức công nghệ.
            </div>
          </section>

          {/* REVIEWS */}
          <section className="ctgd-reviews">
            <h2 className="ctgd-section-title">Đánh giá từ học viên</h2>
            <div className="ctgd-reviews-summary">
              <div className="ctgd-reviews-overall">
                <div className="ctgd-reviews-score">{khoaHoc.diemDanhGiaTB.toFixed(1)}</div>
                <div className="ctgd-reviews-stars">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(khoaHoc.diemDanhGiaTB) ? '' : (i < khoaHoc.diemDanhGiaTB ? 'fa-star-half-alt' : 'text-muted')}`}></i>
                  ))}
                </div>
                <div className="ctgd-reviews-label">Xếp hạng khóa học</div>
              </div>
            </div>

            <div className="ctgd-review-list">
              {danhGias.length === 0 ? (
                <div className="text-muted">Chưa có đánh giá nào cho khóa học này.</div>
              ) : (
                danhGias.map(dg => (
                  <div className="ctgd-review-item" key={dg.maDanhGia}>
                    <div className="ctgd-review-header">
                      <img 
                        src={dg.nguoiDung.anhDaiDien || "https://ui-avatars.com/api/?name=" + dg.nguoiDung.hoTen} 
                        alt="Avatar" 
                        style={{width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px'}}
                      />
                      <div className="ctgd-reviewer-info">
                        <div className="ctgd-reviewer-name">{dg.nguoiDung.hoTen}</div>
                        <div className="ctgd-review-meta">
                          <div className="ctgd-stars" style={{ fontSize: '12px' }}>
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={i < dg.soSao ? "fas fa-star" : "far fa-star"}></i>
                            ))}
                          </div>
                          <span>{new Date(dg.ngayDanhGia).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ctgd-review-text">
                      {dg.nhanXet}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="ctgd-sidebar-wrapper">
          <div className="ctgd-sidebar-card">
            <div className="ctgd-video-preview" style={{ padding: 0 }}>
              {videoPreview ? (
                videoPreview.type === 'youtube' ? (
                  <iframe
                    src={videoPreview.src}
                    title="Video gioi thieu khoa hoc"
                    style={{ width: '100%', height: '200px', border: 0, borderRadius: '12px 12px 0 0' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoPreview.src}
                    controls
                    poster={khoaHoc.hinhAnh}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0', maxHeight: '200px' }}
                  >
                    Trinh duyet cua ban khong ho tro the video.
                  </video>
                )
              ) : (
                <>
                  <img 
                    src={khoaHoc.hinhAnh || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=450"} 
                    alt="Video Preview" 
                    className="ctgd-video-thumb"
                  />
                  <div className="ctgd-play-btn">
                    <i className="fas fa-play"></i>
                  </div>
                  <div className="ctgd-video-label">Chưa có video giới thiệu</div>
                </>
              )}
            </div>
            
            <div className="ctgd-card-body">
              <div className="ctgd-price-section">
                <div className="ctgd-price-current">
                  {khoaHoc.giaKhoaHoc > 0 ? `${khoaHoc.giaKhoaHoc.toLocaleString()} ${khoaHoc.donViTienTe}` : 'Miễn phí'}
                </div>
              </div>

              <div className="ctgd-action-buttons">
                {khoaHoc.khoaHocDaDangKy ? (
                  <button className="ctgd-btn-primary" onClick={handleDangKy}>
                    Tiếp tục học
                  </button>
                ) : (
                  <button className="ctgd-btn-primary" onClick={handleDangKy}>
                    Đăng ký ngay
                  </button>
                )}
                
                {!khoaHoc.khoaHocDaDangKy && <button className="ctgd-btn-secondary">Thêm vào giỏ hàng</button>}
              </div>

              <div className="ctgd-includes">
                <h4 className="ctgd-includes-title">Khóa học bao gồm:</h4>
                <div className="ctgd-includes-list">
                  <div className="ctgd-includes-item">
                    <i className="fas fa-video ctgd-includes-icon"></i>
                    <span>{khoaHoc.thoiLuongGio} giờ video HD</span>
                  </div>
                  <div className="ctgd-includes-item">
                    <i className="fas fa-laptop-code ctgd-includes-icon"></i>
                    <span>Hệ thống bài tập tích hợp</span>
                  </div>
                  <div className="ctgd-includes-item">
                    <i className="fas fa-mobile-alt ctgd-includes-icon"></i>
                    <span>Học trên mọi thiết bị</span>
                  </div>
                  {khoaHoc.coChungChi && (
                    <div className="ctgd-includes-item">
                      <i className="fas fa-certificate ctgd-includes-icon"></i>
                      <span>Chứng chỉ: {khoaHoc.tenChungChi || "Có chứng chỉ"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietKhoaHoc;
