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

        public string? TieuSu { get; set; }

        public string? LinkedInUrl { get; set; }

        public string? WebsiteUrl { get; set; }

        public List<IFormFile> CvFiles { get; set; } = new();

        public List<ChungChiUploadRequest> Certificates { get; set; } = new();

        [Required]
        public string LoaiGiayTo { get; set; } = "CCCD";

        [Required]
        public string SoGiayTo { get; set; } = string.Empty;

        /// <summary>N?i c?p do ng??i d?ng nh?p tay; ???c m? h?a c?ng d? li?u qu?t CCCD.</summary>
        public string? NoiCap { get; set; }

        [StringLength(255)]
        public string? NguyenQuan { get; set; }

        public IFormFile? AnhDaiDien { get; set; }

        // ?nh CCCD ch? d?ng t?m trong request ?? OCR; kh?ng ???c l?u xu?ng ? ??a.
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

        public string? LoaiDoiTuongThue { get; set; }
    }
}