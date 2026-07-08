# TÀI LIỆU PHÂN TÍCH KIẾN TRÚC & DATABASE

Tài liệu này phân tích chi tiết về kiến trúc hệ thống, luồng xử lý, hiệu năng, bảo mật và cấu trúc Database cho 2 tính năng: **Đăng ký Giảng viên** và **Chi tiết Khóa học**.

---

## PHẦN 1: PHÂN TÍCH CHUYÊN SÂU: KIẾN TRÚC, HIỆU NĂNG & BẢO MẬT

### 1. Phân tích Luồng hoạt động (User Flow)

#### A. Luồng Đăng ký Giảng Viên (KYC Flow)
*   **Thực trạng UI:** Frontend đang chia làm 3 bước rất tốt (Hồ sơ -> KYC giấy tờ -> Thanh toán). 
*   **Đề xuất chuẩn hóa Luồng Backend:**
    1.  **Submit:** FE gom dữ liệu 3 bước gọi API `POST /api/giang-vien/dang-ky`.
    2.  **Upload File:** Các ảnh CCCD/Passport tuyệt đối **không** được gửi base64 lên server. FE phải upload file trực tiếp lên Cloud (S3/Cloudinary/Supabase Storage), lấy link URL rồi mới gửi URL đó cho Backend lưu.
    3.  **Lưu DB:** Backend lưu vào DB với `VaiTro = 1` nhưng `TrangThai = "ChoDuyet"`.
    4.  **Duyệt:** Admin vào trang quản trị xem ảnh KYC, nếu OK mới đổi trạng thái thành `"DaDuyet"`. Lúc này User mới chính thức có quyền đăng khóa học.

#### B. Luồng Chi tiết Khóa Học
*   **Thực trạng:** Khi user vào trang chi tiết, FE gọi API `GetKhoaHocById`. Backend đang query bảng Khóa Học và `Include()` bảng Chương Học, `ThenInclude()` bảng Bài Học.
*   **Đánh giá:** Luồng này đúng chuẩn nhưng sẽ phát sinh **vấn đề hiệu năng nghiêm trọng** nếu khóa học quá lớn.

---

### 2. Giải pháp Tối ưu Hiệu năng (Performance)

#### Phía Backend (Cực kỳ quan trọng)
*   **Vấn đề N+1 Query & Payload quá bự:** API chi tiết khóa học hiện tại đang trả về toàn bộ thông tin của khóa học, bao gồm TẤT CẢ các Chương và TẤT CẢ Bài học.
*   **Cách giải quyết:** 
    *   Sử dụng **Redis Cache**: Trang chi tiết khóa học là dạng dữ liệu *Read-Heavy* (đọc nhiều, hiếm khi sửa). Bắt buộc phải Cache API này vào Redis trong 1-2 tiếng. Khi giảng viên sửa khóa học thì mới xóa Cache.
    *   **Chuẩn hóa Cột Thống kê (Denormalization):** Đừng dùng hàm `.Count()` hay `.Average()` mỗi lần gọi API để tính số lượng học viên hay sao đánh giá. Hãy tạo các cột `TongSoHocVien` (int) và `DiemDanhGiaTB` (float) nằm trực tiếp trong bảng `KhoaHocModel`. Mỗi khi có review mới hoặc user mua khóa mới, dùng Trigger hoặc Background Job để update các cột này.

#### Phía Frontend
*   Không render toàn bộ video ở giao diện tĩnh, chỉ dùng ảnh Thumbnail.
*   Danh sách Đánh giá (Reviews) bắt buộc phải dùng **Phân trang (Pagination)** hoặc **Tải thêm (Load More)**. 

---

### 3. Giải pháp Bảo mật (Security)

*   **Bảo vệ File KYC (CCCD/Passport):** Link ảnh CCCD của giảng viên KHÔNG ĐƯỢC LÀ PUBLIC URL (ai có link cũng xem được). File này phải được lưu ở Private Bucket trên Cloud. Chỉ Backend C# mới có quyền tạo "Pre-signed URL" (link sống trong 5 phút) để Admin xem.
*   **Bảo vệ Video Khóa Học:** API `GetKhoaHocById` tuyệt đối **không được trả về `LinkVideo`** của các bài học (trừ những bài được đánh dấu là `HocThu = true`). Nếu trả về toàn bộ link MP4, hacker chỉ cần bấm F12 là lấy được toàn bộ khóa học mà không cần mua.
*   **Chống Spam OTP:** Ở bước xác minh SĐT, API gửi OTP cần có Rate Limit (VD: 1 phút chỉ được nhấn gửi 1 lần, 1 ngày tối đa 5 lần cho 1 IP/SĐT).
*   **Bảo mật Thông tin Thanh toán:** Các thông tin như `SoTaiKhoanNganHang` không bao giờ được trả về ở các API Public.

---

## PHẦN 2: CẤU TRÚC DATABASE - CÁC TRƯỜNG CẦN BỔ SUNG SO VỚI GIAO DIỆN

Dựa vào đối chiếu giữa Bảng (Models) và Giao diện (Frontend), dưới đây là danh sách những gì đã có và **ĐANG BỊ THIẾU** cần bổ sung vào DB.

### 1. Chức năng: Giảng viên đăng ký tài khoản
Bảng lưu trữ chính: **`NguoiDungModel`**

#### ❌ CÁC THUỘC TÍNH BỊ THIẾU (Nên tạo bảng mới `HoSoGiangVienModel` để liên kết 1-1 thay vì nhét hết vào `NguoiDungModel`):
**Hồ sơ chuyên môn:**
*   `LinhVucGiangDay` (string): Lĩnh vực chuyên môn chính.
*   `TieuSu` (string - dạng Text dài): Lời giới thiệu ngắn gọn gọn về bản thân (Bio).
*   `LinkLinkedIn` (string): Đường dẫn mạng xã hội.
*   `LinkWebsite` (string): Portfolio cá nhân.

**Xác minh danh tính (KYC):**
*   `SoDienThoai` (string): Để gửi mã OTP.
*   `LoaiGiayTo` (string): Dùng CCCD hay Passport.
*   `AnhMatTruocGiayTo` (string): URL lưu ảnh giấy tờ mặt trước.
*   `AnhMatSauGiayTo` (string): URL lưu ảnh giấy tờ mặt sau.
*   `TrangThaiXacMinh` (string): Trạng thái KYC (VD: "ChuaXacMinh", "ChoDuyet", "DaXacMinh").

**Thanh toán:**
*   `ChiNhanhNganHang` (string): Tên chi nhánh ngân hàng.
*   `MaSoThue` (string): Phục vụ xuất hóa đơn và khấu trừ thuế (Option).

**Tại sao nên tách bảng `HoSoGiangVienModel`?**
Vì bảng `NguoiDung` dùng chung cho cả Học viên và Giảng viên. Học viên (chiếm 90%) không có CCCD mặt trước, số tài khoản nhận tiền hay mã số thuế. Nếu để các cột này ở bảng chính thì DB bị lãng phí không gian vì đa số là giá trị NULL. Tách ra sẽ giúp DB chuẩn mực và gọn gàng.

---

### 2. Chức năng: Chi tiết khóa học
Bảng lưu trữ chính: **`KhoaHocModel`**

#### ❌ CÁC THUỘC TÍNH BỊ THIẾU CẦN BỔ SUNG VÀO `KhoaHocModel`:
*   **`VideoGioiThieu`** (string - URL): URL của video Trailer khóa học hiển thị ở Sidebar. Hiện tại bảng chỉ mới có ảnh Thumbnail (`HinhAnh`).
*   **`BanSeHocDuocGi`** (string - JSON/Text): Khối "Bạn sẽ học được gì?" trên UI liệt kê danh sách các gạch đầu dòng mục tiêu khóa học. Bạn nên lưu dưới dạng chuỗi JSON `["Làm chủ cú pháp...", "Xây dựng 5 dự án..."]`.
*   **`TongSoHocVien`** (int): Số lượng học viên đã mua (Ở UI ghi là 85,200 học viên). Cache cột này để tăng tốc.

#### ❌ Thuộc tính BỊ THỪA cần xem xét loại bỏ:
*   **Trường `DuLieuDeChungChiJSON` trong bảng `KhoaHocModel`:** Lưu 1 cục JSON bự (chứa câu hỏi thi) trực tiếp vào bảng chính của Khóa Học là rất nặng. Nên tách bảng `CauHoiChungChi` riêng.
