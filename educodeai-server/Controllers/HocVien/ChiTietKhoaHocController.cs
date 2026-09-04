using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
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

            var chungChiGiangVien = new List<object>();
            if (khoaHocEntity.GiangVien != null)
            {
                var maGiangVien = khoaHocEntity.GiangVien.MaNguoiDung;
                var legacyCertificates = await _context.HoSoGiangVienTaiLieus
                    .AsNoTracking()
                    .Where(t =>
                        t.HoSoDangKyGiangVien.MaNguoiDung == maGiangVien &&
                        t.HoSoDangKyGiangVien.TrangThaiHoSo == "DaDuyet" &&
                        t.LoaiTaiLieu == "ChungChi" &&
                        t.TrangThai == "DaDuyet" &&
                        t.HienThiCongKhai)
                    .Select(t => new PublicInstructorCertificate
                    {
                        MaChungChi = t.MaTaiLieu,
                        TenChungChi = t.TenChungChi,
                        DonViCap = t.DonViCap,
                        NgayCap = t.NgayCapChungChi,
                        NgayHetHan = t.NgayHetHanChungChi,
                        CredentialId = t.MaChungChi,
                        NgayDuyet = t.NgayDuyet
                    })
                    .ToListAsync();

                var independentCertificates = await _context.YeuCauChungChiGiangViens
                    .AsNoTracking()
                    .Where(t =>
                        t.MaGiangVien == maGiangVien &&
                        t.TrangThai == "DaDuyet" &&
                        t.HienThiCongKhai)
                    .Select(t => new PublicInstructorCertificate
                    {
                        MaChungChi = t.MaYeuCauChungChi,
                        TenChungChi = t.TenChungChi,
                        DonViCap = t.DonViCap,
                        NgayCap = t.NgayCap,
                        NgayHetHan = t.NgayHetHan,
                        CredentialId = t.MaChungChi,
                        NgayDuyet = t.NgayDuyet
                    })
                    .ToListAsync();

                chungChiGiangVien = legacyCertificates
                    .Concat(independentCertificates)
                    .OrderByDescending(t => t.NgayDuyet)
                    .ThenByDescending(t => t.MaChungChi)
                    .Select(t => (object)new
                    {
                        maChungChi = t.MaChungChi,
                        tenChungChi = string.IsNullOrWhiteSpace(t.TenChungChi) ? "Chứng chỉ chuyên môn" : t.TenChungChi,
                        donViCap = t.DonViCap,
                        ngayCap = t.NgayCap,
                        ngayHetHan = t.NgayHetHan,
                        maChungChiChe = MaskCredentialId(t.CredentialId),
                        // URL do giảng viên cung cấp chỉ dành cho admin đối chiếu. Không công khai
                        // cho tới khi có quy trình duyệt riêng đối với tên miền của đơn vị cấp.
                        urlXacMinh = (string?)null,
                        ngayDuyet = t.NgayDuyet
                    })
                    .ToList();
            }

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
                    anhDaiDien = khoaHocEntity.GiangVien.AnhDaiDien,
                    chungChi = chungChiGiangVien
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

        private sealed class PublicInstructorCertificate
        {
            public long MaChungChi { get; init; }
            public string? TenChungChi { get; init; }
            public string? DonViCap { get; init; }
            public DateOnly? NgayCap { get; init; }
            public DateOnly? NgayHetHan { get; init; }
            public string? CredentialId { get; init; }
            public DateTime? NgayDuyet { get; init; }
        }

        private static string? MaskCredentialId(string? credentialId)
        {
            if (string.IsNullOrWhiteSpace(credentialId)) return null;
            var value = credentialId.Trim();
            if (value.Length <= 4) return "••••";
            return $"••••{value[^4..]}";
        }

        /// <summary>
        /// API công khai: Lấy đánh giá đã duyệt (ngẫu nhiên) để hiển thị trên trang chủ
        /// </summary>
        [HttpGet("danh-gia-trang-chu")]
        public async Task<IActionResult> GetDanhGiaTrangChu([FromQuery] int soLuong = 3)
        {
            var danhGias = await _context.DanhGias.AsNoTracking()
                .Include(d => d.NguoiDung)
                .Include(d => d.KhoaHoc)
                    .ThenInclude(k => k.GiangVien)
                .Where(d => !string.IsNullOrEmpty(d.NhanXet) && d.TrangThai != "TuChoi")
                .OrderByDescending(d => d.SoSao)
                .ThenBy(d => Guid.NewGuid()) // Random trong cùng mức sao
                .Take(soLuong)
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
                    },
                    khoaHoc = new
                    {
                        tenKhoaHoc = d.KhoaHoc.TenKhoaHoc,
                        giangVien = d.KhoaHoc.GiangVien != null ? d.KhoaHoc.GiangVien.HoTen : "Chưa rõ"
                    }
                })
                .ToListAsync();

            return Ok(danhGias);
        }

        /// <summary>
        /// API công khai: Lấy danh sách giảng viên tiêu biểu (dựa trên trung bình sao của các khóa học)
        /// </summary>
        [HttpGet("giang-vien-tieu-bieu")]
        public async Task<IActionResult> GetGiangVienTieuBieu([FromQuery] int soLuong = 4)
        {
            var topInstructors = await _context.NguoiDungs
                .Where(u => u.VaiTro == 1 && u.TrangThai == "Hoạt động") // 1: Giảng viên
                .Select(u => new
                {
                    maGiangVien = u.MaNguoiDung,
                    hoTen = u.HoTen,
                    anhDaiDien = u.AnhDaiDien,
                    chuyenMon = "Giảng viên EduCode", // Default role title
                    diemTrungBinh = u.KhoaHocs
                        .Where(k => k.TrangThai == "Hoạt động" && k.DiemDanhGiaTB >= 1)
                        .Average(k => (double?)k.DiemDanhGiaTB) ?? 0,
                    tongKhoaHoc = u.KhoaHocs
                        .Count(k => k.TrangThai == "Hoạt động")
                })
                .Where(u => u.tongKhoaHoc > 0) // Chỉ xét những GV đã có khóa học xuất bản
                .OrderByDescending(u => u.diemTrungBinh)
                .ThenByDescending(u => u.tongKhoaHoc) // Ưu tiên số lượng khóa học nếu bằng sao
                .Take(soLuong)
                .ToListAsync();

            return Ok(topInstructors);
        }

        /// <summary>
        /// API công khai: Danh mục (lĩnh vực) đang có khóa học, xếp theo số khóa học giảm dần
        /// </summary>
        [HttpGet("danh-muc-trang-chu")]
        public async Task<IActionResult> GetDanhMucTrangChu([FromQuery] int soLuong = 8)
        {
            var danhMucs = await _context.KhoaHocs.AsNoTracking()
                .Where(k => k.TrangThai == "Hoạt động" && !string.IsNullOrEmpty(k.LinhVuc))
                .GroupBy(k => k.LinhVuc)
                .Select(g => new
                {
                    tenLinhVuc = g.Key,
                    soKhoaHoc = g.Count()
                })
                .OrderByDescending(x => x.soKhoaHoc)
                .ThenBy(x => x.tenLinhVuc)
                .Take(soLuong)
                .ToListAsync();

            return Ok(danhMucs);
        }

        /// <summary>
        /// API công khai: Số liệu tổng quan cho thanh thống kê trang chủ
        /// </summary>
        [HttpGet("thong-ke-trang-chu")]
        public async Task<IActionResult> GetThongKeTrangChu()
        {
            var tongHocVien = await _context.NguoiDungs.AsNoTracking()
                .CountAsync(u => u.VaiTro == 2 && u.TrangThai == "Hoạt động");

            // Cùng bộ lọc với danh sách khóa học hiển thị ngoài trang chủ
            var tongKhoaHoc = await _context.KhoaHocs.AsNoTracking()
                .CountAsync(k => k.TrangThai == "Hoạt động");

            var tongGiangVien = await _context.NguoiDungs.AsNoTracking()
                .CountAsync(u => u.VaiTro == 1 && u.TrangThai == "Hoạt động");

            // Chỉ tính đánh giá đã duyệt để con số công khai phản ánh đúng thực tế
            var diemDanhGiaTB = await _context.DanhGias.AsNoTracking()
                .Where(d => d.TrangThai == "DaDuyet")
                .AverageAsync(d => (double?)d.SoSao) ?? 0;

            return Ok(new
            {
                tongHocVien,
                tongKhoaHoc,
                tongGiangVien,
                diemDanhGiaTB = Math.Round(diemDanhGiaTB, 1)
            });
        }
    }
}
