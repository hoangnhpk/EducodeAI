using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.AI
{
    public class LoTrinhAICuaToiResponseDTO
    {
        public int MaLoTrinh { get; set; }
        public string TenLoTrinh { get; set; } = null!;
        public string MoTaChung { get; set; } = null!;

        public int TongSoKhoaHoc { get; set; }

        public int TongThoiGianTuan { get; set; }

        public int TongSoGiaiDoan { get; set; }
        public int SoGiaiDoanHoanThanh { get; set; }

        public double PhanTramHoanThanh { get; set; } // Tính theo (SoGiaiDoanHoanThanh / TongSoGiaiDoan) * 100

        public List<GiaiDoanProgressDTO> GiaiDoan { get; set; } = new();
    }

    public class GiaiDoanProgressDTO
    {
        public int GiaiDoan { get; set; }
        public string MucTieu { get; set; } = null!;
        public int TongKhoaHoc { get; set; }
        public int KhoaHocHoanThanh { get; set; }
        public double PhanTram { get; set; }
        public bool HoanThanh { get; set; }

        public List<KhoaHocLoTrinhChiTietDTO> DanhSachKhoaHoc { get; set; } = new();
    }

    public class KhoaHocLoTrinhChiTietDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public string NoiDungChinh { get; set; } = null!;
        public string GhiChu { get; set; } = string.Empty;
        public int TuTuan { get; set; }
        public int DenTuan { get; set; }
        public string Slug { get; set; } = null!;
    }

    public class NoiDungLoTrinhDTO
    {
        [JsonPropertyName("tenLoTrinh")]
        public string TenLoTrinh { get; set; } = null!;

        [JsonPropertyName("moTaChung")]
        public string MoTaChung { get; set; } = null!;

        [JsonPropertyName("tongThoiGianTuan")]
        public int TongThoiGianTuan { get; set; }

        [JsonPropertyName("loTrinh")]
        public List<GiaiDoanDTO> LoTrinh { get; set; } = new();
    }

    public class GiaiDoanDTO
    {
        [JsonPropertyName("GiaiDoan")]
        public int GiaiDoan { get; set; }

        [JsonPropertyName("mucTieu")]
        public string MucTieu { get; set; } = null!;

        [JsonPropertyName("khoaHocSuDung")]
        public List<KhoaHocSuDungDTO> KhoaHocSuDung { get; set; } = new();
    }

    public class KhoaHocSuDungDTO
    {
        [JsonPropertyName("maKhoaHoc")]
        public int MaKhoaHoc { get; set; }
        public int TuTuan { get; set; }
        public int DenTuan { get; set; }

        [JsonPropertyName("tenKhoaHoc")]
        public string TenKhoaHoc { get; set; } = null!;

        [JsonPropertyName("noiDungChinh")]
        public string NoiDungChinh { get; set; } = null!;

        [JsonPropertyName("ghiChu")]
        public string GhiChu { get; set; } = string.Empty;
    }
}
