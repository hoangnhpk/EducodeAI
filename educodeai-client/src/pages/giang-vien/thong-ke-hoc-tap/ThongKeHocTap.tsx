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

      // Fetch táº¥t cáº£ data song song
      const [overviewData, trangThaiRes] = await Promise.all([
        thongKeHocTapService.getOverview(),
        thongKeHocTapService.getTrangThaiHocVien(),
      ]);

      setOverview(overviewData);
      setTrangThaiData(trangThaiRes);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u");
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
    setCurrentPage(1); // Reset vá» trang 1 khi search
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
          <p>Äang táº£i dá»¯ liá»‡u...</p>
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
          background: '#fee2e2', 
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          <h3>Lá»—i táº£i dá»¯ liá»‡u</h3>
          <p>{error}</p>
          <button 
            onClick={fetchAllData}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thá»­ láº¡i
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="thong-ke-container">
      {/* Header */}
      <div className="page-header">
        <h2>Thá»‘ng kÃª há»c táº­p</h2>
        <p>Theo dÃµi tiáº¿n Ä‘á»™ vÃ  hiá»‡u quáº£ há»c táº­p cá»§a há»c viÃªn</p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <StatCard
          title="GIá»œ Há»ŒC TB / Há»ŒC VIÃŠN"
          value={`${Number(overview?.gioHocTrungBinh ?? 0).toFixed(1)}h`}
          value={`${overview?.gioHocTrungBinh?.toFixed(1) || 0}h`}
          subtitle="Trung bÃ¬nh má»—i há»c viÃªn"
          icon={Clock}
          gradient="icon-purple"
        />

        <StatCard
          title="KHÃ“A Há»ŒC ÄANG Dáº Y"
          value={String(overview?.soKhoaHocDangDay || 0)}
          subtitle="KhÃ³a há»c Ä‘ang hoáº¡t Ä‘á»™ng"
          icon={BookOpen}
          gradient="icon-blue"
        />

        <StatCard
          title="Tá»”NG BÃ€I Táº¬P"
          value={String(overview?.tongBaiTap || 0)}
          subtitle="Tá»•ng sá»‘ bÃ i táº­p Ä‘Ã£ giao"
          icon={ClipboardCheck}
          gradient="icon-yellow"
        />

        <StatCard
          title="Tá»¶ Lá»† HOÃ€N THÃ€NH"
          value={`${Number(overview?.tyLeHoanThanhTB ?? 0).toFixed(1)}%`}
          value={`${overview?.tyLeHoanThanhTB?.toFixed(1) || 0}%`}
          subtitle={
            Number(overview?.tyLeHoanThanhTB ?? 0) >= 70
              ? "âœ“ Tá»‘t"
              : Number(overview?.tyLeHoanThanhTB ?? 0) >= 50
              ? "âš  Trung bÃ¬nh"
              : "âœ— Cáº§n cáº£i thiá»‡n"
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
          <h3>Báº£ng chi tiáº¿t há»c viÃªn ({totalStudents})</h3>

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="TÃ¬m kiáº¿m há»c viÃªn..."
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

