import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '@/configs/axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatBot.css';

interface ChatBotProps {
    maBaiHoc?: number | null;
    tieuDeBaiHoc?: string | null;
    noiDungBaiHoc?: string | null;
}

interface TinNhan {
    VaiTro: 'user' | 'assistant';
    NoiDung: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ maBaiHoc, tieuDeBaiHoc, noiDungBaiHoc }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // STATE: Phóng to toàn màn hình
    const [tinNhanList, setTinNhanList] = useState<TinNhan[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Khởi tạo & Lấy lịch sử chat
    useEffect(() => {
        const lichSuCu = localStorage.getItem('educodeai_chat_history');
        if (lichSuCu) {
            setTinNhanList(JSON.parse(lichSuCu));
        } else {
            setTinNhanList([{ VaiTro: 'assistant', NoiDung: 'Chào bạn! Mình là trợ lý AI của EduCode. Mình có thể giúp gì cho bạn hôm nay?' }]);
        }
    }, []);

    // 2. Tự động cuộn xuống cuối & Lưu lịch sử
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (tinNhanList.length > 0) {
            localStorage.setItem('educodeai_chat_history', JSON.stringify(tinNhanList));
        }
    }, [tinNhanList, isLoading]);

    // 3. Hàm gửi tin nhắn
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const tinNhanMoi: TinNhan = { VaiTro: 'user', NoiDung: inputValue };
        const lichSuCapNhat = [...tinNhanList, tinNhanMoi];
        setTinNhanList(lichSuCapNhat);
        setInputValue("");
        setIsLoading(true);
        const lichSuGuiDi = lichSuCapNhat.slice(-10);
        try {
            const response: any = await axiosClient.post('/api/ChatBotAI/tu-van-hoc-tap', {
                LichSuChat: lichSuGuiDi,
                TieuDeBaiHoc: tieuDeBaiHoc || null,
                NoiDungBaiHoc: noiDungBaiHoc || null
            },
                {
                    timeout: 120000, // 120s - Tha hồ cho AI suy ngẫm
                });

            const botReply: TinNhan = {
                VaiTro: 'assistant',
                NoiDung: response.cauTraLoi || 'Không có phản hồi từ AI.'
            };

            setTinNhanList(prev => [...prev, botReply]);
        } catch (error) {
            console.error("Lỗi AI:", error);
            setTinNhanList(prev => [...prev, { VaiTro: 'assistant', NoiDung: 'Xin lỗi, hệ thống AI đang bảo trì. Bạn vui lòng thử lại sau nhé!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Hàm Xóa lịch sử
    const handleClearChat = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?")) {
            const clearData: TinNhan[] = [{ VaiTro: 'assistant', NoiDung: 'Chào bạn! Mình là trợ lý AI của EduCode. Mình có thể giúp gì cho bạn hôm nay?' }];
            setTinNhanList(clearData);
            localStorage.setItem('educodeai_chat_history', JSON.stringify(clearData));
        }
    };

    // 5. Hàm Lưu ghi chú AI
    const handleSaveNote = async (noiDung: string) => {
        if (!maBaiHoc) {
            alert("Bạn chỉ có thể lưu kiến thức khi đang ở trong một bài học cụ thể!");
            return;
        }

        try {
            await axiosClient.post('/api/AiChat/luu-ghi-chu-ai', {
                MaBaiHoc: maBaiHoc,
                NoiDung: noiDung
            });
            alert("Đã lưu vào Sổ tay bài học!");
        } catch (error) {
            console.error("Lỗi lưu ghi chú", error);
            alert("Lưu thất bại, vui lòng thử lại!");
        }
    };

    return (
        <>
            {/* Cửa sổ Chat */}
            <div className={`cp-chatbot-window ${!isOpen ? 'hidden' : ''} ${isExpanded ? 'expanded' : ''}`}>

                {/* Header */}
                <div className="cp-chatbot-header">
                    <div>
                        <i className="fas fa-robot me-2" style={{ fontSize: '1.2rem' }}></i>
                        EduCode AI
                    </div>
                    <div className="cp-chatbot-header-actions">
                        {/* NÚT TÍNH NĂNG MỚI: Phóng to / Thu nhỏ */}
                        <i
                            className={`fas ${isExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}`}
                            title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                            onClick={() => setIsExpanded(!isExpanded)}
                        ></i>
                        <i className="fas fa-trash-alt" title="Xóa lịch sử" onClick={handleClearChat}></i>
                        <i className="fas fa-times" title="Đóng" onClick={() => setIsOpen(false)}></i>
                    </div>
                </div>

                {/* Danh sách tin nhắn */}
                <div className="cp-chatbot-messages">
                    {tinNhanList.map((msg, idx) => (
                        <div key={idx} className={`chat-msg ${msg.VaiTro}`}>

                            {/* KIỂM TRA VAI TRÒ */}
                            {msg.VaiTro === 'user' ? (
                                // 1. Nếu là User: Hiển thị chữ bình thường
                                msg.NoiDung
                            ) : (
                                // 2. Nếu là AI: Render Markdown và Thêm Nút Lưu
                                <div className="assistant-msg-container">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                                        {/* Header của đoạn code (Tên ngôn ngữ) */}
                                                        <div style={{ background: '#2d2d2d', color: '#9ca3af', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                                            {match[1]}
                                                        </div>
                                                        <SyntaxHighlighter
                                                            {...props}
                                                            children={String(children).replace(/\n$/, '')}
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            customStyle={{ margin: 0, padding: '15px', fontSize: '14px' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <code {...props} style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', color: '#d97706', fontSize: '0.9em', fontWeight: 500 }}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.NoiDung}
                                    </ReactMarkdown>

                                    {/* NÚT LƯU KIẾN THỨC CHỈ HIỆN Ở ĐÂY */}
                                    <button
                                        className="btn-save-ai-note"
                                        onClick={() => handleSaveNote(msg.NoiDung)}
                                        title="Lưu câu trả lời này vào sổ tay"
                                    >
                                        <i className="far fa-bookmark"></i> Lưu kiến thức
                                    </button>
                                </div>
                            )}

                        </div>
                    ))}

                    {/* Hiệu ứng 3 dấu chấm khi AI đang suy nghĩ */}
                    {isLoading && (
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="cp-chatbot-input-area">
                    <input
                        type="text"
                        placeholder="Hỏi AI về bài học..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            {/* Nút Toggle Cục tròn nổi */}
            <button className="cp-chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
            </button>
        </>
    );
};