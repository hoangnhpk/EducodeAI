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
    isTyping?: boolean;
    feedback?: {
        level: 'excellent' | 'good' | 'average' | 'poor';
        text: string;
    };
    timestamp: Date;
}

const TypewriterText = ({ content, onComplete, scrollRef }: { content: string, onComplete: () => void, scrollRef: React.RefObject<HTMLDivElement | null> }) => {
    const [displayedText, setDisplayedText] = useState("");
    
    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
            setDisplayedText(content.substring(0, i));
            i++;
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
            if (i > content.length) {
                clearInterval(interval);
                onComplete();
            }
        }, 15);
        return () => clearInterval(interval);
    }, [content]);

    return <span style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</span>;
};

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
    const recognitionRef = useRef<any>(null);
    const baseTextRef = useRef<string>('');

    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isInterviewerTyping, setIsInterviewerTyping] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    
    const [messages, setMessages] = useState<IMessage[]>([]);
    
    const [finalResult, setFinalResult] = useState<{
        diemSo: number;
        danhGiaChung: string;
        diemManh: string[];
        canCaiThien: string[];
        loiKhuyen: string;
    } | null>(null);
    const [interviewFinished, setInterviewFinished] = useState(false);
    const [isLoadingResult, setIsLoadingResult] = useState(false);

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
            if (res && res.maPhongVan) {
                setMaPhongVan(res.maPhongVan);
                setMessages([
                    {
                        id: 'msg-first',
                        role: 'ai',
                        content: res.cauHoiDauTien,
                        timestamp: new Date(),
                        isTyping: true
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
            
            if (res && (res.nhanXetCauTruoc || res.cauHoiTiepTheo)) {
                setIsInterviewerTyping(false);
                setIsSpeaking(true);
                setQuestionCount(c => c + 1);
                
                const data = res;
                const aiResponse: IMessage = {
                    id: 'msg-' + Date.now(),
                    role: 'ai',
                    content: data.nhanXetCauTruoc + (data.cauHoiTiepTheo ? '\n\n' + data.cauHoiTiepTheo : ''),
                    timestamp: new Date(),
                    isTyping: true
                };
                
                setMessages(prev => [...prev, aiResponse]);
                setTimeout(() => setIsSpeaking(false), 5000);
                
                if (data.isFinished) {
                    setInterviewFinished(true);
                }
            }
        } catch (error: any) {
            window.alert('Lỗi: ' + (error.message || 'Lỗi khi gửi câu trả lời.'));
            setIsInterviewerTyping(false);
        }
    };

    const handleEndInterview = async () => {
        if (!maPhongVan) {
            navigate('/');
            return;
        }
        setShowEndModal(false);
        navigate('/');
    };

    const handleGetResult = async () => {
        if (!maPhongVan) return;
        setIsLoadingResult(true);
        try {
            const res = await PhongVanAIService.endInterview(maPhongVan);
            if (res && res.diemSo !== undefined) {
                setFinalResult({
                    diemSo: res.diemSo,
                    danhGiaChung: res.danhGiaChung,
                    diemManh: res.diemManh ?? [],
                    canCaiThien: res.canCaiThien ?? [],
                    loiKhuyen: res.loiKhuyen ?? ''
                });
            }
        } catch (error: any) {
            window.alert('Lỗi: ' + (error.message || 'Lỗi khi lấy kết quả.'));
        } finally {
            setIsLoadingResult(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // --- SPEECH-TO-TEXT (Web Speech API) ---
    const toggleRecording = () => {
        // Đang ghi → dừng lại
        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            window.alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome, Edge hoặc Cốc Cốc.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        // Giữ lại nội dung đang có để nối thêm phần đọc mới vào sau
        baseTextRef.current = inputText ? inputText.trim() + ' ' : '';

        recognition.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';
            for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }
            setInputText(baseTextRef.current + finalText + interimText);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                window.alert('Không thể truy cập micro. Hãy cấp quyền micro cho trang web rồi thử lại.');
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
            recognitionRef.current = null;
            inputRef.current?.focus();
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    // Dừng nhận diện giọng nói khi rời trang / unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    if (setupMode) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>🚀 Thiết lập phỏng vấn AI</h2>
                    <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '32px' }}>Tùy chỉnh thông số phiên phỏng vấn của bạn</p>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Vị trí ứng tuyển</label>
                        <select value={viTri} onChange={e => setViTri(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Fullstack Developer">Fullstack Developer</option>
                            <option value="Mobile Developer">Mobile Developer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Data Engineer">Data Engineer</option>
                            <option value="QA/Tester">QA/Tester</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="Business Analyst">Business Analyst</option>
                            <option value="Project Manager">Project Manager</option>
                        </select>
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
                        <select value={tinhCach.toString()} onChange={e => setTinhCach(parseInt(e.target.value) as TinhCachAI)} style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }}>
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
        const scoreColor = finalResult.diemSo >= 70 ? '#10b981' : finalResult.diemSo >= 50 ? '#f59e0b' : '#ef4444';
        const scoreGradient = finalResult.diemSo >= 70
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : finalResult.diemSo >= 50
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)';
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', background: '#0f172a', padding: '40px 16px', boxSizing: 'border-box' }}>
                <div style={{ width: '100%', maxWidth: '640px' }}>
                    {/* Header điểm số */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <div style={{ width: '90px', height: '90px', background: scoreGradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '34px', color: 'white', fontWeight: 'bold', boxShadow: `0 12px 32px ${scoreColor}55` }}>
                            {finalResult.diemSo}
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Buổi phỏng vấn kết thúc!</h2>
                        <p style={{ color: '#94a3b8', margin: 0 }}>Dưới đây là đánh giá tổng quan từ AI</p>
                    </div>

                    {/* Ô: Nhận xét tổng quan */}
                    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>📝</span>
                            <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 700, margin: 0 }}>Nhận xét tổng quan</h3>
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{finalResult.danhGiaChung}</p>
                    </div>

                    {/* Ô: Điểm mạnh */}
                    {finalResult.diemManh.length > 0 && (
                        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '18px' }}>✅</span>
                                <h3 style={{ color: '#34d399', fontSize: '15px', fontWeight: 700, margin: 0 }}>Điểm mạnh / Những thứ đã làm được</h3>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {finalResult.diemManh.map((item, i) => (
                                    <li key={i} style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Ô: Cần cải thiện */}
                    {finalResult.canCaiThien.length > 0 && (
                        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '18px' }}>⚠️</span>
                                <h3 style={{ color: '#fbbf24', fontSize: '15px', fontWeight: 700, margin: 0 }}>Những thứ cần cải thiện</h3>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {finalResult.canCaiThien.map((item, i) => (
                                    <li key={i} style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Ô: Lời khuyên */}
                    {finalResult.loiKhuyen && (
                        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px', padding: '20px 22px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '18px' }}>💡</span>
                                <h3 style={{ color: '#a5b4fc', fontSize: '15px', fontWeight: 700, margin: 0 }}>Lời khuyên cho bạn</h3>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{finalResult.loiKhuyen}</p>
                        </div>
                    )}

                    <button onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
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
                                    <div className="iv-cam-name">
                                        <strong>{INTERVIEWER.name}</strong>
                                        <small>{INTERVIEWER.title} · Tính cách: {tinhCach === TinhCachAI.Friendly ? 'Thân thiện' : tinhCach === TinhCachAI.Strict ? 'Khó tính' : 'Bình thường'}</small>
                                    </div>
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
                                </div>
                            </div>
                        </div>

                        {/* Self "Camera" Card */}
                        <div className={`iv-self-cam ${isRecording ? 'recording' : ''}`}>
                            <div className="iv-self-inner">
                                {isRecording && <div className="iv-rec-ring" />}
                                <div className="iv-self-avatar">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                            </div>
                            <div className="iv-self-label">
                                <div className={`iv-self-dot ${isRecording ? 'active' : ''}`} />
                                Bạn {isRecording ? '(Đang nói...)' : ''}
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
                                        {msg.role === 'user' && (
                                            <div className="iv-msg-avatar user">BẠN</div>
                                        )}
                                        <div className="iv-msg-bubble-wrap">
                                            <div className="iv-msg-info">
                                                <span className="iv-msg-name">{msg.role === 'ai' ? INTERVIEWER.name : 'Bạn'}</span>
                                                <span className="iv-msg-time">{msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="iv-msg-content">
                                                {msg.isTyping ? (
                                                    <TypewriterText 
                                                        content={msg.content} 
                                                        scrollRef={chatBoxRef}
                                                        onComplete={() => {
                                                            setMessages(prev => prev.map(m => m.id === msg.id ? {...m, isTyping: false} : m));
                                                            setIsSpeaking(false);
                                                        }} 
                                                    />
                                                ) : (
                                                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                                                )}
                                            </div>
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
                            
                            {/* Input hoặc nút kết thúc */}
                            {interviewFinished ? (
                                <div className="iv-finished-area">
                                    <div className="iv-finished-msg">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                        Buổi phỏng vấn đã hoàn thành!
                                    </div>
                                    <div className="iv-finished-actions">
                                        <button className="iv-btn-end" onClick={() => navigate('/')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            Kết thúc
                                        </button>
                                        <button className="iv-btn-result" onClick={handleGetResult} disabled={isLoadingResult}>
                                            {isLoadingResult ? (
                                                <>
                                                    <span className="iv-dot-bounce"><span/><span/><span/></span>
                                                    AI đang chấm điểm...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                                    Nhận kết quả
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="iv-chat-input-area">
                                    <div className="iv-input-wrapper">
                                        <textarea 
                                            className="iv-textarea"
                                            ref={inputRef}
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập câu trả lời của bạn (hoặc dùng mic)..."
                                            rows={1}
                                            disabled={isInterviewerTyping || isSpeaking}
                                        />
                                        <button
                                            className={`iv-btn-mic ${isRecording ? 'recording active' : ''}`}
                                            onClick={toggleRecording}
                                            disabled={(isInterviewerTyping || isSpeaking) && !isRecording}
                                            title={isRecording ? 'Dừng ghi âm' : 'Nói để nhập câu trả lời'}
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
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* END MODAL - khi nhấn nút "Kết thúc" trên header */}
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
                    width: 380px;
                    flex-shrink: 0;
                    overflow: hidden;
                    border-right: 1px solid rgba(255,255,255,0.06);
                }

                /* ── INTERVIEWER CAM CARD ── */
                .iv-cam-card {
                    flex: 1;
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
                    align-items: center;
                    justify-content: space-between;
                }
                .iv-cam-name {
                    display: flex; flex-direction: column;
                }
                .iv-cam-name strong { font-size: 15px; font-weight: 700; color: white; }
                .iv-cam-name small { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }

                /* Status Badges */
                .iv-speaking-badge, .iv-thinking-badge, .iv-idle-badge { white-space: nowrap; }
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
                .iv-chat-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    height: 100%;
                    overflow: hidden;
                }
                .iv-chat-header {
                    margin-bottom: 16px;
                }
                .iv-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding-right: 10px;
                }
                .iv-chat-messages::-webkit-scrollbar { width: 6px; }
                .iv-chat-messages::-webkit-scrollbar-track { background: transparent; }
                .iv-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                .iv-chat-input-area {
                    margin-top: 16px;
                    flex-shrink: 0;
                }

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
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #0a0d14;
                    overflow: hidden;
                    padding: 20px;
                    gap: 16px;
                }
                #interview-right::-webkit-scrollbar { width: 0; }

                /* Self-Cam */
                .iv-self-cam {
                    flex: 1;
                    overflow: hidden;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    background: linear-gradient(135deg, #0f172a, #1e293b);
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
                .iv-input-wrapper {
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                    width: 100%;
                }
                .iv-textarea {
                    flex: 1;
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
                    flex-shrink: 0;
                    width: 44px; height: 44px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #6366f1, #7c3aed);
                    border: none;
                    color: white;
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

                /* ── FINISHED AREA ── */
                .iv-finished-area {
                    flex-shrink: 0;
                    margin-top: 16px;
                    padding: 20px;
                    border-radius: 16px;
                    background: rgba(52, 211, 153, 0.05);
                    border: 1px solid rgba(52, 211, 153, 0.15);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    animation: fadeUp 0.4s ease;
                }
                .iv-finished-msg {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    color: #34d399;
                }
                .iv-finished-actions {
                    display: flex;
                    gap: 12px;
                }
                .iv-btn-end {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .iv-btn-end:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #f87171;
                }
                .iv-btn-result {
                    flex: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .iv-btn-result:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
                }
                .iv-btn-result:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* ── RESULT MODAL ── */
                .iv-result-modal {
                    max-width: 500px !important;
                }
                .iv-result-score-wrap {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .iv-result-score-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
                    border: 3px solid #6366f1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    animation: scoreIn 0.5s ease;
                }
                @keyframes scoreIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .iv-result-score-num {
                    font-size: 32px;
                    font-weight: 800;
                    color: #a5b4fc;
                    line-height: 1;
                }
                .iv-result-score-label {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 600;
                }
                .iv-result-review {
                    text-align: left;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                    max-height: 250px;
                    overflow-y: auto;
                    font-size: 13.5px;
                    line-height: 1.7;
                    color: #cbd5e1;
                }
                .iv-result-review::-webkit-scrollbar { width: 4px; }
                .iv-result-review::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </>
    );
};

export default PhongVanAI;
