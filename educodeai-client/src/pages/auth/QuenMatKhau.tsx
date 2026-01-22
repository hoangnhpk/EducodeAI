import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const QuenMatKhau: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState(''); // Lưu OTP nhận từ Server
    const [countdown, setCountdown] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Gửi OTP qua Email thực tế
    const handleSendCode = async () => {
        if (!email) {
            alert('Vui lòng nhập email');
            return;
        }
        setLoading(true);
        try {
            const res = await authService.forgotPasswordSendOtp(email);
            setGeneratedOtp(res.tempOtp); // Backend trả về OTP để so sánh
            setCountdown(120);
            alert("Mã xác thực đã được gửi tới email của bạn!");
        } catch (error: any) {
            alert(error.response?.data || "Email không tồn tại trên hệ thống!");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
        if (value.length === 6 && value === generatedOtp) {
            setTimeout(() => setStep('reset'), 500);
        }
    };

    // Cập nhật mật khẩu mới vào SQL
    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }
        if (password.length < 6) {
            alert("Mật khẩu phải từ 6 ký tự trở lên!");
            return;
        }

        try {
            await authService.resetPassword({
                Email: email,
                NewPassword: password
            });
            alert("Đặt lại mật khẩu thành công!");
            navigate('/auth/dang-nhap');
        } catch (error) {
            alert("Có lỗi xảy ra khi đổi mật khẩu!");
        }
    };

    return (
        <div className="container-xxl py-2 mt-4">
            {/* Giữ nguyên phần HTML của bạn, chỉ cập nhật các hàm xử lý */}
            <div className="container">
                <div className="row g-4 justify-content-center">
                    <form className="shadow p-4 bg-white" style={{ maxWidth: '550px' }} onSubmit={(e) => e.preventDefault()}>
                        {step === 'forgot' ? (
                            <div id="step-forgot">
                                <div className="text-center mb-4">
                                    <h1 className="mb-3 bg-white text-center px-3">Quên mật khẩu?</h1>
                                    <p className="text-muted mb-0">Nhập email và chúng tôi sẽ gửi mã khôi phục.</p>
                                </div>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="email" className="form-control" placeholder="Email" 
                                                value={email} onChange={(e) => setEmail(e.target.value)} />
                                            <label>Nhập email của bạn</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="d-flex gap-2">
                                            <div className="form-floating flex-grow-1">
                                                <input type="text" className="form-control" placeholder="6 chữ số" 
                                                    value={otp} onChange={handleOtpChange} maxLength={6} />
                                                <label>Mã xác nhận (6 chữ số)</label>
                                            </div>
                                            <button type="button" className="btn btn-outline-primary" 
                                                disabled={countdown > 0 || loading} onClick={handleSendCode}>
                                                {loading ? '...' : (countdown > 0 ? `${countdown}s` : 'Gửi mã')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-3 text-center">
                                        <Link to="/auth/dang-nhap" className="text-decoration-none">Quay lại đăng nhập</Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div id="step-reset">
                                <div className="text-center mb-4">
                                    <h1 className="mb-3 bg-white text-center px-3">Đặt lại mật khẩu</h1>
                                    <p className="text-muted mb-0">Đặt mật khẩu mới để tiếp tục học tập.</p>
                                </div>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="password" className="form-control" placeholder="Pass"
                                                value={password} onChange={(e) => setPassword(e.target.value)} />
                                            <label>Mật khẩu mới</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="password" className="form-control" placeholder="Confirm"
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                            <label>Nhập lại mật khẩu</label>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary w-100 py-3 mt-3 text-white" 
                                        style={{backgroundColor: '#fb873f', border: 'none'}}
                                        onClick={handleResetPassword}>
                                        Cập nhật mật khẩu
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