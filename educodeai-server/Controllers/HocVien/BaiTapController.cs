using educodeai_server.Services.Implementation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiTapController : ControllerBase
    {
        private readonly BaiTapService _ideService;

        public BaiTapController(BaiTapService ideService)
        {
            _ideService = ideService;
        }

        public class RunCodeClientRequest
        {
            public string NgonNgu { get; set; } = string.Empty;
            public string Code { get; set; } = string.Empty;
            public string Input { get; set; } = string.Empty;
        }

        [HttpPost("chay-code")]
        public async Task<IActionResult> ChayCode([FromBody] RunCodeClientRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Vui lòng nhập code để chạy.");

            var ketQua = await _ideService.ExecuteCodeAsync(request.NgonNgu, request.Code, request.Input);

            if (ketQua == null)
            {
                return StatusCode(500, new { message = "Lỗi kết nối đến máy chủ biên dịch." });
            }

            // JDoodle trả statusCode = 200 là code chạy xong.
            // Nếu có lỗi biên dịch (Syntax error), nó sẽ nằm trong ketQua.output nhưng mình vẫn coi là chạy máy chủ thành công.
            return Ok(new
            {
                thanhCong = ketQua.statusCode == 200,
                ngonNguChay = request.NgonNgu,
                ketQuaInRa = ketQua.output,
                loi = ketQua.error, // Lỗi hệ thống của JDoodle (nếu có)
                tongHop = ketQua.output
            });
        }
    }
}
