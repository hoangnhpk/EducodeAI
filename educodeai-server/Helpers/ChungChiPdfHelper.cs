using System.Globalization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace educodeai_server.Helpers
{
    public class ChungChiPdfRequest
    {
        public string TenChungChi { get; set; } = "CHỨNG CHỈ HOÀN THÀNH";
        public string HoTenHocVien { get; set; } = string.Empty;
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string MaChungChi { get; set; } = string.Empty;
        public DateTime NgayCap { get; set; }
        public double DiemSo { get; set; }
        public string DonViCap { get; set; } = "Ban EduCodeAI";
        public string? LogoPath { get; set; }
        public string? ChuKyPath { get; set; }
    }

    public static class ChungChiPdfHelper
    {
        // Color palette – Classic Elegant Style
        private const string ColNavy       = "#1A2B4A";   
        private const string ColGold       = "#C9A84C";   // primary gold
        private const string ColGoldLight  = "#F9EFC0";   // seal background
        private const string ColAccent     = "#4A90D9";   
        private const string ColBg         = "#FFFDF7";   // cream background
        private const string ColText       = "#1A2B4A";
        private const string ColSubtext    = "#8B6914";   // gold labels text

        private const string FontSans      = "Arial";
        private const string FontSerif     = "Times New Roman";

        public static byte[] TaoPdf(ChungChiPdfRequest request)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0);
                    page.DefaultTextStyle(x => x
                        .FontFamily(FontSans)
                        .FontSize(11)
                        .FontColor(ColText));
                    page.Background(ColBg);

                    page.Content().Element(x => BuildCertificate(x, request));
                });
            }).GeneratePdf();
        }

        private static void BuildCertificate(IContainer root, ChungChiPdfRequest req)
        {
            root
                .Border(8).BorderColor(ColGold)
                .Padding(4)
                .Border(1.5f).BorderColor(ColGold)
                .Padding(0)
                .Element(x => BuildBody(x, req));
        }

        private static void BuildBody(IContainer container, ChungChiPdfRequest req)
        {
            container
                .Background(ColBg)
                .Padding(40)
                .Column(col =>
                {
                    // Corners (simulated ornaments)
                    col.Item().Row(r => {
                        r.RelativeItem().Text("✦").FontSize(20).FontColor(ColGold);
                        r.RelativeItem().AlignRight().Text("✦").FontSize(20).FontColor(ColGold);
                    });

                    // Logo / Brand
                    col.Item().AlignCenter().Element(x => {
                        x.Text(t => {
                            t.Span("Edu").Bold().FontSize(26).FontColor(ColNavy);
                            t.Span("Code").Bold().FontSize(26).FontColor(ColAccent);
                            t.Span("AI").Bold().FontSize(26).FontColor(ColGold);
                        });
                    });

                    col.Item().Height(10);

                    // Title
                    col.Item().AlignCenter()
                        .Text("Chứng Chỉ")
                        .FontFamily(FontSerif).Italic()
                        .FontSize(52).FontColor(ColText);

                    col.Item().Height(4);
                    col.Item().AlignCenter().Width(380).Height(2).Background(ColGold);
                    col.Item().Height(12);

                    // Sub label
                    col.Item().AlignCenter()
                        .Text("CHỨNG NHẬN TRÂN TRỌNG TRAO ĐẾN")
                        .FontSize(10).SemiBold().FontColor(ColSubtext).LetterSpacing(0.2f);

                    col.Item().Height(16);

                    // Learner Name
                    col.Item().AlignCenter()
                        .Text(req.HoTenHocVien?.ToUpper() ?? "")
                        .FontFamily(FontSerif).Bold()
                        .FontSize(42).FontColor(ColNavy);

                    col.Item().Height(16);

                    // Course section
                    col.Item().AlignCenter()
                        .Text("Khóa học")
                        .FontSize(10).SemiBold().FontColor(ColSubtext).LetterSpacing(0.15f);

                    col.Item().AlignCenter()
                        .Text(req.TenKhoaHoc?.ToUpper() ?? "")
                        .FontFamily(FontSans).ExtraBold()
                        .FontSize(22).FontColor(ColNavy);

                    col.Item().Height(30);

                    // Bottom info row
                    col.Item().Row(row =>
                    {
                        // Date column
                        row.RelativeItem().AlignBottom().Column(c => {
                           c.Item().Text(req.NgayCap.ToLocalTime().ToString("dd/MM/yyyy"))
                               .FontSize(11).Bold().FontColor(ColNavy);
                           c.Item().Height(2);
                           c.Item().Width(120).Height(1).Background(ColGold);
                           c.Item().Text("NGÀY CẤP").FontSize(8).Bold().FontColor(ColSubtext);
                        });

                        // Gold Seal
                        row.ConstantItem(100).AlignCenter().Element(x => BuildSeal(x, req.DiemSo));

                        // Signature column
                        row.RelativeItem().AlignBottom().AlignRight().Column(c => {
                           // Fake cursive signature style
                           c.Item().Width(110).Height(30).AlignCenter().Text("~EduCodeAI~")
                               .FontFamily(FontSerif).Italic().FontSize(18).FontColor(ColSubtext);
                           c.Item().Height(2);
                           c.Item().Width(140).Height(1).Background(ColGold);
                           c.Item().AlignRight().Text("CHỮ KÝ XÁC NHẬN").FontSize(8).Bold().FontColor(ColSubtext);
                        });
                    });
                    
                    col.Item().Height(12);
                    col.Item().Row(r => {
                        r.RelativeItem().Text("✦").FontSize(20).FontColor(ColGold);
                        r.RelativeItem().AlignRight().Text("✦").FontSize(20).FontColor(ColGold);
                    });
                });
        }

        private static void BuildSeal(IContainer container, double score)
        {
            var classification = LayXepLoai(score);
            
            container.Width(80).Height(80)
                .Background(ColGold)
                .Padding(3)
                .Background(ColGoldLight)
                .Border(1.5f).BorderColor(ColGold)
                .AlignCenter().AlignMiddle()
                .Column(col =>
                {
                    col.Item().AlignCenter().Text("XẾP LOẠI").FontSize(6).Bold().FontColor(ColSubtext);
                    col.Item().AlignCenter().Text(classification).FontSize(11).ExtraBold().FontColor("#7A5A00");
                });
        }

        private static string LayXepLoai(double score)
        {
            if (score >= 90) return "Xuất sắc";
            if (score >= 80) return "Giỏi";
            if (score >= 70) return "Khá";
            return "Đạt";
        }
    }
}
