# Xác thực và quản lý phiên

## Đọc trước

- `educodeai-mobile/src/features/auth/context/AuthContext.tsx`
- `educodeai-mobile/src/shared/configs/api.ts`
- `educodeai-client/src/services/auth.service.ts`
- `educodeai-client/src/configs/authBootstrap.ts`
- `educodeai-client/src/utils/deviceHelper.ts`
- `educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/QuanLyThietBi.tsx`
- `educodeai-server/Controllers/XacThucController.cs`

## Tái sử dụng

Tái sử dụng payload và trạng thái nghiệp vụ của login/register/OTP/device/forgot-password/refresh/logout. Không chép `localStorage`, `window`, cookie browser hoặc SignalR nguyên xi sang React Native.

## UI/UX cần port

- Login: identifier, password, loading, lỗi nghiệp vụ, nhánh OTP/thay thiết bị.
- Register học viên: form → gửi OTP → xác minh OTP.
- Quên mật khẩu: gửi OTP → xác minh → đặt mật khẩu mới.
- Bootstrap: splash cho đến khi biết trạng thái phiên.
- Profile entry và logout.
- Quản lý thiết bị: danh sách phiên, OTP đăng xuất từ xa.

## Checklist triển khai

### Đọc và xác minh
- [ ] Đọc toàn bộ nhánh response của `dang-nhap` trong controller/service.
- [ ] Xác minh token/user nằm ở trường nào trong response.
- [ ] Xác minh refresh token native có thể nhận/lưu như thế nào; không giả định cookie web hoạt động.
- [ ] Xác minh format `maThietBi`, `tenThietBi`; tạo helper native thay vì dùng browser UA.
- [ ] Xác minh role học viên dạng số hay chuỗi trong response.

### Thực hiện
- [ ] Chuyển base URL sang cấu hình Expo environment.
- [ ] Tạo auth service native bám contract đã đọc.
- [ ] Mở rộng AuthContext cho bootstrap, login, logout và clear session khi 401.
- [ ] Tạo auth screens và route guard.
- [ ] Thêm OTP/register/forgot-password theo response thật.
- [ ] Chỉ làm quản lý thiết bị sau khi auth cốt lõi ổn.

### Kiểm thử
- [ ] Login đúng/sai, app restart, token hết hạn, logout.
- [ ] Đăng ký + OTP đúng/sai/hết hạn.
- [ ] Nhánh thiết bị mới/vượt giới hạn nếu backend trả về.
- [ ] Không log token, mật khẩu hoặc OTP.

## Done

Người dùng đăng nhập/đăng ký được trên thiết bị test, khôi phục hoặc kết thúc phiên nhất quán, và màn hình bảo vệ không hiển thị trước bootstrap.
