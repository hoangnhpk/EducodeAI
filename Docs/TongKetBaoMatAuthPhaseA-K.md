# TỔNG KẾT THAY ĐỔI BẢO MẬT AUTH PHASE A–K VÀ HƯỚNG DẪN ĐỒNG BỘ MODULE

> **Ngày lập:** 2026-07-29  
> **Tài liệu nguồn:** `Docs/ToiUuBaoMat.md`, `Docs/BaselineBaoMatXacThuc.md` và code hiện tại trên nhánh đang làm việc.  
> **Mục đích:** mô tả hệ thống trước/sau khi hoàn thành Phase A–K, vấn đề đã khắc phục, ảnh hưởng xuyên module và yêu cầu dành cho code mới.  
> **Lưu ý:** tài liệu này không thay thế kết quả smoke test trên môi trường thật. Các mục integration Postgres/Redis và browser E2E vẫn là khoảng trống đã ghi nhận ở Phase K.

---

## 1. Tóm tắt kiến trúc auth mới

Sau Phase A–K, quyền truy cập không còn dựa chủ yếu vào token dài hạn do frontend giữ. Chuỗi xác thực chuẩn hiện nay là:

1. Login/register/reset/social login hợp lệ tạo một `PhienDangNhap` phía server.
2. `ITokenService` phát access token ngắn hạn, có user ID, role, `MaPhien`, `jti`, `iat`.
3. Access token chỉ tồn tại trong bộ nhớ runtime frontend.
4. Refresh token ngẫu nhiên 256-bit chỉ nằm trong cookie `HttpOnly`; database chỉ lưu hash.
5. Khi reload trang, `authBootstrap.ts` gọi refresh một lần để khôi phục access token runtime.
6. Axios tự gắn Bearer token và dùng cơ chế single-flight khi nhiều request cùng gặp `401`.
7. `SessionCheckMiddleware` xác minh trạng thái user/session qua cache và database; backend mới là nguồn quyết định cuối cùng.
8. Logout, đổi/reset mật khẩu, khóa user hoặc remote logout thu hồi phiên/token, invalidate cache và phát SignalR để giao diện phản ứng gần realtime.

### Nguồn sự thật sau thay đổi

| Thành phần | Vai trò |
|---|---|
| Database | Nguồn sự thật của user, session và refresh-token hash |
| Redis/distributed cache | Tăng tốc kiểm tra và phân phối trạng thái; không phải nguồn quyền duy nhất |
| JWT access token | Bằng chứng xác thực ngắn hạn, luôn gắn `MaPhien` |
| Refresh cookie | Dùng xin access token mới; JavaScript không đọc được |
| SignalR | Cập nhật UX realtime; không thay backend authorization |
| Frontend route/role | Điều hướng và hiển thị; không phải hàng rào bảo mật |

---

## 2. Thay đổi theo từng Phase

## Phase A — Baseline và test bảo vệ hành vi

### Trước đây

- Không có bản kiểm kê tập trung các endpoint public/authenticated/Admin.
- Không biết đầy đủ nơi phát, đọc, lưu và log token/OTP/password.
- Thiếu test bảo vệ các luồng auth quan trọng nên chỉnh sửa dễ tạo regression.

### Sau khi thực hiện

- Có inventory endpoint, authorization và nơi xử lý dữ liệu nhạy cảm.
- Có backend test project và frontend Vitest cho auth storage/Axios.
- Các luồng đăng ký, login, OTP thiết bị, password, quản lý session và hồ sơ giảng viên có baseline test.

### Khắc phục

- Giảm nguy cơ sửa auth làm hỏng luồng cũ mà không phát hiện.
- Tạo căn cứ đối chiếu code với tài liệu và quyền dự kiến.

### Ảnh hưởng module khác

- Module khác không đổi nghiệp vụ nhưng mọi endpoint mới phải xác định rõ public, authenticated hay role-specific.
- Khi module dùng auth thay đổi contract, phải bổ sung test trước khi sửa.

---

## Phase B — Chặn lộ token, secret và lỗi nội bộ

### Trước đây

- Có nguy cơ log JWT signing key, token, OTP hoặc dữ liệu nhạy cảm.
- Exception có thể trả thông tin nội bộ cho trình duyệt.
- Token/credential có thể xuất hiện trong URL hoặc storage và quan sát qua F12.

### Sau khi thực hiện

- Loại log bí mật trong phạm vi auth và dùng structured logging/redaction.
- Global exception middleware trả envelope và error code ổn định, không trả stack trace/exception nội bộ.
- Có kiểm tra Network/Application Storage cho token.

### Khắc phục

- Giảm nguy cơ chiếm tài khoản do token/secret rò qua log, browser history hoặc DevTools.
- Frontend có thể xử lý lỗi dựa trên `error.code`, không phụ thuộc chuỗi exception tùy ý.

### Ảnh hưởng module khác và việc cần đồng bộ

- Controller/service khác không được trả trực tiếp `ex.Message`, stack trace hoặc connection detail.
- Không log `Authorization`, cookie, token, OTP, password, signing key hoặc giấy tờ.
- Frontend module khác nên đọc error envelope chung; không giả định mọi lỗi chỉ có trường `message`.
- Các URL nghiệp vụ tuyệt đối không đưa credential vào query string.

---

## Phase C — JWT, refresh token và frontend runtime auth

### Trước đây

- JWT được phát từ nhiều nơi, TTL có thể tới 24 giờ và có token thiếu `MaPhien`.
- Refresh token entropy yếu/process-local, không hash/rotate đầy đủ.
- Refresh/access token từng được lưu trong browser storage hoặc truyền qua URL.
- Reload trang phụ thuộc token lưu bền ở frontend.

### Sau khi thực hiện

- `ITokenService` là đầu mối phát JWT, TTL tối đa khoảng 15 phút.
- JWT có các claim tương thích: `id`, `MaNguoiDung`, `NameIdentifier`, role, `MaPhien`, `jti`, `iat`.
- Refresh token CSPRNG 256-bit; database lưu SHA-256 hash, family, phiên, expiry, revoke và replacement.
- Refresh rotate mỗi lần dùng; reuse token cũ thu hồi family/session.
- Refresh endpoint chỉ đọc cookie `HttpOnly`, nhận `maThietBi` trong body, không nhận refresh token từ URL/body.
- Access token chỉ nằm trong runtime memory qua `authStorage.ts`.
- `authBootstrap.ts` khôi phục phiên sau reload bằng refresh cookie.
- Axios dùng single-flight refresh để tránh refresh storm.
- Origin/Referer được kiểm tra cho refresh cookie để giảm CSRF.

### Khắc phục

- XSS không còn lấy được token từ localStorage/sessionStorage.
- Token đánh cắp có thời gian sử dụng ngắn hơn.
- Logout/revoke có thể vô hiệu phiên thực sự, không chỉ xóa dữ liệu giao diện.
- Phát hiện replay/reuse refresh token.
- Hỗ trợ restart/multi-instance tốt hơn so với MemoryCache process-local.

### Ảnh hưởng module khác và việc cần đồng bộ

**Frontend:**

- Không được gọi `localStorage.getItem('user_token'|'token'|'refresh_token')`.
- API thông thường phải dùng Axios instance chung để interceptor tự gắn token.
- Nếu bắt buộc dùng `fetch`, WebSocket hoặc SDK ngoài Axios, lấy access token runtime qua `getAccessToken()` ngay trước request; không cache token trong component/module lâu dài.
- Không tự xây refresh logic ở từng module; để Axios/auth bootstrap quản lý.
- Không gọi API bảo vệ trước khi `App.tsx` hoàn tất bootstrap auth.
- `user_info` chỉ là metadata UI, không được dùng làm bằng chứng quyền.

**Backend:**

- Endpoint bảo vệ phải dùng `[Authorize]`/role policy và đọc user từ claim đã verify.
- Không tự phát JWT ngoài `ITokenService`.
- Nếu đọc user ID, phải giữ tương thích `id`, `MaNguoiDung`, `NameIdentifier` cho tới khi toàn dự án được chuẩn hóa.
- Không xóa hoặc đổi tên `MaPhien` vì middleware, logout và SignalR phụ thuộc claim này.
- Không nhận refresh token do client gửi trong DTO/query.

**Triển khai:**

- CORS phải cho phép đúng frontend origin và credentials.
- HTTPS production là bắt buộc để cookie `Secure` hoạt động đúng.
- Schema `RefreshToken` và index phải được provision theo quy trình được phê duyệt; không tự chạy migration production.

---

## Phase D — OTP, CAPTCHA và đăng ký

### Trước đây

- OTP có thể sinh bằng `Random`, lưu plaintext trong cache process-local.
- Policy TTL, số lần thử và single-use chưa thống nhất.
- CAPTCHA/rate limit không bao phủ đồng đều các endpoint công khai.
- Payload đăng ký có nguy cơ giữ mật khẩu rõ trong cache.
- Có cửa sổ race tạo tài khoản trùng.

### Sau khi thực hiện

- `IOtpService` dùng CSPRNG, lưu hash, constant-time comparison, TTL 5 phút, single-use và tối đa 5 lần sai.
- OTP/rate-limit dùng distributed cache với memory fallback development.
- Rate limit theo purpose + identifier chuẩn hóa + IP.
- CAPTCHA được kiểm tra server-side ở các luồng công khai liên quan.
- Email được `Trim().ToLowerInvariant()`.
- Payload đăng ký chỉ lưu password hash.
- Re-check và DB constraint/catch bảo vệ chống tạo trùng.

### Khắc phục

- Giảm khả năng dự đoán/brute-force OTP.
- Tránh OTP dùng lại hoặc kéo dài TTL qua các lần nhập sai.
- Không để plaintext password nằm trong cache.
- Hoạt động nhất quán hơn trên nhiều instance.

### Ảnh hưởng module khác và việc cần đồng bộ

- Module nào thêm OTP phải khai báo purpose và tái sử dụng `IOtpService`/`IOtpRateLimiter`; không tự dùng `Random`, GUID hay `IMemoryCache`.
- Endpoint phát OTP công khai phải có CAPTCHA và rate limit phía backend.
- Frontend phải gửi `captchaToken` theo DTO mới và hỗ trợ lỗi 429/invalid CAPTCHA.
- Identifier/email dùng làm cache key hoặc query phải normalize giống nhau.

---

## Phase E — Login và social login

### Trước đây

- Google/Facebook login có thể tin email/name/picture do frontend decode hoặc tự gửi.
- Login chủ yếu rate-limit theo IP, dễ credential stuffing nhắm một account.
- Message/timing có thể giúp dò tài khoản.
- Device fingerprint có nguy cơ bị hiểu nhầm là credential.

### Sau khi thực hiện

- Google frontend gửi raw ID token; backend xác minh chữ ký, issuer, audience, expiry và `email_verified`.
- Facebook frontend gửi access token; backend kiểm `debug_token`, app ID và lấy profile từ Graph API.
- Backend chỉ link/tạo account từ identity đã verify; role tạo mới luôn do backend quyết định.
- Rate limit login theo cả IP và normalized account.
- Sai username/password dùng message thống nhất và dummy hash giảm timing leak.
- Device ID chỉ là metadata UX; `MaPhien` server-side là căn cứ bảo mật.
- Đã sửa lỗi cấu hình Google do `Program.cs` nạp lại `appsettings.json` và ghi đè Client ID Development.

### Khắc phục

- Chặn giả mạo email/role bằng payload frontend.
- Chặn token Google phát cho ứng dụng khác.
- Giảm account enumeration và credential stuffing.
- Google Client ID Development được resolve đúng theo precedence chuẩn của ASP.NET Core.

### Ảnh hưởng module khác và việc cần đồng bộ

- Không module nào được decode provider token rồi tin payload đó như identity đã xác thực.
- Social provider credential phải gửi trong POST body, không ở URL/log.
- Provider Client ID/audience ở frontend, backend và Google/Facebook Console phải đồng bộ.
- Authorized JavaScript origins và backend CORS phải chứa đúng origin thực tế.
- Account tồn tại trong DB chưa đủ để login social: email trong provider token phải được verify và khớp logic link account.

---

## Phase F — Quên, reset và đổi mật khẩu

### Trước đây

- Forgot password có thể lộ email có tồn tại.
- Reset/đổi password chưa thu hồi đầy đủ token/session.
- Policy password rời rạc; đổi password có field OTP không cần thiết.
- Reset có thể auto-login trong khi phiên cũ chưa bị cắt triệt để.

### Sau khi thực hiện

- Forgot password luôn trả message generic.
- Password policy dùng chung: tối thiểu 8 ký tự, không chứa local-part email, không trùng mật khẩu cũ.
- Reset password thu hồi toàn bộ session/refresh token, xóa cookie và buộc login lại.
- Đổi password xác minh mật khẩu cũ, bỏ OTP, giữ phiên hiện tại nhưng thu hồi phiên khác.
- Revoke được phát qua cache + SignalR sau commit.

### Khắc phục

- Chống dò email.
- Token cũ không tiếp tục tồn tại sau reset.
- Giảm rủi ro tài khoản bị chiếm giữ trên thiết bị khác.

### Ảnh hưởng module khác và việc cần đồng bộ

- Frontend reset không được kỳ vọng nhận token và auto-login.
- DTO đổi password không còn `OtpCode`; mọi trang/client cũ phải bỏ field này.
- Module đổi thông tin credential khác trong tương lai phải xác định rõ policy revoke session.

---

## Phase G — Realtime session và quản lý thiết bị

### Trước đây

- Middleware có thể fail-open khi DB/cache lỗi.
- Frontend polling trạng thái user/device khoảng 10 giây, tạo tải DB và có độ trễ revoke.
- Logout/remote logout có thể chỉ dựa device ID hoặc cập nhật không đồng bộ cache.

### Sau khi thực hiện

- `ISessionStateCache` dùng distributed cache; DB là fallback khi cache miss.
- Nếu không xác minh được auth state, middleware fail-closed với `AUTH_STATE_UNAVAILABLE`.
- Logout lấy `MaPhien` từ JWT, thu hồi DB + refresh token + cache.
- `SessionHub` riêng có `[Authorize]`; group user/session lấy từ verified claims.
- SignalR phát `SessionRevoked`, `UserLocked`, `SessionListChanged`.
- Bỏ polling toàn cục; reconnect gọi sync endpoint một lần.
- Cache-hit không ghi activity hoặc query DB liên tục.

### Khắc phục

- Revoke/lock tác động gần realtime.
- Giảm tải DB và request nền.
- Không cho request đi qua khi auth infrastructure không xác minh được trạng thái.
- Chống IDOR trong remote logout qua ownership check.

### Ảnh hưởng module khác và việc cần đồng bộ

- Layout/header không được tạo interval riêng để kiểm tra ban/session/device.
- Trang quản lý thiết bị fetch khi mở và khi nhận event, không polling.
- Backend thay đổi trạng thái session/user phải theo thứ tự: cập nhật DB → commit → invalidate cache → publish SignalR.
- Module dùng SignalR phải lấy token runtime qua `accessTokenFactory`; không lưu token riêng.
- `access_token` query chỉ được chấp nhận cho path SignalR quy định và qua HTTPS/WSS.

---

## Phase H — Quản lý người dùng Admin

### Trước đây

- Có nguy cơ mass assignment role hoặc nâng quyền Admin.
- Khóa user có thể chưa revoke refresh token/phiên tức thời.
- Danh sách user thiếu pagination/filter server-side và có nguy cơ trả dữ liệu quá rộng.

### Sau khi thực hiện

- Controller quản lý user yêu cầu Admin.
- Chỉ cho role học viên/giảng viên trong API quản lý thông thường; không tạo/nâng Admin.
- Chặn sửa/vô hiệu hóa target Admin qua API này.
- Khóa user revoke token/session, invalidate cache và push realtime.
- Audit actor, target, action, reason, IP.
- Danh sách user phân trang/filter server-side, giới hạn page size và DTO tối thiểu.

### Khắc phục

- Chống privilege escalation và mass assignment.
- Khóa tài khoản có hiệu lực thực tế trên phiên đang mở.
- Giảm tải và giảm lộ dữ liệu danh sách.

### Ảnh hưởng module khác và việc cần đồng bộ

- Frontend Admin phải dùng response phân trang thay vì giả định API trả array đầy đủ.
- Module cập nhật role/user state không được nhận actor/role đáng tin từ frontend.
- Mọi thao tác khóa/xóa quyền phải đồng bộ cơ chế revoke/cache/SignalR, không chỉ update một cột DB.

---

## Phase I — Đăng ký và duyệt giảng viên

### Trước đây

- Frontend có thể là nơi duy nhất chặn submit khi email chưa verify.
- Race condition có thể tạo hồ sơ/tài khoản trùng.
- Upload ảnh có thể chỉ tin extension/Content-Type.
- Token bổ sung entropy thấp hoặc lưu plaintext.
- Response danh sách có thể lộ số giấy tờ đầy đủ.

### Sau khi thực hiện

- Backend bắt buộc cờ email đã verify.
- Unique partial indexes và xử lý `DbUpdateException` chống trùng/race.
- Avatar được kiểm magic bytes JPEG/PNG/WEBP, cùng allowlist/size/server filename.
- Duyệt hồ sơ dùng atomic claim trong transaction, tránh hai Admin tạo hai account.
- Token bổ sung 256-bit, DB lưu hash, constant-time verify, TTL/single-use/rate-limit.
- Audit approve/reject/supplement.
- Danh sách chỉ trả số giấy tờ đã mask; ảnh giấy tờ không lưu blob/disk/cloud.

### Khắc phục

- Chống bypass frontend, TOCTOU và file giả mạo.
- Giảm lộ PII và token bổ sung.
- Giữ tính nhất quán khi nhiều Admin xử lý đồng thời.

### Ảnh hưởng module khác và việc cần đồng bộ

- Frontend không được xem cờ local là bằng chứng email verified; backend luôn kiểm lại.
- Module upload ảnh nhạy cảm nên tái sử dụng pattern magic-byte + allowlist + size, không tin MIME client.
- Trang danh sách phải hiển thị giá trị masked; chỉ endpoint chi tiết Admin được phép nhận dữ liệu cần xét duyệt.
- Không thay đổi yêu cầu cấm lưu ảnh CCCD/CMND/Hộ chiếu.

---

## Phase J — Authorization và maintenance

### Trước đây

- Middleware order hoặc bypass maintenance do client điều khiển có thể làm sai quyền.
- Một số controller quản lý có nguy cơ public hoặc chỉ được che bằng frontend route.
- Response 401/403/503 chưa thống nhất.

### Sau khi thực hiện

- Thứ tự authentication → maintenance/session → authorization được chuẩn hóa.
- Maintenance bypass chỉ dành cho authenticated Admin.
- Các controller quản lý user/học viên trong phạm vi được khóa bằng role Admin.
- Backend authorization là enforcement; frontend route chỉ phục vụ UX.
- Error code 401/403/503 ổn định.

### Khắc phục

- Chặn bypass bằng header/path hoặc gọi thẳng API.
- Tránh nhầm authentication với authorization.

### Ảnh hưởng module khác và việc cần đồng bộ

- Mọi controller/module mới phải khai báo rõ `[AllowAnonymous]`, `[Authorize]` hoặc role.
- Không dựa vào việc ẩn nút/menu để bảo vệ dữ liệu.
- Role name phải giữ `Admin`, `GiangVien`, `HocVien` tương thích `ClaimTypes.Role`.
- Không tự thay middleware order khi thêm middleware mới.

---

## Phase K — Audit, test và CI

### Trước đây

- Audit event chưa bao phủ login fail/register/OTP lockout/refresh/logout.
- Thiếu test chi tiết token/password policy và CI auth thống nhất.
- Secret mới có thể được commit mà không có automated scan.

### Sau khi thực hiện

- Structured audit bổ sung login fail, register, OTP lockout, refresh rotate/reuse, logout và remote logout.
- Test token bảo đảm TTL/claims/role và refresh CSPRNG/hash.
- Test password policy, OTP, session middleware, auth storage và Axios.
- GitHub Actions build/test backend, chạy frontend auth tests và gitleaks.
- Regression test mới bảo vệ ASP.NET Core không nạp lại base settings làm ghi đè Google Client ID Development.

### Khắc phục

- Tăng khả năng điều tra sự kiện bảo mật mà không log credential.
- Ngăn regression auth và secret mới sớm hơn trong CI.

### Giới hạn còn lại

- Chưa có integration HTTP thật với Postgres/Redis trong CI.
- Chưa có browser E2E cho login/refresh/multi-tab/SignalR/provider OAuth.
- Frontend build gate đầy đủ chưa bật do lỗi TypeScript ngoài phạm vi auth.
- Chưa enforce coverage toàn dự án đạt 80%.
- Các warning/dependency advisory hiện hữu cần kế hoạch riêng, không nên trộn vào auth fix.

---

## 3. Ma trận ảnh hưởng đến các module

| Module | Ảnh hưởng từ auth mới | Có cần sửa ngay? | Quy tắc đồng bộ |
|---|---|---:|---|
| Auth frontend | Token chuyển sang memory, refresh bằng cookie/bootstrap | Đã sửa phần chính | Dùng `authStorage`, Axios chung; không dùng storage token |
| Header/layout/router | Không được polling ban/session; route không phải enforcement | Đã sửa phần chính | Nhận SignalR event, clear runtime auth, redirect |
| API client/service | 401 có refresh single-flight; error envelope ổn định | Kiểm tra client tự tạo | Ưu tiên Axios chung; không tự refresh |
| Học viên/course | Token storage cũ không còn hoạt động | Chỉ sửa nơi tự dùng token | Axios chung hoặc `getAccessToken()` ngay lúc gọi |
| Giảng viên/upload | JWT phải có role + `MaPhien`; session có thể bị revoke realtime | Kiểm tra client tự dùng fetch/SDK | Không cache token; backend giữ `[Authorize]` |
| Admin | Role backend quyết định; khóa user revoke toàn phiên; API user phân trang | UI danh sách đã cần contract mới | Không tin role từ `user_info`; xử lý 403/503 |
| Payment/SePay/voucher | Không đổi nghiệp vụ nhưng nhận JWT claim chuẩn mới | Không sửa nếu đang đọc claim tương thích | Không đổi extraction user ID; giữ `[Authorize]`/role hiện tại |
| AI/Gemini | Không đổi nghiệp vụ; request bảo vệ dùng runtime token | Chỉ sửa token consumer frontend nếu còn storage cũ | Không sửa key/AI logic |
| Course/exercise/certificate | Không đổi nghiệp vụ | Không sửa nếu Axios chung | Không dựa vào frontend role; backend authorize |
| SignalR | SessionHub dùng runtime token và verified groups | Đã sửa auth hub | HTTPS/WSS, reconnect sync một lần |
| Redis/cache | Auth fail-closed; cache không là nguồn duy nhất | Cần cấu hình vận hành | Theo dõi availability; không bypass khi lỗi |
| Database | Có RefreshToken/index/session constraints | Cần provision được phê duyệt | Không tự apply migration production |
| CI/deployment | Config precedence, CORS, cookie và secrets quan trọng hơn | Cần cấu hình từng môi trường | Env/User Secrets/secret manager; không hardcode secret |

---

## 4. Checklist rà soát các module còn lại

### 4.1. Frontend

Tìm và xử lý mọi code mới/cũ có các dấu hiệu:

- `localStorage.getItem('user_token')`, `'token'`, `'refresh_token'`.
- `sessionStorage` hoặc IndexedDB chứa token.
- Axios instance riêng không có interceptor auth chung.
- `fetch` gắn Bearer từ token được cache khi module load.
- Refresh token trong URL, params, DTO hoặc JSON response.
- Interval polling kiểm tra user bị khóa/session/device.
- Dùng `user_info.vaiTro` để quyết định rằng API được phép gọi.

Cách đúng:

- Dùng Axios ở `src/configs/axios.ts`.
- Nếu buộc dùng API ngoài Axios, gọi `getAccessToken()` ngay trước request.
- Đợi auth bootstrap hoàn tất trước khi render/start protected runtime services.
- Khi nhận 401/403/503, xử lý theo stable error code.
- Khi session bị revoke, clear runtime auth và metadata rồi điều hướng login.

### 4.2. Backend

Mỗi endpoint cần xác minh:

- Attribute public/authenticated/role đúng.
- User ID lấy từ verified claims, không từ body/query.
- Role không nhận từ frontend.
- Mọi access token do `ITokenService` phát và có `MaPhien`.
- Thay đổi trạng thái user/session có revoke refresh token, cache invalidation và realtime notification phù hợp.
- Không log request DTO nếu DTO có credential/PII.
- Không trả exception nội bộ.
- Query danh sách có pagination/bound hợp lý.

### 4.3. Hạ tầng và triển khai

- Cấu hình JWT, Google/Facebook, CAPTCHA và secret bằng environment variables/User Secrets/secret manager.
- Không nạp lại `appsettings.json` thủ công sau cấu hình environment-specific.
- Google frontend Client ID phải khớp backend audience.
- Google Authorized JavaScript origins và backend CORS phải khớp origin frontend thực tế.
- Production dùng HTTPS để refresh cookie `Secure` hoạt động.
- CORS credentialed request không được dùng wildcard origin.
- Redis outage phải được giám sát vì endpoint bảo vệ có thể trả 503 thay vì fail-open.
- Migration/schema auth chỉ triển khai theo quy trình được phê duyệt và có backup/rollback.

---

## 5. Contract tương thích bắt buộc không được phá

1. JWT tiếp tục có `id`, `MaNguoiDung` và `NameIdentifier` trong giai đoạn tương thích.
2. JWT bắt buộc có `MaPhien`; không phát token “ngoại lệ” thiếu session.
3. Role name giữ đúng `Admin`, `GiangVien`, `HocVien`.
4. Refresh token chỉ qua cookie `HttpOnly`; endpoint refresh nhận `{ maThietBi }` nhưng không nhận token plaintext.
5. Database là nguồn sự thật; Redis và SignalR không tự cấp quyền.
6. Device fingerprint không phải credential.
7. `user_info` không phải nguồn xác thực/authorization.
8. SignalR event phục vụ phản ứng nhanh; request tiếp theo vẫn phải bị middleware backend chặn.
9. Reset password không auto-login; đổi password chỉ giữ phiên hiện tại.
10. Social login chỉ link theo email đã được provider xác minh.

---

## 6. Những module không cần sửa nếu đã tuân thủ chuẩn

Một module không cần thay đổi chỉ vì Phase A–K nếu đồng thời đáp ứng:

- Gọi API bằng Axios instance chung.
- Không đọc/lưu token trong browser storage.
- Backend endpoint đã có `[Authorize]`/role đúng.
- User ID lấy từ claim server-side.
- Không tự phát/refresh JWT.
- Không polling session/user state.
- Không log credential hoặc trả exception nội bộ.

Điều này áp dụng cho payment, AI/Gemini, course, exercise, certificate và upload: không sửa nghiệp vụ của chúng; chỉ sửa adapter auth ở ranh giới nếu phát hiện chúng vi phạm các quy tắc trên.

---

## 7. Việc cần làm tiếp để hoàn thiện đồng bộ toàn hệ thống

### Ưu tiên cao

1. Chạy browser smoke test cho login thường, Google, Facebook, reload bootstrap, logout và reset password.
2. Chạy integration test với Postgres + Redis cho refresh rotation/reuse và fail-closed.
3. Chạy multi-tab test cho remote logout, user lock và SignalR reconnect.
4. Rà lại toàn bộ frontend để bảo đảm không còn token consumer dùng storage hoặc Axios riêng.
5. Rà lại toàn bộ controller ngoài phạm vi auth để bảo đảm `[Authorize]`/role đúng mà không thay nghiệp vụ.

### Ưu tiên vận hành

1. Rotate các credential từng xuất hiện trong file cấu hình/log/nội dung trao đổi và chuyển sang secret manager.
2. Khắc phục dependency advisory (đặc biệt cảnh báo MimeKit hiện hữu) trong task riêng có regression test.
3. Bật frontend build gate sau khi xử lý lỗi TypeScript ngoài phạm vi auth.
4. Bổ sung coverage report và threshold phù hợp.
5. Tách schema migration khỏi startup self-healing về lâu dài; không thay đổi database thật khi chưa phê duyệt.

---

## 8. Tiêu chí nghiệm thu khi module mới tích hợp auth

Một module mới chỉ được coi là đồng bộ khi:

- Không để access/refresh token trong browser storage hoặc URL.
- Dùng access token runtime và refresh cookie đúng contract.
- Backend tự xác thực user ID/role/session.
- Revoke user/session có hiệu lực ở request tiếp theo và cập nhật UI realtime khi online.
- Không fail-open khi không kiểm tra được auth state.
- Không log credential/PII nhạy cảm.
- Có test cho 401, 403, 503 và luồng thành công.
- Không làm thay đổi nghiệp vụ payment, AI/Gemini, course, exercise, certificate hay upload ngoài adapter auth cần thiết.

---

## 9. Kết luận

Phase A–K đã chuyển EduCodeAI từ mô hình token phía client tương đối rời rạc sang mô hình session-enforced phía server: JWT ngắn hạn gắn phiên, refresh cookie HttpOnly có rotation/reuse detection, OTP/CAPTCHA thống nhất, social token được backend xác minh, revoke realtime và authorization rõ ràng.

Ảnh hưởng lớn nhất tới module khác nằm ở **cách lấy token, cách xử lý 401/reload, cách đọc claim và cách phản ứng khi session bị thu hồi**. Các module nghiệp vụ không cần đổi logic domain. Chúng chỉ cần bảo đảm mọi điểm giao với auth đi qua adapter/middleware chung và không giữ lại các giả định cũ như token trong localStorage, role từ frontend hoặc polling trạng thái session.
