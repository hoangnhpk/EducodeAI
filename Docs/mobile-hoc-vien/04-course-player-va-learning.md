# Course player và quá trình học

## Đọc trước

- `educodeai-client/src/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHoc.tsx`
- `educodeai-client/src/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO.ts`
- Các component: `DanhSachBaiHoc`, `NoiDungVideo`, `NoiDungLyThuyet`, `DieuHuongNhanh`, `SidebarGhiChu`, `SidebarGhiChuAI`, `TomTatVideoAI`
- `educodeai-client/src/services/khoa-hoc.service.ts`
- `educodeai-client/src/services/video-ai.service.ts`

## Tái sử dụng

- `layDuLieuKhoaHoc`, `layDanhSachGhiChu`, `luuGhiChu`, `luuTienDo`.
- Logic làm phẳng bài, tìm bài trước/sau và tính tiến độ có thể port thành utility thuần TypeScript.
- DTO chương/bài/nội dung/quiz phải bám response hiện có.

## UX đề xuất

- Header gọn với tên khóa, tiến độ và nút mở danh sách bài.
- Danh sách chương/bài là màn hình hoặc bottom sheet, không dùng sidebar desktop.
- Nội dung theo loại: video, lý thuyết, quiz hoặc practical desktop-only.
- Nút bài trước/sau dễ chạm và không che nội dung.
- Ghi chú/tóm tắt/AI là tab hoặc sheet phụ; lỗi AI không ảnh hưởng nội dung chính.

## Checklist

### Đọc và xác minh
- [ ] Đọc DTO và toàn bộ switch chọn loại nội dung trong player web.
- [ ] Xác minh cách backend xác định quyền sở hữu, bài khóa và bài đã xem.
- [ ] Xác minh video URL/YouTube và thư viện Expo cần dùng; không tự thêm dependency trước khi kiểm tra package.
- [ ] Xác minh lúc nào web gọi `luuTienDo` và ý nghĩa `ThoiGianHoc`, `DaXem`.

### Thực hiện
- [ ] Tạo course-player service/DTO native.
- [ ] Port utility điều hướng bài thành module thuần TS.
- [ ] Làm chapter/lesson list và trạng thái hoàn thành.
- [ ] Làm renderer lý thuyết và video.
- [ ] Làm lưu tiến độ, retry an toàn và refresh khi quay lại app.
- [ ] Làm ghi chú nếu P0 player ổn.
- [ ] Với practical/IDE, chỉ hiển thị thông báo cần máy tính; không import editor/runner.

### Kiểm thử
- [ ] Khóa nhiều chương, chương rỗng, bài đầu/cuối.
- [ ] Video và lý thuyết; mất mạng giữa lúc học.
- [ ] Tiến độ được phản ánh sau mở lại màn hình.
- [ ] Chọn practical không thay đổi điểm/tiến độ giả.

## Done

Học viên mở một khóa sở hữu, chọn bài, xem video/lý thuyết, chuyển bài và thấy tiến độ được backend lưu; practical không tải công cụ chạy code.
