import React, { createContext, useState, useEffect, useContext } from 'react';
import * as signalR from "@microsoft/signalr"; // 1. Import SignalR

// Cấu trúc dữ liệu mặc định
const defaultConfigs = {
    TenWebsite: 'EduCodeAI',
    EmailLienHe: 'support@educodeai.vn',
    SoDienThoai: '0901234567',
    DiaChi: 'Việt Nam',
    LogoUrl: 'icon.png',
    BannerChinh: '',
};

const SystemConfigContext = createContext<any>(null);
export const useSystemConfig = () => useContext(SystemConfigContext);

export const SystemConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const [configs, setConfigs] = useState(defaultConfigs);

    const fetchConfigs = async () => {
        try {
            // Thêm timestamp để tránh cache trình duyệt
            const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7284';
            const res = await fetch(`${baseUrl}/api/quan-tri/cau-hinh/lay-cau-hinh?t=${Date.now()}`);
            const result = await res.json();
            if (result.success && result.data) {
                setConfigs(prev => ({ ...prev, ...result.data }));
            }
        } catch (error) {
            console.error("Lỗi lấy cấu hình:", error);
        }
    };

    useEffect(() => {
        fetchConfigs();

        // 2. THIẾT LẬP KẾT NỐI SIGNALR
        let daDongKetNoi = false;
        const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7284';
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/systemConfigHub`) // Khớp với MapHub bên Backend
            .withAutomaticReconnect() // Tự động kết nối lại nếu rớt mạng
            .configureLogging(signalR.LogLevel.Error)
            .build();

        connection.start()
            .then(() => {
                if (daDongKetNoi) {
                    void connection.stop();
                    return;
                }
                console.log("Đã kết nối SignalR thành công!");
                
                // 3. LẮNG NGHE TÍN HIỆU TỪ BACKEND
                connection.on("ReceiveConfigUpdate", () => {
                    console.log("Tín hiệu Realtime: Đang cập nhật lại giao diện...");
                    fetchConfigs(); 
                });
            })
            .catch(err => {
                if (daDongKetNoi) return;

                const message = String(err?.message ?? err ?? "");
                // Dev/StrictMode có thể stop connection trong lúc negotiation, không ảnh hưởng nghiệp vụ.
                if (message.includes("stopped during negotiation")) {
                    console.debug("SignalR bị dừng trong lúc khởi tạo (bỏ qua).");
                    return;
                }

                console.warn("SignalR chưa kết nối được, hệ thống sẽ tự thử lại.", err);
            });

        // Dọn dẹp kết nối khi đóng web
        return () => {
            daDongKetNoi = true;
            void connection.stop();
        };
    }, []);

    return (
        <SystemConfigContext.Provider value={{ configs, refreshConfigs: fetchConfigs }}>
            {children}
        </SystemConfigContext.Provider>
    );
};