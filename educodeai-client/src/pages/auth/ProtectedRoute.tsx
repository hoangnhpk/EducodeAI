
import { Navigate } from 'react-router-dom';
import { clearAuthTokens, getAccessToken } from '../../utils/authStorage';

interface Props {
    children: React.ReactNode;
    allowRoles: number[]; 
}

const ProtectedRoute: React.FC<Props> = ({ children, allowRoles }) => {
    const userRaw = localStorage.getItem('user_info');
    const accessToken = getAccessToken();

    // user_info chỉ phục vụ hiển thị; access token runtime mới xác nhận phiên bootstrap thành công.
    if (!userRaw || !accessToken) {
        return <Navigate to="/dang-nhap" replace />;
    }

    let user: any;
    try {
        user = JSON.parse(userRaw);
    } catch {
        clearAuthTokens();
        localStorage.removeItem("user_info");
        return <Navigate to="/dang-nhap" replace />;
    }

    if (!user || typeof user !== "object") {
        clearAuthTokens();
        localStorage.removeItem("user_info");
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