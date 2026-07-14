using educodeai_server.Data;
using educodeai_server.DTOs.ThuThach;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class ThuThachService : IThuThachService
    {
        private const string StInProgress = "IN_PROGRESS";
        private const string StCompleted = "COMPLETED";
        private const string StClaimed = "CLAIMED";

        private readonly EduCodeAIDbContext _context;

        public ThuThachService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public Task<ThuThachTuanResponseDTO> LayThuThachTuanAsync(int maNguoiDung)
            => TaoBangNhiemVuAsync(maNguoiDung);

        public async Task<NhanThuongResponseDTO> NhanThuongAsync(int maNguoiDung, int maMau)
        {
            var utcNow = DateTime.UtcNow;
            await DamBaoHoSoGamificationAsync(maNguoiDung);

            var (_, _, mauList, tienDoList) = await ChuanBiVaDongBoTienDoAsync(maNguoiDung, utcNow);

            var tienDo = tienDoList.FirstOrDefault(t => t.MaMau == maMau);
            if (tienDo == null)
                throw new ApplicationException("Không tìm thấy nhiệm vụ trong tuần này.");

            var mau = mauList.FirstOrDefault(m => m.MaMau == maMau);
            if (mau == null)
                throw new ApplicationException("Nhiệm vụ không còn khả dụng.");

            if (tienDo.TrangThai == StClaimed)
                throw new ApplicationException("Bạn đã nhận thưởng nhiệm vụ này rồi.");

            if (tienDo.TrangThai != StCompleted)
                throw new ApplicationException("Nhiệm vụ chưa hoàn thành, chưa thể nhận thưởng.");

            var maTienDo = tienDo.MaTienDo;
            var expNhan = mau.ExpThuong;

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                // Chỉ 1 request chuyển COMPLETED → CLAIMED; request song song nhận 0 dòng.
                var claimedRows = await _context.TienDoNhiemVuTuans
                    .Where(t => t.MaTienDo == maTienDo && t.TrangThai == StCompleted)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(t => t.TrangThai, StClaimed)
                        .SetProperty(t => t.NgayNhanThuong, utcNow));

                if (claimedRows == 0)
                {
                    var trangThai = await _context.TienDoNhiemVuTuans
                        .AsNoTracking()
                        .Where(t => t.MaTienDo == maTienDo)
                        .Select(t => t.TrangThai)
                        .FirstOrDefaultAsync();

                    if (trangThai == StClaimed)
                        throw new ApplicationException("Bạn đã nhận thưởng nhiệm vụ này rồi.");

                    throw new ApplicationException("Nhiệm vụ chưa hoàn thành, chưa thể nhận thưởng.");
                }

                var expRows = await _context.NguoiDungGamifications
                    .Where(g => g.MaNguoiDung == maNguoiDung)
                    .ExecuteUpdateAsync(s => s.SetProperty(g => g.TongExp, g => g.TongExp + expNhan));

                if (expRows == 0)
                    throw new ApplicationException("Không tìm thấy hồ sơ gamification.");

                var tongExp = await _context.NguoiDungGamifications
                    .AsNoTracking()
                    .Where(g => g.MaNguoiDung == maNguoiDung)
                    .Select(g => g.TongExp)
                    .FirstAsync();

                var danhHieuMoi = await MoKhoaDanhHieuTheoExpAsync(maNguoiDung, tongExp);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                _context.ChangeTracker.Clear();

                var bang = await TaoBangNhiemVuAsync(maNguoiDung);
                var bxh = await LayBangXepHangTuanAsync(maNguoiDung);

                return new NhanThuongResponseDTO
                {
                    ExpNhanDuoc = expNhan,
                    TongExp = tongExp,
                    DanhHieuMoiMoKhoa = danhHieuMoi,
                    BangNhiemVu = bang,
                    BangXepHang = bxh,
                };
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<ThuThachTuanResponseDTO> DeoDanhHieuAsync(int maNguoiDung, int maDanhHieu)
            => await DeoDanhHieuInternalAsync(maNguoiDung, maDanhHieu);

        public async Task<BangXepHangResponseDTO> LayBangXepHangTuanAsync(int maNguoiDung, int top = 20)
        {
            top = Math.Clamp(top, 5, 100);
            var utcNow = DateTime.UtcNow;
            var (dauChuKy, ketChuKy, giayConLai) = ChuKyThuThachHelper.LayChuKyHienTai(utcNow);

            var expTheoNguoi = await (
                from t in _context.TienDoNhiemVuTuans
                join m in _context.MauNhiemVuTuans on t.MaMau equals m.MaMau
                join u in _context.NguoiDungs on t.MaNguoiDung equals u.MaNguoiDung
                where t.TrangThai == StClaimed
                    && u.VaiTro == 2
                    && t.DauChuKy >= dauChuKy
                    && t.DauChuKy < ketChuKy
                group m.ExpThuong by t.MaNguoiDung into g
                select new { MaNguoiDung = g.Key, Exp = g.Sum() }
            ).ToDictionaryAsync(x => x.MaNguoiDung, x => x.Exp);

            var gioHocTheoNguoi = expTheoNguoi.Count == 0
                ? new Dictionary<int, int>()
                : await _context.TienDoBaiHocs
                    .Where(t => expTheoNguoi.Keys.Contains(t.MaNguoiDung)
                        && t.NgayCapNhat >= dauChuKy
                        && t.NgayCapNhat < ketChuKy)
                    .GroupBy(t => t.MaNguoiDung)
                    .Select(g => new { MaNguoiDung = g.Key, TongGiay = g.Sum(x => x.ThoiGianHoc) })
                    .ToDictionaryAsync(x => x.MaNguoiDung, x => x.TongGiay);

            // Hòa EXP → tổng thời gian học trong tuần (giây), ai học lâu hơn đứng trên — không tính ai nhận điểm trước
            var agg = expTheoNguoi
                .Where(x => x.Value > 0)
                .Select(x => (
                    MaNguoiDung: x.Key,
                    Exp: x.Value,
                    GioHocGiay: gioHocTheoNguoi.GetValueOrDefault(x.Key, 0)))
                .OrderByDescending(x => x.Exp)
                .ThenByDescending(x => x.GioHocGiay)
                .ThenBy(x => x.MaNguoiDung)
                .ToList();

            return await TaoBangXepHangTuAggAsync(
                maNguoiDung, agg, top, "tuan", dauChuKy, ketChuKy, giayConLai);
        }

        public async Task<BangXepHangResponseDTO> LayBangXepHangToanWebAsync(int maNguoiDung, int top = 50)
        {
            top = Math.Clamp(top, 5, 100);

            var agg = await (
                from g in _context.NguoiDungGamifications
                join u in _context.NguoiDungs on g.MaNguoiDung equals u.MaNguoiDung
                where u.VaiTro == 2 && g.TongExp > 0
                orderby g.TongExp descending, u.MaNguoiDung ascending
                select new ValueTuple<int, int, int>(g.MaNguoiDung, g.TongExp, 0)
            ).ToListAsync();

            return await TaoBangXepHangTuAggAsync(maNguoiDung, agg, top, "toan_web");
        }

        private async Task<BangXepHangResponseDTO> TaoBangXepHangTuAggAsync(
            int maNguoiDung,
            List<(int MaNguoiDung, int Exp, int GioHocGiay)> agg,
            int top,
            string loai,
            DateTime? dauChuKy = null,
            DateTime? ketChuKy = null,
            long giayConLai = 0)
        {
            int? hangCuaToi = null;
            var expCuaToi = 0;
            for (var i = 0; i < agg.Count; i++)
            {
                if (agg[i].MaNguoiDung == maNguoiDung)
                {
                    hangCuaToi = i + 1;
                    expCuaToi = agg[i].Exp;
                    break;
                }
            }

            var topSlice = agg.Take(top).ToList();
            var topIds = topSlice.Select(x => x.MaNguoiDung).ToList();

            var users = await _context.NguoiDungs
                .Where(u => topIds.Contains(u.MaNguoiDung))
                .Select(u => new { u.MaNguoiDung, u.HoTen, u.AnhDaiDien })
                .ToListAsync();

            var gamifications = await _context.NguoiDungGamifications
                .Where(g => topIds.Contains(g.MaNguoiDung))
                .Select(g => new { g.MaNguoiDung, g.MaDanhHieuDangDeo })
                .ToListAsync();

            var danhHieuIds = gamifications
                .Where(g => g.MaDanhHieuDangDeo.HasValue)
                .Select(g => g.MaDanhHieuDangDeo!.Value)
                .Distinct()
                .ToList();

            var danhHieus = await _context.DanhHieus
                .Where(d => danhHieuIds.Contains(d.MaDanhHieu))
                .ToDictionaryAsync(d => d.MaDanhHieu, d => new { d.TenDanhHieu, d.MaCode });

            var userMap = users.ToDictionary(u => u.MaNguoiDung);
            var gamMap = gamifications.ToDictionary(g => g.MaNguoiDung);

            var danhSach = new List<BangXepHangItemDTO>();
            for (var i = 0; i < topSlice.Count; i++)
            {
                var row = topSlice[i];
                userMap.TryGetValue(row.MaNguoiDung, out var user);
                gamMap.TryGetValue(row.MaNguoiDung, out var gam);
                string? tenDh = null;
                string? maCodeDh = null;
                if (gam?.MaDanhHieuDangDeo is int maDh && danhHieus.TryGetValue(maDh, out var dhInfo))
                {
                    tenDh = dhInfo.TenDanhHieu;
                    maCodeDh = dhInfo.MaCode;
                }

                danhSach.Add(new BangXepHangItemDTO
                {
                    Hang = i + 1,
                    MaNguoiDung = row.MaNguoiDung,
                    HoTen = string.IsNullOrWhiteSpace(user?.HoTen) ? "Học viên" : user!.HoTen!,
                    AnhDaiDien = user?.AnhDaiDien,
                    Exp = row.Exp,
                    TenDanhHieu = tenDh,
                    MaCodeDanhHieu = maCodeDh,
                    GioHocPhut = loai == "tuan" ? row.GioHocGiay / 60 : null,
                    LaToi = row.MaNguoiDung == maNguoiDung,
                });
            }

            return new BangXepHangResponseDTO
            {
                Loai = loai,
                NgayBatDau = dauChuKy,
                NgayKetThuc = ketChuKy,
                GiayConLaiDenLamMoi = giayConLai,
                HangCuaToi = hangCuaToi,
                ExpCuaToi = expCuaToi,
                DanhSach = danhSach,
            };
        }

        private async Task<ThuThachTuanResponseDTO> DeoDanhHieuInternalAsync(int maNguoiDung, int maDanhHieu)
        {
            await DamBaoHoSoGamificationAsync(maNguoiDung);

            var hoSo = await _context.NguoiDungGamifications
                .FirstAsync(g => g.MaNguoiDung == maNguoiDung);

            await MoKhoaDanhHieuTheoExpAsync(maNguoiDung, hoSo.TongExp);
            await _context.SaveChangesAsync();

            var daMo = await _context.NguoiDungDanhHieus
                .AnyAsync(x => x.MaNguoiDung == maNguoiDung && x.MaDanhHieu == maDanhHieu);

            if (!daMo)
                throw new ApplicationException("Bạn chưa mở khóa danh hiệu này.");

            hoSo.MaDanhHieuDangDeo = maDanhHieu;
            await _context.SaveChangesAsync();

            return await LayBangNhiemVuKhongDongBoAsync(maNguoiDung);
        }

        /// <summary>Đọc dữ liệu tuần đã lưu, không quét lại tiến độ học (dùng khi chỉ đổi danh hiệu).</summary>
        private async Task<ThuThachTuanResponseDTO> LayBangNhiemVuKhongDongBoAsync(int maNguoiDung)
        {
            var utcNow = DateTime.UtcNow;
            var (dauChuKy, ketChuKy, giayConLai) = ChuKyThuThachHelper.LayChuKyHienTai(utcNow);

            var mauList = await _context.MauNhiemVuTuans
                .Where(m => m.DangHoatDong)
                .OrderBy(m => m.ThuTu)
                .ToListAsync();

            var tienDoList = await _context.TienDoNhiemVuTuans
                .Where(t => t.MaNguoiDung == maNguoiDung && t.DauChuKy == dauChuKy)
                .ToListAsync();

            var hoSo = await _context.NguoiDungGamifications
                .Include(g => g.DanhHieuDangDeo)
                .FirstAsync(g => g.MaNguoiDung == maNguoiDung);

            var danhSachDanhHieu = await LayDanhSachDanhHieuDtoAsync(maNguoiDung, hoSo);

            var nhiemVuDto = mauList
                .Select(mau =>
                {
                    var td = tienDoList.FirstOrDefault(t => t.MaMau == mau.MaMau);
                    if (td == null)
                    {
                        td = new TienDoNhiemVuTuanModel
                        {
                            MaMau = mau.MaMau,
                            GiaTriHienTai = 0,
                            TrangThai = StInProgress,
                        };
                    }
                    return MapNhiemVu(mau, td);
                })
                .ToList();

            var tenHuyHieu = hoSo.DanhHieuDangDeo?.TenDanhHieu
                ?? danhSachDanhHieu.FirstOrDefault(d => d.DangDeo)?.TenDanhHieu
                ?? danhSachDanhHieu.Where(d => d.DaMoKhoa).OrderByDescending(d => d.ExpYeuCau).FirstOrDefault()?.TenDanhHieu
                ?? "Tân binh học tập";

            return new ThuThachTuanResponseDTO
            {
                TongExp = hoSo.TongExp,
                HuyHieuHienTai = tenHuyHieu,
                MaDanhHieuDangDeo = hoSo.MaDanhHieuDangDeo,
                NgayDauTuan = dauChuKy,
                NgayKetThucTuan = ketChuKy,
                GiayConLaiDenLamMoi = giayConLai,
                DanhSachNhiemVu = nhiemVuDto,
                DanhSachDanhHieu = danhSachDanhHieu,
            };
        }

        private async Task<ThuThachTuanResponseDTO> TaoBangNhiemVuAsync(int maNguoiDung)
        {
            var utcNow = DateTime.UtcNow;
            var (_, ketChuKy, giayConLai) = ChuKyThuThachHelper.LayChuKyHienTai(utcNow);
            await DamBaoHoSoGamificationAsync(maNguoiDung);

            var (dauChuKy, _, mauList, tienDoList) = await ChuanBiVaDongBoTienDoAsync(maNguoiDung, utcNow);

            var hoSo = await _context.NguoiDungGamifications
                .Include(g => g.DanhHieuDangDeo)
                .FirstAsync(g => g.MaNguoiDung == maNguoiDung);

            await MoKhoaDanhHieuTheoExpAsync(maNguoiDung, hoSo.TongExp);
            await _context.SaveChangesAsync();

            var danhSachDanhHieu = await LayDanhSachDanhHieuDtoAsync(maNguoiDung, hoSo);

            var nhiemVuDto = mauList.Select(mau =>
            {
                var td = tienDoList.First(t => t.MaMau == mau.MaMau);
                return MapNhiemVu(mau, td);
            }).ToList();

            var tenHuyHieu = hoSo.DanhHieuDangDeo?.TenDanhHieu
                ?? danhSachDanhHieu.FirstOrDefault(d => d.DangDeo)?.TenDanhHieu
                ?? danhSachDanhHieu.Where(d => d.DaMoKhoa).OrderByDescending(d => d.ExpYeuCau).FirstOrDefault()?.TenDanhHieu
                ?? "Tân binh học tập";

            return new ThuThachTuanResponseDTO
            {
                TongExp = hoSo.TongExp,
                HuyHieuHienTai = tenHuyHieu,
                MaDanhHieuDangDeo = hoSo.MaDanhHieuDangDeo,
                NgayDauTuan = dauChuKy,
                NgayKetThucTuan = ketChuKy,
                GiayConLaiDenLamMoi = giayConLai,
                DanhSachNhiemVu = nhiemVuDto,
                DanhSachDanhHieu = danhSachDanhHieu,
            };
        }

        private async Task<(DateTime DauChuKy, DateTime KetChuKy, List<MauNhiemVuTuanModel> MauList, List<TienDoNhiemVuTuanModel> TienDoList)> ChuanBiVaDongBoTienDoAsync(
            int maNguoiDung,
            DateTime utcNow)
        {
            var (dauChuKy, ketChuKy, _) = ChuKyThuThachHelper.LayChuKyHienTai(utcNow);

            var mauList = await _context.MauNhiemVuTuans
                .Where(m => m.DangHoatDong)
                .OrderBy(m => m.ThuTu)
                .ToListAsync();

            var tienDoList = await _context.TienDoNhiemVuTuans
                .Where(t => t.MaNguoiDung == maNguoiDung && t.DauChuKy == dauChuKy)
                .ToListAsync();

            foreach (var mau in mauList)
            {
                if (tienDoList.Any(t => t.MaMau == mau.MaMau)) continue;

                var moi = new TienDoNhiemVuTuanModel
                {
                    MaNguoiDung = maNguoiDung,
                    MaMau = mau.MaMau,
                    DauChuKy = dauChuKy,
                    GiaTriHienTai = 0,
                    TrangThai = StInProgress,
                };
                _context.TienDoNhiemVuTuans.Add(moi);
                tienDoList.Add(moi);
            }

            if (_context.ChangeTracker.HasChanges())
                await _context.SaveChangesAsync();

            var giaTriDem = await DemGiaTriNhiemVuAsync(maNguoiDung, dauChuKy, ketChuKy, mauList, tienDoList);

            foreach (var tienDo in tienDoList)
            {
                if (tienDo.TrangThai == StClaimed) continue;

                var mau = mauList.FirstOrDefault(m => m.MaMau == tienDo.MaMau);
                if (mau == null) continue; // nhiệm vụ đã bị tắt giữa chu kỳ → giữ nguyên tiến độ, không xử lý
                var giaTri = giaTriDem.GetValueOrDefault(mau.LoaiDem, 0);
                tienDo.GiaTriHienTai = giaTri;
                tienDo.TrangThai = giaTri >= mau.ChiTieu ? StCompleted : StInProgress;
            }

            await _context.SaveChangesAsync();

            return (dauChuKy, ketChuKy, mauList, tienDoList);
        }

        private async Task<Dictionary<string, int>> DemGiaTriNhiemVuAsync(
            int maNguoiDung,
            DateTime dauChuKy,
            DateTime ketChuKy,
            List<MauNhiemVuTuanModel> mauList,
            List<TienDoNhiemVuTuanModel> tienDoList)
        {
            var result = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            var soBaiHoc = await _context.TienDoBaiHocs
                .Where(t => t.MaNguoiDung == maNguoiDung
                    && t.DaXem
                    && t.NgayCapNhat >= dauChuKy
                    && t.NgayCapNhat < ketChuKy)
                .Select(t => t.MaBaiHoc)
                .Distinct()
                .CountAsync();

            var soGioHocPhut = await _context.TienDoBaiHocs
                .Where(t => t.MaNguoiDung == maNguoiDung
                    && t.NgayCapNhat >= dauChuKy
                    && t.NgayCapNhat < ketChuKy)
                .SumAsync(t => (int?)t.ThoiGianHoc) ?? 0;

            // ThoiGianHoc lưu theo giây (thời lượng video đã học) → quy đổi phút
            var tongPhutHoc = soGioHocPhut / 60;

            var soQuiz = await (
                from k in _context.KetQuaLamBais
                join q in _context.BaiTap_Quizs on k.MaBaiTap equals q.MaBaiTap
                where k.MaNguoiDung == maNguoiDung
                    && k.NgayNop >= dauChuKy
                    && k.NgayNop < ketChuKy
                select k.MaBaiTap
            ).Distinct().CountAsync();

            var ngayCapNhatList = await _context.TienDoBaiHocs
                .Where(t => t.MaNguoiDung == maNguoiDung
                    && t.DaXem
                    && t.NgayCapNhat >= dauChuKy
                    && t.NgayCapNhat < ketChuKy)
                .Select(t => t.NgayCapNhat)
                .ToListAsync();

            // Chu kỳ tuần theo VN (+7) — đếm ngày học theo giờ Việt Nam
            var soNgayHoc = ngayCapNhatList
                .Select(d => d.AddHours(7).Date)
                .Distinct()
                .Count();

            result["hoc_bai"] = soBaiHoc;
            result["gio_hoc"] = tongPhutHoc;
            result["quiz"] = soQuiz;
            result["ngay_hoc"] = soNgayHoc;

            var mauPhu = mauList.Where(m => m.LoaiDem != "hoan_thanh_tat_ca").ToList();
            var hoanThanhPhu = mauPhu.Count(m =>
            {
                var td = tienDoList.FirstOrDefault(t => t.MaMau == m.MaMau);
                var giaTri = m.LoaiDem switch
                {
                    "hoc_bai" => soBaiHoc,
                    "gio_hoc" => tongPhutHoc,
                    "quiz" => soQuiz,
                    "ngay_hoc" => soNgayHoc,
                    _ => td?.GiaTriHienTai ?? 0,
                };
                return giaTri >= m.ChiTieu;
            });

            result["hoan_thanh_tat_ca"] = hoanThanhPhu >= mauPhu.Count ? 1 : 0;

            return result;
        }

        private async Task DamBaoHoSoGamificationAsync(int maNguoiDung)
        {
            var hoSo = await _context.NguoiDungGamifications
                .FirstOrDefaultAsync(g => g.MaNguoiDung == maNguoiDung);

            if (hoSo != null) return;

            var danhHieuMacDinh = await _context.DanhHieus
                .OrderBy(d => d.ThuTu)
                .FirstOrDefaultAsync();

            hoSo = new NguoiDungGamificationModel
            {
                MaNguoiDung = maNguoiDung,
                TongExp = 0,
                MaDanhHieuDangDeo = danhHieuMacDinh?.MaDanhHieu,
            };
            _context.NguoiDungGamifications.Add(hoSo);

            if (danhHieuMacDinh != null)
            {
                _context.NguoiDungDanhHieus.Add(new NguoiDungDanhHieuModel
                {
                    MaNguoiDung = maNguoiDung,
                    MaDanhHieu = danhHieuMacDinh.MaDanhHieu,
                    NgayMoKhoa = DateTime.UtcNow,
                });
            }

            await _context.SaveChangesAsync();
        }

        private async Task<string?> MoKhoaDanhHieuTheoExpAsync(int maNguoiDung, int tongExp)
        {
            var coTheMo = await _context.DanhHieus
                .Where(d => d.ExpYeuCau <= tongExp)
                .OrderByDescending(d => d.ExpYeuCau)
                .ToListAsync();

            var daCo = await _context.NguoiDungDanhHieus
                .Where(x => x.MaNguoiDung == maNguoiDung)
                .Select(x => x.MaDanhHieu)
                .ToListAsync();

            string? moiNhat = null;
            var moiList = coTheMo.Where(d => !daCo.Contains(d.MaDanhHieu)).ToList();
            foreach (var dh in moiList)
            {
                _context.NguoiDungDanhHieus.Add(new NguoiDungDanhHieuModel
                {
                    MaNguoiDung = maNguoiDung,
                    MaDanhHieu = dh.MaDanhHieu,
                    NgayMoKhoa = DateTime.UtcNow,
                });
            }

            // coTheMo đã OrderByDescending(ExpYeuCau) — phần tử đầu là cấp cao nhất
            if (moiList.Count > 0)
                moiNhat = moiList[0].TenDanhHieu;

            return moiNhat;
        }

        private async Task<List<DanhHieuDTO>> LayDanhSachDanhHieuDtoAsync(
            int maNguoiDung,
            NguoiDungGamificationModel hoSo)
        {
            var tatCa = await _context.DanhHieus.OrderBy(d => d.ThuTu).ToListAsync();
            var daMo = await _context.NguoiDungDanhHieus
                .Where(x => x.MaNguoiDung == maNguoiDung)
                .Select(x => x.MaDanhHieu)
                .ToListAsync();

            return tatCa.Select(d => new DanhHieuDTO
            {
                MaDanhHieu = d.MaDanhHieu,
                MaCode = d.MaCode,
                TenDanhHieu = d.TenDanhHieu,
                MoTa = d.MoTa,
                ExpYeuCau = d.ExpYeuCau,
                DaMoKhoa = daMo.Contains(d.MaDanhHieu) || hoSo.TongExp >= d.ExpYeuCau,
                DangDeo = hoSo.MaDanhHieuDangDeo == d.MaDanhHieu,
            }).ToList();
        }

        private static NhiemVuThuThachDTO MapNhiemVu(MauNhiemVuTuanModel mau, TienDoNhiemVuTuanModel td)
        {
            var phanTram = mau.ChiTieu <= 0
                ? 0
                : (int)Math.Min(100, Math.Round(td.GiaTriHienTai * 100.0 / mau.ChiTieu));

            return new NhiemVuThuThachDTO
            {
                MaMau = mau.MaMau,
                MaNhiemVu = mau.MaCode,
                TieuDe = mau.TieuDe,
                MoTa = mau.MoTa,
                Icon = mau.Icon,
                GiaTriHienTai = td.GiaTriHienTai,
                ChiTieu = mau.ChiTieu,
                ExpThuong = mau.ExpThuong,
                TrangThai = MapTrangThaiRaFrontend(td.TrangThai),
                PhanTramTienDo = phanTram,
            };
        }

        private static string MapTrangThaiRaFrontend(string trangThai) => trangThai switch
        {
            StCompleted => "completed",
            StClaimed => "claimed",
            _ => "in_progress",
        };
    }
}
