# Phân tích nghiệp vụ dự án EduCodeAI

**Vai trò thực hiện:** Business Analyst  
**Phiên bản:** 1.0  
**Ngày lập:** 05/06/2026  
**Phạm vi khảo sát:** `educodeai-client`, `educodeai-server` trong dự án EduCodeAI.

---

## 1. Tổng quan dự án

EduCodeAI là nền tảng học lập trình trực tuyến có tích hợp AI, hướng đến việc hỗ trợ học viên học theo khóa học, làm bài tập, thực hành code, nhận lộ trình học cá nhân hóa và tương tác với trợ lý AI. Hệ thống đồng thời cung cấp công cụ cho giảng viên tạo/quản lý khóa học, bài tập, học viên, doanh thu; và cung cấp khu vực quản trị cho quản trị viên vận hành toàn bộ nền tảng.

Dự án gồm 2 phần chính:

- **Frontend:** React + TypeScript + Vite, tổ chức theo các nhóm màn hình học viên, giảng viên, quản trị viên.
- **Backend:** ASP.NET Core Web API + Entity Framework Core, phân tầng Controller - Service - Repository - DTO - Model.

---

## 2. Mục tiêu nghiệp vụ

| STT | Mục tiêu | Ý nghĩa nghiệp vụ |
|---|---|---|
| 1 | Cung cấp nền tảng học lập trình trực tuyến | Học viên có thể tìm, mua, học khóa học và theo dõi tiến độ. |
| 2 | Cá nhân hóa học tập bằng AI | AI hỗ trợ tạo lộ trình, tóm tắt video, ghi chú, hỏi đáp và tạo bài tập. |
| 3 | Hỗ trợ giảng viên kinh doanh khóa học | Giảng viên có thể tạo nội dung, quản lý học viên, mã giảm giá, quà tặng, doanh thu và rút tiền. |
| 4 | Quản trị vận hành nền tảng | Admin quản lý người dùng, API key AI, thanh toán, rút tiền, đánh giá, cấu hình hệ thống. |
| 5 | Đảm bảo trải nghiệm học tập có kiểm tra đánh giá | Hệ thống hỗ trợ quiz, bài tập thực hành, test case, chứng chỉ và lịch sử bài làm. |

---

## 3. Tác nhân hệ thống

### 3.1. Khách vãng lai

Người chưa đăng nhập, có thể:

- Xem trang chủ.
- Xem danh sách/chi tiết khóa học công khai.
- Đăng ký tài khoản.
- Đăng nhập.
- Quên mật khẩu.

### 3.2. Học viên

Vai trò người học, có thể:

- Mua/đăng ký khóa học.
- Học bài học video/lý thuyết.
- Làm quiz và bài tập thực hành.
- Theo dõi tiến độ học tập.
- Nhận/gửi đánh giá khóa học.
- Yêu cầu lộ trình AI.
- Sử dụng trợ lý AI, tóm tắt video AI, ghi chú AI.
- Quản lý hồ sơ, mật khẩu, thiết bị đăng nhập.
- Nhập mã quà tặng và xem lịch sử mã quà tặng.

### 3.3. Giảng viên

Vai trò người tạo và kinh doanh khóa học, có thể:

- Quản lý khóa học của mình.
- Tạo chương học, bài học, video, quiz, bài tập thực hành.
- Sinh bài tập/quiz/lộ trình bằng AI.
- Quản lý học viên theo khóa học.
- Xem thống kê học tập và doanh thu.
- Tạo mã giảm giá cho khóa học.
- Tặng khóa học cho học viên.
- Cập nhật tài khoản rút tiền và tạo yêu cầu rút tiền.

### 3.4. Quản trị viên

Vai trò quản trị hệ thống, có thể:

- Quản lý người dùng/học viên.
- Khóa/mở khóa tài khoản.
- Quản lý bình luận, review, đánh giá.
- Quản lý API key AI.
- Cấu hình hệ thống và chế độ bảo trì.
- Quản lý thanh toán, hỗ trợ thanh toán học viên.
- Quản lý mã giảm giá, mã quà tặng.
- Duyệt/từ chối yêu cầu rút tiền của giảng viên.
- Xem thống kê toàn hệ thống.

---

## 4. Phạm vi chức năng

### 4.1. Nhóm chức năng xác thực và tài khoản

**Mục tiêu:** Cho phép người dùng truy cập hệ thống an toàn theo đúng vai trò.

Chức năng chính:

- Đăng ký tài khoản.
- Đăng nhập bằng tài khoản/mật khẩu.
- Đăng nhập Google/Facebook theo DTO backend.
- Quên mật khẩu/OTP.
- Đổi mật khẩu.
- Quản lý hồ sơ cá nhân.
- Quản lý phiên đăng nhập/thiết bị.
- Phân quyền theo vai trò:
  - `0`: Quản trị viên.
  - `1`: Giảng viên.
  - `2`: Học viên.

Dữ liệu liên quan:

- `NguoiDungModel`
- `PhienDangNhapModel`

### 4.2. Nhóm chức năng khóa học

**Mục tiêu:** Quản lý vòng đời khóa học từ tạo nội dung đến học tập và đánh giá.

Chức năng phía học viên:

- Xem danh sách khóa học.
- Xem chi tiết khóa học.
- Mua khóa học.
- Xem khóa học đã mua.
- Vào không gian học tập.
- Xem nội dung bài học gồm video/lý thuyết.
- Ghi chú bài học.
- Đánh giá khóa học.
- Nhận chứng chỉ nếu đạt điều kiện.

Chức năng phía giảng viên:

- Tạo/sửa/xóa/xem khóa học.
- Quản lý chương học.
- Quản lý bài học.
- Quản lý video.
- Import playlist theo màn hình frontend.
- Quản lý quiz và bài tập trong bài học.
- Xem danh sách học viên của khóa học.

Dữ liệu liên quan:

- `KhoaHocModel`
- `ChuongHocModel`
- `BaiHocModel`
- `DangKyKhoaHocModel`
- `TienDoBaiHocModel`
- `DanhGiaModel`
- `BinhLuanModel`
- `ChungChiKhoaHocModel`

### 4.3. Nhóm chức năng bài tập và kiểm tra

**Mục tiêu:** Đánh giá năng lực học viên qua quiz, bài thực hành và chứng chỉ.

Chức năng chính:

- Giảng viên tạo bài tập trắc nghiệm/quiz.
- Giảng viên tạo bài tập thực hành có test case.
- AI hỗ trợ sinh bài tập thực hành và quiz.
- Học viên làm bài tập.
- Học viên thực hành code trong IDE AI.
- Hệ thống chạy/kiểm tra bài làm theo test case.
- Lưu kết quả làm bài và lịch sử bài làm.
- Kiểm tra điều kiện chứng chỉ.

Dữ liệu liên quan:

- `BaiTapModel`
- `BaiTap_QuizModel`
- `BaiTapThucHanhModel`
- `TestCaseThucHanhModel`
- `KetQuaLamBaiModel`
- `KetQuaKiemTraChungChiModel`

### 4.4. Nhóm chức năng AI học tập

**Mục tiêu:** Tăng tính cá nhân hóa và hỗ trợ học tập thông minh.

Chức năng chính:

- Học viên yêu cầu tạo lộ trình AI theo mục tiêu học tập.
- Học viên xem danh sách lộ trình AI của mình.
- Học viên xem chi tiết lộ trình AI.
- Học viên khám phá lộ trình.
- Trợ lý hỏi đáp AI.
- Tóm tắt video AI.
- Ghi chú AI.
- Giảng viên tạo lộ trình AI.
- AI hỗ trợ sinh bài tập/quiz.
- Admin quản lý API key AI và nhật ký sử dụng.

Dữ liệu liên quan:

- `LoTrinhAIModel`
- `GhiChuAIModel`
- `VideoChapterModel`
- `VideoQuizModel`
- `KeyAPIModel`
- `NhatKySuDungModel`

### 4.5. Nhóm chức năng thanh toán và mua khóa học

**Mục tiêu:** Cho phép học viên mua khóa học và ghi nhận giao dịch.

Chức năng chính:

- Tạo đơn hàng mua khóa học.
- Áp dụng mã giảm giá nếu có.
- Ghi nhận giao dịch thanh toán.
- Nhận webhook thanh toán từ SePay.
- Gửi/ghi nhận thông báo email thanh toán.
- Admin hỗ trợ xử lý vấn đề thanh toán học viên.

Dữ liệu liên quan:

- `DonHangKhoaHocModel`
- `ChiTietDonHangModel`
- `GiaoDichThanhToanModel`
- `ThongBaoEmailThanhToanModel`

### 4.6. Nhóm chức năng mã giảm giá và quà tặng

**Mục tiêu:** Hỗ trợ marketing, khuyến mãi và tặng khóa học.

Chức năng chính:

- Giảng viên tạo mã giảm giá cho khóa học của mình.
- Admin quản lý mã giảm giá toàn hệ thống.
- Giảng viên tặng khóa học cho học viên.
- Admin quản lý mã quà tặng.
- Học viên nhập mã quà tặng.
- Học viên xem lịch sử mã quà tặng.

Dữ liệu liên quan:

- `MaGiamGiaModel`
- `MaGiamGiaKhoaHocModel`
- `QuaTangKhoaHocModel`
- `MaQuaTangHocVienModel`

### 4.7. Nhóm chức năng doanh thu và rút tiền giảng viên

**Mục tiêu:** Quản lý thu nhập của giảng viên từ khóa học.

Chức năng chính:

- Ghi nhận doanh thu giảng viên khi phát sinh mua khóa học hợp lệ.
- Giảng viên xem ví/thông tin doanh thu.
- Giảng viên cập nhật tài khoản ngân hàng nhận tiền.
- Giảng viên gửi yêu cầu rút tiền.
- Admin duyệt/từ chối yêu cầu rút tiền.
- Nhận webhook giao dịch rút tiền từ SePay.
- Hỗ trợ xử lý yêu cầu rút tiền.

Dữ liệu liên quan:

- `DoanhThuGiangVienModel`
- `YeuCauRutTienGiangVienModel`
- `HoTroRutTienGiangVienModel`
- Thông tin ngân hàng trong `NguoiDungModel`

### 4.8. Nhóm chức năng quản trị hệ thống

**Mục tiêu:** Đảm bảo nền tảng vận hành ổn định, kiểm soát dữ liệu và người dùng.

Chức năng chính:

- Dashboard/thống kê admin.
- Quản lý người dùng.
- Quản lý học viên.
- Khóa/mở khóa tài khoản.
- Quản lý đánh giá, bình luận, review.
- Quản lý API key AI.
- Quản lý cấu hình hệ thống.
- Bật/tắt bảo trì.
- Quản lý mã giảm giá/mã quà tặng.
- Quản lý hỗ trợ thanh toán.
- Quản lý yêu cầu rút tiền.

Dữ liệu liên quan:

- `CauHinhHeThongModel`
- `NguoiDungModel`
- `DanhGiaModel`
- `BinhLuanModel`
- Các bảng thanh toán, AI key, rút tiền.

---

## 5. Sơ đồ phân rã chức năng dạng text

```text
EduCodeAI
├── Xác thực & tài khoản
│   ├── Đăng ký / đăng nhập / quên mật khẩu
│   ├── Hồ sơ cá nhân
│   ├── Đổi mật khẩu
│   └── Quản lý thiết bị đăng nhập
├── Học viên
│   ├── Xem & mua khóa học
│   ├── Học nội dung khóa học
│   ├── Làm bài tập / quiz / thực hành code
│   ├── Theo dõi tiến độ / chứng chỉ
│   ├── Đánh giá khóa học
│   ├── Lộ trình AI / trợ lý AI / tóm tắt video
│   └── Nhập mã quà tặng
├── Giảng viên
│   ├── Quản lý khóa học
│   ├── Quản lý chương / bài học / video
│   ├── Tạo quiz / bài tập thực hành / test case
│   ├── Quản lý học viên
│   ├── Thống kê học tập & doanh thu
│   ├── Mã giảm giá / tặng khóa học
│   └── Rút tiền
└── Quản trị viên
    ├── Quản lý người dùng / học viên
    ├── Quản lý review / bình luận
    ├── Quản lý API key AI
    ├── Cấu hình hệ thống
    ├── Thống kê hệ thống
    ├── Hỗ trợ thanh toán
    ├── Quản lý mã giảm giá / quà tặng
    └── Duyệt rút tiền giảng viên
```

---

## 6. Quy trình nghiệp vụ chính

### 6.1. Quy trình học viên mua và học khóa học

1. Học viên đăng nhập.
2. Học viên xem chi tiết khóa học.
3. Học viên chọn mua khóa học.
4. Hệ thống tạo đơn hàng.
5. Học viên thanh toán.
6. Hệ thống nhận kết quả/webhook thanh toán.
7. Nếu thanh toán thành công:
   - Ghi nhận đăng ký khóa học.
   - Tạo chi tiết đơn hàng/giao dịch.
   - Cập nhật doanh thu giảng viên.
8. Học viên vào không gian học tập.
9. Học viên học bài, làm bài tập, cập nhật tiến độ.
10. Nếu đủ điều kiện, học viên làm kiểm tra chứng chỉ và nhận chứng chỉ.

### 6.2. Quy trình giảng viên tạo khóa học

1. Giảng viên đăng nhập vào khu vực giảng viên.
2. Tạo khóa học với thông tin cơ bản: tên, mô tả, ảnh, lĩnh vực, trình độ, thời lượng, kỹ năng, giá.
3. Tạo chương học.
4. Tạo bài học trong chương.
5. Thêm nội dung video/lý thuyết.
6. Tạo quiz hoặc bài tập thực hành.
7. Cấu hình chứng chỉ nếu khóa học có chứng chỉ.
8. Xuất bản/cho phép mua khóa học.
9. Theo dõi học viên và thống kê sau khi khóa học có người học.

### 6.3. Quy trình yêu cầu lộ trình AI

1. Học viên nhập mục tiêu/yêu cầu học tập.
2. Hệ thống gửi yêu cầu tới dịch vụ AI.
3. AI sinh nội dung lộ trình dạng JSON.
4. Hệ thống lưu `LoTrinhAIModel` gồm người dùng, yêu cầu, nội dung JSON, trạng thái, ngày tạo.
5. Học viên xem lộ trình AI của mình.
6. Học viên truy cập chi tiết từng lộ trình để học theo gợi ý.

### 6.4. Quy trình làm bài tập thực hành

1. Giảng viên tạo bài tập thực hành và test case.
2. Học viên mở bài tập trong khóa học hoặc IDE AI.
3. Học viên viết/chạy/nộp code.
4. Hệ thống chấm theo test case.
5. Lưu kết quả làm bài.
6. Học viên xem lịch sử bài làm.
7. Giảng viên có thể xem thống kê/học viên rủi ro theo kết quả học tập.

### 6.5. Quy trình giảng viên rút tiền

1. Giảng viên cập nhật thông tin ngân hàng nhận tiền.
2. Giảng viên xem số dư/doanh thu khả dụng.
3. Giảng viên gửi yêu cầu rút tiền.
4. Hệ thống tạo yêu cầu với trạng thái chờ xử lý.
5. Admin kiểm tra yêu cầu.
6. Admin duyệt hoặc từ chối:
   - Nếu duyệt: ghi nhận thông tin duyệt, chờ/ghi nhận giao dịch chuyển tiền.
   - Nếu từ chối: ghi nhận lý do từ chối.
7. Hệ thống có thể nhận webhook SePay để đối soát giao dịch.

---

## 7. Yêu cầu chức năng mức tổng quan

| Mã | Nhóm | Yêu cầu chức năng |
|---|---|---|
| FR-01 | Xác thực | Người dùng có thể đăng ký, đăng nhập, đăng xuất, quên mật khẩu. |
| FR-02 | Phân quyền | Hệ thống điều hướng và giới hạn chức năng theo vai trò Admin/Giảng viên/Học viên. |
| FR-03 | Khóa học | Học viên có thể xem danh sách và chi tiết khóa học. |
| FR-04 | Khóa học | Giảng viên có thể tạo và quản lý khóa học, chương, bài học. |
| FR-05 | Thanh toán | Học viên có thể mua khóa học và hệ thống ghi nhận đơn hàng/giao dịch. |
| FR-06 | Học tập | Học viên có thể học nội dung, ghi chú, theo dõi tiến độ. |
| FR-07 | Bài tập | Giảng viên có thể tạo quiz/bài thực hành; học viên có thể làm và xem kết quả. |
| FR-08 | AI | Học viên có thể yêu cầu lộ trình AI, hỏi đáp AI, tóm tắt video AI. |
| FR-09 | AI | Giảng viên có thể dùng AI để tạo bài tập/quiz/lộ trình. |
| FR-10 | Admin | Admin có thể quản lý người dùng, review, API key, cấu hình hệ thống. |
| FR-11 | Khuyến mãi | Hệ thống hỗ trợ mã giảm giá và quà tặng khóa học. |
| FR-12 | Rút tiền | Giảng viên có thể yêu cầu rút tiền; admin có thể duyệt/từ chối. |
| FR-13 | Thống kê | Admin và giảng viên có dashboard thống kê theo phạm vi quyền. |

---

## 8. Yêu cầu phi chức năng đề xuất

| Nhóm | Yêu cầu |
|---|---|
| Bảo mật | Mật khẩu cần được mã hóa; API cần kiểm tra token và vai trò. |
| Phân quyền | Mọi API nhạy cảm cần kiểm tra quyền, không chỉ kiểm tra ở frontend. |
| Hiệu năng | Danh sách khóa học, người dùng, giao dịch nên phân trang và lọc. |
| Tính sẵn sàng | Cấu hình bảo trì giúp admin tạm dừng hệ thống khi cần. |
| Audit | Các thao tác quan trọng như thanh toán, rút tiền, API key nên có nhật ký. |
| Toàn vẹn dữ liệu | Giao dịch thanh toán cần idempotency key để tránh xử lý trùng. |
| Khả dụng AI | Cần cơ chế quản lý nhiều API key, trạng thái key, giới hạn quota và fallback. |
| UX | Các màn hình tạo AI cần có trạng thái chờ, đang xử lý, thành công, lỗi. |

---

## 9. Dữ liệu nghiệp vụ chính

| Thực thể | Ý nghĩa |
|---|---|
| Người dùng | Lưu thông tin tài khoản, vai trò, trạng thái, OTP, ngân hàng. |
| Phiên đăng nhập | Quản lý thiết bị/phiên đăng nhập của người dùng. |
| Khóa học | Sản phẩm học tập do giảng viên tạo. |
| Chương học | Nhóm bài học thuộc khóa học. |
| Bài học | Nội dung học tập cụ thể. |
| Đăng ký khóa học | Quan hệ học viên sở hữu/tham gia khóa học. |
| Tiến độ bài học | Ghi nhận trạng thái học của học viên. |
| Bài tập/Quiz | Nội dung kiểm tra lý thuyết/trắc nghiệm. |
| Bài tập thực hành | Bài code có test case để chấm tự động. |
| Kết quả làm bài | Lịch sử nộp bài và điểm/kết quả. |
| Lộ trình AI | Kết quả cá nhân hóa do AI tạo cho học viên. |
| API Key AI | Key dùng để gọi dịch vụ AI. |
| Đơn hàng | Giao dịch mua khóa học. |
| Mã giảm giá | Công cụ khuyến mãi khóa học. |
| Quà tặng khóa học | Tặng quyền học khóa học cho học viên. |
| Doanh thu giảng viên | Ghi nhận thu nhập theo giao dịch mua khóa học. |
| Yêu cầu rút tiền | Quy trình giảng viên rút tiền về ngân hàng. |
| Cấu hình hệ thống | Tham số vận hành, bảo trì hệ thống. |

---

## 10. Nhận xét BA và đề xuất cải thiện

1. **Cần chuẩn hóa trạng thái nghiệp vụ**  
   Các trường trạng thái hiện dùng string, nên thống nhất danh mục trạng thái cho khóa học, đơn hàng, thanh toán, rút tiền, quà tặng, API key.

2. **Cần đặc tả rõ luồng thanh toán**  
   Nên có tài liệu riêng mô tả trạng thái đơn hàng, giao dịch, webhook SePay, retry và xử lý trùng.

3. **Cần đặc tả quyền hạn API**  
   Frontend đã có route theo vai trò, nhưng backend cần ma trận quyền theo từng API.

4. **Cần làm rõ chính sách doanh thu**  
   Ví dụ: phần trăm chia sẻ nền tảng/giảng viên, khi nào doanh thu khả dụng, có hoàn tiền hay không.

5. **Cần kiểm soát chi phí AI**  
   Vì hệ thống có nhiều tính năng AI, nên cần giới hạn lượt dùng theo người dùng/ngày, theo gói, hoặc theo vai trò.

6. **Cần bổ sung tài liệu use case chi tiết**  
   Các use case ưu tiên: mua khóa học, tạo khóa học, tạo lộ trình AI, làm bài thực hành, rút tiền giảng viên, quản lý API key.

---

## 11. Kết luận

EduCodeAI là hệ thống LMS kết hợp AI với phạm vi nghiệp vụ khá rộng, bao gồm học tập trực tuyến, quản lý nội dung, kiểm tra đánh giá, cá nhân hóa bằng AI, thanh toán, khuyến mãi, doanh thu và quản trị vận hành. Ba nhóm tác nhân chính là Học viên, Giảng viên và Quản trị viên. Trọng tâm nghiệp vụ của dự án là giúp học viên học lập trình hiệu quả hơn nhờ AI, đồng thời tạo môi trường cho giảng viên xây dựng và kinh doanh khóa học.
