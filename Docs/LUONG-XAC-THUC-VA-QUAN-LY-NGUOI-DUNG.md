# Luồng xác thực & quản lý người dùng — Tóm tắt

Tài liệu tóm tắt 6 chức năng: đăng ký, đăng nhập, quên mật khẩu, đăng ký giảng viên, quản lý phiên đăng nhập, quản lý người dùng (admin).

## 0. Các thành phần dùng chung

| Thành phần | File | Vai trò |
|---|---|---|
| `XacThucController` | [XacThucController.cs](educodeai-server/Controllers/XacThucController.cs) | Toàn bộ API auth, route `api/XacThuc/...` |
| `XacThucService` | [XacThucService.cs](educodeai-server/Services/Implementation/XacThucService.cs) | Nghiệp vụ chính (~1700 dòng) |
| `TokenService` | [TokenService.cs](educodeai-server/Services/Implementation/TokenService.cs) | Cấp JWT + refresh token |
| `OtpService` | [OtpService.cs](educodeai-server/Services/Implementation/OtpService.cs) | Sinh/verify OTP |
| `OtpRateLimiter` | [OtpRateLimiter.cs](educodeai-server/Services/Implementation/OtpRateLimiter.cs) | Chặn spam OTP |
| `SessionCheckMiddleware` | [SessionCheckMiddleware.cs](educodeai-server/Helpers/SessionCheckMiddleware.cs) | Chặn request của user bị khóa / phiên bị thu hồi |
| `SessionHub` | [SessionHub.cs](educodeai-server/Hubs/SessionHub.cs) | SignalR đẩy event logout realtime |
| `auth.service.ts` | [auth.service.ts](educodeai-client/src/services/auth.service.ts) | Client gọi API auth |

### Cơ chế token (quan trọng — mọi luồng đều dùng)

Hàm chốt là `XuLyDangNhapThanhCongAsync()` — mọi luồng đăng nhập thành công (login thường, OTP, Google/FB, đăng ký xong) đều đi qua đây:

1. Tìm/tạo bản ghi `PhienDangNhap` theo `MaThietBi` (fingerprint trình duyệt), đánh dấu `DangHoatDong = true`, `TrustedUntilUtc = +30 ngày`.
2. Sinh **refresh token** CSPRNG 256-bit → DB chỉ lưu **hash SHA-256** (`RefreshTokens`), bản gốc trả về qua **cookie HttpOnly** `ecai_rt` (Path `/api/XacThuc`, hạn 14 ngày).
3. Sinh **access token** JWT 15 phút, claims: `id`, `MaNguoiDung`, `Email`, `MaPhien`, `Role` (0=Admin, 1=GiangVien, 2=HocVien), `jti`, `iat`.
4. Trả về:
```json
{ "token": "<JWT>", "tokenExpiresAt": "...",
  "user": { "maNguoiDung": 12, "taiKhoan": "...", "hoTen": "...",
            "email": "...", "vaiTro": 2, "anhDaiDien": "..." } }
```

> Client **không lưu token vào localStorage** — access token giữ trong biến RAM ([authStorage.ts](educodeai-client/src/utils/authStorage.ts)). Reload trang → `bootstrapAuth()` gọi `/refresh-token` bằng cookie để lấy lại.

### Cơ chế OTP dùng chung

- Sinh 6 số CSPRNG, **chỉ lưu hash SHA-256** trong Redis/MemoryCache, TTL **5 phút**, **single-use**, sai quá **5 lần** → hủy mã.
- Mỗi mục đích 1 key riêng (`OtpPurpose`): `Register`, `ForgotPassword`, `LoginNewDevice`, `ReplaceDevice`, `RemoteLogout`, `InstructorEmail`, `BoSungHoSo`.
- Có thể gắn kèm `payloadJson` → verify đúng thì trả lại payload (dùng để "nhớ" thông tin đăng ký / thiết bị).
- Rate limit: gửi 5 lần/email/15 phút + 20 lần/IP; verify 10 lần/email + 50 lần/IP.

---

## 1. Đăng ký (học viên)

**2 bước — tài khoản chưa vào DB cho tới khi xác minh OTP.**

### Bước 1: `POST /api/XacThuc/dang-ky`

**Vào:** `{ hoTen, email, matKhau, captchaToken }`

**Xử lý** (`YeuCauDangKyAsync`):
1. Verify CAPTCHA với Google (dev có thể gửi `SKIP_CAPTCHA`).
2. Normalize email (`trim().ToLowerInvariant()`).
3. Rate limit OTP.
4. Check email đã tồn tại trong `NguoiDungs` chưa.
5. **Hash mật khẩu bằng BCrypt ngay** → nhét vào payload OTP (không bao giờ lưu plain trong cache).
6. Sinh OTP + gửi email.

**Ra:** `{ message: "Hệ thống đã gửi mã OTP..." }`

### Bước 2: `POST /api/XacThuc/xac-minh-dang-ky`

**Vào:** `{ taiKhoan (= email), otpCode, maThietBi, tenThietBi }`

**Xử lý** (`XacNhanDangKyVaLuuDbAsync`):
1. Rate limit verify → verify OTP → lấy payload `{ HoTen, Email, MatKhauHash }`.
2. **Re-check trùng email lần nữa** (chống bị chiếm giữa 2 bước), unique index DB là chốt chặn cuối.
3. Insert `NguoiDungs` với `VaiTro = 2`, `TrangThai = "Hoạt động"`.
4. Gọi thẳng `XuLyDangNhapThanhCongAsync` → **đăng ký xong tự đăng nhập luôn**.

**Ra:** `{ token, user{...} }`

### Đăng nhập mạng xã hội
`POST /api/XacThuc/google-login` / `facebook-login` — backend **tự verify** `id_token` với Google (check audience = ClientId) hoặc `debug_token` với Facebook Graph API. Email/tên do client gửi **bị bỏ qua hoàn toàn**. Email đã verify → link vào tài khoản cùng email nếu có, không thì tạo mới `VaiTro = 2`.

---

## 2. Đăng nhập

`POST /api/XacThuc/dang-nhap`

**Vào:** `{ taiKhoan, matKhau, captchaToken, maThietBi, tenThietBi }`

**Xử lý** (`DangNhapAsync`) — theo thứ tự:

1. **Đếm số lần sai** theo 2 chiều: IP (`>= 3`) và tài khoản (`>= 5`), TTL 30 phút. Vượt ngưỡng → bắt buộc CAPTCHA.
2. **Tìm user** theo `TaiKhoan` hoặc `Email` (case-insensitive).
3. **Verify BCrypt.** Nếu user không tồn tại vẫn chạy 1 lần `Verify` với hash giả → chống dò tài khoản qua thời gian phản hồi.
4. **Check trạng thái khóa**: nếu hết hạn khóa thì tự mở; còn hạn → 403 kèm thời gian còn lại.
5. **Check thiết bị** (đây là phần rẽ nhánh chính):

| Tình huống | Kết quả trả về |
|---|---|
| Thiết bị đã từng đăng nhập & còn "tin cậy" (`TrustedUntilUtc` chưa hết) | Vào thẳng → `{ token, user }` |
| Thiết bị mới, user **< 3** phiên đang hoạt động | Gửi OTP `LoginNewDevice` → `{ requiresOtp: true, email, message }` |
| Thiết bị mới, user **đã đủ 3** phiên | Gửi OTP `ReplaceDevice` (kèm `MaPhien` của thiết bị cũ nhất) → `{ requiresLogoutOldest: true, oldestDeviceName, email }` |
| Sai mật khẩu ≥ 3 lần | `{ requiresCaptcha: true, message }` |

**API xác nhận tiếp theo:**
- `POST /api/XacThuc/xac-nhan-otp` — verify OTP thiết bị mới → gia hạn tin cậy 30 ngày → đăng nhập.
- `POST /api/XacThuc/xac-nhan-thay-the-thiet-bi` — verify OTP → set thiết bị cũ nhất `DangHoatDong = false` → đăng nhập thiết bị mới.

Cả hai nhận `{ taiKhoan, otpCode, maThietBi, tenThietBi }`, trả `{ token, user }`.

> **Giới hạn 3 thiết bị** là quy tắc cứng của hệ thống.

---

## 3. Quên mật khẩu

**3 bước.**

### Bước 1: `POST /api/XacThuc/quen-mat-khau`
**Vào:** `{ email, captchaToken }`

Verify CAPTCHA → rate limit → tìm user. **Chỉ gửi OTP khi email thật sự tồn tại**, nhưng **response luôn giống nhau** để không lộ email nào có trong hệ thống.

**Ra:** `{ message: "Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi..." }`

### Bước 2: `POST /api/XacThuc/xac-minh-otp-quen-mat-khau`
**Vào:** `{ email, otpCode }` (OTP bắt buộc đúng 6 chữ số)

Verify OTP → sinh **reset token** ngẫu nhiên 32 byte, lưu **hash** vào distributed cache với TTL **5 phút** (key = hash, value = email).

**Ra:** `{ resetToken, expiresInSeconds: 300 }`

### Bước 3: `POST /api/XacThuc/dat-lai-mat-khau`
**Vào:** `{ email, NewPassword, ResetToken }`

1. Hash `ResetToken` → tra cache → email trong cache phải **khớp chính xác** email gửi lên.
2. Áp `PasswordPolicy`: ≥ 8 ký tự, không chứa phần local của email, không trùng mật khẩu cũ.
3. Hash BCrypt, lưu mật khẩu mới.
4. **Thu hồi TOÀN BỘ phiên + refresh token** của user (`LyDoThuHoi = "PASSWORD_RESET"`), xóa cache, đẩy SignalR `SessionRevoked` cho mọi thiết bị, xóa cookie.
5. **Không auto-login** — bắt đăng nhập lại.

**Ra:** `{ message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại..." }`

### Đổi mật khẩu (khi đã đăng nhập)
`POST /api/XacThuc/doi-mat-khau` `[Authorize]` — vào `{ MatKhauCu, MatKhauMoi }`. Khác quên mật khẩu ở chỗ: **giữ phiên hiện tại** (lấy `MaPhien` từ JWT), chỉ thu hồi các phiên khác.

---

## 4. Đăng ký giảng viên

Khác đăng ký học viên hoàn toàn: **không tạo tài khoản ngay**, chỉ tạo **hồ sơ chờ admin duyệt** (bảng `HoSoDangKyGiangViens`).

### Bước 1 — Xác minh email
- `POST /api/XacThuc/giang-vien/gui-otp-email` — vào `{ email, captchaToken }`. Check email chưa có trong `NguoiDungs` và chưa có hồ sơ đang xử lý → gửi OTP.
- `POST /api/XacThuc/giang-vien/xac-minh-otp-email` — vào `{ email, otpCode }`. Đúng → set cờ `VERIFIED_InstructorEmail_{email}` trong MemoryCache, sống **30 phút**.

### Bước 2 (tùy chọn) — Quét CCCD
`POST /api/XacThuc/quet-giay-to` (multipart, có rate limit riêng). Vào: `AnhMatTruoc`, `AnhMatSau`, `LoaiGiayTo` (CCCD/Passport). OCR trả về họ tên, ngày sinh, số giấy tờ, nơi cấp... + check số giấy tờ chưa dùng ở hồ sơ nào.

### Bước 3 — Nộp hồ sơ
`POST /api/XacThuc/dang-ky-giang-vien` (**multipart/form-data**)

**Vào:** `HoTen, Email, TaiKhoan, MatKhau, SoDienThoai, LinhVucGiangDay, TieuSu, LinkedInUrl, WebsiteUrl, LoaiGiayTo, SoGiayTo, NoiCap, NguyenQuan, PhuongThucThanhToan, TenNganHang, SoTaiKhoanNhanTien, TenChuTaiKhoan, MaSoThue, LoaiDoiTuongThue` + files `AnhDaiDien`, `AnhGiayToMatTruoc`, `AnhGiayToMatSau`.

**Xử lý** (`DangKyGiangVienAsync`):
1. Check cờ email đã verify (backend enforce, không tin frontend).
2. Validate mã số thuế (10 hoặc 13 chữ số), loại đối tượng thuế.
3. Check trùng: email/tài khoản trong `NguoiDungs`; email/tài khoản/số giấy tờ trong hồ sơ có `TrangThaiHoSo != "TuChoi"`.
4. Validate file: ≤ 5MB, đuôi jpg/png/webp, ContentType ảnh, **và kiểm magic bytes** (chống upload file giả đuôi .jpg).
5. **OCR ảnh CCCD ngay trong request** → so số giấy tờ OCR với số người dùng nhập, lệch → báo lỗi.
6. Mã hóa dữ liệu CCCD bằng `IDataProtector` → cột `DuLieuCccdMaHoa`. **Ảnh CCCD KHÔNG bao giờ ghi xuống đĩa**, chỉ avatar được lưu vào `wwwroot/uploads/...`.
7. Insert hồ sơ trong transaction, `MatKhau` hash BCrypt sẵn, `TrangThaiHoSo = "ChoDuyet"`, `MaNguoiDung = null`. Lỗi DB → rollback + xóa file đã lưu.

**Ra:** `{ success: true, message, maHoSo, trangThai: "ChoDuyet" }`

### Bước 4 — Admin xử lý
Route `api/QuanTriVien/quan-ly-ho-so-giang-vien` `[Authorize(Roles = "Admin")]`:

| Endpoint | Tác dụng |
|---|---|
| `GET ds-ho-so?trangThai=` | Danh sách hồ sơ |
| `GET chi-tiet/{maHoSo}` | Chi tiết (giải mã dữ liệu CCCD) |
| `GET dem-cho-duyet` | Đếm badge |
| `PUT duyet/{maHoSo}` | **Duyệt** |
| `PUT tu-choi/{maHoSo}` | Từ chối, body `{ lyDo }` |
| `PUT yeu-cau-bo-sung/{maHoSo}` | Yêu cầu bổ sung |

- **Duyệt**: `ExecuteUpdate` đổi `ChoDuyet → DangDuyet` (khóa optimistic, chống duyệt 2 lần) → tạo `NguoiDungs` với `VaiTro = 1`, dùng lại hash mật khẩu đã lưu trong hồ sơ → set `TrangThaiHoSo = "DaDuyet"`, **xóa trắng cột `MatKhau` trong hồ sơ** → gửi email báo.
- **Yêu cầu bổ sung**: sinh token ngẫu nhiên (DB lưu **hash**, email gửi bản gốc), hạn **24 giờ**, `TrangThaiHoSo = "CanBoSung"`.

### Bước 5 — Giảng viên tra cứu / bổ sung (public, không cần đăng nhập)
- `GET /api/XacThuc/trang-thai-ho-so?email=` → trạng thái + lý do.
- `GET /api/XacThuc/kiem-tra-quyen-bo-sung/{maHoSo}?token=` → verify token constant-time + rate limit.
- `PUT /api/XacThuc/bo-sung-ho-so/{maHoSo}` (multipart, có `Token`) → cập nhật field nào gửi lên, quét lại CCCD nếu gửi ảnh mới, đưa về `ChoDuyet`, **vô hiệu hóa token** (`DaNopBoSung = true`).

**Trạng thái hồ sơ:** `ChoDuyet` → `DangDuyet` → `DaDuyet` / `TuChoi` / `CanBoSung` (→ quay lại `ChoDuyet`).

---

## 5. Quản lý phiên đăng nhập

### 3 lớp bảo vệ

**Lớp 1 — `SessionCheckMiddleware`** (chạy trước mọi request đã xác thực):
- Đọc `id` + `MaPhien` từ JWT → check `TrangThai` user và `DangHoatDong` của phiên.
- Đọc `SessionStateCache` (Redis, TTL 5 phút) trước, cache miss mới xuống DB rồi ghi lại cache.
- User bị khóa → **401** `{ isBanned: true }`. Phiên bị thu hồi → **401**. Cache lỗi → **503** (fail-closed, không cho qua bừa).

**Lớp 2 — `SessionRealtimeNotifier` + `SessionHub` (SignalR)**: đẩy 3 event tới client, không cần polling.

| Event | Group | Client làm gì |
|---|---|---|
| `SessionRevoked` | `session:{maPhien}` | Hiện thông báo → xóa token → về `/dang-nhap` |
| `UserLocked` | `user:{userId}` | Như trên |
| `SessionListChanged` | `user:{userId}` | Trang quản lý thiết bị refetch danh sách |

**Lớp 3 — Refresh token rotation**: xem mục "Làm mới token" bên dưới.

### API

| Endpoint | Vào | Ra |
|---|---|---|
| `GET /api/XacThuc/danh-sach-thiet-bi?maThietBiHienTai=` | — | `[{ maPhien, tenThietBi, thoiGianHoatDongCuoi, maThietBi, isCurrentDevice }]` |
| `POST /api/XacThuc/dang-xuat` | `"maThietBi"` (JSON string) | Đóng phiên hiện tại + revoke refresh token (`LyDoThuHoi = "LOGOUT"`) + xóa cookie |
| `POST /api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa` | — | Gửi OTP `RemoteLogout` về email |
| `POST /api/XacThuc/xac-nhan-dang-xuat-tu-xa` | `{ OtpCode, DangXuatTatCa, DanhSachMaPhien[] }` | Thu hồi phiên đã chọn |
| `GET /api/XacThuc/session-state` | — | `{ isBanned, sessionActive, isValid }` — client gọi 1 lần khi SignalR reconnect |
| `POST /api/XacThuc/refresh-token` | `{ maThietBi }` + cookie | `{ token, user }` |

**Lưu ý bảo mật của đăng xuất:**
- Căn cứ là `MaPhien` **trong JWT**, không tin `maThietBi` client gửi (chống đăng xuất nhầm/cố ý phiên người khác).
- `DangXuatTatCa` **giữ lại phiên hiện tại**.
- Chọn từng phiên thì query luôn kèm `MaNguoiDung == userId` → chống IDOR.

### Làm mới token (`LamMoiTokenAsync`)

Chỉ đọc refresh token từ **cookie HttpOnly**, không nhận từ body. Controller còn check **Origin/Referer** phải nằm trong whitelist (chống CSRF), thiếu cả hai → từ chối.

Luồng:
1. Hash token → tra `RefreshTokens`. Không thấy → 401 (không có fallback nào cấp token mới).
2. **Phát hiện reuse**: token đã bị revoke hoặc đã có `ReplacedByTokenHash` → **thu hồi cả family**, đóng phiên, `LyDoThuHoi = "REUSE_DETECTED"`, log cảnh báo.
3. Hết hạn / phiên không còn hoạt động → revoke + 401.
4. **Rotation**: `ExecuteUpdate ... WHERE NgayThuHoi == null` để claim token cũ ở tầng DB (2 request đồng thời chỉ 1 cái thắng) → tạo token mới **cùng `FamilyId`** → set cookie mới → trả access token mới.

**Các giá trị `LyDoThuHoi`:** `ROTATED`, `LOGOUT`, `REMOTE_LOGOUT`, `PASSWORD_RESET`, `PASSWORD_CHANGE`, `USER_LOCKED`, `REUSE_DETECTED`, `EXPIRED`, `SESSION_INACTIVE`.

### Phía client
- `bootstrapAuth()` — gọi `/refresh-token` lúc khởi động app để khôi phục phiên.
- Interceptor axios — gặp 401 thì tự gọi refresh 1 lần rồi retry; `isBanned` thì logout thẳng.
- `sessionHub.ts` — lắng nghe 3 event, `withAutomaticReconnect()`, reconnect xong gọi `session-state` đồng bộ 1 lần.

---

## 6. Quản lý người dùng (Admin)

`[Route("api/nguoi-dung")]` + `[Authorize(Roles = "Admin")]` — [QuanLyNguoiDungController.cs](educodeai-server/Controllers/QuanTriVien/QuanLyNguoiDungController.cs), [QuanLyNguoiDungService.cs](educodeai-server/Services/Implementation/QuanLyNguoiDungService.cs)

### `GET /api/nguoi-dung` — Danh sách
**Vào (query):** `Page` (mặc định 1), `PageSize` (mặc định 10, tối đa 100), `Keyword` (tìm theo họ tên/email), `VaiTro` (1/2), `TrangThai`.

**Xử lý:** filter + phân trang **server-side**. Query **luôn kèm `VaiTro == 1 || VaiTro == 2`** → tài khoản Admin không bao giờ lộ ra API này. Nếu bản ghi đang `Bị khóa` mà `ThoiGianMoKhoa` đã qua → hiển thị `Hoạt động`.

**Ra:** `{ total, data: [{ maNguoiDung, hoTen, email, anhDaiDien, trangThai, vaiTro ("Admin"/"Giảng viên"/"Học viên"), ngayTao, thoiGianMoKhoa, lyDoKhoa }] }`

### `POST /api/nguoi-dung/them-nguoi-dung`
**Vào:** `{ hoTen, email, anhDaiDien, matKhau, vaiTro }`. Chỉ cho `vaiTro ∈ {1, 2}` → **không thể tạo Admin qua API**. Trùng email → `false`. `TaiKhoan = Email`, `TrangThai = "Hoạt động"`.

### `PUT /api/nguoi-dung/sua-nguoi-dung/{id}`
**Vào:** `{ hoTen, email, anhDaiDien, vaiTro, matKhauMoi? }`. Chặn 2 chiều: **không được sửa tài khoản đang là Admin**, và **không được gán `vaiTro = 0`**.

### `PUT /api/nguoi-dung/khoa-nguoi-dung/{id}?lyDo=&thoiHan=`
Endpoint **toggle**: đang `Hoạt động` → khóa; đang khóa → mở.

`thoiHan`: `15s`, `1d`, `3d`, `1w`, `2w`, `1m`, `vinh-vien`.

Khi khóa:
1. `TrangThai = "Bị khóa"` (hoặc `"Khóa vĩnh viễn"`), ghi `LyDoKhoa`, tính `ThoiGianMoKhoa`.
2. **Xóa toàn bộ `PhienDangNhap`**.
3. **Revoke toàn bộ refresh token** (`LyDoThuHoi = "USER_LOCKED"`) — nếu không, user bị khóa vẫn gọi `/refresh-token` lấy token mới được.
4. Sau khi commit: xóa cache user-status + cache từng phiên (cache TTL 5 phút, không xóa thì user bị khóa vẫn qua middleware tới hết TTL).
5. Đẩy SignalR `UserLocked` + `SessionListChanged` → mọi thiết bị văng ra ngay.

Mở khóa: đảo `TrangThai = "Hoạt động"`, xóa `LyDoKhoa` / `ThoiGianMoKhoa`. (Ngoài ra khi user đăng nhập, `KiemTraTrangThaiKhoaAsync` cũng tự mở khóa nếu đã hết hạn.)

### `DELETE /api/nguoi-dung/xoa-nguoi-dung/{id}`
Chặn xóa Admin. **Chỉ xóa được khi `TrangThai == "Khóa vĩnh viễn"`** — không thì trả `false`.

### Ghi log
Mọi thao tác thêm/sửa/khóa/xóa đều log `Admin {ActorId} ... user {TargetId} ... IP {Ip}`. `ActorId` lấy từ **JWT đã verify**, không tin body/query.

---

## Tổng hợp API

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/XacThuc/dang-ky` | — |
| POST | `/api/XacThuc/xac-minh-dang-ky` | — |
| POST | `/api/XacThuc/dang-nhap` | — |
| POST | `/api/XacThuc/xac-nhan-otp` | — |
| POST | `/api/XacThuc/xac-nhan-thay-the-thiet-bi` | — |
| POST | `/api/XacThuc/google-login`, `/facebook-login` | — |
| POST | `/api/XacThuc/refresh-token` | Cookie + Origin check |
| POST | `/api/XacThuc/quen-mat-khau` | — |
| POST | `/api/XacThuc/xac-minh-otp-quen-mat-khau` | — |
| POST | `/api/XacThuc/dat-lai-mat-khau` | Reset token |
| POST | `/api/XacThuc/doi-mat-khau` | JWT |
| POST | `/api/XacThuc/giang-vien/gui-otp-email`, `/xac-minh-otp-email` | — |
| POST | `/api/XacThuc/dang-ky-giang-vien` | — (multipart) |
| POST | `/api/XacThuc/quet-giay-to` | — (multipart, rate limit) |
| GET | `/api/XacThuc/trang-thai-ho-so` | — |
| GET/PUT | `/api/XacThuc/kiem-tra-quyen-bo-sung/{id}`, `/bo-sung-ho-so/{id}` | Token email |
| GET | `/api/XacThuc/danh-sach-thiet-bi`, `/session-state` | JWT |
| POST | `/api/XacThuc/dang-xuat`, `/yeu-cau-otp-dang-xuat-tu-xa`, `/xac-nhan-dang-xuat-tu-xa` | JWT |
| GET/POST/PUT/DELETE | `/api/nguoi-dung/...` | JWT + Role Admin |
| GET/PUT | `/api/QuanTriVien/quan-ly-ho-so-giang-vien/...` | JWT + Role Admin |
