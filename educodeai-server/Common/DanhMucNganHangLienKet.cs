using System.Collections.Generic;
using System.Linq;
using educodeai_server.DTOs.RutTienGiangVien;

namespace educodeai_server.Common
{
    /// <summary>
    /// Danh mục ngân hàng (mã VietQR cho QR chuyển khoản + BIN cho tra cứu STK VietQR.io).
    /// </summary>
    public static class DanhMucNganHangLienKet
    {
        private static readonly IReadOnlyList<NganHangItemDTO> _danhSach = new List<NganHangItemDTO>
        {
            new() { Ma = "NAPAS", TenHienThi = "NAPAS", MaVietQr = "NAPAS", MaBin = null },
            new() { Ma = "STB", TenHienThi = "Sacombank", MaVietQr = "STB", MaBin = "970403" },
            new() { Ma = "VPB", TenHienThi = "VPBank", MaVietQr = "VPB", MaBin = "970432" },
            new() { Ma = "TPB", TenHienThi = "TPBank", MaVietQr = "TPB", MaBin = "970423" },
            new() { Ma = "MB", TenHienThi = "MB", MaVietQr = "MB", MaBin = "970422" },
            new() { Ma = "ICT", TenHienThi = "VietinBank", MaVietQr = "ICT", MaBin = "970415" },
            new() { Ma = "BIDV", TenHienThi = "BIDV", MaVietQr = "BIDV", MaBin = "970418" },
            new() { Ma = "ACB", TenHienThi = "ACB", MaVietQr = "ACB", MaBin = "970416" },
            new() { Ma = "OCB", TenHienThi = "OCB", MaVietQr = "OCB", MaBin = "970448" },
            new() { Ma = "KLB", TenHienThi = "KienlongBank", MaVietQr = "KLB", MaBin = "970452" },
            new() { Ma = "MSB", TenHienThi = "MSB", MaVietQr = "MSB", MaBin = "970426" }
        };

        public static IReadOnlyList<NganHangItemDTO> LayDanhSach() => _danhSach;

        public static NganHangItemDTO? TimTheoMa(string? ma)
        {
            if (string.IsNullOrWhiteSpace(ma))
            {
                return null;
            }

            string maChuan = ma.Trim().ToUpperInvariant();
            return _danhSach.FirstOrDefault(x => x.Ma == maChuan);
        }

        /// <summary>Tra cứu theo mã đang lưu trong DB (thường là MaVietQr).</summary>
        public static NganHangItemDTO? TimTheoMaVietQr(string? maVietQr)
        {
            if (string.IsNullOrWhiteSpace(maVietQr))
            {
                return null;
            }

            string chuan = maVietQr.Trim().ToUpperInvariant();
            return _danhSach.FirstOrDefault(x =>
                string.Equals(x.MaVietQr, chuan, StringComparison.OrdinalIgnoreCase));
        }
    }
}
