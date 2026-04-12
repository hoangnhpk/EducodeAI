import { useState, useEffect } from 'react';
import type {
  ThongKeReview,
  ReviewItem,
  ReviewFilterParams,
} from './components/types';
import { reviewService } from '../../../services/review.service';
import ReviewStats from './components/ReviewStats';
import ReviewFilters from './components/ReviewFilters';
import ReviewTable from './components/ReviewTable';
import './components/Review.css';
import Swal from 'sweetalert2';

export default function QuanLyReview() {
  // ================== STATES ==================
  const [thongKe, setThongKe] = useState<ThongKeReview | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ReviewFilterParams>({
    loai: 'TatCa',
    trangThai: 'TatCa',
    soSao: 'TatCa',
    search: '',
    page: 1,
    pageSize: 10,
  });

  // ================== FETCH DATA ==================
  useEffect(() => {
    fetchThongKe();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchThongKe = async () => {
    try {
      const data = await reviewService.getThongKe();
      setThongKe(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await reviewService.getReviews(filters);
      setReviews(result.data);
      setTotalItems(result.total);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // ================== HANDLERS ==================
  const handleFilterChange = (newFilters: ReviewFilterParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleApprove = async (id: number, loai: 'BinhLuan' | 'DanhGia') => {
    try {
      await reviewService.approveReview(id, loai);
      await Promise.all([fetchReviews(), fetchThongKe()]);
    } catch (err) {
      console.error('Error approving review:', err);
      Swal.fire({ icon: 'error', text: 'Có lỗi xảy ra khi duyệt' });
    }
  };

  const handleReject = async (id: number, loai: 'BinhLuan' | 'DanhGia') => {
    try {
      await reviewService.rejectReview(id, loai);
      await Promise.all([fetchReviews(), fetchThongKe()]);
    } catch (err) {
      console.error('Error rejecting review:', err);
      Swal.fire({ icon: 'error', text: 'Có lỗi xảy ra khi từ chối' });
    }
  };

  const handleDelete = async (id: number, loai: 'BinhLuan' | 'DanhGia') => {
    try {
      await reviewService.deleteReview(id, loai);
      await Promise.all([fetchReviews(), fetchThongKe()]);
    } catch (err) {
      console.error('Error deleting review:', err);
      Swal.fire({ icon: 'error', text: 'Có lỗi xảy ra khi xóa' });
    }
  };

  // ================== RENDER ==================
  return (
    <div className="quan-ly-review-container">
      {/* Header */}
      <div className="page-header">
        <h2>Quản lý bình luận & đánh giá</h2>
        <p>Kiểm duyệt và quản lý phản hồi từ học viên</p>
      </div>

      {/* Stats Section */}
      <ReviewStats data={thongKe} />

      {/* Filters */}
      <ReviewFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Table */}
      <div className="review-table-section">
        <div className="section-header">
          <h3>
            Danh sách ({totalItems} {filters.loai === 'BinhLuan' ? 'bình luận' : filters.loai === 'DanhGia' ? 'đánh giá' : 'mục'})
          </h3>
        </div>

        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchReviews}>Thử lại</button>
          </div>
        ) : (
          <ReviewTable
            reviews={reviews}
            currentPage={filters.page || 1}
            totalPages={Math.ceil(totalItems / (filters.pageSize || 10))}
            loading={loading}
            onPageChange={handlePageChange}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}