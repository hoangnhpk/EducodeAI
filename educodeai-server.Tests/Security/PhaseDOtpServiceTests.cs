using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace educodeai_server.Tests.Security;

public sealed class PhaseDOtpServiceTests
{
    // ---- CSPRNG + single-use (D.1/D.2) ----

    [Fact]
    public async Task CreateOtp_ReturnsSixDigitCode()
    {
        var otpService = NewService();

        var otp = await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");

        Assert.Equal(6, otp.Length);
        Assert.All(otp, c => Assert.True(char.IsDigit(c)));
    }

    [Fact]
    public async Task VerifyOtp_CorrectCode_Succeeds()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.ForgotPassword, "user@example.com");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.ForgotPassword, "user@example.com", otp);

        Assert.True(result.Success);
    }

    [Fact]
    public async Task VerifyOtp_ReturnsPayloadOnSuccess()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com", "{\"foo\":\"bar\"}");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", otp);

        Assert.True(result.Success);
        Assert.Equal("{\"foo\":\"bar\"}", result.PayloadJson);
    }

    [Fact]
    public async Task VerifyOtp_IsSingleUse_SecondAttemptFails()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");

        var first = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", otp);
        var second = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", otp);

        Assert.True(first.Success);
        Assert.False(second.Success);
    }

    [Fact]
    public async Task VerifyOtp_WrongCode_Fails()
    {
        var otpService = NewService();
        await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", "000000");

        // Có xác suất 1/1e6 trùng mã ngẫu nhiên; bỏ qua vì không đáng kể.
        Assert.False(result.Success);
    }

    [Fact]
    public async Task VerifyOtp_NoOtpIssued_Fails()
    {
        var otpService = NewService();

        var result = await otpService.VerifyOtpAsync(OtpPurpose.Register, "nobody@example.com", "123456");

        Assert.False(result.Success);
    }

    // ---- Max attempts (D.2): sai quá 5 lần → vô hiệu OTP ----

    [Fact]
    public async Task VerifyOtp_ExceedsMaxAttempts_InvalidatesOtp()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");

        // 5 lần nhập sai → chạm ngưỡng, OTP bị vô hiệu.
        for (int i = 0; i < 5; i++)
        {
            var wrong = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", "000001");
            Assert.False(wrong.Success);
        }

        // Mã đúng cũng không còn tác dụng vì OTP đã bị vô hiệu.
        var afterLockout = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", otp);
        Assert.False(afterLockout.Success);
    }

    // ---- Invalidate OTP cũ khi phát mới (D.2) ----

    [Fact]
    public async Task CreateOtp_Again_InvalidatesPreviousCode()
    {
        var otpService = NewService();
        var oldOtp = await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");
        await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.Register, "user@example.com", oldOtp);

        // OTP cũ không còn hợp lệ sau khi phát mã mới (trừ trường hợp 2 mã trùng, xác suất 1/1e6).
        Assert.False(result.Success);
    }

    // ---- Tách purpose: mã của purpose này không verify được ở purpose khác ----

    [Fact]
    public async Task VerifyOtp_DifferentPurpose_Fails()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.Register, "user@example.com");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.ForgotPassword, "user@example.com", otp);

        Assert.False(result.Success);
    }

    // ---- Regression: identifier không phân biệt hoa/thường ----
    // Trước đây Key() ghép identifier raw → email có chữ hoa lúc create lệch key lúc verify,
    // làm đăng ký/reset thất bại. Key() giờ normalize nên create/verify khác case vẫn khớp.

    [Fact]
    public async Task VerifyOtp_IdentifierIsCaseInsensitive()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.Register, "John@Example.com");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.Register, "john@example.com", otp);

        Assert.True(result.Success);
    }

    [Fact]
    public async Task VerifyOtp_IdentifierIgnoresSurroundingWhitespace()
    {
        var otpService = NewService();
        var otp = await otpService.CreateOtpAsync(OtpPurpose.ForgotPassword, "user@example.com");

        var result = await otpService.VerifyOtpAsync(OtpPurpose.ForgotPassword, "  user@example.com  ", otp);

        Assert.True(result.Success);
    }

    private static OtpService NewService()
    {
        var distributed = new MemoryDistributedCache(
            Options.Create(new MemoryDistributedCacheOptions()));
        return new OtpService(distributed);
    }
}
