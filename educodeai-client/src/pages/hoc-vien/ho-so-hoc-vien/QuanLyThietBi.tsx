import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { authService } from '@/services/auth.service';

const QuanLyThietBi: React.FC = () => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [logoutAction, setLogoutAction] = useState<{ all: boolean, ids: number[] }>({ all: false, ids: [] });

    const fetchDevices = async () => {
        try {
            const data = await authService.getDevices();
            setDevices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // G.14: chỉ fetch khi mở trang; sau đó refetch khi nhận event SessionListChanged
        // từ SignalR (sessionHub dispatch) thay vì polling định kỳ.
        fetchDevices();

        const onSessionListChanged = () => { fetchDevices(); };
        window.addEventListener('SessionListChanged', onSessionListChanged);
        return () => window.removeEventListener('SessionListChanged', onSessionListChanged);
    }, []);

    const handleLogoutRemote = (all: boolean, maPhien?: number) => {
        setLogoutAction({ all, ids: maPhien ? [maPhien] : [] });
        setOtp(''); // Đảm bảo OTP luôn trống khi bắt đầu luồng mới
        Swal.fire({
            title: 'Xác minh bảo mật',
            text: 'Hệ thống sẽ gửi mã OTP về email của bạn để thực hiện đăng xuất thiết bị.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Gửi OTP',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#fb873f',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await authService.requestOtpDangXuatTuXa('');
                    setShowOtpModal(true);
                } catch (error: any) {
                    Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi OTP', 'error');
                }
            }
        });
    };

    const confirmLogoutRemote = async () => {
        if (!otp || otp.length !== 6) {
            Swal.fire('Lỗi', 'Vui lòng nhập đúng mã OTP 6 chữ số', 'error');
            return;
        }

        try {
            await authService.xacNhanDangXuatTuXa({
                DangXuatTatCa: logoutAction.all,
                DanhSachMaPhien: logoutAction.ids,
                OtpCode: otp
            });
            setShowOtpModal(false);
            setOtp('');

            if (logoutAction.all) {
                await Swal.fire('Thành công', 'Đã đăng xuất tất cả thiết bị khác. Phiên hiện tại vẫn hoạt động.', 'success');
                fetchDevices();
            } else {
                Swal.fire('Thành công', 'Đã đăng xuất thiết bị từ xa!', 'success');
                fetchDevices();
            }
        } catch (error: any) {
            Swal.fire('Lỗi', error.response?.data?.message || 'Mã OTP không chính xác', 'error');
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
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-danger rounded-pill px-4 fw-bold btn-sm"
                            onClick={() => handleLogoutRemote(true)}>Đăng xuất tất cả thiết bị khác</button>
                    </div>
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
                                                Hoạt động cuối: {new Date(device.thoiGianHoatDongCuoi + (device.thoiGianHoatDongCuoi.endsWith('Z') ? '' : 'Z')).toLocaleString('vi-VN')}
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

            {/* Modal OTP - Tối ưu hóa để giảm giật lag */}
            {showOtpModal && (
                <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="remote-logout-title" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg p-4">
                            <div className="text-center">
                                <div className="mb-4">
                                    <div className="bg-primary-subtle d-inline-block p-3 rounded-circle mb-3">
                                        <i className="bi bi-shield-lock fs-2 text-primary" style={{ color: 'var(--primary)' }}></i>
                                    </div>
                                    <h4 id="remote-logout-title" className="fw-bold">Xác minh OTP</h4>
                                    <p className="text-muted small">Nhập mã OTP 6 số đã được gửi đến email của bạn.</p>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="remote-logout-otp" className="visually-hidden">Mã OTP gồm 6 chữ số</label>
                                    <input
                                        id="remote-logout-otp"
                                        type="text"
                                        className="form-control text-center fs-2 fw-bold rounded-3 border-2"
                                        style={{
                                            letterSpacing: '8px',
                                            height: '70px',
                                            borderColor: '#eee',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                        maxLength={6}

                                        placeholder="000000"
                                        aria-label="Mã OTP 6 số"
                                        value={otp}

                                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>

                                <div className="d-flex gap-3 mt-4 align-items-center justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-pill fw-bold border d-flex align-items-center justify-content-center m-0"
                                        style={{ flex: 1, height: '55px' }}
                                        onClick={() => { setShowOtpModal(false); setOtp(''); setLogoutAction({ all: false, ids: [] }); }}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary rounded-pill text-white fw-bold border d-flex align-items-center justify-content-center m-0 shadow-sm"
                                        style={{ backgroundColor: '#fb873f', borderColor: '#fb873f', flex: 1, height: '55px' }}
                                        onClick={confirmLogoutRemote}
                                    >
                                        Xác nhận
                                    </button>
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
