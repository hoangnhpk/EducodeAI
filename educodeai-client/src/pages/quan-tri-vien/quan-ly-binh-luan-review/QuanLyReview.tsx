import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import type {
  ThongKeReview,
  ReviewItem,
  ReviewFilterParams,
  KhoaHoc,
} from './components/Types';
import { reviewService } from '../../../services/review.service';
import ReviewStats from './components/ReviewStats';
import ReviewFilters from './components/ReviewFilters';
import ReviewTable from './components/ReviewTable';
import './components/Review.css';

export default function QuanLyReview() {
  // ================== STATES ==================
  const [thongKe, setThongKe] = useState<ThongKeReview | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [khoaHocs, setKhoaHocs] = useState<KhoaHoc[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ReviewFilterParams>({
    loai: 'TatCa',
    trangThai: 'TatCa',
    soSao: 'TatCa',
    maKhoaHoc: 'TatCa',
    search: '',
    page: 1,
    pageSize: 10,
  });

  // ================== FETCH DATA ==================
  useEffect(() => {
    fetchThongKe();
    fetchKhoaHocs();
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

  const fetchKhoaHocs = async () => {
    // In a real app, fetch from KhoaHocService
    // For now, I'll provide mock courses that match the service mock data
    const mockKH: KhoaHoc[] = [
      { id: 301, tenKhoaHoc: 'Khóa học Python cơ bản' },
      { id: 302, tenKhoaHoc: 'Khóa học JavaScript nâng cao' },
      { id: 303, tenKhoaHoc: 'Khóa học React từ đầu' },
    ];
    setKhoaHocs(mockKH);
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
      const result = await Swal.fire({
        title: 'Xác nhận duyệt',
        text: `Bạn có chắc chắn muốn duyệt ${loai === 'BinhLuan' ? 'bình luận' : 'đánh giá'} này?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Duyệt ngay',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await reviewService.approveReview(id, loai);
        Swal.fire('Thành công', 'Đã duyệt nội dung', 'success');
        await Promise.all([fetchReviews(), fetchThongKe()]);
      }
    } catch (err) {
      console.error('Error approving review:', err);
      Swal.fire({ icon: 'error', text: 'Có lỗi xảy ra khi duyệt' });
    }
  };

  const handleReject = async (id: number, loai: 'BinhLuan' | 'DanhGia') => {
    try {
      const result = await Swal.fire({
        title: 'Từ chối duyệt',
        text: 'Nhập lý do từ chối (tùy chọn):',
        input: 'text',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Từ chối',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await reviewService.rejectReview(id, loai);
        Swal.fire('Đã từ chối', 'Nội dung đã bị từ chối duyệt', 'info');
        await Promise.all([fetchReviews(), fetchThongKe()]);
      }
    } catch (err) {
      console.error('Error rejecting review:', err);
      Swal.fire({ icon: 'error', text: 'Có lỗi xảy ra khi từ chối' });
    }
  };

  const handleDelete = async (id: number, loai: 'BinhLuan' | 'DanhGia') => {
    try {
      await reviewService.deleteReview(id, loai);
      Swal.fire('Đã xóa', 'Dữ liệu đã được xóa vĩnh viễn', 'success');
      await Promise.all([fetchReviews(), fetchThongKe()]);
    } catch (err) {
      console.error('Error deleting review:', err);
      Swal.fire({ icon: 'error', text: 'Có lỗi xảy ra khi xóa' });
    }
  };

  // ================== RENDER ==================
  return (
    <div className="quan-ly-review-premium">
      {/* Header */}
      <div className="premium-header">
        <div className="header-content">
          <h1 className="title-gradient">Quản lý Đánh giá & Bình luận</h1>
          <p className="subtitle">Kiểm soát chất lượng nội dung và phản hồi từ học viên trên toàn hệ thống</p>
        </div>
        <div className="header-actions">
           <span className="last-updated">Cập nhật lần cuối: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Section */}
      <ReviewStats data={thongKe} />

      {/* Filters */}
      <ReviewFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        khoaHocs={khoaHocs}
      />

      {/* Table Section */}
      <div className="review-content-section shadow-premium">
        <div className="table-header-info">
          <div className="list-count">
            <span className="count-badge">{totalItems}</span>
            <span className="count-label">kết quả tìm thấy</span>
          </div>
          <div className="filter-summary">
            {filters.loai !== 'TatCa' && <span className="tag">{filters.loai}</span>}
            {filters.trangThai !== 'TatCa' && <span className="tag status">{filters.trangThai}</span>}
          </div>
        </div>

        {error ? (
          <div className="error-display">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchReviews}>Thử lại</button>
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
