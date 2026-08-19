# ADR-001: Native mobile tái sử dụng contract hiện có

## Status

Accepted

## Date

2026-08-13

## Context

EduCodeAI đã có backend và trải nghiệm học viên trên web, trong khi native Expo mới có một số màn hình AI/thử thách và auth state cơ bản. Nhóm có bốn thành viên và cần hoàn thiện nhanh. Rủi ro lớn nhất là AI agent tạo endpoint/DTO/logic mới dù hệ thống đã có implementation tương ứng, dẫn đến lệch contract và xung đột.

## Decision

- Backend là nguồn sự thật về nghiệp vụ, quyền và dữ liệu.
- Service/page web là bằng chứng về contract và hành vi hiện đang được sử dụng.
- Native chỉ xây UI/UX mobile, navigation, state và service adapter cần thiết.
- Mọi nhiệm vụ phải đọc code liên quan trước; endpoint chưa xác minh mang nhãn `VERIFY`.
- Không mở rộng backend trong đợt tài liệu/port FE này trừ khi lỗi tích hợp được tái hiện và cả nhóm thống nhất.
- IDE, terminal, runner và nộp practical là desktop-only; quiz vẫn được port.
- Native mobile chỉ phục vụ học viên (`VaiTro = 2`); web desktop tiếp tục phục vụ học viên, giảng viên và quản trị viên.
- Mobile chỉ có navigation học viên. GV/QTV không được giữ phiên mobile và phải được hướng dẫn sử dụng web desktop.
- Ẩn route/menu là UX guard, không thay thế kiểm tra JWT/role tại backend/API.

## Alternatives Considered

- Viết API mobile mới: bị loại vì trùng nghiệp vụ, tăng phạm vi và rủi ro.
- Nhúng web bằng WebView: bị loại vì không đạt mục tiêu UX native và khó kiểm soát navigation/state.
- Sao chép nguyên component React web: bị loại vì DOM/CSS/browser APIs không tương thích React Native.

## Consequences

### Tích cực

- Giảm việc viết lại và sai lệch nghiệp vụ.
- Chia việc theo feature độc lập cho bốn người.
- Có thể đối chiếu nhanh lỗi native với web/backend.

### Đánh đổi

- Phải dành thời gian đọc và xác minh source trước khi sinh code.
- Một số contract web phụ thuộc cookie, `File`, `window` hoặc Axios unwrap nên cần adapter native.
- Các điểm không rõ phải dừng ở `VERIFY`, không được lấp bằng giả định.
