# Kiểm kê code và API

> **Trạng thái:** Canonical inventory. Endpoint chỉ được xem là xác minh khi có service/controller được dẫn nguồn.

## Native hiện có

| Phần | Nguồn | Trạng thái |
|---|---|---|
| Axios + bearer token | `educodeai-mobile/src/shared/configs/api.ts` | Có; base URL đang hard-code IP LAN, cần cấu hình môi trường |
| Auth state | `educodeai-mobile/src/features/auth/context/AuthContext.tsx` | Có lưu token/user; chưa tương đương auth bootstrap web |
| Phỏng vấn đồ án | `educodeai-mobile/src/app/phong-van-do-an.tsx` | Có màn hình |
| Thử thách | `educodeai-mobile/src/app/thu-thach.tsx` | Có màn hình |
| Chatbot | `educodeai-mobile/src/features/ai-engagement/components/chat-bot.tsx` | Có component |
| AI roadmap/chat/interview/challenge services | `educodeai-mobile/src/features/ai-engagement/services/*` | Có một phần; phải test contract |
| Course/auth/profile/payment/player | Chưa có file native rõ ràng | Cần port UI và service adapter |
| Shared interaction | `educodeai-mobile/src/shared/components/animated-pressable.tsx` | Có; tái sử dụng cho press feedback |

## Nguồn thiết kế UI

- Token canonical: `educodeai-client/src/assets/styles/variables.css`.
- Component/style học viên: `educodeai-client/src/assets/styles/hoc-vien-global.css`.
- Icon web: Bootstrap Icons tại `educodeai-client/src/main.tsx`; native map sang `@expo/vector-icons` theo [design system](08-design-system-va-ui-sync.md).
- Mỗi module phải so sánh màn hình native với page web tương ứng trước khi Done.

## Nguồn web/backend có thể tái sử dụng

| Concern | Page/component tham chiếu | Service/contract |
|---|---|---|
| Auth, OTP, device | các page auth; `QuanLyThietBi.tsx` | `auth.service.ts`, `authBootstrap.ts`, `XacThucController.cs` |
| Home/discovery | `trang-chu/TrangChu.tsx`, `danh-sach-khoa-hoc` | `chi-tiet-khoa-hoc.service.ts` và service được page import — **VERIFY trước code** |
| Khóa học của tôi | `khoa-hoc-cua-toi/KhoaHocCuaToiHocVien.tsx` | service page đang import — **VERIFY tên service/response** |
| Chi tiết/đăng ký | `chi-tiet-khoa-hoc/ChiTietKhoaHoc.tsx` | `chi-tiet-khoa-hoc.service.ts`: GET chi tiết, GET đánh giá, POST đăng ký |
| Thanh toán/quà tặng | `mua-khoa-hoc/MuaKhoaHoc.tsx` | `thanh-toan-khoa-hoc.service.ts` |
| Course player | `noi-dung-khoa-hoc/NoiDungKhoaHoc.tsx` và DTO | `khoa-hoc.service.ts` |
| Quiz/chứng chỉ | `BaiTapTracNghiem.tsx`, `TabChungChi.tsx` | lưu quiz/nộp chứng chỉ trong `khoa-hoc.service.ts` |
| Video AI | `TomTatVideoAI.tsx`, `NoiDungVideo.tsx` | `video-ai.service.ts` |
| Hồ sơ | `ho-so-hoc-vien/*` | `ho-so-hoc-vien.service.ts` |
| AI/thử thách | các page AI, `ThuThach.tsx` | `aiRoadmap.service.ts`, `phong-van-ai.service.ts`, `thu-thach.service.ts` |

## Endpoint đã thấy trực tiếp trong service

- Auth: `/api/XacThuc/dang-ky`, `/xac-minh-dang-ky`, `/dang-nhap`, `/xac-nhan-otp`, `/xac-nhan-thay-the-thiet-bi`, `/refresh-token`, `/dang-xuat`, quên/đặt lại/đổi mật khẩu và danh sách thiết bị.
- Chi tiết: `/api/hocvien/chitietkhoahoc/{id}`, `/{id}/danh-gia`, `/dang-ky`.
- Player: `/api/NoiDungKhoaHoc/{id}`, ghi chú, tiến độ, lưu kết quả quiz và nộp chứng chỉ.
- Thanh toán: thông tin mua, mua ngay, tạo QR/quà tặng, kiểm tra trạng thái, nhập/lịch sử mã và hỗ trợ.
- Hồ sơ: `/api/hoc-vien/ho-so` GET/PUT.
- Video AI: `/api/HocVien/VideoAI/GetVideoInteractive/{id}` và `/PhanTichVideo/{id}`.

## Cảnh báo tái sử dụng

- Web dùng cookie HttpOnly cho refresh; native không mặc nhiên có hành vi cookie giống trình duyệt. Đọc backend trước khi chọn lưu/cookie strategy.
- `review.service.ts` chứa mock admin; không dùng nó làm contract gửi đánh giá học viên.
- `khoa-hoc-cua-toi.service.ts` có nhiều API giảng viên; không suy ra API học viên chỉ từ tên file.
- FormData ảnh web dùng `File`; React Native cần `{ uri, name, type }` phù hợp.
- Axios web có thể unwrap `data`; service native phải kiểm tra response thực tế.
