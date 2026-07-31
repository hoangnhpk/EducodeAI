import { getUserInfo } from '@/utils/authHelper';
import React from 'react';

interface Props { 
    tenKhoaHoc: string; 
    soBaiDaHoc: number; 
    tongSoBai: number; 
    laCheDoHocThu?: boolean;
    soVideoHocThu?: number;
    onMuaKhoaHoc?: () => void;
    onMoGhiChu?: () => void;   // Mở sổ tay tự viết
}

export const ThanhTieuDe: React.FC<Props> = ({
    tenKhoaHoc,
    soBaiDaHoc,
    tongSoBai,
    laCheDoHocThu,
    soVideoHocThu,
    onMuaKhoaHoc,
    onMoGhiChu
}) => {
    // Logic vẽ vòng tròn tiến độ SVG
    const radius = 16; 
    const circumference = 2 * Math.PI * radius; 
    const percent = tongSoBai > 0 ? (soBaiDaHoc / tongSoBai) * 100 : 0;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <header className="cp-header">
            <div className="cp-header-left">
                <a href="/" className="cp-back" title="Quay lại danh sách khóa học">
                    <i className="fas fa-arrow-left"></i>
                </a>
                <div className="cp-course-title-meta">
                    <span>Nội dung khóa học</span>
                    <span id="cpCourseTitle" style={{ fontWeight: 600 }}>{tenKhoaHoc}</span>
                </div>
            </div>
            
            <div className="cp-header-right">
                {/* NÚT / BADGE CHẾ ĐỘ HỌC THỬ (Tích hợp gọn gàng trong Header) */}
                {laCheDoHocThu && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '6px' }}>
                        <span
                            style={{
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                padding: '4px 12px',
                                borderRadius: '999px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <i className="fas fa-eye" style={{ fontSize: '0.75rem' }} />
                            Học thử {soVideoHocThu ?? 2} bài
                        </span>

                        <button
                            type="button"
                            className="cp-btn-mua-khoa-hoc"
                            onClick={onMuaKhoaHoc}
                            title="Mua toàn bộ khóa học để mở khóa tất cả nội dung"
                        >
                            <i className="fas fa-shopping-cart" style={{ color: 'inherit' }} />
                            <span className="d-none d-sm-inline">Mua khóa học</span>
                        </button>
                    </div>
                )}

                {/* NÚT SỔ TAY CÁ NHÂN */}
                <button 
                    className="btn btn-light btn-sm" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        border: '1px solid #eee',
                        color: '#555'
                    }}
                    onClick={onMoGhiChu}
                    title="Viết ghi chú cá nhân"
                >
                    <i className="fas fa-edit" style={{ color: '#3b82f6' }}></i>
                    <span className="d-none d-md-inline">Sổ tay</span>
                </button>

                <div className="cp-progress-inline" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="20" cy="20" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="transparent" />
                            <circle cx="20" cy="20" r={radius} stroke="#fff" strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                        </svg>
                        <span style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: '700', color: '#fff' }}>
                            {Math.round(percent)}%
                        </span>
                    </div>

                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                        {soBaiDaHoc}/{tongSoBai} bài học
                    </span>
                </div>

                <div className="cp-user-chip" style={{ marginLeft: '15px' }}>
                    <div className="cp-user-avatar">HV</div>
                    <span>{getUserInfo()?.hoTen || 'Học viên'}</span>
                </div>
            </div>
        </header>
    );
};