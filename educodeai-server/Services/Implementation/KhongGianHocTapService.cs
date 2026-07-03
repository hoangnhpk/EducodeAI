using System.Text.Json;
using educodeai_server.Data;
using educodeai_server.DTOs;
using educodeai_server.DTOs.AI;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class KhongGianHocTapService : IKhongGianHocTapService
    {
        private static readonly JsonSerializerOptions JsonLoTrinh = new()
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly EduCodeAIDbContext _context;

        public KhongGianHocTapService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<List<KhongGianHocTapItemDTO>> LayDanhSachTheoNguoiDungAsync(int maNguoiDung)
        {
            var dangKyList = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Include(dk => dk.KhoaHoc)
                .Where(dk => dk.MaNguoiDung == maNguoiDung)
                .OrderByDescending(dk => dk.NgayDangKy)
                .ToListAsync();

            var result = new List<KhongGianHocTapItemDTO>();

            foreach (var dk in dangKyList)
            {
                var kh = dk.KhoaHoc;
                if (kh == null) continue;

                int maKhoa = dk.MaKhoaHoc;
                var (tongSoBai, soBaiDaHoc, phanTram) = await LayTienDoKhoaHocAsync(maNguoiDung, maKhoa);

                result.Add(new KhongGianHocTapItemDTO
                {
                    MaKhoaHoc = maKhoa,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    HinhAnh = kh.HinhAnh,
                    TongSoBaiHoc = tongSoBai,
                    SoBaiDaHoc = soBaiDaHoc,
                    PhanTramTienDo = phanTram,
                    Slug = SlugHelper.Generate(kh.TenKhoaHoc),
                    NgayDangKy = dk.NgayDangKy,
                    TrangThaiDangKy = dk.TrangThai
                });
            }

            return result;
        }

        public async Task<SkillTreeResponseDTO> LaySkillTreeAsync(int maNguoiDung, int? maLoTrinh)
        {
            var loTrinhList = await _context.LoTrinhAIs
                .AsNoTracking()
                .Where(lt => lt.MaNguoiDung == maNguoiDung)
                .OrderByDescending(lt => lt.TrangThai == "Đã lưu")
                .ThenByDescending(lt => lt.TrangThai == "Hoạt động")
                .ThenByDescending(lt => lt.NgayTao)
                .ToListAsync();

            // Cùng nguồn với trang khoa-hoc-ai-cua-toi: lộ trình TrangThai = "Đã lưu"
            var loTrinhDaLuu = loTrinhList
                .Where(lt => lt.TrangThai == "Đã lưu")
                .ToList();

            var tatCaKhoa = await _context.KhoaHocs.AsNoTracking().ToListAsync();

            var options = new List<SkillTreeLoTrinhOptionDTO>();
            foreach (var lt in loTrinhDaLuu)
            {
                var ten = string.IsNullOrWhiteSpace(lt.YeuCau) ? "Lộ trình học tập" : lt.YeuCau;
                var khoa = TrichXuatKhoaHocTuJson(lt.NoiDungJSON, lt.YeuCau, out var tenJson, out _, out _);
                if (!string.IsNullOrWhiteSpace(tenJson))
                    ten = tenJson;
                khoa = GiaiQuyetMaKhoaHocTuTen(khoa, tatCaKhoa);

                options.Add(new SkillTreeLoTrinhOptionDTO
                {
                    MaLoTrinh = lt.MaLoTrinh,
                    TenLoTrinh = ten,
                    TrangThai = lt.TrangThai ?? "Đã lưu",
                    TongSoKhoaHoc = khoa.Count
                });
            }

            var dangKyList = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Where(dk => dk.MaNguoiDung == maNguoiDung)
                .ToListAsync();

            var dangKyByKhoa = dangKyList
                .GroupBy(dk => dk.MaKhoaHoc)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(dk => dk.NgayDangKy).First());

            // Chỉ lộ trình thuộc đúng học viên đang đăng nhập (không lấy khóa đăng ký chung làm fallback)
            LoTrinhAIModel? selectedLoTrinh = null;
            if (maLoTrinh.HasValue && maLoTrinh.Value > 0)
            {
                selectedLoTrinh = loTrinhDaLuu.FirstOrDefault(lt => lt.MaLoTrinh == maLoTrinh.Value)
                    ?? loTrinhDaLuu.FirstOrDefault();
            }
            else
            {
                selectedLoTrinh = loTrinhDaLuu.FirstOrDefault();
            }

            var orderedCourses = new List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)>();

            string tenLoTrinh = "Chưa có lộ trình AI";
            string moTaChung = "Lưu lộ trình từ Khám phá để xem bản đồ và tiến độ tại đây.";
            int tongThoiGianTuan = 0;
            int? maLoTrinhResult = null;

            if (selectedLoTrinh != null)
            {
                maLoTrinhResult = selectedLoTrinh.MaLoTrinh;
                orderedCourses = TrichXuatKhoaHocTuJson(
                    selectedLoTrinh.NoiDungJSON,
                    selectedLoTrinh.YeuCau,
                    out tenLoTrinh,
                    out moTaChung,
                    out tongThoiGianTuan);
                orderedCourses = GiaiQuyetMaKhoaHocTuTen(orderedCourses, tatCaKhoa);
            }

            var khoaMeta = new Dictionary<int, Models.KhoaHocModel>();
            if (orderedCourses.Count > 0)
            {
                var maIds = orderedCourses.Select(c => c.MaKhoaHoc).ToList();
                khoaMeta = await _context.KhoaHocs
                    .AsNoTracking()
                    .Where(k => maIds.Contains(k.MaKhoaHoc))
                    .ToDictionaryAsync(k => k.MaKhoaHoc, k => k);
            }

            var nodes = new List<SkillTreeNodeDTO>();
            var edges = new List<SkillTreeEdgeDTO>();
            int? nextStepMaKhoa = null;
            bool foundNext = false;
            bool khoaTruocDaHoanThanh = true;

            for (int i = 0; i < orderedCourses.Count; i++)
            {
                var course = orderedCourses[i];
                khoaMeta.TryGetValue(course.MaKhoaHoc, out var khoaDb);

                var (tongSoBai, soBaiDaHoc, phanTram) = await LayTienDoKhoaHocAsync(maNguoiDung, course.MaKhoaHoc);
                bool daDangKy = dangKyByKhoa.ContainsKey(course.MaKhoaHoc);
                var dk = daDangKy ? dangKyByKhoa[course.MaKhoaHoc] : null;

                bool done = phanTram >= 100
                    || dk?.TienDo == 100
                    || string.Equals(dk?.TrangThai, "Hoàn thành", StringComparison.OrdinalIgnoreCase);

                bool biKhoaTheoThuTu = i > 0 && !khoaTruocDaHoanThanh;

                string trangThai;
                if (done)
                    trangThai = "done";
                else if (biKhoaTheoThuTu)
                    trangThai = "locked";
                else if (daDangKy)
                    trangThai = "in_progress";
                else
                    trangThai = "not_registered";

                if (!foundNext && trangThai is "in_progress" or "not_registered")
                {
                    nextStepMaKhoa = course.MaKhoaHoc;
                    foundNext = true;
                }

                nodes.Add(new SkillTreeNodeDTO
                {
                    MaKhoaHoc = course.MaKhoaHoc,
                    TenKhoaHoc = khoaDb?.TenKhoaHoc ?? course.TenKhoaHoc,
                    HinhAnh = khoaDb?.HinhAnh,
                    Slug = SlugHelper.Generate(khoaDb?.TenKhoaHoc ?? course.TenKhoaHoc),
                    GiaiDoan = course.GiaiDoan,
                    MucTieuGiaiDoan = course.MucTieu,
                    ThuTu = i + 1,
                    TrangThai = trangThai,
                    PhanTramTienDo = phanTram,
                    TongSoBaiHoc = tongSoBai,
                    SoBaiDaHoc = soBaiDaHoc,
                    DaDangKy = daDangKy,
                    LaBuocTiepTheo = false
                });

                if (i > 0)
                {
                    edges.Add(new SkillTreeEdgeDTO
                    {
                        FromMaKhoaHoc = orderedCourses[i - 1].MaKhoaHoc,
                        ToMaKhoaHoc = course.MaKhoaHoc
                    });
                }

                khoaTruocDaHoanThanh = done;
            }

            if (nextStepMaKhoa.HasValue)
            {
                var next = nodes.First(n => n.MaKhoaHoc == nextStepMaKhoa.Value);
                next.LaBuocTiepTheo = true;
            }

            int soDone = nodes.Count(n => n.TrangThai == "done");
            int phanTramTong = nodes.Count > 0 ? (int)Math.Round((double)soDone / nodes.Count * 100) : 0;

            return new SkillTreeResponseDTO
            {
                MaLoTrinh = maLoTrinhResult,
                TenLoTrinh = tenLoTrinh,
                MoTaChung = moTaChung,
                TongSoKhoaHoc = nodes.Count,
                SoKhoaHoanThanh = soDone,
                PhanTramTong = phanTramTong,
                TongThoiGianTuan = tongThoiGianTuan,
                DanhSachLoTrinh = options,
                Nodes = nodes,
                Edges = edges
            };
        }

        /// <summary>
        /// Hỗ trợ nhiều định dạng JSON lộ trình (AI, Khám phá, mảng khóa trong loTrinh).
        /// </summary>
        private static List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)> TrichXuatKhoaHocTuJson(
            string? noiDungJson,
            string? yeuCau,
            out string tenLoTrinh,
            out string moTaChung,
            out int tongThoiGianTuan)
        {
            var ordered = new List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)>();
            tenLoTrinh = string.IsNullOrWhiteSpace(yeuCau) ? "Lộ trình học tập" : yeuCau;
            moTaChung = string.Empty;
            tongThoiGianTuan = 0;

            if (string.IsNullOrWhiteSpace(noiDungJson))
                return ordered;

            noiDungJson = ChuanHoaNoiDungJson(noiDungJson);

            try
            {
                var noiDung = JsonSerializer.Deserialize<NoiDungLoTrinhDTO>(noiDungJson, JsonLoTrinh);
                if (noiDung?.LoTrinh != null && noiDung.LoTrinh.Count > 0)
                {
                    if (!string.IsNullOrWhiteSpace(noiDung.TenLoTrinh))
                        tenLoTrinh = noiDung.TenLoTrinh;
                    moTaChung = noiDung.MoTaChung ?? string.Empty;
                    tongThoiGianTuan = noiDung.TongThoiGianTuan;

                    foreach (var gd in noiDung.LoTrinh.OrderBy(g => g.GiaiDoan))
                    {
                        foreach (var kh in gd.KhoaHocSuDung)
                        {
                            if (ordered.Any(c => c.MaKhoaHoc == kh.MaKhoaHoc))
                                continue;
                            ordered.Add((kh.MaKhoaHoc, kh.TenKhoaHoc, gd.GiaiDoan, gd.MucTieu ?? string.Empty));
                        }
                    }

                    if (ordered.Count > 0)
                        return ordered;
                }
            }
            catch { /* thử parse linh hoạt */ }

            try
            {
                using var doc = JsonDocument.Parse(noiDungJson);
                var root = doc.RootElement;

                if (root.ValueKind == JsonValueKind.Array)
                {
                    ThemKhoaTuMangJson(root, ordered);
                }
                else if (root.ValueKind == JsonValueKind.Object)
                {
                    if (!string.IsNullOrWhiteSpace(TryGetString(root, "tenLoTrinh", "TenLoTrinh", "tieuDe")))
                        tenLoTrinh = TryGetString(root, "tenLoTrinh", "TenLoTrinh", "tieuDe")!;

                    if (root.TryGetProperty("loTrinh", out var loTrinh) || root.TryGetProperty("LoTrinh", out loTrinh))
                        ThemKhoaTuMangJson(loTrinh, ordered);
                    else if (root.TryGetProperty("cacChangHoc", out var changs) || root.TryGetProperty("CacChangHoc", out changs))
                        ThemKhoaTuMangJson(changs, ordered);
                }
            }
            catch { /* ignore */ }

            return ordered;
        }

        private static void ThemKhoaTuMangJson(JsonElement array, List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)> ordered)
        {
            if (array.ValueKind != JsonValueKind.Array)
                return;

            int idx = 0;
            foreach (var item in array.EnumerateArray())
            {
                idx++;
                var mucTieu = TryGetString(item, "mucTieu", "MucTieu") ?? string.Empty;
                if (TryLayMangKhoaHoc(item, out var nested))
                {
                    foreach (var kh in nested.EnumerateArray())
                        ThemMotKhoaTuPhanTu(kh, ordered, idx, mucTieu);
                    continue;
                }

                ThemMotKhoaTuPhanTu(item, ordered, idx, string.Empty);
            }
        }

        private static void ThemMotKhoaTuPhanTu(
            JsonElement kh,
            List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)> ordered,
            int giaiDoan,
            string mucTieu)
        {
            var ma = TryGetInt(kh, "maKhoaHoc", "MaKhoaHoc");
            var ten = TryGetString(kh, "tenKhoaHoc", "TenKhoaHoc", "ten", "Ten", "tieuDe", "TieuDe");
            if (ma <= 0 && string.IsNullOrWhiteSpace(ten))
                return;
            if (ma > 0 && ordered.Any(x => x.MaKhoaHoc == ma))
                return;

            var tenKhoa = ten ?? (ma > 0 ? $"Khóa {ma}" : "Khóa học");
            ordered.Add((ma, tenKhoa, giaiDoan, mucTieu));
        }

        private static bool TryLayMangKhoaHoc(JsonElement item, out JsonElement array)
        {
            foreach (var name in new[]
                     {
                         "khoaHocSuDung", "KhoaHocSuDung", "danhSachKhoaHoc", "DanhSachKhoaHoc",
                         "khoaHoc", "KhoaHoc", "courses", "Courses", "steps", "Steps"
                     })
            {
                if (item.TryGetProperty(name, out array) && array.ValueKind == JsonValueKind.Array)
                    return true;
            }

            array = default;
            return false;
        }

        /// <summary>Giống logic getCleanContent trên FE — bóc JSON lồng trong chuỗi.</summary>
        private static string ChuanHoaNoiDungJson(string raw)
        {
            var text = raw.Trim();
            if (text.StartsWith('"'))
            {
                try
                {
                    var unwrapped = JsonSerializer.Deserialize<string>(text);
                    if (!string.IsNullOrWhiteSpace(unwrapped))
                        text = unwrapped.Trim();
                }
                catch { /* giữ nguyên */ }
            }

            var objStart = text.IndexOf('{');
            var objEnd = text.LastIndexOf('}');
            if (objStart >= 0 && objEnd > objStart)
                return text.Substring(objStart, objEnd - objStart + 1);

            var arrStart = text.IndexOf('[');
            var arrEnd = text.LastIndexOf(']');
            if (arrStart >= 0 && arrEnd > arrStart)
                return text.Substring(arrStart, arrEnd - arrStart + 1);

            return text;
        }

        private static List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)> GiaiQuyetMaKhoaHocTuTen(
            List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)> courses,
            List<Models.KhoaHocModel> khoaDb)
        {
            if (courses.Count == 0)
                return courses;

            var tenCanTim = courses
                .Where(c => c.MaKhoaHoc <= 0 && !string.IsNullOrWhiteSpace(c.TenKhoaHoc))
                .Select(c => c.TenKhoaHoc.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var khoaTheoTen = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            if (tenCanTim.Count > 0)
            {
                foreach (var ten in tenCanTim)
                {
                    var kh = khoaDb.FirstOrDefault(k =>
                        !string.IsNullOrWhiteSpace(k.TenKhoaHoc)
                        && string.Equals(k.TenKhoaHoc, ten, StringComparison.OrdinalIgnoreCase))
                        ?? khoaDb.FirstOrDefault(k =>
                            !string.IsNullOrWhiteSpace(k.TenKhoaHoc)
                            && (k.TenKhoaHoc.Contains(ten, StringComparison.OrdinalIgnoreCase)
                                || ten.Contains(k.TenKhoaHoc, StringComparison.OrdinalIgnoreCase)));
                    if (kh != null)
                        khoaTheoTen[ten] = kh.MaKhoaHoc;
                }
            }

            var result = new List<(int MaKhoaHoc, string TenKhoaHoc, int GiaiDoan, string MucTieu)>();
            foreach (var c in courses)
            {
                var ma = c.MaKhoaHoc;
                if (ma <= 0 && khoaTheoTen.TryGetValue(c.TenKhoaHoc.Trim(), out var resolved))
                    ma = resolved;
                if (ma <= 0)
                    continue;
                if (result.Any(x => x.MaKhoaHoc == ma))
                    continue;
                result.Add((ma, c.TenKhoaHoc, c.GiaiDoan, c.MucTieu));
            }

            return result;
        }

        private static int TryGetInt(JsonElement el, params string[] names)
        {
            foreach (var name in names)
            {
                if (!el.TryGetProperty(name, out var prop))
                    continue;
                if (prop.ValueKind == JsonValueKind.Number && prop.TryGetInt32(out var n))
                    return n;
            }
            return 0;
        }

        private static string? TryGetString(JsonElement el, params string[] names)
        {
            foreach (var name in names)
            {
                if (el.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.String)
                {
                    var s = prop.GetString();
                    if (!string.IsNullOrWhiteSpace(s))
                        return s;
                }
            }
            return null;
        }

        private async Task<(int tongSoBai, int soBaiDaHoc, int phanTram)> LayTienDoKhoaHocAsync(int maNguoiDung, int maKhoaHoc)
        {
            int tongSoBai = await _context.BaiHocs
                .AsNoTracking()
                .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .CountAsync();

            int soBaiDaHoc = await _context.TienDoBaiHocs
                .AsNoTracking()
                .Where(t => t.MaNguoiDung == maNguoiDung
                         && t.DaXem
                         && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .CountAsync();

            int phanTram = tongSoBai > 0
                ? (int)Math.Round((double)soBaiDaHoc / tongSoBai * 100)
                : 0;

            return (tongSoBai, soBaiDaHoc, phanTram);
        }
    }
}
