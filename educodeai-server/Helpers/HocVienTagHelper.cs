namespace educodeai_server.Helpers
{
    public static class HocVienTagHelper
    {
        public const string XuatSac = "xuat_sac";
        public const string GiamChan = "giam_chan";
        public const string MoiDangKy = "moi_dang_ky";

        public static (string? Tag, string? TagLabel) ResolveTag(
            int phanTramTienDo,
            DateTime ngayDangKy,
            DateTime? ngayHocCuoi,
            DateTime utcNow)
        {
            if (phanTramTienDo >= 100)
                return (XuatSac, "Xuất sắc");

            var ngayDkUtc = ngayDangKy.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(ngayDangKy, DateTimeKind.Utc)
                : ngayDangKy.ToUniversalTime();

            var soNgayTuDangKy = (utcNow - ngayDkUtc).TotalDays;
            if (soNgayTuDangKy <= 3 && phanTramTienDo < 10)
                return (MoiDangKy, "Mới đăng ký");

            if (phanTramTienDo < 100 && soNgayTuDangKy >= 3)
            {
                var khongHocLau = ngayHocCuoi == null
                    || (utcNow - ToUtc(ngayHocCuoi.Value)).TotalDays >= 7;

                if (khongHocLau)
                    return (GiamChan, "Cần nhắc");
            }

            return (null, null);
        }

        private static DateTime ToUtc(DateTime value)
        {
            return value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
                : value.ToUniversalTime();
        }
    }
}
