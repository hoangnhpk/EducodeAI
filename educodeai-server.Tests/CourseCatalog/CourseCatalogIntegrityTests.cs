using System.Text.Json;
using educodeai_server.Data;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

namespace educodeai_server.Tests.CourseCatalog;

public sealed class CourseCatalogIntegrityTests
{
    private static readonly JsonDocument Catalog = JsonDocument.Parse(
        File.ReadAllText(FindRepositoryFile("educodeai-server", "Tools", "YouTubeCatalog", "catalog.json")));

    [Fact]
    public void SeedCatalog_MatchesYouTubeManifest()
    {
        using var context = CreateContext();
        var courses = SeedRows<KhoaHocModel>(context).ToDictionary(RowId("MaKhoaHoc"));
        var chapters = SeedRows<ChuongHocModel>(context).ToList();
        var lessons = SeedRows<BaiHocModel>(context).ToList();
        var manifestCourses = Catalog.RootElement.EnumerateArray().ToList();

        Assert.InRange(courses.Count, 30, 40);
        Assert.Equal(38, courses.Count);
        Assert.Equal(235, chapters.Count);
        Assert.Equal(2233, lessons.Count);
        Assert.Equal(courses.Count, manifestCourses.Count);
        Assert.Equal(chapters.Count, chapters.Select(Int("MaChuong")).Distinct().Count());
        Assert.Equal(lessons.Count, lessons.Select(Int("MaBaiHoc")).Distinct().Count());

        var chaptersByCourse = chapters
            .GroupBy(Int("MaKhoaHoc"))
            .ToDictionary(group => group.Key, group => group.OrderBy(Int("ThuTu")).ToList());
        var lessonsByChapter = lessons
            .GroupBy(Int("MaChuong"))
            .ToDictionary(group => group.Key, group => group.OrderBy(Int("ThuTu")).ToList());

        for (var index = 0; index < manifestCourses.Count; index++)
        {
            var courseId = index + 1;
            var manifest = manifestCourses[index];
            var course = courses[courseId];
            var manifestEntries = manifest.GetProperty("entries").EnumerateArray().ToList();
            var courseChapters = chaptersByCourse[courseId];
            var courseLessons = courseChapters
                .SelectMany(chapter => lessonsByChapter[Int("MaChuong")(chapter)])
                .ToList();

            Assert.Equal(manifest.GetProperty("title").GetString(), String("TenKhoaHoc")(course));
            Assert.Equal(manifest.GetProperty("thumbnail").GetString(), String("HinhAnh")(course));
            Assert.DoesNotContain("F8", manifest.GetProperty("channel").GetString()!, StringComparison.OrdinalIgnoreCase);
            Assert.InRange(courseChapters.Count, Math.Min(5, manifestEntries.Count), 10);
            Assert.Equal(Enumerable.Range(1, courseChapters.Count), courseChapters.Select(Int("ThuTu")));
            Assert.All(courseChapters, chapter => Assert.NotEmpty(lessonsByChapter[Int("MaChuong")(chapter)]));
            Assert.Equal(manifestEntries.Count, courseLessons.Count);

            for (var lessonIndex = 0; lessonIndex < manifestEntries.Count; lessonIndex++)
            {
                var expected = manifestEntries[lessonIndex];
                var actual = courseLessons[lessonIndex];
                var expectedTitle = expected.GetProperty("title").GetString()!;
                var expectedDuration = expected.GetProperty("duration").GetInt32();
                var expectedUrl = expected.GetProperty("url").GetString();

                Assert.Equal(expectedTitle[..Math.Min(200, expectedTitle.Length)], String("TieuDe")(actual));
                Assert.Equal(expectedUrl, String("LinkVideo")(actual));
                Assert.Equal(expectedDuration, Int("ThoiLuong")(actual));
                Assert.Equal(expectedDuration, Int("VideoDurationS")(actual));
                Assert.Equal("youtube", String("VideoSource")(actual));
                Assert.Matches("^https://www\\.youtube\\.com/watch\\?v=[A-Za-z0-9_-]{11}$", String("LinkVideo")(actual)!);
                Assert.True(expectedDuration > 0);
            }
        }
    }

    [Fact]
    public void Manifest_HasUniquePlaylistsAndNoDuplicateVideoWithinCourse()
    {
        var courses = Catalog.RootElement.EnumerateArray().ToList();

        Assert.Equal(courses.Count, courses.Select(course => course.GetProperty("id").GetString()).Distinct().Count());
        foreach (var course in courses)
        {
            var videos = course.GetProperty("entries").EnumerateArray().ToList();
            Assert.Equal(videos.Count, videos.Select(video => video.GetProperty("id").GetString()).Distinct().Count());
            Assert.All(videos, video => Assert.Equal(11, video.GetProperty("id").GetString()!.Length));
        }
    }

    private static EduCodeAIDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<EduCodeAIDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;
        return new EduCodeAIDbContext(options);
    }

    private static IEnumerable<IDictionary<string, object?>> SeedRows<TEntity>(EduCodeAIDbContext context)
    {
        return context.GetService<IDesignTimeModel>().Model.FindEntityType(typeof(TEntity))!.GetSeedData();
    }

    private static Func<IDictionary<string, object?>, int> RowId(string property) => Int(property);

    private static Func<IDictionary<string, object?>, int> Int(string property)
    {
        return row => Convert.ToInt32(row[property]);
    }

    private static Func<IDictionary<string, object?>, string?> String(string property)
    {
        return row => row[property] as string;
    }

    private static string FindRepositoryFile(params string[] parts)
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            var candidate = Path.Combine([directory.FullName, .. parts]);
            if (File.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new FileNotFoundException($"Could not locate {Path.Combine(parts)} from test output directory.");
    }
}
