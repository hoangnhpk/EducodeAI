using educodeai_server.DTOs;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/giang-vien/khoa-hoc")]
    [ApiController] 
    public class KhoaHocCuaToiController : ControllerBase
    {
        private readonly IKhoaHocCuaToiService _service;

        public KhoaHocCuaToiController(IKhoaHocCuaToiService service)
        {
            _service = service;
        }

        [HttpGet("{maGiangVien}")]
        public async Task<IActionResult> GetDanhSach(int maGiangVien)
        {
            var result = await _service.GetDanhSachKhoaHocAsync(maGiangVien);
            return Ok(result);
        }

        [HttpGet("{maGiangVien}/{maKhoaHoc}")]
        public async Task<IActionResult> GetChiTiet(int maGiangVien, int maKhoaHoc)
        {
            var result = await _service.GetChiTietKhoaHocAsync(maKhoaHoc, maGiangVien);
            if (result == null)
                return NotFound("Không tìm thấy khóa học");

            return Ok(result);
        }

        [HttpPost("{maGiangVien}")]
        public async Task<IActionResult> TaoKhoaHoc(int maGiangVien, [FromBody] KhoaHocCreateUpdateDTO dto)
        {
            var result = await _service.TaoKhoaHocAsync(maGiangVien, dto);
            return Ok(result);
        }

        [HttpPut("{maGiangVien}/{maKhoaHoc}")]
        public async Task<IActionResult> CapNhatKhoaHoc(int maGiangVien, int maKhoaHoc, [FromBody] KhoaHocCreateUpdateDTO dto)
        {
            var result = await _service.CapNhatKhoaHocAsync(maKhoaHoc, maGiangVien, dto);
            if (!result)
                return NotFound("Không tìm thấy khóa học");

            return Ok(result);
        }

        [HttpDelete("{maGiangVien}/{maKhoaHoc}")]
        public async Task<IActionResult> XoaKhoaHoc(int maGiangVien, int maKhoaHoc)
        {
            var result = await _service.XoaKhoaHocAsync(maKhoaHoc, maGiangVien);
            if (!result)
                return NotFound("Không tìm thấy khóa học");

            return Ok(result);
        }

        [HttpPost("{maGiangVien}/{maKhoaHoc}/chung-chi/tao-de-ai")]
        public async Task<IActionResult> TaoDeChungChiBangAI(int maGiangVien, int maKhoaHoc)
        {
            var result = await _service.TaoDeChungChiBangAIAsync(maKhoaHoc, maGiangVien);
            if (!result.ThanhCong)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("{maGiangVien}/chuong/{maKhoaHoc}")]
        public async Task<IActionResult> ThemChuong(int maGiangVien, int maKhoaHoc, [FromBody] ChuongHocCreateUpdateDTO dto)
        {
            var result = await _service.ThemChuongAsync(maKhoaHoc, dto);
            return Ok(result);
        }

        [HttpPut("{maGiangVien}/chuong/{maChuong}")]
        public async Task<IActionResult> CapNhatChuong(int maGiangVien, int maChuong, [FromBody] ChuongHocCreateUpdateDTO dto)
        {
            var result = await _service.CapNhatChuongAsync(maChuong, maGiangVien, dto);
            if (!result)
                return NotFound("Không tìm thấy chương hoặc không có quyền");

            return Ok(result);
        }

        [HttpDelete("{maGiangVien}/chuong/{maChuong}")]
        public async Task<IActionResult> XoaChuong(int maGiangVien, int maChuong)
        {
            var result = await _service.XoaChuongAsync(maChuong, maGiangVien);
            if (!result)
                return NotFound("Không tìm thấy chương hoặc không có quyền");

            return Ok(result);
        }

        [HttpPost("{maGiangVien}/video/{maChuong}")]
        public async Task<IActionResult> ThemVideo(int maGiangVien, int maChuong, [FromBody] BaiHocVideoCreateUpdateDTO dto)
        {
            try
            {
                var result = await _service.ThemVideoAsync(maChuong, maGiangVien, dto);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPut("{maGiangVien}/video/{maBaiHoc}")]
        public async Task<IActionResult> CapNhatVideo(int maGiangVien, int maBaiHoc, [FromBody] BaiHocVideoCreateUpdateDTO dto)
        {
            var result = await _service.CapNhatVideoAsync(maBaiHoc, maGiangVien, dto);
            if (!result)
                return NotFound("Không tìm thấy bài học hoặc không có quyền");

            return Ok(result);
        }

        [HttpDelete("{maGiangVien}/video/{maBaiHoc}")]
        public async Task<IActionResult> XoaVideo(int maGiangVien, int maBaiHoc)
        {
            var result = await _service.XoaVideoAsync(maBaiHoc, maGiangVien);
            if (!result)
                return NotFound("Không tìm thấy bài học hoặc không có quyền");

            return Ok(result);
        }
        [HttpPost("upload-hinh-anh")]
        public async Task<IActionResult> UploadHinhAnh(
    IFormFile file,
    [FromServices] IWebHostEnvironment env)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh." });

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (jpg, png, webp, gif)." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Kích thước ảnh không được vượt quá 5MB." });

            var folder = Path.Combine(env.WebRootPath, "uploads", "khoa-hoc");
            Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName).ToLowerInvariant()}";

            await using var stream = new FileStream(Path.Combine(folder, fileName), FileMode.Create);
            await file.CopyToAsync(stream);

            return Ok(new { url = $"/uploads/khoa-hoc/{fileName}" });
        }
    }
}
