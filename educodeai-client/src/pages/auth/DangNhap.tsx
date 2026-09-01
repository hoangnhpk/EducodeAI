import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { getDeviceInfo } from '../../utils/deviceHelper';
import { FaArrowLeft } from 'react-icons/fa';
import ReCAPTCHA from "react-google-recaptcha";
import { markLoginSucceeded } from '../../utils/authLifecycle';
import { setAuthTokens } from '../../utils/authStorage';
import { classifyLoginResponse, type LoginUser } from './loginFlow';
import PasswordInput from '../../components/PasswordInput';
import { RECAPTCHA_SITE_KEY } from '../../configs/captcha';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

if (!GOOGLE_CLIENT_ID) {
    throw new Error('Thiếu cấu hình VITE_GOOGLE_CLIENT_ID.');
}

const DangNhap: React.FC = () => {
    const navigate = useNavigate();
    const recaptchaRef = useRef<any>(null);
    
    // State quản lý luồng
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Login, 2: OTP, 3: Replace Device
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string; otp?: string }>({});
    const [replaceDeviceInfo, setReplaceDeviceInfo] = useState<{ oldestDeviceName: string; email: string } | null>(null);
    const [continuationEmail, setContinuationEmail] = useState('');

    // State dữ liệu form
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showCaptcha, setShowCaptcha] = useState(false); 
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);


    const redirectByUserRole = (user: LoginUser) => {
        const role = user.vaiTro !== undefined ? user.vaiTro : user.VaiTro;
        if (role === 0) navigate('/quan-tri-vien');
        else if (role === 1) navigate('/giang-vien');
        else navigate('/');
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!emailOrUsername.trim()) newErrors.identifier = "Vui lòng nhập tài khoản hoặc email";
        if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSuccess = async (token: string, user: LoginUser) => {
        markLoginSucceeded();
        setAuthTokens(token);
        localStorage.setItem('user_info', JSON.stringify(user));
        redirectByUserRole(user);
    };

    const handleLoginResponse = async (response: Record<string, unknown>) => {
        const outcome = classifyLoginResponse(response);
        if (outcome.kind === 'completed') {
            await handleLoginSuccess(outcome.token, outcome.user);
            return;
        }
        if (outcome.kind === 'otp') {
            setContinuationEmail(outcome.email);
            setStep(2);
            await Swal.fire({ icon: 'info', title: 'Thiết bị mới', text: outcome.message, timer: 2000, showConfirmButton: false });
            return;
        }
        if (outcome.kind === 'replacement') {
            setReplaceDeviceInfo({ oldestDeviceName: outcome.oldestDeviceName, email: outcome.email });
            const result = await Swal.fire({
                title: 'Giới hạn đăng nhập',
                text: `Tài khoản đã đạt giới hạn 3 thiết bị. Bạn có muốn đăng xuất thiết bị "${outcome.oldestDeviceName}" để tiếp tục không?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý, thay thế',
                cancelButtonText: 'Hủy bỏ',
                confirmButtonColor: '#fb873f',
                reverseButtons: true
            });
            if (result.isConfirmed) setStep(3);
            return;
        }
        if (outcome.kind === 'captcha') {
            setShowCaptcha(true);
            setErrors({ identifier: outcome.message || 'Vui lòng xác thực Captcha.' });
            return;
        }
        throw new Error('Phản hồi đăng nhập không hợp lệ');
    };

    // Hàm gọi API Đăng nhập tái sử dụng
    const performLogin = async (token?: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login(emailOrUsername, password, token);
            
            await handleLoginResponse(response);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!";
            setErrors({ identifier: errorMsg });
            setCaptchaToken(null);
            
            // LUÔN RESET CAPTCHA KHI CÓ LỖI (để người dùng không bị kẹt dấu tích xanh)
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            
            if (errorMsg.includes("thành công")) {
                // ĐÁP ỨNG YÊU CẦU: Nếu đã xác minh Captcha xong nhưng sai pass, ẩn Captcha và bắt nhập lại
                setShowCaptcha(false);
                setPassword(''); // Xóa mật khẩu để người dùng nhập lại từ đầu
            } else if (errorMsg.includes("3/3") || errorMsg.includes("4/3")) {
                setShowCaptcha(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // BƯỚC 1: Xử lý Submit Form (Mật khẩu)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (showCaptcha && !captchaToken) {
            setErrors({ identifier: "Vui lòng xác thực Captcha trước khi đăng nhập!" });
            return;
        }

        // Gọi hàm performLogin, nếu đã có captchaToken thì truyền vào, không thì undefined
        await performLogin(captchaToken || undefined);
    };

    // Khi người dùng tích vào Captcha thành công
    const onCaptchaVerify = async (token: string | null) => {
        setCaptchaToken(token);
        if (token) {
            // Bỏ qua new Event('submit'), gọi thẳng hàm xử lý API với token mới nhận được
             await performLogin(token);
        }
    };

    // BƯỚC 2: Xử lý Xác thực OTP cho thiết bị mới
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setErrors({ otp: "Mã OTP phải gồm 6 chữ số" });
            return;
        }

        setIsLoading(true);
        try {
            // Đã đổi tên hàm thành confirmLogin
            const response: any = await authService.confirmLogin({
                taiKhoan: continuationEmail || emailOrUsername.trim(),
                otpCode: otp
            });
            await handleLoginResponse(response);
        } catch (error: any) {
            setErrors({ otp: error.response?.data?.message || "Mã OTP không chính xác!" });
        } finally {
            setIsLoading(false);
        }
    };

    // BƯỚC 3: Xử lý Xác thực OTP thay thế thiết bị
    const handleVerifyReplaceDevice = async () => {
        if (otp.length !== 6) {
            setErrors({ otp: "Mã OTP phải gồm 6 chữ số" });
            return;
        }

        setIsLoading(true);
        try {
            const response: any = await authService.confirmReplaceDevice({
                taiKhoan: replaceDeviceInfo?.email || emailOrUsername,
                otpCode: otp
            });
            await handleLoginResponse(response);
        } catch (error: any) {
            setErrors({ otp: error.response?.data?.message || "Mã OTP không chính xác!" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="vi">
            <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/img/carousel-1.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}>
                <div className="container">
                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-5 shadow-lg p-4 bg-white rounded-4 animate__animated animate__fadeIn">
                            
                            {step === 1 ? (
                                <form onSubmit={handleLogin} noValidate>
                                    <div className="text-center mb-4">
                                        <Link to="/" className="d-flex align-items-center justify-content-center text-decoration-none mb-3" translate="no">
                                            <p className="m-0 fw-bold text-dark" style={{ fontSize: 25 }}>
                                                EDUCODE<span style={{ color: "#fb873f" }}>AI</span>
                                            </p>
                                        </Link>
                                        <h1 className="h3 mb-2 fw-bold">Đăng nhập</h1>
                                        <p className="text-muted small">Truy cập vào hệ thống EduCodeAI</p>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12 text-start">
                                            <div className="form-floating">
                                                <input id="login-identifier" type="text" className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
                                                    placeholder="Tài khoản hoặc Email" value={emailOrUsername} onChange={(e) => {setEmailOrUsername(e.target.value); setErrors({})}} disabled={isLoading}
                                                    aria-invalid={Boolean(errors.identifier)} aria-describedby={errors.identifier ? 'login-identifier-error' : undefined} />
                                                <label htmlFor="login-identifier">Email hoặc tài khoản</label>
                                                {errors.identifier && <div id="login-identifier-error" className="invalid-feedback" role="alert">{errors.identifier}</div>}
                                            </div>
                                        </div>

                                        <div className="col-12 text-start">
                                            <PasswordInput
                                                id="login-password"
                                                label="Mật khẩu"
                                                floating
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder="Mật khẩu"
                                                value={password}
                                                onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                                                disabled={isLoading}
                                                autoComplete="current-password"
                                                error={errors.password}
                                            />
                                        </div>

                                        <div className="col-12 text-end">
                                            <Link to="/quen-mat-khau" className="text-decoration-none small" style={{ color: '#fb873f' }}>Quên mật khẩu?</Link>
                                        </div>

                                        {/* WIDGET CAPTCHA - Chỉ hiện khi Backend yêu cầu */}
                                        {showCaptcha && (
                                            <div className="col-12 d-flex flex-column align-items-center my-2 animate__animated animate__zoomIn">
                                                <p className="small text-danger fw-bold mb-2">Vui lòng xác thực mã bên dưới.</p>
                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey={RECAPTCHA_SITE_KEY || 'invalid-site-key'}
                                                    onChange={onCaptchaVerify}
                                                />
                                            </div>
                                        )}

                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-3 text-white border-0 fw-bold rounded-pill" 
                                                type="submit" style={{ backgroundColor: '#fb873f' }} 
                                                disabled={isLoading || (showCaptcha && !captchaToken)}>
                                                {isLoading ? "Đang xử lý..." : "Tiếp theo"}
                                            </button>
                                        </div>

                                        {!showCaptcha && (
                                            <>
                                                <div className="col-12 text-center position-relative">
                                                    <hr />
                                                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted">Hoặc đăng nhập với</span>
                                                </div>

                                                <div className="col-12 d-flex">
                                                    <div className="w-100 google-login-button">
                                                        <GoogleLogin
                                                            onSuccess={async (credentialResponse) => {
                                                                try {
                                                                    setIsLoading(true);
                                                                    const { maThietBi, tenThietBi } = getDeviceInfo();
                                                                    // E.5: gửi credential (id_token) thô để backend verify với Google.
                                                                    const response: any = await authService.googleLogin({
                                                                        credential: credentialResponse.credential!
                                                                    }, maThietBi, tenThietBi);
                                                                    await handleLoginResponse(response);
                                                                } catch (error: any) {
                                                                    Swal.fire('Lỗi', error.response?.data?.message || 'Đăng nhập Google thất bại', 'error');
                                                                } finally {
                                                                    setIsLoading(false);
                                                                }
                                                            }}
                                                            onError={() => {
                                                                const currentOrigin = window.location.origin;
                                                                console.error(`Google Login failed before backend call. Check Google OAuth origin: ${currentOrigin} and popup/cookie settings.`);
                                                                Swal.fire('Lỗi', `Google OAuth thất bại trước khi gọi API. Kiểm tra OAuth Client ID và Authorized JavaScript origins có ${currentOrigin}.`, 'error');
                                                            }}
                                                            ux_mode="popup"
                                                            theme="outline"
                                                            text="signin_with"
                                                            size="large"
                                                            width="560"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="col-12 mt-4 d-flex justify-content-between align-items-center login-footer-links">
                                            <Link to="/" className="text-decoration-none fw-bold small" style={{ color: '#fb873f' }}>
                                                <i className="bi bi-house-door-fill me-1"></i> Trang chủ
                                            </Link>
                                            <p className="mb-0 small">
                                                Chưa có tài khoản? <Link className="text-decoration-none fw-bold" style={{ color: '#fb873f' }} to="/dang-ky">Đăng ký ngay</Link>
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center animate__animated animate__fadeIn">
                                    <button type="button" className="btn btn-link text-decoration-none text-muted p-0 mb-3" onClick={() => { setStep(1); setOtp(''); setShowCaptcha(false); }}>
                                        <FaArrowLeft className="me-1" /> Quay lại
                                    </button>
                                    <h2 className="h4 mb-3 fw-bold">
                                        {step === 3 ? "Xác nhận thay thế" : "Xác thực thiết bị"}
                                    </h2>
                                    <p className="small text-muted">
                                        {step === 3 
                                            ? `Nhập mã OTP để xác nhận đăng xuất thiết bị ${replaceDeviceInfo?.oldestDeviceName} và đăng nhập thiết bị này.`
                                            : "Vui lòng nhập mã OTP vừa được gửi đến Email của bạn để đăng nhập trên thiết bị này."}
                                    </p>
                                    
                                    <div className="form-floating my-4 text-start">
                                        <input id="login-otp" type="text" className={`form-control text-center fs-3 fw-bold ${errors.otp ? 'is-invalid' : ''}`}
                                            maxLength={6} inputMode="numeric" autoComplete="one-time-code" value={otp} autoFocus
                                            aria-invalid={Boolean(errors.otp)} aria-describedby={errors.otp ? 'login-otp-error' : 'login-otp-help'}
                                            onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, '')); setErrors({}); }} />
                                        <label htmlFor="login-otp">Nhập mã 6 chữ số</label>
                                        <div id="login-otp-help" className="visually-hidden">Mã xác thực một lần gồm 6 chữ số được gửi qua email.</div>
                                        {errors.otp && <div id="login-otp-error" className="invalid-feedback text-center" role="alert">{errors.otp}</div>}
                                    </div>

                                    <button className="btn btn-primary w-100 py-3 mb-3 text-white border-0 fw-bold rounded-pill" 
                                        style={{ backgroundColor: '#fb873f' }} 
                                        onClick={step === 3 ? handleVerifyReplaceDevice : handleVerifyOtp} 
                                        disabled={otp.length !== 6 || isLoading}>
                                        {isLoading ? <span className="spinner-border spinner-border-sm"></span> : "Xác nhận và Đăng nhập"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default DangNhap;
