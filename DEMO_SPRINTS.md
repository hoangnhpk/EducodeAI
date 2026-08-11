# Demo kiểm thử các Sprint

Tài liệu này ghi lại **công dụng**, **phạm vi** và **cách kiểm thử** từng Sprint.

---

## Sprint 1 — Sinh đồ án

### Công dụng
- Sinh đồ án bằng AI theo mục tiêu nghề nghiệp, công nghệ và cấp độ.
- Lưu đồ án vào tài khoản người dùng.
- Tránh tạo bản ghi đồ án trùng khi người dùng nộp đồ án để phỏng vấn.
- Kiểm tra người dùng đã đăng nhập và có đúng quyền sở hữu đồ án.

### Cách test
1. Đăng xuất rồi truy cập API/trang sinh đồ án.
   - Kết quả mong đợi: hệ thống yêu cầu đăng nhập.
2. Đăng nhập bằng tài khoản học viên.
3. Mở trang **Sinh đồ án AI**.
4. Chọn mục tiêu nghề nghiệp, công nghệ và cấp độ.
5. Bấm **Sinh đồ án**.
   - Kết quả mong đợi: AI trả về tên, mô tả, danh sách chức năng và cấu trúc database.
6. Hoàn thành/chấm đạt toàn bộ chức năng.
7. Bấm **Nộp đồ án / Bắt đầu phỏng vấn**.
   - Kết quả mong đợi: chuyển sang phiên phỏng vấn của đúng đồ án.
8. Kiểm tra database.
   - Kết quả mong đợi: không tạo thêm bản ghi đồ án trùng cho lần nộp đó.
9. Đăng nhập bằng tài khoản khác và thử sử dụng `maDoAn` của tài khoản đầu tiên.
   - Kết quả mong đợi: bị từ chối truy cập.

### Regression cần kiểm tra
- Phỏng vấn đồ án vẫn nhận đúng `sessionId` và câu hỏi đầu tiên.
- Chấm điểm từng chức năng vẫn hoạt động.
- Chứng chỉ vẫn được tạo sau khi đạt phỏng vấn.
- Các chức năng phỏng vấn AI độc lập không bị ảnh hưởng.

### Trạng thái
- Backend build: đạt, 0 lỗi.
- Frontend build: đạt.
- Kiểm thử trình duyệt/database thực tế: cần thực hiện bằng tài khoản test.

---

## Sprint 2 — Phỏng vấn đồ án

### Công dụng
- Cho phép học viên phỏng vấn sau khi hoàn thành đồ án.
- AI hỏi 3 câu và chấm điểm.
- Lưu kết quả, trạng thái đạt/chưa đạt và chứng chỉ.

### Cách test
1. Hoàn thành một đồ án.
2. Bắt đầu phỏng vấn đồ án.
3. Trả lời đủ 3 câu.
4. Kiểm tra điểm từng câu và tổng điểm.
5. Tải lại trang trong cùng tab.
   - Kết quả mong đợi: thông tin đồ án và câu hỏi đầu tiên vẫn được giữ ở giao diện; phiên trả lời thực tế vẫn phụ thuộc session trên server.
6. Thử gửi `sessionId` bằng tài khoản khác.
   - Kết quả mong đợi: bị từ chối truy cập.
7. Kiểm tra kết quả và chứng chỉ sau khi đạt.
   - Kết quả mong đợi: đồ án chuyển sang trạng thái đạt, lưu lịch sử phỏng vấn và tạo chứng chỉ một lần.
8. Khởi động lại backend giữa phiên.
   - Kết quả hiện tại: phiên đang làm có thể hết vì session vẫn lưu trong MemoryCache; cần hoàn thiện lưu bền vững ở sprint mở rộng.

### Regression cần kiểm tra
- Sinh đồ án vẫn tạo đúng dữ liệu và không tạo bản ghi trùng khi nộp.
- Chấm điểm từng tính năng không bị ảnh hưởng.
- Phỏng vấn AI giả lập không bị ảnh hưởng.
- Tài khoản khác không thể dùng `sessionId` hoặc lấy kết quả của tài khoản hiện tại.

### Trạng thái
- Đã triển khai: kiểm tra quyền sở hữu session/đồ án, kiểm tra dữ liệu trả lời, bảo vệ kết quả và giữ thông tin handoff khi refresh.
- Backend build: đạt, 0 lỗi.
- Frontend build: đạt.
- Lưu phiên bền vững qua restart backend: chưa hoàn thành, cần sprint mở rộng.

---

## Sprint 3 — Phỏng vấn AI giả lập

### Công dụng
- Cho phép người dùng phỏng vấn AI độc lập, không cần làm đồ án.
- Lưu lịch sử hỏi đáp, điểm số, điểm mạnh, điểm cần cải thiện và lời khuyên.

### Cách test
1. Đăng nhập và mở **Phỏng vấn AI**.
2. Chọn vị trí, cấp độ, tính cách AI và số câu hỏi.
3. Bắt đầu phỏng vấn.
4. Trả lời từng câu bằng cách gõ văn bản.
5. Kiểm tra AI nhận xét và đưa câu hỏi tiếp theo.
6. Kết thúc phỏng vấn.
7. Kiểm tra các ô điểm số, nhận xét, điểm mạnh, cần cải thiện và lời khuyên.
8. Mở lịch sử phỏng vấn để kiểm tra dữ liệu đã lưu.

### Regression cần kiểm tra
- Mic vẫn chuyển giọng nói thành văn bản.
- Phỏng vấn đồ án không bị ảnh hưởng.

### Trạng thái
- Đã triển khai: chuẩn hóa response `{ success, data }` ở service frontend, giữ yêu cầu đăng nhập, tách nhận xét và câu hỏi tiếp theo, giữ mic và giao diện kết quả.
- Đã bổ sung: kết thúc sớm vẫn gọi tổng hợp kết quả thay vì thoát thẳng về trang chủ; đọc user ID từ các claim đang dùng trong hệ thống.
- Backend build: đạt, 0 lỗi.
- Frontend build: đạt.
- Kiểm thử trình duyệt thực tế với tài khoản test: cần thực hiện.

---

## Sprint 4 — Mic và giao diện phỏng vấn

### Công dụng
- Nhận giọng nói tiếng Việt và tự điền vào khung trả lời.
- Cho phép bật/tắt mic rõ ràng.
- Hiển thị kết quả thành các ô riêng biệt.

### Cách test
1. Mở Phỏng vấn AI bằng trình duyệt hỗ trợ Web Speech API.
2. Cấp quyền microphone.
3. Bật mic và nói tiếng Việt.
4. Kiểm tra văn bản tự xuất hiện trong ô nhập.
5. Tắt mic khi đang ghi âm.
6. Gửi câu trả lời bằng văn bản đã nhận.
7. Kiểm tra giao diện kết quả cuối.

### Regression cần kiểm tra
- Gửi câu trả lời bằng cách gõ vẫn hoạt động.
- Nút kết thúc không điều hướng tới trang 404.

### Trạng thái
- Đã triển khai một phần trước Sprint 1.

---

## Sprint 5 — Kiểm thử tổng thể

### Công dụng
- Kiểm tra toàn bộ luồng sau khi hoàn thành các sprint.
- Phát hiện lỗi liên kết giữa frontend, backend, database và xác thực.

### Cách test
1. Test bằng tài khoản chưa đăng nhập.
2. Test bằng tài khoản học viên hợp lệ.
3. Test hết hạn token và đăng nhập lại.
4. Test sinh đồ án.
5. Test phỏng vấn đồ án.
6. Test phỏng vấn AI giả lập.
7. Test mic.
8. Restart backend rồi kiểm tra các phiên đang hoạt động.
9. Test hai tài khoản không được xem dữ liệu của nhau.
10. Kiểm tra build backend và frontend.

### Tiêu chí đạt
- Không có lỗi console nghiêm trọng.
- Không có lỗi 401/403/404 sai nguyên nhân.
- Dữ liệu đúng người dùng và không bị tạo trùng.
- Các chức năng liên kết không bị ảnh hưởng.

### Trạng thái
- Chưa triển khai sprint.

---

## Quy tắc review sau mỗi Sprint

Sau mỗi Sprint cần kiểm tra:

- Những file nào đã thay đổi.
- Chức năng chính của Sprint có hoạt động đúng không.
- Các chức năng liên kết có bị ảnh hưởng không.
- Backend build có lỗi không.
- Frontend build có lỗi không.
- Có lỗi phân quyền hoặc lộ dữ liệu người dùng không.
- Kết quả test đạt, chưa đạt và nguyên nhân nếu chưa đạt.
