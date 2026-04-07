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

// Hàm tạo hoặc lấy ID thiết bị duy nhất
export const getDeviceInfo = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        // Sinh ra chuỗi ngẫu nhiên làm ID thiết bị vĩnh viễn cho máy này
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        localStorage.setItem('device_id', deviceId);
    }

    return {
        maThietBi: deviceId,
        tenThietBi: getDeviceName()
    };
};