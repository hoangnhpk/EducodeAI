# TỐI ƯU BẢO MẬT HỆ THỐNG XÁC THỰC EDUCODEAI

> Tài liệu này ghi lại toàn bộ phân tích hiện trạng module xác thực của dự án EduCodeAI, các vấn đề bảo mật đang tồn tại, đánh giá quy trình, và hướng dẫn sửa chi tiết từng bước để AI có thể đọc file này rồi tự fix.

---

## PHẦN 1: LOGIC XÁC THỰC HIỆN TẠI

### 1.1. Đăng ký học viên

**Flow hiện tại:**

1. Frontend gọi `POST /api/XacThuc/dang-ky` với body:

```json
{
  "hoTen": "...",
  "email": "...",
  "matKhau": "...",
  "captchaToken": "..."
}
```

2. Backend `YeuCauDangKyAsync`:
   - Kiểm tra email đã tồn tại trong bảng `NguoiDungs`.
   - Tạo OTP 6 số bằng `new Random().Next(100000, 999999)`.
   - Lưu OTP và toàn bộ dữ liệu đăng ký vào `IMemoryCache` trong 5 phút:

```csharp
_memoryCache.Set("OTP_Register_" + r.Email, (Otp: otp, Data: r), TimeSpan.FromMinutes(5));
```

   - Gửi OTP qua email.

3. Người dùng nhập OTP, frontend gọi `POST /api/XacThuc/xac-minh-dang-ky`.

4. Backend `XacNhanDangKyVaLuuDbAsync`:
   - Lấy cache theo key `"OTP_Register_" + r.TaiKhoan`.
   - So sánh OTP dạng plain text.
   - Nếu đúng thì tạo user mới với:
     - `TaiKhoan = email`
     - `Email = email`
     - `MatKhau = BCrypt hash`
     - `VaiTro = 2`
     - `TrangThai = "Hoạt động"`
   - Xóa OTP cache.
   - Tự động đăng nhập bằng `XuLyDangNhapThanhCongAsync`.

**Đánh giá nhanh:**

- OTP lưu plain text trong RAM.
- Không rate limit gửi OTP.
- Không giới hạn số lần nhập sai OTP.
- Dùng `Random` không an toàn cho OTP.
- Captcha ở đăng ký có field nhưng trong `YeuCauDangKyAsync` chưa verify captcha.
- Dữ liệu đăng ký nằm trong `MemoryCache`, nếu server restart là mất.
- Email chưa normalize thống nhất `trim + lowercase` ở mọi chỗ.

---

### 1.2. Đăng nhập bằng tài khoản/mật khẩu

**Flow hiện tại:**

1. Frontend gọi `POST /api/XacThuc/dang-nhap` với body:

```json
{
  "taiKhoan": "...",
  "matKhau": "...",
  "maThietBi": "...",
  "tenThietBi": "...",
  "captchaToken": "..."
}
```

2. Frontend tạo `maThietBi` bằng canvas fingerprint:

```ts
maThietBi: "FP-" + hashString(platform + screen + hardware + canvas)
```

3. Backend `DangNhapAsync`:
   - Đếm số lần đăng nhập sai theo IP bằng `IMemoryCache` với key `FailedLogin_IP_{ip}`.
   - Nếu sai >= 3 lần thì yêu cầu captcha.
   - Tìm user theo `TaiKhoan` hoặc `Email`.
   - Verify mật khẩu bằng BCrypt.
   - Kiểm tra trạng thái tài khoản có bị khóa không.
   - Lấy danh sách phiên đang hoạt động trong `PhienDangNhap`.
   - Nếu thiết bị hiện tại đã có session active thì đăng nhập luôn.
   - Nếu thiết bị mới và chưa đủ 3 thiết bị: gửi OTP email xác minh thiết bị mới.
   - Nếu thiết bị mới và đã đủ 3 thiết bị: gửi OTP để thay thế thiết bị cũ nhất.

4. Nếu thiết bị mới, frontend gọi `POST /api/XacThuc/xac-nhan-otp`.

5. Nếu thay thế thiết bị, frontend gọi `POST /api/XacThuc/xac-nhan-thay-the-thiet-bi`.

**Đánh giá nhanh:**

- Ý tưởng xác minh thiết bị mới là tốt.
- Tuy nhiên OTP vẫn dùng `Random` và lưu plain text.
- Thiết bị dựa vào canvas fingerprint có thể bị spoof và có thể không ổn định.
- Đếm login fail chỉ theo IP dễ gây vấn đề với NAT và dễ bị bypass khi đổi IP.
- Captcha chỉ bật sau 3 lần sai, nhưng cần thêm rate limit theo IP + tài khoản.

---

### 1.3. Khi đăng nhập thành công

Method chính: `XuLyDangNhapThanhCongAsync`.

Nó làm:

1. Tìm session theo `MaThietBi`.
2. Nếu chưa có thì tạo mới `PhienDangNhapModel`:

```csharp
MaNguoiDung
MaThietBi
TenThietBi
ThoiGianDangNhap
ThoiGianHoatDongCuoi
DangHoatDong = true
```

3. Nếu đã có thì bật lại:

```csharp
phien.DangHoatDong = true;
phien.ThoiGianHoatDongCuoi = DateTime.UtcNow;
```

4. Tạo refresh token bằng:

```csharp
Guid.NewGuid().ToString()
```

5. Lưu refresh token vào `IMemoryCache` 7 ngày:

```csharp
_memoryCache.Set("RefreshToken_" + rt, (MaNguoiDung: u.MaNguoiDung, MaThietBi: devId), TimeSpan.FromDays(7));
```

6. Tạo JWT access token có hạn 1440 phút, tức 24 giờ:

```csharp
expires: DateTime.UtcNow.AddMinutes(1440)
```

7. JWT claim có:
   - `id`
   - `MaNguoiDung`
   - `NameIdentifier`
   - `Email`
   - `MaPhien`
   - `Role`

8. Trả về frontend:

```json
{
  "token": "...",
  "refreshToken": "...",
  "user": {
    "maNguoiDung": 1,
    "id": 1,
    "taiKhoan": "...",
    "hoTen": "...",
    "email": "...",
    "vaiTro": 2,
    "anhDaiDien": "..."
  }
}
```

9. Frontend lưu token và thông tin user vào `localStorage`.

**Đánh giá nhanh:**

- Access token sống 24 giờ là quá dài.
- Refresh token lưu `MemoryCache` không ổn cho production vì server restart là mất.
- Refresh token không được hash trong DB.
- Refresh token cũ không bị revoke khi refresh token mới được cấp.
- Lưu token trong `localStorage` dễ bị XSS đánh cắp.

---

### 1.4. Refresh token

**Flow hiện tại:**

1. Frontend interceptor gặp 401 sẽ gọi:

```ts
POST /api/XacThuc/refresh-token?refreshToken=...&maThietBi=...
```

2. Backend `LamMoiTokenAsync`:
   - Tìm refresh token trong `IMemoryCache`.
   - Tìm user.
   - Kiểm tra user có bị khóa không.
   - Tìm session theo `maThietBi`.
   - Nếu session còn active thì gọi lại `XuLyDangNhapThanhCongAsync`.

**Vấn đề:**

- Refresh token gửi qua query string, dễ bị log ở browser/proxy/server.
- Refresh token lưu trong RAM, mất khi restart.
- Không có bảng quản lý refresh token.
- Không có rotation chuẩn.
- Token cũ không bị xóa ngay sau khi cấp token mới.

---

### 1.5. Quên mật khẩu

**Flow hiện tại:**

1. Frontend gọi `POST /api/XacThuc/quen-mat-khau` với body:

```json
{
  "email": "..."
}
```

2. Backend `YeuCauQuenMatKhauAsync`:
   - Tìm user theo email.
   - Nếu không có thì báo lỗi rõ: `Email không tồn tại trên hệ thống.`
   - Tạo OTP bằng `Random`.
   - Lưu OTP plain text vào `MemoryCache` 5 phút với key `OTP_Forgot_{email}`.
   - Gửi email.

3. Frontend gọi `POST /api/XacThuc/dat-lai-mat-khau` với body:

```json
{
  "email": "...",
  "NewPassword": "...",
  "OtpCode": "...",
  "maThietBi": "...",
  "tenThietBi": "..."
}
```

4. Backend `DatLaiMatKhauAsync`:
   - Verify OTP cache.
   - Cập nhật mật khẩu mới bằng BCrypt.
   - Xóa OTP cache.
   - Tự động đăng nhập user.
   - Nếu user đã có 3 thiết bị active và thiết bị hiện tại là thiết bị mới thì lại gửi OTP thay thế thiết bị.

**Đánh giá nhanh:**

- Có OTP reset password là đúng hướng.
- Nhưng hiện tại tiết lộ email có tồn tại hay không.
- Không rate limit gửi OTP.
- Không giới hạn số lần nhập sai OTP.
- OTP lưu plain text.
- Sau reset password không revoke toàn bộ session/refresh token cũ.
- Không kiểm tra độ mạnh mật khẩu mới.
- Reset password xong tự động login ngay; an toàn hơn là revoke session cũ và bắt login lại.

---

### 1.6. Đổi mật khẩu khi đang đăng nhập

**Flow hiện tại:**

1. Frontend gọi `POST /api/XacThuc/doi-mat-khau` với body:

```json
{
  "MatKhauCu": "...",
  "MatKhauMoi": "...",
  "OtpCode": "..."
}
```

2. Backend `DoiMatKhauAsync`:
   - Lấy user từ JWT.
   - Verify mật khẩu cũ.
   - Hash mật khẩu mới.
   - Lưu DB.

**Đánh giá nhanh:**

- DTO có `OtpCode`, nhưng service không dùng.
- Không revoke các phiên khác sau khi đổi mật khẩu.
- Không kiểm tra password policy.
- Không kiểm tra mật khẩu mới có trùng mật khẩu cũ không.

---

### 1.7. Đăng xuất thiết bị hiện tại hoặc thiết bị cụ thể

**Flow hiện tại:**

1. Frontend gọi:

```ts
POST /api/XacThuc/dang-xuat
```

Body là string `maThietBi`.

2. Backend `DangXuatAsync` làm:

```csharp
var phien = await _context.PhienDangNhaps.FirstOrDefaultAsync(p => p.MaNguoiDung == userId && p.MaThietBi == maThietBi);
phien.DangHoatDong = false;
```

3. Frontend xóa localStorage.

**Vấn đề:**

- Không xóa refresh token đang lưu trong cache.
- Middleware cache session 60 giây nên thiết bị vừa logout có thể vẫn gọi API được trong tối đa 60 giây.
- API nhận `maThietBi` từ body, trong khi logout current nên dựa vào `MaPhien` từ JWT.
- Nếu logout thiết bị khác nên dùng `MaPhien` và yêu cầu OTP hoặc re-auth.

---

### 1.8. Đăng xuất từ xa

**Flow hiện tại:**

1. User đang đăng nhập gọi:

```ts
POST /api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa
```

2. Backend tạo OTP và gửi email với key:

```csharp
OTP_LogoutRemote_{userId}
```

3. User nhập OTP, gọi:

```ts
POST /api/XacThuc/xac-nhan-dang-xuat-tu-xa
```

Body:

```json
{
  "DangXuatTatCa": true,
  "DanhSachMaPhien": [1, 2],
  "OtpCode": "...",
  "CaptchaToken": "..."
}
```

4. Backend:
   - Verify OTP.
   - Nếu `DangXuatTatCa = true`, set tất cả session active của user thành false.
   - Nếu có danh sách mã phiên, set các phiên đó thành false.
   - Xóa OTP cache.

**Đánh giá nhanh:**

- Ý tưởng remote logout + OTP là đúng hướng.
- Nhưng `DangXuatTatCa = true` hiện tại logout cả thiết bị hiện tại.
- Không xóa cache `session_{maPhien}` nên session có thể còn hiệu lực đến 60 giây.
- Không revoke refresh token tương ứng.
- Không giới hạn số lần nhập sai OTP.
- `CaptchaToken` trong DTO nhưng không verify.

---

### 1.9. Social login Google/Facebook

**Flow hiện tại:**

1. Frontend gọi `POST /api/XacThuc/google-login` hoặc `POST /api/XacThuc/facebook-login`.
2. Backend nhận email/name/picture từ client.
3. Tìm user theo email. Nếu chưa có thì tạo mới.
4. Tự động đăng nhập.

**Lỗi nghiêm trọng:**

Backend đang tin dữ liệu frontend gửi lên, không verify token thật với Google/Facebook. Ai cũng có thể gửi email bất kỳ để đăng nhập hoặc tạo tài khoản.

---

## PHẦN 2: VẤN ĐỀ BẢO MẬT

### Mức nghiêm trọng cao

| # | Vấn đề | Lý do |
|---|---|---|
| 1 | Google/Facebook login tin vào dữ liệu frontend | Backend không verify token thật, có thể giả mạo email |
| 2 | Refresh token lưu `MemoryCache` và gửi qua query string | Query string dễ bị log, cache mất khi server restart |
| 3 | Refresh token không hash trong DB | Không audit/revoke/rotate chuẩn được |
| 4 | Access token sống 24 giờ | Token bị lộ sẽ dùng được quá lâu |
| 5 | OTP dùng `Random` và lưu plain text | `Random` không phù hợp cho mã bảo mật |
| 6 | Không rate limit OTP/register/forgot/remote logout | Dễ spam email và brute force OTP |
| 7 | Reset/đổi mật khẩu không revoke session cũ | Kẻ tấn công có thể giữ phiên cũ |
| 8 | `DoiMatKhauRequest.OtpCode` có nhưng không kiểm tra | UI có thể nghĩ đã xác minh OTP nhưng backend bỏ qua |

### Mức trung bình

| # | Vấn đề |
|---|---|
| 9 | Quên mật khẩu tiết lộ email tồn tại |
| 10 | Middleware cache session 60 giây, logout không cắt ngay |
| 11 | Captcha đăng ký/remote logout có field nhưng chưa verify |
| 12 | Thiết bị dựa vào canvas fingerprint có thể spoof |
| 13 | Refresh token cũ không bị xóa khi refresh |
| 14 | Login fail chỉ đếm theo IP |
| 15 | DTO reset/forgot thiếu validation chặt |
| 16 | OTP không có attempt counter |

### Mức thấp nhưng nên sửa

| # | Vấn đề |
|---|---|
| 17 | Nhiều text tiếng Việt bị mojibake trong source |
| 18 | `XacThucRepository` rỗng, logic dồn hết vào service |
| 19 | Có function không dùng: `KiemTraGioiHanThietBi`, OTP cookie logic |
| 20 | `DiaChiIP` trong `PhienDangNhapModel` không được set khi login |
| 21 | `ThoiGianHoatDongCuoi` chỉ cập nhật lúc login/refresh |
| 22 | Public tra cứu hồ sơ giảng viên theo email có thể lộ trạng thái |
| 23 | Ảnh KYC giảng viên lưu trong `wwwroot/uploads`, có nguy cơ public |

---
## PHẦN 3: HƯỚNG DẪN GIẢI QUYẾT TỪNG VẤN ĐỀ

### BƯỚC 0: Chuẩn bị trước khi sửa

Mục tiêu: tạo nền tảng chung để các bước sau dùng lại, tránh copy/paste logic OTP, token và audit nhiều nơi.

#### 0.1. Tạo bảng OTP riêng

Tạo file `Models/AuthOtpModel.cs`:

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("AuthOtps")]
    public class AuthOtpModel
    {
        [Key]
        public long Id { get; set; }

        [Required, MaxLength(100)]
        public string Purpose { get; set; } = null!;
        // Register, ForgotPassword, NewDevice, ReplaceDevice, RemoteLogout, ChangePassword, InstructorEmail

        [Required, MaxLength(150)]
        public string Identifier { get; set; } = null!;
        // email hoặc userId

        [Required, MaxLength(255)]
        public string OtpHash { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }
        public int AttemptCount { get; set; } = 0;
        public int MaxAttempts { get; set; } = 5;
        public bool IsConsumed { get; set; } = false;
        public DateTime? ConsumedAt { get; set; }

        [MaxLength(45)]
        public string? CreatedIp { get; set; }

        [MaxLength(500)]
        public string? CreatedUserAgent { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

Thêm vào `Data/EduCodeAIDbContext.cs`:

```csharp
public DbSet<AuthOtpModel> AuthOtps { get; set; }
```

#### 0.2. Tạo service OTP dùng chung

Tạo `Services/Interface/IOtpService.cs`:

```csharp
namespace educodeai_server.Services.Interface
{
    public interface IOtpService
    {
        Task<string> CreateOtpAsync(string purpose, string identifier, string? ip, string? userAgent);
        Task<bool> VerifyOtpAsync(string purpose, string identifier, string otpCode);
        Task<bool> HasOtpRateLimitAsync(string purpose, string identifier, int maxPer15Min = 3);
    }
}
```

Tạo `Services/Implementation/OtpService.cs`:

```csharp
using System.Security.Cryptography;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class OtpService : IOtpService
    {
        private readonly EduCodeAIDbContext _context;

        public OtpService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<string> CreateOtpAsync(string purpose, string identifier, string? ip, string? userAgent)
        {
            string otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
            string otpHash = BCrypt.Net.BCrypt.HashPassword(otp);

            var record = new AuthOtpModel
            {
                Purpose = purpose,
                Identifier = identifier,
                OtpHash = otpHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                MaxAttempts = 5,
                CreatedIp = ip,
                CreatedUserAgent = userAgent
            };

            _context.AuthOtps.Add(record);
            await _context.SaveChangesAsync();
            return otp;
        }

        public async Task<bool> VerifyOtpAsync(string purpose, string identifier, string otpCode)
        {
            if (string.IsNullOrWhiteSpace(otpCode)) return false;

            var otp = await _context.AuthOtps
                .Where(o => o.Purpose == purpose
                         && o.Identifier == identifier
                         && !o.IsConsumed
                         && o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null) return false;
            if (otp.AttemptCount >= otp.MaxAttempts) return false;

            otp.AttemptCount++;

            bool isValid = BCrypt.Net.BCrypt.Verify(otpCode, otp.OtpHash);
            if (isValid)
            {
                otp.IsConsumed = true;
                otp.ConsumedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return isValid;
        }

        public async Task<bool> HasOtpRateLimitAsync(string purpose, string identifier, int maxPer15Min = 3)
        {
            var cutoff = DateTime.UtcNow.AddMinutes(-15);
            int count = await _context.AuthOtps
                .Where(o => o.Purpose == purpose
                         && o.Identifier == identifier
                         && o.CreatedAt > cutoff)
                .CountAsync();

            return count >= maxPer15Min;
        }
    }
}
```

Đăng ký DI trong `Program.cs`:

```csharp
builder.Services.AddScoped<IOtpService, OtpService>();
```

Chạy migration:

```bash
dotnet ef migrations add AddAuthOtpTable
dotnet ef database update
```

---

### BƯỚC 1: Sửa toàn bộ OTP

#### Vấn đề cần xử lý

Hiện OTP đang dùng:

```csharp
new Random().Next(100000, 999999)
```

và lưu plain text vào `MemoryCache`.

#### Hướng sửa

Thay toàn bộ OTP bằng `IOtpService`.

Mapping `Purpose`:

| Flow | Purpose |
|---|---|
| Đăng ký học viên | `Register` |
| Quên mật khẩu | `ForgotPassword` |
| Thiết bị mới | `NewDevice` |
| Thay thế thiết bị | `ReplaceDevice` |
| Đăng xuất từ xa | `RemoteLogout` |
| Đổi mật khẩu | `ChangePassword` |
| Đăng ký giảng viên xác minh email | `InstructorEmail` |

#### Ví dụ sửa đăng ký

Code cũ:

```csharp
string otp = new Random().Next(100000, 999999).ToString();
_memoryCache.Set("OTP_Register_" + r.Email, (Otp: otp, Data: r), TimeSpan.FromMinutes(5));
```

Code mới:

```csharp
string email = r.Email.Trim().ToLowerInvariant();
string? ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
string? userAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"];

if (await _otpService.HasOtpRateLimitAsync("Register", email))
    throw new Exception("Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau 15 phút.");

string otp = await _otpService.CreateOtpAsync("Register", email, ip, userAgent);
_memoryCache.Set("RegisterData_" + email, r, TimeSpan.FromMinutes(5));
```

Khi xác nhận OTP:

```csharp
string email = r.TaiKhoan.Trim().ToLowerInvariant();
if (!await _otpService.VerifyOtpAsync("Register", email, r.OtpCode))
    throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");

if (!_memoryCache.TryGetValue("RegisterData_" + email, out DangKyRequest data))
    throw new Exception("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.");
```

---

### BƯỚC 2: Verify captcha thật ở đăng ký và các endpoint nhạy cảm

#### Vấn đề

`DangKyRequest` có `CaptchaToken`, nhưng `YeuCauDangKyAsync` chưa verify captcha.

#### Sửa trong `YeuCauDangKyAsync`

Thêm đầu method:

```csharp
if (string.IsNullOrWhiteSpace(r.CaptchaToken) || r.CaptchaToken == "SKIP_CAPTCHA")
    throw new Exception("Vui lòng xác thực CAPTCHA.");

bool isCaptchaValid = await _captchaService.XacNhanCaptchaAsync(r.CaptchaToken);
if (!isCaptchaValid)
    throw new Exception("Mã CAPTCHA không hợp lệ hoặc đã hết hạn.");
```

Nên thêm captcha cho:

- `dang-ky`
- `quen-mat-khau`
- `yeu-cau-otp-dang-xuat-tu-xa`
- Các endpoint gửi OTP nhiều lần.

---

### BƯỚC 3: Sửa quên mật khẩu không được lộ email tồn tại

#### Vấn đề

Hiện tại code báo rõ:

```txt
Email không tồn tại trên hệ thống.
```

Điều này tạo lỗi user enumeration.

#### Sửa `YeuCauQuenMatKhauAsync`

Luôn trả cùng một message:

```csharp
public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest r, string ipAddress)
{
    string email = (r.Email ?? "").Trim().ToLowerInvariant();
    const string genericMessage = "Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.";

    if (await _otpService.HasOtpRateLimitAsync("ForgotPassword", email))
        return new { message = genericMessage };

    var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == email);
    if (user == null)
        return new { message = genericMessage };

    string? userAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"];
    string otp = await _otpService.CreateOtpAsync("ForgotPassword", email, ipAddress, userAgent);

    string body = TaoGiaoDienEmail(
        "Đặt lại mật khẩu",
        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhập mã xác thực bên dưới để thiết lập mật khẩu mới.",
        otp);

    await EmailHelper.SendEmailAsync(email, "Mã xác nhận đặt lại mật khẩu - EduCodeAI", body);
    return new { message = genericMessage };
}
```

---

### BƯỚC 4: Reset password phải revoke session cũ

#### Vấn đề

Sau khi đặt lại mật khẩu, các session cũ vẫn sống.

#### Sửa trong `DatLaiMatKhauAsync`

Sau khi verify OTP và trước/sau khi đổi mật khẩu:

```csharp
string email = r.Email.Trim().ToLowerInvariant();
if (!await _otpService.VerifyOtpAsync("ForgotPassword", email, r.OtpCode))
    throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");

var user = await _context.NguoiDungs
    .Include(u => u.DanhSachPhienDangNhap)
    .FirstOrDefaultAsync(u => u.Email == email);

if (user == null)
    throw new Exception("Không thể đặt lại mật khẩu.");

PasswordValidator.Validate(r.MatKhauMoi, user.Email);
user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);

foreach (var session in user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong))
{
    session.DangHoatDong = false;
    session.RefreshTokenRevokedAt = DateTime.UtcNow;
    _memoryCache.Remove($"session_{session.MaPhien}");
}

await _context.SaveChangesAsync();
```

Khuyến nghị: không tự động đăng nhập sau reset password. Hãy trả:

```json
{
  "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
}
```

---

### BƯỚC 5: Đổi mật khẩu phải có policy và revoke session khác

#### Tạo `Helpers/PasswordValidator.cs`

```csharp
namespace educodeai_server.Helpers
{
    public static class PasswordValidator
    {
        public static void Validate(string password, string? email = null)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new Exception("Mật khẩu không được để trống.");

            if (password.Length < 8)
                throw new Exception("Mật khẩu phải có ít nhất 8 ký tự.");

            if (!password.Any(char.IsUpper))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 chữ hoa.");

            if (!password.Any(char.IsLower))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 chữ thường.");

            if (!password.Any(char.IsDigit))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 chữ số.");

            if (!string.IsNullOrEmpty(email))
            {
                var local = email.Split('@')[0].ToLowerInvariant();
                if (password.ToLowerInvariant().Contains(local))
                    throw new Exception("Mật khẩu không được chứa tên email.");
            }
        }
    }
}
```

#### Sửa `DoiMatKhauAsync`

```csharp
public async Task<bool> DoiMatKhauAsync(int userId, DoiMatKhauRequest r)
{
    var user = await _context.NguoiDungs
        .Include(u => u.DanhSachPhienDangNhap)
        .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

    if (user == null)
        throw new Exception("Người dùng không tồn tại.");

    if (!BCrypt.Net.BCrypt.Verify(r.MatKhauCu, user.MatKhau))
        throw new Exception("Mật khẩu hiện tại không chính xác.");

    PasswordValidator.Validate(r.MatKhauMoi, user.Email);

    if (BCrypt.Net.BCrypt.Verify(r.MatKhauMoi, user.MatKhau))
        throw new Exception("Mật khẩu mới không được trùng mật khẩu cũ.");

    user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);

    var maPhienClaim = _httpContextAccessor.HttpContext?.User.FindFirst("MaPhien")?.Value;
    int.TryParse(maPhienClaim, out int currentMaPhien);

    foreach (var session in user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong && p.MaPhien != currentMaPhien))
    {
        session.DangHoatDong = false;
        session.RefreshTokenRevokedAt = DateTime.UtcNow;
        _memoryCache.Remove($"session_{session.MaPhien}");
    }

    await _context.SaveChangesAsync();
    return true;
}
```

Nếu muốn dùng OTP đổi mật khẩu thì thêm API gửi OTP `ChangePassword` và verify:

```csharp
if (!await _otpService.VerifyOtpAsync("ChangePassword", userId.ToString(), r.OtpCode))
    throw new Exception("Mã OTP xác nhận không chính xác hoặc đã hết hạn.");
```

Nếu chưa làm OTP đổi mật khẩu thì nên bỏ field `OtpCode` khỏi DTO/UI để tránh hiểu nhầm.

---
### BƯỚC 6: Refresh token phải lưu DB, hash và rotate

#### Vấn đề

Hiện refresh token:

- Tạo bằng `Guid.NewGuid().ToString()`.
- Lưu trong `IMemoryCache`.
- Gửi qua query string.
- Không hash.
- Không rotate chuẩn.

#### Sửa model `PhienDangNhapModel.cs`

Thêm các field:

```csharp
[MaxLength(255)]
public string? RefreshTokenHash { get; set; }

public DateTime? RefreshTokenExpiresAt { get; set; }

public DateTime? RefreshTokenRevokedAt { get; set; }

[MaxLength(255)]
public string? ReplacedByTokenHash { get; set; }

[MaxLength(500)]
public string? UserAgent { get; set; }
```

Chạy migration:

```bash
dotnet ef migrations add AddRefreshTokenToPhienDangNhap
dotnet ef database update
```

#### Tạo refresh token mới

Trong `XuLyDangNhapThanhCongAsync`, thay đoạn tạo refresh token bằng:

```csharp
byte[] tokenBytes = new byte[32];
using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
{
    rng.GetBytes(tokenBytes);
}
string refreshToken = Convert.ToBase64String(tokenBytes);

phien.RefreshTokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken);
phien.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);
phien.RefreshTokenRevokedAt = null;
phien.ReplacedByTokenHash = null;
phien.UserAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"];
phien.DiaChiIP = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
```

Trả `refreshToken` về client, không lưu MemoryCache nữa.

#### Không gửi refresh token qua query string

Tạo DTO `DTOs/XacThuc/RefreshTokenRequest.cs`:

```csharp
namespace educodeai_server.DTOs.XacThuc
{
    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
        public string MaThietBi { get; set; } = string.Empty;
    }
}
```

Sửa controller:

```csharp
[HttpPost("refresh-token")]
public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
{
    var result = await _xacThucService.LamMoiTokenAsync(request.RefreshToken, request.MaThietBi);
    return Ok(result);
}
```

Sửa frontend `src/configs/axios.ts`:

```ts
const response: any = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/XacThuc/refresh-token`,
  { refreshToken, maThietBi }
);
```

#### Rotate refresh token trong `LamMoiTokenAsync`

Pseudo-code:

```csharp
var sessions = await _context.PhienDangNhaps
    .Where(p => p.MaThietBi == maThietBi && p.DangHoatDong)
    .ToListAsync();

PhienDangNhapModel? matched = null;
foreach (var session in sessions)
{
    if (session.RefreshTokenRevokedAt == null
        && session.RefreshTokenExpiresAt > DateTime.UtcNow
        && !string.IsNullOrEmpty(session.RefreshTokenHash)
        && BCrypt.Net.BCrypt.Verify(refreshToken, session.RefreshTokenHash))
    {
        matched = session;
        break;
    }
}

if (matched == null)
    throw new Exception("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

// Tạo refresh token mới
byte[] bytes = new byte[32];
using var rng = RandomNumberGenerator.Create();
rng.GetBytes(bytes);
string newRefreshToken = Convert.ToBase64String(bytes);

matched.RefreshTokenRevokedAt = DateTime.UtcNow;
matched.ReplacedByTokenHash = BCrypt.Net.BCrypt.HashPassword(newRefreshToken);
matched.RefreshTokenHash = matched.ReplacedByTokenHash;
matched.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);
matched.ThoiGianHoatDongCuoi = DateTime.UtcNow;

await _context.SaveChangesAsync();

return new
{
    token = TaoJwtToken(user, matched.MaPhien),
    refreshToken = newRefreshToken,
    user = ...
};
```

---

### BƯỚC 7: Giảm access token từ 24 giờ xuống 15 phút

Trong `TaoJwtToken`, đổi:

```csharp
expires: DateTime.UtcNow.AddMinutes(1440)
```

thành:

```csharp
expires: DateTime.UtcNow.AddMinutes(15)
```

---

### BƯỚC 8: Sửa Google/Facebook login

#### Vấn đề

Backend đang tin email do frontend gửi lên. Đây là lỗi nghiêm trọng.

#### Google

Frontend phải gửi `id_token` thật từ Google.

DTO nên có:

```csharp
public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty;
}
```

Backend verify với Google:

```csharp
var response = await _httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={request.IdToken}");
if (!response.IsSuccessStatusCode)
    throw new Exception("Token Google không hợp lệ.");

var tokenInfo = await response.Content.ReadFromJsonAsync<GoogleTokenInfo>();
if (tokenInfo == null || string.IsNullOrEmpty(tokenInfo.email))
    throw new Exception("Không xác thực được email Google.");

string email = tokenInfo.email.Trim().ToLowerInvariant();
```

Chỉ dùng email lấy từ Google token response, không tin email client gửi.

#### Facebook

Frontend phải gửi `access_token` thật từ Facebook.

Backend verify với Graph API:

```csharp
var fbResponse = await _httpClient.GetAsync(
    $"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={request.AccessToken}");

if (!fbResponse.IsSuccessStatusCode)
    throw new Exception("Token Facebook không hợp lệ.");
```

---

### BƯỚC 9: Sửa logout và remote logout

#### Logout hiện tại

Không nên để client gửi `maThietBi` cho logout current. Backend nên lấy `MaPhien` từ JWT.

Sửa `DangXuatAsync`:

```csharp
public async Task<bool> DangXuatAsync(int userId, string maThietBi)
{
    var phien = await _context.PhienDangNhaps
        .FirstOrDefaultAsync(p => p.MaNguoiDung == userId && p.MaThietBi == maThietBi);

    if (phien != null)
    {
        phien.DangHoatDong = false;
        phien.RefreshTokenRevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        _memoryCache.Remove($"session_{phien.MaPhien}");
    }

    return true;
}
```

#### Remote logout

Sau khi xác nhận OTP:

```csharp
foreach (var session in sessionsToLogout)
{
    session.DangHoatDong = false;
    session.RefreshTokenRevokedAt = DateTime.UtcNow;
    _memoryCache.Remove($"session_{session.MaPhien}");
}
await _context.SaveChangesAsync();
```

Nếu user chọn đăng xuất tất cả thiết bị khác, hãy giữ lại `MaPhien` hiện tại:

```csharp
.Where(p => p.MaNguoiDung == userId && p.DangHoatDong && p.MaPhien != currentMaPhien)
```

---

### BƯỚC 10: Thêm rate limit đăng nhập

Hiện đang đếm theo IP. Nên thêm theo IP + tài khoản:

```csharp
string normalizedLogin = request.TaiKhoan.Trim().ToLowerInvariant();
string cleanIp = ipAddress.Replace(":", "_").Replace(".", "_");
string key = $"LoginFail_{cleanIp}_{normalizedLogin}";

int failCount = _memoryCache.Get<int?>(key) ?? 0;
if (failCount >= 10)
    throw new Exception("Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 30 phút.");
```

Khi sai mật khẩu:

```csharp
_memoryCache.Set(key, failCount + 1, TimeSpan.FromMinutes(30));
```

Khi login thành công:

```csharp
_memoryCache.Remove(key);
```

---

### BƯỚC 11: Cập nhật `ThoiGianHoatDongCuoi`

Trong middleware hoặc service, khi request hợp lệ, cập nhật thời gian hoạt động cuối.

Đơn giản nhất: trong `SessionCheckMiddleware`, sau khi session active:

```csharp
if (isActive)
{
    var session = await dbContext.PhienDangNhaps.FirstOrDefaultAsync(p => p.MaPhien == maPhien);
    if (session != null)
    {
        session.ThoiGianHoatDongCuoi = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();
    }
}
```

Để tối ưu, chỉ cập nhật nếu lần cập nhật cuối cách hiện tại > 1 phút.

---

### BƯỚC 12: Thêm audit log

Tạo model `AuthAuditLog`:

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("AuthAuditLogs")]
    public class AuthAuditLog
    {
        [Key]
        public long Id { get; set; }
        public int? UserId { get; set; }
        [MaxLength(50)] public string EventType { get; set; } = null!;
        [MaxLength(200)] public string? Description { get; set; }
        [MaxLength(45)] public string? IpAddress { get; set; }
        [MaxLength(500)] public string? UserAgent { get; set; }
        [MaxLength(255)] public string? DeviceId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

Thêm DbSet:

```csharp
public DbSet<AuthAuditLog> AuthAuditLogs { get; set; }
```

Ghi log cho các event:

- `LoginSuccess`
- `LoginFailed`
- `RegisterSuccess`
- `PasswordChanged`
- `PasswordReset`
- `RemoteLogout`
- `NewDeviceLogin`
- `ReplaceDevice`

---

### BƯỚC 13: Sửa mojibake tiếng Việt trong source code

Các chuỗi đang bị lỗi cần sửa:

| Sai | Đúng |
|---|---|
| `Hoáº¡t Ä‘á»™ng` | `Hoạt động` |
| `Bá»‹ khÃ³a` | `Bị khóa` |
| `KhÃ³a vÄ©nh viá»…n` | `Khóa vĩnh viễn` |
| `TÃ i khoáº£n` | `Tài khoản` |
| `MÃ£ OTP` | `Mã OTP` |

File cần ưu tiên:

- `Services/Implementation/XacThucService.cs`
- `Helpers/SessionCheckMiddleware.cs`
- `Models/NguoiDungModel.cs`
- `src/configs/axios.ts`
- `src/App.tsx`
- `src/utils/deviceHelper.ts`

**Lưu ý:** Sửa bằng UTF-8, không dùng ANSI/Windows-1252.

---

### BƯỚC 14: Bảo vệ file KYC giảng viên

Hiện file giấy tờ được lưu trong:

```csharp
wwwroot/uploads/dang-ky-giang-vien/giay-to
```

Đây là thư mục public.

Nên chuyển sang:

```csharp
App_Data/kyc-files/giay-to
```

Khi admin cần xem, tạo API protected:

```csharp
[Authorize(Roles = "Admin")]
[HttpGet("kyc-file/{fileName}")]
public IActionResult GetKycFile(string fileName)
{
    var filePath = Path.Combine(_env.ContentRootPath, "App_Data", "kyc-files", "giay-to", fileName);
    if (!System.IO.File.Exists(filePath)) return NotFound();
    return PhysicalFile(filePath, "image/jpeg");
}
```

---

## PHẦN 4: CHECKLIST FILE CẦN SỬA

| File | Việc cần làm |
|---|---|
| `Models/AuthOtpModel.cs` | Tạo mới |
| `Models/AuthAuditLog.cs` | Tạo mới |
| `Models/PhienDangNhapModel.cs` | Thêm refresh token fields |
| `Data/EduCodeAIDbContext.cs` | Thêm `DbSet<AuthOtpModel>`, `DbSet<AuthAuditLog>` |
| `Services/Interface/IOtpService.cs` | Tạo mới |
| `Services/Implementation/OtpService.cs` | Tạo mới |
| `Helpers/PasswordValidator.cs` | Tạo mới |
| `DTOs/XacThuc/RefreshTokenRequest.cs` | Tạo mới |
| `Services/Implementation/XacThucService.cs` | Sửa nhiều nhất: OTP, captcha, refresh token, revoke session, password policy, social login |
| `Controllers/XacThucController.cs` | Sửa refresh-token nhận body, có thể thêm API OTP đổi mật khẩu |
| `Helpers/SessionCheckMiddleware.cs` | Clear/cập nhật session, sửa mojibake |
| `src/configs/axios.ts` | Sửa refresh token không dùng query string |
| `src/services/auth.service.ts` | Sửa call refresh token, social login payload |
| `src/utils/deviceHelper.ts` | Sửa mojibake, cân nhắc dùng local device id ổn định hơn fingerprint |

---

## PHẦN 5: THỨ TỰ TRIỂN KHAI KHUYẾN NGHỊ

1. Tạo `AuthOtpModel`, `OtpService`, migration.
2. Sửa OTP cho đăng ký/quên mật khẩu/thiết bị mới/remote logout.
3. Verify captcha ở đăng ký và các endpoint gửi OTP.
4. Sửa quên mật khẩu không lộ email.
5. Thêm `PasswordValidator`.
6. Reset password revoke toàn bộ session.
7. Đổi mật khẩu revoke session khác.
8. Thêm fields refresh token vào `PhienDangNhapModel`.
9. Chuyển refresh token từ `MemoryCache` sang DB hash + rotate.
10. Sửa frontend gọi refresh token bằng body thay vì query string.
11. Giảm access token xuống 15 phút.
12. Sửa Google/Facebook login verify token thật.
13. Sửa logout clear cache + revoke refresh token.
14. Thêm audit log.
15. Sửa mojibake tiếng Việt trong source.
16. Chuyển file KYC ra khỏi `wwwroot`.
17. Test end-to-end toàn bộ flow xác thực.

---

## PHẦN 6: TEST CASE BẮT BUỘC SAU KHI SỬA

### Đăng ký

- Đăng ký email mới → nhận OTP → nhập đúng OTP → tạo tài khoản thành công.
- Nhập sai OTP 5 lần → bị chặn.
- Gửi OTP quá nhiều lần → bị rate limit.
- Server restart → OTP DB vẫn kiểm tra được nếu chưa hết hạn.

### Đăng nhập

- Sai mật khẩu nhiều lần → captcha/rate limit hoạt động.
- Đăng nhập thiết bị cũ → vào thẳng.
- Đăng nhập thiết bị mới → yêu cầu OTP.
- Đăng nhập thiết bị thứ 4 → yêu cầu thay thế thiết bị cũ.

### Refresh token

- Access token hết hạn → refresh token body hoạt động.
- Dùng lại refresh token cũ sau rotation → bị từ chối.
- Logout xong dùng refresh token cũ → bị từ chối.

### Quên mật khẩu

- Email tồn tại và không tồn tại đều trả message giống nhau.
- Reset password thành công → mọi session cũ bị logout.
- Mật khẩu yếu bị từ chối.

### Đổi mật khẩu

- Sai mật khẩu cũ → bị từ chối.
- Mật khẩu mới trùng cũ → bị từ chối.
- Đổi mật khẩu thành công → các session khác bị logout.

### Remote logout

- OTP đúng → logout thiết bị đã chọn.
- OTP sai nhiều lần → bị khóa OTP.
- Session logout bị cắt ngay, không chờ 60 giây.

### Social login

- Google/Facebook token thật → login được.
- Email giả gửi từ frontend nhưng token không hợp lệ → bị từ chối.

---

> Tài liệu tạo ngày: 2026-07-03  
> Phiên bản: v1.1 - đã sửa lỗi tiếng Việt UTF-8  
> Trạng thái: Ready for implementation
