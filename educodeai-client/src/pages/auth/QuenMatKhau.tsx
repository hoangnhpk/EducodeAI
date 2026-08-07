import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import ReCAPTCHA from "react-google-recaptcha";
import { setAuthTokens } from '../../utils/authStorage';

import { FaArrowLeft } from 'react-icons/fa';
import PasswordInput from '../../components/PasswordInput';
import { RECAPTCHA_SITE_KEY } from '../../configs/captcha';

const QuenMatKhau: React.FC = () => {

    const [step, setStep] = useState<'forgot' | 'reset' | 'replace'>('forgot');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State quản lý lỗi và thay thế thiết bị
    const [errors, setErrors] = useState<any>({});
    const [replaceDeviceInfo, setReplaceDeviceInfo] = useState<{ oldestDeviceName: string; email: string } | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string>('');

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleLoginSuccess = async (res: any) => {
        // Đảm bảo dữ liệu không bị null
        if (!res || !res.token) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không nhận được thông tin đăng nhập từ hệ thống.' });
            window.location.href = '/dang-nhap';
            return;
        }

        setAuthTokens(res.token);
        // Refresh token do backend đặt trong cookie HttpOnly; frontend không lưu/đọc.
        localStorage.setItem('user_info', JSON.stringify(res.user));
        
        await Swal.fire({ 
            icon: 'success', 
            title: 'Thành công', 
            text: 'Đặt lại mật khẩu và đăng nhập thành công!', 
            timer: 2000, 
            showConfirmButton: false 
        });
        
        // Lấy vai trò để chuyển hướng
        const role = res.user.vaiTro !== undefined ? res.user.vaiTro : res.user.VaiTro;
        
        // Sử dụng window.location.href để chuyển hướng và làm mới toàn bộ trạng thái app (Clean Session)
        if (role === 0) window.location.href = '/quan-tri-vien';
        else if (role === 1) window.location.href = '/giang-vien';
        else window.location.href = '/';
    };

    // 1. Gửi OTP qua Email
    const handleSendCode = async () => {
        if (!email) {
            setErrors({ email: 'Vui lòng nhập email để nhận mã' });
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Định dạng email không hợp lệ' });
            return;
        }
        if (!captchaToken) {
            setErrors({ captcha: 'Vui lòng xác thực bạn không phải robot' });
            return;
        }

        setLoading(true);
        setErrors({});
        setOtp('');
        try {
            const res: any = await authService.forgotPasswordSendOtp(email, captchaToken);
            if (res) {
                setCountdown(120);
                Swal.fire({ icon: 'success', text: "Mã xác thực đã được gửi tới email của bạn!", timer: 1500, showConfirmButton: false });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error?.message
                || error.response?.data?.message
                || "Không thể gửi mã xác thực lúc này. Vui lòng thử lại sau.";
            setErrors({ email: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // 2. Nhập mã OTP. Không tự chuyển bước chỉ vì đủ 6 chữ số:
    // OTP chỉ được backend xác thực khi gửi yêu cầu đặt lại mật khẩu.
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
        setErrors((previous: any) => ({ ...previous, otp: null }));
    };

    const handleContinueToReset = async () => {
        if (otp.length !== 6) {
            setErrors((previous: any) => ({ ...previous, otp: 'Mã OTP phải gồm đúng 6 chữ số.' }));
            return;
        }

        setLoading(true);
        try {
            const response: any = await authService.verifyForgotPasswordOtp(email, otp);
            if (!response?.resetToken) {
                throw new Error('Không nhận được phiên đặt lại mật khẩu.');
            }

            setResetToken(response.resetToken);
            setErrors({});
            setStep('reset');
        } catch (error: any) {
            setErrors((previous: any) => ({
                ...previous,
                otp: error.response?.data?.error?.message
                    || error.response?.data?.message
                    || 'Mã OTP không chính xác hoặc đã hết hạn.'
            }));
        } finally {
            setLoading(false);
        }
    };

    // 3. Cập nhật mật khẩu mới
    const handleResetPassword = async () => {
        const newErrors: any = {};
        if (password.length < 8) newErrors.password = "Mật khẩu mới phải từ 8 ký tự trở lên";
        if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response: any = await authService.resetPassword({
                Email: email,
                NewPassword: password,
                ResetToken: resetToken
            });

            if (response.requiresLogoutOldest) {
                setReplaceDeviceInfo({ oldestDeviceName: response.oldestDeviceName, email: response.email });
                const result = await Swal.fire({ 
                    title: 'Giới hạn đăng nhập', 
                    html: `Mật khẩu đã đổi thành công! Tuy nhiên tài khoản đã đạt giới hạn 3 thiết bị.<br/><br/>Bạn có muốn đăng xuất thiết bị <b>${response.oldestDeviceName}</b> để tiếp tục truy cập không?`, 
                    icon: 'warning', 
                    showCancelButton: true, 
                    confirmButtonText: 'Đồng ý, thay thế', 
                    cancelButtonText: 'Để sau', 
                    confirmButtonColor: '#fb873f', 
                    reverseButtons: true 
                });
                
                if (result.isConfirmed) {
                    setOtp(''); // Xóa OTP cũ để nhập OTP thay thế mới
                    setStep('replace');
                    Swal.fire({ icon: 'info', title: 'Xác nhận OTP', text: 'Hệ thống đã gửi một mã OTP mới để xác nhận thay thế thiết bị.', timer: 2500, showConfirmButton: false });
                } else {
                    window.location.href = '/dang-nhap';
                }
            } else if (response.loginData) {
                handleLoginSuccess(response.loginData);
            } else {
                await Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đặt lại mật khẩu thành công!' });
                window.location.href = '/dang-nhap';
            }

        } catch (error: any) {
            setErrors({ password: error.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu" });
        } finally {
            setLoading(false);
        }
    };

    // 4. Xác nhận OTP thay thế thiết bị
    const handleVerifyReplaceDevice = async () => {
        if (otp.length !== 6) {
            setErrors({ otp: "Mã OTP phải gồm 6 chữ số" });
            return;
        }

        setLoading(true);
        try {
            const response: any = await authService.confirmReplaceDevice({
                taiKhoan: replaceDeviceInfo?.email || email,
                otpCode: otp
            });
            handleLoginSuccess(response);
        } catch (error: any) {
            setErrors({ otp: error.response?.data?.message || "Mã OTP không chính xác!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
            style={{ 
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/img/carousel-1.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
            <div className="container">
                <div className="row g-4 justify-content-center">
                    <div className="col-lg-6 col-md-8 col-12 shadow-lg p-4 bg-white rounded-4 animate__animated animate__fadeIn" style={{ maxWidth: '550px' }}>
                        {step === 'forgot' ? (
                            <form id="step-forgot" onSubmit={(e) => e.preventDefault()}>
                                <div className="text-center mb-4">
                                    <h1 className="h3 mb-3 fw-bold">Quên mật khẩu?</h1>
                                    <p className="text-muted small">Nhập email và chúng tôi sẽ gửi mã khôi phục.</p>
                                </div>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                                placeholder="Email" 
                                                value={email} 
                                                onChange={(e) => { setEmail(e.target.value); setErrors({}); }} 
                                            />
                                            <label>Nhập email của bạn</label>
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="d-flex gap-2 align-items-start">
                                            <div className="form-floating flex-grow-1">
                                                <input type="text" 
                                                    className={`form-control ${errors.otp ? 'is-invalid' : ''}`} 
                                                    placeholder="6 chữ số" 
                                                    value={otp} 
                                                    onChange={handleOtpChange} 
                                                    maxLength={6} 
                                                />
                                                <label>Mã xác nhận (6 chữ số)</label>
                                                {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
                                            </div>
                                            <button type="button" className="btn btn-outline-primary py-3 rounded-3" 
                                                style={{ height: '58px', minWidth: '90px' }}
                                                disabled={countdown > 0 || loading} 
                                                onClick={handleSendCode}>
                                                {loading ? '...' : (countdown > 0 ? `${countdown}s` : 'Gửi mã')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-2 d-flex flex-column align-items-center">
                                        <ReCAPTCHA
                                            sitekey={RECAPTCHA_SITE_KEY || 'invalid-site-key'}
                                            onChange={(token) => {
                                                setCaptchaToken(token || '');
                                                if (errors.captcha) setErrors((prev: any) => ({ ...prev, captcha: null }));
                                            }}
                                        />
                                        {errors.captcha && <div className="text-danger small mt-1 text-center">{errors.captcha}</div>}
                                    </div>
                                    <div className="col-12 mt-3">
                                        <button type="button"
                                            className="btn btn-primary w-100 py-3 text-white fw-bold rounded-pill"
                                            style={{ backgroundColor: '#fb873f', border: 'none' }}
                                            onClick={handleContinueToReset}
                                            disabled={otp.length !== 6 || loading}>
                                            Tiếp tục đặt lại mật khẩu
                                        </button>
                                    </div>
                                    <div className="col-12 mt-3 text-center">
                                        <Link to="/dang-nhap" className="text-decoration-none small fw-bold" style={{color: '#fb873f'}}>Quay lại đăng nhập</Link>
                                    </div>
                                </div>
                            </form>
                        ) : step === 'reset' ? (
                            <form id="step-reset" onSubmit={(e) => e.preventDefault()}>
                                <div className="text-center mb-4">
                                    <h1 className="h3 mb-3 fw-bold">Đặt lại mật khẩu</h1>
                                    <p className="text-muted small">Nhập mật khẩu mới an toàn hơn cho tài khoản {email}.</p>
                                </div>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <PasswordInput
                                            id="reset-password"
                                            label="Mật khẩu mới"
                                            floating
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            placeholder="Mật khẩu mới"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                                            autoComplete="new-password"
                                            error={errors.password}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <PasswordInput
                                            id="reset-password-confirm"
                                            label="Nhập lại mật khẩu"
                                            floating
                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            placeholder="Nhập lại mật khẩu"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
                                            autoComplete="new-password"
                                            error={errors.confirmPassword}
                                        />
                                    </div>
                                    <button className="btn btn-primary w-100 py-3 mt-3 text-white fw-bold rounded-pill" 
                                        style={{backgroundColor: '#fb873f', border: 'none'}}
                                        disabled={loading}
                                        onClick={handleResetPassword}>
                                        {loading ? "Đang xử lý..." : "Cập nhật và Đăng nhập"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center animate__animated animate__fadeIn">
                                <button className="btn btn-link text-decoration-none text-muted p-0 mb-3" onClick={() => setStep('reset')}>
                                    <FaArrowLeft className="me-1" /> Quay lại
                                </button>
                                <h2 className="h4 mb-3 fw-bold">Xác nhận thay thế thiết bị</h2>
                                <p className="small text-muted">
                                    Vui lòng nhập mã OTP vừa được gửi đến Email để đăng xuất thiết bị <b>{replaceDeviceInfo?.oldestDeviceName}</b> và hoàn tất đăng nhập.
                                </p>
                                
                                <div className="form-floating my-4 text-start">
                                    <input type="text" className={`form-control text-center fs-3 fw-bold ${errors.otp ? 'is-invalid' : ''}`} 
                                        maxLength={6} value={otp} autoFocus onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, '')); setErrors({}); }} />
                                    <label>Nhập mã 6 chữ số</label>
                                    {errors.otp && <div className="invalid-feedback text-center">{errors.otp}</div>}
                                </div>

                                <button className="btn btn-primary w-100 py-3 mb-3 text-white border-0 fw-bold rounded-pill" 
                                    style={{ backgroundColor: '#fb873f' }} 
                                    onClick={handleVerifyReplaceDevice} 
                                    disabled={otp.length !== 6 || loading}>
                                    {loading ? "Đang xử lý..." : "Xác nhận và Vào hệ thống"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuenMatKhau;
