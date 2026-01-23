import { useEffect, useState } from "react";
import TongQuan from "./tong-quan";
import KhoaHocCuaToi from "./khoa-hoc-cua-toi";
import CaiDat from "./cai-dat";
import {
  getHoSoHocVien,
  type HoSoHocVienDTO,
} from "../../../services/ho-so-hoc-vien.service";

import "./ho-so-hoc-vien.css";

type TabType = "tong-quan" | "khoa-hoc" | "cai-dat";


const HoSoHocVien = () => {
  const [activeTab, setActiveTab] = useState<TabType>("tong-quan");
  const [data, setData] = useState<HoSoHocVienDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHoSoHocVien()
      .then((res) => {
        console.log("Hồ sơ học viên:", res);
        setData(res);
      })
      .catch((err) => {
        console.error("Lỗi lấy hồ sơ học viên:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Đang tải hồ sơ...</div>;
  if (!data) return <div className="loading">Không có dữ liệu</div>;

  const renderContent = () => {
    switch (activeTab) {
      case "tong-quan":
        return <TongQuan data={data} />;
      case "khoa-hoc":
        return <KhoaHocCuaToi />;
      case "cai-dat":
        return <CaiDat />;
      default:
        return <TongQuan data={data} />;
    }
  };

  return (
    <div className="hoc-vien-page">
      {/* TABS */}
      <div className="tabs-navigation">
        <button
          className={`tab-btn ${activeTab === "tong-quan" ? "active" : ""}`}
          onClick={() => setActiveTab("tong-quan")}
        >
          <span className="tab-icon">👤</span>
          Tổng Quan
        </button>

        <button
          className={`tab-btn ${activeTab === "khoa-hoc" ? "active" : ""}`}
          onClick={() => setActiveTab("khoa-hoc")}
        >
          <span className="tab-icon">📚</span>
          Khóa Học
        </button>

        <button
          className={`tab-btn ${activeTab === "cai-dat" ? "active" : ""}`}
          onClick={() => setActiveTab("cai-dat")}
        >
          <span className="tab-icon">⚙️</span>
          Cài Đặt
        </button>
      </div>

      {/* CONTENT */}
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default HoSoHocVien;
