# Quiz, đánh giá và hồ sơ

## Quiz

### Đọc trước

- `educodeai-client/src/pages/hoc-vien/noi-dung-khoa-hoc/components/BaiTapTracNghiem.tsx`
- `educodeai-client/src/services/khoa-hoc.service.ts`
- `educodeai-client/src/pages/hoc-vien/lich-su-bai-lam/LichSuLamBai.tsx` nếu cần lịch sử

### Tái sử dụng

Payload `LuuKetQuaQuizDTO` gồm bài học, bài tập, người dùng, điểm, số đúng/tổng, trạng thái đạt và chi tiết lựa chọn. Không tự thiết kế payload khác.

### Checklist

- [ ] Đọc cấu trúc câu hỏi/đáp án và cách web xác định đáp án đúng.
- [ ] Xác minh user ID lấy từ token/user hay backend tự nhận diện.
- [ ] Làm chọn đáp án, điều hướng câu, nộp, kết quả và làm lại theo rule hiện có.
- [ ] Chặn double tap khi đang submit; không tuyên bố idempotency server nếu chưa có.
- [ ] Test quiz rỗng, một/nhiều câu, đạt/không đạt, API lỗi.

## Đánh giá

### Đọc trước

- `educodeai-client/src/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhGia.tsx`
- `educodeai-client/src/services/chi-tiet-khoa-hoc.service.ts`
- Controller/repository đánh giá tương ứng — **VERIFY endpoint gửi/sửa/xóa**.

### Checklist

- [ ] Tái sử dụng API lấy đánh giá chi tiết khóa học.
- [ ] Lần theo component `DanhGia.tsx` để xác minh API gửi đánh giá; không dùng `review.service.ts` mock admin.
- [ ] Làm rating, nhận xét, validation và thông báo quyền đánh giá.
- [ ] Test phân trang/lọc nếu đưa lên mobile.

## Hồ sơ và bảo mật

### Đọc trước

- `educodeai-client/src/pages/hoc-vien/ho-so-hoc-vien/*`
- `educodeai-client/src/services/ho-so-hoc-vien.service.ts`
- `educodeai-client/src/services/auth.service.ts`

### Checklist

- [ ] GET/PUT `/api/hoc-vien/ho-so`; map thống kê hồ sơ.
- [ ] Với upload avatar, chuyển `File` web sang FormData React Native đúng `uri/name/type`.
- [ ] Đổi mật khẩu theo endpoint đã xác minh; chú ý code web đang có hơn một endpoint, phải đọc controller để chọn canonical.
- [ ] Quản lý thiết bị và logout từ xa theo checklist auth.
- [ ] Test ảnh thiếu, upload lỗi, mật khẩu sai, phiên bị thu hồi.

## Done

Quiz lưu kết quả thật; đánh giá gọi đúng API học viên; hồ sơ xem/cập nhật được mà không sao chép mock hoặc contract admin.
