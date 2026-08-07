import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  NhomThuNhapTheoThoiGian,
  ThuNhapTheoKhoaHoc,
  ThuNhapTheoThoiGian,
  ThuNhapTongQuan,
} from './Types';

interface Props {
  tongQuan: ThuNhapTongQuan | null;
  theoThoiGian: ThuNhapTheoThoiGian[];
  theoKhoaHoc: ThuNhapTheoKhoaHoc[];
  nhomTheo: NhomThuNhapTheoThoiGian;
  onNhomTheoChange: (value: NhomThuNhapTheoThoiGian) => void;
}

const formatCurrency = (value: number | null | undefined) => {
  const safeValue = Number(value ?? 0);
  return safeValue.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
};

const IncomeSection = ({ tongQuan, theoThoiGian, theoKhoaHoc, nhomTheo, onNhomTheoChange }: Props) => {
  const topKhoaHocData = theoKhoaHoc.map((item, index) => ({
    tenKhoaHoc: item.tenKhoaHoc.length > 24 ? `${item.tenKhoaHoc.slice(0, 24)}...` : item.tenKhoaHoc,
    thucNhan: item.thucNhan,
    fill: [
      'var(--primary)',
      'var(--info)',
      'var(--ai-accent)',
      'var(--success)',
      'var(--warning)',
      'var(--primary-hover)',
      'var(--info-strong)',
      'var(--success-strong)',
    ][index % 8],
  }));

  return (
    <section className="income-section">
      <div className="income-section-header">
        <div>
          <h3>Thống kê thu nhập</h3>
          <p>Theo dõi dòng tiền chi tiết theo thời gian và theo từng khóa học.</p>
        </div>
      </div>

      <div className="income-overview-grid">
        <div className="income-overview-card">
          <span className="income-label">Tổng doanh thu</span>
          <strong>{formatCurrency(tongQuan?.tongDoanhThu)}</strong>
          <small>Doanh số từ tất cả đơn hàng đã xử lý</small>
        </div>
        <div className="income-overview-card">
          <span className="income-label">Tổng phí nền tảng</span>
          <strong>{formatCurrency(tongQuan?.tongPhiNenTang)}</strong>
          <small>Tổng phí khấu trừ theo cấu hình hệ thống</small>
        </div>
        <div className="income-overview-card">
          <span className="income-label">Giảng viên thực nhận</span>
          <strong>{formatCurrency(tongQuan?.tongThucNhan)}</strong>
          <small>Tổng tiền thực tế chuyển về giảng viên</small>
        </div>
        <div className="income-overview-card">
          <span className="income-label">Thực nhận tháng này</span>
          <strong>{formatCurrency(tongQuan?.thucNhanThangNay)}</strong>
          <small>{tongQuan?.tongDonHang ?? 0} đơn hàng đã ghi nhận</small>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="income-chart-header">
            <h5 className="chart-title green">Thu nhập theo thời gian</h5>
            <div className="income-group-tabs">
              {(['day', 'week', 'month'] as NhomThuNhapTheoThoiGian[]).map((item) => (
                <button
                  key={item}
                  className={item === nhomTheo ? 'active' : ''}
                  onClick={() => onNhomTheoChange(item)}
                >
                  {item === 'day' ? 'Ngày' : item === 'week' ? 'Tuần' : 'Tháng'}
                </button>
              ))}
            </div>
          </div>

          {theoThoiGian.length === 0 ? (
            <div className="income-empty-state">Chưa có dữ liệu thu nhập theo mốc thời gian.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={theoThoiGian}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="nhanThoiGian" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value?: number, name?: string) => [
                    formatCurrency(Number(value ?? 0)),
                    name === 'thucNhan' ? 'Thực nhận' : 'Phí nền tảng',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="thucNhan"
                  name="thucNhan"
                  stroke="var(--success)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="phiNenTang"
                  name="phiNenTang"
                  stroke="var(--warning)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h5 className="chart-title blue">Thu nhập theo khóa học (Top)</h5>
          {topKhoaHocData.length === 0 ? (
            <div className="income-empty-state">Chưa có dữ liệu thu nhập theo khóa học.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topKhoaHocData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="tenKhoaHoc" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={72} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value?: number) => [formatCurrency(Number(value ?? 0)), 'Thực nhận']}
                />
                <Bar dataKey="thucNhan" radius={[8, 8, 0, 0]}>
                  {topKhoaHocData.map((entry, index) => (
                    <Cell key={`course-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="income-course-table-wrapper">
        <h5>Chi tiết thu nhập theo khóa học</h5>
        <table className="income-course-table">
          <thead>
            <tr>
              <th>Khóa học</th>
              <th>Đơn hàng</th>
              <th>Doanh thu</th>
              <th>Phí nền tảng</th>
              <th>Thực nhận</th>
            </tr>
          </thead>
          <tbody>
            {theoKhoaHoc.length === 0 ? (
              <tr>
                <td colSpan={5} className="income-empty-row">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              theoKhoaHoc.map((item) => (
                <tr key={item.maKhoaHoc}>
                  <td>{item.tenKhoaHoc}</td>
                  <td>{item.soDonHang}</td>
                  <td>{formatCurrency(item.tongDoanhThu)}</td>
                  <td>{formatCurrency(item.phiNenTang)}</td>
                  <td>{formatCurrency(item.thucNhan)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default IncomeSection;
