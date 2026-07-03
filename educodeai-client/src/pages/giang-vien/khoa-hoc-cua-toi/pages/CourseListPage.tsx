import React from 'react';
import { useCourseList, FILTERS, FILTER_LABELS } from '../hooks/useCourseList';
import CourseCard from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

interface Props {
  onCreateNew: () => void;
  onEdit: (maKhoaHoc: number) => void;
  onManage: (maKhoaHoc: number) => void;
}

const CourseListPage: React.FC<Props> = ({ onCreateNew, onEdit, onManage }) => {
  const {
    courses, loading, error, searchQuery, filter, categoryFilter, currentPage,
    deletingId, confirmTarget, debouncedSearch,
    categories, filtered, paginatedCourses, totalPages, totalStudents, avgRating,
    setFilter, setCategoryFilter, setCurrentPage, setConfirmTarget,
    handleSearchChange, handleConfirmArchive, handleRestore, loadCourses,
    ToastContainer, showToast
  } = useCourseList();

  const handleDuplicate = (_maKhoaHoc: number) => {
    showToast('info', 'Tính năng nhân bản khóa học đang phát triển.');
  };

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
          <div className="khm-stat-row khm-mb-24">
            <div className="khm-stat-card">
              <div className="khm-stat-value">{courses.length}</div>
              <div className="khm-stat-label">Khóa học</div>
            </div>
            <div className="khm-stat-card">
              <div className="khm-stat-value">{totalStudents}</div>
              <div className="khm-stat-label">Tổng HV</div>
            </div>
            <div className="khm-stat-card">
              <div className="khm-stat-value khm-text-accent">{avgRating}</div>
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
              </button>
            ))}
          </div>
          <select
            className="khm-category-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'Tất cả' ? 'Tất cả lĩnh vực' : cat}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="khm-course-grid">
            {[1, 2, 3, 4].map(i => <CourseCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="khm-text-center khm-py-60 khm-px-24">
            <div className="khm-empty-icon khm-mx-auto khm-mb-16">⚠️</div>
            <p className="khm-text-danger khm-mb-16">{error}</p>
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
          <>
            <div className="khm-course-grid">
              {paginatedCourses.map(c => (
                <CourseCard
                  key={c.maKhoaHoc}
                  course={c}
                  onEdit={onEdit}
                  onManage={onManage}
                  onArchive={setConfirmTarget}
                  onDuplicate={handleDuplicate}
                  onRestore={handleRestore}
                  isDeleting={deletingId === c.maKhoaHoc}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="khm-pagination">
                <button
                  className="khm-btn khm-btn-outline khm-btn-sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Trang trước
                </button>
                <span className="khm-pagination-info">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className="khm-btn khm-btn-outline khm-btn-sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Trang sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title="Xóa khóa học?"
        message={`Khóa học "${confirmTarget?.tenKhoaHoc ?? ''}" sẽ bị đưa vào thùng rác. Học viên sẽ không thể tiếp tục truy cập.`}
        confirmText="Xóa mềm"
        cancelText="Hủy"
        variant="danger"
        onConfirm={() => void handleConfirmArchive()}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};

export default CourseListPage;
