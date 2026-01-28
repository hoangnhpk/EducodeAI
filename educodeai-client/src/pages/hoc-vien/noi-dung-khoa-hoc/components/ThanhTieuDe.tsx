import React from 'react';

interface Props { 
    tenKhoaHoc: string; 
    soBaiDaHoc: number; 
    tongSoBai: number; 
    // Callback khi bấm nút Ghi chú (để mở Sidebar ghi chú hoặc Modal danh sách)
    onMoGhiChu?: () => void; 
}

export const ThanhTieuDe: React.FC<Props> = ({ tenKhoaHoc, soBaiDaHoc, tongSoBai, onMoGhiChu }) => {
    // Logic vẽ vòng tròn tiến độ SVG
    const radius = 16; 
    const circumference = 2 * Math.PI * radius; 
    const percent = tongSoBai > 0 ? (soBaiDaHoc / tongSoBai) * 100 : 0;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <header className="cp-header">
            <div className="cp-header-left">
                <a href="/khoa-hoc" className="cp-back" title="Quay lại danh sách khóa học">
                    <i className="fas fa-arrow-left"></i>
                </a>
                <div className="cp-course-title-meta">
                    <span>Nội dung khóa học</span>
                    <span id="cpCourseTitle" style={{ fontWeight: 600 }}>{tenKhoaHoc}</span>
                </div>
            </div>
            
            <div className="cp-header-right">
                {/* --- NÚT GHI CHÚ (MỚI) --- */}
                <button 
                    className="btn btn-light btn-sm" 
                    style={{ 
                        marginRight: '15px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        border: '1px solid #eee',
                        color: '#555'
                    }}
                    onClick={onMoGhiChu}
                    title="Xem danh sách ghi chú của bạn"
                >
                    <i className="fas fa-sticky-note" style={{ color: '#f69050' }}></i>
                    <span className="d-none d-md-inline">Ghi chú</span>
                </button>
                {/* ------------------------- */}

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
                    <span>Học viên</span>
                </div>
            </div>
        </header>
    );
};