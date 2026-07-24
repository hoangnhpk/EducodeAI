using System.Reflection;
using System.Security.Claims;
using educodeai_server.Controllers;
using educodeai_server.Controllers.QuanTriVien;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace educodeai_server.Tests.Auth;

public sealed class XacThucFlowBaselineTests
{
    private readonly Mock<IXacThucService> _authService = new();
    private readonly XacThucController _controller;

    public XacThucFlowBaselineTests()
    {
        _controller = new XacThucController(_authService.Object, Mock.Of<IGiayToScanningService>())
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };
    }

    [Fact]
    public async Task OtpLoginAndDeviceReplacement_ReturnServiceResults()
    {
        var loginRequest = new XacNhanOtpRequest();
        var replacementRequest = new XacNhanOtpRequest();
        var loginResult = new { token = "otp-token" };
        var replacementResult = new { replaced = true };
        _authService.Setup(x => x.XacNhanOtpVaDangNhapAsync(loginRequest)).ReturnsAsync(loginResult);
        _authService.Setup(x => x.XacNhanThayTheThietBiAsync(replacementRequest)).ReturnsAsync(replacementResult);

        var loginAction = await _controller.XacNhanOtpVaDangNhap(loginRequest);
        var replacementAction = await _controller.XacNhanThayTheThietBi(replacementRequest);

        Assert.Same(loginResult, Assert.IsType<OkObjectResult>(loginAction).Value);
        Assert.Same(replacementResult, Assert.IsType<OkObjectResult>(replacementAction).Value);
    }

    [Fact]
    public async Task RegistrationRequestAndVerification_ReturnOk()
    {
        var request = new DangKyRequest();
        var verification = new XacNhanOtpRequest();
        var verifiedResult = new { registered = true };
        _authService.Setup(x => x.YeuCauDangKyAsync(request, It.IsAny<string>())).ReturnsAsync(true);
        _authService.Setup(x => x.XacNhanDangKyVaLuuDbAsync(verification)).ReturnsAsync(verifiedResult);

        var requestAction = await _controller.YeuCauDangKy(request);
        var verificationAction = await _controller.XacMinhDangKy(verification);

        Assert.IsType<OkObjectResult>(requestAction);
        Assert.Same(verifiedResult, Assert.IsType<OkObjectResult>(verificationAction).Value);
    }

    [Fact]
    public async Task ForgotAndResetPassword_ReturnServiceResults()
    {
        var forgotRequest = new QuenMatKhauRequest();
        var resetRequest = new DatLaiMatKhauRequest();
        var forgotResult = new { sent = true };
        var resetResult = new { reset = true };
        _authService.Setup(x => x.YeuCauQuenMatKhauAsync(forgotRequest, It.IsAny<string>())).ReturnsAsync(forgotResult);
        _authService.Setup(x => x.DatLaiMatKhauAsync(resetRequest)).ReturnsAsync(resetResult);

        var forgotAction = await _controller.QuenMatKhau(forgotRequest);
        var resetAction = await _controller.DatLaiMatKhau(resetRequest);

        Assert.Same(forgotResult, Assert.IsType<OkObjectResult>(forgotAction).Value);
        Assert.Same(resetResult, Assert.IsType<OkObjectResult>(resetAction).Value);
    }

    [Fact]
    public async Task AuthenticatedDeviceAndPasswordFlows_UseUserClaim()
    {
        SetUserId(42);
        var remoteRequest = new DangXuatTuXaRequest();
        var passwordRequest = new DoiMatKhauRequest();
        var devices = new[] { new { id = "device-1" } };
        _authService.Setup(x => x.LayDanhSachThietBiAsync(42, "current")).ReturnsAsync(devices);
        _authService.Setup(x => x.DangXuatAsync(42, "device-1")).ReturnsAsync(true);
        _authService.Setup(x => x.YeuCauOtpDangXuatTuXaAsync(42)).ReturnsAsync(true);
        _authService.Setup(x => x.XacNhanDangXuatTuXaAsync(42, remoteRequest)).ReturnsAsync(true);
        _authService.Setup(x => x.DoiMatKhauAsync(42, passwordRequest)).ReturnsAsync(true);

        Assert.Same(devices, Assert.IsType<OkObjectResult>(await _controller.LayDanhSachThietBi("current")).Value);
        Assert.IsType<OkObjectResult>(await _controller.DangXuat("device-1"));
        Assert.IsType<OkObjectResult>(await _controller.YeuCauOtpDangXuatTuXa());
        Assert.IsType<OkObjectResult>(await _controller.XacNhanDangXuatTuXa(remoteRequest));
        Assert.IsType<OkObjectResult>(await _controller.DoiMatKhau(passwordRequest));

        _authService.Verify(x => x.DangXuatAsync(42, "device-1"), Times.Once);
        _authService.Verify(x => x.XacNhanDangXuatTuXaAsync(42, remoteRequest), Times.Once);
        _authService.Verify(x => x.DoiMatKhauAsync(42, passwordRequest), Times.Once);
    }

    [Fact]
    public async Task TeacherRegistrationStatusAndSupplement_ReturnServiceResults()
    {
        var otpRequest = new EmailOtpGiangVienRequest { Email = "teacher@example.com", OtpCode = "123456" };
        var registration = new DangKyGiangVienRequest();
        var supplement = new BoSungHoSoRequest();
        var registrationResult = new { submitted = true };
        var statusResult = new { status = "ChoDuyet" };
        var permissionResult = new { allowed = true };
        var supplementResult = new { updated = true };
        _authService.Setup(x => x.GuiOtpEmailGiangVienAsync(otpRequest.Email, It.IsAny<string?>())).ReturnsAsync(true);
        _authService.Setup(x => x.XacMinhOtpEmailGiangVienAsync(otpRequest.Email, otpRequest.OtpCode)).ReturnsAsync(true);
        _authService.Setup(x => x.DangKyGiangVienAsync(registration)).ReturnsAsync(registrationResult);
        _authService.Setup(x => x.TraCuuTrangThaiHoSoAsync(otpRequest.Email)).ReturnsAsync(statusResult);
        _authService.Setup(x => x.KiemTraQuyenBoSungHoSoAsync(7, "token")).ReturnsAsync(permissionResult);
        _authService.Setup(x => x.BoSungHoSoAsync(7, supplement)).ReturnsAsync(supplementResult);

        Assert.IsType<OkObjectResult>(await _controller.GuiOtpEmailGiangVien(otpRequest));
        Assert.IsType<OkObjectResult>(await _controller.XacMinhOtpEmailGiangVien(otpRequest));
        Assert.Same(registrationResult, Assert.IsType<OkObjectResult>(await _controller.DangKyGiangVien(registration)).Value);
        Assert.Same(statusResult, Assert.IsType<OkObjectResult>(await _controller.TraCuuTrangThaiHoSo(otpRequest.Email)).Value);
        Assert.Same(permissionResult, Assert.IsType<OkObjectResult>(await _controller.KiemTraQuyenBoSungHoSo(7, "token")).Value);
        Assert.Same(supplementResult, Assert.IsType<OkObjectResult>(await _controller.BoSungHoSo(7, supplement)).Value);
    }

    [Fact]
    public void TeacherReviewController_RequiresAdminRole()
    {
        var authorize = typeof(QuanLyHoSoGiangVienController).GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.Equal("Admin", authorize.Roles);
    }

    private void SetUserId(int userId)
    {
        _controller.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity([new Claim("id", userId.ToString())], "TestAuth"));
    }
}
