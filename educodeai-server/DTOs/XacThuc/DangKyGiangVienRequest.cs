using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.DTOs.XacThuc
{
    public class DangKyGiangVienRequest
    {
        [Required]
        public string HoTen { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string TaiKhoan { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string MatKhau { get; set; } = string.Empty;

        [StringLength(20)]
        public string? SoDienThoai { get; set; }

        [Required]
        public string LinhVucGiangDay { get; set; } = string.Empty;

        [Required]
        public string TieuSu { get; set; } = string.Empty;

        public string? LinkedInUrl { get; set; }

        public string? WebsiteUrl { get; set; }

        [Required]
        public string LoaiGiayTo { get; set; } = "CCCD";

        [Required]
        public string SoGiayTo { get; set; } = string.Empty;

        public IFormFile? AnhDaiDien { get; set; }

        [Required]
        public IFormFile AnhGiayToMatTruoc { get; set; } = default!;

        [Required]
        public IFormFile AnhGiayToMatSau { get; set; } = default!;

        [Required]
        public string PhuongThucThanhToan { get; set; } = "BANK";

        public string? TenNganHang { get; set; }

        public string? SoTaiKhoanNhanTien { get; set; }

        public string? TenChuTaiKhoan { get; set; }

        public string? MaSoThue { get; set; }
    }
}