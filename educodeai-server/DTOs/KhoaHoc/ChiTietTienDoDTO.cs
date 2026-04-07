using System.Collections.Generic;

namespace educodeai_server.DTOs//(k)
{

    public class TienDoKhoaHocHocVienDTO
    {

        public int TongThoiGianHocPhut { get; set; }
        public List<ChuongHocTienDoDTO> DanhSachChuong { get; set; } = new List<ChuongHocTienDoDTO>();
    }

    public class ChuongHocTienDoDTO
    {
        public int MaChuong { get; set; }
        public string TenChuong { get; set; } = null!;
        public List<BaiHocTienDoDTO> DanhSachBaiHoc { get; set; } = new List<BaiHocTienDoDTO>();
    }

    public class BaiHocTienDoDTO
    {
        public int MaBaiHoc { get; set; }
        public string TenBaiHoc { get; set; } = null!;
        public bool DaHoanThanh { get; set; } 
    }
}