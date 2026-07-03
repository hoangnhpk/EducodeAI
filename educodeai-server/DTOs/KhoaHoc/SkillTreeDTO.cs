namespace educodeai_server.DTOs
{
    public class SkillTreeResponseDTO
    {
        public int? MaLoTrinh { get; set; }
        public string TenLoTrinh { get; set; } = string.Empty;
        public string MoTaChung { get; set; } = string.Empty;
        public int TongSoKhoaHoc { get; set; }
        public int SoKhoaHoanThanh { get; set; }
        public int PhanTramTong { get; set; }
        public int TongThoiGianTuan { get; set; }
        public List<SkillTreeLoTrinhOptionDTO> DanhSachLoTrinh { get; set; } = new();
        public List<SkillTreeNodeDTO> Nodes { get; set; } = new();
        public List<SkillTreeEdgeDTO> Edges { get; set; } = new();
    }

    public class SkillTreeLoTrinhOptionDTO
    {
        public int MaLoTrinh { get; set; }
        public string TenLoTrinh { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public int TongSoKhoaHoc { get; set; }
    }

    public class SkillTreeNodeDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
        public string Slug { get; set; } = string.Empty;
        public int GiaiDoan { get; set; }
        public string MucTieuGiaiDoan { get; set; } = string.Empty;
        public int ThuTu { get; set; }
        /// <summary>done | in_progress | not_registered | locked</summary>
        public string TrangThai { get; set; } = "locked";
        public int PhanTramTienDo { get; set; }
        public int TongSoBaiHoc { get; set; }
        public int SoBaiDaHoc { get; set; }
        public bool LaBuocTiepTheo { get; set; }
        public bool DaDangKy { get; set; }
    }

    public class SkillTreeEdgeDTO
    {
        public int FromMaKhoaHoc { get; set; }
        public int ToMaKhoaHoc { get; set; }
    }
}
