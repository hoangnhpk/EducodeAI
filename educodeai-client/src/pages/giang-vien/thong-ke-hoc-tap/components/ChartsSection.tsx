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

const ChartsSection = () => {
  const statusData = [
    { name: "Hoàn thành", value: 450, color: "#10b981" },
    { name: "Đang học", value: 620, color: "#3b82f6" },
    { name: "Chưa bắt đầu", value: 120, color: "#f59e0b" },
    { name: "Nguy cơ bỏ học", value: 44, color: "#ef4444" },
  ];

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
        <h5 className="chart-title blue">
          Trạng thái học viên
        </h5>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {statusData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LINE CHART */}
      <div className="chart-card">
        <h5 className="chart-title green">
          Tiến độ học tập theo thời gian
        </h5>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
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
