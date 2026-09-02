import { getUserInfo } from '@/utils/authHelper';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props { 
    tenKhoaHoc: string; 
    soBaiDaHoc: number; 
    tongSoBai: number; 
    onMoGhiChu?: () => void;
    laCheDoHocThu?: boolean;
    soVideoHocThu?: number;
    onMuaKhoaHoc?: () => void;
}

export const ThanhTieuDe: React.FC<Props> = ({ tenKhoaHoc, soBaiDaHoc, tongSoBai, onMoGhiChu, laCheDoHocThu, soVideoHocThu, onMuaKhoaHoc }) => {
    const navigate = useNavigate();
    const userInfo = getUserInfo();
    const userDisplayName = userInfo?.hoTen || userInfo?.taiKhoan || 'Học viên';
    const userInitial = userDisplayName.trim().charAt(0).toUpperCase() || 'H';
    const userAvatar = userInfo?.anhDaiDien;

    // Logic vẽ vòng tròn tiến độ SVG
    const radius = 16; 
    const circumference = 2 * Math.PI * radius; 
    const percent = tongSoBai > 0 ? (soBaiDaHoc / tongSoBai) * 100 : 0;
    const offset = circumference - (percent / 100) * circumference;

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/khoa-hoc-cua-toi');
        }
    };

    return (
        <header className="cp-header">
            <div className="cp-header-left">
                <button
                    type="button"
                    onClick={handleBack}
                    className="cp-back"
                    title="Quay lại danh sách khóa học"
                    style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '50%', width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div className="cp-course-title-meta">
                    <span>Nội dung khóa học</span>
                    <span id="cpCourseTitle" style={{ fontWeight: 600 }} title={tenKhoaHoc}>{tenKhoaHoc}</span>
                </div>
            </div>

            {laCheDoHocThu && (
                <div className="cp-header-center d-none d-lg-flex align-items-center gap-3 me-3">
                    <div 
                        className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                        style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            color: '#fff',
                            fontSize: '0.82rem'
                        }}
                    >
                        <span className="badge bg-warning text-dark fw-bold px-2 py-1" style={{ fontSize: '0.72rem', borderRadius: '6px' }}>
                            <i className="fas fa-crown me-1 text-danger"></i> DÙNG THỬ
                        </span>
                        <span>Đang xem {soVideoHocThu ?? 2} bài học đầu tiên</span>
                    </div>

                    <button
                        type="button"
                        className="btn btn-buy-glow d-inline-flex align-items-center gap-2"
                        onClick={onMuaKhoaHoc}
                    >
                        <i className="fas fa-shopping-cart text-warning me-1"></i>
                        <span>MUA KHÓA HỌC NGAY</span>
                        <i className="fas fa-arrow-right ms-1"></i>
                    </button>
                </div>
            )}
            
            <div className="cp-header-right">
                {laCheDoHocThu && (
                    <button
                        type="button"
                        className="btn btn-buy-glow btn-sm d-lg-none me-2"
                        onClick={onMuaKhoaHoc}
                        style={{ padding: '6px 14px !important', fontSize: '0.78rem !important' }}
                    >
                        <i className="fas fa-shopping-cart me-1"></i> Mua ngay
                    </button>
                )}

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
                    <div className="cp-user-avatar" style={{ overflow: 'hidden' }}>
                        {userAvatar ? (
                            <img src={userAvatar} alt={userDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <span>{userDisplayName}</span>
                </div>
            </div>
        </header>
    );
};