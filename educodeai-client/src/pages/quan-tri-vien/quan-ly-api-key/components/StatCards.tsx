import type { ThongKeHeThong } from "../QuanLyApiKey.types";

interface Props {
  thongKe: ThongKeHeThong;
}

const StatCards = ({ thongKe }: Props) => {
  return (
    <div className="row g-4 mb-4">

      {/* ---- Card 1: Tổng Request Hôm Nay ---- */}
      <div className="col-12 col-md-4">
        <div className="card shadow-sm border-0 h-100 akm-stat-card akm-stat-card--requests">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <div className="akm-stat-icon akm-stat-icon--requests">
              <i className="bi bi-bar-chart-line-fill"></i>
            </div>
            <div className="flex-grow-1">
              <p className="akm-stat-label mb-1">Tổng Request Hôm Nay</p>
              <p className="akm-stat-value mb-0">
                {thongKe.tongRequestHomNay.toLocaleString("vi-VN")}
              </p>
              {/* <div className="d-flex align-items-center gap-2 mt-2">
                <span className="akm-stat-trend">
                  <i className="bi bi-arrow-up-short"></i>
                  +{thongKe.phanTramTang}%
                </span>
                <span className="akm-stat-sub mb-0">so với hôm qua</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Card 2: Tổng Token Đã Dùng ---- */}
      <div className="col-12 col-md-4">
        <div className="card shadow-sm border-0 h-100 akm-stat-card akm-stat-card--tokens">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <div className="akm-stat-icon akm-stat-icon--tokens">
              <i className="bi bi-cpu-fill"></i>
            </div>
            <div className="flex-grow-1">
              <p className="akm-stat-label mb-1">Tổng Token Đã Dùng</p>
              <p className="akm-stat-value mb-0">
                {(thongKe.tongTokenDaDung / 1_000).toFixed(1)}
                <span className="akm-stat-value-unit">K</span>
              </p>
              {/* <p className="akm-stat-sub mb-0 mt-2">
                {thongKe.tongTokenDaDung.toLocaleString("vi-VN")} tokens trong ngày
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Card 3: Trạng Thái Hệ Thống ---- */}
      <div className="col-12 col-md-4">
        <div className="card shadow-sm border-0 h-100 akm-stat-card akm-stat-card--status">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <div className="akm-stat-icon akm-stat-icon--status">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <div className="flex-grow-1">
              <p className="akm-stat-label mb-1">Trạng Thái Hệ Thống</p>
              <div className="d-flex align-items-center gap-2">
                <span className="akm-status-dot"></span>
                <p className="akm-stat-value fs-4 mb-0">{thongKe.trangThaiHeThong}</p>
              </div>
              <p className="akm-stat-sub mb-0 mt-2">
                <i className="bi bi-clock me-1"></i>
                Cập nhật lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatCards;
