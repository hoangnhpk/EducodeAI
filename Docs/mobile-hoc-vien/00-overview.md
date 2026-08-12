# Mobile học viên EduCodeAI

> **Trạng thái:** Canonical cho đợt triển khai native hiện tại  
> **Nguồn định hướng:** [Đặc tả ban đầu](../../Docs/DAC-TA-TRAI-NGHIEM-MOBILE-HOC-VIEN.md)

## Mục tiêu

Chuyển trải nghiệm học viên đã có trên web sang Expo/React Native. Backend và web hiện có là nguồn tham chiếu; công việc chính là thiết kế UI/UX mobile, tạo adapter service và kiểm thử trên thiết bị. Không viết lại nghiệp vụ hoặc tự tạo endpoint khi chưa đọc code hiện hữu.

## Phạm vi nền tảng

| Nền tảng | Người dùng và nghiệp vụ |
|---|---|
| **Native mobile** | Chỉ dành cho học viên (`VaiTro = 2`) |
| **Web desktop** | Học viên, giảng viên và quản trị viên theo quyền hiện hành |
| **Desktop-only** | IDE, terminal, runner, nộp bài thực hành, dashboard và nghiệp vụ quản trị chuyên sâu |

Mobile chỉ hiển thị navigation học viên. Tài khoản giảng viên hoặc quản trị viên phải được từ chối phiên mobile và được hướng dẫn sử dụng EduCodeAI trên trình duyệt máy tính.

## Nguyên tắc bắt buộc

1. Trước mỗi màn hình, đọc page web, service web và controller/DTO liên quan.
2. Tái sử dụng contract API; chỉ tạo service native để thích nghi Axios/AsyncStorage/FormData.
3. Endpoint chưa xác minh phải ghi `VERIFY`, không đoán request/response.
4. Quiz được hỗ trợ; IDE, terminal, runner và nộp code là desktop-only.
5. Loading, empty, error và retry là một phần của màn hình, không phải việc phụ.
6. Không để AI hoặc thanh toán lỗi làm khóa nội dung học đã sở hữu.
7. Mọi module phải tuân thủ [design system mobile–web](08-design-system-va-ui-sync.md); không tự chọn màu, icon hoặc component style.
8. Ẩn menu không phải phân quyền: API/backend vẫn phải kiểm tra JWT và role theo chính sách hiện hành.
9. Không lưu hoặc khôi phục phiên mobile cho tài khoản không phải học viên.

## Điều hướng tài liệu

- [Kiểm kê code và API](01-inventory-va-api.md)
- [Xác thực và phiên](02-auth-va-session.md)
- [Khám phá khóa học và thanh toán](03-course-discovery-va-commerce.md)
- [Course player và tiến độ](04-course-player-va-learning.md)
- [Quiz, đánh giá và hồ sơ](05-quiz-review-profile.md)
- [AI, thử thách và chức năng phụ](06-ai-challenges-and-secondary.md)
- [Checklist phân công 4 module](07-checklist-phan-cong.md)
- [Design system và đồng bộ UI mobile–web](08-design-system-va-ui-sync.md)
- [ADR: tái sử dụng contract hiện có](decisions/ADR-001-native-mobile-reuse-existing-contracts.md)

## Luồng nghiệm thu chính

Đăng ký/đăng nhập → Home → danh sách hoặc khóa học của tôi → chi tiết → đăng ký/mua nếu cần → học video/lý thuyết → làm quiz → lưu tiến độ → đánh giá/tóm tắt → hồ sơ/đăng xuất.

## Source of truth

- Nghiệp vụ và quyền: backend trong `educodeai-server`.
- Contract đang được web sử dụng: `educodeai-client/src/services` và DTO liên quan.
- Hành vi UX tham chiếu: `educodeai-client/src/pages/hoc-vien`.
- Native implementation: `educodeai-mobile/src`.
- Tài liệu này giải thích phạm vi, ownership và trình tự; không thay thế code.
