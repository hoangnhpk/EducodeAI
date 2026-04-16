using System.Collections.Generic;
using System.Linq;
using educodeai_server.DTOs.RutTienGiangVien;

namespace educodeai_server.Common
{
    /// <summary>
    /// Danh mục ngân hàng (mã VietQR cho QR chuyển khoản rút tiền).
    /// </summary>
    public static class DanhMucNganHangLienKet
    {
        private static readonly IReadOnlyList<NganHangItemDTO> _danhSach = new List<NganHangItemDTO>
        {
            new() { Ma = "NAPAS", TenHienThi = "NAPAS", MaVietQr = "NAPAS" },
            new() { Ma = "STB", TenHienThi = "Sacombank", MaVietQr = "STB" },
            new() { Ma = "VPB", TenHienThi = "VPBank", MaVietQr = "VPB" },
            new() { Ma = "TPB", TenHienThi = "TPBank", MaVietQr = "TPB" },
            new() { Ma = "MB", TenHienThi = "MB", MaVietQr = "MB" },
            new() { Ma = "ICT", TenHienThi = "VietinBank", MaVietQr = "ICT" },
            new() { Ma = "BIDV", TenHienThi = "BIDV", MaVietQr = "BIDV" },
            new() { Ma = "ACB", TenHienThi = "ACB", MaVietQr = "ACB" },
            new() { Ma = "OCB", TenHienThi = "OCB", MaVietQr = "OCB" },
            new() { Ma = "KLB", TenHienThi = "KienlongBank", MaVietQr = "KLB" },
            new() { Ma = "MSB", TenHienThi = "MSB", MaVietQr = "MSB" }
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
