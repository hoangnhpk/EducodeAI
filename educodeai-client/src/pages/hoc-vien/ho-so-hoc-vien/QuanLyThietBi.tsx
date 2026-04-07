import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { authService } from '@/services/auth.service';
import { getDeviceInfo } from '../../../utils/deviceHelper';

const QuanLyThietBi: React.FC = () => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [logoutAction, setLogoutAction] = useState<{ all: boolean, ids: number[] }>({ all: false, ids: [] });

    const fetchDevices = async () => {
        try {
            const { maThietBi } = getDeviceInfo();
            const data: any = await authService.getDevices(maThietBi);
            setDevices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleLogoutRemote = (all: boolean, maPhien?: number) => {
        setLogoutAction({ all, ids: maPhien ? [maPhien] : [] });
        Swal.fire({
            title: 'Xác minh bảo mật',
            text: 'Để thực hiện đăng xuất từ xa, hệ thống sẽ gửi mã OTP về email của bạn.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Gửi OTP',
            confirmButtonColor: '#fb873f'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await authService.requestOtpDangXuatTuXa();
                    setShowOtpModal(true);
                } catch (error: any) {
                    Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi OTP', 'error');
                }
            }
        });
    };

    const confirmLogoutRemote = async () => {
        try {
            await authService.xacNhanDangXuatTuXa({
                DangXuatTatCa: logoutAction.all,
                DanhSachMaPhien: logoutAction.ids,
                OtpCode: otp,
                CaptchaToken: "SKIP_CAPTCHA"
            });
            Swal.fire('Thành công', 'Đã đăng xuất thiết bị từ xa!', 'success');
            setShowOtpModal(false);
            setOtp('');
            fetchDevices();
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Mã OTP không đúng', 'error');
        }
    };

    return (
        <div className="container py-5">
            <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Thiết bị đang đăng nhập</h2>
                        <p className="text-muted small">Kiểm soát các phiên truy cập vào tài khoản của bạn.</p>
                    </div>
                    <button className="btn btn-outline-danger rounded-pill px-4 fw-bold btn-sm" 
                        onClick={() => handleLogoutRemote(true)}>Đăng xuất tất cả</button>
                </div>

                {loading ? (
                    <div className="text-center py-5">Đang tải...</div>
                ) : (
                    <div className="list-group list-group-flush">
                        {devices.map((device: any) => (
                            <div key={device.maPhien} className="list-group-item px-0 py-3 border-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="p-3 bg-light rounded-circle me-3">
                                            <i className={`bi bi-${device.tenThietBi.toLowerCase().includes('phone') ? 'phone' : 'display'} fs-4`}></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold d-flex align-items-center">
                                                {device.tenThietBi}
                                                {device.isCurrentDevice && (
                                                    <span className="badge bg-success-subtle text-success ms-2 fw-normal">Thiết bị này</span>
                                                )}
                                            </div>
                                            <div className="text-muted small">
                                                Hoạt động cuối: {new Date(device.thoiGianHoatDongCuoi).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    {!device.isCurrentDevice && (
                                        <button className="btn btn-light btn-sm rounded-pill text-danger px-3 fw-bold" 
                                            onClick={() => handleLogoutRemote(false, device.maPhien)}>Đăng xuất</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal OTP */}
            {showOtpModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow p-4">
                            <div className="text-center">
                                <h4 className="fw-bold mb-3">Xác nhận OTP</h4>
                                <p>Nhập mã OTP vừa được gửi đến email để thực hiện đăng xuất thiết bị.</p>
                                <input type="text" className="form-control text-center fs-2 fw-bold mb-4" 
                                    maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light flex-grow-1 rounded-pill py-2" onClick={() => setShowOtpModal(false)}>Hủy</button>
                                    <button className="btn btn-primary flex-grow-1 rounded-pill py-2 text-white border-0" 
                                        style={{ backgroundColor: '#fb873f' }} onClick={confirmLogoutRemote}>Xác nhận</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyThietBi;
