# Lai — Module AI & Engagement

## Phạm vi end-to-end

Chatbot, lộ trình AI, phỏng vấn AI/đồ án, sinh đồ án, thử thách, bảng xếp hạng, danh hiệu và chứng chỉ. Module này không sở hữu quiz/course player.

## Đọc trước

- Toàn bộ `Mobile/src/app`, `Mobile/src/components`, `Mobile/src/services` để tránh viết lại code native đã có.
- Web `tro-ly-hoi-dap-ai`, `yeu-cau-lo-trinh-ai`, `khoa-hoc-ca-nhan-ai`, `phong-van-ai`, `phong-van-do-an`, `sinh-do-an-ai`, `thu-thach`.
- Service AI/roadmap/interview/challenge tương ứng và controller backend.
- [AI specification](../06-ai-challenges-and-secondary.md) và [design system](../08-design-system-va-ui-sync.md).

## Tái sử dụng

- `Mobile/src/components/chat-bot.tsx`.
- `Mobile/src/app/phong-van-do-an.tsx`, `thu-thach.tsx`.
- Native services `ai-roadmap`, `tro-ly-ai`, `phong-van-ai`, `thu-thach`.
- AI accent tím; primary navigation/CTA vẫn dùng cam.

## Checklist triển khai

### Kiểm kê trước code
- [ ] Chạy/test từng màn hình/service native hiện có.
- [ ] So sánh endpoint native với service web/controller.
- [ ] Chỉ tạo file mới khi implementation tương ứng chưa tồn tại.

### UI và flow
- [ ] Chatbot: lịch sử, Markdown/code, loading/error/retry.
- [ ] Lộ trình AI: form yêu cầu, trạng thái xử lý, timeline dọc, chi tiết.
- [ ] Phỏng vấn/đồ án: tái sử dụng màn hình hiện có, hoàn thiện quyền mic/camera nếu contract yêu cầu.
- [ ] Thử thách: nhiệm vụ, stats, leaderboard và danh hiệu.
- [ ] Chứng chỉ sau khi Learning module cung cấp điều kiện/kết quả.
- [ ] Icon robot/sparkles/mic/trophy/badge nhất quán; không dùng emoji.

### Test
- [ ] Empty, timeout, quota/API key, 401 và request lặp.
- [ ] Markdown/code không overflow.
- [ ] Native screens hiện có không hồi quy.
- [ ] AI lỗi không ảnh hưởng auth/discovery/learning.

## Bàn giao

- Route công khai của module và context cần từ Auth/Learning.
- Endpoint đã test, mục VERIFY và lỗi còn lại.
