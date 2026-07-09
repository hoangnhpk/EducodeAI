const fs = require('fs');
const path = require('path');

const bakPath = path.join(__dirname, 'src/pages/hoc-vien/phong-van-ai/PhongVanAI.tsx.bak');
const outPath = path.join(__dirname, 'src/pages/hoc-vien/phong-van-ai/PhongVanAI.tsx');

const content = fs.readFileSync(bakPath, 'utf8');
const styleStartIndex = content.indexOf('<style>{`');

if (styleStartIndex === -1) {
    console.error("Could not find <style>");
    process.exit(1);
}

const stylesAndEnd = content.substring(styleStartIndex);

const newLogic = `import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import {
    PhongVanAIService,
    StartPhongVanRequest,
    TinhCachAI
} from '../../../services/phong-van-ai.service';
import { CheckCircleOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

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
    const [soLuongCauHoi, setSoLuongCauHoi] = useState(3);
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
        return \`\${m}:\${sec}\`;
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
            notification.error({ message: 'Lỗi', description: error.message || 'Không thể bắt đầu phiên phỏng vấn.' });
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
                    content: data.nhanXetCauTruoc + (data.cauHoiTiepTheo ? '\\n\\n' + data.cauHoiTiepTheo : ''),
                    timestamp: new Date(),
                };
                
                setMessages(prev => [...prev, aiResponse]);
                setTimeout(() => setIsSpeaking(false), 5000);
                
                if (data.isFinished) {
                    setTimeout(() => setShowEndModal(true), 6000);
                }
            }
        } catch (error: any) {
            notification.error({ message: 'Lỗi', description: error.message || 'Lỗi khi gửi câu trả lời.' });
            setIsInterviewerTyping(false);
        }
    };

    const handleEndInterview = async () => {
        if (!maPhongVan) {
            navigate('/hoc-vien/phong-van-ai-history');
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
            notification.error({ message: 'Lỗi', description: error.message || 'Lỗi khi kết thúc phỏng vấn.' });
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
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Số lượng câu hỏi</label>
                        <input type="number" min="1" max="20" value={soLuongCauHoi} onChange={e => setSoLuongCauHoi(parseInt(e.target.value) || 3)} style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} />
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
                        <div className={\`iv-cam-card \${isSpeaking ? 'is-speaking' : ''}\`}>
                            <div className="iv-cam-bg">
                                <div className="iv-blob iv-blob-1" />
                                <div className="iv-blob iv-blob-2" />
                                <div className={\`iv-avatar-wrap \${isSpeaking ? 'speaking' : ''}\`}>
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
                                    <div key={msg.id} className={\`iv-msg-row \${msg.role === 'user' ? 'iv-msg-user' : 'iv-msg-ai'}\`}>
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
                                        className={\`iv-btn-mic \${isRecording ? 'recording' : ''}\`} 
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

`;

fs.writeFileSync(outPath, newLogic + stylesAndEnd);
console.log("Successfully rewrote PhongVanAI.tsx!");
