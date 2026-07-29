using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Services.Interface;
using educodeai_server.Repository.Interface;
using educodeai_server.Models;
using educodeai_server.Data;
using educodeai_server.Common;
using educodeai_server.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

public class QuanLyNguoiDungService : IQuanLyNguoiDungService
{
    // Chỉ Giảng viên (1) và Học viên (2) được phép gán qua API quản lý user (H.2):
    // chặn tạo/nâng Admin (0) bằng mass assignment từ client.
    private static readonly int[] VaiTroChoPhep = { 1, 2 };

    private readonly IQuanLyNguoiDungRepository _repo;
    private readonly ISessionStateCache _sessionStateCache;
    private readonly ISessionRealtimeNotifier _sessionRealtimeNotifier;
    private readonly EduCodeAIDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<QuanLyNguoiDungService> _logger;
    private readonly PasswordHasher<NguoiDungModel> _passwordHasher;

    public QuanLyNguoiDungService(
        IQuanLyNguoiDungRepository repo,
        ISessionStateCache sessionStateCache,
        ISessionRealtimeNotifier sessionRealtimeNotifier,
        EduCodeAIDbContext context,
        IHttpContextAccessor httpContextAccessor,
        ILogger<QuanLyNguoiDungService> logger)
    {
        _repo = repo;
        _sessionStateCache = sessionStateCache;
        _sessionRealtimeNotifier = sessionRealtimeNotifier;
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
        _passwordHasher = new PasswordHasher<NguoiDungModel>();
    }

    // Actor id (admin đang thao tác) lấy từ JWT đã verify — không tin body/query.
    private int ActorId()
    {
        var raw = _httpContextAccessor.HttpContext?.User?.FindFirst("id")?.Value;
        return int.TryParse(raw, out var id) ? id : 0;
    }

    private string? ActorIp() =>
        _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

    public async Task<PagedResult<QuanLyNguoiDungDTO>> LayDanhSachNguoiDungAsync(NguoiDungFilterDTO filter)
    {
        // H.7: filter + pagination server-side, không load toàn bộ user in-memory.
        // Chỉ hiển thị Giảng viên (1) và Học viên (2) — Admin không lộ qua API quản lý user thường.
        var query = _context.NguoiDungs
            .AsNoTracking()
            .Where(nd => nd.VaiTro == 1 || nd.VaiTro == 2);

        if (filter.VaiTro is 1 or 2)
        {
            query = query.Where(nd => nd.VaiTro == filter.VaiTro);
        }

        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var kw = filter.Keyword.Trim().ToLower();
            query = query.Where(nd =>
                (nd.HoTen != null && nd.HoTen.ToLower().Contains(kw)) ||
                (nd.Email != null && nd.Email.ToLower().Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(filter.TrangThai))
        {
            query = query.Where(nd => nd.TrangThai == filter.TrangThai);
        }

        int total = await query.CountAsync();

        var page = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize is < 1 or > 100 ? 10 : filter.PageSize;

        var rows = await query
            .OrderByDescending(nd => nd.NgayThamGia)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(nd => new
            {
                nd.MaNguoiDung,
                nd.AnhDaiDien,
                nd.HoTen,
                nd.Email,
                nd.TrangThai,
                nd.LyDoKhoa,
                nd.ThoiGianMoKhoa,
                nd.NgayThamGia,
                nd.VaiTro
            })
            .ToListAsync();

        var now = DateTime.UtcNow;
        var data = rows.Select(nd =>
        {
            var isExpiredLock = nd.TrangThai == "Bị khóa" && nd.ThoiGianMoKhoa.HasValue && nd.ThoiGianMoKhoa.Value <= now;
            return new QuanLyNguoiDungDTO
            {
                MaNguoiDung = nd.MaNguoiDung.ToString(),
                AnhDaiDien = nd.AnhDaiDien,
                HoTen = nd.HoTen,
                Email = nd.Email,
                TrangThai = isExpiredLock ? "Hoạt động" : nd.TrangThai,
                LyDoKhoa = isExpiredLock ? null : nd.LyDoKhoa,
                ThoiGianMoKhoa = isExpiredLock ? null : nd.ThoiGianMoKhoa,
                NgayTao = nd.NgayThamGia,
                VaiTro = VaiTro(nd.VaiTro)
            };
        }).ToList();

        return new PagedResult<QuanLyNguoiDungDTO> { Total = total, Data = data };
    }
    private string VaiTro(int vaiTro)
    {
        switch (vaiTro)
        {
            case 0:
                return "Admin";
            case 1:
                return "Giảng viên";
            default:
                return "Học viên";
        }
    }
    public async Task<bool> ThemNguoiDungAsync(ThemNguoiDungDTO nguoiDung)
    {
        // H.2: chỉ cho tạo Giảng viên/Học viên; chặn tạo Admin qua API.
        if (!VaiTroChoPhep.Contains(nguoiDung.VaiTro))
            throw ApiException.Forbidden("Không được phép tạo tài khoản với vai trò này.");

        var danhSach = await _repo.LayTatCaAsync();
        if (danhSach.Any(x => x.Email == nguoiDung.Email))
        {
            return false;
        }
        var nguoiDungMoi = new NguoiDungModel
        {
            TaiKhoan = nguoiDung.Email,
            Email = nguoiDung.Email,
            HoTen = nguoiDung.HoTen,
            VaiTro = nguoiDung.VaiTro,
            AnhDaiDien = nguoiDung.AnhDaiDien,
            TrangThai = "Hoạt động",
            NgayThamGia = DateTime.Now,
            MatKhau = ""
        };

        nguoiDungMoi.MatKhau = _passwordHasher.HashPassword(nguoiDungMoi, nguoiDung.MatKhau ?? string.Empty);

        var ok = await _repo.ThemMoiAsync(nguoiDungMoi);
        if (ok)
            _logger.LogInformation("Admin {ActorId} tạo user {TargetId} vai trò {VaiTro} từ IP {Ip}.",
                ActorId(), nguoiDungMoi.MaNguoiDung, nguoiDungMoi.VaiTro, ActorIp());
        return ok;
    }

    public async Task<bool> CapNhatNguoiDungAsync(string id, CapNhatNguoiDungDTO nguoiDung)
    {
        if (!int.TryParse(id, out int maNguoiDung))
        {
            return false;
        }
        var nd = await _repo.LayTheoIdAsync(maNguoiDung);
        if (nd == null)
        {
            return false;
        }

        // H.5: không cho sửa tài khoản đang là Admin qua endpoint quản lý user thường
        // (chặn hạ quyền Admin / can thiệp Admin cuối cùng qua API này).
        if (nd.VaiTro == 0)
            throw ApiException.Forbidden("Không được phép chỉnh sửa tài khoản quản trị viên qua chức năng này.");

        // H.2: chỉ cho gán Giảng viên/Học viên; chặn nâng lên Admin bằng mass assignment.
        if (!VaiTroChoPhep.Contains(nguoiDung.VaiTro))
            throw ApiException.Forbidden("Vai trò không hợp lệ.");

        nd.HoTen = nguoiDung.HoTen ?? nd.HoTen;
        nd.Email = nguoiDung.Email ?? nd.Email;
        nd.AnhDaiDien = nguoiDung.AnhDaiDien ?? nd.AnhDaiDien;
        nd.VaiTro = nguoiDung.VaiTro;
        if (!string.IsNullOrEmpty(nguoiDung.MatKhauMoi))
        {
            nd.MatKhau = _passwordHasher.HashPassword(nd, nguoiDung.MatKhauMoi);
        }

        var ok = await _repo.CapNhatAsync(nd);
        if (ok)
            _logger.LogInformation("Admin {ActorId} cập nhật user {TargetId} (vai trò {VaiTro}) từ IP {Ip}.",
                ActorId(), nd.MaNguoiDung, nd.VaiTro, ActorIp());
        return ok;
    }
    public async Task<bool> KhoaNguoiDungAsync(string id, string lyDo = "", string thoiHan = "")
    {
        if (!int.TryParse(id, out int maId))
        {
            return false;
        }
        var nd = await _repo.LayTheoIdAsync(maId);
        if (nd == null)
        {
            return false;
        }

        var isKhoa = nd.TrangThai == "Hoạt động";
        // Lấy MaPhien các phiên trước khi Clear để còn invalidate cache + publish sau commit.
        var maPhienBiThuHoi = isKhoa
            ? (nd.DanhSachPhienDangNhap?.Select(p => p.MaPhien).ToList() ?? new List<int>())
            : new List<int>();

        if (isKhoa)
        {
            nd.TrangThai = thoiHan == "vinh-vien" ? "Khóa vĩnh viễn" : "Bị khóa";
            nd.LyDoKhoa = lyDo;

            if (thoiHan != "vinh-vien")
            {
                nd.ThoiGianMoKhoa = thoiHan switch
                {
                    "15s" => DateTime.UtcNow.AddSeconds(15),
                    "1d" => DateTime.UtcNow.AddDays(1),
                    "3d" => DateTime.UtcNow.AddDays(3),
                    "1w" => DateTime.UtcNow.AddDays(7),
                    "2w" => DateTime.UtcNow.AddDays(14),
                    "1m" => DateTime.UtcNow.AddMonths(1),
                    _ => null
                };
            }
            else
            {
                nd.ThoiGianMoKhoa = null;
            }

            // Xóa tất cả phiên đăng nhập khi bị khóa
            if (nd.DanhSachPhienDangNhap != null)
            {
                nd.DanhSachPhienDangNhap.Clear();
            }

            // H.3: revoke toàn bộ refresh token còn hiệu lực của user, transactionally cùng lệnh khóa.
            // Nếu không, user bị khóa vẫn gọi /refresh lấy access token mới. Repo + service dùng chung
            // DbContext scoped nên set NgayThuHoi ở đây được lưu chung trong SaveChanges của CapNhatAsync.
            var refreshTokens = await _context.RefreshTokens
                .Where(t => t.MaNguoiDung == maId && t.NgayThuHoi == null)
                .ToListAsync();
            foreach (var t in refreshTokens)
            {
                t.NgayThuHoi = DateTime.UtcNow;
                t.LyDoThuHoi = "USER_LOCKED";
                t.IpThuHoi = ActorIp();
            }
        }
        else
        {
            nd.TrangThai = "Hoạt động";
            nd.LyDoKhoa = null;
            nd.ThoiGianMoKhoa = null;
        }

        var capNhatThanhCong = await _repo.CapNhatAsync(nd);
        if (!capNhatThanhCong)
        {
            return false;
        }

        // Sau commit: invalidate cache để middleware không đọc trạng thái/phiên cũ (mục 2.14, H.3/H.4).
        // Cache user-status TTL 5 phút nên nếu không xóa, user bị khóa vẫn qua middleware tới hết TTL.
        await _sessionStateCache.InvalidateUserStatusAsync(maId);
        foreach (var maPhien in maPhienBiThuHoi)
        {
            await _sessionStateCache.InvalidateSessionAsync(maPhien);
        }

        // Push realtime: khóa → đẩy mọi thiết bị logout ngay; danh sách phiên đổi → trang thiết bị refetch.
        if (isKhoa)
        {
            await _sessionRealtimeNotifier.UserLockedAsync(maId);
        }
        await _sessionRealtimeNotifier.SessionListChangedAsync(maId);

        // H.6: audit ai khóa/mở ai, lý do, thời hạn, IP (không log dữ liệu nhạy cảm).
        _logger.LogInformation(
            "Admin {ActorId} {Action} user {TargetId} (lyDo={LyDo}, thoiHan={ThoiHan}) từ IP {Ip}.",
            ActorId(), isKhoa ? "khóa" : "mở khóa", maId, lyDo, thoiHan, ActorIp());

        return true;
    }

    public async Task<bool> XoaNguoiDungAsync(string id)
    {
        if (!int.TryParse(id, out int maId))
        {
            return false;
        }
        var nd = await _repo.LayTheoIdAsync(maId);
        if (nd == null)
        {
            return false;
        }
        
        // H.5: chặn xóa tài khoản Admin qua API quản lý user thường.
        if (nd.VaiTro == 0)
            throw ApiException.Forbidden("Không được phép xóa tài khoản quản trị viên.");

        // Chỉ có thể xóa nếu khóa vĩnh viễn
        if (nd.TrangThai != "Khóa vĩnh viễn")
        {
            return false;
        }

        var ok = await _repo.XoaAsync(nd);
        if (ok)
            _logger.LogInformation("Admin {ActorId} xóa user {TargetId} từ IP {Ip}.",
                ActorId(), maId, ActorIp());
        return ok;
    }
}