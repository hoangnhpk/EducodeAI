using educodeai_server.Models;
using educodeai_server.Services.Implement;

namespace educodeai_server.Tests.CourseCatalog;

public sealed class CourseDurationTests
{
    [Fact]
    public void CalculateCourseDurationHours_SumsLessonsAcrossChaptersAndRoundsUp()
    {
        var course = Course(
            (1800, 1),
            (1800, 2),
            (1, 3));

        var result = KhoaHocCuaToiService.CalculateCourseDurationHours(course);

        Assert.Equal(2, result);
    }

    [Fact]
    public void CalculateCourseDurationHours_IgnoresNullAndNegativeDurations()
    {
        var course = Course((null, 1), (-30, 2), (3600, 3));

        var result = KhoaHocCuaToiService.CalculateCourseDurationHours(course);

        Assert.Equal(1, result);
    }

    [Fact]
    public void CalculateCourseDurationHours_PreservesLegacyValueWhenNoLessonHasDuration()
    {
        var course = Course((null, 1), (0, 2));
        course.ThoiLuongGio = 4;

        var result = KhoaHocCuaToiService.CalculateCourseDurationHours(course);

        Assert.Equal(4, result);
    }

    private static KhoaHocModel Course(params (int? Duration, int Order)[] lessons)
    {
        var chapter = new ChuongHocModel
        {
            MaChuong = 1,
            TenChuong = "Chapter",
            ThuTu = 1,
            BaiHocs = lessons.Select(item => new BaiHocModel
            {
                MaBaiHoc = item.Order,
                MaChuong = 1,
                TieuDe = $"Lesson {item.Order}",
                LoaiBaiHoc = "Video",
                ThoiLuong = item.Duration,
                ThuTu = item.Order
            }).ToList()
        };

        return new KhoaHocModel
        {
            MaKhoaHoc = 1,
            MaGiangVien = 1,
            TenKhoaHoc = "Course",
            LinhVuc = "Test",
            TrinhDo = "Cơ bản",
            KyNangChinh = "",
            ChuongHocs = new List<ChuongHocModel> { chapter }
        };
    }
}
