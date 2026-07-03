namespace educodeai_server.Helpers
{
    /// <summary>Chu kỳ nhiệm vụ: reset 12:00 Chủ nhật giờ Việt Nam (UTC+7).</summary>
    public static class ChuKyThuThachHelper
    {
        public static (DateTime DauChuKyUtc, DateTime KetThucChuKyUtc, long GiayConLai) LayChuKyHienTai(DateTime utcNow)
        {
            var vn = utcNow.AddHours(7);
            int daysSinceSunday = (int)vn.DayOfWeek;
            var sundayDate = vn.Date.AddDays(-daysSinceSunday);
            var sundayNoonVn = sundayDate.AddHours(12);

            DateTime dauChuKyVn = vn >= sundayNoonVn
                ? sundayNoonVn
                : sundayNoonVn.AddDays(-7);

            var ketThucVn = dauChuKyVn.AddDays(7);
            var dauUtc = DateTime.SpecifyKind(dauChuKyVn.AddHours(-7), DateTimeKind.Utc);
            var ketUtc = DateTime.SpecifyKind(ketThucVn.AddHours(-7), DateTimeKind.Utc);
            var giay = (long)Math.Max(0, (ketUtc - utcNow).TotalSeconds);
            return (dauUtc, ketUtc, giay);
        }
    }
}
