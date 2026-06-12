import { RefreshCw, Search } from 'lucide-react';
import type { ReviewCourseInfo, ReviewFilterParams, ReviewSource } from './ReviewAdmin.types';

interface Props {
  filters: ReviewFilterParams;
  source: ReviewSource;
  loading: boolean;
  courses: ReviewCourseInfo[];
  onFilterChange: (filters: ReviewFilterParams) => void;
  onRefresh: () => void;
}

export default function ReviewAdminFilters({
  filters,
  source,
  loading,
  courses,
  onFilterChange,
  onRefresh,
}: Props) {
  const handleChange = <K extends keyof ReviewFilterParams>(key: K, value: ReviewFilterParams[K]) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <section className="qtrv-filters-card">
      {/* Search Box */}
      <div className="qtrv-search-box">
        <Search size={15} />
        <input
          type="text"
          placeholder="Tìm theo học viên, khóa học..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      {/* Dropdown Filters */}
      <select
        value={filters.trangThai || 'TatCa'}
        onChange={(e) => handleChange('trangThai', e.target.value as ReviewFilterParams['trangThai'])}
      >
        <option value="TatCa">Tất cả trạng thái</option>
        <option value="ChoDuyet">⏳ Chờ duyệt</option>
        <option value="DaDuyet">✅ Đã duyệt</option>
        <option value="TuChoi">❌ Từ chối</option>
      </select>

      <select
        value={filters.soSao || 'TatCa'}
        onChange={(e) =>
          handleChange('soSao', e.target.value === 'TatCa' ? 'TatCa' : Number(e.target.value) as ReviewFilterParams['soSao'])
        }
      >
        <option value="TatCa">Tất cả mức sao</option>
        <option value="5">5 sao</option>
        <option value="4">4 sao</option>
        <option value="3">3 sao</option>
        <option value="2">2 sao</option>
        <option value="1">1 sao</option>
      </select>

      <select
        value={filters.maKhoaHoc || 'TatCa'}
        onChange={(e) =>
          handleChange('maKhoaHoc', e.target.value === 'TatCa' ? 'TatCa' : Number(e.target.value) as ReviewFilterParams['maKhoaHoc'])
        }
      >
        <option value="TatCa">Tất cả khóa học</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.tenKhoaHoc}</option>
        ))}
      </select>

      <button
        type="button"
        className="qtrv-reset-btn"
        onClick={() => onFilterChange({ trangThai: 'TatCa', soSao: 'TatCa', maKhoaHoc: 'TatCa', search: '', page: 1, pageSize: filters.pageSize || 10 })}
      >
        Đặt lại
      </button>

      {/* Right side actions */}
      <div className="qtrv-filters-card__actions">
        <span className={`qtrv-source-badge ${source === 'mock' ? 'is-mock' : 'is-api'}`}>
          {source === 'mock' ? 'Demo' : 'Dữ liệu API'}
        </span>
        <button type="button" className="qtrv-refresh-btn" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Làm mới
        </button>
      </div>
    </section>
  );
}
