using System;
using System.Collections.Generic;

namespace educodeai_server.DTOs.BaiTap
{
    public class BaiTapThucHanhHocVienRenderDTO
    {
        public int MaBaiTap { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string MoTaDeBai { get; set; } = string.Empty;
        public string NgonNgu { get; set; } = string.Empty;
        public string MucDo { get; set; } = string.Empty;
        public string? GoiY { get; set; }
        public List<TestCaseHienThiDTO> TestCases { get; set; } = new List<TestCaseHienThiDTO>();
    }

    public class TestCaseHienThiDTO
    {
        public int MaTestCase { get; set; }
        public string InputDuLieu { get; set; } = string.Empty;
        public string OutputMongDoi { get; set; } = string.Empty;
        public bool LaTestAn { get; set; }
    }

    public class SubmitCodeRequestDTO
    {
        public string Code { get; set; } = string.Empty;
        public string NgonNgu { get; set; } = string.Empty;
    }

    public class TestCaseResultDTO
    {
        public int MaTestCase { get; set; }
        public bool IsPassed { get; set; }
        public string ActualOutput { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public string Input { get; set; } = string.Empty;
        public bool LaTestAn { get; set; }
        public float Diem { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class KetQuaSubmitDTO
    {
        public bool ThanhCong { get; set; } // Tất cả run mượt mà ko lỗi server
        public bool PassedAll { get; set; } // Pass tất cả test case
        public float TongDiem { get; set; }
        public List<TestCaseResultDTO> Results { get; set; } = new List<TestCaseResultDTO>();
    }
}
