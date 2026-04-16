import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
    allowRoles: number[]; 
}

const ProtectedRoute: React.FC<Props> = ({ children, allowRoles }) => {
    const userRaw = localStorage.getItem('user_info');
    
    // 1. Chưa đăng nhập -> Đá về trang đăng nhập
    if (!userRaw) {
        return <Navigate to="/dang-nhap" replace />;
    }

    let user: any;
    try {
        user = JSON.parse(userRaw);
    } catch {
        localStorage.removeItem("user_info");
        localStorage.removeItem("user_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token");
        return <Navigate to="/dang-nhap" replace />;
    }

    if (!user || typeof user !== "object") {
        localStorage.removeItem("user_info");
        localStorage.removeItem("user_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token");
        return <Navigate to="/dang-nhap" replace />;
    }

    const role = user.vaiTro !== undefined ? user.vaiTro : user.VaiTro;

    // 2. Kiểm tra xem vai trò hiện tại có nằm trong danh sách cho phép không
    if (!allowRoles.includes(role)) {
        // Nếu không đủ quyền, đá về trang chủ
        return <Navigate to="/" replace />;
    }

    // 3. Hợp lệ
    return children;
};

export default ProtectedRoute;