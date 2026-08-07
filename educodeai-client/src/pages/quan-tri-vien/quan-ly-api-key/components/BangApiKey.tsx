import { useState } from "react";
import type { KeyApiSummary } from "../QuanLyApiKey.types";

interface Props {
    danhSach: KeyApiSummary[];
    revealedKeys: Record<number, string>;
    onSua: (key: KeyApiSummary) => void;
    onKhoa: (key: KeyApiSummary) => void;
    onCapMoi: (key: KeyApiSummary) => void;
    onResetUsage: (key: KeyApiSummary) => void;
    onXoa: (key: KeyApiSummary) => void;
    onReveal: (key: KeyApiSummary) => void;
    isRevealing: number | null;
    isSyncing: number | null;
    isResetting: number | null;
    isDeleting: number | null;
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

const BangApiKey = ({ danhSach, revealedKeys, onSua, onKhoa, onCapMoi, onResetUsage, onXoa, onReveal, isRevealing, isSyncing, isResetting, isDeleting }: Props) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const copy = (key: KeyApiSummary, displayKey: string) => {
        navigator.clipboard.writeText(displayKey).then(() => {
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
                        <th>Tên Key & Model</th>
                        <th>Mã Key</th>
                        <th>Loại</th>
                        <th>Trạng Thái</th>
                        <th style={{ minWidth: 200 }}>Usage Hôm Nay (RPD)</th>
                        <th className="text-end">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {danhSach.map((key: any) => {
                        const daReq = key.daSuDungRequestHomNay ?? 0;
                        const hmReq = key.rpdLimit ?? 0;
                        const maKeyMasked = key.maKeyMasked || "sk-...***";
                        const model = key.modelSuDung || "Chưa chọn model";

                        const rPct = pct(daReq, hmReq);
                        const rPctShow = rPct === 0 && daReq > 0 ? "<1%" : `${rPct}%`;
                        const rWidth = rPct === 0 && daReq > 0 ? 2 : rPct;

                        // Xử lý che mã Key
                        const isRevealed = !!revealedKeys[key.id];
                        const displayKey = isRevealed ? revealedKeys[key.id] : maKeyMasked;

                        return (
                            <tr key={key.id}>
                                {/* Tên Key */}
                                <td>
                                    <div className="akm-key-name">{key.tenKey}</div>
                                    <div className="akm-key-id text-primary" style={{ fontSize: "11px" }}>{model}</div>
                                </td>

                                {/* Mã Key — icons chỉ hiện khi hover (CSS) */}
                                <td>
                                    <div className="akm-key-cell">
                                        <span className="akm-key-mask">{displayKey}</span>
                                        <span className="akm-key-btns">
                                            <button
                                                className="akm-icon-btn"
                                                title={isRevealed ? "Ẩn mã" : "Xem mã đầy đủ"}
                                                onClick={() => onReveal(key)}
                                                disabled={isRevealing === key.id}
                                            >
                                                {isRevealing === key.id ? (
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                ) : (
                                                    <i className={`bi ${isRevealed ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                )}
                                            </button>
                                            <button
                                                className="akm-icon-btn"
                                                title={isRevealed ? "Sao chép mã gốc" : "Sao chép mã bị che"}
                                                onClick={() => copy(key, displayKey)}
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

                                {/* Hạn Mức — RPD progress bar */}
                                <td className="akm-limit">
                                    <div className="akm-limit-row">
                                        <span>RPD</span>
                                        <div className="akm-limit-bar-wrap" title={`${daReq.toLocaleString()} / ${hmReq.toLocaleString()}`}>
                                            <div
                                                className={`akm-limit-bar ${mauBar(daReq, hmReq)}`}
                                                style={{ width: `${rWidth}%` }}
                                            ></div>
                                        </div>
                                        <span className="akm-limit-pct">{rPctShow}</span>
                                    </div>
                                    <div className="mt-1" style={{ fontSize: "11px", color: "var(--text-light)" }}>
                                        <i className="bi bi-info-circle me-1"></i> {key.rpmLimit} RPM · {key.tpmLimit >= 1000000 ? (key.tpmLimit/1000000) + "M" : key.tpmLimit} TPM
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
                                                <button className="dropdown-item" onClick={() => onCapMoi(key)} disabled={isSyncing === key.id}>
                                                    {isSyncing === key.id ? (
                                                        <span className="spinner-border spinner-border-sm text-info me-2"></span>
                                                    ) : (
                                                        <i className="bi bi-cloud-arrow-up text-info me-2"></i>
                                                    )}
                                                    Đồng bộ Redis
                                                </button>
                                            </li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={() => onResetUsage(key)} disabled={isResetting === key.id}>
                                                    {isResetting === key.id ? (
                                                        <span className="spinner-border spinner-border-sm text-danger me-2"></span>
                                                    ) : (
                                                        <i className="bi bi-arrow-counterclockwise text-danger me-2"></i>
                                                    )}
                                                    Reset Usage
                                                </button>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={() => onXoa(key)} disabled={isDeleting === key.id}>
                                                    {isDeleting === key.id ? (
                                                        <span className="spinner-border spinner-border-sm text-danger me-2"></span>
                                                    ) : (
                                                        <i className="bi bi-trash3 me-2"></i>
                                                    )}
                                                    Xoá Key
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