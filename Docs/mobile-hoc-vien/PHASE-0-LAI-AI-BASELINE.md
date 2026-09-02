# Phase 0 — Baseline AI & Engagement (Lai)

> Ngày kiểm kê: 2026-08-13  
> Phạm vi: `educodeai-mobile/src/features/ai-engagement` và route liên quan  
> Nguyên tắc: backend là nguồn nghiệp vụ; web service/page là bằng chứng contract; mobile chỉ tạo adapter/UI.

## 1. Tổ chức file hiện tại

| Khu vực | File | Trạng thái |
|---|---|---|
| Route | `src/app/thu-thach.tsx` | Route mỏng, re-export screen |
| Route | `src/app/phong-van-do-an.tsx` | Route mỏng, nhận `sessionId` qua search params |
| Screen | `features/ai-engagement/screens/thu-thach.screen.tsx` | Có UI nhiệm vụ; BXH còn placeholder; chưa render danh hiệu |
| Screen | `features/ai-engagement/screens/phong-van-do-an.screen.tsx` | Prototype; gọi sai endpoint tải dữ liệu và chấm điểm random |
| Component | `features/ai-engagement/components/chat-bot.tsx` | Có history/Markdown/loading; chưa gắn vào route/shell hiện có |
| Service | `features/ai-engagement/services/tro-ly-ai.service.ts` | Contract payload gần đúng; URL đang bị lặp `/api` |
| Service | `features/ai-engagement/services/thu-thach.service.ts` | Endpoint và response shape lệch backend hiện tại |
| Service | `features/ai-engagement/services/phong-van-ai.service.ts` | Endpoint tương đối đúng; thiếu unwrap envelope và thiếu field response |
| Service | `features/ai-engagement/services/ai-roadmap.service.ts` | Endpoint/payload chính đúng; URL lặp `/api`, timeout và parse validation chưa tương đương web |
| Shared API | `src/shared/configs/api.ts` | `baseURL = BASE_URL + '/api'`, hard-code IP; response trả AxiosResponse |
| Auth | `features/auth/context/AuthContext.tsx` | Public state có `user`, `token`, `isLoading`, `login`, `logout`, `checkAuth`; chưa thấy provider/root layout |

### Route hiện hữu

- `/thu-thach`
- `/phong-van-do-an?sessionId=...`

Chưa có route native cho chatbot độc lập, phỏng vấn AI độc lập, lộ trình AI, sinh đồ án hoặc chứng chỉ. `src/app` cũng chưa có `_layout.tsx`, vì vậy app shell/AuthProvider chưa được chứng minh trong source hiện tại.

## 2. Contract đã xác minh

### 2.1 Chatbot học tập

**Backend canonical**

- `POST /api/ChatBotAI/tu-van-hoc-tap`
- Request: `LichSuChat`, `MaBaiHoc?`, `TieuDeBaiHoc?`, `NoiDungBaiHoc?`, `ThoiGianVideo?`.
- Response trực tiếp: `{ cauTraLoi: string }`.
- `LichSuChat` không được rỗng.

**Mobile hiện tại**

- Type mới có `LichSuChat`, `TieuDeBaiHoc`, `NoiDungBaiHoc`; thiếu hai field optional nhưng không cản contract hiện tại.
- `api` đã có base path `/api`, nhưng service gọi `/api/ChatBotAI/...`; URL thực tế thành `/api/api/ChatBotAI/...`.

**Kết luận:** endpoint/controller/DTO VERIFIED; mobile URL cần sửa ở Phase 2.

### 2.2 Thử thách, danh hiệu, bảng xếp hạng

**Backend canonical**

- `GET /api/hoc-vien/thu-thach/tuan` → envelope `{ success, data }`.
- `POST /api/hoc-vien/thu-thach/nhan-thuong/{maMau}` → envelope `{ success, data, message }`.
- `PUT /api/hoc-vien/thu-thach/danh-hieu/{maDanhHieu}` → envelope `{ success, data, message }`.
- `GET /api/hoc-vien/thu-thach/bang-xep-hang?top=20` → envelope `{ success, data }`.
- `GET /api/hoc-vien/thu-thach/bang-xep-hang/toan-web?top=50` cũng tồn tại.

**Mobile hiện tại bị lệch**

- Đang gọi `/api/ThuThach/tuan-hien-tai`, `/nhan-thuong-nhiem-vu`, `/doi-danh-hieu`, `/bang-xep-hang`.
- HTTP method đổi danh hiệu đang là POST thay vì PUT.
- Claim đang gửi body `{ maMau }` thay vì path param.
- Mobile đọc trực tiếp `res.data.danhSachNhiemVu`, nhưng backend trả `res.data.data.danhSachNhiemVu` với Axios mặc định.
- Type leaderboard mobile (`topUsers/currentUser`) không khớp canonical (`danhSach`, `hangCuaToi`, `expCuaToi`, metadata thời gian).
- Web đã có mapper camelCase/PascalCase đầy đủ và là pattern nên port, không viết mapper mới theo phỏng đoán.

**Kết luận:** backend/web contract VERIFIED; toàn bộ adapter thử thách mobile cần sửa ở Phase 3.

### 2.3 Phỏng vấn AI độc lập

**Backend canonical**

- `POST /api/PhongVanAI/start` → envelope `{ success, data }`.
- `POST /api/PhongVanAI/answer` → envelope `{ success, data }`.
- `POST /api/PhongVanAI/end/{maPhongVan}` → envelope `{ success, data }`.
- `GET /api/PhongVanAI/history` → envelope `{ success, data }`.
- Ngoài ra có `GET /api/PhongVanAI/{maPhongVan}` và `PUT /api/PhongVanAI/{maPhongVan}/note`.

**Request/response VERIFIED**

- Start request: `viTriUngTuyen`, `capDo`, `tinhCachAI`, `soLuongCauHoi`.
- Answer request: `maPhongVan`, `cauTraLoi`.
- Answer response còn có `tinNhanAI`; mobile đang thiếu field này.
- End response còn có `diemManh`, `canCaiThien`, `loiKhuyen`; mobile đang thiếu.

**Mobile hiện tại**

- Vì shared `api.baseURL` đã kết thúc bằng `/api`, các path `/PhongVanAI/...` tạo URL đúng.
- Service trả `response.data`, hiện đó là envelope chứ không phải payload typed; cần port `unwrapResponse` từ web.

**Kết luận:** endpoint/DTO VERIFIED; adapter unwrap/type cần sửa ở Phase 4.

### 2.4 Phỏng vấn đồ án

**Backend canonical**

- Session được tạo bởi `POST /api/SinhDoAnAI/nop-do-an`, trả `sessionId` và `cauHoiDauTien`.
- Trả lời: `POST /api/SinhDoAnAI/tra-loi-phong-van` với `sessionId`, `soCauHienTai`, `cauTraLoi`.
- Kết quả: `GET /api/SinhDoAnAI/ket-qua?sessionId=...`.

**Mobile hiện tại là prototype sai contract**

- Gọi `GET /SinhDoAnAI/result/{sessionId}` — backend không có endpoint này.
- Không nhận `cauHoiDauTien` từ flow nộp đồ án.
- Nút mic không ghi âm thật; chỉ bật timer.
- Dùng `setTimeout` và điểm random 7–9; không gọi API trả lời/kết quả.

**Kết luận:** không được xem là Done; Phase 4 phải thay prototype bằng API thật. Audio/mic vẫn VERIFY vì product chưa chốt text/audio/video.

### 2.5 Lộ trình AI

**Backend canonical**

- `POST /api/lo-trinh-ai/them`.
- `PUT /api/lo-trinh-ai/cap-nhat`.
- `POST /api/lo-trinh-ai/xac-nhan/{maLoTrinh}`.
- `GET /api/lo-trinh-ai/lay-tat-ca-lo-trinh`.
- `GET /api/lo-trinh-ai/chi-tiet/{maLoTrinh}`.

Payload tạo lộ trình mobile khớp DTO backend: `trinhDoHienTai`, `phongCachHoc`, `mucTieuNgheNghiep`, `thoiGianHocDuKien`, `thoiGianMoiTuan`, `kienThucHienCo`, `kinhNghiemThucTe`, `khoKhanHienTai`.

**Mobile hiện tại**

- Shared base path đã có `/api`, nhưng các path service lại bắt đầu `/api/lo-trinh-ai`; URL bị lặp `/api/api/...`.
- Mobile mới có create/list/detail; chưa có update/confirm.
- Create chưa dùng timeout 120 giây như web và parse JSON chưa có validation/catch đầy đủ.

**Kết luận:** endpoint/payload VERIFIED; response JSON chi tiết vẫn cần test API thật ở Phase 5.

## 3. Public integration contract hiện có

### Auth có thể sử dụng

`AuthContext` hiện công khai:

- `user`
- `token`
- `isLoading`
- `login(token, user)`
- `logout()`
- `checkAuth()`

Tuy nhiên chưa có root `_layout.tsx` hoặc chỗ mount `AuthProvider`, nên việc tích hợp runtime là **VERIFY/phụ thuộc owner Auth**. AI module không được tự xây auth flow mới.

### Learning/course context

Chatbot hiện nhận qua props:

- `courseId?`
- `courseName?`
- `tieuDeBaiHoc?`
- `noiDungBaiHoc?`

`courseId` hiện chưa được đưa vào request, backend chatbot canonical nhận `MaBaiHoc?` chứ không phải course ID. Contract lesson context với Learning chưa tồn tại, cần thống nhất trước khi gắn chatbot vào player.

### Route params đề xuất giữ ổn định

- `/thu-thach`: không param.
- `/phong-van-do-an`: bắt buộc `sessionId`; cần thêm `cauHoiDauTien`/`tenDoAn` qua public state hoặc storage contract khi owner flow sinh đồ án được triển khai.
- Các route roadmap/interview chưa tồn tại: để Phase tương ứng tạo wrapper mỏng, không đặt logic vào `src/app`.

## 4. VERIFY còn lại

1. Base URL môi trường Expo và thiết bị test thực tế; hiện hard-code `192.168.2.10:5000`.
2. Cách AuthProvider/root navigator sẽ được owner Auth mount và cách interceptor thông báo logout khi 401.
3. Contract lesson ID/course context từ Learning sang chatbot.
4. Phỏng vấn AI hỗ trợ text, audio hay video; chưa được phép thêm dependency/permission mic-camera.
5. Response thực tế của lộ trình AI từ môi trường chạy, đặc biệt `noiDungJSON` malformed/empty.
6. Route khởi tạo sinh đồ án/nộp đồ án trên native chưa tồn tại, nên nguồn `sessionId`/câu hỏi đầu tiên chưa có.
7. Chứng chỉ phụ thuộc Learning và chưa thuộc Phase 0 implementation.

## 5. Baseline quality

- Đã cài đúng dependency theo lockfile bằng `npm ci`: **thành công**.
- `npm run lint`: **thành công, exit code 0**, hiện có 11 warnings và không có error:
  - `chat-bot.tsx`: 4 warnings (unused import/biến và dependency của hook).
  - `phong-van-do-an.screen.tsx`: 3 warnings (unused constant/biến và dependency của hook).
  - `thu-thach.screen.tsx`: 3 warnings (unused imports/biến).
  - `shared/configs/api.ts`: 1 warning về cách gọi `axios.create`.
- TypeScript strict check bằng compiler local và `--noEmit`: **thành công, exit code 0**.
- `npm ci` báo 34 dependency vulnerabilities (12 moderate, 21 high, 1 critical). Không chạy `npm audit fix --force` vì có thể tạo breaking changes; cần audit riêng thay vì tự động thay dependency trong Phase 0.
- Baseline runtime Android chưa chạy vì chưa có emulator/thiết bị và backend test được xác nhận trong phiên này; không tuyên bố runtime pass.

## 6. Exit criteria Phase 0

- [x] Kiểm kê route/screen/component/service hiện có.
- [x] Nhận diện prototype/mock và contract lệch.
- [x] Đối chiếu chatbot với controller/DTO.
- [x] Đối chiếu thử thách với web service/controller.
- [x] Đối chiếu phỏng vấn AI và phỏng vấn đồ án với web/controller/DTO.
- [x] Đối chiếu roadmap với web/controller/DTO.
- [x] Xác định public Auth/Learning dependencies và mục VERIFY.
- [x] Cài dependency lockfile và ghi kết quả lint/typecheck cuối cùng.
- [ ] Chạy app Android/emulator khi môi trường thiết bị sẵn sàng.

## 7. Kết luận Phase 0

Phase 0 về **source inventory, contract verification và static quality baseline đã hoàn tất**. Module đủ thông tin để chuyển sang Phase 1 mà không đoán endpoint. Runtime device là bước kiểm chứng môi trường còn mở và phải thực hiện trước khi tuyên bố toàn module chạy end-to-end.
