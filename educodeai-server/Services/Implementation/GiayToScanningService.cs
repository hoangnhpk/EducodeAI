using educodeai_server.DTOs.XacThuc;
using educodeai_server.Services.Interface;
using SkiaSharp;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Tesseract;
using ZXing;
using ZXing.Common;

namespace educodeai_server.Services.Implementation
{
    public class GiayToScanningService : IGiayToScanningService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<GiayToScanningService> _logger;
        private readonly string _tessDataPath;
        // Tải tessdata đúng 1 lần cho cả vòng đời ứng dụng (service là Singleton).
        private readonly Task _tessReady;

        public GiayToScanningService(IWebHostEnvironment env, IConfiguration config, ILogger<GiayToScanningService> logger)
        {
            _env = env;
            _logger = logger;
            _tessDataPath = ResolveTessDataPath(config);
            // Tự động tải tessdata nếu thiếu (chạy nền, không chặn startup).
            _tessReady = EnsureTessDataAsync();
        }

        private async Task EnsureTessDataAsync()
        {
            var files = new Dictionary<string, string>
            {
                ["vie.traineddata"] = "https://github.com/tesseract-ocr/tessdata_fast/raw/main/vie.traineddata",
                ["eng.traineddata"] = "https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata"
            };

            Directory.CreateDirectory(_tessDataPath);

            using var httpClient = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("EducodeAI-TessLoader/1.0");

            foreach (var (fileName, url) in files)
            {
                var dest = Path.Combine(_tessDataPath, fileName);
                if (File.Exists(dest)) continue;

                try
                {
                    _logger.LogInformation("[TessData] Đang tải {FileName} từ GitHub...", fileName);
                    var bytes = await httpClient.GetByteArrayAsync(url);
                    // Ghi ra file tạm rồi move (atomic) để tránh 2 tiến trình ghi đè nửa chừng.
                    var tmp = dest + ".tmp";
                    await File.WriteAllBytesAsync(tmp, bytes);
                    File.Move(tmp, dest, overwrite: true);
                    _logger.LogInformation("[TessData] Tải {FileName} thành công ({SizeMb} MB).", fileName, bytes.Length / 1024 / 1024);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[TessData] Không tải được {FileName}.", fileName);
                }
            }
        }

        public async Task<GiayToScanningResponse> QuetGiayToAsync(GiayToScanningRequest request)
        {
            try
            {
                var validate = ValidateRequest(request);
                if (validate != null) return Fail(validate);

                // Chờ tessdata tải xong (nếu đang tải lần đầu) trước khi kiểm tra file.
                await _tessReady;

                if (!Directory.Exists(_tessDataPath) || !File.Exists(Path.Combine(_tessDataPath, "eng.traineddata")))
                    return Fail("Chưa cài dữ liệu OCR offline (tessdata).");

                var frontBytes = await ReadAllBytesAsync(request.AnhMatTruoc);
                var backBytes = await ReadAllBytesAsync(request.AnhMatSau);
                if (frontBytes.Length == 0 || backBytes.Length == 0)
                    return Fail("File ảnh không hợp lệ.");

                if (frontBytes.AsSpan().SequenceEqual(backBytes))
                    return Fail("Hai ảnh giống nhau. Vui lòng tải 1 ảnh mặt trước và 1 ảnh mặt sau CCCD.");

                string frontText;
                string backText;
                try
                {
                    var hasVie = File.Exists(Path.Combine(_tessDataPath, "vie.traineddata"));
                    var hasEng = File.Exists(Path.Combine(_tessDataPath, "eng.traineddata"));
                    if (!hasVie && !hasEng)
                        throw new InvalidOperationException("Chưa có file tessdata. Đang tải về, vui lòng thử lại sau vài giây.");

                    // Ưu tiên vie+eng. Nếu chưa tải xong vie thì dùng eng tạm.
                    var lang = hasVie ? (hasEng ? "vie+eng" : "vie") : "eng";

                    // Tạo engine 1 lần rồi dùng cho cả 2 ảnh (load traineddata rất tốn kém).
                    using var engine = new TesseractEngine(_tessDataPath, lang, EngineMode.Default);
                    engine.SetVariable("user_defined_dpi", "300");
                    engine.SetVariable("preserve_interword_spaces", "1");
                    engine.SetVariable("debug_file", "nul");

                    frontText = OcrImage(engine, frontBytes);
                    backText = OcrImage(engine, backBytes);

                    if (_env.IsDevelopment())
                    {
                        _logger.LogInformation("[OCR-DEBUG] === MAT TRUOC ===\n{FrontText}", frontText);
                        _logger.LogInformation("[OCR-DEBUG] === MAT SAU ===\n{BackText}", backText);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Khởi tạo/chạy OCR offline thất bại. TessDataPath={TessDataPath}", _tessDataPath);
                    return Fail("Không khởi tạo được OCR offline. Kiểm tra tessdata và native dll Tesseract.");
                }

                if (CountAlphaNum(frontText) < 10 && CountAlphaNum(backText) < 10)
                    return Fail("Ảnh bị mờ hoặc không đọc được chữ. Vui lòng chụp rõ nét, đủ sáng, không bị lóa.");

                var frontSide = DetectSide(frontText);
                var backSide = DetectSide(backText);
                var frontIsId = LooksLikeId(frontText, request.LoaiGiayTo, false);
                var backIsId = LooksLikeId(backText, request.LoaiGiayTo, backSide == IdSide.Back || backSide == IdSide.Unknown);

                if (!frontIsId && !backIsId)
                    return Fail("Ảnh không phải CCCD/giấy tờ tùy thân. Vui lòng tải đúng ảnh mặt trước và mặt sau.");

                if (frontSide == IdSide.Front && backSide == IdSide.Front)
                    return Fail("Hai ảnh đều là mặt trước CCCD. Vui lòng tải thêm ảnh mặt sau.");

                if (frontSide == IdSide.Back && backSide == IdSide.Back)
                    return Fail("Hai ảnh đều là mặt sau CCCD. Vui lòng tải thêm ảnh mặt trước.");

                if (frontSide == IdSide.Back && backSide == IdSide.Front)
                    return Fail("Bạn đã để ngược ảnh: ô Mặt trước đang là mặt sau, ô Mặt sau đang là mặt trước.");

                if (frontSide == IdSide.Back)
                    return Fail("Ảnh ở ô Mặt trước đang là mặt sau CCCD. Vui lòng tải đúng ảnh mặt trước.");

                if (backSide == IdSide.Front)
                    return Fail("Ảnh ở ô Mặt sau đang là mặt trước CCCD. Vui lòng tải đúng ảnh mặt sau.");

                if (!frontIsId)
                    return Fail("Ảnh mặt trước không phải CCCD hợp lệ.");

                if (!backIsId && string.Equals(request.LoaiGiayTo, "CCCD", StringComparison.OrdinalIgnoreCase))
                    return Fail("Ảnh mặt sau không phải CCCD hợp lệ.");

                // Kiem tra 2 mat co cung 1 CCCD khong.
                // Chi lay so 12 chu so sach (khong lay 9-so hoac noisy-ocr)
                // vi mat sau CCCD VN thuong khong in lai so CCCD 12 chu so ro rang.
                // Neu mat sau khong tim thay so 12-so ro rang thi bo qua check nay.
                var frontIds = ExtractCleanIdNumbers(frontText);
                var backIds  = ExtractCleanIdNumbers(backText);
                if (frontIds.Count > 0 && backIds.Count > 0)
                {
                    var same = frontIds.Any(f => backIds.Any(b => IsSameId(f, b)));
                    if (!same)
                        return Fail("Mặt trước và mặt sau không cùng 1 CCCD. Vui lòng tải đúng 2 mặt của cùng một giấy tờ.");
                }

                var orderedFront = frontText;
                var orderedBack = backText;
                if (frontSide == IdSide.Back && backSide == IdSide.Front)
                {
                    orderedFront = backText;
                    orderedBack = frontText;
                }

                // QR mã trên CCCD gắn chip chứa dữ liệu chính xác 100%. Thử cả 2 mặt
                // vì người dùng có thể tải ngược, và fallback OCR chỉ khi QR không đọc được.
                var qrText = DecodeQrText(frontBytes) ?? DecodeQrText(backBytes);
                var parsed = ParseIdentity(orderedFront, orderedBack, request.LoaiGiayTo, qrText);
                if (string.IsNullOrWhiteSpace(parsed.SoGiayTo) && string.IsNullOrWhiteSpace(parsed.HoTen))
                    return Fail("Kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c s\u1ed1 gi\u1ea5y t\u1edd/h\u1ecd t\u00ean t\u1eeb CCCD. Vui l\u00f2ng ch\u1ee5p l\u1ea1i \u1ea3nh r\u00f5 n\u00e9t, \u0111\u1eb7t gi\u1ea5y t\u1edd th\u1eb3ng, ch\u1ee5p ngang khung h\u00ecnh, \u0111\u1ee7 s\u00e1ng v\u00e0 kh\u00f4ng b\u1ecb l\u00f3a.");

                var missingFields = GetMissingRequiredFields(parsed, request.LoaiGiayTo);
                if (missingFields.Count > 0)
                    return Fail($"Ch\u01b0a \u0111\u1ecdc \u0111\u01b0\u1ee3c: {string.Join(", ", missingFields)}. Vui l\u00f2ng ch\u1ee5p l\u1ea1i \u1ea3nh r\u00f5 n\u00e9t h\u01a1n, \u0111\u1eb7t gi\u1ea5y t\u1edd th\u1eb3ng, ch\u1ee5p ngang khung h\u00ecnh, \u0111\u1ee7 s\u00e1ng, kh\u00f4ng b\u1ecb l\u00f3a v\u00e0 kh\u00f4ng che m\u1ea5t g\u00f3c gi\u1ea5y t\u1edd.");

                parsed.ThanhCong = true;
                parsed.ThongBao = "Qu\u00e9t CCCD offline th\u00e0nh c\u00f4ng. N\u1ebfu c\u00f3 th\u00f4ng tin n\u00e0o kh\u00f4ng ch\u00ednh x\u00e1c theo gi\u1ea5y t\u1edd, vui l\u00f2ng ch\u1ee5p l\u1ea1i \u1ea3nh r\u00f5 n\u00e9t h\u01a1n, \u0111\u1eb7t gi\u1ea5y t\u1edd th\u1eb3ng, ch\u1ee5p ngang khung h\u00ecnh, \u0111\u1ee7 s\u00e1ng v\u00e0 kh\u00f4ng b\u1ecb l\u00f3a.";
                return parsed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi quét giấy tờ offline.");
                return Fail("Đã xảy ra lỗi khi quét offline. Vui lòng thử lại sau.");
            }
        }

        private static List<string> GetMissingRequiredFields(GiayToScanningResponse result, string loaiGiayTo)
        {
            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(result.SoGiayTo)) missing.Add("s\u1ed1 gi\u1ea5y t\u1edd");
            if (string.IsNullOrWhiteSpace(result.HoTen)) missing.Add("h\u1ecd t\u00ean");
            if (string.IsNullOrWhiteSpace(result.NgaySinh)) missing.Add("ng\u00e0y sinh");
            if (string.IsNullOrWhiteSpace(result.GioiTinh)) missing.Add("gi\u1edbi t\u00ednh");
            if (string.IsNullOrWhiteSpace(result.DiaChi)) missing.Add("\u0111\u1ecba ch\u1ec9");
            if (string.Equals(loaiGiayTo, "CCCD", StringComparison.OrdinalIgnoreCase)
                && string.IsNullOrWhiteSpace(result.NguyenQuan)) missing.Add("qu\u00ea qu\u00e1n");
            return missing;
        }

        private string ResolveTessDataPath(IConfiguration config)
        {
            var configured = config["OcrOffline:TessDataPath"];
            var list = new List<string>();
            if (!string.IsNullOrWhiteSpace(configured))
            {
                list.Add(Path.IsPathRooted(configured) ? configured : Path.GetFullPath(Path.Combine(_env.ContentRootPath, configured)));
                list.Add(Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, configured)));
            }
            list.Add(Path.Combine(AppContext.BaseDirectory, "tessdata"));
            list.Add(Path.Combine(_env.ContentRootPath, "tessdata"));
            list.Add(Path.Combine(Directory.GetCurrentDirectory(), "tessdata"));

            foreach (var p in list.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                if (Directory.Exists(p) && File.Exists(Path.Combine(p, "eng.traineddata")))
                    return p;
            }
            return Path.Combine(AppContext.BaseDirectory, "tessdata");
        }

        private static async Task<byte[]> ReadAllBytesAsync(IFormFile file)
        {
            await using var stream = file.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            return ms.ToArray();
        }

        private static string OcrImage(TesseractEngine engine, byte[] bytes)
        {
            using var bitmap = SKBitmap.Decode(bytes)
                ?? throw new InvalidOperationException("Khong decode duoc anh");

            var best = string.Empty;
            foreach (var variant in BuildVariants(bitmap))
            {
                try
                {
                    using var pix = Pix.LoadFromMemory(variant);
                    using var page = engine.Process(pix, PageSegMode.Auto);
                    var text = page.GetText() ?? string.Empty;
                    if (CountAlphaNum(text) > CountAlphaNum(best)) best = text;
                }
                catch
                {
                    // bo qua variant loi, khong log
                }
            }
            return best;
        }

        private static IEnumerable<byte[]> BuildVariants(SKBitmap source)
        {
            // Đảm bảo ảnh đủ rộng để Tesseract đọc tốt nhất (tối thiểu 1600px ngang)
            var scale = source.Width < 1600 ? 1600f / source.Width : 1f;
            // Không phóng to quá 3x để tránh làm mờ ảnh do nội suy
            if (scale > 3f) scale = 3f;
            var w = Math.Max(1, (int)Math.Round(source.Width * scale));
            var h = Math.Max(1, (int)Math.Round(source.Height * scale));
            using var resized = Resize(source, w, h);

            // Variant 1: Ảnh gốc resize (màu) — tốt nhất nếu ảnh đủ sáng, sắc nét
            yield return EncodeJpeg(resized, 95);

            // Variant 2: Grayscale tương phản nhẹ (contrast 1.3) — phù hợp ảnh chụp điện thoại thường
            using (var g1 = GrayContrast(resized, 1.3f)) yield return EncodeJpeg(g1, 95);

            // Variant 3: Grayscale tương phản mạnh (contrast 1.8) — phù hợp ảnh tối/ngược sáng
            using (var g2 = GrayContrast(resized, 1.8f)) yield return EncodeJpeg(g2, 95);

            // Variant 4: Adaptive threshold (ngưỡng tự động) — thay thế Binary cứng 155
            // Tesseract tự chọn ngưỡng tốt hơn khi nhận ảnh grayscale sạch
            using (var g3 = GrayContrast(resized, 2.2f)) yield return EncodePng(g3);
        }

        private static SKBitmap Resize(SKBitmap source, int width, int height)
        {
            if (source.Width == width && source.Height == height) return source.Copy();
            var info = new SKImageInfo(width, height, SKColorType.Rgba8888, SKAlphaType.Premul);
            var dest = source.Resize(info, new SKSamplingOptions(SKFilterMode.Linear, SKMipmapMode.None));
            if (dest != null) return dest;

            // Fallback nearest-neighbor: đọc/ghi theo mảng (bulk marshalling) thay vì per-pixel.
            var src = source.Pixels;
            var outPixels = new SKColor[width * height];
            for (var y = 0; y < height; y++)
            {
                var sy = Math.Min(source.Height - 1, (int)(y * (source.Height / (float)height)));
                for (var x = 0; x < width; x++)
                {
                    var sx = Math.Min(source.Width - 1, (int)(x * (source.Width / (float)width)));
                    outPixels[y * width + x] = src[sy * source.Width + sx];
                }
            }
            dest = new SKBitmap(info);
            dest.Pixels = outPixels;
            return dest;
        }

        private static SKBitmap GrayContrast(SKBitmap source, float contrast)
        {
            // Đọc/ghi theo mảng (1 lần marshalling) thay vì GetPixel/SetPixel per-pixel
            // (mỗi lần gọi là 1 P/Invoke — cực chậm với ảnh vài triệu điểm ảnh).
            var pixels = source.Pixels;
            var outPixels = new SKColor[pixels.Length];
            for (var i = 0; i < pixels.Length; i++)
            {
                var c = pixels[i];
                var l = 0.299 * c.Red + 0.587 * c.Green + 0.114 * c.Blue;
                var v = (byte)Math.Clamp((int)((l - 128) * contrast + 128), 0, 255);
                outPixels[i] = new SKColor(v, v, v, 255);
            }
            var bmp = new SKBitmap(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Premul);
            bmp.Pixels = outPixels;
            return bmp;
        }

        private static byte[] EncodeJpeg(SKBitmap bitmap, int quality)
        {
            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Jpeg, quality);
            return data.ToArray();
        }

        private static byte[] EncodePng(SKBitmap bitmap)
        {
            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }

        private enum IdSide { Unknown, Front, Back }

        private static IdSide DetectSide(string text)
        {
            var u = RemoveDiacritics(text).ToUpperInvariant();
            var front = 0;
            var back = 0;

            string[] frontKeys =
            {
                "HO VA TEN", "FULL NAME", "NGAY SINH", "DATE OF BIRTH", "GIOI TINH", "SEX",
                "QUOC TICH", "NATIONALITY", "QUE QUAN", "NOI THUONG TRU", "CAN CUOC", "CAN CU",
                "CITIZEN IDENTITY", "PERSONAL ID", "CONG DAN"
            };
            string[] backKeys =
            {
                "DAC DIEM", "NHAN DANG", "PERSONAL IDENTIFICATION", "NGAY CAP", "DATE OF ISSUE",
                "CO GIA TRI DEN", "DATE OF EXPIRY", "NOI CAP", "PLACE OF ISSUE", "<<", "MRZ",
                "DATE, MONTH, YEAR", "CUC TRUONG", "DIRECTOR GENERAL", "NGON TAY", "TRAI", "PHAI"
            };

            foreach (var k in frontKeys) if (u.Contains(k)) front += 2;
            foreach (var k in backKeys) if (u.Contains(k)) back += 2;
            if (u.Contains("<<")) back += 4;
            if (Regex.IsMatch(u, @"\b\d{12}\b")) front += 2;

            if (front == 0 && back == 0) return IdSide.Unknown;
            if (front >= back + 2) return IdSide.Front;
            if (back >= front + 2) return IdSide.Back;
            if (front > back) return IdSide.Front;
            if (back > front) return IdSide.Back;
            return IdSide.Unknown;
        }

        private static bool LooksLikeId(string text, string loai, bool isBack = false)
        {
            var u = RemoveDiacritics(text).ToUpperInvariant();
            string[] keys =
            {
                "CAN CUOC", "CAN CU", "CCCD", "CMND", "CITIZEN", "IDENTITY", "HO CHIEU", "PASSPORT",
                "HO VA TEN", "FULL NAME", "NGAY SINH", "DATE OF BIRTH", "NOI THUONG TRU",
                "QUE QUAN", "QUOC TICH", "GIOI TINH", "SEX", "NGAY CAP", "DATE OF ISSUE",
                "DAC DIEM", "NHAN DANG", "CO GIA TRI DEN", "<<", "CONG DAN", "PERSONAL IDENTIFICATION",
                "NGON TAY", "TRAI", "PHAI", "CUC TRUONG", "DATE, MONTH, YEAR", "DIRECTOR GENERAL"
            };
            var hit = keys.Count(k => u.Contains(k));
            if (string.Equals(loai, "Passport", StringComparison.OrdinalIgnoreCase))
                return hit >= 1 || Regex.IsMatch(u, @"\b[A-Z0-9]{6,12}\b");

            if (isBack)
            {
                // Mặt sau CCCD thường không có số định danh 9/12 số, OCR chữ nhỏ cũng dễ mất chữ.
                // Vì vậy chỉ cần có 1 dấu hiệu mặt sau hoặc một ngày tháng là đủ coi là giấy tờ hợp lệ.
                return hit >= 1 || Regex.IsMatch(u, @"\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b");
            }

            return hit >= 2 || Regex.IsMatch(u, @"\b\d{9}\b|\b\d{12}\b");
        }

        /// <summary>
        /// Trích tất cả số định danh (9 hoặc 12 chữ số) kể cả từ OCR noisy.
        /// Dùng cho ExtractIdNumber (tìm số chính).
        /// </summary>
        private static List<string> ExtractAllIdNumbers(string text)
        {
            var result = new List<string>();
            var digits = Regex.Replace(text ?? string.Empty, @"[^\d]", " ");
            foreach (Match m in Regex.Matches(digits, @"\b\d{12}\b"))
                result.Add(m.Value);
            foreach (Match m in Regex.Matches(digits, @"\b\d{9}\b"))
                result.Add(m.Value);

            // OCR hay nham O/0, S/5...: bat chuoi 12 ky tu gan giong so
            var noisy = Regex.Matches(RemoveDiacritics(text ?? string.Empty).ToUpperInvariant(), @"[0-9OISB]{12}");
            foreach (Match m in noisy)
            {
                var fixedNum = FixOcrDigits(m.Value);
                if (Regex.IsMatch(fixedNum, @"^\d{12}$"))
                    result.Add(fixedNum);
            }

            return result.Distinct().ToList();
        }

        /// <summary>
        /// Chỉ trích số 12 chữ số sạch (không dùng noisy-OCR, không lấy số 9 chữ số).
        /// Dùng để cross-check mặt trước / mặt sau — tránh false-positive
        /// do mặt sau CCCD VN không in lại số CCCD rõ ràng.
        /// </summary>
        private static List<string> ExtractCleanIdNumbers(string text)
        {
            var result = new List<string>();
            var digits = Regex.Replace(text ?? string.Empty, @"[^\d]", " ");
            foreach (Match m in Regex.Matches(digits, @"\b\d{12}\b"))
                result.Add(m.Value);
            return result.Distinct().ToList();
        }

        private static string FixOcrDigits(string raw)
        {
            var sb = new StringBuilder(raw.Length);
            foreach (var c in raw.ToUpperInvariant())
            {
                sb.Append(c switch
                {
                    'O' => '0',
                    'I' => '1',
                    'L' => '1',
                    'S' => '5',
                    'B' => '8',
                    'Z' => '2',
                    _ => c
                });
            }
            return sb.ToString();
        }

        private static bool IsSameId(string a, string b)
        {
            if (string.Equals(a, b, StringComparison.Ordinal)) return true;
            // Cho phep OCR doc sai toi da 2 ky tu trong so 12-chu-so
            // (vi mat sau CCCD co the bi nhoem, goc khuat, lam lech 1-2 so)
            if (a.Length == b.Length && a.Length >= 9)
            {
                var maxDiff = a.Length >= 12 ? 2 : 1;
                var diff = 0;
                for (var i = 0; i < a.Length; i++)
                    if (a[i] != b[i]) diff++;
                return diff <= maxDiff;
            }
            return false;
        }

        private static string? DecodeQrText(byte[] bytes)
        {
            try
            {
                using var bitmap = SKBitmap.Decode(bytes);
                if (bitmap == null) return null;

                // Đọc toàn bộ điểm ảnh 1 lần (bulk) thay vì GetPixel per-pixel.
                var src = bitmap.Pixels;
                var pixels = new byte[src.Length * 4];
                var offset = 0;
                foreach (var c in src)
                {
                    pixels[offset++] = c.Red;
                    pixels[offset++] = c.Green;
                    pixels[offset++] = c.Blue;
                    pixels[offset++] = c.Alpha;
                }

                var source = new RGBLuminanceSource(pixels, bitmap.Width, bitmap.Height, RGBLuminanceSource.BitmapFormat.RGBA32);
                var binaryBitmap = new BinaryBitmap(new HybridBinarizer(source));
                var reader = new MultiFormatReader();
                var result = reader.decode(binaryBitmap);
                return result?.Text;
            }
            catch
            {
                return null;
            }
        }

        private sealed record CccdQrInfo(string? SoGiayTo, string? HoTen, string? NgaySinh, string? GioiTinh, string? DiaChi, string? NgayCap);

        private static CccdQrInfo ParseCccdQr(string? qrText)
        {
            if (string.IsNullOrWhiteSpace(qrText)) return new(null, null, null, null, null, null);
            var parts = qrText.Split('|').Select(x => x.Trim()).Where(x => x.Length > 0).ToArray();
            if (parts.Length < 6) return new(null, null, null, null, null, null);

            var id = parts.FirstOrDefault(x => Regex.IsMatch(x, @"^\d{9}|\d{12}$"));
            var name = parts.FirstOrDefault(x => !Regex.IsMatch(x, @"\d") && RemoveDiacritics(x).Split(' ', StringSplitOptions.RemoveEmptyEntries).Length >= 2);
            var dobRaw = parts.FirstOrDefault(x => Regex.IsMatch(x, @"^\d{8}$"));
            var dob = NormalizeCompactDate(dobRaw);
            var gender = parts.FirstOrDefault(x => string.Equals(RemoveDiacritics(x), "Nam", StringComparison.OrdinalIgnoreCase) || string.Equals(RemoveDiacritics(x), "Nu", StringComparison.OrdinalIgnoreCase));
            var issueRaw = parts.LastOrDefault(x => Regex.IsMatch(x, @"^\d{8}$") && x != dobRaw);
            var issueDate = NormalizeCompactDate(issueRaw);
            var address = parts.FirstOrDefault(x => x.Contains(',') && x != name);
            return new(id, name, dob, NormalizeGender(gender), address, issueDate);
        }

        private static string? NormalizeCompactDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value) || !Regex.IsMatch(value, @"^\d{8}$")) return null;
            return $"{value[..2]}/{value.Substring(2, 2)}/{value.Substring(4, 4)}";
        }

        private static string? NormalizeGender(string? value)
        {
            var v = RemoveDiacritics(value ?? string.Empty).ToUpperInvariant();
            if (v == "NAM") return "Nam";
            if (v == "NU") return "Nữ";
            return null;
        }

        private static GiayToScanningResponse ParseIdentity(string frontText, string backText, string loai, string? qrText)
        {
            var allText = (frontText ?? string.Empty) + "\n" + (backText ?? string.Empty);
            var lines = allText.Replace("\r", "\n")
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(l => Regex.Replace(l, @"\s+", " ").Trim())
                .Where(l => l.Length > 1)
                .ToList();
            var joined = string.Join("\n", lines);
            var plain = RemoveDiacritics(joined);
            var qrInfo = ParseCccdQr(qrText);

            var soGiayTo = qrInfo.SoGiayTo ?? ExtractIdNumber(joined, plain, loai)
                           ?? ExtractAllIdNumbers(frontText).FirstOrDefault()
                           ?? ExtractAllIdNumbers(backText).FirstOrDefault();

            var hoTen = ExtractByLabel(lines, new[] { "ho va ten", "ho ten", "full name", "name" })
                        ?? GuessName(lines);

            // Ngày cấp: ưu tiên mặt sau.
            var ngayCap = ExtractDate(RemoveDiacritics(backText ?? string.Empty), new[] { "ngay cap", "date of issue", "date, month, year", "date month year", "doi", "issue" })
                          ?? ExtractDate(plain, new[] { "ngay cap", "date of issue", "date, month, year", "doi", "issue" });

            // Ngày sinh: ưu tiên MRZ (mã máy đọc ở mặt sau, có checksum nên đáng tin hơn
            // OCR chữ in vốn hay đọc nát). Sau đó mới đến nhãn "Ngày sinh" ở mặt trước.
            // Không fallback sang ngày bất kỳ vì dễ lấy nhầm ngày cấp.
            var ngaySinhMrz = ExtractDobFromMrz(backText) ?? ExtractDobFromMrz(frontText);
            var ngaySinh = ngaySinhMrz
                           ?? ExtractDate(RemoveDiacritics(frontText ?? string.Empty), new[] { "ngay sinh", "date of birth", "dob", "birth" }, allowAnyDateFallback: false)
                           ?? ExtractBirthDateFromFront(frontText, issueDate: ngayCap);

            return new GiayToScanningResponse
            {
                SoGiayTo = soGiayTo,
                HoTen = qrInfo.HoTen ?? hoTen,
                NgaySinh = qrInfo.NgaySinh ?? ngaySinh,
                GioiTinh = qrInfo.GioiTinh ?? ExtractGender(plain),
                NgayCap = qrInfo.NgayCap ?? ngayCap,
                NoiCap = CleanOcrField(ExtractByLabel(lines, new[] { "noi cap", "place of issue", "authority", "cuc truong", "director general" })),
                DiaChi = CleanAddressField(qrInfo.DiaChi ?? ExtractByLabel(lines, new[] { "noi thuong tru", "thuong tru", "dia chi", "residence", "address", "place of residence" })),
                QuocTich = ExtractByLabel(lines, new[] { "quoc tich", "nationality" }) ?? "Việt Nam",
                // Bỏ dân tộc/tôn giáo vì OCR offline hay đọc sai và form không dùng.
                DanToc = null,
                TonGiao = null,
                NguyenQuan = CleanOriginField(ExtractByLabel(lines, new[] { "que quan", "nguyen quan", "place of origin" }))
            };
        }

        private static string? ExtractIdNumber(string joined, string plain, string loai)
        {
            if (string.Equals(loai, "Passport", StringComparison.OrdinalIgnoreCase))
            {
                var m = Regex.Match(plain, @"(?:SO|PASSPORT|HO CHIEU)[^\nA-Z0-9]*([A-Z0-9]{6,12})", RegexOptions.IgnoreCase);
                if (m.Success) return m.Groups[1].Value.ToUpperInvariant();
                m = Regex.Match(plain, @"\b([A-Z]\d{7}|[A-Z0-9]{6,12})\b");
                return m.Success ? m.Groups[1].Value.ToUpperInvariant() : null;
            }

            // uu tien so dung sau "No." / "So"
            var labeled = Regex.Match(plain, @"(?:SO|NO\.?|SO / NO)[^\d]{0,12}(\d{9}|\d{12})", RegexOptions.IgnoreCase);
            if (labeled.Success) return labeled.Groups[1].Value;

            var all = ExtractAllIdNumbers(joined);
            // uu tien 12 so
            return all.FirstOrDefault(x => x.Length == 12) ?? all.FirstOrDefault();
        }

        private static string? ExtractByLabel(List<string> lines, string[] labels)
        {
            for (var i = 0; i < lines.Count; i++)
            {
                var line = lines[i];
                var plain = RemoveDiacritics(line).ToLowerInvariant();
                foreach (var label in labels)
                {
                    if (!plain.Contains(label)) continue;

                    var valueParts = new List<string>();
                    var colon = line.IndexOf(':');
                    if (colon >= 0 && colon < line.Length - 1)
                    {
                        var v = line[(colon + 1)..].Trim();
                        if (v.Length >= 2 && !IsLabel(v)) valueParts.Add(Clean(v));
                    }
                    else
                    {
                        // Bố cục CCCD thường là: "Nơi thường trú / Place of residence: Tổ 15" hoặc label rồi xuống dòng.
                        var after = Regex.Replace(line, @".*?(?:" + string.Join("|", labels.Select(Regex.Escape)) + @")[:/\s.-]*", string.Empty, RegexOptions.IgnoreCase).Trim(" :-/".ToCharArray());
                        if (!string.IsNullOrWhiteSpace(after) && after.Length >= 2 && !IsLabel(after))
                            valueParts.Add(Clean(after));
                    }

                    // Với địa chỉ/ quê quán, lấy thêm tối đa 2 dòng tiếp theo nếu không phải label mới.
                    var isAddressLike = labels.Any(x => x.Contains("que") || x.Contains("origin") || x.Contains("thuong tru") || x.Contains("dia chi") || x.Contains("residence") || x.Contains("address"));
                    var maxNext = isAddressLike ? 2 : 1;
                    for (var j = 1; j <= maxNext && i + j < lines.Count; j++)
                    {
                        var next = lines[i + j].Trim();
                        var nextPlain = RemoveDiacritics(next);
                        if (next.Length < 2) break;
                        if (IsLabel(next)) break;
                        if (Regex.IsMatch(RemoveDiacritics(nextPlain), @"(?i)noi\s+thu|place\s+of\s+resid|que\s+quan|ngay\s+sinh|gioi\s+tinh|quoc\s+tich")) break;
                        if (Regex.IsMatch(nextPlain, @"^\d+$")) break;
                        if (isAddressLike || valueParts.Count == 0)
                            valueParts.Add(Clean(next));
                    }

                    var result = string.Join(", ", valueParts.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct());
                    if (!string.IsNullOrWhiteSpace(result)) return result;
                }
            }
            return null;
        }

        private static string? GuessName(List<string> lines)
        {
            // CCCD: ten thuong o dong sau "Full name"
            for (var i = 0; i < lines.Count; i++)
            {
                var p = RemoveDiacritics(lines[i]).ToLowerInvariant();
                if ((p.Contains("full name") || p.Contains("ho va ten") || p.Contains("ho ten")) && i + 1 < lines.Count)
                {
                    var next = Clean(lines[i + 1]);
                    var pn = RemoveDiacritics(next);
                    if (!IsLabel(next) && !Regex.IsMatch(pn, @"\d") && pn.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length is >= 2 and <= 6)
                        return next;
                }
            }

            foreach (var line in lines)
            {
                var plain = RemoveDiacritics(line);
                if (plain.Length < 5 || plain.Length > 60) continue;
                if (Regex.IsMatch(plain, @"\d")) continue;
                if (IsLabel(line)) continue;
                var words = plain.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (words.Length is >= 2 and <= 6 && words.All(w => Regex.IsMatch(w, @"^[A-Za-z]+$")))
                    return Clean(line);
            }
            return null;
        }

        private static string? ExtractDate(string plain, string[] labels, bool allowAnyDateFallback = true)
        {
            foreach (var label in labels)
            {
                var pattern = label.Replace(" ", @"\s*") + @"[^\d\n]{0,30}(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})";
                var m = Regex.Match(plain ?? string.Empty, pattern, RegexOptions.IgnoreCase);
                if (m.Success) return NormalizeDate(m.Groups[1].Value);
            }

            if (!allowAnyDateFallback) return null;

            // dạng: Date, month, year:16/02/2023
            var m2 = Regex.Match(plain ?? string.Empty, @"(?:DATE|YEAR)[^\d]{0,20}(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})", RegexOptions.IgnoreCase);
            if (m2.Success) return NormalizeDate(m2.Groups[1].Value);

            var any = Regex.Match(plain ?? string.Empty, @"\b(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})\b");
            return any.Success ? NormalizeDate(any.Groups[1].Value) : null;
        }

        private static string? CleanOcrField(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var cleaned = Regex.Replace(value ?? string.Empty, @"[\r\n]+", " ").Trim();
            // Loại ký tự rác thường gặp từ OCR địa chỉ/quê quán.
            cleaned = Regex.Replace(cleaned, @"[&`""'‘’""\|{}\(\)\[\];@#~\$%\^*\+=\\]", " ");
            cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim(" ,.-_".ToCharArray());
            cleaned = Regex.Replace(cleaned, @"Krdng", "Krông", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"\bW\b", " ", RegexOptions.IgnoreCase).Trim();
            cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();
            var plain = RemoveDiacritics(cleaned);
            if (CountAlphaNum(plain) < 4) return null;
            if (Regex.IsMatch(plain, @"^[\W_\d]+$")) return null;
            cleaned = Regex.Replace(cleaned, @"\bTh[oô]n\s*[%#]?\s*N\s*4\b", "Thôn 1", RegexOptions.IgnoreCase);
            return cleaned;
        }

        private static string? CleanAddressField(string? value)
        {
            var cleaned = CleanOcrField(value);
            if (cleaned == null) return null;

            // Bo prefix nhan dinh san
            cleaned = Regex.Replace(cleaned, @"^(?:Noi\s+thuong\s+tru|Place\s+of\s+residence)\s*[:/.-]*\s*", string.Empty, RegexOptions.IgnoreCase);

            // Sua cum dia danh hay bi OCR meo: Krong Bong, Dak Lak
            cleaned = Regex.Replace(cleaned, @"K[rn]?[oôòó]ng\s*\S*", "Krông Bông", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"Đ[aăắ]k\s*L[aăắeé]k.*$", "Đắk Lắk", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"Dak\s*Lak.*$", "Đắk Lắk", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"\b(?:lv\s*iv|iv\s*lv)\b", " ", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"Krông Bông[,.\s]+Đắk Lắk", "Krông Bông, Đắk Lắk", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"\s*[.]\s*", ", ");
            cleaned = Regex.Replace(cleaned, @"(,\s*){2,}", ", ").Trim(' ', ',', '.', ';', '-');
            return CleanOcrField(cleaned);
        }

        private static string? CleanOriginField(string? value)
        {
            var cleaned = CleanOcrField(value);
            if (cleaned == null) return null;

            // Cat rac "Noi thuong tru / Place of residence" dinh vao que quan (ke ca OCR loi: Noi thu mgtru/)
            cleaned = Regex.Replace(
                cleaned,
                @"[,.\s]*(?:N[oơòóõọ]i\s+th[uưùúũụ].*|(?:P/?ace|Place)\s+of\s+resid\w*.*)$",
                string.Empty,
                RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // Fallback theo ban khong dau de bat chac OCR meo chu
            var plain = RemoveDiacritics(cleaned);
            var cutMarkers = new[] { "Noi thu", "Noi th", "Place of resid", "Pace of resid" };
            var cutAt = -1;
            foreach (var marker in cutMarkers)
            {
                var idx2 = plain.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                if (idx2 >= 0 && (cutAt < 0 || idx2 < cutAt)) cutAt = idx2;
            }
            if (cutAt > 3 && cutAt <= cleaned.Length)
                cleaned = cleaned[..cutAt];

            cleaned = Regex.Replace(cleaned, @"^\s*[,.\s;:-]+", string.Empty);
            // OCR hay doc vien trai cua o thanh 1 chu cai le (i, l, j, t...) roi dinh vao dau que quan.
            // Dia danh VN khong bao gio bat dau bang 1 chu cai don tach roi, nen bo an toan.
            cleaned = Regex.Replace(cleaned, @"^[iIlLjJtT|]\s+(?=\p{Lu})", string.Empty);
            cleaned = Regex.Replace(cleaned, @"Binh\s+Định", "Bình Định", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"Binh\s+Dinh", "Bình Định", RegexOptions.IgnoreCase);
            cleaned = Regex.Replace(cleaned, @"\s*[.]\s*", ", ");
            cleaned = Regex.Replace(cleaned, @"(,\s*){2,}", ", ").Trim(' ', ',', '.', ';', '-');
            return CleanOcrField(cleaned);
        }

        private static string? ExtractBirthDateFromFront(string? frontText, string? issueDate = null)
        {
            var text = RemoveDiacritics(frontText ?? string.Empty);

            // Uu tien ngay gan nhan Ngay sinh / Date of birth
            var labeled = Regex.Match(
                text,
                @"(?:ngay\s*sinh|date\s*of\s*birth|dob)[^\d]{0,40}(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})",
                RegexOptions.IgnoreCase);
            if (labeled.Success)
            {
                var normalized = NormalizeDate(labeled.Groups[1].Value);
                if (!string.IsNullOrWhiteSpace(issueDate) && string.Equals(normalized, issueDate, StringComparison.Ordinal))
                    return null;
                return normalized;
            }

            var compact = Regex.Match(
                text,
                @"(?:ngay\s*sinh|date\s*of\s*birth|dob)[^\d]{0,40}(\d{8})",
                RegexOptions.IgnoreCase);
            if (compact.Success)
            {
                var normalized = NormalizeCompactDate(compact.Groups[1].Value);
                if (!string.IsNullOrWhiteSpace(normalized)
                    && !(!string.IsNullOrWhiteSpace(issueDate) && string.Equals(normalized, issueDate, StringComparison.Ordinal)))
                    return normalized;
            }

            var matches = Regex.Matches(text, @"\b(\d{1,2}[\/\-.\s]\d{1,2}[\/\-.\s]\d{2,4})\b");
            foreach (Match m in matches)
            {
                var normalized = NormalizeDate(m.Groups[1].Value);
                if (!string.IsNullOrWhiteSpace(issueDate) && string.Equals(normalized, issueDate, StringComparison.Ordinal))
                    continue;
                var parts = normalized.Split('/');
                if (parts.Length != 3) continue;
                if (!int.TryParse(parts[2], out var year)) continue;
                // Ngay sinh hop ly voi CCCD
                if (year < 1900 || year > DateTime.Now.Year - 10) continue;
                return normalized;
            }
            return null;
        }

        // MRZ (machine-readable zone) o mat sau CCCD gan chip co checksum nen dang tin
        // hon OCR chu in (vd OCR doc "19lfJ6Jf2lIxI6" thay vi ngay sinh). TD1 gom 3 dong
        // 30 ky tu; dong 2 chua ngay sinh: YYMMDD + check + gioi tinh + YYMMDD(het han) + check + quoc tich.
        private static string? ExtractDobFromMrz(string? text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            var upper = RemoveDiacritics(text).ToUpperInvariant();
            foreach (var rawLine in upper.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                // Bo khoang trang de gom cac ky tu MRZ bi OCR tach roi.
                var line = Regex.Replace(rawLine, @"\s+", string.Empty);
                if (line.Length < 15) continue;
                var m = Regex.Match(line, @"(\d{6})\d[MFX<]\d{6}\d[A-Z<]{3}");
                if (!m.Success) continue;
                var dob = ParseMrzDate(m.Groups[1].Value);
                if (dob != null) return dob;
            }
            return null;
        }

        private static string? ParseMrzDate(string yymmdd)
        {
            if (yymmdd.Length != 6) return null;
            if (!int.TryParse(yymmdd[..2], out var yy)
                || !int.TryParse(yymmdd.Substring(2, 2), out var mm)
                || !int.TryParse(yymmdd.Substring(4, 2), out var dd))
                return null;
            if (mm is < 1 or > 12 || dd is < 1 or > 31) return null;
            // Ngay sinh: nam 2 chu so > nam hien tai (2 chu so) thi thuoc the ky truoc.
            var pivot = DateTime.Now.Year % 100;
            var year = yy <= pivot ? 2000 + yy : 1900 + yy;
            if (year is < 1900 or > 2100) return null;
            return string.Format("{0:00}/{1:00}/{2:0000}", dd, mm, year);
        }

        private static string? ExtractGender(string plain)
        {
            var m = Regex.Match(plain, @"(?:GIOI TINH|SEX)[^\nA-Z]{0,15}(NAM|NU|MALE|FEMALE|M|F)", RegexOptions.IgnoreCase);
            if (m.Success)
            {
                var v = m.Groups[1].Value.ToUpperInvariant();
                if (v is "NAM" or "MALE" or "M") return "Nam";
                if (v is "NU" or "FEMALE" or "F") return "Nữ";
            }
            if (Regex.IsMatch(plain, @"\bNAM\b") && !Regex.IsMatch(plain, @"\bNU\b")) return "Nam";
            if (Regex.IsMatch(plain, @"\bNU\b") || Regex.IsMatch(plain, @"\bFEMALE\b")) return "Nữ";
            return null;
        }

        private static string? NormalizeDate(string raw)
        {
            var cleaned = Regex.Replace(raw, @"\s+", "/").Replace('-', '/').Replace('.', '/');
            var parts = cleaned.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 3) return raw.Trim();
            if (!int.TryParse(parts[0], out var d) || !int.TryParse(parts[1], out var m) || !int.TryParse(parts[2], out var y))
                return raw.Trim();
            if (y < 100) y += 2000;
            if (d is < 1 or > 31 || m is < 1 or > 12 || y is < 1900 or > 2100) return raw.Trim();
            return string.Format("{0:00}/{1:00}/{2:0000}", d, m, y);
        }

        private static bool IsLabel(string value)
        {
            var p = RemoveDiacritics(value).ToLowerInvariant();
            string[] labels =
            {
                "ho va ten", "full name", "ngay sinh", "date of birth", "gioi tinh", "sex",
                "quoc tich", "nationality", "que quan", "noi thuong tru", "dia chi", "dan toc",
                "ton giao", "ngay cap", "noi cap", "can cuoc", "cong hoa", "socialist", "identity",
                "personal identification", "date, month, year", "citizen identity"
            };
            return labels.Any(l => p.Contains(l));
        }

        private static string Clean(string value) => Regex.Replace(value, @"\s+", " ").Trim(" :-_".ToCharArray());
        private static int CountAlphaNum(string text) => text.Count(char.IsLetterOrDigit);
        private static GiayToScanningResponse Fail(string msg) => new() { ThanhCong = false, ThongBao = msg };

        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            var norm = text.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder(norm.Length);
            foreach (var c in norm)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }
            return sb.ToString().Normalize(NormalizationForm.FormC).Replace('\u0111', 'd').Replace('\u0110', 'D');
        }

        private static string? ValidateRequest(GiayToScanningRequest request)
        {
            const long max = 5 * 1024 * 1024;
            var types = new[] { "image/jpeg", "image/png", "image/webp" };
            if (request.AnhMatTruoc == null || request.AnhMatSau == null)
                return "Vui lòng tải đủ ảnh mặt trước và mặt sau giấy tờ.";
            if (request.AnhMatTruoc.Length <= 0 || request.AnhMatSau.Length <= 0)
                return "File ảnh không hợp lệ.";
            if (request.AnhMatTruoc.Length > max || request.AnhMatSau.Length > max)
                return "Ảnh quá lớn. Kích thước tối đa là 5MB mỗi ảnh.";
            if (!types.Contains(request.AnhMatTruoc.ContentType) || !types.Contains(request.AnhMatSau.ContentType))
                return "Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.";
            return null;
        }
    }
}



