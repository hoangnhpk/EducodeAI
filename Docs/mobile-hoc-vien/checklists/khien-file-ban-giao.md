# Bàn giao module Discovery & Commerce (Khiến)

> Trạng thái: code hoàn chỉnh, typecheck + lint + bundle pass. Đã smoke-test live trên **điện thoại thật (Expo Go)** với backend local port 5000 — Home/tìm kiếm/lọc/chi tiết/ảnh chạy tốt; endpoint cần token và flow QR thật còn chờ Auth (Âu). Xem mục 5–6.
>
> Cập nhật 13/08: Home dựng đủ theo web TrangChu (hero, stats, hệ sinh thái AI, chủ đề, giảng viên tiêu biểu, đánh giá); lưới khóa học 2 cột; chip chủ đề sinh động từ `linhVuc` thật (marquee tự cuộn); bộ lọc Home→Khám phá truyền qua `course-filter-bus` (params của Tabs không tin cậy); nút Học thử ở chi tiết khóa.

## 1. Routes public (Expo Router)

| Route | Màn hình | Params |
|---|---|---|
| `/home` (tab) | Home — học tiếp + khám phá | — |
| `/courses` (tab) | Danh sách + tìm kiếm (debounce 500ms) | — |
| `/my-learning` (tab) | Khóa đã mua + tiến độ | — |
| `/course/[courseId]` | Chi tiết khóa + CTA theo trạng thái | `courseId: string` (số) |
| `/course/[courseId]/checkout` | Mua: QR / voucher / quà tặng / hỗ trợ | `courseId: string` |
| `/gifts/redeem` | Nhập mã quà tặng | — |
| `/gifts/history` | Lịch sử mã quà tặng | — |

**Contract cho Learning (Khôi):** Discovery điều hướng `router.push('/learn/[courseId]')` với `courseId` dạng chuỗi số khi user đã sở hữu (`khoaHocDaDangKy` / `daMua` / thanh toán thành công). Ngoài ra nút **Học thử** (khóa trả phí chưa mua, giống web) điều hướng `/learn/[courseId]?hocThu=1` — backend tự trả chế độ học thử (`laCheDoHocThu`, mở N video đầu) khi user chưa sở hữu, param `hocThu` chỉ mang tính gợi ý UI. Khôi cần tạo route `/learn/[courseId]`.

**Contract cho Auth (Âu):** `src/app/index.tsx` hiện redirect tạm về `/home` — thay bằng splash/auth bootstrap. Tab layout `src/app/(tabs)/_layout.tsx` mới có 3 tab của Khiến, Âu thêm tab Tài khoản.

## 2. Nơi code

```text
educodeai-mobile/src/features/discovery/
  types/index.ts        # DTO copy từ contract web (không invent field)
  services/             # discovery-home | my-courses | course-detail | commerce + media-url
  components/           # course-card, state-views, voucher-sheet, payment-support-modal
  hooks/                # use-debounce, use-payment-polling
  screens/              # home, courses, my-learning, course-detail, checkout, gift-redeem, gift-history
  utils/format-gia.ts   # port format-gia-khoa-hoc của web (không dùng Intl)
  index.ts              # public API + suyRaOwnership()

educodeai-mobile/src/shared/theme/tokens.ts  # design tokens theo docs 08 (#F69050)
```

## 3. Endpoint dùng (đã đối chiếu contract web; smoke-test live xem mục 6)

Path native **không có prefix `/api`** vì `shared/configs/api.ts` đã set `baseURL = BASE_URL + '/api'` (tránh double `/api` — module ai-engagement cũ đang bị lỗi này).

- `GET /KhoaHoc/all?search=&maGiangVien=`
- `GET /hocvien/chitietkhoahoc/danh-gia-trang-chu?soLuong=10` · `.../giang-vien-tieu-bieu?soLuong=4`
- `GET /hocvien/khoa-hoc-da-mua`
- `GET /hocvien/chitietkhoahoc/{id}` · `.../{id}/danh-gia` · `POST .../dang-ky`
- `GET /hocvien/thanh-toan-khoa-hoc/{maKhoaHoc}`
- `POST .../mua-ngay` · `.../tao-ma-qr` · `.../tao-ma-qua-tang`
- `GET .../kiem-tra-trang-thai/{maDonHang}` · `.../kiem-tra-trang-thai-ma-qua-tang/{maDonHang}`
- `POST .../nhap-ma-qua-tang` · `GET .../lich-su-ma-qua-tang`
- `POST .../{maDonHang}/yeu-cau-ho-tro`

Lưu ý: axios web unwrap `response.data` ở interceptor; native **không** unwrap — mọi adapter đã tự `return res.data`.

## 4. Logic nghiệp vụ đã port từ web

- CTA 4 trạng thái: owned → Học ngay; free → Đăng ký miễn phí (`dang-ky`) hoặc Học miễn phí ngay (`mua-ngay` ở checkout); paid + `choPhepMua` → QR; `!choPhepMua` → disabled + "chưa mở bán".
- Free = `donViTienTe === 'FREE'` hoặc flag `laMienPhi`.
- QR polling 3s, success khi `daMoKhoaHoc || trangThaiDonHang === 'PAID'`; gift polling đến `sanSangSuDung`.
- `usePaymentPolling`: dừng khi thành công/unmount/app background, foreground check lại ngay — khác web (web không pause khi ẩn tab).
- Nút "Báo admin hỗ trợ" mở sau 20s như web; form cần thông tin liên lạc, mô tả tùy chọn.
- Voucher: 1 mã/đơn, uppercase, truyền vào `tao-ma-qr` / `tao-ma-qua-tang`.

## 5. VERIFY còn lại + rủi ro

1. **Ảnh khóa học** — đã xác minh bằng dữ liệu thật, có 3 nhánh (port đúng `getImageUrl` của web vào `media-url.ts`):
   - URL tuyệt đối (`http...`) → dùng nguyên. OK.
   - `/uploads/khoa-hoc/...` (giảng viên upload thật) → backend serve qua `UseStaticFiles` → mobile load được. Lưu ý: file upload **không commit git**, chỉ tồn tại trên máy đang host backend (192.168.2.10) — chạy backend ở máy khác sẽ 404 ảnh (fallback ảnh mặc định, không crash).
   - Tên file trần (`js-basic.jpg`, 8 khóa seed) → **đã copy** bộ ảnh seed từ `educodeai-client/public/img/` sang `educodeai-server/wwwroot/img/` (13/08) — backend serve trực tiếp, mobile load OK. Web client không ảnh hưởng (vẫn dùng public folder riêng). Nếu nhóm muốn cách khác (CDN/web origin) chỉ cần đổi `WEB_ASSET_BASE` trong `media-url.ts` và xóa folder này.
2. **Test cần token chưa chạy**: matrix owned/paid, QR lifecycle, voucher, gift redeem cần tài khoản học viên đăng nhập → chờ Auth (Âu) hoặc token thủ công. Code path sẵn sàng.
3. `BASE_URL` **tự phát hiện IP máy dev** từ `Constants.expoConfig.hostUri` (máy nào chạy `npx expo start` thì app tự trỏ backend về máy đó, port 5000) — không ai phải sửa IP. Có server chung/deploy thì đặt `EXPO_PUBLIC_API_URL` trong `.env`. Backend chạy `dotnet run --project educodeai-server --urls http://0.0.0.0:5000` (mặc định launchSettings ra port 5210, không khớp). Windows cần mở firewall port 5000 cho điện thoại gọi vào.
4. Store policy (Apple IAP) với thanh toán QR mua nội dung số: cần review trước khi release store; không chặn demo nội bộ.

## 6. Đã verify

- `npx tsc --noEmit` pass, `npx expo lint` 0 error (warning còn lại thuộc module ai-engagement cũ).
- `npx expo export --platform android` bundle thành công (toàn bộ route resolve).
- Smoke-test live (backend local, port 5210):
  - `GET /api/KhoaHoc/all` → 200, 9 khóa (có cả khóa VND lẫn hinhAnh dạng `/uploads/...` và seed).
  - `GET /api/hocvien/chitietkhoahoc/9` → 200, đúng DTO (`khoaHocDaDangKy=false` khi anonymous).
  - `GET .../danh-gia-trang-chu?soLuong=10` → 200, 7 review.
  - `GET .../giang-vien-tieu-bieu?soLuong=4` → 200, 2 giảng viên.
  - `GET /api/hocvien/khoa-hoc-da-mua` → **401** khi chưa token (đúng thiết kế; mobile hiện thông báo phiên hết hạn).
- Test trên điện thoại thật qua Expo Go (13/08, backend port 5000): Home render đủ 8 khối, ảnh khóa học hiện đúng (seed + fallback), tìm kiếm + lọc theo chủ đề/giảng viên hoạt động, chi tiết khóa + CTA đúng trạng thái anonymous, tab Khóa của tôi hiện đúng thông báo cần đăng nhập.
