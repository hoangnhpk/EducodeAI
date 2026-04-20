import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { KhoaHocListItem } from '../types';
import * as api from '../api/khoaHocApi';
import CourseCard from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToastStandalone } from '../components/ui/Toast';

type Filter = 'Tất cả' | 'Draft' | 'Published' | 'Archived';
const FILTERS: Filter[] = ['Tất cả', 'Draft', 'Published', 'Archived'];
const FILTER_LABELS: Record<Filter, string> = {
  'Tất cả': 'Tất cả',
  Draft: 'Nháp',
  Published: 'Đang dạy',
  Archived: 'Lưu trữ',
};

const getGiangVienId = (): number => {
  try {
    const raw = localStorage.getItem('user_info');
    if (raw) {
      const u = JSON.parse(raw);
      return u.maNguoiDung ?? u.id ?? 1;
    }
  } catch { /* ignore */ }
  return 1;
};

interface Props {
  onCreateNew: () => void;
  onEdit: (maKhoaHoc: number) => void;
  onManage: (maKhoaHoc: number) => void;
}

const CourseListPage: React.FC<Props> = ({ onCreateNew, onEdit, onManage }) => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [courses, setCourses] = useState<KhoaHocListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Tất cả');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<KhoaHocListItem | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDanhSachKhoaHoc(maGiangVien);
      setCourses(data);
    } catch {
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [maGiangVien]);

  useEffect(() => { void loadCourses(); }, [loadCourses]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const filtered = courses.filter(c => {
    const matchFilter = filter === 'Tất cả' || c.trangThai === filter;
    const matchSearch = !debouncedSearch ||
      c.tenKhoaHoc.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.linhVuc.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleConfirmArchive = async () => {
    if (!confirmTarget) return;
    try {
      setDeletingId(confirmTarget.maKhoaHoc);
      setConfirmTarget(null);
      await api.xoaKhoaHoc(maGiangVien, confirmTarget.maKhoaHoc);
      setCourses(prev => prev.filter(c => c.maKhoaHoc !== confirmTarget.maKhoaHoc));
      showToast('success', 'Khóa học đã được lưu trữ.');
    } catch {
      showToast('error', 'Lỗi lưu trữ khóa học. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  // Stats
  const totalStudents = courses.reduce((s, c) => s + c.soHocVien, 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((s, c) => s + c.diemDanhGiaTB, 0) / courses.length).toFixed(1)
    : '—';

  return (
    <div className="khm-wrapper">
      <ToastContainer />

      <div className="khm-page">
        {/* Header */}
        <div className="khm-page-header">
          <div>
            <h1 className="khm-page-title">Khóa học của tôi</h1>
            <p className="khm-page-subtitle">Quản lý toàn bộ khóa học bạn đã tạo</p>
          </div>
          <button className="khm-btn khm-btn-primary" onClick={onCreateNew}>
            + Tạo khóa học mới
          </button>
        </div>

        {/* Quick stats */}
        {!loading && !error && courses.length > 0 && (
          <div className="khm-stat-row" style={{ marginBottom: 24 }}>
            <div className="khm-stat-card">
              <div className="khm-stat-value">{courses.length}</div>
              <div className="khm-stat-label">Khóa học</div>
            </div>
            <div className="khm-stat-card">
              <div className="khm-stat-value">{totalStudents}</div>
              <div className="khm-stat-label">Tổng HV</div>
            </div>
            <div className="khm-stat-card">
              <div className="khm-stat-value" style={{ color: 'var(--khm-accent)' }}>{avgRating}</div>
              <div className="khm-stat-label">Đánh giá TB</div>
            </div>
            <div className="khm-stat-card">
              <div className="khm-stat-value">{courses.filter(c => c.coChungChi).length}</div>
              <div className="khm-stat-label">Có chứng chỉ</div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="khm-filter-bar">
          <div className="khm-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="khm-search-input"
              placeholder="Tìm khóa học..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="khm-status-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`khm-status-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
                {f !== 'Tất cả' && (
                  <span style={{ marginLeft: 4, fontSize: '0.7rem', opacity: 0.7 }}>
                    ({courses.filter(c => c.trangThai === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="khm-course-grid">
            {[1, 2, 3, 4].map(i => <CourseCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div className="khm-empty-icon" style={{ margin: '0 auto 16px' }}>⚠️</div>
            <p style={{ color: 'var(--khm-danger)', marginBottom: 16 }}>{error}</p>
            <button className="khm-btn khm-btn-outline" onClick={() => void loadCourses()}>
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📚"
            title={debouncedSearch ? 'Không tìm thấy kết quả' : 'Bạn chưa có khóa học nào'}
            description={
              debouncedSearch
                ? `Không tìm thấy khóa học với từ khóa "${debouncedSearch}"`
                : 'Hãy tạo khóa học đầu tiên để bắt đầu dạy học!'
            }
            action={
              !debouncedSearch ? (
                <button className="khm-btn khm-btn-primary" onClick={onCreateNew}>
                  + Tạo khóa học mới
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="khm-course-grid">
            {filtered.map(c => (
              <CourseCard
                key={c.maKhoaHoc}
                course={c}
                onEdit={onEdit}
                onManage={onManage}
                onArchive={setConfirmTarget}
                isDeleting={deletingId === c.maKhoaHoc}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title="Lưu trữ khóa học?"
        message={`Khóa học "${confirmTarget?.tenKhoaHoc ?? ''}" sẽ bị lưu trữ. Học viên hiện tại sẽ không thể tiếp tục truy cập.`}
        confirmText="Lưu trữ"
        cancelText="Hủy"
        variant="warning"
        onConfirm={() => void handleConfirmArchive()}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default CourseListPage;
