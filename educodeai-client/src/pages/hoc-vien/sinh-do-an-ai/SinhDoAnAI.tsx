import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/configs/axios';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface IYeuCauChucNang {
    ngay: number;
    tenChucNang: string;
    trangThai: string;
    ngayHoanThanh?: string | null;
    diem: number;
    nhanXet: string;
}

interface IProjectResult {
    maDoAn?: number;
    tenDoAn: string;
    moTa: string;
    yeuCauChucNang: IYeuCauChucNang[];
    cauTrucDatabase: string;
}

interface IHistoryItem {
    id: string;
    mucTieu: string;
    ngonNgu: string;
    capDo: string;
    result: IProjectResult;
    createdAt: string; // ISO string
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sda_history_v1';
const MAX_HISTORY = 10;

const CAREER_OPTIONS = [
    { value: 'Backend Developer (Node.js)', label: 'Backend Developer', sub: 'Node.js / Express', icon: '⚙️' },
    { value: 'Frontend Developer (ReactJS)', label: 'Frontend Developer', sub: 'ReactJS / TypeScript', icon: '🎨' },
    { value: 'Fullstack Developer', label: 'Fullstack Developer', sub: 'End-to-End System', icon: '🚀' },
    { value: 'Mobile Developer', label: 'Mobile Developer', sub: 'React Native / Flutter', icon: '📱' },
    { value: 'Data Scientist', label: 'Data Scientist', sub: 'ML / AI / Analytics', icon: '🧠' },
    { value: '.NET Backend Developer', label: '.NET Developer', sub: 'C# / ASP.NET Core', icon: '🔷' },
];

const LEVEL_OPTIONS = [
    { val: 'Cơ bản', label: 'Cơ Bản', desc: 'CRUD, 3–5 tính năng', icon: '🌱', recommended: false },
    { val: 'Thực tế', label: 'Thực Tế', desc: 'Hệ thống đầy đủ, phù hợp CV', icon: '🔥', recommended: true },
    { val: 'Nâng cao', label: 'Nâng Cao', desc: 'Microservices, scale lớn', icon: '⚡', recommended: false },
];

const LOADING_MESSAGES = [
    'AI đang phân tích yêu cầu nghề nghiệp...',
    'Thiết kế kiến trúc hệ thống...',
    'Xây dựng mô hình dữ liệu...',
    'Định nghĩa các tính năng chính...',
    'Hoàn thiện đặc tả kỹ thuật...',
    'Đang kiểm tra tính khả thi...',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const loadHistory = (): IHistoryItem[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveHistory = (items: IHistoryItem[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
    } catch { /* storage full – ignore */ }
};

const formatRelativeTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    return `${d} ngày trước`;
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
interface IToast { id: string; type: 'success' | 'error' | 'info'; msg: string; }

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const SinhDoAnAI: React.FC = () => {
    const navigate = useNavigate();
    const resultRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Form
    const [mucTieu, setMucTieu] = useState(CAREER_OPTIONS[0].value);
    const [ngonNgu, setNgonNgu] = useState('');
    const [capDo, setCapDo] = useState('Thực tế');

    // UI state
    const [status, setStatus] = useState<'empty' | 'loading' | 'result'>('empty');
    const [resultData, setResultData] = useState<IProjectResult | null>(null);
    const [activeTab, setActiveTab] = useState<'features' | 'database'>('features');
    const [revealedItems, setRevealedItems] = useState(0);
    const [loadingMsg, setLoadingMsg] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [toasts, setToasts] = useState<IToast[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [khoKhan, setKhoKhan] = useState('');
    const [completedFeatures, setCompletedFeatures] = useState<number[]>([]);

    // AI Status state
    const [isAIAvailable, setIsAIAvailable] = useState<boolean>(true);

    // Per-feature inputs
    const [featureInputs, setFeatureInputs] = useState<Record<number, { khoKhan: string, suaDoi: string }>>({});

    // Feature grading
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
    const [featureGrades, setFeatureGrades] = useState<{ [key: number]: { diem: number, nhanXet: string, isLoading: boolean, error?: string } }>({});

    // History (persisted)
    const [history, setHistory] = useState<IHistoryItem[]>(loadHistory);
    const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

    // Timer for cooldown
    const [currentTime, setCurrentTime] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    // ── Toast helpers ──
    const addToast = useCallback((type: IToast['type'], msg: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, msg }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    // ── Loading message cycler ──
    useEffect(() => {
        if (status !== 'loading') return;
        const t = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 1800);
        return () => clearInterval(t);
    }, [status]);

    // ── Staggered reveal when result arrives ──
    useEffect(() => {
        // Check AI Status on mount
        const checkAIStatus = async () => {
            try {
                const res = await axiosInstance.get<any>('/api/SinhDoAnAI/check-ai-status');
                setIsAIAvailable((res as any).isAvailable !== false);
            } catch (err) {
                console.error('Failed to check AI status:', err);
            }
        };
        checkAIStatus();
    }, []);

    useEffect(() => {
        if (status !== 'result' || !resultData) return;
        setRevealedItems(0);
        setActiveTab('features');
        let i = 0;
        const t = setInterval(() => {
            i++;
            setRevealedItems(i);
            if (i >= resultData.yeuCauChucNang.length) clearInterval(t);
        }, 110);
        return () => clearInterval(t);
    }, [status, resultData]);

    // ── Scroll to result ──
    useEffect(() => {
        if (status === 'result') {
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
        }
    }, [status]);

    // ── Persist history ──
    useEffect(() => {
        saveHistory(history);
    }, [history]);

    // ── Sync resultData to current history item ──
    useEffect(() => {
        if (currentHistoryId && resultData) {
            setHistory(prev => prev.map(h =>
                h.id === currentHistoryId ? { ...h, result: resultData } : h
            ));
        }
    }, [resultData, currentHistoryId]);

    // ── MAIN GENERATE ──
    const handleGenerate = async () => {
        if (!mucTieu || !capDo) return;
        const techValue = ngonNgu.trim() || CAREER_OPTIONS.find(o => o.value === mucTieu)?.sub || '';

        // Cancel previous if any
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setStatus('loading');
        setLoadingMsg(0);
        setErrorMsg('');
        setCompletedFeatures([]);

        try {
            const response = await axiosInstance.post<IProjectResult>('/api/SinhDoAnAI/generate', {
                mucTieuNgheNghiep: mucTieu,
                ngonNguCongNghe: techValue,
                capDo: capDo,
            }, { signal: abortRef.current.signal });

            const data = response as unknown as IProjectResult;

            // Basic validation
            if (!data?.tenDoAn || !Array.isArray(data.yeuCauChucNang)) {
                throw new Error('Dữ liệu trả về không hợp lệ.');
            }

            setResultData(data);
            setStatus('result');

            // Save to history
            const newItemId = Date.now().toString();
            const newItem: IHistoryItem = {
                id: newItemId,
                mucTieu,
                ngonNgu: techValue,
                capDo,
                result: data,
                createdAt: new Date().toISOString(),
            };
            setHistory(prev => [newItem, ...prev.slice(0, MAX_HISTORY - 1)]);
            setCurrentHistoryId(newItemId);
            addToast('success', `Đồ án "${data.tenDoAn}" đã được tạo thành công!`);
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;

            console.error('Lỗi khi sinh đồ án:', err);
            const backendDetails = err?.response?.data?.details;
            const backendMessage = err?.response?.data?.message;
            const msg = backendDetails
                ? `${backendMessage}: ${backendDetails}`
                : (backendMessage || err?.message || 'Không thể kết nối đến AI. Vui lòng thử lại.');
            setErrorMsg(msg);
            setStatus('empty');
            addToast('error', msg);
        }
    };

    // ── Dừng generate (dùng lại abortRef sẵn có) ──
    const handleStop = () => {
        abortRef.current?.abort();
        setStatus('empty');
        addToast('info', 'Đã dừng tạo đồ án');
    };

    // ── Load from history ──
    const handleLoadHistory = (item: IHistoryItem) => {
        setMucTieu(item.mucTieu);
        setNgonNgu(item.ngonNgu);
        setCapDo(item.capDo);
        setResultData(item.result);
        setCurrentHistoryId(item.id);

        const comp: number[] = [];
        item.result.yeuCauChucNang?.forEach((yc: any, idx: number) => {
            if (yc.diem >= 50 || yc.trangThai === 'Done') comp.push(idx);
        });
        setCompletedFeatures(comp);

        setStatus('result');
        setShowHistory(false);
        addToast('info', `Đã tải đồ án "${item.result.tenDoAn}"`);
    };

    // ── Delete history item ──
    const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    // ── Clear all history ──
    const handleClearHistory = () => {
        setHistory([]);
        addToast('info', 'Đã xoá toàn bộ lịch sử');
    };

    // ── Copy JSON ──
    const handleCopy = () => {
        if (!resultData) return;
        navigator.clipboard.writeText(JSON.stringify(resultData, null, 2));
        setCopied(true);
        addToast('success', 'Đã sao chép JSON vào clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Chấm điểm từng tính năng (Mới - Quay lại nộp 1 file) ──
    const handleGradeFeature = async (idx: number, yc: any, file: File) => {
        if (!resultData) return;

        if (file.size > 50 * 1024) {
            addToast('error', 'File quá lớn (>50KB). Vui lòng chỉ tải lên file code trọng tâm của tính năng để tiết kiệm Token AI.');
            return;
        }

        const featureKhoKhan = featureInputs[idx]?.khoKhan || '';
        const featureSuaDoi = featureInputs[idx]?.suaDoi || '';

        setFeatureGrades(prev => ({ ...prev, [idx]: { ...prev[idx], isLoading: true, error: undefined } }));

        try {
            const textContent = await file.text();
            const lines = textContent.split('\n');
            const truncatedContent = lines.length > 500 ? lines.slice(0, 500).join('\n') + '\n\n// ... (đã cắt bớt để tiết kiệm Token)' : textContent;

            const tenChucNangText = typeof yc === 'string' ? yc : (yc.tenChucNang || yc.TenChucNang || `Tính năng ${idx + 1}`);
            const ngay = typeof yc === 'string' ? idx + 1 : (yc.ngay || yc.Ngay || idx + 1);

            const response = await axiosInstance.post<{ diem: number, nhanXet: string }>('/api/SinhDoAnAI/cham-diem-tinh-nang', {
                maDoAn: resultData.maDoAn || 0,
                ngay: ngay,
                tenDoAn: resultData.tenDoAn,
                moTa: resultData.moTa,
                tenTinhNang: tenChucNangText,
                tenFile: file.name,
                noiDungFile: truncatedContent,
                khoKhan: featureKhoKhan,
                suaDoi: featureSuaDoi
            });
            const { diem, nhanXet } = response as any;

            setFeatureGrades(prev => ({
                ...prev,
                [idx]: { diem, nhanXet, isLoading: false }
            }));

            if (diem >= 50 && !completedFeatures.includes(idx)) {
                setCompletedFeatures(prev => [...prev, idx]);
                // Update local resultData to persist the completion time
                setResultData(prev => {
                    if (!prev) return prev;
                    const newFeatures = [...prev.yeuCauChucNang];
                    const f = newFeatures[idx];
                    if (typeof f === 'string') {
                        newFeatures[idx] = { tenChucNang: f, ngayHoanThanh: new Date().toISOString(), diem, nhanXet } as any;
                    } else {
                        newFeatures[idx] = { ...f, ngayHoanThanh: new Date().toISOString(), diem, nhanXet };
                    }
                    return { ...prev, yeuCauChucNang: newFeatures };
                });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.details || err?.response?.data?.message || 'Lỗi khi chấm điểm';
            setFeatureGrades(prev => ({
                ...prev,
                [idx]: { ...prev[idx], isLoading: false, error: msg }
            }));
            addToast('error', msg);
        }
    };

    // ── NỘP ĐỒ ÁN & VÀO PHÒNG PHỎNG VẤN ──
    const handleNopDoAn = async () => {
        if (!resultData || submitting) return;
        
        // Kiểm tra xem đã hoàn thành hết các tính năng chưa
        if (completedFeatures.length < resultData.yeuCauChucNang.length) {
            addToast('error', `Vui lòng hoàn thành tất cả các tính năng (hiện tại: ${completedFeatures.length}/${resultData.yeuCauChucNang.length}) để đủ điều kiện tham gia phỏng vấn AI!`);
            return;
        }

        setSubmitting(true);
        try {
            const techValue = ngonNgu.trim() || CAREER_OPTIONS.find(o => o.value === mucTieu)?.sub || '';
            const res = await axiosInstance.post<{ maDoAn: number; cauHoiDauTien: string; message: string }>(
                '/api/SinhDoAnAI/nop-do-an',
                {
                    maDoAn: resultData.maDoAn || undefined,
                    tenDoAn: resultData.tenDoAn,
                    moTa: resultData.moTa,
                    yeuCauChucNang: resultData.yeuCauChucNang.map((f: any) => typeof f === 'string' ? f : (f.tenChucNang || f.TenChucNang || '')),
                    cauTrucDatabase: resultData.cauTrucDatabase,
                    mucTieuNgheNghiep: mucTieu,
                    ngonNguCongNghe: techValue,
                    ghiChuThayDoi: "",
                    khoKhan: khoKhan.trim(),
                    tienDoHoanThanh: `Hoàn thành ${completedFeatures.length}/${resultData.yeuCauChucNang.length} chức năng`,
                }
            ) as any;
            const { sessionId, cauHoiDauTien } = res;
            sessionStorage.setItem(`phongvan-do-an-${sessionId}`, JSON.stringify({
                tenDoAn: resultData.tenDoAn,
                cauHoiDauTien,
            }));
            // Chuyển sang phòng phỏng vấn, truyền state qua router
            navigate(`/phong-van-do-an/${sessionId}`, {
                state: { tenDoAn: resultData.tenDoAn, cauHoiDauTien }
            });
        } catch (err: any) {
            const msg = err?.response?.data?.details || err?.response?.data?.message || 'Lỗi khi nộp đồ án.';
            addToast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Export Markdown ──
    const handleExportMarkdown = () => {
        if (!resultData) return;
        const md = [
            `# ${resultData.tenDoAn}`,
            ``,
            `> ${resultData.moTa}`,
            ``,
            `## Yêu cầu chức năng`,
            ...resultData.yeuCauChucNang.map((f, i) => `${i + 1}. ${f}`),
            ``,
            `## Cấu trúc Database`,
            `\`\`\`sql`,
            resultData.cauTrucDatabase,
            `\`\`\``,
        ].join('\n');

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resultData.tenDoAn.replace(/\s+/g, '_')}.md`;
        a.click();
        URL.revokeObjectURL(url);
        addToast('success', 'Đã xuất file Markdown thành công!');
    };

    const selectedCareer = CAREER_OPTIONS.find(o => o.value === mucTieu);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <div id="sda-root">
                {/* ── ANIMATED BG ── */}
                <div className="sda-bg" aria-hidden="true">
                    <div className="sda-blob sda-b1" />
                    <div className="sda-blob sda-b2" />
                    <div className="sda-blob sda-b3" />
                    <div className="sda-grid" />
                </div>

                {/* ── TOAST CONTAINER ── */}
                <div className="sda-toasts" aria-live="polite">
                    {toasts.map(t => (
                        <div key={t.id} className={`sda-toast sda-toast-${t.type}`}>
                            <span className="sda-toast-icon">
                                {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
                            </span>
                            {t.msg}
                        </div>
                    ))}
                </div>

                {/* ── HEADER ── */}
                <header className="sda-header">
                    <div className="sda-header-brand">
                        <div className="sda-brand-icon" aria-label="EduCode AI">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        </div>
                        <div>
                            <span className="sda-brand-name">EduCode AI</span>
                            <span className="sda-brand-sub">Project Generator</span>
                        </div>
                    </div>
                    <div className="sda-header-center">
                        <span className="sda-header-badge">
                            <span className="sda-live-dot" />
                            AI Studio · Phiên bản 2.0
                        </span>
                    </div>
                    <div className="sda-header-right">
                        {/* History button */}
                        <button
                            className="sda-history-btn"
                            onClick={() => setShowHistory(true)}
                            title="Lịch sử đồ án"
                            aria-label={`Lịch sử đồ án (${history.length})`}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            Lịch sử
                            {history.length > 0 && <span className="sda-history-count">{history.length}</span>}
                        </button>
                        <button className="sda-back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                            Quay lại
                        </button>
                    </div>
                </header>

                {/* ── HERO ── */}
                <section className="sda-hero" aria-labelledby="sda-hero-title">
                    <div className="sda-hero-tag" aria-label="Công nghệ AI">
                        <span aria-hidden="true">✦</span> Được hỗ trợ bởi Gemini AI
                    </div>
                    <h1 className="sda-hero-title" id="sda-hero-title">
                        Tạo Đồ Án <span className="sda-gradient-text">Thực Chiến</span><br />trong Vài Giây
                    </h1>
                    <p className="sda-hero-desc">
                        AI phân tích mục tiêu nghề nghiệp của bạn và thiết kế một đồ án hoàn chỉnh
                        với kiến trúc hệ thống, database schema và danh sách tính năng chi tiết.
                    </p>
                </section>

                {!isAIAvailable && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px', padding: '15px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        Hệ thống AI hiện đang hết lượt sử dụng hoặc đang bận. Vui lòng quay lại sau ít phút!
                    </div>
                )}

                {/* ── MAIN LAYOUT ── */}
                <main className="sda-main" id="sda-main-content">

                    {/* ━━━ CONFIG PANEL ━━━ */}
                    <aside className="sda-config-panel" aria-label="Tuỳ chỉnh đồ án">

                        {/* STEP 1: Career */}
                        <div className="sda-step">
                            <div className="sda-step-header">
                                <span className="sda-step-num" aria-hidden="true">01</span>
                                <div>
                                    <span className="sda-step-title">Mục tiêu nghề nghiệp</span>
                                    <span className="sda-step-sub">Bạn muốn trở thành ai?</span>
                                </div>
                            </div>
                            <div className="sda-career-grid" role="radiogroup" aria-label="Chọn mục tiêu nghề nghiệp">
                                {CAREER_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        role="radio"
                                        aria-checked={mucTieu === opt.value}
                                        className={`sda-career-card ${mucTieu === opt.value ? 'active' : ''}`}
                                        onClick={() => setMucTieu(opt.value)}
                                        disabled={status === 'loading'}
                                    >
                                        <span className="sda-career-icon" aria-hidden="true">{opt.icon}</span>
                                        <span className="sda-career-label">{opt.label}</span>
                                        <span className="sda-career-sub">{opt.sub}</span>
                                        {mucTieu === opt.value && (
                                            <span className="sda-career-check" aria-hidden="true">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* STEP 2: Tech Stack */}
                        <div className="sda-step">
                            <div className="sda-step-header">
                                <span className="sda-step-num" aria-hidden="true">02</span>
                                <div>
                                    <span className="sda-step-title">Công nghệ sử dụng</span>
                                    <span className="sda-step-sub">Để trống = tự động từ mục tiêu</span>
                                </div>
                            </div>
                            <div className="sda-input-wrap">
                                <svg className="sda-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                                </svg>
                                <input
                                    id="sda-tech-input"
                                    type="text"
                                    className="sda-input"
                                    placeholder={`VD: ${selectedCareer?.sub ?? 'ReactJS, NodeJS, MongoDB'}`}
                                    value={ngonNgu}
                                    onChange={e => setNgonNgu(e.target.value)}
                                    disabled={status === 'loading'}
                                    aria-label="Công nghệ sử dụng"
                                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                                />
                            </div>
                        </div>

                        {/* STEP 3: Level */}
                        <div className="sda-step">
                            <div className="sda-step-header">
                                <span className="sda-step-num" aria-hidden="true">03</span>
                                <div>
                                    <span className="sda-step-title">Cấp độ đồ án</span>
                                    <span className="sda-step-sub">Độ phức tạp mong muốn</span>
                                </div>
                            </div>
                            <div className="sda-level-group" role="radiogroup" aria-label="Chọn cấp độ">
                                {LEVEL_OPTIONS.map(lv => (
                                    <button
                                        key={lv.val}
                                        role="radio"
                                        aria-checked={capDo === lv.val}
                                        className={`sda-level-btn ${capDo === lv.val ? 'active' : ''}`}
                                        onClick={() => setCapDo(lv.val)}
                                        disabled={status === 'loading'}
                                    >
                                        {lv.recommended && (
                                            <span className="sda-recommended" aria-label="Gợi ý">Gợi ý</span>
                                        )}
                                        <span className="sda-level-icon" aria-hidden="true">{lv.icon}</span>
                                        <span className="sda-level-label">{lv.label}</span>
                                        <span className="sda-level-desc">{lv.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error message */}
                        {errorMsg && (
                            <div className="sda-error-box" role="alert">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {errorMsg}
                            </div>
                        )}

                        {/* GENERATE BUTTON */}
                        <button
                            id="sda-generate-btn"
                            className={`sda-gen-btn ${(status === 'loading' || !isAIAvailable) ? 'loading' : ''}`}
                            onClick={handleGenerate}
                            disabled={status === 'loading' || !isAIAvailable}
                            aria-busy={status === 'loading'}
                            aria-label={status === 'loading' ? 'Đang tạo đồ án' : 'Tạo đồ án ngay'}
                            style={!isAIAvailable ? { opacity: 0.6, cursor: 'not-allowed', background: '#334155' } : {}}
                        >
                            {status === 'loading' ? (
                                <>
                                    <span className="sda-gen-spinner" aria-hidden="true" />
                                    Đang tạo đồ án...
                                </>
                            ) : !isAIAvailable ? (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    AI Đang Bận...
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    {status === 'result' ? 'Tạo Đồ Án Mới' : 'Tạo Đồ Án Ngay'}
                                </>
                            )}
                            <div className="sda-gen-shine" aria-hidden="true" />
                        </button>

                        {/* Nút Dừng - hiện khi đang tạo, dùng lại abortRef sẵn có */}
                        {status === 'loading' && (
                            <button
                                type="button"
                                className="sda-stop-btn"
                                onClick={handleStop}
                                aria-label="Dừng tạo đồ án"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                                Dừng
                            </button>
                        )}

                        {/* Quick re-gen hint */}
                        {status === 'result' && (
                            <p className="sda-regen-hint">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.85" />
                                </svg>
                                Nhấn "Tạo Đồ Án Mới" để tạo lại với cùng thông số
                            </p>
                        )}
                    </aside>

                    {/* ━━━ RESULT PANEL ━━━ */}
                    <section
                        className="sda-result-panel"
                        ref={resultRef}
                        aria-live="polite"
                        aria-label="Kết quả đồ án"
                    >

                        {/* ── EMPTY STATE ── */}
                        {status === 'empty' && !errorMsg && (
                            <div className="sda-empty" role="status">
                                <div className="sda-empty-orbit" aria-hidden="true">
                                    <div className="sda-empty-core">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div className="sda-orbit-ring r1" />
                                    <div className="sda-orbit-ring r2" />
                                    <div className="sda-orbit-dot d1" />
                                    <div className="sda-orbit-dot d2" />
                                </div>
                                <h2 className="sda-empty-title">Sẵn sàng tạo đồ án</h2>
                                <p className="sda-empty-sub">
                                    Chọn mục tiêu nghề nghiệp và nhấn{' '}
                                    <strong>"Tạo Đồ Án Ngay"</strong>{' '}
                                    để AI thiết kế dự án phù hợp với bạn.
                                </p>
                                <div className="sda-empty-features" aria-label="Tính năng hệ thống">
                                    {['Kiến trúc hệ thống hoàn chỉnh', 'Database schema chi tiết', 'Danh sách tính năng rõ ràng', 'Phù hợp portfolio & CV'].map(f => (
                                        <span key={f} className="sda-empty-feature-tag">✦ {f}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── EMPTY STATE (after error) ── */}
                        {status === 'empty' && errorMsg && (
                            <div className="sda-empty sda-empty-error" role="status">
                                <div className="sda-error-orbit" aria-hidden="true">
                                    <div className="sda-error-core">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="sda-empty-title" style={{ color: '#f87171' }}>Đã xảy ra lỗi</h2>
                                <p className="sda-empty-sub">{errorMsg}</p>
                                <button className="sda-retry-btn" onClick={handleGenerate} aria-label="Thử lại">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.85" />
                                    </svg>
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {/* ── LOADING STATE ── */}
                        {status === 'loading' && (
                            <div className="sda-loading" role="status" aria-label="Đang tạo đồ án">
                                <div className="sda-loading-visual" aria-hidden="true">
                                    <div className="sda-loading-ring r1" />
                                    <div className="sda-loading-ring r2" />
                                    <div className="sda-loading-ring r3" />
                                    <div className="sda-loading-core">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="sda-loading-msg">
                                    <span className="sda-loading-label">AI đang xử lý</span>
                                    <p className="sda-loading-step" key={loadingMsg}>{LOADING_MESSAGES[loadingMsg]}</p>
                                </div>
                                <div className="sda-loading-bar" role="progressbar" aria-label="Tiến trình xử lý">
                                    <div className="sda-loading-bar-fill" />
                                </div>
                                <p className="sda-loading-hint">Thường mất 5–20 giây tuỳ độ phức tạp</p>
                            </div>
                        )}

                        {/* ── RESULT STATE ── */}
                        {status === 'result' && resultData && (
                            <div className="sda-result">

                                {/* Result Header */}
                                <div className="sda-result-header">
                                    <div className="sda-result-badge" aria-label={`Hoàn tất - cấp độ ${capDo}`}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                        </svg>
                                        Hoàn tất · {capDo}
                                    </div>
                                    <div className="sda-result-actions">
                                        <button
                                            className="sda-icon-btn"
                                            onClick={handleExportMarkdown}
                                            title="Xuất file Markdown"
                                            aria-label="Xuất file Markdown"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Xuất MD
                                        </button>
                                        <button
                                            className={`sda-icon-btn ${copied ? 'copied' : ''}`}
                                            onClick={handleCopy}
                                            title="Sao chép JSON"
                                            aria-label="Sao chép JSON"
                                            aria-pressed={copied}
                                        >
                                            {copied ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    Đã copy
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                    </svg>
                                                    Sao chép
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Project title block */}
                                <div className="sda-project-title-block">
                                    <h2 className="sda-project-name">{resultData.tenDoAn}</h2>
                                    <p className="sda-project-desc">{resultData.moTa}</p>
                                    <div className="sda-project-tags" aria-label="Nhãn dự án">
                                        <span className="sda-tag">{mucTieu.split('(')[0].trim()}</span>
                                        <span className="sda-tag">{capDo}</span>
                                        {(ngonNgu || selectedCareer?.sub) && (
                                            <span className="sda-tag">{ngonNgu || selectedCareer?.sub}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="sda-tabs" role="tablist" aria-label="Xem nội dung đồ án">
                                    <button
                                        id="tab-features"
                                        role="tab"
                                        aria-selected={activeTab === 'features'}
                                        aria-controls="panel-features"
                                        className={`sda-tab ${activeTab === 'features' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('features')}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                        </svg>
                                        Yêu cầu chức năng
                                        <span className="sda-tab-count" aria-label={`${resultData.yeuCauChucNang.length} chức năng`}>
                                            {resultData.yeuCauChucNang.length}
                                        </span>
                                    </button>
                                    <button
                                        id="tab-database"
                                        role="tab"
                                        aria-selected={activeTab === 'database'}
                                        aria-controls="panel-database"
                                        className={`sda-tab ${activeTab === 'database' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('database')}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                        </svg>
                                        Database Schema
                                    </button>
                                </div>

                                {/* Tab: Features */}
                                {activeTab === 'features' && (
                                    <div
                                        id="panel-features"
                                        role="tabpanel"
                                        aria-labelledby="tab-features"
                                        className="sda-features-list"
                                    >
                                        {resultData.yeuCauChucNang.map((yc: any, idx) => {
                                            // Handle backward compatibility or case issues
                                            const tenChucNangText = typeof yc === 'string' ? yc : (yc.tenChucNang || yc.TenChucNang || `Tính năng ${idx + 1}`);
                                            const chiTietYeuCauText = typeof yc === 'string' ? '' : (yc.chiTietYeuCau || yc.ChiTietYeuCau || '');
                                            const ngay = typeof yc === 'string' ? idx + 1 : (yc.ngay || yc.Ngay || idx + 1);
                                            const diem = typeof yc === 'string' ? 0 : (yc.diem || yc.Diem || 0);
                                            const nhanXet = typeof yc === 'string' ? '' : (yc.nhanXet || yc.NhanXet || '');
                                            const ngayHoanThanh = typeof yc === 'string' ? null : (yc.ngayHoanThanh || yc.NgayHoanThanh);

                                            const isCompleted = completedFeatures.includes(idx) || !!ngayHoanThanh;
                                            const isExpanded = expandedFeature === idx;
                                            const gradeData = featureGrades[idx] || (diem > 0 ? { diem: diem, nhanXet: nhanXet, isLoading: false } : undefined);

                                            // Logic khoá: Ngày N mở khi Ngày N-1 đã hoàn thành và qua thời gian đếm ngược (cooldown 60s)
                                            let isLocked = false;
                                            let lockReason = '';
                                            if (idx > 0) {
                                                const prevFeature = resultData.yeuCauChucNang[idx - 1] as any;
                                                const prevCompletedAt = typeof prevFeature === 'string' ? null : (prevFeature.ngayHoanThanh || prevFeature.NgayHoanThanh);
                                                if (!prevCompletedAt && !completedFeatures.includes(idx - 1)) {
                                                    isLocked = true;
                                                    lockReason = 'Phải hoàn thành chức năng trước đó (>50 điểm).';
                                                } else if (prevCompletedAt) {
                                                    const prevTime = new Date(prevCompletedAt).getTime();
                                                    const diffSeconds = Math.floor((currentTime - prevTime) / 1000);
                                                    const cooldown = 10; // 10 giây (demo)
                                                    if (diffSeconds < cooldown) {
                                                        isLocked = true;
                                                        lockReason = `Sẽ mở khoá sau ${cooldown - diffSeconds} giây...`;
                                                    }
                                                }
                                            }

                                            return (
                                                <div key={idx} className={`sda-feature-wrapper ${idx < revealedItems ? 'revealed' : ''}`} style={{ transitionDelay: `${idx * 55}ms` }}>
                                                    <div
                                                        className={`sda-feature-item ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''} ${isLocked ? 'locked' : ''}`}
                                                        style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: (isCompleted && !isExpanded) ? 0.7 : (isLocked ? 0.5 : 1), alignItems: 'flex-start' }}
                                                        onClick={() => !isLocked && setExpandedFeature(isExpanded ? null : idx)}
                                                    >
                                                        <div className="sda-feature-num" aria-hidden="true" style={{ background: isCompleted ? 'var(--success)' : (isLocked ? 'var(--text-muted)' : ''), color: isCompleted || isLocked ? 'white' : '', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {isLocked ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                            ) : (
                                                                isCompleted ? (
                                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                ) : (
                                                                    String(idx + 1).padStart(2, '0')
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="sda-feature-text" style={{ flex: 1, paddingRight: '1rem' }}>
                                                            <div style={{ textDecoration: isCompleted ? 'line-through' : 'none', fontWeight: 600 }}>{tenChucNangText}</div>
                                                            {chiTietYeuCauText && (
                                                                <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-light)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                                                    {chiTietYeuCauText}
                                                                </div>
                                                            )}
                                                            {isLocked && <span style={{ display: 'block', fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{lockReason}</span>}
                                                        </div>
                                                        {!isLocked && <div className="sda-feature-arrow" aria-hidden="true" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', marginTop: '2px' }}>→</div>}
                                                    </div>

                                                    {isExpanded && !isLocked && (
                                                        <div className="sda-feature-detail">
                                                            <p className="sda-feature-detail-title">Chấm điểm tính năng Ngày {ngay}</p>

                                                            <div className="sda-submit-note-wrapper" style={{ width: '100%', marginBottom: '1rem' }}>
                                                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                                                    Khó khăn bạn gặp phải ở phần này? (Tuỳ chọn)
                                                                </label>
                                                                <textarea
                                                                    className="sda-textarea"
                                                                    placeholder="Mô tả khó khăn để AI chấm châm chước..."
                                                                    value={featureInputs[idx]?.khoKhan || ''}
                                                                    onChange={e => setFeatureInputs(prev => ({ ...prev, [idx]: { ...prev[idx], khoKhan: e.target.value } }))}
                                                                    rows={2}
                                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem', color: '#e2e8f0', fontSize: '0.85rem', resize: 'vertical' }}
                                                                />
                                                            </div>

                                                            <div className="sda-submit-note-wrapper" style={{ width: '100%', marginBottom: '1rem' }}>
                                                                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                                                    Bạn có sửa đổi gì so với thiết kế ban đầu không? (Tuỳ chọn)
                                                                </label>
                                                                <textarea
                                                                    className="sda-textarea"
                                                                    placeholder="Ghi chú những phần bạn tự ý thay đổi..."
                                                                    value={featureInputs[idx]?.suaDoi || ''}
                                                                    onChange={e => setFeatureInputs(prev => ({ ...prev, [idx]: { ...prev[idx], suaDoi: e.target.value } }))}
                                                                    rows={2}
                                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem', color: '#e2e8f0', fontSize: '0.85rem', resize: 'vertical' }}
                                                                />
                                                            </div>

                                                            {yc.goiYFileNop && (
                                                                <div className="sda-feature-suggestion" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--info)', fontStyle: 'italic' }}>
                                                                    💡 Gợi ý file cần nộp: <strong>{yc.goiYFileNop}</strong>
                                                                </div>
                                                            )}

                                                            <div className="sda-feature-upload-area">
                                                                <input
                                                                    type="file"
                                                                    id={`file-upload-${idx}`}
                                                                    className="sda-file-input-hidden"
                                                                    accept=".js,.jsx,.ts,.tsx,.cs,.html,.css,.json,.md"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) handleGradeFeature(idx, yc, file);
                                                                        e.target.value = ''; // reset
                                                                    }}
                                                                    disabled={gradeData?.isLoading}
                                                                />
                                                                <label htmlFor={`file-upload-${idx}`} className={`sda-upload-btn ${gradeData?.isLoading ? 'loading' : ''}`}>
                                                                    {gradeData?.isLoading ? 'Đang chấm điểm...' : 'Tải file cốt lõi lên chấm (.ts, .cs...)'}
                                                                </label>
                                                            </div>

                                                            {gradeData && !gradeData.isLoading && gradeData.diem !== undefined && (
                                                                <div className="sda-feature-grade-result">
                                                                    <div className="sda-feature-score">
                                                                        Điểm: <strong style={{ color: gradeData.diem >= 50 ? '#4ade80' : '#f87171' }}>{gradeData.diem}/100</strong>
                                                                    </div>
                                                                    <div className="sda-feature-feedback">
                                                                        <strong>Nhận xét từ AI:</strong>
                                                                        <p>{gradeData.nhanXet}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {gradeData?.error && (
                                                                <div className="sda-feature-grade-error">
                                                                    {gradeData.error}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Tab: Database */}
                                {activeTab === 'database' && (
                                    <div
                                        id="panel-database"
                                        role="tabpanel"
                                        aria-labelledby="tab-database"
                                        className="sda-db-block"
                                    >
                                        <div className="sda-db-toolbar">
                                            <div className="sda-db-dots" aria-hidden="true">
                                                <span /><span /><span />
                                            </div>
                                            <span className="sda-db-filename">schema.sql</span>
                                            <button
                                                className="sda-db-copy"
                                                onClick={handleCopy}
                                                title="Sao chép schema"
                                                aria-label="Sao chép database schema"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                            </button>
                                        </div>
                                        <pre className="sda-db-code">{resultData.cauTrucDatabase}</pre>
                                    </div>
                                )}

                                {/* ── NỘP ĐỒ ÁN CTA ── */}
                                <div className="sda-submit-cta">
                                    <div className="sda-submit-info">
                                        <span className="sda-submit-icon">🎯</span>
                                        <div>
                                            <strong>Sẵn sàng chứng minh bản thân?</strong>
                                            <p>Nộp đồ án và bước vào Trạm Hỏi Cung AI – hoàn thành để nhận Chứng Chỉ Thực Chiến</p>
                                        </div>
                                    </div>


                                    <div className="sda-submit-note-wrapper" style={{ width: '100%', marginTop: '0.5rem' }}>
                                        <label htmlFor="khoKhan" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                            Bạn gặp những khó khăn gì trong quá trình làm đồ án này? (Tuỳ chọn)
                                        </label>
                                        <textarea
                                            id="khoKhan"
                                            className="sda-textarea"
                                            placeholder="Ví dụ: Cấu hình Redux rườm rà, hoặc khó khăn khi tối ưu truy vấn Database..."
                                            value={khoKhan}
                                            onChange={e => setKhoKhan(e.target.value)}
                                            rows={2}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem', color: '#e2e8f0', fontSize: '0.85rem', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                        <button
                                            id="sda-submit-btn"
                                            className={`sda-submit-btn ${submitting ? 'loading' : ''}`}
                                            onClick={handleNopDoAn}
                                            disabled={submitting}
                                            aria-busy={submitting}
                                        >
                                            {submitting ? (
                                                <><span className="sda-gen-spinner" aria-hidden="true" />Đang nộp...</>
                                            ) : (
                                                <><span>🚀</span> Nộp Đồ Án &amp; Bắt Đầu Phỏng Vấn AI</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* ─── HISTORY DRAWER ──────────────────────────────────────── */}
            {showHistory && (
                <div
                    className="sda-drawer-overlay"
                    onClick={() => setShowHistory(false)}
                    aria-modal="true"
                    role="dialog"
                    aria-label="Lịch sử đồ án"
                >
                    <div className="sda-drawer" onClick={e => e.stopPropagation()}>
                        <div className="sda-drawer-header">
                            <h2 className="sda-drawer-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                Lịch sử đồ án
                            </h2>
                            <div className="sda-drawer-actions">
                                {history.length > 0 && (
                                    <button
                                        className="sda-drawer-clear"
                                        onClick={handleClearHistory}
                                        aria-label="Xoá toàn bộ lịch sử"
                                    >
                                        Xoá tất cả
                                    </button>
                                )}
                                <button
                                    className="sda-drawer-close"
                                    onClick={() => setShowHistory(false)}
                                    aria-label="Đóng"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="sda-drawer-body">
                            {history.length === 0 ? (
                                <div className="sda-drawer-empty">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <p>Chưa có đồ án nào được tạo</p>
                                </div>
                            ) : (
                                <ul className="sda-history-list" aria-label="Danh sách đồ án đã tạo">
                                    {history.map(item => (
                                        <li key={item.id}>
                                            <button
                                                className="sda-history-item"
                                                onClick={() => handleLoadHistory(item)}
                                                aria-label={`Tải đồ án: ${item.result.tenDoAn}`}
                                            >
                                                <div className="sda-history-main">
                                                    <span className="sda-history-name">{item.result.tenDoAn}</span>
                                                    <span className="sda-history-meta">
                                                        {item.mucTieu.split('(')[0].trim()} · {item.capDo}
                                                    </span>
                                                    <span className="sda-history-time">
                                                        {formatRelativeTime(item.createdAt)}
                                                    </span>
                                                </div>
                                                <button
                                                    className="sda-history-delete"
                                                    onClick={e => handleDeleteHistory(item.id, e)}
                                                    aria-label={`Xoá "${item.result.tenDoAn}" khỏi lịch sử`}
                                                    title="Xoá"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <path d="M18 6L6 18M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── STYLES ─────────────────────────────────────────────────────────── */}
            <style>{`
            /* ── RESET & BASE ── */
            #sda-root {
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                background: #060911;
                color: #e2e8f0;
                min-height: 100vh;
                position: relative;
                overflow-x: hidden;
            }

            /* ── ANIMATED BACKGROUND ── */
            .sda-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
            .sda-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
            .sda-b1 { width: 600px; height: 600px; background: radial-gradient(circle, #7c3aed, transparent); top: -200px; left: -150px; animation: blobFloat 12s ease-in-out infinite; }
            .sda-b2 { width: 500px; height: 500px; background: radial-gradient(circle, #0ea5e9, transparent); bottom: -150px; right: -100px; animation: blobFloat 15s ease-in-out infinite reverse; }
            .sda-b3 { width: 350px; height: 350px; background: radial-gradient(circle, #f59e0b, transparent); top: 40%; left: 50%; animation: blobFloat 10s ease-in-out infinite 3s; opacity: 0.07; }
            @keyframes blobFloat { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,30px) scale(1.1); } 66% { transform: translate(-20px,40px) scale(0.95); } }
            .sda-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; }

            /* ── TOAST ── */
            .sda-toasts { position: fixed; top: 74px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
            .sda-toast { display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; max-width: 340px; backdrop-filter: blur(20px); animation: toastIn 0.3s ease; pointer-events: auto; }
            @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
            .sda-toast-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; }
            .sda-toast-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #fca5a5; }
            .sda-toast-info    { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; }
            .sda-toast-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
            .sda-toast-success .sda-toast-icon { background: rgba(16,185,129,0.2); }
            .sda-toast-error   .sda-toast-icon { background: rgba(239,68,68,0.2);  }
            .sda-toast-info    .sda-toast-icon { background: rgba(99,102,241,0.2); }

            /* ── HEADER ── */
            .sda-header { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 64px; background: rgba(6,9,17,0.9); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); }
            .sda-header-brand { display: flex; align-items: center; gap: 12px; }
            .sda-brand-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 0 20px rgba(124,58,237,0.4); flex-shrink: 0; }
            .sda-brand-name { display: block; font-size: 15px; font-weight: 800; color: #f1f5f9; }
            .sda-brand-sub  { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 1px; }
            .sda-header-center {}
            .sda-header-badge { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 6px 14px; border-radius: 20px; }
            .sda-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: livePulse 2s infinite; }
            @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
            .sda-header-right { display: flex; align-items: center; gap: 10px; }
            .sda-history-btn { position: relative; display: flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .sda-history-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
            .sda-history-count { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: #7c3aed; color: white; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #060911; }
            .sda-back-btn { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .sda-back-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

            /* ── HERO ── */
            .sda-hero { text-align: center; padding: 56px 24px 32px; position: relative; z-index: 1; }
            .sda-hero-tag { display: inline-flex; align-items: center; gap: 7px; padding: 6px 16px; border-radius: 20px; background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25); color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.08em; }
            .sda-hero-title { font-size: clamp(26px, 4vw, 46px); font-weight: 900; line-height: 1.15; color: #f1f5f9; margin: 0 0 16px; letter-spacing: -0.02em; }
            .sda-gradient-text { background: linear-gradient(135deg, #7c3aed, #06b6d4, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .sda-hero-desc { font-size: 15px; color: #64748b; line-height: 1.7; max-width: 600px; margin: 0 auto; }

            /* ── MAIN LAYOUT ── */
            .sda-main { display: grid; grid-template-columns: 380px 1fr; gap: 24px; max-width: 1280px; margin: 0 auto; padding: 0 28px 60px; position: relative; z-index: 1; align-items: start; }
            @media (max-width: 900px) { .sda-main { grid-template-columns: 1fr; } }

            /* ── CONFIG PANEL ── */
            .sda-config-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 28px; position: sticky; top: 80px; backdrop-filter: blur(12px); }

            /* Step */
            .sda-step { display: flex; flex-direction: column; gap: 14px; }
            .sda-step-header { display: flex; align-items: flex-start; gap: 12px; }
            .sda-step-num { font-size: 11px; font-weight: 800; color: #7c3aed; background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.2); padding: 3px 8px; border-radius: 6px; flex-shrink: 0; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
            .sda-step-title { display: block; font-size: 14px; font-weight: 700; color: #f1f5f9; }
            .sda-step-sub   { display: block; font-size: 11px; color: #475569; margin-top: 2px; }

            /* Career */
            .sda-career-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .sda-career-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 12px 12px 10px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); cursor: pointer; transition: all 0.2s; text-align: left; }
            .sda-career-card:hover:not(:disabled) { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
            .sda-career-card:disabled { opacity: 0.5; cursor: not-allowed; }
            .sda-career-card.active { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.45); box-shadow: 0 0 20px rgba(124,58,237,0.1); }
            .sda-career-icon  { font-size: 18px; margin-bottom: 4px; }
            .sda-career-label { font-size: 12px; font-weight: 700; color: #e2e8f0; }
            .sda-career-sub   { font-size: 10px; color: #64748b; }
            .sda-career-check { position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; }

            /* Input */
            .sda-input-wrap { position: relative; }
            .sda-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #475569; pointer-events: none; }
            .sda-input { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; color: #e2e8f0; font-size: 13.5px; font-family: inherit; padding: 13px 14px 13px 40px; transition: border-color 0.2s, box-shadow 0.2s; }
            .sda-input::placeholder { color: #475569; }
            .sda-input:focus { outline: none; border-color: rgba(124,58,237,0.5); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
            .sda-input:disabled { opacity: 0.5; cursor: not-allowed; }

            /* Level */
            .sda-level-group { display: flex; flex-direction: column; gap: 8px; }
            .sda-level-btn { position: relative; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); cursor: pointer; transition: all 0.2s; text-align: left; }
            .sda-level-btn:hover:not(:disabled) { background: rgba(255,255,255,0.06); }
            .sda-level-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .sda-level-btn.active { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.45); }
            .sda-recommended { position: absolute; top: -8px; right: 10px; font-size: 9px; font-weight: 800; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .sda-level-icon  { font-size: 18px; flex-shrink: 0; }
            .sda-level-label { font-size: 13px; font-weight: 700; color: #e2e8f0; flex: 1; }
            .sda-level-desc  { font-size: 11px; color: #64748b; }

            /* Error box */
            .sda-error-box { display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; border-radius: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; font-size: 13px; line-height: 1.5; }

            /* Generate button */
            .sda-gen-btn { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 16px; border-radius: 14px; border: none; background: linear-gradient(135deg, var(--ai-accent) 0%, #4f46e5 50%, var(--info) 100%); color: white; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 32px rgba(124,58,237,0.4); letter-spacing: 0.01em; }
            .sda-gen-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.55); }
            .sda-gen-btn:disabled { opacity: 0.7; cursor: not-allowed; }
            .sda-gen-shine { position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); animation: shine 2.5s infinite; }
            @keyframes shine { to { left: 160%; } }
            .sda-gen-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; animation: spin 0.8s linear infinite; flex-shrink: 0; }
            @keyframes spin { to { transform: rotate(360deg); } }

            /* Regen hint */
            .sda-regen-hint { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #475569; margin: -12px 0 0; justify-content: center; }

            /* Stop button */
            .sda-stop-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; margin-top: -12px; border-radius: 12px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
            .sda-stop-btn:hover { background: rgba(239,68,68,0.2); }


            /* Retry button */
            .sda-retry-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: #a78bfa; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
            .sda-retry-btn:hover { background: rgba(124,58,237,0.25); }

            /* ── RESULT PANEL ── */
            .sda-result-panel { min-height: 500px; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); overflow: hidden; backdrop-filter: blur(12px); display: flex; flex-direction: column; }

            /* Empty */
            .sda-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; gap: 20px; }
            .sda-empty-orbit { position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
            .sda-empty-core  { width: 64px; height: 64px; border-radius: 50%; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25); display: flex; align-items: center; justify-content: center; color: #7c3aed; z-index: 1; }
            .sda-orbit-ring  { position: absolute; border-radius: 50%; border: 1px dashed rgba(124,58,237,0.2); }
            .sda-orbit-ring.r1 { width: 90px;  height: 90px;  animation: orbitSpin 8s linear infinite; }
            .sda-orbit-ring.r2 { width: 120px; height: 120px; animation: orbitSpin 12s linear infinite reverse; }
            @keyframes orbitSpin { to { transform: rotate(360deg); } }
            .sda-orbit-dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #7c3aed; box-shadow: 0 0 8px #7c3aed; }
            .sda-orbit-dot.d1 { animation: orbitDot1 8s linear infinite; }
            .sda-orbit-dot.d2 { animation: orbitDot2 12s linear infinite reverse; }
            @keyframes orbitDot1 { from { transform: rotate(0deg)   translateX(45px); } to { transform: rotate(360deg) translateX(45px); } }
            @keyframes orbitDot2 { from { transform: rotate(90deg)  translateX(60px); } to { transform: rotate(450deg) translateX(60px); } }
            .sda-empty-title { font-size: 20px; font-weight: 800; color: #e2e8f0; margin: 0; }
            .sda-empty-sub   { font-size: 14px; color: #64748b; line-height: 1.65; max-width: 400px; margin: 0; }
            .sda-empty-features { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
            .sda-empty-feature-tag { font-size: 11px; color: #64748b; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 5px 12px; border-radius: 20px; }

            /* Error orbit */
            .sda-error-orbit { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
            .sda-error-core  { width: 64px; height: 64px; border-radius: 50%; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; }

            /* Loading */
            .sda-loading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; gap: 28px; }
            .sda-loading-visual { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }
            .sda-loading-ring { position: absolute; border-radius: 50%; border: 2px solid transparent; border-top-color: #7c3aed; }
            .sda-loading-ring.r1 { width: 70px;  height: 70px;  animation: spin 1s linear infinite; }
            .sda-loading-ring.r2 { width: 85px;  height: 85px;  border-top-color: #4f46e5; animation: spin 1.5s linear infinite reverse; }
            .sda-loading-ring.r3 { width: 100px; height: 100px; border-top-color: #0ea5e9; animation: spin 2s linear infinite; }
            .sda-loading-core { width: 52px; height: 52px; border-radius: 50%; background: rgba(124,58,237,0.15); display: flex; align-items: center; justify-content: center; color: #a78bfa; animation: coreGlow 2s ease-in-out infinite; }
            @keyframes coreGlow { 0%,100% { box-shadow: 0 0 12px rgba(124,58,237,0.3); } 50% { box-shadow: 0 0 30px rgba(124,58,237,0.6); } }
            .sda-loading-msg { text-align: center; }
            .sda-loading-label { display: block; font-size: 11px; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 8px; }
            .sda-loading-step { font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0; min-height: 22px; animation: fadeStep 0.4s ease; }
            @keyframes fadeStep { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            .sda-loading-bar { width: 240px; height: 3px; background: rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; }
            .sda-loading-bar-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #0ea5e9); border-radius: 10px; animation: barFill 20s linear forwards; }
            @keyframes barFill { from { width: 0%; } to { width: 95%; } }
            .sda-loading-hint { font-size: 12px; color: #475569; margin: 0; }

            /* Result */
            .sda-result { display: flex; flex-direction: column; height: 100%; animation: fadeUp 0.4s ease; }
            @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            .sda-result-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .sda-result-badge { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 6px 14px; border-radius: 20px; }
            .sda-result-actions { display: flex; align-items: center; gap: 8px; }
            .sda-icon-btn { display: flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .sda-icon-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
            .sda-icon-btn.copied { color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); }

            .sda-project-title-block { padding: 24px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .sda-project-name { font-size: 22px; font-weight: 900; color: #f1f5f9; margin: 0 0 10px; letter-spacing: -0.02em; line-height: 1.3; }
            .sda-project-desc { font-size: 14px; color: #94a3b8; line-height: 1.7; margin: 0 0 14px; }
            .sda-project-tags { display: flex; flex-wrap: wrap; gap: 8px; }
            .sda-tag { font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 4px 12px; border-radius: 20px; }

            /* Tabs */
            .sda-tabs { display: flex; gap: 4px; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .sda-tab { display: flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 8px; background: transparent; border: none; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .sda-tab:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
            .sda-tab.active { background: rgba(124,58,237,0.12); color: #a78bfa; border: 1px solid rgba(124,58,237,0.2); }
            .sda-tab-count { background: rgba(124,58,237,0.2); color: #a78bfa; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 10px; }

            /* Features */
            .sda-features-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; overflow-y: auto; max-height: 480px; }
            .sda-features-list::-webkit-scrollbar { width: 5px; }
            .sda-features-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
            .sda-feature-item { display: flex; align-items: center; gap: 14px; padding: 13px 16px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); opacity: 0; transform: translateX(-10px); transition: opacity 0.35s ease, transform 0.35s ease, background 0.2s; }
            .sda-feature-item.revealed { opacity: 1; transform: translateX(0); }
            .sda-feature-item:hover { background: rgba(255,255,255,0.04); }
            .sda-feature-num  { font-size: 11px; font-weight: 800; color: #7c3aed; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; width: 24px; }
            .sda-feature-text { font-size: 13.5px; color: #cbd5e1; line-height: 1.5; flex: 1; }
            .sda-feature-arrow{ font-size: 14px; color: #334155; flex-shrink: 0; }

            /* Database */
            .sda-db-block { margin: 16px 20px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); animation: fadeUp 0.4s ease; }
            .sda-db-toolbar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.07); }
            .sda-db-dots { display: flex; gap: 5px; }
            .sda-db-dots span { width: 10px; height: 10px; border-radius: 50%; }
            .sda-db-dots span:nth-child(1) { background: #ef4444; }
            .sda-db-dots span:nth-child(2) { background: #f59e0b; }
            .sda-db-dots span:nth-child(3) { background: #10b981; }
            .sda-db-filename { flex: 1; font-size: 12px; color: #64748b; font-family: monospace; }
            .sda-db-copy { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; transition: color 0.2s; }
            .sda-db-copy:hover { color: #e2e8f0; }
            .sda-db-code { background: #0a0d14; color: #4ade80; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12.5px; line-height: 1.75; padding: 20px; margin: 0; white-space: pre-wrap; word-break: break-word; max-height: 420px; overflow-y: auto; }
            .sda-db-code::-webkit-scrollbar { width: 5px; }
            .sda-db-code::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }

            /* ── HISTORY DRAWER ── */
            .sda-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 200; display: flex; justify-content: flex-end; animation: fadeIn 0.25s ease; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .sda-drawer { width: min(440px, 95vw); background: #0f1420; border-left: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; height: 100%; animation: slideInRight 0.3s ease; }
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            .sda-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); }
            .sda-drawer-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 800; color: #f1f5f9; margin: 0; }
            .sda-drawer-actions { display: flex; align-items: center; gap: 8px; }
            .sda-drawer-clear { font-size: 12px; color: #ef4444; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
            .sda-drawer-clear:hover { background: rgba(239,68,68,0.15); }
            .sda-drawer-close { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
            .sda-drawer-close:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
            .sda-drawer-body { flex: 1; overflow-y: auto; padding: 16px; }
            .sda-drawer-body::-webkit-scrollbar { width: 5px; }
            .sda-drawer-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
            .sda-drawer-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: #475569; text-align: center; }
            .sda-drawer-empty p { font-size: 14px; margin: 0; }
            .sda-history-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
            .sda-history-item { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); cursor: pointer; transition: all 0.2s; text-align: left; gap: 10px; }
            .sda-history-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(124,58,237,0.3); }
            .sda-history-main { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
            .sda-history-name { font-size: 13.5px; font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
            .sda-history-meta { font-size: 11px; color: #64748b; display: block; }
            .sda-history-time { font-size: 11px; color: #475569; display: block; }
            .sda-history-delete { width: 28px; height: 28px; border-radius: 6px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); color: #ef4444; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s; opacity: 0; }
            .sda-history-item:hover .sda-history-delete { opacity: 1; }
            .sda-history-delete:hover { background: rgba(239,68,68,0.15); }

            /* ── SUBMIT CTA (Nộp đồ án & Phỏng vấn) ── */
            .sda-submit-cta {
                margin-top: 1.5rem;
                background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(14,165,233,0.08));
                border: 1px solid rgba(124,58,237,0.3);
                border-radius: 16px; padding: 1.25rem 1.5rem;
                display: flex; align-items: center; justify-content: space-between;
                gap: 1rem; flex-wrap: wrap;
                animation: sdaSlideUp 0.4s ease;
            }
            @keyframes sdaSlideUp {
                from { opacity:0; transform:translateY(12px); }
                to { opacity:1; transform:translateY(0); }
            }
            .sda-submit-info { display: flex; align-items: flex-start; gap: 0.75rem; flex: 1; min-width: 200px; }
            .sda-submit-icon { font-size: 1.75rem; flex-shrink: 0; }
            .sda-submit-info strong { font-size: 0.92rem; color: #e2e8f0; display: block; margin-bottom: 0.25rem; }
            .sda-submit-info p { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.5; }
            .sda-submit-btn {
                background: linear-gradient(135deg, var(--ai-accent) 0%, var(--info) 100%);
                border: none; color: white; border-radius: 12px;
                padding: 0.875rem 1.5rem; font-size: 0.9rem; font-weight: 700;
                cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                transition: all 0.25s ease; white-space: nowrap;
                box-shadow: 0 4px 20px rgba(124,58,237,0.4); font-family: inherit;
            }
            .sda-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 28px rgba(124,58,237,0.55);
            }
            .sda-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        `}</style>

        </>
    );
};

export default SinhDoAnAI;
