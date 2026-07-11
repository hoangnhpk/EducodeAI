---
name: frontend-educodeai-ui
description: Implement frontend changes using EdTech + AI SaaS Design System (Tailwind CSS + Shadcn UI style). Use when Codex must modify UI components, pages, routing, state management, forms, tables, dashboards, styling, accessibility, responsive behavior, loading/error states for EducodeAI project.
---

# Frontend Implementation: EdTech + AI SaaS Design System (EducodeAI)

EducodeAI là một nền tảng Công nghệ Giáo dục (EdTech) tích hợp AI dành cho **Học sinh, Sinh viên và Giảng viên**. 
Mục tiêu thiết kế: **Thân thiện, Sáng sủa, Đáng tin cậy, Tập trung vào học tập nhưng mang hơi thở Công nghệ AI hiện đại.**

Tài liệu này là quy chuẩn BẮT BUỘC để đảm bảo AI và toàn bộ Dev Team khi sinh code đều cho ra một giao diện đồng nhất 100%.

---

## 1. Công nghệ Bắt buộc (Core Stack)
- **CSS Framework:** 100% **Tailwind CSS**. (TUYỆT ĐỐI CẤM dùng Bootstrap. Xoá sạch mọi class `btn`, `container`, `row`, `col`).
- **Icons:** DUY NHẤT thư viện **`lucide-react`**. Cấm dùng FontAwesome, Bootstrap Icons, hay React Icons.
- **Component Style:** Tuân thủ triết lý **Shadcn UI** (Headless, tách biệt logic và CSS).

---

## 2. Quy chuẩn Thẩm mỹ (Aesthetics & Colors)
- **Chế độ Sáng (Light Mode mặc định):** 
  - Màu nền chính (App background): `bg-slate-50` hoặc `bg-zinc-50`.
  - Màu nền Component (Card, Modal): `bg-white`.
  - Màu chữ: `text-slate-800` (Tiêu đề), `text-slate-500` (Mô tả, phụ đề).
- **Màu sắc Thương hiệu (Brand Colors):**
  - **Primary:** `indigo-600` (Xanh tím - Thể hiện sự tri thức, đáng tin cậy). Hover: `indigo-700`.
  - **AI Magic:** `violet-500` hoặc Gradient `bg-gradient-to-r from-indigo-500 to-violet-500`. Dùng cho nút "Hỏi AI", "Sửa lỗi code".
  - **Success (Học tốt):** `emerald-500`.
  - **Warning/Error:** `amber-500` / `rose-500`.
- **Mềm mại & Gần gũi:** Bo góc lớn (`rounded-xl` hoặc `rounded-2xl`). Viền siêu mỏng `border border-slate-200`. Đổ bóng nhẹ `shadow-sm` hoặc `shadow-md`.
- **⚠️ Migration (Code cũ):** Nếu gặp code cũ dùng biến CSS `--primary` (màu cam `#f69050`) hoặc class Bootstrap, thay thế toàn bộ bằng `indigo-600` và Tailwind tương đương.

---

## 3. Quy chuẩn Typography (Font & Text Scale)

Font chữ ảnh hưởng trực tiếp đến khả năng đọc hiểu của học sinh — đây là yếu tố không được bỏ qua trên nền tảng EdTech.

- **Font Family:** Ưu tiên theo thứ tự `Inter` → `Roboto` → `sans-serif`. Khai báo trong `index.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body { font-family: 'Inter', sans-serif; }
  ```
- **Thang cỡ chữ (Type Scale):**

  | Vai trò | Class Tailwind | Dùng ở đâu |
  |---|---|---|
  | Page Title | `text-2xl font-bold text-slate-800 tracking-tight` | Tiêu đề trang chính (VD: "Danh sách khoá học") |
  | Section Heading | `text-xl font-semibold text-slate-800` | Tiêu đề các khối trong trang |
  | Card Title | `text-base font-semibold text-slate-800` | Tên bài học, tên bài tập |
  | Body Text | `text-sm text-slate-600 leading-relaxed` | Mô tả, nội dung đoạn văn |
  | Helper / Caption | `text-xs text-slate-400` | Ghi chú nhỏ, timestamp, label phụ |
  | Badge / Label | `text-xs font-medium` | Nhãn trạng thái, môn học |

- **Line-height cho nội dung học tập:** Mọi đoạn văn bản dài (mô tả bài học, đề bài) bắt buộc dùng `leading-relaxed` (1.625) hoặc `leading-loose` (2) để giảm mỏi mắt.
- **KHÔNG dùng:** `text-lg` hoặc lớn hơn cho body text. Không đặt `font-bold` lên text mô tả thông thường.

---

## 3b. Responsive (Breakpoints & Layout đa thiết bị)

EducodeAI phục vụ cả học sinh dùng điện thoại lẫn giảng viên dùng màn hình lớn — responsive là bắt buộc.

- **Breakpoints chuẩn (theo Tailwind):**
  - `sm` (640px): Layout 1 cột trên mobile
  - `md` (768px): Tablet — Sidebar có thể collapse
  - `lg` (1024px): Desktop — Layout đầy đủ
  - `xl` (1280px): Màn hình rộng — Tăng padding, không stretch thêm

- **Sidebar (Menu dọc):**
  - Desktop (`lg` trở lên): Hiển thị cố định, width `w-64` (256px).
  - Tablet (`md`): Thu lại còn icon-only `w-16`, hover để expand.
  - Mobile (`sm`): Ẩn hoàn toàn, thay bằng nút hamburger mở Drawer overlay từ trái.

- **Main Content Area:**
  - Luôn dùng `flex-1 min-w-0` để tự co giãn theo sidebar.
  - Padding trong: `p-4 md:p-6 lg:p-8` — tăng dần theo màn hình lớn hơn.

- **Card Grid (Danh sách khoá học, bài tập):**
  - Mobile: `grid grid-cols-1`
  - Tablet: `grid grid-cols-2`
  - Desktop: `grid grid-cols-3`
  - Rộng: `grid grid-cols-4`
  - Viết gọn: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

- **Modal trên Mobile:** Thay vì centered dialog, trên màn hình nhỏ (`< md`) Modal nên trượt từ dưới lên (Bottom Sheet) bằng cách thêm class `mt-auto sm:mt-0 sm:m-auto rounded-t-2xl sm:rounded-2xl`.

- **Table trên Mobile:** Table giảng viên/quản lý trên mobile phải dùng kỹ thuật horizontal scroll: bọc trong `overflow-x-auto` thay vì cố nhét vừa màn hình.

- **Header chiều cao:** Cố định `h-16` (64px), `sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200`.

---

## 4. Quy chuẩn Khoảng cách & Bố cục (Spacing & Layout System)
Khoảng trắng (White-space) là yếu tố sống còn của một nền tảng EdTech để giúp học sinh giảm tải áp lực nhận thức (Cognitive Load). KHÔNG BAO GIỜ nhồi nhét quá nhiều thành phần sát nhau.

- **Grid & Hệ số (Base-8 System):** 
  - Mọi kích thước Margin (`m`), Padding (`p`), và Gap (`gap`) phải dùng hệ số của Tailwind (1 unit = 0.25rem = 4px). Tuy nhiên, ưu tiên dùng các số chẵn (Base-8): `4` (16px), `6` (24px), `8` (32px), `12` (48px).
- **Khoảng cách giữa các Khu vực (Sections):** 
  - Giữa các khối lớn trên màn hình (Ví dụ: Giữa Header và Content, hoặc giữa các hàng Card), bắt buộc dùng `gap-6` (24px) hoặc `gap-8` (32px).
- **Khoảng cách bên trong Component (Inner Padding):**
  - Card hoặc Panel: `p-6` (24px) hoặc `p-8` (32px) để tạo sự rộng rãi. KHÔNG dùng `p-2` hay `p-3` cho các vùng chứa nội dung chính vì nó sẽ trông rất chật chội.
  - Buttons / Inputs: `px-4 py-2.5` để đảm bảo nút bấm đủ to, dễ click.
- **Bố cục (Layout):**
  - Luôn sử dụng Flexbox hoặc CSS Grid để căn chỉnh thay vì margin/padding thủ công. Dùng `flex flex-col gap-4` để tạo danh sách dọc chuẩn xác.
  - Vùng chứa nội dung chính (Main Container) tối đa rộng `max-w-7xl mx-auto` để chống việc nội dung bị kéo giãn quá dài trên màn hình to, gây khó đọc.

---

## 5. CHUẨN HOÁ CÁC COMPONENT CỐT LÕI (Dành cho Dev/AI prompt)

### 5.1. Hộp thoại (Modals / Dialogs)
Modals trên nền tảng giáo dục không được gây cảm giác "chặn đứng nguy hiểm" mà phải mềm mại, tập trung.
- **Backdrop (Lớp nền mờ):** Bắt buộc dùng `fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50`.
- **Box Content (Khung Modal):** 
  - Khối chính: `bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden`.
  - Hiệu ứng xuất hiện: Bắt buộc có animation `animate-in fade-in zoom-in-95 duration-200`.
- **Header:** 
  - Padding `p-6 pb-4`. 
  - Tiêu đề `text-xl font-bold text-slate-800`.
  - Nút Close (X): Nằm góc phải trên cùng, dạng hình tròn `p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors`.
- **Body:** Padding `px-6 py-4`. Chữ mô tả dùng `text-slate-600 text-sm leading-relaxed`.
- **Footer (Nút bấm):** 
  - Padding `p-6 pt-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3`.
  - Nút Cancel: `px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors`.
  - Nút Confirm: `px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md shadow-indigo-600/20`.

### 5.2. Bảng biểu (Tables) - Dành cho Giảng viên/Quản lý lớp
- **Table Wrapper:** Nằm trong một Card bo góc `bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`.
- **Table Header (`<thead>`):** Nền `bg-slate-50`, chữ `text-xs font-semibold text-slate-500 uppercase tracking-wider`, có viền dưới `border-b border-slate-200`.
- **Table Rows (`<tbody> <tr>`):** 
  - Nền trắng `bg-white`, hiệu ứng `hover:bg-slate-50 transition-colors`.
  - Đường kẻ ngang `border-b border-slate-100`.
- **Empty State trong Table:** Nếu không có dữ liệu, hiển thị 1 ô `colSpan={100}` cao khoảng `h-64`. Chứa 1 icon (vd: `Inbox`, `Users`) màu `text-slate-300 w-12 h-12`, chữ "Chưa có dữ liệu" `text-slate-500`.

### 5.3. Các Thẻ Nội Dung (Cards - Khoá học, Bài tập)
- Khung: `bg-white rounded-2xl border border-slate-200 shadow-sm p-5`.
- Tương tác (Nếu bấm được): Thêm class `cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-300 group`.
- **Badges (Nhãn):** Môn học, Trạng thái (Đang học, Hoàn thành) phải dùng dạng Pill. 
  - Code: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700`.

### 5.4. AI Chat & Trợ giảng Ảo (AI Interactions)
Giao diện tương tác với AI phải phân biệt rõ với form nhập liệu thông thường.
- **AI Chat Bubbles (Bong bóng chat):**
  - Bot AI: Nền Xanh/Tím nhạt `bg-indigo-50 text-slate-800 rounded-2xl rounded-tl-sm p-4`.
  - User (Học sinh): Nền Xám `bg-slate-100 text-slate-800 rounded-2xl rounded-tr-sm p-4`.
- **Glow & Loading AI:** Khi AI đang sinh ra code/đáp án, sử dụng class `animate-pulse` ở viền, hoặc chữ "AI đang suy nghĩ..." kèm icon `Sparkles` màu `violet-500`.
- **Code Block trong AI:** Bắt buộc có nút "Copy" ở góc phải đoạn code. Code block có nền cực tối `bg-slate-900 rounded-xl p-4 text-sm font-mono text-slate-50 overflow-x-auto`.

### 5.5. Biểu mẫu & Nhập liệu (Forms & Inputs)
- **Label:** Chữ nhỏ, in hoa mờ `text-xs font-semibold text-slate-500 uppercase mb-1.5 block`.
- **Input Field:** 
  - Khung: `w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400`.
  - Trạng thái Focus: `focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all`.
  - Trạng thái Lỗi: Chuyển viền sang `border-rose-500` và hiển thị text đỏ `text-rose-500 text-xs mt-1` NGAY DƯỚI input.

### 5.6. Điều hướng (Navigation & Tabs)
- **Sidebar (Menu dọc):** Nền `bg-white`, viền phải `border-r border-slate-200`. Item đang chọn (Active) dùng nền `bg-indigo-50 text-indigo-700 font-semibold`, các item khác `text-slate-600 hover:bg-slate-50`.
- **Tabs (Thanh chuyển đổi):** 
  - Dạng gạch dưới (Underline): Item active có viền dưới dày `border-b-2 border-indigo-600 text-indigo-600`.
  - Dạng nút (Pills): Dùng `bg-slate-100 p-1 rounded-xl`, item active có `bg-white shadow-sm rounded-lg`.

### 5.7. Đặc thù EdTech (Tiến độ học tập & Gamification)
- **Progress Bar (Thanh tiến độ):** Bắt buộc bo tròn `rounded-full`. Nền xám nhạt `bg-slate-200`, lõi màu xanh `bg-emerald-500` hoặc `bg-indigo-500` kèm hiệu ứng `transition-all duration-500`.
- **Skeleton cho Bài học (Loading):** Khi đang tải danh sách bài học, phải dùng Skeleton mô phỏng hình dạng Card bài học thay vì chỉ xoay tròn.

### 5.8. Không gian lập trình (Code Workspace)
Vì EducodeAI có tính năng viết code, phần Editor phải có thiết kế riêng:
- **Trình soạn thảo (Monaco Editor):** Mặc định ở chế độ Light Theme (chữ rõ ràng) hoặc tuỳ chọn Dark (VSCode style). Xung quanh Editor phải có viền `border border-slate-200 rounded-xl overflow-hidden`.
- **Cửa sổ Terminal (Kết quả chạy code):** Nền Đen xì `bg-slate-950 text-slate-300 font-mono text-sm p-4 rounded-xl`, header của Terminal có màu `bg-slate-900 border-b border-slate-800` với 3 chấm tròn (giống Mac OS) trang trí.

---

## 6. Quản lý Trạng thái & Phản hồi (Feedback Guardrails)
- **THÔNG BÁO (Toast):** TUYỆT ĐỐI CẤM dùng `window.alert()`. Mọi thông báo thành công/lỗi phải dùng thư viện `react-hot-toast` hoặc `sonner`.
- **XÁC NHẬN (Confirm):** TUYỆT ĐỐI CẤM dùng `window.confirm()`. Phải gọi Component Modal như mục 5.1 hoặc cấu hình `sweetalert2` sao cho bo góc `rounded-2xl` và dùng font của Tailwind.
- **Loading:** Cấm để trang bị đơ mà không có tín hiệu. Khi submit form, nút Button phải hiển thị icon `Loader2 animate-spin` và bị disable `opacity-70 cursor-not-allowed`. Khi load trang, dùng Skeleton Loading (các thanh ngang `bg-slate-200 animate-pulse rounded-full`).
- **⚠️ Lưu ý cài đặt:** Animation class `animate-in`, `fade-in`, `zoom-in-95` trong mục 5.1 yêu cầu cài thêm package `tailwindcss-animate`. Chạy `npm install tailwindcss-animate` và thêm vào `tailwind.config.js`: `plugins: [require('tailwindcss-animate')]`.
