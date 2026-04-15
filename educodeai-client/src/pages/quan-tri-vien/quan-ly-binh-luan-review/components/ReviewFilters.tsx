import { Filter, RotateCcw } from 'lucide-react';
import type { ReviewFilterParams, KhoaHoc } from './Types';

interface Props {
  filters: ReviewFilterParams;
  onFilterChange: (filters: ReviewFilterParams) => void;
  khoaHocs: KhoaHoc[];
}

export default function ReviewFilters({ filters, onFilterChange, khoaHocs }: Props) {
  const handleChange = (key: keyof ReviewFilterParams, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const resetFilters = () => {
    onFilterChange({
      loai: 'TatCa',
      trangThai: 'TatCa',
      soSao: 'TatCa',
      maKhoaHoc: 'TatCa',
      search: '',
      page: 1,
      pageSize: 10,
    });
  };

  return (
    <div className="review-filters-premium">
      <div className="filters-header">
        <div className="header-title">
          <Filter size={18} />
          <h3>Bộ lọc nâng cao</h3>
        </div>
        <button className="btn-reset-premium" onClick={resetFilters}>
          <RotateCcw size={14} />
          Đặt lại
        </button>
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-item">
          <label>Tìm kiếm</label>
          <div className="premium-input-wrapper">
            <input
              type="text"
              placeholder="Tên học viên, nội dung..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Khóa học */}
        <div className="filter-item">
          <label>Khóa học</label>
          <select
            value={filters.maKhoaHoc || 'TatCa'}
            onChange={(e) =>
              handleChange(
                'maKhoaHoc',
                e.target.value === 'TatCa' ? 'TatCa' : Number(e.target.value)
              )
            }
            className="premium-select"
          >
            <option value="TatCa">Tất cả khóa</option>
            {khoaHocs.map((kh) => (
              <option key={kh.id} value={kh.id}>
                {kh.tenKhoaHoc}
              </option>
            ))}
          </select>
        </div>

        {/* Loại */}
        <div className="filter-item">
          <label>Loại</label>
          <select
            value={filters.loai || 'TatCa'}
            onChange={(e) => handleChange('loai', e.target.value)}
            className="premium-select"
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
            className="premium-select"
          >
            <option value="TatCa">Tất cả</option>
            <option value="ChoDuyet">Chờ duyệt</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="TuChoi">Từ chối</option>
          </select>
        </div>

        {/* Số sao */}
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
            className="premium-select"
          >
            <option value="TatCa">Tất cả</option>
            <option value="5">5 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="1">1 ⭐</option>
          </select>
        </div>
      </div>
    </div>
  );
}
