# Khám phá khóa học và thương mại

## Đọc trước

- `educodeai-client/src/pages/hoc-vien/trang-chu/TrangChu.tsx`
- `educodeai-client/src/pages/hoc-vien/danh-sach-khoa-hoc/DanhSachKhoaHoc.tsx`
- `educodeai-client/src/pages/hoc-vien/khoa-hoc-cua-toi/KhoaHocCuaToiHocVien.tsx`
- `educodeai-client/src/pages/hoc-vien/chi-tiet-khoa-hoc/ChiTietKhoaHoc.tsx`
- `educodeai-client/src/services/chi-tiet-khoa-hoc.service.ts`
- `educodeai-client/src/pages/hoc-vien/mua-khoa-hoc/MuaKhoaHoc.tsx`
- `educodeai-client/src/services/thanh-toan-khoa-hoc.service.ts`

## Trải nghiệm mobile

- Home ưu tiên “học tiếp”, khóa đang học và khám phá; không sao chép bố cục desktop.
- Danh sách dùng card một cột/hai cột tùy chiều rộng, tìm/lọc dễ chạm.
- Chi tiết gồm ảnh/video giới thiệu, mô tả, kết quả học, giảng viên, chương, rating và CTA cố định.
- CTA phụ thuộc trạng thái: học ngay, đăng ký miễn phí hoặc mua.
- QR/voucher/quà tặng dùng bottom sheet/màn hình riêng; polling dừng khi app nền và kiểm tra lại khi foreground.

## Checklist

### Đọc và xác minh
- [ ] Trong từng page, lần theo chính xác service được import; không đoán endpoint danh sách/Home.
- [ ] Xác minh DTO chi tiết và trạng thái `khoaHocDaDangKy`/`daMua`/`choPhepMua`.
- [ ] Xác minh media URL cần ghép base URL hay là URL tuyệt đối.
- [ ] Đọc controller thanh toán trước khi port polling và voucher.

### Thực hiện
- [ ] Tạo service native + DTO cho Home/list/detail/my-courses.
- [ ] Tạo component CourseCard dùng chung.
- [ ] Làm Home, danh sách, khóa của tôi và chi tiết.
- [ ] Kết nối đăng ký khóa miễn phí.
- [ ] Port thanh toán QR/voucher/quà tặng sau khi luồng xem/học chạy ổn.
- [ ] Có loading skeleton, empty, error và retry.

### Kiểm thử
- [ ] Khóa miễn phí, khóa trả phí, đã mua và không cho phép mua.
- [ ] QR hết hạn, thanh toán thành công, polling bị lỗi và app foreground lại.
- [ ] Không polling sau unmount/background.

## Lưu ý

API thanh toán đã có; đây không phải việc viết backend mới. Tuy nhiên phát hành store có thể áp dụng chính sách mua nội dung số. Điều đó không ngăn nhóm port luồng để demo source nội bộ, nhưng phải được đánh dấu trước khi release production.
