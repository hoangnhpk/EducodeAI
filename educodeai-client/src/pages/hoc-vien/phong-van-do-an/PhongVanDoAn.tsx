import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '@/configs/axios';
import Swal from 'sweetalert2';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface IMessage {
    id: string;
    role: 'ai' | 'user';
    content: string;
    isTyping?: boolean;
    diem?: number;
    nhanXet?: string;
}

interface IKetQua {
    maDoAn: number;
    tongDiem: number;
    daDat: boolean;
    nhanXetTong: string;
    maChungChi?: string;
    chiTietCauHoi: { soCau: number; cauHoi: string; cauTraLoi: string; diem: number; nhanXet: string }[];
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const PhongVanDoAn: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const sessionStorageKey = sessionId ? `phongvan-do-an-${sessionId}` : '';
    const savedSession = sessionStorageKey ? sessionStorage.getItem(sessionStorageKey) : null;
    let savedSessionData: { tenDoAn?: string; cauHoiDauTien?: string } = {};
    if (savedSession) {
        try {
            savedSessionData = JSON.parse(savedSession);
        } catch {
            sessionStorage.removeItem(sessionStorageKey);
        }
    }
    const tenDoAn: string = (location.state as any)?.tenDoAn ?? savedSessionData.tenDoAn ?? 'Đồ án của bạn';
    const cauHoiDauTien: string = (location.state as any)?.cauHoiDauTien ?? savedSessionData.cauHoiDauTien ?? '';

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [soCauHienTai, setSoCauHienTai] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [daKetThuc, setDaKetThuc] = useState(false);
    const [ketQua, setKetQua] = useState<IKetQua | null>(null);
    const [showKetQua, setShowKetQua] = useState(false);
    const [tongDiemTamThoi, setTongDiemTamThoi] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
    const [soLanChuyenTab, setSoLanChuyenTab] = useState(0);
    const TONG_SO_CAU = 3;

    // Khởi tạo tin nhắn đầu tiên từ AI
    useEffect(() => {
        if (cauHoiDauTien) {
            setMessages([{
                id: 'q-1',
                role: 'ai',
                content: cauHoiDauTien,
            }]);
        }
    }, [cauHoiDauTien]);

    // Auto scroll
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input
    useEffect(() => {
        if (!isLoading && !daKetThuc) {
            inputRef.current?.focus();
        }
    }, [isLoading, daKetThuc]);

    // Đếm ngược thời gian
    useEffect(() => {
        if (isLoading || daKetThuc) return;

        if (timeLeft <= 0) {
            handleSend("(Học viên đã hết thời gian trả lời)");
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, isLoading, daKetThuc]);

    // Phát hiện chuyển tab: chỉ tăng bộ đếm ở đây (updater phải thuần khiết,
    // không gọi setMessages bên trong để tránh StrictMode chạy đúp gây cảnh báo lặp)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !daKetThuc) {
                setSoLanChuyenTab(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [daKetThuc]);

    // Phản ứng khi số lần chuyển tab thay đổi: thêm cảnh báo hoặc kick out
    useEffect(() => {
        if (soLanChuyenTab === 0 || daKetThuc) return;

        if (soLanChuyenTab > 2) {
            Swal.fire({
                icon: 'error',
                title: 'HỦY KẾT QUẢ',
                text: 'Bạn đã vi phạm quy chế quá 2 lần do liên tục rời khỏi tab phỏng vấn. Buổi phỏng vấn sẽ kết thúc ngay bây giờ!',
                confirmButtonText: 'Đã hiểu',
                allowOutsideClick: false
            }).then(() => {
                navigate('/sinh-do-an-ai');
            });
            return;
        }

        setMessages(m => [...m, {
            id: `warn-tab-${soLanChuyenTab}`,
            role: 'ai',
            content: `⚠️ CẢNH BÁO LẦN ${soLanChuyenTab}: Trạm hỏi cung phát hiện bạn vừa rời khỏi tab! Nếu vi phạm quá 2 lần, bạn sẽ bị buộc dừng phỏng vấn.`,
        }]);
    }, [soLanChuyenTab, daKetThuc, navigate]);

    const handleSend = async (autoText?: string) => {
        const text = autoText ?? inputText.trim();
        if (!text || isLoading || daKetThuc) return;

        // Thêm tin nhắn user
        const userMsg: IMessage = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: text,
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        // Typing indicator
        const typingId = `typing-${Date.now()}`;
        setMessages(prev => [...prev, { id: typingId, role: 'ai', content: '', isTyping: true }]);

        try {
            const res = await axiosInstance.post<any>('/api/SinhDoAnAI/tra-loi-phong-van', {
                sessionId,   // dùng cache key
                soCauHienTai,
                cauTraLoi: text,
            }) as any;

            const { diemCauVua, nhanXet, cauHoiTiepTheo, daKetThuc: done } = res;
            const newTong = tongDiemTamThoi + diemCauVua;
            setTongDiemTamThoi(newTong);

            // Xoá typing, thêm feedback + câu hỏi tiếp
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== typingId);
                const newMsgs: IMessage[] = [
                    // Feedback cho câu vừa trả lời
                    {
                        id: `fb-${Date.now()}`,
                        role: 'ai',
                        content: nhanXet,
                        diem: diemCauVua,
                        nhanXet,
                    },
                ];
                if (!done && cauHoiTiepTheo) {
                    newMsgs.push({
                        id: `q-${soCauHienTai + 1}`,
                        role: 'ai',
                        content: cauHoiTiepTheo,
                    });
                }
                return [...filtered, ...newMsgs];
            });

            setSoCauHienTai(prev => prev + 1);
            setTimeLeft(300); // Reset timer cho câu tiếp theo

            if (done) {
                setDaKetThuc(true);
                // Lấy kết quả tổng kết
                setTimeout(async () => {
                    try {
                        const kq = await axiosInstance.get<IKetQua>(`/api/SinhDoAnAI/ket-qua?sessionId=${sessionId}`) as any;
                        setKetQua(kq);
                        setShowKetQua(true);
                    } catch {
                        setShowKetQua(true);
                    }
                }, 1500);
            }
        } catch (err: any) {
            setMessages(prev => prev.filter(m => m.id !== typingId));
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'ai',
                content: '❌ Đã xảy ra lỗi. Vui lòng thử lại.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const diemMauSac = (diem: number) => {
        if (diem >= 16) return 'var(--success)';
        if (diem >= 10) return '#f59e0b';
        return 'var(--danger)';
    };

    // ─── RENDER ─────────────────────────────────────────────────────────────
    return (
        <>
            <div id="pvd-root">
                {/* ── HEADER ── */}
                <header className="pvd-header">
                    <div className="pvd-header-left">
                        <div className="pvd-ai-avatar" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                <path d="M12 4V2M8 4l-1-2M16 4l1-2" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="pvd-title">Trạm Hỏi Cung AI</h1>
                            <p className="pvd-subtitle">
                                <span className="pvd-live-dot" aria-hidden="true" />
                                Đồ án: <strong>{tenDoAn}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="pvd-header-right">
                        <div className="pvd-progress-info" aria-label={`Câu ${Math.min(soCauHienTai, TONG_SO_CAU)} trên ${TONG_SO_CAU}`}>
                            <span className="pvd-progress-label">Câu {Math.min(soCauHienTai, TONG_SO_CAU)}/{TONG_SO_CAU}</span>
                            <div className="pvd-progress-bar" role="progressbar"
                                aria-valuenow={Math.min(soCauHienTai, TONG_SO_CAU)}
                                aria-valuemin={1} aria-valuemax={TONG_SO_CAU}>
                                <div
                                    className="pvd-progress-fill"
                                    style={{ width: `${(Math.min(soCauHienTai, TONG_SO_CAU) / TONG_SO_CAU) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="pvd-score-badge" aria-label={`Điểm tạm tính: ${tongDiemTamThoi}/100`}>
                            <span>⚡</span>
                            <span>{tongDiemTamThoi}<span className="pvd-score-max">/100</span></span>
                        </div>
                        <div className="pvd-timer-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timeLeft <= 60 ? 'rgba(239, 68, 68, 0.1)' : '#f1f5f9', padding: '6px 12px', borderRadius: '8px', color: timeLeft <= 60 ? '#ef4444' : '#475569', fontWeight: '600', border: timeLeft <= 60 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #e2e8f0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                        </div>
                        {soLanChuyenTab > 0 && (
                            <div className="pvd-timer-badge" style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px' }} aria-label="Cảnh báo rời tab">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <span>{soLanChuyenTab} lần</span>
                            </div>
                        )}
                        <button
                            className="pvd-exit-btn"
                            onClick={() => navigate('/sinh-do-an-ai')}
                            aria-label="Thoát phỏng vấn"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            Thoát
                        </button>
                    </div>
                </header>

                {/* ── CHAT AREA ── */}
                <main className="pvd-main">
                    {/* Intro banner */}
                    <div className="pvd-intro-banner" aria-label="Hướng dẫn">
                        <span>🔍</span>
                        <span>AI đã đọc toàn bộ đồ án của bạn và sẽ hỏi xoáy vào các chi tiết kỹ thuật.
                            Trả lời thật, dùng kiến thức của chính mình – AI sẽ phát hiện ngay nếu bạn chỉ copy code!</span>
                    </div>

                    {/* Messages */}
                    <div className="pvd-chat" ref={chatRef} aria-live="polite" aria-label="Cuộc hội thoại phỏng vấn">
                        {messages.map(msg => (
                            <div key={msg.id} className={`pvd-msg-row pvd-msg-${msg.role}`}>
                                {msg.role === 'ai' && (
                                    <div className="pvd-avatar-ai" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className="pvd-bubble-wrap">
                                    <div className={`pvd-bubble ${msg.role === 'ai' ? 'ai' : 'user'} ${msg.isTyping ? 'typing' : ''}`}>
                                        {msg.isTyping ? (
                                            <div className="pvd-typing" aria-label="AI đang soạn tin">
                                                <span /><span /><span />
                                            </div>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                    </div>
                                    {/* Score badge cho feedback */}
                                    {msg.diem !== undefined && (
                                        <div
                                            className="pvd-score-pill"
                                            style={{ color: diemMauSac(msg.diem) }}
                                            aria-label={`Điểm câu này: ${msg.diem}/20`}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            {msg.diem}/20 điểm
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="pvd-avatar-user" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Input area */}
                    {!daKetThuc && (
                        <div className="pvd-input-area">
                            <div className="pvd-input-wrap">
                                <input
                                    ref={inputRef}
                                    id="pvd-answer-input"
                                    type="text"
                                    className="pvd-input"
                                    placeholder="Nhập câu trả lời của bạn..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    aria-label="Câu trả lời phỏng vấn"
                                />
                                <button
                                    id="pvd-send-btn"
                                    className={`pvd-send-btn ${isLoading ? 'loading' : ''}`}
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !inputText.trim()}
                                    aria-label="Gửi câu trả lời"
                                >
                                    {isLoading ? (
                                        <span className="pvd-spinner" aria-hidden="true" />
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="pvd-input-hint">
                                <span aria-hidden="true">💡</span> Giải thích chi tiết, dùng thuật ngữ kỹ thuật đúng – AI chấm điểm dựa trên độ sâu của câu trả lời
                            </p>
                        </div>
                    )}

                    {/* Đang tải kết quả */}
                    {daKetThuc && !showKetQua && (
                        <div className="pvd-finalizing" role="status" aria-label="Đang tổng kết điểm">
                            <div className="pvd-spinner-lg" aria-hidden="true" />
                            <p>AI đang tổng kết kết quả phỏng vấn...</p>
                        </div>
                    )}
                </main>
            </div>

            {/* ── MODAL KẾT QUẢ ── */}
            {showKetQua && (
                <div
                    className="pvd-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Kết quả phỏng vấn"
                >
                    <div className="pvd-modal">
                        {ketQua?.daDat ? (
                            <>
                                <div className="pvd-result-icon pass" aria-hidden="true">🏆</div>
                                <h2 className="pvd-result-title pass">Xuất Sắc! Bạn Đã Đạt!</h2>
                                <p className="pvd-result-score">
                                    Tổng điểm: <strong>{ketQua.tongDiem}/100</strong>
                                </p>
                                {ketQua.maChungChi && (
                                    <div className="pvd-cert-box" aria-label="Mã chứng chỉ">
                                        <span className="pvd-cert-label">🎓 Mã Chứng Chỉ Thực Chiến</span>
                                        <code className="pvd-cert-code">{ketQua.maChungChi}</code>
                                        <button
                                            className="pvd-cert-copy"
                                            onClick={() => navigator.clipboard.writeText(ketQua.maChungChi!)}
                                            aria-label="Sao chép mã chứng chỉ"
                                        >
                                            Sao chép
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="pvd-result-icon fail" aria-hidden="true">📋</div>
                                <h2 className="pvd-result-title fail">Chưa Đạt – Cần Ôn Thêm</h2>
                                <p className="pvd-result-score">
                                    Tổng điểm: <strong>{ketQua?.tongDiem ?? tongDiemTamThoi}/100</strong>
                                    <span className="pvd-pass-hint"> (cần ≥ 50 để đạt)</span>
                                </p>
                            </>
                        )}

                        {/* Nhận xét tổng */}
                        {ketQua?.nhanXetTong && (
                            <div className="pvd-comment-box" aria-label="Nhận xét của AI">
                                <p className="pvd-comment-title">📝 Nhận xét từ AI Interviewer</p>
                                <p className="pvd-comment-text">{ketQua.nhanXetTong}</p>
                            </div>
                        )}

                        {/* Chi tiết từng câu */}
                        {ketQua?.chiTietCauHoi && ketQua.chiTietCauHoi.length > 0 && (
                            <div className="pvd-detail-section">
                                <p className="pvd-detail-title">Chi tiết từng câu</p>
                                {ketQua.chiTietCauHoi.map(c => (
                                    <div key={c.soCau} className="pvd-detail-item">
                                        <div className="pvd-detail-header">
                                            <span className="pvd-detail-num">Câu {c.soCau}</span>
                                            <span className="pvd-detail-score" style={{ color: diemMauSac(c.diem) }}>
                                                {c.diem}/20
                                            </span>
                                        </div>
                                        <p className="pvd-detail-nhanxet">{c.nhanXet}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pvd-modal-actions">
                            <button
                                id="pvd-btn-new"
                                className="pvd-btn-primary"
                                onClick={() => navigate('/sinh-do-an-ai')}
                            >
                                {ketQua?.daDat ? '🎉 Tạo Đồ Án Mới' : '🔄 Thử Lại Với Đồ Án Mới'}
                            </button>
                            <button
                                id="pvd-btn-home"
                                className="pvd-btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STYLES ── */}
            <style>{`
            /* BASE */
            #pvd-root {
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                background: var(--bg-main, #f9fafb);
                color: var(--text-main, #111827);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            /* HEADER */
            .pvd-header {
                position: sticky; top: 0; z-index: 50;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(16px);
                border-bottom: 1px solid var(--border-color, #e5e7eb);
                padding: 0.875rem 1.5rem;
                display: flex; align-items: center; justify-content: space-between;
                gap: 1rem;
            }
            .pvd-header-left { display: flex; align-items: center; gap: 0.875rem; }
            .pvd-ai-avatar {
                width: 42px; height: 42px; border-radius: 12px;

                background: linear-gradient(135deg, #f69050, #e67e22);

                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0; box-shadow: 0 4px 12px rgba(246,144,80,0.35);
            }
            .pvd-title { font-size: 1rem; font-weight: 700; margin: 0; letter-spacing: -0.3px; color: var(--text-main, #111827); }
            .pvd-subtitle {
                font-size: 0.75rem; color: var(--text-muted, #6b7280); margin: 0;
                display: flex; align-items: center; gap: 0.4rem;
            }
            .pvd-live-dot {
                display: inline-block; width: 7px; height: 7px; border-radius: 50%;
                background: var(--success);
                animation: pvdPulse 1.5s ease-in-out infinite;
            }
            @keyframes pvdPulse {
                0%,100% { opacity:1; transform:scale(1); }
                50% { opacity:0.5; transform:scale(0.8); }
            }
            .pvd-header-right { display: flex; align-items: center; gap: 1rem; }
            .pvd-progress-info { display: flex; flex-direction: column; gap: 4px; }
            .pvd-progress-label { font-size: 0.72rem; color: var(--text-muted, #6b7280); font-weight: 600; }
            .pvd-progress-bar {
                width: 120px; height: 5px; background: var(--border-color, #e5e7eb);
                border-radius: 99px; overflow: hidden;
            }
            .pvd-progress-fill {
                height: 100%; border-radius: 99px;

                background: linear-gradient(90deg, #f69050, #e67e22);

                transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
            }
            .pvd-score-badge {
                display: flex; align-items: center; gap: 0.4rem;
                background: rgba(246,144,80,0.1); border: 1px solid rgba(246,144,80,0.25);
                border-radius: 8px; padding: 0.35rem 0.75rem;
                font-weight: 700; font-size: 0.95rem; color: #e67e22;
            }
            .pvd-score-max { font-size: 0.7rem; color: var(--text-muted, #6b7280); font-weight: 400; }
            .pvd-exit-btn {
                display: flex; align-items: center; gap: 0.4rem;
                background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
                color: #ef4444; border-radius: 8px; padding: 0.4rem 0.875rem;
                font-size: 0.8rem; font-weight: 600; cursor: pointer;
                transition: all 0.2s ease;
            }
            .pvd-exit-btn:hover { background: rgba(239,68,68,0.12); }

            /* INTRO BANNER */
            .pvd-intro-banner {
                margin: 1.25rem 1.5rem 0;
                background: rgba(234,179,8,0.06); border: 1px solid rgba(234,179,8,0.2);
                border-radius: 12px; padding: 0.75rem 1rem;
                display: flex; gap: 0.75rem; align-items: flex-start;
                font-size: 0.82rem; color: #b45309; line-height: 1.5;
            }

            /* MAIN / CHAT */
            .pvd-main {
                flex: 1; display: flex; flex-direction: column;
                max-width: 820px; width: 100%; margin: 0 auto;
                padding-bottom: 1rem; box-sizing: border-box;
            }
            .pvd-chat {
                flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem;
                display: flex; flex-direction: column; gap: 1.25rem;
                scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent;
            }

            /* MESSAGES */
            .pvd-msg-row {
                display: flex; align-items: flex-start; gap: 0.75rem;
            }
            .pvd-msg-user { flex-direction: row-reverse; }
            .pvd-avatar-ai, .pvd-avatar-user {
                width: 36px; height: 36px; border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .pvd-avatar-ai {

                background: linear-gradient(135deg, #f69050, #e67e22);
                color: white; box-shadow: 0 4px 12px rgba(246,144,80,0.3);

            }
            .pvd-avatar-user {
                background: var(--bg-main, #f9fafb); border: 1px solid var(--border-color, #e5e7eb);
                color: var(--text-muted, #6b7280);
            }
            .pvd-bubble-wrap { display: flex; flex-direction: column; gap: 0.375rem; max-width: 78%; }
            .pvd-bubble {
                padding: 0.875rem 1.125rem; border-radius: 16px;
                font-size: 0.92rem; line-height: 1.65;
            }
            .pvd-bubble.ai {
                background: white; border: 1px solid var(--border-color, #e5e7eb);
                border-top-left-radius: 4px; color: var(--text-main, #111827);
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .pvd-bubble.user {

                background: linear-gradient(135deg, #f69050, #e67e22);

                border-top-right-radius: 4px; color: white;
                box-shadow: 0 4px 16px rgba(246,144,80,0.3);
            }
            .pvd-bubble p { margin: 0; }
            .pvd-msg-user .pvd-bubble-wrap { align-items: flex-end; }

            /* TYPING */
            .pvd-typing {
                display: flex; gap: 5px; padding: 2px 0;
            }
            .pvd-typing span {
                width: 7px; height: 7px; border-radius: 50%;
                background: #9ca3af;
                animation: pvdBounce 1.3s ease-in-out infinite;
            }
            .pvd-typing span:nth-child(2) { animation-delay: 0.15s; }
            .pvd-typing span:nth-child(3) { animation-delay: 0.3s; }
            @keyframes pvdBounce {
                0%,80%,100% { transform: scale(0.6); opacity:0.5; }
                40% { transform: scale(1); opacity:1; }
            }

            /* SCORE PILL */
            .pvd-score-pill {
                display: inline-flex; align-items: center; gap: 0.3rem;
                font-size: 0.75rem; font-weight: 700;
                background: rgba(0,0,0,0.06); border-radius: 6px;
                padding: 0.2rem 0.5rem; width: fit-content;
            }

            /* INPUT */
            .pvd-input-area {
                padding: 1rem 1.5rem 0;
                border-top: 1px solid var(--border-color, #e5e7eb);
            }
            .pvd-input-wrap {
                display: flex; gap: 0.625rem;
            }
            .pvd-input {
                flex: 1; background: white;
                border: 1px solid var(--border-color, #e5e7eb);
                color: var(--text-main, #111827); border-radius: 12px; padding: 0.875rem 1.125rem;
                font-size: 0.92rem; outline: none; transition: all 0.2s;
                font-family: inherit;
            }
            .pvd-input::placeholder { color: #9ca3af; }
            .pvd-input:focus { border-color: rgba(246,144,80,0.5); background: white; box-shadow: 0 0 0 3px rgba(246,144,80,0.08); }
            .pvd-input:disabled { opacity: 0.5; cursor: not-allowed; }
            .pvd-send-btn {
                width: 50px; height: 50px; border-radius: 12px;

                background: linear-gradient(135deg, #f69050, #e67e22);

                border: none; cursor: pointer; color: white;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s ease; flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(246,144,80,0.35);
            }
            .pvd-send-btn:hover:not(:disabled) { transform: scale(1.05); }
            .pvd-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
            .pvd-input-hint { font-size: 0.75rem; color: var(--text-muted, #6b7280); margin: 0.5rem 0 0; text-align: center; }

            /* SPINNER */
            .pvd-spinner {
                width: 18px; height: 18px; border: 2px solid rgba(246,144,80,0.3);
                border-top-color: #f69050; border-radius: 50%;
                animation: pvdSpin 0.7s linear infinite;
            }
            @keyframes pvdSpin { to { transform: rotate(360deg); } }

            /* FINALIZING */
            .pvd-finalizing {
                display: flex; flex-direction: column; align-items: center;
                gap: 0.75rem; padding: 2rem; color: var(--text-muted, #6b7280);
            }
            .pvd-spinner-lg {

                width: 36px; height: 36px; border: 3px solid var(--border-color, #e5e7eb);
                border-top-color: #f69050; border-radius: 50%;

                animation: pvdSpin 0.8s linear infinite;
            }

            /* OVERLAY */
            .pvd-overlay {
                position: fixed; inset: 0; z-index: 999;
                background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                padding: 1rem;
                animation: pvdFadeIn 0.3s ease;
            }
            @keyframes pvdFadeIn { from { opacity:0; } to { opacity:1; } }

            .pvd-modal {
                background: white; border: 1px solid var(--border-color, #e5e7eb);
                border-radius: 20px; padding: 2rem; max-width: 560px; width: 100%;
                max-height: 85vh; overflow-y: auto;
                animation: pvdSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
                box-shadow: 0 25px 60px rgba(0,0,0,0.12);
            }
            @keyframes pvdSlideUp {
                from { opacity:0; transform:translateY(24px) scale(0.97); }
                to { opacity:1; transform:translateY(0) scale(1); }
            }
            .pvd-result-icon { font-size: 3.5rem; text-align: center; display: block; margin-bottom: 0.5rem; }
            .pvd-result-title {
                font-size: 1.4rem; font-weight: 800; text-align: center; margin: 0 0 0.5rem;
            }
            .pvd-result-title.pass { color: #059669; }
            .pvd-result-title.fail { color: #dc2626; }
            .pvd-result-score {
                text-align: center; font-size: 1.05rem; color: var(--text-muted, #6b7280); margin: 0 0 1.25rem;
            }
            .pvd-result-score strong { color: var(--text-main, #111827); font-size: 1.3rem; }
            .pvd-pass-hint { font-size: 0.8rem; color: var(--text-muted, #6b7280); }

            .pvd-cert-box {
                background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2);
                border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;
                display: flex; flex-direction: column; gap: 0.5rem; align-items: center;
            }
            .pvd-cert-label { font-size: 0.8rem; color: #059669; font-weight: 600; }
            .pvd-cert-code {
                font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;
                color: #047857; letter-spacing: 1px;
            }
            .pvd-cert-copy {
                background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
                color: #059669; border-radius: 6px; padding: 0.3rem 0.75rem;
                font-size: 0.78rem; font-weight: 600; cursor: pointer;
                transition: all 0.2s;
            }
            .pvd-cert-copy:hover { background: rgba(16,185,129,0.18); }

            .pvd-comment-box {
                background: var(--bg-main, #f9fafb); border: 1px solid var(--border-color, #e5e7eb);
                border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;
            }

            .pvd-comment-title { font-size: 0.8rem; font-weight: 700; color: #e67e22; margin: 0 0 0.5rem; }
            .pvd-comment-text { font-size: 0.88rem; color: var(--text-muted, #6b7280); margin: 0; line-height: 1.6; }


            .pvd-detail-section { margin-bottom: 1.5rem; }
            .pvd-detail-title { font-size: 0.8rem; font-weight: 700; color: var(--text-muted, #6b7280); margin: 0 0 0.75rem; }
            .pvd-detail-item {
                padding: 0.625rem; border-radius: 8px;
                background: var(--bg-main, #f9fafb); border: 1px solid var(--border-color, #e5e7eb);
                margin-bottom: 0.5rem;
            }
            .pvd-detail-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
            .pvd-detail-num { font-size: 0.78rem; font-weight: 700; color: var(--text-muted, #6b7280); }
            .pvd-detail-score { font-size: 0.82rem; font-weight: 800; }
            .pvd-detail-nhanxet { font-size: 0.82rem; color: var(--text-muted, #6b7280); margin: 0; line-height: 1.4; }

            .pvd-modal-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
            .pvd-btn-primary {
                flex: 1; background: linear-gradient(135deg, #f69050, #e67e22);

                border: none; color: white; border-radius: 10px; padding: 0.875rem 1rem;
                font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
                font-family: inherit; box-shadow: 0 4px 12px rgba(246,144,80,0.3);
            }
            .pvd-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
            .pvd-btn-secondary {
                flex: 1; background: var(--bg-main, #f9fafb);
                border: 1px solid var(--border-color, #e5e7eb); color: var(--text-muted, #6b7280);
                border-radius: 10px; padding: 0.875rem 1rem;
                font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
                font-family: inherit;
            }
            .pvd-btn-secondary:hover { background: rgba(246,144,80,0.04); color: var(--text-main, #111827); border-color: rgba(246,144,80,0.25); }

            /* SDA Submit CTA styles (injected into SinhDoAnAI parent) */
            .sda-submit-cta {
                margin-top: 1.5rem;
                background: linear-gradient(135deg, rgba(246,144,80,0.08), rgba(217,119,6,0.05));
                border: 1px solid rgba(246,144,80,0.25);
                border-radius: 16px; padding: 1.25rem 1.5rem;
                display: flex; align-items: center; justify-content: space-between;
                gap: 1rem; flex-wrap: wrap;
            }
            .sda-submit-info { display: flex; align-items: flex-start; gap: 0.75rem; flex: 1; min-width: 200px; }
            .sda-submit-icon { font-size: 1.75rem; flex-shrink: 0; }
            .sda-submit-info strong { font-size: 0.92rem; color: var(--text-main, #111827); display: block; margin-bottom: 0.25rem; }
            .sda-submit-info p { font-size: 0.8rem; color: var(--text-muted, #6b7280); margin: 0; line-height: 1.5; }
            .sda-submit-btn {

                background: linear-gradient(135deg, #f69050, #e67e22);

                border: none; color: white; border-radius: 12px;
                padding: 0.875rem 1.5rem; font-size: 0.9rem; font-weight: 700;
                cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                transition: all 0.25s ease; white-space: nowrap;
                box-shadow: 0 4px 20px rgba(246,144,80,0.35); font-family: inherit;
            }
            .sda-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 28px rgba(246,144,80,0.5);
            }
            .sda-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        `}</style>
        </>
    );
};

export default PhongVanDoAn;
