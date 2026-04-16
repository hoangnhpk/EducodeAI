using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Services.Interface;
using educodeai_server.Repository.Interface;
using educodeai_server.Models;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class QuanLyNguoiDungService : IQuanLyNguoiDungService
{
    private readonly IQuanLyNguoiDungRepository _repo;
    private readonly PasswordHasher<NguoiDungModel> _passwordHasher;

    public QuanLyNguoiDungService(IQuanLyNguoiDungRepository repo)
    {
        _repo = repo;
        _passwordHasher = new PasswordHasher<NguoiDungModel>();
    }

    public async Task<IEnumerable<QuanLyNguoiDungDTO>> LayDanhSachNguoiDungAsync()
    {
        var danhSach = await _repo.LayTatCaAsync();

        // Chỉ hiển thị Giảng viên (1) và Học viên (2)
        return danhSach
            .Where(nd => nd.VaiTro == 1 || nd.VaiTro == 2)
            .Select(nd => new QuanLyNguoiDungDTO
            {
                MaNguoiDung = nd.MaNguoiDung.ToString(),
                AnhDaiDien = nd.AnhDaiDien,
                HoTen = nd.HoTen,
                Email = nd.Email,
                TrangThai = nd.TrangThai,
                LyDoKhoa = nd.LyDoKhoa,
                ThoiGianMoKhoa = nd.ThoiGianMoKhoa,
                NgayTao = nd.NgayThamGia,
                VaiTro = VaiTro(nd.VaiTro) 
            });
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

        return await _repo.ThemMoiAsync(nguoiDungMoi);
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
        nd.HoTen = nguoiDung.HoTen ?? nd.HoTen;
        nd.Email = nguoiDung.Email ?? nd.Email;
        nd.AnhDaiDien = nguoiDung.AnhDaiDien ?? nd.AnhDaiDien;
        nd.VaiTro = nguoiDung.VaiTro;
        if (!string.IsNullOrEmpty(nguoiDung.MatKhauMoi))
        {
            nd.MatKhau = _passwordHasher.HashPassword(nd, nguoiDung.MatKhauMoi);
        }
        return await _repo.CapNhatAsync(nd);
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

        if (nd.TrangThai == "Hoạt động")
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
        }
        else
        {
            nd.TrangThai = "Hoạt động";
            nd.LyDoKhoa = null;
            nd.ThoiGianMoKhoa = null;
        }

        return await _repo.CapNhatAsync(nd);
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
        
        // Chỉ có thể xóa nếu khóa vĩnh viễn
        if (nd.TrangThai != "Khóa vĩnh viễn")
        {
            return false;
        }

        return await _repo.XoaAsync(nd);
    }
}