# Đặc tả trải nghiệm mobile dành cho học viên EduCodeAI

> **Trạng thái:** Đề xuất sản phẩm/kỹ thuật, dựa trên bằng chứng mã nguồn hiện tại  
> **Nguyên tắc:** Mobile chỉ phục vụ học viên (`VaiTro = 2`); quiz được hỗ trợ, bài thực hành IDE không được hỗ trợ.

## 1. Mục đích và phạm vi

Tài liệu xác định phạm vi, điều hướng, hành vi xác thực, yêu cầu UX và tiêu chí nghiệm thu cho:

- Ứng dụng native Expo/React Native trong `Mobile`.
- Web học viên khi hiển thị trên điện thoại/tablet, nếu sản phẩm quyết định áp dụng cùng chính sách mobile.
- Chính sách backend ngăn Giảng viên/Quản trị viên tạo hoặc sử dụng phiên mobile.

Không xem mobile là bản thu nhỏ của toàn bộ website. Trọng tâm là **học, làm trắc nghiệm, theo dõi tiến độ và sử dụng AI**.

## 2. Cơ sở hiện trạng

- Vai trò backend: `0` Quản trị viên (QTV), `1` Giảng viên (GV), `2` Học viên (HV), khai báo tại `educodeai-server/Models/NguoiDungModel.cs`.
- Web đã có đầy đủ route học viên trong `educodeai-client/src/router/index.tsx`; `/khong-gian-hoc-tap` là dashboard học tập chính.
- Course player `NoiDungKhoaHoc.tsx` có video, lý thuyết, quiz, IDE, ghi chú, AI, đánh giá và chứng chỉ.
- Native app hiện hẹp hơn đáng kể; route thấy rõ gồm `phong-van-do-an.tsx`, `thu-thach.tsx`, cùng các service AI/thử thách.
- `educodeai-mobile/src/features/auth/context/AuthContext.tsx` mới lưu `token` và `user` bằng AsyncStorage; chưa có refresh-cookie bootstrap, OTP, social login, đăng ký hoặc route guard theo vai trò tương đương web.
- Web responsive học viên đã có navbar thu gọn; dashboard GV/QTV chỉ reflow CSS, chưa có chặn mobile thực sự.
- Không tìm thấy notification center, thư viện chứng chỉ, lịch sử đơn hàng hoặc support center độc lập cho học viên.

## 3. Ma trận actor và thiết bị

| Actor | Native/mobile web học viên | Desktop web | IDE trên mobile | IDE trên desktop |
|---|---|---|---|---|
| Chưa đăng nhập | Chỉ public/auth | Theo route công khai | Chặn | Theo chính sách công khai |
| HV (`2`) | Cho phép tính năng được duyệt | Cho phép theo quyền hiện hành | Chặn | Cho phép khi sở hữu khóa học/đủ điều kiện |
| GV (`1`) | Chặn toàn bộ phiên nghiệp vụ | Khu vực GV; hiện QTV cũng có thể vào | Chặn | Theo quyền hiện hành |
| QTV (`0`) | Chặn toàn bộ phiên nghiệp vụ | Khu vực QTV và quyền GV hiện hành `[0,1]` | Chặn | Theo quyền hiện hành |

> Phân quyền phải được thực thi phía server. Ẩn menu, CSS, viewport hoặc User-Agent không phải biện pháp bảo mật đủ mạnh.

## 4. Kiểm kê tính năng học viên hiện có

| Nhóm | Bằng chứng hiện có | Phân loại mobile |
|---|---|---|
| Đăng nhập, OTP thiết bị, CAPTCHA, social login, refresh token | `XacThucController.cs`, `XacThucService.cs`, auth web | **Giữ**, cần hoàn thiện native |
| Đăng ký HV email → OTP → lưu DB | `DangKy.tsx`, `/dang-ky`, `/xac-minh-dang-ky` | **Giữ** |
| Quên/đặt lại/đổi mật khẩu | `QuenMatKhau.tsx`, API xác thực | **Giữ** |
| Trang chủ, chi tiết khóa học | `/`, `/khoa-hoc/:id` | **Giữ** |
| Checkout, QR, voucher, quà tặng, hỗ trợ thanh toán | `MuaKhoaHoc.tsx`, payment service | **Điều chỉnh**, phụ thuộc chính sách store |
| Không gian học tập, khóa đã mua, tiến độ | `/khong-gian-hoc-tap` | **Giữ**, đơn giản hóa skill tree/drawer |
| Video, lý thuyết, điều hướng bài | Course player | **Giữ** |
| Quiz trong bài học | `BaiTapTracNghiem.tsx` | **Giữ đầy đủ** |
| IDE/thực hành | `BaiTapThucHanh.tsx`, service thực hành | **Loại khỏi mobile/desktop-only** |
| Ghi chú, ghi chú AI, tóm tắt video, AI Q&A | Components trong course player | **Giữ** |
| Đánh giá, thi/chứng chỉ | `DanhGia.tsx`, `TabChungChi.tsx` | **Điều chỉnh cho màn hình nhỏ** |
| Lộ trình AI/cá nhân/khám phá | Các route và `aiRoadmap.service.ts` | **Giữ**, dùng timeline dọc |
| Phỏng vấn AI, sinh/phỏng vấn đồ án | Web routes; native đã có phỏng vấn đồ án | **Giữ/đề xuất mở rộng** |
| Thử thách, xếp hạng, danh hiệu | Web route và native `thu-thach.tsx` | **Giữ** |
| Hồ sơ, mật khẩu, thiết bị | `/profile`, `/bao-mat`, `/thiet-bi` | **Giữ** |
| Nhập/lịch sử mã quà tặng | Route học viên hiện có | **Giữ** |
| Notification center, order history, certificate library, support center | Không tìm thấy route/module độc lập | **Không tuyên bố hiện có; đề xuất hậu MVP** |
| Các page cũ/không đăng ký route | Course list, IDE độc lập, lịch sử bài làm, profile cũ | **Không đưa vào navigation MVP** |

## 5. Phân loại giữ, điều chỉnh, loại bỏ

### Giữ

- Xác thực HV, quản lý phiên/thiết bị, hồ sơ và bảo mật.
- Khóa học sở hữu; video, lý thuyết, quiz, tiến độ.
- Ghi chú, tóm tắt video AI và trợ lý AI.
- Lộ trình AI, phỏng vấn, đồ án và thử thách theo API hiện có.
- Quà tặng và chứng chỉ trong ngữ cảnh khóa học.

### Điều chỉnh

- Skill tree → timeline/danh sách dọc; drawer → màn hình hoặc bottom sheet.
- Checkout → luồng ngắn; QR mở app ngân hàng và kiểm tra lại khi foreground.
- Thi chứng chỉ → tự lưu, dùng thời gian server, chịu được app background.
- Bảng xếp hạng/bảng dữ liệu → danh sách một cột.
- Đoạn mã lý thuyết → đọc, cuộn ngang có chủ đích và sao chép; không thực thi.
- Lịch sử bài làm → nếu triển khai, ưu tiên kết quả quiz; IDE chỉ đọc hoặc chuyển desktop.

### Loại bỏ/desktop-only

- IDE, runner, terminal, soạn mã nhiều file và nộp bài thực hành từ mobile.
- Đăng ký GV, quét CCCD, theo dõi/bổ sung hồ sơ GV.
- Toàn bộ dashboard và nghiệp vụ GV/QTV.
- Các implementation cũ/trùng lặp hoặc chưa đăng ký route.

## 6. Xác thực và đăng ký

### Học viên

1. Đăng nhập thường hoặc social.
2. Backend kiểm tra thông tin, CAPTCHA, OTP và thiết bị theo luồng hiện hành.
3. Chỉ tạo/trả phiên mobile khi vai trò server là `2`.
4. Mobile chỉ lưu token/user sau bước kiểm tra vai trò thành công.
5. Thiết bị mới hoặc vượt giới hạn thiết bị phải hỗ trợ OTP/thay thế thiết bị.
6. Bootstrap/refresh phải xác minh lại phiên và vai trò trước khi render navigator.

Đăng ký mobile chỉ có **đăng ký học viên**: nhập dữ liệu → gửi OTP → xác minh OTP → lưu tài khoản. Không có bộ chọn vai trò; tài khoản social mới cũng chỉ được tạo là HV theo hành vi backend hiện tại.

### Từ chối GV/QTV trên mobile

Backend không trả access/refresh token và trả mã nghiệp vụ riêng, khuyến nghị `MOBILE_ROLE_NOT_ALLOWED`. Mobile phải xóa token/user cũ và hiển thị:

> **Tài khoản Giảng viên và Quản trị viên chỉ được đăng nhập trên phiên bản máy tính. Vui lòng truy cập EduCodeAI bằng trình duyệt trên máy tính để tiếp tục.**

Chỉ cung cấp “Đã hiểu”, “Quay lại trang công khai” và/hoặc “Đăng xuất”; không có “Vẫn tiếp tục”. Nếu vai trò đổi sau khi đã đăng nhập, lần bootstrap/refresh/API kế tiếp phải đóng nội dung và đăng xuất an toàn.

## 7. Điều hướng mobile đề xuất

> Các mục dưới đây là **đề xuất**, không phải toàn bộ đều đã tồn tại trong native app.

| Tab | Nội dung |
|---|---|
| **Khám phá** | Trang chủ, tìm/lọc khóa học, chi tiết khóa học, khám phá lộ trình; checkout nếu chính sách store cho phép |
| **Học tập** | Học tiếp, khóa học của tôi, lộ trình của tôi, tiến độ, course player |
| **AI & Thử thách** | Lộ trình AI, phỏng vấn AI, sinh/phỏng vấn đồ án, nhiệm vụ, xếp hạng, danh hiệu |
| **Tài khoản** | Hồ sơ, đổi mật khẩu, thiết bị, mã quà tặng, liên hệ, đăng xuất |

Không tạo tab Thông báo ở MVP vì chưa có notification center được chứng minh trong dự án.

## 8. Luồng màn hình đề xuất

```text
Khởi động → Khôi phục phiên → Kiểm tra role/device
  ├─ Chưa có phiên → Đăng nhập / Đăng ký HV / Quên mật khẩu / OTP
  ├─ Role 0/1 → Thông báo chỉ hỗ trợ máy tính → Xóa phiên
  └─ Role 2 → Ứng dụng học viên

Học tập → Học tiếp/Khóa học của tôi → Chi tiết → Course player
  → Chọn video/lý thuyết → Học → Ghi chú/Hỏi AI → Cập nhật tiến độ
  → Chọn quiz → Lưu nháp → Nộp idempotent → Kết quả → Bài tiếp theo
  → Chọn thực hành → Màn hình “Cần máy tính” → Quay lại/Đánh dấu làm sau
```

Course player dùng header gọn, danh sách bài ở bottom sheet/màn hình riêng, nút bài trước/sau cố định và các mục **Nội dung – Ghi chú – Bài tập – Hỏi AI**.

## 9. Quy tắc học tập: quiz có, IDE không

- Quiz được tải, lưu nháp, nộp và đồng bộ tiến độ trên mobile.
- Mất mạng không được nộp lặp; dùng idempotency key và trạng thái server.
- Khi chọn bài thực hành, không mount/tải editor, terminal hoặc runner; hiển thị:

> **Bài thực hành lập trình chỉ được hỗ trợ trên máy tính. Tiến độ bài học của bạn đã được giữ nguyên. Vui lòng mở khóa học trên máy tính để tiếp tục.**

- Có thể cho xem đề, ví dụ và input/output mẫu, nhưng không chạy/nộp mã.
- Không tự hoàn thành, bỏ qua điều kiện tiên quyết, thay đổi điểm hoặc số lần nộp.
- Nếu bài thực hành bắt buộc để mở bài sau, thông báo rõ và đồng bộ ngay sau khi hoàn thành trên desktop.
- API chạy/chấm/nộp practical từ phiên mobile trả `403` và `MOBILE_PRACTICE_NOT_SUPPORTED` trước khi tạo execution job hoặc lộ test ẩn.

## 10. URL trực tiếp, deep link và đổi thiết bị

- URL bảo vệ khi chưa đăng nhập → đăng nhập; chỉ lưu `returnUrl` hợp lệ cho HV mobile.
- URL/deep link GV, QTV hoặc IDE → chặn trước khi render/gọi API dữ liệu; không màn hình trắng hoặc redirect loop.
- “Request Desktop Site”, landscape hoặc thay viewport không được vượt chính sách.
- Token desktop bị sao chép sang mobile vẫn phải bị server từ chối theo phiên/kênh.
- Token HV bị đổi role thành GV/QTV → logout ở bootstrap/refresh kế tiếp.
- Phiên hiện tại bị thu hồi từ thiết bị khác → xóa dữ liệu nhạy cảm, đóng màn hình và về đăng nhập.
- Tiến độ/prerequisite thay đổi trên desktop → làm mới khi app foreground.
- Phân loại thiết bị không nên chỉ dựa vào viewport/User-Agent; cần chính sách phiên/kênh do server quản lý. Trường hợp không chắc chắn phải chặn capability desktop-only.

## 11. Yêu cầu responsive và khả dụng

- Không cuộn ngang từ 320px, trừ code/table được thiết kế cuộn.
- Touch target tối thiểu xấp xỉ `44×44px`; dropdown không phụ thuộc hover.
- Navbar, modal, drawer có semantics/ARIA phù hợp và cuộn trong viewport.
- Bàn phím ảo không che trường, lỗi hoặc CTA; lỗi nằm gần trường.
- Portrait/landscape không mất phiên, form, nháp quiz hoặc vị trí video.
- Video có thể toàn màn hình ngang; thoát ra đúng bài và thời điểm.
- Zoom 200%, VoiceOver/TalkBack vẫn đọc được tiêu đề, lỗi và thông báo chặn.
- Không flash nội dung GV/QTV/IDE trong lúc bootstrap hoặc mạng chậm.
- Không render nội dung bị cấm rồi mới ẩn bằng CSS.

## 12. Yêu cầu chức năng

| ID | Yêu cầu |
|---|---|
| FR-01 | Chỉ vai trò server `2` được tạo/khôi phục phiên mobile |
| FR-02 | Mobile hỗ trợ đăng ký HV, OTP, quên mật khẩu và thay thế thiết bị |
| FR-03 | HV xem khóa sở hữu, video/lý thuyết, quiz và tiến độ |
| FR-04 | Quiz lưu nháp, nộp idempotent và xử lý offline/foreground an toàn |
| FR-05 | IDE/practical bị chặn ở route, UI và API; không thay đổi tiến độ |
| FR-06 | Deep link/URL trực tiếp áp dụng cùng guard như navigation |
| FR-07 | Mobile hỗ trợ hồ sơ, đổi mật khẩu và quản lý thiết bị |
| FR-08 | Tiến độ và prerequisite được đồng bộ khi app foreground |
| FR-09 | Tính năng AI lỗi/chưa xử lý không được khóa nội dung gốc |
| FR-10 | Checkout chỉ phát hành sau khi quyết định chính sách App Store/Google Play |

## 13. Yêu cầu phi chức năng

- **Bảo mật:** role lấy từ JWT/server; không tin AsyncStorage/localStorage hoặc header tự khai báo duy nhất.
- **Riêng tư:** không log token, cookie, mật khẩu, OTP hay toàn bộ source code.
- **Quan sát:** log user ID, role, route/API, phân loại thiết bị, lý do từ chối, timestamp/correlation ID.
- **Hiệu năng:** IDE bundle không được tải trên mobile; lazy-load media/AI; tránh polling khi app nền.
- **Tin cậy:** submit quiz và cập nhật tiến độ chống trùng; khôi phục an toàn sau mất mạng.
- **Tương thích:** Android/iOS và mobile web theo phạm vi đã chốt; tablet mặc định vẫn là mobile cho policy capability.
- **Không hồi quy:** desktop web và quyền hiện hành không bị ảnh hưởng ngoài chính sách được phê duyệt.

## 14. Tiêu chí nghiệm thu

1. HV đăng nhập và dùng chức năng mobile được hỗ trợ; không thấy menu GV/QTV.
2. GV/QTV không nhận token mobile, không tải API nghiệp vụ và thấy đúng thông báo.
3. Role local bị sửa không vượt được kiểm tra server.
4. Bootstrap hoàn tất trước khi render route bảo vệ; không flash dữ liệu.
5. URL, bookmark, back/forward và deep link không vượt guard.
6. Quiz hoạt động trên mobile; mất mạng không tạo lần nộp trùng.
7. Practical/IDE không mount, không tải runner, không chạy/nộp hoặc giả hoàn thành.
8. Chặn IDE không đổi tiến độ, điểm, mã lưu hoặc số lần làm.
9. Hoàn thành practical trên desktop được phản ánh trên mobile khi đồng bộ.
10. Thu hồi/đổi phiên hoặc đổi role khiến app đóng nội dung và logout an toàn.
11. Không redirect loop tại trang chặn/đăng xuất/lỗi.
12. Responsive và accessibility đạt checklist bên dưới.

## 15. Checklist kiểm thử

### Vai trò và phiên

- [ ] HV đăng nhập trên Android/iPhone và vào Không gian học tập.
- [ ] GV và QTV bị từ chối trước khi lưu token/user.
- [ ] QTV mở route GV hoặc route học viên `[0,1,2]` vẫn bị chặn trên mobile.
- [ ] Token GV/QTV đưa vào AsyncStorage bị xóa khi bootstrap.
- [ ] Role local sửa thành `2` vẫn bị server từ chối.
- [ ] OTP hết hạn/gửi lại, thiết bị mới/thay thế thiết bị hoạt động đúng.
- [ ] Phiên bị thu hồi/role thay đổi dẫn đến logout an toàn.

### Học và IDE

- [ ] Video, lý thuyết, ghi chú, AI Q&A và quiz hoạt động.
- [ ] Quiz offline lưu nháp; submit retry không trùng.
- [ ] Chọn practical hoặc URL IDE hiện thông báo desktop-only.
- [ ] Landscape/Request Desktop Site không vượt chặn.
- [ ] API runner/practical mobile trả `403` và mã thống nhất.
- [ ] Chặn không thay đổi điểm, tiến độ, lần nộp hoặc mã đã lưu.
- [ ] Desktop vẫn chạy IDE và đồng bộ kết quả về mobile.

### Responsive/accessibility

- [ ] Kiểm thử 320, 360, 390, 414, 768, 1024px; portrait/landscape.
- [ ] Không cuộn ngang ngoài vùng có chủ đích.
- [ ] Navbar/dropdown/modal hoạt động bằng touch và screen reader.
- [ ] Zoom 200% không che CTA/thông báo.
- [ ] Bàn phím ảo không che form.
- [ ] Mạng chậm/mất mạng không flash nội dung cấm hoặc tạo vòng lặp.

### Hồi quy/backend

- [ ] Unit/integration test policy mobile-role và mobile-practical.
- [ ] Route-guard/E2E test URL trực tiếp, returnUrl và deep link.
- [ ] API GV/QTV vẫn xác thực JWT/role độc lập với client guard.
- [ ] Log từ chối đủ trường và không chứa bí mật.
- [ ] Desktop hiện hữu vẫn hoạt động.

## 16. Ưu tiên triển khai

| Giai đoạn | Phạm vi |
|---|---|
| **MVP – Học cốt lõi** | Auth/refresh/OTP/device, guard role, 4-tab shell, khóa đã mua, video/lý thuyết/quiz, tiến độ, ghi chú, AI Q&A, hồ sơ, mật khẩu, thiết bị, thử thách, placeholder IDE desktop-only |
| **Giai đoạn 2 – AI và hoàn thiện học tập** | Lộ trình AI, phỏng vấn, sinh/phỏng vấn đồ án, tóm tắt/ghi chú AI, chứng chỉ, quà tặng |
| **Giai đoạn 3 – Khám phá/thương mại/nâng cao** | Danh mục/tìm kiếm, checkout sau quyết định store, hỗ trợ thanh toán, offline learning, push/inbox tối thiểu, lịch sử giao dịch/bài làm và tối ưu tablet |

## 17. Ngoài phạm vi

- Nghiệp vụ và navigation GV/QTV trên mobile.
- Đăng ký/bổ sung hồ sơ GV, quét CCCD.
- IDE, terminal, runner và nộp practical trên mobile.
- Sao chép nguyên dashboard/sidebar desktop sang mobile.
- Notification center, ticket center, order history hoặc certificate library đầy đủ khi chưa có module hiện hữu.
- Proctoring/camera cho thi chứng chỉ, DRM/offline download, IAP hoặc public certificate verification cho đến khi có quyết định riêng.
- Hợp nhất/xóa các page web cũ, dormant hoặc trùng lặp.

## 18. Câu hỏi mở và giả định

### Cần quyết định

1. “Mobile” gồm native app, mobile browser hay cả hai? Nếu gồm web, phải bổ sung guard thiết bị; hiện web chưa chặn.
2. Kênh/phiên mobile được backend nhận diện bằng cơ chế nào? Mức chống giả mạo cần đạt đến đâu?
3. Tablet luôn là mobile hay có ngoại lệ? Khuyến nghị policy theo capability: IDE/GV/QTV vẫn desktop-only.
4. GV/QTV có bị cấm hoàn toàn trên mobile, kể cả muốn dùng chức năng học viên? Tài liệu giả định **có**.
5. Mua nội dung số dùng IAP, checkout web hay không bán trong native app?
6. Quiz/chứng chỉ có hẹn giờ, cấm rời app, camera/proctoring hay giới hạn thiết bị không?
7. Phỏng vấn AI hỗ trợ text, audio hay video; xử lý quyền mic/camera thế nào?
8. Offline learning có cần video/lý thuyết/quiz tải trước, DRM và giải quyết xung đột không?
9. Cần push notification hay inbox lưu lịch sử? Hiện chưa có notification center được chứng minh.
10. Lịch sử bài làm mobile gồm quiz בלבד hay cả kết quả IDE desktop ở chế độ chỉ đọc?

### Giả định làm việc

- Backend hiện có vẫn là nguồn sự thật về role, quyền khóa học, tiến độ và kết quả.
- Tài khoản tạo mới qua standard/social là HV (`VaiTro = 2`).
- Quiz và practical có thể phân biệt tin cậy ở server.
- Mobile không được bỏ qua practical bắt buộc; chỉ hướng dẫn tiếp tục trên desktop.
- Mọi mục được gọi là “đề xuất” cần được xác nhận sản phẩm và kiểm chứng API trước triển khai.
