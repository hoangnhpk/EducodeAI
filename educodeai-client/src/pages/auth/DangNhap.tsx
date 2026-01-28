import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const DangNhap: React.FC = () => {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. Khai báo state quản lý lỗi
    const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

    // 2. Hàm kiểm tra dữ liệu trước khi gọi API
    const validateForm = () => {
        const newErrors: { identifier?: string; password?: string } = {};
        
        if (!emailOrUsername.trim()) {
            newErrors.identifier = "Vui lòng nhập tài khoản hoặc email";
        }
        
        if (!password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 3. Thực hiện validate
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response: any = await authService.login(emailOrUsername, password);
            
            // Thông báo thành công (Có thể dùng Toast thay vì alert)
            alert(`Chào mừng ${response.user?.hoTen || 'bạn'} đã quay trở lại!`);
            
            localStorage.setItem('user_info', JSON.stringify(response.user));

            navigate('/'); 
            window.location.reload(); 
        } catch (error: any) {
            // 4. Nếu Backend trả về lỗi (sai pass/user), hiển thị dưới ô nhập hoặc thông báo chung
            const message = error.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!";
            setErrors({ identifier: message }); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-xxl py-5 mt-4">
            <div className="container">
                <div className="row g-4 justify-content-center">
                    <div className="col-lg-6 shadow p-4 bg-white rounded">
                        <form onSubmit={handleLogin} noValidate>
                            <div className="text-center mb-5">
                                <h1 className="h3 mb-3 fw-bold">Đăng nhập</h1>
                                <p className="text-muted">Truy cập vào hệ thống học tập EduCodeAI</p>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-12 text-start">
                                    <div className="form-floating">
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.identifier ? 'is-invalid' : ''}`} 
                                            id="email" 
                                            placeholder="Tài khoản hoặc Email"
                                            value={emailOrUsername}
                                            onChange={(e) => {
                                                setEmailOrUsername(e.target.value);
                                                if (errors.identifier) setErrors({ ...errors, identifier: undefined });
                                            }}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="email">Tài khoản hoặc Email</label>
                                        {/* Hiển thị lỗi ngay dưới input */}
                                        {errors.identifier && <div className="invalid-feedback">{errors.identifier}</div>}
                                    </div>
                                </div>
                                
                                <div className="col-12 text-start">
                                    <div className="form-floating">
                                        <input 
                                            type="password" 
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                                            id="password" 
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors({ ...errors, password: undefined });
                                            }}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="password">Mật khẩu</label>
                                        {/* Hiển thị lỗi ngay dưới input */}
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>
                                </div>

                                <div className="col-12 text-end">
                                    <Link to="/quen-mat-khau" className="text-decoration-none small" style={{ color: '#fb873f' }}>Quên mật khẩu?</Link>
                                </div>
                                
                                <div className="col-12">
                                    <button 
                                        className="btn btn-primary w-100 py-3 text-white border-0 fw-bold" 
                                        type="submit" 
                                        style={{ backgroundColor: '#fb873f' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang xử lý...
                                            </>
                                        ) : "Đăng nhập"}
                                    </button>
                                </div>
                                
                                <div className="col-12 text-center mt-4">
                                    <p className="mb-0">Chưa có tài khoản? <Link className="text-decoration-none fw-bold" style={{color: '#fb873f'}} to="/dang-ky">Đăng ký ngay</Link></p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DangNhap;