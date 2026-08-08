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
    "Hoàn thành": "#10b981",
    "Đang học": "#3b82f6",
    "Chưa bắt đầu": "#f59e0b",
    "Nguy cơ bỏ học": "#ef4444",
  };

  // ================== TRANSFORM DATA FOR CHART ==================
  const statusData = trangThaiData.map((item) => ({
    name: item.trangThai,
    value: item.soLuong,
    color: statusColorMap[item.trangThai] || "#6b7280",
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
            color: '#6b7280' 
          }}>
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              formatter={(value?: number) => [`${value}%`, 'Tiến độ']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartsSection;