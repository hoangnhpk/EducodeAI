import React from 'react';

interface Props { tenKhoaHoc: string; tienDo: number; }

export const ThanhTieuDe: React.FC<Props> = ({ tenKhoaHoc, tienDo }) => (
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
            <div className="cp-progress-inline">
                <span id="cpHeaderProgressLabel">{tienDo}%</span>
                <div className="cp-progress-bar">
                    <div className="cp-progress-bar-inner" id="cpHeaderProgressBar" style={{ width: `${tienDo}%` }}></div>
                </div>
            </div>
            <div className="cp-user-chip">
                <div className="cp-user-avatar">SV</div>
                <span>Học viên</span>
            </div>
        </div>
    </header>
);