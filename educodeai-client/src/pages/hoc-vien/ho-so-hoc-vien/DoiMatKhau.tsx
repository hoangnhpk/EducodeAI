import React, { useState } from 'react';
import Swal from 'sweetalert2';
import PasswordInput from '@/components/PasswordInput';
import { authService } from '@/services/auth.service';

const DoiMatKhau: React.FC = () => {
    const [matKhauCu, setMatKhauCu] = useState('');
    const [matKhauMoi, setMatKhauMoi] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (matKhauMoi !== confirmPass) {
            Swal.fire('Lỗi', 'Mật khẩu nhập lại không khớp!', 'error');
            return;
        }
        if (matKhauMoi.length < 8) {
            Swal.fire('Lỗi', 'Mật khẩu mới phải từ 8 ký tự!', 'error');
            return;
        }
        if (matKhauMoi === matKhauCu) {
            Swal.fire('Lỗi', 'Mật khẩu mới không được giống với mật khẩu cũ!', 'error');
            return;
        }

        setLoading(true);
        try {
            await authService.doiMatKhau({
                MatKhauCu: matKhauCu,
                MatKhauMoi: matKhauMoi
            });
            await Swal.fire('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
            localStorage.clear();
            window.location.href = '/dang-nhap';
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Mật khẩu cũ không đúng hoặc có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold">Bảo mật tài khoản</h2>
                            <p className="text-muted">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
                        </div>

                        <form onSubmit={handleUpdatePassword}>
                            <PasswordInput id="doi-mat-khau-cu" label="Mật khẩu hiện tại" autoComplete="current-password" containerClassName="mb-3" floating value={matKhauCu} onChange={e => setMatKhauCu(e.target.value)} required />
                            <PasswordInput id="doi-mat-khau-moi" label="Mật khẩu mới" autoComplete="new-password" containerClassName="mb-3" floating value={matKhauMoi} onChange={e => setMatKhauMoi(e.target.value)} required />
                            <PasswordInput id="doi-mat-khau-xac-nhan" label="Nhập lại mật khẩu mới" autoComplete="new-password" containerClassName="mb-4" floating value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                            <button className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white border-0" 
                                style={{ backgroundColor: '#fb873f' }} type="submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoiMatKhau;
