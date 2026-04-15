using System.Text;
using educodeai_server.Helpers;
using Microsoft.Extensions.DependencyInjection;
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

        public KhoaHocService(IKhoaHocRepository khoaHocRepository, IServiceScopeFactory scopeFactory)
        {
            _khoaHocRepository = khoaHocRepository;
            _scopeFactory = scopeFactory;
        }

        public async Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync(int maNguoiDung)
        {
            return await _khoaHocRepository.GetAllKhoaHocsAsync(maNguoiDung);
        }

        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _khoaHocRepository.GetNoiDungKhoaHocAsync(maKhoaHoc, maNguoiDung);
        }

        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto)
        {
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

            var danhSachOutput = danhSachRaw.Select(x => new {
                id = x.MaDanhGia,
                tenNguoiDung = x.NguoiDung?.HoTen ?? "Học viên",
                maNguoiDung = x.MaNguoiDung,
                soSao = x.SoSao,
                noiDung = x.NhanXet,
                ngayTao = x.NgayDanhGia
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
            // 1 user chỉ được đánh giá 1 lần cho 1 khóa học
            bool daTonTai = await _khoaHocRepository.KiemTraDaDanhGiaAsync(yeuCau.MaKhoaHoc, yeuCau.MaNguoiDung);
            if (daTonTai) throw new Exception("Bạn đã đánh giá khóa học này rồi!");

            // Lọc từ nhạy cảm
            string nhanXetDaLoc = LocTuNhayCam(yeuCau.NhanXet);

            var model = new DanhGiaModel
            {
                MaKhoaHoc = yeuCau.MaKhoaHoc,
                MaNguoiDung = yeuCau.MaNguoiDung,
                SoSao = yeuCau.SoSao,
                NhanXet = nhanXetDaLoc,
                NgayDanhGia = DateTime.Now,
                TrangThai = "DaDuyet"
            };

            return await _khoaHocRepository.ThemDanhGiaAsync(model);
        }

private static string LocTuNhayCam(string input)
{
    if (string.IsNullOrWhiteSpace(input))
        return input;

    var patterns = new[]
    {
        @"(?<!\p{L})n+g+u+(?!\p{L})",                 // ngu, nguuu
        @"(?<!\p{L})d+\W*m+(?!\p{L})",               // dm, d m, d.m, d-m, dmmm
        @"(?<!\p{L})d+\W*c+\W*m+(?!\p{L})",          // dcm, d c m, d.c.m, dcmm
        @"(?<!\p{L})v+\W*c+\W*l+(?!\p{L})",          // vcl
        @"(?<!\p{L})v+\W*l+(?!\p{L})",               // vl
        @"(?<!\p{L})c+h+[o0]+(?!\p{L})",             // chó, cho, chooo
        @"(?<!\p{L})l+[o0]+n+(?!\p{L})",             // lồn, lon, l0n
        @"(?<!\p{L})c+[a4]+c+(?!\p{L})",             // cặc, cac, c4c
        @"(?<!\p{L})d+[i1]+(?!\p{L})",               // đĩ, di, d1
        @"(?<!\p{L})d+[i1]+t+(?!\p{L})",             // địt, dit, d1t
        @"(?<!\p{L})d+u+(?!\p{L})",                  // đù, du
        @"(?<!\p{L})c+[uư]+t+(?!\p{L})"              // cứt, cut
    };

    var lowered = input.ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD);
    var normalizedChars = new System.Text.StringBuilder(lowered.Length);

    foreach (var c in lowered)
    {
        var cat = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
        if (cat == System.Globalization.UnicodeCategory.NonSpacingMark)
            continue;

        normalizedChars.Append(c switch
        {
            'đ' => 'd',
            '0' => 'o',
            '1' => 'i',
            '4' => 'a',
            _ => c
        });
    }

    var normalized = normalizedChars.ToString();
    var masked = new bool[input.Length];

    foreach (var pattern in patterns)
    {
        foreach (System.Text.RegularExpressions.Match match in
                 System.Text.RegularExpressions.Regex.Matches(
                     normalized,
                     pattern,
                     System.Text.RegularExpressions.RegexOptions.IgnoreCase))
        {
            for (int i = match.Index; i < match.Index + match.Length && i < masked.Length; i++)
            {
                if (!char.IsWhiteSpace(input[i]))
                    masked[i] = true;
            }
        }
    }

    var result = input.ToCharArray();
    for (int i = 0; i < result.Length; i++)
    {
        if (masked[i])
            result[i] = '*';
    }

    return new string(result);
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
                        EduCodeAI · Certificate of Completion
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
