import { Filter, RefreshCw, Search } from 'lucide-react';
import type { ReviewFilterParams, ReviewSource } from './ReviewAdmin.types';

interface Props {
  filters: ReviewFilterParams;
  source: ReviewSource;
  loading: boolean;
  onFilterChange: (filters: ReviewFilterParams) => void;
  onRefresh: () => void;
}

export default function ReviewAdminFilters({
  filters,
  source,
  loading,
  onFilterChange,
  onRefresh,
}: Props) {
  const handleChange = <K extends keyof ReviewFilterParams>(key: K, value: ReviewFilterParams[K]) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <section className="qtrv-filters-card">
      <div className="qtrv-filters-card__header">
        <div className="qtrv-filters-card__title">
          <Filter size={18} />
          <div>
            <h3>Bộ lọc và xử lý</h3>
            <p>Tìm nhanh đánh giá cần xử lý theo trạng thái, số sao và nội dung.</p>
          </div>
        </div>

        <div className="qtrv-filters-card__actions">
          <span className={`qtrv-source-badge ${source === 'mock' ? 'is-mock' : 'is-api'}`}>
            {source === 'mock' ? 'Dữ liệu demo' : 'Dữ liệu API'}
          </span>
          <button type="button" className="qtrv-refresh-btn" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="qtrv-search-row">
        <div className="qtrv-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm theo học viên, khóa học, nội dung đánh giá..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        <div className="qtrv-filter-grid">
          <select
            value={filters.trangThai || 'TatCa'}
            onChange={(e) => handleChange('trangThai', e.target.value as ReviewFilterParams['trangThai'])}
          >
            <option value="TatCa">Tất cả trạng thái</option>
            <option value="ChoDuyet">Chờ duyệt</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="TuChoi">Từ chối</option>
          </select>

          <select
            value={filters.soSao || 'TatCa'}
            onChange={(e) =>
              handleChange(
                'soSao',
                e.target.value === 'TatCa' ? 'TatCa' : Number(e.target.value) as ReviewFilterParams['soSao']
              )
            }
          >
            <option value="TatCa">Tất cả mức sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <button
            type="button"
            className="qtrv-reset-btn"
            onClick={() =>
              onFilterChange({
                trangThai: 'TatCa',
                soSao: 'TatCa',
                search: '',
                page: 1,
                pageSize: filters.pageSize || 10,
              })
            }
          >
            Đặt lại
          </button>
        </div>
      </div>
    </section>
  );
}
