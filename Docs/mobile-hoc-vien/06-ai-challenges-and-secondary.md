# AI, thử thách và chức năng phụ

## Nguyên tắc ưu tiên

Các chức năng này đã có code web/native ở nhiều mức khác nhau. Không viết lại chúng nếu màn hình/service native hiện có chạy đúng. Chỉ mở rộng sau khi auth, discovery, player và quiz đã tích hợp được.

## Kiểm kê

| Chức năng | Nguồn tham chiếu | Hành động |
|---|---|---|
| Chatbot | `educodeai-mobile/src/features/ai-engagement/components/chat-bot.tsx`, `tro-ly-ai.service.ts`, web `TroLyAI.tsx` | Test và gắn vào shell; sửa contract nếu cần |
| Thử thách | `educodeai-mobile/src/app/thu-thach.tsx`, `thu-thach.service.ts`, web `ThuThach.tsx` | Giữ code native, kiểm thử auth/navigation |
| Phỏng vấn đồ án | `educodeai-mobile/src/app/phong-van-do-an.tsx`, `phong-van-ai.service.ts` | Giữ và kiểm thử |
| Lộ trình AI | native `ai-roadmap.service.ts`, web `yeu-cau-lo-trinh-ai`, `khoa-hoc-ca-nhan-ai` | **VERIFY** route native và response |
| Tóm tắt/video AI | web `TomTatVideoAI.tsx`, `video-ai.service.ts` | Port vào player; lỗi trả empty/non-blocking |
| Chứng chỉ | `TabChungChi.tsx`, `khoa-hoc.service.ts` | Sau quiz/course player |
| Mã quà tặng | page nhập/lịch sử và payment service | Có API; gắn trong Account/Commerce sau luồng mua |
| Sinh đồ án/phỏng vấn AI khác | các page web tương ứng | Chỉ làm nếu P0/P1 đã hoàn thành |

## Checklist chung

### Đọc và tái sử dụng
- [ ] Trước khi tạo file mới, kiểm tra `educodeai-mobile/src/app`, `src/features/ai-engagement/components`, `src/features/ai-engagement/services` xem đã có chưa.
- [ ] So sánh endpoint native hiện tại với service web/controller.
- [ ] Dùng chung Axios instance và auth interceptor.
- [ ] Không đổi prompt/contract AI nếu không có lỗi được tái hiện.

### UX và tin cậy
- [ ] Loading dài có trạng thái rõ và cho phép quay lại.
- [ ] Timeout/error AI không khóa nội dung học.
- [ ] Markdown/code hiển thị đọc được trên màn hình nhỏ.
- [ ] Không gửi lặp request do double tap.
- [ ] Không log prompt nhạy cảm, token hoặc dữ liệu hồ sơ đầy đủ.

### Kiểm thử
- [ ] Test có/không có dữ liệu, timeout, quota/key lỗi và 401.
- [ ] Màn hình native hiện có vẫn chạy sau khi đổi navigation/auth.
- [ ] AI/challenge không được xem là Done chỉ vì UI mock hiển thị.
