import { useEffect, useState } from "react";
import TongQuan from "./tong-quan";
import CaiDat from "./cai-dat";
import {
  getHoSoHocVien,
  type HoSoHocVienDTO,
} from "../../../services/ho-so-hoc-vien.service";

import "./ho-so-hoc-vien.css";

type TabType = "tong-quan" | "cai-dat";

const HoSoHocVien = () => {
  const [activeTab, setActiveTab] = useState<TabType>("tong-quan");
  const [data, setData] = useState<HoSoHocVienDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getHoSoHocVien()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Lỗi lấy hồ sơ học viên:", err);
        setError(err.message || "Có lỗi xảy ra");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Lỗi: {error}</p>
        <button onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="no-data">
        <p>Không có dữ liệu</p>
        <button onClick={() => window.location.reload()}>
          Tải lại
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "tong-quan":
        return <TongQuan data={data} />;
      case "cai-dat":
        return <CaiDat />;
      default:
        return <TongQuan data={data} />;
    }
  };

  return (
    <div className="hoc-vien-page">
      <div className="tabs-navigation">
        <button
          className={`tab-btn ${activeTab === "tong-quan" ? "active" : ""}`}
          onClick={() => setActiveTab("tong-quan")}
        >
          <span className="tab-icon">👤</span>
          Tổng Quan
        </button>

        <button
          className={`tab-btn ${activeTab === "cai-dat" ? "active" : ""}`}
          onClick={() => setActiveTab("cai-dat")}
        >
          <span className="tab-icon">⚙️</span>
          Cài Đặt
        </button>
      </div>

      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default HoSoHocVien;
