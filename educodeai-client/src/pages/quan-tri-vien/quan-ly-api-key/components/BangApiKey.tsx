import { useState } from "react";
import type { ApiKey } from "../QuanLyApiKey.types";

interface Props {
  danhSach: ApiKey[];
  onSua: (key: ApiKey) => void;
  onKhoa: (key: ApiKey) => void;
  onCapMoi: (key: ApiKey) => void;
}

/** Hiển thị dạng: sk-...XXXX (4 ký tự cuối) */
const rúTgon = (full: string): string =>
  `sk-...${full.slice(-4)}`;

/** Tính % usage và trả về class màu progress bar */
const pct = (da: number, max: number) =>
  max > 0 ? Math.min(Math.round((da / max) * 100), 100) : 0;

const mauBar = (da: number, max: number) => {
  const p = pct(da, max);
  if (p >= 85) return "akm-limit-bar--hi";
  if (p >= 55) return "akm-limit-bar--mid";
  return "akm-limit-bar--ok";
};

const BangApiKey = ({ danhSach, onSua, onKhoa, onCapMoi }: Props) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (key: ApiKey) => {
    navigator.clipboard.writeText(key.maKeyFull).then(() => {
      setCopiedId(key.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <table className="table table-borderless table-hover mb-0 akm-tbl">
      <thead>
        <tr>
          <th>Tên Key</th>
          <th>Mã Key</th>
          <th>Loại</th>
          <th>Trạng Thái</th>
          <th>Hạn Mức</th>
          <th className="text-end">Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        {danhSach.map((key) => {
          const daKhoa = key.trangThai === "Đã khóa";
          const rPct   = pct(key.daSuDungRequest, key.hanMucRequest);
          const tPct   = pct(key.daSuDungToken,   key.hanMucToken);

          return (
            <tr key={key.id}>
              {/* Tên Key */}
              <td>
                <div className="akm-key-name">{key.tenKey}</div>
                <div className="akm-key-id">#{key.id}</div>
              </td>

              {/* Mã Key — icons chỉ hiện khi hover (CSS) */}
              <td>
                <div className="akm-key-cell">
                  <span className="akm-key-mask">{rúTgon(key.maKeyFull)}</span>
                  <span className="akm-key-btns">
                    <button
                      className="akm-icon-btn"
                      title="Xem mã đầy đủ"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="akm-icon-btn"
                      title="Sao chép"
                      onClick={() => copy(key)}
                    >
                      <i className={`bi ${copiedId === key.id ? "bi-check-lg text-success" : "bi-clipboard"}`}></i>
                    </button>
                    {copiedId === key.id && (
                      <span className="akm-copy-ok">Đã chép</span>
                    )}
                  </span>
                </div>
              </td>

              {/* Loại */}
              <td>
                <span className={key.loai === "Chính" ? "akm-badge-chinh" : "akm-badge-phu"}>
                  {key.loai}
                </span>
              </td>

              {/* Trạng thái */}
              <td>
                <span className={daKhoa ? "akm-badge-off" : "akm-badge-on"}>
                  {key.trangThai}
                </span>
              </td>

              {/* Hạn Mức — 2 thanh bar gộp 1 ô */}
              <td className="akm-limit">
                {/* Request */}
                <div className="akm-limit-row">
                  <span>Req</span>
                  <div className="akm-limit-bar-wrap">
                    <div
                      className={`akm-limit-bar ${mauBar(key.daSuDungRequest, key.hanMucRequest)}`}
                      style={{ width: `${rPct}%` }}
                    ></div>
                  </div>
                  <span className="akm-limit-pct">{rPct}%</span>
                </div>
                {/* Token */}
                <div className="akm-limit-row">
                  <span>Tok</span>
                  <div className="akm-limit-bar-wrap">
                    <div
                      className={`akm-limit-bar ${mauBar(key.daSuDungToken, key.hanMucToken)}`}
                      style={{ width: `${tPct}%` }}
                    ></div>
                  </div>
                  <span className="akm-limit-pct">{tPct}%</span>
                </div>
              </td>

              {/* Dropdown Thao Tác */}
              <td className="text-end">
                <div className="dropdown">
                  <button
                    className="akm-action-toggle dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Thao tác
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <li>
                      <button className="dropdown-item" onClick={() => onSua(key)}>
                        <i className="bi bi-pencil me-2 text-primary"></i>Chỉnh sửa
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => onKhoa(key)}>
                        <i className={`bi ${daKhoa ? "bi-unlock" : "bi-lock"} me-2 text-warning`}></i>
                        {daKhoa ? "Mở khóa" : "Khóa key"}
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={() => onCapMoi(key)}>
                        <i className="bi bi-arrow-repeat me-2"></i>Cấp mới (Rotate)
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default BangApiKey;
