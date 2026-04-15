using System.Globalization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace educodeai_server.Helpers
{
    public class ChungChiPdfRequest
    {
        public string TenChungChi { get; set; } = "CERTIFICATE OF COMPLETION";
        public string HoTenHocVien { get; set; } = string.Empty;
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string MaChungChi { get; set; } = string.Empty;
        public DateTime NgayCap { get; set; }
        public double DiemSo { get; set; }
        public string DonViCap { get; set; } = "EduCodeAI Learning Platform";
        public string? LogoPath { get; set; }
        public string? ChuKyPath { get; set; }
    }

    public static class ChungChiPdfHelper
    {
        // Color palette – "clean white" style (inspired by Google Cloud cert)
        private const string ColNavy       = "#1A2B4A";   // outer border, main text
        private const string ColAccent     = "#4A90D9";   // inner border, accent elements
        private const string ColGold       = "#F5A623";   // score highlight, dividers
        private const string ColBg         = "#FFFFFF";   // page background
        private const string ColSubtext    = "#5A6A7E";   // subtitle, labels
        private const string ColLight      = "#EFF4FB";   // stat box backgrounds

        private const string FontSans   = "Arial";
        private const string FontSerif  = "Times New Roman";

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

        // ──────────────────────────────────────────────────────────────
        // ROOT FRAME  –  Navy outer border → thin white gap → blue inner
        // ──────────────────────────────────────────────────────────────
        private static void BuildCertificate(IContainer root, ChungChiPdfRequest req)
        {
            root
                .Border(10).BorderColor(ColNavy)            // thick navy outer
                .Padding(6)
                .Border(3).BorderColor(ColAccent)            // thin blue inner
                .Padding(0)
                .Element(x => BuildBody(x, req));
        }

        // ──────────────────────────────────────────────────────────────
        // BODY  –  full height column layout
        // ──────────────────────────────────────────────────────────────
        private static void BuildBody(IContainer container, ChungChiPdfRequest req)
        {
            container
                .Background(ColBg)
                .Padding(32)
                .Column(col =>
                {
                    // ── TOP: Logo centre ───────────────────────────────
                    col.Item().AlignCenter().Element(x => BuildLogoBlock(x, req));

                    col.Item().Height(14);

                    // ── Thin gold rule ─────────────────────────────────
                    col.Item().AlignCenter().Width(520).LineHorizontal(1).LineColor(ColGold);

                    col.Item().Height(18);

                    // ── "This is to certify that" ──────────────────────
                    col.Item().AlignCenter()
                        .Text("This is to certify that")
                        .FontFamily(FontSerif).Italic()
                        .FontSize(14).FontColor(ColSubtext);

                    col.Item().Height(12);

                    // ── Learner name – largest element ─────────────────
                    col.Item().AlignCenter()
                        .Text(req.HoTenHocVien?.Trim() ?? "")
                        .FontFamily(FontSerif).Bold()
                        .FontSize(36).FontColor(ColNavy);

                    col.Item().Height(6);
                    // underline name
                    col.Item().AlignCenter().Width(340).LineHorizontal(1.2f).LineColor(ColAccent);

                    col.Item().Height(18);

                    // ── "has successfully completed" ───────────────────
                    col.Item().AlignCenter()
                        .Text("has successfully completed the course")
                        .FontFamily(FontSerif).Italic()
                        .FontSize(13).FontColor(ColSubtext);

                    col.Item().Height(10);

                    // ── Course name ────────────────────────────────────
                    col.Item().AlignCenter()
                        .Text(req.TenKhoaHoc?.Trim() ?? "")
                        .FontFamily(FontSans).Bold()
                        .FontSize(20).FontColor(ColNavy);

                    col.Item().Height(24);

                    // ── Gold rule ──────────────────────────────────────
                    col.Item().AlignCenter().Width(520).LineHorizontal(1).LineColor(ColGold);

                    col.Item().Height(18);

                    // ── Bottom row: meta (left)  |  score badge (centre-right)  |  signature (right) ──
                    col.Item().Row(row =>
                    {
                        // Meta info – left
                        row.RelativeItem(3).Element(x => BuildMetaInfo(x, req));

                        // Spacer
                        row.ConstantItem(20);

                        // Score badge – centre
                        row.RelativeItem(2).AlignCenter().Element(x => BuildScoreBadge(x, req.DiemSo));

                        // Spacer
                        row.ConstantItem(20);

                        // Signature – right
                        row.RelativeItem(3).AlignRight().Element(x => BuildSignatureBlock(x, req));
                    });
                });
        }

        // ──────────────────────────────────────────────────────────────
        // LOGO  – image if provided, otherwise styled text fallback
        // ──────────────────────────────────────────────────────────────
        private static void BuildLogoBlock(IContainer container, ChungChiPdfRequest req)
        {
            container.Column(col =>
            {
                // Brand name / logo
                col.Item().AlignCenter().Element(x =>
                {
                    if (!string.IsNullOrWhiteSpace(req.LogoPath) && File.Exists(req.LogoPath))
                    {
                        x.Width(110).Height(60).Image(req.LogoPath).FitArea();
                        return;
                    }

                    // Text logo
                    x.AlignCenter().Text(text =>
                    {
                        text.Span("Edu").Bold().FontSize(28).FontColor(ColNavy).FontFamily(FontSans);
                        text.Span("Code").Bold().FontSize(28).FontColor(ColAccent).FontFamily(FontSans);
                        text.Span("AI").Bold().FontSize(28).FontColor(ColGold).FontFamily(FontSans);
                    });
                });

                col.Item().Height(6);

                // "CERTIFICATE OF COMPLETION" heading
                col.Item().AlignCenter()
                    .Text("CERTIFICATE OF COMPLETION")
                    .Bold().FontSize(13).FontColor(ColSubtext)
                    .LetterSpacing(0.2f).FontFamily(FontSans);
            });
        }

        // ──────────────────────────────────────────────────────────────
        // META INFO (bottom-left)
        // ──────────────────────────────────────────────────────────────
        private static void BuildMetaInfo(IContainer container, ChungChiPdfRequest req)
        {
            var dateStr = req.NgayCap.ToLocalTime()
                .ToString("d MMMM yyyy", new CultureInfo("en-US"));

            container.AlignBottom().Column(col =>
            {
                MetaLine(col, "Certificate ID :", req.MaChungChi?.Trim() ?? "");
                col.Item().Height(4);
                MetaLine(col, "Issue Date     :", dateStr);
                col.Item().Height(4);
                MetaLine(col, "Certified As   :", req.HoTenHocVien?.Trim() ?? "");
            });
        }

        private static void MetaLine(ColumnDescriptor col, string label, string value)
        {
            col.Item().Text(text =>
            {
                text.Span(label).FontSize(10).FontColor(ColSubtext).FontFamily(FontSans);
                text.Span($" {value}").Bold().FontSize(10).FontColor(ColNavy).FontFamily(FontSans);
            });
        }

        // ──────────────────────────────────────────────────────────────
        // SCORE BADGE  – circular-ish stamp in the centre-bottom
        // ──────────────────────────────────────────────────────────────
        private static void BuildScoreBadge(IContainer container, double score)
        {
            var scoreStr = $"{Math.Round(score, 1):0.#}%";

            container.AlignCenter().Width(110).Height(110)
                .Border(4).BorderColor(ColNavy)
                .Background(ColLight)
                .AlignCenter().AlignMiddle()
                .Column(col =>
                {
                    col.Item().AlignCenter()
                        .Text("SCORE")
                        .FontSize(9).Bold().FontColor(ColSubtext)
                        .LetterSpacing(0.2f).FontFamily(FontSans);

                    col.Item().AlignCenter()
                        .Text(scoreStr)
                        .Bold().FontSize(24).FontColor(ColNavy).FontFamily(FontSans);

                    col.Item().AlignCenter().Width(60).LineHorizontal(1).LineColor(ColGold);

                    col.Item().Height(3);

                    col.Item().AlignCenter()
                        .Text("FINAL EXAM")
                        .FontSize(8).FontColor(ColSubtext)
                        .LetterSpacing(0.1f).FontFamily(FontSans);
                });
        }

        // ──────────────────────────────────────────────────────────────
        // SIGNATURE BLOCK (bottom-right)
        // ──────────────────────────────────────────────────────────────
        private static void BuildSignatureBlock(IContainer container, ChungChiPdfRequest req)
        {
            container.AlignBottom().Width(200).Column(col =>
            {
                // Signature image or empty space
                col.Item().Height(44).Element(x =>
                {
                    if (!string.IsNullOrWhiteSpace(req.ChuKyPath) && File.Exists(req.ChuKyPath))
                        x.AlignRight().Image(req.ChuKyPath).FitHeight();
                });

                // Divider
                col.Item().LineHorizontal(1).LineColor(ColNavy);

                col.Item().Height(5);

                col.Item().AlignCenter()
                    .Text(req.DonViCap)
                    .Bold().FontSize(11).FontColor(ColNavy).FontFamily(FontSans);

                col.Item().Height(2);

                col.Item().AlignCenter()
                    .Text("Authorized Signature")
                    .Italic().FontSize(9).FontColor(ColSubtext).FontFamily(FontSerif);
            });
        }
    }
}