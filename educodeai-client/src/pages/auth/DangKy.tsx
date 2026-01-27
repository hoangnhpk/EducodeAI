import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    
    // State dữ liệu form
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullname: '',
        password: ''
    });

    // State quản lý lỗi và trạng thái kiểm tra
    const [errors, setErrors] = useState<any>({});
    const [isEmailAvailable, setIsEmailAvailable] = useState(true);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State cho OTP
    const [otp, setOtp] = useState('');
    const [serverOtp, setServerOtp] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [strength, setStrength] = useState(0);

    // Countdown timer cho OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // 1. Kiểm tra Email tồn tại
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
            console.error("Lỗi kiểm tra email", error);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (errors[id]) setErrors({ ...errors, [id]: null });
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

    // 2. Xử lý bước 1: Gửi OTP
    const handleNextStep = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Validate local
        const newErrors: any = {};
        if (!formData.username.trim()) newErrors.username = "Tên đăng nhập không được trống";
        if (!formData.fullname.trim()) newErrors.fullname = "Họ tên không được trống";
        if (formData.password.length < 8) newErrors.password = "Mật khẩu phải từ 8 ký tự";
        if (!isEmailAvailable) newErrors.email = "Email đã tồn tại!";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const registerData = {
                hoTen: formData.fullname,
                email: formData.email,
                taiKhoan: formData.username,
                matKhau: formData.password
            };
            const res: any = await authService.sendOtp(registerData);
            // Giả sử API trả về OTP để test, thực tế thường chỉ gửi về email
            setServerOtp(String(res.tempOtp)); 
            setCountdown(120); 
            setStep(2);
            setErrors({}); // Clear errors khi chuyển bước
        } catch (error: any) {
            const serverMsg = error.response?.data?.message || "Lỗi gửi mã OTP";
            setErrors({ server: serverMsg });
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Xử lý bước 2: Xác thực OTP và Đăng ký
    const handleVerifyAndRegister = async () => {
        if (otp !== serverOtp) {
            setErrors({ otp: "Mã OTP không chính xác!" });
            return;
        }

        setIsLoading(true);
        try {
            const registerData = {
                hoTen: formData.fullname,
                email: formData.email,
                taiKhoan: formData.username,
                matKhau: formData.password
            };
            await authService.confirmRegister(registerData);
            alert("Đăng ký thành công!");
            navigate('/auth/dang-nhap');
        } catch (error: any) {
            setErrors({ otp: error.response?.data?.message || "Đăng ký thất bại" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-xxl py-5 mt-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 shadow p-4 bg-white rounded" style={{ maxWidth: '500px' }}>
                        
                        {errors.server && (
                            <div className="alert alert-danger small py-2">{errors.server}</div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleNextStep} noValidate>
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
                                            <input type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                                id="email" placeholder="Email" 
                                                value={formData.email} 
                                                onChange={handleInputChange}
                                                onBlur={(e) => checkEmailExists(e.target.value)} 
                                            />
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
                                        <div className="form-floating position-relative">
                                            <input type={showPassword ? 'text' : 'password'} className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="password" placeholder="Pass" value={formData.password} onChange={handleInputChange} />
                                            <label>Mật khẩu</label>
                                            <span className="position-absolute top-50 end-0 translate-middle-y me-3" style={{cursor:'pointer', zIndex: 10}} onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                        </div>
                                        {formData.password && (
                                            <div className="d-flex gap-1 mt-2" style={{height: '4px'}}>
                                                {[1,2,3,4].map(i => <div key={i} className={`flex-fill rounded ${i <= strength ? (strength <= 2 ? 'bg-warning' : 'bg-success') : 'bg-light'}`} />)}
                                            </div>
                                        )}
                                    </div>

                                    <button className="btn btn-primary w-100 py-3 mt-3 text-white border-0 fw-bold" 
                                        type="submit" 
                                        style={{ backgroundColor: '#fb873f' }}
                                        disabled={!isEmailAvailable || isCheckingEmail || isLoading}>
                                        {isLoading ? <span className="spinner-border spinner-border-sm"></span> : "Tiếp theo"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center animate__animated animate__fadeIn">
                                <button className="btn btn-link text-decoration-none text-muted p-0 mb-3" 
                                    onClick={() => { setStep(1); setOtp(''); }}>
                                    <FaArrowLeft /> Quay lại sửa thông tin
                                </button>
                                <h2 className="h4 mb-3 fw-bold">Xác thực Email</h2>
                                <p className="small text-muted">Mã OTP đã được gửi đến <br/> <b>{formData.email}</b></p>
                                
                                <div className="form-floating my-4">
                                    <input type="text" className={`form-control text-center fs-3 fw-bold ${errors.otp ? 'is-invalid' : ''}`} 
                                        maxLength={6} value={otp} 
                                        autoFocus
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                    <label>Nhập 6 số</label>
                                    {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
                                </div>

                                <button className="btn btn-primary w-100 py-3 mb-3 text-white border-0 fw-bold" 
                                    style={{ backgroundColor: '#fb873f' }}
                                    onClick={handleVerifyAndRegister}
                                    disabled={otp.length !== 6 || isLoading}>
                                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : "Hoàn tất đăng ký"}
                                </button>

                                <p className="small text-muted">
                                    {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : (
                                        <button className="btn btn-link btn-sm p-0 text-decoration-none" 
                                            disabled={isLoading}
                                            onClick={() => handleNextStep()}>Gửi lại mã ngay</button>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <p className="mb-0 small">Đã có tài khoản? <Link to="/dang-nhap" className="fw-bold text-decoration-none" style={{color: '#fb873f'}}>Đăng nhập</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;