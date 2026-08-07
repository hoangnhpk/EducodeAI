using educodeai_server.Controllers;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace educodeai_server.Tests.Auth;

public sealed class XacThucControllerTests
{
    [Fact]
    public async Task DangNhap_WhenServiceSucceeds_ReturnsOkWithServiceResultAndClientIp()
    {
        var expectedResult = new { token = "access-token", refreshToken = "refresh-token" };
        var request = CreateValidLoginRequest();
        var authService = new Mock<IXacThucService>();
        authService
            .Setup(service => service.DangNhapAsync(request, "127.0.0.1"))
            .ReturnsAsync(expectedResult);
        var controller = CreateController(authService.Object);

        var actionResult = await controller.DangNhap(request);

        var okResult = Assert.IsType<OkObjectResult>(actionResult);
        Assert.Same(expectedResult, okResult.Value);
        authService.Verify(service => service.DangNhapAsync(request, "127.0.0.1"), Times.Once);
    }

    [Fact]
    public async Task DangNhap_WhenServiceThrows_PropagatesToGlobalExceptionMiddleware()
    {
        var request = CreateValidLoginRequest();
        var authService = new Mock<IXacThucService>();
        authService
            .Setup(service => service.DangNhapAsync(request, It.IsAny<string>()))
            .ThrowsAsync(new InvalidOperationException("Thông tin đăng nhập không hợp lệ."));
        var controller = CreateController(authService.Object);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => controller.DangNhap(request));

        Assert.Equal("Thông tin đăng nhập không hợp lệ.", exception.Message);
    }

    [Fact]
    public async Task RefreshToken_WithAllowedOrigin_UsesBodyDeviceIdAndEmptyRefreshArgument()
    {
        var request = new RefreshTokenRequest { MaThietBi = "device-001" };
        var expectedResult = new { token = "new-access-token" };
        var authService = new Mock<IXacThucService>();
        authService
            .Setup(service => service.LamMoiTokenAsync(request.MaThietBi))
            .ReturnsAsync(expectedResult);
        var controller = CreateController(authService.Object);
        controller.HttpContext.Request.Headers.Origin = "http://localhost:3000";

        var actionResult = await controller.RefreshToken(request);

        Assert.Same(expectedResult, Assert.IsType<OkObjectResult>(actionResult).Value);
        authService.Verify(service => service.LamMoiTokenAsync("device-001"), Times.Once);
    }

    [Fact]
    public async Task RefreshToken_WithoutOriginOrReferer_RejectsBeforeCallingService()
    {
        var authService = new Mock<IXacThucService>();
        var controller = CreateController(authService.Object);

        await Assert.ThrowsAsync<educodeai_server.Helpers.ApiException>(
            () => controller.RefreshToken(new RefreshTokenRequest { MaThietBi = "device-001" }));

        authService.Verify(
            service => service.LamMoiTokenAsync(It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task LayDanhSachThietBi_UsesAuthenticatedUserWithoutClientFingerprint()
    {
        var expectedResult = new[] { new { maPhien = 42, isCurrentDevice = true } };
        var authService = new Mock<IXacThucService>();
        authService
            .Setup(service => service.LayDanhSachThietBiAsync(7))
            .ReturnsAsync(expectedResult);
        var controller = CreateController(authService.Object);
        controller.HttpContext.User = new System.Security.Claims.ClaimsPrincipal(
            new System.Security.Claims.ClaimsIdentity(
                new[] { new System.Security.Claims.Claim("id", "7") },
                "TestAuth"));

        var actionResult = await controller.LayDanhSachThietBi();

        Assert.Same(expectedResult, Assert.IsType<OkObjectResult>(actionResult).Value);
        authService.Verify(service => service.LayDanhSachThietBiAsync(7), Times.Once);
    }

    private static DangNhapRequest CreateValidLoginRequest() => new()
    {
        TaiKhoan = "hocvien@example.com",
        MatKhau = "StrongPassword123!",
        CaptchaToken = "captcha-token",
        MaThietBi = "device-001",
        TenThietBi = "Chrome on Windows"
    };

    private static XacThucController CreateController(IXacThucService authService)
    {
        var scanningService = new Mock<IGiayToScanningService>();
        var originValidator = new Mock<educodeai_server.Services.Security.IRequestOriginValidator>();
        originValidator.Setup(validator => validator.IsAllowed(It.IsAny<HttpRequest>()))
            .Returns((HttpRequest request) => request.Headers.ContainsKey("Origin") || request.Headers.ContainsKey("Referer"));
        var controller = new XacThucController(authService, scanningService.Object, originValidator.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
        controller.HttpContext.Connection.RemoteIpAddress = System.Net.IPAddress.Parse("127.0.0.1");
        return controller;
    }
}
