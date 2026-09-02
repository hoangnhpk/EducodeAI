import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { KhoaHocService } from '@/services/khoa-hoc.service';
import axiosClient from '@/configs/axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 1. Interfaces
interface GhiChuDisplay {
    id: number;
    thoiGianVideo: number;
    noiDung: string;
    ngayTao: string;
}

interface GhiChuAIDisplay {
    id: number;
    maBaiHoc: number;
    noiDung: string;
    ngayTao: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    maBaiHoc: number;
    maNguoiDung: number;
    onSeek: (seconds: number) => void;
}

// 2. Component Con: Ghi chú Video (Giữ nguyên logic của bạn)
const NoteItem = ({ item, onSeek, formatTime, formatDate }: {
    item: GhiChuDisplay,
    onSeek: (s: number) => void,
    formatTime: (s: number) => string,
    formatDate: (d: string) => string
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 120;
    const isLongContent = item.noiDung.length > MAX_LENGTH;

    const contentToShow = isExpanded || !isLongContent
        ? item.noiDung
        : item.noiDung.slice(0, MAX_LENGTH) + '...';

    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <button
                    onClick={() => onSeek(item.thoiGianVideo)}
                    style={{ background: '#212529', color: '#fff', border: 'none', borderRadius: '20px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <i className="fas fa-play" style={{ fontSize: '0.6rem' }}></i>
                    {formatTime(item.thoiGianVideo)}
                </button>
                <span style={{ fontSize: '0.75rem', color: '#999', fontStyle: 'italic' }}>{formatDate(item.ngayTao)}</span>
            </div>
            <div style={{ color: '#333', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {contentToShow}
            </div>
            {isLongContent && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{ background: 'none', border: 'none', color: '#f69050', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    {isExpanded ? <>Thu gọn <i className="fas fa-chevron-up"></i></> : <>Xem thêm <i className="fas fa-chevron-down"></i></>}
                </button>
            )}
        </div>
    );
};

// 3. Component Chính
export const SidebarGhiChu: React.FC<Props> = ({ isOpen, onClose, maBaiHoc, maNguoiDung, onSeek }) => {
    const [activeTab, setActiveTab] = useState<'video' | 'ai'>('video');
    const [danhSachVideo, setDanhSachVideo] = useState<GhiChuDisplay[]>([]);
    const [danhSachAI, setDanhSachAI] = useState<GhiChuAIDisplay[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho việc sửa ghi chú AI
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return ''; }
    };

    // Hàm lấy danh sách ghi chú AI
    const fetchGhiChuAI = async () => {
        try {
            const resAI: any = await axiosClient.get(`/api/NoiDungKhoaHoc/lay-ds-ghi-chu-ai/${maNguoiDung}`);
            setDanhSachAI(resAI || []);
        } catch (error) {
            console.error("Lỗi tải ghi chú AI:", error);
        }
    };

    useEffect(() => {
        const fetchAllGhiChu = async () => {
            if (isOpen) {
                setLoading(true);
                try {
                    // 1. Ghi chú Video
                    if (maBaiHoc) {
                        const dataVid: any[] = await KhoaHocService.layDanhSachGhiChu(maBaiHoc, maNguoiDung);
                        const mappedVid = dataVid.map(item => ({
                            id: item.id || item.Id,
                            thoiGianVideo: item.thoiGianVideo || item.ThoiGianVideo,
                            noiDung: item.noiDung || item.NoiDung || item.GhiChu || "",
                            ngayTao: item.ngayTao || item.NgayTao || new Date().toISOString()
                        })).sort((a, b) => a.thoiGianVideo - b.thoiGianVideo);
                        setDanhSachVideo(mappedVid);
                    }
                    // 2. Ghi chú AI
                    await fetchGhiChuAI();
                } catch (error) {
                    console.error("Lỗi tải dữ liệu ghi chú:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAllGhiChu();
    }, [isOpen, maBaiHoc, maNguoiDung]);

    // XỬ LÝ XÓA AI
    // Trong hàm handleDeleteAI - phần này bạn đã làm đúng
    const handleDeleteAI = async (id: number) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa kiến thức AI này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });
        if (!result.isConfirmed) return;

        try {
            const itemToDelete = danhSachAI.find(item => item.id === id);
            await axiosClient.delete(`/api/NoiDungKhoaHoc/xoa-ghi-chu-ai/${id}`);

            setDanhSachAI(prev => prev.filter(item => item.id !== id));

            // Cập nhật localStorage và dispatch event - lọc ra những nội dung đã lưu trùng với ghi chú vừa xóa
            const savedData = localStorage.getItem('educodeai_saved_indices');
            if (savedData && itemToDelete) {
                let currentSaved: string[] = JSON.parse(savedData);
                const updatedSaved = currentSaved.filter(s => s !== itemToDelete.noiDung);
                localStorage.setItem('educodeai_saved_indices', JSON.stringify(updatedSaved));

                // PHÁT SỰ KIỆN ĐỂ CHATBOT BIẾT
                window.dispatchEvent(new Event('storage_updated'));
            }

            Swal.fire({ icon: 'success', text: "Xóa thành công!", timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', text: "Xóa thất bại!", timer: 1500, showConfirmButton: false });
        }
    };

    // XỬ LÝ CẬP NHẬT AI
    const handleUpdateAI = async (id: number) => {
        if (!editContent.trim()) return;
        try {
            // giữ nội dung cũ để cập nhật localStorage nếu cần
            const oldItem = danhSachAI.find(item => item.id === id);
            const oldContent = oldItem ? oldItem.noiDung : null;

            await axiosClient.put(`/api/NoiDungKhoaHoc/cap-nhat-ghi-chu-ai`, {
                Id: id,
                NoiDung: editContent
            });
            setDanhSachAI(prev => prev.map(item => item.id === id ? { ...item, noiDung: editContent } : item));
            setEditingId(null);

            // nếu trước đó người dùng đã lưu ghi chú này, cập nhật nội dung trong localStorage
            if (oldContent) {
                const savedData = localStorage.getItem('educodeai_saved_indices');
                if (savedData) {
                    let currentSaved: string[] = JSON.parse(savedData);
                    const updatedSaved = currentSaved.map(s => s === oldContent ? editContent : s);
                    localStorage.setItem('educodeai_saved_indices', JSON.stringify(updatedSaved));
                    window.dispatchEvent(new Event('storage_updated'));
                }
            }

            Swal.fire({ icon: 'success', text: "Cập nhật thành công!", timer: 1500, showConfirmButton: false });
        } catch (error) {
            console.error("Lỗi cập nhật ghi chú AI:", error);
            Swal.fire({ icon: 'error', text: "Cập nhật thất bại!" });
        }
    };

    return (
        <>
            <div
                onClick={onClose}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1040, opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden', transition: 'all 0.3s' }}
            />

            <div style={{
                position: 'fixed', top: 0, right: isOpen ? 0 : '-450px', width: '450px', height: '100%',
                background: '#f8f9fa', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', zIndex: 1050,
                display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', Roboto, sans-serif"
            }}>
                {/* Header */}
                <div style={{ padding: '20px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '1.2rem' }}>
                        <i className="fas fa-book-reader me-2" style={{ color: '#f69050' }}></i> Sổ tay học tập
                    </h5>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#aaa', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => setActiveTab('video')}
                        style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: activeTab === 'video' ? '3px solid #f69050' : '3px solid transparent', color: activeTab === 'video' ? '#f69050' : '#64748b', fontWeight: activeTab === 'video' ? 700 : 500, cursor: 'pointer' }}
                    >
                        <i className="fas fa-video me-2"></i> Ghi chú bài học
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: activeTab === 'ai' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'ai' ? '#3b82f6' : '#64748b', fontWeight: activeTab === 'ai' ? 700 : 500, cursor: 'pointer' }}
                    >
                        <i className="fas fa-robot me-2"></i> Kiến thức AI
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Đang tải...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'video' && (
                                danhSachVideo.length === 0 ? (
                                    <div style={{ textAlign: 'center', marginTop: '60px', color: '#999' }}>
                                        <i className="far fa-edit" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }}></i>
                                        <p>Chưa có ghi chú video.</p>
                                    </div>
                                ) : (
                                    danhSachVideo.map((item) => (
                                        <NoteItem key={item.id} item={item} onSeek={onSeek} formatTime={formatTime} formatDate={formatDate} />
                                    ))
                                )
                            )}

                            {activeTab === 'ai' && (
                                danhSachAI.length === 0 ? (
                                    <div style={{ textAlign: 'center', marginTop: '60px', color: '#999' }}>
                                        <i className="fas fa-brain" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }}></i>
                                        <p>Sổ tay AI đang trống.</p>
                                    </div>
                                ) : (
                                    danhSachAI.map((item) => (
                                        <div key={item.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                                                <span><i className="far fa-clock"></i> {formatDate(item.ngayTao)}</span>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => { setEditingId(item.id); setEditContent(item.noiDung); }}
                                                        style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer' }} title="Sửa"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAI(item.id)}
                                                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} title="Xóa"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {editingId === item.id ? (
                                                <div>
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        style={{ width: '100%', minHeight: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                                        <button onClick={() => handleUpdateAI(item.id)} style={{ padding: '5px 15px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>Lưu thay đổi</button>
                                                        <button onClick={() => setEditingId(null)} style={{ padding: '5px 15px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>Hủy</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="ai-markdown-content" style={{ fontSize: '0.9rem', color: '#334155' }}>
                                                    <ReactMarkdown
                                                        components={{
                                                            code({ node, inline, className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                return !inline && match ? (
                                                                    <SyntaxHighlighter {...props} style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ borderRadius: '6px', fontSize: '13px' }}>
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
                                                        {item.noiDung}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};