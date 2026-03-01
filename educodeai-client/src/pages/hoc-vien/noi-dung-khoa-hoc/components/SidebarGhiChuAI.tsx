import React, { useEffect, useState } from 'react';
import axiosClient from '@/configs/axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SidebarDanhSachGhiChuProps {
    isOpen: boolean;
    onClose: () => void;
    maNguoiDung: number;
}

// Khai báo kiểu dữ liệu trả về từ API C#
interface GhiChuAI {
    id: number;
    maBaiHoc: number;
    tenBaiHoc: string; // Tuỳ chọn: Nếu API C# của bạn join bảng và trả về tên bài học
    noiDung: string;
    ngayTao: string;
}

export const SidebarGhiChuAI: React.FC<SidebarDanhSachGhiChuProps> = ({ isOpen, onClose, maNguoiDung }) => {
    const [danhSachGhiChu, setDanhSachGhiChu] = useState<GhiChuAI[]>([]);
    const [dangTai, setDangTai] = useState(false);

    // Tự động load dữ liệu mỗi khi Sidebar được mở
    useEffect(() => {
        if (isOpen) {
            layDanhSachGhiChu();
        }
    }, [isOpen]);

    const layDanhSachGhiChu = async () => {
        setDangTai(true);
        try {
            // Thay đường dẫn này bằng API Get thực tế của bạn
            const response: any = await axiosClient.get(`/api/GhiChuAI/danh-sach/${maNguoiDung}`);
            setDanhSachGhiChu(response.data || []);
        } catch (error) {
            console.error("Lỗi tải ghi chú:", error);
        } finally {
            setDangTai(false);
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <>
            {/* Lớp phủ đen (Bấm ra ngoài để đóng) */}
            {isOpen && <div className="ai-notes-overlay" onClick={onClose}></div>}

            {/* Khung Sidebar */}
            <div className={`ai-notes-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="ai-notes-header">
                    <h4><i className="fas fa-book-reader me-2" style={{ color: '#f69050' }}></i> Ghi chú & Tóm tắt AI</h4>
                    <button className="btn-close-sidebar" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="ai-notes-body">
                    {dangTai && (
                        <div className="text-center mt-4" style={{ color: '#94a3b8' }}>
                            <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                            <p>Đang tải ghi chú của bạn...</p>
                        </div>
                    )}

                    {!dangTai && danhSachGhiChu.length === 0 && (
                        <div className="text-center mt-5" style={{ color: '#94a3b8' }}>
                            <i className="fas fa-folder-open fa-3x mb-3" style={{ opacity: 0.5 }}></i>
                            <p>Bạn chưa lưu ghi chú AI nào.<br/>Hãy dùng tính năng "Tóm tắt Video" để lưu lại kiến thức nhé!</p>
                        </div>
                    )}

                    {!dangTai && danhSachGhiChu.map((ghiChu) => (
                        <div key={ghiChu.id} className="ai-note-card">
                            <div className="ai-note-meta">
                                <span><i className="far fa-calendar-alt"></i> {formatDate(ghiChu.ngayTao)}</span>
                                <span>Bài học ID: {ghiChu.maBaiHoc}</span>
                            </div>
                            <div className="ai-note-content">
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    {...props}
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ borderRadius: '6px', fontSize: '12px' }}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code {...props} className={className} style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', color: '#e11d48' }}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {ghiChu.noiDung}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};