using System.Text.Json;
using educodeai_server.DTOs.Common;
using educodeai_server.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;

namespace educodeai_server.Tests.Security;

public sealed class PhaseBErrorHandlingTests
{
    [Fact]
    public async Task GlobalExceptionMiddleware_ReturnsStableGenericErrorWithoutInternalDetails()
    {
        var context = CreateContext();
        var middleware = new GlobalExceptionMiddleware(
            _ => throw new InvalidOperationException("connection string and stack detail"),
            NullLogger<GlobalExceptionMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        var body = await ReadBodyAsync(context);
        var response = JsonSerializer.Deserialize<ApiResponse<object>>(body, JsonOptions());
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
        Assert.Equal(ApiErrorCodes.InternalError, response?.Error?.Code);
        Assert.DoesNotContain("connection string", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("stack", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GlobalExceptionMiddleware_ReturnsStableClientErrorForSafeApiException()
    {
        var context = CreateContext();
        var middleware = new GlobalExceptionMiddleware(
            _ => throw ApiException.InvalidRequest("Mã OTP không hợp lệ hoặc đã hết hạn."),
            NullLogger<GlobalExceptionMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        var body = await ReadBodyAsync(context);
        var response = JsonSerializer.Deserialize<ApiResponse<object>>(body, JsonOptions());
        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
        Assert.Equal(ApiErrorCodes.InvalidRequest, response?.Error?.Code);
        Assert.Equal("Mã OTP không hợp lệ hoặc đã hết hạn.", response?.Error?.Message);
    }

    [Theory]
    [InlineData("Jwt:Key=super-secret")]
    [InlineData("JwtKey=super-secret")]
    [InlineData("SigningKey=super-secret")]
    [InlineData("Authorization=Bearer-secret")]
    [InlineData("otp=123456")]
    [InlineData("password=P@ss")]
    public void SensitiveDataRedactor_RedactsSensitiveText(string input)
    {
        var result = SensitiveDataRedactor.Redact($"userId=42 {input}");

        Assert.Contains("userId=42", result);
        Assert.Contains(SensitiveDataRedactor.RedactedValue, result);
        Assert.DoesNotContain("super-secret", result);
        Assert.DoesNotContain("Bearer-secret", result);
        Assert.DoesNotContain("123456", result);
        Assert.DoesNotContain("P@ss", result);
    }

    [Fact]
    public void SensitiveDataRedactor_RedactsSensitiveStructuredProperties()
    {
        var properties = new Dictionary<string, object?>
        {
            ["UserId"] = 42,
            ["RefreshToken"] = "secret-token",
            ["JwtKey"] = "jwt-secret",
            ["SigningKey"] = "signing-secret",
            ["OtpCode"] = "123456",
            ["OcrText"] = "identity text"
        };

        var result = SensitiveDataRedactor.RedactProperties(properties);

        Assert.Equal(42, result["UserId"]);
        Assert.All(
            result.Where(property => property.Key != "UserId"),
            property => Assert.Equal(SensitiveDataRedactor.RedactedValue, property.Value));
    }

    private static DefaultHttpContext CreateContext()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static async Task<string> ReadBodyAsync(HttpContext context)
    {
        context.Response.Body.Position = 0;
        return await new StreamReader(context.Response.Body).ReadToEndAsync();
    }

    private static JsonSerializerOptions JsonOptions() => new(JsonSerializerDefaults.Web);
}
