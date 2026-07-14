import React, { useState, useEffect } from 'react';

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                // Kiểm tra trạng thái bảo trì định kỳ
                const res = await fetch(`${apiUrl}/api/quan-tri/cau-hinh/check-bao-tri`);
                const data = await res.json();
                setIsMaintenance(data.isMaintenance);
            } catch (error) {
                console.error("Không thể kết nối đến máy chủ.");
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 15000);

        // 👉 ĐÃ THÊM: Lắng nghe tín hiệu báo động khẩn cấp (Real-time)
        const handleEmergency = () => {
            setIsMaintenance(true);
        };
        window.addEventListener('BaoTriKhanCap', handleEmergency);

        // Cleanup khi component unmount
        return () => {
            clearInterval(interval);
            window.removeEventListener('BaoTriKhanCap', handleEmergency);
        };
    }, []);

    // 👉 ĐÃ SỬA: "Thẻ bài miễn tử" CHỈ DÀNH RIÊNG CHO ADMIN
    const currentPath = window.location.pathname.toLowerCase();
    const isAdmin = currentPath.includes('/quan-tri-vien');

    // NẾU ĐANG BẢO TRÌ VÀ KHÔNG PHẢI ADMIN -> CHẶN NGAY LẬP TỨC
    if (isMaintenance && !isAdmin) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconWrapper}>
                        <i className="fa fa-tools" style={styles.icon}></i>
                    </div>
                    <h1 style={styles.title}>Hệ Thống Đang Nâng Cấp</h1>
                    <p style={styles.desc}>
                        Sếp ơi, EduCodeAI đang được bảo trì để cập nhật tính năng mới siêu xịn sò.
                        <br />Hệ thống sẽ tự động tải lại khi quá trình hoàn tất!
                    </p>
                    <div style={styles.loader}>
                        <div style={styles.spinner}></div>
                        <span style={styles.loaderText}>Đang quét trạng thái server...</span>
                    </div>
                </div>

                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                `}</style>
            </div>
        );
    }

    // NẾU BÌNH THƯỜNG HOẶC LÀ ADMIN -> CHO PHÉP VÀO WEB
    return <>{children}</>;
};

const styles = {
    container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: "'Inter', sans-serif" },
    card: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '50px 40px', borderRadius: '24px', textAlign: 'center' as const, maxWidth: '500px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    iconWrapper: { width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto', animation: 'pulse 2s infinite' },
    icon: { fontSize: '2.5rem', color: '#ffffff' },
    title: { color: '#ffffff', fontSize: '2rem', fontWeight: 800, margin: '0 0 15px 0' },
    desc: { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 30px 0' },
    loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px 20px', borderRadius: '12px' },
    spinner: { width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    loaderText: { color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }
};

export default MaintenanceGuard;