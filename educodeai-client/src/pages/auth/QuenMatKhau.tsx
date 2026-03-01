import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

interface OtpResponse {
    tempOtp: string;
    message: string;
}

const QuenMatKhau: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState(''); 
    const [countdown, setCountdown] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // State quản lý lỗi hiển thị dưới ô nhập
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // 1. Gửi OTP qua Email
    const handleSendCode = async () => {
        // Validate Email trước khi gửi
        if (!email) {
            setErrors({ email: 'Vui lòng nhập email để nhận mã' });
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Định dạng email không hợp lệ' });
            return;
        }

        setLoading(true);
        setErrors({}); // Xóa lỗi cũ
        try {
            const res = await authService.forgotPasswordSendOtp(email) as unknown as OtpResponse;
            if (res && res.tempOtp) {
                setGeneratedOtp(res.tempOtp);
                setCountdown(120);
                Swal.fire({ icon: 'success', text: "Mã xác thực đã được gửi tới email của bạn!", timer: 1500, showConfirmButton: false });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Email không tồn tại trên hệ thống!";
            setErrors({ email: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // 2. Kiểm tra mã OTP khi người dùng nhập
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
        setErrors({ ...errors, otp: null }); // Xóa lỗi OTP khi đang nhập
        
        if (value.length === 6) {
            if (value === String(generatedOtp)) {
                setTimeout(() => {
                    setErrors({});
                    setStep('reset');
                }, 500);
            } else {
                setErrors({ otp: 'Mã xác thực không chính xác' });
            }
        }
    };

    // 3. Cập nhật mật khẩu mới
    const handleResetPassword = async () => {
        const newErrors: any = {};

        if (password.length < 8) {
            newErrors.password = "Mật khẩu mới phải từ 8 ký tự trở lên";
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({
                Email: email,
                NewPassword: password
            });
            Swal.fire({ icon: 'success', text: "Đặt lại mật khẩu thành công!", timer: 1500, showConfirmButton: false });
            navigate('/dang-nhap');
        } catch (error: any) {
            setErrors({ password: error.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-xxl py-2 mt-4">
            <div className="container">
                <div className="row g-4 justify-content-center">
                    <form className="shadow p-4 bg-white" style={{ maxWidth: '550px' }} onSubmit={(e) => e.preventDefault()}>
                        {step === 'forgot' ? (
                            <div id="step-forgot">
                                <div className="text-center mb-4">
                                    <h1 className="h3 mb-3">Quên mật khẩu?</h1>
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
                                            <button type="button" className="btn btn-outline-primary py-3" 
                                                style={{ height: '58px', minWidth: '90px' }}
                                                disabled={countdown > 0 || loading} 
                                                onClick={handleSendCode}>
                                                {loading ? '...' : (countdown > 0 ? `${countdown}s` : 'Gửi mã')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-3 text-center">
                                        <Link to="/dang-nhap" className="text-decoration-none small" style={{color: '#fb873f'}}>Quay lại đăng nhập</Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div id="step-reset">
                                <div className="text-center mb-4">
                                    <h1 className="h3 mb-3">Đặt lại mật khẩu</h1>
                                    <p className="text-muted small">Nhập mật khẩu mới an toàn hơn.</p>
                                </div>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="password" 
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                                                placeholder="Pass"
                                                value={password} 
                                                onChange={(e) => { setPassword(e.target.value); setErrors({}); }} 
                                            />
                                            <label>Mật khẩu mới</label>
                                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="password" 
                                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} 
                                                placeholder="Confirm"
                                                value={confirmPassword} 
                                                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }} 
                                            />
                                            <label>Nhập lại mật khẩu</label>
                                            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                                        </div>
                                    </div>
                                    <button className="btn btn-primary w-100 py-3 mt-3 text-white fw-bold" 
                                        style={{backgroundColor: '#fb873f', border: 'none'}}
                                        disabled={loading}
                                        onClick={handleResetPassword}>
                                        {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuenMatKhau;