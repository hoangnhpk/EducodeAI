# Baseline bảo mật xác thực — Phase A

> Nhánh thực hiện: `Au2`  
> Phạm vi: auth, user/device/session và đăng ký/duyệt giảng viên.  
> Tài liệu này ghi nhận hành vi hiện tại trước khi triển khai các giai đoạn B–K; việc ghi nhận một lỗ hổng không có nghĩa lỗ hổng đã được sửa.

## A.1 — Inventory endpoint và authorization hiện tại

### Xác thực công khai — `api/XacThuc`

| Method | Route | Authorization hiện tại | Phân loại yêu cầu | Ghi chú baseline |
|---|---|---|---|---|
| POST | `dang-nhap` | Public do không có attribute | Public | Cần rate-limit và CAPTCHA server-side |
| POST | `google-login` | Public | Public | Backend hiện cần được kiểm tra việc verify provider token |
| POST | `facebook-login` | Public | Public | Backend hiện cần được kiểm tra việc verify provider token |
| POST | `refresh-token` | Public | Refresh-cookie/token authenticated | Hiện nhận refresh token qua query string |
| POST | `xac-nhan-otp` | Public | Public OTP flow | OTP phải là single-use và rate-limited |
| POST | `xac-nhan-thay-the-thiet-bi` | Public | Public OTP flow | Không được tin device ID như credential |
| POST | `dang-ky` | Public | Public | Phát OTP đăng ký |
| POST | `xac-minh-dang-ky` | Public | Public OTP flow | Tạo user sau xác minh |
| POST | `giang-vien/gui-otp-email` | Public | Public | Phải dùng OTP policy chung |
| POST | `giang-vien/xac-minh-otp-email` | Public | Public OTP flow | Phải giới hạn attempt |
| POST | `dang-ky-giang-vien` | Public | Public | Multipart, có dữ liệu nhạy cảm |
| GET | `trang-thai-ho-so` | Public | Public nhưng chống enumeration | Hiện tra cứu bằng email |
| GET | `kiem-tra-quyen-bo-sung/{maHoSo}` | Public | Token-scoped | Token hiện có thể đi qua query string |
| PUT | `bo-sung-ho-so/{maHoSo}` | Public | Token-scoped | Service phải bind token đúng hồ sơ |
| POST | `quen-mat-khau` | Public | Public | Response phải generic |
| POST | `dat-lai-mat-khau` | Public | OTP/reset-token scoped | Sau reset phải revoke session |
| POST | `quet-giay-to` | Public + rate-limit policy | Public trong đăng ký giảng viên | Không lưu ảnh giấy tờ; không log OCR |

### Xác thực người dùng — `api/XacThuc`

| Method | Route | Authorization hiện tại | Phân loại yêu cầu | Ghi chú baseline |
|---|---|---|---|---|
| GET | `danh-sach-thiet-bi` | `[Authorize]` | Authenticated owner | Lấy user id từ claim `id` |
| POST | `dang-xuat` | `[Authorize]` | Authenticated owner | Hiện tin device ID trong body |
| POST | `yeu-cau-otp-dang-xuat-tu-xa` | `[Authorize]` | Authenticated owner | Phát OTP remote logout |
| POST | `xac-nhan-dang-xuat-tu-xa` | `[Authorize]` | Authenticated owner | Phải kiểm ownership session |
| POST | `doi-mat-khau` | `[Authorize]` | Authenticated owner | Phải verify mật khẩu cũ và revoke theo policy |

### User/status

| Method | Route | Authorization hiện tại | Phân loại yêu cầu | Mismatch |
|---|---|---|---|---|
| GET | `api/NguoiDung/check-email` | Public | Public có rate-limit/anti-enumeration | Trả `exists` trực tiếp |
| GET | `api/auth/check-trang-thai` | `[Authorize]` | Authenticated | Đúng baseline |

### Quản lý người dùng

Controller `QuanLyNguoiDungController` hiện không có `[Authorize]` ở controller hoặc action.

| Method | Route | Hiện tại | Yêu cầu | Mismatch |
|---|---|---|---|---|
| GET | `api/nguoi-dung` | Public | Admin-only | CRITICAL |
| POST | `api/nguoi-dung/them-nguoi-dung` | Public | Admin-only | CRITICAL |
| PUT | `api/nguoi-dung/sua-nguoi-dung/{id}` | Public | Admin-only | CRITICAL |
| PUT | `api/nguoi-dung/khoa-nguoi-dung/{id}` | Public | Admin-only | CRITICAL |
| DELETE | `api/nguoi-dung/xoa-nguoi-dung/{id}` | Public | Admin-only | CRITICAL |

### Duyệt hồ sơ giảng viên

`QuanLyHoSoGiangVienController` có `[Authorize(Roles = "Admin")]` ở controller level. Các endpoint danh sách, chi tiết, đếm, duyệt, từ chối và yêu cầu bổ sung đều Admin-only theo metadata hiện tại.

## A.2 — Inventory dữ liệu nhạy cảm

| Dữ liệu | Nơi tạo/đọc/lưu/truyền hiện tại | Rủi ro baseline | Task xử lý |
|---|---|---|---|
| JWT signing key | `Program.cs` đọc cấu hình và hiện ghi giá trị ra console | CRITICAL secret disclosure | B.1–B.3 |
| Access token | `XacThucService` tạo JWT; frontend lưu `user_token` trong localStorage và gắn Authorization | XSS đọc token; TTL dài | C.1–C.2, C.10 |
| Refresh token | Service tạo từ GUID và cache raw; frontend lưu localStorage; refresh gửi qua query URL | Replay, URL/log leak, mất khi restart | C.3–C.11 |
| OTP thiết bị/đăng ký/password/teacher | Nhiều nhánh trong `XacThucService`, một số dùng `Random` và cache plain text | Dự đoán/replay/không giới hạn attempt | D.1–D.9 |
| Password đăng ký | DTO đăng ký có thể được cache trước khi OTP hoàn tất | Plain password tồn tại lâu trong process memory | D.7 |
| Password login/reset/change | Request body → BCrypt verify/hash | Cần policy và session revoke | F.3–F.7 |
| Authorization header | `axios.ts` tạo Bearer header từ localStorage | Có thể lộ nếu log hoặc XSS | B.2–B.3, C.10 |
| Cookie | OTP/identifier cookies và tương lai refresh cookie | Cần HttpOnly/Secure/SameSite/path/CSRF | C.5, C.11 |
| Device fingerprint | `deviceHelper.ts` tạo metadata gửi server | Có thể spoof; không phải credential | E.4, G.4–G.6 |
| OCR/CCCD | `GiayToScanningService` đọc ảnh trong RAM và parse text; có log raw OCR trong development | CRITICAL PII log disclosure | B.2–B.3, I.4–I.5 |
| Hồ sơ CCCD mã hóa | Đăng ký giảng viên mã hóa payload OCR; số giấy tờ vẫn phục vụ duplicate check | Cần tối thiểu hóa và audit | I.2, I.4, I.10 |
| Maintenance bypass | `axios.ts` tự gắn `X-Bypass-Maintenance` theo URL frontend | Client-controlled authorization bypass | J.1–J.2 |

## A.6 — Ma trận quyền chuẩn cần đạt

| Nhóm endpoint | Public | Authenticated | Admin-only |
|---|---:|---:|---:|
| Login/social/refresh | Có | Không | Không |
| Register/verify OTP/forgot/reset | Có | Không | Không |
| Teacher submit/status/supplement | Có nhưng CAPTCHA/rate-limit/token scope | Không | Không |
| Device list/logout/change password | Không | Có, owner-only | Không |
| User status | Không | Có | Không |
| User management | Không | Không | Có |
| Teacher application review | Không | Không | Có |

### Mismatch phải sửa ở giai đoạn sau

1. `QuanLyNguoiDungController` đang public toàn bộ — sửa ở J/H.
2. Maintenance bypass dựa trên header/path frontend — sửa ở J.
3. Refresh token nằm trong query/localStorage — sửa ở C.
4. Public check-email và teacher status có nguy cơ enumeration — sửa ở D/F.
5. Public OCR endpoint cần CAPTCHA/rate-limit/upload validation chặt — sửa ở D/I.
6. Controller trả `ex.Message` và log OCR/stack — sửa ở B.

## Tiêu chí test Phase A

Baseline tests không gọi database thật, SMTP, OAuth provider, Redis hoặc OCR. Các service được mock để khóa contract controller/DTO/axios hiện tại. Những test mô tả hành vi không an toàn hiện tại sẽ được đổi thành security regression tests khi giai đoạn tương ứng được triển khai.
