using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoiDungKhoaHocController : ControllerBase
    {
        private readonly IKhoaHocService _khoaHocService;

        public NoiDungKhoaHocController(IKhoaHocService khoaHocService)
        {
            _khoaHocService = khoaHocService;
        }

        [HttpGet("{maKhoaHoc}")]
        public async Task<IActionResult> GetNoiDungKhoaHoc(int maKhoaHoc)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            Console.WriteLine($"[NoiDungKhoaHocController] Lấy nội dung khóa học cho MaKhoaHoc={maKhoaHoc}, MaNguoiDung={maNguoiDung}");
            try
            {
                var data = await _khoaHocService.GetKhoaHocByIdAsync(maKhoaHoc, maNguoiDung);

                if (data == null)
                {
                    return NotFound(new { message = "Không tìm thấy nội dung khóa học này." });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost("luu-tien-do")]
        public async Task<IActionResult> LuuTienDo([FromBody] TienDoBaiHocDTO dto)
        {
            try
            {
                var result = await _khoaHocService.LuuTienDoBaiHoc(dto);
                return Ok(new { thanhCong = result });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống. Vui lòng thử lại sau."
                });
            }
        }

        [HttpPost("luu-ghi-chu")]
        public async Task<IActionResult> LuuGhiChu([FromBody] GhiChuBaiHocDTO dto)
        {
            try
            {
                var result = await _khoaHocService.LuuGhiChuBaiHoc(dto);
                return Ok(new { thanhCong = result });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống. Vui lòng thử lại sau."
                });
            }
        }

        [HttpGet("lay-ds-ghi-chu/{maBaiHoc}/{maNguoiDung}")]
        public async Task<IActionResult> GetGhiChuBaiHoc(int maBaiHoc, int maNguoiDung)
        {
            try
            {
                var ghiChus = await _khoaHocService.GetGhiChuBaiHocAsync(maBaiHoc, maNguoiDung);
                return Ok(ghiChus);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống. Vui lòng thử lại sau."
                });
            }

        }

        [HttpPost("BaiTap/luu-ket-qua-quiz")]
        public async Task<IActionResult> LuuKetQua([FromBody] KetQuaQuizSubmitDTO dto)
        {
            var ketQua = await _khoaHocService.LuuKetQuaBaiTap(dto);

            if (ketQua)
            {
                return Ok(new { success = true, message = "Nộp bài thành công" });
            }
            else
            {
                return BadRequest(new { success = false, message = "Lỗi khi lưu bài làm" });
            }
        }

        [HttpPost("chung-chi/nop-bai")]
        public async Task<IActionResult> NopBaiKiemTraChungChi([FromBody] NopBaiKiemTraChungChiDTO dto)
        {
            var maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung > 0)
            {
                dto.MaNguoiDung = maNguoiDung;
            }

            var ketQua = await _khoaHocService.NopBaiKiemTraChungChiAsync(dto);
            if (!ketQua.ThanhCong)
            {
                return BadRequest(ketQua);
            }

            return Ok(ketQua);
        }

        [HttpGet("lay-ds-ghi-chu-ai/{maNguoiDung}")]
        public async Task<IActionResult> LayDanhSach(int maNguoiDung)
        {
            var ketQua = await _khoaHocService.LayGhiChuAI(maNguoiDung);
            return Ok(ketQua);
        }

        [HttpPost("luu-ghi-chu-ai")]
        public async Task<IActionResult> LuuGhiChu([FromBody] LuuGhiChuAIRequest yeuCau)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            var thanhCong = await _khoaHocService.LuuGhiChuAI(yeuCau, maNguoiDung);
            if (thanhCong)
                return Ok(new { thongBao = "Đã lưu vào sổ tay AI thành công!" });

            return BadRequest(new { thongBao = "Lưu vào sổ tay thất bại!" });
        }

        [HttpPut("cap-nhat-ghi-chu-ai")]
        public async Task<IActionResult> UpdateAI([FromBody] UpdateGhiChuAIDTO dto)
        {
            var ketQua = await _khoaHocService.UpdateGhiChuAI(dto);
            if (!ketQua) return BadRequest("Không thể cập nhật ghi chú.");
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("xoa-ghi-chu-ai/{id}")]
        public async Task<IActionResult> DeleteAI(int id)
        {
            var ketQua = await _khoaHocService.DeleteGhiChuAI(id);
            if (!ketQua) return NotFound("Ghi chú không tồn tại.");
            return Ok(new { message = "Đã xóa thành công" });
        }

        [HttpGet("ds-danh-gia-khoa-hoc/{maKhoaHoc}")]
        public async Task<IActionResult> LayDanhGia(int maKhoaHoc)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            var data = await _khoaHocService.LayThongKeVaDanhSachAsync(maKhoaHoc, maNguoiDung);
            return Ok(data);
        }

        [HttpPost("them-danh-gia")]
        public async Task<IActionResult> ThemDanhGia([FromBody] DanhGiaDTO request)
        {
            if (request.SoSao < 1 || request.SoSao > 5)
                return BadRequest(new { message = "Số sao phải từ 1 đến 5!" });

            try
            {
                var success = await _khoaHocService.TaoDanhGiaMoiAsync(request);
                if (success)
                    return Ok(new { message = "Cảm ơn bạn đã đánh giá khóa học!" });

                return BadRequest(new { message = "Không thể lưu đánh giá lúc này." });
            }
            catch (Exception ex)
            {
                // Bắt lỗi khi người dùng đã đánh giá rồi (Throw từ Service)
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
