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
        private readonly BaiTapThucHanhHocVienService _thucHanhService;

        public BaiTapController(BaiTapService ideService, BaiTapThucHanhHocVienService thucHanhService)
        {
            _ideService = ideService;
            _thucHanhService = thucHanhService;
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
        [HttpGet("thuc-hanh/{maBaiTap}")]
        public async Task<IActionResult> GetThongTinThucHanh(int maBaiTap)
        {
            try
            {
                var data = await _thucHanhService.GetThongTinBaiTapAsync(maBaiTap);
                if (data == null) return NotFound(new { message = "Không tìm thấy bài tập thực hành." });
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", error = ex.Message });
            }
        }

        [HttpPost("thuc-hanh/{maBaiTap}/submit")]
        public async Task<IActionResult> SubmitBaiTapThucHanh(int maBaiTap, [FromBody] educodeai_server.DTOs.BaiTap.SubmitCodeRequestDTO request)
        {
            try
            {
                int maNguoiDung = educodeai_server.Helpers.LayNguoiDungID.LayID(User);
                if (maNguoiDung <= 0) maNguoiDung = 1; // Temporary mock for dev if needed

                var data = await _thucHanhService.SubmitCodeAsync(maNguoiDung, maBaiTap, request);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống biên dịch hoặc CSDL", error = ex.Message });
            }
        }

        /// <summary>
        /// AI Code Doctor: phân tích lỗi code và đưa ra gợi ý sửa (không viết code giải pháp).
        /// </summary>
        [HttpPost("thuc-hanh/{maBaiTap}/ai-goi-y")]
        public async Task<IActionResult> AiGoiYSuaCode(int maBaiTap, [FromBody] educodeai_server.DTOs.BaiTap.PhanTichLoiCodeRequestDTO request)
        {
            try
            {
                var ketQua = await _thucHanhService.PhanTichLoiCodeAIAsync(request);
                return Ok(ketQua);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi gọi AI phân tích.", error = ex.Message });
            }
        }
    }
}
