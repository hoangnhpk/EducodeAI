# KẾ HOẠCH CẢI TIẾN BẢO MẬT XÁC THỰC EDUCODEAI

> **Loại tài liệu:** Phân tích hiện trạng + phạm vi + quy định + backlog triển khai.  
> **Ngày cập nhật:** 2026-07-21  
> **Trạng thái:** Chỉ lập kế hoạch, **chưa sửa code**.  
> **Nguồn sự thật:** Code hiện tại trên nhánh `Au`, sau khi đồng bộ `origin/dev`.

---

## 0. LƯU Ý QUAN TRỌNG — PHẠM VI BẮT BUỘC

### 0.1. Được phép phân tích và sửa trong các bước triển khai sau

Chỉ được thay đổi những phần trực tiếp phục vụ bảo mật web và các luồng:

- Đăng ký học viên.
- Đăng nhập bằng tài khoản/mật khẩu.
- Đăng nhập Google/Facebook.
- Quên mật khẩu, đặt lại mật khẩu, đổi mật khẩu.
- OTP và CAPTCHA của các luồng xác thực.
- Access token, refresh token, cookie, localStorage và axios interceptor.
- Đăng xuất, đăng xuất từ xa, quản lý thiết bị/phiên đăng nhập.
- Quản lý người dùng: khóa/mở khóa, thu hồi phiên.
- Đăng ký giảng viên, xác minh email, OCR giấy tờ, duyệt/từ chối/bổ sung hồ sơ.
- Middleware xác thực, phân quyền, session, maintenance nếu ảnh hưởng trực tiếp tới truy cập web.
- Log/audit liên quan đến xác thực và thông tin nhạy cảm.
- Frontend hiển thị/luân chuyển dữ liệu nhạy cảm có thể quan sát bằng F12.
- Test và CI chỉ dành cho các phạm vi trên.

### 0.2. Tuyệt đối không sửa

- Không thay đổi cấu trúc tổng thể của dự án dù cấu trúc hiện tại chưa sạch.
- Không refactor diện rộng, không di chuyển folder/file chỉ để “làm đẹp”.
- Không sửa chức năng thanh toán, nạp/rút tiền, SePay, voucher hoặc giao dịch.
- Không sửa Gemini, cấu hình API key Gemini hoặc luồng AI không liên quan xác thực.
- Không sửa các API key/tích hợp khác ngoài trường hợp token/secret đó bị đưa ra trình duyệt hoặc log web trong luồng xác thực.
- Không tự động sửa toàn bộ `appsettings*.json`; các file cấu hình hiện tại để nguyên theo yêu cầu. Chỉ ghi nhận rủi ro nếu secret bị log hoặc trả ra frontend.
- Không thay đổi nghiệp vụ khóa học, bài học, bài tập, chứng chỉ, marketplace.
- Không tự chạy migration lên database thật khi chưa được phê duyệt.
- Không lưu ảnh CCCD/CMND/Hộ chiếu của giảng viên ra đĩa, cloud hoặc DB blob.

### 0.3. Quy tắc triển khai

1. Mỗi task phải có test/tiêu chí nghiệm thu trước khi đánh dấu hoàn thành.
2. Backend là nguồn quyết định quyền truy cập; không tin dữ liệu, role, email, device ID hoặc bypass header từ frontend.
3. Không log token, OTP, mật khẩu, JWT signing key, cookie, authorization header hoặc nội dung giấy tờ.
4. Không đưa refresh token vào URL/query string.
5. Không lưu refresh token trong `localStorage`/`sessionStorage`/IndexedDB.
6. Mọi revoke session phải có hiệu lực gần realtime mà không polling DB liên tục.
7. Lỗi xác thực trả mã lỗi ổn định, không trả stack trace/connection string/exception nội bộ.
8. Không đánh dấu `[x]` nếu chưa chạy build/test tương ứng.

## 0.4. BẢN ĐỒ RANH GIỚI TOÀN DỰ ÁN — TRÁNH SỬA LUNG TUNG

Đã rà soát toàn bộ cây nguồn backend, frontend, database, migrations, docs và các cấu hình gốc. Khi thực hiện tài liệu này, phải tuân thủ danh sách dưới đây.

### Vùng được phép sửa trực tiếp

**Backend auth/security:**

- `Program.cs`: chỉ phần JWT, auth DI, CORS/auth middleware order, session/maintenance middleware registration.
- `Controllers/XacThucController.cs`, `Controllers/NguoiDungController.cs` và controller Admin quản lý user/duyệt giảng viên: chỉ endpoint thuộc phạm vi tài liệu.
- `Services/Implementation/XacThucService.cs`, `NguoiDungService.cs`, service quản lý user/hồ sơ giảng viên.
- `Services/Interface` tương ứng.
- `DTOs/XacThuc/*`; DTO user/teacher chỉ khi endpoint đang sửa thực sự dùng.
- `Models/NguoiDungModel.cs`, `PhienDangNhapModel.cs`, model OTP/audit/hồ sơ giảng viên: chỉ field/index bắt buộc.
- `Data/EduCodeAIDbContext.cs`: chỉ DbSet/index/relation thuộc auth/session/teacher; không chỉnh relation domain khác.
- `Helpers/SessionCheckMiddleware.cs`, `MaintenanceMiddleware.cs`, current-user/crypto helper liên quan trực tiếp.
- Redis/session/rate-limit service: phải giữ hoạt động ở cả Redis và memory fallback dev.

**Frontend auth/security:**

- `src/configs/axios.ts`.
- `src/services/auth.service.ts`, `src/services/xac-thuc.service.ts`.
- `src/pages/auth/**`, `ProtectedRoute.tsx`.
- `src/App.tsx`, `src/router/index.tsx`: chỉ logic auth/session/route guard.
- `src/utils/authHelper.ts`, `src/utils/deviceHelper.ts`.
- Trang đổi mật khẩu/quản lý thiết bị/bảo mật tài khoản.
- Header ba role chỉ khi cần cập nhật logout/session UI.
- Trang quản lý user và duyệt giảng viên chỉ trong phạm vi authorization/account state.

### Vùng cấm sửa khi làm kế hoạch này

**Thanh toán/thương mại:** mọi controller/service/DTO/model liên quan `ThanhToan`, `SePay`, `DonHang`, `GiaoDich`, `MaGiamGia`, `QuaTang`, `RutTien`, `DoanhThu`, ngân hàng. Không đổi extraction `MaNguoiDung` theo cách làm hỏng checkout/enrollment.

**AI/Gemini/API key/video:** mọi controller/service/helper/DTO/model liên quan `AI`, `Gemini`, `KeyAPI`, `VideoAI`, `YouTube`, sinh đồ án, lộ trình AI. Nếu endpoint Admin API key cần bảo vệ thì chỉ sửa authorization guard, không sửa logic key/AI.

**Khóa học/học tập:** `KhoaHoc`, `ChuongHoc`, `BaiHoc`, đăng ký khóa học, tiến độ, không gian học tập, đánh giá, bình luận, marketplace và seed data.

**Bài tập/chứng chỉ:** quiz, thực hành, test case, code execution, kết quả bài làm, PDF/chứng chỉ.

**Thống kê/reporting:** dashboard, thống kê học tập/Admin, quản lý review ngoài authorization tối thiểu.

**Static/runtime/generated:**

- Không sửa/xóa `wwwroot/uploads/avatars`, `wwwroot/uploads/khoa-hoc` hoặc file upload thật.
- Không sửa `bin/`, `obj/`, artifacts, logs, cache, `node_modules`.
- Không sửa tay `Migrations/*.Designer.cs` hoặc model snapshot; dùng EF tooling.
- Không rewrite migration EF/Supabase đã áp dụng.
- Không chạy `supabase db reset`, `supabase db push`, `dotnet ef database update` nếu chưa được phê duyệt.
- Không đụng nested/tạm như `scratch`, `taste-skill-main`, `test`, probe dirs.

### Coupling bắt buộc phải giữ

1. `NguoiDungModel` là hub FK của gần toàn hệ thống; không đổi khóa chính, cascade hoặc navigation ngoài nhu cầu auth.
2. JWT claim hiện được nhiều nơi đọc dưới các tên `id`, `MaNguoiDung`, `NameIdentifier`; khi chuẩn hóa phải có giai đoạn tương thích và test payment/course không bị đổi user.
3. Claim `MaPhien` là căn cứ revoke; mọi token auth mới phải có nhưng không xóa claim legacy trước khi audit hết issuer.
4. Role mapping và `ClaimTypes.Role` ảnh hưởng toàn bộ `[Authorize(Roles=...)]`; không đổi tên role tùy tiện.
5. Trạng thái user đang là chuỗi (`Hoạt động`, `Bị khóa`, `Khóa vĩnh viễn`); không đổi text mà chưa đồng bộ Admin/service/middleware/data.
6. Redis là optional; auth không được phụ thuộc Redis-only nếu fallback chưa tương đương.
7. `axios.ts` đang coupling token, refresh queue, alert, redirect, maintenance và device; thay từng phần, phải test retry loop và không tạo refresh storm.
8. `user_info` casing không thống nhất; route guards đọc `vaiTro`/`VaiTro` và nhiều biến thể user id. Chỉ chuẩn hóa khi có compatibility adapter.
9. SignalR `SystemConfigHub` đang phục vụ cấu hình/maintenance; nếu thêm auth-session realtime phải tách event/group rõ ràng, không phá hub hiện tại.
10. EF migration và Supabase migration đang cùng tồn tại; với schema auth phải chọn EF làm nguồn tạo migration của backend và ghi rõ cách đồng bộ, không tạo hai migration mâu thuẫn.

### Quy tắc kiểm tra diff trước khi hoàn thành

- `git diff --name-only` không được chứa file ngoài vùng cho phép. Nếu có, dừng và giải thích.
- Nếu phải sửa file dùng chung như `Program.cs`, `DbContext`, `axios.ts`, chỉ thay block nhỏ nhất liên quan auth.
- Không format lại toàn file, không đổi encoding/line ending hàng loạt.
- Không chạy cleanup tự động trên toàn repo.
- Mỗi thay đổi auth phải chạy backend build/test và frontend lint/build/test liên quan.
- Chỉ đánh dấu task done sau khi xác nhận không ảnh hưởng payment, AI/Gemini, course, exercise và upload runtime.

---

## 1. PHẠM VI CODE CẦN ĐỌC/KIỂM TRA KHI TRIỂN KHAI

### Backend

- `educodeai-server/Program.cs`
- `educodeai-server/Controllers/XacThucController.cs`
- `educodeai-server/Controllers/NguoiDungController.cs`
- `educodeai-server/Controllers/QuanTriVien/QuanLyNguoiDungController.cs`
- Các controller quản lý/duyệt hồ sơ giảng viên.
- `educodeai-server/Services/Implementation/XacThucService.cs`
- `educodeai-server/Services/Implementation/NguoiDungService.cs`
- Các service quản lý người dùng và hồ sơ giảng viên.
- `educodeai-server/Helpers/SessionCheckMiddleware.cs`
- `educodeai-server/Helpers/MaintenanceMiddleware.cs`
- `educodeai-server/Models/NguoiDungModel.cs`
- `educodeai-server/Models/PhienDangNhapModel.cs`
- Model hồ sơ đăng ký giảng viên.
- `educodeai-server/Data/EduCodeAIDbContext.cs`
- DTO trong `educodeai-server/DTOs/XacThuc/` và DTO quản lý người dùng/giảng viên.

### Frontend

- `educodeai-client/src/configs/axios.ts`
- `educodeai-client/src/services/auth.service.ts`
- `educodeai-client/src/App.tsx`
- `educodeai-client/src/router/` và protected route.
- `educodeai-client/src/pages/auth/`
- Trang quản lý thiết bị/phiên đăng nhập.
- Trang đổi/quên/đặt lại mật khẩu.
- Trang đăng ký giảng viên và quản trị duyệt hồ sơ.
- `educodeai-client/src/layouts/hoc-vien/LayoutHocVien.tsx`
- `educodeai-client/src/utils/deviceHelper.ts`

---

## 2. HIỆN TRẠNG VÀ LỖ HỔNG ĐÃ XÁC ĐỊNH

## 2.1. JWT signing key bị ghi ra log

**Hiện trạng:** `Program.cs` có lệnh in `Jwt:Key` khi cấu hình JwtBearer.

**Rủi ro:** người xem log có thể ký JWT giả, giả mạo học viên/giảng viên/Admin.

**Mức độ:** CRITICAL.

**Yêu cầu:**

- Xóa log giá trị JWT key.
- Không log bất kỳ secret/token nào.
- Sau khi triển khai, rotate JWT key ngoài code và vô hiệu hóa token cũ.
- Thêm test/quy tắc secret scan để ngăn tái diễn.

## 2.2. Token có thể quan sát bằng F12

**Hiện trạng cần xử lý:** frontend lưu access token và refresh token trong storage; axios đọc token từ `localStorage`. Refresh token còn được gửi qua query string trong luồng refresh.

**Rủi ro:**

- XSS có thể đọc token trong storage.
- Refresh token xuất hiện trong DevTools, browser history, proxy/server log hoặc monitoring vì nằm trong URL.
- Token cũ có thể tiếp tục dùng nếu logout không revoke đúng.

**Mức độ:** CRITICAL/HIGH.

**Mục tiêu:**

- Refresh token chỉ nằm trong cookie `HttpOnly`, `Secure`, `SameSite` phù hợp; JavaScript không đọc được.
- Refresh endpoint đọc cookie, không nhận token trong URL/body do frontend tự cung cấp.
- Access token chuyển sang bộ nhớ runtime; không lưu bền trong localStorage. Nếu cần rollout an toàn, triển khai hai giai đoạn nhưng đích cuối là không để token đọc được bằng JavaScript.
- Không trả refresh token trong JSON response.

## 2.3. Refresh token lưu MemoryCache, không hash và không rotate chuẩn

**Hiện trạng:** token tạo từ GUID, lưu process-local cache, TTL dài; server restart làm mất token; multi-instance không đồng bộ; logout không bảo đảm revoke token.

**Rủi ro:** replay, không audit được, không thu hồi nhất quán, URL leakage.

**Mức độ:** HIGH.

**Mục tiêu:**

- Sinh bằng `RandomNumberGenerator` tối thiểu 256-bit.
- Lưu hash token trong DB, gắn với `MaPhien`, user, device, expiry, revoke time, replacement token.
- Rotate mỗi lần refresh.
- Phát hiện reuse token cũ; khi phát hiện, revoke token family/session liên quan.
- Revoke khi logout, remote logout, reset/đổi mật khẩu, khóa user, thay thế thiết bị.

## 2.4. Access token sống quá lâu và JWT phát từ nhiều nơi

**Hiện trạng:** có luồng tạo JWT 24 giờ; một số JWT không có claim `MaPhien`, trong khi session middleware chỉ kiểm tra nếu claim tồn tại.

**Rủi ro:** token bị đánh cắp dùng lâu; token không có `MaPhien` có thể không chịu cơ chế revoke thiết bị.

**Mức độ:** HIGH.

**Mục tiêu:**

- Chỉ có một token service phát JWT.
- Mọi access token có: user id, role, `MaPhien`, `jti`, issued-at.
- TTL 10–15 phút.
- Không tin role do client gửi.
- Validate issuer, audience, lifetime, signature; `ClockSkew` tối đa 1 phút.

## 2.5. OTP dùng `Random`, lưu plain text trong MemoryCache

**Các flow chịu ảnh hưởng:** đăng ký, quên mật khẩu, thiết bị mới, thay thiết bị, remote logout, xác minh email giảng viên.

**Rủi ro:** OTP có thể dự đoán, mất khi restart, không giới hạn attempt thống nhất, không audit/rate-limit tốt.

**Mức độ:** HIGH.

**Mục tiêu:**

- Sinh OTP bằng `RandomNumberGenerator`.
- Chỉ lưu hash OTP.
- TTL 5 phút; dùng một lần; tối đa 5 lần nhập sai.
- Rate limit theo purpose + normalized identifier + IP.
- Invalidate OTP cũ khi phát OTP mới.
- Không log hoặc trả OTP ngoài kênh gửi email.

## 2.6. CAPTCHA chưa được kiểm tra nhất quán

**Hiện trạng:** một số DTO có `CaptchaToken` nhưng backend không verify; có nhánh `SKIP_CAPTCHA` hoặc chỉ check sau số lần đăng nhập sai.

**Rủi ro:** spam email, brute force OTP/login, abuse đăng ký/quên mật khẩu.

**Mục tiêu:**

- Verify captcha server-side tại đăng ký, quên mật khẩu, phát OTP remote logout và các endpoint phát OTP công khai.
- Không chấp nhận `SKIP_CAPTCHA` ngoài test environment được kiểm soát.
- Captcha chỉ là một lớp; vẫn phải rate-limit.

## 2.7. Quên mật khẩu làm lộ email tồn tại

**Hiện trạng:** phản hồi khác nhau khi email không tồn tại; endpoint check-email public cũng trả `exists` rõ ràng.

**Rủi ro:** user enumeration.

**Mức độ:** MEDIUM/HIGH.

**Mục tiêu:**

- Quên mật khẩu luôn trả cùng message và thời gian xử lý gần tương đương.
- Rate limit check-email; chỉ giữ endpoint nếu UX thật sự cần.
- Không tiết lộ trạng thái tài khoản qua lỗi chi tiết.

## 2.8. Reset/đổi mật khẩu chưa thu hồi đầy đủ phiên cũ

**Hiện trạng:** reset có thể tự đăng nhập lại; các session/refresh token cũ không được revoke đầy đủ. DTO đổi mật khẩu có OTP nhưng backend không dùng.

**Rủi ro:** attacker đã có session vẫn truy cập được sau khi chủ tài khoản đổi/reset mật khẩu.

**Mục tiêu:**

- Reset password: revoke toàn bộ session/token, không auto-login, yêu cầu đăng nhập lại.
- Đổi mật khẩu: verify mật khẩu cũ, policy mật khẩu mới, không trùng mật khẩu cũ; revoke các phiên khác hoặc toàn bộ theo policy.
- Nếu không dùng OTP đổi mật khẩu thì xóa field/UI để tránh cảm giác bảo mật giả.

## 2.9. Social login tin dữ liệu frontend

**Hiện trạng:** backend nhận email/name/picture và tạo/đăng nhập user mà chưa xác minh token với Google/Facebook.

**Rủi ro:** attacker giả email của người khác để chiếm tài khoản.

**Mức độ:** CRITICAL.

**Mục tiêu:**

- Google: frontend gửi credential/id_token; backend verify chữ ký/token, issuer, audience, expiry, email_verified.
- Facebook: backend verify access token với provider/app id và lấy profile từ Graph API.
- Chỉ dùng email/subject trả về từ provider; bỏ qua email/name/role do client tự gửi.
- Không đưa provider token vào URL/log.

## 2.10. Logout và remote logout không cắt phiên tức thời

**Hiện trạng:** logout dựa vào `maThietBi` client gửi; session cache có thể còn hợp lệ; refresh token không chắc được revoke. “Đăng xuất tất cả” có thể đăng xuất cả phiên hiện tại.

**Mục tiêu:**

- Logout hiện tại lấy `MaPhien` từ JWT, không tin device ID body.
- Revoke session + refresh token transactionally.
- Remote logout chỉ thao tác các session thuộc user hiện tại.
- “Đăng xuất tất cả thiết bị khác” phải giữ `MaPhien` hiện tại.
- Cache/event được invalidated ngay sau commit.

## 2.11. Session middleware fail-open khi DB lỗi

**Hiện trạng:** khi DB/socket lỗi, middleware có thể coi user “Hoạt động” và session còn hiệu lực.

**Rủi ro:** user bị khóa/session đã revoke vẫn được truy cập trong thời gian sự cố.

**Mức độ:** HIGH.

**Mục tiêu:**

- Không fail-open ở auth/session.
- Nếu không xác minh được trạng thái session cho endpoint bảo vệ, trả `503 AUTH_STATE_UNAVAILABLE` hoặc `401` theo policy; không tự mặc định active.
- Dùng cache trạng thái đáng tin cậy để giảm phụ thuộc DB nhưng phải có invalidation.

## 2.12. Quản lý thiết bị đang polling và gọi DB liên tục

**Hiện trạng:** frontend gọi API danh sách/check trạng thái định kỳ (khoảng 10 giây). Mỗi request đi qua middleware và có thể query user/session DB. Ngoài tải DB, logout vẫn có độ trễ theo polling/cache TTL.

**Vấn đề:** đây không phải realtime thật; số tab/user tăng sẽ làm số request và query tăng tuyến tính.

**Mục tiêu:** phản hồi revoke gần realtime mà không polling DB liên tục.

## 2.13. Device fingerprint không phải bằng chứng bảo mật

**Hiện trạng:** frontend tạo mã thiết bị từ canvas/platform/screen/hardware; client có thể sửa/spoof và fingerprint có thể thay đổi.

**Mục tiêu:**

- Xem fingerprint là metadata UX, không dùng làm credential.
- Session id/token do server phát mới là định danh bảo mật.
- Có thể dùng random device id lưu local cho tên thiết bị, nhưng không cấp quyền dựa riêng vào nó.

## 2.14. Khóa/mở khóa người dùng chưa invalidation tức thời

**Hiện trạng:** user status cache 60 giây; multi-instance memory cache không đồng bộ. API check status riêng còn polling.

**Mục tiêu:**

- Sau khi Admin khóa user: DB commit → revoke sessions/refresh tokens → publish invalidation/event → đóng kết nối SignalR → frontend logout.
- Sau khi mở khóa: invalidate user-status cache.
- Mọi hành động có audit log Admin, target user, reason, IP, timestamp.

## 2.15. Đăng ký và duyệt giảng viên

**Rủi ro cần kiểm soát:**

- OTP email chưa thống nhất với OTP service.
- File avatar cần validate kích thước/MIME/magic bytes và filename server-generated.
- Không tin role/trạng thái hồ sơ từ frontend.
- Endpoint duyệt/từ chối/bổ sung phải `[Authorize(Roles="Admin")]` hoặc policy tương đương.
- Chống IDOR: Admin endpoint vẫn phải truy vấn đúng hồ sơ; user chỉ xem/sửa hồ sơ của chính họ qua token có thời hạn.
- Không log OCR text/CCCD.
- Không lưu ảnh CCCD; chỉ OCR trong RAM, mã hóa dữ liệu cần thiết bằng Data Protection rồi lưu.
- Duyệt hồ sơ và tạo tài khoản/role nên nằm trong transaction, chống duyệt lặp.
- Audit đầy đủ ai duyệt, khi nào, lý do từ chối, field nào thay đổi.

## 2.16. Exception/log làm lộ thông tin nội bộ

**Hiện trạng:** controller bắt `Exception` và trả `ex.Message`; có `Console.WriteLine` stack/error; một số lỗi chứa Supabase/DNS/socket.

**Mục tiêu:**

- Global exception middleware.
- Response envelope ổn định, không stack/SQL/connection details.
- Structured logging có redaction.
- Không log Authorization, cookie, token, OTP, password, OCR/CCCD.

## 2.17. Maintenance bypass do client điều khiển

**Hiện trạng cần xác minh khi triển khai:** frontend có thể gắn bypass header; middleware cho qua theo header/path rộng và chạy trước authentication.

**Mục tiêu:**

- Authentication chạy trước maintenance middleware.
- Chỉ authenticated Admin được bypass.
- Không tin `X-Bypass-Maintenance` hoặc URL chứa `/quan-tri`.

---

## 3. KIẾN TRÚC QUẢN LÝ PHIÊN REALTIME ĐỀ XUẤT

## 3.1. Phương án được chọn: event-driven SignalR + distributed session cache

Không dùng frontend polling mỗi 10 giây và không query DB trên mỗi request.

### Thành phần

1. **Database — nguồn sự thật bền vững**
   - `PhienDangNhap`: active/revoked, user, device metadata, last activity.
   - Refresh token hash/expiry/revocation.

2. **Distributed cache — hot path**
   - Redis nếu có; memory fallback chỉ phù hợp single-instance dev.
   - Key ví dụ:
     - `auth:user:{userId}:status`
     - `auth:session:{maPhien}:active`
     - `auth:user:{userId}:session-version`
   - Request middleware đọc cache; chỉ query DB khi cache miss.

3. **SignalR — push event tới browser**
   - Connection join group theo user/session sau khi JWT được xác thực:
     - `user:{userId}`
     - `session:{maPhien}`
   - Event:
     - `SessionRevoked`
     - `AllOtherSessionsRevoked`
     - `UserLocked`
     - `PasswordChanged`
     - `SessionListChanged`
   - Frontend nhận event → xóa auth state runtime, đóng UI bảo vệ, redirect login.

4. **Cache invalidation — bắt buộc**
   - Logout/remote logout/ban/reset/change password:
     1. Update DB trong transaction.
     2. Commit thành công.
     3. Set/delete distributed cache ngay.
     4. Publish SignalR event.
   - Không publish trước commit.

5. **Middleware — không query DB liên tục**
   - Validate JWT local.
   - Đọc `user status` và `session active/version` từ cache.
   - Cache miss mới query DB và populate cache.
   - Cache lỗi + DB lỗi: fail closed cho endpoint protected.

### Tính realtime

- SignalR cho UX logout gần như tức thời.
- Cache invalidation làm request kế tiếp bị từ chối ngay cả khi SignalR bị mất kết nối.
- Access token TTL ngắn là lớp an toàn cuối.

### Fallback khi SignalR mất kết nối

- Tự reconnect với backoff.
- Khi reconnect, gọi **một lần** endpoint `GET /api/XacThuc/session-state` để đồng bộ, không polling liên tục.
- Mọi API protected vẫn qua session middleware; vì vậy user không thể tiếp tục thao tác chỉ vì UI chưa nhận event.
- Có thể có heartbeat SignalR ở tầng transport; không dùng heartbeat để query DB.

### Cập nhật `ThoiGianHoatDongCuoi`

Không `SaveChanges` mỗi request.

- Ghi activity vào cache, throttle tối thiểu 1–5 phút/session.
- Worker nền flush activity theo batch về DB.
- Hoặc update DB chỉ khi thời gian cũ cách hiện tại trên ngưỡng.
- Danh sách thiết bị lấy projection nhẹ và chỉ tải khi user mở trang hoặc nhận `SessionListChanged`.

## 3.2. Vì sao không chọn các phương án khác

- **Polling DB:** tải tăng tuyến tính, không realtime thật, tạo nhiều request thừa.
- **Chỉ SignalR, không cache/middleware:** event có thể mất khi client offline; token vẫn gọi API được.
- **Chỉ JWT TTL ngắn:** revoke không tức thời và không quản lý được thiết bị tốt.
- **Chỉ IMemoryCache:** không đồng bộ khi scale nhiều server và mất khi restart.

---

## 4. BACKLOG TRIỂN KHAI CHI TIẾT

Quy ước: `[ ]` chưa làm, `[~]` đang làm, `[x]` đã build/test đạt.

## Giai đoạn A — Baseline và test bảo vệ hành vi

- [x] **A.1** Lập inventory toàn bộ endpoint auth/user/device/teacher và attribute `[Authorize]`, role/policy hiện tại. _(Xem `Docs/BaselineBaoMatXacThuc.md` §A.1.)_
- [x] **A.2** Lập inventory tất cả nơi tạo/đọc/lưu/log access token, refresh token, OTP, password, authorization header. _(§A.2.)_
- [x] **A.3** Tạo backend test project cho phạm vi auth. _(`educodeai-server.Tests/`.)_
- [x] **A.4** Tạo frontend Vitest cho axios/auth storage. _(`axios.test.ts`, `authStorage.test.ts`.)_
- [x] **A.5** Viết test hiện trạng để khóa các luồng hợp lệ: đăng ký, login thiết bị cũ/mới, forgot/reset, quản lý thiết bị, đăng ký/duyệt giảng viên. _(`XacThucFlowBaselineTests.cs`, `XacThucControllerTests.cs`.)_
- [x] **A.6** Ghi rõ endpoint nào public, authenticated, Admin-only; sửa checklist nếu code khác tài liệu. _(§A.6 ma trận quyền + danh sách mismatch.)_

## Giai đoạn B — Chặn lộ token/log trên web

- [x] **B.1** Xóa log JWT signing key trong `Program.cs`.
- [x] **B.2** Grep và loại log token/OTP/password/cookie/Authorization/OCR text trong phạm vi cho phép.
- [x] **B.3** Thêm redaction cho structured logging.
- [x] **B.4** Tạo `ApiResponse<T>`, `ApiError`, stable error codes.
- [x] **B.5** Thêm global exception middleware; không trả `ex.Message`/stack nội bộ.
- [x] **B.6** Test F12/Network: URL không chứa refresh token/OTP/password.
- [x] **B.7** Test Application Storage: không có refresh token; mục tiêu cuối không có access token.

## Giai đoạn C — Chuẩn hóa JWT và refresh token

- [x] **C.1** Tạo một token service duy nhất.
- [x] **C.2** Mọi JWT có `MaPhien`, user id, role, `jti`, `iat`; TTL 10–15 phút.
- [x] **C.3** Thêm refresh-token fields/table: hash, session id, expiry, revoked, replaced-by, family id, created IP/user-agent.
- [x] **C.4** Sinh token 256-bit CSPRNG; chỉ lưu hash.
- [x] **C.5** Set refresh token cookie `HttpOnly`, `Secure`, `SameSite=None` nếu cross-site HTTPS; nếu same-site thì ưu tiên `Lax/Strict`.
- [x] **C.6** Refresh endpoint chỉ đọc cookie; không nhận query/body token.
- [x] **C.7** Rotate token mỗi lần refresh; token cũ dùng lại → revoke family/session + audit.
- [x] **C.8** Login/register/social login set cookie; logout xóa cookie.
- [x] **C.9** Frontend bỏ `refresh_token` khỏi localStorage và URL.
- [ ] **C.10** Chuyển access token sang memory state; reload dùng refresh cookie để lấy access token mới. _(Hoãn theo quyết định — access token vẫn ở localStorage; sẽ làm sau.)_
- [x] **C.11** Thêm CSRF defense phù hợp cho cookie refresh (Origin/Referer validation và/or anti-CSRF token).
- [x] **C.12** Migration chỉ tạo file (`AddRefreshTokenTable`) + provision idempotent qua `DatabaseSchemaSync`; không tự apply production.

## Giai đoạn D — OTP, CAPTCHA, registration

> **Cách triển khai:** chia 3 chặng, chốt từng chặng trước khi sang chặng sau (chạm 6 flow OTP dùng chung + endpoint công khai).
>
> **Quyết định lưu trữ:** OTP và rate-limit counter lưu trên `IDistributedCache` (Redis nếu có, memory fallback dev) — cùng hạ tầng đã dùng ở Phase G (`ISessionStateCache`), không dùng `IMemoryCache` process-local nữa để đồng bộ multi-instance và không mất khi restart. Chỉ lưu **hash** OTP, không lưu plain.
>
> **Không phá flow hiện tại:** tạo `IOtpService`/`OtpService` mới rồi thay thế từng nơi tạo/verify OTP đang dùng `new Random()` + `IMemoryCache`, giữ nguyên chữ ký endpoint và luồng email.

### Chặng D-1 — OTP service foundation (CSPRNG + hash + single-use + max attempts)

- [x] **D.1** Tạo `IOtpService`/`OtpService` dùng chung cho `Register`, `ForgotPassword`, `NewDevice`, `ReplaceDevice`, `RemoteLogout`, `InstructorEmail`; backing store `IDistributedCache`. _(`Services/Interface/IOtpService.cs` + `Services/Implementation/OtpService.cs`; DI scoped trong `Program.cs`. Đã thay toàn bộ 7 nơi tạo + 6 nơi verify OTP trong `XacThucService.cs` từ `new Random()`+`IMemoryCache` sang OtpService. Payload thiết bị/đăng ký serialize JSON kèm entry: `DTOs/XacThuc/OtpPayloads.cs`.)_
- [x] **D.2** CSPRNG 6 số (`RandomNumberGenerator.GetInt32(0, 1_000_000)`), chỉ lưu hash SHA-256, TTL 5 phút, single-use, tối đa 5 lần nhập sai/OTP rồi vô hiệu; so sánh hash constant-time (`CryptographicOperations.FixedTimeEquals`); invalidate OTP cũ khi phát OTP mới (ghi đè cùng key). Attempt sai ghi lại theo TTL còn lại tuyệt đối (`ExpiresAtUtc`), không nới hạn OTP. _(Test: `Security/PhaseDOtpServiceTests.cs` — 9 case.)_
- [x] **D.9** Không log OTP hay dữ liệu đăng ký (OtpService không log giá trị nào; giữ nguyên nguyên tắc B.2/B.3).

### Chặng D-2 — Rate-limit phát/verify OTP + CAPTCHA

- [x] **D.3** Rate limit phát OTP theo purpose + normalized email/user + IP; đếm invalid OTP theo identifier/IP. _(`IOtpRateLimiter`/`OtpRateLimiter` fixed-window trên `IDistributedCache`: gửi 5/identifier + 20/IP mỗi 15 phút, verify 10/identifier + 50/IP; fail-open khi cache lỗi. Gắn vào cả 6 flow phát và các flow verify trong `XacThucService`.)_
- [x] **D.4** Verify CAPTCHA server-side ở đăng ký, quên mật khẩu và các endpoint phát OTP công khai. _(Helper `XacThucCaptchaHoacNemAsync` dùng `ICaptchaService`; gắn vào `YeuCauDangKyAsync`, `YeuCauQuenMatKhauAsync`, `GuiOtpEmailGiangVienAsync`. Thêm `CaptchaToken` vào `QuenMatKhauRequest`/`EmailOtpGiangVienRequest` + FE `QuenMatKhau.tsx`/`DangKyGiangVien.tsx` gắn ReCAPTCHA, auth.service truyền token.)_
- [x] **D.5** Không cho `SKIP_CAPTCHA` ngoài test environment. _(`XacThucCaptchaHoacNemAsync` chỉ bỏ qua khi `!_env.IsProduction()`; production luôn bắt token hợp lệ.)_

### Chặng D-3 — Hardening đăng ký học viên

- [x] **D.6** Normalize email `Trim().ToLowerInvariant()` trước query/key/lưu. _(`YeuCauDangKyAsync`: normalize `email` một lần rồi dùng cho rate-limit key, query trùng `u.Email.ToLower() == email`, OTP key và lưu `NguoiDungModel.Email`. Đồng bộ với luồng giảng viên đã chuẩn.)_
- [x] **D.7** Không lưu mật khẩu plain text trong cache. _(Thêm record `DangKyOtpPayload(HoTen, Email, MatKhauHash)`; hash BCrypt ngay tại `YeuCauDangKyAsync` rồi chỉ lưu hash vào OTP payload — không còn serialize cả `DangKyRequest` chứa mật khẩu plain. Verify đọc `MatKhauHash` gán thẳng, không hash lại.)_
- [x] **D.8** Chống tạo trùng email/tài khoản khi lưu DB. _(`XacNhanDangKyVaLuuDbAsync`: re-check trùng ngay trước insert (email có thể bị chiếm giữa lúc gửi OTP và xác minh) + bắt `DbUpdateException` trả lỗi thân thiện làm hàng phòng thủ cuối dựa trên unique index Email/TaiKhoan sẵn có trong `DbContext`. Không thêm `lower(Email)` index để giữ phạm vi — normalize D.6 đã chặn trùng theo case ở tầng ứng dụng.)_

## Giai đoạn E — Login và social login

- [ ] **E.1** Rate limit login theo IP + normalized account; không chỉ IP.
- [ ] **E.2** Message sai tài khoản/mật khẩu giống nhau.
- [ ] **E.3** Không tiết lộ account existence/trạng thái trước khi xác minh hợp lệ.
- [ ] **E.4** Device fingerprint chỉ là metadata; session server-side là căn cứ.
- [ ] **E.5** Google token verify issuer/audience/expiry/email_verified; chỉ dùng profile từ provider.
- [ ] **E.6** Facebook token verify app/provider; chỉ dùng profile từ Graph API.
- [ ] **E.7** Không gửi provider token qua URL/log.
- [ ] **E.8** Audit login success/failure/new device/provider login.

## Giai đoạn F — Quên/reset/đổi mật khẩu

> **Cách triển khai:** chia 3 chặng, chốt từng chặng trước khi sang chặng sau (chạm revoke session + SignalR dùng chung của Phase G).
>
> **Quyết định (đã chốt):** (1) sau RESET (quên mật khẩu) → revoke TẤT CẢ session/refresh token, KHÔNG auto-login, buộc đăng nhập lại; (2) xóa hẳn field `OtpCode` khỏi `DoiMatKhauRequest` (đổi mật khẩu chỉ verify mật khẩu cũ, không dùng OTP); (3) sau ĐỔI mật khẩu (đang đăng nhập) → revoke các phiên KHÁC, giữ phiên hiện tại.
>
> **Tái dùng pattern revoke có sẵn:** `DangXuatAsync`/`XacNhanDangXuatTuXaAsync` (revoke DB → commit → `InvalidateSessionAsync` → `SessionRevokedAsync`/`SessionListChangedAsync`). Password policy dùng chung một helper cho cả reset và change.

### Chặng F-1 — Forgot password (chống enumeration + normalize)

- [x] **F.1** Forgot password luôn trả generic message dù email tồn tại hay không (không throw "email không tồn tại"); normalize email `Trim().ToLowerInvariant()` trước query/rate-limit key. _(`YeuCauQuenMatKhauAsync`: normalize email, chỉ gửi OTP khi email có tài khoản nhưng response luôn giống nhau "Nếu email tồn tại...".)_
- [x] **F.2** Xác nhận rate limit + CAPTCHA + OTP policy chung đã áp (đã có từ Phase D); vá phần còn thiếu nếu có. _(`TryConsumeSendAsync`/`TryConsumeVerifyAsync` + `XacThucCaptchaHoacNemAsync` + `OtpService` đã áp từ Phase D; rate-limit key giờ dùng email normalized.)_

### Chặng F-2 — Reset password (policy + revoke all, không auto-login)

- [x] **F.3** Password policy backend dùng chung: tối thiểu 8 ký tự, chống trùng mật khẩu cũ, không chứa phần local của email; áp cho cả reset và change. _(Helper `KiemTraPasswordPolicyHoacNem`; gọi trong cả `DatLaiMatKhauAsync` và `DoiMatKhauAsync`.)_
- [x] **F.4** Reset: revoke TOÀN BỘ session/refresh token của user, invalidate cache, push SignalR (`SessionRevoked` từng phiên + `SessionListChanged`), KHÔNG auto-login — trả message yêu cầu đăng nhập lại. _(`DatLaiMatKhauAsync`: revoke hết phiên + token `PASSWORD_RESET`, invalidate user-status + từng session, publish SignalR, `ClearRefreshCookie`, không gọi `XuLyDangNhapThanhCongAsync` nữa.)_

### Chặng F-3 — Change password (verify cũ + revoke phiên khác)

- [x] **F.5** Change password: verify mật khẩu cũ; XÓA hẳn field `OtpCode` khỏi `DoiMatKhauRequest` (dứt điểm, không dùng OTP). _(Bỏ field ở DTO backend + `auth.service.ts` + 2 trang đổi mật khẩu frontend.)_
- [x] **F.6** Sau đổi password: revoke các phiên KHÁC (giữ phiên hiện tại lấy `MaPhien` từ JWT), invalidate cache + push SignalR cho các phiên bị revoke. _(`DoiMatKhauAsync`: revoke phiên khác + token `PASSWORD_CHANGE`, giữ `MaPhien` hiện tại, invalidate cache + publish SignalR.)_
- [x] **F.7** Audit password changed/reset ở mức thông tin (không log password/hash/OTP — giữ nguyên tắc B.2/B.3). _(`ILogger<XacThucService>` log userId + số phiên bị revoke; không log secret.)_

## Giai đoạn G — Realtime quản lý thiết bị và session

> **Cách triển khai:** chia 3 chặng, chốt từng chặng trước khi sang chặng sau (khối lượng lớn, chạm middleware dùng chung + realtime).
>
> **Quyết định SignalR (authorize connection):** dùng cách chuẩn của SignalR — client truyền access token qua `accessTokenFactory`; với WebSocket/SSE token đi ở query string `access_token` (đây là cơ chế chuẩn, không vi phạm quy tắc "không đưa token vào URL do frontend tự chế" vì SignalR yêu cầu vậy và kết nối chạy trên HTTPS/WSS). Backend cấu hình `JwtBearerEvents.OnMessageReceived` đọc `access_token` cho đúng path hub. Hub gắn `[Authorize]`; sau khi kết nối, join group `user:{userId}` và `session:{maPhien}` lấy từ claim đã verify — **không tin userId/maPhien do client gửi**. Access token vẫn ở localStorage (C.10 hoãn) nên chấp nhận được; khi C.10 làm sau, `accessTokenFactory` chỉ cần đọc từ memory state, không đổi kiến trúc hub.
>
> **Không phá `SystemConfigHub`:** tạo hub mới `SessionHub` riêng cho auth/session, giữ nguyên `SystemConfigHub` (maintenance/config). Tách event, tách group.

### Chặng G-1 — Backend foundation (cache + middleware + index + logout)

- [x] **G.1** Chuẩn hóa `ISessionStateCache` có Redis + memory fallback dev. _(`Services/Interface/ISessionStateCache.cs`, `Services/Implementation/SessionStateCache.cs` chạy trên `IDistributedCache`; DI trong `Program.cs`. Lỗi cache ném ra để middleware fail-closed.)_
- [x] **G.2** Middleware đọc cache; DB chỉ khi cache miss; bỏ fail-open (DB/Redis lỗi → fail closed cho endpoint bảo vệ, trả `503 AUTH_STATE_UNAVAILABLE`). _(`Helpers/SessionCheckMiddleware.cs`: hot-path đọc cache, cache miss mới `AsNoTracking` DB rồi populate; catch lỗi → 503 `AUTH_STATE_UNAVAILABLE`, không mặc định active.)_
- [x] **G.3** Thêm index hot path cho session theo `MaPhien`, `(MaNguoiDung, DangHoatDong)`, `(MaNguoiDung, MaThietBi)` — chỉ tạo file migration + provision idempotent qua `DatabaseSchemaSync`, không tự apply production. _(`DatabaseSchemaSync` tạo `IX_PhienDangNhap_MaNguoiDung_DangHoatDong` + `IX_PhienDangNhap_MaNguoiDung_MaThietBi` bằng `CREATE INDEX IF NOT EXISTS`; `MaPhien` đã là PK.)_
- [x] **G.4** Logout current lấy `MaPhien` từ JWT, revoke DB + refresh token + cache. _(`XacThucService.DangXuatAsync`: `LayMaPhienTuJwt()` là căn cứ chính; revoke phiên + refresh token, commit → `InvalidateSessionAsync` → publish `SessionRevoked`/`SessionListChanged`; clear cookie.)_
- [x] **G.5** Remote logout xác minh OTP/re-auth; validate session ownership. _(`XacThucService.XacNhanDangXuatTuXaAsync`: verify OTP; query filter `MaNguoiDung == userId` chống IDOR; revoke session + refresh token; invalidate cache + publish sau commit.)_
- [x] **G.6** “Logout all others” giữ session hiện tại. _(Nhánh `DangXuatTatCa` loại trừ `MaPhien` hiện tại lấy từ JWT đã verify.)_

### Chặng G-2 — SignalR realtime (backend hub + publish + frontend connect)

- [x] **G.7** Tạo SignalR `SessionHub` riêng (`Hubs/SessionHub.cs`, `[Authorize]`); authorize connection bằng JWT (`accessTokenFactory` phía FE + `OnMessageReceived` đọc `access_token` cho path `/sessionHub` phía BE); giữ nguyên `SystemConfigHub`. Join group `user:{userId}`/`session:{maPhien}` từ claim đã verify.
- [x] **G.8** `ISessionRealtimeNotifier`/`SessionRealtimeNotifier` publish `SessionRevoked`, `UserLocked`, `SessionListChanged` theo group; gọi SAU commit DB + invalidate cache trong `DangXuatAsync`/`XacNhanDangXuatTuXaAsync`.
- [x] **G.9** Frontend `configs/sessionHub.ts` kết nối/reconnect + logout UI khi nhận event; khởi động trong `App.tsx`. _(Polling cũ giữ tạm, bỏ ở G-3.)_
- [x] **G.12** Reconnect gọi sync endpoint (`GET /api/XacThuc/session-state`) một lần trong `onreconnected`, không polling.

### Chặng G-3 — Bỏ polling + throttle activity + test

- [x] **G.10** Bỏ polling thiết bị trong `App.tsx` (interval `getDevices` 10 giây đã gỡ; chỉ còn SignalR).
- [x] **G.11** Bỏ polling ban status 10 giây trong layout; dựa vào middleware + SignalR (event `UserLocked`).
- [x] **G.13** Throttle activity write. _(Thực trạng sau khi viết lại middleware G.2: `ThoiGianHoatDongCuoi` chỉ được ghi lúc login, KHÔNG ghi mỗi request; middleware hot-path chỉ đọc `AsNoTracking`, không `SaveChanges`. Vì vậy không còn activity write nào trên hot path để phải throttle — không thêm worker/batch flush để tránh mở rộng phạm vi/YAGNI.)_
- [x] **G.14** Trang quản lý thiết bị chỉ fetch khi mở + khi nhận event `SessionListChanged` (SignalR dispatch), bỏ polling.
- [x] **G.15** Test đơn vị: `SessionStateCache` round-trip, middleware fail-closed 503 khi cache lỗi, cache-hit quyết định 401 khóa/inactive/pass (không chạm DB). _(`educodeai-server.Tests/Security/PhaseGSessionTests.cs`: 7 test pass — cache round-trip + invalidate, anonymous pass-through, fail-closed 503, cache-hit quyết định 401 banned/inactive/pass mà không chạm DB. Các kịch bản tích hợp multi-tab/reconnect/multi-instance/Redis-DB down cần môi trường chạy thật — để lại cho Chặng K E2E/integration.)_

## Giai đoạn H — Quản lý người dùng Admin

- [ ] **H.1** Audit tất cả endpoint khóa/mở khóa/sửa role/xóa user; bắt buộc Admin policy.
- [ ] **H.2** Chống mass assignment: DTO chỉ chứa field được phép sửa.
- [ ] **H.3** Khóa user transactionally revoke sessions/tokens.
- [ ] **H.4** Invalidate distributed cache và push `UserLocked` sau commit.
- [ ] **H.5** Không cho Admin tự vô hiệu hóa Admin cuối cùng hoặc tự hạ quyền ngoài policy.
- [ ] **H.6** Audit actor admin, target user, reason, before/after, IP, timestamp.
- [ ] **H.7** Pagination/filter server-side; không trả password hash/token/PII không cần thiết.

## Giai đoạn I — Đăng ký và duyệt giảng viên

- [ ] **I.1** OTP email giảng viên dùng OTP service chung.
- [ ] **I.2** Normalize/unique email, username, tax/identity fields theo policy.
- [ ] **I.3** Validate avatar: max 5MB, allowlist MIME + magic bytes, filename do server tạo, chống path traversal.
- [ ] **I.4** **Không lưu ảnh giấy tờ tùy thân**; OCR trong RAM, mã hóa text cần thiết, dispose buffer/stream sau request.
- [ ] **I.5** Không log OCR text/số giấy tờ/plain encrypted payload.
- [ ] **I.6** Endpoint duyệt/từ chối/bổ sung hồ sơ dùng Admin policy và chống IDOR.
- [ ] **I.7** Duyệt hồ sơ + tạo/cập nhật user role trong transaction, idempotent chống double-submit.
- [ ] **I.8** Token bổ sung hồ sơ có TTL, single-use, scope đúng hồ sơ; không để trong log nếu truyền URL — ưu tiên body/header/cookie phù hợp.
- [ ] **I.9** Audit submitted/updated/approved/rejected với actor/reason.
- [ ] **I.10** Response Admin không trả dữ liệu nhạy cảm vượt nhu cầu xét duyệt.

## Giai đoạn J — Authorization và maintenance

- [x] **J.1** Authentication trước maintenance/session/authorization đúng thứ tự.
- [x] **J.2** Maintenance bypass chỉ authenticated Admin; bỏ header/path bypass client-controlled.
- [x] **J.3** Kiểm từng endpoint có `[AllowAnonymous]`, `[Authorize]`, role/policy đúng. _(Đã quét toàn bộ 47 controller. Khóa `CauHinhHeThongController` (`[Authorize(Roles="Admin")]`, `[AllowAnonymous]` cho `lay-cau-hinh`/`check-bao-tri`) và vá 2 lỗ CRITICAL đang public toàn bộ trong phạm vi quản lý user: `QuanLyNguoiDungController` và `QuanLyHocVienController` (`api/admin/hoc-vien`) → `[Authorize(Roles="Admin")]`. Các controller không có attribute còn lại đều ngoài phạm vi (khóa học/thanh toán/AI) hoặc là stub test (`ValuesController`, `TestPdfController`). Mismatch check-email enumeration/teacher status thuộc D/F.)_
- [x] **J.4** Không dựa vào route frontend để bảo vệ API.
- [x] **J.5** Stable response `401/403/503`, frontend xử lý theo `error.code`.

## Giai đoạn K — Audit log, test và CI

- [ ] **K.1** Audit events: login success/fail, register, OTP lockout, refresh rotate/reuse, logout, remote logout, password change/reset, user lock/unlock, teacher approve/reject.
- [ ] **K.2** Audit log không chứa secret/OTP/token/password/CCCD plain text.
- [ ] **K.3** Unit tests token/OTP/password/session cache.
- [ ] **K.4** Integration tests auth endpoints, cookie flags, rotation/reuse, session revoke, authorization.
- [ ] **K.5** Frontend tests: không token storage/query, refresh queue một lần, SignalR revoke handling.
- [ ] **K.6** E2E: đăng ký/login/forgot/device logout/admin lock/teacher approval.
- [ ] **K.7** CI build/test backend + frontend trong phạm vi.
- [ ] **K.8** Secret scan để phát hiện token/key/log pattern mới; không tự sửa các cấu hình API ngoài phạm vi.

---

## 5. TIÊU CHÍ NGHIỆM THU BẮT BUỘC

### Token/F12

- Refresh token không xuất hiện trong localStorage/sessionStorage/IndexedDB/URL/JSON response.
- Cookie refresh có `HttpOnly`, `Secure`, `SameSite`, path đúng.
- Không log JWT key/access token/refresh token/OTP/password.
- Access token TTL tối đa 15 phút và mọi token có `MaPhien`.

### Session/device realtime

- Không còn interval 10 giây gọi API check session/ban/device toàn cục.
- Khi remote logout/ban user, browser online nhận event và thoát trong mục tiêu ≤ 2 giây.
- Request tiếp theo bị backend từ chối ngay nhờ cache invalidation, không phụ thuộc UI/event.
- Cache hit không query DB.
- Mất SignalR rồi reconnect đồng bộ đúng bằng một request.
- DB/Redis lỗi không tự cho session chưa xác minh đi qua endpoint bảo vệ.

### Registration/password

- OTP CSPRNG, hash, max 5 attempts, TTL 5 phút, single-use, rate-limit.
- Forgot password không lộ email.
- Reset password revoke mọi phiên và không auto-login.
- Password mới không trùng cũ và đạt policy.

### Social login

- Email client giả + provider token không hợp lệ phải bị từ chối.
- Backend chỉ dùng identity đã verify từ Google/Facebook.

### User/teacher administration

- Non-admin nhận 403 khi gọi quản lý/duyệt.
- Ban user revoke toàn bộ session/token và push event.
- Không lưu ảnh CCCD; chỉ dữ liệu OCR cần thiết được mã hóa.
- Duyệt/từ chối có audit actor/reason/time.

---

## 6. THỨ TỰ TRIỂN KHAI KHUYẾN NGHỊ

1. A — Baseline tests và inventory quyền.
2. B — Chặn log/lộ token và exception.
3. J — Sửa authorization/maintenance blocker.
4. C — JWT + refresh cookie/hash/rotation.
5. G — Session cache + SignalR, bỏ polling DB.
6. D — OTP/CAPTCHA/đăng ký.
7. F — Forgot/reset/change password.
8. E — Login/social login.
9. H — Quản lý người dùng Admin.
10. I — Đăng ký/duyệt giảng viên.
11. K — Hoàn thiện audit/E2E/CI.

Không triển khai sang thanh toán, Gemini/API key, nghiệp vụ khóa học hoặc refactor cấu trúc dự án.

---

## 7. QUYẾT ĐỊNH THIẾT KẾ CẦN GIỮ

- Database là nguồn sự thật; Redis là cache/invalidation, không phải nguồn dữ liệu duy nhất.
- SignalR phục vụ realtime UX; middleware/cache vẫn là enforcement backend.
- Session/token do server phát; fingerprint client không phải credential.
- Không lưu ảnh giấy tờ tùy thân.
- Không dùng polling DB để mô phỏng realtime.
- Không mở rộng phạm vi sang cấu trúc dự án, payment hoặc Gemini.
