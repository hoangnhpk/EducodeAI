# Phân công triển khai theo module

> Mỗi thành viên sở hữu trọn một module: UI, luồng màn hình, service adapter, trạng thái, kiểm thử và bàn giao. Không chia một module cho nhiều người.

## Bốn module

| Thành viên | Module end-to-end | Checklist |
|---|---|---|
| Âu | Auth & Account | [au-auth-module.md](checklists/au-auth-module.md) |
| Khiến | Discovery & Commerce | [khien-discovery-commerce-module.md](checklists/khien-discovery-commerce-module.md) |
| Khôi | Learning Experience | [khoi-learning-module.md](checklists/khoi-learning-module.md) |
| Lai | AI & Engagement | [lai-ai-challenges-module.md](checklists/lai-ai-challenges-module.md) |

## Ranh giới module

### Âu — Auth & Account

Login, đăng ký, OTP, session, logout, quên/đổi mật khẩu, hồ sơ và thiết bị. Không tách profile/device sang module khác.

### Khiến — Discovery & Commerce

Home, danh sách, khóa học của tôi, chi tiết, đăng ký miễn phí, thanh toán QR/voucher và quà tặng.

### Khôi — Learning Experience

Course player, chương/bài, video, lý thuyết, tiến độ, ghi chú, quiz, đánh giá và tóm tắt video. Quiz/review không tách khỏi player.

### Lai — AI & Engagement

Chatbot, lộ trình AI, phỏng vấn, đồ án, thử thách, xếp hạng, danh hiệu và chứng chỉ. Tận dụng native code đã có trước khi tạo mới.

## Chính sách nền tảng chung

- Native mobile chỉ dành cho học viên (`VaiTro = 2`).
- Web desktop phục vụ học viên, giảng viên và quản trị viên theo quyền hiện hành.
- IDE, terminal, runner, practical và nghiệp vụ quản trị chuyên sâu là desktop-only.
- Mobile chỉ render navigation học viên.
- GV/QTV đăng nhập mobile phải bị từ chối phiên và được hướng dẫn sử dụng web desktop.
- Client guard chỉ bảo vệ UX; backend/API vẫn phải kiểm tra JWT và role.

## Shared UI bắt buộc

Tất cả thành viên phải đọc [design system và quy tắc đồng bộ web](08-design-system-va-ui-sync.md). Không module nào được tự đổi:

- Primary orange và semantic colors.
- Icon family/mapping.
- Typography, spacing, radius và shadow.
- Loading, empty, error, locked và disabled patterns.

## Ownership file dự kiến

| Khu vực | Owner |
|---|---|
| `educodeai-mobile/src/features/auth`, account screens, AuthContext, API auth | Âu |
| `educodeai-mobile/src/features/discovery`, course detail, commerce | Khiến |
| `educodeai-mobile/src/features/learning`, player, quiz/review | Khôi |
| `educodeai-mobile/src/features/ai-engagement`, native AI/challenge hiện có | Lai |
| Shared design tokens/components | Chỉ thay đổi sau khi cả nhóm thống nhất |
| Root Expo Router layout | Người đầu tiên tạo skeleton; mọi thay đổi sau đó phải thông báo cả nhóm |

## Contract giữa module

1. Auth cung cấp `user`, `token`, `isLoading`, authenticated state và logout.
2. Discovery chuyển `courseId` và ownership state sang Learning.
3. Learning nhận `courseId`, tự quản lý `lessonId`, quiz và tiến độ.
4. AI & Engagement chỉ nhận user/course context qua contract công khai; không đọc state nội bộ module khác.

## Tích hợp chung

- [ ] Thống nhất route names/params trước khi làm màn hình.
- [ ] Thống nhất token/component tối thiểu trước khi từng module styling.
- [ ] Mỗi owner chạy typecheck/lint module mình.
- [ ] Mỗi owner ghi endpoint đã test và mục `VERIFY` còn lại.
- [ ] Smoke test chung: đăng ký/login → Home → chi tiết → học → quiz → tiến độ → tài khoản/logout.
- [ ] Test riêng AI/challenge sau khi luồng học cốt lõi ổn định.

## Definition of Done

- Một module hoạt động end-to-end bằng API thật, không mock.
- UI tuân thủ design system và được so sánh với web tương ứng.
- Có loading, empty, error, disabled và retry phù hợp.
- Không hard-code user/course ID hoặc bí mật.
- Không viết lại backend/endpoint đã có.
- Mobile không hiển thị route/menu GV/QTV; tài khoản không phải học viên không được giữ phiên.
- API được gọi vẫn áp dụng xác thực/phân quyền backend, không tin role phía client.
- Test trên ít nhất một Android emulator/thiết bị.
