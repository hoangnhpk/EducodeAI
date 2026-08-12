# Khôi — Module Learning Experience

## Phạm vi end-to-end

Course player, chương/bài, video/lý thuyết, điều hướng, tiến độ, ghi chú, quiz, kết quả, đánh giá và tóm tắt video. Practical/IDE chỉ hiển thị desktop-only.

## Đọc trước

- `NoiDungKhoaHoc.tsx`, DTO và toàn bộ component course player.
- `BaiTapTracNghiem.tsx`, `DanhGia.tsx`, `TomTatVideoAI.tsx`.
- `khoa-hoc.service.ts`, `video-ai.service.ts`; controller player/review tương ứng.
- [Learning specification](../04-course-player-va-learning.md), [quiz/review](../05-quiz-review-profile.md), [design system](../08-design-system-va-ui-sync.md).

## Tái sử dụng

- Contract course data, ghi chú, tiến độ, quiz và chứng chỉ hiện có.
- Utility flatten/previous/next/progress port sang TypeScript thuần.
- Content-page tokens trên web: cam, surface trắng, background nhạt, text đậm.

## Checklist triển khai

### Contract và service
- [ ] Xác minh loại bài, quyền khóa, video URL và thời điểm lưu tiến độ.
- [ ] Tạo một service/DTO cho toàn Learning module.
- [ ] Xác minh API gửi đánh giá; không dùng mock admin.

### UI và flow
- [ ] Player shell, chapter/lesson list, video và lý thuyết.
- [ ] Previous/next, trạng thái hoàn thành và lưu tiến độ.
- [ ] Quiz chọn đáp án, submit khóa double tap, kết quả đạt/rớt.
- [ ] Ghi chú, đánh giá và tóm tắt video.
- [ ] Practical/IDE desktop-only, không import editor/runner.
- [ ] Icon play/book/check/note/star nhất quán; AI summary dùng accent tím.

### Test
- [ ] Bài đầu/cuối, chapter rỗng, video/text lỗi.
- [ ] Tiến độ sau reload và mất mạng.
- [ ] Quiz empty/đạt/rớt/API lỗi/submit lặp.
- [ ] Review permission/API error; AI lỗi không khóa bài.

## Bàn giao

- Public route nhận `courseId`; module tự quản lý `lessonId`/quiz.
- Endpoint đã test, mục VERIFY và lỗi còn lại.
