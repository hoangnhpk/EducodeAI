using System.Text;
using System.Text.Json;
using educodeai_server.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using educodeai_server.Data;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class KhoaHocService : IKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IRedisService _redisService;
        private readonly ILogger<KhoaHocService> _logger;
        private readonly IConfiguration _cauHinh;

        // TTL constants
        private static readonly TimeSpan _ttlDanhSachKhoaHoc = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan _ttlChiTietKhoaHoc  = TimeSpan.FromMinutes(30);

        public KhoaHocService(
            IKhoaHocRepository khoaHocRepository,
            IServiceScopeFactory scopeFactory,
            IRedisService redisService,
            ILogger<KhoaHocService> logger,
            IConfiguration cauHinh)
        {
            _khoaHocRepository = khoaHocRepository;
            _scopeFactory = scopeFactory;
            _redisService = redisService;
            _logger = logger;
            _cauHinh = cauHinh;
        }

        // ------- Cache-Aside: Danh sách khóa học -------
        public async Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync(int maNguoiDung)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            string publicKey = educodeai_server.Constants.CacheKeys.CourseListPublic;

            // 1. Đọc Public Cache
            var cached = await _redisService.LayGiaTriAsync(publicKey);
            List<KhoaHocDto>? publicList = null;
            if (cached != null)
            {
                try
                {
                    publicList = JsonSerializer.Deserialize<List<KhoaHocDto>>(cached);
                    if (publicList != null)
                    {
                        _logger.LogInformation("[CACHE HIT] GetAllKhoaHocsAsync - Key: {Key} - {Count} khóa học từ Cache ({Elapsed}ms)",
                            publicKey, publicList.Count, sw.ElapsedMilliseconds);
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "[CACHE ERROR] Lỗi parse JSON GetAllKhoaHocsAsync. Fallback sang DB.");
                    publicList = null;
                }
                catch (NotSupportedException ex)
                {
                    _logger.LogWarning(ex, "[CACHE ERROR] Lỗi kiểu dữ liệu deserialize GetAllKhoaHocsAsync. Fallback sang DB.");
                    publicList = null;
                }
            }

            if (publicList == null)
            {
                // 2. Cache miss -> query DB
                _logger.LogInformation("[CACHE MISS] GetAllKhoaHocsAsync - Key: {Key} - Truy vấn DB...", publicKey);
                var allResult = await _khoaHocRepository.GetAllKhoaHocsAsync(0);
                publicList = allResult.ToList();
                await _redisService.LuuGiaTriAsync(publicKey, JsonSerializer.Serialize(publicList), _ttlDanhSachKhoaHoc);
                _logger.LogInformation("[DB QUERY] GetAllKhoaHocsAsync - Đã lưu {Count} khóa học vào Cache (TTL: {TTL}) - ({Elapsed}ms)",
                    publicList.Count, _ttlDanhSachKhoaHoc, sw.ElapsedMilliseconds);
            }

            // 3. Nếu user đăng nhập, lấy thêm trạng thái user từ DB riêng
            if (maNguoiDung > 0)
            {
                _logger.LogInformation("[DB QUERY] GetAllKhoaHocsAsync - Lấy enrollment status cho user #{UserId}", maNguoiDung);
                var userResult = await _khoaHocRepository.GetAllKhoaHocsAsync(maNguoiDung);
                var enrolledIds = userResult.Where(x => x.KhoaHocDaDangKy).Select(x => x.MaKhoaHoc).ToHashSet();
                foreach (var item in publicList)
                {
                    item.KhoaHocDaDangKy = enrolledIds.Contains(item.MaKhoaHoc);
                }
            }

            return publicList;
        }

        // ------- Cache-Aside: Chi tiết khóa học -------
        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            // 1. Đọc version hiện tại của khóa học
            var version = await _redisService.LayVersionKhoaHocAsync(maKhoaHoc);
            var publicKey = $"course:{maKhoaHoc}:detail:v{version}";

            // 2. Đọc Public Cache
            var cached = await _redisService.LayGiaTriAsync(publicKey);
            KhoaHoc_NoiDungKhoaHocDTO? detail = null;
            if (cached != null)
            {
                try
                {
                    detail = JsonSerializer.Deserialize<KhoaHoc_NoiDungKhoaHocDTO>(cached);
                    if (detail != null)
                    {
                        _logger.LogInformation("[CACHE HIT] GetKhoaHocByIdAsync - MaKhoaHoc: {Id}, Key: {Key} ({Elapsed}ms)",
                            maKhoaHoc, publicKey, sw.ElapsedMilliseconds);
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "[CACHE ERROR] Lỗi parse JSON GetKhoaHocByIdAsync. Fallback sang DB.");
                    detail = null;
                }
                catch (NotSupportedException ex)
                {
                    _logger.LogWarning(ex, "[CACHE ERROR] Lỗi kiểu dữ liệu deserialize GetKhoaHocByIdAsync. Fallback sang DB.");
                    detail = null;
                }
            }

            if (detail == null)
            {
                // 3. Cache miss -> query DB
                _logger.LogInformation("[CACHE MISS] GetKhoaHocByIdAsync - MaKhoaHoc: {Id}, Key: {Key} - Truy vấn DB...",
                    maKhoaHoc, publicKey);
                detail = await _khoaHocRepository.GetNoiDungKhoaHocAsync(maKhoaHoc, 0);
                if (detail != null)
                {
                    await _redisService.LuuGiaTriAsync(publicKey, JsonSerializer.Serialize(detail), _ttlChiTietKhoaHoc);
                    _logger.LogInformation("[DB QUERY] GetKhoaHocByIdAsync - Đã lưu khóa học #{Id} vào Cache (TTL: {TTL}) - ({Elapsed}ms)",
                        maKhoaHoc, _ttlChiTietKhoaHoc, sw.ElapsedMilliseconds);
                }
            }

            // 4. Overlay trạng thái DaXem từng bài học theo user
            if (detail != null && maNguoiDung > 0)
            {
                _logger.LogInformation("[DB QUERY] GetKhoaHocByIdAsync - Overlay DaXem cho user #{UserId}, khóa học #{CourseId}",
                    maNguoiDung, maKhoaHoc);
                var userDetail = await _khoaHocRepository.GetNoiDungKhoaHocAsync(maKhoaHoc, maNguoiDung);
                if (userDetail != null)
                {
                    foreach (var chuong in detail.DanhSachChuongHoc)
                    {
                        var userChuong = userDetail.DanhSachChuongHoc.FirstOrDefault(c => c.Id == chuong.Id);
                        if (userChuong == null) continue;
                        foreach (var bai in chuong.DanhSachBaiHoc)
                        {
                            var userBai = userChuong.DanhSachBaiHoc.FirstOrDefault(b => b.Id == bai.Id);
                            if (userBai != null) bai.DaXem = userBai.DaXem;
                        }
                    }

                    // Cập nhật các thông tin chứng chỉ cá nhân hóa
                    detail.BaiKiemTraChungChi = userDetail.BaiKiemTraChungChi;
                    detail.ThongTinChungChi = userDetail.ThongTinChungChi;
                }
            }

            if (detail != null)
            {
                int soVideoHocThu = _cauHinh.GetValue("HocThu:SoVideoMacDinh", 2);
                bool daDangKy = maNguoiDung > 0
                    && (await _khoaHocRepository.GetMaKhoaHocDaDangKyAsync(maNguoiDung, new List<int> { maKhoaHoc })).Contains(maKhoaHoc);
                HocThuHelper.ApDungPhanQuyenNoiDung(detail, detail.DonViTienTe, daDangKy, soVideoHocThu);
            }

            return detail;
        }

        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto)
        {
            if (!await CoQuyenGhiTienDoAsync(dto.MaBaiHoc, dto.MaNguoiDung))
            {
                throw new ApplicationException("Bạn cần mua khóa học hoặc chỉ được học thử video giới thiệu.");
            }

            return await _khoaHocRepository.LuuTienDoBaiHoc(dto);
        }

        public async Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto)
        {
            return await _khoaHocRepository.LuuGhiChuBaiHoc(dto);
        }

        public async Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung)
        {
            return await _khoaHocRepository.GetGhiChuBaiHocAsync(maBaiHoc, maNguoiDung);
        }

        public async Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto)
        {
            if (!await CoQuyenGhiTienDoAsync(dto.MaBaiHoc, dto.MaNguoiDung))
            {
                throw new ApplicationException("Bạn cần mua khóa học để làm bài tập này.");
            }

            return await _khoaHocRepository.LuuKetQuaBaiTap(dto);
        }

        public async Task<KetQuaNopBaiKiemTraChungChiDTO> NopBaiKiemTraChungChiAsync(NopBaiKiemTraChungChiDTO dto)
        {
            var rs = await _khoaHocRepository.NopBaiKiemTraChungChiAsync(dto);

            if (rs.ThanhCong && rs.DaDat && rs.ThongTinChungChi != null)
            {
                var tc = rs.ThongTinChungChi;
                
                // Chạy ngầm việc tạo PDF và gửi Email
                _ = Task.Run(async () =>
                {
                    try
                    {
                        // 1. Tạo PDF
                        var pdfBytes = ChungChiPdfHelper.TaoPdf(new ChungChiPdfRequest
                        {
                            TenChungChi = tc.TenChungChi ?? "Chứng nhận hoàn thành",
                            HoTenHocVien = dto.HoTenHienThi,
                            TenKhoaHoc = tc.TenKhoaHoc ?? "Khóa học",
                            MaChungChi = tc.MaChungChi ?? "",
                            NgayCap = tc.NgayCap ?? DateTime.UtcNow,
                            DiemSo = rs.DiemSo
                        });

                        // 2. Gửi Email
                        var attachment = new[]
                        {
                            new EmailAttachmentData
                            {
                                FileName = TaoTenFileChungChi(tc.TenKhoaHoc ?? "KhoaHoc", dto.HoTenHienThi),
                                Content = pdfBytes,
                                MediaType = "application/pdf"
                            }
                        };

                        var emailSent = await EmailHelper.SendEmailAsync(
                            dto.EmailNhan,
                            $"[{tc.TenKhoaHoc}] Chứng chỉ hoàn thành khóa học",
                            TaoNoiDungEmailChungChi(new KhoaHocModel { TenKhoaHoc = tc.TenKhoaHoc }, dto.HoTenHienThi, tc.MaChungChi, rs.DiemSo),
                            attachment);

                        // 3. Cập nhật DB trạng thái gửi email
                        if (emailSent)
                        {
                            using var scope = _scopeFactory.CreateScope();
                            var repo = scope.ServiceProvider.GetRequiredService<IKhoaHocRepository>();
                            await repo.CapNhatTrangThaiGuiEmailChungChiAsync(dto.MaKhoaHoc, dto.MaNguoiDung, true);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[EmailBgTask] Lỗi: {ex.Message}");
                        System.IO.File.WriteAllText("EmailBgTask_Error.txt", ex.ToString());
                    }
                });
            }

            return rs;
        }

        public async Task<List<GhiChuAIModel>> LayGhiChuAI(int maNguoiDung)
        {
            var ketQua = await _khoaHocRepository.LayDanhSachGhiChuAI(maNguoiDung);
            return ketQua;
        }

        public async Task<bool> LuuGhiChuAI(LuuGhiChuAIRequest yeuCau, int maNguoiDung)
        {
            var duLieu = new GhiChuAIModel
            {
                MaNguoiDung = maNguoiDung,
                MaBaiHoc = yeuCau.MaBaiHoc,
                NoiDung = yeuCau.NoiDung,
                NgayTao = DateTime.Now,
                NgayCapNhat = DateTime.Now
            };
            var ketQua = await _khoaHocRepository.LuuGhiChuAI(duLieu);
            return ketQua;
        }

        public async Task<bool> UpdateGhiChuAI(UpdateGhiChuAIDTO dto)
        {
            if (string.IsNullOrEmpty(dto.NoiDung)) return false;
            return await _khoaHocRepository.UpdateGhiChuAI(dto.Id, dto.NoiDung);
        }

        public async Task<bool> DeleteGhiChuAI(int id)
        {
            return await _khoaHocRepository.DeleteGhiChuAI(id);
        }

        public async Task<object> LayThongKeVaDanhSachAsync(int maKhoaHoc, int maNguoiDung)
        {
            var danhSachRaw = await _khoaHocRepository.LayDanhSachTheoKhoaHocAsync(maKhoaHoc, maNguoiDung);

            // Thống kê chỉ tính review đã duyệt (số liệu công khai)
            var danhSachCongKhai = danhSachRaw.Where(x => x.TrangThai == "DaDuyet").ToList();

            var tongSo = danhSachCongKhai.Count;
            var trungBinh = tongSo > 0 ? Math.Round(danhSachCongKhai.Average(x => x.SoSao), 1) : 0;

            var thongKe = new
            {
                TrungBinh = trungBinh,
                TongSo = tongSo,
                TyLe = new
                {
                    sao5 = tongSo > 0 ? (danhSachCongKhai.Count(x => x.SoSao == 5) * 100) / tongSo : 0,
                    sao4 = tongSo > 0 ? (danhSachCongKhai.Count(x => x.SoSao == 4) * 100) / tongSo : 0,
                    sao3 = tongSo > 0 ? (danhSachCongKhai.Count(x => x.SoSao == 3) * 100) / tongSo : 0,
                    sao2 = tongSo > 0 ? (danhSachCongKhai.Count(x => x.SoSao == 2) * 100) / tongSo : 0,
                    sao1 = tongSo > 0 ? (danhSachCongKhai.Count(x => x.SoSao == 1) * 100) / tongSo : 0,
                }
            };

            // Danh sách: DaDuyet hiển công khai + ChoDuyet của chính mình (chầm chờ duyệt)
            var danhSachOutput = danhSachRaw
                .Where(x => x.TrangThai == "DaDuyet" || x.MaNguoiDung == maNguoiDung)
                .Select(x => new {
                    id = x.MaDanhGia,
                    tenNguoiDung = x.NguoiDung?.HoTen ?? "Học viên",
                    maNguoiDung = x.MaNguoiDung,
                    soSao = x.SoSao,
                    noiDung = x.NhanXet,
                    ngayTao = x.NgayDanhGia,
                    trangThai = x.TrangThai ?? "DaDuyet"
                }).ToList();

            return new { ThongKe = thongKe, DanhSach = danhSachOutput };
        }

        public async Task<bool> TaoDanhGiaMoiAsync(DanhGiaDTO yeuCau)
        {
            bool daHocXong = await _khoaHocRepository.KiemTraHoanThanhKhoaHocAsync(yeuCau.MaKhoaHoc, yeuCau.MaNguoiDung);
            if (!daHocXong)
            {
                throw new Exception("Bạn phải hoàn thành 100% khóa học mới được phép đánh giá!");
            }

            // Lọc nội dung tục tĩu/nhạy cảm ngay tại nguồn trước khi lưu
            if (KiemTraCoTuNhayCam(yeuCau.NhanXet ?? string.Empty))
            {
                throw new Exception("Nội dung đánh giá chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại!");
            }

            // Submit → ChoDuyet (chỉ chính học viên thấy)
            // Sau khi Admin/AI duyệt → DaDuyet (mọi người thấy)
            // Bị từ chối → học viên được phép gửi lại (ghi đè bản cũ, quay về ChoDuyet)
            var danhGiaHienCo = await _khoaHocRepository.LayDanhGiaCuaNguoiDungAsync(yeuCau.MaKhoaHoc, yeuCau.MaNguoiDung);
            if (danhGiaHienCo != null)
            {
                // Chỉ cho gửi lại nếu bản trước đã bị từ chối; ChoDuyet/DaDuyet thì chặn
                if (danhGiaHienCo.TrangThai != "TuChoi")
                    throw new Exception("Bạn đã đánh giá khóa học này rồi!");

                danhGiaHienCo.SoSao = yeuCau.SoSao;
                danhGiaHienCo.NhanXet = yeuCau.NhanXet;
                danhGiaHienCo.NgayDanhGia = DateTime.Now;
                danhGiaHienCo.TrangThai = "ChoDuyet";
                return await _khoaHocRepository.CapNhatDanhGiaAsync(danhGiaHienCo);
            }

            var model = new DanhGiaModel
            {
                MaKhoaHoc = yeuCau.MaKhoaHoc,
                MaNguoiDung = yeuCau.MaNguoiDung,
                SoSao = yeuCau.SoSao,
                NhanXet = yeuCau.NhanXet,
                NgayDanhGia = DateTime.Now,
                TrangThai = "ChoDuyet"
            };

            return await _khoaHocRepository.ThemDanhGiaAsync(model);
        }

        /// <summary>
        /// Kiểm tra xem chuỗi có chứa từ nhạy cảm không.
        /// Xử lý các cách lách: chèn ký tự đặc biệt, số thay chữ, dấu, lặp chữ.
        /// </summary>
        private static bool KiemTraCoTuNhayCam(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return false;

            // Bước 1: Chuẩn hóa – loại bỏ dấu tiếng Việt, thay số/ký tự tương đương
            var lowered = input.ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder(lowered.Length);
            foreach (var c in lowered)
            {
                var cat = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (cat == System.Globalization.UnicodeCategory.NonSpacingMark) continue;
                sb.Append(c switch
                {
                    'đ' => 'd', '0' => 'o', '1' => 'i', '4' => 'a',
                    '3' => 'e', '5' => 's', '7' => 't', '@' => 'a',
                    _ => c
                });
            }

            // Bước 2: Xóa tất cả ký tự KHÔNG phải chữ cái/số để phát hiện lách kiểu "n.g.u" hay "n_g_u"
            var stripped = System.Text.RegularExpressions.Regex.Replace(sb.ToString(), @"[^a-z0-9]", "");

            // Bước 3: Kiểm tra trên CẢ HAI chuỗi: có dấu phân cách (sb) và không có (stripped)
            var patterns = new[]
            {
                // --- Kiểm tra trên chuỗi normalized (có thể có dấu phân cách) ---
                (@"n+[^a-z]*g+[^a-z]*u+",              sb.ToString()),   // n.g.u, n_g_u, ngu
                (@"d+[^a-z]*m+",                        sb.ToString()),   // d.m, dm, d m
                (@"d+[^a-z]*c+[^a-z]*m+",              sb.ToString()),   // d.c.m
                (@"v+[^a-z]*c+[^a-z]*l+",              sb.ToString()),   // v.c.l
                (@"v+[^a-z]*l+",                        sb.ToString()),   // v.l
                (@"c+[^a-z]*h+[^a-z]*o+",              sb.ToString()),   // c.h.o
                (@"l+[^a-z]*o+[^a-z]*n+",              sb.ToString()),   // l.o.n
                (@"c+[^a-z]*a+[^a-z]*c+",              sb.ToString()),   // c.a.c
                (@"d+[^a-z]*i+[^a-z]*t+",              sb.ToString()),   // d.i.t
                (@"c+[^a-z]*u+[^a-z]*t+",              sb.ToString()),   // c.u.t
                // --- Kiểm tra trên chuỗi đã loại hết ký tự đặc biệt ---
                (@"ngu+",                               stripped),        // ngu, nguu
                (@"dm+",                                stripped),        // dm, dmm
                (@"dcm+",                               stripped),        // dcm
                (@"vcl+",                               stripped),        // vcl
                (@"cho+",                               stripped),        // cho
                (@"lon+",                               stripped),        // lon
                (@"cac+",                               stripped),        // cac
                (@"dit+",                               stripped),        // dit
                (@"cut+",                               stripped),        // cut
                (@"du+",                                stripped),        // du
            };

            foreach (var (pattern, target) in patterns)
            {
                if (System.Text.RegularExpressions.Regex.IsMatch(
                    target, pattern,
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                {
                    return true; // Phát hiện vi phạm
                }
            }

            return false;
        }

        private static string TaoNoiDungEmailChungChi(
            KhoaHocModel khoaHoc,
            string hoTenHienThi,
            string maChungChi,
            double diemSo)
        {
            var diemHienThi = $"{Math.Round(diemSo, 1):0.#}%";
            var ngayCapStr  = DateTime.UtcNow.ToLocalTime().ToString("dd/MM/yyyy");

            return $"""
                <div style="margin:0;padding:40px 0;background:#F4F6F8;font-family:'Segoe UI',Arial,sans-serif;color:#1A2B4A">
                  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.04)">
                    
                    <!-- Header -->
                    <div style="background:#1A2B4A;padding:40px 30px;text-align:center;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#A0B3C6;text-transform:uppercase;margin-bottom:12px">
                        EduCodeAI · Chứng chỉ hoàn thành
                      </div>
                      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3">
                        Chúc mừng, {hoTenHienThi}! 🎉
                      </h1>
                      <p style="margin:0;font-size:15px;line-height:1.6;color:#D8E2ED">
                        Bạn đã xuất sắc vượt qua bài kiểm tra và hoàn thành khóa học<br>
                        <strong style="color:#F5A623;font-size:16px;">{khoaHoc.TenKhoaHoc}</strong>
                      </p>
                    </div>

                    <!-- Body -->
                    <div style="padding:40px 30px;">
                      
                      <!-- Meta Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;background:#F8FAFD;border:1px solid #E2E8F0;border-radius:8px;">
                        <tr>
                          <td style="padding:20px;text-align:center;border-right:1px solid #E2E8F0;width:33%;">
                            <div style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;margin-bottom:8px">Điểm số</div>
                            <div style="font-size:22px;font-weight:800;color:#0F172A">{diemHienThi}</div>
                          </td>
                          <td style="padding:20px;text-align:center;border-right:1px solid #E2E8F0;width:33%;">
                            <div style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;margin-bottom:8px">Ngày cấp</div>
                            <div style="font-size:16px;font-weight:700;color:#0F172A">{ngayCapStr}</div>
                          </td>
                          <td style="padding:20px;text-align:center;width:34%;">
                            <div style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;margin-bottom:8px">ID Chứng chỉ</div>
                            <div style="font-size:13px;font-weight:600;color:#0F172A;word-break:break-all">{maChungChi}</div>
                          </td>
                        </tr>
                      </table>

                      <div style="padding:20px;background:#EFF6FF;border-left:4px solid #3B82F6;border-radius:4px;margin-bottom:24px">
                        <strong style="display:block;font-size:14px;color:#1E3A8A;margin-bottom:6px">📎 PDF đính kèm</strong>
                        <span style="font-size:14px;color:#1E40AF;line-height:1.6">Chứng chỉ định dạng PDF đã được gửi đính kèm trong email này. Bạn có thể tải xuống, in ra để đính kèm vào hồ sơ cá nhân.</span>
                      </div>

                      <p style="font-size:13px;color:#64748B;text-align:center;margin:0 0 30px;">
                        Hệ thống sẽ cập nhật tự động chứng chỉ mới nhất về email nếu bạn thi lại đạt điểm cao hơn.
                      </p>

                      <!-- Footer Div -->
                      <div style="border-top:1px solid #E2E8F0;padding-top:20px;text-align:center;">
                        <div style="font-size:15px;font-weight:700;color:#0F172A;">EduCodeAI</div>
                        <div style="font-size:13px;color:#64748B;margin-top:4px;margin-bottom:12px;">Nền tảng học lập trình thông minh</div>
                        <div style="font-size:11px;color:#94A3B8;">Đây là email tự động, vui lòng không trả lời.</div>
                      </div>
                    </div>

                  </div>
                </div>
                """;
        }

        private async Task<bool> CoQuyenGhiTienDoAsync(int maBaiHoc, int maNguoiDung)
        {
            if (maNguoiDung <= 0)
            {
                return false;
            }

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
            int soVideoHocThu = _cauHinh.GetValue("HocThu:SoVideoMacDinh", 2);
            return await HocThuHelper.CoQuyenTruyCapBaiHocAsync(db, maBaiHoc, maNguoiDung, soVideoHocThu);
        }

        private static string TaoTenFileChungChi(string tenKhoaHoc, string hoTenHienThi)
        {
            var tenFile = $"{hoTenHienThi}-{tenKhoaHoc}"
                .Normalize(NormalizationForm.FormD);
            var builder = new string(tenFile
                .Where(c => char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                .Select(c => Array.IndexOf(Path.GetInvalidFileNameChars(), c) >= 0 ? '-' : c)
                .ToArray());

            return $"{builder.Replace(' ', '-')}.pdf";
        }
    }
}
