using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using educodeai_server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
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
                // 1. Lấy ID người dùng từ Token (sử dụng helper của bạn)
                int maNguoiDung = LayNguoiDungID.LayID(User);
                if (maNguoiDung == 0)
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập để đăng ký khóa học." });
                }

                // 2. Kiểm tra xem Khóa học này có tồn tại không
                var khoaHoc = await _context.KhoaHocs.FindAsync(request.MaKhoaHoc);
                if (khoaHoc == null)
                {
                    return NotFound(new { message = "Khóa học không tồn tại." });
                }

                // 3. Kiểm tra xem người dùng đã đăng ký khóa học này trước đó chưa
                var daDangKy = await _context.DangKyKhoaHocs
                    .AnyAsync(dk => dk.MaKhoaHoc == request.MaKhoaHoc && dk.MaNguoiDung == maNguoiDung);

                if (daDangKy)
                {
                    return BadRequest(new { message = "Bạn đã đăng ký khóa học này rồi." });
                }

                // 4. Tạo bản ghi Đăng Ký mới
                var dangKyMoi = new DangKyKhoaHocModel // Lưu ý: Thay tên class này cho đúng với Model EF Core của bạn
                {
                    MaKhoaHoc = request.MaKhoaHoc,
                    MaNguoiDung = maNguoiDung,
                    NgayDangKy = DateTime.UtcNow,
                    TrangThai = "DangHoc", // Giả sử: 0 = Chưa học, 1 = Đang học, 2 = Đã hoàn thành
                    TienDo = 0     // Mới đăng ký thì tiến độ là 0%
                };

                _context.DangKyKhoaHocs.Add(dangKyMoi);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đăng ký khóa học thành công!", maKhoaHoc = request.MaKhoaHoc });
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nếu cần thiết
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng ký khóa học.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllKhoaHoc()
        {
            var dsKhoaHoc = await _context.KhoaHocs
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
            var khoaHoc = await _context.KhoaHocs
                .Include(k => k.GiangVien)
                .Include(k => k.ChuongHocs)
                    .ThenInclude(c => c.BaiHocs)
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == id);

            if (khoaHoc == null)
            {
                return NotFound("Không tìm thấy khóa học");
            }

            // Tính điểm đánh giá trung bình
            var danhGias = await _context.DanhGias.Where(d => d.MaKhoaHoc == id).ToListAsync();
            double diemTB = danhGias.Any() ? Math.Round(danhGias.Average(d => d.SoSao), 1) : 0;
            int tongDanhGia = danhGias.Count;

            return Ok(new
            {
                maKhoaHoc = khoaHoc.MaKhoaHoc,
                tenKhoaHoc = khoaHoc.TenKhoaHoc,
                moTa = khoaHoc.KyNangChinh,
                videoGioiThieu = khoaHoc.VideoGioiThieu,
                banSeHocDuocGi = !string.IsNullOrEmpty(khoaHoc.BanSeHocDuocGi) ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(khoaHoc.BanSeHocDuocGi) : new List<string>(),
                tongSoHocVien = await _context.DangKyKhoaHocs.CountAsync(dk => dk.MaKhoaHoc == khoaHoc.MaKhoaHoc),
                giaKhoaHoc = khoaHoc.GiaKhoaHoc,
                donViTienTe = khoaHoc.DonViTienTe,
                khoaHocDaDangKy = maNguoiDung > 0 && await _context.DangKyKhoaHocs.AnyAsync(dk =>
                    dk.MaKhoaHoc == khoaHoc.MaKhoaHoc && dk.MaNguoiDung == maNguoiDung),
                hinhAnh = khoaHoc.HinhAnh,
                linhVuc = khoaHoc.LinhVuc,
                trinhDo = khoaHoc.TrinhDo,
                thoiLuongGio = khoaHoc.ThoiLuongGio,
                diemDanhGiaTB = diemTB,
                tongDanhGia = tongDanhGia,
                coChungChi = khoaHoc.CoChungChi,
                tenChungChi = khoaHoc.TenChungChi,
                slug = SlugHelper.Generate(khoaHoc.TenKhoaHoc),
                giangVien = khoaHoc.GiangVien != null ? new {
                    maGiangVien = khoaHoc.GiangVien.MaNguoiDung,
                    hoTen = khoaHoc.GiangVien.HoTen,
                    anhDaiDien = khoaHoc.GiangVien.AnhDaiDien
                } : null,
                chuongs = khoaHoc.ChuongHocs.Select(chuong => new
                {
                    maChuong = chuong.MaChuong,
                    tenChuong = chuong.TenChuong,

                    baiHocs = chuong.BaiHocs.Select(bai => new
                    {
                        maBaiHoc = bai.MaBaiHoc,
                        tenBaiHoc = bai.TieuDe,   
                        videoUrl = bai.LinkVideo,
                        thoiLuong = bai.ThoiLuong
                    }).ToList()
                }).ToList()
            });
        }

        [HttpGet("{id}/danh-gia")]
        public async Task<IActionResult> GetDanhGiaKhoaHoc(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery] string filter = "all")
        {
            var query = _context.DanhGias
                .Include(d => d.NguoiDung)
                .Where(d => d.MaKhoaHoc == id); // Tạm lấy tất cả để dễ test, có thể thêm: && d.TrangThai == "DaDuyet"

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
                totalCount = totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                currentPage = page
            });
        }
    }
}
