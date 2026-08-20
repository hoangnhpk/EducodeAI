import { getUserInfo } from '@/utils/authHelper';
import React from 'react';

interface Props { 
    tenKhoaHoc: string; 
    soBaiDaHoc: number; 
    tongSoBai: number; 
    onMoGhiChu?: () => void;   // Mở sổ tay tự viết
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
                <a href="/" className="cp-back" title="Quay lại danh sách khóa học">
                    <i className="fas fa-arrow-left"></i>
                </a>
                <div className="cp-course-title-meta">
                    <span>Nội dung khóa học</span>
                    <span id="cpCourseTitle" style={{ fontWeight: 600 }}>{tenKhoaHoc}</span>
                </div>
            </div>
            
            <div className="cp-header-right">
                {/* ======================================= */}
                {/* 1. NÚT SỔ TAY CÁ NHÂN (Tự viết) */}
                {/* ======================================= */}
                <button 
                    type="button"
                    className="cp-btn-so-tay" 
                    onClick={onMoGhiChu}
                    title="Viết ghi chú cá nhân"
                >
                    <i className="fas fa-edit" style={{ color: '#3b82f6' }}></i>
                    <span className="d-none d-md-inline">Sổ tay</span>
                </button>

                {/* ======================================= */}
                {/* 2. NÚT SỔ TAY AI (Tóm tắt tự động) */}
                {/* ======================================= */}
                {/* <button 
                    className="btn btn-light btn-sm" 
                    style={{ 
                        marginRight: '15px', 
                        marginLeft: '10px',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        border: '1px solid #fbd38d', 
                        background: '#fffaf0',      
                        color: '#c05621'        
                    }}
                    onClick={onMoGhiChuAI}
                    title="Xem các bản tóm tắt AI đã lưu"
                >
                    <i className="fas fa-robot" style={{ color: '#dd6b20' }}></i>
                    <span className="d-none d-md-inline">Kiến thức AI</span>
                </button> */}

                <div className="cp-progress-inline cp-header-progress" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
                <div className="cp-progress-circle" aria-label={`Tiến độ ${Math.round(percent)}%`}>
                    <svg className="cp-progress-circle-svg" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                        <circle className="cp-progress-circle-track" cx="20" cy="20" r={radius} strokeDasharray={circumference} />
                        <circle className="cp-progress-circle-fill" cx="20" cy="20" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
                    </svg>
                    <span className="cp-progress-circle-value">
                        {Math.round(percent)}%
                    </span>
                </div>

                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                        {soBaiDaHoc}/{tongSoBai} bài học
                    </span>
                </div>

                <div className="cp-user-chip cp-header-user" style={{ marginLeft: '15px' }}>
                    <div className="cp-user-avatar">HV</div>
                    <span>{getUserInfo()?.hoTen || 'Học viên'}</span>
                </div>
            </div>
        </header>
    );
};