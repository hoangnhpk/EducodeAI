using educodeai_server.DTOs.QuaTang;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/qua-tang-khoa-hoc")]
    [Authorize(Roles = "GiangVien")]
    public class QuaTangKhoaHocGiangVienController : ControllerBase
    {
        private readonly IQuaTangKhoaHocService _quaTangKhoaHocService;

        public QuaTangKhoaHocGiangVienController(IQuaTangKhoaHocService quaTangKhoaHocService)
        {
            _quaTangKhoaHocService = quaTangKhoaHocService;
        }

        [HttpPost("tang")]
        public async Task<IActionResult> TangKhoaHoc([FromBody] TangKhoaHocDTO yeuCau)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu yêu cầu không hợp lệ." });
            }

            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            try
            {
                var ketQua = await _quaTangKhoaHocService.GiangVienTangHocVienAsync(maGiangVien, yeuCau);
                return Ok(ketQua);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpGet("lich-su")]
        public async Task<IActionResult> LayLichSu([FromQuery] int? maKhoaHoc = null, [FromQuery] string? tuKhoa = null)
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            var duLieu = await _quaTangKhoaHocService.LayLichSuQuaTangCuaGiangVienAsync(maGiangVien, maKhoaHoc, tuKhoa);
            return Ok(duLieu);
        }

        [HttpGet("khoa-hoc-cua-toi")]
        public async Task<IActionResult> LayKhoaHocCuaToi()
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            var duLieu = await _quaTangKhoaHocService.LayKhoaHocCuaGiangVienDeTangAsync(maGiangVien);
            return Ok(duLieu);
        }

        [HttpGet("khoa-hoc/{maKhoaHoc:int}/hoc-vien-co-the-nhan")]
        public async Task<IActionResult> LayHocVienCoTheNhan(int maKhoaHoc, [FromQuery] string? tuKhoa = null)
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            try
            {
                var duLieu = await _quaTangKhoaHocService.LayHocVienCoTheNhanQuaAsync(maGiangVien, maKhoaHoc, tuKhoa);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
