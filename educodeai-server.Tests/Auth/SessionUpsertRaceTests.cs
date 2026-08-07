using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.Services.Security;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Tests.Auth;

public sealed class SessionUpsertRaceTests
{
    private const int UserId = 900001;

    [Fact]
    public async Task TwoFirstLoginAttempts_ConvergeOnCanonicalSessionWithoutRetryingInsert()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<EduCodeAIDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var setup = new EduCodeAIDbContext(options))
        {
            await setup.Database.EnsureCreatedAsync();
            setup.NguoiDungs.Add(CreateUser());
            await setup.SaveChangesAsync();
        }

        await using var winnerContext = new EduCodeAIDbContext(options);
        await using var loserContext = new EduCodeAIDbContext(options);
        var winner = new SessionUpsert(winnerContext);
        var loser = new SessionUpsert(loserContext);

        var winnerSession = await winner.GetOrCreateAsync(UserId, "same-device", "Winner", false, 0);
        var loserSession = await loser.GetOrCreateAsync(UserId, "same-device", "Loser", true, 3);

        Assert.Equal(winnerSession.MaPhien, loserSession.MaPhien);
        await using var verification = new EduCodeAIDbContext(options);
        var sessions = await verification.PhienDangNhaps.AsNoTracking().ToListAsync();
        Assert.Single(sessions);
        Assert.Equal("Loser", sessions[0].TenThietBi);
        Assert.True(sessions[0].DangHoatDong);
        Assert.Equal(3, sessions[0].TrustVersion);
    }

    private static NguoiDungModel CreateUser() => new()
    {
        MaNguoiDung = UserId,
        TaiKhoan = "race-user",
        Email = "race@example.test",
        MatKhau = "not-a-real-password",
        HoTen = "Race User",
        VaiTro = 2,
        TrangThai = "Hoạt động"
    };
}
