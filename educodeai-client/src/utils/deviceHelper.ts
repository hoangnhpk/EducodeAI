// Hàm lấy thông tin hệ điều hành và trình duyệt
const getDeviceName = (): string => {
    const userAgent = navigator.userAgent;
    let deviceName = "Thiết bị không xác định";
    
    // Check OS
    if (userAgent.includes("Windows")) deviceName = "Máy tính Windows";
    else if (userAgent.includes("Mac")) deviceName = "Máy tính Mac / MacBook";
    else if (userAgent.includes("Android")) deviceName = "Điện thoại Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) deviceName = "iPhone / iPad";

    // Check Browser
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) deviceName += " (Chrome)";
    else if (userAgent.includes("Firefox")) deviceName += " (Firefox)";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) deviceName += " (Safari)";
    else if (userAgent.includes("Edg")) deviceName += " (Edge)";

    return deviceName;
};

// KỸ THUẬT A: CANVAS FINGERPRINTING
// Tạo dấu vân tay dựa trên cách trình duyệt vẽ đồ họa (duy nhất cho phần cứng)
const getCanvasFingerprint = () => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return "";

        canvas.width = 200;
        canvas.height = 50;

        // Vẽ văn bản với các thuộc tính phức tạp
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("EduCodeAI-Fingerprint-Check", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("EduCodeAI-Fingerprint-Check", 4, 17);

        // Trích xuất dữ liệu ảnh dưới dạng Base64
        return canvas.toDataURL();
    } catch (e) {
        return "";
    }
};

// Hàm băm chuỗi (Hash string to 32-bit integer)
const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase();
};

// Hàm tạo hoặc lấy ID thiết bị duy nhất
export const getDeviceInfo = () => {
    // 1. Lấy thông tin cơ bản
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const hardware = `${navigator.hardwareConcurrency || "unknown"}`;
    const platform = (navigator as any).userAgentData?.platform || navigator.platform;
    
    // 2. Lấy Canvas Fingerprint
    const canvasData = getCanvasFingerprint();
    
    // 3. Kết hợp tất cả để tạo mã băm cuối cùng (Dựa trên phần cứng thật)
    const rawFingerprint = `${platform}|${screenRes}|${hardware}|${canvasData}`;
    const fingerprint = "FP-" + hashString(rawFingerprint);

    // 4. deviceId: Vẫn giữ localStorage để tương thích
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        localStorage.setItem('device_id', deviceId);
    }

    return {
        maThietBi: fingerprint, 
        tenThietBi: getDeviceName(),
        rawDeviceId: deviceId
    };
};
