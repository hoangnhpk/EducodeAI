import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QuenMatKhau: React.FC = () => {
    const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('123456');
    const [countdown, setCountdown] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Xử lý đếm ngược gửi mã
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = () => {
        if (!email) {
            alert('Vui lòng nhập email hoặc tên đăng nhập');
            return;
        }
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setCountdown(120);
        console.log('Demo OTP:', newOtp);
        alert(`Mã OTP demo là: ${newOtp}`);
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
        if (value.length === 6 && value === generatedOtp) {
            setTimeout(() => setStep('reset'), 500);
        }
    };

    return (
        <div className="container-xxl py-2 mt-4">
            <div className="container">
                <div className="row g-4 justify-content-center wow fadeInUp" data-wow-delay="0.5s">
                    <form className="shadow p-4 bg-white" style={{ maxWidth: '550px' }} onSubmit={(e) => e.preventDefault()}>
                        
                        {step === 'forgot' ? (
                            <div id="step-forgot">
                                <div className="text-center mb-4">
                                    <h1 className="mb-3 bg-white text-center px-3">Quên mật khẩu?</h1>
                                    <p className="text-muted mb-0">Nhập email và chúng tôi sẽ gửi mã khôi phục.</p>
                                </div>
                                <div className="row g-3 text-start">
                                    <div className="col-12">
                                        <label className="mb-1 fw-semibold">Tên đăng nhập / Email</label>
                                        <div className="form-floating">
                                            <input type="text" className="form-control" placeholder="Email" 
                                                value={email} onChange={(e) => setEmail(e.target.value)} />
                                            <label>Nhập email hoặc username</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="mb-1 fw-semibold">Mã xác nhận</label>
                                        <div className="d-flex gap-2">
                                            <div className="form-floating flex-grow-1">
                                                <input type="text" className="form-control" placeholder="6 chữ số" 
                                                    value={otp} onChange={handleOtpChange} maxLength={6} />
                                                <label>Mã xác nhận (6 chữ số)</label>
                                            </div>
                                            <button type="button" className="btn btn-outline-primary" 
                                                disabled={countdown > 0} onClick={handleSendCode}>
                                                {countdown > 0 ? `${countdown}s` : 'Gửi mã'}
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
                                        onClick={() => alert("Thành công!")}>
                                        Cập nhật mật khẩu
                                    </button>
                                    <div className="col-12 text-center mt-2">
                                        <a href="#" onClick={() => setStep('forgot')} className="text-decoration-none">Quay lại bước trước</a>
                                    </div>
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