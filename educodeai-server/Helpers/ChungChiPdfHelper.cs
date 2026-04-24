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
        // ── Colour palette ────────────────────────────────────────────
        private const string ColNavy      = "#1A2B4A";
        private const string ColGold      = "#C9A84C";
        private const string ColGoldLight = "#F9EFC0";
        private const string ColAccent    = "#4A90D9";
        private const string ColBg        = "#FFFDF7";
        private const string ColSubtext   = "#8B6914";

        // ── Fonts ─────────────────────────────────────────────────────
        private const string FontSans  = "Arial";
        private const string FontSerif = "Times New Roman";

        // ─────────────────────────────────────────────────────────────
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
                        .FontColor(ColNavy));
                    page.Background(ColBg);
                    page.Content().Element(x => BuildCertificate(x, request));
                });
            }).GeneratePdf();
        }

        // ── Outer double-gold border ───────────────────────────────────
        private static void BuildCertificate(IContainer root, ChungChiPdfRequest req)
        {
            root
                .Border(8).BorderColor(ColGold)
                .Padding(4)
                .Border(1.5f).BorderColor(ColGold)
                .Padding(0)
                .Element(x => BuildBody(x, req));
        }

        // ── Main body ─────────────────────────────────────────────────
        private static void BuildBody(IContainer container, ChungChiPdfRequest req)
        {
            container
                .Background(ColBg)
                .Padding(40)
                .Column(col =>
                {
                    // Corner ornaments ✦
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text("✦").FontSize(18).FontColor(ColGold);
                        r.RelativeItem().AlignRight().Text("✦").FontSize(18).FontColor(ColGold);
                    });

                    // ── Brand ─────────────────────────────────────────
                    col.Item().AlignCenter().Text(t =>
                    {
                        t.Span("Edu").Bold().FontSize(24).FontColor(ColNavy).FontFamily(FontSans);
                        t.Span("Code").Bold().FontSize(24).FontColor(ColAccent).FontFamily(FontSans);
                        t.Span("AI").Bold().FontSize(24).FontColor(ColGold).FontFamily(FontSans);
                    });

                    col.Item().Height(8);

                    // ── Title in italic serif ──────────────────────────
                    col.Item().AlignCenter()
                        .Text("Chứng Chỉ")
                        .FontFamily(FontSerif).Italic()
                        .FontSize(54).FontColor(ColNavy);

                    // ── Gold rule ─────────────────────────────────────
                    col.Item().Height(6);
                    col.Item().AlignCenter().Width(360).Height(1.5f).Background(ColGold);
                    col.Item().Height(10);

                    // ── Sub-label ─────────────────────────────────────
                    col.Item().AlignCenter()
                        .Text("CHỨNG NHẬN TRÂN TRỌNG TRAO ĐẾN")
                        .FontSize(9).SemiBold().FontColor(ColSubtext).LetterSpacing(0.18f);

                    col.Item().Height(14);

                    // ── Recipient name – italic serif (matches web) ────
                    col.Item().AlignCenter()
                        .Text(req.HoTenHocVien ?? "")
                        .FontFamily(FontSerif).Italic()
                        .FontSize(38).FontColor(ColNavy);

                    col.Item().Height(14);

                    // ── Course ────────────────────────────────────────
                    col.Item().AlignCenter()
                        .Text("KHÓA HỌC")
                        .FontSize(9).SemiBold().FontColor(ColSubtext).LetterSpacing(0.15f);

                    col.Item().AlignCenter()
                        .Text(req.TenKhoaHoc.ToUpper())
                        .FontFamily(FontSans).ExtraBold()
                        .FontSize(20).FontColor(ColNavy);

                    col.Item().Height(28);

                    // ── Bottom row: date | seal | signature ───────────
                    col.Item().Row(row =>
                    {
                        // Date
                        row.RelativeItem().AlignBottom().Column(c =>
                        {
                            c.Item().Text(req.NgayCap.ToLocalTime().ToString("dd/MM/yyyy"))
                                .FontSize(12).Bold().FontColor(ColNavy);
                            c.Item().Height(2);
                            c.Item().Width(120).Height(1).Background(ColGold);
                            c.Item().Text("NGÀY CẤP").FontSize(8).Bold().FontColor(ColSubtext).LetterSpacing(0.1f);
                        });

                        // Circular Gold Seal (drawn with SVG)
                        row.ConstantItem(110).AlignCenter().AlignMiddle()
                            .Element(x => BuildCircularSeal(x, req.DiemSo));

                        // Signature SVG-style
                        row.RelativeItem().AlignBottom().AlignRight().Column(c =>
                        {
                            var svgSignature = $@"<svg width='140' height='36' viewBox='0 0 140 36' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M5.6 25.2 C16.8 5.4, 30.8 1.8, 44.8 16.2 C53.2 25.2, 61.6 3.6, 77 10.8 C86.8 16.2, 92.4 23.4, 106.4 19.8 C120.4 16.2, 127.4 9, 135.8 9' fill='none' stroke='{ColSubtext}' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/>
                                <path d='M28 21.6 C39.2 28.8, 50.4 30.6, 64.4 25.9' fill='none' stroke='{ColSubtext}' stroke-width='1' stroke-linecap='round'/>
                            </svg>";

                            c.Item().Width(140).Height(36).Svg(svgSignature);

                            c.Item().Height(2);
                            c.Item().Width(140).Height(1).Background(ColGold);
                            c.Item().AlignRight().Text("CHỮ KÝ XÁC NHẬN")
                                .FontSize(8).Bold().FontColor(ColSubtext).LetterSpacing(0.1f);
                        });
                    });

                    col.Item().Height(14);

                    // Bottom corner ornaments ✦
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text("✦").FontSize(18).FontColor(ColGold);
                        r.RelativeItem().AlignRight().Text("✦").FontSize(18).FontColor(ColGold);
                    });
                });
        }

        // ── Circular seal drawn with SVG ─────────────────
        private static void BuildCircularSeal(IContainer container, double score)
        {
            var classification = LayXepLoai(score);
            float textSize = classification.Length > 3 ? 10.5f : 12f;

            var svgSeal = $@"<svg width='90' height='90' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='45' cy='45' r='43' fill='{ColGold}' />
                <circle cx='45' cy='45' r='39' fill='{ColGoldLight}' />
                <circle cx='45' cy='45' r='37' fill='none' stroke='{ColGold}' stroke-width='1.2' />
                <text x='45' y='34' font-family='{FontSans}, Arial, sans-serif' font-size='7.5' font-weight='bold' fill='{ColSubtext}' text-anchor='middle'>XẾP LOẠI</text>
                <text x='45' y='53' font-family='{FontSans}, Arial, sans-serif' font-size='{textSize}' font-weight='bold' fill='#7A5A00' text-anchor='middle'>{classification}</text>
            </svg>";

            container.Width(90).Height(90).Svg(svgSeal);
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
