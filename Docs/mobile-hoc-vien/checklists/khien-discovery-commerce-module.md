# Khiến — Module Discovery & Commerce

## Phạm vi end-to-end

Home, tìm/danh sách khóa học, khóa học của tôi, chi tiết khóa học, đăng ký miễn phí, thanh toán QR/voucher, quà tặng và hỗ trợ thanh toán.

## Đọc trước

- Web `TrangChu.tsx`, danh sách khóa học, khóa học của tôi và chi tiết.
- `MuaKhoaHoc.tsx`, page quà tặng.
- `chi-tiet-khoa-hoc.service.ts`, `khoa-hoc-da-mua-hoc-vien.service.ts`, `thanh-toan-khoa-hoc.service.ts`.
- Controller khóa học/chi tiết/thanh toán tương ứng.
- [Discovery specification](../03-course-discovery-va-commerce.md) và [design system](../08-design-system-va-ui-sync.md).

## Endpoint đã xác minh từ web

- Home courses: `api/KhoaHoc/all`.
- Home reviews/instructors: endpoint trong `TrangChu.tsx`.
- Khóa đã mua: `/api/hocvien/khoa-hoc-da-mua`.
- Chi tiết/đánh giá/đăng ký: `/api/hocvien/chitietkhoahoc/...`.
- Commerce: contract trong `thanh-toan-khoa-hoc.service.ts`.

## Checklist triển khai

### Contract và service
- [ ] Xác minh response thực tế, Axios unwrap và media URL.
- [ ] Tạo DTO/service adapter cho toàn module.
- [ ] Không tạo service song song cho cùng endpoint.

### UI và flow
- [ ] Home, search/filter, course cards và khóa học của tôi.
- [ ] Chi tiết: media, mục tiêu, giảng viên, chương, rating, CTA.
- [ ] CTA học/đăng ký/mua theo trạng thái backend.
- [ ] QR/voucher/gift/status polling; dừng polling khi background/unmount.
- [ ] Màu cam, icon book/play/star/cart/gift và card style theo web/design system.

### Test
- [ ] Free, paid, owned, unavailable.
- [ ] Empty/search/no result, media lỗi.
- [ ] QR hết hạn/thành công/API lỗi/background.

## Bàn giao

- Public route/params cho `courseId` và ownership state.
- Endpoint đã test, mục VERIFY và lỗi còn lại.
