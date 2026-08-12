# Âu — Kế hoạch triển khai Auth & Account Mobile học viên

> **Người phụ trách:** Âu  
> **Phạm vi:** thiết kế giao diện native → tích hợp API → session → kiểm thử end-to-end  
> **Nền tảng:** Expo / React Native  
> **Đối tượng duy nhất:** Học viên (`VaiTro = 2`)  
> **Trạng thái:** kế hoạch triển khai; các contract chưa được backend xác nhận phải giữ nhãn `VERIFY`

## 1. Mục tiêu

Xây dựng đầy đủ module Auth & Account trên mobile với luồng nghiệp vụ giống desktop EduCodeAI, nhưng bố cục và thao tác phù hợp thiết bị di động.

Module hoàn thành phải hỗ trợ:

1. Đăng nhập bằng tài khoản/email và mật khẩu.
2. Xác minh OTP khi đăng nhập trên thiết bị mới.
3. Xác nhận thay thế thiết bị khi tài khoản đạt giới hạn phiên.
4. Đăng ký tài khoản học viên và xác minh OTP.
5. Quên mật khẩu, xác minh OTP và đặt mật khẩu mới.
6. Bootstrap và khôi phục/kết thúc phiên khi mở lại ứng dụng.
7. Đăng xuất thiết bị hiện tại.
8. Xem/cập nhật hồ sơ và ảnh đại diện.
9. Đổi mật khẩu khi đang đăng nhập.
10. Xem thiết bị, yêu cầu OTP và đăng xuất thiết bị từ xa.
11. Chặn tài khoản Giảng viên/Quản trị viên khỏi phiên mobile.

Không đưa đăng ký giảng viên, quản trị, quét CCCD hoặc nghiệp vụ desktop-only vào mobile học viên.

## 2. Tài liệu và mã nguồn bắt buộc đối chiếu

### 2.1. Thứ tự nguồn sự thật

1. Controller, service implementation và DTO backend.
2. Response thực tế từ API trên môi trường test.
3. Web service đang gọi API.
4. Web page thể hiện luồng và thông báo nghiệp vụ.
5. Native adapter và native screen.

Nếu web page khác backend, backend và response thực tế là nguồn quyết định. Không sửa native bằng cách đoán contract.

### 2.2. Tài liệu canonical

- `Docs/mobile-hoc-vien/00-overview.md`
- `Docs/mobile-hoc-vien/02-auth-va-session.md`
- `Docs/mobile-hoc-vien/05-quiz-review-profile.md`
- `Docs/mobile-hoc-vien/08-design-system-va-ui-sync.md`
- `Docs/mobile-hoc-vien/checklists/au-auth-module.md`
- `Docs/mobile-hoc-vien/decisions/ADR-001-native-mobile-reuse-existing-contracts.md`

### 2.3. Mã nguồn tham chiếu

**Native hiện có**

- `educodeai-mobile/src/features/auth/context/AuthContext.tsx`
- `educodeai-mobile/src/shared/configs/api.ts`
- `educodeai-mobile/src/shared/components/animated-pressable.tsx`

**Desktop web**

- `educodeai-client/src/services/auth.service.ts`
- `educodeai-client/src/configs/authBootstrap.ts`
- `educodeai-client/src/configs/axios.ts`
- `educodeai-client/src/utils/deviceHelper.ts`
- `educodeai-client/src/pages/auth/loginFlow.ts`
- `educodeai-client/src/pages/auth/DangNhap.tsx`
- `educodeai-client/src/pages/auth/DangKy.tsx`
- `educodeai-client/src/pages/auth/QuenMatKhau.tsx`
- `educodeai-client/src/pages/auth/ProtectedRoute.tsx`
- `educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/*`
- `educodeai-client/src/pages/hoc-vien/bao-mat-tai-khoan/*`
- `educodeai-client/src/assets/styles/variables.css`
- `educodeai-client/src/assets/styles/hoc-vien-global.css`

**Backend**

- `educodeai-server/Controllers/XacThucController.cs`
- `educodeai-server/Controllers/HocVien/HoSoHocVienController.cs`
- DTO trong `educodeai-server/DTOs/XacThuc/` và DTO hồ sơ liên quan.
- Auth/OTP/session tests trong `educodeai-server.Tests/Security/`.

## 3. Các vấn đề hiện tại phải xử lý

| Hạng mục | Hiện trạng | Việc cần làm |
|---|---|---|
| API base URL | Hard-code IP LAN | Chuyển sang Expo environment |
| Auth bootstrap | Chỉ đọc token/user từ AsyncStorage | Xác minh phiên với server và kiểm tra role |
| Role | Native khai báo `vaiTro: string` | `VERIFY` kiểu thực tế; chuẩn hóa số/chuỗi an toàn |
| Session | Interceptor tự xóa storage nhưng không đồng bộ Context | Tạo một hàm clear session dùng chung |
| Refresh | Web dựa vào HttpOnly cookie | `VERIFY`; không giả định Expo nhận cookie giống browser |
| Auth screens | Chưa có | Tạo theo luồng desktop và design system canonical |
| Auth service | Chưa có | Tạo typed native adapter theo controller/DTO |
| Device identity | Chưa có helper native | Chốt format và tạo helper ổn định trên thiết bị |
| Route guard | Chưa hoàn chỉnh | Không render protected screens trước bootstrap |
| Error handling | Chưa chuẩn hóa | Chuẩn hóa field/API/session errors và retry |

## 4. Nguyên tắc kiến trúc và bảo mật

1. Chỉ tạo mobile session sau khi server xác nhận tài khoản là học viên.
2. Không tin `user` hoặc `vaiTro` chỉ vì dữ liệu đó có trong AsyncStorage.
3. Giảng viên (`VaiTro = 1`) và Quản trị viên (`VaiTro = 0`) không được lưu token/user trên mobile.
4. Khi role bị đổi sau khi đã đăng nhập, request/bootstrap tiếp theo phải đóng nội dung và clear phiên.
5. Không log token, refresh token, mật khẩu, OTP hoặc reset token.
6. Logout local phải hoàn tất kể cả khi API logout lỗi/mất mạng.
7. Không sao chép `localStorage`, `window`, user-agent browser, cookie browser hoặc SignalR nguyên xi.
8. Không dùng Web `File`; avatar React Native dùng `{ uri, name, type }` trong FormData.
9. Không set `Content-Type: multipart/form-data` thủ công nếu Axios cần tự tạo boundary.
10. Interceptor không tự điều hướng độc lập; nó phát sự kiện/callback cho AuthContext clear phiên nhất quán.

## 5. Kiến trúc native đề xuất

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── role-rejected.tsx
│   └── (student)/
│       └── account/*
├── features/auth/
│   ├── components/
│   │   ├── auth-shell.tsx
│   │   ├── password-field.tsx
│   │   └── otp-field.tsx
│   ├── context/AuthContext.tsx
│   ├── hooks/use-auth.ts
│   ├── screens/*
│   ├── services/auth.service.ts
│   ├── types/auth.types.ts
│   └── utils/
│       ├── classify-login-response.ts
│       ├── auth-validation.ts
│       └── role.ts
├── features/account/
│   ├── screens/*
│   ├── services/account.service.ts
│   └── types/account.types.ts
└── shared/
    ├── configs/api.ts
    ├── constants/storage-keys.ts
    ├── lib/auth-storage.ts
    ├── utils/device.ts
    └── theme/*
```

Tên/path có thể điều chỉnh theo router thực tế, nhưng phải giữ ranh giới:

- `service`: chỉ giao tiếp API.
- `types`: request/response đã xác minh.
- `classifier`: chuyển response nhiều nhánh thành trạng thái có kiểu.
- `AuthContext`: lifecycle phiên và public actions.
- `screen`: UI và điều phối thao tác người dùng; không chứa logic parse response rải rác.

## 6. Auth state machine

```text
APP_START
  └─> BOOTSTRAPPING
       ├─ không có credential ─> UNAUTHENTICATED
       ├─ credential hợp lệ + role 2 ─> AUTHENTICATED_STUDENT
       ├─ role 0/1 ─> REJECTED_ROLE + CLEAR_SESSION
       ├─ 401/revoked/expired ─> SESSION_EXPIRED + CLEAR_SESSION
       └─ lỗi mạng ─> BOOTSTRAP_ERROR (retry hoặc đăng xuất)

UNAUTHENTICATED
  └─ login
       ├─ completed + role 2 ─> AUTHENTICATED_STUDENT
       ├─ requiresOtp ─> DEVICE_OTP
       ├─ requiresLogoutOldest ─> REPLACE_DEVICE_CONFIRM
       ├─ requiresCaptcha ─> LOGIN_CAPTCHA
       ├─ role 0/1 ─> REJECTED_ROLE
       └─ lỗi ─> LOGIN_ERROR

AUTHENTICATED_STUDENT
  ├─ logout ─> UNAUTHENTICATED
  ├─ 401/revoked ─> SESSION_EXPIRED
  └─ role không còn là 2 ─> REJECTED_ROLE
```

Public interface dự kiến:

```ts
type AuthStatus =
  | 'bootstrapping'
  | 'unauthenticated'
  | 'authenticatedStudent'
  | 'rejectedRole'
  | 'sessionExpired'
  | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: StudentUser | null;
  accessToken: string | null;
  bootstrap(): Promise<void>;
  completeLogin(result: CompletedLogin): Promise<void>;
  logout(): Promise<void>;
  clearSession(reason?: SessionEndReason): Promise<void>;
  retryBootstrap(): Promise<void>;
}
```

## 7. Kế hoạch thiết kế giao diện

### 7.1. Nhận diện giống desktop

- Logo chữ `EDUCODEAI`, phần `AI` dùng primary orange.
- CTA chính màu `#F69050`; pressed `#E67E22`.
- Nền `#F9FAFB`, card/form surface trắng, text `#111827`, muted `#6B7280`.
- Success/danger/warning/info lấy đúng token canonical.
- Font Inter nếu đã đóng gói; fallback system/Roboto.
- Spacing: 4, 8, 12, 16, 20, 24, 32.
- Radius: 6, 10, 16; shadow nhẹ, không glow/gradient tùy ý.
- Icon nhất quán bằng Ionicons hoặc family đã chốt: person, lock, eye, shield, device, logout.
- Không dùng màu inline cũ `#fb873f`; token chuẩn là `#F69050`.

### 7.2. Chuyển desktop sang native

Giữ nội dung, thứ tự hành động, thông báo và trạng thái nghiệp vụ của desktop; không copy nguyên container Bootstrap, background fixed, sidebar hoặc SweetAlert.

Mẫu auth native:

```text
SafeArea
└── KeyboardAvoidingView
    └── ScrollView
        ├── Back/Home action
        ├── EDUCODEAI
        ├── Title + description
        ├── Fields + field errors
        ├── Secondary action
        ├── Primary CTA
        ├── Optional social/captcha area
        └── Register/Login link
```

Yêu cầu chung:

- Form một cột, CTA không bị bàn phím che.
- Touch target tối thiểu 44×44.
- Hỗ trợ 320–430px và tablet.
- Lỗi hiển thị sát field; lỗi hệ thống đặt trong alert/banner.
- Có loading, disabled, error, success và retry phù hợp.
- Screen reader label cho icon-only button; OTP dùng numeric keyboard/one-time-code khi platform hỗ trợ.

## 8. Đặc tả từng màn hình và luồng

### 8.1. Splash/bootstrap

**UI:** logo EduCodeAI, nền trung tính, activity indicator; không nháy màn hình login/home.

**Luồng:**

1. Khởi tạo device identity.
2. Đọc access token từ storage.
3. Nếu không có token: về auth stack.
4. Nếu có token: xác minh phiên bằng API đã chốt.
5. Xác minh role từ server/JWT/API.
6. Role 2 → student stack; 401/role khác → clear session.
7. Mạng lỗi → màn retry/đăng xuất, không tự cho vào protected screen.

### 8.2. Đăng nhập

**UI bám desktop:** logo, tiêu đề “Đăng nhập”, mô tả “Truy cập vào hệ thống EduCodeAI”, identifier, password/show-hide, “Quên mật khẩu?”, CTA “Tiếp theo”, liên kết trang chủ/đăng ký.

**Validation:**

- Identifier không được trống.
- Password không được trống.
- Khi backend yêu cầu captcha, chỉ cho submit sau khi captcha hợp lệ.

**Request dự kiến:**

```json
{
  "taiKhoan": "<email-hoac-tai-khoan>",
  "matKhau": "<password>",
  "maThietBi": "<native-device-id>",
  "tenThietBi": "<native-device-name>",
  "captchaToken": "<token-hoac-gia-tri-da-backend-chap-nhan>"
}
```

**Phân loại response giống desktop `classifyLoginResponse`:**

| Điều kiện | Trạng thái |
|---|---|
| `token` + `user` | Completed |
| `requiresOtp === true` + `email` | OTP thiết bị mới |
| `requiresLogoutOldest === true` + `email` + `oldestDeviceName` | Thay thiết bị |
| `requiresCaptcha === true` | Yêu cầu captcha |
| Khác | Invalid response, báo lỗi có kiểm soát |

`VERIFY`: mobile captcha dùng giải pháp nào và backend có chấp nhận `SKIP_CAPTCHA` ở môi trường nào. Không hard-code bỏ captcha cho production.

### 8.3. OTP thiết bị mới

- Hiển thị mô tả mã được gửi qua email.
- Ô OTP 6 chữ số; loại ký tự không phải số.
- CTA chỉ enable khi đủ 6 số.
- Gọi `POST /api/XacThuc/xac-nhan-otp` với tài khoản/email, OTP và device info.
- Response tiếp tục đi qua cùng classifier; chỉ lưu phiên khi completed + role 2.
- Sai/hết hạn/quá số lần: hiển thị message backend; không tự đổi nội dung nghiệp vụ.
- Resend/countdown chỉ triển khai khi có endpoint/rule backend được xác minh.

### 8.4. Thay thế thiết bị

- Hiển thị tên thiết bị cũ từ `oldestDeviceName`.
- Cảnh báo tài khoản đạt giới hạn thiết bị.
- Cho phép hủy hoặc tiếp tục xác minh OTP.
- Gọi `POST /api/XacThuc/xac-nhan-thay-the-thiet-bi`.
- Không đăng xuất thiết bị cũ chỉ bằng thao tác UI; chờ backend xác nhận thành công.

### 8.5. Từ chối GV/QTV

Ngay khi response completed nhưng role không phải học viên:

1. Không persist token/user.
2. Xóa mọi session cũ.
3. Hiển thị:

> “Tài khoản Giảng viên và Quản trị viên chỉ được đăng nhập trên phiên bản máy tính. Vui lòng truy cập EduCodeAI bằng trình duyệt trên máy tính để tiếp tục.”

4. CTA quay về đăng nhập; không render student navigation.

### 8.6. Đăng ký học viên

**Luồng:** form → `dang-ky` → OTP → `xac-minh-dang-ky` → classifier → student session hoặc login.

**Field theo web/backend:** họ tên, tài khoản, email, mật khẩu, xác nhận mật khẩu và captcha nếu backend yêu cầu.

**Endpoint:**

- `POST /api/XacThuc/dang-ky`
- `POST /api/XacThuc/xac-minh-dang-ky`

OTP đăng ký backend công bố hiệu lực 5 phút. Phải test OTP sai, hết hạn, single-use, phát mã mới làm mã cũ mất hiệu lực và giới hạn attempts.

### 8.7. Quên và đặt lại mật khẩu

**Luồng:**

1. Nhập email.
2. `POST /api/XacThuc/quen-mat-khau`.
3. Nhập OTP.
4. `POST /api/XacThuc/xac-minh-otp-quen-mat-khau`.
5. Nhận reset token (`VERIFY` tên field thực tế).
6. Nhập mật khẩu mới + xác nhận.
7. `POST /api/XacThuc/dat-lai-mat-khau` với email, reset token và device info.
8. Clear session liên quan theo hành vi backend và quay về login/success.

Không lưu OTP/reset token lâu dài trong AsyncStorage.

### 8.8. Đăng xuất

- Xác nhận bằng native modal/bottom sheet.
- Gọi `POST /api/XacThuc/dang-xuat`, body JSON string `maThietBi`, bearer token.
- Clear local session trong `finally` để mất mạng không giữ người dùng trong app.
- Điều hướng về auth stack sau khi state đã clear.

### 8.9. Hồ sơ và avatar

- GET/PUT `/api/hoc-vien/ho-so` theo controller/DTO thực tế.
- Hiển thị loading, error/retry và profile data.
- Validate field theo backend; không thêm field không được API hỗ trợ.
- Avatar dùng image picker và FormData React Native `{ uri, name, type }`.
- `VERIFY` endpoint/field avatar chính xác trước khi code.

### 8.10. Đổi mật khẩu

- Field: mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới.
- Gọi `POST /api/XacThuc/doi-mat-khau` với DTO đã xác minh.
- Hiển thị success rõ ràng; xử lý session/revoke theo backend.
- Không log hoặc lưu mật khẩu.

### 8.11. Quản lý thiết bị và đăng xuất từ xa

1. `GET /api/XacThuc/danh-sach-thiet-bi?maThietBiHienTai=...`.
2. Đánh dấu thiết bị hiện tại, last active và thông tin backend trả về.
3. Chọn phiên hoặc “đăng xuất tất cả” theo UI desktop.
4. `POST /api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa`.
5. Nhập OTP/captcha theo contract.
6. `POST /api/XacThuc/xac-nhan-dang-xuat-tu-xa`.
7. Refresh danh sách; nếu phiên hiện tại bị revoke, clear local session.

## 9. Ma trận API cần xác minh

| Chức năng | Method/path | Auth | Trạng thái |
|---|---|---:|---|
| Login | `POST /api/XacThuc/dang-nhap` | No | Path xác nhận; response branches cần test thật |
| OTP login | `POST /api/XacThuc/xac-nhan-otp` | No | Path xác nhận; DTO cần đối chiếu |
| Replace device | `POST /api/XacThuc/xac-nhan-thay-the-thiet-bi` | No | Path xác nhận; DTO cần đối chiếu |
| Register request | `POST /api/XacThuc/dang-ky` | No | Xác nhận; OTP 5 phút |
| Register verify | `POST /api/XacThuc/xac-minh-dang-ky` | No | Response token/user `VERIFY` |
| Refresh | `POST /api/XacThuc/refresh-token` | Cookie | **BLOCKED/VERIFY cho native** |
| Forgot password | `POST /api/XacThuc/quen-mat-khau` | No | DTO/captcha cần test |
| Verify forgot OTP | `POST /api/XacThuc/xac-minh-otp-quen-mat-khau` | No | Reset token field `VERIFY` |
| Reset password | `POST /api/XacThuc/dat-lai-mat-khau` | No | DTO xác nhận từ backend |
| Logout | `POST /api/XacThuc/dang-xuat` | Bearer | Body là JSON string device ID |
| Session state | `GET /api/XacThuc/session-state` | Bearer | Có thể dùng bootstrap; `VERIFY` response/role |
| Device list | `GET /api/XacThuc/danh-sach-thiet-bi` | Bearer | Query current device |
| Remote logout OTP | `POST /api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa` | Bearer | Xác nhận |
| Remote logout confirm | `POST /api/XacThuc/xac-nhan-dang-xuat-tu-xa` | Bearer | DTO/captcha cần test |
| Change password | `POST /api/XacThuc/doi-mat-khau` | Bearer | DTO cần đối chiếu |
| Profile | `GET/PUT /api/hoc-vien/ho-so` | Bearer | DTO/avatar `VERIFY` |

### Blocker refresh token native

Backend hiện bảo vệ refresh bằng same-site Origin/Referer và refresh token HttpOnly cookie dành cho browser. Request native không được phép giả định luồng này hoạt động.

P0 an toàn:

- Lưu access token theo storage policy đã chốt.
- Khi 401/revoked: clear session và yêu cầu đăng nhập lại.
- Chỉ thêm refresh cho Expo sau khi backend cung cấp contract native rõ ràng và security review chấp thuận.

## 10. Thứ tự triển khai

### Phase 0 — Chốt contract

- [ ] Đọc toàn bộ DTO/service implementation cho các endpoint trong bảng.
- [ ] Gọi API bằng tài khoản test và lưu mẫu response đã loại bỏ secret.
- [ ] Chốt role, user/token, error envelope, device format và captcha.
- [ ] Chốt refresh strategy native với backend.
- [ ] Chuyển mọi mục chưa rõ thành `VERIFY`; không code giả định.

### Phase 1 — Foundation

- [ ] Tạo theme tokens canonical.
- [ ] Chuyển base URL sang Expo environment.
- [ ] Tạo auth storage và storage keys.
- [ ] Tạo device helper native.
- [ ] Tạo API error normalizer và callback 401.
- [ ] Tạo typed auth/account services.

### Phase 2 — Session core

- [ ] Viết response classifier.
- [ ] Refactor AuthContext theo state machine.
- [ ] Tạo bootstrap splash và protected/student guard.
- [ ] Chặn role 0/1 và role thay đổi.
- [ ] Đồng bộ interceptor → clear session.

### Phase 3 — Auth UI

- [ ] Shared auth shell, text field, password field, OTP field và buttons.
- [ ] Login + captcha branch.
- [ ] OTP thiết bị mới.
- [ ] Replace device.
- [ ] Role rejected/session expired.
- [ ] Register + OTP.
- [ ] Forgot/verify/reset password.

### Phase 4 — Account UI

- [ ] Profile view/edit.
- [ ] Avatar upload.
- [ ] Change password.
- [ ] Device list.
- [ ] Remote logout OTP/confirm.
- [ ] Current-device logout.

### Phase 5 — Hardening và bàn giao

- [ ] Unit/integration/E2E tests.
- [ ] Accessibility, keyboard, safe area và responsive review.
- [ ] So sánh từng screen với desktop.
- [ ] Kiểm tra không log secret.
- [ ] Ghi endpoint đã test, `VERIFY` còn lại và AuthContext interface.

## 11. Test matrix bắt buộc

### Auth/session

- [ ] Login học viên đúng → vào student navigation.
- [ ] Sai identifier/password → lỗi sát form, không lưu session.
- [ ] Captcha required/success/fail/reset.
- [ ] Thiết bị mới → OTP đúng/sai/hết hạn.
- [ ] Đủ giới hạn thiết bị → cancel/replace thành công/thất bại.
- [ ] GV/QTV → không lưu token/user, đúng thông báo desktop-only.
- [ ] Restart app khi có/không có token.
- [ ] Token hết hạn/401/revoked → đóng protected content.
- [ ] Role local bị sửa thành 2 → không bypass server.
- [ ] Role server đổi khỏi 2 → clear phiên ở bootstrap/request kế tiếp.
- [ ] Logout online/offline/API 500 đều clear local session.

### Register/password

- [ ] Register validation và duplicate account/email.
- [ ] OTP register đúng/sai/hết hạn/single-use/resend.
- [ ] Forgot email hợp lệ/không hợp lệ.
- [ ] Forgot OTP đúng/sai/hết hạn.
- [ ] Reset token đúng/sai/hết hạn.
- [ ] Password policy và confirm password.
- [ ] Change password đúng/sai; kiểm tra session sau đổi.

### Account/device

- [ ] Profile loading/success/error/retry.
- [ ] Update profile validation/API error.
- [ ] Avatar chọn/hủy/upload lỗi/thành công.
- [ ] Device list empty/error/success/current marker.
- [ ] Remote logout OTP đúng/sai/hết hạn.
- [ ] Revoke current/all devices và phản ứng của ứng dụng.

### UI/accessibility/security

- [ ] Màn 320–430px và tablet không overflow.
- [ ] Keyboard không che field/CTA.
- [ ] Safe area đúng iOS/Android.
- [ ] Touch target ≥44×44.
- [ ] Loading/disabled ngăn double-submit.
- [ ] Screen reader label và focus lỗi hợp lý.
- [ ] Không log token/password/OTP/reset token.
- [ ] Không có token GV/QTV trong storage sau response.

## 12. Definition of Done

Module Auth & Account của Âu chỉ được đánh dấu Done khi:

1. Tất cả luồng P0 đã chốt contract hoặc còn nhãn `VERIFY` kèm owner/blocker rõ ràng.
2. Học viên đăng ký, đăng nhập, bootstrap, dùng account và đăng xuất được trên thiết bị test.
3. OTP thiết bị mới và thay thiết bị hoạt động theo response backend thật.
4. GV/QTV bị chặn trước khi tạo mobile session.
5. Protected screen không xuất hiện trước khi bootstrap hoàn tất.
6. 401, revoked session và role thay đổi đều clear phiên nhất quán.
7. UI dùng đúng token, icon, spacing và nội dung của desktop EduCodeAI nhưng bố cục native.
8. Profile/avatar/password/device flows có loading, error, retry và test.
9. Không có secret trong log hoặc source.
10. Unit, integration và E2E matrix quan trọng đã pass; các lỗi còn lại được ghi rõ khi bàn giao.

## 13. Nội dung bàn giao

- Public interface cuối cùng của `AuthContext`.
- Sơ đồ route auth/student và điều kiện guard.
- Storage/session/refresh policy đã được backend chấp thuận.
- Danh sách endpoint và mẫu response đã test (đã loại secret).
- Danh sách `VERIFY`, blocker và người cần xác nhận.
- Ảnh đối chiếu từng mobile screen với desktop tương ứng.
- Kết quả test Android/iOS hoặc emulator/device đã sử dụng.
