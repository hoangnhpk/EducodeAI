import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface IMessage {
    id: string;
    role: 'ai' | 'user';
    content: string;
    isTyping?: boolean;
    feedback?: {
        level: string;
        text: string;
    };
}

const PhongVanAI: React.FC = () => {
    const navigate = useNavigate();
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([
        {
            id: 'msg-1',
            role: 'ai',
            content: 'Chào em, anh là Technical Lead của dự án. Để bắt đầu, em hãy trình bày về những kĩ năng cơ bản em có và đã học qua nhé!'
        }
    ]);

    // Cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, inputText]);

    const handleToggleMic = () => {
        if (!isRecording) {
            setIsRecording(true);
            setInputText("Đang nhận diện giọng nói...");
        } else {
            setIsRecording(false);
            setInputText("Interface chỉ chứa khai báo phương thức, còn Abstract Class có thể chứa cả code thực thi bên trong ạ.");
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || inputText.includes("Đang nhận diện")) return;

        const newUserMsg: IMessage = {
            id: 'msg-' + Date.now(),
            role: 'user',
            content: inputText
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');

        // Fake AI Typing
        const typingId = 'typing-' + Date.now();
        setMessages(prev => [...prev, {
            id: typingId,
            role: 'ai',
            content: '',
            isTyping: true
        }]);

        // Fake AI Response
        setTimeout(() => {
            setMessages(prev => {
                const newMessages = prev.filter(m => m.id !== typingId);
                return [...newMessages, {
                    id: 'msg-' + Date.now(),
                    role: 'ai',
                    content: 'Chính xác! Vậy nếu dự án sử dụng đa kế thừa (Multiple Inheritance), em sẽ chọn dùng Interface hay Abstract Class?',
                    feedback: {
                        level: 'Rất tốt',
                        text: 'Câu trả lời đi thẳng vào trọng tâm, phân biệt rõ bản chất của 2 khái niệm.'
                    }
                }];
            });
        }, 2000);
    };

    return (
        <div className="interview-room bg-dark text-light d-flex flex-column vh-100 overflow-hidden">
            {/* Topbar */}
            <header className="interview-header bg-darker border-bottom border-secondary py-3 px-4 d-flex align-items-center justify-content-between flex-shrink-0">
                <div className="d-flex align-items-center gap-3">
                    <div className="icon-wrap bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}>
                        <i className="fas fa-headset"></i>
                    </div>
                    <div>
                        <h5 className="m-0 fw-bold">Phòng Phỏng Vấn Technical</h5>
                        <small className="text-secondary">Vị trí: .NET Backend Developer</small>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                        <span className="dot-pulse bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span> Đang ghi âm
                    </span>
                    <button className="btn btn-danger fw-bold shadow-sm" onClick={() => navigate(-1)}>
                        <i className="fas fa-sign-out-alt me-2"></i> Rời phòng
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-grow-1 d-flex flex-column position-relative" style={{ backgroundColor: '#f8fafc' }}>
                
                {/* Messages */}
                <div ref={chatBoxRef} className="chat-box flex-grow-1 overflow-auto p-4 p-md-5 d-flex flex-column gap-4">
                    {messages.map(msg => (
                        <div key={msg.id}>
                            {msg.role === 'ai' ? (
                                <div className="d-flex gap-3">
                                    <div className="avatar-ai bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-2 border-white" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                                        <i className="fas fa-robot"></i>
                                    </div>
                                    <div className="message-bubble bg-white border p-3 p-md-4 rounded-4 shadow-sm text-dark" style={{ borderTopLeftRadius: '4px', maxWidth: '75%', fontSize: '1.1rem' }}>
                                        {msg.isTyping ? (
                                            <div className="typing-indicator text-muted d-flex gap-2">
                                                <i className="fas fa-circle bounce1"></i>
                                                <i className="fas fa-circle bounce2"></i>
                                                <i className="fas fa-circle bounce3"></i>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex gap-3 flex-row-reverse mt-2">
                                    <div className="avatar-user bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 border border-2 border-white shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="message-bubble bg-dark text-white p-3 p-md-4 rounded-4 shadow-sm" style={{ borderTopRightRadius: '4px', maxWidth: '75%', fontSize: '1.1rem' }}>
                                        {msg.content}
                                    </div>
                                </div>
                            )}

                            {/* Feedback từ AI nếu có */}
                            {msg.feedback && (
                                <div className="d-flex justify-content-start mt-2" style={{ marginLeft: '64px' }}>
                                    <div className="feedback-box bg-info bg-opacity-10 border border-info border-opacity-25 p-3 rounded-3 shadow-sm d-flex gap-3" style={{ maxWidth: '500px' }}>
                                        <i className="fas fa-star text-info mt-1 fs-5"></i>
                                        <div>
                                            <h6 className="fw-bold text-info mb-1">Đánh giá nhanh: {msg.feedback.level}</h6>
                                            <p className="text-dark small m-0 opacity-75">{msg.feedback.text}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="input-area bg-white p-3 p-md-4 border-top flex-shrink-0">
                    <div className="container-fluid max-w-4xl px-0 d-flex align-items-center gap-3">
                        <button 
                            className={`btn ${isRecording ? 'btn-danger pulse-effect' : 'btn-light border'} rounded-4 shadow-sm d-flex align-items-center justify-content-center flex-shrink-0 transition-all`} 
                            style={{ width: '56px', height: '56px' }}
                            onClick={handleToggleMic}
                        >
                            <i className="fas fa-microphone fs-4"></i>
                        </button>
                        <input 
                            type="text" 
                            className={`form-control border-secondary border-opacity-25 px-4 rounded-4 shadow-none ${isRecording ? 'text-primary fw-bold bg-light' : 'bg-light bg-opacity-50'}`} 
                            style={{ height: '56px', fontSize: '1.1rem' }}
                            placeholder="Nhấn vào Mic để nói hoặc gõ câu trả lời của bạn..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isRecording}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            className="btn btn-primary text-white rounded-4 shadow d-flex align-items-center justify-content-center flex-shrink-0 transition-all hover-scale" 
                            style={{ width: '56px', height: '56px' }}
                            onClick={handleSendMessage}
                        >
                            <i className="fas fa-paper-plane fs-5"></i>
                        </button>
                    </div>
                    <p className="text-center text-muted small mt-3 mb-0">
                        <i className="fas fa-lightbulb text-warning me-1"></i> Mẹo: Bạn nên bật Micro để rèn luyện kỹ năng trả lời phỏng vấn lưu loát hơn.
                    </p>
                </div>
            </main>

            <style>{`
                .bg-darker { background-color: #0f172a !important; }
                .text-dark { color: #334155 !important; }
                .interview-room { font-family: 'Inter', sans-serif; }
                
                .dot-pulse {
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(25, 135, 84, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
                }

                .pulse-effect {
                    animation: pulse-danger 1.5s infinite;
                }
                @keyframes pulse-danger {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                }

                .typing-indicator .fas {
                    font-size: 8px;
                    margin: 0 2px;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-indicator .bounce1 { animation-delay: -0.32s; }
                .typing-indicator .bounce2 { animation-delay: -0.16s; }
                
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                .hover-scale:hover { transform: scale(1.05); }
                .transition-all { transition: all 0.3s ease; }
                
                /* Custom Scrollbar for chatbox */
                .chat-box::-webkit-scrollbar { width: 8px; }
                .chat-box::-webkit-scrollbar-track { background: transparent; }
                .chat-box::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
};

export default PhongVanAI;
