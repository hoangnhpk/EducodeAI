import { Search, Filter } from 'lucide-react';
import type { ReviewFilterParams } from './Types';

interface Props {
  filters: ReviewFilterParams;
  onFilterChange: (filters: ReviewFilterParams) => void;
}

export default function ReviewFilters({ filters, onFilterChange }: Props) {
  const handleChange = (key: keyof ReviewFilterParams, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="review-filters">
      <div className="filters-header">
        <Filter size={20} />
        <h3>Bộ lọc</h3>
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-item full-width">
          <label>Tìm kiếm</label>
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, nội dung..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Loại */}
        <div className="filter-item">
          <label>Loại</label>
          <select
            value={filters.loai || 'TatCa'}
            onChange={(e) => handleChange('loai', e.target.value)}
          >
            <option value="TatCa">Tất cả</option>
            <option value="BinhLuan">Bình luận</option>
            <option value="DanhGia">Đánh giá</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div className="filter-item">
          <label>Trạng thái</label>
          <select
            value={filters.trangThai || 'TatCa'}
            onChange={(e) => handleChange('trangThai', e.target.value)}
          >
            <option value="TatCa">Tất cả</option>
            <option value="ChoDuyet">Chờ duyệt</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="TuChoi">Từ chối</option>
          </select>
        </div>

        {/* Số sao (chỉ hiện khi filter = DanhGia) */}
        {(filters.loai === 'DanhGia' || filters.loai === 'TatCa') && (
          <div className="filter-item">
            <label>Số sao</label>
            <select
              value={filters.soSao || 'TatCa'}
              onChange={(e) =>
                handleChange(
                  'soSao',
                  e.target.value === 'TatCa' ? 'TatCa' : Number(e.target.value)
                )
              }
            >
              <option value="TatCa">Tất cả</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>
          </div>
        )}

        {/* Reset button */}
        <div className="filter-item">
          <label>&nbsp;</label>
          <button
            className="btn-reset"
            onClick={() =>
              onFilterChange({
                loai: 'TatCa',
                trangThai: 'TatCa',
                soSao: 'TatCa',
                search: '',
                page: 1,
                pageSize: 10,
              })
            }
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}