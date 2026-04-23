import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { encodeId } from "@/utils/id-helper";
import {
  KhoaHocDaMuaHocVienService,
  type KhoaHocDaMuaHocVienDTO
} from "@/services/khoa-hoc-da-mua-hoc-vien.service";
import "../ho-so-hoc-vien/ho-so-hoc-vien.css";

const anhMacDinh =
  "https://careplusvn.com/Uploads/t/de/default-image_730.jpg";

const gioiHanTienDo = (x: number): number => {
  if (Number.isNaN(x)) return 0;
  return Math.min(100, Math.max(0, x));
};

const hienThiTrangThai = (t?: string | null): string => {
  const s = (t ?? "").trim();
  if (!s) return "Đang học";
  if (s.toLowerCase() === "hoanthanh" || s === "HoanThanh") return "Đã hoàn thành";
  if (s.toLowerCase() === "danghoc" || s === "DangHoc") return "Đang học";
  return s;
};

const KhoaHocCuaToiHocVien = () => {
  const navigate = useNavigate();
  const [danhSach, setDanhSach] = useState<KhoaHocDaMuaHocVienDTO[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(null);
    try {
      const data = await KhoaHocDaMuaHocVienService.layDanhSach();
      setDanhSach(data);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        setLoi("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setLoi("Không tải được danh sách khóa học. Vui lòng thử lại sau.");
      }
      setDanhSach([]);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const tiepTucHoc = (kh: KhoaHocDaMuaHocVienDTO) => {
    navigate(`/khoa-hoc/${kh.slug}/${encodeId(kh.maKhoaHoc)}`);
  };

  if (dangTai) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  if (loi) {
    return (
      <div className="error">
        <p>{loi}</p>
        <button type="button" onClick={() => void taiDuLieu()}>
          Thử lại
        </button>
      </div>
    );
  }

  if (danhSach.length === 0) {
    return (
      <div className="khoa-hoc-empty">
        <p>Bạn chưa có khóa học nào. Hãy khám phá và mua khóa học phù hợp.</p>
        <Link to="/" className="btn-primary" style={{ display: "inline-block" }}>
          Khám phá khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="khoa-hoc-container">
      <div className="khoa-hoc-header">
        <h2>Khóa học của tôi</h2>
        <p>Các khóa học bạn đã mua và tiến độ học tập</p>
      </div>

      <div className="khoa-hoc-grid">
        {danhSach.map((kh) => {
          const pct = gioiHanTienDo(kh.tienDo);
          const srcAnh = kh.hinhAnh
            ? `/img/${kh.hinhAnh}`
            : anhMacDinh;
          return (
            <div key={kh.maDangKy} className="khoa-hoc-card">
              <div
                style={{
                  width: "100%",
                  height: "140px",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  marginBottom: "1rem",
                  background: "#f1f5f9"
                }}
              >
                <img
                  src={srcAnh}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.currentTarget.src = anhMacDinh;
                  }}
                />
              </div>

              <div className="khoa-hoc-info">
                <h3>{kh.tenKhoaHoc}</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 8px" }}>
                  {kh.linhVuc} · {kh.thoiLuongGio} giờ ·{" "}
                  {hienThiTrangThai(kh.trangThai)}
                </p>

                <div className="khoa-hoc-progress">
                  <span>Tiến độ: {pct}%</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="khoa-hoc-btn"
                onClick={() => tiepTucHoc(kh)}
              >
                Tiếp tục học
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KhoaHocCuaToiHocVien;
