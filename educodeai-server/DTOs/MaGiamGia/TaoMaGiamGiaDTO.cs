using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.MaGiamGia
{
    public class TaoMaGiamGiaDTO
    {
        [Required, StringLength(40)]
        public string Code { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string TenChuongTrinh { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string LoaiGiamGia { get; set; } = "PERCENT"; // PERCENT | FIXED

        [Range(0.01, double.MaxValue)]
        public decimal GiaTriGiam { get; set; }

        public decimal? GiamToiDa { get; set; }

        public int SoLuongToiDa { get; set; } = 0;

        [Required]
        public DateTime BatDauAt { get; set; }

        [Required]
        public DateTime KetThucAt { get; set; }

        public bool ApDungTatCaKhoaHocCuaGiangVien { get; set; } = false;

        public List<int> DanhSachMaKhoaHoc { get; set; } = new();
    }
}
