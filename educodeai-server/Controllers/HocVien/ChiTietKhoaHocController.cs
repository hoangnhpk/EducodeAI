using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using educodeai_server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace EduCodeAI.Controllers.HocVien
{
    [ApiController]
    [Route("api/hocvien/chitietkhoahoc")]
    public class ChiTietKhoaHocController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public ChiTietKhoaHocController(EduCodeAIDbContext context)
        {
            _context = context;
        }

        [HttpPost("dang-ky")]
        public async Task<IActionResult> DangKyKhoaHoc([FromBody] DangKyKhoaHocRequestDto request)
        {
            try
            {
                int maNguoiDung = LayNguoiDungID.LayID(User);
                if (maNguoiDung == 0)
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập để đăng ký khóa học." });
                }

                var khoaHoc = await _context.KhoaHocs.AsNoTracking().FirstOrDefaultAsync(k => k.MaKhoaHoc == request.MaKhoaHoc);
                if (khoaHoc == null)
                {
                    return NotFound(new { message = "Khóa học không tồn tại." });
                }

                var daDangKy = await _context.DangKyKhoaHocs.AnyAsync(dk => dk.MaKhoaHoc == request.MaKhoaHoc && dk.MaNguoiDung == maNguoiDung);
                if (daDangKy)
                {
                    return BadRequest(new { message = "Bạn đã đăng ký khóa học này rồi." });
                }

                var laKhoaHocMienPhi = string.Equals(khoaHoc.DonViTienTe, "FREE", StringComparison.OrdinalIgnoreCase) || khoaHoc.GiaKhoaHoc <= 0;
                if (!laKhoaHocMienPhi)
                {
                    return BadRequest(new { message = "Khóa học trả phí cần được mua qua trang thanh toán." });
                }

                var dangKyMoi = new DangKyKhoaHocModel
                {
                    MaKhoaHoc = request.MaKhoaHoc,
                    MaNguoiDung = maNguoiDung,
                    NgayDangKy = DateTime.UtcNow,
                    TrangThai = "DangHoc",
                    TienDo = 0
                };

                _context.DangKyKhoaHocs.Add(dangKyMoi);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đăng ký khóa học thành công!", maKhoaHoc = request.MaKhoaHoc });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng ký khóa học.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllKhoaHoc()
        {
            var dsKhoaHoc = await _context.KhoaHocs.AsNoTracking()
                .Select(k => new
                {
                    k.MaKhoaHoc,
                    k.TenKhoaHoc,
                    k.HinhAnh,
                    k.LinhVuc,
                    k.DiemDanhGiaTB,
                    k.ThoiLuongGio,
                    k.TrinhDo,
                    k.KyNangChinh
                })
                .ToListAsync();

            return Ok(dsKhoaHoc);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetKhoaHocById(int id)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);

            var khoaHocEntity = await _context.KhoaHocs
                .AsNoTracking()
                .Include(k => k.GiangVien)
                .Include(k => k.ChuongHocs)
                    .ThenInclude(c => c.BaiHocs)
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == id);

            if (khoaHocEntity == null)
            {
                return NotFound("Không tìm thấy khóa học");
            }

            var banSeHocDuocGi = new List<string>();
            if (!string.IsNullOrWhiteSpace(khoaHocEntity.BanSeHocDuocGi))
            {
                try
                {
                    banSeHocDuocGi = JsonSerializer.Deserialize<List<string>>(khoaHocEntity.BanSeHocDuocGi) ?? new List<string>();
                }
                catch
                {
                    banSeHocDuocGi = new List<string>();
                }
            }

            var tongSoHocVien = await _context.DangKyKhoaHocs.AsNoTracking()
                .CountAsync(dk => dk.MaKhoaHoc == id);

            var khoaHocDaDangKy = maNguoiDung > 0 &&
                await _context.DangKyKhoaHocs.AsNoTracking()
                    .AnyAsync(dk => dk.MaKhoaHoc == id && dk.MaNguoiDung == maNguoiDung);

            var diemDanhGiaTB = await _context.DanhGias.AsNoTracking()
                .Where(d => d.MaKhoaHoc == id)
                .Select(d => (double?)d.SoSao)
                .AverageAsync() ?? 0;

            var tongDanhGia = await _context.DanhGias.AsNoTracking()
                .CountAsync(d => d.MaKhoaHoc == id);

            var khoaHoc = new
            {
                khoaHocEntity.MaKhoaHoc,
                tenKhoaHoc = khoaHocEntity.TenKhoaHoc,
                moTa = khoaHocEntity.MoTa,
                videoGioiThieu = khoaHocEntity.VideoGioiThieu,
                banSeHocDuocGi,
                tongSoHocVien,
                giaKhoaHoc = khoaHocEntity.GiaKhoaHoc,
                donViTienTe = khoaHocEntity.DonViTienTe,
                khoaHocDaDangKy,
                hinhAnh = khoaHocEntity.HinhAnh,
                linhVuc = khoaHocEntity.LinhVuc,
                trinhDo = khoaHocEntity.TrinhDo,
                thoiLuongGio = khoaHocEntity.ThoiLuongGio,
                diemDanhGiaTB,
                tongDanhGia,
                coChungChi = khoaHocEntity.CoChungChi,
                tenChungChi = khoaHocEntity.TenChungChi,
                slug = SlugHelper.Generate(khoaHocEntity.TenKhoaHoc),
                giangVien = khoaHocEntity.GiangVien != null ? new
                {
                    maGiangVien = khoaHocEntity.GiangVien.MaNguoiDung,
                    hoTen = khoaHocEntity.GiangVien.HoTen,
                    anhDaiDien = khoaHocEntity.GiangVien.AnhDaiDien
                } : null,
                chuongs = khoaHocEntity.ChuongHocs
                    .OrderBy(c => c.ThuTu)
                    .Select(chuong => new
                    {
                        maChuong = chuong.MaChuong,
                        tenChuong = chuong.TenChuong,
                        baiHocs = chuong.BaiHocs
                            .OrderBy(b => b.ThuTu)
                            .Select(bai => new
                            {
                                maBaiHoc = bai.MaBaiHoc,
                                tenBaiHoc = bai.TieuDe,
                                videoUrl = bai.LinkVideo,
                                thoiLuong = bai.ThoiLuong
                            })
                            .ToList()
                    })
                    .ToList()
            };

            return Ok(khoaHoc);
        }
        [HttpGet("{id}/danh-gia")]
        public async Task<IActionResult> GetDanhGiaKhoaHoc(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery] string filter = "all")
        {
            var query = _context.DanhGias.AsNoTracking()
                .Include(d => d.NguoiDung)
                .Where(d => d.MaKhoaHoc == id);

            if (filter == "positive")
            {
                query = query.Where(d => d.SoSao >= 4);
            }
            else if (filter == "negative")
            {
                query = query.Where(d => d.SoSao <= 3);
            }

            var totalCount = await query.CountAsync();
            var danhGias = await query
                .OrderByDescending(d => d.NgayDanhGia)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new
                {
                    maDanhGia = d.MaDanhGia,
                    soSao = d.SoSao,
                    nhanXet = d.NhanXet,
                    ngayDanhGia = d.NgayDanhGia,
                    nguoiDung = new
                    {
                        hoTen = d.NguoiDung.HoTen,
                        anhDaiDien = d.NguoiDung.AnhDaiDien
                    }
                })
                .ToListAsync();

            return Ok(new
            {
                items = danhGias,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                currentPage = page
            });
        }
    }
}
