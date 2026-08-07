import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  DoanhThuTheoThoiGianDTO,
  DoanhThuTongQuanDTO,
  NhomDoanhThuTheoThoiGian,
} from '@/services/thong-ke-admin.service';

interface Props {
  tongQuan: DoanhThuTongQuanDTO | null;
  theoThoiGian: DoanhThuTheoThoiGianDTO[];
  nhomTheo: NhomDoanhThuTheoThoiGian;
  loading: boolean;
  onNhomTheoChange: (value: NhomDoanhThuTheoThoiGian) => void;
}

const formatCurrency = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

const NHOM_LABELS: Record<NhomDoanhThuTheoThoiGian, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
  year: 'Năm',
};

// Màu series biểu đồ recharts (SVG attribute — var() không resolve ở đây) — gom về một chỗ.
const CHART_COLORS = {
  tongDoanhThu: '#f69050',
  phiNenTang: '#f59e0b',
  thucNhanGV: '#16a34a',
  dotFill: '#ffffff',
  grid: '#f3f4f6',
};

export default function DoanhThuSection({
  tongQuan,
  theoThoiGian,
  nhomTheo,
  loading,
  onNhomTheoChange,
}: Props) {
  const chartData = theoThoiGian.map((x) => ({
    label: x.nhan,
    tongDoanhThu: x.tongDoanhThu,
    phiNenTang: x.phiNenTang,
    thucNhanGV: x.thucNhanGV,
  }));

  return (
    <div className="adm-revenue card border-0 shadow-sm">
      <div className="adm-revenue__header">
        <h2 className="adm-revenue__title">
          <i className="bi bi-cash-stack" style={{ marginRight: '8px', color: 'var(--success)' }} />
          Thống kê doanh thu
        </h2>
      </div>

      <div className="adm-revenue__kpi-grid">
        <div className="adm-revenue-kpi">
          <div className="adm-revenue-kpi__label">Tổng doanh thu</div>
          <div className="adm-revenue-kpi__value">{formatCurrency(tongQuan?.tongDoanhThu)}</div>
          <div className="adm-revenue-kpi__hint">Doanh số từ tất cả đơn đã thanh toán</div>
        </div>
        <div className="adm-revenue-kpi">
          <div className="adm-revenue-kpi__label">Phí nền tảng</div>
          <div className="adm-revenue-kpi__value adm-revenue-kpi__value--amber">
            {formatCurrency(tongQuan?.tongPhiNenTang)}
          </div>
          <div className="adm-revenue-kpi__hint">Tổng phí khấu trừ hệ thống</div>
        </div>
        <div className="adm-revenue-kpi">
          <div className="adm-revenue-kpi__label">GV thực nhận</div>
          <div className="adm-revenue-kpi__value adm-revenue-kpi__value--green">
            {formatCurrency(tongQuan?.tongThucNhanGV)}
          </div>
          <div className="adm-revenue-kpi__hint">Tiền chuyển về giảng viên</div>
        </div>
        <div className="adm-revenue-kpi">
          <div className="adm-revenue-kpi__label">Doanh thu tháng này</div>
          <div className="adm-revenue-kpi__value">{formatCurrency(tongQuan?.doanhThuThangNay)}</div>
          <div className="adm-revenue-kpi__hint">{tongQuan?.tongDonHang ?? 0} đơn hàng đã ghi nhận</div>
        </div>
      </div>

      <div className="adm-revenue__chart-header">
        <h3 className="adm-revenue__chart-title">Doanh thu theo thời gian</h3>
        <div className="adm-tabs" role="tablist" aria-label="Nhóm doanh thu theo thời gian">
          {(['day', 'week', 'month', 'year'] as NhomDoanhThuTheoThoiGian[]).map((item) => (
            <button
              key={item}
              type="button"
              className={`adm-tab ${nhomTheo === item ? 'adm-tab--active' : ''}`}
              role="tab"
              aria-selected={nhomTheo === item}
              onClick={() => onNhomTheoChange(item)}
            >
              {NHOM_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-revenue__chart-body">
        {loading ? (
          <div className="adm-chart__empty">Đang tải biểu đồ doanh thu...</div>
        ) : chartData.length === 0 ? (
          <div className="adm-chart__empty">Chưa có dữ liệu doanh thu</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 12, right: 20, left: 8, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={nhomTheo === 'day' ? -35 : -15} textAnchor="end" height={50} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) =>
                  Number(v).toLocaleString('vi-VN', { notation: 'compact', maximumFractionDigits: 1 })
                }
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  boxShadow: 'var(--shadow-lg)',
                }}
                formatter={(value: unknown, name?: string) => {
                  const labels: Record<string, string> = {
                    tongDoanhThu: 'Tổng doanh thu',
                    phiNenTang: 'Phí nền tảng',
                    thucNhanGV: 'GV thực nhận',
                  };
                  return [formatCurrency(Number(value)), labels[name ?? ''] ?? name ?? ''];
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    tongDoanhThu: 'Tổng doanh thu',
                    phiNenTang: 'Phí nền tảng',
                    thucNhanGV: 'GV thực nhận',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Line
                type="monotone"
                dataKey="tongDoanhThu"
                name="tongDoanhThu"
                stroke={CHART_COLORS.tongDoanhThu}
                strokeWidth={3}
                dot={{ r: 3.5, strokeWidth: 2, stroke: CHART_COLORS.tongDoanhThu, fill: CHART_COLORS.dotFill }}
                activeDot={{ r: 5.5 }}
              />
              <Line
                type="monotone"
                dataKey="phiNenTang"
                name="phiNenTang"
                stroke={CHART_COLORS.phiNenTang}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, stroke: CHART_COLORS.phiNenTang, fill: CHART_COLORS.dotFill }}
              />
              <Line
                type="monotone"
                dataKey="thucNhanGV"
                name="thucNhanGV"
                stroke={CHART_COLORS.thucNhanGV}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, stroke: CHART_COLORS.thucNhanGV, fill: CHART_COLORS.dotFill }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
