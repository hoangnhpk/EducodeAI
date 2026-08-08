import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import type { TrangThaiHocVien } from "./Types";

interface Props {
  trangThaiData: TrangThaiHocVien[];
}

const ChartsSection = ({ trangThaiData }: Props) => {
  // ================== MAP COLORS ==================
  const statusColorMap: Record<string, string> = {
    "Hoàn thành": "var(--success)",
    "Đang học": "var(--info)",
    "Chưa bắt đầu": "var(--warning)",
    "Nguy cơ bỏ học": "var(--danger)",
  };

  // ================== TRANSFORM DATA FOR CHART ==================
  const statusData = trangThaiData.map((item) => ({
    name: item.trangThai,
    value: item.soLuong,
    color: statusColorMap[item.trangThai] || "var(--text-muted)",
  }));

  // ================== MOCK PROGRESS DATA (nếu backend chưa có API) ==================
  // TODO: Replace with real API when available
  const progressData = [
    { week: "Tuần 1", value: 15 },
    { week: "Tuần 2", value: 28 },
    { week: "Tuần 3", value: 42 },
    { week: "Tuần 4", value: 55 },
    { week: "Tuần 5", value: 65 },
    { week: "Tuần 6", value: 72 },
    { week: "Tuần 7", value: 78 },
    { week: "Tuần 8", value: 82 },
  ];

  return (
    <div className="charts-grid">
      {/* BAR CHART */}
      <div className="chart-card">
        <h5 className="chart-title blue">Trạng thái học viên</h5>

        {statusData.length === 0 ? (
          <div style={{
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* LINE CHART */}
      <div className="chart-card">
        <h5 className="chart-title green">Tiến độ học tập theo thời gian</h5>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px'
              }}
              formatter={(value?: number) => [`${value}%`, 'Tiến độ']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--success)"
              strokeWidth={3}
              dot={{ fill: "var(--success)", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartsSection;