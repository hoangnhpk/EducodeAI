import React, { useEffect, useState } from 'react';
import { KhoaHocService } from '@/services/khoa-hoc.service';
// import type { GhiChuItem } from ... (Dùng type định nghĩa bên dưới để tránh lỗi import nếu file DTO chưa chuẩn)

// 1. Định nghĩa lại Interface cho chắc chắn
interface GhiChuDisplay {
    id: number;
    thoiGianVideo: number;
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

// 2. Helper: Component con để xử lý từng Note (Giúp xử lý Xem thêm/Thu gọn)
const NoteItem = ({ item, onSeek, formatTime, formatDate }: { 
    item: GhiChuDisplay, 
    onSeek: (s: number) => void,
    formatTime: (s: number) => string,
    formatDate: (d: string) => string
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 120; // Số ký tự tối đa trước khi bị cắt
    const isLongContent = item.noiDung.length > MAX_LENGTH;

    const contentToShow = isExpanded || !isLongContent 
        ? item.noiDung 
        : item.noiDung.slice(0, MAX_LENGTH) + '...';

    return (
        <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Đổ bóng nhẹ
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s ease',
        }}>
            {/* Header: Timestamp & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <button 
                    onClick={() => onSeek(item.thoiGianVideo)}
                    style={{
                        background: '#212529', // Màu đen hiện đại
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px', // Hình viên thuốc
                        padding: '5px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#000'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#212529'}
                >
                    <i className="fas fa-play" style={{ fontSize: '0.6rem' }}></i>
                    {formatTime(item.thoiGianVideo)}
                </button>

                <span style={{ fontSize: '0.75rem', color: '#999', fontStyle: 'italic' }}>
                    {formatDate(item.ngayTao)}
                </span>
            </div>

            {/* Content */}
            <div style={{ 
                color: '#333', 
                fontSize: '0.95rem', 
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap', // Giữ định dạng xuống dòng
                wordBreak: 'break-word' // Chống tràn nếu có từ quá dài
            }}>
                {contentToShow}
            </div>

            {/* Footer: Xem thêm / Thu gọn */}
            {isLongContent && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#f69050', // Màu chủ đạo (cam)
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '0',
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    {isExpanded ? (
                        <>Thu gọn <i className="fas fa-chevron-up" style={{fontSize: '0.7rem'}}></i></>
                    ) : (
                        <>Xem thêm <i className="fas fa-chevron-down" style={{fontSize: '0.7rem'}}></i></>
                    )}
                </button>
            )}
        </div>
    );
};

// 3. Component Chính
export const SidebarGhiChu: React.FC<Props> = ({ isOpen, onClose, maBaiHoc, maNguoiDung, onSeek }) => {
    const [danhSach, setDanhSach] = useState<GhiChuDisplay[]>([]);
    const [loading, setLoading] = useState(false);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch { return ''; }
    };

    useEffect(() => {
        const fetchGhiChu = async () => {
            if (isOpen && maBaiHoc) {
                setLoading(true);
                try {
                    const data: any[] = await KhoaHocService.layDanhSachGhiChu(maBaiHoc, maNguoiDung);
                    
                    // Map data an toàn
                    const mappedData = data.map(item => ({
                        id: item.id || item.Id,
                        thoiGianVideo: item.thoiGianVideo || item.ThoiGianVideo,
                        noiDung: item.noiDung || item.NoiDung || item.GhiChu || "",
                        ngayTao: item.ngayTao || item.NgayTao || new Date().toISOString()
                    }));
                    
                    // Sắp xếp thời gian video tăng dần
                    mappedData.sort((a, b) => a.thoiGianVideo - b.thoiGianVideo);
                    setDanhSach(mappedData);
                } catch (error) {
                    console.error("Lỗi tải ghi chú:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchGhiChu();
    }, [isOpen, maBaiHoc, maNguoiDung]);

    return (
        <>
            {/* Overlay */}
            <div 
                onClick={onClose}
                style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.4)', zIndex: 1040,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'all 0.3s'
                }}
            />

            {/* Sidebar Container */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: isOpen ? 0 : '-400px',
                width: '400px',
                height: '100%',
                background: '#f8f9fa', // Màu nền xám nhẹ cho Sidebar
                boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: 1050,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Segoe UI', Roboto, sans-serif"
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '20px', 
                    background: '#fff', 
                    borderBottom: '1px solid #eee', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
                }}>
                    <h5 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '1.1rem' }}>
                        Ghi chú bài học <span style={{ color: '#f69050', marginLeft: '5px' }}>({danhSach.length})</span>
                    </h5>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#aaa', cursor: 'pointer' }}
                    >
                        &times;
                    </button>
                </div>

                {/* List Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {loading ? (
                        <div style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : danhSach.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '60px', color: '#999' }}>
                            <i className="far fa-sticky-note" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }}></i>
                            <p>Chưa có ghi chú nào.</p>
                            <small>Hãy thêm ghi chú khi xem video để ôn tập tốt hơn!</small>
                        </div>
                    ) : (
                        danhSach.map((item) => (
                            <NoteItem 
                                key={item.id} 
                                item={item} 
                                onSeek={onSeek} 
                                formatTime={formatTime} 
                                formatDate={formatDate} 
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
};