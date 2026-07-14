import { useState, useEffect } from "react";
import type { HocVien, ThongKeOverview, TrangThaiHocVien } from "./components/Types";
import { thongKeHocTapService } from "../../../services/thong-ke-hoc-tap.service";
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
  // ================== STATES ==================
  const [overview, setOverview] = useState<ThongKeOverview | null>(null);
  const [trangThaiData, setTrangThaiData] = useState<TrangThaiHocVien[]>([]);
  const [students, setStudents] = useState<HocVien[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10;

  // ================== FETCH DATA ==================
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tất cả data song song
      const [overviewData, trangThaiRes] = await Promise.all([
        thongKeHocTapService.getOverview(),
        thongKeHocTapService.getTrangThaiHocVien(),
      ]);

      setOverview(overviewData);
      setTrangThaiData(trangThaiRes);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await thongKeHocTapService.getHocVien({
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
      });

      setStudents(result.data);
      setTotalStudents(result.total);
    } catch (err: any) {
      console.error("Error fetching students:", err);
    }
  };

  // ================== HANDLERS ==================
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  // ================== LOADING STATE ==================
  if (loading) {
    return (
      <div className="thong-ke-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // ================== ERROR STATE ==================
  if (error) {
    return (
      <div className="thong-ke-container">
        <div style={{
          padding: '20px',
          background: 'var(--danger-soft)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--danger-strong)'
        }}>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button
            onClick={fetchAllData}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="thong-ke-container">
      {/* Header */}
      <div className="thong-ke-page-header">
        <h2>Thống kê học tập</h2>
        <p>Theo dõi tiến độ và hiệu quả học tập của học viên</p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <StatCard
          title="GIỜ HỌC TB / HỌC VIÊN"
          value={`${Number(overview?.gioHocTrungBinh ?? 0).toFixed(1)}h`}
          subtitle="Trung bình mỗi học viên"
          icon={Clock}
          gradient="icon-purple"
        />

        <StatCard
          title="KHÓA HỌC ĐANG DẠY"
          value={String(overview?.soKhoaHocDangDay || 0)}
          subtitle="Khóa học đang hoạt động"
          icon={BookOpen}
          gradient="icon-blue"
        />

        <StatCard
          title="TỔNG BÀI TẬP"
          value={String(overview?.tongBaiTap || 0)}
          subtitle="Tổng số bài tập đã giao"
          icon={ClipboardCheck}
          gradient="icon-yellow"
        />

        <StatCard
          title="TỶ LỆ HOÀN THÀNH"
          value={`${Number(overview?.tyLeHoanThanhTB ?? 0).toFixed(1)}%`}
          subtitle={
            Number(overview?.tyLeHoanThanhTB ?? 0) >= 70
              ? "✔ Tốt"
              : Number(overview?.tyLeHoanThanhTB ?? 0) >= 50
              ? "⚠ Trung bình"
              : "✘ Cần cải thiện"
          }
          icon={CheckCircle}
          gradient="icon-green"
        />
      </div>

      {/* Charts */}
      <ChartsSection trangThaiData={trangThaiData} />

      {/* STUDENT TABLE */}
      <div className="student-section">
        <div className="student-header">
          <h3>Bảng chi tiết học viên ({totalStudents})</h3>

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <StudentTable 
          students={students} 
          currentPage={currentPage}
          totalPages={Math.ceil(totalStudents / pageSize)}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* TOP & AT RISK */}
      <div className="bottom-grid">
        <TopStudents students={students} />
        <AtRiskStudents students={students} />
      </div>
    </div>
  );
}
