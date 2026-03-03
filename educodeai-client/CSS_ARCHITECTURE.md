# CSS Architecture - EduCodeAI

## 📋 Cấu Trúc CSS Được Đồng Bộ

### 🎯 CSS Chính (Global)

**Location:** `src/assets/styles/`

| File | Dung Lượng | Mục Đích |
|------|-----------|---------|
| `variables.css` | 2.3 KB | 🔧 Tất cả biến CSS toàn hệ thống (màu, font, shadow, radius) |
| `hoc-vien-global.css` | 19 KB | 📚 Tất cả CSS chung cho **Học Viên** (navbar, button, carousel, footer) |
| `UI_GiangVien_QuanTriVien_Kit.css` | 3.8 KB | 👨‍🏫 CSS chung cho **Giảng Viên & Quản Trị Viên** (sidebar, header, layout) |
| `LayoutDashboard.css` | 3.2 KB | 📊 CSS cho Dashboard layout của Giảng Viên & Quản Trị Viên |
| `bootstrap.min.css` | 164 KB | 🏗️ Bootstrap framework (không sửa) |

---

## 🎨 Hệ Thống Màu Chính

### Variables được định nghĩa trong `variables.css`

```css
/* Primary Color - CAM */
--primary: #f69050
--primary-hover: #e67e22
--primary-dark: #d97706

/* Content Page (CP) Colors */
--cp-primary: #f69050
--cp-primary-soft: #fef3ec
--cp-primary-strong: #e67e22

/* Backgrounds */
--bg-main: #f9fafb
--bg-card: #ffffff
--bg-sidebar: #111827

/* Text Colors */
--text-main: #111827
--text-muted: #6b7280
--text-white: #ffffff
--text-dark: #181d38

/* Other Semantic Colors */
--success: #10b981
--danger: #ef4444
--warning: #f59e0b
--info: #0ea5e9
```

---

## 📦 Layouts & CSS Imports

### Học Viên (HocVien)

**Files:**
- `LayoutHocVien.tsx` - Main layout with Header & Footer
- `LayoutBlank.tsx` - Blank layout (no header/footer)

**CSS Imports:**
```tsx
import "@/assets/styles/variables.css";
import "@/assets/styles/hoc-vien-global.css";
```

---

### Giảng Viên (GiangVien)

**File:** `LayoutGiangVien.tsx`

**CSS Imports:**
```tsx
import '../../assets/styles/variables.css';
import '../../assets/styles/UI_GiangVien_QuanTriVien_Kit.css';
import '../../assets/styles/LayoutDashboard.css';
```

---

### Quản Trị Viên (QuanTriVien)

**File:** `LayoutQuanTriVien.tsx`

**CSS Imports:**
```tsx
import '../../assets/styles/variables.css';
import '../../assets/styles/UI_GiangVien_QuanTriVien_Kit.css';
import '../../assets/styles/LayoutDashboard.css';
```

---

## 📄 CSS Đặc Trưng Của Trang

### Học Viên (Pages)

| Trang | CSS File | Kích Thước |
|-------|----------|-----------|
| Nội dung khóa học | `pages/hoc-vien/noi-dung-khoa-hoc/style.css` | 65 KB |
| Yêu cầu lộ trình AI | `pages/hoc-vien/yeu-cau-lo-trinh-ai/Components/YeuCauLoTrinhAI.css` | 8 KB |
| Hồ sơ học viên | `pages/hoc-vien/ho-so-hoc-vien/ho-so-hoc-vien.css` | 4 KB |
| Tổng quan hồ sơ | `pages/hoc-vien/ho-so-hoc-vien/css/tong-quan.css` | 6 KB |
| Chỉnh sửa hồ sơ | `pages/hoc-vien/ho-so-hoc-vien/chinh-sua-ho-so.css` | 2 KB |
| Khóa học cá nhân AI | `pages/hoc-vien/khoa-hoc-ca-nhan-ai/KhoaHocCaNhanAI.css` | 5 KB |
| Chi tiết lộ trình AI | `pages/hoc-vien/khoa-hoc-ca-nhan-ai/ChiTietLoTrinhAI.css` | 4 KB |
| Trợ lý chatbot AI | `pages/hoc-vien/tro-ly-hoi-dap-ai/ChatBot.css` | 3 KB |
| Lịch sử làm bài | `layouts/hoc-vien/LichSuLamBai.css` | 1 KB |
| Chi tiết khóa học | `layouts/hoc-vien/ChiTietKhoaHoc.css` | 2 KB |

### Giảng Viên (Pages)

| Trang | CSS File | Kích Thước |
|-------|----------|-----------|
| Thống kê học tập | `pages/giang-vien/thong-ke-hoc-tap/components/ThongKeHocTap.css` | 4 KB |
| | `pages/giang-vien/thong-ke-hoc-tap/components/css/top-students.css` | 2 KB |
| | `pages/giang-vien/thong-ke-hoc-tap/components/css/student-table.css` | 2 KB |
| | `pages/giang-vien/thong-ke-hoc-tap/components/css/at-risk-students.css` | 2 KB |
| Khóa học của tôi | `pages/giang-vien/khoa-hoc-cua-toi/KhoaHocCuaToi.css` | 5 KB |
| Tạo bài tập | `pages/giang-vien/tao-bai-tap-test-case/QuanLyBaiTap.css` | 8 KB |
| | `pages/giang-vien/tao-bai-tap-test-case/TaoQuiz.css` | 6 KB |
| | `pages/giang-vien/tao-bai-tap-test-case/PreviewQuiz.css` | 3 KB |
| | `pages/giang-vien/tao-bai-tap-test-case/CaiDatQuiz.css` | 2 KB |

### Quản Trị Viên (Pages)

| Trang | CSS File | Kích Thước |
|-------|----------|-----------|
| Quản lý người dùng | `pages/quan-tri-vien/quan-ly-nguoi-dung/QuanLyNguoiDung.css` | 4 KB |
| Quản lý review | `pages/quan-tri-vien/quan-ly-binh-luan-review/components/Review.css` | 2 KB |

---

## ✅ Cleanup Status

### 🗑️ Files Đã Xóa (Deprecated)
- ❌ `src/assets/styles/style.css` - Đã hợp nhất vào `hoc-vien-global.css`
- ❌ `src/assets/styles/UI_HocVien_Kit.css` - Đã hợp nhất vào `hoc-vien-global.css`

### 📊 Tổng Kích Thước
- **CSS Chính:** ~25 KB
- **CSS Page-Specific:** ~145 KB
- **Tổng cộng:** ~170 KB

---

## 🔄 Hướng Dẫn Thêm Màu Mới

Để thêm màu mới, hãy cập nhật `variables.css`:

```css
:root {
  --new-color: #XXXXXX;
  --new-color-hover: #XXXXXX;
}
```

Sau đó sử dụng trong CSS:
```css
.element {
  color: var(--new-color);
}

.element:hover {
  color: var(--new-color-hover);
}
```

---

## 🎯 Best Practices

1. ✅ **Dùng biến CSS** thay vì hardcode màu
2. ✅ **Import `variables.css`** trong mọi CSS file mới
3. ✅ **CSS page-specific** nên nằm cùng thư mục với page
4. ✅ **Tránh trùng lặp** - check trước khi thêm CSS mới
5. ✅ **Dùng class naming conventions** - BEM hoặc camelCase

---

**Last Updated:** 2 Tháng 3, 2026
