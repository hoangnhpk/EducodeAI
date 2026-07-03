# 📊 DATABASE SCHEMA – EducodeAI ERD Reference

> **Tổng số bảng:** 32 | **ORM:** Entity Framework Core | **DB:** PostgreSQL (Supabase)

---

## 📌 TỔNG QUAN NHÓM BẢNG

| Nhóm | Bảng |
|------|------|
| 👤 Người dùng & Xác thực | `NguoiDungs`, `PhienDangNhap` |
| 📚 Nội dung khóa học | `KhoaHocs`, `ChuongHocs`, `BaiHocs` |
| 📝 Bài tập | `BaiTaps`, `BaiTapThucHanhs`, `BaiTap_Quizs`, `TestCaseThucHanhs` |
| 🎥 Video tương tác | `VideoChapters`, `VideoQuizs` |
| 📈 Tiến độ & Kết quả | `DangKyKhoaHocs`, `TienDoBaiHocs`, `KetQuaLamBais`, `KetQuaKiemTraChungChis` |
| 🏆 Chứng chỉ | `ChungChiKhoaHocs` |
| 💬 Tương tác học tập | `BinhLuans`, `DanhGias`, `GhiChuBaiHocs` |
| 🤖 AI | `GhiChuAIs`, `LoTrinhAIs` |
| 💳 Thanh toán & Đơn hàng | `DonHangKhoaHocs`, `ChiTietDonHangs`, `GiaoDichThanhToans`, `ThongBaoEmailThanhToans`, `MaGiamGias` |
| 💰 Tài chính giảng viên | `DoanhThuGiangViens`, `YeuCauRutTienGiangViens`, `HoTroRutTienGiangViens` |
| ⚙️ Hệ thống | `CauHinhs`, `KeyAPIs`, `NhatKySuDungs` |

---

## 👤 NHÓM: NGƯỜI DÙNG & XÁC THỰC

### Bảng: `NguoiDungs`
> **Model:** `NguoiDungModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaNguoiDung` | `int` | **PK**, AUTO | Mã định danh người dùng |
| `TaiKhoan` | `varchar(50)` | NOT NULL, UNIQUE | Tên đăng nhập |
| `MatKhau` | `varchar(255)` | NOT NULL | Mật khẩu (hashed) |
| `GoogleID` | `varchar(100)` | NULL | ID đăng nhập Google OAuth |
| `HoTen` | `varchar(100)` | NULL | Họ và tên đầy đủ |
| `Email` | `varchar(100)` | NULL | Địa chỉ email |
| `AnhDaiDien` | `varchar(500)` | NULL | URL ảnh đại diện |
| `VaiTro` | `int` | NOT NULL | `0`=Admin, `1`=GiangVien, `2`=HocVien |
| `TrangThai` | `varchar(20)` | DEFAULT 'Hoạt động' | Trạng thái tài khoản |
| `NgayThamGia` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo tài khoản |
| `LyDoKhoa` | `text` | NULL | Lý do khóa tài khoản |
| `ThoiGianMoKhoa` | `timestamp` | NULL | Thời điểm tự động mở khóa |
| `NgayDangNhapCuoi` | `timestamp` | NULL | Lần đăng nhập cuối |
| `MaOTP` | `varchar(10)` | NULL | Mã OTP xác thực |
| `ThoiGianHetHanOTP` | `timestamp` | NULL | Thời gian hết hạn OTP |
| `MaNganHangNhanTien` | `varchar(50)` | NULL | Mã ngân hàng (cho GV rút tiền) |
| `SoTaiKhoanNhanTien` | `varchar(50)` | NULL | Số tài khoản ngân hàng |
| `TenTaiKhoanNhanTien` | `varchar(255)` | NULL | Tên chủ tài khoản ngân hàng |

**Quan hệ đi ra:**
- `1 → N` với `KhoaHocs` (GiangVien tạo khóa học)
- `1 → N` với `DangKyKhoaHocs`
- `1 → N` với `TienDoBaiHocs`
- `1 → N` với `DanhGias`
- `1 → N` với `BinhLuans`
- `1 → N` với `GhiChuBaiHocs`
- `1 → N` với `KetQuaLamBais`
- `1 → N` với `KetQuaKiemTraChungChis`
- `1 → N` với `ChungChiKhoaHocs`
- `1 → N` với `LoTrinhAIs`
- `1 → N` với `DonHangKhoaHocs`
- `1 → N` với `DoanhThuGiangViens`
- `1 → N` với `YeuCauRutTienGiangViens` (GiangVien yêu cầu)
- `1 → N` với `YeuCauRutTienGiangViens` (Admin duyệt)
- `1 → N` với `HoTroRutTienGiangViens` (GiangVien)
- `1 → N` với `HoTroRutTienGiangViens` (Admin xử lý)
- `1 → N` với `PhienDangNhap`

---

### Bảng: `PhienDangNhap`
> **Model:** `PhienDangNhapModel` | **Tên bảng:** `PhienDangNhap`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaPhien` | `int` | **PK**, AUTO | Mã phiên đăng nhập |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Người dùng |
| `MaThietBi` | `varchar(255)` | NOT NULL | Định danh thiết bị (device fingerprint) |
| `TenThietBi` | `varchar(255)` | NOT NULL | Tên thiết bị |
| `DiaChiIP` | `varchar(50)` | NULL | Địa chỉ IP đăng nhập |
| `ThoiGianDangNhap` | `timestamp` | NOT NULL | Thời gian bắt đầu phiên |
| `ThoiGianHoatDongCuoi` | `timestamp` | NOT NULL | Hoạt động cuối cùng |
| `DangHoatDong` | `bool` | DEFAULT true | Trạng thái phiên |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)

---

## 📚 NHÓM: NỘI DUNG KHÓA HỌC

### Bảng: `KhoaHocs`
> **Model:** `KhoaHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaKhoaHoc` | `int` | **PK**, AUTO | Mã khóa học |
| `MaGiangVien` | `int` | **FK** → `NguoiDungs` | Giảng viên tạo |
| `TenKhoaHoc` | `varchar(200)` | NOT NULL | Tên khóa học |
| `MoTa` | `text` | NULL | Mô tả chi tiết |
| `HinhAnh` | `varchar(500)` | NULL | URL ảnh bìa |
| `TrangThai` | `varchar(50)` | DEFAULT 'Hoạt động' | Trạng thái khóa học |
| `DiemDanhGiaTB` | `double` | DEFAULT 0 | Điểm đánh giá trung bình |
| `LinhVuc` | `varchar(100)` | NOT NULL | Lĩnh vực (BackEnd, DB, ...) |
| `TrinhDo` | `varchar(50)` | NOT NULL | Trình độ (Người mới, Trung cấp, Nâng cao) |
| `ThoiLuongGio` | `int` | NOT NULL | Tổng số giờ học |
| `KyNangChinh` | `varchar(500)` | NOT NULL | Kỹ năng chính dạng JSON array |
| `CoChungChi` | `bool` | DEFAULT false | Có cấp chứng chỉ không |
| `TenChungChi` | `varchar(200)` | NULL | Tên chứng chỉ |
| `DiemDatChungChi` | `double` | DEFAULT 80 | Điểm tối thiểu để đạt chứng chỉ |
| `SoCauHoiChungChi` | `int` | DEFAULT 20 | Số câu hỏi thi chứng chỉ |
| `ThoiGianLamBaiChungChi` | `int` | DEFAULT 30 | Thời gian thi (phút) |
| `DuLieuDeChungChiJSON` | `text` | NULL | Dữ liệu đề thi JSON |
| `NguonDeChungChi` | `varchar(50)` | NULL | Nguồn tạo đề (AI, Manual...) |
| `NgayTaoDeChungChi` | `timestamp` | NULL | Ngày tạo đề thi |
| `GiaKhoaHoc` | `numeric(18,2)` | 10000–15000 | Giá khóa học (VNĐ) |
| `DonViTienTe` | `varchar(10)` | DEFAULT 'VND' | Đơn vị tiền tệ |
| `ChoPhepMua` | `bool` | DEFAULT true | Có cho phép mua không |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo bản ghi |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaGiangVien`)
- `1 → N` với `ChuongHocs`
- `1 → N` với `DangKyKhoaHocs`
- `1 → N` với `DanhGias`
- `1 → N` với `KetQuaKiemTraChungChis`
- `1 → N` với `ChungChiKhoaHocs`
- `1 → N` với `ChiTietDonHangs`

---

### Bảng: `ChuongHocs`
> **Model:** `ChuongHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaChuong` | `int` | **PK**, AUTO | Mã chương học |
| `MaKhoaHoc` | `int` | **FK** → `KhoaHocs` | Thuộc khóa học nào |
| `TenChuong` | `varchar(200)` | NOT NULL | Tên chương |
| `ThuTu` | `int` | NOT NULL | Thứ tự hiển thị |

**Quan hệ:**
- `N → 1` với `KhoaHocs` (qua `MaKhoaHoc`)
- `1 → N` với `BaiHocs`

---

### Bảng: `BaiHocs`
> **Model:** `BaiHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaBaiHoc` | `int` | **PK**, AUTO | Mã bài học |
| `MaChuong` | `int` | **FK** → `ChuongHocs` | Thuộc chương nào |
| `TieuDe` | `varchar(200)` | NOT NULL | Tiêu đề bài học |
| `LoaiBaiHoc` | `varchar(50)` | NOT NULL | `Video`, `VanBan`, `BaiTap` |
| `NoiDung` | `text` | NULL | Nội dung HTML |
| `ThoiLuong` | `int` | NULL | Thời lượng (giây) |
| `LinkVideo` | `varchar(500)` | NULL | URL video |
| `ThuTu` | `int` | NOT NULL | Thứ tự trong chương |
| `CoQuiz` | `bool` | DEFAULT true | Bật quiz tương tác video |

**Quan hệ:**
- `N → 1` với `ChuongHocs` (qua `MaChuong`)
- `1 → N` với `BaiTaps`
- `1 → N` với `TienDoBaiHocs`
- `1 → N` với `BinhLuans`
- `1 → N` với `GhiChuBaiHocs`
- `1 → N` với `VideoChapters`

---

## 📝 NHÓM: BÀI TẬP

### Bảng: `BaiTaps`
> **Model:** `BaiTapModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaBaiTap` | `int` | **PK**, AUTO | Mã bài tập |
| `MaBaiHoc` | `int` | **FK** → `BaiHocs` | Thuộc bài học nào |

**Quan hệ:**
- `N → 1` với `BaiHocs` (qua `MaBaiHoc`)
- `1 → N` với `KetQuaLamBais`
- `1 → 1` với `BaiTapThucHanhs` (nếu là thực hành code)
- `1 → 1` với `BaiTap_Quizs` (nếu là quiz trắc nghiệm)

---

### Bảng: `BaiTapThucHanhs`
> **Model:** `BaiTapThucHanhModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaBaiTapTH` | `int` | **PK**, AUTO | Mã bài tập thực hành |
| `MaBaiTap` | `int` | **FK** → `BaiTaps` | Bài tập gốc |
| `TieuDe` | `varchar(255)` | NOT NULL | Tiêu đề bài tập |
| `MoTaDeBai` | `text` | NOT NULL | Mô tả đề bài |
| `NgonNgu` | `varchar(50)` | NOT NULL | Ngôn ngữ lập trình |
| `MucDo` | `varchar(50)` | DEFAULT 'De' | Mức độ khó |
| `LoiGiaiMau` | `text` | NULL | Lời giải mẫu |
| `GoiY` | `text` | NULL | Gợi ý giải |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |
| `TrangThai` | `bool` | DEFAULT true | Trạng thái |

**Quan hệ:**
- `N → 1` với `BaiTaps` (qua `MaBaiTap`)
- `1 → N` với `TestCaseThucHanhs`

---

### Bảng: `BaiTap_Quizs`
> **Model:** `BaiTap_QuizModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaBaiTapQuiz` | `int` | **PK**, AUTO | Mã bài tập quiz |
| `MaBaiTap` | `int` | **FK** → `BaiTaps` | Bài tập gốc |
| `ThoiGianLamBai` | `int` | NULL | Thời gian làm (phút) |
| `DiemCanDat` | `double` | NOT NULL | Điểm tối thiểu để qua |
| `ChoPhepLamLai` | `bool` | DEFAULT false | Cho phép làm lại |
| `DaoCauHoi` | `bool` | DEFAULT false | Xáo trộn câu hỏi |
| `DuLieuCauHoi` | `text` | NOT NULL | Dữ liệu câu hỏi dạng JSON |

**Quan hệ:**
- `N → 1` với `BaiTaps` (qua `MaBaiTap`)

---

### Bảng: `TestCaseThucHanhs`
> **Model:** `TestCaseThucHanhModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaTestCase` | `int` | **PK**, AUTO | Mã test case |
| `MaBaiTapThucHanh` | `int` | **FK** → `BaiTapThucHanhs` | Thuộc bài TH nào |
| `InputDuLieu` | `text` | NOT NULL | Dữ liệu đầu vào |
| `OutputMongDoi` | `text` | NOT NULL | Kết quả mong đợi |
| `MoTa` | `text` | NULL | Mô tả test case |
| `LaTestAn` | `bool` | DEFAULT false | Test ẩn (không hiển thị HV) |
| `ThuTu` | `int` | DEFAULT 0 | Thứ tự |
| `Diem` | `int` | DEFAULT 10 | Điểm của test case |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |

**Quan hệ:**
- `N → 1` với `BaiTapThucHanhs` (qua `MaBaiTapThucHanh`)

---

## 🎥 NHÓM: VIDEO TƯƠNG TÁC

### Bảng: `VideoChapters`
> **Model:** `VideoChapterModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaChapter` | `int` | **PK**, AUTO | Mã chapter video |
| `MaBaiHoc` | `int` | **FK** → `BaiHocs` | Bài học chứa video |
| `ThoiGianBatDau` | `int` | NOT NULL | Thời điểm bắt đầu (giây) |
| `ThoiGianKetThuc` | `int` | NOT NULL | Thời điểm kết thúc (giây) |
| `KienThucChinh` | `varchar(500)` | NOT NULL | Kiến thức chính đoạn này |
| `BatBuoc` | `bool` | DEFAULT false | Bắt buộc xem |

**Quan hệ:**
- `N → 1` với `BaiHocs` (qua `MaBaiHoc`)
- `1 → N` với `VideoQuizs`

---

### Bảng: `VideoQuizs`
> **Model:** `VideoQuizModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaVideoQuiz` | `int` | **PK**, AUTO | Mã câu quiz video |
| `MaChapter` | `int` | **FK** → `VideoChapters` | Thuộc chapter nào |
| `CauHoi` | `varchar(1000)` | NOT NULL | Nội dung câu hỏi |
| `DapAnA` | `varchar(500)` | NOT NULL | Đáp án A |
| `DapAnB` | `varchar(500)` | NOT NULL | Đáp án B |
| `DapAnC` | `varchar(500)` | NULL | Đáp án C |
| `DapAnD` | `varchar(500)` | NULL | Đáp án D |
| `DapAnDung` | `varchar(5)` | NOT NULL | Đáp án đúng (`A`/`B`/`C`/`D`) |

**Quan hệ:**
- `N → 1` với `VideoChapters` (qua `MaChapter`)

---

## 📈 NHÓM: TIẾN ĐỘ & KẾT QUẢ

### Bảng: `DangKyKhoaHocs`
> **Model:** `DangKyKhoaHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaDangKy` | `int` | **PK**, AUTO | Mã đăng ký |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Học viên |
| `MaKhoaHoc` | `int` | **FK** → `KhoaHocs` | Khóa học |
| `NgayDangKy` | `timestamp` | DEFAULT UTC_NOW | Ngày đăng ký |
| `TrangThai` | `varchar(50)` | NULL | `DangHoc`, `HoanThanh` |
| `TienDo` | `int` | DEFAULT 0 | Phần trăm hoàn thành |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `KhoaHocs` (qua `MaKhoaHoc`)

---

### Bảng: `TienDoBaiHocs`
> **Model:** `TienDoBaiHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaTienDo` | `int` | **PK**, AUTO | Mã tiến độ |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Học viên |
| `MaBaiHoc` | `int` | **FK** → `BaiHocs` | Bài học |
| `DaXem` | `bool` | DEFAULT false | Đã hoàn thành bài học |
| `ThoiGianHoc` | `int` | DEFAULT 0 | Thời gian đã học (giây) |
| `NgayCapNhat` | `timestamp` | DEFAULT UTC_NOW | Lần cập nhật cuối |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `BaiHocs` (qua `MaBaiHoc`)

---

### Bảng: `KetQuaLamBais`
> **Model:** `KetQuaLamBaiModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaKetQuaBaiNop` | `int` | **PK**, AUTO | Mã kết quả |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Học viên nộp |
| `MaBaiTap` | `int` | **FK** → `BaiTaps` | Bài tập |
| `NoiDungNopJSON` | `text` | NOT NULL | Code/đáp án nộp dạng JSON |
| `DiemSo` | `float` | - | Điểm đạt được |
| `TrangThai` | `bool` | DEFAULT false | Đã chấm xong |
| `NgayNop` | `timestamp` | DEFAULT UTC_NOW | Thời gian nộp |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `BaiTaps` (qua `MaBaiTap`)

---

### Bảng: `KetQuaKiemTraChungChis`
> **Model:** `KetQuaKiemTraChungChiModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaKetQuaKiemTraChungChi` | `int` | **PK**, AUTO | Mã kết quả thi |
| `MaKhoaHoc` | `int` | **FK** → `KhoaHocs` | Khóa học |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Học viên thi |
| `DiemSo` | `double` | - | Điểm số đạt được |
| `SoCauDung` | `int` | - | Số câu trả lời đúng |
| `TongSoCau` | `int` | - | Tổng số câu hỏi |
| `DaDat` | `bool` | - | Đã đạt chứng chỉ chưa |
| `ChiTietLamBaiJSON` | `text` | NOT NULL | Chi tiết từng câu JSON |
| `NgayThi` | `timestamp` | DEFAULT UTC_NOW | Ngày thi |

**Quan hệ:**
- `N → 1` với `KhoaHocs` (qua `MaKhoaHoc`)
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `1 → 0..1` với `ChungChiKhoaHocs`

---

## 🏆 NHÓM: CHỨNG CHỈ

### Bảng: `ChungChiKhoaHocs`
> **Model:** `ChungChiKhoaHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaChungChiKhoaHoc` | `int` | **PK**, AUTO | Mã chứng chỉ |
| `MaChungChi` | `varchar(50)` | NOT NULL | Mã số chứng chỉ (UUID/code) |
| `MaKhoaHoc` | `int` | **FK** → `KhoaHocs` | Khóa học |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Học viên |
| `MaKetQuaKiemTraChungChi` | `int` | **FK** → `KetQuaKiemTraChungChis` (nullable) | Kết quả thi liên kết |
| `HoTenHienThi` | `varchar(200)` | NULL | Tên hiển thị trên chứng chỉ |
| `EmailNhan` | `varchar(200)` | NULL | Email nhận chứng chỉ |
| `DaGuiEmail` | `bool` | NOT NULL | Đã gửi email chưa |
| `NgayGuiEmail` | `timestamp` | NULL | Thời điểm gửi email |
| `NgayCap` | `timestamp` | DEFAULT UTC_NOW | Ngày cấp chứng chỉ |

**Quan hệ:**
- `N → 1` với `KhoaHocs` (qua `MaKhoaHoc`)
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 0..1` với `KetQuaKiemTraChungChis` (qua `MaKetQuaKiemTraChungChi`)

---

## 💬 NHÓM: TƯƠNG TÁC HỌC TẬP

### Bảng: `DanhGias`
> **Model:** `DanhGiaModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaDanhGia` | `int` | **PK**, AUTO | Mã đánh giá |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Người đánh giá |
| `MaKhoaHoc` | `int` | **FK** → `KhoaHocs` | Khóa học được đánh giá |
| `SoSao` | `int` | 1–5 | Số sao đánh giá |
| `NhanXet` | `varchar(1000)` | NULL | Nhận xét bổ sung |
| `NgayDanhGia` | `timestamp` | DEFAULT NOW | Ngày đánh giá |
| `TrangThai` | `varchar(20)` | DEFAULT 'ChoDuyet' | `ChoDuyet`, `DaDuyet` |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `KhoaHocs` (qua `MaKhoaHoc`)

---

### Bảng: `BinhLuans`
> **Model:** `BinhLuanModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaBinhLuan` | `int` | **PK**, AUTO | Mã bình luận |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Người bình luận |
| `MaBaiHoc` | `int` | **FK** → `BaiHocs` | Bài học bình luận |
| `NoiDung` | `text` | NOT NULL | Nội dung bình luận |
| `MaBinhLuanCha` | `int` | **FK** → `BinhLuans` (self, nullable) | Bình luận cha (reply) |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `BaiHocs` (qua `MaBaiHoc`)
- `N → 0..1` với `BinhLuans` *(self-referencing – cây bình luận)*

---

### Bảng: `GhiChuBaiHocs`
> **Model:** `GhiChuBaiHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `Id` | `int` | **PK**, AUTO | Mã ghi chú |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Học viên |
| `MaBaiHoc` | `int` | **FK** → `BaiHocs` | Bài học |
| `ThoiGianVideo` | `int` | NOT NULL | Timestamp video (giây) |
| `NoiDung` | `varchar(2000)` | NOT NULL | Nội dung ghi chú |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `BaiHocs` (qua `MaBaiHoc`)

---

## 🤖 NHÓM: AI

### Bảng: `GhiChuAIs`
> **Model:** `GhiChuAIModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `Id` | `int` | **PK**, AUTO | Mã ghi chú AI |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Người dùng |
| `MaBaiHoc` | `int` | **FK** → `BaiHocs` | Bài học liên quan |
| `NoiDung` | `text` | NOT NULL | Nội dung tóm tắt AI |
| `NgayTao` | `timestamp` | DEFAULT NOW | Ngày tạo |
| `NgayCapNhat` | `timestamp` | DEFAULT NOW | Ngày cập nhật |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `N → 1` với `BaiHocs` (qua `MaBaiHoc`)

---

### Bảng: `LoTrinhAIs`
> **Model:** `LoTrinhAIModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaLoTrinh` | `int` | **PK**, AUTO | Mã lộ trình |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Người dùng |
| `YeuCau` | `text` | NOT NULL | Yêu cầu gửi cho AI |
| `NoiDungJSON` | `text` | NOT NULL | Lộ trình AI trả về (JSON) |
| `TrangThai` | `varchar(50)` | NULL | Trạng thái xử lý |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)

---

## 💳 NHÓM: THANH TOÁN & ĐƠN HÀNG

### Bảng: `DonHangKhoaHocs`
> **Model:** `DonHangKhoaHocModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaDonHang` | `int` | **PK**, AUTO | Mã đơn hàng |
| `MaNguoiDung` | `int` | **FK** → `NguoiDungs` | Người mua |
| `TongTien` | `numeric(18,2)` | NOT NULL | Tổng tiền đơn hàng |
| `LoaiTien` | `varchar(10)` | DEFAULT 'VND' | Đơn vị tiền tệ |
| `TrangThaiDonHang` | `varchar(30)` | DEFAULT 'CREATED' | `CREATED`, `PAID`, `CANCELLED`... |
| `IdempotencyKey` | `varchar(100)` | NOT NULL | Chống duplicate payment |
| `CreatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |
| `UpdatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày cập nhật |
| `ExpiredAt` | `timestamp` | NULL | Thời điểm hết hạn |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaNguoiDung`)
- `1 → N` với `ChiTietDonHangs`
- `1 → N` với `GiaoDichThanhToans`
- `1 → N` với `ThongBaoEmailThanhToans`
- `1 → N` với `DoanhThuGiangViens`

---

### Bảng: `ChiTietDonHangs`
> **Model:** `ChiTietDonHangModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaChiTiet` | `int` | **PK**, AUTO | Mã chi tiết |
| `MaDonHang` | `int` | **FK** → `DonHangKhoaHocs` | Đơn hàng |
| `MaKhoaHoc` | `int` | **FK** → `KhoaHocs` | Khóa học mua |
| `DonGia` | `numeric(18,2)` | NOT NULL | Giá gốc |
| `GiamGia` | `numeric(18,2)` | DEFAULT 0 | Số tiền giảm |
| `ThanhTien` | `numeric(18,2)` | NOT NULL | Thành tiền sau giảm |

**Quan hệ:**
- `N → 1` với `DonHangKhoaHocs` (qua `MaDonHang`)
- `N → 1` với `KhoaHocs` (qua `MaKhoaHoc`)

---

### Bảng: `GiaoDichThanhToans`
> **Model:** `GiaoDichThanhToanModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaGiaoDich` | `int` | **PK**, AUTO | Mã giao dịch |
| `MaDonHang` | `int` | **FK** → `DonHangKhoaHocs` | Đơn hàng liên kết |
| `CongThanhToan` | `varchar(30)` | DEFAULT 'PAYOS' | Cổng thanh toán |
| `MaThamChieuNgoai` | `varchar(100)` | NOT NULL | Mã tham chiếu từ cổng TT |
| `SoTien` | `numeric(18,2)` | NOT NULL | Số tiền giao dịch |
| `TrangThai` | `varchar(30)` | DEFAULT 'INITIATED' | `INITIATED`, `SUCCESS`, `FAILED` |
| `RawWebhook` | `jsonb` | NULL | Dữ liệu webhook thô |
| `PaidAt` | `timestamp` | NULL | Thời điểm thanh toán |
| `CreatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |
| `UpdatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày cập nhật |

**Quan hệ:**
- `N → 1` với `DonHangKhoaHocs` (qua `MaDonHang`)

---

### Bảng: `ThongBaoEmailThanhToans`
> **Model:** `ThongBaoEmailThanhToanModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaThongBao` | `int` | **PK**, AUTO | Mã thông báo |
| `MaDonHang` | `int` | **FK** → `DonHangKhoaHocs` | Đơn hàng |
| `LoaiThongBao` | `varchar(50)` | DEFAULT 'PAYMENT_SUCCESS_STUDENT' | Loại email |
| `EmailNhan` | `varchar(255)` | NOT NULL | Email người nhận |
| `TrangThai` | `varchar(20)` | DEFAULT 'PENDING' | `PENDING`, `SENT`, `FAILED` |
| `SoLanThu` | `int` | NOT NULL | Số lần thử gửi |
| `LoiCuoi` | `varchar(1000)` | NULL | Lỗi lần cuối |
| `SentAt` | `timestamp` | NULL | Thời điểm gửi thành công |
| `CreatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |
| `UpdatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày cập nhật |

**Quan hệ:**
- `N → 1` với `DonHangKhoaHocs` (qua `MaDonHang`)

---

### Bảng: `MaGiamGias`
> **Model:** `MaGiamGiaModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaVoucher` | `int` | **PK**, AUTO | Mã voucher |
| `Code` | `varchar(40)` | NOT NULL | Mã code giảm giá |
| `TenChuongTrinh` | `varchar(100)` | NOT NULL | Tên chương trình |
| `LoaiGiamGia` | `varchar(20)` | DEFAULT 'PERCENT' | `PERCENT` hoặc `FIXED` |
| `GiaTriGiam` | `numeric(18,2)` | NOT NULL | Giá trị giảm |
| `GiamToiDa` | `numeric(18,2)` | NULL | Giảm tối đa (cho PERCENT) |
| `DonHangToiThieu` | `numeric(18,2)` | DEFAULT 0 | Đơn hàng tối thiểu |
| `SoLuongToiDa` | `int` | DEFAULT 0 | Số lượt dùng tối đa |
| `SoLuongDaDung` | `int` | DEFAULT 0 | Số lượt đã dùng |
| `KichHoat` | `bool` | DEFAULT true | Voucher đang hoạt động |
| `BatDauAt` | `timestamp` | DEFAULT UTC_NOW | Ngày bắt đầu |
| `KetThucAt` | `timestamp` | DEFAULT +1 tháng | Ngày hết hạn |

> ⚠️ Bảng này **không có FK** đến bảng khác trong model – chỉ được dùng bởi logic nghiệp vụ.

---

## 💰 NHÓM: TÀI CHÍNH GIẢNG VIÊN

### Bảng: `DoanhThuGiangViens`
> **Model:** `DoanhThuGiangVienModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaDoanhThu` | `int` | **PK**, AUTO | Mã doanh thu |
| `MaGiangVien` | `int` | **FK** → `NguoiDungs` | Giảng viên |
| `MaDonHang` | `int` | **FK** → `DonHangKhoaHocs` | Đơn hàng phát sinh |
| `TongTienDonHang` | `numeric(18,2)` | NOT NULL | Tổng giá trị đơn hàng |
| `PhiNenTang` | `numeric(18,2)` | NOT NULL | Phí nền tảng khấu trừ |
| `ThucNhanGiangVien` | `numeric(18,2)` | NOT NULL | Số tiền GV thực nhận |
| `TrangThaiDoiSoat` | `varchar(30)` | DEFAULT 'PENDING' | `PENDING`, `CONFIRMED` |
| `CreatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (qua `MaGiangVien`)
- `N → 1` với `DonHangKhoaHocs` (qua `MaDonHang`)

---

### Bảng: `YeuCauRutTienGiangViens`
> **Model:** `YeuCauRutTienGiangVienModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaYeuCauRutTien` | `int` | **PK**, AUTO | Mã yêu cầu |
| `MaGiangVien` | `int` | **FK** → `NguoiDungs` | Giảng viên yêu cầu |
| `SoTienYeuCau` | `numeric(18,2)` | NOT NULL | Số tiền muốn rút |
| `TrangThaiYeuCau` | `varchar(30)` | DEFAULT 'CHO_DUYET' | `CHO_DUYET`, `DA_DUYET`, `TU_CHOI` |
| `LoaiTien` | `varchar(30)` | DEFAULT 'VND' | Đơn vị tiền tệ |
| `MaNganHangNhan` | `varchar(50)` | NOT NULL | Mã ngân hàng nhận |
| `SoTaiKhoanNhan` | `varchar(50)` | NOT NULL | Số tài khoản nhận |
| `TenTaiKhoanNhan` | `varchar(255)` | NOT NULL | Tên chủ tài khoản |
| `NoiDungChuyenKhoan` | `varchar(120)` | NULL | Nội dung chuyển khoản |
| `DuongDanAnhQr` | `varchar(500)` | NULL | URL ảnh QR code |
| `SoTienDaChuyen` | `numeric(18,2)` | NULL | Số tiền thực tế đã chuyển |
| `MaGiaoDichSePay` | `long` | NULL | Mã GD từ SePay |
| `CreatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |
| `DuyetLuc` | `timestamp` | NULL | Thời điểm duyệt |
| `MaQuanTriVienDuyet` | `int` | **FK** → `NguoiDungs` (nullable) | Admin duyệt |
| `ChuyenKhoanThanhCongLuc` | `timestamp` | NULL | Thời điểm chuyển thành công |
| `GuiEmailRutTienThanhCongLuc` | `timestamp` | NULL | Thời điểm gửi email |
| `GhiChuAdmin` | `varchar(500)` | NULL | Ghi chú của Admin |

**Quan hệ:**
- `N → 1` với `NguoiDungs` (GiangVien – `MaGiangVien`)
- `N → 0..1` với `NguoiDungs` (Admin duyệt – `MaQuanTriVienDuyet`)
- `1 → N` với `HoTroRutTienGiangViens`

---

### Bảng: `HoTroRutTienGiangViens`
> **Model:** `HoTroRutTienGiangVienModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaHoTroRutTienGiangVien` | `int` | **PK**, AUTO | Mã hỗ trợ |
| `MaYeuCauRutTien` | `int` | **FK** → `YeuCauRutTienGiangViens` | Yêu cầu rút tiền liên quan |
| `MaGiangVien` | `int` | **FK** → `NguoiDungs` | Giảng viên gửi hỗ trợ |
| `TrangThaiHoTro` | `varchar(30)` | DEFAULT 'SUPPORT_PENDING' | Trạng thái hỗ trợ |
| `ThongTinLienLac` | `varchar(200)` | NOT NULL | Thông tin liên lạc |
| `NoiDungGiangVien` | `varchar(500)` | NULL | Nội dung từ GV |
| `GhiChuAdmin` | `varchar(500)` | NULL | Phản hồi Admin |
| `MaQuanTriVienXuLy` | `int` | **FK** → `NguoiDungs` (nullable) | Admin xử lý |
| `CreatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |
| `UpdatedAt` | `timestamp` | DEFAULT UTC_NOW | Ngày cập nhật |
| `XuLyLuc` | `timestamp` | NULL | Thời điểm xử lý |

**Quan hệ:**
- `N → 1` với `YeuCauRutTienGiangViens` (qua `MaYeuCauRutTien`)
- `N → 1` với `NguoiDungs` (GiangVien – `MaGiangVien`)
- `N → 0..1` với `NguoiDungs` (Admin – `MaQuanTriVienXuLy`)

---

## ⚙️ NHÓM: HỆ THỐNG

### Bảng: `CauHinhs`
> **Model:** `CauHinhHeThongModel` | **Tên bảng:** `CauHinhs`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `MaKhoa` | `varchar(100)` | **PK** (string) | Khóa cấu hình |
| `GiaTri` | `text` | NULL | Giá trị cấu hình |
| `MoTa` | `varchar(255)` | NULL | Mô tả cấu hình |
| `NgayCapNhat` | `timestamp` | DEFAULT UTC_NOW | Ngày cập nhật |

> ⚠️ Bảng key-value lưu cấu hình hệ thống, **không có FK**.

---

### Bảng: `KeyAPIs`
> **Model:** `KeyAPIModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `ID` | `int` | **PK**, AUTO | Mã API key |
| `TenKey` | `varchar(100)` | NOT NULL | Tên định danh key |
| `MaKeyMaHoa` | `text` | NOT NULL | Key đã mã hóa |
| `LoaiKey` | `varchar(20)` | DEFAULT 'Chính' | `Chính` hoặc `Phụ` |
| `TrangThai` | `bool` | DEFAULT true | Đang hoạt động |
| `ThuTuUuTien` | `int` | DEFAULT 0 | Thứ tự ưu tiên dùng |
| `HanMucRequest` | `int` | DEFAULT 5000 | Giới hạn request/ngày |
| `HanMucToken` | `int` | DEFAULT 2000000 | Giới hạn token/ngày |
| `NgayTao` | `timestamp` | DEFAULT UTC_NOW | Ngày tạo |

**Quan hệ:**
- `1 → N` với `NhatKySuDungs`

---

### Bảng: `NhatKySuDungs`
> **Model:** `NhatKySuDungModel`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `ID` | `long` | **PK**, AUTO | Mã nhật ký |
| `ID_Key` | `int` | **FK** → `KeyAPIs` | API Key sử dụng |
| `SoTokenTieuHao` | `int` | NOT NULL | Số token tiêu thụ |
| `ThoiGianGoi` | `timestamp` | DEFAULT UTC_NOW | Thời điểm gọi API |
| `MaTrangThai` | `int` | NOT NULL | HTTP status code |
| `DuongDanAPI` | `varchar(255)` | NOT NULL | Endpoint được gọi |

**Quan hệ:**
- `N → 1` với `KeyAPIs` (qua `ID_Key`)

---

## 🔗 SƠ ĐỒ QUAN HỆ TỔNG QUÁT (TEXT-ERD)

```
NguoiDungs (PK: MaNguoiDung)
│
├──[1:N]──► KhoaHocs (FK: MaGiangVien)
│               │
│               ├──[1:N]──► ChuongHocs (FK: MaKhoaHoc)
│               │               │
│               │               └──[1:N]──► BaiHocs (FK: MaChuong)
│               │                               │
│               │                               ├──[1:N]──► BaiTaps (FK: MaBaiHoc)
│               │                               │               │
│               │                               │               ├──[1:1]──► BaiTapThucHanhs (FK: MaBaiTap)
│               │                               │               │               └──[1:N]──► TestCaseThucHanhs
│               │                               │               │
│               │                               │               └──[1:1]──► BaiTap_Quizs (FK: MaBaiTap)
│               │                               │
│               │                               ├──[1:N]──► VideoChapters (FK: MaBaiHoc)
│               │                               │               └──[1:N]──► VideoQuizs (FK: MaChapter)
│               │                               │
│               │                               ├──[1:N]──► TienDoBaiHocs (FK: MaBaiHoc, MaNguoiDung)
│               │                               ├──[1:N]──► BinhLuans (FK: MaBaiHoc, MaNguoiDung)
│               │                               ├──[1:N]──► GhiChuBaiHocs (FK: MaBaiHoc, MaNguoiDung)
│               │                               └──[1:N]──► GhiChuAIs (FK: MaBaiHoc, MaNguoiDung)
│               │
│               ├──[1:N]──► DangKyKhoaHocs (FK: MaKhoaHoc, MaNguoiDung)
│               ├──[1:N]──► DanhGias (FK: MaKhoaHoc, MaNguoiDung)
│               ├──[1:N]──► KetQuaKiemTraChungChis (FK: MaKhoaHoc, MaNguoiDung)
│               │               └──[0..1:N]──► ChungChiKhoaHocs (FK: MaKetQuaKiemTraChungChi)
│               └──[1:N]──► ChiTietDonHangs (FK: MaKhoaHoc, MaDonHang)
│
├──[1:N]──► DonHangKhoaHocs (FK: MaNguoiDung)
│               ├──[1:N]──► ChiTietDonHangs
│               ├──[1:N]──► GiaoDichThanhToans
│               ├──[1:N]──► ThongBaoEmailThanhToans
│               └──[1:N]──► DoanhThuGiangViens (FK: MaGiangVien, MaDonHang)
│
├──[1:N]──► YeuCauRutTienGiangViens (FK: MaGiangVien)
│               └──[1:N]──► HoTroRutTienGiangViens (FK: MaYeuCauRutTien)
│
├──[1:N]──► LoTrinhAIs (FK: MaNguoiDung)
├──[1:N]──► KetQuaLamBais (FK: MaNguoiDung, MaBaiTap)
├──[1:N]──► PhienDangNhap (FK: MaNguoiDung)
│
BinhLuans ──[self N:0..1]──► BinhLuans (FK: MaBinhLuanCha)

KeyAPIs (PK: ID)
└──[1:N]──► NhatKySuDungs (FK: ID_Key)

CauHinhs (PK: MaKhoa – standalone)
MaGiamGias (PK: MaVoucher – standalone)
```

---

## 📝 GHI CHÚ ĐẶC BIỆT

| Lưu ý | Chi tiết |
|-------|----------|
| **Self-referencing** | `BinhLuans.MaBinhLuanCha` → `BinhLuans` (cây bình luận lồng nhau) |
| **Multi-FK cùng bảng** | `NguoiDungs` được FK từ 3 cột trong `YeuCauRutTienGiangViens` và `HoTroRutTienGiangViens` |
| **Bảng độc lập** | `CauHinhs`, `MaGiamGias` không có FK đến bảng khác |
| **PK kiểu string** | `CauHinhs.MaKhoa` là `varchar(100)` thay vì int |
| **PK kiểu long** | `NhatKySuDungs.ID` là `long` (bigint) để chứa khối lượng log lớn |
| **JSON columns** | `BaiTap_Quizs.DuLieuCauHoi`, `KhoaHocs.DuLieuDeChungChiJSON`, `GiaoDichThanhToans.RawWebhook` lưu JSON |
| **Jsonb** | `GiaoDichThanhToans.RawWebhook` dùng type `jsonb` của PostgreSQL |
