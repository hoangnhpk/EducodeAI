import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import Swal from 'sweetalert2';
// 1. IMPORT THƯ VIỆN CAPTCHA
import ReCAPTCHA from "react-google-recaptcha";
import { setAuthTokens } from '../../utils/authStorage';
import { FaArrowLeft } from 'react-icons/fa';
import PasswordInput from '../../components/PasswordInput';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '', email: '', fullname: '', password: ''
    });

    const [errors, setErrors] = useState<any>({});
    const [isEmailAvailable, setIsEmailAvailable] = useState(true);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [strength, setStrength] = useState(0);

    // 2. STATE LƯU TOKEN CAPTCHA
    const [captchaToken, setCaptchaToken] = useState<string>('');

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const checkEmailExists = async (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return;

        setIsCheckingEmail(true);
        try {
            const res: any = await authService.checkEmail(email);
            if (res.exists) {
                setIsEmailAvailable(false);
                setErrors((prev: any) => ({ ...prev, email: "Email này đã được đăng ký sử dụng!" }));
            } else {
                setIsEmailAvailable(true);
                setErrors((prev: any) => ({ ...prev, email: null }));
            }
        } catch (error) {
            console.error("Lỗi kiểm tra email:", error);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (errors[id]) setErrors((prev: any) => ({ ...prev, [id]: null }));
        if (id === 'email') setIsEmailAvailable(true);

        if (id === 'password') {
            let score = 0;
            if (value.length >= 8) score++;
            if (/[A-Z]/.test(value)) score++;
            if (/[0-9]/.test(value)) score++;
            if (/[^A-Za-z0-9]/.test(value)) score++;
            setStrength(score);
        }
    };

    const handleRequestRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const newErrors: any = {};
        if (!formData.username.trim()) newErrors.username = "Tên đăng nhập không được trống";
        if (!formData.fullname.trim()) newErrors.fullname = "Họ tên không được trống";
        if (formData.password.length < 8) newErrors.password = "Mật khẩu phải từ 8 ký tự";
        if (!isEmailAvailable) newErrors.email = "Email đã tồn tại!";

        // 3. KIỂM TRA ĐÃ TÍCH CAPTCHA CHƯA
        if (!captchaToken) newErrors.captcha = "Vui lòng xác thực bạn không phải robot";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); return;
        }

        setIsLoading(true);
        try {
            // 4. TRUYỀN THÊM CAPTCHA TOKEN VÀO SERVICE
            await authService.sendOtpRegister(formData, captchaToken);
            setCountdown(300); // 5 phút
            setStep(2);
            setErrors({});
        } catch (error: any) {
            setErrors({ server: error.response?.data?.message || "Lỗi hệ thống. Vui lòng thử lại sau." });
        } finally {
            setIsLoading(false);
        }
    };

    // Trong RegisterPage.tsx

    const handleVerifyAndRegister = async () => {
        if (otp.length !== 6) {
            setErrors({ otp: "Vui lòng nhập đủ 6 chữ số." });
            return;
        }

        setIsLoading(true);
        try {
            // 1. Gọi API xác nhận
            const response: any = await authService.confirmRegister(formData.email, otp);

            // 2. Lấy dữ liệu Token và User từ response (tùy cấu trúc Backend của bạn)
            // Giả sử Backend trả về: { token: "...", refreshToken: "...", user: { ... } }
            const { token, user } = response;

            if (token) {
                // 3. Lưu vào localStorage để tạo "phiên đăng nhập"
                setAuthTokens(token);
                // Refresh token do backend đặt trong cookie HttpOnly; frontend không lưu/đọc.
                localStorage.setItem('user_info', JSON.stringify(user));

                // 4. Thông báo và điều hướng thẳng vào trang trong (ví dụ /)
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng ký thành công!',
                    text: "Hệ thống đã tự động đăng nhập cho bạn.",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Chuyển hướng và load lại trang để nhận diện thiết bị chuẩn xác
                    navigate('/');
                    window.location.reload();
                });

                // Nếu bạn dùng Redux hoặc Context API để quản lý user, hãy dispatch action ở đây
                // dispatch(loginSuccess(user));
            } else {
                // Trường hợp xác nhận xong nhưng Backend không trả token (phải đăng nhập thủ công)
                navigate('/dang-nhap');
            }

        } catch (error: any) {
            setErrors({ otp: error.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn." });
        } finally {
            setIsLoading(false);
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
                <div className="row justify-content-center">
                    <div className="col-lg-6 shadow-lg p-4 bg-white rounded-4 animate__animated animate__fadeIn" style={{ maxWidth: '500px' }}>

                        {errors.server && <div className="alert alert-danger small py-2">{errors.server}</div>}

                        {step === 1 ? (
                            <form onSubmit={handleRequestRegister} noValidate>
                                <h2 className="h3 mb-4 fw-bold text-center">Đăng ký tài khoản</h2>
                                <div className="row g-3">
                                    <div className="col-12 text-start">
                                        <div className="form-floating">
                                            <input type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`} id="username" placeholder="User" value={formData.username} onChange={handleInputChange} />
                                            <label>Tên đăng nhập</label>
                                            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                                        </div>
                                    </div>

                                    <div className="col-12 text-start">
                                        <div className="form-floating">
                                            <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="email" placeholder="Email" value={formData.email} onChange={handleInputChange} onBlur={(e) => checkEmailExists(e.target.value)} />
                                            <label>Email</label>
                                            {isCheckingEmail && <div className="text-primary small mt-1"><span className="spinner-border spinner-border-sm"></span> Đang kiểm tra...</div>}
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>

                                    <div className="col-12 text-start">
                                        <div className="form-floating">
                                            <input type="text" className={`form-control ${errors.fullname ? 'is-invalid' : ''}`} id="fullname" placeholder="Name" value={formData.fullname} onChange={handleInputChange} />
                                            <label>Họ và tên</label>
                                            {errors.fullname && <div className="invalid-feedback">{errors.fullname}</div>}
                                        </div>
                                    </div>

                                    <div className="col-12 text-start">
                                        <PasswordInput
                                            id="password"
                                            label="Mật khẩu"
                                            floating
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            placeholder="Pass"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange(e)}
                                            error={errors.password}
                                        />
                                        {formData.password && (
                                            <div className="d-flex gap-1 mt-2" style={{ height: '4px' }}>
                                                {[1, 2, 3, 4].map(i => <div key={i} className={`flex-fill rounded ${i <= strength ? (strength <= 2 ? 'bg-warning' : 'bg-success') : 'bg-light'}`} />)}
                                            </div>
                                        )}
                                    </div>

                                    {/* 5. GIAO DIỆN CAPTCHA THÊM VÀO ĐÂY */}
                                    <div className="col-12 mt-3 d-flex flex-column align-items-center">
                                        <ReCAPTCHA
                                            sitekey="6Legm5csAAAAABr5FTIC25geZIxrxlmF5ORzuiYt" // <-- BẠN PHẢI THAY MÃ SITE KEY VÀO ĐÂY
                                            onChange={(token) => {
                                                setCaptchaToken(token || '');
                                                if (errors.captcha) setErrors((prev: any) => ({ ...prev, captcha: null }));
                                            }}
                                        />
                                        {errors.captcha && <div className="text-danger small mt-1 text-center">{errors.captcha}</div>}
                                    </div>

                                    <button className="btn btn-primary w-100 py-3 mt-3 text-white border-0 fw-bold rounded-pill" type="submit" style={{ backgroundColor: '#fb873f' }} disabled={!isEmailAvailable || isCheckingEmail || isLoading}>
                                        {isLoading ? <span className="spinner-border spinner-border-sm"></span> : "Tiếp theo"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center animate__animated animate__fadeIn">
                                <button className="btn btn-link text-decoration-none text-muted p-0 mb-3" onClick={() => { setStep(1); setOtp(''); }}>
                                    <FaArrowLeft className="me-1" /> Quay lại sửa thông tin
                                </button>
                                <h2 className="h4 mb-3 fw-bold">Xác thực Email</h2>
                                <p className="small text-muted">Mã OTP đã được gửi đến <br /> <b>{formData.email}</b></p>

                                <div className="form-floating my-4">
                                    <input type="text" className={`form-control text-center fs-3 fw-bold ${errors.otp ? 'is-invalid' : ''}`} maxLength={6} value={otp} autoFocus onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} />
                                    <label>Nhập 6 số</label>
                                    {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
                                </div>

                                <button className="btn btn-primary w-100 py-3 mb-3 text-white border-0 fw-bold rounded-pill" style={{ backgroundColor: '#fb873f' }} onClick={handleVerifyAndRegister} disabled={otp.length !== 6 || isLoading}>
                                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : "Hoàn tất đăng ký"}
                                </button>

                                <p className="small text-muted">
                                    {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : (
                                        <button className="btn btn-link btn-sm p-0 text-decoration-none" disabled={isLoading} onClick={() => handleRequestRegister()}>Gửi lại mã ngay</button>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="col-12 mt-4 d-flex flex-column align-items-center gap-3">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <Link to="/" className="text-decoration-none fw-bold small" style={{ color: '#fb873f' }}>
                                    <i className="bi bi-house-door-fill me-1"></i> Trang chủ
                                </Link>
                                <p className="mb-0 small">
                                    Đã có tài khoản? <Link className="text-decoration-none fw-bold" style={{ color: '#fb873f' }} to="/dang-nhap">Đăng nhập</Link>
                                </p>
                            </div>
                            
                            <hr className="w-100 my-1 text-muted" />
                            
                            <div className="text-center w-100">
                                <p className="mb-0 small text-muted">
                                    Bạn là chuyên gia? <Link className="text-decoration-none fw-bold ms-1" style={{ color: '#fb873f' }} to="/dang-ky-giang-vien">Đăng ký tài khoản giảng viên</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;