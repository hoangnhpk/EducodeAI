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
    trangThai?: string; // 'DaDuyet' | 'ChoDuyet' | 'TuChoi'
}

interface RatingSummary {
    trungBinh: number;
    tongSo: number;
    tyLe: { sao5: number; sao4: number; sao3: number; sao2: number; sao1: number };
}

interface Props {
    maKhoaHoc: number;
    maNguoiDung: number;
    daHoanThanhKhoaHoc: boolean;
}

export const TabDanhGia: React.FC<Props> = ({ maKhoaHoc, maNguoiDung, daHoanThanhKhoaHoc }) => {
    const [userRating, setUserRating]     = useState<number>(0);
    const [hoverRating, setHoverRating]   = useState<number>(0);
    const [comment, setComment]           = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 'none' = chưa đánh giá | 'pending' = ChoDuyet | 'approved' = DaDuyet | 'rejected' = TuChoi
    const [myStatus, setMyStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<RatingSummary>({
        trungBinh: 0, tongSo: 0,
        tyLe: { sao5: 0, sao4: 0, sao3: 0, sao2: 0, sao1: 0 }
    });

    useEffect(() => {
        if (maKhoaHoc) fetchReviews();
    }, [maKhoaHoc]);

    const fetchReviews = async () => {
        try {
            const res: any = await axiosClient.get(`/api/NoiDungKhoaHoc/ds-danh-gia-khoa-hoc/${maKhoaHoc}`);
            setReviews(res.danhSach);
            setSummary(res.thongKe);

            // Tìm review của chính mình (backend trả về cả ChoDuyet & TuChoi của chính chủ)
            const mine = res.danhSach.find((r: Review) => r.maNguoiDung === maNguoiDung);
            if (!mine)                              setMyStatus('none');
            else if (mine.trangThai === 'ChoDuyet') setMyStatus('pending');
            else if (mine.trangThai === 'TuChoi')   setMyStatus('rejected');
            else                                    setMyStatus('approved');
        } catch (err) {
            console.error('Lỗi lấy đánh giá:', err);
        }
    };

    const handleSubmit = async () => {
        if (userRating === 0) {
            Swal.fire({ icon: 'warning', text: 'Vui lòng chọn số sao!', timer: 1500, showConfirmButton: false });
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
            Swal.fire({ icon: 'success', text: 'Cảm ơn bạn đã đánh giá!', timer: 1500, showConfirmButton: false });
            setComment('');
            setUserRating(0);
            await fetchReviews();
        } catch (err: any) {
            Swal.fire({ icon: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!', timer: 2000, showConfirmButton: false });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating: number) => (
        <div className="cp-rating-stars" style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>
            {[1, 2, 3, 4, 5].map(i => {
                if (i <= rating) return <i key={i} className="fas fa-star" style={{ color: '#fbbf24' }} />;
                if (i === Math.ceil(rating) && !Number.isInteger(rating))
                    return <i key={i} className="fas fa-star-half-alt" style={{ color: '#fbbf24' }} />;
                return <i key={i} className="far fa-star" style={{ color: '#cbd5e1' }} />;
            })}
        </div>
    );

    // Học viên đã gửi (pending/approved/rejected) → không cho gửi lại, không lộ nội tình
    const hasSubmitted = myStatus !== 'none';

    return (
        <div className="cp-info-section">

            {/* ── THỐNG KÊ ── */}
            <h3>Đánh giá khóa học</h3>
            <div className="cp-rating-summary">
                <div className="cp-rating-score">
                    <div className="cp-rating-number">{summary.trungBinh.toFixed(1)}</div>
                    {renderStars(summary.trungBinh)}
                    <div className="cp-rating-count">{summary.tongSo} đánh giá</div>
                </div>
                <div className="cp-rating-breakdown">
                    {[5, 4, 3, 2, 1].map(sao => {
                        const key = `sao${sao}` as keyof typeof summary.tyLe;
                        return (
                            <div className="cp-rating-item" key={sao}>
                                <span style={{ fontSize: '0.85rem', minWidth: '60px' }}>{sao} sao</span>
                                <div className="cp-rating-bar">
                                    <div className="cp-rating-bar-fill" style={{ width: `${summary.tyLe[key]}%` }} />
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--cp-text-muted)' }}>{summary.tyLe[key]}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── FORM / TRẠNG THÁI ── */}
            {!daHoanThanhKhoaHoc ? (
                /* Chưa hoàn thành khóa */
                <div style={{ background: '#fffbeb', border: '1px solid #fef08a', color: '#b45309', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <i className="fas fa-lock" style={{ marginRight: '8px' }} />
                    Bạn cần hoàn thành tất cả bài học để có thể gửi đánh giá.
                </div>
            ) : hasSubmitted ? (
                /* Đã gửi rồi (dù đang chờ, đã duyệt, hay bị từ chối) → hiện "Đã đánh giá" */
                <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534',
                    padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <i className="fas fa-check-circle" />
                    <span>Bạn đã đánh giá khóa học này. Cảm ơn đóng góp của bạn!</span>
                </div>
            ) : (
                /* Chưa đánh giá → form */
                <div className="cp-review-form-container">
                    <h5 style={{ marginBottom: '1rem', fontWeight: 600 }}>Gửi đánh giá của bạn</h5>
                    <div className="cp-star-selector" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <i
                                key={star}
                                className={star <= (hoverRating || userRating) ? 'fas fa-star active' : 'fas fa-star'}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => setUserRating(star)}
                            />
                        ))}
                    </div>
                    <textarea
                        className="cp-review-textarea"
                        placeholder="Chia sẻ cảm nhận của bạn về khóa học này..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        maxLength={500}
                    />
                    <button
                        className="cp-btn-submit-review"
                        onClick={handleSubmit}
                        disabled={isSubmitting || userRating === 0}
                    >
                        {isSubmitting ? <><i className="fas fa-spinner fa-spin" /> Đang gửi...</> : 'Gửi đánh giá'}
                    </button>
                </div>
            )}

            {/* ── DANH SÁCH ĐÁNH GIÁ ── */}
            {/* Chỉ hiện DaDuyet (công khai) + ChoDuyet của chính mình (họ thấy review mình bth)
                TuChoi bị ẩn hoàn toàn khỏi danh sách */}
            <div id="cpReviewsList">
                {reviews.filter(r =>
                    r.trangThai === 'DaDuyet' ||
                    (r.maNguoiDung === maNguoiDung && r.trangThai === 'ChoDuyet')
                ).length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>
                        Chưa có đánh giá nào. Hãy là người đầu tiên!
                    </p>
                ) : (
                    reviews
                        .filter(r =>
                            r.trangThai === 'DaDuyet' ||
                            (r.maNguoiDung === maNguoiDung && r.trangThai === 'ChoDuyet')
                        )
                        .map(review => (
                            <div key={review.id} className="cp-review-item">
                                <div className="cp-review-header">
                                    <div>
                                        <div className="cp-review-author">
                                            {review.tenNguoiDung}
                                            {review.maNguoiDung === maNguoiDung && (
                                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Bạn</span>
                                            )}
                                            {/* Không hiện bất kỳ badge trạng thái nào */}
                                        </div>
                                        {renderStars(review.soSao)}
                                    </div>
                                    <div className="cp-review-date">
                                        {new Date(review.ngayTao).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                <div className="cp-review-text">{review.noiDung}</div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};