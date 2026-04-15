import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { getDeviceInfo } from '../../utils/deviceHelper';
import { FaArrowLeft } from 'react-icons/fa';
import ReCAPTCHA from "react-google-recaptcha";

const DangNhap: React.FC = () => {
    const navigate = useNavigate();
    
    // State quản lý luồng
    const [step, setStep] = useState<1 | 2>(1); // 1: Login, 2: OTP
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string; otp?: string }>({});

    // State dữ liệu form
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showCaptcha, setShowCaptcha] = useState(false); 
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const GOOGLE_CLIENT_ID = "936326067432-hcndgs9gnnfculp14smdl8e6bnqb4is9.apps.googleusercontent.com";
    const FACEBOOK_APP_ID = "994470786348116";
    
    const redirectByUserRole = (user: any) => {
        const role = user.vaiTro !== undefined ? user.vaiTro : user.VaiTro;
        if (role === 0) navigate('/quan-tri-vien'); 
        else if (role === 1) navigate('/giang-vien');
        else navigate('/');
        window.location.reload();
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!emailOrUsername.trim()) newErrors.identifier = "Vui lòng nhập tài khoản hoặc email";
        if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Hàm gọi API Đăng nhập tái sử dụng
    const performLogin = async (token?: string) => {
        setIsLoading(true);
        try {
            // Mặc định captcha sẽ là "SKIP_CAPTCHA" nếu tham số token không được truyền
            const response: any = await authService.login(emailOrUsername, password, token || "SKIP_CAPTCHA");
            
            if (response.requiresOtp) {
                setStep(2);
                Swal.fire({ icon: 'info', title: 'Thiết bị mới', text: response.message, timer: 2000, showConfirmButton: false });
            } else if (response.requiresCaptcha) {
                setShowCaptcha(true);
                setErrors({}); 
            } else if (response.token) {
                handleLoginSuccess(response);
            }
        } catch (error: any) {
            setErrors({ identifier: error.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!" });
            setCaptchaToken(null);
            setShowCaptcha(false);
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
                taiKhoan: emailOrUsername,
                otpCode: otp
            });
            handleLoginSuccess(response);
        } catch (error: any) {
            setErrors({ otp: error.response?.data?.message || "Mã OTP không chính xác!" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = async (res: any) => {
        localStorage.setItem('user_token', res.token);
        localStorage.setItem('refresh_token', res.refreshToken); // Lưu refresh token
        localStorage.setItem('user_info', JSON.stringify(res.user));
        await Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đăng nhập thành công!', timer: 1500, showConfirmButton: false });
        redirectByUserRole(res.user);
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                                                <input type="text" className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
                                                    placeholder="Tài khoản hoặc Email" value={emailOrUsername} onChange={(e) => {setEmailOrUsername(e.target.value); setErrors({})}} disabled={isLoading || showCaptcha} />
                                                <label>Email của bạn</label>
                                                {errors.identifier && <div className="invalid-feedback">{errors.identifier}</div>}
                                            </div>
                                        </div>

                                        <div className="col-12 text-start">
                                            <div className="form-floating">
                                                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                    placeholder="Mật khẩu" value={password} onChange={(e) => {setPassword(e.target.value); setErrors({})}} disabled={isLoading || showCaptcha} />
                                                <label>Mật khẩu</label>
                                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                            </div>
                                        </div>

                                        {/* WIDGET CAPTCHA - Chỉ hiện khi Backend yêu cầu */}
                                        {showCaptcha && (
                                            <div className="col-12 d-flex flex-column align-items-center my-2 animate__animated animate__zoomIn">
                                                <p className="small text-success fw-bold mb-2">Vui lòng xác thực Captcha.</p>
                                                <ReCAPTCHA
                                                    sitekey="6Legm5csAAAAABr5FTIC25geZIxrxlmF5ORzuiYt"
                                                    onChange={onCaptchaVerify}
                                                />
                                            </div>
                                        )}

                                        <div className="col-12 text-end">
                                            <Link to="/quen-mat-khau" className="text-decoration-none small" style={{ color: '#fb873f' }}>Quên mật khẩu?</Link>
                                        </div>

                                        {/* Chỉ hiện nút đăng nhập khi chưa show captcha */}
                                        {!showCaptcha && (
                                            <>
                                                <div className="col-12">
                                                    <button className="btn btn-primary w-100 py-3 text-white border-0 fw-bold rounded-pill" type="submit" style={{ backgroundColor: '#fb873f' }} disabled={isLoading}>
                                                        {isLoading ? "Đang xử lý..." : "Tiếp theo"}
                                                    </button>
                                                </div>

                                                <div className="col-12 my-3 text-center position-relative">
                                                    <hr />
                                                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted">Hoặc đăng nhập với</span>
                                                </div>

                                                <div className="col-12 d-flex gap-2">
                                                    <div className="w-100">
                                                        <GoogleLogin
                                                            onSuccess={async (credentialResponse) => {
                                                                try {
                                                                    setIsLoading(true);
                                                                    const decoded: any = JSON.parse(atob(credentialResponse.credential!.split('.')[1]));
                                                                    const { maThietBi, tenThietBi } = getDeviceInfo();
                                                                    // Gọi API Backend mới
                                                                    const response: any = await authService.googleLogin({ 
                                                                        email: decoded.email, 
                                                                        name: decoded.name, 
                                                                        picture: decoded.picture 
                                                                    }, maThietBi, tenThietBi);
                                                                    handleLoginSuccess(response);
                                                                } catch (error: any) {
                                                                    Swal.fire('Lỗi', error.response?.data?.message || 'Đăng nhập Google thất bại', 'error');
                                                                } finally {
                                                                    setIsLoading(false);
                                                                }
                                                            }}
                                                            onError={() => {
                                                                Swal.fire('Lỗi', 'Đăng nhập Google thất bại', 'error');
                                                            }}
                                                            useOneTap
                                                            theme="outline"
                                                            width="100%"
                                                        />
                                                    </div>
                                                    <div className="w-100">
                                                        <FacebookLogin
                                                            appId={FACEBOOK_APP_ID}
                                                            scope="public_profile,email"
                                                            fields="name,email,picture"
                                                            onProfileSuccess={async (response: any) => {
                                                                try {
                                                                    setIsLoading(true);
                                                                    const { maThietBi, tenThietBi } = getDeviceInfo();
                                                                    
                                                                    const fbData = {
                                                                        email: response.email || `${response.id}@facebook.com`,
                                                                        name: response.name,
                                                                        picture: response.picture?.data?.url || response.picture || "",
                                                                        userID: response.id
                                                                    };

                                                                    const fbResponse: any = await authService.facebookLogin(fbData, maThietBi, tenThietBi);
                                                                    handleLoginSuccess(fbResponse);
                                                                } catch (error: any) {
                                                                    const msg = error.response?.data?.message || error.message || 'Đăng nhập Facebook thất bại';
                                                                    Swal.fire('Lỗi', msg, 'error');
                                                                } finally {
                                                                    setIsLoading(false);
                                                                }
                                                            }}
                                                            onFail={(error) => {
                                                                console.error('FB Login Fail:', error);
                                                                Swal.fire('Lỗi', 'Kết nối với Facebook thất bại', 'error');
                                                            }}
                                                            render={({ onClick }) => (
                                                                <button onClick={onClick} className="btn btn-outline-primary w-100 py-2 fw-bold rounded-3 d-flex align-items-center justify-content-center" style={{ height: '40px', borderColor: '#dee2e6', color: '#666' }}>
                                                                    <i className="bi bi-facebook me-2" style={{ color: '#1877F2' }}></i> Facebook
                                                                </button>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="col-12 mt-4 d-flex justify-content-between align-items-center">
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
                                    <button className="btn btn-link text-decoration-none text-muted p-0 mb-3" onClick={() => { setStep(1); setOtp(''); setShowCaptcha(false); }}>
                                        <FaArrowLeft className="me-1" /> Quay lại
                                    </button>
                                    <h2 className="h4 mb-3 fw-bold">Xác thực thiết bị</h2>
                                    <p className="small text-muted">Vui lòng nhập mã OTP vừa được gửi đến Email của bạn để đăng nhập trên thiết bị này.</p>
                                    
                                    <div className="form-floating my-4 text-start">
                                        <input type="text" className={`form-control text-center fs-3 fw-bold ${errors.otp ? 'is-invalid' : ''}`} 
                                            maxLength={6} value={otp} autoFocus onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, '')); setErrors({}); }} />
                                        <label>Nhập mã 6 chữ số</label>
                                        {errors.otp && <div className="invalid-feedback text-center">{errors.otp}</div>}
                                    </div>

                                    <button className="btn btn-primary w-100 py-3 mb-3 text-white border-0 fw-bold rounded-pill" 
                                        style={{ backgroundColor: '#fb873f' }} onClick={handleVerifyOtp} disabled={otp.length !== 6 || isLoading}>
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