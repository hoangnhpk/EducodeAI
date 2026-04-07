import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { authService } from '@/services/auth.service';

const DoiMatKhau: React.FC = () => {
    const [step, setStep] = useState<1 | 2>(1); // 1: Nhập pass, 2: Nhập OTP
    const [matKhauCu, setMatKhauCu] = useState('');
    const [matKhauMoi, setMatKhauMoi] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (matKhauMoi !== confirmPass) {
            Swal.fire('Lỗi', 'Mật khẩu nhập lại không khớp!', 'error');
            return;
        }
        if (matKhauMoi.length < 8) {
            Swal.fire('Lỗi', 'Mật khẩu mới phải từ 8 ký tự!', 'error');
            return;
        }

        setLoading(true);
        try {
            await authService.requestOtpDoiMatKhau();
            setStep(2);
            setCountdown(120);
            Swal.fire('Thành công', 'Mã OTP đã được gửi đến email của bạn!', 'success');
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (otp.length !== 6) {
            Swal.fire('Lỗi', 'Vui lòng nhập đủ 6 số OTP', 'warning');
            return;
        }

        setLoading(true);
        try {
            await authService.doiMatKhau({
                MatKhauCu: matKhauCu,
                MatKhauMoi: matKhauMoi,
                OtpCode: otp
            });
            await Swal.fire('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
            localStorage.clear();
            window.location.href = '/dang-nhap';
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Mã OTP hoặc mật khẩu cũ không đúng', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold">Bảo mật tài khoản</h2>
                            <p className="text-muted">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleRequestOtp}>
                                <div className="form-floating mb-3">
                                    <input type="password" underline-none className="form-control rounded-3" placeholder="Old Pass" 
                                        value={matKhauCu} onChange={e => setMatKhauCu(e.target.value)} required />
                                    <label>Mật khẩu hiện tại</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="password" underline-none className="form-control rounded-3" placeholder="New Pass" 
                                        value={matKhauMoi} onChange={e => setMatKhauMoi(e.target.value)} required />
                                    <label>Mật khẩu mới</label>
                                </div>
                                <div className="form-floating mb-4">
                                    <input type="password" underline-none className="form-control rounded-3" placeholder="Confirm Pass" 
                                        value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                                    <label>Nhập lại mật khẩu mới</label>
                                </div>
                                <button className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white border-0" 
                                    style={{ backgroundColor: '#fb873f' }} disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Tiếp tục xác minh OTP'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <p>Mã OTP đã được gửi đến email liên kết với tài khoản này.</p>
                                <div className="form-floating mb-4">
                                    <input type="text" className="form-control text-center fs-3 fw-bold rounded-3" 
                                        maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} placeholder="000000" />
                                    <label>Nhập mã 6 chữ số</label>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light flex-grow-1 py-3 rounded-pill fw-bold" 
                                        onClick={() => setStep(1)}>Quay lại</button>
                                    <button className="btn btn-primary flex-grow-1 py-3 rounded-pill fw-bold text-white border-0" 
                                        style={{ backgroundColor: '#fb873f' }} onClick={handleUpdatePassword} disabled={loading}>
                                        {loading ? 'Đang xác nhận...' : 'Đổi mật khẩu'}
                                    </button>
                                </div>
                                {countdown > 0 ? (
                                    <p className="mt-3 text-muted small">Gửi lại mã sau {countdown}s</p>
                                ) : (
                                    <button className="btn btn-link mt-2 text-decoration-none small" style={{ color: '#fb873f' }} onClick={handleRequestOtp}>
                                        Gửi lại mã OTP
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoiMatKhau;
