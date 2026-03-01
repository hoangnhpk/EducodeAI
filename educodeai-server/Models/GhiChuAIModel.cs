using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class GhiChuAIModel
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại liên kết với bảng Người Dùng
        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        // Khóa ngoại liên kết với bảng Bài Học
        public int MaBaiHoc { get; set; }
        [ForeignKey("MaBaiHoc")]
        public virtual BaiHocModel BaiHoc { get; set; } = null!;

        [Required]
        public string NoiDung { get; set; } = string.Empty;

        public DateTime NgayTao { get; set; } = DateTime.Now;
        public DateTime NgayCapNhat { get; set; } = DateTime.Now;
    }
}