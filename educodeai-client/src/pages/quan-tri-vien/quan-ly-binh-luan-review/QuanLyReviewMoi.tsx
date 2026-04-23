import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ShieldCheck } from 'lucide-react';
import { reviewAdminService } from '../../../services/review-admin.service';
import ReviewAdminDetailDrawer from './components/ReviewAdminDetailDrawer';
import ReviewAdminFilters from './components/ReviewAdminFilters';
import ReviewAdminStats from './components/ReviewAdminStats';
import ReviewAdminTable from './components/ReviewAdminTable';
import type { ReviewFilterParams, ReviewItem, ReviewSource, ThongKeReview, ReviewCourseInfo } from './components/ReviewAdmin.types';
import './ReviewAdmin.css';

const DEFAULT_FILTERS: ReviewFilterParams = {
  trangThai: 'TatCa',
  soSao: 'TatCa',
  search: '',
  page: 1,
  pageSize: 10,
};

export default function QuanLyReviewMoi() {
  const [thongKe, setThongKe] = useState<ThongKeReview | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [filters, setFilters] = useState<ReviewFilterParams>(DEFAULT_FILTERS);
  const [courses, setCourses] = useState<ReviewCourseInfo[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<ReviewSource>('api');
  const [error, setError] = useState<string | null>(null);

  const fetchThongKe = async (nextFilters = filters) => {
    const maKhoaHoc = nextFilters.maKhoaHoc === 'TatCa' ? undefined : Number(nextFilters.maKhoaHoc);
    const result = await reviewAdminService.getThongKe(maKhoaHoc || undefined);
    setThongKe(result.data);
    setSource(result.source);
  };

  const fetchReviews = async (nextFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const result = await reviewAdminService.getReviews(nextFilters);
      setReviews(result.data.data);
      setTotalItems(result.data.total);
      setTotalPages(result.data.totalPages);
      setSource(result.source);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Không thể tải module quản lý đánh giá khóa học.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const result = await reviewAdminService.getKhoaHocFilters();
      setCourses(result.data);
    } catch (err) {
      console.error('Error fetching course filters:', err);
    }
  };

  const reloadAll = async (nextFilters = filters) => {
    await Promise.all([fetchThongKe(nextFilters), fetchCourses(), fetchReviews(nextFilters)]);
  };

  useEffect(() => {
    reloadAll(filters);
  }, []);

  useEffect(() => {
    fetchThongKe(filters);
    fetchReviews(filters);
  }, [filters]);

  const handleMutation = async (
    action: () => Promise<unknown>,
    successMessage: string
  ) => {
    try {
      await action();
      await reloadAll(filters);
      Swal.fire({
        icon: 'success',
        text: successMessage,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        text: err.response?.data?.message || 'Không thể cập nhật dữ liệu.',
      });
    }
  };

  const handleApprove = async (id: number) => {
    await handleMutation(() => reviewAdminService.approveReview(id), 'Đã duyệt nội dung thành công.');
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, trangThai: 'DaDuyet' } : prev));
    }
  };

  const handleReject = async (id: number) => {
    await handleMutation(() => reviewAdminService.rejectReview(id), 'Đã từ chối nội dung.');
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, trangThai: 'TuChoi' } : prev));
    }
  };

  const handleDelete = async (id: number) => {
    await handleMutation(() => reviewAdminService.deleteReview(id), 'Đã xóa nội dung khỏi danh sách.');
    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
  };

  return (
    <div className="qtrv-page">
      <section className="qtrv-hero">
        <div className="qtrv-hero__content">
          <div className="qtrv-hero__icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1>Quản lý đánh giá khóa học</h1>
            <p>
              Theo dõi chất lượng khóa học, kiểm duyệt nhận xét học viên và xử lý các đánh giá
              không phù hợp trong giao diện quản trị hiện có.
            </p>
          </div>
        </div>
      </section>

      <ReviewAdminStats data={thongKe} />

      <ReviewAdminFilters
        filters={filters}
        source={source}
        loading={loading}
        courses={courses}
        onFilterChange={setFilters}
        onRefresh={() => reloadAll(filters)}
      />

      {error ? (
        <div className="qtrv-error-card">
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button type="button" onClick={() => reloadAll(filters)}>
            Thử lại
          </button>
        </div>
      ) : (
        <ReviewAdminTable
          reviews={reviews}
          currentPage={filters.page || 1}
          totalPages={totalPages}
          totalItems={totalItems}
          loading={loading}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onPreview={setSelectedReview}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      <ReviewAdminDetailDrawer
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
