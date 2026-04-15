using System.Text;

namespace educodeai_server.Helpers
{
    public class ChungChiPdfRequest
    {
        public string TenChungChi { get; set; } = "Chứng nhận hoàn thành";
        public string HoTenHocVien { get; set; } = string.Empty;
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string MaChungChi { get; set; } = string.Empty;
        public DateTime NgayCap { get; set; }
        public double DiemSo { get; set; }
    }

    public static class ChungChiPdfHelper
    {
        public static byte[] TaoPdf(ChungChiPdfRequest request)
        {
            var dongNoiDung = new[]
            {
                ChuanHoaPdfText(request.TenChungChi.ToUpperInvariant()),
                "CERTIFICATE OF COMPLETION",
                "Chung nhan hoc vien da hoan thanh khoa hoc va dat yeu cau bai kiem tra cuoi khoa.",
                string.Empty,
                ChuanHoaPdfText(request.HoTenHocVien),
                "Da hoan thanh khoa hoc:",
                ChuanHoaPdfText(request.TenKhoaHoc),
                $"Ma chung chi: {ChuanHoaPdfText(request.MaChungChi)}",
                $"Ngay cap: {request.NgayCap.ToLocalTime():dd/MM/yyyy}",
                $"Diem bai kiem tra cuoi khoa: {Math.Round(request.DiemSo, 2):0.##}%",
                string.Empty,
                "EduCodeAI Learning Platform"
            };

            var contentBuilder = new StringBuilder();
            contentBuilder.AppendLine("0.96 0.58 0.31 rg");
            contentBuilder.AppendLine("BT /F1 28 Tf 72 760 Td (EduCodeAI Learning Platform) Tj ET");
            contentBuilder.AppendLine("0.09 0.11 0.22 rg");

            var y = 700;
            for (var index = 0; index < dongNoiDung.Length; index++)
            {
                var line = dongNoiDung[index];
                var fontSize = index switch
                {
                    0 => 26,
                    1 => 20,
                    4 => 24,
                    6 => 18,
                    _ => 13
                };

                if (string.IsNullOrWhiteSpace(line))
                {
                    y -= 20;
                    continue;
                }

                contentBuilder.AppendLine($"BT /F1 {fontSize} Tf 72 {y} Td ({EscapePdf(line)}) Tj ET");
                y -= index switch
                {
                    0 => 38,
                    1 => 30,
                    4 => 34,
                    6 => 28,
                    _ => 22
                };
            }

            var contentBytes = Encoding.ASCII.GetBytes(contentBuilder.ToString());
            var objects = new List<byte[]>
            {
                Encoding.ASCII.GetBytes("<< /Type /Catalog /Pages 2 0 R >>"),
                Encoding.ASCII.GetBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
                Encoding.ASCII.GetBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"),
                Encoding.ASCII.GetBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
                TaoStreamPdf(Encoding.ASCII.GetBytes($"<< /Length {contentBytes.Length} >>"), contentBytes)
            };

            using var output = new MemoryStream();
            var xref = new List<long> { 0 };
            output.Write(Encoding.ASCII.GetBytes("%PDF-1.4\n"));

            for (var i = 0; i < objects.Count; i++)
            {
                xref.Add(output.Position);
                output.Write(Encoding.ASCII.GetBytes($"{i + 1} 0 obj\n"));
                output.Write(objects[i]);
                output.Write(Encoding.ASCII.GetBytes("\nendobj\n"));
            }

            var xrefStart = output.Position;
            output.Write(Encoding.ASCII.GetBytes($"xref\n0 {xref.Count}\n"));
            output.Write(Encoding.ASCII.GetBytes("0000000000 65535 f \n"));
            foreach (var offset in xref.Skip(1))
            {
                output.Write(Encoding.ASCII.GetBytes($"{offset:D10} 00000 n \n"));
            }

            output.Write(Encoding.ASCII.GetBytes($"trailer\n<< /Size {xref.Count} /Root 1 0 R >>\nstartxref\n{xrefStart}\n%%EOF"));
            return output.ToArray();
        }

        private static byte[] TaoStreamPdf(byte[] dictionary, byte[] data)
        {
            using var stream = new MemoryStream();
            stream.Write(dictionary);
            stream.Write(Encoding.ASCII.GetBytes("\nstream\n"));
            stream.Write(data);
            stream.Write(Encoding.ASCII.GetBytes("\nendstream"));
            return stream.ToArray();
        }

        private static string EscapePdf(string value)
        {
            return value
                .Replace("\\", "\\\\")
                .Replace("(", "\\(")
                .Replace(")", "\\)");
        }

        private static string ChuanHoaPdfText(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;

            var normalized = value.Normalize(NormalizationForm.FormD);
            var filtered = new string(normalized
                .Where(c => char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                .ToArray());

            return filtered
                .Replace('đ', 'd')
                .Replace('Đ', 'D');
        }
    }
}
