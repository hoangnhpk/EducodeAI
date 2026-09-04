# Kế hoạch triển khai khắc phục phiên đăng nhập và CAPTCHA Mobile

- **Ngày cập nhật:** 2026-09-04
- **Workspace đã kiểm tra:** nhánh `Au3`, commit `da8b33f820a7813cfc85e7aea8baf335d8777980`
- **Độ lệch tại thời điểm kiểm tra:** `HEAD` sau `origin/main` 2 commit; phải cập nhật nhánh và kiểm tra lại trước khi sửa mã.
- **Trạng thái tài liệu:** file đang untracked; đây là kế hoạch triển khai, không phải báo cáo hoàn thành.
- **Phạm vi:** API xác thực, web học viên/admin, phiên đăng nhập, reverse proxy, CAPTCHA Expo/Android, cấu hình build và triển khai.
- **Mục tiêu phiên:** access token vẫn ngắn hạn; refresh-token family tồn tại tối đa **72 giờ tuyệt đối** kể từ lần đăng nhập rõ ràng.

## 1. Phân biệt trạng thái hoàn thành

Kế hoạch sử dụng hai cổng nghiệm thu độc lập:

### 1.1 `CODE-COMPLETE`

Mã nguồn, migration, cấu hình mẫu và automated test đã được bổ sung; các lệnh build/test phù hợp với repository đều pass.

### 1.2 `PRODUCTION-VERIFIED`

Đã xác minh trên topology production thật và APK thật, bao gồm cookie qua proxy, domain reCAPTCHA, EAS environment và thiết bị Android. Test mock không được ghi nhận là bằng chứng production.

Không đánh dấu toàn bộ công việc là hoàn thành nếu mới đạt `CODE-COMPLETE`.

## 2. Hiện trạng đã đối chiếu với mã nguồn

### 2.1 Refresh sau F5/direct navigation

Web giữ access token trong memory tại `educodeai-client/src/utils/authStorage.ts`. F5 hoặc nhập URL trực tiếp tạo full-document navigation và xóa token trong RAM. `App.tsx` phải gọi bootstrap bằng refresh cookie trước khi render router.

Lỗi production đã xác nhận trong mã:

- `educodeai-server/Controllers/XacThucController.cs` dùng allowlist origin viết cứng;
- allowlist đó không có `https://educodeai.top`;
- `docker-compose.prod.yml` và `.env.production.example` lại cấu hình production origin là `https://educodeai.top`.

Vì vậy refresh hợp lệ từ production có thể bị chặn trước khi service xử lý cookie.

### 2.2 Cookie và reverse proxy

`RefreshCookiePolicy.cs` đã tồn tại nhưng `XacThucService.cs` vẫn tự quản lý tên cookie và `CookieOptions`, phụ thuộc `Request.IsHttps`. Chính sách tạo/xóa cookie chưa có một nguồn duy nhất.

Topology production hiện tại:

- chỉ frontend nginx được expose tại `127.0.0.1:${APP_PORT:-8082}`;
- nginx proxy `/api`, hubs và các đường dẫn backend;
- nginx chuyển `X-Forwarded-Proto` từ `$http_x_forwarded_proto`, nên tính đúng đắn phụ thuộc outer proxy (Caddy) cung cấp và làm sạch header.

Không được tự động đổi `SameSite=None` sang `Lax`/`Strict` trước khi kiểm tra OAuth và topology thật. `SameSite` phải cấu hình được; create/delete phải dùng cùng thuộc tính.

### 2.3 Lifetime hiện tại

`TokenService.cs` đang dùng:

- access token: 15 phút;
- refresh token: 14 ngày;
- mỗi lần rotate lại tính expiry từ thời điểm hiện tại.

Cơ chế này là sliding và có thể kéo dài vô hạn. Không sửa bằng JWT access token 3 ngày.

### 2.4 Web refresh coordination

Bootstrap và Axios interceptor hiện có hai cơ chế refresh/single-flight riêng. Chúng có thể đồng thời rotate một refresh cookie. Các lỗi timeout/network/5xx cũng chưa được phân biệt chắc chắn với lỗi phiên đã kết thúc.

Các invariant phải giữ:

- access token chỉ ở memory;
- response refresh cũ không được phục hồi phiên sau logout hoặc login tài khoản khác;
- nhiều request 401 chỉ tạo một refresh;
- lỗi tạm thời không bị diễn giải thành logout.

### 2.5 CAPTCHA Mobile và backend

Các lỗi đã xác nhận:

- Mobile release gọi helper có thể ném lỗi trước khi request auth tới backend;
- WebView CAPTCHA dùng inline HTML với origin giả `https://localhost`;
- `originWhitelist={['*']}` quá rộng;
- khi thiếu key, UI cho nhập token thủ công;
- runtime vẫn có đường `SKIP_CAPTCHA`;
- login, register và forgot-password chưa dùng CAPTCHA thật nhất quán;
- `DangNhapRequest.CaptchaToken` đang `[Required]`, mâu thuẫn với CAPTCHA login theo ngưỡng;
- `CaptchaService` cần `HttpClient` nhưng cách đăng ký DI hiện tại chưa phù hợp;
- secret và response token không được đặt trong query URL;
- `eas.json` chưa cấu hình CAPTCHA cho preview/production.

### 2.6 Điều chỉnh quan trọng so với kế hoạch cũ

1. Không giả định static HTML trong `public/` tự đọc được biến `VITE_*`. Phải có bước generate/substitute rõ ràng lúc build hoặc runtime config endpoint.
2. Không mặc định đổi cookie sang `SameSite=Lax/Strict`; dùng option có validation và chỉ đổi sau production verification.
3. Thời hạn tuyệt đối nên lưu trên **refresh-token family** (`AbsoluteExpiresAtUtc` của token đầu và copy khi rotate). Session hiện có thể được tái sử dụng theo thiết bị; chỉ lưu deadline trên session có nguy cơ kéo dài family cũ khi đăng nhập lại.
4. Production dùng PostgreSQL ngoài (Supabase); volume `postgres_data` trong compose hiện không được dùng. Chỉ xóa sau khi xác nhận không có tooling vận hành phụ thuộc.
5. Lệnh test phải lấy từ `package.json`: web dùng `vitest run` qua `npm run test`; Mobile dùng Jest qua `npm run test`.

## 3. Contract đích

### 3.1 Web authentication

```text
Login thành công
  -> access token 15 phút trong memory
  -> refresh token plain trong cookie HttpOnly
  -> hash + family deadline trong DB

F5/direct navigation
  -> App giữ trạng thái auth-loading
  -> shared refreshSession() dùng cookie
  -> rotate refresh token một lần
  -> cập nhật access token/user/hub
  -> render route hiện tại

Nhiều request 401
  -> cùng chờ một refresh promise
  -> replay sau khi có token mới

Terminal refresh failure
  -> xóa auth state, thông báo/redirect đúng một lần

Timeout/network/5xx
  -> trạng thái chưa xác định + nút thử lại
  -> không giả vờ logout và không render dữ liệu bảo vệ
```

### 3.2 Phiên 72 giờ

- `Authentication:AccessTokenMinutes = 15`.
- `Authentication:SessionAbsoluteLifetimeHours = 72`.
- Login rõ ràng tạo một refresh family mới và deadline `now + 72h`.
- Mọi replacement token giữ nguyên `AbsoluteExpiresAtUtc`.
- Nếu vẫn giữ rolling window ngắn hơn, expiry mới là `min(now + rollingWindow, AbsoluteExpiresAtUtc)`.
- Login lại trên cùng thiết bị phải tạo family mới và revoke family cũ của session đó.
- Logout, remote logout, khóa tài khoản, đổi mật khẩu và reuse detection vẫn revoke ngay.

### 3.3 CAPTCHA contract

- Login lần đầu được phép omit/null `captchaToken`.
- Khi vượt ngưỡng, backend trả discriminator ổn định, ví dụ `requiresCaptcha: true` và/hoặc `nextStep: "CAPTCHA_REQUIRED"`.
- Khi CAPTCHA bắt buộc, backend từ chối token rỗng, `SKIP_CAPTCHA`, invalid hoặc expired.
- Register và bước gửi OTP quên mật khẩu tiếp tục yêu cầu CAPTCHA thật.
- Client không phân tích chuỗi thông báo tiếng Việt để quyết định flow.

## 4. Trình tự triển khai phụ thuộc

## Giai đoạn A — Cập nhật baseline

1. Lưu/commit tài liệu hoặc giữ bản sao an toàn.
2. Cập nhật nhánh từ `origin/main` theo workflow Git của nhóm.
3. Kiểm tra lại các file và chạy baseline build/test.
4. Không trộn thay đổi không liên quan đang có trong workspace.

**Gate:** ghi lại commit triển khai thực tế và baseline failures có sẵn trước khi sửa.

## Giai đoạn B — Origin, cookie và proxy (P0)

### Backend

1. Tạo `IRefreshRequestOriginPolicy` và `RefreshRequestOriginPolicy` trong vùng security services.
2. Dùng cùng nguồn `Cors:AllowedOrigins`; không duy trì allowlist thứ hai trong controller.
3. Parse origin bằng `Uri`:
   - chỉ `http`/`https`;
   - không userinfo/path/query/fragment/wildcard;
   - chuẩn hóa scheme, host và effective port;
   - so sánh authority chính xác, không `StartsWith`.
4. Ưu tiên `Origin`; chỉ fallback sang origin được parse từ `Referer` khi thiếu `Origin`.
5. Thiếu cả hai header phải fail-closed cho browser cookie refresh.
6. Inject policy vào `XacThucController` và xóa `IsSameSiteRequest()` viết cứng.
7. Policy phải từ chối request trước khi gọi service.

### Cookie

1. Bind và validate `RefreshCookieOptions` trong `Program.cs`.
2. Inject một `RefreshCookiePolicy` vào `XacThucService`.
3. Mọi thao tác read/append/delete dùng policy này; xóa hằng tên cookie và `CookieOptions` trùng lặp.
4. Production bắt buộc `HttpOnly`, `Secure`, `IsEssential`, path nhất quán.
5. `SameSite` cấu hình được:
   - giữ `None; Secure` làm tương thích ban đầu;
   - chỉ chuyển `Lax` khi xác nhận frontend/API cùng site và OAuth không hỏng;
   - không dùng `Strict` nếu chưa có bằng chứng đầy đủ.
6. Không đặt `Domain` nếu host-only cookie đủ dùng.
7. Delete options phải khớp Name/Path/Domain/SameSite/Secure với create options.

### Proxy

1. Giữ `UseForwardedHeaders()` trước HTTPS redirection/auth/cookie creation.
2. Xác minh Caddy làm sạch và cấp `X-Forwarded-Proto=https`.
3. Nếu Caddy không bảo đảm contract đó, nginx phải chuẩn hóa từ ingress tin cậy thay vì chuyển tiếp input tùy ý của client.
4. Giới hạn known proxies/networks khi địa chỉ production ổn định.
5. Chỉ log TraceId, origin chuẩn hóa, scheme/host, có/không có cookie và mã kết quả; không log giá trị token.

### Test bắt buộc

- cho phép đúng `https://educodeai.top`;
- từ chối `https://educodeai.top.attacker.example`;
- từ chối sai scheme/port và header malformed;
- Referer hợp lệ hoạt động khi Origin vắng;
- thiếu cả hai bị từ chối;
- controller không gọi service khi policy từ chối;
- production cookie luôn Secure dù Kestrel nhận HTTP nội bộ;
- development HTTP chỉ insecure khi option cho phép;
- create/delete có thuộc tính tương ứng.

**Gate:** deploy riêng foundation này và xác minh F5/refresh production trước khi đổi lifetime.

## Giai đoạn C — Shared web refresh (P1)

1. Tạo module `refreshSession()` dùng chung cho `authBootstrap.ts` và `axios.ts`.
2. Module sở hữu đúng một in-flight promise và outcome có kiểu:
   - `success`;
   - `terminal-failure`;
   - `transient-failure`.
3. Validate response schema và token không rỗng.
4. Bảo toàn auth generation/epoch để stale response không phục hồi phiên cũ.
5. Sau thành công:
   - cập nhật access token trong memory;
   - cập nhật `user_info` nếu response có dữ liệu server hợp lệ;
   - reconnect/restart SessionHub để token mới có hiệu lực ngay.
6. Bootstrap giữ App ở auth-loading cho tới kết quả xác định.
7. Timeout/network/5xx hiển thị màn phục hồi có nút retry; không xóa state như logout.
8. Chỉ terminal 401/session code mới xóa auth state, hiển thị một thông báo và redirect một lần.
9. Không refresh lại login/logout/refresh và các auth lifecycle request.
10. Route `/` không được xóa `user_info` của admin; `ProtectedRoute` chỉ kiểm tra quyền ở route bảo vệ.

### Test bắt buộc

- F5 giữ route học viên/admin;
- admin direct navigation về `/` vẫn giữ phiên;
- 5 request 401 chỉ tạo 1 refresh;
- request gốc được replay;
- logout/login race không bị stale response phục hồi;
- malformed refresh response fail-safe;
- 401 terminal logout, 503/timeout không logout;
- hub dùng token mới.

## Giai đoạn D — Refresh family tuyệt đối 72 giờ (P1)

1. Tạo authentication options có validation và dùng `TimeProvider`.
2. Thêm nullable `AbsoluteExpiresAtUtc` vào `RefreshTokenModel`.
3. Cập nhật EF mapping, snapshot và migration additive.
4. Login đặt family deadline một lần.
5. Rotate:
   - claim token cũ theo cơ chế concurrency hiện có;
   - từ chối nếu family deadline đã qua;
   - copy deadline không đổi sang replacement;
   - token expiry và cookie expiry không vượt deadline;
   - response có `tokenExpiresAt` nhất quán.
6. Revoke family cũ khi login rõ ràng lại trên cùng device session.
7. Token claim, replacement insert, session update và commit phải transactional; lỗi insert không được khiến người dùng hợp lệ chỉ còn token đã revoke.
8. Legacy rollout:
   - cột nullable trước;
   - backfill `min(existing expiry, deployTime + 72h)`;
   - không kéo dài/reactivate token expired hoặc revoked;
   - backend đọc được record cũ trong rolling deployment.
9. Retain record revoked/expired đủ cho audit/reuse detection rồi cleanup theo thời hạn cấu hình.

### Test bắt buộc

- access token vẫn khoảng 15 phút;
- deadline đúng 72 giờ UTC;
- rotate gần deadline không kéo dài;
- nhiều lần rotate giữ nguyên deadline;
- boundary và legacy row bằng fake `TimeProvider`;
- concurrent refresh chỉ một request thắng;
- reuse revoke cả family;
- login lại cùng thiết bị có family mới, family cũ bị revoke;
- logout/remote logout/password change/account lock vô hiệu hóa ngay.

## Giai đoạn E — Backend CAPTCHA (P0/P1)

1. Cho `DangNhapRequest.CaptchaToken` nullable.
2. Backend chỉ yêu cầu CAPTCHA login sau threshold và trả discriminator ổn định.
3. Đăng ký bằng `AddHttpClient<ICaptchaService, CaptchaService>()` với timeout ngắn.
4. Gửi `secret` và `response` trong form body tới `siteverify`, không đặt trong URL/query.
5. Bind/validate CAPTCHA options:
   - secret;
   - hostname allowlist;
   - timeout;
   - production fail-fast nếu thiếu hoặc còn placeholder.
6. Parse an toàn `success`, `hostname`, `challenge_ts`, `error-codes`.
7. Dùng result có kiểu để phân biệt invalid challenge và provider unavailable, nhưng response client không lộ chi tiết nội bộ.
8. Không bypass khi Google lỗi.
9. Không log secret, CAPTCHA token, credentials, OTP hoặc full provider body.

### Test bắt buộc

- success + allowed hostname được chấp nhận;
- `success=false`, hostname lạ, JSON malformed/missing bị từ chối;
- timeout/HTTP error fail closed;
- URL không chứa token/secret và body là form;
- logger không chứa dữ liệu nhạy cảm;
- Production thiếu config fail startup.

## Giai đoạn F — Hosted CAPTCHA page (P0)

Static asset không thể tự đọc `VITE_RECAPTCHA_SITE_KEY`. Dùng cơ chế cụ thể sau:

1. Tạo template nguồn và Node script trong `educodeai-client/scripts/`.
2. Script validate site key, escape an toàn và generate `public/mobile-captcha.html` trước `vite build`.
3. Cập nhật web build script để luôn chạy generator trước build production.
4. Trang chỉ chứa HTML/CSS/JS tối thiểu, không log token và gửi message versioned:

```json
{ "version": 1, "type": "ready" }
{ "version": 1, "type": "success", "token": "..." }
{ "version": 1, "type": "expired" }
{ "version": 1, "type": "error", "code": "WIDGET_LOAD_FAILED" }
```

5. Thêm exact nginx location `= /mobile-captcha.html`:
   - không SPA fallback;
   - `Cache-Control: no-store` hoặc cache ngắn có version;
   - `X-Content-Type-Options: nosniff`;
   - CSP chỉ cho các Google reCAPTCHA script/frame/connect/style origin cần thiết.
6. Trang phải backward-compatible hoặc versioned vì APK cũ có thể vẫn truy cập sau khi web deploy mới.

## Giai đoạn G — Mobile CAPTCHA và build config (P0/P1)

### Component

1. `captcha-input.tsx` tải `EXPO_PUBLIC_CAPTCHA_URL`, mặc định production là `https://educodeai.top/mobile-captcha.html`.
2. Chỉ cho HTTPS và allowed host; không inline HTML/base URL localhost.
3. Không dùng blanket `originWhitelist={['*']}` cho top-level navigation.
4. Parse JSON theo schema/version; từ chối malformed, type lạ hoặc token rỗng.
5. State machine: `loading | ready | solved | expired | error`.
6. Có load timeout, `onError`, `onHttpError`, navigation rejection và reset bằng challenge mới.
7. Xóa token sau submit attempt, expiry, error, reset và unmount.
8. Thiếu config phải vô hiệu hóa submit với lỗi an toàn; không hiện ô nhập token thủ công.
9. Không log message payload.

### Screens

- **Login:** request đầu omit/null CAPTCHA; chỉ hiện challenge khi backend trả discriminator; khi bắt buộc phải solved mới submit; reset token sau mọi response; giữ OTP/device replacement flow.
- **Register:** challenge thật ở bước nhập thông tin; không gọi API khi chưa solved; reset sau lỗi hoặc khi sửa thông tin.
- **Forgot password:** challenge chỉ ở bước gửi OTP email; reset sau mỗi lần gọi; không yêu cầu lại ở bước OTP/password nếu backend contract không yêu cầu.
- Xóa `getPublicAuthCaptchaToken()` và `SKIP_CAPTCHA` khỏi runtime/bundle release. Test bypass chỉ nằm ở fake backend/service test.

### Expo/EAS

1. Chuyển/delegate cấu hình sang `app.config.ts` để validate release config.
2. Fail build release nếu site key/URL thiếu, placeholder, URL không HTTPS hoặc host không được phép.
3. Giữ Android package `com.educodeai.educodeaimobile`.
4. Bind `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` và `EXPO_PUBLIC_CAPTCHA_URL` vào EAS preview/production environment.
5. Không dựa vào `.env` local bị gitignore khi EAS cloud build.

## 5. Công việc bên ngoài repository

Các bước sau không thể hoàn tất chỉ bằng sửa mã:

1. **Google reCAPTCHA Console**
   - xác nhận đúng loại/version key;
   - đăng ký `educodeai.top`;
   - xác minh `siteverify` trả hostname mà backend kiểm tra.
2. **EAS**
   - cấu hình site key và CAPTCHA URL cho preview/production;
   - build artifact bằng đúng environment.
3. **VPS/Caddy**
   - xác minh Origin/Referer/Host/X-Forwarded-Proto thật;
   - xác minh header được sanitize;
   - xác minh image/container chạy đúng commit.
4. **Android**
   - cài preview/release APK thật;
   - kiểm tra login theo threshold, register và forgot-password;
   - kiểm tra logcat không chứa token.
5. **Product/security decisions**
   - 72 giờ chính xác hay ba ngày lịch;
   - threshold CAPTCHA login;
   - thời gian retention token record;
   - SameSite cuối cùng sau khi test topology/OAuth;
   - UX khi Google không khả dụng (khuyến nghị fail closed + retry).

## 6. Lệnh kiểm tra đúng với repository

Từ repository root:

```bash
dotnet build EduCodeAI.sln
dotnet test educodeai-server.Tests/educodeai-server.Tests.csproj
npm --prefix educodeai-client run lint
npm --prefix educodeai-client run test
npm --prefix educodeai-client run build
npm --prefix educodeai-mobile run lint
npm --prefix educodeai-mobile run test -- --runInBand
npx --prefix educodeai-mobile tsc --noEmit
npx --prefix educodeai-mobile expo-doctor
docker compose --env-file .env.production.example -f docker-compose.prod.yml config
```

Lưu ý:

- web `test` đã là `vitest run`, không cần thêm `-- --run`;
- Mobile `test` là Jest;
- compose với file example chỉ kiểm tra cấu trúc; build/start production cần secret thật nhưng không được đưa secret vào command history/log;
- baseline failure có sẵn phải được ghi tách biệt với regression do thay đổi mới.

## 7. Rollout

1. Cập nhật nhánh và chạy baseline checks.
2. Deploy origin/cookie/proxy fixes, giữ lifetime cũ.
3. Xác minh F5 và automatic refresh production.
4. Deploy shared web refresh coordination.
5. Apply nullable migration và backend backward-compatible.
6. Backfill, theo dõi rồi bật policy 72 giờ.
7. Deploy hosted CAPTCHA page và kiểm tra HTTPS/CSP trực tiếp.
8. Deploy CAPTCHA backend contract/hardening tương thích client cũ nếu cần.
9. Build preview APK bằng EAS config thật, test thiết bị rồi mới release.
10. Theo dõi metric 24–48 giờ trước full rollout.
11. Chỉ xóa `postgres_data` sau khi xác nhận không có tooling sử dụng.

## 8. Metrics và logging an toàn

Theo dõi theo code/aggregate, không theo token hoặc email:

- refresh success;
- `ORIGIN_REJECTED`;
- `REFRESH_COOKIE_MISSING`;
- token expired/reused/session inactive/device mismatch;
- refresh queue depth;
- bootstrap terminal/transient failures;
- CAPTCHA load/success/expired/provider unavailable/invalid;
- frontend/mobile version.

Không log access token, refresh token, CAPTCHA token, OTP, password, secret hoặc full profile/provider response.

## 9. Tiêu chí nghiệm thu

### 9.1 `CODE-COMPLETE`

- Origin dùng config chung, so sánh chính xác và có hostile-origin tests.
- Một cookie policy quản lý read/create/delete, SameSite cấu hình được và có proxy tests.
- Bootstrap/interceptor dùng chung một refresh promise và phân loại transient/terminal.
- Access token ngắn hạn; refresh family không vượt 72 giờ dù rotate liên tục.
- Migration, legacy backfill, race/reuse và login lại cùng device được test.
- CAPTCHA backend dùng typed HttpClient, form body, hostname validation và fail-fast production config.
- Hosted page được generate bằng site key thật, có CSP/cache handling cụ thể.
- Mobile login/register/forgot-password dùng widget thật; không còn release bypass/manual token entry.
- Toàn bộ lệnh kiểm tra ở mục 6 pass hoặc baseline failure được chứng minh và ghi rõ.

### 9.2 `PRODUCTION-VERIFIED`

- Học viên, giảng viên và admin F5 route bảo vệ vẫn giữ phiên hợp lệ.
- Admin direct navigation về `/` vẫn đăng nhập và quay lại admin được.
- Access-token expiry tạo đúng một refresh, replay request mà không gián đoạn nhìn thấy được.
- Cookie qua proxy có đúng host/path/expiry/HttpOnly/Secure/SameSite.
- `https://educodeai.top` được chấp nhận và origin giả bị từ chối.
- Phiên dừng không muộn hơn deadline 72 giờ; revoke/logout/lock/password change/reuse có hiệu lực ngay.
- Hosted CAPTCHA load qua HTTPS với CSP/cache header đúng.
- APK thật giải CAPTCHA thành công ở login theo threshold, register và forgot-password.
- Không có token/secret trong URL, API/nginx logs, telemetry hoặc logcat.
- Metrics không cho thấy regression đáng kể trong 24–48 giờ.

## 10. Rollback

1. Origin/cookie changes dùng config hiện có và được deploy riêng để rollback độc lập.
2. Migration absolute expiry ở lần đầu phải additive/nullable.
3. Backend trong rolling deployment phải đọc được record cũ và mới.
4. Lifetime dùng config; rollback không được kéo dài token đã phát.
5. Web/backend phải giữ contract tương thích trong rollout.
6. Hosted CAPTCHA page phải versioned/backward-compatible.
7. Nếu Mobile CAPTCHA lỗi, dừng rollout Mobile; không bật bypass production.
8. Nếu refresh failure tăng, rollback cặp frontend/backend tương thích và giữ safe result-code logs để điều tra.

## 11. Thứ tự ưu tiên

- **P0:** production refresh origin/cookie/proxy và bằng chứng F5.
- **P0:** CAPTCHA HTTPS thật, loại bỏ Mobile bypass/manual fallback.
- **P1:** shared web refresh và transient-error recovery.
- **P1:** refresh family tuyệt đối 72 giờ, access token vẫn 15 phút.
- **P1:** harden backend CAPTCHA và EAS release validation.
- **P2:** telemetry, cleanup, retention và tài liệu vận hành.

Không tăng access JWT lên 3 ngày như bản vá nhanh. Sửa đúng refresh chain giải quyết đồng thời F5, direct navigation và access-token expiry mà vẫn bảo toàn khả năng revoke.

