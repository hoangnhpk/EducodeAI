using educodeai_server.DTOs;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/giang-vien/khoa-hoc")]
    [ApiController]
    [Authorize]
    public class KhoaHocCuaToiController : ControllerBase
    {
        private readonly IKhoaHocCuaToiService _service;

        public KhoaHocCuaToiController(IKhoaHocCuaToiService service)
        {
            _service = service;
        }

        private int GetMaGiangVien()
        {
            return LayNguoiDungID.LayID(User);
        }

        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSach()
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.GetDanhSachKhoaHocAsync(maGiangVien);
            return Ok(new { success = true, data = result });
        }

        [HttpGet("chi-tiet/{maKhoaHoc}")]
        public async Task<IActionResult> GetChiTiet(int maKhoaHoc)
        {
            try
            {
                var maGiangVien = GetMaGiangVien();
                if (maGiangVien == 0) return Unauthorized();
                
                var result = await _service.GetChiTietKhoaHocAsync(maKhoaHoc, maGiangVien);
                if (result == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khóa học" });
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText("error_500.txt", ex.ToString());
                throw;
            }
        }

        [HttpPost("tao-moi")]
        public async Task<IActionResult> TaoKhoaHoc([FromForm] KhoaHocCreateUpdateDTO dto)
        {
            try
            {
                var maGiangVien = GetMaGiangVien();
                if (maGiangVien == 0) return Unauthorized();
                
                var result = await _service.TaoKhoaHocAsync(maGiangVien, dto);
                if (result <= 0)
                    return BadRequest(new { success = false, message = "Tạo khóa học thất bại" });
                return Ok(new { success = true, maKhoaHoc = result, message = "Tạo khóa học thành công" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("cap-nhat/{maKhoaHoc}")]
        public async Task<IActionResult> CapNhatKhoaHoc(int maKhoaHoc, [FromForm] KhoaHocCreateUpdateDTO dto)
        {
            try
            {
                var maGiangVien = GetMaGiangVien();
                if (maGiangVien == 0) return Unauthorized();
                
                var result = await _service.CapNhatKhoaHocAsync(maKhoaHoc, maGiangVien, dto);
                if (!result)
                    return BadRequest(new { success = false, message = "Cập nhật khóa học thất bại" });
                return Ok(new { success = true, message = "Cập nhật khóa học thành công" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("xoa/{maKhoaHoc}")]
        public async Task<IActionResult> XoaKhoaHoc(int maKhoaHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.XoaKhoaHocAsync(maKhoaHoc, maGiangVien);
            if (!result)
                return BadRequest(new { success = false, message = "Xóa khóa học thất bại" });
            return Ok(new { success = true, message = "Xóa khóa học thành công" });
        }

        [HttpPost("tao-de-chung-chi-ai/{maKhoaHoc}")]
        public async Task<IActionResult> TaoDeChungChiBangAI(int maKhoaHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.TaoDeChungChiBangAIAsync(maKhoaHoc, maGiangVien);
            return Ok(new { success = true, data = result });
        }

        [HttpPost("them-chuong/{maKhoaHoc}")]
        public async Task<IActionResult> ThemChuong(int maKhoaHoc, [FromBody] ChuongHocCreateUpdateDTO dto)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.ThemChuongAsync(maKhoaHoc, maGiangVien, dto);
            return Ok(new { success = true, data = result });
        }

        [HttpPut("cap-nhat-chuong/{maChuong}")]
        public async Task<IActionResult> CapNhatChuong(int maChuong, [FromBody] ChuongHocCreateUpdateDTO dto)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.CapNhatChuongAsync(maChuong, maGiangVien, dto);
            if (!result)
                return BadRequest(new { success = false, message = "Cập nhật chương thất bại" });
            return Ok(new { success = true, message = "Cập nhật chương thành công" });
        }

        [HttpDelete("xoa-chuong/{maChuong}")]
        public async Task<IActionResult> XoaChuong(int maChuong)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.XoaChuongAsync(maChuong, maGiangVien);
            if (!result)
                return BadRequest(new { success = false, message = "Xóa chương thất bại" });
            return Ok(new { success = true, message = "Xóa chương thành công" });
        }

        [HttpPost("them-video/{maChuong}")]
        public async Task<IActionResult> ThemVideo(int maChuong, [FromForm] BaiHocVideoCreateUpdateDTO dto)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.ThemVideoAsync(maChuong, maGiangVien, dto);
            return Ok(new { success = true, data = result });
        }

        [HttpPut("cap-nhat-video/{maBaiHoc}")]
        public async Task<IActionResult> CapNhatVideo(int maBaiHoc, [FromForm] BaiHocVideoCreateUpdateDTO dto)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.CapNhatVideoAsync(maBaiHoc, maGiangVien, dto);
            if (!result)
                return BadRequest(new { success = false, message = "Cập nhật bài học thất bại" });
            return Ok(new { success = true, message = "Cập nhật bài học thành công" });
        }

        [HttpDelete("xoa-video/{maBaiHoc}")]
        public async Task<IActionResult> XoaVideo(int maBaiHoc, [FromServices] IWebHostEnvironment env)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.XoaVideoAsync(maBaiHoc, maGiangVien, env.WebRootPath);
            if (!result)
                return BadRequest(new { success = false, message = "Xóa bài học thất bại" });
            return Ok(new { success = true, message = "Xóa bài học thành công" });
        }

        [HttpPost("them-file/{maChuong}")]
        public async Task<IActionResult> ThemFile(int maChuong, [FromForm] BaiHocFileCreateUpdateDTO dto, [FromServices] IWebHostEnvironment env)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            var result = await _service.ThemFileAsync(maChuong, maGiangVien, dto, env.WebRootPath);
            return Ok(new { success = true, data = result });
        }

        [HttpPut("cap-nhat-file/{maBaiHoc}")]
        public async Task<IActionResult> CapNhatFile(int maBaiHoc, [FromForm] BaiHocFileCreateUpdateDTO dto, [FromServices] IWebHostEnvironment env)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            var result = await _service.CapNhatFileAsync(maBaiHoc, maGiangVien, dto, env.WebRootPath);
            if (!result)
                return BadRequest(new { success = false, message = "Cập nhật bài học thất bại" });
            return Ok(new { success = true, message = "Cập nhật bài học thành công" });
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

        // ===== YOUTUBE PLAYLIST IMPORT =====
        [HttpPost("youtube/playlist/analyze")]
        public async Task<IActionResult> AnalyzePlaylist([FromBody] YouTubePlaylistAnalyzeRequestDTO request)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.AnalyzePlaylistAsync(request.PlaylistUrl);
            return Ok(result);
        }

        [HttpGet("youtube/playlist/{playlistId}/videos")]
        public async Task<IActionResult> GetPlaylistVideos(string playlistId)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.GetPlaylistVideosAsync(playlistId);
            return Ok(result);
        }

        [HttpPost("courses/{maKhoaHoc}/youtube/playlist/import")]
        public async Task<IActionResult> ImportPlaylist(int maKhoaHoc, [FromBody] YouTubePlaylistImportRequestDTO request)
        {
            Console.WriteLine($"[DEBUG] YOUTUBE IMPORT RAW JSON REQUEST: {System.Text.Json.JsonSerializer.Serialize(request)}");
            Console.WriteLine($"[DEBUG] YOUTUBE IMPORT => MaKhoaHoc: {maKhoaHoc}, Playlist: {request.PlaylistId}, Videos: {request.Videos?.Count}, TargetChapter: {request.TargetChapterId}, NewChapterName: {request.NewChapterName}");
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.ImportPlaylistAsync(maKhoaHoc, maGiangVien, request);
            Console.WriteLine($"[DEBUG] YOUTUBE IMPORT RAW JSON RESPONSE: {System.Text.Json.JsonSerializer.Serialize(result)}");
            return Ok(result);
        }

        [HttpPost("youtube/video/info")]
        public async Task<IActionResult> GetVideoInfo([FromBody] YouTubeVideoInfoRequestDTO request)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.GetVideoInfoAsync(request.VideoUrl);
            return Ok(result);
        }

        // ===== REORDER FUNCTIONALITY =====
        [HttpPut("courses/{maKhoaHoc}/chapters/reorder")]
        public async Task<IActionResult> ReorderChapters(int maKhoaHoc, [FromBody] List<ChapterReorderDTO> chapters)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.ReorderChaptersAsync(maGiangVien, maKhoaHoc, chapters);
            if (!result)
                return BadRequest("Không thể sắp xếp lại chương");

            return Ok("Sắp xếp chương thành công");
        }

        [HttpPut("chapters/{maChuong}/lessons/reorder")]
        public async Task<IActionResult> ReorderLessons(int maChuong, [FromBody] List<LessonReorderDTO> lessons)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.ReorderLessonsAsync(maGiangVien, maChuong, lessons);
            if (!result)
                return BadRequest("Không thể sắp xếp lại bài học");

            return Ok("Sắp xếp bài học thành công");
        }

        // ===== CERTIFICATE CONFIG =====
        [HttpGet("courses/{maKhoaHoc}/certificate-config")]
        public async Task<IActionResult> GetCertificateConfig(int maKhoaHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.GetCertificateConfigAsync(maKhoaHoc, maGiangVien);
            if (result == null)
                return NotFound("Không tìm thấy khóa học");

            return Ok(result);
        }

        [HttpPut("courses/{maKhoaHoc}/certificate-config")]
        public async Task<IActionResult> UpdateCertificateConfig(int maKhoaHoc, [FromBody] CertificateConfigDTO config)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.UpdateCertificateConfigAsync(maKhoaHoc, maGiangVien, config);
            if (!result)
                return NotFound("Không tìm thấy khóa học");

            return Ok("Cập nhật cấu hình chứng chỉ thành công");
        }

        [HttpPost("courses/{maKhoaHoc}/certificate/enable")]
        public async Task<IActionResult> EnableCertificate(int maKhoaHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.EnableCertificateAsync(maKhoaHoc, maGiangVien);
            if (!result)
                return NotFound("Không tìm thấy khóa học");

            return Ok("Bật chứng chỉ thành công");
        }

        [HttpPost("courses/{maKhoaHoc}/certificate/disable")]
        public async Task<IActionResult> DisableCertificate(int maKhoaHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();
            
            var result = await _service.DisableCertificateAsync(maKhoaHoc, maGiangVien);
            if (!result)
                return NotFound("Không tìm thấy khóa học");

            return Ok(new { success = true, data = "Tắt chứng chỉ thành công" });
        }

        // ===== XEM VÀ SỬA ĐỀ THI CHỨNG CHỈ =====
        [HttpGet("de-chung-chi/{maKhoaHoc}")]
        public async Task<IActionResult> GetDeChungChi(int maKhoaHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            var data = await _service.GetDeChungChiAsync(maKhoaHoc, maGiangVien);
            return Ok(new { success = true, data = data });
        }

        [HttpPut("de-chung-chi/{maKhoaHoc}")]
        public async Task<IActionResult> UpdateDeChungChi(int maKhoaHoc, [FromBody] List<CauHoiChungChiDTO> request)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            var result = await _service.UpdateDeChungChiAsync(maKhoaHoc, maGiangVien, request);
            if (!result)
                return NotFound("Không tìm thấy khóa học hoặc khóa học không thuộc về bạn.");

            return Ok(new { success = true, message = "Đã lưu đề thi thành công" });
        }
    }
}
