import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import './CauHinhHeThong.css';
import { useSystemConfig } from '../../../contexts/SystemConfigContext';

const CauHinhHeThong = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const { refreshConfigs } = useSystemConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [configs, setConfigs] = useState<Record<string, string>>({
        TenWebsite: '',
        EmailLienHe: '',
        SoDienThoai: '',
        DiaChi: '',
        BannerChinh: '',
        LogoUrl: '',
        CheDoBaoTri: 'false',
        GioiHanDungLuong: '50'
    });

    // 👉 Lấy URL tĩnh từ biến môi trường
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchConfigs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            // 👉 ĐÃ SỬA: Dùng apiUrl thay cho localhost
            const res = await fetch(`${apiUrl}/api/quan-tri/cau-hinh/lay-cau-hinh`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await res.json();
            if (result.success && result.data) {
                setConfigs(prev => ({ 
                    ...prev, 
                    ...result.data 
                }));
            }
        } catch (error) { 
            console.error("Lỗi kết nối API:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: 'Không thể kết nối với máy chủ. Sếp kiểm tra xem Backend đã chạy chưa nhé!'
            });
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { 
        fetchConfigs(); 
    }, []);

    const handleChange = (key: string, value: string) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Hiển thị loading khi đang upload ảnh
            Swal.fire({ title: 'Đang tải ảnh lên...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const token = localStorage.getItem('user_token');
                const res = await fetch(`${apiUrl}/api/quan-tri/cau-hinh/upload-banner`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                
                const result = await res.json();
                if (result.success) {
                    const fullUrl = `${apiUrl}${result.url}`;
                    setConfigs(prev => ({ ...prev, BannerChinh: fullUrl }));
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã tải ảnh thành công',
                        text: `Sếp đã tải file: ${file.name}. Nhấn Lưu để cập nhật ảnh vào hệ thống.`,
                        timer: 2000
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Lỗi', text: result.message || 'Không thể upload ảnh.' });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể upload ảnh vào lúc này.' });
            }
        }
    };

    const handleSave = async () => {
        Swal.fire({ title: 'Đang lưu cấu hình...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            const token = localStorage.getItem('user_token');
            const configArray = Object.keys(configs).map(key => ({
                MaKhoa: key,
                GiaTri: configs[key]
            }));

            // 👉 ĐÃ SỬA: Dùng apiUrl thay cho localhost
            const res = await fetch(`${apiUrl}/api/quan-tri/cau-hinh/cap-nhat`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(configArray)
            });
            
            const result = await res.json();
            if (result.success) {
                const isBaoTri = configs.CheDoBaoTri === 'true';
                try {
                    // 👉 ĐÃ SỬA: Dùng apiUrl thay cho localhost
                    await fetch(`${apiUrl}/api/quan-tri/cau-hinh/toggle-bao-tri`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(isBaoTri)
                    });
                } catch (e) { console.error("Không gọi được API Toggle Bảo Trì"); }

                await refreshConfigs(); 
                localStorage.setItem('trigger_update_config', Date.now().toString());
                Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã cập nhật hệ thống!', timer: 2000, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: result.message });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể lưu cấu hình lúc này!' });
        }
    };

    return (
        <div className="quan-tri-config-container">
            <div className="config-header">
                <div>
                    <h1 className="config-title">Cấu hình Hệ thống</h1>
                    <p className="config-subtitle">Bảng điều khiển trung tâm dành cho Quản trị viên</p>
                </div>
                <button className="btn-save-config" onClick={handleSave}>
                    <i className="fa fa-save"></i> LƯU THAY ĐỔI
                </button>
            </div>

            <div className="config-layout">
                <div className="config-sidebar">
                    <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>🌐 Thông tin chung</button>
                    <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>🖼️ Hình ảnh & Banner</button>
                    <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>⚙️ Cài đặt hệ thống</button>
                </div>

                <div className="config-content">
                    {isLoading ? (
                        <div style={{textAlign: 'center', padding: '50px', color: '#64748b'}}>
                            <i className="fa fa-spinner fa-spin fa-2x"></i>
                            <p>Đang kiểm tra kết nối hệ thống...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'general' && (
                                <div className="fade-in">
                                    <h2 className="pane-title">Thông tin Website</h2>
                                    <div className="form-group">
                                        <label>Tên nền tảng (Tiêu đề trang):</label>
                                        <input type="text" className="input-config" value={configs.TenWebsite} onChange={e => handleChange('TenWebsite', e.target.value)} placeholder="VD: EduCodeAI" />
                                    </div>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Email hỗ trợ:</label>
                                            <input type="email" className="input-config" value={configs.EmailLienHe} onChange={e => handleChange('EmailLienHe', e.target.value)} placeholder="support@domain.com" />
                                        </div>
                                        <div className="form-group">
                                            <label>Số điện thoại Hotline:</label>
                                            <input type="text" className="input-config" value={configs.SoDienThoai} onChange={e => handleChange('SoDienThoai', e.target.value)} placeholder="09xx xxx xxx" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ văn phòng:</label>
                                        <input type="text" className="input-config" value={configs.DiaChi} onChange={e => handleChange('DiaChi', e.target.value)} placeholder="Địa chỉ trụ sở chính" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="fade-in">
                                    <h2 className="pane-title">Tài nguyên Hình ảnh</h2>
                                    <div className="form-group" style={{opacity: 0.7}}>
                                        <label>Logo Website (Hệ thống đang sử dụng mặc định - Khóa):</label>
                                        <div className="media-input-group">
                                            <img src="/img/icon.png" alt="Logo preview" className="preview-img logo-preview" />
                                            <input type="text" className="input-config" value="icon.png" disabled style={{cursor: 'not-allowed', backgroundColor: '#f1f5f9'}} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Banner Trang chủ (Chọn file từ máy tính):</label>
                                        <div className="media-input-group" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '15px'}}>
                                            <img 
                                                src={configs.BannerChinh.startsWith('http') ? configs.BannerChinh : `/img/${configs.BannerChinh}`} 
                                                alt="Banner preview" 
                                                className="preview-img banner-preview" 
                                                style={{width: '100%', maxWidth: '600px', height: '150px', objectFit: 'cover'}}
                                                onError={e => e.currentTarget.src='https://placehold.co/600x150?text=Chưa+có+ảnh'} 
                                            />
                                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    onChange={handleFileChange} 
                                                    style={{display: 'none'}} 
                                                    accept="image/*"
                                                />
                                                <button 
                                                    type="button" 
                                                    className="btn-save-config" 
                                                    style={{backgroundColor: '#64748b', fontSize: '0.9rem'}}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <i className="fa fa-upload"></i> Chọn ảnh mới
                                                </button>
                                                <span style={{fontSize: '0.85rem', color: '#64748b'}}>
                                                    File hiện tại: <strong>{configs.BannerChinh}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'system' && (
                                <div className="fade-in">
                                    <h2 className="pane-title">Bảo mật & Server</h2>
                                    <div className="system-toggle-box">
                                        <div>
                                            <h3 style={{margin: 0, color: '#1e293b'}}>Bật chế độ bảo trì</h3>
                                            <p style={{margin: '5px 0 0 0', color: '#64748b', fontSize: '0.85rem'}}>Khoá website, chỉ Quản trị viên được phép truy cập.</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={configs.CheDoBaoTri === 'true'} onChange={e => handleChange('CheDoBaoTri', e.target.checked ? 'true' : 'false')} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="form-group" style={{marginTop: '25px', opacity: 0.7}}>
                                        <label>Giới hạn dung lượng tải lên (MB) - <span style={{color: '#ef4444'}}>Đã khóa</span>:</label>
                                        <input 
                                            type="number" 
                                            className="input-config" 
                                            style={{width: '200px', cursor: 'not-allowed', backgroundColor: '#f1f5f9'}} 
                                            value={configs.GioiHanDungLuong} 
                                            disabled 
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CauHinhHeThong;