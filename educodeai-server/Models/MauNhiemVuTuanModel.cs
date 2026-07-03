using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class MauNhiemVuTuanModel
    {
        [Key]
        public int MaMau { get; set; }

        [StringLength(50)]
        public string MaCode { get; set; } = string.Empty;

        [StringLength(150)]
        public string TieuDe { get; set; } = string.Empty;

        [StringLength(300)]
        public string MoTa { get; set; } = string.Empty;

        [StringLength(30)]
        public string Icon { get; set; } = "book";

        /// <summary>hoc_bai | gio_hoc | quiz | ngay_hoc | hoan_thanh_tat_ca</summary>
        [StringLength(30)]
        public string LoaiDem { get; set; } = string.Empty;

        public int ChiTieu { get; set; }

        public int ExpThuong { get; set; }

        public int ThuTu { get; set; }

        public bool DangHoatDong { get; set; } = true;
    }
}
