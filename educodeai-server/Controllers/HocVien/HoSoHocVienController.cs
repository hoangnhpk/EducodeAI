using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hoc-vien")]
    public class HoSoHocVienController : ControllerBase
    {
        private readonly IHocVienService _hocVienService;

        public HoSoHocVienController(IHocVienService hocVienService)
        {
            _hocVienService = hocVienService;
        }

        // ================== GET PROFILE ==================
        [HttpGet("ho-so")]
        public IActionResult GetHoSoHocVien()
        {
            int maNguoiDung = 2; // TODO: lấy từ JWT sau
            var result = _hocVienService.GetHoSoHocVien(maNguoiDung);
            return Ok(result);
        }

        // ================== UPDATE PROFILE ==================
        [HttpPut("ho-so")]
        public async Task<IActionResult> UpdateHoSoHocVien(
            [FromForm] UpdateHoSoHocVienDTO dto
        )
        {
            int maNguoiDung = 2; // TODO: lấy từ JWT sau

            var result = await _hocVienService.UpdateHoSoHocVien(
                maNguoiDung,
                dto
            );

            return Ok(result);
        }
    }
}
