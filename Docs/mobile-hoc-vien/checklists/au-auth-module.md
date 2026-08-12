# Âu — Module Auth & Account

## Phạm vi end-to-end

Login, đăng ký học viên, OTP, bootstrap/session, logout, quên/đặt lại/đổi mật khẩu, hồ sơ cá nhân và quản lý thiết bị. Native chỉ chấp nhận học viên (`VaiTro = 2`); giảng viên và quản trị viên được hướng dẫn sử dụng web desktop.

## Đọc trước

- `Mobile/src/context/AuthContext.tsx`, `Mobile/src/configs/api.ts`.
- Web `auth.service.ts`, `authBootstrap.ts`, `deviceHelper.ts` và các page auth.
- `ho-so-hoc-vien.service.ts`, các page hồ sơ/thiết bị.
- `XacThucController.cs` và controller hồ sơ tương ứng.
- [Auth specification](../02-auth-va-session.md) và [design system](../08-design-system-va-ui-sync.md).

## Tái sử dụng

- Payload/response auth, OTP, device và profile hiện có.
- Primary orange, form/button/error patterns của web auth.
- Icon semantics: person, lock, eye, shield, device, logout.
- `AnimatedPressable` cho nút native phù hợp.

## Checklist triển khai

### Contract và service
- [ ] Xác minh mọi nhánh response đăng nhập/OTP/thay thiết bị.
- [ ] Xác minh role từ response/JWT/server; không tin role chỉ lưu trong AsyncStorage.
- [ ] Chỉ lưu token/user sau khi server xác nhận `VaiTro = 2`.
- [ ] Nếu role là GV/QTV: không tạo phiên mobile, xóa dữ liệu phiên cũ và hiển thị hướng dẫn dùng web desktop.
- [ ] Khi bootstrap phát hiện role không còn là học viên: đóng nội dung, clear session và về màn hình thông báo/đăng nhập.
- [ ] Tạo device helper native và auth/account service adapter.
- [ ] Chốt chiến lược P0: access token AsyncStorage; 401 logout. Refresh cookie đầy đủ chỉ khi đã xác minh native.
- [ ] Đồng bộ clear session giữa interceptor và AuthContext.

### UI và flow
- [ ] Login, register, OTP và forgot/reset password.
- [ ] Splash/bootstrap và auth guard contract.
- [ ] Navigation sau đăng nhập chỉ chứa chức năng học viên; không render menu GV/QTV.
- [ ] Màn hình từ chối GV/QTV dùng thông báo: “Tài khoản Giảng viên và Quản trị viên chỉ được đăng nhập trên phiên bản máy tính. Vui lòng truy cập EduCodeAI bằng trình duyệt trên máy tính để tiếp tục.”
- [ ] Profile xem/cập nhật, avatar FormData native.
- [ ] Đổi mật khẩu, danh sách thiết bị và đăng xuất từ xa.
- [ ] Form dùng token, icon và component state chung; keyboard không che CTA.

### Test
- [ ] Login/register/OTP đúng, sai, hết hạn.
- [ ] Restart app, 401 và logout.
- [ ] Đăng nhập bằng tài khoản học viên thành công và chỉ thấy navigation học viên.
- [ ] GV/QTV không được lưu token/user, thấy đúng hướng dẫn dùng web.
- [ ] Sửa role cục bộ thành học viên không vượt qua kiểm tra server/API.
- [ ] Phiên học viên bị đổi role được xóa ở bootstrap/API kế tiếp.
- [ ] Profile/avatar/mật khẩu/device errors.
- [ ] Không log token, password, OTP.

## Bàn giao

- AuthContext public interface.
- Route auth/account và điều kiện guard.
- Endpoint đã test, mục VERIFY và lỗi còn lại.
