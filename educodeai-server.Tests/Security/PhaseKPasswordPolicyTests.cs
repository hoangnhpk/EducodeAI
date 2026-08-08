using educodeai_server.Helpers;

namespace educodeai_server.Tests.Security;

public sealed class PhaseKPasswordPolicyTests
{
    // ---- Độ dài tối thiểu (F.3) ----

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("1234567")] // 7 ký tự
    public void KiemTra_MatKhauNganHoacRong_Nem(string? matKhau)
    {
        Assert.Throws<ApiException>(() =>
            PasswordPolicy.KiemTraHoacNem(matKhau, "user@example.com", null));
    }

    [Fact]
    public void KiemTra_MatKhauDuDoDaiKhongTrungCu_KhongNem()
    {
        // 8 ký tự, không chứa local email, không có mật khẩu cũ → hợp lệ.
        PasswordPolicy.KiemTraHoacNem("Str0ngP@ss", "user@example.com", null);
    }

    // ---- Không chứa phần local của email (dễ đoán) ----

    [Fact]
    public void KiemTra_MatKhauChuaLocalEmail_Nem()
    {
        // local part "nguyenvanan" nằm trong mật khẩu → từ chối (case-insensitive).
        Assert.Throws<ApiException>(() =>
            PasswordPolicy.KiemTraHoacNem("NguyenVanAn2026", "nguyenvanan@example.com", null));
    }

    [Fact]
    public void KiemTra_LocalEmailNgan_KhongChan()
    {
        // local part "ab" (<3 ký tự) không đủ để chặn → không nên từ chối vì lý do này.
        PasswordPolicy.KiemTraHoacNem("ab_Str0ngPass", "ab@example.com", null);
    }

    // ---- Không trùng mật khẩu cũ ----

    [Fact]
    public void KiemTra_TrungMatKhauCu_Nem()
    {
        var hashCu = BCrypt.Net.BCrypt.HashPassword("MatKhauCu123");
        Assert.Throws<ApiException>(() =>
            PasswordPolicy.KiemTraHoacNem("MatKhauCu123", "user@example.com", hashCu));
    }

    [Fact]
    public void KiemTra_KhacMatKhauCu_KhongNem()
    {
        var hashCu = BCrypt.Net.BCrypt.HashPassword("MatKhauCu123");
        PasswordPolicy.KiemTraHoacNem("MatKhauMoi456", "user@example.com", hashCu);
    }
}
