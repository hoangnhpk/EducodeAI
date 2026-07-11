import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StartPhongVanRequest } from '../../../services/phong-van-ai.service';
import {
    PhongVanAIService,
    TinhCachAI
} from '../../../services/phong-van-ai.service';

interface IMessage {
    id: string;
    role: 'ai' | 'user';
    content: string;
    feedback?: {
        level: 'excellent' | 'good' | 'average' | 'poor';
        text: string;
    };
    timestamp: Date;
}

const INTERVIEWER = {
    name: 'EduCode AI',
    title: 'Senior Technical Lead',
    company: 'EduCode Technologies',
    initials: 'AI',
};

const PhongVanAI: React.FC = () => {
    const navigate = useNavigate();
    
    // --- SETUP STATE ---
    const [setupMode, setSetupMode] = useState(true);
    const [viTri, setViTri] = useState('Backend Developer');
    const [capDo, setCapDo] = useState('Junior');
    const [tinhCach, setTinhCach] = useState<TinhCachAI>(TinhCachAI.Normal);
    const [soLuongCauHoi] = useState(3);
    const [isStarting, setIsStarting] = useState(false);
    
    // --- INTERVIEW STATE ---
    const [maPhongVan, setMaPhongVan] = useState<number | null>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isInterviewerTyping, setIsInterviewerTyping] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    
    const [messages, setMessages] = useState<IMessage[]>([]);
    
    const [finalResult, setFinalResult] = useState<{diemSo: number, danhGiaChung: string} | null>(null);

    // Timer
    useEffect(() => {
        let timer: any;
        if (!setupMode && !showEndModal && !finalResult) {
            timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [setupMode, showEndModal, finalResult]);

    // Auto-scroll
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const handleStart = async () => {
        setIsStarting(true);
        try {
            const req: StartPhongVanRequest = {
                viTriUngTuyen: viTri,
                capDo,
                tinhCachAI: tinhCach,
                soLuongCauHoi
            };
            const res = await PhongVanAIService.startInterview(req);
            if (res && res.data) {
                setMaPhongVan(res.data.maPhongVan);
                setMessages([
                    {
                        id: 'msg-first',
                        role: 'ai',
                        content: res.data.cauHoiDauTien,
                        timestamp: new Date()
                    }
                ]);
                setSetupMode(false);
                setIsSpeaking(true);
                setTimeout(() => setIsSpeaking(false), 4000);
            }
        } catch (error: any) {
            window.alert('Lỗi: ' + (error.message || 'Không thể bắt đầu phiên phỏng vấn.'));
        } finally {
            setIsStarting(false);
        }
    };

    const handleSendMessage = async () => {
        const trimmed = inputText.trim();
        if (!trimmed) return;
        if (!maPhongVan) return;

        const newUserMsg: IMessage = {
            id: 'msg-' + Date.now(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsInterviewerTyping(true);
        setIsSpeaking(false);

        try {
            const res = await PhongVanAIService.answerQuestion({
                maPhongVan,
                cauTraLoi: trimmed
            });
            
            if (res && res.data) {
                setIsInterviewerTyping(false);
                setIsSpeaking(true);
                setQuestionCount(c => c + 1);
                
                const data = res.data;
                const aiResponse: IMessage = {
                    id: 'msg-' + Date.now(),
                    role: 'ai',
                    content: data.nhanXetCauTruoc + (data.cauHoiTiepTheo ? '\n\n' + data.cauHoiTiepTheo : ''),
                    timestamp: new Date(),
                };
                
                setMessages(prev => [...prev, aiResponse]);
                setTimeout(() => setIsSpeaking(false), 5000);
                
                if (data.isFinished) {
                    setTimeout(() => setShowEndModal(true), 6000);
                }
            }
        } catch (error: any) {
            window.alert('Lỗi: ' + (error.message || 'Lỗi khi gửi câu trả lời.'));
            setIsInterviewerTyping(false);
        }
    };

    const handleEndInterview = async () => {
        if (!maPhongVan) {
            navigate('/hoc-vien/');
            return;
        }
        setShowEndModal(false);
        setIsInterviewerTyping(true);
        try {
            const res = await PhongVanAIService.endInterview(maPhongVan);
            if (res && res.data) {
                setFinalResult({
                    diemSo: res.data.diemSo,
                    danhGiaChung: res.data.danhGiaChung
                });
            }
        } catch (error: any) {
            window.alert('Lỗi: ' + (error.message || 'Lỗi khi kết thúc phỏng vấn.'));
        } finally {
            setIsInterviewerTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (setupMode) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>🚀 Thiết lập phỏng vấn AI</h2>
                    <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '32px' }}>Tùy chỉnh thông số phiên phỏng vấn của bạn</p>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Vị trí ứng tuyển</label>
                        <input type="text" value={viTri} onChange={e => setViTri(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} placeholder="VD: Backend Developer" />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Cấp độ</label>
                        <select value={capDo} onChange={e => setCapDo(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                            <option value="Intern">Intern</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Junior">Junior</option>
                            <option value="Mid-level">Mid-level</option>
                            <option value="Senior">Senior</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Tính cách AI</label>
                        <select value={tinhCach.toString()} onChange={e => setTinhCach(parseInt(e.target.value))} style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                            <option value={TinhCachAI.Friendly}>Thân thiện (Hướng dẫn)</option>
                            <option value={TinhCachAI.Normal}>Bình thường (Tiêu chuẩn)</option>
                            <option value={TinhCachAI.Strict}>Khó tính (Xoáy sâu vào lỗi sai)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Số lượng câu hỏi (Tạm khóa mặc định)</label>
                        <input type="number" value={3} disabled style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#64748b', outline: 'none', cursor: 'not-allowed' }} />
                    </div>

                    <button onClick={handleStart} disabled={isStarting} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isStarting ? 'not-allowed' : 'pointer', opacity: isStarting ? 0.7 : 1 }}>
                        {isStarting ? 'Đang khởi tạo...' : 'Bắt Đầu Phỏng Vấn'}
                    </button>
                </div>
            </div>
        );
    }

    if (finalResult) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px', color: 'white', fontWeight: 'bold' }}>
                            {finalResult.diemSo}
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Buổi phỏng vấn kết thúc!</h2>
                        <p style={{ color: '#94a3b8' }}>Dưới đây là đánh giá tổng quan từ AI</p>
                    </div>
                    
                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', color: '#e2e8f0', lineHeight: '1.6', marginBottom: '30px', whiteSpace: 'pre-wrap' }}>
                        {finalResult.danhGiaChung}
                    </div>

                    <button onClick={() => navigate('/hoc-vien/')} style={{ width: '100%', padding: '14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                        Trở về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div id="interview-room-root">
                {/* ─── TOP BAR ─── */}
                <header id="interview-header">
                    <div className="iv-header-left">
                        <div className="iv-logo-dot" />
                        <div>
                            <span className="iv-header-title">Phỏng Vấn Kỹ Thuật AI</span>
                            <span className="iv-header-sub">Vị trí: {viTri} · Cấp độ: {capDo} · Câu hỏi {questionCount}/{soLuongCauHoi}</span>
                        </div>
                    </div>
                    <div className="iv-header-center">
                        <span className="iv-timer">
                            <span className="iv-timer-dot" />
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                    <div className="iv-header-right">
                        <button className="iv-btn-end" onClick={() => setShowEndModal(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            Kết thúc
                        </button>
                    </div>
                </header>

                {/* ─── MAIN CONTENT ─── */}
                <main id="interview-main">
                    {/* LEFT: Interviewer Video + Chat */}
                    <div id="interview-left">
                        {/* Interviewer "Camera" Card */}
                        <div className={`iv-cam-card ${isSpeaking ? 'is-speaking' : ''}`}>
                            <div className="iv-cam-bg">
                                <div className="iv-blob iv-blob-1" />
                                <div className="iv-blob iv-blob-2" />
                                <div className={`iv-avatar-wrap ${isSpeaking ? 'speaking' : ''}`}>
                                    <div className="iv-avatar-ring" />
                                    <div className="iv-avatar-ring iv-ring-2" />
                                    <div className="iv-avatar">
                                        <span>{INTERVIEWER.initials}</span>
                                    </div>
                                </div>
                                <div className="iv-cam-info">
                                    <div className="iv-cam-status">
                                        {isSpeaking ? (
                                            <span className="iv-speaking-badge">
                                                <span className="iv-eq"><span/><span/><span/><span/></span>
                                                Đang nói
                                            </span>
                                        ) : isInterviewerTyping ? (
                                            <span className="iv-thinking-badge">
                                                <span className="iv-dot-bounce"><span/><span/><span/></span>
                                                Đang suy nghĩ...
                                            </span>
                                        ) : (
                                            <span className="iv-idle-badge">Đang lắng nghe</span>
                                        )}
                                    </div>
                                    <div className="iv-cam-name">
                                        <strong>{INTERVIEWER.name}</strong>
                                        <small>{INTERVIEWER.title} · Tính cách: {tinhCach === TinhCachAI.Friendly ? 'Thân thiện' : tinhCach === TinhCachAI.Strict ? 'Khó tính' : 'Bình thường'}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Chat & Transcript */}
                    <div id="interview-right">
                        <div className="iv-chat-container">
                            <div className="iv-chat-header">
                                <div className="iv-ch-title">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    Bản ghi trao đổi
                                </div>
                            </div>
                            <div className="iv-chat-messages" ref={chatBoxRef}>
                                {messages.map(msg => (
                                    <div key={msg.id} className={`iv-msg-row ${msg.role === 'user' ? 'iv-msg-user' : 'iv-msg-ai'}`}>
                                        {msg.role === 'ai' && (
                                            <div className="iv-msg-avatar ai">{INTERVIEWER.initials}</div>
                                        )}
                                        <div className="iv-msg-bubble-wrap">
                                            <div className="iv-msg-info">
                                                <span className="iv-msg-name">{msg.role === 'ai' ? INTERVIEWER.name : 'Bạn'}</span>
                                                <span className="iv-msg-time">{msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="iv-msg-content">{msg.content}</div>
                                        </div>
                                    </div>
                                ))}
                                {isInterviewerTyping && (
                                    <div className="iv-msg-row iv-msg-ai">
                                        <div className="iv-msg-avatar ai">{INTERVIEWER.initials}</div>
                                        <div className="iv-msg-bubble-wrap">
                                            <div className="iv-msg-content typing">
                                                <div className="iv-typing-dot"></div>
                                                <div className="iv-typing-dot"></div>
                                                <div className="iv-typing-dot"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="iv-chat-input-area">
                                <div className="iv-input-wrapper">
                                    <textarea 
                                        ref={inputRef}
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Nhập câu trả lời của bạn (hoặc dùng mic)..."
                                        rows={1}
                                        disabled={isInterviewerTyping || isSpeaking}
                                    />
                                    <button 
                                        className={`iv-btn-mic ${isRecording ? 'recording' : ''}`} 
                                        onClick={() => setIsRecording(!isRecording)}
                                        disabled={isInterviewerTyping || isSpeaking}
                                    >
                                        {isRecording ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                                        )}
                                    </button>
                                    <button 
                                        className="iv-btn-send" 
                                        onClick={handleSendMessage}
                                        disabled={!inputText.trim() || isInterviewerTyping || isSpeaking}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* END MODAL */}
            {showEndModal && (
                <div className="iv-modal-overlay">
                    <div className="iv-modal">
                        <div className="iv-modal-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </div>
                        <h3>Kết thúc phỏng vấn?</h3>
                        <p>Bạn có chắc chắn muốn kết thúc buổi phỏng vấn sớm? AI sẽ tổng hợp điểm dựa trên những câu hỏi đã hoàn thành.</p>
                        <div className="iv-modal-actions">
                            <button className="iv-modal-btn cancel" onClick={() => setShowEndModal(false)}>Tiếp tục phỏng vấn</button>
                            <button className="iv-modal-btn confirm" onClick={handleEndInterview}>Kết thúc ngay</button>
                        </div>
                    </div>
                </div>
            )}

<style>{`
                /* ── RESET & BASE ── */
                #interview-room-root {
                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                    background: #0a0d14;
                    color: #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                /* ── HEADER ── */
                #interview-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    height: 60px;
                    background: rgba(15, 20, 35, 0.95);
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    flex-shrink: 0;
                    backdrop-filter: blur(12px);
                    z-index: 10;
                }
                .iv-header-left { display: flex; align-items: center; gap: 12px; }
                .iv-logo-dot {
                    width: 10px; height: 10px;
                    background: #6366f1;
                    border-radius: 50%;
                    box-shadow: 0 0 12px #6366f1;
                }
                .iv-header-title { font-size: 15px; font-weight: 700; display: block; color: #f1f5f9; }
                .iv-header-sub { font-size: 11px; color: #64748b; display: block; margin-top: 1px; }
                .iv-header-center {}
                .iv-timer {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 13px; font-weight: 600;
                    color: #94a3b8;
                    background: rgba(255,255,255,0.05);
                    padding: 6px 14px; border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .iv-timer-dot {
                    width: 7px; height: 7px;
                    background: #ef4444;
                    border-radius: 50%;
                    animation: pulse-red 1.5s infinite;
                }
                @keyframes pulse-red {
                    0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
                    50% { opacity: 0.6; box-shadow: 0 0 0 5px rgba(239,68,68,0); }
                }
                .iv-header-right {}
                .iv-btn-end {
                    display: flex; align-items: center; gap: 7px;
                    padding: 8px 18px; border-radius: 8px;
                    background: rgba(239,68,68,0.12);
                    color: #f87171;
                    border: 1px solid rgba(239,68,68,0.3);
                    font-size: 13px; font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .iv-btn-end:hover { background: rgba(239,68,68,0.25); color: #fca5a5; }

                /* ── MAIN LAYOUT ── */
                #interview-main {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                    gap: 0;
                }

                /* ── LEFT PANEL ── */
                #interview-left {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    overflow: hidden;
                    border-right: 1px solid rgba(255,255,255,0.06);
                }

                /* ── INTERVIEWER CAM CARD ── */
                .iv-cam-card {
                    flex-shrink: 0;
                    height: 280px;
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    transition: box-shadow 0.4s;
                }
                .iv-cam-card.is-speaking {
                    box-shadow: inset 0 0 0 2px rgba(99,102,241,0.5);
                }
                .iv-cam-bg {
                    width: 100%; height: 100%;
                    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                /* Ambient Blobs */
                .iv-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    opacity: 0.15;
                    pointer-events: none;
                }
                .iv-blob-1 {
                    width: 300px; height: 300px;
                    background: #6366f1;
                    top: -100px; left: -100px;
                    animation: float1 8s ease-in-out infinite;
                }
                .iv-blob-2 {
                    width: 200px; height: 200px;
                    background: #8b5cf6;
                    bottom: -60px; right: -40px;
                    animation: float2 10s ease-in-out infinite;
                }
                @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, 20px) scale(1.1); } }
                @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, -15px) scale(1.08); } }

                /* Avatar */
                .iv-avatar-wrap {
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                    z-index: 2;
                }
                .iv-avatar-ring {
                    position: absolute;
                    width: 120px; height: 120px;
                    border-radius: 50%;
                    border: 2px solid rgba(99,102,241,0.3);
                    animation: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .iv-avatar-ring.iv-ring-2 {
                    width: 145px; height: 145px;
                    border-color: rgba(99,102,241,0.15);
                }
                .iv-avatar-wrap.speaking .iv-avatar-ring {
                    opacity: 1;
                    animation: ring-pulse 1.8s ease-in-out infinite;
                }
                .iv-avatar-wrap.speaking .iv-avatar-ring.iv-ring-2 {
                    animation: ring-pulse 1.8s ease-in-out infinite 0.4s;
                }
                @keyframes ring-pulse {
                    0%,100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.08); opacity: 0.2; }
                }
                .iv-avatar {
                    width: 96px; height: 96px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; font-weight: 800; color: white;
                    border: 3px solid rgba(255,255,255,0.15);
                    box-shadow: 0 8px 32px rgba(99,102,241,0.4);
                    position: relative; z-index: 1;
                }

                /* Info Overlay */
                .iv-cam-info {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    padding: 16px 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                }
                .iv-cam-name {
                    display: flex; flex-direction: column;
                }
                .iv-cam-name strong { font-size: 15px; font-weight: 700; color: white; }
                .iv-cam-name small { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }

                /* Status Badges */
                .iv-speaking-badge {
                    display: flex; align-items: center; gap: 8px;
                    background: rgba(99,102,241,0.25);
                    border: 1px solid rgba(99,102,241,0.5);
                    color: #a5b4fc;
                    padding: 5px 12px; border-radius: 20px;
                    font-size: 12px; font-weight: 600;
                    backdrop-filter: blur(8px);
                }
                .iv-thinking-badge {
                    display: flex; align-items: center; gap: 8px;
                    background: rgba(245,158,11,0.15);
                    border: 1px solid rgba(245,158,11,0.3);
                    color: #fbbf24;
                    padding: 5px 12px; border-radius: 20px;
                    font-size: 12px; font-weight: 600;
                    backdrop-filter: blur(8px);
                }
                .iv-idle-badge {
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: rgba(255,255,255,0.5);
                    padding: 5px 12px; border-radius: 20px;
                    font-size: 12px; font-weight: 500;
                    backdrop-filter: blur(8px);
                }

                /* Equalizer (speaking animation) */
                .iv-eq { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
                .iv-eq span {
                    width: 3px; background: #a5b4fc; border-radius: 2px;
                    animation: eq 0.8s ease-in-out infinite;
                }
                .iv-eq span:nth-child(1) { height: 6px; animation-delay: 0s; }
                .iv-eq span:nth-child(2) { height: 12px; animation-delay: 0.15s; }
                .iv-eq span:nth-child(3) { height: 8px; animation-delay: 0.3s; }
                .iv-eq span:nth-child(4) { height: 14px; animation-delay: 0.1s; }
                @keyframes eq {
                    0%,100% { transform: scaleY(0.4); }
                    50% { transform: scaleY(1); }
                }

                /* Thinking dots */
                .iv-dot-bounce { display: flex; align-items: center; gap: 3px; }
                .iv-dot-bounce span {
                    width: 5px; height: 5px;
                    background: #fbbf24; border-radius: 50%;
                    animation: db 1.2s ease-in-out infinite;
                }
                .iv-dot-bounce span:nth-child(2) { animation-delay: 0.2s; }
                .iv-dot-bounce span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes db {
                    0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }

                /* ── TRANSCRIPT ── */
                #iv-transcript-box {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: #0d1017;
                }
                #iv-transcript-box::-webkit-scrollbar { width: 6px; }
                #iv-transcript-box::-webkit-scrollbar-track { background: transparent; }
                #iv-transcript-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                .iv-msg-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    animation: fadeUp 0.3s ease;
                }
                .iv-msg-row.user { flex-direction: row-reverse; }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .iv-msg-avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700;
                    flex-shrink: 0;
                }
                .iv-msg-avatar.ai {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                }
                .iv-msg-avatar.user {
                    background: linear-gradient(135deg, #0f766e, #0d9488);
                    color: white;
                    font-size: 9px;
                }

                .iv-msg-group { display: flex; flex-direction: column; gap: 4px; max-width: 82%; }
                .iv-msg-row.user .iv-msg-group { align-items: flex-end; }

                .iv-msg-meta {
                    font-size: 11px; font-weight: 600;
                    color: #64748b;
                    display: flex; align-items: center; gap: 8px;
                }
                .iv-msg-time { font-weight: 400; color: #475569; }

                .iv-msg-bubble {
                    padding: 12px 16px;
                    border-radius: 16px;
                    font-size: 14px;
                    line-height: 1.65;
                    max-width: 100%;
                }
                .iv-msg-bubble.ai {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #e2e8f0;
                    border-top-left-radius: 4px;
                }
                .iv-msg-bubble.user {
                    background: linear-gradient(135deg, #1e3a5f, #1e40af);
                    border: 1px solid rgba(59,130,246,0.3);
                    color: #dbeafe;
                    border-top-right-radius: 4px;
                }
                .iv-typing-bubble {
                    display: flex; align-items: center; gap: 6px;
                    padding: 16px;
                    min-width: 56px;
                }
                .iv-typing-bubble span {
                    width: 7px; height: 7px;
                    background: #64748b; border-radius: 50%;
                    animation: db 1.2s ease-in-out infinite;
                }
                .iv-typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
                .iv-typing-bubble span:nth-child(3) { animation-delay: 0.4s; }

                /* Feedback */
                .iv-feedback {
                    display: flex; align-items: flex-start; gap: 8px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    background: var(--fb-bg);
                    border: 1px solid color-mix(in srgb, var(--fb-color) 30%, transparent);
                    margin-top: 4px;
                    max-width: 100%;
                }
                .iv-fb-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
                .iv-fb-label {
                    font-size: 12px; font-weight: 700;
                    color: var(--fb-color);
                    display: block; margin-bottom: 2px;
                }
                .iv-fb-text { font-size: 12px; color: #94a3b8; display: block; }

                /* ── RIGHT PANEL ── */
                #interview-right {
                    width: 340px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    background: #0a0d14;
                    overflow-y: auto;
                    padding: 20px;
                    gap: 16px;
                }
                #interview-right::-webkit-scrollbar { width: 0; }

                /* Self-Cam */
                .iv-self-cam {
                    border-radius: 16px;
                    overflow: hidden;
                    border: 2px solid rgba(255,255,255,0.07);
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    height: 180px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: border-color 0.3s;
                }
                .iv-self-cam.recording {
                    border-color: rgba(239,68,68,0.5);
                    box-shadow: 0 0 20px rgba(239,68,68,0.1);
                }
                .iv-self-inner { position: relative; }
                .iv-self-avatar {
                    width: 64px; height: 64px; border-radius: 50%;
                    background: rgba(255,255,255,0.07);
                    border: 2px solid rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    color: #64748b;
                }
                .iv-rec-ring {
                    position: absolute; inset: -6px;
                    border-radius: 50%;
                    border: 2px solid #ef4444;
                    animation: rec-ring 1.2s ease-out infinite;
                }
                @keyframes rec-ring {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                .iv-self-label {
                    font-size: 12px; color: #64748b;
                    display: flex; align-items: center; gap: 6px;
                }
                .iv-self-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #475569;
                    transition: background 0.3s;
                }
                .iv-self-dot.active { background: #ef4444; animation: pulse-red 1.5s infinite; }

                /* Info Panel */
                .iv-info-panel {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px;
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .iv-info-row {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 13px; color: #64748b;
                }
                .iv-info-row strong { color: #cbd5e1; }
                .text-ok { color: #34d399 !important; }

                /* Divider */
                .iv-divider {
                    display: flex; align-items: center; gap: 10px;
                    color: #475569; font-size: 11px; font-weight: 600;
                    text-transform: uppercase; letter-spacing: 0.08em;
                }
                .iv-divider::before, .iv-divider::after {
                    content: ''; flex: 1;
                    height: 1px; background: rgba(255,255,255,0.07);
                }

                /* Input Area */
                .iv-input-area { display: flex; flex-direction: column; gap: 12px; }
                .iv-textarea {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 14px;
                    color: #e2e8f0;
                    font-size: 13.5px;
                    line-height: 1.6;
                    padding: 14px 16px;
                    resize: none;
                    font-family: inherit;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .iv-textarea::placeholder { color: #475569; }
                .iv-textarea:focus {
                    outline: none;
                    border-color: rgba(99,102,241,0.5);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .iv-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

                .iv-actions { display: flex; gap: 10px; }
                .iv-btn-mic {
                    display: flex; align-items: center; gap: 7px;
                    padding: 10px 14px; border-radius: 10px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8;
                    font-size: 13px; font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .iv-btn-mic:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
                .iv-btn-mic.active {
                    background: rgba(239,68,68,0.15);
                    border-color: rgba(239,68,68,0.4);
                    color: #f87171;
                    animation: pulse-mic 1.5s infinite;
                }
                @keyframes pulse-mic {
                    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
                    50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
                }
                .iv-btn-send {
                    flex: 1;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 10px 16px; border-radius: 10px;
                    background: linear-gradient(135deg, #6366f1, #7c3aed);
                    border: none;
                    color: white;
                    font-size: 13px; font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .iv-btn-send:hover:not(:disabled) { 
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(99,102,241,0.4);
                }
                .iv-btn-send:disabled { opacity: 0.4; cursor: not-allowed; }

                .iv-hint {
                    text-align: center;
                    font-size: 11px;
                    color: #475569;
                    margin: 0;
                }
                .iv-hint kbd {
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 4px;
                    padding: 1px 5px;
                    font-size: 10px;
                    font-family: inherit;
                    color: #94a3b8;
                }

                /* ── MODAL ── */
                .iv-modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.75);
                    backdrop-filter: blur(6px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .iv-modal {
                    background: #1e293b;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    padding: 32px;
                    max-width: 380px;
                    width: 90%;
                    text-align: center;
                    animation: slideUp 0.25s ease;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.5);
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .iv-modal-icon {
                    width: 64px; height: 64px; border-radius: 50%;
                    background: rgba(239,68,68,0.1);
                    border: 2px solid rgba(239,68,68,0.3);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px;
                }
                .iv-modal h3 { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
                .iv-modal p { font-size: 13.5px; color: #94a3b8; margin: 0 0 24px; line-height: 1.6; }
                .iv-modal-actions { display: flex; gap: 10px; }
                .iv-modal-btn {
                    flex: 1; padding: 11px; border-radius: 10px;
                    font-size: 14px; font-weight: 600;
                    cursor: pointer; border: none;
                    transition: all 0.2s;
                }
                .iv-modal-btn.cancel {
                    background: rgba(255,255,255,0.06);
                    color: #cbd5e1;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .iv-modal-btn.cancel:hover { background: rgba(255,255,255,0.1); }
                .iv-modal-btn.confirm {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white;
                }
                .iv-modal-btn.confirm:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(220,38,38,0.4); }
            `}</style>
        </>
    );
};

export default PhongVanAI;
