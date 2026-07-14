---
name: frontend-educodeai-ui
description: Quy chuẩn UI/UX + skill để cải thiện giao diện dự án EducodeAI. Dùng khi AI cần sửa component, page, layout, form, table, dashboard, styling, responsive, accessibility, loading/error state. Stack THẬT: React 19 + Vite + TypeScript + Bootstrap 5 + CSS variables (KHÔNG Tailwind, KHÔNG Shadcn).
---

# Frontend Implementation Standard — EducodeAI

EducodeAI là nền tảng EdTech tích hợp AI cho **Học viên, Giảng viên, Quản trị viên**.
Mục tiêu thẩm mỹ: **Thân thiện, sáng sủa, đáng tin cậy, tập trung học tập, hơi thở công nghệ AI hiện đại.**

Tài liệu này là quy chuẩn BẮT BUỘC cho AI coding agent (Claude Code) khi chỉnh sửa giao diện. Mục tiêu: **làm đẹp hơn mà KHÔNG phá vỡ chức năng, nghiệp vụ, API, kiến trúc.**

---

## 1. Mục tiêu

- Nâng cấp giao diện dần dần, có kiểm soát, theo từng màn hình.
- Đồng bộ 100% design token, typography, spacing, state.
- Không migrate framework, không trộn nhiều công nghệ CSS.
- Ưu tiên tái sử dụng CSS/component hiện có thay vì viết mới.

---

## 2. STACK ĐÃ CHỐT

> Kết quả kiểm tra code thực tế (`educodeai-client/`). Đây là stack DUY NHẤT được phép dùng.

| Hạng mục | Công nghệ CHỐT | Ghi chú |
|---|---|---|
| Framework | **React 19 + Vite + TypeScript** | Không đổi |
| CSS | **Bootstrap 5.3 + CSS variables** (`src/assets/styles/variables.css`) | Utility class Bootstrap + CSS thuần `.cp-*` |
| Dialog/Toast | **SweetAlert2** (đã có) | Không cài thư viện toast mới |
| Icon | **Font Awesome** (chủ đạo, ~334 chỗ) + Bootstrap Icons | lucide-react/react-icons chỉ dùng trong file đã có sẵn |
| Chart | **recharts** | |
| Editor | **@monaco-editor/react** | |
| Animation | **animate.css** + CSS transition | |

### Chiến lược: NÂNG CẤP BẰNG DESIGN TOKEN (không migrate)

- **BẮT BUỘC** giữ Bootstrap 5. **KHÔNG ĐƯỢC** cài Tailwind, Shadcn, hay bất kỳ CSS framework nào khác.
- **KHÔNG ĐƯỢC** trộn Bootstrap + Tailwind + Shadcn trong cùng 1 component (class kiểu `bg-slate-50`, `rounded-2xl` là Tailwind → CẤM, vì dự án không có Tailwind, class đó vô hiệu).
- **BẮT BUỘC** dùng biến CSS trong `variables.css` (mục 5) cho màu/spacing/radius/shadow. **KHÔNG hardcode** khi đã có token.
- Nâng cấp bằng cách sửa/thêm CSS `.cp-*` và class Bootstrap utility, KHÔNG viết lại kiến trúc.
- **KHÔNG ĐƯỢC** tự ý cài, gỡ, nâng cấp package. Muốn thêm package → phải nêu lý do + ảnh hưởng, chờ xác nhận.

### Brand color THẬT (đã chuẩn hóa: CAM là chính, BỎ xanh dương)

- Primary = **Cam `--primary: #f69050`**, hover `--primary-hover: #e67e22`. (KHÔNG phải indigo — mọi tài liệu cũ ghi indigo là SAI, bỏ.)
- **QUYẾT ĐỊNH THƯƠNG HIỆU**: cam là màu chủ đạo DUY NHẤT cho mọi vai trò (HV/GV/QTV). **BỎ hệ xanh dương** `#1e40af/#1e3a8a` đang dùng ở sidebar & tiêu đề dashboard GV/QTV — vì nó tạo 2 hệ màu đá nhau, phá vỡ nhất quán thương hiệu.
- **Sidebar GV/QTV**: đổi gradient xanh → **tối trung tính** (`#1f2937` → `#111827`), viền active dùng cam (`--primary`). KHÔNG dùng nền cam đặc cho sidebar (chữ trắng trên cam fail contrast).
- **Tiêu đề dashboard**: đổi từ xanh `#1e40af` → màu chữ đậm trung tính (`--text-dark`).
- Các biến `--sidebar-gradient-*`, `--dashboard-*-title` GIỮ NGUYÊN TÊN, chỉ đổi GIÁ TRỊ (mục 5.1) để không vỡ CSS đang tham chiếu (`LayoutDashboard.css`).

---

## 3. Nguyên tắc BẮT BUỘC khi redesign

- **KHÔNG ĐƯỢC** thay đổi API contract (URL, method, request/response shape).
- **KHÔNG ĐƯỢC** thay đổi nghiệp vụ, logic validation, phân quyền.
- **KHÔNG ĐƯỢC** xóa chức năng đang hoạt động.
- **KHÔNG ĐƯỢC** tự ý đổi router, URL, hoặc state management (Context/React Query).
- **KHÔNG ĐƯỢC** rewrite toàn bộ component khi chỉ cần sửa layout/style.
- **BẮT BUỘC** ưu tiên tái sử dụng component/CSS hiện có.
- **BẮT BUỘC** chia thay đổi lớn theo từng màn hình/module, không sửa hàng loạt cùng lúc.
- **CHỈ KHI** thật sự cần mới thêm package, và phải kiểm tra ảnh hưởng trước.

### Thứ tự ưu tiên màn hình (làm từ trên xuống)

1. Không gian học tập & làm bài (`khong-gian-hoc-tap`, `noi-dung-khoa-hoc`).
2. Code Workspace & kết quả chạy code (`BaiTapThucHanh`, Monaco + terminal).
3. AI Chat / trợ giảng AI (`tro-ly-hoi-dap-ai`, `sinh-do-an-ai`, `yeu-cau-lo-trinh-ai`).
4. Danh sách khóa học, bài học, bài tập (`danh-sach-khoa-hoc`, `chi-tet-khoa-hoc`).
5. Dashboard học tập (`thong-ke-hoc-tap`, `thong-ke/ThongKeAdmin`).
6. Trang giảng viên & quản trị.
7. Đăng nhập, hồ sơ, cài đặt (`DangNhap`, `ho-so-hoc-vien`, `bao-mat`).

**BẮT BUỘC** làm màn hình dùng nhiều nhất trước; KHÔNG bắt đầu từ trang phụ.

---

## 4. Nâng cấp Bố cục & Thị giác (cách làm ĐẸP HƠN)

Đây là phần "làm đẹp": sau khi giữ đúng chức năng, dùng các nguyên tắc dưới để nâng chất lượng thị giác. Áp dụng cho mọi màn hình khi redesign.

### 4.1 Phân cấp thị giác (Visual Hierarchy)
- Mỗi màn hình **CHỈ 1 điểm nhấn chính** (primary action / thông tin quan trọng nhất). Mọi thứ khác phải phụ thuộc nó về kích thước, màu, độ đậm.
- Thứ tự dẫn mắt: **tiêu đề → nội dung chính → hành động → phụ trợ**. Dùng cỡ chữ (mục 6.1), độ đậm, và khoảng cách để tạo thứ tự, KHÔNG dùng màu loè loẹt.
- **KHÔNG** để 2 khối cùng "hét to" (cùng cỡ chữ lớn + cùng màu nổi) cạnh nhau — người dùng mất phương hướng.

### 4.2 Bố cục & lưới (Layout)
- **BẮT BUỘC** dùng Flexbox/Grid + `gap`, KHÔNG căn bằng margin thủ công rời rạc.
- Giới hạn bề rộng vùng đọc: container chính `max-width` ~1200–1280px, căn giữa; đoạn văn dài không quá ~72 ký tự/dòng.
- Căn lề nhất quán: mọi phần tử trong 1 khối chia sẻ cùng 1 mép trái (alignment grid). Tránh mỗi thứ thụt vào một kiểu.
- Nhóm thông tin liên quan lại gần nhau, tách nhóm khác bằng khoảng trắng (proximity), KHÔNG bằng nhiều đường kẻ.

### 4.3 Khoảng thở (Spacing rhythm)
- Nhịp khoảng cách theo **base-8** (mục 5.2). Khoảng cách TRONG nhóm nhỏ hơn khoảng cách GIỮA các nhóm.
- Card/panel nội dung chính padding **24px** (`p-4`); KHÔNG nhồi `p-2`.
- Giữa các section lớn: cách nhau **24–32px** (`gap-4`/`gap-5`).
- Ưu tiên tăng khoảng trắng thay vì thêm đường viền/nền để phân tách.

### 4.4 Bề mặt & độ sâu (Surface & Elevation)
- Phân tầng bằng: nền (`--bg-main`) → card (`--bg-card` + `--shadow-sm`) → nổi (modal/dropdown + `--shadow-lg`). Dùng shadow theo token, KHÔNG tự chế bóng đậm.
- Bo góc nhất quán: card/khối lớn `--radius-lg`, nút/input `--radius-md`. KHÔNG trộn nhiều độ bo trong 1 khối.
- Viền mỏng `--border-color` để tách nhẹ; ưu tiên shadow + khoảng trắng hơn là viền dày.

### 4.5 Nhất quán (Consistency)
- Cùng một loại phần tử (nút, badge, card) phải trông giống nhau trên mọi màn hình — tái dùng CSS `.cp-*` sẵn có.
- KHÔNG tạo biến thể mới của 1 component nếu đã có biến thể tương đương.

### 4.6 Trước khi coi là "đẹp hơn"
- So sánh trước/sau: bố cục có rõ điểm nhấn hơn? khoảng thở đều hơn? mắt đi có mượt không?
- Squint test: nhìn nhoè màn hình — điểm nhấn chính có nổi lên không? Nếu mọi thứ đều mờ như nhau → phân cấp còn yếu.

---

## 5. Design System (Token — nguồn chân lý: `variables.css`)

Component **KHÔNG ĐƯỢC** hardcode giá trị khi đã có token dưới đây.

### 5.1 Màu (bảng chuẩn hóa — đích cần đạt trong `variables.css`)

> Các biến GIỮ NGUYÊN TÊN. Biến đang có màu xanh cần đổi GIÁ TRỊ (cột "Đổi thành"). Biến `*-soft`/`*-strong`/`--ai-*` là token MỚI cần thêm để làm badge/nền nhạt mà không hardcode.

**Brand & AI**
| Token | Giá trị | Ghi chú |
|---|---|---|
| `--primary` / `--primary-hover` / `--primary-dark` | `#f69050` / `#e67e22` / `#d97706` | Cam chủ đạo. Text dùng `--primary-dark` để đạt contrast |
| `--primary-soft` *(mới)* | `#fef3ec` | Nền nhạt cho badge/nút ghost brand |
| `--ai-accent` / `--ai-accent-hover` / `--ai-accent-soft` *(mới)* | `#8b5cf6` / `#7c3aed` / `#f3effe` | Tím riêng cho tính năng AI, phân biệt với brand |

**Semantic (thêm scale nhạt/đậm cho badge)**
| Token | Giá trị | `*-soft` (mới) | `*-strong` (mới) |
|---|---|---|---|
| `--success` | `#10b981` | `#e7f7f1` | `#047857` |
| `--warning` | `#f59e0b` | `#fef3e0` | `#b45309` |
| `--danger` | `#ef4444` | `#fdecec` | `#b91c1c` |
| `--info` | `#0ea5e9` | `#e6f6fe` | `#0369a1` |

> Lưu ý: `--secondary` (`#10b981`) trùng `--success` — khi dùng chỉ chọn 1 ý nghĩa. `--warning` (`#f59e0b`) sát cam brand → KHÔNG đặt cạnh nút primary.

**Quy tắc SỬ DỤNG màu (BẮT BUỘC — quyết định "dùng màu nào, khi nào")**
- **Cam** (`--primary`): CHỈ dùng cho CTA chính, trạng thái active, điểm nhấn thương hiệu.
- **Tím** (`--ai-accent`): CHỈ dùng cho tính năng liên quan trực tiếp đến AI.
- **Xanh lá** (`--success`): CHỈ dùng cho trạng thái thành công, hoàn thành, đáp án đúng.
- **Vàng** (`--warning`): CHỈ dùng cho cảnh báo hoặc nội dung cần chú ý.
- **Đỏ** (`--danger`): CHỈ dùng cho lỗi, nguy hiểm, thao tác phá hủy.
- **Xanh dương** (`--info`): CHỈ dùng cho thông tin trung lập. KHÔNG dùng làm màu thương hiệu.
- **Xám** (`--bg-*` / `--text-*` / `--border-*`): mặc định cho nền, chữ, viền, hành động phụ.
- **KHÔNG ĐƯỢC** dùng quá **2 màu nổi** trong cùng một khu vực giao diện.

**Đổi giá trị các biến XANH → trung tính/cam (BỎ xanh dương)**
| Token | Giá trị cũ | Đổi thành |
|---|---|---|
| `--sidebar-gradient-start` | `#1e40af` | `#1f2937` |
| `--sidebar-gradient-end` | `#1e3a8a` | `#111827` |
| `--sidebar-active-border` | `#fbbf24` | `var(--primary)` |
| `--dashboard-gv-title` | `#1e40af` | `var(--text-dark)` |
| `--dashboard-qtv-title` | `#1e40af` | `var(--text-dark)` |
| `--dashboard-hv-title` | `#1e293b` | `var(--text-dark)` |

**Nền / Surface / Border / Text (giữ nguyên)**
| Nhóm | Token | Giá trị |
|---|---|---|
| Background | `--bg-main` / `--bg-card` / `--bg-sidebar` | `#f9fafb` / `#ffffff` / `#111827` |
| Surface (CP) | `--cp-surface` / `--cp-bg` | `#ffffff` / `#f4f5fb` |
| Border | `--border-color` / `--border-light` / `--cp-border` | `#e5e7eb` / `#f3f4f6` / `#e2e5f1` |
| Text | `--text-main` / `--text-muted` / `--text-light` / `--text-dark` | `#111827` / `#6b7280` / `#9ca3af` / `#181d38` |

### 5.2 Radius / Shadow / Spacing / Transition / Z-index
- Radius: `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`.
- Shadow: `--shadow-sm`, `--shadow-md`, `--shadow-lg` (đã định nghĩa).
- Spacing: hệ **base-8** (8/16/24/32px). Bootstrap: `p-2`(8) `p-3`(16) `p-4`(24) `p-5`(48). Vùng nội dung chính KHÔNG dùng padding < 16px.
- Transition: `--transition-fast: .2s`, `--transition-normal: .3s`, `--transition-slow: .5s`.
- Z-index thang chuẩn: dropdown 1000, sticky header 1020, backdrop 1040, modal 1050, toast 1080.

### 5.3 Nếu thiếu token
Thêm biến mới vào `variables.css` (theo hướng dẫn trong `CSS_ARCHITECTURE.md`), KHÔNG hardcode rải rác.

---

## 6. Component Guidelines

Áp dụng bằng class Bootstrap + CSS `.cp-*` + token. State BẮT BUỘC ở mục 8.

### 6.1 Typography
- Font: `--font-main` (`'Inter','Roboto','Nunito',sans-serif`). Font đã cấu hình sẵn — **KHÔNG thêm `@import` Google Fonts trong CSS**; nếu cần font mới, ưu tiên `preconnect`/self-host trong `index.html`.
- Thang cỡ chữ:

| Vai trò | Bootstrap/CSS | Dùng ở |
|---|---|---|
| Page title | `fs-4 fw-bold` (text-dark) | Tiêu đề trang |
| Section heading | `fs-5 fw-semibold` | Tiêu đề khối |
| Card title | `fs-6 fw-semibold` | Tên bài học/bài tập |
| Body | `fs-6` + `lh-base`/`lh-lg`, màu `--text-muted` | Mô tả, đoạn văn |
| Caption | `small` (text-light) | Timestamp, ghi chú |

- Nội dung học tập dài **BẮT BUỘC** `line-height ≥ 1.6` (`lh-lg`).
- **KHÔNG** dùng cỡ ≥ `fs-5` cho body. **KHÔNG** quá 3 font-weight trên 1 màn hình.

### 6.2 Buttons
- Primary: nền `--primary`, chữ trắng, hover `--primary-hover`, `border-radius: var(--radius-md)`, padding `.625rem 1rem`.
- Secondary/ghost: viền `--border-color`, chữ `--text-main`, hover nền `--border-light`.
- Nút AI: gradient brand→info + icon (Sparkles/`fa-wand-magic-sparkles`).
- Loading: hiện spinner + `disabled`, `opacity .7`, `cursor: not-allowed`.

### 6.3 Modal / Dialog
- Backdrop: `--bg-sidebar` alpha ~40% + `backdrop-filter: blur(4px)`.
- Khung: `--bg-card`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-lg)`, `max-width` hợp lý.
- Header padding 24px, tiêu đề `fs-5 fw-bold`; nút X tròn hover nền `--border-light`.
- Footer: nút Cancel (ghost) + Confirm (primary), `gap: 12px`, căn phải.
- **BẮT BUỘC** focus trap + Esc đóng + trả focus về nút mở (mục 9).

### 6.4 Table (GV/QTV)
- Bọc trong card: `--bg-card`, `border-radius: var(--radius-lg)`, `--shadow-sm`, `overflow: hidden`.
- `thead`: nền `--bg-main`, chữ `--text-muted` uppercase nhỏ.
- Row hover nền `--bg-main`, kẻ dưới `--border-light`.
- Mobile: **BẮT BUỘC** bọc `overflow-x: auto`, KHÔNG nén cột.

### 6.5 Card (khóa học / bài tập)
- `--bg-card`, viền `--border-color`, `--radius-lg`, `--shadow-sm`, padding 20–24px.
- Nếu click được: `cursor: pointer`, hover `--shadow-md` + viền `--primary`.
- Badge: pill `border-radius: 999px`, nền nhạt của màu semantic tương ứng.

### 6.6 Form / Input
- Label: nhỏ, `--text-muted`.
- Input: nền trắng, viền `--border-color`, `--radius-md`, padding `.625rem 1rem`.
- Focus: viền `--primary` + ring mờ (`box-shadow: 0 0 0 4px rgba(246,144,80,.12)`).
- Lỗi: viền `--danger` + text `--danger` NGAY DƯỚI input, liên kết `aria-describedby`.

### 6.7 AI Chat
- Bubble AI: nền nhạt brand/tím, `border-radius: var(--radius-lg)` bo lệch góc trên-trái.
- Bubble User: nền `--border-light`, bo lệch góc trên-phải.
- Code block: nền tối (`#0f172a`), `font-mono`, nút Copy góc phải, `overflow-x: auto`.

### 6.8 Code Workspace
- Monaco: bọc viền `--border-color` + `--radius-md`, `overflow: hidden`.
- Terminal kết quả: nền `#0b1120`, chữ mono sáng, header có 3 chấm tròn trang trí.

### 6.9 Feedback
- **TUYỆT ĐỐI CẤM** `window.alert()` và `window.confirm()`. Dùng SweetAlert2 (cấu hình bo góc `--radius-lg`, font `--font-main`) hoặc modal mục 6.3.
- Loading trang: dùng **Skeleton** mô phỏng hình dạng thật, KHÔNG chỉ spinner.
- Progress bar: `border-radius: 999px`, nền `--border-light`, lõi `--success`/`--primary`, transition mượt.

---

## 7. Responsive

Breakpoint Bootstrap: `sm 576`, `md 768`, `lg 992`, `xl 1200`. Kiểm tra thực tế ở **375 / 768 / 1024 / 1440px**.

- **Sidebar**: desktop cố định; tablet thu icon-only; mobile ẩn → hamburger mở drawer.
- **Main content**: `flex-1`, padding tăng dần `p-3` (mobile) → `p-4` → `p-5`.
- **Card grid**: `row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4` + `g-4`.
- **Container**: giới hạn bề rộng (`max-width` ~1280px, căn giữa) chống kéo giãn.
- **Modal mobile**: cân nhắc bottom-sheet (trượt từ dưới) khi `< md`.
- **Table mobile**: `overflow-x: auto`.
- Nội dung dài (tên khóa học, email): `text-truncate` hoặc wrap có kiểm soát, KHÔNG tràn layout.

---

## 8. Trạng thái UI (BẮT BUỘC xử lý đủ)

Mỗi component có dữ liệu/tương tác phải xử lý: **default, hover, focus, active, disabled, loading, skeleton, empty, error, success, không có quyền, timeout/mất kết nối, dữ liệu quá dài, responsive mobile.**

- Empty: icon + câu mô tả + (nếu hợp lý) nút hành động, KHÔNG để trắng.
- Error: thông báo rõ + nút thử lại; KHÔNG nuốt lỗi im lặng.
- Không có quyền: hiển thị trạng thái 403 thân thiện, KHÔNG vỡ layout.

### AI Chat — state bổ sung BẮT BUỘC
AI đang suy nghĩ • streaming response • dừng sinh (nút Stop) • thử lại • sao chép kết quả • phản hồi thất bại • code block dài (scroll + copy) • mất kết nối.

---

## 9. Accessibility (a11y)

- Contrast text thường **≥ 4.5:1**. Lưu ý: cam `#f69050` trên nền trắng KHÔNG đạt cho chữ nhỏ → dùng `--primary-dark`/`--text-main` cho text, giữ cam cho nền/nút lớn.
- **KHÔNG** chỉ dùng màu để thể hiện trạng thái (kèm icon/text).
- Icon-button **BẮT BUỘC** `aria-label`.
- Form error liên kết `aria-describedby`; mọi input có `<label>`.
- Modal: focus trap; đóng → trả focus về nút mở.
- Bàn phím: Tab/Shift+Tab/Enter/Space/Escape hoạt động; focus state nhìn rõ (KHÔNG `outline: none` trần).
- Ảnh mang nội dung có `alt` phù hợp; ảnh trang trí `alt=""`.

---

## 10. Performance

Chú ý đặc biệt: Monaco Editor, Recharts, AI Chat, trang quản trị.

- **BẮT BUỘC** lazy-load module nặng (Monaco, chart, trang admit lớn) qua `React.lazy`/dynamic import.
- **KHÔNG** import toàn bộ thư viện icon; chỉ import icon cần dùng.
- Tránh re-render thừa; **KHÔNG** `memo` máy móc — chỉ khi đo được lợi ích.
- Tránh layout shift (đặt kích thước ảnh/skeleton).
- Ưu tiên animate bằng `transform`/`opacity`.
- Kiểm tra bundle trước/sau khi sửa; chạy Lighthouse (hoặc tương đương) khi đổi lớn.
- **KHÔNG** thêm thư viện mới nếu chức năng hiện có đã đáp ứng.

### Animation
- Hover/focus: 120–180ms. Modal/Drawer/Dropdown: 180–250ms.
- **KHÔNG** dùng `transition: all` khi không cần.
- Chỉ animate khi giúp hiểu trạng thái/chuyển cảnh; KHÔNG gây mất tập trung.
- **BẮT BUỘC** hỗ trợ `@media (prefers-reduced-motion: reduce)`.

---

## 11. Danh sách Skill

> Chỉ liệt kê skill có thật trong môi trường. KHÔNG chạy tất cả trong 1 lần.

### 11.1 Skill BẮT BUỘC (mọi màn hình)
| Skill | Mục đích |
|---|---|
| `redesign-existing-projects` | Cải tạo UI có sẵn, không viết mới |
| `uxui-principles` | Bố cục, luồng, đặt hành động |
| `web-design-guidelines` | Spacing, typography, phân cấp |
| `react-ui-patterns` | Mẫu component React |

### 11.2 Skill dùng THEO TRƯỜNG HỢP
| Skill | Dùng CHỈ KHI |
|---|---|
| `high-end-visual-design` | Cần tinh chỉnh thẩm mỹ cao cấp |
| `dataviz` | Màn hình có chart/dashboard (recharts) |
| `magic-animator` | Cần thêm chuyển động có mục đích |
| `theme-factory` / `ui-tokens` | Chuẩn hóa/mở rộng token |
| `shadcn` / `tailwind-*` | **KHÔNG dùng** (khác stack) — chỉ tham khảo ý tưởng |

### 11.3 Skill KIỂM TRA CHẤT LƯỢNG (trước khi chốt)
| Skill | Mục đích |
|---|---|
| `ui-review` | Review giao diện |
| `ui-visual-validator` | Xác nhận hiển thị bằng browser |
| `fixing-accessibility` | Dọn lỗi a11y |
| `webapp-testing` | Kiểm thử luồng thực tế |

---

## 12. Quy trình áp dụng (mỗi màn hình)

1. Đọc code, xác định chức năng hiện tại.
2. Xác định hành động người dùng quan trọng nhất trên màn hình.
3. Audit UI/UX hiện tại (điểm yếu cụ thể).
4. Đề xuất layout mới (bám token + Bootstrap).
5. Kiểm tra component/CSS có thể tái sử dụng.
6. Thực hiện thay đổi nhỏ, có kiểm soát.
7. Chạy `npm run build` + type-check (`tsc -b`).
8. Kiểm tra responsive (375/768/1024/1440).
9. Kiểm tra accessibility (bàn phím, contrast, aria).
10. Kiểm tra trực quan trên browser.
11. So sánh trước/sau.
12. Báo cáo file đã sửa + lý do thay đổi.

---

## 13. Tiêu chí HOÀN THÀNH

Màn hình chỉ HOÀN THÀNH khi ĐỦ tất cả:

- [ ] `npm run build` thành công.
- [ ] Không có TypeScript error.
- [ ] Không có lỗi console.
- [ ] Không phá vỡ chức năng hiện tại.
- [ ] Không thay đổi API ngoài phạm vi.
- [ ] Hiển thị đúng ở 375 / 768 / 1024 / 1440px.
- [ ] Có đủ loading, skeleton, empty, error state.
- [ ] Điều khiển được bằng bàn phím, focus state rõ.
- [ ] Không có text/button/table/modal bị tràn.
- [ ] Không dùng `window.alert()` / `window.confirm()`.
- [ ] Không trộn nhiều bộ icon mới trong 1 component.
- [ ] Không hardcode token đã chuẩn hóa (dùng `var(--...)`).
- [ ] Có báo cáo trước/sau.

---

## 14. Checklist kiểm tra nhanh (trước commit)

- [ ] Chỉ dùng Bootstrap + CSS var, KHÔNG có class Tailwind (`bg-slate-*`, `rounded-2xl`...).
- [ ] Brand color = cam `--primary`, KHÔNG hardcode `#f69050` rải rác.
- [ ] Không cài/gỡ package ngoài kế hoạch.
- [ ] `variables.css` là nguồn token duy nhất.
- [ ] Đủ state ở mục 8 (AI Chat đủ state streaming/stop/retry/copy).
- [ ] a11y mục 9 pass; `prefers-reduced-motion` được tôn trọng.
- [ ] Module nặng (Monaco/chart) lazy-load.
