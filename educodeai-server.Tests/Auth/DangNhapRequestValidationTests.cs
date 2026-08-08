using System.ComponentModel.DataAnnotations;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.Services.Security;

namespace educodeai_server.Tests.Auth;

public sealed class DangNhapRequestValidationTests
{
    [Fact]
    public void DangNhapRequest_WithRequiredFields_IsValid()
    {
        var request = new DangNhapRequest
        {
            TaiKhoan = "hocvien@example.com",
            MatKhau = "StrongPassword123!",
            CaptchaToken = "captcha-token",
            MaThietBi = "device-001",
            TenThietBi = "Chrome on Windows"
        };

        var validationResults = Validate(request);

        Assert.Empty(validationResults);
    }

    [Fact]
    public void DangNhapRequest_WithoutCaptcha_IsValidWhenOtherRequiredFieldsArePresent()
    {
        var request = new DangNhapRequest
        {
            TaiKhoan = "  StudentUser  ",
            MatKhau = "StrongPassword123!",
            MaThietBi = "device-001"
        };

        var validationResults = Validate(request);

        Assert.DoesNotContain(validationResults, result =>
            result.MemberNames.Contains(nameof(DangNhapRequest.CaptchaToken)));
    }

    [Fact]
    public void NormalizeAccount_TrimsAndNormalizesCasing()
    {
        Assert.Equal("studentuser", PasswordLoginContract.NormalizeAccount("  StudentUser  "));
    }

    [Fact]
    public void EnsureOtpDelivered_WhenEmailFails_ThrowsActionableError()
    {
        var exception = Assert.Throws<educodeai_server.Helpers.ApiException>(() =>
            PasswordLoginContract.EnsureOtpDelivered(false));

        Assert.Contains("không thể gửi", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void DangNhapRequest_MissingRequiredFields_ReturnsValidationErrors()
    {
        var request = new DangNhapRequest();

        var validationResults = Validate(request);

        Assert.Contains(validationResults, result => result.MemberNames.Contains(nameof(DangNhapRequest.TaiKhoan)));
        Assert.Contains(validationResults, result => result.MemberNames.Contains(nameof(DangNhapRequest.MatKhau)));
        Assert.DoesNotContain(validationResults, result => result.MemberNames.Contains(nameof(DangNhapRequest.CaptchaToken)));
        Assert.Contains(validationResults, result => result.MemberNames.Contains(nameof(DangNhapRequest.MaThietBi)));
    }

    private static IReadOnlyCollection<ValidationResult> Validate(DangNhapRequest request)
    {
        var validationResults = new List<ValidationResult>();
        var context = new ValidationContext(request);

        Validator.TryValidateObject(request, context, validationResults, validateAllProperties: true);

        return validationResults;
    }
}
