import { useState } from "react";
import type { Student } from "./components/Types";
import { sampleData } from "./components/Data";
import ChartsSection from "./components/ChartsSection";
import StatCard from "./components/StatCard";
import StudentTable from "./components/StudentTable";
import TopStudents from "./components/TopStudents";
import AtRiskStudents from "./components/AtRiskStudents";
import {
  Clock,
  BookOpen,
  ClipboardCheck,
  CheckCircle,
  Search,
} from "lucide-react";

import "./components/ThongKeHocTap.css";

export default function ThongKeHocTap() {
  const [students] = useState<Student[]>(sampleData.students);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="thong-ke-container">
      {/* Header */}
      <div className="page-header">
        <h2>Thống kê học tập</h2>
        <p>Theo dõi tiến độ và hiệu quả học tập của học viên</p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <StatCard
          title="GIỜ HỌC TB / HỌC VIÊN"
          value="32h"
          subtitle="+4h so với tháng trước"
          icon={Clock}
          gradient="icon-purple"
        />

        <StatCard
          title="KHÓA HỌC ĐANG DẠY"
          value="24"
          subtitle="8 lớp đang hoạt động"
          icon={BookOpen}
          gradient="icon-blue"
        />

        <StatCard
          title="TỔNG BÀI TẬP"
          value="156"
          subtitle="23 bài chưa nộp"
          icon={ClipboardCheck}
          gradient="icon-yellow"
        />

        <StatCard
          title="TỶ LỆ HOÀN THÀNH"
          value="78%"
          subtitle="✓ Tốt"
          icon={CheckCircle}
          gradient="icon-green"
        />
      </div>

      {/* Charts */}
      <ChartsSection />

      {/* STUDENT TABLE */}
      <div className="student-section">
        <div className="student-header">
          <h3>Bảng chi tiết học viên</h3>

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <StudentTable students={students} searchTerm={searchTerm} />
      </div>

      {/* TOP & AT RISK */}
      <div className="bottom-grid">
        <TopStudents students={students} />
        <AtRiskStudents students={students} />
      </div>
    </div>
  );
}
