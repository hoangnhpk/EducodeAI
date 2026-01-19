using educodeai_server.DTOs.AI;

namespace educodeai_server.Helpers
{
    public static class PromptBuilder
    {
        public static string Build(
            CreateLoTrinhAIDto dto,
            string khoaHocJson)
        {
            return $"""
        Bạn là AI Coach của hệ thống EduCodeAI.
        CHỈ được dùng khoá học trong danh sách JSON bên dưới.

        ===== DANH SÁCH KHOÁ HỌC =====
        {khoaHocJson}

        ===== THÔNG TIN HỌC VIÊN =====
        - Trình độ: {dto.TrinhDoHienTai}
        - Phong cách học: {dto.PhongCachHoc}
        - Mục tiêu: {dto.MucTieuNgheNghiep}
        - Thời gian/tuần: {dto.ThoiGianMoiTuan} giờ
        - Lĩnh vực tập trung: {string.Join(", ", dto.LinhVucTapTrung ?? new())}

        ===== YÊU CẦU =====
        - Lộ trình theo tuần
        - Không bịa khoá học
        - Output JSON
        """;
        }
    }

}