# Luồng đi & cách hoạt động của 4 module

Tài liệu này giải thích chi tiết luồng dữ liệu (data flow), cách code chạy và luồng đi của code cho 4 module:

1. Quản lý học viên khóa học (Giảng viên)
2. Thống kê Admin
3. Thử thách / Gamification
4. Tầng service frontend `lop-hoc.service.ts`

---

## Tổng quan kiến trúc

Toàn hệ thống chạy theo mô hình 3 tầng chuẩn:

```
React Component (.tsx)
      ↓ gọi HTTP (axios)
Service frontend (.ts)
      ↓ REST API
API Controller (.cs)      ← xác thực JWT + bọc response
      ↓
Service Implementation (.cs)   ← business logic
      ↓
DbContext (EF Core)
      ↓
SQL Server
```

**Quy ước chung về response:**

- Backend luôn bọc dữ liệu dạng `{ success: true, data: ... }`.
- Interceptor của `axiosClient` ở frontend đã bóc sẵn `response.data` (body).
- Vì vậy helper `layData()` chỉ cần lấy tiếp trường `.data` bên trong body.

**Quy ước xác thực:**

- `maGiangVien` / `role` luôn lấy từ JWT ở controller qua `LayNguoiDungID.LayID(User)`, **không tin tưởng giá trị do client gửi**.

---

## Module 1 — Quản lý học viên khóa học (Giảng viên)

Module lớn nhất, gồm 4 file:

| Tầng | File |
|---|---|
| Component | `educodeai-client/src/pages/giang-vien/quan-ly-hoc-vien/QuanLyHocVienKhoaHoc.tsx` |
| Service FE | `educodeai-client/src/services/lop-hoc.service.ts` |
| Controller | `educodeai-server/Controllers/GiangVien/QuanLyHocVienKhoaHocController.cs` |
| Service BE | `educodeai-server/Services/Implementation/QuanLyHocVienKhoaHocService.cs` |

### 1.1. Luồng khởi động trang

Khi component mount, có 3 `useEffect` phụ thuộc state `selectedKhoaHoc` (mặc định `'0'` = tất cả):

**(a) `fetchKhoaHocs()` — nạp dropdown khóa học**

```
GET /api/giang-vien/lop-hoc/danh-sach-khoa
  → LayDanhSachKhoaHocAsync(maGiangVien)
     → query KhoaHocs WHERE MaGiangVien = ?
       + đếm số HV mỗi khóa bằng subquery DangKyKhoaHocs.Count(...)
```

Fallback: nếu giảng viên chưa có lớp nào (mảng rỗng), frontend tự gọi thêm endpoint `danh-sach-khoa-hoc-co-san` để vẫn đổ ra toàn bộ khóa. Đây là chỗ duy nhất dùng `fetch` thô + token thủ công thay vì `axiosClient`.

**(b) `fetchHocViens(selectedKhoaHoc)` — nạp bảng học viên**

`layDanhSachHocVien(maKhoaHoc)`; nếu `maKhoa === '0'` thì truyền `undefined`. Backend `LayDanhSachHocVienAsync` rẽ **2 nhánh**:

- **Chọn khóa cụ thể**: lấy danh sách đăng ký của khóa đó → gọi `GanTienDoVaTagAsync` để tính tiến độ + gắn nhãn thông minh.
- **Tất cả khóa**: `GroupBy` theo học viên để mỗi người chỉ hiện 1 dòng (gộp nhiều khóa), không tính tiến độ.

**(c) `fetchLichSuQuaTang()` — nạp bảng lịch sử tặng khóa học** (dùng service khác: `quaTangKhoaHocService`).

### 1.2. Tính tiến độ + nhãn thông minh (phần cốt lõi)

`GanTienDoVaTagAsync`:

1. Lấy tất cả `MaBaiHoc` thuộc khóa → biết `tongSoBai`.
2. Query `TienDoBaiHocs` **một lần** cho toàn bộ học viên (tránh N+1), `GroupBy` theo người dùng để đếm số bài đã xem + ngày học cuối, đổ vào `Dictionary`.
3. Với mỗi học viên: tính `PhanTramTienDo = soBaiDaXem / tongSoBai`, rồi gọi `HocVienTagHelper.ResolveTag(...)` để gắn nhãn `xuat_sac` / `giam_chan` / `moi_dang_ky`.

Nhãn này là thứ frontend dùng để lọc (`filterTag`) và cho nút "Chọn học viên cần nhắc".

### 1.3. Phân trang & lọc — làm hoàn toàn ở client

Bảng học viên **không phân trang ở server**. Backend trả về toàn bộ danh sách, còn frontend xử lý bằng `useMemo`:

- `filteredHocViens`: lọc theo search + nhãn.
- `currentItems`: cắt 5 dòng/trang bằng `.slice()`.
- `searchInput` chỉ lọc trên dữ liệu đã tải, **không gọi lại API**.

### 1.4. Popup xem chi tiết (2 chế độ)

Bấm icon con mắt → `handleViewDetailClick` rẽ nhánh theo ngữ cảnh:

- **Đang chọn khóa cụ thể** → `openProgressModal` → `GET .../tien-do-chi-tiet` → `LayTienDoChiTietAsync`. Backend **check quyền trước** (khóa có thuộc GV không; nếu không trả `null` → controller trả HTTP 403), sau đó gom bài học theo chương, đánh dấu `DaHoanThanh`, tính tổng thời gian học.
- **Đang xem tất cả** → `openStudentCoursesModal` → liệt kê các khóa của học viên đó.

### 1.5. Gửi mail hàng loạt (luồng bất đồng bộ)

```
Chọn học viên → nút "Gửi mail" → BulkMailModal → handleGuiMailHangLoat
  → POST /gui-mail-hang-loat → GuiMailHangLoatAsync
     → validate (tối đa 30 mail, khóa thuộc GV, email hợp lệ)
     → tạo LopHocEmailJob → _emailQueue.EnqueueAsync(job)   ← KHÔNG gửi ngay
     → trả HTTP 202 Accepted "Đã xếp hàng gửi N email"
```

Backend chỉ **xếp job vào queue** rồi trả về ngay (`Accepted`); một background worker (`LopHocEmailQueue`) mới thực sự gửi mail. Nhờ vậy request không bị treo chờ SMTP.

---

## Module 2 — Thống kê Admin

Chỉ có Controller `ThongKeAdminController.cs`, là tầng mỏng gọi xuống `IThongKeAdminService`.

Đặc trưng:

- `[Authorize(Roles = "Admin")]` — chỉ admin.
- Mọi endpoint bọc trong `try/catch`, log ra Console rồi trả HTTP 500 với message tiếng Việt.
- **Xử lý tham số thời gian** lặp lại ở nhiều action: hàm cục bộ `ParseMonthOrDefault` parse chuỗi `yyyy-MM`, mặc định là 12 tháng gần nhất (`AddMonths(-11)` → tháng hiện tại).
- Logic khoảng thời gian: `to` người dùng nhập là **tháng cuối inclusive**, nhưng backend chuyển thành `toExclusive = tháng to + 1` để query dùng `< toExclusive`. Đây là mẫu half-open interval `[from, toExclusive)` chuẩn để tránh sót/lặp ngày biên.

Các nhóm endpoint: tổng quan, biểu đồ đăng ký (12 tháng / theo khoảng), top khóa học, top giảng viên, hoạt động hệ thống, chất lượng khóa học, chi tiết (phân trang: học viên/giảng viên/khóa học/đăng ký), doanh thu.

Phân trang ở đây **làm ở server** (page/pageSize) — khác với module 1.

---

## Module 3 — Thử thách / Gamification

File `ThuThachService.cs`. Module nghiệp vụ phức tạp nhất, xoay quanh "nhiệm vụ tuần" + EXP + danh hiệu + bảng xếp hạng.

### 3.1. Khái niệm chu kỳ tuần

`ChuKyThuThachHelper.LayChuKyHienTai()` trả về `(dauChuKy, ketChuKy, giayConLai)`. Tiến độ nhiệm vụ được lưu theo từng chu kỳ (`DauChuKy`), nên sang tuần mới sẽ tạo bản ghi mới.

### 3.2. Đồng bộ tiến độ — `ChuanBiVaDongBoTienDoAsync`

Trái tim của module, chạy mỗi khi user mở bảng thử thách:

1. Lấy các mẫu nhiệm vụ đang hoạt động (`MauNhiemVuTuans`).
2. Lấy tiến độ của user trong chu kỳ hiện tại. **Nếu thiếu nhiệm vụ nào thì tạo mới** (trạng thái `IN_PROGRESS`).
3. Gọi `DemGiaTriNhiemVuAsync` — đếm thực tế: số bài học, số phút học, số quiz, số ngày học (theo giờ VN +7), và nhiệm vụ tổng hợp `hoan_thanh_tat_ca`.
4. Cập nhật `GiaTriHienTai` từng nhiệm vụ, chuyển sang `COMPLETED` nếu đạt chỉ tiêu. **Nhiệm vụ đã `CLAIMED` thì bỏ qua**.

### 3.3. Nhận thưởng — `NhanThuongAsync` (xử lý race condition)

```
BeginTransaction
  → ExecuteUpdate: COMPLETED → CLAIMED (chỉ 1 request thắng)
     → nếu claimedRows == 0: request khác đã nhận trước → báo lỗi phù hợp
  → cộng EXP bằng ExecuteUpdate (atomic, không load entity)
  → mở khóa danh hiệu mới theo EXP
  → Commit
```

Kỹ thuật then chốt: dùng `ExecuteUpdateAsync` với điều kiện `TrangThai == COMPLETED`. Nếu 2 request nhận thưởng cùng lúc, chỉ 1 update được 1 dòng, request còn lại nhận `0 dòng` → không cộng EXP 2 lần. Đây là optimistic concurrency ở mức SQL, tránh double-claim.

### 3.4. Bảng xếp hạng — `LayBangXepHangTuanAsync`

- Cộng EXP các nhiệm vụ đã `CLAIMED` trong chu kỳ, chỉ tính học viên (`VaiTro == 2`).
- **Quy tắc phá hòa (tie-break)**: cùng EXP thì ai học lâu hơn (tổng giây học trong tuần) đứng trên, không phải ai nhận thưởng trước.
- `TaoBangXepHangTuAggAsync` gom thông tin user + danh hiệu đang đeo cho top N, đồng thời xác định hạng của chính người xem.

---

## Module 4 — `lop-hoc.service.ts` (tầng service frontend)

Là "keo dán" giữa component và API. Vai trò:

- Đóng gói 5 lời gọi API của module 1 thành các hàm typed.
- Helper `layData<T>(res, fallback)` chuẩn hóa việc bóc `.data` và cung cấp giá trị mặc định (mảng rỗng / null) để component không phải check undefined.
- `layDanhSachHocVien` build `params` có điều kiện: chỉ thêm `maKhoaHoc` khi > 0, chỉ thêm `search` khi có — nên khi xem "tất cả" thì không gửi param thừa.

---

## Tóm tắt các điểm thiết kế quan trọng

| Điểm | Cách xử lý | Ở đâu |
|---|---|---|
| Xác thực | Lấy `maGiangVien`/role từ JWT ở controller, không tin client | Controllers |
| Phân trang HV (module 1) | Làm ở **client** (slice 5 dòng) | `.tsx` |
| Phân trang thống kê (module 2) | Làm ở **server** (page/pageSize) | `ThongKeAdminController` |
| Tránh N+1 khi tính tiến độ | Query 1 lần + GroupBy + Dictionary | `GanTienDoVaTagAsync` |
| Gửi mail | Queue bất đồng bộ, trả HTTP 202 ngay | `GuiMailHangLoatAsync` |
| Chống double-claim EXP | `ExecuteUpdate` có điều kiện trong transaction | `NhanThuongAsync` |
| Khoảng thời gian | Half-open `[from, toExclusive)` | `ThongKeAdminController` |
