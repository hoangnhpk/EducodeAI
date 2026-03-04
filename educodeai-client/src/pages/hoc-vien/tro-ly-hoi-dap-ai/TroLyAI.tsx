import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
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
    const [isExpanded, setIsExpanded] = useState(false);
    const [tinNhanList, setTinNhanList] = useState<TinNhan[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [savedContents, setSavedContents] = useState<string[]>([]);

    // THÊM: Định nghĩa giới hạn số ký tự tối đa cho 1 tin nhắn
    const MAX_CHARS = 500; 

    // 1. Khởi tạo & Lấy lịch sử chat + Lịch sử các nút đã lưu
    useEffect(() => {
        const lichSuCu = localStorage.getItem('educodeai_chat_history');
        const nutDaLuu = localStorage.getItem('educodeai_saved_indices');

        if (lichSuCu) {
            setTinNhanList(JSON.parse(lichSuCu));
        } else {
            setTinNhanList([{ VaiTro: 'assistant', NoiDung: 'Chào bạn! Mình là trợ lý AI của EduCode. Mình có thể giúp gì cho bạn hôm nay?' }]);
        }

        if (nutDaLuu) {
            setSavedContents(JSON.parse(nutDaLuu));
        }
    }, []);

    // 2. Tự động cuộn xuống cuối & Lưu lịch sử
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (tinNhanList.length > 0) {
            localStorage.setItem('educodeai_chat_history', JSON.stringify(tinNhanList));
        }
    }, [tinNhanList, isLoading]);

    useEffect(() => {
        const handleStorageUpdate = () => {
            const nutDaLuu = localStorage.getItem('educodeai_saved_indices');
            if (nutDaLuu) {
                setSavedContents(JSON.parse(nutDaLuu));
            } else {
                setSavedContents([]);
            }
        };

        window.addEventListener('storage_updated', handleStorageUpdate);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener('storage_updated', handleStorageUpdate);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    // 3. Hàm gửi tin nhắn
    const handleSendMessage = async () => {
        // THÊM: Kiểm tra cả độ dài trước khi gửi để chắc chắn an toàn
        if (!inputValue.trim() || inputValue.length > MAX_CHARS) return;

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
                
                // THÊM: (Tùy chọn) Giới hạn luôn cả Nội dung bài học gửi lên AI để tránh vượt quá Token limit của API (Ví dụ lấy 3000 ký tự đầu)
                NoiDungBaiHoc: noiDungBaiHoc ? noiDungBaiHoc.substring(0, 3000) : null 
            },
                {
                    timeout: 120000, 
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
        Swal.fire({
            title: 'Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then(result => {
            if (result.isConfirmed) {
                const clearData: TinNhan[] = [{ VaiTro: 'assistant', NoiDung: 'Chào bạn! Mình là trợ lý AI của EduCode. Mình có thể giúp gì cho bạn hôm nay?' }];
                setTinNhanList(clearData);
                setSavedContents([]);
                localStorage.setItem('educodeai_chat_history', JSON.stringify(clearData));
                localStorage.removeItem('educodeai_saved_indices');
                Swal.fire({ icon: 'success', text: 'Đã xóa lịch sử', timer: 1500, showConfirmButton: false });
            }
        });
    };

    // 5. Hàm Lưu ghi chú AI
    const handleSaveNote = async (noiDung: string, index: number) => {
        if (!maBaiHoc) {
            Swal.fire({ icon: 'warning', text: "Bạn chỉ có thể lưu kiến thức khi đang ở trong một bài học cụ thể!" });
            return;
        }

        if (savedContents.includes(noiDung)) return;

        try {
            await axiosClient.post('/api/NoiDungKhoaHoc/luu-ghi-chu-ai', {
                MaBaiHoc: maBaiHoc,
                NoiDung: noiDung
            });

            const updatedSaved = [...savedContents, noiDung];
            setSavedContents(updatedSaved);
            localStorage.setItem('educodeai_saved_indices', JSON.stringify(updatedSaved));

            Swal.fire({ icon: 'success', text: "Đã lưu vào Sổ tay bài học!", timer: 1500, showConfirmButton: false });
        } catch (error) {
            console.error("Lỗi lưu ghi chú", error);
            Swal.fire({ icon: 'error', text: "Lưu thất bại, vui lòng thử lại!" });
        }
    };

    return (
        <>
            <div className={`cp-chatbot-window ${!isOpen ? 'hidden' : ''} ${isExpanded ? 'expanded' : ''}`}>

                {/* Header */}
                <div className="cp-chatbot-header">
                    <div>
                        <i className="fas fa-robot me-2" style={{ fontSize: '1.2rem' }}></i>
                        EduCode AI
                    </div>
                    <div className="cp-chatbot-header-actions">
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
                    {/* ... (Đoạn map render tin nhắn giữ nguyên) ... */}
                    {tinNhanList.map((msg, idx) => (
                        <div key={idx} className={`chat-msg ${msg.VaiTro}`}>
                            {msg.VaiTro === 'user' ? (
                                msg.NoiDung
                            ) : (
                                <div className="assistant-msg-container">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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

                                    {/* NÚT LƯU KIẾN THỨC CÓ TRẠNG THÁI LƯU TRỮ */}
                                    <button
                                        className={`btn-save-ai-note ${savedContents.includes(msg.NoiDung) ? 'saved' : ''}`}
                                        onClick={() => handleSaveNote(msg.NoiDung, idx)}
                                        title={savedContents.includes(msg.NoiDung) ? "Đã lưu vào sổ tay" : "Lưu câu trả lời này vào sổ tay"}
                                        style={savedContents.includes(msg.NoiDung) ? {
                                            backgroundColor: '#28a745',
                                            color: '#fff',
                                            borderColor: '#28a745',
                                            cursor: 'default',
                                            opacity: 0.9
                                        } : {}}
                                    >
                                        <i className={savedContents.includes(msg.NoiDung) ? "fas fa-check" : "far fa-bookmark"}></i>
                                        {savedContents.includes(msg.NoiDung) ? " Đã lưu kiến thức" : " Lưu kiến thức"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="cp-chatbot-input-area" style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Hỏi AI về bài học..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                        maxLength={MAX_CHARS} // THÊM: Chặn gõ quá số ký tự quy định
                        style={{ paddingRight: '50px' }} // Chừa chỗ cho bộ đếm ký tự
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim() || inputValue.length > MAX_CHARS}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                    
                    {/* THÊM: Hiển thị bộ đếm ký tự (nhỏ nhắn ở góc input) */}
                    <div style={{
                        position: 'absolute',
                        right: '90px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.7rem',
                        color: inputValue.length >= MAX_CHARS ? '#ef4444' : '#9ca3af'
                    }}>
                        {inputValue.length}/{MAX_CHARS}
                    </div>
                </div>
            </div>

            <button className="cp-chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
            </button>
        </>
    );
};