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
            <h3>Bo loc va xu ly</h3>
            <p>Tim nhanh danh gia can xu ly theo trang thai, so sao va noi dung.</p>
          </div>
        </div>

        <div className="qtrv-filters-card__actions">
          <span className={`qtrv-source-badge ${source === 'mock' ? 'is-mock' : 'is-api'}`}>
            {source === 'mock' ? 'Du lieu demo' : 'Du lieu API'}
          </span>
          <button type="button" className="qtrv-refresh-btn" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Lam moi
          </button>
        </div>
      </div>

      <div className="qtrv-search-row">
        <div className="qtrv-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tim theo hoc vien, khoa hoc, noi dung danh gia..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        <div className="qtrv-filter-grid">
          <select
            value={filters.trangThai || 'TatCa'}
            onChange={(e) => handleChange('trangThai', e.target.value as ReviewFilterParams['trangThai'])}
          >
            <option value="TatCa">Tat ca trang thai</option>
            <option value="ChoDuyet">Cho duyet</option>
            <option value="DaDuyet">Da duyet</option>
            <option value="TuChoi">Tu choi</option>
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
            <option value="TatCa">Tat ca muc sao</option>
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
            Dat lai
          </button>
        </div>
      </div>
    </section>
  );
}
