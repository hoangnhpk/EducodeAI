using educodeai_server.DTOs;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace educodeai_server.Services.Implement
{
    public class KhoaHocCuaToiService : IKhoaHocCuaToiService
    {
        private readonly IKhoaHocCuaToiRepository _repository;
        private readonly IGeminiAIService _gemini;
        private readonly IYouTubeService _youtubeService;
        private readonly IRedisService _redisService;
        private readonly ILogger<KhoaHocCuaToiService> _logger;

        public KhoaHocCuaToiService(
            IKhoaHocCuaToiRepository repository, 
            IGeminiAIService gemini, 
            IYouTubeService youtubeService, 
            IRedisService redisService,
            ILogger<KhoaHocCuaToiService> logger)
        {
            _repository = repository;
            _gemini = gemini;
            _youtubeService = youtubeService;
            _redisService = redisService;
            _logger = logger;
        }

        private async Task InvalidateCourseListAsync(int maGiangVien)
        {
            var key = $"Instructor:{maGiangVien}:CourseList";
            await _redisService.XoaKeyAsync(key);
            _logger.LogInformation("[CACHE INVALIDATE] Xóa danh sách khóa học của Giảng Viên #{Id}", maGiangVien);
        }

        // ===== COURSE MANAGEMENT =====
        public async Task<List<KhoaHocGiangVienListDTO>> GetDanhSachKhoaHocAsync(int maGiangVien)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            string cacheKey = $"Instructor:{maGiangVien}:CourseList";
            var cached = await _redisService.LayGiaTriAsync(cacheKey);
            List<KhoaHocGiangVienListDTO>? list = null;

            if (cached != null)
            {
                try
                {
                    list = JsonSerializer.Deserialize<List<KhoaHocGiangVienListDTO>>(cached);
                    if (list != null)
                    {
                        _logger.LogInformation("[CACHE HIT] GetDanhSachKhoaHocAsync - Giảng viên: {Id} ({Elapsed}ms)", maGiangVien, sw.ElapsedMilliseconds);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[CACHE ERROR] Lỗi parse JSON GetDanhSachKhoaHocAsync. Fallback sang DB.");
                    list = null;
                }
            }

            if (list == null)
            {
                _logger.LogInformation("[CACHE MISS] GetDanhSachKhoaHocAsync - Truy vấn DB cho giảng viên {Id}...", maGiangVien);
                var khoaHocs = await _repository.GetKhoaHocByGiangVienAsync(maGiangVien);
                list = khoaHocs.Select(MapToKhoaHocListDTO).ToList();
                
                await _redisService.LuuGiaTriAsync(cacheKey, JsonSerializer.Serialize(list), TimeSpan.FromMinutes(5));
                _logger.LogInformation("[DB QUERY] Đã lưu danh sách khóa học giảng viên {Id} vào Cache (TTL: 5m) - ({Elapsed}ms)", maGiangVien, sw.ElapsedMilliseconds);
            }
            return list;
        }

        public async Task<KhoaHocGiangVienDetailDTO?> GetChiTietKhoaHocAsync(int maKhoaHoc, int maGiangVien)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var version = await _redisService.LayVersionKhoaHocAsync(maKhoaHoc);
            string cacheKey = $"course:{maKhoaHoc}:instructor:{maGiangVien}:detail:v{version}";
            
            var cached = await _redisService.LayGiaTriAsync(cacheKey);
            KhoaHocGiangVienDetailDTO? detail = null;

            if (cached != null)
            {
                try
                {
                    detail = JsonSerializer.Deserialize<KhoaHocGiangVienDetailDTO>(cached);
                    if (detail != null)
                    {
                        _logger.LogInformation("[CACHE HIT] GetChiTietKhoaHocAsync(Static) - Khóa học {Id} ({Elapsed}ms)", maKhoaHoc, sw.ElapsedMilliseconds);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[CACHE ERROR] Lỗi parse JSON GetChiTietKhoaHocAsync. Fallback sang DB.");
                    detail = null;
                }
            }

            if (detail == null)
            {
                _logger.LogInformation("[CACHE MISS] GetChiTietKhoaHocAsync(Static) - Khóa học {Id} truy vấn DB...", maKhoaHoc);
                var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
                if (khoaHoc == null) return null;
                
                detail = MapToKhoaHocDetailDTO(khoaHoc);
                
                // Cache vĩnh viễn (24h) vì version sẽ tự invalid
                await _redisService.LuuGiaTriAsync(cacheKey, JsonSerializer.Serialize(detail), TimeSpan.FromHours(24));
                _logger.LogInformation("[DB QUERY] Đã lưu chi tiết tĩnh khóa học {Id} vào Cache (TTL: 24h) - ({Elapsed}ms)", maKhoaHoc, sw.ElapsedMilliseconds);
            }

            // OVERLAY: Lấy dữ liệu động từ DB mỗi request
            var dynamicData = await _repository.GetKhoaHocDynamicStatsAsync(maKhoaHoc, maGiangVien);
            if (dynamicData != null)
            {
                detail.SoHocVien = dynamicData.DangKyKhoaHocs?.Count ?? 0;
                detail.DiemDanhGiaTB = dynamicData.DiemDanhGiaTB;
                detail.TiLeHoanThanh = CalculateAverageProgress(dynamicData.DangKyKhoaHocs);
                detail.DanhSachHocVien = MapToHocVienDTOs(dynamicData.DangKyKhoaHocs);
            }
            else
            {
                return null; // Khóa học đã bị xóa
            }

            return detail;
        }

        public async Task<int> TaoKhoaHocAsync(int maGiangVien, KhoaHocCreateUpdateDTO dto)
        {
            ValidateKhoaHocData(dto);
            var khoaHoc = CreateKhoaHocFromDTO(maGiangVien, dto);
            await _repository.AddKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            // Xóa cache danh sách công khai khi có khóa học mới
            await _redisService.XoaKeyAsync("CourseList:Public");
            await InvalidateCourseListAsync(maGiangVien);
            return khoaHoc.MaKhoaHoc;
        }

        public async Task<bool> CapNhatKhoaHocAsync(int maKhoaHoc, int maGiangVien, KhoaHocCreateUpdateDTO dto)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;
            ValidateKhoaHocData(dto);
            UpdateKhoaHocFromDTO(khoaHoc, dto);
            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            // Tăng version -> cache cũ tự expire theo TTL
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            await _redisService.XoaKeyAsync("CourseList:Public");
            return true;
        }

        // ===== XOÁ KHOÁ HỌC (SOFT DELETE) =====
        public async Task<bool> XoaKhoaHocAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;
            khoaHoc.TrangThai = "Đã xóa";
            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            // Tăng version + xóa list cache khi khóa học bị xóa
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            await _redisService.XoaKeyAsync("CourseList:Public");
            return true;
        }

        // ===== THÊM CHƯƠNG =====
        public async Task<ThemChuongResponseDTO> ThemChuongAsync(int maKhoaHoc, int maGiangVien, ChuongHocCreateUpdateDTO dto)
        {
            var chuong = new ChuongHocModel
            {
                MaKhoaHoc = maKhoaHoc,
                TenChuong = dto.TenChuong,
                ThuTu = dto.ThuTu,
            };
            await _repository.AddChuongAsync(chuong);
            await _repository.SaveChangesAsync();
            // Thêm chương -> nội dung khóa học thay đổi
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            return new ThemChuongResponseDTO
            {
                MaChuong = chuong.MaChuong,
                TenChuong = chuong.TenChuong,
                ThuTu = chuong.ThuTu,
            };
        }

        // ===== CẬP NHẬT CHƯƠNG =====
        public async Task<bool> CapNhatChuongAsync(int maChuong, int maGiangVien, ChuongHocCreateUpdateDTO dto)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null) return false;
            if (chuong.KhoaHoc.MaGiangVien != maGiangVien) return false;
            chuong.TenChuong = dto.TenChuong;
            chuong.ThuTu = dto.ThuTu;
            await _repository.UpdateChuongAsync(chuong);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(chuong.KhoaHoc.MaKhoaHoc);
            return true;
        }

        // ===== XOÁ CHƯƠNG =====
        public async Task<bool> XoaChuongAsync(int maChuong, int maGiangVien)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null) return false;
            if (chuong.KhoaHoc.MaGiangVien != maGiangVien) return false;
            await _repository.DeleteChuongAsync(chuong);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(chuong.KhoaHoc.MaKhoaHoc);
            return true;
        }

        // ===== THÊM VIDEO =====
        public async Task<ThemVideoResponseDTO> ThemVideoAsync(int maChuong, int maGiangVien, BaiHocVideoCreateUpdateDTO dto)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null || chuong.KhoaHoc.MaGiangVien != maGiangVien)
                throw new UnauthorizedAccessException("KhÃ´ng cÃ³ quyá»n thÃªm video vÃ o chÆ°Æ¡ng nÃ y.");

            var baiHoc = new BaiHocModel
            {
                MaChuong = maChuong,
                TieuDe = dto.TieuDe,
                NoiDung = WrapParagraph(dto.MoTa),
                LinkVideo = ExtractEmbedUrl(dto.LinkVideo),
                ThoiLuong = dto.ThoiLuong,
                ThuTu = dto.ThuTu,
                LoaiBaiHoc = "Video",
            };

            await _repository.AddBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(chuong.KhoaHoc.MaKhoaHoc);

            return new ThemVideoResponseDTO
            {
                MaBaiHoc = baiHoc.MaBaiHoc,
                TieuDe = baiHoc.TieuDe,
                LinkVideo = dto.LinkVideo,
                ThoiLuong = baiHoc.ThoiLuong ?? 0,
                ThuTu = baiHoc.ThuTu,
            };
        }

        // ===== CẬP NHẬT VIDEO =====
        public async Task<bool> CapNhatVideoAsync(int maBaiHoc, int maGiangVien, BaiHocVideoCreateUpdateDTO dto)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;
            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            baiHoc.TieuDe = dto.TieuDe;
            baiHoc.NoiDung = WrapParagraph(dto.MoTa ?? baiHoc.NoiDung);
            baiHoc.LinkVideo = ExtractEmbedUrl(dto.LinkVideo);
            baiHoc.ThoiLuong = dto.ThoiLuong;
            baiHoc.ThuTu = dto.ThuTu;

            await _repository.UpdateBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(baiHoc.ChuongHoc.KhoaHoc.MaKhoaHoc);
            return true;
        }

        // ===== XOÁ VIDEO HOẶC FILE =====
        public async Task<bool> XoaVideoAsync(int maBaiHoc, int maGiangVien, string webRootPath)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;

            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            if (baiHoc.LoaiBaiHoc == "File" && !string.IsNullOrEmpty(baiHoc.LinkVideo))
            {
                try
                {
                    var fileName = System.IO.Path.GetFileName(baiHoc.LinkVideo);
                    var filePath = System.IO.Path.Combine(webRootPath, "uploads", "bai-hoc", fileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch { } // Ignore delete fail
            }

            await _repository.DeleteBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(baiHoc.ChuongHoc.KhoaHoc.MaKhoaHoc);
            return true;
        }

        // ===== THÊM FILE =====
        public async Task<ThemFileResponseDTO> ThemFileAsync(int maChuong, int maGiangVien, BaiHocFileCreateUpdateDTO dto, string webRootPath)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null || chuong.KhoaHoc.MaGiangVien != maGiangVien)
                throw new UnauthorizedAccessException("Không có quyền thêm bài học vào chương này.");

            string? fileUrl = null;
            if (dto.File != null && dto.File.Length > 0)
            {
                var allowedTypes = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".zip", ".rar" };
                var ext = System.IO.Path.GetExtension(dto.File.FileName).ToLowerInvariant();
                if (!allowedTypes.Contains(ext))
                    throw new ArgumentException("Định dạng file không được hỗ trợ.");
                if (dto.File.Length > 50 * 1024 * 1024)
                    throw new ArgumentException("Kích thước file không được vượt quá 50MB.");

                var folder = System.IO.Path.Combine(webRootPath, "uploads", "bai-hoc");
                System.IO.Directory.CreateDirectory(folder);

                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = System.IO.Path.Combine(folder, fileName);

                await using var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create);
                await dto.File.CopyToAsync(stream);

                fileUrl = $"/uploads/bai-hoc/{fileName}";
            }

            var baiHoc = new BaiHocModel
            {
                MaChuong = maChuong,
                TieuDe = dto.TieuDe,
                NoiDung = WrapParagraph(dto.MoTa),
                LinkVideo = fileUrl,
                ThuTu = dto.ThuTu,
                LoaiBaiHoc = "File",
            };

            await _repository.AddBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            // Thêm bài học File -> invalidate cache
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(chuong.KhoaHoc.MaKhoaHoc);

            return new ThemFileResponseDTO
            {
                MaBaiHoc = baiHoc.MaBaiHoc,
                TieuDe = baiHoc.TieuDe,
                MoTa = baiHoc.NoiDung,
                LinkVideo = baiHoc.LinkVideo,
                ThuTu = baiHoc.ThuTu,
            };
        }

        // ===== CẬP NHẬT FILE =====
        public async Task<bool> CapNhatFileAsync(int maBaiHoc, int maGiangVien, BaiHocFileCreateUpdateDTO dto, string webRootPath)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;
            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            baiHoc.TieuDe = dto.TieuDe;
            baiHoc.NoiDung = WrapParagraph(dto.MoTa ?? baiHoc.NoiDung);
            baiHoc.ThuTu = dto.ThuTu;

            if (dto.File != null && dto.File.Length > 0)
            {
                var allowedTypes = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".zip", ".rar" };
                var ext = System.IO.Path.GetExtension(dto.File.FileName).ToLowerInvariant();
                if (!allowedTypes.Contains(ext))
                    throw new ArgumentException("Định dạng file không được hỗ trợ.");
                if (dto.File.Length > 50 * 1024 * 1024)
                    throw new ArgumentException("Kích thước file không được vượt quá 50MB.");

                var folder = System.IO.Path.Combine(webRootPath, "uploads", "bai-hoc");
                System.IO.Directory.CreateDirectory(folder);

                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = System.IO.Path.Combine(folder, fileName);

                await using var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create);
                await dto.File.CopyToAsync(stream);

                if (!string.IsNullOrEmpty(baiHoc.LinkVideo))
                {
                    try
                    {
                        var oldFileName = System.IO.Path.GetFileName(baiHoc.LinkVideo);
                        var oldFilePath = System.IO.Path.Combine(webRootPath, "uploads", "bai-hoc", oldFileName);
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }
                    catch { } // Ignore errors when deleting old file
                }

                baiHoc.LinkVideo = $"/uploads/bai-hoc/{fileName}";
            }

            await _repository.UpdateBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            // Cập nhật bài học File -> invalidate cache
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(baiHoc.ChuongHoc.KhoaHoc.MaKhoaHoc);
            return true;
        }

        public async Task<KetQuaTaoDeChungChiAIDTO> TaoDeChungChiBangAIAsync(int maKhoaHoc, int maGiangVien)
        {
            try
            {
                var khoaHoc = await _repository.GetKhoaHocForCertificateAsync(maKhoaHoc, maGiangVien);
                if (khoaHoc == null)
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Không tìm thấy khóa học." };

                if (!khoaHoc.CoChungChi)
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Khóa học này chưa bật chế độ chứng chỉ." };

                if (khoaHoc.ChuongHocs == null || !khoaHoc.ChuongHocs.Any() || !khoaHoc.ChuongHocs.Any(c => c.BaiHocs != null && c.BaiHocs.Any()))
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Khóa học chưa có bài học nào để tạo đề." };

                var noiDungKhoaHoc = TaoNoiDungTongHopChoAI(khoaHoc);
                if (string.IsNullOrWhiteSpace(noiDungKhoaHoc))
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Khóa học chưa có đủ nội dung để AI tạo đề chứng chỉ." };

                var soCauHoi = khoaHoc.SoCauHoiChungChi > 0 ? khoaHoc.SoCauHoiChungChi : 20;
                var prompt = TaoPromptDeThiChungChi(khoaHoc, noiDungKhoaHoc, soCauHoi);

                Console.WriteLine($"[AI Certificate] Bắt đầu gọi AI cho khóa {maKhoaHoc}");
                Console.WriteLine($"[AI Certificate Prompt]: {prompt}");

                var aiResult = await _gemini.GenerateAsync(prompt);

                string rawTextFromAI = "";
                try
                {
                    rawTextFromAI = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(aiResult);
                    Console.WriteLine($"[AI Certificate Raw Content]:\n{rawTextFromAI}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AI Certificate Error] Không lấy được text từ Gemini: {ex.Message}");
                    Console.WriteLine($"[AI Certificate Raw Output]: {aiResult}");
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Phản hồi từ AI không đúng cấu trúc (không thấy content)." };
                }

                // Tìm kiếm mảng JSON bằng Regex vì helper kia chỉ support code block object
                var jsonMatch = System.Text.RegularExpressions.Regex.Match(rawTextFromAI, @"\[\s*\{[\s\S]*\}\s*\]");
                if (!jsonMatch.Success)
                {
                    Console.WriteLine("[AI Certificate Error] AI trả về kết quả không chứa mảng JSON.");
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "AI trả về nội dung không phải JSON hợp lệ. Vui lòng thử lại." };
                }

                var jsonChuanHoa = jsonMatch.Value;
                Console.WriteLine($"[AI Certificate JSON Parsed]:\n{jsonChuanHoa}");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true
                };

                List<CauHoiChungChiAIItem> danhSachCauHoi;
                try
                {
                    danhSachCauHoi = JsonSerializer.Deserialize<List<CauHoiChungChiAIItem>>(jsonChuanHoa, options) ?? new List<CauHoiChungChiAIItem>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AI Certificate Parse Error]: {ex.Message}");
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Lỗi khi đọc kết quả JSON từ AI." };
                }

                if (danhSachCauHoi.Count == 0)
                {
                    return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "AI chưa trả về bộ đề hợp lệ (danh sách rỗng)." };
                }

                khoaHoc.DuLieuDeChungChiJSON = Newtonsoft.Json.JsonConvert.SerializeObject(
                    danhSachCauHoi.Select((cauHoi, index) => new
                    {
                        id = index + 1,
                        cauHoi = cauHoi.CauHoi ?? "",
                        dapAnA = cauHoi.DapAnA ?? "",
                        dapAnB = cauHoi.DapAnB ?? "",
                        dapAnC = cauHoi.DapAnC ?? "",
                        dapAnD = cauHoi.DapAnD ?? "",
                        dapAnDung = (cauHoi.DapAnDung ?? "A").Trim().ToUpper(),
                        giaiThich = cauHoi.GiaiThich ?? ""
                    }),
                    Newtonsoft.Json.Formatting.Indented
                );
                khoaHoc.NguonDeChungChi = "AI";
                khoaHoc.NgayTaoDeChungChi = DateTime.UtcNow;

                await _repository.UpdateKhoaHocAsync(khoaHoc);
                await _repository.SaveChangesAsync();
                await InvalidateCourseListAsync(maGiangVien);
                await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);

                Console.WriteLine($"[AI Certificate] Lưu DB thành công cho khóa {maKhoaHoc}");

                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = true,
                    ThongBao = "Đã tạo đề chứng chỉ bằng AI thành công.",
                    SoCauHoi = danhSachCauHoi.Count,
                    NguonDeChungChi = khoaHoc.NguonDeChungChi,
                    NgayTaoDeChungChi = khoaHoc.NgayTaoDeChungChi
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AI Certificate Exception]: {ex}");
                return new KetQuaTaoDeChungChiAIDTO { ThanhCong = false, ThongBao = "Xảy ra lỗi hệ thống khi tạo đề. Vui lòng xem log." };
            }
        }

        public async Task<List<CauHoiChungChiDTO>> GetDeChungChiAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocForCertificateAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null || string.IsNullOrWhiteSpace(khoaHoc.DuLieuDeChungChiJSON))
                return new List<CauHoiChungChiDTO>();

            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<List<CauHoiChungChiDTO>>(khoaHoc.DuLieuDeChungChiJSON, options) 
                       ?? new List<CauHoiChungChiDTO>();
            }
            catch
            {
                return new List<CauHoiChungChiDTO>();
            }
        }

        public async Task<bool> UpdateDeChungChiAsync(int maKhoaHoc, int maGiangVien, List<CauHoiChungChiDTO> danhSachCauHoi)
        {
            var khoaHoc = await _repository.GetKhoaHocForCertificateAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            var dtoList = danhSachCauHoi.Select((c, index) => new
            {
                id = index + 1,
                cauHoi = c.CauHoi ?? "",
                dapAnA = c.DapAnA ?? "",
                dapAnB = c.DapAnB ?? "",
                dapAnC = c.DapAnC ?? "",
                dapAnD = c.DapAnD ?? "",
                dapAnDung = (c.DapAnDung ?? "A").Trim().ToUpper(),
                giaiThich = c.GiaiThich ?? ""
            }).ToList();

            khoaHoc.DuLieuDeChungChiJSON = Newtonsoft.Json.JsonConvert.SerializeObject(
                dtoList,
                Newtonsoft.Json.Formatting.Indented
            );
            khoaHoc.NguonDeChungChi = "NguoiDung";
            khoaHoc.NgayTaoDeChungChi = DateTime.UtcNow;

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            return true;
        }

        private static string? ExtractEmbedUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;

            var patterns = new[]
            {
                @"[?&]v=([^&]+)",
                @"youtu\.be/([^?&]+)",
                @"embed/([^?&/]+)",
                @"shorts/([^?&]+)",
    };

            foreach (var pattern in patterns)
            {
                var match = System.Text.RegularExpressions.Regex.Match(url, pattern);
                if (match.Success)
                    return $"https://www.youtube.com/embed/{match.Groups[1].Value}";
            }

            return url;
        }

        private static string TaoNoiDungTongHopChoAI(KhoaHocModel khoaHoc)
        {
            var phanNoiDung = khoaHoc.ChuongHocs?
                .OrderBy(chuong => chuong.ThuTu)
                .SelectMany(chuong => chuong.BaiHocs.OrderBy(baiHoc => baiHoc.ThuTu))
                .Select((baiHoc, index) =>
                {
                    // Lược bỏ hoàn toàn NoiDung/MoTa từ Youtube để tránh spam vào prompt gây nhiễu AI
                    return $"Bài {index + 1}: {baiHoc.TieuDe}";
                })
                .ToList() ?? new List<string>();

            return string.Join("\n\n", phanNoiDung);
        }

        private static string TaoPromptDeThiChungChi(KhoaHocModel khoaHoc, string noiDungKhoaHoc, int soCauHoi)
        {
            var tenChungChi = khoaHoc.TenChungChi ?? "Chứng nhận hoàn thành";
            return $@"Bạn là hệ thống tạo đề thi. Chỉ trả về JSON hợp lệ, không giải thích.
Tạo đúng {soCauHoi} câu hỏi trắc nghiệm dựa trên nội dung khóa học.

THÔNG TIN:
- Tên khóa học: {khoaHoc.TenKhoaHoc}
- Tên chứng chỉ: {tenChungChi}
- Mô tả khóa học: {khoaHoc.MoTa}
- Nội dung tóm tắt:
{noiDungKhoaHoc}

YÊU CẦU BẮT BUỘC:
1. Không dùng markdown.
2. Không trả về bất kỳ text nào ngoài cú pháp mảng JSON hợp lệ.
3. TUYỆT ĐỐI KHÔNG dùng dấu ngoặc kép ("") bên trong các đoạn text/mã code của câu hỏi hay đáp án. Hãy ưu tiên dùng dấu nháy đơn ('') để tránh làm hỏng cấu trúc JSON.
4. Trả về đúng 1 mảng JSON chứa các objects như ví dụ bên dưới:

[
  {{
    ""id"": 1,
    ""cauHoi"": ""Ví dụ câu hỏi?"",
    ""dapAnA"": ""Ví dụ A"",
    ""dapAnB"": ""Ví dụ B"",
    ""dapAnC"": ""Ví dụ C"",
    ""dapAnD"": ""Ví dụ D"",
    ""dapAnDung"": ""A"",
    ""giaiThich"": ""Giải thích ngắn gọn cho đáp án A.""
  }}
]

BẮT ĐẦU (Chỉ output JSON, không giải thích):";
        }

        // ===== YOUTUBE PLAYLIST IMPORT =====
        public async Task<YouTubePlaylistAnalyzeResponseDTO> AnalyzePlaylistAsync(string playlistUrl)
        {
            if (!_youtubeService.IsValidPlaylistUrl(playlistUrl))
            {
                return new YouTubePlaylistAnalyzeResponseDTO
                {
                    Success = false,
                    Message = "URL playlist không hợp lệ"
                };
            }

            var playlistInfo = await _youtubeService.GetPlaylistInfoAsync(playlistUrl);
            if (playlistInfo == null)
            {
                return new YouTubePlaylistAnalyzeResponseDTO
                {
                    Success = false,
                    Message = "Không thể lấy thông tin playlist"
                };
            }

            return new YouTubePlaylistAnalyzeResponseDTO
            {
                Success = true,
                Message = "Phân tích playlist thành công",
                PlaylistInfo = playlistInfo
            };
        }

        public async Task<YouTubePlaylistVideosResponseDTO> GetPlaylistVideosAsync(string playlistId)
        {
            var videos = await _youtubeService.GetPlaylistVideosAsync(playlistId);

            return new YouTubePlaylistVideosResponseDTO
            {
                Success = true,
                Message = $"Tìm thấy {videos.Count} video",
                Videos = videos
            };
        }

        public async Task<YouTubePlaylistImportResponseDTO> ImportPlaylistAsync(int maKhoaHocId, int maGiangVien, YouTubePlaylistImportRequestDTO request)
        {
            var khoaHoc = await _repository.GetKhoaHocForCertificateAsync(maKhoaHocId, maGiangVien);
            if (khoaHoc == null)
            {
                return new YouTubePlaylistImportResponseDTO
                {
                    Success = false,
                    Message = "Không tìm thấy khóa học hoặc không có quyền"
                };
            }

            ChuongHocModel? chuong = null;

            if (request.TargetChapterId.HasValue && request.TargetChapterId.Value > 0)
            {
                chuong = khoaHoc.ChuongHocs?.FirstOrDefault(c => c.MaChuong == request.TargetChapterId.Value);
                if (chuong == null)
                {
                    return new YouTubePlaylistImportResponseDTO
                    {
                        Success = false,
                        Message = "Không tìm thấy chương hoặc không có quyền"
                    };
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.NewChapterName))
            {
                chuong = new ChuongHocModel
                {
                    MaKhoaHoc = maKhoaHocId,
                    TenChuong = request.NewChapterName,
                    ThuTu = (khoaHoc.ChuongHocs?.Max(c => (int?)c.ThuTu) ?? 0) + 1
                };
                await _repository.AddChuongAsync(chuong);
                await _repository.SaveChangesAsync(); // save to generate MaChuong

                // Initialize BaiHocs collection for newly created chapter
                chuong.BaiHocs = new List<BaiHocModel>();
            }
            else
            {
                return new YouTubePlaylistImportResponseDTO
                {
                    Success = false,
                    Message = "Phải cung cấp tên chương mới hoặc chọn chương có sẵn"
                };
            }

            var importedLessons = new List<BaiHocVideoDetailDTO>();
            var currentOrder = chuong.BaiHocs?.Max(b => (int?)b.ThuTu) ?? 0;

            foreach (var video in request.Videos)
            {
                var title = string.IsNullOrWhiteSpace(video.Title) ? "Video chưa có tên" : video.Title;
                if (title.Length > 200) title = title.Substring(0, 197) + "..."; // prevent DbUpdateException

                var baiHoc = new BaiHocModel
                {
                    MaChuong = chuong.MaChuong,
                    TieuDe = title,
                    NoiDung = WrapParagraph(video.Description),
                    LinkVideo = $"https://www.youtube.com/watch?v={video.VideoId}",
                    ThoiLuong = video.Duration > 0 ? (video.Duration / 60) : 0, // Convert to minutes or 0
                    ThuTu = ++currentOrder,
                    LoaiBaiHoc = "Video"
                };

                await _repository.AddBaiHocAsync(baiHoc);

                importedLessons.Add(new BaiHocVideoDetailDTO
                {
                    MaBaiHoc = baiHoc.MaBaiHoc,
                    TieuDe = baiHoc.TieuDe,
                    LinkVideo = baiHoc.LinkVideo,
                    ThoiLuong = baiHoc.ThoiLuong ?? 0,
                    ThuTu = baiHoc.ThuTu
                });
            }

            await _repository.SaveChangesAsync();
            // Import playlist -> nội dung khóa học thay đổi lớn
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHocId);

            return new YouTubePlaylistImportResponseDTO
            {
                Success = true,
                Message = $"Đã import thành công {importedLessons.Count} bài học",
                ImportedCount = importedLessons.Count,
                ImportedLessons = importedLessons
            };
        }

        public async Task<YouTubeVideoInfoResponseDTO> GetVideoInfoAsync(string videoUrl)
        {
            var videoId = _youtubeService.ExtractVideoId(videoUrl);
            if (string.IsNullOrEmpty(videoId))
            {
                return new YouTubeVideoInfoResponseDTO
                {
                    Success = false,
                    Message = "URL video không hợp lệ"
                };
            }

            var videoInfo = await _youtubeService.GetVideoInfoAsync(videoId);
            if (videoInfo == null)
            {
                return new YouTubeVideoInfoResponseDTO
                {
                    Success = false,
                    Message = "Không thể lấy thông tin video"
                };
            }

            return new YouTubeVideoInfoResponseDTO
            {
                Success = true,
                Message = "Lấy thông tin video thành công",
                VideoInfo = videoInfo
            };
        }

        // ===== REORDER FUNCTIONALITY =====
        public async Task<bool> ReorderChaptersAsync(int maGiangVien, int maKhoaHoc, List<ChapterReorderDTO> chapters)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            foreach (var chapter in chapters)
            {
                var chuong = khoaHoc.ChuongHocs?.FirstOrDefault(c => c.MaChuong == chapter.MaChuong);
                if (chuong != null)
                {
                    chuong.ThuTu = chapter.ThuTu;
                    await _repository.UpdateChuongAsync(chuong);
                }
            }

            await _repository.SaveChangesAsync();
            // Sắp xếp lại thứ tự chương -> invalidate cache
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            return true;
        }

        public async Task<bool> ReorderLessonsAsync(int maGiangVien, int maChuong, List<LessonReorderDTO> lessons)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null || chuong.KhoaHoc.MaGiangVien != maGiangVien) return false;

            foreach (var lesson in lessons)
            {
                var baiHoc = chuong.BaiHocs?.FirstOrDefault(b => b.MaBaiHoc == lesson.MaBaiHoc);
                if (baiHoc != null)
                {
                    baiHoc.ThuTu = lesson.ThuTu;
                    await _repository.UpdateBaiHocAsync(baiHoc);
                }
            }

            await _repository.SaveChangesAsync();
            // Sắp xếp lại thứ tự bài học -> invalidate cache
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(chuong.KhoaHoc.MaKhoaHoc);
            return true;
        }

        public async Task<bool> EnableCertificateAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            // Validate certificate data before enabling
            var errors = new List<string>();
            ValidateCertificateData(khoaHoc.DiemDatChungChi, khoaHoc.SoCauHoiChungChi, khoaHoc.ThoiGianLamBaiChungChi, errors);
            if (errors.Any())
                throw new ArgumentException(string.Join(" ", errors));

            khoaHoc.CoChungChi = true;
            if (string.IsNullOrWhiteSpace(khoaHoc.TenChungChi))
                khoaHoc.TenChungChi = "Chung nhan hoan thanh";

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            return true;
        }

        public async Task<bool> DisableCertificateAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            khoaHoc.CoChungChi = false;
            khoaHoc.DuLieuDeChungChiJSON = null;
            khoaHoc.NguonDeChungChi = null;
            khoaHoc.NgayTaoDeChungChi = null;

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            return true;
        }

        public async Task<CertificateConfigDTO?> GetCertificateConfigAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return null;

            return new CertificateConfigDTO
            {
                CoChungChi = khoaHoc.CoChungChi,
                TenChungChi = khoaHoc.TenChungChi,
                DiemDatChungChi = khoaHoc.DiemDatChungChi,
                SoCauHoiChungChi = khoaHoc.SoCauHoiChungChi,
                ThoiGianLamBaiChungChi = khoaHoc.ThoiGianLamBaiChungChi,
                DaCoDeThiChungChi = !string.IsNullOrWhiteSpace(khoaHoc.DuLieuDeChungChiJSON),
                NguonDeChungChi = khoaHoc.NguonDeChungChi,
                NgayTaoDeChungChi = khoaHoc.NgayTaoDeChungChi
            };
        }

        public async Task<bool> UpdateCertificateConfigAsync(int maKhoaHoc, int maGiangVien, CertificateConfigDTO config)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            if (config.CoChungChi)
            {
                var errors = new List<string>();
                ValidateCertificateData(config.DiemDatChungChi, config.SoCauHoiChungChi, config.ThoiGianLamBaiChungChi, errors);
                if (errors.Any())
                    throw new ArgumentException(string.Join(" ", errors));
            }

            khoaHoc.CoChungChi = config.CoChungChi;
            khoaHoc.TenChungChi = config.CoChungChi ? config.TenChungChi : null;
            khoaHoc.DiemDatChungChi = config.CoChungChi ? config.DiemDatChungChi : 80;
            khoaHoc.SoCauHoiChungChi = config.CoChungChi ? config.SoCauHoiChungChi : 20;
            khoaHoc.ThoiGianLamBaiChungChi = config.CoChungChi ? config.ThoiGianLamBaiChungChi : 30;

            if (!config.CoChungChi)
            {
                khoaHoc.DuLieuDeChungChiJSON = null;
                khoaHoc.NguonDeChungChi = null;
                khoaHoc.NgayTaoDeChungChi = null;
            }

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            await InvalidateCourseListAsync(maGiangVien);
            await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            return true;
        }

        // ===== HELPER METHODS =====

        private static string? WrapParagraph(string? content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return content;

            var trimmed = content.Trim();
            if (trimmed.StartsWith("<p>") && trimmed.EndsWith("</p>"))
                return content;

            return $"<p>{content}</p>";
        }

        private static KhoaHocGiangVienListDTO MapToKhoaHocListDTO(KhoaHocModel k)
        {
            return new KhoaHocGiangVienListDTO
            {
                MaKhoaHoc = k.MaKhoaHoc,
                TenKhoaHoc = k.TenKhoaHoc,
                HinhAnh = k.HinhAnh,
                LinhVuc = k.LinhVuc,
                TrinhDo = k.TrinhDo,
                ThoiLuongGio = k.ThoiLuongGio,
                SoHocVien = k.DangKyKhoaHocs?.Count ?? 0,
                DiemDanhGiaTB = k.DiemDanhGiaTB,
                TrangThai = k.TrangThai,
                GiaKhoaHoc = k.GiaKhoaHoc,
                DonViTienTe = k.DonViTienTe,
                ChoPhepMua = k.ChoPhepMua,
                CoChungChi = k.CoChungChi,
                DaCoDeThiChungChi = !string.IsNullOrWhiteSpace(k.DuLieuDeChungChiJSON),
                NgayTao = k.NgayTao,
                TienDoTrungBinh = CalculateAverageProgress(k.DangKyKhoaHocs)
            };
        }

        private static KhoaHocGiangVienDetailDTO MapToKhoaHocDetailDTO(KhoaHocModel k)
        {
            return new KhoaHocGiangVienDetailDTO
            {
                MaKhoaHoc = k.MaKhoaHoc,
                TenKhoaHoc = k.TenKhoaHoc,
                MoTa = k.MoTa,
                HinhAnh = k.HinhAnh,
                LinhVuc = k.LinhVuc,
                TrinhDo = k.TrinhDo,
                ThoiLuongGio = k.ThoiLuongGio,
                TrangThai = k.TrangThai,
                GiaKhoaHoc = k.GiaKhoaHoc,
                DonViTienTe = k.DonViTienTe,
                ChoPhepMua = k.ChoPhepMua,
                NgayTao = k.NgayTao,
                CoChungChi = k.CoChungChi,
                TenChungChi = k.TenChungChi,
                DiemDatChungChi = k.DiemDatChungChi,
                SoCauHoiChungChi = k.SoCauHoiChungChi,
                ThoiGianLamBaiChungChi = k.ThoiGianLamBaiChungChi,
                DaCoDeThiChungChi = !string.IsNullOrWhiteSpace(k.DuLieuDeChungChiJSON),
                NguonDeChungChi = k.NguonDeChungChi,
                NgayTaoDeChungChi = k.NgayTaoDeChungChi,
                SoHocVien = k.DangKyKhoaHocs?.Count ?? 0,
                DiemDanhGiaTB = k.DiemDanhGiaTB,
                KyNangChinh = k.KyNangChinh,
                TiLeHoanThanh = CalculateAverageProgress(k.DangKyKhoaHocs),
                DanhSachHocVien = MapToHocVienDTOs(k.DangKyKhoaHocs),
                DanhSachChuong = MapToChuongDTOs(k.ChuongHocs)
            };
        }

        private static double CalculateAverageProgress(ICollection<DangKyKhoaHocModel>? dangKyKhoaHocs)
        {
            return (dangKyKhoaHocs != null && dangKyKhoaHocs.Count > 0)
                ? dangKyKhoaHocs.Average(dk => (double)dk.TienDo)
                : 0.0;
        }

        private static List<HocVienTrongKhoaHocDTO> MapToHocVienDTOs(ICollection<DangKyKhoaHocModel>? dangKyKhoaHocs)
        {
            return dangKyKhoaHocs?.Select(d => new HocVienTrongKhoaHocDTO
            {
                MaNguoiDung = d.MaNguoiDung,
                HoTen = d.NguoiDung?.HoTen ?? "Khách",
                Email = d.NguoiDung?.Email ?? "No Email",
                AnhDaiDien = d.NguoiDung?.AnhDaiDien,
                NgayDangKy = d.NgayDangKy,
                TienDo = d.TienDo
            }).ToList() ?? new();
        }

        private static List<ChuongHocDetailDTO> MapToChuongDTOs(ICollection<ChuongHocModel>? chuongHocs)
        {
            return chuongHocs?.OrderBy(c => c.ThuTu).Select(c => new ChuongHocDetailDTO
            {
                MaChuong = c.MaChuong,
                TenChuong = c.TenChuong,
                ThuTu = c.ThuTu,
                DanhSachBaiHoc = MapToBaiHocDTOs(c.BaiHocs)
            }).ToList() ?? new();
        }

        private static List<BaiHocVideoDetailDTO> MapToBaiHocDTOs(ICollection<BaiHocModel>? baiHocs)
        {
            return baiHocs?.OrderBy(b => b.ThuTu).Select(b => new BaiHocVideoDetailDTO
            {
                MaBaiHoc = b.MaBaiHoc,
                TieuDe = b.TieuDe,
                LinkVideo = b.LinkVideo,
                ThoiLuong = b.ThoiLuong ?? 0,
                ThuTu = b.ThuTu,
                LoaiBaiHoc = b.LoaiBaiHoc
            }).ToList() ?? new();
        }

        private static KhoaHocModel CreateKhoaHocFromDTO(int maGiangVien, KhoaHocCreateUpdateDTO dto)
        {
            return new KhoaHocModel
            {
                TenKhoaHoc = dto.TenKhoaHoc,
                MoTa = dto.MoTa,
                HinhAnh = dto.HinhAnh,
                LinhVuc = dto.LinhVuc,
                TrinhDo = dto.TrinhDo,
                ThoiLuongGio = dto.ThoiLuongGio,
                TrangThai = dto.TrangThai,
                GiaKhoaHoc = dto.GiaKhoaHoc,
                DonViTienTe = string.IsNullOrWhiteSpace(dto.DonViTienTe) ? "VND" : dto.DonViTienTe,
                ChoPhepMua = true,
                MaGiangVien = maGiangVien,
                NgayTao = DateTime.Now,
                KyNangChinh = dto.KyNangChinh ?? string.Empty,
                CoChungChi = dto.CoChungChi,
                TenChungChi = dto.CoChungChi
                    ? (string.IsNullOrWhiteSpace(dto.TenChungChi) ? "Chung nhan hoan thanh" : dto.TenChungChi.Trim())
                    : null,
                DiemDatChungChi = dto.CoChungChi ? dto.DiemDatChungChi : 80,
                SoCauHoiChungChi = dto.CoChungChi ? dto.SoCauHoiChungChi : 20,
                ThoiGianLamBaiChungChi = dto.CoChungChi ? dto.ThoiGianLamBaiChungChi : 30
            };
        }

        private static void UpdateKhoaHocFromDTO(KhoaHocModel khoaHoc, KhoaHocCreateUpdateDTO dto)
        {
            khoaHoc.TenKhoaHoc = dto.TenKhoaHoc;
            khoaHoc.MoTa = dto.MoTa;
            khoaHoc.HinhAnh = dto.HinhAnh;
            khoaHoc.LinhVuc = dto.LinhVuc;
            khoaHoc.TrinhDo = dto.TrinhDo;
            khoaHoc.ThoiLuongGio = dto.ThoiLuongGio;
            khoaHoc.TrangThai = dto.TrangThai;
            khoaHoc.GiaKhoaHoc = dto.GiaKhoaHoc;
            khoaHoc.DonViTienTe = string.IsNullOrWhiteSpace(dto.DonViTienTe) ? "VND" : dto.DonViTienTe;
            khoaHoc.ChoPhepMua = true;
            khoaHoc.KyNangChinh = dto.KyNangChinh ?? string.Empty;
            khoaHoc.CoChungChi = dto.CoChungChi;
            khoaHoc.TenChungChi = dto.CoChungChi
                ? (string.IsNullOrWhiteSpace(dto.TenChungChi) ? "Chung nhan hoan thanh" : dto.TenChungChi.Trim())
                : null;
            khoaHoc.DiemDatChungChi = dto.CoChungChi ? dto.DiemDatChungChi : 80;
            khoaHoc.SoCauHoiChungChi = dto.CoChungChi ? dto.SoCauHoiChungChi : 20;
            khoaHoc.ThoiGianLamBaiChungChi = dto.CoChungChi ? dto.ThoiGianLamBaiChungChi : 30;

            if (!dto.CoChungChi)
            {
                khoaHoc.DuLieuDeChungChiJSON = null;
                khoaHoc.NguonDeChungChi = null;
                khoaHoc.NgayTaoDeChungChi = null;
            }
        }

        private sealed class CauHoiChungChiAIItem
        {
            [JsonPropertyName("cauHoi")]
            public string CauHoi { get; set; } = string.Empty;
            [JsonPropertyName("dapAnA")]
            public string DapAnA { get; set; } = string.Empty;
            [JsonPropertyName("dapAnB")]
            public string DapAnB { get; set; } = string.Empty;
            [JsonPropertyName("dapAnC")]
            public string DapAnC { get; set; } = string.Empty;
            [JsonPropertyName("dapAnD")]
            public string DapAnD { get; set; } = string.Empty;
            [JsonPropertyName("dapAnDung")]
            public string DapAnDung { get; set; } = "A";
            [JsonPropertyName("giaiThich")]
            public string GiaiThich { get; set; } = string.Empty;
        }
        private static void ValidateKhoaHocData(KhoaHocCreateUpdateDTO dto)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(dto.TenKhoaHoc))
                errors.Add("Tên khóa học không được để trống.");

            if (string.IsNullOrWhiteSpace(dto.LinhVuc))
                errors.Add("Lĩnh vực không được để trống.");

            if (string.IsNullOrWhiteSpace(dto.TrinhDo))
                errors.Add("Trình độ không được để trống.");

            if (dto.ThoiLuongGio <= 0)
                errors.Add("Thời lượng khóa học phải lớn hơn 0.");

            if (dto.GiaKhoaHoc < 10000 || dto.GiaKhoaHoc > 15000)
                errors.Add("Giá khóa học phải từ 10,000 đến 15,000 VNĐ");
            
            if (string.IsNullOrWhiteSpace(dto.DonViTienTe))
                errors.Add("Đơn vị tiền tệ không được để trống khi khóa học có phí.");

            if (dto.CoChungChi)
            {
                ValidateCertificateData(dto.DiemDatChungChi, dto.SoCauHoiChungChi, dto.ThoiGianLamBaiChungChi, errors);
            }

            if (errors.Any())
                throw new ArgumentException(string.Join(" ", errors));
        }

        private static void ValidateCertificateData(double diemDat, int soCauHoi, int thoiGian, List<string> errors)
        {
            if (diemDat < 0 || diemDat > 100)
                errors.Add("Điểm đạt chứng chỉ phải từ 0 đến 100.");

            if (soCauHoi <= 0)
                errors.Add("Số câu hỏi chứng chỉ phải lớn hơn 0.");

            if (thoiGian <= 0)
                errors.Add("Thời gian làm bài chứng chỉ phải lớn hơn 0.");
        }
    }
}





