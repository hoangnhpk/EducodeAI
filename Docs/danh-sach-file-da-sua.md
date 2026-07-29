# Danh sách file đã sửa — đợt rà soát 4 module

**Ngày:** 26/07/2026
**Phạm vi:** Quản lý lớp học (Giảng viên) · Thống kê Admin · Thử thách học tập · Không gian học tập
**Tổng:** 18 file sửa + 1 file mới — `+802` / `−319` dòng
**Trạng thái build:** backend Release 0 lỗi · client `tsc` 0 lỗi · `vite build` thành công

---

## 1. Backend — 9 file sửa

| # | File | +/− | Sửa gì |
|---|---|---|---|
| 1 | `Services/Implementation/ThuThachService.cs` | +62 / −48 | Bọc transaction vào `CreateExecutionStrategy()`. **Lỗi nghiêm trọng nhất:** `EnableRetryOnFailure` bật nên `BeginTransactionAsync` throw → nút "Nhận thưởng" luôn trả HTTP 500. Kéo theo chết cả 2 bảng xếp hạng và việc mở khóa danh hiệu. |
| 2 | `Services/Implementation/KhongGianHocTapService.cs` | +67 / −27 | 3 việc: gom N+1 (2 truy vấn cho mọi khóa thay vì 2 truy vấn/khóa); thu hẹp `KhoaHocs.ToListAsync()` thành projection `KhoaHocRutGon`; đổi thứ tự điều kiện để `daDangKy` thắng `biKhoaTheoThuTu`. |
| 3 | `Services/Implementation/QuanLyHocVienKhoaHocService.cs` | +22 / −10 | Quy đổi `ThoiGianHoc` giây → phút (trước đây hiển thị sai 60 lần); gom chương theo `MaChuong` thay vì tên; sắp theo `ChuongHoc.ThuTu` + `BaiHoc.ThuTu`; giới hạn truy vấn bài đã xem trong đúng khóa. |
| 4 | `Services/Implementation/ThongKeAdminService.cs` | +7 / −2 | Chế độ **Năm**: `y <= namCuoi` thay `y < endExclusive.Year` (trước đây mất năm hiện tại). Chế độ **Tuần**: căn con trỏ về thứ Hai của tuần ISO (trước đây mất tuần hiện tại 6/7 ngày). |
| 5 | `Repository/Implementation/KhoaHocRepository.cs` | +6 / −2 | Bỏ `ThoiGianHoc = 100 // 100%` trong `LuuKetQuaBaiTap` (cột lưu **giây**, không phải phần trăm). Nhánh cập nhật trước đây còn ghi đè mất thời gian xem thật. |
| 6 | `Controllers/HocVien/KhongGianHocTapController.cs` | +13 / −2 | Không trả `ex.Message` ra client. Client hiển thị thẳng message lên UI → lộ chi tiết nội bộ (tên bảng, câu SQL, chuỗi kết nối) cho học viên. |
| 7 | `Workers/LopHocEmailWorker.cs` | +14 / −0 | Bắt `OperationCanceledException` khi tắt app. `Task.Delay(200, stoppingToken)` nằm ngoài try/catch nên throw ra khỏi `ExecuteAsync` → .NET dừng cả host. |
| 8 | `Models/TienDoBaiHocModel.cs` | +9 / −0 | Thêm XML doc chốt đơn vị `ThoiGianHoc` là **GIÂY**. Chống tái phát — chính vì thiếu dòng này mà đã có 3 nơi hiểu 3 kiểu (giây / phút / phần trăm). |
| 9 | `Program.cs` | +4 / −0 | Gọi `ThuThachDataInitializer.InitializeAsync(app.Services)` khi khởi động. |

## 2. Backend — 1 file mới

| File | Nội dung |
|---|---|
| `Helpers/ThuThachDataInitializer.cs` | Tự seed 5 nhiệm vụ (`hoc_bai`, `gio_hoc`, `quiz`, `ngay_hoc`, `xuat_sac`) và 5 danh hiệu (mốc 0/500/1200/2500/5000) nếu môi trường còn thiếu. Chỉ thêm theo `MaCode`, **không ghi đè** cấu hình đã có. Dùng `pg_advisory_xact_lock` chống chạy song song, bọc trong execution strategy. |

> **QUAN TRỌNG:** file này còn **untracked**. `Program.cs` đã tham chiếu tới nó, nên nếu commit `Program.cs` mà thiếu file này thì **checkout mới sẽ không build được**. Phải `git add` cả hai cùng lúc.

## 3. Frontend — 9 file sửa

| # | File | +/− | Sửa gì |
|---|---|---|---|
| 1 | `pages/giang-vien/quan-ly-hoc-vien/QuanLyHocVienKhoaHoc.css` | +370 / −123 | Đổi tông cam → xanh; layout full width; bỏ toàn bộ nền icon; style thẻ số liệu dạng `<button>` (hover / `is-active` / `:disabled`). |
| 2 | `pages/giang-vien/quan-ly-hoc-vien/QuanLyHocVienKhoaHoc.tsx` | +124 / −50 | Thẻ số liệu bấm được để lọc nhãn (mở bế tắc không bỏ lọc được); hiện `—` thay vì `0` ở chế độ "Tất cả học viên"; reset trang khi đổi nhãn lọc; chuyển sang Bootstrap Icons. |
| 3 | `pages/giang-vien/quan-ly-hoc-vien/components/BulkMailModal.tsx` | +13 / −22 | Chuyển 9 icon `react-icons` → Bootstrap Icons; bỏ nền icon header. |
| 4 | `pages/quan-tri-vien/thong-ke/ThongKeAdmin.tsx` | +19 / −18 | Bỏ 4 API gọi trùng mỗi lần vào trang; thêm `catch` cho effect nạp biểu đồ (trước đây reject lặng); thêm `min`/`max` cho 2 ô chọn tháng. |
| 5 | `pages/hoc-vien/thu-thach/ThuThach.tsx` | +32 / −14 | Neo mốc đếm ngược theo `Date.now()` (trước đây trừ tick tích lũy → đồng hồ nhảy lùi sau khi nhận thưởng); thêm trạng thái rỗng cho danh sách nhiệm vụ. |
| 6 | `pages/hoc-vien/thu-thach/ThuThach.css` | +28 / −0 | Style `.tt-empty`. |
| 7 | `pages/hoc-vien/khong-gian-hoc-tap/KhongGianHocTap.tsx` | +4 / −0 | Chặn vòng lặp vô hạn `onError` khi chính ảnh mặc định (URL ngoài) cũng lỗi. |
| 8 | `pages/hoc-vien/khong-gian-hoc-tap/components/CourseDetailDrawer.tsx` | +3 / −0 | Chặn vòng lặp `onError` (cùng lý do). |
| 9 | `pages/hoc-vien/khong-gian-hoc-tap/components/SkillTreeView.tsx` | +5 / −1 | Đồng bộ `maLoTrinh` khi backend fallback sang lộ trình khác (trước đây chỉ đồng bộ khi chưa chọn gì → picker lệch với bản đồ). |

## 4. File trong `git status` NHƯNG KHÔNG PHẢI của tôi

| File | +/− | Ghi chú |
|---|---|---|
| `pages/hoc-vien/khoa-hoc-ca-nhan-ai/KhoaHocCaNhanAI.tsx` | +1 / −1 | Đổi link `/sinh-do-an-ai` → `/yeu-cau-lo-trinh-ai`. Thay đổi này **đã có trong working tree trước khi tôi bắt đầu**. Tôi không đụng và không xác nhận nó đúng hay sai. |

## 5. File rác cần dọn

| Đường dẫn | Ghi chú |
|---|---|
| `.tmp_alweb/` | **78 file** XML tạm, sinh ra khi giải nén `docs/al web.xlsx` để đọc nội dung. Là rác, nên xoá hoặc thêm vào `.gitignore`. Tuyệt đối không commit. |

## 6. Tài liệu / test case sinh ra

| File | Nội dung |
|---|---|
| `docs/test-cases-4-module.xlsx` | 137 test case cho 4 module, 6 sheet. Đã chạy 90, Pass 85, Fail 0, Blocked 5. Kết quả ghi ở cột `Execution Status` / `Tester` / `Date Test`, bằng chứng ở cột `Notes`. |
| `docs/test-cases-core.xlsx` | 173 test case cho các module core (đợt trước). |
| `docs/danh-sach-file-da-sua.md` | Chính file này. |

---

## 7. Kiểm chứng đã thực hiện

| Fix | Bằng chứng |
|---|---|
| Nhận thưởng (lỗi nghiêm trọng) | **Đã verify end-to-end.** Tài khoản test #15 có `hoc_bai [claimed]` + `tongExp = 50`. `NhanThuongAsync` là đường duy nhất set `CLAIMED` và tăng `TongExp`; `EnableRetryOnFailure` có từ 23/04/2026 (commit `b66c164`) còn tài khoản tạo 14/07/2026 → trước khi sửa luôn 500, nên trạng thái này chỉ có thể sinh ra sau khi sửa. |
| Bảng xếp hạng | Cả 2 bảng giờ có dữ liệu (`#15 = 50exp`, `hangCuaToi = 1`). Trước đây luôn rỗng. |
| Thời gian học giây→phút | Khóa #2 / HV#1: `113 phút cho 6 bài = 18,8 phút/bài`. Chưa sửa sẽ là `1130 phút/bài`. |
| Biểu đồ doanh thu chế độ **Năm** | Trả `[2022, 2023, 2024, 2025, 2026]` — có năm hiện tại. Code cũ mất 2026 mọi ngày trừ 31/12. |
| Chương gom theo `MaChuong` | Khóa #1: 10 chương, `maChuong` riêng biệt `[1..10]`, thứ tự ổn định qua 2 lần gọi. |

## 8. Hai fix CHƯA kiểm chứng được

| Fix | Vì sao |
|---|---|
| Biểu đồ doanh thu chế độ **Tuần** | `start = today − 83` và `83 mod 7 = 6`, nên **chỉ khi hôm nay là Chủ nhật** thì `start` mới rơi đúng thứ Hai và code cũ tình cờ chạy đúng. Hôm nay 26/07/2026 là Chủ nhật → test pass nhưng không phân biệt được cũ/mới. Phải chạy lại vào ngày khác. |
| Node đã đăng ký không hiện "Chưa mở" | Nhánh code sửa chỉ chạy khi node **đã mua nằm ở vị trí ≥ 2** của lộ trình. Dữ liệu hiện tại (HV#1, lộ trình `[#3, #7, #1]`) chỉ có node đã mua ở vị trí 1 → nhánh chưa từng được thực thi. |

## 9. Việc còn lại — chờ quyết định

1. **`QuanLyNguoiDung.css` dòng 183, 351, 395** chứa chuỗi `` `r`n `` (escape PowerShell bị ghi thẳng vào CSS), làm mất tác dụng `flex-wrap` và `white-space` ở 3 chỗ, và sinh **6 warning `css-syntax-error`** mỗi lần build. **Không nằm trong danh sách tôi sửa.** Sửa mất 3 dòng.
2. **Không có bài quiz nào trong DB** (6 khóa đều `thongTinQuiz = null`) → 3 test case về nhánh nộp quiz bị chặn, không verify được fix ở mục Backend #5.
3. **47 test case chưa chạy**: 35 case là giao diện thuần (cần trình duyệt), 12 case bị chặn bởi dữ liệu.
4. **`laBuocTiepTheo`** hiện quét node `in_progress` và `not_registered` theo thứ tự lộ trình. Nếu khóa 1 chưa mua mà đang học khóa 2 thì nhãn "Học tiếp" vẫn chỉ vào khóa 1 chưa mua. Sửa 1 dòng nếu muốn ưu tiên node đang học.
