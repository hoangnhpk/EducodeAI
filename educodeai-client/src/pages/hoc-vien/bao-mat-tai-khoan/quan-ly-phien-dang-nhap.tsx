import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import ReCAPTCHA from "react-google-recaptcha";
import { authService } from '../../../services/auth.service';
import './bao-mat.css';

const QuanLyPhienDangNhap: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOtpDiv, setShowOtpDiv] = useState(false);
    const [otp, setOtp] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [logoutType, setLogoutType] = useState<'ALL' | 'SINGLE'>('ALL');
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res: any = await authService.getDanhSachThietBi();
            setSessions(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRemoteLogout = async (type: 'ALL' | 'SINGLE', sessionId?: number) => {
        setLogoutType(type);
        if (sessionId) setSelectedSessionId(sessionId);
        
        try {
            await authService.yeuCauOtpDangXuatTuXa();
            setShowOtpDiv(true);
            Swal.fire({ icon: 'info', title: 'Xác minh', text: 'Mã OTP xác nhận đã được gửi đến Email của bạn!', timer: 2500, showConfirmButton: false });
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    const handleConfirmRemoteLogout = async () => {
        if (!captchaToken) return Swal.fire('Cảnh báo', 'Vui lòng xác thực Captcha', 'warning');
        if (otp.length !== 6) return Swal.fire('Cảnh báo', 'Vui lòng nhập đủ 6 số OTP', 'warning');

        try {
            await authService.xacNhanDangXuatTuXa({
                DangXuatTatCa: logoutType === 'ALL',
                DanhSachMaPhien: logoutType === 'SINGLE' && selectedSessionId ? [selectedSessionId] : [],
                OtpCode: otp,
                CaptchaToken: captchaToken
            });
            Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã đăng xuất thiết bị an toàn.', timer: 2000, showConfirmButton: false});
            setShowOtpDiv(false);
            setOtp('');
            fetchSessions();
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn', 'error');
        }
    };

    return (
        <div className="container py-4" style={{ maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0"><i className="bi bi-pc-display-horizontal me-2 text-orange"></i>Thiết bị đăng nhập</h4>
                <button className="btn btn-outline-danger btn-sm px-3 py-2 fw-bold" onClick={() => handleRequestRemoteLogout('ALL')}>
                    <i className="bi bi-box-arrow-right me-1"></i> Đăng xuất tất cả thiết bị khác
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="list-group list-group-flush">
                    {loading ? (
                        <div className="text-center p-5 text-muted">
                            <span className="spinner-border spinner-border-sm me-2"></span> Đang tải dữ liệu...
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center p-4 text-muted">Không tìm thấy phiên đăng nhập nào.</div>
                    ) : sessions.map(s => (
                        <div key={s.maPhien} className="list-group-item device-item d-flex justify-content-between align-items-center p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                                    <i className={`bi ${s.tenThietBi.toLowerCase().includes('windows') ? 'bi-windows text-primary' : s.tenThietBi.toLowerCase().includes('mac') ? 'bi-apple text-dark' : 'bi-phone text-secondary'} fs-4`}></i>
                                </div>
                                <div>
                                    <h6 className="mb-1 fw-bold">{s.tenThietBi}</h6>
                                    {s.isCurrentDevice ? (
                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                            <i className="bi bi-check-circle-fill me-1"></i> Thiết bị này
                                        </span>
                                    ) : (
                                        <small className="text-muted"><i className="bi bi-clock me-1"></i> Hoạt động: {new Date(s.thoiGianHoatDongCuoi).toLocaleString()}</small>
                                    )}
                                </div>
                            </div>
                            
                            {!s.isCurrentDevice && (
                                <button className="btn btn-light btn-sm text-danger fw-bold px-3" onClick={() => handleRequestRemoteLogout('SINGLE', s.maPhien)}>
                                    Đăng xuất
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showOtpDiv && (
                <div className="card mt-4 border-0 shadow rounded-4 animate__animated animate__fadeInUp">
                    <div className="card-body p-4 bg-danger bg-opacity-10 rounded-4">
                        <div className="d-flex align-items-center mb-3">
                            <i className="bi bi-shield-lock-fill text-danger fs-3 me-2"></i>
                            <div>
                                <h5 className="text-danger fw-bold m-0">Xác nhận bảo mật</h5>
                                <p className="small text-danger m-0 opacity-75">Hành động này cần xác minh để đảm bảo an toàn cho tài khoản.</p>
                            </div>
                        </div>
                        
                        <div className="row g-3 align-items-center justify-content-center mt-2">
                            <div className="col-12 col-md-4">
                                <input type="text" className="form-control form-control-lg text-center fw-bold otp-input" placeholder="Mã OTP" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                            </div>
                            <div className="col-12 col-md-5 d-flex justify-content-center">
                                <ReCAPTCHA sitekey="THAY_BANG_SITE_KEY_CUA_BAN" onChange={(token) => setCaptchaToken(token || '')} />
                            </div>
                            <div className="col-12 col-md-3 d-flex flex-column gap-2">
                                <button className="btn btn-danger py-2 fw-bold w-100" onClick={handleConfirmRemoteLogout}>Xác nhận</button>
                                <button className="btn btn-outline-secondary py-2 w-100" onClick={() => {setShowOtpDiv(false); setOtp('');}}>Hủy bỏ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyPhienDangNhap;