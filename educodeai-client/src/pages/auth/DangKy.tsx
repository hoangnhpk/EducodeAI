import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    password: ''
  });

  const [strength, setStrength] = useState(0);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState('123456');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === 'password') {
      let score = 0;
      if (value.length >= 8) score++;
      if (value.length >= 12) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setStrength(score);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.fullname || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    sendOTP();
    setStep(2);
  };

  const sendOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOtp);
    setCountdown(60);
    setOtp('');
    setVerificationStatus(null);
    console.log('Mã OTP mới:', newOtp);
  };

  const verifyOTP = () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      if (otp === generatedOTP) {
        setVerificationStatus('success');
        setTimeout(() => alert('Đăng ký thành công!'), 500);
      } else {
        setVerificationStatus('error');
        setIsVerifying(false);
      }
    }, 800);
  };

  const getStrengthColor = (s: number) => {
    if (s <= 1) return 'bg-danger';
    if (s <= 2) return 'bg-warning';
    if (s <= 3) return 'bg-info';
    return 'bg-success';
  };

  return (
    <div className="container-xxl py-2 mt-4">
      <div className="container">
        <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.5s">
          <div className="col-lg-6 col-md-8 text-center">
            <div className="shadow p-4 bg-white rounded" style={{ maxWidth: '550px', margin: '0 auto' }}>

              {/* BƯỚC 1: ĐĂNG KÝ */}
              {step === 1 && (
                <form onSubmit={handleSignupSubmit}>
                  <div className="text-center mb-5">
                    <h1 className="h3 bg-white px-3">Đăng ký</h1>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-floating text-start">
                        <input type="text" className="form-control" id="username" placeholder="Tài khoản" value={formData.username} onChange={handleInputChange} />
                        <label htmlFor="username">Tên đăng nhập</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating text-start">
                        <input type="email" className="form-control" id="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
                        <label htmlFor="email">Email</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating text-start">
                        <input type="text" className="form-control" id="fullname" placeholder="Họ tên" value={formData.fullname} onChange={handleInputChange} />
                        <label htmlFor="fullname">Họ và tên</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating position-relative text-start">
                        <input type={showPassword ? 'text' : 'password'} className="form-control" id="password" placeholder="Mật khẩu" value={formData.password} onChange={handleInputChange} />
                        <label htmlFor="password">Mật khẩu</label>
                        <span className="position-absolute top-50 end-0 translate-middle-y me-3" style={{ cursor: 'pointer', zIndex: 10 }} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <div className="d-flex gap-1" style={{ height: 5 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`flex-fill rounded ${i <= strength ? getStrengthColor(strength) : 'bg-light'}`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Nút Tiếp theo - Màu cam */}
                    <div className="col-12 mt-4">
                      <button className="btn btn-primary w-100 py-3" type="submit" style={{ backgroundColor: '#fb873f', border: 'none' }}>
                        Tiếp theo
                      </button>
                    </div>

                    {/* Hoặc phân cách */}
                    <div className="col-12">
                      <div className="d-flex align-items-center my-3">
                        <hr className="flex-grow-1" />
                        <span className="mx-3 text-muted">Hoặc</span>
                        <hr className="flex-grow-1" />
                      </div>
                    </div>
                    
                    {/* Link Quay lại Đăng nhập bằng thẻ Link */}
                    <div className="col-12 text-center mt-3">
                      <p className="mb-0 text-muted">Đã có tài khoản? 
                        <Link 
                          to="/dang-nhap" 
                          className="ms-1 text-decoration-none fw-bold"
                          style={{ color: '#06BBCC' }}
                        >
                          Đăng nhập ngay
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              )}

              {/* BƯỚC 2: OTP */}
              {step === 2 && (
                <div className="text-center py-4">
                  <h2 className="h4 mb-3">Xác thực mã OTP</h2>
                  <p className="small text-muted">Mã đã được gửi đến <b>{formData.email}</b></p>

                  <div className="my-4" style={{ maxWidth: 320, margin: '0 auto' }}>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className={`form-control text-center fs-3 fw-bold ${
                          verificationStatus === 'success' ? 'is-valid' : verificationStatus === 'error' ? 'is-invalid' : ''
                        }`}
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ letterSpacing: '5px' }}
                      />
                      <label>Nhập mã OTP</label>
                    </div>

                    <button 
                      className="btn btn-primary w-100 py-3 mb-3"
                      onClick={verifyOTP}
                      style={{ backgroundColor: '#fb873f', border: 'none' }}
                      disabled={isVerifying || otp.length !== 6 || verificationStatus === 'success'}
                    >
                      Xác nhận
                    </button>

                    <div className="d-flex flex-column gap-2 mt-2">
                      <button className="btn btn-sm text-muted border-0 bg-transparent" onClick={sendOTP} disabled={countdown > 0}>
                        {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã mới'}
                      </button>
                      <Link to="#" onClick={() => setStep(1)} className="text-decoration-none small" style={{ color: '#fb873f' }}>
                        Chỉnh sửa thông tin đăng ký
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;