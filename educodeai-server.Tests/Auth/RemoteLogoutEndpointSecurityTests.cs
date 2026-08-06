using System.Reflection;
using educodeai_server.Controllers;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.RateLimiting;

namespace educodeai_server.Tests.Auth;

public sealed class RemoteLogoutEndpointSecurityTests
{
    [Fact]
    public void SendAndVerify_UseIndependentNamedRateLimitPolicies()
    {
        var send = typeof(XacThucController).GetMethod(nameof(XacThucController.YeuCauOtpDangXuatTuXa));
        var verify = typeof(XacThucController).GetMethod(nameof(XacThucController.XacNhanDangXuatTuXa));

        Assert.Equal("RemoteLogoutOtpSend", send!.GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName);
        Assert.Equal("RemoteLogoutOtpVerify", verify!.GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName);
    }

    [Fact]
    public void SendContract_CarriesCaptchaToServiceBoundary()
    {
        var controllerMethod = typeof(XacThucController).GetMethod(nameof(XacThucController.YeuCauOtpDangXuatTuXa));
        Assert.Equal(typeof(DangXuatTuXaRequest), Assert.Single(controllerMethod!.GetParameters()).ParameterType);

        var serviceMethod = typeof(IXacThucService).GetMethod(nameof(IXacThucService.YeuCauOtpDangXuatTuXaAsync));
        Assert.Equal(new[] { typeof(int), typeof(string) }, serviceMethod!.GetParameters().Select(p => p.ParameterType));
    }
}
