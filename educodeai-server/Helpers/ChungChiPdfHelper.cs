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
                        t.Span("Edu").Bold().FontSize(22).FontColor(ColNavy).FontFamily(FontSans);
                        t.Span("Code").Bold().FontSize(22).FontColor(ColAccent).FontFamily(FontSans);
                        t.Span("AI").Bold().FontSize(22).FontColor(ColGold).FontFamily(FontSans);
                    });

                    col.Item().Height(4);

                    // ── Title in italic serif ──────────────────────────
                    col.Item().AlignCenter()
                        .Text("Chứng Chỉ")
                        .FontFamily("Georgia").Italic()
                        .FontSize(42).FontColor(ColNavy);

                    // ── Gold rule ─────────────────────────────────────
                    col.Item().Height(10);
                    col.Item().AlignCenter().Width(380).Height(2).Background(ColGold);
                    col.Item().Height(10);

                    // ── Sub-label ─────────────────────────────────────
                    col.Item().AlignCenter()
                        .Text("CHỨNG NHẬN TRÂN TRỌNG TRAO ĐẾN")
                        .FontSize(10).SemiBold().FontColor(ColSubtext).LetterSpacing(0.2f);

                    col.Item().Height(10);

                    // ── Recipient name – elegant cursive font (matches web Great Vibes) ────
                    col.Item().AlignCenter()
                        .Text(req.HoTenHocVien ?? "")
                        .FontFamily("Monotype Corsiva") // standard Windows cursive font
                        .FontSize(48).FontColor(ColNavy);

                    col.Item().Height(12);

                    // ── Course ────────────────────────────────────────
                    col.Item().AlignCenter()
                        .Text("KHÓA HỌC")
                        .FontSize(10).SemiBold().FontColor(ColSubtext).LetterSpacing(0.2f);

                    col.Item().AlignCenter()
                        .Text(req.TenKhoaHoc.ToUpper())
                        .FontFamily(FontSans).ExtraBold()
                        .FontSize(18).FontColor(ColNavy);

                    col.Item().Height(30);

                    // ── Bottom row: date | seal | signature ───────────
                    col.Item().Row(row =>
                    {
                        // Date
                        row.RelativeItem().AlignBottom().Column(c =>
                        {
                            c.Item().Text(req.NgayCap.ToLocalTime().ToString("dd/MM/yyyy"))
                                .FontSize(13).Bold().FontColor(ColNavy);
                            c.Item().Height(4);
                            c.Item().Width(120).Height(1).Background(ColGold);
                            c.Item().Text("NGÀY CẤP").FontSize(9).Bold().FontColor(ColSubtext).LetterSpacing(0.1f);
                        });

                        // Circular Gold Seal (drawn with SVG for gradients and shadows)
                        row.ConstantItem(120).AlignCenter().AlignMiddle()
                            .Element(x => BuildCircularSeal(x, req.DiemSo));

                        // Signature SVG-style
                        row.RelativeItem().AlignBottom().AlignRight().Column(c =>
                        {
                            var svgSignature = $@"<svg width='140' height='36' viewBox='0 0 140 36' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M5.6 25.2 C16.8 5.4, 30.8 1.8, 44.8 16.2 C53.2 25.2, 61.6 3.6, 77 10.8 C86.8 16.2, 92.4 23.4, 106.4 19.8 C120.4 16.2, 127.4 9, 135.8 9' fill='none' stroke='{ColSubtext}' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/>
                                <path d='M28 21.6 C39.2 28.8, 50.4 30.6, 64.4 25.9' fill='none' stroke='{ColSubtext}' stroke-width='1.2' stroke-linecap='round'/>
                            </svg>";

                            c.Item().Width(140).Height(36).Svg(svgSignature);

                            c.Item().Height(4);
                            c.Item().Width(140).Height(1).Background(ColGold);
                            c.Item().AlignRight().Text("CHỮ KÝ XÁC NHẬN")
                                .FontSize(9).Bold().FontColor(ColSubtext).LetterSpacing(0.1f);
                        });
                    });

                    col.Item().Height(10);

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
            float textSize = classification.Length > 3 ? 12f : 14f;

            var svgSeal = $@"<svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                <defs>
                    <linearGradient id='goldGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' stop-color='#E6C27A' />
                        <stop offset='50%' stop-color='#FCEBAE' />
                        <stop offset='100%' stop-color='#B8860B' />
                    </linearGradient>
                    <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
                        <feDropShadow dx='0' dy='4' stdDeviation='4' flood-opacity='0.25'/>
                    </filter>
                </defs>
                <circle cx='50' cy='50' r='42' fill='url(#goldGrad)' filter='url(#shadow)' />
                <circle cx='50' cy='50' r='36' fill='#FDFBF7' />
                <circle cx='50' cy='50' r='33' fill='none' stroke='url(#goldGrad)' stroke-width='1.5' />
                <text x='50' y='38' font-family='{FontSans}, Arial, sans-serif' font-size='8' font-weight='bold' fill='{ColSubtext}' text-anchor='middle'>XẾP LOẠI</text>
                <text x='50' y='58' font-family='{FontSans}, Arial, sans-serif' font-size='{textSize}' font-weight='bold' fill='#7A5A00' text-anchor='middle'>{classification}</text>
            </svg>";

            container.Width(100).Height(100).Svg(svgSeal);
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
