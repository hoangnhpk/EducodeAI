using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class NguoiDungModel
    {
        [Key]
        public int MaNguoiDung { get; set; }

        [Required]
        [StringLength(50)]
        public required string TaiKhoan { get; set; }

        [Required]
        [StringLength(255)]
        public required string MatKhau { get; set; }

        [StringLength(100)]
        public string? GoogleID { get; set; }

        [StringLength(100)]
        public string? HoTen { get; set; }

        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [StringLength(500)]
        public string? AnhDaiDien { get; set; }

        public int VaiTro { get; set; } // 0:Admin, 1:GV, 2:HV

        [StringLength(20)]
        public string? TrangThai { get; set; } = "Hoạt động";

        public DateTime NgayThamGia { get; set; } = DateTime.Now;


        // CÁC THƯỜNG CHO BẢO MẬT & OTP
        public DateTime? NgayDangNhapCuoi { get; set; }

        [StringLength(10)]
        public string? MaOTP { get; set; }
        public DateTime? ThoiGianHetHanOTP { get; set; }
 
        public virtual ICollection<KhoaHocModel> KhoaHocs { get; set; } = null!;
        public virtual ICollection<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; } = null!;
        public virtual ICollection<TienDoBaiHocModel> TienDoBaiHocs { get; set; } = null!;
        public virtual ICollection<DanhGiaModel> DanhGias { get; set; } = null!;
        public virtual ICollection<BinhLuanModel> BinhLuans { get; set; } = null!;
        public virtual ICollection<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; } = null!;
        public virtual ICollection<KetQuaLamBaiModel> BaiNops { get; set; } = null!;
        public virtual ICollection<LoTrinhAIModel> LoTrinhAIs { get; set; } = null!;

        // Navigation mới cho tính năng quản lý thiết bị
        public virtual ICollection<PhienDangNhapModel> DanhSachPhienDangNhap { get; set; } = new List<PhienDangNhapModel>();
    }
}