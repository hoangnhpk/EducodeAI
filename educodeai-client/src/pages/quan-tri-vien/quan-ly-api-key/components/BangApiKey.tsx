import { useState } from "react";
import type { KeyApiSummary } from "../QuanLyApiKey.types";

interface Props {
    danhSach: KeyApiSummary[];
    onSua: (key: KeyApiSummary) => void;
    onKhoa: (key: KeyApiSummary) => void;
    onCapMoi: (key: KeyApiSummary) => void;
    onXoa: (key: KeyApiSummary) => void;
}

/** Tính % usage và trả về class màu progress bar */
const pct = (da: number, max: number) =>
    max > 0 ? Math.min(Math.round((da / max) * 100), 100) : 0;

const mauBar = (da: number, max: number) => {
    const p = pct(da, max);
    if (p >= 85) return "akm-limit-bar--hi";
    if (p >= 55) return "akm-limit-bar--mid";
    return "akm-limit-bar--ok";
};

const BangApiKey = ({ danhSach, onSua, onKhoa, onCapMoi, onXoa }: Props) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const copy = (key: KeyApiSummary) => {
        const textToCopy = key.maKeyFull || `sk-...${key.id || 0}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(key.id);
            setTimeout(() => setCopiedId(null), 1500);
        });
    };

    if (danhSach.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                <p>Chưa có API Key nào được cấu hình.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive akm-table-visible-overflow">
            <table className="table table-borderless table-hover mb-0 akm-tbl">
                <thead>
                    <tr>
                        <th>Tên Key</th>
                        <th>Mã Key</th>
                        <th>Loại</th>
                        <th>Trạng Thái</th>
                        <th style={{ minWidth: 200 }}>Hạn Mức</th>
                        <th className="text-end">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {danhSach.map((key: any) => {
                        const daReq = key.daSuDungRequest ?? key.DaSuDungRequest ?? 0;
                        const hmReq = key.hanMucRequest ?? key.HanMucRequest ?? 0;
                        const daTok = key.daSuDungToken ?? key.DaSuDungToken ?? 0;
                        const hmTok = key.hanMucToken ?? key.HanMucToken ?? 0;
                        const maKey = key.maKeyFull || key.MaKeyFull || `sk-....${key.id || key.ID || key.Id || 0}`;

                        const rPct = pct(daReq, hmReq);
                        const tPct = pct(daTok, hmTok);

                        const rPctShow = rPct === 0 && daReq > 0 ? "<1%" : `${rPct}%`;
                        const tPctShow = tPct === 0 && daTok > 0 ? "<1%" : `${tPct}%`;

                        // Hack cho thanh progress nhú lên 1 tí xíu vạch màu dù % nhỏ bé hơn 1%
                        const rWidth = rPct === 0 && daReq > 0 ? 2 : rPct;
                        const tWidth = tPct === 0 && daTok > 0 ? 2 : tPct;

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
                                        <span className="akm-key-mask">{maKey}</span>
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
                                    <span className={key.loaiKey === "Chính" ? "akm-badge-chinh" : "akm-badge-phu"}>
                                        {key.loaiKey}
                                    </span>
                                </td>

                                {/* Trạng thái */}
                                <td>
                                    <span className={key.trangThai ? "akm-badge-on" : "akm-badge-off"}>
                                        {key.trangThai ? "Hoạt động" : "Đã khóa"}
                                    </span>
                                </td>

                                {/* Hạn Mức — 2 thanh bar gộp 1 ô */}
                                <td className="akm-limit">
                                    {/* Request */}
                                    <div className="akm-limit-row">
                                        <span>Req</span>
                                        <div className="akm-limit-bar-wrap" title={`${daReq.toLocaleString()} / ${hmReq.toLocaleString()}`}>
                                            <div
                                                className={`akm-limit-bar ${mauBar(daReq, hmReq)}`}
                                                style={{ width: `${rWidth}%` }}
                                            ></div>
                                        </div>
                                        <span className="akm-limit-pct">{rPctShow}</span>
                                    </div>
                                    {/* Token */}
                                    <div className="akm-limit-row">
                                        <span>Tok</span>
                                        <div className="akm-limit-bar-wrap" title={`${daTok.toLocaleString()} / ${hmTok.toLocaleString()}`}>
                                            <div
                                                className={`akm-limit-bar ${mauBar(daTok, hmTok)}`}
                                                style={{ width: `${tWidth}%` }}
                                            ></div>
                                        </div>
                                        <span className="akm-limit-pct">{tPctShow}</span>
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
                                                    <i className={`bi ${key.trangThai ? "bi-lock text-warning" : "bi-unlock text-success"} me-2`}></i>
                                                    {key.trangThai ? "Khóa key" : "Mở khóa"}
                                                </button>
                                            </li>
                                            <li>
                                                <button className="dropdown-item" onClick={() => onCapMoi(key)}>
                                                    <i className="bi bi-cloud-arrow-up text-info me-2"></i>Đồng bộ Redis
                                                </button>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={() => onXoa(key)}>
                                                    <i className="bi bi-trash3 me-2"></i>Xoá Key
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
        </div>
    );
};

export default BangApiKey;
