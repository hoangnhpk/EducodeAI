# Hướng Dẫn Setup Supabase Local Dành Cho Team

Tài liệu này hướng dẫn cách cài đặt, chạy Supabase ở môi trường Local và quy trình quản lý cơ sở dữ liệu khi làm việc nhóm (Migration).

---

## 1. CÁC BƯỚC SETUP SUPABASE LOCAL

**Bước 1:** Cài đặt Docker Desktop và đảm bảo nó đang mở (Running).

**Bước 2:** Mở Terminal tại thư mục chứa database (`educodeai-database`) và chạy các lệnh sau:

```bash
# Cài đặt Supabase CLI toàn cục
npm install -g supabase

# Khởi tạo file cấu hình Supabase (nếu chưa có)
supabase init
```

**Bước 3: Tối ưu cấu hình (Giảm RAM & Lỗi mạng)**
Mở file `educodeai-database\supabase\config.toml` và đổi thành `enabled = false` ở các dịch vụ không cần thiết:

- `[api]`: Tắt API PostgREST (Frontend sẽ gọi data qua backend C# thay vì dùng Supabase JS).
- `[auth]`: Tắt hệ thống Authentication (Quản lý User, Đăng nhập, Token JWT).
- `[inbucket]`: Tắt server ảo dùng để chặn và test thử gửi Email.
- `[storage.vector]`: Tắt tính năng lưu trữ Vector dành cho AI / Machine Learning.
- `[edge_runtime]`: Tắt môi trường chạy Edge Functions (Tránh lỗi 403 Forbidden khi tải package).
- `[analytics]`: Tắt hệ thống giám sát và phân tích Log của database.

**Bước 4: Khởi động Supabase**
```bash
# Khởi động hệ thống với cấu hình mới
# Lưu ý: Lần chạy đầu tiên sẽ hơi lâu vì Docker cần tải các images và tạo containers
supabase start

# (Tùy chọn) Lệnh dùng để dừng và dọn dẹp cache/container khi bị lỗi
supabase stop
```
👉 **Giao diện quản lý Database (Supabase Studio):** Mở trình duyệt và truy cập vào [http://127.0.0.1:54323](http://127.0.0.1:54323) để thao tác xem/sửa dữ liệu trực quan bằng chuột.

**Bước 5: Cấu hình chuỗi kết nối Backend (C#)**
Sau khi Supabase chạy thành công, cập nhật chuỗi kết nối trong cấu hình C# (như `appsettings.json`):
```text
Host=127.0.0.1;Port=54322;Database=postgres;Username=postgres;Password=postgres;SSL Mode=Prefer;Trust Server Certificate=true
```

---

## 2. QUY TRÌNH MIGRATION (LÀM VIỆC NHÓM)

Trong quá trình phát triển, khi có thay đổi về cấu trúc CSDL (Thêm/sửa bảng, cột), chúng ta cần tạo Migration để gộp lên nhánh `dev`.

### 2.1. Phía người chỉnh sửa cấu trúc Database
Sau khi thao tác thay đổi Database xong, mở Terminal ở thư mục `educodeai-database` và gõ:

```bash
# Lệnh tạo file Migration mới
supabase db diff -f "ten_cua_su_thay_doi"

# Ví dụ:
supabase db diff -f "init_schema_educodeai"
```
File migration có định dạng `.sql` sẽ được tự động tạo ra trong thư mục `educodeai-database\supabase\migrations`. 
👉 Hãy Add, Commit và Đẩy (Push) thư mục này lên nhánh `dev`.

### 2.2. Đẩy cấu trúc lên Server Thật (Staging / Production)
Mở Terminal ở thư mục `educodeai-database` và chạy lần lượt:

```bash
# Lệnh 1: Đăng nhập Supabase (Sẽ yêu cầu Enter để mở web, copy chuỗi mã số dán vào)
supabase login

# Lệnh 2: Link project local với project thật trên mạng
supabase link --project-ref lmrouxhyzrqukgksiuzo

# Lệnh 3: Đẩy cấu trúc (Migrations) lên Server thật
supabase db push
```
*(Lưu ý: Thông thường Lệnh 1 và Lệnh 2 chỉ cần chạy 1 lần đầu tiên cho mỗi máy tính).*

### 2.3. Dành cho các thành viên khác trong Team (Cập nhật DB về máy local)
Khi bạn pull code mới từ nhánh `dev` về và thấy có file migration mới từ đồng nghiệp. Bạn mở Terminal ở `educodeai-database` và chạy một trong hai lệnh sau:

- **Cách 1 (Bổ sung an toàn - Giữ nguyên dữ liệu cũ):**
  ```bash
  supabase migration up
  ```
  *(Nó sẽ quét thư mục `migrations`, thấy file nào mới mà máy bạn chưa chạy, nó sẽ tự động chạy bổ sung file đó vào Database hiện tại của bạn).*

- **Cách 2 (Làm mới hoàn toàn DB - Xóa sạch dữ liệu cũ):**
  ```bash
  supabase db reset
  ```
  *(Lệnh này sẽ xóa sạch và tạo lại toàn bộ database từ đầu. Đồng nghĩa với việc dữ liệu cũ ở máy bạn sẽ bị mất trắng).*
