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

        public DateTime NgayThamGia { get; set; } = DateTime.UtcNow;
        // m?i thm 
        public string? LyDoKhoa { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.Column(TypeName = "timestamp with time zone")]
        public DateTime? ThoiGianMoKhoa { get; set; }


        // CÁC THƯỜNG CHO BẢO MẬT & OTP
        public DateTime? NgayDangNhapCuoi { get; set; }

        public int SecurityVersion { get; set; }

        [StringLength(10)]
        public string? MaOTP { get; set; }
        public DateTime? ThoiGianHetHanOTP { get; set; }

        [StringLength(50)]
        public string? MaNganHangNhanTien { get; set; }

        [StringLength(50)]
        public string? SoTaiKhoanNhanTien { get; set; }

        [StringLength(255)]
        public string? TenTaiKhoanNhanTien { get; set; }

        public virtual ICollection<KhoaHocModel> KhoaHocs { get; set; } = null!;
        public virtual ICollection<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; } = null!;
        public virtual ICollection<TienDoBaiHocModel> TienDoBaiHocs { get; set; } = null!;
        public virtual ICollection<DanhGiaModel> DanhGias { get; set; } = null!;
        public virtual ICollection<BinhLuanModel> BinhLuans { get; set; } = null!;
        public virtual ICollection<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; } = null!;
        public virtual ICollection<KetQuaLamBaiModel> BaiNops { get; set; } = null!;
        public virtual ICollection<KetQuaKiemTraChungChiModel> KetQuaKiemTraChungChis { get; set; } = null!;
        public virtual ICollection<ChungChiKhoaHocModel> ChungChiKhoaHocs { get; set; } = null!;
        public virtual ICollection<LoTrinhAIModel> LoTrinhAIs { get; set; } = null!;
        public virtual ICollection<DonHangKhoaHocModel> DonHangKhoaHocs { get; set; } = null!;
        public virtual ICollection<MaGiamGiaModel> MaGiamGiaDaTao { get; set; } = new List<MaGiamGiaModel>();
        public virtual ICollection<MaQuaTangHocVienModel> MaQuaTangDaTao { get; set; } = new List<MaQuaTangHocVienModel>();
        public virtual ICollection<MaQuaTangHocVienModel> MaQuaTangDaNhan { get; set; } = new List<MaQuaTangHocVienModel>();
        public virtual ICollection<QuaTangKhoaHocModel> QuaTangDaTang { get; set; } = new List<QuaTangKhoaHocModel>();
        public virtual ICollection<QuaTangKhoaHocModel> QuaTangDaNhan { get; set; } = new List<QuaTangKhoaHocModel>();
        public virtual ICollection<DoanhThuGiangVienModel> DoanhThuGiangViens { get; set; } = null!;
        public virtual ICollection<YeuCauRutTienGiangVienModel> YeuCauRutTienGiangViens { get; set; } = null!;
        public virtual ICollection<YeuCauRutTienGiangVienModel> YeuCauDaDuyets { get; set; } = null!;
        public virtual ICollection<HoTroRutTienGiangVienModel> HoTroRutTienGiangViens { get; set; } = new List<HoTroRutTienGiangVienModel>();
        public virtual ICollection<HoTroRutTienGiangVienModel> HoTroRutTienDaXuLys { get; set; } = new List<HoTroRutTienGiangVienModel>();

        // Navigation mới cho tính năng quản lý thiết bị
        public virtual ICollection<PhienDangNhapModel> DanhSachPhienDangNhap { get; set; } = new List<PhienDangNhapModel>();
    }
}
