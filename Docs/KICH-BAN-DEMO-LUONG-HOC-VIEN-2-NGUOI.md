# Kịch bản demo luồng Học viên — EduCodeAI (2 người)

## 1. Mục tiêu của phần demo

Phần này trình bày một hành trình hoàn chỉnh của học viên:

> **Khám phá khóa học → đăng nhập → sở hữu khóa học → học bài → làm quiz → thực hành code → nhận hỗ trợ AI → theo dõi tiến độ.**

Thông điệp chính cần làm rõ:

> EduCodeAI không chỉ phát video như một LMS thông thường, mà tạo thành vòng học lập trình khép kín: **học kiến thức, thực hành, chấm tự động, nhận gợi ý AI và theo dõi sự tiến bộ**.

### Thời lượng đề xuất

- Tổng thời gian: **10–15 phút**.
- Người 1: khoảng **5–6 phút**.
- Người 2: khoảng **6–8 phút**.
- Nên dành 1–2 phút dự phòng nếu AI hoặc mạng phản hồi chậm.

---

## 2. Phân vai tổng quát

| Người trình bày | Phạm vi | Thông điệp |
|---|---|---|
| **Người 1 — Hành trình tiếp cận khóa học** | Giới thiệu actor học viên, trang chủ, tìm khóa học, chi tiết khóa học, đăng nhập, mua/đăng ký, “Khóa học của tôi” | Học viên dễ dàng tìm và sở hữu khóa học phù hợp |
| **Người 2 — Trải nghiệm học tập thông minh** | Nội dung bài học, tiến độ, ghi chú/tóm tắt AI, quiz, IDE và AI Code Doctor, lộ trình AI, tính năng hỗ trợ | EduCodeAI hỗ trợ học viên học, luyện tập và tiến bộ trong cùng một hệ thống |

### Điểm bàn giao giữa hai người

Người 1 kết thúc tại màn hình **Khóa học của tôi** hoặc ngay sau khi bấm **Tiếp tục học**.

Câu chuyển đề xuất:

> “Đến đây, học viên đã tìm được và sở hữu khóa học phù hợp. Tuy nhiên, giá trị chính của EduCodeAI không dừng ở việc bán khóa học. Tiếp theo, bạn [tên người 2] sẽ trình bày cách hệ thống hỗ trợ học viên học, thực hành và cải thiện năng lực với AI.”

---

## 3. Dữ liệu phải chuẩn bị trước buổi demo

### 3.1. Tài khoản

Chuẩn bị tối thiểu:

1. **Tài khoản học viên A** đã đăng nhập ổn định.
2. Học viên A đã sở hữu một khóa học có:
   - Ít nhất 2–3 bài học.
   - Một video ngắn.
   - Nội dung lý thuyết.
   - Một quiz đã cấu hình đáp án và điểm đạt.
   - Một bài thực hành có test case.
   - Tiến độ học chưa hoàn thành 100%.
3. Nếu muốn chứng minh mã quà tặng, chuẩn bị một mã chưa sử dụng và tài khoản học viên B.

Không nên tạo tài khoản mới trực tiếp trong phần demo chính vì đăng ký phụ thuộc CAPTCHA, email và OTP.

### 3.2. Nội dung khóa học

Chọn một khóa dễ hiểu, ví dụ **C# cơ bản**, **ReactJS cơ bản** hoặc **Python cơ bản**. Chuẩn bị:

- Một bài đã hoàn thành để thể hiện dấu tích và tiến độ.
- Một bài đang học để tiếp tục video.
- Một quiz ngắn khoảng 2–3 câu.
- Một bài code đơn giản, ví dụ tính tổng hoặc kiểm tra số chẵn.
- Một đoạn code gần đúng nhưng sai một lỗi nhỏ để AI Code Doctor có thể đưa ra gợi ý rõ ràng.

### 3.3. AI và dịch vụ nền

Trước giờ demo cần kiểm tra:

- Frontend, backend và database đều hoạt động.
- API key AI còn hạn mức.
- Tính năng tóm tắt video, AI Code Doctor hoặc lộ trình AI trả kết quả.
- Redis và dịch vụ email nếu phần trình bày có sử dụng.
- Không khởi động lại backend giữa phiên phỏng vấn đồ án vì phiên đang hoạt động có thể phụ thuộc bộ nhớ tạm.

### 3.4. Thanh toán

- Luồng chính nên dùng **khóa miễn phí** hoặc một khóa đã mua sẵn.
- Có thể mở modal QR để giới thiệu cơ chế thanh toán, nhưng không nên chờ chuyển khoản/webhook thật trên sân khấu.
- Chuẩn bị ảnh/video dự phòng của trạng thái thanh toán thành công.

### 3.5. Trình duyệt và phương án dự phòng

- Mở sẵn các tab cần dùng nhưng chỉ trình chiếu một tab chính.
- Tăng zoom trình duyệt để hội đồng đọc được chữ.
- Tắt thông báo cá nhân và ứng dụng gây popup.
- Chuẩn bị ảnh chụp hoặc video ngắn cho:
  - Thanh toán thành công.
  - AI trả kết quả.
  - Test case đạt.
  - Chứng chỉ.

---

## 4. Kịch bản chi tiết — Người 1

## Phần 1 — Giới thiệu actor học viên (30–45 giây)

### Thao tác

Đứng ở slide hoặc trang chủ EduCodeAI.

### Lời nói gợi ý

> “Trong hệ thống EduCodeAI, học viên là actor trực tiếp sử dụng sản phẩm để tìm khóa học, đăng ký, học nội dung, làm bài kiểm tra và thực hành lập trình. Ngoài các chức năng của một LMS, hệ thống còn tích hợp AI vào từng giai đoạn để cá nhân hóa và hỗ trợ học tập.”

### Mức độ

**Nói ngắn.** Không liệt kê toàn bộ menu ngay từ đầu.

---

## Phần 2 — Khách khám phá khóa học (1–1,5 phút)

### Thao tác

1. Tại trang chủ, giới thiệu nhanh khu vực nổi bật.
2. Dùng ô tìm kiếm với từ khóa như “C#”, “Python” hoặc “React”.
3. Có thể bấm một danh mục để lọc nhanh.
4. Chọn một thẻ khóa học và mở trang chi tiết.

### Nội dung cần nói

- Khách chưa đăng nhập vẫn xem được trang chủ và chi tiết khóa học.
- Học viên có thể tìm theo tên hoặc lĩnh vực.
- Thẻ khóa học thay đổi hành động tùy trạng thái: học thử, mua ngay hoặc tiếp tục học.

### Lời nói gợi ý

> “Đầu tiên, người dùng chưa cần đăng nhập vẫn có thể khám phá các khóa học. Hệ thống hỗ trợ tìm theo từ khóa và lĩnh vực. Trạng thái trên từng thẻ cũng được cá nhân hóa: nếu chưa sở hữu thì có thể xem chi tiết hoặc mua, còn nếu đã đăng ký thì hệ thống cho phép tiếp tục học.”

### Mức độ

**Nói vừa đủ.** Đây là bước dẫn vào nghiệp vụ chính, không dành quá nhiều thời gian cho giao diện trang chủ.

---

## Phần 3 — Xem chi tiết và quyết định đăng ký (1 phút)

### Thao tác

Trên trang chi tiết, cuộn qua:

- Mô tả khóa học.
- Kiến thức học viên sẽ đạt được.
- Chương trình học.
- Thông tin giảng viên.
- Đánh giá học viên.

Sau đó bấm **Đăng ký ngay** hoặc hành động tương ứng.

### Nội dung cần nói

- Trang chi tiết giúp học viên đánh giá khóa học trước khi mua.
- Hệ thống kiểm tra học viên đã sở hữu khóa học hay chưa.
- Nếu chưa đăng nhập, hệ thống yêu cầu đăng nhập trước khi mua/đăng ký.

### Lưu ý

Không demo nút **Thêm vào giỏ hàng** nếu chưa kiểm tra chắc chắn vì phần này có giao diện nhưng khả năng kết nối nghiệp vụ chưa rõ.

---

## Phần 4 — Đăng ký và đăng nhập (45–60 giây)

### Thao tác

Chỉ mở nhanh màn hình đăng nhập hoặc sử dụng tài khoản đã đăng nhập sẵn.

### Nội dung nói sơ qua

- Đăng ký học viên dùng email, mật khẩu mạnh, CAPTCHA và OTP email.
- Hỗ trợ Google/Facebook.
- Thiết bị mới có thể cần OTP.
- Hệ thống giới hạn phiên/thiết bị và hỗ trợ đăng xuất từ xa.

### Lời nói gợi ý

> “Ở bước xác thực, EduCodeAI hỗ trợ đăng nhập thông thường và đăng nhập mạng xã hội. Quá trình đăng ký có CAPTCHA và xác minh OTP. Với thiết bị mới, hệ thống có thêm bước xác thực và người dùng có thể quản lý các phiên đăng nhập của mình.”

### Mức độ

**Nói sơ qua.** Không chờ email OTP trực tiếp trừ khi nhóm muốn lấy bảo mật làm nội dung trọng tâm.

---

## Phần 5 — Mua hoặc đăng ký khóa học (1,5–2 phút)

### Phương án demo an toàn

Dùng khóa học miễn phí:

1. Bấm **Học miễn phí ngay**.
2. Hiển thị thông báo đăng ký thành công.
3. Hệ thống tự mở nội dung khóa học.

### Nếu giới thiệu khóa trả phí

1. Mở trang mua khóa học.
2. Chỉ ra ô **Mã giảm giá**.
3. Bấm **Thanh toán khóa học** để mở mã QR.
4. Giải thích hệ thống kiểm tra trạng thái mỗi 3 giây.
5. Đóng modal, không chờ thanh toán thật.

### Nội dung quan trọng cần nói kỹ

- Sau thanh toán thành công, hệ thống tạo quyền đăng ký khóa học cho đúng học viên.
- Khóa học được mở tự động khi đơn đã thanh toán.
- Có voucher, tạo mã quà tặng và quy trình báo admin hỗ trợ khi giao dịch chưa được đối soát.

### Lời nói gợi ý

> “Với khóa trả phí, hệ thống tạo mã QR kèm đúng số tiền và nội dung chuyển khoản. Giao diện tự kiểm tra trạng thái đơn định kỳ; khi giao dịch được xác nhận, quyền học được cấp và học viên được chuyển thẳng vào khóa học. Ngoài ra còn có mã giảm giá, tặng khóa học bằng code và chức năng gửi yêu cầu hỗ trợ đối soát.”

### Không nên khẳng định

Không nói thanh toán “luôn tức thời” nếu nhóm chưa kiểm thử webhook SePay trong đúng môi trường demo.

---

## Phần 6 — Khóa học của tôi và bàn giao (45–60 giây)

### Thao tác

1. Mở **Khóa học của tôi**.
2. Chỉ ra phần trăm tiến độ và số bài đã hoàn thành.
3. Bấm **Tiếp tục học**.
4. Chuyển lời cho người 2.

### Lời nói gợi ý

> “Sau khi có quyền học, khóa học xuất hiện trong mục Khóa học của tôi. Học viên có thể biết mình đã hoàn thành bao nhiêu bài và tiếp tục đúng vị trí trước đó. Đến đây, bạn [tên người 2] sẽ trình bày phần cốt lõi: trải nghiệm học, kiểm tra và thực hành với AI.”

---

## 5. Kịch bản chi tiết — Người 2

## Phần 7 — Nội dung bài học và tiến độ (1,5–2 phút)

### Thao tác

1. Mở một bài video.
2. Chỉ ra danh sách chương/bài ở sidebar.
3. Chỉ ra bài đã hoàn thành, bài hiện tại và bài đang khóa.
4. Tua video gần mốc hoàn thành nếu đã chuẩn bị.
5. Chuyển sang nội dung lý thuyết hoặc bài kế tiếp.

### Nội dung cần nói kỹ

- Bài học gồm video, lý thuyết, quiz và bài thực hành.
- Hệ thống lưu tiến độ theo từng bài.
- Video đạt khoảng 85% có thể được ghi nhận hoàn thành.
- Bài học được mở tuần tự để đảm bảo học viên theo đúng lộ trình.
- Học viên có thể quay lại và tiếp tục từ tiến độ trước đó.

### Lời nói gợi ý

> “Trong khóa học, nội dung được tổ chức theo chương và bài. Hệ thống theo dõi tiến độ ở mức bài học. Khi học viên xem đủ nội dung video, bài được đánh dấu hoàn thành, tiến độ được cập nhật và bài tiếp theo được mở. Cách này giúp việc học có trình tự thay vì chỉ mở tất cả nội dung mà không kiểm soát.”

### Lưu ý

Không nên chờ xem từ đầu đến 85% trong lúc demo. Hãy chuẩn bị video ngắn hoặc tua gần mốc cần thiết.

---

## Phần 8 — AI gắn trực tiếp với bài học (1–1,5 phút)

### Thao tác

Chọn 1–2 chức năng tiêu biểu:

- **Tóm tắt Video AI**.
- Chapter/timestamp để nhảy đến đoạn liên quan.
- Ghi chú thường gắn timestamp.
- Ghi chú AI hoặc trợ lý hỏi đáp AI.

### Nội dung cần nói kỹ

> AI không phải một chatbot đứng riêng, mà được gắn với nội dung học viên đang học.

- Tóm tắt giúp ôn lại nội dung nhanh.
- Timestamp/chapter giúp quay lại đúng đoạn video.
- Ghi chú giúp học viên lưu kiến thức theo ngữ cảnh.

### Lời nói gợi ý

> “Điểm khác biệt là AI được đặt ngay trong ngữ cảnh bài học. Học viên có thể xem bản tóm tắt, chọn chapter để quay đến đúng đoạn video hoặc tạo ghi chú. Nhờ đó AI hỗ trợ việc hiểu và ôn tập nội dung, thay vì chỉ trả lời các câu hỏi chung.”

### Phương án dự phòng

Nếu AI phản hồi chậm, mở kết quả đã tạo sẵn và giải thích đầu vào/đầu ra, không đứng chờ màn hình loading.

---

## Phần 9 — Quiz kiểm tra kiến thức (1–1,5 phút)

### Thao tác

1. Mở **Bài tập trắc nghiệm**.
2. Trả lời 2–3 câu đã chuẩn bị.
3. Bấm **Nộp bài**.
4. Chỉ ra điểm, đáp án đúng/sai và phần giải thích.
5. Nếu đạt, cho thấy hệ thống gợi ý chuyển sang bài tiếp theo.

### Nội dung cần nói

- Quiz có thanh tiến trình, điều hướng câu hỏi và bộ đếm giờ nếu được cấu hình.
- Sau khi nộp, học viên biết điểm, đáp án và giải thích.
- Nếu chưa đạt, học viên có thể làm lại.
- Nếu đạt, kết quả được lưu và bài học được cập nhật.

### Mức độ

**Nói vừa.** Mục đích là chứng minh vòng phản hồi học tập, không cần giải thích từng loại câu hỏi.

### Không nên khẳng định

Không mô tả quiz là hệ thống thi chống gian lận hoặc chấm bảo mật cao; luồng hiện tại có phần tính kết quả ở phía client trước khi lưu.

---

## Phần 10 — Thực hành IDE và AI Code Doctor (2–3 phút)

Đây là **phần quan trọng nhất** trong demo học viên.

### Thao tác

1. Mở **Bài tập thực hành IDE**.
2. Giới thiệu đề bài và editor code trong trình duyệt.
3. Dán/nhập đoạn code sai một lỗi nhỏ.
4. Bấm **Nộp bài**.
5. Chỉ ra số test case đạt/tổng và test bị lỗi.
6. Bấm **Chẩn đoán lỗi** để gọi AI Code Doctor.
7. Sửa code theo gợi ý.
8. Nộp lại và cho thấy toàn bộ test case đạt.

### Nội dung cần nói kỹ

- Học viên code ngay trong trình duyệt, không cần cài IDE riêng.
- Backend chạy/chấm bài theo test case do giảng viên cấu hình.
- Kết quả thể hiện cụ thể test nào đạt hoặc sai.
- AI Code Doctor ưu tiên gợi ý cách sửa, không chỉ đưa luôn đáp án.
- Lịch sử bài làm giúp học viên xem lại quá trình cải thiện.

### Lời nói gợi ý

> “Sau khi học lý thuyết, học viên thực hành ngay trong trình duyệt. Bài nộp được kiểm tra bằng các test case. Nếu chưa đạt, học viên biết lỗi nằm ở trường hợp nào và có thể yêu cầu AI Code Doctor phân tích. Sau khi sửa và nộp lại, kết quả được lưu vào lịch sử. Đây là vòng học khép kín: học — làm — nhận phản hồi — sửa — hoàn thành.”

### Phương án dự phòng

- Lưu sẵn đoạn code sai và code đúng trong file text để dán nhanh.
- Nếu AI lỗi, vẫn demo được test case và mở ảnh gợi ý AI đã chuẩn bị.
- Nếu dịch vụ chạy code chậm, dùng bài rất ngắn và ít test case.

---

## Phần 11 — Không gian học tập và lộ trình AI (1–1,5 phút)

### Thao tác

1. Mở **Không gian học tập**.
2. Chỉ ra tổng quan khóa đang học và skill tree.
3. Mở kết quả lộ trình AI đã lưu sẵn.

### Nội dung cần nói

- Học viên cung cấp mục tiêu, trình độ, thời gian và kiến thức hiện tại.
- AI đề xuất lộ trình cùng các khóa học phù hợp.
- Lộ trình đã lưu được kết hợp với trạng thái khóa học và tiến độ để tạo skill tree.
- Các nút có thể thể hiện đã hoàn thành, đang học, chưa đăng ký hoặc đang khóa.

### Lời nói gợi ý

> “Bên cạnh từng khóa học riêng lẻ, hệ thống còn giúp học viên nhìn ở mức mục tiêu dài hạn. AI phân tích mục tiêu và năng lực hiện tại để đề xuất lộ trình. Khi lưu lại, lộ trình được thể hiện thành skill tree gắn với các khóa học và tiến độ thực tế.”

### Mức độ

**Nói kỹ vừa phải.** Nên mở kết quả có sẵn thay vì sinh mới nếu thời gian giới hạn.

---

## Phần 12 — Tính năng hỗ trợ khác và kết luận (45–60 giây)

### Chỉ lướt qua

- Thử thách tuần, EXP, danh hiệu và bảng xếp hạng.
- Nhập mã quà tặng và lịch sử quà tặng.
- Đánh giá khóa học.
- Hồ sơ, đổi mật khẩu, quản lý thiết bị và đăng xuất từ xa.
- Phỏng vấn AI giả lập.
- Sinh đồ án AI và bảo vệ đồ án.

### Lời nói gợi ý

> “Ngoài luồng chính, hệ thống có thử thách tuần, EXP, danh hiệu và bảng xếp hạng để duy trì động lực. Học viên cũng có thể quản lý thiết bị đăng nhập, nhận khóa học qua mã quà tặng, đánh giá khóa học, luyện phỏng vấn hoặc tạo đồ án bằng AI.”

### Câu kết luận

> “Như vậy, actor học viên có một hành trình xuyên suốt: tìm đúng khóa học, sở hữu nội dung, học theo tiến độ, kiểm tra kiến thức, thực hành code, nhận phản hồi AI và theo dõi sự tiến bộ. Đây là giá trị cốt lõi mà EduCodeAI hướng tới.”

---

## 6. Tính năng nào nói kỹ, tính năng nào nói sơ qua?

| Tính năng | Mức độ | Lý do |
|---|---|---|
| Tìm kiếm và chi tiết khóa học | Vừa | Cần để tạo bối cảnh trước khi học |
| Đăng ký, OTP, CAPTCHA | Sơ qua | Quan trọng về bảo mật nhưng dễ tốn thời gian và phụ thuộc email |
| Thanh toán QR và cấp quyền học | Kỹ vừa | Thể hiện nghiệp vụ thương mại hoàn chỉnh |
| Khóa học của tôi và tiến độ | Kỹ | Là cầu nối giữa mua và học |
| Video/lý thuyết, khóa bài tuần tự | Kỹ | Nghiệp vụ LMS cốt lõi |
| Tóm tắt video, chapter, ghi chú AI | Kỹ | Chứng minh AI được tích hợp vào ngữ cảnh học |
| Quiz | Vừa | Chứng minh kiểm tra và phản hồi |
| IDE, test case, AI Code Doctor | **Rất kỹ** | Điểm nổi bật nhất đối với nền tảng học lập trình |
| Lộ trình AI và skill tree | Kỹ vừa | Thể hiện cá nhân hóa dài hạn |
| Chứng chỉ khóa học | Sơ qua hoặc demo nếu ổn định | Chỉ nên nói kỹ khi dữ liệu kiểm tra cuối khóa đã chuẩn bị đầy đủ |
| Thử thách, EXP, danh hiệu | Sơ qua | Tính năng hỗ trợ giữ chân học viên |
| Quà tặng, voucher, hỗ trợ thanh toán | Sơ qua | Hỗ trợ thương mại, không phải trọng tâm học tập |
| Hồ sơ và quản lý thiết bị | Sơ qua | Hỗ trợ bảo mật tài khoản |
| Sinh đồ án và phỏng vấn AI | Demo thay thế hoặc phần bonus | “Wow factor” mạnh nhưng là một luồng lớn riêng |

---

## 7. Phương án demo “wow factor” thay thế

Nếu hội đồng quan tâm nhiều đến AI hơn luồng LMS, có thể thay phần **Không gian học tập + lộ trình AI + tính năng hỗ trợ** bằng một demo ngắn về **Sinh đồ án AI**.

### Luồng đề xuất

1. Chọn mục tiêu nghề nghiệp.
2. Chọn công nghệ và cấp độ.
3. Mở một đồ án đã sinh sẵn.
4. Chỉ ra tên, mô tả, yêu cầu chức năng và cấu trúc database.
5. Giải thích học viên tải file code cho từng chức năng để AI chấm.
6. Sau khi hoàn thành tất cả chức năng, học viên nộp đồ án và vào phòng phỏng vấn.
7. AI hỏi 3 câu theo chính đồ án, chấm từng câu và tổng kết đạt/không đạt.
8. Nếu đạt từ 50 điểm, hiển thị chứng chỉ.

### Lưu ý

- Không nên demo đầy đủ cả **IDE AI** và **Sinh đồ án → phỏng vấn → chứng chỉ** trong 10–15 phút.
- Chọn một điểm nhấn chính:
  - **Ưu tiên sản phẩm LMS:** chọn IDE + AI Code Doctor.
  - **Ưu tiên yếu tố AI:** chọn Sinh đồ án + phỏng vấn AI.

---

## 8. Các phát biểu cần tránh

1. Không nói mọi route học viên chỉ role học viên truy cập; nhiều route frontend hiện cho phép các role 0, 1 và 2 đi qua.
2. Không nói thanh toán luôn realtime nếu chưa kiểm thử webhook SePay trong môi trường trình diễn.
3. Không gọi quiz là hệ thống thi chống gian lận.
4. Không nói lịch sử sinh đồ án được đồng bộ đa thiết bị; phần lịch sử giao diện hiện có sử dụng local storage.
5. Không khẳng định AI luôn sẵn sàng; tính năng phụ thuộc API key, quota và mạng.
6. Không khẳng định mọi loại chứng chỉ đều đã kiểm thử hoàn chỉnh; chỉ demo luồng đã được nhóm kiểm tra trực tiếp.
7. Không demo chức năng chỉ vì có nút trên giao diện nếu chưa xác nhận API và dữ liệu hoạt động.

---

## 9. Timeline rút gọn 12 phút

| Thời gian | Người | Nội dung |
|---:|---|---|
| 0:00–0:40 | Người 1 | Giới thiệu actor và mục tiêu hành trình |
| 0:40–2:00 | Người 1 | Trang chủ, tìm kiếm, chi tiết khóa học |
| 2:00–2:40 | Người 1 | Đăng nhập/đăng ký nói nhanh |
| 2:40–4:20 | Người 1 | Đăng ký miễn phí hoặc giới thiệu QR thanh toán |
| 4:20–5:00 | Người 1 | Khóa học của tôi và bàn giao |
| 5:00–6:40 | Người 2 | Nội dung học, tiến độ, mở khóa tuần tự |
| 6:40–7:40 | Người 2 | Tóm tắt/ghi chú AI |
| 7:40–8:50 | Người 2 | Quiz |
| 8:50–11:10 | Người 2 | IDE, test case, AI Code Doctor |
| 11:10–12:00 | Người 2 | Lộ trình/không gian học tập và kết luận |

---

## 10. Checklist 15 phút trước khi trình bày

- [ ] Frontend truy cập được.
- [ ] Backend và database hoạt động.
- [ ] Đăng nhập tài khoản học viên thành công.
- [ ] Tài khoản đã sở hữu đúng khóa demo.
- [ ] Khóa có video, quiz và bài IDE.
- [ ] Tiến độ hiển thị đúng.
- [ ] Quiz tải được câu hỏi và nộp được.
- [ ] Dịch vụ chạy code hoạt động.
- [ ] AI Code Doctor hoặc kết quả AI dự phòng đã sẵn sàng.
- [ ] Có sẵn code sai và code đúng để dán.
- [ ] Không chờ thanh toán thật trong kịch bản chính.
- [ ] Đã mở sẵn kết quả lộ trình/đồ án AI nếu cần.
- [ ] Ảnh/video dự phòng nằm trong thư mục dễ mở.
- [ ] Hai người đã thống nhất câu bàn giao.
- [ ] Chạy thử toàn bộ kịch bản với đồng hồ và giữ dưới 15 phút.

---

## 11. Tóm tắt một câu cho mỗi người

- **Người 1:** “Tôi trình bày cách một khách trở thành học viên và sở hữu khóa học phù hợp.”
- **Người 2:** “Tôi trình bày cách EduCodeAI giúp học viên học, thực hành, nhận phản hồi AI và tiến bộ.”
