using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class DanhGiaModel {
        [Key]
        public int MaDanhGia { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")] 
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaKhoaHoc { get; set; }
        [ForeignKey("MaKhoaHoc")] 
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        [Range(1, 5)] // Chỉ cho phép nhập 1 đến 5 sao
        public int SoSao { get; set; }

        [StringLength(1000)]
        public string? NhanXet { get; set; }

        public DateTime NgayDanhGia { get; set; } = DateTime.Now;
    }
}
