import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import axiosClient from '../../configs/axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import FacebookLogin from 'react-facebook-login';

const DangNhap: React.FC = () => {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

    const GOOGLE_CLIENT_ID = "936326067432-hcndgs9gnnfculp14smdl8e6bnqb4is9.apps.googleusercontent.com";
    const FACEBOOK_APP_ID = "4257990231123156";
    const validateForm = () => {
        const newErrors: { identifier?: string; password?: string } = {};
        if (!emailOrUsername.trim()) newErrors.identifier = "Vui lòng nhập tài khoản hoặc email";
        if (!password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Đăng nhập bằng tài khoản mật khẩu thông thường
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setErrors({});

        try {
            const response: any = await authService.login(emailOrUsername, password);
            if (response && response.token) {
                localStorage.setItem('user_token', response.token);
                localStorage.setItem('user_info', JSON.stringify(response.user));
                navigate('/');
                window.location.reload();
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!";
            setErrors({ identifier: message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            const token = credentialResponse.credential;

            // 2. GỌI API GỬI LÊN BACKEND (Đây là bước bạn đang thiếu)
            // Giả sử service của bạn là authService.googleLogin
            const res: any = await authService.googleLogin({ token: token });

            // 3. Chỉ lưu vào localStorage KHI BACKEND trả về thành công
            if (res && res.token) {
                localStorage.setItem('user_token', res.token);
                localStorage.setItem('user_info', JSON.stringify(res.user));

                alert(`Đăng nhập Google thành công!`);
                navigate('/');
                window.location.reload();
            }
        } catch (error: any) {
            console.error("❌ Lỗi API Google Login:", error);
            const errorMsg = error.response?.data?.message || "Không thể đồng bộ tài khoản với SQL Server. Kiểm tra dung lượng đĩa!";
        } finally {
            setIsLoading(false);
        }
    };

    // THÊM: XỬ LÝ ĐĂNG NHẬP FACEBOOK
    const responseFacebook = async (response: any) => {
        if (response.accessToken) {
            setIsLoading(true);
            try {
                const res: any = await axiosClient.post("/api/NguoiDung/facebook-login", {
                    email: response.email,
                    name: response.name,
                    picture: response.picture.data.url,
                    userID: response.userID
                });

                localStorage.setItem('user_token', res.token);
                localStorage.setItem('user_info', JSON.stringify(res.user));

                navigate('/');
                window.location.reload();
            } catch (error: any) {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi đăng nhập",
                    text: error.response?.data?.message || "Lỗi đồng bộ Facebook. Kiểm tra dung lượng đĩa!",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="container-xxl py-5 mt-4">
                <div className="container">
                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-5 shadow p-4 bg-white rounded-4">
                            <form onSubmit={handleLogin} noValidate>
                                <div className="text-center mb-4">
                                    <h1 className="h3 mb-2 fw-bold">Đăng nhập</h1>
                                    <p className="text-muted small">Truy cập vào hệ thống học tập EduCodeAI</p>
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
                                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                                disabled={isLoading}
                                            />
                                            <label htmlFor="email">Tài khoản hoặc Email</label>
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
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                            />
                                            <label htmlFor="password">Mật khẩu</label>
                                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                        </div>
                                    </div>

                                    <div className="col-12 text-end">
                                        <Link to="/quen-mat-khau" className="text-decoration-none small" style={{ color: '#fb873f' }}>Quên mật khẩu?</Link>
                                    </div>

                                    <div className="col-12">
                                        <button
                                            className="btn btn-primary w-100 py-3 text-white border-0 fw-bold rounded-pill"
                                            type="submit"
                                            style={{ backgroundColor: '#fb873f' }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                                        </button>
                                    </div>

                                    <div className="col-12 my-3">
                                        <div className="d-flex align-items-center">
                                            <hr className="flex-grow-1" />
                                            <span className="mx-2 text-muted small">Hoặc đăng nhập với</span>
                                            <hr className="flex-grow-1" />
                                        </div>
                                    </div>

                                    <div className="col-12 d-flex flex-column align-items-center gap-2">
                                        {/* Nút Google */}
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => Swal.fire({
                                                icon: "error",
                                                title: "Lỗi đăng nhập Google",
                                                text: "Đăng nhập Google thất bại!",
                                            })}
                                            shape="pill"
                                            theme="outline"
                                            text="signin_with"
                                            width="350px"
                                        />

                                        {/* THÊM: Nút Facebook */}
                                        <div style={{ width: '350px' }}>
                                            <FacebookLogin
                                                appId={FACEBOOK_APP_ID}
                                                autoLoad={false}
                                                fields="name,email,picture"
                                                callback={responseFacebook}
                                                cssClass="btn btn-primary w-100 rounded-pill py-2"
                                                icon="fa-facebook"
                                                textButton="&nbsp;&nbsp;Đăng nhập với Facebook"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 text-center mt-4">
                                        <p className="mb-0 small">Chưa có tài khoản? <Link className="text-decoration-none fw-bold" style={{ color: '#fb873f' }} to="/dang-ky">Đăng ký ngay</Link></p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default DangNhap;