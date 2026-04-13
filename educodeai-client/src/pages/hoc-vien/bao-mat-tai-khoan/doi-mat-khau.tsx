import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { authService } from '../../../services/auth.service';
import './bao-mat.css';

const DoiMatKhau: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async () => {
        if (!formData.oldPass || formData.newPass.length < 8) {
            return Swal.fire('Cảnh báo', 'Mật khẩu mới phải từ 8 ký tự trở lên', 'warning');
        }
        if (formData.newPass !== formData.confirmPass) {
            return Swal.fire('Cảnh báo', 'Mật khẩu nhập lại không khớp', 'warning');
        }

        setLoading(true);
        try {
            await authService.requestOtpDoiMatKhau();
            Swal.fire({ icon: 'success', title: 'Đã gửi OTP', text: 'Mã OTP đã được gửi về Email của bạn', timer: 2000, showConfirmButton: false });
            setStep(2);
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (otp.length !== 6) return Swal.fire('Cảnh báo', 'Vui lòng nhập đủ 6 số OTP', 'warning');

        setLoading(true);
        try {
            await authService.doiMatKhau({
                MatKhauCu: formData.oldPass,
                MatKhauMoi: formData.newPass,
                OtpCode: otp
            });
            
            Swal.fire({ 
                icon: 'success', 
                title: 'Thành công!', 
                text: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
                confirmButtonText: 'Đăng nhập lại',
                confirmButtonColor: '#fb873f'
            }).then(() => {
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_info');
                window.location.href = '/dang-nhap'; 
            });

        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Mã OTP sai hoặc đã hết hạn', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '500px' }}>
            <div className="card shadow border-0 rounded-4 p-4">
                <h3 className="mb-4 text-center fw-bold text-orange">Đổi Mật Khẩu</h3>
                
                {step === 1 ? (
                    <div className="animate__animated animate__fadeIn">
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" placeholder="Cũ" value={formData.oldPass} onChange={e => setFormData({...formData, oldPass: e.target.value})} />
                            <label>Mật khẩu hiện tại</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" placeholder="Mới" value={formData.newPass} onChange={e => setFormData({...formData, newPass: e.target.value})} />
                            <label>Mật khẩu mới</label>
                        </div>
                        <div className="form-floating mb-4">
                            <input type="password" className="form-control" placeholder="Xác nhận" value={formData.confirmPass} onChange={e => setFormData({...formData, confirmPass: e.target.value})} />
                            <label>Nhập lại mật khẩu mới</label>
                        </div>
                        <button className="btn btn-orange w-100 py-3 fw-bold rounded-pill" onClick={handleRequestOtp} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Lưu thay đổi'}
                        </button>
                    </div>
                ) : (
                    <div className="animate__animated animate__fadeIn text-center">
                        <p className="text-muted small mb-4">Vui lòng nhập mã OTP gồm 6 chữ số vừa được gửi đến email của bạn để xác nhận đổi mật khẩu.</p>
                        <div className="form-floating mb-4">
                            <input type="text" className="form-control text-center fw-bold otp-input" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="--- ---" autoFocus />
                            <label>Mã xác nhận OTP</label>
                        </div>
                        <button className="btn btn-orange w-100 py-3 fw-bold rounded-pill mb-2" onClick={handleChangePassword} disabled={loading || otp.length < 6}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Xác nhận Đổi mật khẩu'}
                        </button>
                        <button className="btn btn-link text-decoration-none text-muted small" onClick={() => setStep(1)} disabled={loading}>
                            <i className="bi bi-arrow-left me-1"></i> Quay lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoiMatKhau;