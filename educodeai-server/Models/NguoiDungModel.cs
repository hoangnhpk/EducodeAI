using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class NguoiDungModel {
        [Key]
        public int MaNguoiDung { get; set; }

        [Required] 
        [StringLength(50)] // NVARCHAR(50)
        public required string TaiKhoan { get; set; }

        [Required]
        [StringLength(255)] // NVARCHAR(255) 
        public required string MatKhau { get; set; }

        [StringLength(100)]
        public string? GoogleID { get; set; }

        [StringLength(100)]
        public string? HoTen { get; set; }

        [StringLength(100)]
        [EmailAddress] // Validate định dạng Email
        public string? Email { get; set; }

        [StringLength(500)] // URL ảnh không nên để MAX
        public string? AnhDaiDien { get; set; }

        public int VaiTro { get; set; } // 0:Admin, 1:GV, 2:HV

        [StringLength(20)]
        public string? TrangThai { get; set; } = "Active";

        public DateTime NgayThamGia { get; set; } = DateTime.Now;

        // Navigation
        public virtual ICollection<KhoaHocModel> KhoaHocs { get; set; } = null!;
        public virtual ICollection<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; } = null!;
    }
}
