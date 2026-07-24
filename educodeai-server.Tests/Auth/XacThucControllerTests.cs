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
        var controller = new XacThucController(authService, scanningService.Object)
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
