# Kế hoạch khắc phục quét CCCD trong đăng ký giảng viên

- **Ngày lập:** 2026-07-30
- **Ngày rà soát:** 2026-07-31
- **Phạm vi chính:** quét CCCD hai mặt trong đăng ký giảng viên; OCR offline, QR, MRZ, frontend upload, scan preview và submit cuối.
- **Passport:** tạm thời giữ ở legacy path; không áp dụng policy/status CCCD mới cho đến khi có thiết kế và corpus riêng.
- **Trạng thái tài liệu:** kế hoạch triển khai đã sửa sau audit; mọi ngưỡng định lượng phải được chốt sau baseline và trước production enforcement.
- **Nguyên tắc:** không suy đoán dữ liệu định danh; ưu tiên yêu cầu chụp lại hoặc review hơn chấp nhận dữ liệu sai.

## 1. Mục tiêu, assurance và điều kiện triển khai

### 1.1 Mục tiêu

1. Giảm trường bị bỏ sót khi ảnh hơi nghiêng, thiếu sáng hoặc có nền phức tạp.
2. Giảm ký tự rác và giá trị bị parser gán nhầm.
3. Không tự bịa hoặc tự sửa tên, địa chỉ, quê quán hay số định danh.
4. Phân biệt rõ chất lượng ảnh, kết quả trích xuất, đối chiếu nguồn, xác nhận người dùng và review admin.
5. Backend luôn là nguồn sự thật; không tin cờ xác minh từ trình duyệt.
6. Không làm lộ dữ liệu CCCD trong log, telemetry, response không cần thiết, file tạm hoặc artifact.
7. Giữ tương thích frontend/backend trong toàn bộ rollback window.

### 1.2 Từ vựng assurance bắt buộc

Không dùng `Verified` để mô tả kết quả chỉ dựa trên OCR/QR/MRZ. Các mức assurance phải cụ thể:

- `ExtractedValidated`: candidate đã qua schema/semantic validation.
- `CrossSourceMatched`: các nguồn độc lập cần thiết đồng thuận chính xác.
- `UserConfirmed`: người dùng xác nhận thông tin hiển thị; không phải xác minh danh tính.
- `AdminReviewed`: admin đã review theo checklist.

`OCR confidence`, `QR parsed` hoặc `UserConfirmed` không phải bằng chứng pháp lý về danh tính. Chỉ dùng `IdentityVerified` nếu sau này có quy trình KYC/identity-proofing riêng được đặc tả và phê duyệt.

Comment/claim “QR chính xác 100%” trong implementation phải được xóa. QR chỉ là một nguồn candidate cần parse schema, validation và kiểm tra xung đột.

### 1.3 Công việc được phép bắt đầu ngay

- corpus manifest và baseline;
- characterization/RED regression tests;
- telemetry privacy-safe;
- tách parser/validator thành pure components;
- dependency seams;
- additive API contract design;
- observe-only experiments.

### 1.4 Blocker trước production enforcement

- API compatibility hoàn chỉnh;
- exact identifier matching;
- assurance taxonomy được áp dụng nhất quán;
- Passport được cô lập khỏi policy CCCD mới;
- metric và rollout gates đo được;
- contract/concurrency/security tests pass.

## 2. Hiện trạng và phạm vi mã nguồn

### 2.1 Frontend

- Form: [DangKyGiangVien.tsx](../educodeai-client/src/pages/auth/DangKyGiangVien.tsx)
  - kiểm tra file: khoảng dòng 203-217;
  - scan CCCD: khoảng dòng 377-478;
  - submit cuối: khoảng dòng 532-577.
- API wrapper: `educodeai-client/src/services/auth.service.ts`.

Frontend hiện kiểm tra extension/MIME/dung lượng và gửi file gốc. Trạng thái cục bộ chỉ có `idle | pending | verified | failed`; người dùng có thể bấm xác nhận để chuyển sang `verified`. Vì vậy contract mới phải additive/versioned và triển khai compatibility-first.

### 2.2 Backend

- OCR: [GiayToScanningService.cs](../educodeai-server/Services/Implementation/GiayToScanningService.cs)
  - request/OCR: dòng 65-181;
  - chọn variant: dòng 232-253;
  - preprocessing: dòng 255-333;
  - nhận diện mặt: dòng 337-392;
  - so khớp số hai mặt: dòng 452-465;
  - QR: dòng 468-515;
  - parse field: dòng 532-577;
  - cleanup: dòng 693-762;
  - ngày/MRZ: dòng 764-842.
- Submit cuối và re-scan: `educodeai-server/Services/Implementation/XacThucService.cs`, khoảng dòng 1195-1384.
- Controller: `educodeai-server/Controllers/XacThucController.cs`.
- DTO: `educodeai-server/DTOs/XacThuc/GiayToScanningDto.cs`.

Backend hiện biến phần lớn `ThanhCong == false` thành HTTP 400. Contract mới không được thay đổi ngữ nghĩa này đột ngột khi client cũ còn hoạt động.

## 3. Nguyên nhân đã xác nhận

### P0 - An toàn định danh/toàn vẹn dữ liệu

1. OCR chọn toàn văn bản theo số ký tự nhiều nhất thay vì confidence, validity và đồng thuận.
2. `IsSameId` hiện cho phép số khác 1-2 ký tự; điều này tuyệt đối không được dùng để liên kết hai mặt CCCD.
3. QR parser dùng heuristic; regex `^\\d{9}|\\d{12}$` sai anchoring, phải là `^(?:\\d{9}|\\d{12})$`.
4. Cleanup có rewrite địa phương và phép biến đổi có thể tạo dữ liệu không có trên ảnh.
5. Date validation chưa kiểm tra ngày lịch thực.
6. MRZ chưa kiểm tra check digit.
7. `Verified` hiện có thể bị hiểu cao hơn assurance thực tế.
8. Policy yêu cầu đủ trường chưa phân biệt trường bắt buộc, partial và conflict.

### P1 - Nhận dạng, vận hành và tương thích

1. Không có blur/glare/clipping/skew/perspective/card-size gate.
2. Chưa crop thẻ hoặc hiệu chỉnh phối cảnh.
3. QR chỉ thử ảnh toàn khung.
4. Nhận diện mặt dùng heuristic rộng.
5. Lỗi variant bị nuốt, không có diagnostic code.
6. Giới hạn file chưa giới hạn decoded dimensions/pixel.
7. Service gắn trực tiếp network, filesystem, native OCR, QR decoder và thời gian hệ thống nên khó unit test/deterministic.
8. Passport dùng chung endpoint nhưng cần strategy riêng.

## 4. Contract API tương thích

### 4.1 Nguyên tắc

Contract mới phải additive hoặc versioned. Trong rollback window phải giữ `ThanhCong`, `ThongBao` và mapping client cũ. Không đổi đồng thời response shape, HTTP semantics và frontend state trong một release không có compatibility tests.

### 4.2 Response đề xuất

```text
contractVersion
legacy:
  thanhCong
  thongBao
status
assuranceLevel
failureCode
fields[]
scanReference? 
policyVersion
```

Mỗi field response chỉ chứa projection cần thiết:

```text
name
resolvedValue
state
sourceSummary
confidenceBand
validationCodes[]
```

Không trả toàn bộ candidate/raw OCR cho public client.

### 4.3 Processing status hữu hạn

- `Rejected`: file hoặc loại giấy tờ không hợp lệ.
- `LowQuality`: input không đủ chất lượng.
- `Partial`: đọc được một phần, chưa đủ policy.
- `Conflicting`: các nguồn mâu thuẫn.
- `NeedsConfirmation`: candidate hợp lệ cần người dùng kiểm tra.
- `AcceptedForReview`: đủ điều kiện tiếp tục quy trình; không đồng nghĩa identity verified.

Assurance là trường riêng, không trộn vào processing status.

### 4.4 HTTP semantics

Phải viết ADR và contract tests để chốt. Khuyến nghị additive:

- lỗi giao thức/file không hợp lệ/unauthorized/resource limit: HTTP 4xx phù hợp;
- scan đã xử lý nhưng `LowQuality`, `Partial`, `Conflicting`: có thể HTTP 200 với status rõ ràng ở contract mới;
- client legacy tiếp tục nhận mapping cũ trong rollback window;
- lỗi OCR nội bộ/timeout: HTTP 5xx hoặc 503 với failure code không chứa PII.

### 4.5 Failure taxonomy versioned

Tối thiểu:

```text
IMAGE_DECODE_FAILED
IMAGE_FORMAT_UNSUPPORTED
IMAGE_TOO_LARGE
IMAGE_TOO_BLURRY
IMAGE_TOO_DARK
IMAGE_GLARE_DETECTED
CARD_NOT_FOUND
CARD_CLIPPED
WRONG_SIDE
DUPLICATE_SIDE
UNABLE_TO_ESTABLISH_SAME_DOCUMENT
DOCUMENT_MISMATCH
QR_SCHEMA_INVALID
MRZ_CHECKSUM_INVALID
REQUIRED_FIELD_MISSING
SOURCE_CONFLICT
OCR_TIMEOUT
OCR_UNAVAILABLE
RATE_LIMITED
```

Failure code/metric dimension tuyệt đối không chứa PII hoặc raw text.

## 5. Kiến trúc đích và test seams

```text
Upload
 -> protocol + magic-byte + decoded-dimension validation
 -> orientation normalization
 -> quality/card boundary analysis
 -> crop + perspective correction + deskew
 -> bounded QR/OCR/MRZ adapters
 -> FieldCandidate[]
 -> schema/semantic/source validation
 -> ResolvedField + DecisionEvidence
 -> status + assurance
 -> user confirmation
 -> final server enforcement + scan-reference consistency
```

Tách interfaces/components:

```text
IImageQualityAnalyzer
IDocumentBoundaryDetector
IImagePreprocessor
IOcrEngine
IQrDecoder
ICccdQrParser
IMrzParser
IIdentityFieldResolver
ITessDataProvider
TimeProvider
IScanReferenceStore
```

Parser, validator, scorer, canonicalizer và resolver phải là pure components khi khả thi. Pure unit lane không gọi network/native OCR.

### 5.1 Candidate và resolved value

`FieldCandidate` cần có:

- field name/value;
- source `QR | OCR | MRZ`;
- source location/bounding box nếu có;
- confidence type/value/band;
- engine, traineddata, variant, parser và config version;
- validation codes;
- input/candidate hash phù hợp;
- không persist plaintext nếu không cần.

`ResolvedField` cần có:

- selected candidate/reference;
- canonical value;
- state;
- decision evidence;
- conflict list đã redact;
- policy version.

Manual input không phải OCR candidate và luôn mang `manual/unverified` cho đến khi qua policy riêng.

## 6. Quy tắc an toàn định danh

### 6.1 Exact CCCD matching

Khi hai nguồn/mặt đều có số CCCD hợp lệ, chỉ chấp nhận **exact equality sau canonicalization an toàn**:

- trim;
- loại separator được cho phép;
- kiểm tra chính xác 9 hoặc 12 chữ số theo policy hiện hành.

Tuyệt đối không dùng:

- edit distance;
- cho phép khác 1-2 số;
- transposition tolerance;
- fuzzy match;
- sửa `O/0`, `I/1`, `B/8` rồi dùng làm bằng chứng exact.

Nếu không có exact identifier đủ tin cậy để liên kết khi policy yêu cầu, trả `UNABLE_TO_ESTABLISH_SAME_DOCUMENT`; không kết luận hai mặt cùng giấy tờ.

### 6.2 Conflict rules

- Số QR hợp lệ khác số người dùng nhập: `DOCUMENT_MISMATCH`.
- QR/MRZ/OCR có số hợp lệ khác nhau: `SOURCE_CONFLICT`.
- Date invalid: candidate bị loại, không thay bằng ngày bất kỳ.
- Tên chứa nhiễu: không tự sửa thành tên có vẻ hợp lệ.
- Thiếu địa chỉ: `Partial` nếu policy cho phép; không bịa.
- Không dùng confidence để override exact conflict.

## 7. Passport isolation

### 7.1 Quyết định ngắn hạn

Passport tiếp tục dùng legacy path và không chịu:

- status enforcement CCCD mới;
- CCCD side-classification rules;
- CCCD QR schema;
- CCCD required-field policy;
- scan-reference enforcement mới cho đến khi contract riêng sẵn sàng.

Feature flag/policy dispatch phải tách `CCCD` và `Passport` ngay đầu request. Regression tests đảm bảo thay đổi CCCD không làm đổi Passport legacy behavior.

### 7.2 Điều kiện đưa Passport sang pipeline mới

Phải có tài liệu/corpus riêng cho:

- một hay hai ảnh;
- MRZ TD3 và check digits;
- document number/name/DOB/expiry/nationality;
- side/page rules;
- failure taxonomy;
- metrics/thresholds;
- UX và API contract.

Không tái sử dụng máy móc ngưỡng, parser hoặc policy CCCD.

## 8. Metric definitions và promotion gates

### 8.1 Bảng định nghĩa metric

| Metric | Công thức | Observation unit | Eligible/excluded | Normalization | Positive class | Aggregation |
|---|---|---|---|---|---|---|
| Field exact accuracy | field đúng tuyệt đối / field có ground truth | field | loại field thiếu ground truth/disputed | Unicode + whitespace theo field policy | field đúng | per-field, macro, micro |
| Omission rate | expected field null / expected field | field | loại optional theo policy | không áp dụng | omission | per-field, macro |
| Garbage rate | output có ký tự/sequence bị cấm / output field | field | null tính ở omission | Unicode NFC | garbage | per-field |
| False accept rate | negative sample được `AcceptedForReview` / eligible negative | document pair | loại annotation disputed | policy-versioned | negative/mismatch | per-slice, micro |
| False reject rate | valid sample bị reject / eligible valid | document pair | loại low-quality ngoài policy nếu đã định nghĩa | policy-versioned | valid | per-slice, micro |
| Source agreement | fields đồng thuận exact / fields có >=2 nguồn valid | field | nguồn invalid bị loại | field canonicalization | agreement | per-field |
| Preview/final consistency | same-byte request cùng semantic result / repeated requests | request pair | config/version khác | canonical input bytes | consistency | per-version |
| Latency | elapsed server processing | request | tách cold-start/warm | milliseconds | không áp dụng | P50/P95/P99 |
| Peak memory | max process/request estimate | request/run | tách scheduled lane | MiB | không áp dụng | max/P95 |

Công thức/normalization phải version hóa. FAR/FRR phải ghi rõ positive class và denominator trong artifact.

### 8.2 Promotion gate template

Không điền số tùy ý trước baseline. Cuối Phase 0 phải chốt bảng:

| Metric | Slice | Baseline | Allowed change/target | Min sample | CI | Command | Artifact | Rollback trigger |
|---|---|---:|---:|---:|---|---|---|---|
| CCCD number exact accuracy | clear/blur/... | TBD | TBD | TBD | TBD | TBD | versioned report | TBD |
| False accept | mismatched docs | TBD | ưu tiên 0; chốt sau baseline/risk review | TBD | TBD | TBD | versioned report | bất kỳ ngưỡng đã chốt |
| False reject | valid docs | TBD | TBD | TBD | TBD | TBD | versioned report | TBD |
| P95 latency | warm/cold | TBD | SLO TBD | TBD | TBD | TBD | perf report | vượt SLO |
| Peak memory | concurrency slices | TBD | budget TBD | TBD | n/a | TBD | scheduled report | vượt budget |

Không bật enforcement nếu còn ô `TBD` ở metric/gate liên quan.

## 9. Corpus tái lập và bảo mật

### 9.1 Manifest bắt buộc

Manifest không chứa PII:

```text
fixtureId
contentSha256
expectedFieldsRef
provenance
qualitySliceLabels
documentType
annotationVersion
corpusVersion
fixedSplit
transformRecipe/seed
consentOrSyntheticClass
```

- Split cố định theo document/person, không chỉ theo ảnh.
- Không để cùng danh tính ở tuning và holdout test.
- Annotation cần second-review và trạng thái disputed.
- Pin seed/tham số blur, rotate, glare, compression.
- Corpus release bất biến, có manifest hash.
- Ảnh nhạy cảm ở encrypted private object storage có audit/retention.
- Repo chỉ chứa synthetic/redacted public smoke fixtures.

### 9.2 Golden artifact

Mỗi report ghi:

- corpus/dataset version;
- fixture manifest hash;
- OCR engine/native/traineddata SHA-256;
- parser/config/policy version;
- OS/container/runtime;
- culture/timezone;
- transform seed;
- command và commit SHA.

## 10. Kế hoạch triển khai compatibility-first và TDD

Mỗi phase tuân theo:

```text
characterization -> RED regression -> minimal implementation -> unit/integration -> corpus comparison -> review -> promotion gate
```

## Phase 0 - Contract và measurement foundation

1. Chốt assurance vocabulary và failure taxonomy.
2. Tạo corpus manifest/fixed split/private storage.
3. Đo baseline pipeline hiện tại.
4. Chốt công thức metric và versioned report.
5. Chốt provisional thresholds, sample floor, CI và rollback trigger.
6. Tạo privacy-safe telemetry ở observe-only.
7. Viết ADR cho Passport isolation, API semantics và exact matching.

**Exit criteria:** không còn TBD trong gate cần cho Phase 1-3; baseline tái lập; không PII trong artifact.

## Phase 1 - API/frontend compatibility foundation

1. Thêm response contract additive/versioned.
2. Giữ legacy `ThanhCong/ThongBao` và mapping cũ trong rollback window.
3. Frontend hiểu status/failure code mới nhưng vẫn fallback response cũ.
4. Tách processing status khỏi assurance.
5. Thêm contract tests backend/frontend và compatibility tests old/new combinations.
6. Nếu cần schema mới, chỉ expand; chưa drop/rename cột cũ.

**Exit criteria:** old client/new server và new client/old server không gây false assurance hoặc chặn nhầm; rollback được kiểm chứng.

## Phase 2 - Testability và deterministic environment

1. Tách pure parser/validator/canonicalizer/resolver.
2. Inject OCR/QR/tessdata/clock/scan-reference store.
3. Pin culture/timezone/traineddata/native/container versions.
4. Định nghĩa deterministic tie-break.
5. Unit lane không network/native OCR.
6. Viết characterization tests cho behavior hiện tại trước refactor.

**Exit criteria:** pure unit tests deterministic; native tests tách lane; refactor không làm đổi legacy outputs ngoài thay đổi đã phê duyệt.

## Phase 3 - Deterministic safety fixes

1. Exact identifier equality; loại fuzzy `IsSameId` khỏi quyết định định danh.
2. Sửa QR regex và schema parser.
3. DateTime calendar validation.
4. MRZ check digits.
5. Bỏ rewrite địa phương/ngữ nghĩa nguy hiểm.
6. Giới hạn decoded width/height/pixels.
7. Giữ Passport legacy isolation.
8. Thêm diagnostic/failure code không PII.

**Exit criteria:** adversarial identity tests pass; no unsafe rewrite; API compatibility pass.

## Phase 4 - Observe-only quality/extraction pipeline

1. Orientation normalization.
2. Card boundary/crop/perspective/deskew.
3. Blur/brightness/glare/clipping/card-area analysis.
4. QR crop/rotation/scale/variants.
5. OCR variants có confidence/bounding box.
6. Field candidates + resolved values + decision evidence.
7. Shadow compare với legacy; chưa dùng kết quả mới để reject/accept production.

**Exit criteria:** promotion gates đạt trên từng slice; không regression tài nguyên/SLO; privacy review pass.

## Phase 5 - Controlled UX/enforcement rollout

1. Bật hướng dẫn chụp và warning trước.
2. Bật `LowQuality/Partial/Conflicting` theo cohort nhỏ.
3. Giữ feature flags riêng cho quality/crop/scoring/status enforcement.
4. Tăng cohort chỉ khi gates đạt.
5. Automatic rollback/kill switch khi vượt trigger.
6. Admin/user copy không dùng “đã xác minh danh tính” sai assurance.

**Exit criteria:** completion rate, FAR/FRR, latency và support signals đạt gate; rollback drill pass.

## Phase 6 - Scan-reference enforcement

Scan reference phải:

- opaque random, CSPRNG và đủ entropy;
- lưu server-side/shared store cho multi-instance;
- gắn registration challenge/email-session đã xác minh;
- gắn canonical hash hai input, normalized doc number, policy/parser version;
- có expiry, one-time use, atomic consume và cleanup;
- không chứa plaintext OCR ở browser/URL;
- định nghĩa canonical bytes trước khi hash;
- có retry semantics: transaction thất bại không gây mất reference sai hoặc replay;
- chống hai request cạnh tranh: chỉ một consume thành công.

Backend vẫn là authority; nếu file/hash/policy thay đổi, bắt scan lại hoặc re-scan theo policy.

**Exit criteria:** replay/concurrency/expiry/multi-instance tests pass; no plaintext leak; rollback path rõ.

## Phase 7 - Operational hardening và cleanup

1. Đóng gói tessdata vào deployment; pin URL/version/license/SHA-256.
2. Startup readiness fail-fast nếu model thiếu/sai hash.
3. Nếu còn runtime provisioning: inter-process lock, atomic replace, bounded retry; cấm ở unit/PR lane.
4. Bounded queue/concurrency, cancellation propagation, overload failure code.
5. Audit admin decrypt/access; retention/purge.
6. Xóa contract/schema legacy chỉ sau rollback window và migration review.
7. Có thể harden searchable identifier bằng encrypted display value + versioned keyed HMAC cho equality/uniqueness; cần migration expand-and-contract và reuse policy cho hồ sơ bị từ chối.

## 11. Image, QR, OCR và MRZ details

### 11.1 Quality/image pipeline

Đo sau decode, trước OCR:

- blur score;
- brightness/histogram;
- over/under-exposure;
- card area ratio;
- four-corner detection;
- perspective/skew;
- clipping;
- QR module size nếu phát hiện.

Threshold cấu hình và version hóa. Không hard-code theo một vài ảnh. Quality gate chạy observe-only trước enforcement.

Variants cần benchmark riêng: original, grayscale, denoise nhẹ, CLAHE/contrast, adaptive threshold, sharpen nhẹ. Không mặc định sharpening/upscale/PNG/tessdata_best luôn tốt hơn.

### 11.2 QR

- Crop + full frame;
- rotations;
- scale/grayscale/binary;
- benchmark `TRY_HARDER`;
- parse đúng schema CCCD;
- validate field format;
- không coi QR là 100% chính xác;
- không override conflict.

### 11.3 OCR

- Không chọn global text theo character count;
- chọn candidate theo field;
- giữ confidence/location/version;
- fuzzy label chỉ hỗ trợ locating label, không sửa value;
- semantic validation không được biến dữ liệu sai thành hợp lệ.

### 11.4 MRZ

- Parse đúng document format;
- check digit bắt buộc trước khi dùng;
- date calendar validation;
- MRZ OCR confidence không thay thế checksum;
- Passport MRZ nằm ngoài CCCD policy cho đến strategy riêng.

## 12. Kiểm thử bắt buộc

### 12.1 Unit

- QR regex/schema;
- date/leap year/invalid date;
- MRZ checksum;
- safe cleanup;
- canonicalization;
- exact matching;
- candidate resolver/tie-break;
- quality classifier;
- side classifier;
- limits/failure mapping;
- assurance/status mapping.

### 12.2 Adversarial identifier

- khác 1 số;
- khác 2 số;
- transposition;
- `0/8`, `1/7`, `O/0`, `I/1`;
- một mặt thiếu ID;
- ID chỉ có sau OCR character substitution;
- QR/OCR/user input conflict;
- hai request consume cùng scan reference.

### 12.3 Integration/contract

- multipart magic bytes/decoded dimensions;
- duplicate image, two front/back, swapped sides;
- non-document và mismatched document;
- QR success/OCR fallback/MRZ fallback;
- partial/conflict/low quality;
- old/new client-server compatibility;
- preview đổi file, final mismatch;
- expiry/replay/atomic consume;
- concurrent submit;
- Passport legacy unchanged.

### 12.4 Corpus matrix

- clear/light-heavy blur/motion blur;
- dark/glare/shadow/low contrast;
- rotations/perspective/clipping/card small;
- compressed/chat images;
- QR small/blurred/rotated/damaged/malformed;
- Vietnamese marks and broken lines;
- long names/multiline addresses/diverse regions;
- dates/leap year/invalid dates;
- MRZ valid/invalid checksums;
- source agreement/conflict;
- decompression bomb-like dimensions;
- concurrent/timeout/variant failure.

Metamorphic re-encode không bắt exact raw OCR output; chỉ kiểm semantic identity/status trong tolerance đã chốt.

## 13. CI lanes

1. **PR lane:** pure unit, contract và public synthetic/redacted smoke; không network/native/private corpus.
2. **Native compatibility lane:** Windows/Linux, pinned Tesseract/Skia/ZXing/tessdata.
3. **Protected private-corpus lane:** field metrics/gates; encrypted fixtures; privacy-safe artifacts.
4. **Scheduled lane:** performance, memory, soak, concurrency, cold start.

Mỗi lane có timeout, command, owner và artifact policy. Performance/memory không mặc định block mọi PR nhưng phải block promotion khi vượt gate.

## 14. Bảo mật và riêng tư

### Phải làm

- Không persist raw CCCD image nếu nghiệp vụ không bắt buộc.
- Mã hóa OCR data bằng cơ chế hiện có; least privilege và audit admin access.
- Mask identifiers trong list/log.
- Rate limit scan/OTP/token.
- Xóa temp ngay cả khi exception/cancellation.
- Correlation ID không PII.
- Retention/purge cho rejected/expired records.
- Magic-byte, decoded-dimension và resource validation.
- Shared-store scan reference phải encrypted/protected và TTL-bound.

### Tuyệt đối không làm

- Không log raw OCR/base64/full identifier/name/address.
- Không lưu ảnh vào git, screenshot, artifact, crash dump.
- Không dùng PII trong metric labels/URLs/test names.
- Không tin `DaXacMinh...` từ frontend.
- Không fuzzy-match số định danh.
- Không sửa OCR confusion rồi coi là exact identity evidence.
- Không đoán địa chỉ/tên theo danh mục.
- Không coi confidence/QR/UserConfirmed là legal identity proof.
- Không dùng từ `Verified` nếu chưa có identity-proofing.
- Không áp CCCD policy cho Passport.
- Không tăng threshold để che lỗi parser.
- Không đổi engine/model dựa trên vài ảnh.
- Không log exception kèm payload.
- Không rollback bằng cách bỏ backend validation hoặc tin client.

## 15. Rollout, rollback và migration

### Thứ tự rollout bắt buộc

1. telemetry baseline;
2. additive API/frontend compatibility;
3. expand-only storage nếu cần;
4. deterministic safety fixes;
5. quality/extraction/scoring observe-only;
6. UX/enforcement theo cohort;
7. scan-reference enforcement;
8. operational hardening;
9. legacy cleanup sau rollback window.

### Rollback

- Feature flag riêng cho quality, crop, scoring, status enforcement và scan reference.
- Giữ legacy response/schema trong rollback window.
- Có migration rollback/forward strategy; không destructive migration trước cleanup phase.
- Parser có thể rollback nhưng không phục hồi unsafe rewrite/fuzzy identity matching.
- Nếu phát hiện PII telemetry, dừng producer/consumer, cô lập/xóa artifact theo incident process.
- Rollback drill phải được test trước promotion.

## 16. Checklist trước merge/promotion

### Contract/assurance

- [ ] Additive/versioned contract và legacy mapping.
- [ ] Backend/frontend compatibility tests.
- [ ] Status tách assurance.
- [ ] Không dùng `Verified` sai nghĩa.
- [ ] Failure taxonomy versioned, không PII.

### Identity safety

- [ ] Exact CCCD equality; không fuzzy/edit distance.
- [ ] QR schema/regex đúng.
- [ ] Date calendar validation.
- [ ] MRZ checksum.
- [ ] Unsafe rewrite đã xóa.
- [ ] Conflict không bị confidence override.
- [ ] Passport legacy isolation.

### Test/measurement

- [ ] Characterization và RED tests trước implementation.
- [ ] Corpus immutable manifest/fixed split.
- [ ] Metric formulas và gates không còn TBD trước enforcement.
- [ ] Adversarial identity tests.
- [ ] Contract/concurrency/replay tests.
- [ ] Deterministic versions/culture/time/seed/tie-break.
- [ ] CI lanes và artifacts privacy-safe.

### Security/operations

- [ ] Không raw image/OCR/identifier trong logs/repo/artifacts.
- [ ] Decoded pixel/memory/concurrency/timeout limits.
- [ ] Model/version/hash/readiness pinned.
- [ ] Scan reference atomic/TTL/one-time/shared-store.
- [ ] Admin decrypt audit và retention/purge.
- [ ] Rollback drill pass.

## 17. Kết quả bàn giao

1. Contract tương thích và assurance taxonomy chính xác.
2. Pipeline CCCD có quality analysis, crop/perspective và field candidates.
3. QR/MRZ parser có schema/checksum/semantic validation.
4. Exact identity matching và conflict policy an toàn.
5. UX retry/partial/conflict không tuyên bố xác minh quá mức.
6. Corpus/versioned benchmark và promotion gates.
7. Pure unit/native/private corpus/scheduled CI lanes.
8. Scan-reference protocol chống thay file/replay/concurrency.
9. Dashboard/runbook privacy-safe.
10. Feature flags, migration và rollback window.
11. Passport được giữ legacy an toàn cho đến khi có plan riêng.

**Tiêu chí tối cao:** khi không đủ bằng chứng chính xác, hệ thống phải trả “không thể thiết lập/đối chiếu chắc chắn” hoặc yêu cầu chụp lại/review; tuyệt đối không tạo một giá trị có vẻ hợp lệ nhưng không có trên giấy tờ.
