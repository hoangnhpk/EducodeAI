# Hướng dẫn Tải File Backup từ Supabase Cloud bằng CLI

Tài liệu này hướng dẫn cách sử dụng Supabase CLI để tải dữ liệu (backup) từ Supabase Cloud về máy trạm (local machine) của bạn.

## Yêu cầu chuẩn bị
- Đã cài đặt Supabase CLI trên máy tính.
- Đã có tài khoản và project đang chạy trên Supabase Cloud.

---

## Các bước thực hiện

### Bước 1: Mở terminal tại thư mục dự án
Mở terminal (Command Prompt/PowerShell) và di chuyển vào thư mục dự án của bạn:
```bash
cd d:\AI-Workspace\projects\EducodeAI\educodeai-database
```

### Bước 2: Đăng nhập vào Supabase CLI
Nếu bạn chưa đăng nhập trên máy tính này, hãy chạy lệnh sau và làm theo hướng dẫn trên trình duyệt để cấp quyền cho CLI:
```bash
supabase login
```

### Bước 3: Liên kết (Link) dự án cục bộ với Supabase Cloud
Bạn cần liên kết thư mục hiện tại với project trên đám mây của bạn thông qua `project-ref` (Project ID). 
*Lưu ý: Bạn có thể tìm thấy ID này trong URL của dashboard quản trị Supabase (ví dụ: `https://supabase.com/dashboard/project/<project-id>`).*

Chạy lệnh sau:
```bash
supabase link --project-ref <project-id>
```
*(Bạn sẽ được yêu cầu nhập mật khẩu cơ sở dữ liệu - Database password - của project).*

### Bước 4: Tải file backup về máy (Dump database)
Sau khi đã liên kết thành công, sử dụng lệnh dưới đây để tải toàn bộ cấu trúc (schema) và dữ liệu (data) lưu thành file `backup.sql`:
```bash
supabase db dump --linked > backup.sql
```

---

## Các tuỳ chọn Backup mở rộng

Tuỳ vào nhu cầu, bạn có thể thêm các cờ (flags) để chỉ lấy dữ liệu mình cần:

- **Chỉ tải dữ liệu (không tải cấu trúc bảng):**
  ```bash
  supabase db dump --linked --data-only > data_backup.sql
  ```

- **Chỉ tải cấu trúc (Roles, Schema, Functions,... không chứa dữ liệu):**
  ```bash
  supabase db dump --linked > schema_backup.sql
  ```

> [!WARNING]
> **Lưu ý quan trọng về Supabase Storage:** 
> Lệnh `db dump` này **chỉ backup Cơ sở dữ liệu (PostgreSQL)**. Nếu bạn có các file tĩnh (hình ảnh, tài liệu, video,...) được lưu trữ trong tính năng **Supabase Storage**, lệnh này sẽ KHÔNG tải chúng về. Để backup các file trên Storage, bạn cần tải thủ công qua bảng điều khiển trên web hoặc sử dụng các công cụ tương thích với giao thức S3 (S3-compatible tools).
