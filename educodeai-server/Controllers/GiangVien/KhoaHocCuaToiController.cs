using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/[controller]")]
    public class KhoaHocCuaToiController : ControllerBase
    {
        private readonly IKhoaHocCuaToiService _service;

        public KhoaHocCuaToiController(IKhoaHocCuaToiService service)
        {
            _service = service;
        }
        
        [HttpGet("danh-sach/{maGiangVien}")]
        public async Task<IActionResult> GetList(int maGiangVien)
        {
            var result = await _service.GetDanhSachKhoaHocGiangVienAsync(maGiangVien);
            return Ok(result);
        }

        [HttpGet("chi-tiet/{id}")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await _service.GetChiTietKhoaHoc(id);
            return result != null ? Ok(result) : NotFound("Không tìm thấy khóa học");
        }
    }
}