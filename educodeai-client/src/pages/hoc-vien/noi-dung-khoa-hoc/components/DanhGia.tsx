import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosClient from '@/configs/axios';

interface Review {
    id: number;
    tenNguoiDung: string;
    soSao: number;
    noiDung: string;
    ngayTao: string;
    maNguoiDung: number;
}

interface RatingSummary {
    trungBinh: number;
    tongSo: number;
    tyLe: {
        sao5: number;
        sao4: number;
        sao3: number;
        sao2: number;
        sao1: number;
    };
}

interface Props {
    maKhoaHoc: number;
    maNguoiDung: number;
    daHoanThanhKhoaHoc: boolean; // Prop mới để kiểm tra hoàn thành khóa học
}

export const TabDanhGia: React.FC<Props> = ({ maKhoaHoc, maNguoiDung, daHoanThanhKhoaHoc }) => {
    // State cho Form
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State kiểm tra đã đánh giá hay chưa
    const [hasReviewed, setHasReviewed] = useState(false);
    const [hienThongBao, setHienThongBao] = useState(false);
    
    // State hiển thị dữ liệu
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<RatingSummary>({
        trungBinh: 0, tongSo: 0,
        tyLe: { sao5: 0, sao4: 0, sao3: 0, sao2: 0, sao1: 0 }
    });

    // Effect tự động tắt thông báo sau 4 giây
    useEffect(() => {
        if (hienThongBao) {
            const timer = setTimeout(() => {
                setHienThongBao(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [hienThongBao]);

    useEffect(() => {
        if (maKhoaHoc) {
            fetchReviews();
        }
    }, [maKhoaHoc]);

    const fetchReviews = async () => {
        try {
            const res: any = await axiosClient.get(`/api/NoiDungKhoaHoc/ds-danh-gia-khoa-hoc/${maKhoaHoc}`);
            setReviews(res.danhSach);
            setSummary(res.thongKe);

            // LOGIC KIỂM TRA ĐÁNH GIÁ
            const daDanhGia = res.danhSach.some((r: Review) => r.maNguoiDung === maNguoiDung);
            if (daDanhGia) {
                setHasReviewed(true);
            }
        } catch (error) {
            console.error("Lỗi lấy đánh giá:", error);
        }
    };

    const handleSubmit = async () => {
        if (userRating === 0) {
            Swal.fire({ icon: 'warning', text: 'Vui lòng chọn số sao để đánh giá!', timer: 1500, showConfirmButton: false });
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosClient.post('/api/NoiDungKhoaHoc/them-danh-gia', {
                MaKhoaHoc: maKhoaHoc,
                MaNguoiDung: maNguoiDung,
                SoSao: userRating,
                NhanXet: comment
            });

            Swal.fire({ icon: 'success', text: 'Cảm ơn bạn đã đánh giá khóa học!', timer: 1500, showConfirmButton: false });
            setComment("");
            setUserRating(0);

            // Ẩn form và bật thông báo "Cảm ơn"
            setHasReviewed(true);
            setHienThongBao(true);
            
            fetchReviews(); // Load lại list ngay lập tức
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Bạn đã đánh giá khóa học này rồi hoặc có lỗi xảy ra!';
            Swal.fire({ icon: 'error', text: errorMsg, timer: 2000, showConfirmButton: false });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm render ngôi sao tĩnh (Dùng cho danh sách)
    const renderStaticStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<i key={i} className="fas fa-star" style={{ color: '#fbbf24' }}></i>);
            } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: '#fbbf24' }}></i>);
            } else {
                stars.push(<i key={i} className="far fa-star" style={{ color: '#cbd5e1' }}></i>);
            }
        }
        return <div className="cp-rating-stars" style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{stars}</div>;
    };

    return (
        <div className="cp-info-section">

            {/* 1. KHU VỰC THỐNG KÊ */}
            <h3>Đánh giá khóa học</h3>
            <div className="cp-rating-summary">
                <div className="cp-rating-score">
                    <div className="cp-rating-number">{summary.trungBinh.toFixed(1)}</div>
                    {renderStaticStars(summary.trungBinh)}
                    <div className="cp-rating-count">{summary.tongSo} đánh giá</div>
                </div>
                <div className="cp-rating-breakdown">
                    {[5, 4, 3, 2, 1].map((sao) => {
                        const key = `sao${sao}` as keyof typeof summary.tyLe;
                        const phanTram = summary.tyLe[key];
                        return (
                            <div className="cp-rating-item" key={sao}>
                                <span style={{ fontSize: '0.85rem', minWidth: '60px' }}>{sao} sao</span>
                                <div className="cp-rating-bar">
                                    <div className="cp-rating-bar-fill" style={{ width: `${phanTram}%` }}></div>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--cp-text-muted)' }}>{phanTram}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. CẤU TRÚC ĐIỀU KIỆN HIỂN THỊ FORM VÀ THÔNG BÁO */}
            {!daHoanThanhKhoaHoc ? (
                 // NẾU CHƯA HOÀN THÀNH: Hiện thông báo yêu cầu hoàn thành
                 <div style={{ background: '#fffbeb', border: '1px solid #fef08a', color: '#b45309', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                     <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                     Bạn cần hoàn thành tất cả bài học để có thể gửi đánh giá cho khóa học này. Hãy tiếp tục cố gắng nhé!
                 </div>
            ) : !hasReviewed ? (
                // NẾU ĐÃ HOÀN THÀNH VÀ CHƯA ĐÁNH GIÁ: Hiện form nhập
                <div className="cp-review-form-container">
                    <h5 style={{ marginBottom: '1rem', fontWeight: 600 }}>Gửi đánh giá của bạn</h5>

                    <div className="cp-star-selector" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={star <= (hoverRating || userRating) ? "fas fa-star active" : "fas fa-star"}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => setUserRating(star)}
                            ></i>
                        ))}
                    </div>

                    <textarea
                        className="cp-review-textarea"
                        placeholder="Chia sẻ cảm nhận của bạn về khóa học này..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                    ></textarea>

                    <button
                        className="cp-btn-submit-review"
                        onClick={handleSubmit}
                        disabled={isSubmitting || userRating === 0}
                    >
                        {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Đang gửi...</> : "Gửi đánh giá"}
                    </button>
                </div>
            ) : hienThongBao ? (
                // NẾU VỪA MỚI ĐÁNH GIÁ XONG: Hiện thông báo Cảm ơn trong 4s
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                    Bạn đã đánh giá khóa học này rồi. Cảm ơn sự đóng góp của bạn!
                </div>
            ) : null /* SAU 4 GIÂY HOẶC NẾU ĐÃ ĐÁNH GIÁ TỪ TRƯỚC: KHÔNG HIỆN GÌ CẢ */}


            {/* 3. DANH SÁCH BÌNH LUẬN */}
            <div id="cpReviewsList">
                {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                    reviews.map((review) => (
                        <div className="cp-review-item" key={review.id}>
                            <div className="cp-review-header">
                                <div>
                                    <div className="cp-review-author">
                                        {review.tenNguoiDung}
                                        {/* Tag báo hiệu review của chính User đó */}
                                        {review.maNguoiDung === maNguoiDung && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Bạn</span>}
                                    </div>
                                    {renderStaticStars(review.soSao)}
                                </div>
                                <div className="cp-review-date">
                                    {new Date(review.ngayTao).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="cp-review-text">
                                {review.noiDung}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};