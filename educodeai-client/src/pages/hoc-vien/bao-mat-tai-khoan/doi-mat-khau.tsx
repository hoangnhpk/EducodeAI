import React, { useState } from 'react';
import Swal from 'sweetalert2';
import PasswordInput from '@/components/PasswordInput';
import { authService } from '../../../services/auth.service';
import './bao-mat.css';

const DoiMatKhau: React.FC = () => {
    const [formData, setFormData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.oldPass || formData.newPass.length < 8) {
            return Swal.fire('Cảnh báo', 'Mật khẩu mới phải từ 8 ký tự trở lên', 'warning');
        }
        if (formData.newPass !== formData.confirmPass) {
            return Swal.fire('Cảnh báo', 'Mật khẩu nhập lại không khớp', 'warning');
        }
        if (formData.newPass === formData.oldPass) {
            return Swal.fire('Cảnh báo', 'Mật khẩu mới không được giống với mật khẩu cũ', 'warning');
        }

        setLoading(true);
        try {
            await authService.doiMatKhau({
                MatKhauCu: formData.oldPass,
                MatKhauMoi: formData.newPass
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
            Swal.fire('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '500px' }}>
            <div className="card shadow border-0 rounded-4 p-4">
                <h3 className="mb-4 text-center fw-bold text-orange" style={{ color: '#fb873f' }}>Đổi Mật Khẩu</h3>
                
                <form onSubmit={handleChangePassword} className="animate__animated animate__fadeIn">
                    <PasswordInput id="bao-mat-mat-khau-cu" label="Mật khẩu hiện tại" autoComplete="current-password" containerClassName="mb-3" floating value={formData.oldPass} onChange={e => setFormData({...formData, oldPass: e.target.value})} required />
                    <PasswordInput id="bao-mat-mat-khau-moi" label="Mật khẩu mới" autoComplete="new-password" containerClassName="mb-3" floating value={formData.newPass} onChange={e => setFormData({...formData, newPass: e.target.value})} required />
                    <PasswordInput id="bao-mat-mat-khau-xac-nhan" label="Nhập lại mật khẩu mới" autoComplete="new-password" containerClassName="mb-4" floating value={formData.confirmPass} onChange={e => setFormData({...formData, confirmPass: e.target.value})} required />
                    <button className="btn btn-orange w-100 py-3 fw-bold rounded-pill text-white border-0" 
                        style={{ backgroundColor: '#fb873f' }} type="submit" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoiMatKhau;
