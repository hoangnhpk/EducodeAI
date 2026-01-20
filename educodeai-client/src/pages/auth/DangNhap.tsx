import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service'; // Đảm bảo đúng đường dẫn

const DangNhap: React.FC = () => {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!emailOrUsername || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setIsLoading(true);
        try {
            // Gọi hàm login từ service đã viết
            // Backend của bạn nhận identifier (email hoặc tài khoản) và password
            const response = await authService.login(emailOrUsername, password);
            
            alert(`Chào mừng ${response.user.hoTen} đã quay trở lại!`);
            
            // Điều hướng về trang chủ hoặc dashboard
            navigate('/'); 
        } catch (error: any) {
            // Xử lý lỗi trả về từ Backend (401 Unauthorized)
            const message = error.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-xxl py-2 mt-4">
            <div className="container">
                <div className="row g-4 wow fadeInUp" data-wow-delay="0.5s">
                    <center>
                        <form className="shadow p-4" style={{ maxWidth: '550px' }} onSubmit={handleLogin}>
                            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                                <h1 className="mb-5 bg-white text-center px-3">Đăng nhập</h1>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="form-floating">
                                        <input 
                                            type="text" // Đổi sang text vì cho phép nhập cả tài khoản
                                            className="form-control" 
                                            id="email" 
                                            placeholder="Tài khoản hoặc Email"
                                            value={emailOrUsername}
                                            onChange={(e) => setEmailOrUsername(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="email">Tài khoản hoặc Email</label>
                                    </div>
                                </div>
                                
                                <div className="col-12">
                                    <div className="form-floating">
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="password">Mật khẩu</label>
                                    </div>
                                </div>

                                <div className="col-12 text-center">
                                    <p><Link to="/quen-mat-khau">Quên mật khẩu?</Link></p>
                                </div>
                                
                                <div className="col-12">
                                    <button 
                                        className="btn btn-primary w-100 py-3" 
                                        type="submit" 
                                        style={{ backgroundColor: '#fb873f', border: 'none' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                                    </button>
                                </div>
                                
                                {/* ... các phần còn lại giữ nguyên ... */}
                                <div className="col-12 text-center">
                                    <p>Chưa có tài khoản? <Link className="text-decoration-none" to="/dang-ky">Đăng ký</Link></p>
                                </div>
                            </div>
                        </form>
                    </center>
                </div>
            </div>
        </div>
    );
};

export default DangNhap;