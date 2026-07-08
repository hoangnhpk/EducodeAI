using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.DTOs.XacThuc
{
    /// <summary>
    /// DTO giảng viên nộp lại hồ sơ bổ sung (chỉ dùng khi hồ sơ ở trạng thái CanBoSung).
    /// Tất cả field đều tùy chọn - chỉ cập nhật field nào giảng viên gửi lên.
    /// </summary>
    public class BoSungHoSoRequest
    {
        [Required(ErrorMessage = "Thiếu mã xác thực bổ sung hồ sơ.")]
        public string Token { get; set; } = string.Empty;

        public string? HoTen { get; set; }
        public string? SoDienThoai { get; set; }
        public string? LinhVucGiangDay { get; set; }
        public string? TieuSu { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? SoGiayTo { get; set; }
        public string? TenNganHang { get; set; }
        public string? SoTaiKhoanNhanTien { get; set; }
        public string? TenChuTaiKhoan { get; set; }
        public string? MaSoThue { get; set; }

        public IFormFile? AnhDaiDien { get; set; }
        public IFormFile? AnhGiayToMatTruoc { get; set; }
        public IFormFile? AnhGiayToMatSau { get; set; }
    }
}