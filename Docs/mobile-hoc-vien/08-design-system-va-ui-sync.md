# Design system và đồng bộ UI mobile–web

> **Trạng thái:** Canonical. Mọi module phải dùng tài liệu này trước khi tạo màn hình hoặc component.

## 1. Nguyên tắc UX

- Mobile giữ nhận diện EduCodeAI của web, nhưng bố cục phải native và dễ thao tác một tay.
- Ưu tiên đọc nhanh, tiếp tục học và phản hồi trạng thái rõ ràng; không biến màn hình nghiệp vụ thành landing page.
- Không tự chọn màu, icon, radius hoặc shadow riêng theo module.
- UI mới phải có loading, empty, error, disabled, success và permission/locked nếu nghiệp vụ có trạng thái đó.

## 2. Source of truth web

- Token: `educodeai-client/src/assets/styles/variables.css`.
- Quy tắc component học viên: `educodeai-client/src/assets/styles/hoc-vien-global.css`.
- Icon web: Bootstrap Icons được import tại `educodeai-client/src/main.tsx`; một số page dùng Font Awesome.
- UX từng màn hình: page tương ứng trong `educodeai-client/src/pages/hoc-vien`.

## 3. Design tokens native

### Màu

| Token native | Giá trị | Nguồn web |
|---|---:|---|
| `primary` | `#F69050` | `--primary` |
| `primaryPressed` | `#E67E22` | `--primary-hover` |
| `primaryDark` | `#D97706` | `--primary-dark` |
| `primarySoft` | `#FEF3EC` | `--primary-soft` |
| `aiAccent` | `#8B5CF6` | `--ai-accent` |
| `aiAccentPressed` | `#7C3AED` | `--ai-accent-hover` |
| `aiAccentSoft` | `#F3EFFE` | `--ai-accent-soft` |
| `success` | `#10B981` | `--success` |
| `danger` | `#EF4444` | `--danger` |
| `warning` | `#F59E0B` | `--warning` |
| `info` | `#0EA5E9` | `--info` |
| `background` | `#F9FAFB` | `--bg-main` |
| `surface` | `#FFFFFF` | `--bg-card` |
| `text` | `#111827` | `--text-main` |
| `textMuted` | `#6B7280` | `--text-muted` |
| `border` | `#E5E7EB` | `--border-color` |

Không dùng `#fb873f` từ inline style cũ làm token mới; canonical hiện tại là `#f69050` trong `variables.css`.

### Typography và density

- Font ưu tiên: Inter; fallback Roboto/system nếu chưa đóng gói font.
- Weight: 400, 500, 600, 700; không lạm dụng 800.
- Scale khuyến nghị: caption 12, body 14/16, subtitle 18, title 22/24, display 28–32.
- Touch target tối thiểu 44×44; body line-height khoảng 1.4–1.6.

### Spacing, radius, elevation

- Spacing scale: 4, 8, 12, 16, 20, 24, 32.
- Radius: 6, 10, 16 tương ứng `radiusSm/Medium/Large`.
- Card dùng border nhẹ hoặc shadow nhỏ; không dùng glow/gradient trang trí tùy ý.
- Motion 150–300ms. Tái sử dụng `Mobile/src/components/animated-pressable.tsx` cho press feedback phù hợp.

## 4. Icon

- Native dùng `@expo/vector-icons` đã có trong package; ưu tiên `BootstrapIcons` nếu package hỗ trợ bộ tương ứng, nếu không dùng Ionicons với bảng mapping cố định.
- Giữ cùng **ngữ nghĩa** với web: house → Home, book/play → học, person → tài khoản, star → đánh giá, shield/device → bảo mật.
- Không dùng emoji làm icon chức năng; không trộn nhiều icon family trong cùng màn hình.
- Icon mặc định 20–24; icon trong touch target vẫn phải đạt 44×44.

## 5. Component vocabulary dùng chung

- `AppScreen`, `AppHeader`, `BottomTabs`.
- `PrimaryButton`, `SecondaryButton`, `IconButton`, `AnimatedPressable`.
- `AppTextField`, `PasswordField`, `OtpField`.
- `CourseCard`, `ProgressBar`, `RatingStars`.
- `SectionCard`, `ListRow`, `Badge`, `BottomSheet/Modal`.
- `LoadingState/Skeleton`, `EmptyState`, `ErrorState`, `LockedState`.

Trước khi tạo component mới, tìm component tương đương trong `Mobile/src/components` và feature module.

## 6. Screen patterns

- **Danh sách:** header → search/filter → list/card → empty/error.
- **Chi tiết:** media → thông tin chính → sections → CTA cố định an toàn với safe area.
- **Course player:** header gọn → nội dung → previous/next; chapter list ở màn hình/sheet riêng.
- **Form/Auth:** một cột, lỗi sát field, CTA không bị bàn phím che.
- **AI:** dùng accent tím chỉ để nhận diện AI; CTA chính toàn app vẫn dùng cam.

## 7. Responsive và platform

- Hỗ trợ tối thiểu 320–430px và tablet; không hard-code chiều rộng card.
- Dùng SafeAreaView/insets, KeyboardAvoidingView và scroll có chủ đích.
- Landscape chủ yếu cho video; thoát landscape phải giữ đúng bài/vị trí.
- Text dài phải wrap hoặc truncate có chủ đích; không thu nhỏ chữ để né overflow.

## 8. Checklist review UI

- [ ] Màu đến từ token, không hard-code màu tùy ý.
- [ ] Icon cùng family/ngữ nghĩa với web, không dùng emoji.
- [ ] Typography, spacing và radius theo scale chung.
- [ ] Có loading, empty, error, disabled và retry phù hợp.
- [ ] Touch target ≥44×44, safe area và keyboard hoạt động.
- [ ] Không copy sidebar/modal desktop nguyên xi.
- [ ] Không có gradient/glass/animation trang trí không tồn tại trong web.
- [ ] So sánh trực tiếp với page web tương ứng trước khi đánh dấu Done.
