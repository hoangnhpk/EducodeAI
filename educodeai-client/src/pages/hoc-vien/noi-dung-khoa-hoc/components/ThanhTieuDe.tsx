import React from 'react';

interface Props { 
    tenKhoaHoc: string; 
    soBaiDaHoc: number; 
    tongSoBai: number; 
}

export const ThanhTieuDe: React.FC<Props> = ({ tenKhoaHoc, soBaiDaHoc, tongSoBai }) => {
    // Tính toán cho vòng tròn SVG
    const radius = 16; // Bán kính
    const circumference = 2 * Math.PI * radius; // Chu vi
    const percent = tongSoBai > 0 ? (soBaiDaHoc / tongSoBai) * 100 : 0;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <header className="cp-header">
            <div className="cp-header-left">
                <a href="single.html" className="cp-back" title="Quay lại trang khóa học">
                    <i className="fas fa-arrow-left"></i>
                </a>
                <div className="cp-course-title-meta">
                    <span>Nội dung khóa học</span>
                    <span id="cpCourseTitle">{tenKhoaHoc}</span>
                </div>
            </div>
            
            <div className="cp-header-right">
                <div className="cp-progress-inline" style={{ gap: '12px' }}>
                    {/* --- Tiến độ hình tròn --- */}
                    <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Vòng tròn nền mờ */}
                            <circle
                                cx="20" cy="20" r={radius}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="3"
                                fill="transparent"
                            />
                            {/* Vòng tròn tiến độ */}
                            <circle
                                cx="20" cy="20" r={radius}
                                stroke="#fff"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        
                        {/* --- PHẦN HIỂN THỊ SỐ % Ở GIỮA --- */}
                        <span style={{ 
                            position: 'absolute', 
                            fontSize: '0.65rem', 
                            fontWeight: '700', 
                            color: '#fff' 
                        }}>
                            {Math.round(percent)}%
                        </span>
                        {/* ---------------------------------- */}
                    </div>

                    {/* Hiển thị số bài: 5/20 bài */}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {soBaiDaHoc}/{tongSoBai} bài học
                    </span>
                </div>

                <div className="cp-user-chip">
                    <div className="cp-user-avatar">SV</div>
                    <span>Học viên</span>
                </div>
            </div>
        </header>
    );
};