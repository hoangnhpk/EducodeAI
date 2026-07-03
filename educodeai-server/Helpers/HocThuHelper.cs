using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Helpers
{
    public static class HocThuHelper
    {
        public static List<int> LayDanhSachMaBaiVideoHocThu(KhoaHoc_NoiDungKhoaHocDTO khoaHoc, int soLuong)
        {
            if (soLuong <= 0)
            {
                return new List<int>();
            }

            return khoaHoc.DanhSachChuongHoc
                .OrderBy(c => c.ThuTu)
                .SelectMany(c => c.DanhSachBaiHoc.OrderBy(b => b.ThuTu))
                .Where(b => string.Equals(b.LoaiBaiHoc, "Video", StringComparison.OrdinalIgnoreCase)
                            && !string.IsNullOrWhiteSpace(b.LinkVideo))
                .Take(soLuong)
                .Select(b => b.Id)
                .ToList();
        }

        public static void ApDungPhanQuyenNoiDung(
            KhoaHoc_NoiDungKhoaHocDTO detail,
            string? donViTienTe,
            bool daDangKy,
            int soVideoHocThu)
        {
            bool laMienPhi = KhoaHocPricingHelper.LaKhoaHocMienPhi(donViTienTe);
            var dsMaBaiHocThu = LayDanhSachMaBaiVideoHocThu(detail, soVideoHocThu);
            bool coFullAccess = laMienPhi ? daDangKy : daDangKy;
            bool laCheDoHocThu = !laMienPhi && !daDangKy && soVideoHocThu > 0;

            detail.DonViTienTe = donViTienTe ?? "VND";
            detail.DaDangKy = daDangKy;
            detail.LaCheDoHocThu = laCheDoHocThu;
            detail.SoVideoHocThu = soVideoHocThu;

            if (coFullAccess)
            {
                foreach (var bai in detail.DanhSachChuongHoc.SelectMany(c => c.DanhSachBaiHoc))
                {
                    bai.LaHocThu = false;
                    bai.BiKhoa = false;
                }
                return;
            }

            if (laMienPhi && !daDangKy)
            {
                foreach (var bai in detail.DanhSachChuongHoc.SelectMany(c => c.DanhSachBaiHoc))
                {
                    bai.LaHocThu = false;
                    bai.BiKhoa = true;
                    KhoaNoiDungBaiHoc(bai);
                }
                detail.BaiKiemTraChungChi = null;
                detail.ThongTinChungChi = null;
                return;
            }

            foreach (var bai in detail.DanhSachChuongHoc.SelectMany(c => c.DanhSachBaiHoc))
            {
                bool laVideoHocThu = dsMaBaiHocThu.Contains(bai.Id);
                bai.LaHocThu = laVideoHocThu;
                bai.BiKhoa = !laVideoHocThu;

                if (bai.BiKhoa)
                {
                    KhoaNoiDungBaiHoc(bai);
                }
            }

            if (laCheDoHocThu)
            {
                detail.BaiKiemTraChungChi = null;
                detail.ThongTinChungChi = null;
            }
        }

        public static async Task<bool> CoQuyenTruyCapBaiHocAsync(
            EduCodeAIDbContext db,
            int maBaiHoc,
            int maNguoiDung,
            int soVideoHocThu)
        {
            var baiHoc = await db.BaiHocs
                .AsNoTracking()
                .Include(b => b.ChuongHoc)
                .ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);

            if (baiHoc?.ChuongHoc?.KhoaHoc == null)
            {
                return false;
            }

            var khoaHoc = baiHoc.ChuongHoc.KhoaHoc;
            bool daDangKy = maNguoiDung > 0 && await db.DangKyKhoaHocs
                .AnyAsync(x => x.MaKhoaHoc == khoaHoc.MaKhoaHoc && x.MaNguoiDung == maNguoiDung);

            if (daDangKy)
            {
                return true;
            }

            if (KhoaHocPricingHelper.LaKhoaHocMienPhi(khoaHoc.DonViTienTe))
            {
                return false;
            }

            if (soVideoHocThu <= 0)
            {
                return false;
            }

            var maBaiThu = await db.KhoaHocs
                .AsNoTracking()
                .Where(k => k.MaKhoaHoc == khoaHoc.MaKhoaHoc)
                .SelectMany(k => k.ChuongHocs.OrderBy(c => c.ThuTu))
                .SelectMany(c => c.BaiHocs.OrderBy(b => b.ThuTu))
                .Where(b => b.LoaiBaiHoc == "Video" && b.LinkVideo != null && b.LinkVideo != "")
                .Take(soVideoHocThu)
                .Select(b => b.MaBaiHoc)
                .ToListAsync();

            return maBaiThu.Contains(maBaiHoc);
        }

        private static void KhoaNoiDungBaiHoc(BaiHoc_NoiDungKhoaHocDTO bai)
        {
            bai.LinkVideo = null;
            bai.NoiDung = null;
            bai.VideoPublicId = null;
            bai.VideoSource = null;
            bai.VideoStatus = null;
            bai.SubtitleUrl = null;
            bai.HasSubtitle = false;
            bai.ThongTinQuiz = null;
            bai.MaBaiTapThucHanh = null;
        }
    }
}
