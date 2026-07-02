# Báo cáo các nghiệp vụ mới của EduCodeAI so với báo cáo cũ

**Vai trò thực hiện:** Business Analyst  
**Mục đích tài liệu:** Làm rõ các nghiệp vụ mới/điểm mở rộng trong bản phân tích nghiệp vụ mới để báo cáo với giảng viên hướng dẫn.  
**Căn cứ so sánh:**

- Báo cáo dự án cũ dạng Word: tập trung vào LMS học lập trình có AI, khóa học, bài học, quiz, lộ trình AI, tóm tắt video, quản lý API key cơ bản, doanh thu/rút tiền ở mức khái quát.
- Tài liệu phân tích nghiệp vụ mới dạng Markdown trong thư mục `phan-tich`: mở rộng thêm nghiệp vụ thương mại, thanh toán, tài chính, kiểm soát AI và yêu cầu phi chức năng.

---

## 1. Tóm tắt điều chỉnh nghiệp vụ mới

So với báo cáo cũ, bản phân tích nghiệp vụ mới không chỉ mô tả hệ thống như một nền tảng học lập trình có AI, mà còn mở rộng EduCodeAI thành một nền tảng học tập có yếu tố thương mại đầy đủ hơn.

Các nghiệp vụ mới nổi bật gồm:

1. Nghiệp vụ **mã giảm giá/voucher**.
2. Nghiệp vụ **quà tặng khóa học/mã quà tặng**.
3. Nghiệp vụ **thanh toán có đối soát qua webhook SePay**.
4. Cơ chế **chống xử lý trùng giao dịch bằng idempotency key**.
5. Quy trình **doanh thu và rút tiền giảng viên** được đặc tả rõ hơn.
6. Nghiệp vụ **kiểm soát chi phí sử dụng AI/quota AI**.
7. Yêu cầu mới về **ma trận phân quyền API backend**.
8. Yêu cầu mới về **audit log/nhật ký kiểm toán**.
9. Yêu cầu mới về **chuẩn hóa trạng thái nghiệp vụ**.
10. Nghiệp vụ **cập nhật trang chủ theo hướng thương mại/marketing khóa học**.
11. Nghiệp vụ **khóa học miễn phí và học thử trước khi mua**.
12. Giải pháp **cache/Redis cho dữ liệu khóa học, chương, bài học** để giảm tải database.
13. Nghiệp vụ **upload video/folder video lên cloud thay vì chỉ import YouTube**.
14. Nghiệp vụ **quản lý phụ đề/transcript cho video upload** để đảm bảo các chức năng AI hoạt động đúng.
15. Chính sách **AI transcription có tính phí cho giảng viên** khi dùng AI tạo phụ đề.
16. Nghiệp vụ **quản lý bình luận/review có AI kiểm duyệt nội dung vi phạm**.

---

## 2. Bảng tổng hợp nghiệp vụ mới

| STT | Nghiệp vụ/điểm mới | Tình trạng trong báo cáo cũ | Điểm mới trong phân tích mới | Ý nghĩa khi báo cáo |
|---|---|---|---|---|
| 1 | Mã giảm giá/Voucher | Chưa có hoặc chưa đặc tả rõ | Giảng viên tạo mã giảm giá cho khóa học; Admin quản lý toàn hệ thống | Bổ sung nghiệp vụ marketing và bán hàng |
| 2 | Quà tặng khóa học | Không có | Giảng viên tặng khóa học; học viên nhập mã quà tặng và xem lịch sử | Bổ sung cơ chế tặng quyền học và chăm sóc học viên |
| 3 | Webhook SePay | Chỉ đề cập cổng thanh toán chung như VNPAY/MoMo | Xác định rõ dùng webhook SePay để xử lý thanh toán và đối soát rút tiền | Làm rõ luồng tích hợp thanh toán thực tế |
| 4 | Idempotency key | Chưa đề cập | Mỗi đơn/giao dịch cần khóa chống xử lý trùng | Tăng độ an toàn dữ liệu tài chính |
| 5 | Rút tiền giảng viên | Có nhắc đến doanh thu/rút tiền ở mức khái quát | Có quy trình: cập nhật ngân hàng, tạo yêu cầu, admin duyệt/từ chối, đối soát SePay | Hoàn thiện nghiệp vụ tài chính hai chiều |
| 6 | Chính sách chia sẻ doanh thu | Chưa rõ | Đề xuất làm rõ tỷ lệ chia doanh thu, thời điểm khả dụng, hoàn tiền | Cần thiết nếu hệ thống vận hành thương mại thật |
| 7 | Quota/kiểm soát chi phí AI | Chỉ tập trung tạo tính năng AI | Cần giới hạn lượt dùng theo người dùng/ngày/gói/vai trò, fallback key | Kiểm soát chi phí vận hành AI |
| 8 | Ma trận quyền API backend | Chủ yếu thấy phân quyền frontend | Backend cần kiểm tra quyền từng API nhạy cảm | Tăng bảo mật, tránh vượt quyền |
| 9 | Audit log | Chưa nhấn mạnh | Ghi log thao tác thanh toán, rút tiền, API key, cấu hình | Phục vụ tra soát và kiểm toán |
| 10 | Chuẩn hóa trạng thái | Trạng thái có thể đang dùng string rời rạc | Chuẩn hóa trạng thái đơn hàng, thanh toán, rút tiền, khóa học, API key | Giảm lỗi dữ liệu và dễ bảo trì |

---

## 3. Chi tiết các nghiệp vụ mới

## 3.1. Nghiệp vụ mới: Khuyến mãi bằng mã giảm giá/voucher

### 3.1.1. Trạng thái trong báo cáo cũ

Báo cáo cũ chủ yếu tập trung vào nghiệp vụ học tập, AI, khóa học, bài học, quiz và quản lý người dùng. Nghiệp vụ mã giảm giá chưa được mô tả như một module thương mại riêng.

### 3.1.2. Nội dung mới trong bản phân tích

Bản phân tích mới bổ sung nghiệp vụ mã giảm giá với 2 phạm vi:

- **Giảng viên:**
  - Tạo mã giảm giá cho khóa học của mình.
  - Chọn khóa học được áp dụng.
  - Cấu hình giá trị giảm, thời hạn, số lượt sử dụng.
  - Theo dõi mã còn hiệu lực/hết hạn.

- **Quản trị viên:**
  - Quản lý toàn bộ mã giảm giá trên hệ thống.
  - Kiểm tra mã do giảng viên tạo.
  - Vô hiệu hóa mã không hợp lệ hoặc có dấu hiệu lạm dụng.

### 3.1.3. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ mới giúp hệ thống chuyển từ một nền tảng học tập đơn thuần sang nền tảng có hoạt động kinh doanh khóa học. Mã giảm giá hỗ trợ:

- Marketing khóa học.
- Tăng tỷ lệ mua khóa học.
- Cho phép giảng viên chủ động triển khai chiến dịch khuyến mãi.
- Admin vẫn có quyền kiểm soát để tránh ảnh hưởng doanh thu toàn hệ thống.

### 3.1.4. Dữ liệu liên quan

- `MaGiamGiaModel`
- `MaGiamGiaKhoaHocModel`
- `KhoaHocModel`
- `NguoiDungModel`
- `DonHangKhoaHocModel`

---

## 3.2. Nghiệp vụ mới: Quà tặng khóa học và mã quà tặng

### 3.2.1. Trạng thái trong báo cáo cũ

Báo cáo cũ không mô tả chức năng tặng khóa học, nhập mã quà tặng hoặc lịch sử nhận quà tặng.

### 3.2.2. Nội dung mới trong bản phân tích

Bản phân tích mới bổ sung nghiệp vụ quà tặng khóa học gồm:

- Giảng viên tặng khóa học trực tiếp cho học viên.
- Hệ thống sinh hoặc quản lý mã quà tặng.
- Học viên nhập mã quà tặng để nhận quyền học khóa học.
- Học viên xem lịch sử mã quà tặng đã nhận/đã sử dụng.
- Admin quản lý mã quà tặng toàn hệ thống.

### 3.2.3. Ý nghĩa nghiệp vụ

Nghiệp vụ này mở rộng khả năng chăm sóc học viên và marketing:

- Giảng viên có thể tặng khóa học cho học viên tiềm năng.
- Hệ thống có thể tổ chức chương trình ưu đãi, tri ân, học bổng.
- Học viên không nhất thiết phải thanh toán mới có quyền học, mà có thể nhận khóa học qua mã quà tặng.

### 3.2.4. Dữ liệu liên quan

- `QuaTangKhoaHocModel`
- `MaQuaTangHocVienModel`
- `KhoaHocModel`
- `NguoiDungModel`
- `DangKyKhoaHocModel`

---

## 3.3. Nghiệp vụ mới/mở rộng: Thanh toán và đối soát qua webhook SePay

### 3.3.1. Trạng thái trong báo cáo cũ

Báo cáo cũ có thể chỉ đề cập tích hợp cổng thanh toán ở mức khái quát, ví dụ VNPAY/MoMo, nhưng chưa đặc tả rõ:

- Cổng/luồng xử lý cụ thể.
- Webhook nhận kết quả thanh toán.
- Đối soát giao dịch.
- Cơ chế xử lý lỗi/retry.
- Chống xử lý trùng.

### 3.3.2. Nội dung mới trong bản phân tích

Bản phân tích mới xác định rõ hơn:

- Hệ thống nhận webhook từ **SePay** để xử lý kết quả thanh toán khóa học.
- Hệ thống ghi nhận giao dịch thanh toán vào bảng giao dịch.
- Nếu thanh toán thành công, hệ thống tạo đăng ký khóa học cho học viên.
- Hệ thống có thể dùng webhook SePay để đối soát giao dịch rút tiền giảng viên.
- Đề xuất cần tài liệu riêng cho trạng thái đơn hàng, trạng thái giao dịch, retry và xử lý trùng.

### 3.3.3. Ý nghĩa nghiệp vụ

Đây là điểm mới quan trọng vì hệ thống có yếu tố tiền thật. Khi tích hợp thanh toán, chỉ tạo đơn hàng là chưa đủ; cần có luồng nhận kết quả, đối soát và đảm bảo dữ liệu chính xác.

Nghiệp vụ này giúp:

- Tự động xác nhận thanh toán.
- Giảm thao tác thủ công của Admin.
- Ghi nhận chính xác quyền học của học viên.
- Hạn chế sai lệch doanh thu.
- Làm nền tảng cho xử lý hoàn tiền hoặc khiếu nại sau này.

### 3.3.4. Dữ liệu liên quan

- `DonHangKhoaHocModel`
- `ChiTietDonHangModel`
- `GiaoDichThanhToanModel`
- `ThongBaoEmailThanhToanModel`
- `DangKyKhoaHocModel`

---

## 3.4. Nghiệp vụ mới: Chống trùng lặp giao dịch bằng idempotency key

### 3.4.1. Trạng thái trong báo cáo cũ

Báo cáo cũ chưa đề cập đến idempotency key hoặc cơ chế chống xử lý trùng giao dịch.

### 3.4.2. Nội dung mới trong bản phân tích

Bản phân tích mới đề xuất các giao dịch thanh toán cần có **idempotency key**. Đây là khóa định danh duy nhất dùng để đảm bảo một yêu cầu thanh toán hoặc một webhook chỉ được xử lý đúng một lần.

Ví dụ:

- Học viên bấm thanh toán nhiều lần.
- Cổng thanh toán gửi webhook lặp lại.
- Người dùng refresh trang thanh toán.
- Hệ thống retry sau lỗi mạng.

Trong các trường hợp trên, idempotency key giúp hệ thống không tạo nhiều đơn hàng hoặc nhiều đăng ký khóa học cho cùng một giao dịch.

### 3.4.3. Ý nghĩa nghiệp vụ

Đây là yêu cầu mới thuộc nhóm toàn vẹn dữ liệu tài chính. Nếu không có cơ chế này, hệ thống có thể gặp các lỗi nghiêm trọng:

- Một giao dịch bị ghi nhận nhiều lần.
- Học viên nhận trùng quyền học.
- Doanh thu giảng viên bị cộng sai.
- Đối soát thanh toán khó khăn.

### 3.4.4. Dữ liệu liên quan

- `DonHangKhoaHocModel.IdempotencyKey`
- `GiaoDichThanhToanModel.MaThamChieuNgoai`

---

## 3.5. Nghiệp vụ mở rộng: Doanh thu và rút tiền giảng viên

### 3.5.1. Trạng thái trong báo cáo cũ

Báo cáo cũ có nhắc tới doanh thu và yêu cầu rút tiền, nhưng mới ở mức chức năng tổng quát. Chưa có quy trình nghiệp vụ chi tiết từ lúc phát sinh doanh thu đến lúc giảng viên rút tiền và admin duyệt.

### 3.5.2. Nội dung mới trong bản phân tích

Bản phân tích mới đặc tả rõ quy trình:

1. Khi học viên mua khóa học thành công, hệ thống ghi nhận doanh thu cho giảng viên.
2. Giảng viên xem ví hoặc doanh thu khả dụng.
3. Giảng viên cập nhật thông tin ngân hàng nhận tiền.
4. Giảng viên tạo yêu cầu rút tiền.
5. Admin kiểm tra yêu cầu rút tiền.
6. Admin duyệt hoặc từ chối:
   - Nếu duyệt: ghi nhận người duyệt, thời gian duyệt, trạng thái chuyển tiền.
   - Nếu từ chối: bắt buộc ghi nhận lý do từ chối.
7. Hệ thống đối soát giao dịch chuyển tiền qua webhook SePay nếu có.

### 3.5.3. Ý nghĩa nghiệp vụ

Nghiệp vụ này biến chức năng doanh thu/rút tiền thành một quy trình tài chính đầy đủ, có kiểm soát bởi Admin.

Điểm mới cần báo cáo với thầy:

- Không chỉ hiển thị doanh thu, hệ thống cần quản lý vòng đời tiền của giảng viên.
- Có trạng thái yêu cầu rút tiền.
- Có bước duyệt/từ chối của Admin.
- Có lý do từ chối để minh bạch.
- Có đối soát giao dịch để đảm bảo tiền đã chuyển thật.

### 3.5.4. Yêu cầu cần làm rõ thêm

Bản phân tích mới cũng đề xuất cần làm rõ chính sách:

- Tỷ lệ chia sẻ doanh thu giữa nền tảng và giảng viên.
- Khi nào doanh thu được xem là khả dụng.
- Có giữ tiền trong bao lâu trước khi cho rút không.
- Có hoàn tiền khóa học không.
- Nếu hoàn tiền thì doanh thu giảng viên xử lý thế nào.

### 3.5.5. Dữ liệu liên quan

- `DoanhThuGiangVienModel`
- `YeuCauRutTienGiangVienModel`
- `HoTroRutTienGiangVienModel`
- Thông tin ngân hàng trong `NguoiDungModel`

---

## 3.6. Nghiệp vụ mới: Kiểm soát chi phí AI và hạn mức sử dụng AI

### 3.6.1. Trạng thái trong báo cáo cũ

Báo cáo cũ chủ yếu mô tả AI theo hướng chức năng:

- Tạo lộ trình học.
- Tóm tắt video.
- Gợi ý nội dung.
- Sinh quiz/bài tập.
- Quản lý API key cơ bản.

Tuy nhiên, báo cáo cũ chưa đặt nặng bài toán chi phí vận hành AI.

### 3.6.2. Nội dung mới trong bản phân tích

Bản phân tích mới bổ sung yêu cầu kiểm soát chi phí AI:

- Giới hạn số lượt gọi AI theo người dùng/ngày.
- Giới hạn theo vai trò, ví dụ học viên, giảng viên, admin.
- Có thể giới hạn theo gói dịch vụ trong tương lai.
- Quản lý nhiều API key cùng lúc.
- Theo dõi trạng thái key: hoạt động, tạm khóa, hết quota, lỗi.
- Có cơ chế fallback, tức là khi một key lỗi/hết quota thì chuyển sang key khác.
- Ghi nhật ký sử dụng AI để thống kê và kiểm soát chi phí.

### 3.6.3. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ mới rất quan trọng vì AI thường phát sinh chi phí theo lượt gọi API/token. Nếu không kiểm soát, hệ thống có thể:

- Bị vượt ngân sách vận hành.
- Một số người dùng lạm dụng AI.
- API key bị hết hạn mức, làm gián đoạn tính năng AI.
- Khó thống kê tính năng AI nào tốn nhiều chi phí nhất.

Điểm mới cần báo cáo:

> Bản phân tích mới không chỉ dừng ở việc “có tính năng AI”, mà bổ sung tư duy vận hành AI thực tế: quản lý quota, key, fallback và nhật ký sử dụng.

### 3.6.4. Dữ liệu liên quan

- `KeyAPIModel`
- `NhatKySuDungModel`
- `LoTrinhAIModel`
- `GhiChuAIModel`

---

## 3.7. Yêu cầu mới: Ma trận phân quyền API backend

### 3.7.1. Trạng thái trong báo cáo cũ

Báo cáo cũ hoặc hệ thống hiện tại có thể thể hiện phân quyền chủ yếu ở frontend thông qua route/màn hình. Ví dụ:

- Học viên vào layout học viên.
- Giảng viên vào layout giảng viên.
- Admin vào layout quản trị viên.

Tuy nhiên, phân quyền ở frontend là chưa đủ về mặt bảo mật.

### 3.7.2. Nội dung mới trong bản phân tích

Bản phân tích mới đề xuất cần có **ma trận phân quyền API backend**. Tức là từng API cần xác định rõ:

- API này cho vai trò nào được gọi?
- Người gọi có được thao tác trên tài nguyên đó không?
- Giảng viên chỉ được sửa khóa học của chính mình hay được sửa mọi khóa học?
- Học viên chỉ được xem khóa học đã mua hay được xem toàn bộ nội dung?
- Admin có quyền override những API nào?

### 3.7.3. Ý nghĩa nghiệp vụ

Đây là yêu cầu mới thuộc nhóm bảo mật và kiểm soát truy cập.

Nếu chỉ phân quyền ở frontend, người dùng vẫn có thể gọi trực tiếp API bằng Postman hoặc DevTools. Vì vậy backend phải kiểm tra quyền ở từng nghiệp vụ nhạy cảm.

Ví dụ:

- Học viên không được gọi API tạo khóa học.
- Giảng viên A không được sửa khóa học của giảng viên B.
- Học viên chưa mua khóa học không được xem nội dung bài học trả phí.
- Giảng viên không được duyệt yêu cầu rút tiền của chính mình.

---

## 3.8. Yêu cầu mới: Nhật ký kiểm toán/Audit log

### 3.8.1. Trạng thái trong báo cáo cũ

Báo cáo cũ chưa nhấn mạnh yêu cầu audit log cho các thao tác quan trọng.

### 3.8.2. Nội dung mới trong bản phân tích

Bản phân tích mới yêu cầu hệ thống cần ghi log các nghiệp vụ nhạy cảm, ví dụ:

- Tạo/cập nhật/xóa API key AI.
- Gọi AI với số lượng lớn.
- Tạo đơn hàng.
- Nhận webhook thanh toán.
- Cập nhật trạng thái giao dịch.
- Tạo yêu cầu rút tiền.
- Duyệt/từ chối yêu cầu rút tiền.
- Khóa/mở khóa tài khoản người dùng.
- Bật/tắt chế độ bảo trì hệ thống.

### 3.8.3. Ý nghĩa nghiệp vụ

Audit log giúp:

- Tra cứu khi có khiếu nại thanh toán.
- Đối soát khi doanh thu bị sai.
- Kiểm tra người nào đã thay đổi API key hoặc cấu hình hệ thống.
- Phát hiện hành vi bất thường hoặc lạm dụng.
- Tăng tính minh bạch khi vận hành hệ thống có yếu tố tài chính.

---

## 3.9. Yêu cầu mới: Chuẩn hóa trạng thái nghiệp vụ

### 3.9.1. Trạng thái trong báo cáo cũ

Báo cáo cũ chưa nhấn mạnh việc chuẩn hóa trạng thái nghiệp vụ. Trong hệ thống, nhiều trường trạng thái có thể đang dùng chuỗi tự do như “Hoạt động”, “Chờ xử lý”, “Thành công”, “Thất bại”.

### 3.9.2. Nội dung mới trong bản phân tích

Bản phân tích mới đề xuất cần chuẩn hóa trạng thái cho các đối tượng nghiệp vụ chính:

- Khóa học.
- Người dùng.
- Đơn hàng.
- Giao dịch thanh toán.
- Mã giảm giá.
- Mã quà tặng.
- Yêu cầu rút tiền.
- API key AI.
- Lộ trình AI.

Ví dụ đề xuất:

| Đối tượng | Trạng thái đề xuất |
|---|---|
| Đơn hàng | `Pending`, `Paid`, `Failed`, `Cancelled`, `Refunded` |
| Giao dịch | `Waiting`, `Success`, `Failed`, `Duplicated`, `ManualReview` |
| Rút tiền | `Pending`, `Approved`, `Rejected`, `Processing`, `Completed`, `Failed` |
| API key | `Active`, `Inactive`, `QuotaExceeded`, `Error`, `Revoked` |
| Khóa học | `Draft`, `Published`, `Hidden`, `Archived` |

### 3.9.3. Ý nghĩa nghiệp vụ

Chuẩn hóa trạng thái giúp:

- Tránh lỗi do nhập sai chuỗi trạng thái.
- Dễ lọc/tìm kiếm/thống kê.
- Dễ viết rule xử lý tự động.
- Giúp frontend và backend thống nhất logic.
- Dễ mở rộng khi hệ thống lớn hơn.

---

## 4. Nhóm nghiệp vụ mới theo mức độ ưu tiên triển khai

## 4.1. Ưu tiên cao

Các nghiệp vụ nên ưu tiên nếu muốn hệ thống vận hành thương mại an toàn:

1. Thanh toán qua SePay và xử lý webhook.
2. Chống trùng giao dịch bằng idempotency key.
3. Ghi nhận đơn hàng, giao dịch, đăng ký khóa học sau thanh toán.
4. Doanh thu giảng viên và yêu cầu rút tiền.
5. Ma trận phân quyền API backend.
6. Audit log cho thanh toán và rút tiền.

## 4.2. Ưu tiên trung bình

Các nghiệp vụ giúp nâng cao vận hành và marketing:

1. Mã giảm giá/voucher.
2. Quà tặng khóa học/mã quà tặng.
3. Chuẩn hóa trạng thái nghiệp vụ.
4. Quản lý hỗ trợ thanh toán.
5. Quản lý hỗ trợ rút tiền.

## 4.3. Ưu tiên dài hạn

Các nghiệp vụ giúp tối ưu chi phí và mở rộng hệ thống:

1. Quota AI theo người dùng/ngày/vai trò.
2. Fallback nhiều API key AI.
3. Thống kê chi phí AI theo tính năng.
4. Chính sách gói dịch vụ nếu sau này có mô hình subscription.
5. Chính sách chia sẻ doanh thu/hoàn tiền chi tiết.

---

## 5. Nội dung có thể trình bày với giảng viên hướng dẫn

Có thể báo cáo ngắn gọn như sau:

> Sau khi so sánh báo cáo cũ và bản phân tích nghiệp vụ mới, em nhận thấy bản mới đã mở rộng EduCodeAI từ một hệ thống LMS có AI thành một nền tảng học tập có hoạt động thương mại hoàn chỉnh hơn. Các nghiệp vụ mới gồm mã giảm giá, quà tặng khóa học, thanh toán và đối soát qua SePay, chống trùng giao dịch bằng idempotency key, quy trình doanh thu/rút tiền giảng viên chi tiết, kiểm soát chi phí AI, phân quyền API backend, audit log và chuẩn hóa trạng thái nghiệp vụ. Những điểm này giúp hệ thống phù hợp hơn nếu triển khai thực tế vì có kiểm soát tài chính, bảo mật, vận hành AI và quản trị rủi ro.

---

## 6. Kết luận

Các nghiệp vụ mới trong bản phân tích không chỉ là bổ sung chức năng giao diện, mà chủ yếu mở rộng về mặt vận hành thực tế:

- **Thương mại:** mã giảm giá, quà tặng, mua khóa học.
- **Tài chính:** đơn hàng, giao dịch, doanh thu, rút tiền, đối soát.
- **Bảo mật:** phân quyền API backend, audit log.
- **Vận hành AI:** quota, fallback key, nhật ký sử dụng.
- **Quản trị dữ liệu:** chuẩn hóa trạng thái nghiệp vụ.

Vì vậy, khi báo cáo với giảng viên hướng dẫn, có thể nhấn mạnh rằng đây là các nghiệp vụ mới/mở rộng nhằm giúp EduCodeAI tiến gần hơn đến một sản phẩm có thể vận hành thực tế, thay vì chỉ là hệ thống demo các chức năng học tập và AI.

---

# 7. Bổ sung nghiệp vụ mới theo định hướng thương mại và vận hành mở rộng

Phần này bổ sung thêm các nghiệp vụ mới cần đưa vào bản phân tích để EduCodeAI phù hợp hơn với mục tiêu thương mại hóa, tăng trải nghiệm khách hàng, tăng bảo mật nội dung khóa học và đảm bảo hệ thống có khả năng chịu tải khi số lượng người dùng tăng.

---

## 7.1. Nghiệp vụ mới: Cập nhật trang chủ theo hướng thương mại/marketing khóa học

### 7.1.1. Hiện trạng

Trang chủ hiện tại có chức năng giới thiệu và hiển thị khóa học nhưng cách trình bày còn khô khan, thiên về liệt kê thông tin hơn là phục vụ mục tiêu marketing hoặc bán khóa học.

Với một nền tảng bán khóa học trực tuyến, trang chủ không chỉ là nơi hiển thị dữ liệu mà còn là điểm chạm đầu tiên để thuyết phục khách hàng đăng ký, học thử hoặc mua khóa học.

### 7.1.2. Yêu cầu nghiệp vụ mới

Cần cập nhật trang chủ theo hướng thương mại hóa, tập trung vào trải nghiệm khách hàng và chuyển đổi mua hàng.

Các nội dung cần bổ sung:

- Khu vực banner/hero section có thông điệp rõ ràng về giá trị của EduCodeAI.
- Danh sách khóa học nổi bật.
- Danh sách khóa học bán chạy.
- Danh sách khóa học mới cập nhật.
- Danh sách khóa học miễn phí hoặc có học thử.
- Bộ lọc khóa học theo lĩnh vực, trình độ, giá, đánh giá, thời lượng.
- Thẻ khóa học cần hiển thị thông tin mang tính bán hàng:
  - Tên khóa học.
  - Ảnh đại diện khóa học.
  - Giảng viên.
  - Giá bán/giá sau giảm.
  - Có miễn phí/học thử hay không.
  - Số lượng học viên.
  - Điểm đánh giá trung bình.
  - Nhãn như `Bán chạy`, `Miễn phí`, `Có học thử`, `Mới`.
- CTA rõ ràng:
  - `Xem chi tiết`.
  - `Học thử miễn phí`.
  - `Mua ngay`.

### 7.1.3. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ mới thuộc nhóm **thương mại và marketing sản phẩm**. Mục tiêu là biến trang chủ từ trang giới thiệu tĩnh thành trang bán hàng có khả năng chuyển đổi.

Lợi ích:

- Tăng khả năng người dùng khám phá khóa học.
- Tăng tỷ lệ click vào chi tiết khóa học.
- Tăng tỷ lệ học thử/mua khóa học.
- Giúp giảng viên có thêm kênh quảng bá khóa học.
- Giúp nền tảng thể hiện tính chuyên nghiệp giống các marketplace khóa học thực tế.

### 7.1.4. Dữ liệu liên quan

- `KhoaHocModel`
- `NguoiDungModel` vai trò giảng viên
- `DanhGiaModel`
- `DangKyKhoaHocModel`
- `MaGiamGiaModel`
- `MaGiamGiaKhoaHocModel`
- Dữ liệu thống kê lượt mua/lượt học

---

## 7.2. Nghiệp vụ mới: Khóa học miễn phí và học thử trước khi mua

### 7.2.1. Hiện trạng

Hiện tại hệ thống chủ yếu theo luồng giảng viên tạo khóa học và học viên phải mua khóa học để học. Chưa có cơ chế rõ ràng cho:

- Khóa học miễn phí.
- Chương/bài học học thử.
- Cho phép học viên trải nghiệm một phần khóa học trước khi quyết định mua.

### 7.2.2. Vấn đề nghiệp vụ

Nếu toàn bộ nội dung đều bị khóa sau bước mua, khách hàng mới sẽ khó đánh giá chất lượng khóa học. Họ không biết:

- Giảng viên dạy có dễ hiểu không.
- Nội dung có phù hợp trình độ không.
- Video, bài tập, cách trình bày có đúng kỳ vọng không.
- Khóa học có đáng tiền không.

Điều này làm giảm niềm tin và có thể làm giảm tỷ lệ mua khóa học.

### 7.2.3. Yêu cầu nghiệp vụ mới

Cần bổ sung 2 cơ chế:

#### A. Khóa học miễn phí

Giảng viên hoặc Admin có thể thiết lập khóa học là miễn phí.

Khi khóa học miễn phí:

- Học viên có thể đăng ký học mà không cần thanh toán.
- Hệ thống vẫn ghi nhận đăng ký khóa học.
- Học viên vẫn có tiến độ học tập, làm bài tập, đánh giá nếu đủ điều kiện.
- Khóa học được gắn nhãn `Miễn phí` trên trang chủ/danh sách khóa học.

#### B. Học thử một phần khóa học

Giảng viên có thể đánh dấu một số chương hoặc bài học là học thử.

Ví dụ:

- Cho học thử 2-3 chương đầu.
- Cho học thử một số bài học giới thiệu.
- Cho xem video giới thiệu và một vài bài đầu.

Luồng nghiệp vụ đề xuất:

1. Khách hoặc học viên mở chi tiết khóa học.
2. Hệ thống hiển thị các chương/bài được phép học thử.
3. Người dùng học thử các nội dung được mở.
4. Khi truy cập chương/bài không thuộc phạm vi học thử, hệ thống yêu cầu mua khóa học.
5. Sau khi mua thành công, học viên được mở toàn bộ nội dung.

### 7.2.4. Quy tắc nghiệp vụ đề xuất

- Khóa học có thể thuộc một trong các loại:
  - `Free`: miễn phí toàn bộ.
  - `Paid`: trả phí toàn bộ.
  - `TrialThenPaid`: cho học thử một phần rồi yêu cầu mua.
- Một bài học/chương có thể có cờ `ChoHocThu` hoặc `LaNoiDungMienPhi`.
- Khách chưa đăng nhập có thể xem/học thử tùy chính sách hệ thống.
- Khi người dùng muốn lưu tiến độ học thử, hệ thống nên yêu cầu đăng nhập.
- Bài học trả phí chỉ mở khi học viên đã mua/được tặng/được cấp quyền học.

### 7.2.5. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ mới rất quan trọng về trải nghiệm khách hàng và bán hàng.

Lợi ích:

- Tăng niềm tin trước khi mua.
- Giúp học viên đánh giá chất lượng giảng viên.
- Tăng tỷ lệ chuyển đổi từ học thử sang mua khóa học.
- Tạo điều kiện cho giảng viên quảng bá chất lượng nội dung.
- Giúp nền tảng cạnh tranh tốt hơn với các nền tảng học online khác.

### 7.2.6. Dữ liệu liên quan cần bổ sung/điều chỉnh

Có thể cần bổ sung trường vào các thực thể:

- `KhoaHocModel`:
  - `LoaiKhoaHoc`: Free/Paid/TrialThenPaid.
  - `ChoPhepHocThu`: true/false.
  - `SoChuongHocThu` hoặc cấu hình học thử chi tiết.
- `ChuongHocModel`:
  - `ChoHocThu`: true/false.
- `BaiHocModel`:
  - `ChoHocThu`: true/false.
- `DangKyKhoaHocModel`:
  - Phân biệt đăng ký miễn phí, mua trả phí, nhận quà tặng.

---

## 7.3. Nghiệp vụ kỹ thuật mới: Cache dữ liệu khóa học, chương, bài học bằng Redis

### 7.3.1. Hiện trạng

Các chức năng lấy dữ liệu khóa học, chương, bài học hiện có xu hướng gọi trực tiếp database. Khi số lượng người dùng tăng, đặc biệt ở các trang có tần suất truy cập cao như:

- Trang chủ.
- Danh sách khóa học.
- Chi tiết khóa học.
- Nội dung chương/bài học.
- Không gian học tập.

Nếu tất cả request đều truy vấn trực tiếp database, hệ thống có nguy cơ:

- Tăng tải database.
- Phản hồi chậm.
- Nghẽn kết nối database.
- Server bị quá tải khi nhiều người truy cập cùng lúc.

### 7.3.2. Yêu cầu nghiệp vụ/kỹ thuật mới

Cần bổ sung giải pháp cache cho các dữ liệu đọc nhiều, ít thay đổi.

Đề xuất sử dụng:

- Redis cache.
- Memory cache cho một số dữ liệu nhỏ nếu cần.
- Cơ chế cache aside.

Các nhóm dữ liệu nên cache:

- Danh sách khóa học ở trang chủ.
- Danh sách khóa học nổi bật/bán chạy/miễn phí.
- Chi tiết khóa học công khai.
- Danh sách chương của khóa học.
- Danh sách bài học của chương.
- Thông tin giảng viên hiển thị công khai.
- Điểm đánh giá trung bình và số lượng học viên, nếu không yêu cầu realtime tuyệt đối.

### 7.3.3. Quy tắc cache đề xuất

- Cache dữ liệu public, đọc nhiều.
- Dữ liệu cá nhân hóa như tiến độ học tập, quyền mua khóa học, kết quả làm bài cần cân nhắc kỹ, không cache chung cho mọi user.
- Khi giảng viên cập nhật khóa học/chương/bài học, cần xóa hoặc làm mới cache liên quan.
- Khi có giao dịch mua khóa học, không được chỉ dựa vào cache để kiểm tra quyền học.
- API nội dung trả phí phải kiểm tra quyền truy cập từ dữ liệu đáng tin cậy.

### 7.3.4. Cơ chế cache đề xuất

Luồng đọc dữ liệu:

1. Client gọi API lấy danh sách/chi tiết khóa học.
2. Backend kiểm tra Redis có dữ liệu cache không.
3. Nếu có cache, trả dữ liệu từ Redis.
4. Nếu không có cache, truy vấn database.
5. Backend lưu kết quả vào Redis với TTL phù hợp.
6. Trả dữ liệu cho client.

Luồng cập nhật dữ liệu:

1. Giảng viên/Admin cập nhật khóa học/chương/bài học.
2. Backend lưu thay đổi vào database.
3. Backend xóa cache liên quan.
4. Lần đọc sau sẽ lấy dữ liệu mới từ database và cache lại.

### 7.3.5. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ/kỹ thuật mới phục vụ khả năng mở rộng hệ thống.

Lợi ích:

- Giảm tải database.
- Tăng tốc độ tải trang chủ và chi tiết khóa học.
- Giảm nguy cơ chết server khi lượng user lớn.
- Tăng trải nghiệm người dùng.
- Giúp hệ thống sẵn sàng hơn cho vận hành thực tế.

### 7.3.6. Rủi ro cần kiểm soát

- Cache cũ làm hiển thị sai thông tin khóa học.
- Cache nhầm dữ liệu cá nhân giữa các học viên.
- Quyền truy cập nội dung trả phí không được kiểm tra đúng.
- Cache không được xóa khi giảng viên cập nhật nội dung.

Vì vậy cần có chiến lược cache key, TTL và invalidation rõ ràng.

---

## 7.4. Nghiệp vụ mới: Import/upload video, folder video và xử lý phụ đề

### 7.4.1. Hiện trạng

Chức năng tạo khóa học hiện tại chủ yếu hỗ trợ import link YouTube hoặc playlist YouTube. Cách này thuận tiện nhưng có một số hạn chế:

- Không phải giảng viên nào cũng muốn upload video lên YouTube.
- Video trên YouTube có thể bị public hoặc phụ thuộc vào chính sách YouTube.
- Khó kiểm soát bảo mật nội dung khóa học trả phí.
- Giảng viên có thể muốn upload video riêng lên cloud của hệ thống.

### 7.4.2. Yêu cầu nghiệp vụ mới

Cần bổ sung chức năng cho phép giảng viên:

- Upload một video riêng lẻ.
- Upload nhiều video cùng lúc.
- Import folder video.
- Tổ chức video upload thành chương/bài học.
- Lưu video lên cloud storage thay vì phụ thuộc YouTube.

Mục tiêu:

- Tăng quyền kiểm soát nội dung cho giảng viên.
- Tăng bảo mật khóa học trả phí.
- Giảm phụ thuộc vào nền tảng bên ngoài.
- Cho phép giảng viên xây dựng khóa học chuyên nghiệp hơn.

### 7.4.3. Vấn đề nghiệp vụ mới: Video upload lên cloud có thể không có phụ đề

Khi import video từ YouTube, hệ thống có thể tận dụng phụ đề/caption nếu video có sẵn. Tuy nhiên, khi giảng viên upload video trực tiếp lên cloud, video thường **không tự có phụ đề**.

Điều này ảnh hưởng đến các chức năng cần phụ đề hoặc transcript, ví dụ:

- Tóm tắt video bằng AI.
- Tạo ghi chú AI từ nội dung video.
- Sinh quiz/bài tập từ nội dung video.
- Tìm kiếm nội dung trong video.
- Hỏi đáp AI dựa trên bài học video.
- Gợi ý lộ trình/nội dung dựa trên nội dung video.

Nếu không có phụ đề/transcript, các chức năng AI dựa trên nội dung video có thể không hoạt động hoặc hoạt động kém chính xác.

### 7.4.4. Yêu cầu màn hình khi upload video

Khi giảng viên upload video, hệ thống cần yêu cầu giảng viên xác nhận video có phụ đề hay không.

#### Trường hợp 1: Video không có phụ đề

Hệ thống cần hiển thị cảnh báo rõ ràng:

> Video này chưa có phụ đề/transcript. Một số chức năng AI cần nội dung văn bản sẽ bị vô hiệu hóa, bao gồm tóm tắt video AI, tạo ghi chú AI, sinh quiz/bài tập từ video và hỏi đáp AI theo nội dung video.

Sau đó hệ thống cho phép giảng viên lựa chọn:

- Tiếp tục upload nhưng tắt các chức năng cần phụ đề.
- Quay lại để bổ sung phụ đề.
- Sử dụng AI để tạo phụ đề nếu giảng viên chấp nhận chi phí.

#### Trường hợp 2: Video có phụ đề

Nếu giảng viên xác nhận video có phụ đề, hệ thống đưa ra 2 phương án:

##### Phương án A: Giảng viên tự upload file phụ đề

- Cho phép upload file phụ đề, ví dụ `.srt`, `.vtt`.
- Hệ thống đọc và lưu phụ đề.
- Giảng viên được xem trước phụ đề.
- Giảng viên có thể chỉnh sửa phụ đề nếu có sai sót.
- Sau khi lưu, các chức năng AI dựa trên transcript được bật.

##### Phương án B: Sử dụng AI transcription để tạo phụ đề

- Hệ thống dùng AI để chuyển âm thanh video thành văn bản/phụ đề.
- Hệ thống tạo transcript hoặc file phụ đề.
- Giảng viên có thể xem và chỉnh sửa lại phụ đề.
- Sau khi xác nhận, các chức năng AI dựa trên transcript được bật.

### 7.4.5. Chính sách phí cho AI transcription

Nếu giảng viên chọn phương án dùng AI để tạo phụ đề, cần có chính sách tính phí rõ ràng vì AI transcription phát sinh chi phí.

Đề xuất nghiệp vụ:

- Hiển thị thông báo trước khi xử lý:
  - Thời lượng video.
  - Ước tính chi phí.
  - Số credit hoặc số tiền cần thanh toán.
- Giảng viên xác nhận trước khi hệ thống chạy AI transcription.
- Hệ thống ghi nhận lịch sử sử dụng AI transcription.
- Có thể trừ vào ví giảng viên hoặc yêu cầu thanh toán riêng.
- Nếu transcription thất bại, cần có chính sách hoàn credit hoặc cho chạy lại.

### 7.4.6. Quy tắc bật/tắt chức năng phụ thuộc phụ đề

Cần phân loại các chức năng theo việc có cần phụ đề hay không.

| Chức năng | Cần phụ đề/transcript | Nếu không có phụ đề |
|---|---:|---|
| Xem video bài học | Không bắt buộc | Vẫn hoạt động |
| Theo dõi tiến độ xem video | Không bắt buộc | Vẫn hoạt động |
| Tóm tắt video AI | Có | Vô hiệu hóa |
| Ghi chú AI từ video | Có | Vô hiệu hóa hoặc yêu cầu transcript |
| Sinh quiz từ video | Có | Vô hiệu hóa |
| Hỏi đáp AI theo video | Có | Vô hiệu hóa |
| Tìm kiếm nội dung trong video | Có | Vô hiệu hóa |

### 7.4.7. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ mới quan trọng để tăng chất lượng và bảo mật nội dung khóa học.

Lợi ích:

- Giảng viên không bắt buộc phải dùng YouTube.
- Nền tảng kiểm soát tốt hơn nội dung trả phí.
- Tăng tính chuyên nghiệp khi tạo khóa học.
- Làm rõ mối quan hệ giữa video, phụ đề và các chức năng AI.
- Tránh trường hợp người dùng kỳ vọng tính năng AI hoạt động nhưng hệ thống thiếu dữ liệu phụ đề.
- Tạo thêm mô hình doanh thu từ dịch vụ AI transcription cho giảng viên.

### 7.4.8. Dữ liệu liên quan cần bổ sung/điều chỉnh

Có thể cần bổ sung hoặc mở rộng các bảng/model:

- `BaiHocModel`:
  - Nguồn video: YouTube/CloudUpload.
  - URL video cloud.
  - Trạng thái xử lý video.
  - Có phụ đề hay không.
  - Nguồn phụ đề: Upload/AI/Không có.
- `VideoChapterModel` hoặc bảng video riêng:
  - File path/cloud URL.
  - Duration.
  - File size.
  - Encoding status.
- Bảng phụ đề/transcript:
  - Mã video/bài học.
  - Nội dung transcript.
  - File subtitle URL.
  - Ngôn ngữ.
  - Người chỉnh sửa cuối.
- Bảng lịch sử AI transcription:
  - Mã giảng viên.
  - Mã video.
  - Thời lượng xử lý.
  - Chi phí/credit.
  - Trạng thái xử lý.

---

## 8. Cập nhật bảng tổng hợp nghiệp vụ mới bổ sung

| STT | Nghiệp vụ mới bổ sung | Lý do bổ sung | Giá trị mang lại |
|---|---|---|---|
| 1 | Trang chủ theo hướng thương mại | Trang chủ hiện còn khô khan, chưa tối ưu marketing | Tăng chuyển đổi, tăng khả năng bán khóa học |
| 2 | Khóa học miễn phí | Hệ thống hiện chủ yếu tạo và bán khóa học | Thu hút người dùng mới, tạo kênh học miễn phí |
| 3 | Học thử 2-3 chương/bài đầu | Người dùng cần trải nghiệm trước khi mua | Tăng niềm tin và tỷ lệ mua khóa học |
| 4 | Cache Redis cho khóa học/chương/bài | Gọi DB trực tiếp nhiều sẽ quá tải khi user tăng | Giảm tải database, tăng tốc độ phản hồi |
| 5 | Upload video/folder video lên cloud | Không phải giảng viên nào cũng muốn dùng YouTube | Tăng bảo mật và quyền kiểm soát nội dung |
| 6 | Quản lý phụ đề cho video upload | Video cloud không tự có phụ đề | Đảm bảo các chức năng AI dựa trên transcript hoạt động đúng |
| 7 | AI transcription có tính phí | Tạo phụ đề bằng AI phát sinh chi phí | Kiểm soát chi phí và tạo mô hình doanh thu phụ |
| 8 | Bật/tắt chức năng AI theo phụ đề | Không có transcript thì AI video không đủ dữ liệu | Tránh lỗi nghiệp vụ và minh bạch với giảng viên |

---

## 9. Cập nhật mức độ ưu tiên sau khi bổ sung nghiệp vụ mới

### 9.1. Ưu tiên cao

1. Học thử khóa học trước khi mua.
2. Phân quyền nội dung miễn phí/trả phí/học thử.
3. Cache Redis cho trang chủ, danh sách khóa học, chi tiết khóa học.
4. Thanh toán qua SePay và xử lý webhook.
5. Chống trùng giao dịch bằng idempotency key.
6. Upload video lên cloud và kiểm soát quyền truy cập video trả phí.
7. Ma trận phân quyền API backend.

### 9.2. Ưu tiên trung bình

1. Trang chủ theo hướng thương mại/marketing.
2. Khóa học miễn phí.
3. Mã giảm giá/voucher.
4. Quà tặng khóa học/mã quà tặng.
5. Quy trình phụ đề cho video upload.
6. Audit log cho thanh toán, rút tiền, upload video, AI transcription.
7. Chuẩn hóa trạng thái nghiệp vụ.

### 9.3. Ưu tiên dài hạn

1. AI transcription có tính phí cho giảng viên.
2. Ví/credit riêng cho giảng viên dùng dịch vụ AI.
3. Fallback nhiều API key AI.
4. Thống kê chi phí AI theo giảng viên/tính năng.
5. Gợi ý marketing tự động cho khóa học dựa trên dữ liệu bán hàng.

---

## 10. Đoạn báo cáo bổ sung với giảng viên hướng dẫn

Có thể trình bày thêm với giảng viên hướng dẫn như sau:

> Ngoài các nghiệp vụ thương mại đã bổ sung như mã giảm giá, quà tặng, thanh toán và rút tiền, em tiếp tục đề xuất thêm một số nghiệp vụ mới để hệ thống phù hợp hơn với vận hành thực tế. Thứ nhất, trang chủ cần được thiết kế lại theo hướng marketing, hiển thị khóa học nổi bật, bán chạy, miễn phí, có học thử để tăng tỷ lệ chuyển đổi. Thứ hai, khóa học cần hỗ trợ miễn phí hoặc học thử 2-3 chương đầu, vì khách hàng cần trải nghiệm chất lượng giảng dạy trước khi quyết định mua. Thứ ba, các API lấy khóa học, chương và bài học cần sử dụng cache/Redis để tránh quá tải database khi lượng người dùng tăng. Thứ tư, chức năng tạo khóa học cần mở rộng từ import YouTube sang upload video hoặc folder video lên cloud để tăng bảo mật nội dung. Tuy nhiên video upload lên cloud có thể không có phụ đề, nên hệ thống cần cho giảng viên chọn upload phụ đề thủ công hoặc dùng AI transcription có tính phí. Nếu không có phụ đề, các chức năng AI cần transcript như tóm tắt video, sinh quiz, ghi chú AI hoặc hỏi đáp theo video sẽ bị vô hiệu hóa.

---

## 11. Kết luận bổ sung

Các nghiệp vụ mới bổ sung ở phần này tập trung vào 4 hướng chính:

1. **Tăng khả năng thương mại hóa:** trang chủ marketing, khóa học miễn phí, học thử trước khi mua.
2. **Tăng trải nghiệm khách hàng:** cho phép học viên đánh giá chất lượng khóa học trước khi trả tiền.
3. **Tăng khả năng chịu tải hệ thống:** dùng Redis/cache để giảm tải database cho dữ liệu đọc nhiều.
4. **Tăng bảo mật và chuyên nghiệp trong quản lý nội dung:** upload video/folder video lên cloud, quản lý phụ đề và AI transcription.

Những điểm này giúp EduCodeAI không chỉ là hệ thống học online có AI, mà tiến gần hơn đến một nền tảng thương mại khóa học có khả năng vận hành thực tế, mở rộng người dùng và kiểm soát chi phí.



---

## 7.5. Nghiệp vụ mới/mở rộng: Quản lý bình luận và review có AI kiểm duyệt nội dung

### 7.5.1. Hiện trạng

Hệ thống đã có chức năng quản lý bình luận, review và đánh giá khóa học ở phía quản trị viên. Tuy nhiên, nếu chỉ quản lý thủ công thì khi số lượng học viên và bình luận tăng lên, Admin sẽ khó kiểm soát toàn bộ nội dung một cách kịp thời.

Các vấn đề có thể phát sinh:

- Bình luận chứa từ ngữ xúc phạm, công kích cá nhân.
- Review spam hoặc quảng cáo ngoài hệ thống.
- Nội dung chứa thông tin nhạy cảm, lừa đảo, link độc hại.
- Bình luận không liên quan đến khóa học.
- Đánh giá tiêu cực không mang tính xây dựng.
- Người dùng cố tình phá hoại uy tín giảng viên hoặc khóa học.

### 7.5.2. Yêu cầu nghiệp vụ mới

Cần mở rộng chức năng quản lý bình luận/review bằng cách áp dụng AI để hỗ trợ kiểm duyệt nội dung.

Khi học viên gửi bình luận hoặc review, hệ thống có thể dùng AI để đánh giá nội dung theo các tiêu chí:

- Có chứa ngôn từ thù ghét, xúc phạm, bạo lực hay không.
- Có chứa nội dung spam/quảng cáo/link ngoài hay không.
- Có chứa thông tin cá nhân nhạy cảm hay không.
- Có dấu hiệu lừa đảo hoặc dẫn dụ người dùng ra khỏi nền tảng hay không.
- Có nội dung không phù hợp với môi trường học tập hay không.
- Có khả năng là review giả hoặc review phá hoại hay không.

### 7.5.3. Luồng nghiệp vụ đề xuất

#### Luồng 1: Kiểm duyệt tự động khi người dùng gửi bình luận/review

1. Học viên nhập bình luận hoặc review khóa học.
2. Hệ thống lưu nội dung với trạng thái tạm thời, ví dụ `PendingReview` hoặc `AutoChecking`.
3. Hệ thống gửi nội dung sang AI để phân loại.
4. AI trả về kết quả đánh giá:
   - An toàn.
   - Có rủi ro thấp.
   - Có rủi ro cao.
   - Vi phạm rõ ràng.
5. Hệ thống xử lý theo kết quả:
   - Nếu an toàn: tự động hiển thị.
   - Nếu rủi ro thấp: cho hiển thị nhưng gắn cờ theo dõi.
   - Nếu rủi ro cao: ẩn tạm thời và đưa vào hàng chờ Admin duyệt.
   - Nếu vi phạm rõ ràng: ẩn hoặc từ chối hiển thị, ghi nhận lý do.
6. Admin có thể xem danh sách bình luận/review bị gắn cờ và quyết định giữ, ẩn hoặc xóa.

#### Luồng 2: Admin dùng AI để kiểm tra lại bình luận/review

1. Admin mở màn hình quản lý bình luận/review.
2. Admin chọn một bình luận/review cần kiểm tra.
3. Admin bấm `Phân tích bằng AI`.
4. AI trả về:
   - Mức độ vi phạm.
   - Lý do đánh giá.
   - Nhóm vi phạm nếu có.
   - Gợi ý hành động: giữ, ẩn, yêu cầu chỉnh sửa, xóa.
5. Admin ra quyết định cuối cùng.

### 7.5.4. Trạng thái bình luận/review đề xuất

| Trạng thái | Ý nghĩa |
|---|---|
| `Published` | Đã được hiển thị công khai. |
| `PendingReview` | Đang chờ kiểm duyệt. |
| `FlaggedByAI` | AI đánh dấu có rủi ro cần Admin xem xét. |
| `Hidden` | Đã bị ẩn khỏi giao diện người dùng. |
| `Rejected` | Bị từ chối do vi phạm quy tắc. |
| `EditedRequired` | Cần người dùng chỉnh sửa trước khi hiển thị. |

### 7.5.5. Nhóm vi phạm cần AI nhận diện

| Nhóm vi phạm | Ví dụ |
|---|---|
| Spam/quảng cáo | Gửi link mua bán, quảng cáo khóa học ngoài nền tảng. |
| Ngôn từ xúc phạm | Chửi bới, công kích giảng viên/học viên khác. |
| Nội dung thù ghét | Kỳ thị vùng miền, giới tính, tôn giáo. |
| Lừa đảo/link độc hại | Dụ người dùng chuyển tiền, bấm link lạ. |
| Tiết lộ thông tin cá nhân | Số điện thoại, email, tài khoản ngân hàng của người khác. |
| Nội dung không liên quan | Bình luận không liên quan đến khóa học. |
| Review phá hoại | Đánh giá tiêu cực hàng loạt không có lý do rõ ràng. |

### 7.5.6. Vai trò của Admin

AI chỉ nên đóng vai trò hỗ trợ kiểm duyệt, không nên thay thế hoàn toàn quyết định của Admin trong các trường hợp nhạy cảm.

Admin cần có quyền:

- Xem kết quả phân tích của AI.
- Xem lý do AI đánh dấu vi phạm.
- Ghi đè quyết định của AI nếu AI đánh giá sai.
- Ẩn/xóa/khôi phục bình luận.
- Gửi cảnh báo cho người dùng vi phạm.
- Khóa tài khoản nếu vi phạm nhiều lần.

### 7.5.7. Ý nghĩa nghiệp vụ

Đây là nghiệp vụ mở rộng từ module quản lý bình luận/review hiện có, không phải module hoàn toàn mới.

Lợi ích:

- Giảm tải công việc kiểm duyệt thủ công cho Admin.
- Phát hiện nhanh nội dung vi phạm.
- Bảo vệ môi trường học tập văn minh.
- Bảo vệ uy tín giảng viên và nền tảng.
- Hạn chế spam, quảng cáo và link độc hại.
- Tăng chất lượng review khóa học.

### 7.5.8. Lưu ý về chi phí và độ chính xác AI

Do AI moderation cũng phát sinh chi phí, cần có chính sách sử dụng hợp lý:

- Chỉ gọi AI khi bình luận/review có độ dài nhất định hoặc chứa từ khóa rủi ro.
- Có thể dùng bộ lọc từ khóa cơ bản trước, sau đó mới gọi AI.
- Cache/hash nội dung đã kiểm tra để tránh kiểm tra lặp lại.
- Ghi log kết quả AI để phục vụ tra soát.
- Admin vẫn là người quyết định cuối cùng trong trường hợp tranh chấp.

### 7.5.9. Dữ liệu liên quan cần bổ sung/điều chỉnh

Có thể cần bổ sung trường vào `BinhLuanModel` và `DanhGiaModel`:

- `TrangThaiKiemDuyet`.
- `DiemRuiRoAI`.
- `NhomViPhamAI`.
- `LyDoDanhDauAI`.
- `ThoiGianKiemDuyetAI`.
- `MaAdminXuLy`.
- `LyDoAnHoacTuChoi`.

Có thể dùng thêm `NhatKySuDungModel` hoặc bảng audit log để ghi nhận lượt AI moderation.

---

## 12. Đề xuất ý tưởng mới nên ưu tiên theo hướng cập nhật module hiện có

Theo định hướng hiện tại, nên ưu tiên **nâng cấp các module đang có** thay vì mở thêm module mới. Lý do là hệ thống đã có khá nhiều nhóm chức năng; nếu tiếp tục thêm module mới sẽ dễ làm phạm vi dự án bị rộng, khó hoàn thiện và khó bảo vệ trước giảng viên hướng dẫn.

### 12.1. Nhóm cập nhật nên ưu tiên cao

| STT | Ý tưởng cập nhật | Module hiện có | Lý do nên ưu tiên |
|---|---|---|---|
| 1 | Học thử khóa học trước khi mua | Khóa học, nội dung khóa học, thanh toán | Tác động trực tiếp đến trải nghiệm khách hàng và tỷ lệ mua. |
| 2 | Trang chủ thương mại hóa | Trang chủ, danh sách khóa học | Cải thiện marketing mà không cần tạo module mới. |
| 3 | Cache Redis cho khóa học/chương/bài | Khóa học, chương, bài học | Giải quyết vấn đề hiệu năng khi user tăng. |
| 4 | Upload video/folder video | Tạo khóa học của giảng viên | Mở rộng chức năng đang có, tăng bảo mật nội dung. |
| 5 | Quản lý phụ đề và AI transcription | Video bài học, AI video | Giúp các chức năng AI video hoạt động ổn định hơn. |
| 6 | AI kiểm duyệt bình luận/review | Quản lý review/bình luận | Nâng cấp module admin hiện có, tăng chất lượng cộng đồng. |

### 12.2. Nhóm cập nhật nên ưu tiên trung bình

| STT | Ý tưởng cập nhật | Module hiện có | Lý do |
|---|---|---|---|
| 1 | Mã giảm giá theo chiến dịch | Mã giảm giá | Có ích cho thương mại nhưng cần rule rõ để tránh lỗi thanh toán. |
| 2 | Gợi ý khóa học liên quan | Chi tiết khóa học, trang chủ | Tăng cross-sell nhưng cần dữ liệu đánh giá/hành vi. |
| 3 | Chuẩn hóa trạng thái nghiệp vụ | Toàn hệ thống | Quan trọng cho bảo trì nhưng cần rà soát nhiều nơi. |
| 4 | Audit log thao tác nhạy cảm | Admin, thanh toán, AI key | Cần thiết cho vận hành nhưng có thể làm sau các luồng chính. |
| 5 | Quota AI theo vai trò | AI service, API key | Giúp kiểm soát chi phí nhưng cần thống nhất chính sách quota. |

### 12.3. Nhóm ý tưởng nên để sau, chưa nên làm ngay

| Ý tưởng | Lý do chưa nên ưu tiên |
|---|---|
| Subscription/gói hội viên học nhiều khóa | Là module kinh doanh mới, phạm vi lớn. |
| Affiliate/tiếp thị liên kết cho khóa học | Cần tracking hoa hồng, thanh toán, chống gian lận. |
| Livestream lớp học trực tiếp | Là module mới phức tạp về realtime/video. |
| Diễn đàn cộng đồng riêng | Module mới, cần kiểm duyệt và vận hành nhiều. |
| Mobile app | Phạm vi lớn, không phù hợp nếu web chưa hoàn thiện. |
| Gamification lớn như nhiệm vụ, cấp độ, huy hiệu | Có thể hay nhưng dễ làm lệch trọng tâm nghiệp vụ chính. |

### 12.4. Gợi ý ưu tiên thực tế để báo cáo với thầy

Nếu cần chọn hướng cập nhật thuyết phục nhất, nên trình bày theo thứ tự:

1. **Tối ưu thương mại:** cập nhật trang chủ + khóa học miễn phí/học thử.
2. **Tối ưu hiệu năng:** thêm cache Redis cho dữ liệu khóa học/chương/bài.
3. **Tối ưu bảo mật nội dung:** upload video/folder video lên cloud thay vì chỉ dùng YouTube.
4. **Tối ưu AI:** xử lý phụ đề/transcript và kiểm duyệt bình luận/review bằng AI.
5. **Tối ưu vận hành:** audit log, quota AI, chuẩn hóa trạng thái.

Cách nói ngắn gọn:

> Giai đoạn tiếp theo em không đề xuất mở thêm module mới, mà tập trung nâng cấp các module hiện có. Cụ thể là cải thiện trang chủ và học thử để tăng chuyển đổi mua khóa học, thêm cache Redis để đảm bảo hiệu năng, mở rộng upload video để tăng bảo mật nội dung, xử lý phụ đề để các tính năng AI video hoạt động đúng, và dùng AI hỗ trợ kiểm duyệt bình luận/review để giảm tải cho Admin. Các cập nhật này giúp hệ thống thực tế hơn nhưng vẫn kiểm soát được phạm vi phát triển.
