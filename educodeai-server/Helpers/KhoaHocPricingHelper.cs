namespace educodeai_server.Helpers
{
    public static class KhoaHocPricingHelper
    {
        public const string DonViMienPhi = "FREE";
        public const decimal GiaKyThuatMienPhi = 10000m;

        public static bool LaKhoaHocMienPhi(string? donViTienTe)
            => string.Equals(donViTienTe, DonViMienPhi, StringComparison.OrdinalIgnoreCase);

        public static void ChuanHoaGiaKhoaHocMienPhi(string? donViTienTe, Action<decimal> datGia)
        {
            if (LaKhoaHocMienPhi(donViTienTe))
            {
                datGia(GiaKyThuatMienPhi);
            }
        }
    }
}
