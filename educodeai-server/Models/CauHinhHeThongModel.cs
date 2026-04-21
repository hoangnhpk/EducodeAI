using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("CauHinhs")] // Ánh xạ chính xác tên bảng trên Supabase
    public class CauHinhHeThongModel
    {
        [Key] // Đánh dấu đây là Khóa chính
        [Column("MaKhoa", TypeName = "varchar(100)")]
        [Required(ErrorMessage = "Mã khóa không được để trống")]
        public string MaKhoa { get; set; } = string.Empty;

        [Column("GiaTri", TypeName = "text")]
        public string? GiaTri { get; set; }

        [Column("MoTa", TypeName = "varchar(255)")]
        public string? MoTa { get; set; }

        [Column("NgayCapNhat")]
        public DateTime? NgayCapNhat { get; set; } = DateTime.UtcNow;
    }
}