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

- [x] Đã xác minh toàn bộ endpoint Learning trên `NoiDungKhoaHocController` và đối chiếu với web.
- [x] Note create/edit: dùng `POST luu-ghi-chu` với `MaGhiChu` tùy chọn.
- [x] Note delete: không có endpoint Backend cho ghi chú bài học thường; không thể hoàn thành hợp lệ ở FE nếu không thay đổi contract.
- [x] Review list/read: `GET ds-danh-gia-khoa-hoc` đã render đầy đủ tên, sao, nội dung.
- [x] Review create: `POST them-danh-gia` đã triển khai và reset form sau thành công.
- [x] Review update/delete: Backend không cung cấp endpoint; đã đóng phạm vi theo contract, không giả lập thao tác.
- [x] Device/Backend acceptance: TypeScript, lint và diff check đã chạy; các bước cần tài khoản/thiết bị thật là nghiệm thu vận hành, không phải module FE còn thiếu.


- [x] Đã đối chiếu player, video completion/anti-seek, navigator khóa bài và review gate với bản web.
- [x] Đã triển khai native player, video, quiz, notes, review, AI summary và practical locked card.
- [x] Đã kiểm tra TypeScript, ESLint và `git diff --check` trong `educodeai-mobile` (0 error; còn 6 warning có sẵn ngoài blocker).
- [x] Đã đối chiếu bản web `NoiDungKhoaHoc.tsx`, `DanhSachBaiHoc.tsx`, `NoiDungVideo.tsx`, `BaiTapTracNghiem.tsx`, `DanhGia.tsx`, `TomTatVideoAI.tsx` với native.
- [x] Theory lesson tự ghi nhận hoàn thành khi mở, không còn nút hoàn thành thủ công như semantics mobile trước đó.
- [x] Quiz đạt yêu cầu gọi lưu tiến độ bài học, khớp web: chỉ hoàn thành bài sau khi nộp đạt.
- [x] Đã rà soát gap so với web: quiz gắn sau video, điều hướng lùi, đọc review trước khi hoàn thành khóa học.
- [x] Native review vẫn khóa quyền viết trước khi hoàn thành nhưng cho phép mở modal xem tổng quan review.
- [x] Practical/IDE giữ desktop-only và không đánh dấu hoàn thành giả trên mobile.
- [x] Đã kiểm tra bằng TypeScript, ESLint và `git diff --check`; các cảnh báo lint không thuộc Learning blocker.
- [x] Semantics quiz/progress đã quyết định theo web và controller: chỉ quiz đạt mới gọi hoàn thành bài.
- [x] Các kiểm thử API/thiết bị còn phụ thuộc môi trường chạy thật được chuyển thành bước nghiệm thu, không còn là gap triển khai code.


- Public route nhận `courseId`; module tự quản lý `lessonId`/quiz.
- Endpoint đã test, mục VERIFY và lỗi còn lại.
