import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ShieldCheck, Star } from 'lucide-react';
import { reviewAdminService } from '../../../services/review-admin.service';
import ReviewAdminDetailDrawer from './components/ReviewAdminDetailDrawer';
import ReviewAdminFilters from './components/ReviewAdminFilters';
import ReviewAdminStats from './components/ReviewAdminStats';
import ReviewAdminTable from './components/ReviewAdminTable';
import type { ReviewFilterParams, ReviewItem, ReviewSource, ThongKeReview } from './components/ReviewAdmin.types';
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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<ReviewSource>('api');
  const [error, setError] = useState<string | null>(null);

  const fetchThongKe = async () => {
    const result = await reviewAdminService.getThongKe();
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
      setError(err.response?.data?.message || 'Khong the tai module quan ly danh gia khoa hoc.');
    } finally {
      setLoading(false);
    }
  };

  const reloadAll = async (nextFilters = filters) => {
    await Promise.all([fetchThongKe(), fetchReviews(nextFilters)]);
  };

  useEffect(() => {
    reloadAll(filters);
  }, []);

  useEffect(() => {
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
        text: err.response?.data?.message || 'Khong the cap nhat du lieu.',
      });
    }
  };

  const handleApprove = async (id: number) => {
    await handleMutation(() => reviewAdminService.approveReview(id), 'Da duyet noi dung thanh cong.');
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, trangThai: 'DaDuyet' } : prev));
    }
  };

  const handleReject = async (id: number) => {
    await handleMutation(() => reviewAdminService.rejectReview(id), 'Da tu choi noi dung.');
    if (selectedReview?.id === id) {
      setSelectedReview((prev) => (prev ? { ...prev, trangThai: 'TuChoi' } : prev));
    }
  };

  const handleDelete = async (id: number) => {
    await handleMutation(() => reviewAdminService.deleteReview(id), 'Da xoa noi dung khoi danh sach.');
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
            <h1>Quan ly danh gia khoa hoc</h1>
            <p>
              Theo doi chat luong khoa hoc, kiem duyet nhan xet hoc vien va xu ly cac danh gia
              khong phu hop trong giao dien quan tri hien co.
            </p>
          </div>
        </div>

        <div className="qtrv-hero__aside">
          <div className="qtrv-kpi-pill">
            <Star size={18} />
            <div>
              <strong>{thongKe?.danhGiaTrungBinh.toFixed(1) || '0.0'}</strong>
              <span>Diem danh gia trung binh</span>
            </div>
          </div>
        </div>
      </section>

      <ReviewAdminStats data={thongKe} />

      <ReviewAdminFilters
        filters={filters}
        source={source}
        loading={loading}
        onFilterChange={setFilters}
        onRefresh={() => reloadAll(filters)}
      />

      {error ? (
        <div className="qtrv-error-card">
          <h3>Loi tai du lieu</h3>
          <p>{error}</p>
          <button type="button" onClick={() => reloadAll(filters)}>
            Thu lai
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
