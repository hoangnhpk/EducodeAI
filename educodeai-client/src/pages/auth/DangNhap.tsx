import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const DangNhap: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Đăng nhập với:", email, password);
        // Sau này sẽ gọi xac-thuc.service.ts ở đây
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
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            placeholder="Tài khoản"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <label htmlFor="email">Tài khoản (Email)</label>
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
                                        />
                                        <label htmlFor="password">Mật khẩu</label>
                                    </div>
                                </div>

                                <div className="col-12 text-center">
                                    <p><Link to="/quen-mat-khau">Quên mật khẩu?</Link></p>
                                </div>
                                
                                <div className="col-12">
                                    <button className="btn btn-primary w-100 py-3" type="submit" style={{ backgroundColor: '#fb873f', border: 'none' }}>
                                        Đăng nhập
                                    </button>
                                </div>

                                <div className="col-12">
                                    <div className="d-flex align-items-center my-3">
                                        <hr className="flex-grow-1" />
                                        <span className="mx-3 text-muted">Hoặc</span>
                                        <hr className="flex-grow-1" />
                                    </div>
                                </div>

                                <div className="col-12">
    <button 
        className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
        type="button" 
        style={{ border: '1px solid #dadce0', background: 'white', color: '#3c4043' }}
    >
        {/* SVG Inline từ dòng 143-150 của bạn */}
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="#000" fillRule="evenodd">
                <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
                <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.91l2.84 2.2c1.7-1.57 2.68-3.88 2.63-6.61z" fill="#4285F4"/>
                <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
            </g>
        </svg>
        <span style={{ fontWeight: 500 }}>Đăng nhập bằng Google</span>
    </button>
</div>

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