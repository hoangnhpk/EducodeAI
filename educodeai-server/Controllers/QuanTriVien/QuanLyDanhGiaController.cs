using educodeai_server.DTOs.QuanTriVien;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [Route("api/admin/danh-gia")]
    [ApiController]
    public class QuanLyDanhGiaController : ControllerBase
    {
        private readonly IQuanLyDanhGiaService _service;

        public QuanLyDanhGiaController(IQuanLyDanhGiaService service)
        {
            _service = service;
        }

        [HttpGet("thong-ke")]
        public async Task<IActionResult> LayThongKe([FromQuery] int? maKhoaHoc)
        {
            var result = await _service.LayThongKeAsync(maKhoaHoc);
            return Ok(result);
        }

        [HttpGet("khoa-hoc")]
        public async Task<IActionResult> LayDanhSachKhoaHocFilter()
        {
            var result = await _service.LayDanhSachKhoaHocFilterAsync();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> LayDanhSach([FromQuery] DanhGiaAdminFilterDTO filter)
        {
            var result = await _service.LayDanhSachAsync(filter);
            return Ok(result);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Duyet(int id)
        {
            var result = await _service.CapNhatTrangThaiAsync(id, "DaDuyet");
            return result
                ? Ok(new { success = true, message = "Da duyet danh gia thanh cong." })
                : NotFound(new { success = false, message = "Khong tim thay danh gia." });
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> TuChoi(int id)
        {
            var result = await _service.CapNhatTrangThaiAsync(id, "TuChoi");
            return result
                ? Ok(new { success = true, message = "Da tu choi danh gia." })
                : NotFound(new { success = false, message = "Khong tim thay danh gia." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Xoa(int id)
        {
            var result = await _service.XoaAsync(id);
            return result
                ? Ok(new { success = true, message = "Da xoa danh gia." })
                : NotFound(new { success = false, message = "Khong tim thay danh gia." });
        }

        [HttpPost("ai-duyet-hang-loat")]
        public async Task<IActionResult> AIDuyetHangLoat()
        {
            var result = await _service.DuyetHangLoatBangAIAsync();
            return Ok(new
            {
                success = true,
                message = $"AI đã xử lý {result.TongXuLy} đánh giá: {result.SoDaDuyet} duyệt, {result.SoTuChoi} từ chối.",
                data = result
            });
        }
    }
}
