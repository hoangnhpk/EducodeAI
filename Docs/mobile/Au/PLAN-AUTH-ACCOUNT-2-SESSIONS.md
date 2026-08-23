# Kế hoạch một phiên AI hoàn thiện Mobile Auth & Account end-to-end — Âu

> **Repository:** `D:\CaoDangFPT\DuAnTotNghiep\EducodeAI`
> **Tệp kế hoạch:** `D:\CaoDangFPT\DuAnTotNghiep\EducodeAI\Docs\mobile\Au\PLAN-AUTH-ACCOUNT-2-SESSIONS.md`
> **Branch làm việc:** `feature/mobile-au-complete`
> **Base SHA:** `8bd37ba`
> **Mô hình thực hiện:** Một AI coding session duy nhất, làm liên tục từ inspection đến implementation, validation và báo cáo cuối.
> **Điểm bắt đầu:** Session được mở trực tiếp tại repository chính sau khi branch trên đã được checkout. Không tạo worktree, branch phụ hoặc cơ chế bàn giao cho Integrator.
> **Trạng thái tài liệu:** Kế hoạch triển khai; không phải bằng chứng rằng mã nguồn hoặc acceptance path đã hoàn thành.

---

## 1. Mục tiêu và nguyên tắc thực thi

AI session phải tự chủ thực hiện tuần tự:

```text
Preflight
→ kiểm chứng contract
→ shared foundation
→ Auth core
→ Auth UI
→ Account core
→ Account UI
→ router integration
→ package/config
→ automated validation
→ API thật và Android verification
→ documentation
→ final audit
→ commit nếu được cho phép rõ ràng
→ final report
```

Quy tắc:

1. Đọc toàn bộ kế hoạch này trước khi sửa bất kỳ tệp nào.
2. Làm liên tục từ đầu đến cuối; không dừng để chờ Integrator hoặc bàn giao giữa Auth, Account và Router.
3. Dùng lựa chọn hợp lý, an toàn và nhất quán khi chi tiết không ảnh hưởng contract hoặc bảo mật.
4. Chỉ hỏi khi thực sự bị chặn bởi:
   - contract mâu thuẫn không thể tự kiểm chứng;
   - thiếu secret/provider/configuration bắt buộc;
   - thay đổi người dùng trong cùng vùng mã không thể tách an toàn;
   - thao tác cần quyền hoặc quyết định sản phẩm;
   - nguy cơ mất dữ liệu hay phá vỡ compatibility không có phương án an toàn.
5. Có thể sửa mọi tệp cần thiết thuộc Mobile Auth, Account, shared foundation, router, package/config và tests.
6. Không sửa module không liên quan, không format toàn repository và không sửa lỗi baseline ngoài phạm vi chỉ để tạo trạng thái xanh.
7. Bảo toàn mọi thay đổi có sẵn của người dùng, kể cả tracked, untracked hoặc staged changes.
8. Không dùng `git reset --hard`, `git clean`, `git restore`, stash tự động, rebase hoặc thao tác phá hủy.
9. Không commit, amend hoặc push trừ khi prompt hiện hành hoặc người dùng cho phép rõ ràng.
10. Không tuyên bố hoàn thành khi test, API thật hoặc Android verification chưa có bằng chứng tương ứng.

---

## 2. Kỷ luật bằng chứng: VERIFIED và VERIFY

### 2.1 Định nghĩa

- **VERIFIED:** Đã đối chiếu trực tiếp với checkout hiện tại, backend controller/DTO/service, tài liệu canonical, output test hoặc runtime evidence.
- **VERIFY:** Chưa có đủ bằng chứng để coi là sự thật.
- **BLOCKED:** Một mục `VERIFY` ngăn acceptance path hoặc Definition of Done và không thể tự giải quyết trong môi trường hiện có.
- **NOT RUN:** Kịch bản chưa được chạy; không được trình bày là pass.
- **BASELINE/UNRELATED:** Lỗi đã tồn tại ở base `8bd37ba` và ngoài phạm vi thay đổi.

### 2.2 Quy tắc sử dụng

- Không chuyển `VERIFY` thành `VERIFIED` dựa trên phỏng đoán.
- Không dùng mock để tuyên bố acceptance path với API thật đã hoàn thành.
- Một luồng chỉ được ghi `PASS` khi command hoặc runtime scenario tương ứng thực sự đã chạy.
- Nếu không có backend, OTP, CAPTCHA provider, emulator hoặc thiết bị, ghi chính xác `BLOCKED` hay `NOT RUN`.
- Báo cáo cuối phải liệt kê riêng:
  - `VERIFY` đã giải quyết và bằng chứng;
  - `VERIFY` còn mở;
  - blocker;
  - scenario chưa chạy.

---

## 3. Baseline, branch và bảo toàn thay đổi

### 3.1 Baseline được cung cấp

- Branch đích: `feature/mobile-au-complete`.
- Base SHA: `8bd37ba`.
- Session được mở trực tiếp trong repository chính sau khi chuyển sang branch đích.
- Không cần tạo branch hoặc worktree mới.
- Checkout thực tế vẫn là nguồn kiểm chứng cuối cùng. Nếu branch hoặc HEAD không khớp, dừng mutation và báo blocker thay vì tự reset hay đổi lịch sử.

### 3.2 Preflight bắt buộc

Chạy trước khi sửa mã:

```bash
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --short
git diff --name-only
git diff --cached --name-only
git log --oneline -10
```

Xác minh:

- [ ] Repository root là `D:\CaoDangFPT\DuAnTotNghiep\EducodeAI`.
- [ ] Branch là `feature/mobile-au-complete`.
- [ ] Baseline liên quan bắt đầu từ `8bd37ba`.
- [ ] Ghi lại toàn bộ tracked, untracked và staged user changes.
- [ ] Không khôi phục, xóa, sửa, stage hoặc commit thay đổi không thuộc session.
- [ ] Nếu `educodeai-mobile/expo-env.d.ts` đã có thay đổi hoặc bị xóa trước session, giữ nguyên trạng thái đó.
- [ ] Ghi manifest hiện tại của Auth, Account, Router, shared code, package/config và tests.
- [ ] Xác định implementation nào đã tồn tại; inspect và sửa tối thiểu, không viết trùng.
- [ ] Ghi baseline typecheck, lint và test.
- [ ] Xác định Axios trả `AxiosResponse` hay payload đã unwrap.
- [ ] Xác định storage keys/schema hiện tại.
- [ ] Xác định API base URL/configuration hiện tại.
- [ ] Xác định scripts và test infrastructure thực tế.
- [ ] Xác định `expo-image-picker` đã được cài và cấu hình hay chưa.

Không suy luận trạng thái checkout chỉ từ commit message.

### 3.3 Git safety

Trước và sau mỗi phase:

```bash
git status --short
git diff --name-only
git diff --check
```

Quy tắc:

- Không dùng `git add .` hoặc `git add -A` khi working tree có thay đổi người dùng.
- Nếu được phép commit, stage bằng danh sách path chính xác.
- Review cả:

```bash
git diff --cached --name-only
git diff --cached
```

- Không stage `educodeai-mobile/expo-env.d.ts` nếu đó là thay đổi có sẵn ngoài phạm vi.
- Không amend, rebase, reset hoặc push nếu chưa được yêu cầu rõ ràng.

---

## 4. Source of truth và đường dẫn phải inspect

### 4.1 Thứ tự ưu tiên

1. Backend controller, DTO và service hiện hành.
2. `Docs/mobile-hoc-vien/**` và ADR đã được chấp nhận.
3. Web service/page để tham chiếu contract và UX.
4. Mã mobile hiện có.
5. Commit cũ chỉ để tham khảo.

### 4.2 Tài liệu và backend

| Mục đích | Đường dẫn |
|---|---|
| Mobile overview | `Docs/mobile-hoc-vien/00-overview.md` |
| Inventory/API | `Docs/mobile-hoc-vien/01-inventory-va-api.md` |
| Auth/session | `Docs/mobile-hoc-vien/02-auth-va-session.md` |
| Phân công canonical | `Docs/mobile-hoc-vien/07-checklist-phan-cong.md` |
| Design system | `Docs/mobile-hoc-vien/08-design-system-va-ui-sync.md` |
| ADR native reuse | `Docs/mobile-hoc-vien/decisions/ADR-001-native-mobile-reuse-existing-contracts.md` |
| Auth specification | `Docs/LUONG-XAC-THUC-VA-QUAN-LY-NGUOI-DUNG.md` |
| Auth controller | `educodeai-server/Controllers/XacThucController.cs` |
| Auth DTOs | `educodeai-server/DTOs/XacThuc/**` |
| Auth behavior | `educodeai-server/Services/Implementation/XacThucService.cs` |
| Student profile controller | `educodeai-server/Controllers/HocVien/HoSoHocVienController.cs` |
| Profile DTO | `educodeai-server/DTOs/NguoiDung/HoSoHocVienDTO.cs` |
| Profile update DTO | `educodeai-server/DTOs/NguoiDung/UpdateHoSoHocVienDTO.cs` |

### 4.3 Web references

| Mục đích | Đường dẫn |
|---|---|
| Auth service | `educodeai-client/src/services/auth.service.ts` |
| Profile service | `educodeai-client/src/services/ho-so-hoc-vien.service.ts` |
| Login classifier | `educodeai-client/src/pages/auth/loginFlow.ts` |
| Login UI | `educodeai-client/src/pages/auth/DangNhap.tsx` |
| Registration UI | `educodeai-client/src/pages/auth/DangKy.tsx` |
| Forgot-password UI | `educodeai-client/src/pages/auth/QuenMatKhau.tsx` |
| Profile UI | `educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/ProfilePage.tsx` |
| Device UI | `educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/QuanLyThietBi.tsx` |

### 4.4 Mobile source

| Mục đích | Đường dẫn |
|---|---|
| Auth feature | `educodeai-mobile/src/features/auth/**` |
| Account feature | `educodeai-mobile/src/features/account/**` |
| Shared API | `educodeai-mobile/src/shared/configs/api.ts` |
| Shared code | `educodeai-mobile/src/shared/**` |
| Expo Router | `educodeai-mobile/src/app/**` |
| Dependencies/scripts | `educodeai-mobile/package.json` |
| Lockfile | `educodeai-mobile/package-lock.json` |
| TypeScript | `educodeai-mobile/tsconfig.json` |
| Expo config | `educodeai-mobile/app.json`, `educodeai-mobile/app.config.*` |
| Babel config | `educodeai-mobile/babel.config.*` |
| Jest config | `educodeai-mobile/jest.config.*` |

---

## 5. Phạm vi

### 5.1 Trong phạm vi

#### Auth

- Bootstrap và session state.
- Credentials login.
- Trusted-device login.
- New-device OTP.
- Three-device replacement OTP.
- CAPTCHA-required branch và provider integration.
- Student registration và OTP confirmation.
- Forgot password, OTP verification và reset.
- Logout.
- Role-rejected và session-expired state/UI.
- Student-only role enforcement.
- 401/revoke/role-change handling.

#### Account

- Account home.
- Profile fetch/update.
- Avatar picker/upload.
- Change password.
- Device/session list.
- Request và confirm remote logout OTP.
- Revoke selected session.
- Revoke all other sessions.
- Logout qua public Auth API.

#### Integration

- Shared API, storage, error, device, media và theme foundation.
- AuthProvider và unauthorized event.
- Bootstrap gate và route guard.
- Tabs/account routes.
- Package, lockfile, Expo/config và test configuration cần thiết.
- Automated tests.
- API thật và Android verification.
- Implementation documentation.

### 5.2 Ngoài phạm vi hoặc VERIFY

- Google/Facebook login: deferred nếu Product không mở lại phạm vi.
- Native refresh cookie: `VERIFY/BLOCKED` cho đến khi chứng minh backend hỗ trợ native flow.
- Instructor registration/CCCD: desktop-only.
- Admin/instructor mobile routes: ngoài phạm vi.
- Gift, certificate, commerce, learning, AI hoặc practical submission: module khác.
- Không tạo route `/tai-khoan`; destination canonical là `(tabs)/account`.
- Không thay đổi nội dung nghiệp vụ của `/phong-van-do-an` và `/thu-thach`; chỉ smoke-test regression.

---

## 6. Kiến trúc đóng băng

### 6.1 Nguyên tắc ranh giới

- Backend quyết định role, ownership, session và authorization.
- Client guard chỉ phục vụ UX.
- Auth authority là nơi duy nhất ghi hoặc xóa session.
- Account chỉ dùng public Auth API.
- Account không được:
  - import `AsyncStorage`;
  - đọc hoặc persist token;
  - import Auth reducer/context implementation internals;
  - tự xóa session;
  - duplicate logout/session cleanup.
- Chỉ có một Axios instance, một storage schema, một device metadata provider, một media URL normalizer, một unauthorized bridge và một AuthProvider.
- Axios interceptor không điều hướng.
- Interceptor chỉ phát unauthorized event đã deduplicate.
- AuthProvider nhận event, chuyển state và clear session đúng một lần.
- Mọi async session operation phải chống stale response bằng monotonic generation/epoch hoặc operation ID.
- Router chỉ đọc public Auth state.
- Không dựa vào `pathname.startsWith('/(auth)')`; route group không phải public pathname invariant.
- Không dùng `any` tại API boundary.
- Không log token, mật khẩu, OTP hoặc full profile.
- Không tạo adapter/handoff chỉ để chờ Integrator. Nếu abstraction phục vụ testability thật sự cần thiết, implement và wire hoàn chỉnh trong cùng session.

### 6.2 Public Auth contract

```ts
export type MobileRole = 0 | 1 | 2;

export interface AuthUser {
  id: string | number;
  maNguoiDung?: string | number;
  taiKhoan: string;
  hoTen: string;
  email: string;
  vaiTro: MobileRole;
  anhDaiDien?: string | null;
}

export type AuthStatus =
  | "bootstrapping"
  | "anonymous"
  | "authenticated"
  | "sessionExpired"
  | "roleRejected";

export type SessionEndReason =
  | "logout"
  | "unauthorized"
  | "revoked"
  | "role-change";

export interface AuthPublicApi {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout(): Promise<void>;
  clearSession(reason?: SessionEndReason): Promise<void>;
  updateUser(
    patch: Partial<Pick<AuthUser, "hoTen" | "anhDaiDien">>,
  ): Promise<void>;
}
```

Public imports phải khả dụng qua barrel:

```ts
import { useAuth } from "../features/auth";
import type {
  AuthPublicApi,
  AuthStatus,
  AuthUser,
} from "../features/auth";
```

Account sử dụng:

- `useAuth().logout()` cho local logout;
- `useAuth().clearSession(...)` khi current identity/session không còn hợp lệ;
- `useAuth().updateUser(...)` sau profile/avatar update thành công.

### 6.3 Session persistence

- Chỉ numeric role `2` được persist.
- Role `0`, `1`, malformed/tampered role hoặc malformed user bị loại trước persistence.
- Dùng một serialized, versioned session record thay vì token/user keys rời rạc.
- Runtime-validate dữ liệu hydrate.
- Malformed JSON/session/user trở về `anonymous`.
- Bootstrap, login, OTP, logout và clear phải dùng generation/operation ID để stale response không thể phục hồi hoặc xóa session mới hơn.
- `logout` luôn clear memory/local session dù API hoặc storage lỗi.
- `clearSession` idempotent.
- `updateUser` chỉ đổi `hoTen` và `anhDaiDien`; không đổi token, role hoặc identity.
- Nếu cần migration từ legacy storage, migration phải fail-safe và không làm mất dữ liệu ngoài session Auth.

### 6.4 Login classifier

Thứ tự bắt buộc:

1. `requiresOtp`
2. `requiresLogoutOldest`
3. `requiresCaptcha`
4. nonblank `token` cùng valid `user`
5. `invalid`

Phải có fixtures/tests cho response riêng lẻ, overlap và malformed response.

---

## 7. API contracts

Các contract dưới đây là baseline **VERIFIED theo đầu vào kế hoạch**, nhưng session vẫn phải đối chiếu backend hiện hành trước implementation. Nếu backend tại checkout khác, ghi bằng chứng và cập nhật implementation/tests/documentation nhất quán.

| Luồng | Method và endpoint | Payload/semantics |
|---|---|---|
| Login | `POST /api/XacThuc/dang-nhap` | `{ taiKhoan, matKhau, captchaToken, maThietBi, tenThietBi? }` |
| New-device OTP | `POST /api/XacThuc/xac-nhan-otp` | `{ taiKhoan, otpCode, maThietBi, tenThietBi? }` |
| Replacement OTP | `POST /api/XacThuc/xac-nhan-thay-the-thiet-bi` | Cùng shape OTP |
| Registration | `POST /api/XacThuc/dang-ky` | `{ hoTen, email, matKhau, captchaToken }` |
| Confirm registration | `POST /api/XacThuc/xac-minh-dang-ky` | `taiKhoan` là normalized email; xác minh exact DTO |
| Forgot password | `POST /api/XacThuc/quen-mat-khau` | `{ email, captchaToken? }` |
| Verify reset OTP | `POST /api/XacThuc/xac-minh-otp-quen-mat-khau` | `{ email, otpCode }` |
| Reset password | `POST /api/XacThuc/dat-lai-mat-khau` | Exact DTO phải đối chiếu; success không auto-login |
| Logout | `POST /api/XacThuc/dang-xuat` | Body là JSON primitive string `"device-id"`, không phải object |
| Change password | `POST /api/XacThuc/doi-mat-khau` | `{ MatKhauCu, MatKhauMoi }` |
| Profile | `GET /api/hoc-vien/ho-so` | Authenticated student |
| Update profile | `PUT /api/hoc-vien/ho-so` | Multipart `HoTen`, optional `AnhDaiDien` |
| Device list | `GET /api/XacThuc/danh-sach-thiet-bi?maThietBiHienTai=...` | Current device ID query |
| Request remote logout OTP | `POST /api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa` | Exact DTO phải đối chiếu |
| Confirm remote logout | `POST /api/XacThuc/xac-nhan-dang-xuat-tu-xa` | Exact DTO phải đối chiếu |

`dangXuatTatCa: true` nghĩa là **đăng xuất tất cả phiên khác**; không xóa current JWT session.

### VERIFY register ban đầu

- Axios mobile trả wrapped `AxiosResponse` hay đã unwrap `response.data`.
- API error shape và nested message behavior.
- Native device ID/name implementation.
- Native refresh do backend có thể yêu cầu HttpOnly cookie và Origin/Referer.
- CAPTCHA provider, site key và native flow.
- Production API URL và TLS.
- Avatar media URL normalization.
- `expo-image-picker` và Android/iOS permissions.
- Server-recognized mobile channel.
- Server-side student-only enforcement.
- DTO casing thực tế.
- Server-side avatar MIME/type/size hardening.

---

## 8. Pipeline triển khai một phiên

Không nhân đôi implementation đã có. Sau mỗi phase, chạy test/typecheck phù hợp, `git diff --check` và kiểm tra phạm vi thay đổi.

### Phase 0 — Preflight và đóng băng contract

- [ ] Chạy toàn bộ lệnh preflight.
- [ ] Xác nhận branch `feature/mobile-au-complete`.
- [ ] Xác nhận base `8bd37ba` hoặc báo mismatch.
- [ ] Ghi mọi user change có sẵn.
- [ ] Ghi baseline typecheck/lint/test.
- [ ] Lập manifest Auth, Account, Router, shared, package/config và tests.
- [ ] Đối chiếu backend controller/DTO/service.
- [ ] Chốt wrapped/unwrapped Axios behavior.
- [ ] Chốt API error shape.
- [ ] Chốt storage schema/version và generation policy.
- [ ] Chốt device metadata interface.
- [ ] Chốt route names.
- [ ] Tạo login classifier fixtures.
- [ ] Phân loại từng `VERIFY`: resolved, deferred hoặc blocked.

**Gate:** Branch/base/status đã ghi; contract chính đủ rõ; không mất user changes.

---

### Phase 1 — Shared foundation

Inspect và tạo/chuẩn hóa tối thiểu khi cần:

```text
educodeai-mobile/src/shared/configs/api.ts
educodeai-mobile/src/shared/constants/storage-keys.ts
educodeai-mobile/src/shared/lib/auth-storage.ts
educodeai-mobile/src/shared/lib/api-error.ts
educodeai-mobile/src/shared/lib/media-url.ts
educodeai-mobile/src/shared/lib/device-metadata.ts
educodeai-mobile/src/shared/theme/tokens.ts
educodeai-mobile/src/shared/types/api-error.ts
educodeai-mobile/src/shared/types/auth-public.ts
```

Checklist:

- [ ] Một Axios instance duy nhất.
- [ ] Response behavior rõ ràng và có tests.
- [ ] API base URL đến từ environment/config phù hợp.
- [ ] Không hard-code LAN/plain HTTP trong release.
- [ ] Typed error normalization giữ status và backend message.
- [ ] 401 event deduplicated; interceptor không redirect.
- [ ] 403 không tự động thành token expiry.
- [ ] Login/register/OTP business errors không phát session-expired.
- [ ] Auth authority thực hiện clear-on-401.
- [ ] Versioned serialized storage record được runtime-validate.
- [ ] Legacy/malformed record được xử lý an toàn.
- [ ] Device metadata có stable device ID và optional name.
- [ ] Media URL normalization có contract rõ.
- [ ] Theme/tokens bám design system hiện có.
- [ ] Không sensitive logging.
- [ ] Không duplicate helper.

**Gate:** Shared code strict-typecheck được và foundation tests đạt.

---

### Phase 2 — Auth core

Phạm vi:

```text
educodeai-mobile/src/features/auth/**
```

#### Domain và public boundary

- [ ] Chuẩn hóa `src/features/auth/index.ts`.
- [ ] Implement đúng `MobileRole`, `AuthUser`, `AuthStatus`, `SessionEndReason`, `AuthPublicApi`.
- [ ] Runtime guards cho user, session và login response.
- [ ] Chỉ export public surface; không expose reducer/storage internals.
- [ ] Không dùng `any` tại API boundary.

#### Services và classifier

- [ ] Dùng shared Axios.
- [ ] Implement đúng endpoint/payload đã kiểm chứng.
- [ ] Classifier đúng precedence.
- [ ] Login truyền CAPTCHA token theo contract thực tế.
- [ ] Initial registration không gửi `taiKhoan` nếu DTO không có.
- [ ] Registration OTP dùng normalized email trong `taiKhoan`.
- [ ] Reset password dùng exact DTO.
- [ ] Reset success không auto-login.
- [ ] Logout gửi JSON primitive string.
- [ ] Không quảng bá native refresh nếu chưa `VERIFIED`.

#### Auth authority/state machine

- [ ] Transition rõ ràng và có tests.
- [ ] Hydrate storage an toàn.
- [ ] Malformed storage → `anonymous`.
- [ ] Role `0/1` hoặc malformed bị từ chối trước persistence.
- [ ] Student-only enforcement sau bootstrap.
- [ ] `logout` clear local trong `finally`.
- [ ] `clearSession` idempotent.
- [ ] `updateUser` chỉ đổi tên/avatar.
- [ ] Generation/epoch chống bootstrap-login-logout race.
- [ ] Stale OTP/login response không đổi state flow mới.
- [ ] Concurrent unauthorized events chỉ gây một transition.
- [ ] Không điều hướng từ service/storage.
- [ ] Reset success clear current local session và về login.

**Gate:** Auth core tests và strict typecheck đạt.

---

### Phase 3 — Auth UI và routes

Tạo hoặc chuẩn hóa:

```text
educodeai-mobile/src/app/(auth)/_layout.tsx
educodeai-mobile/src/app/(auth)/login.tsx
educodeai-mobile/src/app/(auth)/register.tsx
educodeai-mobile/src/app/(auth)/forgot-password.tsx
educodeai-mobile/src/app/(auth)/role-rejected.tsx
educodeai-mobile/src/app/(auth)/session-expired.tsx
```

Bắt buộc:

- [ ] Credentials login.
- [ ] Trusted-device completion.
- [ ] CAPTCHA-required state và provider integration slot/flow.
- [ ] New-device OTP.
- [ ] Device replacement confirmation và OTP.
- [ ] Registration và registration OTP.
- [ ] Forgot request, reset OTP và new password.
- [ ] Role rejected.
- [ ] Session expired.
- [ ] Loading, error, retry, disabled và success states.
- [ ] Double-submit protection.
- [ ] OTP đúng sáu chữ số và không persist/log.
- [ ] Forgot-password UI chống account enumeration.
- [ ] Không giả lập CAPTCHA bằng text-token input rồi ghi là hoàn chỉnh.
- [ ] Touch target tối thiểu `44×44`.
- [ ] Safe area và keyboard avoidance.
- [ ] Responsive 320–430 px.
- [ ] Accessibility labels cho control quan trọng.
- [ ] Không emoji, glass effect hoặc decorative gradient.
- [ ] Route wrappers mỏng; business logic ở feature module.

**Gate:** Auth UI tests và route imports đạt; không sensitive logger calls.

---

### Phase 4 — Account core

Phạm vi:

```text
educodeai-mobile/src/features/account/**
```

#### Typed contracts

- [ ] Profile/update/avatar/password/device contracts được typed.
- [ ] Device session có:
  - `maPhien`;
  - `maThietBi`;
  - `tenThietBi`;
  - `thoiGianHoatDongCuoi`;
  - `isCurrentDevice`.
- [ ] Không dùng `any`.
- [ ] Không import AsyncStorage.
- [ ] Không import Auth implementation internals.
- [ ] Không duplicate logout hoặc session cleanup.

#### Account API

- [ ] `GET /api/hoc-vien/ho-so`.
- [ ] Multipart `PUT /api/hoc-vien/ho-so`.
- [ ] `POST /api/XacThuc/doi-mat-khau`.
- [ ] `GET /api/XacThuc/danh-sach-thiet-bi`.
- [ ] Request remote logout OTP.
- [ ] Confirm remote logout OTP.
- [ ] Không gọi `/api/nguoi-dung/doi-mat-khau`.
- [ ] Dùng shared Axios/error/media/device helpers.
- [ ] Multipart dùng `HoTen`, optional `AnhDaiDien`.
- [ ] Native file part dùng `{ uri, name, type }`, không cast thành string.
- [ ] Timestamp và media URL được normalize.
- [ ] Operation IDs loại stale/out-of-order responses.

#### Session semantics

- [ ] Profile/avatar success gọi `useAuth().updateUser`.
- [ ] Identity/email/role mismatch gọi public `clearSession`.
- [ ] Account logout gọi public `logout`.
- [ ] Change password giữ current session.
- [ ] Current device không thể individual revoke.
- [ ] Revoke-all-other không clear current session.
- [ ] Chỉ clear current session khi có bằng chứng current session thực sự bị revoke.

**Gate:** Account core service/contract tests và strict typecheck đạt.

---

### Phase 5 — Account UI và routes

Tạo hoặc chuẩn hóa:

```text
educodeai-mobile/src/app/(tabs)/account.tsx
educodeai-mobile/src/app/ho-so.tsx
educodeai-mobile/src/app/doi-mat-khau.tsx
educodeai-mobile/src/app/quan-ly-thiet-bi.tsx
```

Checklist:

- [ ] Account home/menu.
- [ ] User loading và missing states.
- [ ] Profile load/error/retry.
- [ ] Tên được trim, dài 2–120 ký tự.
- [ ] No-op update bị chặn.
- [ ] Email, role và statistics read-only.
- [ ] Avatar permission/cancel/error/success states.
- [ ] Broken image có fallback.
- [ ] Change-password validation và exact endpoint.
- [ ] Thông báo current session được giữ sau đổi mật khẩu.
- [ ] Device loading/empty/error/retry.
- [ ] Current-device badge.
- [ ] Current session không selectable để revoke riêng.
- [ ] Remote logout OTP đúng sáu chữ số.
- [ ] “Logout all” hiển thị là “đăng xuất tất cả phiên khác”.
- [ ] Refresh device list sau mutation.
- [ ] Double-submit protection.
- [ ] Out-of-order profile/device responses bị bỏ.
- [ ] Logout dùng public Auth API.
- [ ] Không tạo `/tai-khoan`.
- [ ] Không thêm gift/certificate/module ngoài phạm vi.
- [ ] Touch target tối thiểu `44×44`.
- [ ] Safe area, keyboard avoidance, responsive 320–430 px.
- [ ] Accessibility labels.
- [ ] Không emoji, glass effect hoặc decorative gradient.

**Gate:** Account UI tests và route import checks đạt.

---

### Phase 6 — Router integration

Inspect và chỉnh khi cần:

```text
educodeai-mobile/src/app/_layout.tsx
educodeai-mobile/src/app/index.tsx
educodeai-mobile/src/app/(tabs)/_layout.tsx
educodeai-mobile/src/app/(auth)/**
educodeai-mobile/src/app/(tabs)/account.tsx
educodeai-mobile/src/app/ho-so.tsx
educodeai-mobile/src/app/doi-mat-khau.tsx
educodeai-mobile/src/app/quan-ly-thiet-bi.tsx
```

State mapping:

```text
bootstrapping  → splash/gate; không render protected UI
anonymous      → /(auth)/login
roleRejected   → /(auth)/role-rejected
sessionExpired → /(auth)/session-expired
authenticated role 2 → /(tabs)
```

Checklist:

- [ ] Mount đúng một `AuthProvider` tại root.
- [ ] Bootstrap gate chặn protected UI flash.
- [ ] Wire deduplicated 401 event vào AuthProvider.
- [ ] Redirect chỉ chạy khi root navigation sẵn sàng.
- [ ] Router chỉ dùng public Auth state.
- [ ] Không dùng route-group pathname làm public URL invariant.
- [ ] Deep links đi qua bootstrap/role/session guard.
- [ ] Android back không mở protected UI sau logout.
- [ ] Login/register/OTP business errors không thành session-expired.
- [ ] 403 không thành token expiry.
- [ ] `(tabs)/account` là account destination canonical.
- [ ] Không có `/tai-khoan`.
- [ ] Giữ nguyên và smoke-test `/phong-van-do-an`.
- [ ] Giữ nguyên và smoke-test `/thu-thach`.
- [ ] Route wrappers mỏng.
- [ ] Không duplicate provider.

**Gate:** Router import/build validation đạt; deep-link và logout/back có automated hoặc manual evidence.

---

### Phase 7 — Dependencies và config

Inspect:

```text
educodeai-mobile/package.json
educodeai-mobile/package-lock.json
educodeai-mobile/tsconfig.json
educodeai-mobile/app.json
educodeai-mobile/app.config.*
educodeai-mobile/babel.config.*
educodeai-mobile/jest.config.*
```

Quy tắc:

- [ ] Chỉ thêm dependency thực sự cần.
- [ ] Ưu tiên `npx expo install` cho Expo packages.
- [ ] Nếu avatar acceptance path cần, cài và wire `expo-image-picker`.
- [ ] Cấu hình Android/iOS permissions cần thiết.
- [ ] Package và lockfile thay đổi đồng bộ.
- [ ] Chỉ bổ sung test config nếu baseline chưa đủ.
- [ ] Không hạ TypeScript strictness.
- [ ] Không tắt test, thêm ignore hoặc che lỗi.
- [ ] Không thêm path alias nếu không cần.
- [ ] Không sửa/tái tạo `expo-env.d.ts` nếu đó là user change ngoài phạm vi.
- [ ] Không nâng cấp dependencies ngoài phạm vi.
- [ ] Ghi lý do cho mỗi dependency mới.

**Gate:** Install/lockfile nhất quán; typecheck và route resolution không regression.

---

### Phase 8 — Automated tests và validation

Chạy từ:

```text
D:\CaoDangFPT\DuAnTotNghiep\EducodeAI\educodeai-mobile
```

Dùng scripts thực tế trong `package.json`. Tối thiểu, nếu có:

```bash
npm install
npm run typecheck
npm run lint
npm test
```

Nếu tên script khác, chạy script repository cung cấp và báo chính xác command/result.

#### Auth/session matrix

| Nhóm | Trường hợp |
|---|---|
| Login | Success, invalid credentials, CAPTCHA-required |
| Device | Trusted, new-device OTP, three-device replacement |
| Classifier | Mỗi branch, overlap, malformed response, precedence |
| Role | Role 2, role 0/1, malformed/tampered local role, copied non-student token |
| Bootstrap | Fresh install, restart, malformed storage, no protected flash |
| Session | 401, expiry, banned, revoked, server role change |
| Registration | Validation, duplicate race, OTP valid/invalid/expired/max attempts |
| Forgot/reset | Enumeration-resistant response, OTP/token valid/expired, password policy, no auto-login |
| Logout | API success/failure, primitive body, idempotency |
| Race | Bootstrap-after-logout, bootstrap-failure-after-login, concurrent 401, stale OTP |
| Logging | Không token/password/OTP/full profile |

#### Account matrix

| Nhóm | Trường hợp |
|---|---|
| Profile | Load, malformed/empty, retry, save, no-op, error |
| Identity | Email/role mismatch gọi public Auth API |
| Race | Stale profile response after logout/account change |
| Avatar | Permission denied, cancel, success, failure, broken image |
| Multipart | Exact `HoTen`, `AnhDaiDien`, `{ uri, name, type }` |
| Password | Validation, exact payload, error, current session retained |
| Devices | Empty/error/current badge/missing current ID/timestamp normalization |
| Remote revoke | OTP request success/failure, selected session, all other sessions, invalid/expired OTP |
| Concurrency | Out-of-order list, stale save, duplicate confirmation |
| Boundary | No AsyncStorage, Auth internals, duplicate logout or sensitive logs |

#### Integration matrix

- [ ] Protected UI không flash trước bootstrap.
- [ ] Root provider mount đúng một lần.
- [ ] Deep links qua cùng guards.
- [ ] Route imports/build.
- [ ] Logout rồi Android back không mở protected screen.
- [ ] Concurrent 401 chỉ clear session một lần.
- [ ] Business 4xx không thành session expiry.
- [ ] `/phong-van-do-an` không regression.
- [ ] `/thu-thach` không regression.
- [ ] Không có `/tai-khoan`.
- [ ] Static scan không có AsyncStorage trong Account.
- [ ] Static scan không có sensitive logger.
- [ ] Không duplicate Axios/provider/storage/device helper.

#### Baseline failures

- Chứng minh lỗi có tồn tại tại base `8bd37ba` hay không.
- Lỗi do thay đổi trong scope phải sửa.
- Lỗi cũ ngoài scope ghi `BASELINE/UNRELATED` kèm command/output.
- Không giảm strictness, tắt test hoặc thêm ignore.

**Gate:** Strict typecheck, Auth tests, Account tests và integration tests đạt; lint đạt hoặc chỉ còn lỗi baseline unrelated có bằng chứng.

---

### Phase 9 — API thật và Android verification

Dùng backend thật và tối thiểu một Android emulator hoặc thiết bị thật.

#### Điều kiện môi trường

- [ ] API base URL truy cập được từ thiết bị.
- [ ] Không hard-code production secret hoặc credentials.
- [ ] Local host/network setup được ghi lại.
- [ ] Release config không hard-code LAN/plain HTTP.
- [ ] Có student và non-student test accounts phù hợp.
- [ ] Có cách lấy/quan sát OTP trong test environment.
- [ ] CAPTCHA provider/site key đã xác minh hoặc ghi blocker.

#### Scenario bắt buộc

- [ ] Fresh install.
- [ ] Registration và OTP.
- [ ] Trusted-device login.
- [ ] New-device OTP.
- [ ] Three-device replacement.
- [ ] CAPTCHA-required behavior.
- [ ] Role `0/1` không persist.
- [ ] Restart/bootstrap.
- [ ] 401/expiry/revoke.
- [ ] Server role change.
- [ ] Profile fetch/update.
- [ ] Avatar permission/upload.
- [ ] Change password.
- [ ] Device list.
- [ ] Selective revoke.
- [ ] Revoke all other sessions.
- [ ] Local logout.
- [ ] Forgot/reset và no auto-login.
- [ ] Offline/slow network.
- [ ] Background/foreground.
- [ ] Width 320, 360, 390 và 430.
- [ ] Keyboard behavior.
- [ ] Screen-reader spot check.
- [ ] Direct/deep link.
- [ ] Android back.
- [ ] `/phong-van-do-an`.
- [ ] `/thu-thach`.

Ghi cho từng scenario:

- device/emulator và OS;
- API environment;
- steps;
- actual result;
- `PASS`, `FAIL`, `NOT RUN` hoặc `BLOCKED`;
- bằng chứng không chứa dữ liệu nhạy cảm;
- `VERIFY` còn lại.

**Gate:** Android real-API smoke đạt cho acceptance paths. Nếu thiếu môi trường/provider, báo blocker trung thực; không đổi thành Done.

---

### Phase 10 — Documentation

Cập nhật tài liệu phù hợp trong:

```text
Docs/mobile/Au/**
Docs/mobile-hoc-vien/**
```

Chỉ sửa canonical docs khi implementation làm rõ hoặc thay đổi contract đã được kiểm chứng.

Nội dung implementation report/documentation cần có:

- [ ] Base SHA `8bd37ba`.
- [ ] Branch `feature/mobile-au-complete`.
- [ ] Files created/modified.
- [ ] Public Auth exports/signature.
- [ ] Auth transition table.
- [ ] Storage schema/version.
- [ ] Unauthorized event wiring.
- [ ] API contracts đã implement.
- [ ] Dependency mới và lý do.
- [ ] Device metadata strategy.
- [ ] CAPTCHA status.
- [ ] Native refresh status.
- [ ] Avatar/image-picker status.
- [ ] Production API/TLS status.
- [ ] Validation commands/results.
- [ ] Android/API scenarios/results.
- [ ] Baseline unrelated failures.
- [ ] `VERIFY` register.
- [ ] Known limitations/blockers.
- [ ] Rollback notes.
- [ ] Không chứa token, OTP, password, credential hoặc full profile.

---

### Phase 11 — Final audit, commit và báo cáo

Chạy:

```bash
git status --short
git diff --name-only
git diff --check
git diff --stat
```

Audit:

- [ ] Mọi file session sửa đều thuộc Auth, Account, shared foundation, router, package/config, tests hoặc docs liên quan.
- [ ] Không mất hoặc ghi đè user changes.
- [ ] `educodeai-mobile/expo-env.d.ts` giữ nguyên trạng thái preflight nếu ngoài phạm vi.
- [ ] Không secret hoặc sensitive logging.
- [ ] Không hard-code user ID, device ID, token, OTP hay credentials.
- [ ] Không duplicate AuthProvider, Axios, storage key/schema hoặc device helper.
- [ ] Không `/tai-khoan`.
- [ ] Hai AI routes không regression.
- [ ] Mỗi `VERIFY` có trạng thái và bằng chứng.
- [ ] Validation và runtime evidence được ghi chính xác.

#### Commit policy

- Mặc định không commit.
- Chỉ commit nếu người dùng/prompt cho phép rõ ràng.
- Nếu được phép:
  - chỉ commit phase đã qua gate;
  - stage bằng exact paths;
  - không stage user changes ngoài phạm vi;
  - review cached diff;
  - không push nếu chưa được yêu cầu.

Commit gợi ý:

```text
chore(mobile): establish auth account shared foundation
feat(mobile): implement student auth flows
feat(mobile): add auth screens and states
feat(mobile): implement account profile and device flows
feat(mobile): integrate auth account routing
chore(mobile): add auth account dependencies
test(mobile): cover auth account integration
docs(mobile): document auth account verification
```

Không dùng “complete” trong commit/report nếu real-device acceptance chưa đạt.

---

## 9. Security và race-safety matrix

| Kiểm soát | Tiêu chí |
|---|---|
| Role | Chỉ numeric role `2` được persist |
| Storage | Runtime validation; serialized/versioned record |
| Race safety | Generation/operation ID ngăn stale overwrite hoặc stale clear |
| Unauthorized | Một deduplicated event; AuthProvider là authority |
| 403 | Không tự động bị coi là token expiry |
| Business 4xx | Login/register/OTP errors không thành session-expired |
| Secret handling | Không log token, password, OTP, credential hoặc full profile |
| Transport | Không hard-code LAN/plain HTTP trong release |
| CAPTCHA | Không giả lập text token như integration hoàn chỉnh |
| Refresh | Không quảng bá native refresh khi chưa xác minh |
| Logout | Local clear luôn xảy ra dù server/storage lỗi |
| Reset password | Clear local; không auto-login |
| Change password | Current session giữ lại theo backend behavior |
| Remote revoke | “All” chỉ là all other sessions |
| Avatar | Native multipart; client validation; server hardening vẫn `VERIFY` nếu chưa chứng minh |
| Deep links | Dùng cùng bootstrap/role/session guards |
| Authorization | Không thay server authorization bằng client guard |
| Current device | Không được individual revoke |
| Account boundary | Không AsyncStorage/token/Auth internals |

Race tests tối thiểu:

- bootstrap resolve sau logout;
- bootstrap fail sau login mới;
- stale login/OTP sau khi đổi account/flow;
- concurrent 401;
- duplicate logout/clear;
- stale profile save sau logout;
- out-of-order profile/device refresh;
- double OTP confirmation;
- remote mutation response sau session change.

---

## 10. Definition of Done

Chỉ kết luận **Done** khi tất cả điều kiện phù hợp đều có bằng chứng:

- [ ] Làm trên `feature/mobile-au-complete` từ base `8bd37ba`.
- [ ] Mọi user change có sẵn được bảo toàn.
- [ ] Không sửa/stage/commit thay đổi ngoài phạm vi.
- [ ] Auth và Account dùng API thật cho acceptance paths.
- [ ] Chỉ numeric role `2` được persist.
- [ ] Bootstrap, logout, expiry, 401, revoke và role change nhất quán.
- [ ] Stale async responses không thể ghi đè session/flow mới.
- [ ] Reset password không auto-login.
- [ ] Change password giữ current session.
- [ ] Revoke-all-other giữ current session.
- [ ] Account chỉ dùng public Auth API.
- [ ] Một AuthProvider và một Axios instance.
- [ ] Strict TypeScript check đạt.
- [ ] Auth tests đạt.
- [ ] Account tests đạt.
- [ ] Router/integration tests hoặc smoke đạt.
- [ ] Lint đạt hoặc chỉ còn baseline unrelated failures có bằng chứng.
- [ ] Android real-API smoke đạt.
- [ ] Registration, OTP, CAPTCHA và device branches được xác minh; nếu không, trạng thái không được gọi là Done.
- [ ] Profile, avatar, password và device flows được xác minh với API thật.
- [ ] UI có loading/error/retry/disabled/success states phù hợp.
- [ ] Không sensitive logs.
- [ ] Không release LAN/plain HTTP hard-code.
- [ ] `/phong-van-do-an` và `/thu-thach` không regression.
- [ ] Không có `/tai-khoan`.
- [ ] Documentation, `VERIFY` register và rollback notes đầy đủ.
- [ ] Final diff được review.
- [ ] Commit chỉ được tạo nếu có cho phép rõ ràng.
- [ ] Mọi mục chưa chạy được báo `NOT RUN/BLOCKED`, không báo pass.

---

## 11. Xử lý blocker và rollback

### 11.1 Foreign user changes

Nếu file cần sửa có thay đổi người dùng:

1. Dừng mutation file đó.
2. So sánh với preflight status/diff.
3. Tách phần feature một cách chính xác nếu an toàn.
4. Không dùng restore/reset/clean/stash tự động.
5. Nếu không thể tách an toàn, ghi blocker và hỏi người dùng.

### 11.2 Contract mâu thuẫn

1. Dừng implementation phụ thuộc.
2. Đối chiếu backend controller, DTO và service.
3. Ghi contract cũ, bằng chứng mới, affected files và tests.
4. Chọn backend hiện hành làm source of truth.
5. Chỉ tiếp tục khi fixtures, types, services và docs nhất quán.

### 11.3 Thiếu provider/configuration

Nếu thiếu CAPTCHA key/provider, API environment, OTP access hoặc Android runtime:

- hoàn thiện phần có thể kiểm chứng an toàn;
- không tạo fake integration;
- đánh dấu acceptance scenario `BLOCKED` hoặc `NOT RUN`;
- nêu chính xác input cần cung cấp.

### 11.4 Rollback boundaries

- Shared foundation: rollback exact shared commit/diff.
- Auth core/UI: rollback exact Auth changes.
- Account core/UI: rollback exact Account changes.
- Router: rollback integration changes.
- Dependencies: rollback `package.json` và lockfile cùng nhau.
- Docs: sửa hoặc rollback riêng.
- Không dùng destructive working-tree commands.
- Không rollback phần chứa user changes ngoài session.

---

# Prompt copy-paste duy nhất

```text
Bạn là một AI coding session duy nhất chịu trách nhiệm hoàn thiện Mobile Auth & Account end-to-end cho Âu trong repository:

D:\CaoDangFPT\DuAnTotNghiep\EducodeAI

Branch làm việc đã được checkout:
feature/mobile-au-complete

Base SHA:
8bd37ba

Tệp kế hoạch bắt buộc đọc:
D:\CaoDangFPT\DuAnTotNghiep\EducodeAI\Docs\mobile\Au\PLAN-AUTH-ACCOUNT-2-SESSIONS.md

Hãy đọc TOÀN BỘ kế hoạch trước khi sửa bất kỳ tệp nào. Sau đó làm liên tục từ inspection, kiểm chứng contract, implementation, automated validation, API/Android verification nếu môi trường cho phép, documentation, final audit đến báo cáo cuối. Không dừng để chờ Integrator, không tạo handoff giữa Auth và Account, không tạo worktree hoặc branch phụ.

Hãy tự chủ dùng các lựa chọn mặc định hợp lý, an toàn và nhất quán. Chỉ hỏi người dùng nếu thực sự bị chặn bởi contract mâu thuẫn không thể tự kiểm chứng, thiếu secret/provider/config bắt buộc, foreign user changes không thể tách an toàn, thao tác cần quyền rõ ràng hoặc nguy cơ mất dữ liệu. Nếu một runtime scenario không thể chạy, tiếp tục hoàn thiện phần còn lại và báo NOT RUN/BLOCKED trung thực; không giả định pass.

QUY TẮC TUYỆT ĐỐI

1. Trước khi sửa mã, chạy:
   git rev-parse --show-toplevel
   git rev-parse --abbrev-ref HEAD
   git rev-parse HEAD
   git status --short
   git diff --name-only
   git diff --cached --name-only
   git log --oneline -10

2. Xác nhận repository root, branch feature/mobile-au-complete và baseline 8bd37ba. Nếu branch hoặc lịch sử không khớp, không reset hay đổi lịch sử; dừng mutation và báo blocker.

3. Ghi lại toàn bộ tracked, untracked và staged changes có sẵn. Bảo toàn chúng tuyệt đối. Nếu educodeai-mobile/expo-env.d.ts đã bị sửa hoặc xóa trước session, giữ nguyên trạng thái, không khôi phục, sửa, stage hoặc commit nó.

4. Không dùng git reset --hard, git clean, git restore, stash tự động, rebase hoặc thao tác phá hủy. Không format toàn repository. Không sửa module ngoài Mobile Auth, Account, shared foundation, router, package/config, tests và docs liên quan.

5. Có thể sửa mọi file thực sự cần thiết trong phạm vi trên, nhưng phải đọc implementation hiện tại trước, sửa tối thiểu và không tạo implementation trùng.

6. Không commit, amend hoặc push trừ khi người dùng hoặc prompt hiện hành cho phép rõ ràng. Nếu được phép commit, stage exact paths, không dùng git add ., rồi review git diff --cached --name-only và git diff --cached.

7. Phân biệt nghiêm ngặt:
   - VERIFIED: có bằng chứng trực tiếp.
   - VERIFY: chưa đủ bằng chứng.
   - BLOCKED: thiếu điều kiện bắt buộc.
   - NOT RUN: chưa chạy.
   - BASELINE/UNRELATED: lỗi tồn tại ở base và ngoài phạm vi.
   Không biến VERIFY hoặc NOT RUN thành PASS.

SOURCE OF TRUTH

Ưu tiên:
1. Backend controller/DTO/service hiện hành.
2. Docs/mobile-hoc-vien/** và ADR.
3. Web service/page.
4. Mobile hiện có.
5. Commit cũ chỉ để tham khảo.

Đọc và đối chiếu tối thiểu:
- Docs/mobile-hoc-vien/00-overview.md
- Docs/mobile-hoc-vien/01-inventory-va-api.md
- Docs/mobile-hoc-vien/02-auth-va-session.md
- Docs/mobile-hoc-vien/07-checklist-phan-cong.md
- Docs/mobile-hoc-vien/08-design-system-va-ui-sync.md
- Docs/mobile-hoc-vien/decisions/ADR-001-native-mobile-reuse-existing-contracts.md
- Docs/LUONG-XAC-THUC-VA-QUAN-LY-NGUOI-DUNG.md
- educodeai-server/Controllers/XacThucController.cs
- educodeai-server/DTOs/XacThuc/**
- educodeai-server/Services/Implementation/XacThucService.cs
- educodeai-server/Controllers/HocVien/HoSoHocVienController.cs
- educodeai-server/DTOs/NguoiDung/HoSoHocVienDTO.cs
- educodeai-server/DTOs/NguoiDung/UpdateHoSoHocVienDTO.cs
- educodeai-client/src/services/auth.service.ts
- educodeai-client/src/services/ho-so-hoc-vien.service.ts
- educodeai-client/src/pages/auth/loginFlow.ts
- educodeai-client/src/pages/auth/DangNhap.tsx
- educodeai-client/src/pages/auth/DangKy.tsx
- educodeai-client/src/pages/auth/QuenMatKhau.tsx
- educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/ProfilePage.tsx
- educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/QuanLyThietBi.tsx
- educodeai-mobile/src/features/auth/**
- educodeai-mobile/src/features/account/**
- educodeai-mobile/src/shared/**
- educodeai-mobile/src/app/**
- educodeai-mobile/package.json
- educodeai-mobile/package-lock.json
- educodeai-mobile/tsconfig.json
- Expo/Babel/Jest config hiện có

PUBLIC AUTH CONTRACT

Implement và export qua src/features/auth/index.ts:

type MobileRole = 0 | 1 | 2;

interface AuthUser {
  id: string | number;
  maNguoiDung?: string | number;
  taiKhoan: string;
  hoTen: string;
  email: string;
  vaiTro: MobileRole;
  anhDaiDien?: string | null;
}

type AuthStatus =
  | "bootstrapping"
  | "anonymous"
  | "authenticated"
  | "sessionExpired"
  | "roleRejected";

type SessionEndReason =
  | "logout"
  | "unauthorized"
  | "revoked"
  | "role-change";

interface AuthPublicApi {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout(): Promise<void>;
  clearSession(reason?: SessionEndReason): Promise<void>;
  updateUser(
    patch: Partial<Pick<AuthUser, "hoTen" | "anhDaiDien">>,
  ): Promise<void>;
}

Account phải dùng trực tiếp public useAuth API:
- logout() cho local logout;
- clearSession() khi current identity/session không hợp lệ;
- updateUser() sau profile/avatar success.

Account không được import AsyncStorage, token persistence, Auth reducer/context implementation internals hoặc duplicate logout/session cleanup.

SESSION VÀ RACE REQUIREMENTS

- Chỉ numeric role 2 được persist.
- Role 0/1, malformed/tampered role hoặc malformed user bị loại trước persistence.
- Dùng một serialized/versioned session record và runtime validation.
- Malformed storage trở về anonymous.
- Dùng monotonic generation/epoch hoặc operation ID cho bootstrap, login, OTP, logout, profile và device mutations.
- Stale response không thể phục hồi, ghi đè hoặc xóa session/flow mới.
- logout luôn clear local memory/storage dù API hoặc storage lỗi.
- clearSession idempotent.
- updateUser chỉ đổi hoTen/anhDaiDien, không đổi token/role/identity.
- Một Axios instance, một unauthorized bridge, một AuthProvider, một storage schema và một device helper.
- Interceptor không điều hướng; chỉ phát deduplicated 401 event.
- AuthProvider là session authority.
- 403 không tự thành token expiry.
- Login/register/OTP business 4xx không thành session-expired.
- Không log token, password, OTP, credential hoặc full profile.
- Không hard-code user ID, device ID, token, OTP, credentials, production secret hoặc LAN/plain HTTP trong release.

LOGIN CLASSIFIER

Thứ tự bắt buộc:
1. requiresOtp
2. requiresLogoutOldest
3. requiresCaptcha
4. nonblank token + valid user
5. invalid

Viết fixtures/tests cho từng branch, overlap và malformed response.

API CONTRACTS CẦN ĐỐI CHIẾU VÀ IMPLEMENT

- POST /api/XacThuc/dang-nhap
  { taiKhoan, matKhau, captchaToken, maThietBi, tenThietBi? }

- POST /api/XacThuc/xac-nhan-otp
  { taiKhoan, otpCode, maThietBi, tenThietBi? }

- POST /api/XacThuc/xac-nhan-thay-the-thiet-bi
  cùng shape OTP

- POST /api/XacThuc/dang-ky
  { hoTen, email, matKhau, captchaToken }

- POST /api/XacThuc/xac-minh-dang-ky
  taiKhoan là normalized email; dùng exact DTO backend

- POST /api/XacThuc/quen-mat-khau
  { email, captchaToken? }

- POST /api/XacThuc/xac-minh-otp-quen-mat-khau
  { email, otpCode }

- POST /api/XacThuc/dat-lai-mat-khau
  dùng exact DTO; success không auto-login

- POST /api/XacThuc/dang-xuat
  body là JSON primitive string "device-id", không phải object

- POST /api/XacThuc/doi-mat-khau
  { MatKhauCu, MatKhauMoi }

- GET /api/hoc-vien/ho-so

- PUT /api/hoc-vien/ho-so
  multipart HoTen và optional AnhDaiDien

- GET /api/XacThuc/danh-sach-thiet-bi?maThietBiHienTai=...

- POST /api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa

- POST /api/XacThuc/xac-nhan-dang-xuat-tu-xa

dangXuatTatCa=true nghĩa là đăng xuất tất cả phiên khác; current JWT session vẫn hoạt động.

VERIFY BAN ĐẦU

Phải tự kiểm chứng và ghi trạng thái:
- Axios wrapped/unwrapped response.
- API error shape.
- Native device ID/name.
- Native refresh cookie/Origin/Referer support.
- CAPTCHA provider/site key/native flow.
- Production API URL/TLS.
- Avatar media URL normalization.
- expo-image-picker và permissions.
- Server-recognized mobile channel.
- Server-side student-only enforcement.
- DTO casing.
- Server-side avatar MIME/type/size hardening.

THỰC HIỆN TUYẾN TÍNH

PHASE 0 — PREFLIGHT
- Ghi branch/base/status/user changes/baseline tests.
- Lập manifest Auth, Account, Router, shared, package/config và tests.
- Đóng băng response shapes, DTO casing, error behavior, storage schema/version, generation policy, device metadata và routes.
- Phân loại VERIFY thành resolved/deferred/blocked.

PHASE 1 — SHARED FOUNDATION
Inspect và tạo/chỉnh tối thiểu:
- educodeai-mobile/src/shared/configs/api.ts
- educodeai-mobile/src/shared/constants/storage-keys.ts
- educodeai-mobile/src/shared/lib/auth-storage.ts
- educodeai-mobile/src/shared/lib/api-error.ts
- educodeai-mobile/src/shared/lib/media-url.ts
- educodeai-mobile/src/shared/lib/device-metadata.ts
- educodeai-mobile/src/shared/theme/tokens.ts
- educodeai-mobile/src/shared/types/api-error.ts
- educodeai-mobile/src/shared/types/auth-public.ts

Yêu cầu: một Axios instance; typed errors; environment API URL; deduplicated unauthorized event; no redirect in interceptor; versioned validated storage; stable device metadata; media normalization; no duplicate helper; no sensitive logs. Chạy typecheck/tests phù hợp trước phase sau.

PHASE 2 — AUTH CORE
Trong educodeai-mobile/src/features/auth/**:
- typed domain/runtime guards/public barrel;
- exact services và payloads;
- classifier đúng precedence;
- registration không gửi taiKhoan ở initial DTO nếu backend không có;
- registration OTP dùng normalized email;
- reset exact DTO, clear local, không auto-login;
- logout primitive JSON string;
- reducer/state machine/AuthProvider/useAuth;
- safe hydration, role-2-only persistence;
- generation race protection;
- unauthorized event xử lý một lần;
- không Axios riêng, không navigation trong service/storage;
- không quảng bá native refresh nếu chưa VERIFIED.
Viết Auth unit/contract tests và strict-typecheck trước phase sau.

PHASE 3 — AUTH UI
Tạo/chuẩn hóa:
- educodeai-mobile/src/app/(auth)/_layout.tsx
- educodeai-mobile/src/app/(auth)/login.tsx
- educodeai-mobile/src/app/(auth)/register.tsx
- educodeai-mobile/src/app/(auth)/forgot-password.tsx
- educodeai-mobile/src/app/(auth)/role-rejected.tsx
- educodeai-mobile/src/app/(auth)/session-expired.tsx

Có credentials/trusted login, CAPTCHA branch/provider, new-device OTP, replacement confirmation/OTP, registration/OTP, forgot/reset, role-rejected, session-expired, loading/error/retry/disabled/success, double-submit protection, 6-digit OTP, enumeration-resistant forgot UI, touch targets >=44x44, safe area, keyboard avoidance, responsive 320–430 và accessibility labels. Không emoji, glass effect hoặc decorative gradient. Không fake CAPTCHA bằng text-token field.

PHASE 4 — ACCOUNT CORE
Trong educodeai-mobile/src/features/account/**:
- typed profile/update/avatar/password/device contracts;
- device type có maPhien, maThietBi, tenThietBi, thoiGianHoatDongCuoi, isCurrentDevice;
- exact Profile/Password/Device/Remote logout APIs;
- không gọi /api/nguoi-dung/doi-mat-khau;
- multipart HoTen, optional AnhDaiDien và native file { uri, name, type };
- shared Axios/error/media/device helpers;
- operation ID chống stale/out-of-order response;
- profile/avatar success gọi useAuth().updateUser;
- identity/email/role mismatch gọi useAuth().clearSession;
- Account logout gọi useAuth().logout;
- password change giữ current session;
- current device không individual revoke;
- revoke-all-other không clear current session;
- không AsyncStorage/Auth internals/duplicate logout.
Viết Account unit/contract tests trước phase sau.

PHASE 5 — ACCOUNT UI
Tạo/chuẩn hóa:
- educodeai-mobile/src/app/(tabs)/account.tsx
- educodeai-mobile/src/app/ho-so.tsx
- educodeai-mobile/src/app/doi-mat-khau.tsx
- educodeai-mobile/src/app/quan-ly-thiet-bi.tsx

Có account home, user loading/missing, profile load/retry/edit, trimmed name 2–120, no-op guard, read-only identity/statistics, avatar permission/cancel/error/success/fallback, change-password validation, retained-current-session message, device loading/empty/error/current badge, unselectable current session, 6-digit remote OTP, “đăng xuất tất cả phiên khác”, refresh after mutation, double-submit/out-of-order protection, accessibility, safe area, keyboard và responsive 320–430. Không tạo /tai-khoan, gifts hoặc certificates.

PHASE 6 — ROUTER
- Mount đúng một AuthProvider ở root.
- Wire deduplicated 401 event.
- bootstrapping → splash/gate.
- anonymous → /(auth)/login.
- roleRejected → /(auth)/role-rejected.
- sessionExpired → /(auth)/session-expired.
- authenticated role 2 → /(tabs).
- Redirect chỉ khi navigation ready.
- Router chỉ dùng public Auth state.
- Không dùng pathname.startsWith('/(auth)').
- Deep links qua cùng guard.
- Android back không mở protected UI sau logout.
- 403/business 4xx không bị diễn giải sai.
- (tabs)/account là destination canonical.
- Không /tai-khoan.
- Giữ và smoke-test /phong-van-do-an và /thu-thach.
- Không duplicate provider.
Chạy route import/build validation.

PHASE 7 — DEPENDENCIES/CONFIG
Inspect package.json, package-lock.json, tsconfig, Expo, Babel và Jest config. Chỉ cài dependency cần thiết; ưu tiên npx expo install. Nếu avatar acceptance path cần, cài/wire expo-image-picker và permissions. Package/lockfile đồng bộ. Không hạ strictness, tắt test, thêm ignore, nâng cấp ngoài phạm vi hoặc tái tạo expo-env.d.ts. Ghi lý do dependency mới.

PHASE 8 — AUTOMATED VALIDATION
Từ educodeai-mobile, chạy scripts thực tế cho install, strict typecheck, lint, Auth tests, Account tests và integration/router tests.

Auth matrix:
- login success/failure/CAPTCHA;
- trusted/new-device/replacement;
- classifier overlap/malformed;
- role 2, role 0/1, tampered role, copied non-student token;
- fresh install/restart/malformed storage/no protected flash;
- 401/expiry/banned/revoked/role change;
- registration validation/duplicate/OTP/expiry/max attempts;
- forgot enumeration resistance;
- reset valid/expired/password policy/no auto-login;
- logout success/failure/primitive body/idempotency;
- bootstrap-after-logout;
- bootstrap-failure-after-new-login;
- concurrent 401;
- stale OTP;
- no sensitive logs.

Account matrix:
- profile load/malformed/empty/retry/save/no-op/error;
- stale response after logout/account change;
- identity mismatch calls public Auth API;
- avatar denied/cancel/success/failure/broken image;
- exact multipart/native file shape;
- password payload/error/current session retained;
- device empty/error/current marking/missing current ID/timestamp;
- out-of-order refresh;
- remote OTP request success/failure/invalid/expired;
- duplicate confirm blocked;
- selective revoke/all-other/current session unselectable;
- Account logout via public Auth API;
- no AsyncStorage/Auth internals/sensitive logs.

Integration:
- no protected flash;
- one provider;
- deep-link guards;
- route imports/build;
- logout + Android back;
- concurrent 401;
- business 4xx semantics;
- no /tai-khoan;
- old AI routes no regression;
- no duplicate Axios/provider/storage/device helper.

Nếu toàn-repo checks lỗi, chứng minh lỗi có hay không ở base 8bd37ba. Sửa regression do feature; ghi BASELINE/UNRELATED cho lỗi cũ ngoài phạm vi. Không che lỗi.

PHASE 9 — API THẬT VÀ ANDROID
Nếu môi trường sẵn có, dùng backend thật và ít nhất một Android emulator/thiết bị thật để chạy:
- fresh install;
- registration/OTP;
- trusted login;
- new-device OTP;
- replacement;
- CAPTCHA branch;
- role 0/1 rejection;
- restart/bootstrap;
- 401/expiry/revoke/role change;
- profile/update;
- avatar permission/upload;
- password change;
- device list/selective revoke/all-other;
- local logout;
- forgot/reset/no auto-login;
- offline/slow network;
- background/foreground;
- widths 320/360/390/430;
- keyboard/screen reader;
- deep link/Android back;
- /phong-van-do-an và /thu-thach.

Ghi device/OS, API environment, steps, actual result và PASS/FAIL/NOT RUN/BLOCKED. Không đưa secret hoặc sensitive data vào logs/screenshots. Nếu thiếu API, OTP, CAPTCHA hoặc Android runtime, báo blocker trung thực và không kết luận Done.

PHASE 10 — DOCUMENTATION
Cập nhật docs phù hợp trong Docs/mobile/Au/** hoặc Docs/mobile-hoc-vien/** với branch/base, file manifest, public Auth contract, state transitions, storage schema/version, unauthorized wiring, APIs, dependencies, device metadata, CAPTCHA/native refresh/avatar/API TLS status, validation results, Android evidence, baseline failures, VERIFY register, blockers và rollback notes. Không ghi token, OTP, password, credentials hoặc full profile.

PHASE 11 — FINAL AUDIT
Chạy:
- git status --short
- git diff --name-only
- git diff --check
- git diff --stat

Xác minh:
- chỉ file trong phạm vi bị sửa;
- user changes được bảo toàn;
- expo-env.d.ts giữ trạng thái preflight nếu ngoài phạm vi;
- không sensitive logs/secrets/hard-coded identities;
- không duplicate provider/Axios/storage/device helper;
- không /tai-khoan;
- hai AI routes không regression;
- VERIFY có trạng thái;
- commands và runtime evidence được báo chính xác.

Chỉ commit nếu được cho phép rõ ràng. Nếu được phép, stage exact paths, review cached diff và không push nếu chưa được yêu cầu.

DEFINITION OF DONE

Chỉ báo Done nếu có bằng chứng rằng:
- branch feature/mobile-au-complete và base 8bd37ba đúng;
- user changes được bảo toàn;
- Auth/Account acceptance paths dùng API thật;
- chỉ role 2 được persist;
- bootstrap/logout/401/revoke/role-change và race handling đúng;
- reset không auto-login;
- password change và revoke-all-other giữ current session;
- Account chỉ dùng public Auth API;
- một AuthProvider và một Axios instance;
- strict typecheck, Auth tests, Account tests và router/integration checks đạt;
- lint đạt hoặc chỉ còn baseline unrelated có bằng chứng;
- Android real-API smoke đạt;
- UI states/accessibility cơ bản đầy đủ;
- không sensitive logs hoặc release LAN/plain HTTP;
- hai AI routes không regression;
- không /tai-khoan;
- docs, VERIFY register và rollback notes đầy đủ.

BÁO CÁO CUỐI BẮT BUỘC

- Repository:
- Dedicated branch:
- Base SHA:
- Initial user changes preserved:
- Files changed:
- Files created:
- Public Auth exports/signature:
- Auth state-transition table:
- Storage schema/version:
- Race/generation strategy:
- Unauthorized-event wiring:
- API contracts implemented:
- Dependencies/config changed and reasons:
- Validation commands:
- Validation results:
- Android device/emulator and OS:
- API environment:
- Manual scenarios passed:
- Manual scenarios failed:
- Manual scenarios not run:
- VERIFY resolved and evidence:
- VERIFY remaining:
- Blockers:
- Baseline unrelated failures:
- Security audit result:
- Router regression result:
- expo-env.d.ts preserved and uncommitted:
- Commits created:
- Push status:
- Rollback notes:
- Overall status: DONE, PARTIAL hoặc BLOCKED.

Làm liên tục từ đầu đến cuối, dùng sensible defaults và chỉ hỏi khi thực sự bị chặn. Mọi VERIFY hoặc scenario chưa hoàn tất phải được báo trung thực; tuyệt đối không mô tả chúng như đã hoàn thành.
```