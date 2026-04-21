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

        public KhoaHocCuaToiService(IKhoaHocCuaToiRepository repository, IGeminiAIService gemini, IYouTubeService youtubeService)
        {
            _repository = repository;
            _gemini = gemini;
            _youtubeService = youtubeService;
        }

        // ===== COURSE MANAGEMENT =====
        public async Task<List<KhoaHocGiangVienListDTO>> GetDanhSachKhoaHocAsync(int maGiangVien)
        {
            var khoaHocs = await _repository.GetKhoaHocByGiangVienAsync(maGiangVien);
            return khoaHocs.Select(MapToKhoaHocListDTO).ToList();
        }

        public async Task<KhoaHocGiangVienDetailDTO?> GetChiTietKhoaHocAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            return khoaHoc != null ? MapToKhoaHocDetailDTO(khoaHoc) : null;
        }

        public async Task<int> TaoKhoaHocAsync(int maGiangVien, KhoaHocCreateUpdateDTO dto)
        {
            ValidateKhoaHocData(dto);

            var khoaHoc = CreateKhoaHocFromDTO(maGiangVien, dto);
            await _repository.AddKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
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
            return true;
        }

        // ===== THÊM CHƯƠNG =====
        public async Task<ThemChuongResponseDTO> ThemChuongAsync(int maKhoaHoc, ChuongHocCreateUpdateDTO dto)
        {
            var chuong = new ChuongHocModel
            {
                MaKhoaHoc = maKhoaHoc,
                TenChuong = dto.TenChuong,
                ThuTu = dto.ThuTu,
            };

            await _repository.AddChuongAsync(chuong);
            await _repository.SaveChangesAsync();
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
                LinkVideo = ExtractEmbedUrl(dto.LinkVideo),
                ThoiLuong = dto.ThoiLuong,
                ThuTu = dto.ThuTu,
                LoaiBaiHoc = "Video",
            };

            await _repository.AddBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();

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
            baiHoc.LinkVideo = ExtractEmbedUrl(dto.LinkVideo);
            baiHoc.ThoiLuong = dto.ThoiLuong;
            baiHoc.ThuTu = dto.ThuTu;

            await _repository.UpdateBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== XOÁ VIDEO =====
        public async Task<bool> XoaVideoAsync(int maBaiHoc, int maGiangVien)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;

            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            await _repository.DeleteBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<KetQuaTaoDeChungChiAIDTO> TaoDeChungChiBangAIAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocForCertificateAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null)
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "Không tìm thấy khóa học."
                };
            }

            if (!khoaHoc.CoChungChi)
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học này chưa bật chế độ chứng chỉ."
                };
            }

            var noiDungKhoaHoc = TaoNoiDungTongHopChoAI(khoaHoc);
            if (string.IsNullOrWhiteSpace(noiDungKhoaHoc))
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học chưa có đủ nội dung để AI tạo đề chứng chỉ."
                };
            }

            var soCauHoi = khoaHoc.SoCauHoiChungChi > 0 ? khoaHoc.SoCauHoiChungChi : 20;
            var prompt = TaoPromptDeThiChungChi(khoaHoc, noiDungKhoaHoc, soCauHoi);
            var aiResult = await _gemini.GenerateAsync(prompt);
            var jsonChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);

            var danhSachCauHoi = JsonSerializer.Deserialize<List<CauHoiChungChiAIItem>>(jsonChuanHoa) ?? new List<CauHoiChungChiAIItem>();
            if (danhSachCauHoi.Count == 0)
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "AI chưa trả về bộ đề hợp lệ. Vui lòng thử lại."
                };
            }

            khoaHoc.DuLieuDeChungChiJSON = JsonSerializer.Serialize(danhSachCauHoi.Select((cauHoi, index) => new
            {
                id = index + 1,
                cauHoi = cauHoi.CauHoi,
                dapAnA = cauHoi.DapAnA,
                dapAnB = cauHoi.DapAnB,
                dapAnC = cauHoi.DapAnC,
                dapAnD = cauHoi.DapAnD,
                dapAnDung = cauHoi.DapAnDung,
                giaiThich = cauHoi.GiaiThich
            }));
            khoaHoc.NguonDeChungChi = "AI";
            khoaHoc.NgayTaoDeChungChi = DateTime.UtcNow;

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();

            return new KetQuaTaoDeChungChiAIDTO
            {
                ThanhCong = true,
                ThongBao = "Đã tạo đề chứng chỉ bằng AI thành công.",
                SoCauHoi = danhSachCauHoi.Count,
                NguonDeChungChi = khoaHoc.NguonDeChungChi,
                NgayTaoDeChungChi = khoaHoc.NgayTaoDeChungChi
            };
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
                    var noiDung = string.IsNullOrWhiteSpace(baiHoc.NoiDung)
                        ? "Không có mô tả chi tiết."
                        : baiHoc.NoiDung;
                    return $"Bài {index + 1}: {baiHoc.TieuDe}\n{noiDung}";
                })
                .ToList() ?? new List<string>();

            return string.Join("\n\n", phanNoiDung);
        }

        private static string TaoPromptDeThiChungChi(KhoaHocModel khoaHoc, string noiDungKhoaHoc, int soCauHoi)
        {
            var tenChungChi = khoaHoc.TenChungChi ?? "Chứng nhận hoàn thành";
            return $@"
Bạn là chuyên gia giáo dục của hệ thống EduCodeAI.
Hãy tạo đúng {soCauHoi} câu hỏi trắc nghiệm cho bài kiểm tra nhận chứng chỉ của khóa học.

THÔNG TIN KHÓA HỌC
- Tên khóa học: {khoaHoc.TenKhoaHoc}
- Tên chứng chỉ: {tenChungChi}
- Lĩnh vực: {khoaHoc.LinhVuc}
- Trình độ: {khoaHoc.TrinhDo}
- Mô tả: {khoaHoc.MoTa}

NỘI DUNG KHÓA HỌC
{noiDungKhoaHoc}

YÊU CẦU
1. Câu hỏi phải bám sát nội dung khóa học.
2. Mỗi câu có 4 đáp án A, B, C, D và chỉ có 1 đáp án đúng.
3. Trường dapAnDung chỉ nhận A, B, C hoặc D.
4. Mỗi câu cần có giải thích ngắn gọn.
5. Không dùng markdown, không giải thích thêm ngoài JSON.

OUTPUT JSON THUẦN
[
  {{
    ""cauHoi"": """",
    ""dapAnA"": """",
    ""dapAnB"": """",
    ""dapAnC"": """",
    ""dapAnD"": """",
    ""dapAnDung"": ""A"",
    ""giaiThich"": """"
  }}
]";
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
                    NoiDung = video.Description,
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
        public async Task<bool> ReorderChaptersAsync(int maKiangVien, int maKhoaHoc, List<ChapterReorderDTO> chapters)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maKiangVien);
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
            return true;
        }

        // ===== CERTIFICATE CONFIG =====
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
            return true;
        }

        // ===== HELPER METHODS =====




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
                ThuTu = b.ThuTu
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
